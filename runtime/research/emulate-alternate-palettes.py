"""Compare explicit alternate palette fixtures with pinned original x64 instructions."""
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
PORT = runpy.run_path(str(HERE / 'evaluate-alternate-palettes.py'))
BASE, HASH = COMMON['BASE'], COMMON['HASH']
WINDOWS = ((0x62e4e0, 0x62e775), (0x62e780, 0x62eb62))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for key in ('executable', 'corpus', 'python-tools', 'emulator-tools', 'output'):
        parser.add_argument('--' + key, type=Path, required=True)
    args = parser.parse_args()
    exe, corpus, output = args.executable.resolve(), args.corpus.resolve(), args.output.resolve()
    if output.exists() or any(output.is_relative_to(p) for p in (exe.parent.parent, corpus, HERE.parents[1])):
        parser.error('Require a new external output')
    if exe.stat().st_size > 128 * 1024**2:
        parser.error('Executable byte budget exceeded')
    raw = exe.read_bytes()
    if hashlib.sha256(raw).hexdigest() != HASH:
        parser.error('Executable fingerprint mismatch')
    sys.path[:0] = [str(args.python_tools), str(args.emulator_tools)]
    import unicorn
    from unicorn import x86_const as regs
    from capstone import Cs, CS_ARCH_X86, CS_MODE_64
    from capstone.x86_const import X86_OP_MEM, X86_REG_RIP
    if unicorn.__version__ != '2.1.4':
        parser.error('Requires private Unicorn 2.1.4')
    sections = runpy.run_path(str(HERE.parent / 'native/asi/locate-frontend-hooks.py'))['executable_sections'](raw)
    def read(rva, size):
        section = next(s for s in sections if s['virtual_address'] <= rva and
                       rva + size <= s['virtual_address'] + s['raw_size'])
        offset = section['raw_offset'] + rva - section['virtual_address']
        data = raw[offset:offset + size]
        if len(data) != size:
            raise ValueError('Incomplete file-backed instruction bytes')
        return data
    decoder = Cs(CS_ARCH_X86, CS_MODE_64); decoder.detail = True
    code = {begin: read(begin, end - begin) for begin, end in WINDOWS}
    constants = {}
    for begin, data in code.items():
        instructions = list(decoder.disasm(data, BASE + begin))
        if sum(i.size for i in instructions) != len(data):
            raise ValueError('Incomplete instruction decoding')
        for ins in instructions:
            if ins.mnemonic in ('syscall', 'sysenter', 'int', 'in', 'out'):
                raise ValueError('External instruction rejected')
            for operand in ins.operands:
                if operand.type == X86_OP_MEM and operand.mem.base == X86_REG_RIP:
                    rva = ins.address + ins.size + operand.mem.disp - BASE
                    constants[rva] = operand.size
    if set(constants) != {0x4b26778, 0x4b2f8d0, 0x525d910}:
        raise ValueError('Unexpected alternate palette runtime constants')
    palettes = PORT['BASE']['load_base'](corpus)
    seeds = (0, 7, 0x1ad0003900054, 2**64 - 1)
    records = []
    def fixture(palette_rows, threshold, present=True, collection_enabled=True):
        fallback = (0.25, 0.5, 0.75, 1.0)
        constant_data = {0x4b26778: struct.pack('<f', 0),
                         0x4b2f8d0: struct.pack('<4f', *fallback),
                         0x525d910: struct.pack('<f', threshold)}
        draws = [0]
        def observer(machine, address, *unused):
            if address == BASE + 0x62e830: draws[0] += 2
            return False
        machine, alloc, write, unpack, _, _, execute = COMMON['create_fixture'](
            unicorn, regs, code, constant_data, windows=WINDOWS, stubs=(), observer=observer)
        owner, handle = alloc(0x120), alloc(8)
        storage = alloc(66 * 0x410)
        for i, row in enumerate(palette_rows):
            for j, color in enumerate(row['colors']): write(storage + i * 0x410 + j * 16, '<4f', *color)
            write(storage + i * 0x410 + 0x400, '<I', row['mode'])
        write(handle, '<Q', storage if present else 0)
        write(owner + 0x104, '<I', int(collection_enabled)); write(owner + 0x108, '<Q', handle)
        return machine, alloc, write, unpack, execute, owner, fallback, draws
    # All six mode fields, fresh retries, five-sample SIMD/tail path and null fallback.
    for seed, mode, threshold, present, count, collection_enabled in itertools.product(
            seeds, range(6), (0, 0.1), (True, False), (1, 5), (False, True)):
        row = {'family': 'Fixture', 'mode': mode, 'colors': palettes[10]['colors']}
        machine, alloc, write, unpack, execute, owner, fallback, draws = fixture([row] * 66, threshold, present, collection_enabled)
        state = PORT['CORE']['seed_state'](seed)
        state_at, rgba_at, index_at = alloc(8), alloc(80), alloc(20)
        write(state_at, '<II', *state)
        expected_state, expected = PORT['palette_row'](state, row if present else None, threshold, fallback, count, collection_enabled)
        execute(0x62e780, (owner, 0, 0, 10, count, rgba_at, index_at, state_at))
        observed = [{'index': unpack(index_at + i * 4, '<I')[0], 'rgba': list(unpack(rgba_at + i * 16, '<4f'))} for i in range(count)]
        ok = unpack(state_at, '<II') == expected_state and draws[0] == sum((r['retries'] + 1) * 2 for r in expected) and all(
            r['index'] == e['index'] and r['rgba'] == list(e['rgba']) for r, e in zip(observed, expected))
        records.append({'kind': 'row', 'seed': hex(seed), 'mode': mode, 'threshold': threshold,
                        'present': present, 'collection_enabled': collection_enabled,
                        'count': count, 'draws': draws[0], 'matches': ok})
    # Collection with real base data supplied explicitly, not inferred native collection.
    for seed, enabled, threshold in itertools.product(seeds, (False, True), (0, 0.1)):
        machine, alloc, write, unpack, execute, owner, fallback, draws = fixture(palettes, threshold)
        pair, output_at = alloc(16), alloc(0x1ce0)
        write(pair, '<QB', seed, int(enabled))
        expected = PORT['generate'](seed, palettes, threshold, fallback, enabled)
        # Full 66-row retry scheduling exceeds the common single-helper budget.
        sp = 0x3000f008
        write(sp, '<Q', 0x10000000)
        for name, value in zip(('RCX', 'RDX', 'R8', 'R9'), (owner, 0, 0, pair)):
            machine.reg_write(getattr(regs, 'UC_X86_REG_' + name), value)
        write(sp + 0x28, '<QQ', 0, output_at)
        machine.reg_write(regs.UC_X86_REG_RSP, sp)
        machine.emu_start(BASE + 0x62e4e0, 0x10000000, timeout=2000000, count=2000000)
        if machine.reg_read(regs.UC_X86_REG_RIP) != 0x10000000:
            raise ValueError('Collection instruction/time budget exceeded')
        ok = all(unpack(output_at + i * 0x70 + j * 16, '<4f') == tuple(color['rgba']) and
                 unpack(output_at + i * 0x70 + 0x50 + j * 4, '<I')[0] == color['index']
                 for i, row in enumerate(expected) for j, color in enumerate(row['colors']))
        records.append({'kind': 'collection', 'seed': hex(seed), 'enabled': enabled, 'threshold': threshold,
                        'draws': draws[0], 'matches': ok})
    for seed in seeds:
        machine, alloc, write, unpack, execute, owner, fallback, draws = fixture(palettes, 0, collection_enabled=False)
        pair, output_at = alloc(16), alloc(0x1ce0)
        write(pair, '<QB', seed, 1)
        machine.mem_write(output_at, b'\xa5' * 0x1ce0)
        execute(0x62e4e0, (owner, 0, 0, pair, 0, output_at))
        records.append({'kind': 'disabled_collection', 'seed': hex(seed), 'matches':
                        bytes(machine.mem_read(output_at, 0x1ce0)) == b'\xa5' * 0x1ce0 and draws[0] == 0})
    report = {'executable_sha256': HASH, 'source_sha256': hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
              'port_sha256': hashlib.sha256((HERE / 'evaluate-alternate-palettes.py').read_bytes()).hexdigest(),
              'windows': [{'begin': hex(b), 'end': hex(e), 'sha256': hashlib.sha256(code[b]).hexdigest()} for b, e in WINDOWS],
              'cases': len(records), 'mismatches': sum(not row['matches'] for row in records), 'records': records,
              'runtime_verified': False, 'limitations': ['Explicit threshold/fallback/collection fixtures, not natural task state.',
                  'Collection scheduling compared at thresholds 0 and float32(0.1); other runtime values are not inferred.',
                  'No textures, native rendering, game process or delivery.']}
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open('x', encoding='utf-8') as stream: json.dump(report, stream, indent=2)
    print(json.dumps({k: report[k] for k in ('cases', 'mismatches')}))
    if report['mismatches']: raise SystemExit(1)


if __name__ == '__main__': main()
