"""Find bounded instruction-checked arithmetic candidates in a pinned PE region."""
import argparse
import bisect
import hashlib
import json
from pathlib import Path
import runpy
import struct
import sys


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--executable', type=Path, required=True)
    parser.add_argument('--sha256', required=True)
    parser.add_argument('--python-tools', type=Path, required=True)
    parser.add_argument('--start-rva', type=lambda s: int(s, 16), required=True)
    parser.add_argument('--end-rva', type=lambda s: int(s, 16), required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    if not 0 < args.end_rva - args.start_rva <= 1024 * 1024:
        parser.error('Choose a region of at most 1 MiB')
    exe, output = args.executable.resolve(), args.output.resolve()
    if output.exists() or output.is_relative_to(exe.parent.parent) or output.is_relative_to(Path(__file__).resolve().parents[2]):
        parser.error('Output must be new and outside game/repository')
    if exe.stat().st_size > 128 * 1024 * 1024:
        parser.error('Executable size budget exceeded')
    data = exe.read_bytes()
    digest = hashlib.sha256(data).hexdigest()
    if digest != args.sha256.lower():
        parser.error('Executable fingerprint mismatch')
    helpers = runpy.run_path(str(Path(__file__).parents[1] / 'native/asi/locate-frontend-hooks.py'))
    sections = helpers['executable_sections'](data)
    text = next(s for s in sections if s['name'] == '.text')
    if not text['virtual_address'] <= args.start_rva < args.end_rva <= text['virtual_address'] + text['raw_size']:
        parser.error('Region must be file-backed executable text')
    pdata = next(s for s in sections if s['name'] == '.pdata')
    ranges = sorted((a, b) for a, b, _ in struct.iter_unpack('<III', data[pdata['raw_offset']:pdata['raw_offset'] + pdata['raw_size'] - pdata['raw_size'] % 12]) if a and b > a)
    starts = [a for a, _ in ranges]
    offset = text['raw_offset'] + args.start_rva - text['virtual_address']
    code = data[offset:offset + args.end_rva - args.start_rva]
    sys.path.insert(0, str(args.python_tools))
    from capstone import Cs, CS_ARCH_X86, CS_MODE_64
    decoder = Cs(CS_ARCH_X86, CS_MODE_64)
    candidates, cache, raw_hits = {}, {}, 0
    position = 0
    while True:
        position = code.find(struct.pack('<I', 0x5a76f899), position)
        if position < 0:
            break
        raw_hits += 1
        if raw_hits > 512:
            raise ValueError('Raw occurrence budget exceeded; narrow the region')
        rva = args.start_rva + position
        position += 4
        index = bisect.bisect_right(starts, rva) - 1
        if index < 0 or not ranges[index][0] <= rva < ranges[index][1]:
            continue
        begin, end = ranges[index]
        if end - begin > 65536:
            continue
        if begin not in cache:
            at = text['raw_offset'] + begin - text['virtual_address']
            cache[begin] = list(decoder.disasm(data[at:at + end - begin], begin))
        for instruction in cache[begin]:
            if instruction.address <= rva and rva + 4 <= instruction.address + instruction.size:
                if instruction.mnemonic == 'imul' and instruction.op_str.endswith('0x5a76f899'):
                    candidates.setdefault(begin, []).append(hex(instruction.address))
                break
    report = {'exe_sha256': digest, 'region': [hex(args.start_rva), hex(args.end_rva)],
              'raw_occurrences': raw_hits, 'runtime_verified': False,
              'candidates': [{'unwind_start': hex(rva), 'multiply_sites': sites} for rva, sites in sorted(candidates.items())],
              'limitations': ['Shared arithmetic is not semantic identity.',
                             'Unwind fragments, not necessarily whole functions; no indirect call resolution.']}
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(report, indent=2), encoding='utf-8')
    print(json.dumps({'raw_occurrences': raw_hits, 'candidate_fragments': len(candidates)}))


if __name__ == '__main__':
    main()
