"""Locate public signature candidates and bounded direct callees without runtime access."""

import argparse
import bisect
import hashlib
import json
import re
from pathlib import Path
import runpy
import struct
import sys


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--executable', type=Path, required=True)
    parser.add_argument('--sha256', required=True)
    parser.add_argument('--database', type=Path, required=True)
    parser.add_argument('--python-tools', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--include-callees', action='store_true')
    parser.add_argument('--payload-metadata', action='store_true')
    parser.add_argument('--metadata-name', action='append', default=[],
                        help='Select exact GcReward metadata names instead of defaults (repeatable; maximum 16)')
    parser.add_argument('--type-name', action='append', default=[],
                        help='Exact descriptor/seed metadata type names; maximum 16')
    parser.add_argument('--literal-name', action='append', default=[],
                        help='Exact bounded ASCII literal references, such as asset paths; maximum 16')
    parser.add_argument('--metadata-only', action='store_true',
                        help='Skip unrelated public acquisition signature scans')
    parser.add_argument('--function-term', action='append', default=[],
                        help='Select public signature labels by bounded substring; maximum 16')
    args = parser.parse_args()
    if len(args.metadata_name) > 16 or any(not re.fullmatch(r'GcReward[A-Za-z0-9]+', name) for name in args.metadata_name):
        parser.error('Metadata names must be exact GcReward identifiers; maximum 16')
    if len(args.type_name) > 16 or any(not re.fullmatch(r'(?:Tk|Gc)[A-Za-z0-9]+', name) for name in args.type_name):
        parser.error('Type names must be exact Tk/Gc identifiers; maximum 16')
    if len(args.literal_name) > 16 or any(not re.fullmatch(r'[\x20-\x7e]{1,192}', name)
                                        for name in args.literal_name):
        parser.error('Literal names must contain 1..192 printable ASCII characters; maximum 16')
    if args.literal_name and (args.type_name or args.metadata_name or args.payload_metadata):
        parser.error('Select literal names separately from metadata names')
    if len(args.function_term) > 16 or any(not 1 <= len(t) <= 128 for t in args.function_term):
        parser.error('Function terms must have 1..128 characters; maximum 16')
    exe = args.executable.resolve()
    output = args.output.resolve()
    if output.is_relative_to(exe.parent.parent) or output.is_relative_to(Path(__file__).resolve().parents[2]):
        parser.error('Output must be outside the game and repository')
    data = exe.read_bytes()
    digest = hashlib.sha256(data).hexdigest()
    if digest != args.sha256.lower():
        parser.error('Executable fingerprint mismatch')
    sys.path.insert(0, str(args.python_tools))
    from capstone import Cs, CS_ARCH_X86, CS_MODE_64
    helpers = runpy.run_path(str(Path(__file__).parents[1] / 'native/asi/locate-frontend-hooks.py'))
    sections = helpers['executable_sections'](data)
    text = next(s for s in sections if s['name'] == '.text')
    pdata = next(s for s in sections if s['name'] == '.pdata')
    ranges = sorted((a, b) for a, b, _ in struct.iter_unpack('<III', data[pdata['raw_offset']:pdata['raw_offset'] + pdata['raw_size'] - pdata['raw_size'] % 12]) if a and b > a)
    starts = [a for a, _ in ranges]

    def owner(rva):
        index = bisect.bisect_right(starts, rva) - 1
        return ranges[index] if index >= 0 and rva < ranges[index][1] else None

    database = json.loads(args.database.read_text(encoding='utf-8'))
    terms = args.function_term or ('PurchaseableItem', 'FreighterOwnership', 'GiveGenericReward', 'InteractionComponent::GiveReward', 'InventoryStore::Add')
    selected = [f for f in database['functions'] if any(term in f['name'] for term in terms)]
    if args.metadata_only:
        selected = []
    decoder = Cs(CS_ARCH_X86, CS_MODE_64)
    results = []
    seeds = {}
    for function in selected:
        expression = helpers['pattern_regex'](function['signature'])
        matches = [text['virtual_address'] + m.start() - text['raw_offset'] for m in expression.finditer(data, text['raw_offset'], text['raw_offset'] + text['raw_size'])]
        record = {'public_name': function['name'], 'matches': [hex(r) for r in matches], 'identity_verified': False}
        if len(matches) == 1 and owner(matches[0]):
            begin, end = owner(matches[0])
            record['unwind_start'] = hex(begin)
            record['matches_function_start'] = matches[0] == begin
            offset = text['raw_offset'] + begin - text['virtual_address']
            instructions = list(decoder.disasm(data[offset:offset + min(end - begin, 262144)], begin))
            calls = []
            for instruction in instructions:
                if instruction.mnemonic == 'call' and instruction.op_str.startswith('0x'):
                    target = int(instruction.op_str, 16)
                    bounds = owner(target)
                    calls.append({'site': hex(instruction.address), 'target': hex(target), 'unwind_start': hex(bounds[0]) if bounds else None})
            record['direct_calls'] = calls
            record['call_scope'] = 'First unwind fragment only; split-function and indirect calls are not complete'
            record['decoded_bytes'] = sum(i.size for i in instructions)
            record['unwind_bytes'] = end - begin
            seeds[begin] = function['name']
        results.append(record)
    output.mkdir(parents=True, exist_ok=True)
    report = {'mode': 'offline_only', 'exe_sha256': digest, 'database_sha256': hashlib.sha256(args.database.read_bytes()).hexdigest(), 'candidates': results, 'caveat': 'Public signatures are candidate labels only; no ABI or runtime compatibility is established.'}
    if args.payload_metadata or args.metadata_name or args.type_name or args.literal_name:
        targets = {}
        names = tuple(dict.fromkeys(args.literal_name or args.type_name or args.metadata_name or ('GcRewardSpecificShip', 'GcRewardSpecificWeapon', 'GcRewardSpecificFrigate')))
        for name in names:
            for section in sections:
                start = section['raw_offset']
                for match in re.finditer(re.escape(name.encode()) + b'\x00', data[start:start + section['raw_size']]):
                    offset = start + match.start()
                    rva = section['virtual_address'] + match.start()
                    targets[rva] = name
                    if not args.literal_name and offset and data[offset - 1:offset] == b'c':
                        targets[rva - 1] = 'c' + name
        references, metadata_seeds = [], {}
        raw = data[text['raw_offset']:text['raw_offset'] + text['raw_size']]
        for match in re.finditer(rb'[\x48-\x4f]\x8d[\x05\x0d\x15\x1d\x25\x2d\x35\x3d]....', raw, re.DOTALL):
            rva = text['virtual_address'] + match.start()
            target = rva + 7 + struct.unpack_from('<i', match.group(), 3)[0]
            if target in targets and owner(rva) and len(references) < 64:
                begin, _ = owner(rva)
                references.append({'name': targets[target], 'string_rva': hex(target), 'potential_reference': hex(rva), 'unwind_start': hex(begin)})
                prefix = 'Literal-reference candidate: ' if args.literal_name else 'Metadata-name reference candidate: '
                metadata_seeds.setdefault(begin, prefix + targets[target])
        report['payload_name_references'] = references
        report['metadata_names_requested'] = names
        report['metadata_names_without_string'] = [name for name in names if name not in targets.values()]
        report['metadata_reference_limit'] = 64
        report['reference_kind'] = 'literal' if args.literal_name else 'metadata'
        (output / 'payload-seeds.tsv').write_text(''.join(f'{r:x}\t{label}\n' for r, label in metadata_seeds.items()), encoding='utf-8')
    (output / 'candidates.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
    if args.include_callees:
        for record in results:
            for call in record.get('direct_calls', []):
                if call['unwind_start'] and len(seeds) < 48:
                    rva = int(call['unwind_start'], 16)
                    seeds.setdefault(rva, 'unidentified direct callee of ' + record['public_name'])
    (output / 'seeds.tsv').write_text(''.join(f'{r:x}\t{label}\n' for r, label in seeds.items()), encoding='utf-8')
    print(json.dumps({'selected': len(results), 'seed_count': len(seeds), 'candidates': [{'name': r['public_name'], 'matches': r['matches'], 'calls': len(r.get('direct_calls', []))} for r in results]}, indent=2))


if __name__ == '__main__':
    main()
