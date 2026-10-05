"""Compare the initial palette dispatch slice with original pinned instructions.

Allocator, asynchronous worker and generators are excluded. Generator calls are
captured as private no-op boundaries; color arithmetic has separate comparisons.
"""
import argparse
import hashlib
import itertools
import json
from pathlib import Path
import runpy
import struct
import sys

HERE = Path(__file__).resolve().parent
COMMON = runpy.run_path(str(HERE / 'emulate-appearance-context.py'))
PORT = runpy.run_path(str(HERE / 'resolve-palette-task.py'))
BASE, HASH = COMMON['BASE'], COMMON['HASH']
BEGIN, END, EXIT = 0x638a8a, 0x638af2, 0x638aef


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for key in ('executable', 'python-tools', 'emulator-tools', 'output'):
        parser.add_argument('--' + key, type=Path, required=True)
    args = parser.parse_args()
    exe, output = args.executable.resolve(), args.output.resolve()
    if output.exists() or any(output.is_relative_to(p) for p in (exe.parent.parent, HERE.parents[1])):
        parser.error('Require a new external output')
    if exe.stat().st_size > 128 * 1024**2:
        parser.error('Executable byte budget exceeded')
    raw = exe.read_bytes()
    if hashlib.sha256(raw).hexdigest() != HASH:
        parser.error('Executable fingerprint mismatch')
    sections = runpy.run_path(str(HERE.parent / 'native/asi/locate-frontend-hooks.py'))['executable_sections'](raw)
    text = next(s for s in sections if s['name'] == '.text')
    offset = text['raw_offset'] + BEGIN - text['virtual_address']
    code = raw[offset:offset + END - BEGIN]
    sys.path[:0] = [str(args.python_tools), str(args.emulator_tools)]
    import unicorn
    from unicorn import x86_const as regs
    from capstone import Cs, CS_ARCH_X86, CS_MODE_64
    if unicorn.__version__ != '2.1.4':
        parser.error('Requires private Unicorn 2.1.4')
    instructions = list(Cs(CS_ARCH_X86, CS_MODE_64).disasm(code, BEGIN))
    if sum(i.size for i in instructions) != len(code) or instructions[0].mnemonic != 'cmp':
        raise ValueError('Unexpected palette dispatch slice')
    records = []
    for flag, mode in itertools.product((0, 1, 2, 255), (0, 1, 5, 0xffffffff)):
        calls = []
        def observe(machine, address, allocate, write, unpack, get, put, cstring):
            if address == BASE + EXIT:
                put('RIP', 0x10000000)
                return True
            if address - BASE in (0x62c480, 0x62e4e0):
                calls.append({'generator_rva': hex(address - BASE), 'bank_offset': get('RCX') - bank,
                              'seed_pair': list(unpack(get('R9'), '<QQ')),
                              'output': unpack(get('RSP') + 0x30, '<Q')[0]})
            return False
        machine, allocate, write, unpack, _, _, execute = COMMON['create_fixture'](
            unicorn, regs, {BEGIN: code}, {0x6e896c8: struct.pack('<I', mode),
                0x6e89688: struct.pack('<Q', 0x40000000)}, windows=((BEGIN, END),),
            stubs=(0x62c480, 0x62e4e0), observer=observe)
        # A single private page at the otherwise sparse manager field; no host pointer.
        machine.mem_map(0x4072a000, 8192)
        bank, task, output_at = allocate(16), allocate(0x300), allocate(0x1ce0)
        write(0x4072afb0, '<Q', bank)
        write(task + 0x1c9, '<B', flag)
        write(task + 0x138, '<QQ', 7, 1)
        write(task + 0x178, '<Q', output_at)
        machine.reg_write(regs.UC_X86_REG_RSI, task)
        machine.reg_write(regs.UC_X86_REG_RDI, 0)
        machine.reg_write(regs.UC_X86_REG_RBP, 0x3000ee00)
        execute(BEGIN, ())
        expected = PORT['resolve']({'alternate_flag': flag, 'global_mode': mode, 'precomputed': False})
        ok = calls == ([] if mode == 5 else [{'generator_rva': expected['generator_rva'],
            'bank_offset': expected['bank_offset'], 'seed_pair': [7, 1], 'output': output_at}])
        records.append({'flag': flag, 'mode': mode, 'calls': calls, 'matches': ok})
    report = {'executable_sha256': HASH, 'source_sha256': hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
              'port_sha256': hashlib.sha256((HERE / 'resolve-palette-task.py').read_bytes()).hexdigest(),
              'window': {'begin': hex(BEGIN), 'end': hex(END), 'sha256': hashlib.sha256(code).hexdigest()},
              'cases': len(records), 'mismatches': sum(not r['matches'] for r in records), 'records': records,
              'runtime_verified': False, 'limitations': ['Initial state-zero dispatch slice only; explicit task/global inputs.',
                'Generators are captured no-op boundaries; arithmetic has separate native comparisons.',
                'Precomputed bypass is source/instruction evidence, not executed by this slice.',
                'No category-wide caller defaults, game process, save or delivery.']}
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open('x', encoding='utf-8') as stream: json.dump(report, stream, indent=2)
    print(json.dumps({key: report[key] for key in ('cases', 'mismatches')}))
    if report['mismatches']: raise SystemExit(1)


if __name__ == '__main__': main()
