"""Inspect historical Pi bindings against a pinned executable without loading Pi."""
import argparse
import ast
import bisect
import hashlib
import json
from pathlib import Path
import re
import runpy
import struct
import subprocess
import sys

ANCHORS = ('LANGUAGE\\%s_%s.MBIN',
           'Metadata/Simulation/Missions/Tables/MissionTable.mXml',
           'ITEMGEN_FORMAT_FREI_PASS', 'UI_WIKI_PROC_TECH_SUB')


def unwind_chain(raw, sections, entry):
    """Follow at most 16 documented version-1 chained RUNTIME_FUNCTION records."""
    chain, seen = [], set()
    for _ in range(16):
        begin, end, unwind = entry
        if entry in seen or begin >= end:
            raise ValueError('Invalid or cyclic unwind chain')
        seen.add(entry)
        section = next((item for item in sections if item['virtual_address'] <= unwind and
                        unwind + 4 <= item['virtual_address'] + item['raw_size']), None)
        if section is None:
            raise ValueError('Unwind header is outside file-backed sections')
        offset = section['raw_offset'] + unwind - section['virtual_address']
        version = raw[offset] & 7
        flags = raw[offset] >> 3
        if version != 1 or flags & ~7 or flags & 4 and flags & 3:
            raise ValueError('Unsupported unwind version or flags')
        chain.append({'begin': hex(begin), 'end': hex(end), 'unwind': hex(unwind)})
        if not flags & 4:
            return chain
        tail = offset + 4 + ((raw[offset + 2] + 1) & ~1) * 2
        if tail + 12 > section['raw_offset'] + section['raw_size']:
            raise ValueError('Chained entry exceeds file-backed section')
        entry = struct.unpack_from('<III', raw, tail)
    raise ValueError('Unwind chain exceeds 16-entry budget')


def anchor_references(raw, python_tools):
    """Find checked RIP-relative LEA references; labels remain semantic candidates."""
    sys.path.insert(0, str(python_tools))
    from capstone import Cs, CS_ARCH_X86, CS_MODE_64
    helpers = runpy.run_path(str(Path(__file__).parents[1] / 'native/asi/locate-frontend-hooks.py'))
    sections = helpers['executable_sections'](raw)
    text = next(item for item in sections if item['name'] == '.text')
    pdata = next(item for item in sections if item['name'] == '.pdata')
    entries = sorted((start, end, info) for start, end, info in struct.iter_unpack(
        '<III', raw[pdata['raw_offset']:pdata['raw_offset'] + pdata['raw_size'] - pdata['raw_size'] % 12])
                     if start and end > start)
    ranges = [(start, end) for start, end, _ in entries]
    starts = [start for start, _ in ranges]
    strings = {}
    for section in sections:
        content = raw[section['raw_offset']:section['raw_offset'] + section['raw_size']]
        for anchor in ANCHORS:
            for match in re.finditer(re.escape(anchor.encode()) + b'\0', content):
                strings[section['virtual_address'] + match.start()] = anchor
    decoder = Cs(CS_ARCH_X86, CS_MODE_64)
    cache, references, skipped = {}, [], []
    code = raw[text['raw_offset']:text['raw_offset'] + text['raw_size']]
    for match in re.finditer(rb'[\x48-\x4f]\x8d[\x05\x0d\x15\x1d\x25\x2d\x35\x3d]....', code, re.DOTALL):
        site = text['virtual_address'] + match.start()
        target = site + 7 + struct.unpack_from('<i', match.group(), 3)[0]
        if target not in strings:
            continue
        index = bisect.bisect_right(starts, site) - 1
        if index < 0 or not ranges[index][0] <= site < ranges[index][1]:
            skipped.append(hex(site))
            continue
        begin, end = ranges[index]
        if end - begin > 65536:
            skipped.append(hex(site))
            continue
        if begin not in cache:
            offset = text['raw_offset'] + begin - text['virtual_address']
            cache[begin] = {item.address: item.bytes for item in decoder.disasm(raw[offset:offset + end - begin], begin)}
        if bytes(cache[begin].get(site, b'')) != match.group():
            skipped.append(hex(site))
            continue
        if len(references) >= 64:
            raise ValueError('Anchor reference budget exceeded')
        record = {'anchor': strings[target], 'string_rva': hex(target),
                  'site': hex(site), 'unwind_start': hex(begin), 'identity_verified': False}
        try:
            record['unwind_chain'] = unwind_chain(raw, sections, entries[index])
            record['primary_unwind_start'] = record['unwind_chain'][-1]['begin']
        except ValueError as error:
            record['unwind_chain_warning'] = str(error)
        references.append(record)
    return {'anchors': [{'anchor': anchor, 'string_rvas': [hex(rva) for rva, name in strings.items() if name == anchor]}
                        for anchor in ANCHORS], 'references': references, 'unchecked_reference_sites': skipped}


def extract_signatures(source):
    """Read decorator literals only; never import third-party code or use offsets."""
    tree = ast.parse(source)
    records = []
    for cls in (node for node in tree.body if isinstance(node, ast.ClassDef)):
        for node in cls.body:
            if not isinstance(node, ast.FunctionDef):
                continue
            for decorator in node.decorator_list:
                if not isinstance(decorator, ast.Call):
                    continue
                if not isinstance(decorator.func, ast.Name) or decorator.func.id != 'function_hook':
                    continue
                values = {item.arg: ast.literal_eval(item.value) for item in decorator.keywords
                          if item.arg in ('signature', 'offset')}
                signature = values.get('signature')
                if not isinstance(signature, str) or not 6 <= len(signature.split()) <= 256:
                    raise ValueError('Expected a bounded literal hook signature')
                if any(token != '??' and (len(token) != 2 or any(c not in '0123456789abcdefABCDEF' for c in token))
                       for token in signature.split()):
                    raise ValueError('Invalid signature token')
                records.append({'name': f'{cls.name}::{node.name}', 'signature': signature,
                                'historical_offset_not_used': values.get('offset'), 'source_line': node.lineno})
    if not 1 <= len(records) <= 16:
        raise ValueError('Expected 1..16 historical hook bindings')
    return records


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--types-source', type=Path, required=True)
    parser.add_argument('--source-sha256', required=True)
    parser.add_argument('--executable', type=Path, required=True)
    parser.add_argument('--sha256', required=True)
    parser.add_argument('--python-tools', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    output = args.output.resolve()
    if output.is_relative_to(Path(__file__).resolve().parents[2]) or output.is_relative_to(args.executable.resolve().parent.parent):
        parser.error('Output must be outside the game and repository')
    if args.types_source.stat().st_size > 256 * 1024:
        parser.error('Types source exceeds 256 KiB budget')
    raw = args.types_source.read_bytes()
    if hashlib.sha256(raw).hexdigest() != args.source_sha256.lower():
        parser.error('Types source fingerprint mismatch')
    records = extract_signatures(raw.decode('utf-8-sig'))
    output.mkdir(parents=True, exist_ok=True)
    database = output / 'historical-signatures.json'
    database.write_text(json.dumps({'functions': records}, indent=2), encoding='utf-8')
    command = [sys.executable, str(Path(__file__).with_name('scan-native-acquisition.py')),
               '--executable', str(args.executable), '--sha256', args.sha256,
               '--database', str(database), '--python-tools', str(args.python_tools), '--output', str(output)]
    for record in records:
        command.extend(['--function-term', record['name']])
    subprocess.run(command, check=True, timeout=120)
    report = json.loads((output / 'candidates.json').read_text(encoding='utf-8'))
    executable = args.executable.read_bytes()
    if hashlib.sha256(executable).hexdigest() != args.sha256.lower():
        raise ValueError('Executable changed during compatibility inspection')
    report['anchor_inspection'] = anchor_references(executable, args.python_tools)
    roots = report['anchor_inspection']['references']
    anchor_functions = {'cTkLanguageManagerBase::Load': ANCHORS[0],
                        'cGcRealityManager::Construct': ANCHORS[1],
                        'cGcRealityManager::GenerateProceduralProduct': ANCHORS[2],
                        'cGcRealityManager::GenerateProceduralTechnology': ANCHORS[3]}
    for candidate in report['candidates']:
        anchor = anchor_functions.get(candidate['public_name'])
        if anchor:
            candidate['anchor_primary_candidates'] = [item['primary_unwind_start'] for item in roots
                                                       if item['anchor'] == anchor and 'primary_unwind_start' in item]
            candidate['signature_agrees_with_anchor_primary'] = bool(
                set(candidate['matches']) & set(candidate['anchor_primary_candidates']))
    report.update({'types_source_sha256': args.source_sha256.lower(), 'runtime_calls_enabled': False,
                   'binding_status': 'unverified', 'historical_offsets_used': False})
    (output / 'compatibility.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
    (output / 'anchor-seeds.tsv').write_text(''.join(
        f"{int(item['primary_unwind_start'], 16):x}\tPi anchor candidate: {item['anchor']}; ABI unverified\n"
        for item in roots if 'primary_unwind_start' in item), encoding='utf-8')


if __name__ == '__main__':
    main()
