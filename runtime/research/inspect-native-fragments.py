"""Export bounded offline disassembly and literal windows from a fingerprinted PE."""
import argparse
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
    parser.add_argument('--rva', action='append', default=[])
    parser.add_argument('--literal', action='append', default=[])
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    if not 1 <= len(args.rva) + len(args.literal) <= 16:
        parser.error('Select 1..16 fragments/literals')
    exe, output = args.executable.resolve(), args.output.resolve()
    if output.exists() or output.is_relative_to(exe.parent.parent) or output.is_relative_to(Path(__file__).resolve().parents[2]):
        parser.error('Output must be new and outside game/repository')
    if exe.stat().st_size > 128 * 1024 * 1024:
        parser.error('Executable size budget exceeded')
    raw = exe.read_bytes()
    digest = hashlib.sha256(raw).hexdigest()
    if digest != args.sha256.lower():
        parser.error('Executable fingerprint mismatch')
    helpers = runpy.run_path(str(Path(__file__).parents[1] / 'native/asi/locate-frontend-hooks.py'))
    sections = helpers['executable_sections'](raw)
    pdata = next(s for s in sections if s['name'] == '.pdata')
    ranges = [(a, b) for a, b, _ in struct.iter_unpack('<III', raw[pdata['raw_offset']:pdata['raw_offset'] + pdata['raw_size'] - pdata['raw_size'] % 12]) if a and b > a]

    def window(rva, size):
        section = next((s for s in sections if s['virtual_address'] <= rva and rva + size <= s['virtual_address'] + s['raw_size']), None)
        if section is None:
            raise ValueError('Requested window is not file-backed')
        offset = section['raw_offset'] + rva - section['virtual_address']
        return raw[offset:offset + size]

    sys.path.insert(0, str(args.python_tools))
    from capstone import Cs, CS_ARCH_X86, CS_MODE_64
    decoder = Cs(CS_ARCH_X86, CS_MODE_64)
    report = {'exe_sha256': digest, 'runtime_verified': False, 'fragments': [], 'literals': []}
    for address in args.rva:
        rva = int(address, 16)
        begin, end = next((bounds for bounds in ranges if bounds[0] <= rva < bounds[1]), (0, 0))
        if not begin or end - begin > 65536:
            raise ValueError('Unwind fragment absent or exceeds budget')
        code = window(begin, end - begin)
        report['fragments'].append({'begin': hex(begin), 'end': hex(end), 'sha256': hashlib.sha256(code).hexdigest(),
                                   'instructions': [{'rva': hex(i.address), 'bytes': i.bytes.hex(), 'mnemonic': i.mnemonic, 'operands': i.op_str} for i in decoder.disasm(code, begin)]})
    for address in args.literal:
        rva = int(address, 16)
        data = window(rva, 32)
        report['literals'].append({'rva': hex(rva), 'hex': data.hex(), 'ascii_prefix': data.split(b'\0', 1)[0].decode('ascii', errors='replace')})
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(report, indent=2), encoding='utf-8')
    print(json.dumps({'fragments': len(report['fragments']), 'literals': report['literals']}))


if __name__ == '__main__':
    main()
