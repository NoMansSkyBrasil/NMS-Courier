"""Scan bounded build-180383 scene-region field-use candidates without execution.

An offset match is not a layout identity. Includes false positives deliberately;
follow chained roots and inspect source register ownership before using a result.
"""
import argparse
import hashlib
import json
from pathlib import Path
import runpy
import struct
import sys

HASH = '671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4'


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--executable', type=Path, required=True)
    parser.add_argument('--python-tools', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    exe, output = args.executable.resolve(), args.output.resolve()
    if output.exists() or any(output.is_relative_to(p) for p in
                             (exe.parent.parent, Path(__file__).resolve().parents[2])):
        parser.error('Require a new external output')
    if exe.stat().st_size > 128 * 1024**2:
        parser.error('Executable byte budget exceeded')
    raw = exe.read_bytes()
    if hashlib.sha256(raw).hexdigest() != HASH:
        parser.error('Executable fingerprint mismatch')
    sys.path.insert(0, str(args.python_tools))
    from capstone import Cs, CS_ARCH_X86, CS_MODE_64
    from capstone.x86_const import X86_OP_MEM, X86_REG_RSP, X86_REG_RBP
    sections = runpy.run_path(str(Path(__file__).parents[1] / 'native/asi/locate-frontend-hooks.py'))['executable_sections'](raw)
    chain = runpy.run_path(str(Path(__file__).with_name('inspect-native-fragments.py')))['unwind_chain']
    text = next(s for s in sections if s['name'] == '.text')
    pdata = next(s for s in sections if s['name'] == '.pdata')
    entries = struct.iter_unpack('<III', raw[pdata['raw_offset']:pdata['raw_offset'] + pdata['raw_size'] - pdata['raw_size'] % 12])
    decoder = Cs(CS_ARCH_X86, CS_MODE_64)
    decoder.detail = True
    records, fragments, skipped = [], 0, 0
    for begin, end, unwind in entries:
        if not 0x1830000 <= begin < 0x18f0000:
            continue
        if not begin < end or end - begin > 16384:
            skipped += 1
            continue
        fragments += 1
        if fragments > 8192:
            raise ValueError('Unwind fragment budget exceeded')
        offset = text['raw_offset'] + begin - text['virtual_address']
        if offset < text['raw_offset'] or offset + end - begin > text['raw_offset'] + text['raw_size']:
            raise ValueError('Fragment outside file-backed code')
        instructions = list(decoder.disasm(raw[offset:offset+end-begin], begin))
        if sum(i.size for i in instructions) != end - begin:
            skipped += 1
            continue
        for instruction in instructions:
            operands = instruction.operands
            operation = None
            if instruction.mnemonic == 'lea' and len(operands) == 2:
                operand = operands[1]
                if operand.type == X86_OP_MEM and operand.mem.disp == 0x78:
                    operation = 'vector_address'
            elif instruction.mnemonic in ('mov', 'inc', 'add', 'sub') and operands:
                operand = operands[0]
                if operand.type == X86_OP_MEM and operand.mem.disp in (0x7c, 0x80):
                    operation = 'field_write'
            if operation and operand.mem.base not in (X86_REG_RSP, X86_REG_RBP):
                records.append({'root': chain(raw, sections, (begin, end, unwind))[-1]['begin'],
                                'site': hex(instruction.address), 'operation': operation,
                                'instruction': instruction.mnemonic + ' ' + instruction.op_str})
                if len(records) > 128:
                    raise ValueError('Field candidate budget exceeded')
    report = {'exe_sha256': HASH, 'runtime_verified': False, 'fragments': fragments,
              'skipped_fragments': skipped, 'records': records,
              'limitations': ['Offset matches do not establish an object layout',
                              'RSP/RBP operands excluded; RBP object bases may be missed',
                              'Only the bounded scene-region unwind fragments are decoded']}
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open('x', encoding='utf-8') as stream:
        json.dump(report, stream, indent=2)
    print(json.dumps({'fragments': fragments, 'candidates': len(records), 'skipped': skipped}))


if __name__ == '__main__':
    main()
