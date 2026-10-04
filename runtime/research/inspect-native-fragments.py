"""Export bounded unwind-fragment instructions from a fingerprint-pinned PE.

No native execution or automatic function/ABI identification. Split fragments
remain explicit; decoding one unwind range does not recover a whole function.
"""
import argparse
import bisect
import hashlib
import json
from pathlib import Path
import runpy
import struct
import sys


def unwind_chain(raw, sections, entry):
    """Resolve at most 16 PE64 chained unwind records without inferring an ABI."""
    records, seen = [], set()
    for _ in range(16):
        begin, end, unwind = entry
        if entry in seen or not begin < end or unwind % 4:
            raise ValueError('Invalid or cyclic unwind chain')
        seen.add(entry)
        section = next((item for item in sections if
                        item['virtual_address'] <= unwind and
                        unwind + 4 <= item['virtual_address'] + item['raw_size']), None)
        if section is None:
            raise ValueError('Unwind header outside file-backed sections')
        offset = section['raw_offset'] + unwind - section['virtual_address']
        version, flags = raw[offset] & 7, raw[offset] >> 3
        if version not in (1, 2) or flags & ~7 or flags & 4 and flags & 3:
            raise ValueError('Unsupported unwind version or flags')
        records.append({'begin': hex(begin), 'end': hex(end),
                        'unwind': hex(unwind), 'version': version, 'flags': flags})
        if not flags & 4:
            return records
        size = 4 + ((raw[offset + 2] + 1) & ~1) * 2
        if unwind + size + 12 > section['virtual_address'] + section['raw_size']:
            raise ValueError('Chained unwind record outside file-backed section')
        entry = struct.unpack_from('<III', raw, offset + size)
    raise ValueError('Unwind chain exceeds the 16-record bound')


def import_thunks(raw, sections, targets):
    """Resolve only selected FF25 thunks through the PE64 import table."""
    def offset(rva, size):
        section = next((item for item in sections if item['virtual_address'] <= rva and
                        rva + size <= item['virtual_address'] + item['raw_size']), None)
        if section is None:
            raise ValueError('Import reference outside file-backed sections')
        return section['raw_offset'] + rva - section['virtual_address']

    def string(rva):
        start = offset(rva, 256)
        content = raw[start:start + 256].split(b'\0', 1)
        if len(content) != 2:
            raise ValueError('Import name exceeds byte budget')
        return content[0].decode('ascii')

    pe = struct.unpack_from('<I', raw, 0x3c)[0]
    optional = pe + 24
    if struct.unpack_from('<H', raw, optional)[0] != 0x20b:
        raise ValueError('Import inspection requires PE64')
    imports, import_size = struct.unpack_from('<II', raw, optional + 120)
    if import_size > 128 * 20:
        raise ValueError('Import descriptor budget exceeded')
    table = offset(imports, import_size)
    descriptors = []
    for position in range(0, import_size - 19, 20):
        original, _, _, name, first = struct.unpack_from('<5I', raw, table + position)
        if not any((original, name, first)):
            break
        descriptors.append((original or first, name, first))
    records = []
    for target in sorted(targets):
        location = offset(target, 6)
        code = raw[location:location + 6]
        if code[:2] != b'\xff\x25':
            raise ValueError('Selected target is not an FF25 import thunk')
        iat = target + 6 + struct.unpack_from('<i', code, 2)[0]
        matches = []
        for original, name, first in descriptors:
            delta = iat - first
            if delta < 0 or delta % 8 or delta // 8 >= 4096:
                continue
            # Do not read through the terminator into another DLL's thunk array.
            entries = [struct.unpack_from('<Q', raw, offset(original + index * 8, 8))[0]
                       for index in range(delta // 8 + 1)]
            if not all(entries):
                continue
            entry = entries[-1]
            symbol = 'ordinal:' + str(entry & 0xffff) if entry >> 63 else string(entry + 2)
            matches.append({'dll': string(name), 'symbol': symbol})
        if len(matches) != 1:
            raise ValueError('Selected import thunk is missing or ambiguous')
        records.append({'rva': hex(target), 'iat_rva': hex(iat), 'bytes': code.hex(), **matches[0]})
    return records


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--executable', type=Path, required=True)
    parser.add_argument('--sha256', required=True)
    parser.add_argument('--rva', action='append', default=[])
    parser.add_argument('--literal', action='append', default=[],
                        help='Preserve the existing raw 32-byte literal window interface')
    parser.add_argument('--literal-rva', action='append', default=[])
    parser.add_argument('--thunk-rva', action='append', default=[])
    parser.add_argument('--python-tools', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    targets = {int(value, 16) for value in args.rva}
    literals = {int(value, 16) for value in args.literal_rva}
    thunks = {int(value, 16) for value in args.thunk_rva}
    raw_literals = {int(value, 16) for value in args.literal}
    if len(targets) > 8 or not any((targets, literals, thunks, raw_literals)):
        parser.error('Select targets; expected at most 8 fragment RVAs')
    if len(literals) + len(raw_literals) > 16 or len(thunks) > 16:
        parser.error('Expected at most 16 literal and 16 thunk RVAs')
    exe, output = args.executable.resolve(), args.output.resolve()
    if output.exists() or output.is_relative_to(exe.parent.parent) or output.is_relative_to(Path(__file__).resolve().parents[2]):
        parser.error('Output must be new and outside game/repository')
    if exe.stat().st_size > 128 * 1024 * 1024:
        parser.error('Executable byte budget exceeded')
    raw = exe.read_bytes()
    digest = hashlib.sha256(raw).hexdigest()
    if digest != args.sha256.lower():
        parser.error('Executable fingerprint mismatch')
    helpers = runpy.run_path(str(Path(__file__).parents[1] / 'native/asi/locate-frontend-hooks.py'))
    sections = helpers['executable_sections'](raw)
    text = next(section for section in sections if section['name'] == '.text')
    pdata = next(section for section in sections if section['name'] == '.pdata')
    table = raw[pdata['raw_offset']:pdata['raw_offset'] + pdata['raw_size'] - pdata['raw_size'] % 12]
    entries = sorted((begin, end, unwind) for begin, end, unwind in struct.iter_unpack('<III', table)
                     if begin and end > begin)
    ranges = [(begin, end) for begin, end, _ in entries]
    starts = [begin for begin, _ in ranges]
    sys.path.insert(0, str(args.python_tools))
    from capstone import Cs, CS_ARCH_X86, CS_MODE_64
    decoder = Cs(CS_ARCH_X86, CS_MODE_64)
    records = []
    for target in sorted(targets):
        position = bisect.bisect_right(starts, target) - 1
        if position < 0 or not ranges[position][0] <= target < ranges[position][1]:
            raise ValueError('Target has no containing unwind range: ' + hex(target))
        begin, end = ranges[position]
        if end - begin > 16384 or begin < text['virtual_address'] or end > text['virtual_address'] + text['raw_size']:
            raise ValueError('Fragment byte/section budget exceeded')
        offset = text['raw_offset'] + begin - text['virtual_address']
        code = raw[offset:offset + end - begin]
        instructions = [{'rva': hex(item.address), 'bytes': item.bytes.hex(),
                         'mnemonic': item.mnemonic, 'operands': item.op_str}
                        for item in decoder.disasm(code, begin)]
        if sum(len(bytes.fromhex(item['bytes'])) for item in instructions) != len(code):
            raise ValueError('Incomplete fragment decoding')
        if not any(int(item['rva'], 16) == target for item in instructions):
            raise ValueError('Target is not a decoded instruction boundary')
        records.append({'target': hex(target), 'begin': hex(begin), 'end': hex(end),
                        'sha256': hashlib.sha256(code).hexdigest(), 'instructions': instructions,
                        'unwind_chain': unwind_chain(raw, sections, entries[position])})
    literal_records = []
    for target in sorted(raw_literals):
        section = next((item for item in sections if item['virtual_address'] <= target and
                        target + 32 <= item['virtual_address'] + item['raw_size']), None)
        if section is None:
            raise ValueError('Raw literal window outside file-backed sections')
        offset = section['raw_offset'] + target - section['virtual_address']
        content = raw[offset:offset + 32]
        literal_records.append({'rva': hex(target), 'hex': content.hex(),
                                'ascii_prefix': content.split(b'\0', 1)[0].decode('ascii', errors='replace')})
    for target in sorted(literals):
        section = next((item for item in sections if item['virtual_address'] <= target < item['virtual_address'] + item['raw_size']), None)
        if section is None:
            raise ValueError('Literal target outside file-backed sections')
        offset = section['raw_offset'] + target - section['virtual_address']
        limit = min(256, section['raw_offset'] + section['raw_size'] - offset)
        content = raw[offset:offset + limit]
        terminator = content.find(b'\0')
        if terminator < 0:
            raise ValueError('Literal has no terminator within byte budget')
        content = content[:terminator]
        literal_records.append({'rva': hex(target), 'bytes': content.hex(),
                                'ascii': content.decode('ascii', errors='backslashreplace')})
    report = {'exe_sha256': digest, 'runtime_verified': False, 'fragments': records,
              'literals': literal_records,
              'import_thunks': import_thunks(raw, sections, thunks) if thunks else [],
              'limitations': ['Unwind fragments may be split; function identity and ABI remain unverified.']}
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open('x', encoding='utf-8') as stream:
        json.dump(report, stream, indent=2)
    print(json.dumps({'fragments': len(records), 'instructions': sum(len(item['instructions']) for item in records)}))


if __name__ == '__main__':
    main()
