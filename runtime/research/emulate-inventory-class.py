"""Compare the inventory-class port with original pinned build 180383 instructions.

Two windows run under Unicorn with synthetic private state: generator 4cfd10
and the class-selection head of wrapper 4ccfa0 (through 4ccfed). The global
manager, solar-system row index and probability table are private fixtures;
the one unrelated callee is a no-op boundary. No game process is involved.
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
PORT = runpy.run_path(str(HERE / 'evaluate-inventory-class.py'))
HASH = '671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4'
BASE = 0x140000000
GENERATOR, GENERATOR_END = 0x4cfd10, 0x4cfe1e
WRAPPER, WRAPPER_STOP = 0x4ccfa0, 0x4ccfed
STUB = 0x2d6b670
MANAGER_POINTER, LITERALS = 0x6e89688, (0x4b243a0, 0x4b251f8)
MANAGER, SYSTEM, TABLE, STORE, SEED, STACK = (0x40000000, 0x41000000, 0x42000000,
                                             0x43000000, 0x44000000, 0x45000000)
SEEDS = (0, 1, 7, 0xffffffff, 0x100000000, 0x8000000080000000, 0xdeadbeefcafef00d,
         0x123456789abcdef0, 0xffffffffffffffff, 0x00000001ffffffff, 0x5a76f89900000000)
ROWS = ((60.0, 30.0, 10.0, 0.0), (49.0, 35.0, 15.0, 1.0), (30.0, 40.0, 28.0, 2.0),
        (5.0, 5.0, 5.0, 5.0), (0.0, 0.0, 0.0, 0.0), (0.0, 0.0, 0.0, 100.0), (25.0, 25.0, 25.0, 25.0))


def sections(raw):
    pe = struct.unpack_from('<I', raw, 0x3c)[0]
    count, optional = struct.unpack_from('<H', raw, pe + 6)[0], struct.unpack_from('<H', raw, pe + 20)[0]
    for index in range(count):
        at = pe + 24 + optional + index * 40
        size, address, raw_size, raw_at = struct.unpack_from('<IIII', raw, at + 8)
        yield address, raw_at, raw_size


def file_bytes(raw, rva, size):
    for address, raw_at, raw_size in sections(raw):
        if address <= rva and rva + size <= address + raw_size:
            return raw[raw_at + rva - address:raw_at + rva - address + size]
    raise ValueError('Range is not file-backed: ' + hex(rva))


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
    sys.path[:0] = [str(args.python_tools), str(args.emulator_tools)]
    import unicorn
    from unicorn import x86_const as regs
    if unicorn.__version__ != '2.1.4':
        parser.error('Requires private Unicorn 2.1.4')
    windows = {GENERATOR: file_bytes(raw, GENERATOR, GENERATOR_END - GENERATOR),
               WRAPPER: file_bytes(raw, WRAPPER, WRAPPER_STOP - WRAPPER)}

    def run(entry, stop, seed, enabled, row, weights, inventory_type=0, requested=0):
        machine = unicorn.Uc(unicorn.UC_ARCH_X86, unicorn.UC_MODE_64)
        page = lambda value: value & ~0xfff
        for start, code in windows.items():
            machine.mem_map(BASE + page(start), 0x2000)
            machine.mem_write(BASE + start, code)
        machine.mem_map(BASE + page(STUB), 0x1000)
        machine.mem_write(BASE + STUB, b'\xc3')
        for literal in LITERALS:
            machine.mem_map(BASE + page(literal), 0x1000)
            machine.mem_write(BASE + literal, file_bytes(raw, literal, 8))
        machine.mem_map(BASE + page(MANAGER_POINTER), 0x1000)
        machine.mem_write(BASE + MANAGER_POINTER, struct.pack('<Q', MANAGER))
        machine.mem_map(MANAGER, 0x800000)
        for address in (SYSTEM, TABLE, STORE, SEED, STACK):
            machine.mem_map(address, 0x10000)
        machine.mem_write(MANAGER + 0x72afb0, struct.pack('<Q', SYSTEM))
        machine.mem_write(MANAGER + 0x218, struct.pack('<Q', TABLE))
        machine.mem_write(SYSTEM + 0x2524, struct.pack('<i', row))
        machine.mem_write(TABLE + 0x1a54 + row * 16, struct.pack('<4f', *weights))
        machine.mem_write(STORE + 0x100, struct.pack('<I', 0xa5a5a5a5))
        machine.mem_write(SEED, struct.pack('<QB', seed, enabled))
        stack = STACK + 0x8000
        machine.mem_write(stack, struct.pack('<Q', 0x10000))
        # Wrapper stack argument 9 is the requested class; it reads it after its own prologue.
        machine.mem_write(stack + 0x48, struct.pack('<I', requested))
        machine.reg_write(regs.UC_X86_REG_RSP, stack)
        machine.reg_write(regs.UC_X86_REG_RCX, STORE)
        if entry == GENERATOR:
            machine.reg_write(regs.UC_X86_REG_RDX, SEED)
        else:
            machine.reg_write(regs.UC_X86_REG_RDX, inventory_type)
            machine.reg_write(regs.UC_X86_REG_R8, SEED)
        machine.mem_map(0, 0x20000)
        machine.emu_start(BASE + entry, BASE + stop if stop else 0x10000, count=4096)
        return struct.unpack('<I', machine.mem_read(STORE + 0x100, 4))[0]

    records = []
    for seed, enabled, (row, weights) in itertools.product(SEEDS, (1, 0), enumerate(ROWS[:4])):
        native = run(GENERATOR, None, seed, enabled, row, weights)
        records.append({'window': 'generator', 'seed': hex(seed), 'enabled': enabled, 'row': row,
                        'native': native, 'port': PORT['class_from_seed'](seed, weights, bool(enabled))})
    for seed, weights in itertools.product(SEEDS, ROWS[4:]):
        native = run(GENERATOR, None, seed, 1, 2, weights)
        records.append({'window': 'generator', 'seed': hex(seed), 'enabled': 1, 'row': 2, 'weights': weights,
                        'native': native, 'port': PORT['class_from_seed'](seed, weights)})
    for (row, weights), low_word in itertools.product(enumerate(ROWS[:4]), (0, 7, 0xfffffffe)):
        edges = [edge for index in range(4) for edge in (PORT['draw_interval'](weights, index) or ())]
        for draw in sorted({(edge + step) & 0xffffffff for edge in edges for step in (-1, 0, 1)}):
            seed = PORT['seed_for_draw'](low_word, draw)
            native = run(GENERATOR, None, seed, 1, row, weights)
            records.append({'window': 'generator_boundary', 'seed': hex(seed), 'draw': draw, 'row': row,
                            'native': native, 'port': PORT['class_from_seed'](seed, weights)})
    for seed, inventory_type, requested in itertools.product(SEEDS[2:7], range(0, 12), (0, 1, 2, 3, 4)):
        native = run(WRAPPER, WRAPPER_STOP, seed, 1, 3, ROWS[3], inventory_type, requested)
        records.append({'window': 'wrapper', 'seed': hex(seed), 'inventory_type': inventory_type,
                        'requested': requested, 'native': native,
                        'port': PORT['wrapper_class'](inventory_type, requested, seed, ROWS[3])})
    for record in records:
        record['matches'] = record['native'] == record['port']
    report = {'executable_sha256': HASH, 'source_sha256': hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
              'port_sha256': hashlib.sha256((HERE / 'evaluate-inventory-class.py').read_bytes()).hexdigest(),
              'windows': {hex(start): {'bytes': len(code), 'sha256': hashlib.sha256(code).hexdigest()}
                          for start, code in windows.items()},
              'cases': len(records), 'mismatches': sum(not r['matches'] for r in records), 'records': records,
              'runtime_verified': False, 'limitations': [
                  'Synthetic manager, row index and table; the row source object is not identified here.',
                  'Wrapper comparison stops before layout and base-stat generation.',
                  'Does not show which class argument each natural caller supplies.',
                  'No game process, save or delivery.']}
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open('x', encoding='utf-8') as stream:
        json.dump(report, stream, indent=2)
    print(json.dumps({key: report[key] for key in ('cases', 'mismatches')}))
    if report['mismatches']:
        raise SystemExit(1)


if __name__ == '__main__':
    main()
