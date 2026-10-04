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
    parser.add_argument('--begin-rva', type=lambda x: int(x, 0), default=0x1830000)
    parser.add_argument('--end-rva', type=lambda x: int(x, 0), default=0x18f0000)
    parser.add_argument('--field', action='append', type=lambda x: int(x, 0))
    parser.add_argument('--vector-field', type=lambda x: int(x, 0), default=0x78)
    parser.add_argument('--include-rbp', action='store_true', help='Retain RBP matches as untyped candidates')
    parser.add_argument('--read-field', action='append', type=lambda x: int(x, 0), default=[])
    parser.add_argument('--rip-target', action='append', type=lambda x: int(x, 0), default=[])
    args = parser.parse_args()
    if not 0 <= args.begin_rva < args.end_rva or args.end_rva - args.begin_rva > 0xc0000:
        parser.error('Select a region of at most 0xc0000 bytes')
    fields = tuple(args.field or (0x7c, 0x80))
    if len(args.rip_target) > 16 or any(not 0 <= value <= 0xffffffff for value in args.rip_target):
        parser.error('Select up to sixteen bounded RIP targets')
    if len(fields) > 8 or len(args.read_field) > 8 or any(not 0 <= value <= 0x1000000 for value in (*fields, *args.read_field, args.vector_field)):
        parser.error('Select up to eight bounded field offsets')
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
    from capstone.x86_const import X86_OP_MEM, X86_REG_RSP, X86_REG_RBP, X86_REG_RIP
    sections = runpy.run_path(str(Path(__file__).parents[1] / 'native/asi/locate-frontend-hooks.py'))['executable_sections'](raw)
    chain = runpy.run_path(str(Path(__file__).with_name('inspect-native-fragments.py')))['unwind_chain']
    text = next(s for s in sections if s['name'] == '.text')
    pdata = next(s for s in sections if s['name'] == '.pdata')
    entries = struct.iter_unpack('<III', raw[pdata['raw_offset']:pdata['raw_offset'] + pdata['raw_size'] - pdata['raw_size'] % 12])
    decoder = Cs(CS_ARCH_X86, CS_MODE_64)
    decoder.detail = True
    records, fragments, skipped = [], 0, 0
    for begin, end, unwind in entries:
        if not args.begin_rva <= begin < args.end_rva:
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
                if operand.type == X86_OP_MEM and operand.mem.disp == args.vector_field:
                    operation = 'vector_address'
            elif instruction.mnemonic in ('mov', 'movups', 'movaps', 'movdqu', 'movdqa',
                                           'vmovups', 'vmovaps', 'inc', 'add', 'sub') and operands:
                operand = operands[0]
                if operand.type == X86_OP_MEM and operand.mem.disp in fields:
                    operation = 'field_write'
            if not operation and len(operands) > 1:
                operand = operands[1]
                if operand.type == X86_OP_MEM and operand.mem.disp in args.read_field:
                    operation = 'field_read_or_address'
            for candidate in operands:
                if candidate.type == X86_OP_MEM and candidate.mem.base == X86_REG_RIP:
                    if instruction.address + instruction.size + candidate.mem.disp in args.rip_target:
                        operand, operation = candidate, 'rip_target_reference'
            excluded_bases = (X86_REG_RSP,) if args.include_rbp else (X86_REG_RSP, X86_REG_RBP)
            if operation and operand.mem.base not in excluded_bases:
                records.append({'root': chain(raw, sections, (begin, end, unwind))[-1]['begin'],
                                'site': hex(instruction.address), 'operation': operation,
                                'instruction': instruction.mnemonic + ' ' + instruction.op_str})
                if len(records) > 128:
                    raise ValueError('Field candidate budget exceeded')
    report = {'exe_sha256': HASH, 'runtime_verified': False, 'fragments': fragments,
              'region': [hex(args.begin_rva), hex(args.end_rva)], 'fields': list(fields),
              'vector_field': args.vector_field,
              'include_rbp': args.include_rbp,
              'read_fields': args.read_field,
              'rip_targets': [hex(value) for value in args.rip_target],
              'skipped_fragments': skipped, 'records': records,
              'limitations': ['Offset matches do not establish an object layout',
                              'RSP operands excluded; RBP matches require source-register attribution',
                              'Only the selected bounded region unwind fragments are decoded']}
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open('x', encoding='utf-8') as stream:
        json.dump(report, stream, indent=2)
    print(json.dumps({'fragments': fragments, 'candidates': len(records), 'skipped': skipped}))


if __name__ == '__main__':
    main()
