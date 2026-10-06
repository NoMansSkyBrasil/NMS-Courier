"""Compare the base-stat port with original pinned build 180383 instructions.

Routine 4cea20 and its row selector 4ce9b0 run under Unicorn with the original
inventory table bytes relocated into private memory and a synthetic manager,
store and seed. Two unrelated callees are no-op boundaries and the store has
room for every element, so the vector growth helper is never reached. No game
process is involved.
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
PORT = runpy.run_path(str(HERE / 'evaluate-base-stats.py'))
HASH = '671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4'
BASE = 0x140000000
SELECTOR, ROUTINE, ROUTINE_END = 0x4ce9b0, 0x4cea20, 0x4ceca0
STUBS = (0x2d6b670, 0x1b07e90)
GROW = 0x2bf5930
MANAGER_POINTER, LITERAL, RANGE_FLAG = 0x6e89688, 0x4b251f8, 0x525d35b
MANAGER, TABLE, STORE, SEED, STACK, RETURN = 0x40000000, 0x42000000, 0x43000000, 0x44000000, 0x45000000, 0x46000000
SEEDS = (0, 1, 7, 0xffffffff, 0x100000000, 0x8000000080000000, 0xdeadbeefcafef00d, 0x123456789abcdef0,
         0xffffffffffffffff, 0x00000001ffffffff, 0x5a76f89900000000, 0x8C968767B3282F13)


def sections(raw):
    pe = struct.unpack_from('<I', raw, 0x3c)[0]
    count, optional = struct.unpack_from('<H', raw, pe + 6)[0], struct.unpack_from('<H', raw, pe + 20)[0]
    for index in range(count):
        at = pe + 24 + optional + index * 40
        _, address, raw_size, raw_at = struct.unpack_from('<IIII', raw, at + 8)
        yield address, raw_at, raw_size


def file_bytes(raw, rva, size):
    for address, raw_at, raw_size in sections(raw):
        if address <= rva and rva + size <= address + raw_size:
            return raw[raw_at + rva - address:raw_at + rva - address + size]
    raise ValueError('Range is not file-backed: ' + hex(rva))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for key in ('executable', 'table', 'python-tools', 'emulator-tools', 'output'):
        parser.add_argument('--' + key, type=Path, required=True)
    parser.add_argument('--table-sha256', required=True)
    parser.add_argument('--seed-range', type=int, default=0, help='Extra seeds from a fixed 64-bit mixing sequence')
    args = parser.parse_args()
    exe, output = args.executable.resolve(), args.output.resolve()
    if output.exists() or any(output.is_relative_to(p) for p in (exe.parent.parent, HERE.parents[1])):
        parser.error('Require a new external output')
    raw = exe.read_bytes()
    if len(raw) > 128 * 1024**2 or hashlib.sha256(raw).hexdigest() != HASH:
        parser.error('Executable fingerprint mismatch')
    rows = PORT['load_table'](args.table, args.table_sha256)
    table = args.table.read_bytes()
    sys.path[:0] = [str(args.python_tools), str(args.emulator_tools)]
    import unicorn
    from unicorn import x86_const as regs
    if unicorn.__version__ != '2.1.4':
        parser.error('Requires private Unicorn 2.1.4')
    seeds = list(SEEDS)
    value = 0x9E3779B97F4A7C15
    for _ in range(min(args.seed_range, 4096)):
        value = (value * 0xD1342543DE82EF95 + 0x2545F4914F6CDD1D) & (1 << 64) - 1
        seeds.append(value)

    machine = unicorn.Uc(unicorn.UC_ARCH_X86, unicorn.UC_MODE_64)
    page = lambda address: address & ~0xfff
    code = file_bytes(raw, SELECTOR, ROUTINE_END - SELECTOR)
    machine.mem_map(BASE + page(SELECTOR), 0x2000)
    machine.mem_write(BASE + SELECTOR, code)
    for stub in STUBS + (GROW,):
        machine.mem_map(BASE + page(stub), 0x1000)
        machine.mem_write(BASE + stub, b'\xc3')
    for address, data in ((LITERAL, file_bytes(raw, LITERAL, 8)), (MANAGER_POINTER, struct.pack('<Q', MANAGER)),
                          (RANGE_FLAG, b'\x01')):
        machine.mem_map(BASE + page(address), 0x1000)
        machine.mem_write(BASE + address, data)
    for address in (MANAGER, TABLE, STORE, SEED, STACK, RETURN):
        machine.mem_map(address, 0x20000)
    machine.mem_write(MANAGER + 0x218, struct.pack('<Q', TABLE))
    # The loaded table holds absolute pointers where the file holds self-relative offsets.
    machine.mem_write(TABLE, table[PORT['TABLE_START']:])
    for row, column in itertools.product(range(PORT['ROWS']), range(4)):
        at = row * PORT['ROW_SIZE'] + column * 16
        relative, count = struct.unpack_from('<qI', table, PORT['TABLE_START'] + at)
        machine.mem_write(TABLE + at, struct.pack('<QI', TABLE + at + relative if count else 0, count))
    state = {'grown': False}
    machine.hook_add(unicorn.UC_HOOK_CODE, lambda *_: state.update(grown=True), begin=BASE + GROW, end=BASE + GROW)

    def run(inventory_type, class_index, ship_class, weapon_class, seed, enabled, primary, minimum):
        machine.mem_write(BASE + RANGE_FLAG, bytes([primary]))
        machine.mem_write(STORE, bytes(0x4000))
        machine.mem_write(STORE + 0xd0, struct.pack('<IIQ', 64, 3, STORE + 0x1000))   # stale count is reset
        machine.mem_write(SEED, struct.pack('<QB', seed, enabled))
        stack = STACK + 0x10000
        machine.mem_write(stack, struct.pack('<Q', RETURN))
        machine.mem_write(stack + 0x28, struct.pack('<QQQQ', ship_class, weapon_class, 0, minimum))
        machine.reg_write(regs.UC_X86_REG_RSP, stack)
        machine.reg_write(regs.UC_X86_REG_RCX, STORE)
        machine.reg_write(regs.UC_X86_REG_RDX, inventory_type)
        machine.reg_write(regs.UC_X86_REG_R8, SEED)
        machine.reg_write(regs.UC_X86_REG_R9, class_index)
        machine.emu_start(BASE + ROUTINE, RETURN, count=100000)
        count = struct.unpack('<I', machine.mem_read(STORE + 0xd4, 4))[0]
        if PORT['row_index'](inventory_type, ship_class, weapon_class) is None and count == 3:
            return []          # no row: the routine returns before touching the store (stale count kept)
        result = []
        for index in range(min(count, 64)):
            name, bits = struct.unpack('<16sI', machine.mem_read(STORE + 0x1000 + index * 0x18, 20))
            result.append((name.split(bytes(1))[0].decode('ascii', 'replace'), bits))
        return result

    bits = lambda number: struct.unpack('<I', struct.pack('<f', number))[0]
    cases = [(5, ship, 0) for ship in range(13)] + [(3, 0, weapon) for weapon in range(11)]
    cases += [(8, 0, 0), (7, 0, 0), (9, 5, 0), (4, 2, 0), (6, 1, 0), (10, 0, 0), (11, 0, 0), (0, 0, 0), (2, 0, 0), (12, 0, 0)]
    records, mismatches = [], 0
    for (inventory_type, ship_class, weapon_class), class_index, seed in itertools.product(cases, range(4), seeds):
        variants = ((1, 1, 0),) if seed not in SEEDS[:4] else ((1, 1, 0), (0, 1, 0), (1, 0, 0), (1, 1, 1))
        for enabled, primary, minimum in variants:
            native = run(inventory_type, class_index, ship_class, weapon_class, seed, enabled, primary, minimum)
            port = [(name, bits(number)) for name, number in PORT['base_stats'](
                rows, inventory_type, class_index, ship_class, weapon_class, seed, bool(enabled), bool(primary),
                bool(minimum))]
            matches = native == port
            mismatches += not matches
            if not matches or len(records) < 400:
                records.append({'inventory_type': inventory_type, 'ship_class': ship_class,
                                'weapon_class': weapon_class, 'class': class_index, 'seed': hex(seed),
                                'enabled': enabled, 'primary_ranges': primary, 'minimum': minimum,
                                'native': native, 'port': port, 'matches': matches})
    total = sum(1 if seed not in SEEDS[:4] else 4 for _ in cases for _ in range(4) for seed in seeds)
    report = {'executable_sha256': HASH, 'table_sha256': args.table_sha256.lower(),
              'source_sha256': hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
              'port_sha256': hashlib.sha256((HERE / 'evaluate-base-stats.py').read_bytes()).hexdigest(),
              'window': {'start': hex(SELECTOR), 'bytes': len(code), 'sha256': hashlib.sha256(code).hexdigest()},
              'cases': total, 'mismatches': mismatches, 'growth_helper_reached': state['grown'],
              'records_kept': len(records), 'records': records, 'runtime_verified': False,
              'limitations': ['Synthetic manager, store and seed; values are compared as float32 bit patterns.',
                              'The range-pair byte is set by hand; its runtime value is not established.',
                              'Caller arguments of natural generation are not established here.',
                              'No game process, save or delivery.']}
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open('x', encoding='utf-8') as stream:
        json.dump(report, stream, indent=2)
    print(json.dumps({key: report[key] for key in ('cases', 'mismatches', 'growth_helper_reached')}))
    if mismatches:
        raise SystemExit(1)


if __name__ == '__main__':
    main()
