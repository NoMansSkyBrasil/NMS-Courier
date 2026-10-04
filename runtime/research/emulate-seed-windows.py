"""Compare fixed build-180383 x64 arithmetic windows with offline formulas.

Only emulator-private code, stack and seed pages are mapped. No game loading,
native game execution, import resolution, process access or runtime mutation.
"""
import argparse
import hashlib
import json
from pathlib import Path
import random
import runpy
import struct
import sys

EXE_HASH = '671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4'
WINDOWS = {'initialize': (0x2D63C22, 0x2D63C4A),
           'draw': (0x2D67C4F, 0x2D67C7D),
           'child': (0x2D63F70, 0x2D63FF8)}
ALLOWED = {'mov', 'movabs', 'xor', 'test', 'sete', 'ror', 'add', 'shr',
           'imul', 'movsxd', 'shl', 'lea', 'or'}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--executable', type=Path, required=True)
    parser.add_argument('--python-tools', type=Path, required=True)
    parser.add_argument('--emulator-tools', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    exe, output = args.executable.resolve(), args.output.resolve()
    if output.exists() or output.is_relative_to(exe.parent.parent) or output.is_relative_to(Path(__file__).resolve().parents[2]):
        parser.error('Output must be new and outside the game/repository')
    if exe.stat().st_size > 128 * 1024 * 1024:
        parser.error('Executable exceeds the 128 MiB budget')
    raw = exe.read_bytes()
    if hashlib.sha256(raw).hexdigest() != EXE_HASH:
        parser.error('Executable fingerprint mismatch')
    sys.path[:0] = [str(args.python_tools), str(args.emulator_tools)]
    import unicorn
    from unicorn import x86_const as registers
    from capstone import Cs, CS_ARCH_X86, CS_MODE_64
    if unicorn.__version__ != '2.1.4':
        parser.error('This probe requires Unicorn 2.1.4')
    sections = runpy.run_path(str(Path(__file__).parents[1] / 'native/asi/locate-frontend-hooks.py'))['executable_sections'](raw)
    primitives = runpy.run_path(str(Path(__file__).with_name('procedural-seed-primitives.py')))
    inverse = runpy.run_path(str(Path(__file__).with_name('invert-child-seed.py')))['invert']
    decoder = Cs(CS_ARCH_X86, CS_MODE_64)
    windows, metadata = {}, {}
    for name, (begin, end) in WINDOWS.items():
        section = next(s for s in sections if s['name'] == '.text' and
                       s['virtual_address'] <= begin < end <= s['virtual_address'] + s['raw_size'])
        offset = section['raw_offset'] + begin - section['virtual_address']
        code = raw[offset:offset + end - begin]
        instructions = list(decoder.disasm(code, begin))
        if sum(i.size for i in instructions) != len(code) or any(i.mnemonic not in ALLOWED for i in instructions):
            raise ValueError('Window contains incomplete or disallowed instructions')
        windows[name] = code
        metadata[name] = {'rva_start': hex(begin), 'rva_stop_exclusive': hex(end),
                          'sha256': hashlib.sha256(code).hexdigest(),
                          'instruction_count': len(instructions)}

    def emulate(name, state=(1, 0), seed=0, weight=20):
        machine = unicorn.Uc(unicorn.UC_ARCH_X86, unicorn.UC_MODE_64)
        code_at, data_at, stack_at = 0x1000000, 0x2000000, 0x3000800
        machine.mem_map(code_at, 4096, unicorn.UC_PROT_READ | unicorn.UC_PROT_EXEC)
        machine.mem_map(data_at, 4096, unicorn.UC_PROT_READ | unicorn.UC_PROT_WRITE)
        machine.mem_map(0x3000000, 4096, unicorn.UC_PROT_READ | unicorn.UC_PROT_WRITE)
        machine.mem_write(code_at, windows[name])
        machine.mem_write(data_at, struct.pack('<Q', seed) if name == 'initialize' else struct.pack('<II', *state))
        for register, value in {'RSP': stack_at, 'RBP': stack_at, 'R8': data_at,
                                'R9': data_at, 'R10': weight, 'R15': state[0],
                                'R12': state[1]}.items():
            machine.reg_write(getattr(registers, 'UC_X86_REG_' + register), value)
        stop = code_at + len(windows[name])
        machine.emu_start(code_at, stop, timeout=10000, count=64)
        if machine.reg_read(registers.UC_X86_REG_RIP) != stop:
            raise RuntimeError('Emulator did not reach the exact window boundary')
        if name == 'initialize':
            return struct.unpack('<II', machine.mem_read(stack_at + 0x70, 8))
        if name == 'draw':
            return (struct.unpack('<II', machine.mem_read(data_at, 8)),
                    machine.reg_read(registers.UC_X86_REG_R12))
        return (struct.unpack('<II', machine.mem_read(stack_at + 0x70, 8)),
                struct.unpack('<Q', machine.mem_read(stack_at - 0x38, 8))[0])

    rng = random.Random(180383)
    seeds = [0, 1, 0xFFFFFFFF, 0x100000000, 0xFFFFFFFF00000000,
             0xFFFFFFFFFFFFFFFF, 0x1000100000001, 0x1AD0003900054]
    seeds += [rng.getrandbits(64) for _ in range(512)]
    checks, inverse_count, ambiguity = 0, 0, {}
    for seed in seeds:
        state = primitives['seed_state'](seed)
        if emulate('initialize', seed=seed) != state:
            raise AssertionError('Native initializer/formula mismatch')
        checks += 1
        for weight in (1, 20, 21, 81920):
            next_state, draw = primitives['advance'](state)
            if emulate('draw', state=state, weight=weight) != (next_state, (draw * weight) >> 32):
                raise AssertionError('Native draw/formula mismatch')
            checks += 1
        next_state, child = primitives['child_seed'](state)
        if emulate('child', state=state) != (next_state, child):
            raise AssertionError('Native child/formula mismatch')
        checks += 1
        candidates = inverse(child)['enabled_seed_candidates']
        if f'0x{seed:016X}' not in {c['seed'] for c in candidates}:
            raise AssertionError('Original input missing from inverse')
        ambiguity[len(candidates)] = ambiguity.get(len(candidates), 0) + 1
        for candidate in candidates:
            input_seed = int(candidate['seed'], 16)
            native_state = emulate('initialize', seed=input_seed)
            if emulate('child', state=native_state)[1] != child:
                raise AssertionError('Inverse fails native instruction emulation')
            inverse_count += 1
    report = {'exe_sha256': EXE_HASH, 'emulator': 'Unicorn 2.1.4',
              'windows': metadata, 'input_cases': len(seeds),
              'forward_window_comparisons': checks,
              'inverse_candidates_emulated': inverse_count,
              'inverse_candidate_count_histogram': ambiguity,
              'mismatches': 0, 'runtime_verified': False,
              'appearance_verified': False,
              'scope': 'Fixed straight-line arithmetic windows; caller state is synthetic',
              'limits': {'code_pages': 1, 'data_pages': 2, 'instructions_per_window': 64,
                         'timeout_microseconds_per_window': 10000},
              'not_proven': ['Whole generator call schedule, filters, textures, materials and rendering',
                             'Inverse from selected parts/colors or natural locations']}
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(report, indent=2), encoding='utf-8')
    print(json.dumps({k: report[k] for k in ('input_cases', 'forward_window_comparisons',
                                          'inverse_candidates_emulated', 'mismatches')}))


if __name__ == '__main__':
    main()
