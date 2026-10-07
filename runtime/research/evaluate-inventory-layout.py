"""Offline port of natural inventory slot counts and grid size in build 180383 (RVA 4ce530, 4ce630).

For an inventory type, a size type and a store seed this reproduces the slot
count the layout step draws and the grid width and height it selects. Ranges
come from the original inventory table binary. With --executable and the
emulator folders the port is compared with the original instructions. Which
individual grid positions are valid (routine 4cfe20) is not ported. No game
process or save is accessed.
"""
import argparse
import hashlib
import itertools
import json
from pathlib import Path
import struct
import sys

HASH = '671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4'
MASK32 = (1 << 32) - 1
MULTIPLIER = 0x5A76F899
TABLE_START, ENTRIES, ENTRY_SIZE, SIZE_TYPES = 0x20, 0x5e0, 0x54, 44
# Inventory types whose store is a technology grid (bit mask 0x92a in both routines).
TECHNOLOGY_TYPES = (1, 3, 5, 8, 11)
CARGO_TYPES = (6, 9)
BASE = 0x140000000
COUNT_ROUTINE, GRID_ROUTINE, END = 0x4ce530, 0x4ce630, 0x4ce70e


def load_entries(path, expected):
    """Raw 0x54-byte generation entries, one per size type, as tuples of 21 signed integers."""
    data = Path(path).read_bytes()
    if len(data) > 4 * 1024**2 or hashlib.sha256(data).hexdigest() != expected.lower():
        raise ValueError('Inventory table fingerprint or byte budget mismatch')
    first = TABLE_START + ENTRIES
    return [struct.unpack_from('<21i', data, first + index * ENTRY_SIZE) for index in range(SIZE_TYPES)], data


def seed_state(seed, enabled=True):
    if not enabled:
        return 1, 0
    low = seed & MASK32
    return low or 1, (((low >> 16) | (low << 16)) & MASK32) ^ (seed >> 32) ^ low


def layout(entry, inventory_type, seed, enabled=True):
    """(slot count, width, height) as the two routines store them (sixteen-bit fields)."""
    field = lambda offset: entry[offset // 4]
    if inventory_type in TECHNOLOGY_TYPES:
        upper, lower = field(0x44), field(0x50)
    elif inventory_type in CARGO_TYPES:
        upper, lower = field(0x38), field(0x48)
    else:
        upper, lower = field(0x40), field(0x4c)
    low, carry = seed_state(seed, enabled)
    draw = (low * MULTIPLIER + carry) & MASK32            # the routine keeps only the low word of the product
    span = (upper - lower + 1) & ((1 << 64) - 1) if upper - lower + 1 < 0 else upper - lower + 1
    count = (((span * draw) >> 32) + lower) & 0xffff
    count = count - 0x10000 if count & 0x8000 else count
    bounds = 0x18 if inventory_type in TECHNOLOGY_TYPES else 0
    # Fields of one bounds block: three heights at +0, +4, +8 and three widths at +0xc, +0x10, +0x14.
    if count <= field(bounds + 0x10) * field(bounds + 4):
        width, height = field(bounds + 0x10), field(bounds + 4)
    elif count <= field(bounds + 0x14) * field(bounds + 8):
        width, height = field(bounds + 0x14), field(bounds + 8)
    else:
        width, height = field(bounds + 0xc), field(bounds)
    return count, width & 0xffff, height & 0xffff


def compare(args, entries, table):
    raw = args.executable.read_bytes()
    if len(raw) > 128 * 1024**2 or hashlib.sha256(raw).hexdigest() != HASH:
        raise ValueError('Executable fingerprint mismatch')
    sys.path[:0] = [str(args.python_tools), str(args.emulator_tools)]
    import unicorn
    from unicorn import x86_const as regs
    pe = struct.unpack_from('<I', raw, 0x3c)[0]
    count, optional = struct.unpack_from('<H', raw, pe + 6)[0], struct.unpack_from('<H', raw, pe + 20)[0]
    code = None
    for index in range(count):
        _, address, raw_size, raw_at = struct.unpack_from('<IIII', raw, pe + 24 + optional + index * 40 + 8)
        if address <= COUNT_ROUTINE < address + raw_size:
            code = raw[raw_at + COUNT_ROUTINE - address:raw_at + END - address]
    machine = unicorn.Uc(unicorn.UC_ARCH_X86, unicorn.UC_MODE_64)
    machine.mem_map(BASE + (COUNT_ROUTINE & ~0xfff), 0x2000)
    machine.mem_write(BASE + COUNT_ROUTINE, code)
    store, data, stack, done = 0x40000000, 0x41000000, 0x42000000, 0x43000000
    for address in (store, data, stack, done):
        machine.mem_map(address, 0x10000)
    machine.mem_write(data, table[TABLE_START + ENTRIES:TABLE_START + ENTRIES + SIZE_TYPES * ENTRY_SIZE])
    seeds = [0, 1, 7, 0xffffffff, 0x100000000, 0x8000000080000000, 0xdeadbeefcafef00d, 0xffffffffffffffff,
             0xA547AB958C97E439, 0x8C968767B3282F13]
    value = 0x9E3779B97F4A7C15
    for _ in range(args.seed_range):
        value = (value * 0xD1342543DE82EF95 + 0x2545F4914F6CDD1D) & (1 << 64) - 1
        seeds.append(value)
    cases = mismatches = 0
    examples = []
    for size_type, inventory_type, seed, enabled in itertools.product(range(SIZE_TYPES), range(13), seeds, (1, 0)):
        if not enabled and seed not in seeds[:3]:
            continue
        machine.mem_write(store, bytes(0x200))
        machine.mem_write(store + 0xe0, struct.pack('<QB', seed, enabled))
        for routine in (COUNT_ROUTINE, GRID_ROUTINE):
            machine.mem_write(stack + 0x8000, struct.pack('<Q', done))
            machine.reg_write(regs.UC_X86_REG_RSP, stack + 0x8000)
            machine.reg_write(regs.UC_X86_REG_RCX, store)
            machine.reg_write(regs.UC_X86_REG_RDX, data + size_type * ENTRY_SIZE)
            machine.reg_write(regs.UC_X86_REG_R8, inventory_type)
            machine.emu_start(BASE + routine, done, count=2000)
        native = struct.unpack('<hHH', machine.mem_read(store + 0x84, 2) + machine.mem_read(store + 0x80, 4))
        port = layout(entries[size_type], inventory_type, seed, bool(enabled))
        cases += 1
        if native != port:
            mismatches += 1
            if len(examples) < 20:
                examples.append({'size_type': size_type, 'inventory_type': inventory_type, 'seed': hex(seed),
                                 'enabled': enabled, 'native': native, 'port': port})
    return {'cases': cases, 'mismatches': mismatches, 'examples': examples,
            'window': {'start': hex(COUNT_ROUTINE), 'bytes': len(code), 'sha256': hashlib.sha256(code).hexdigest()}}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--table', type=Path, required=True, help='Original inventorytable binary')
    parser.add_argument('--table-sha256', required=True)
    parser.add_argument('--inventory-type', type=int, default=4)
    parser.add_argument('--size-type', type=int, default=0, help='Size type index')
    parser.add_argument('--seed', action='append', default=[], help='Hex store seed; maximum 64')
    for key in ('executable', 'python-tools', 'emulator-tools'):
        parser.add_argument('--' + key, type=Path, help='With all three: compare the port with original code')
    parser.add_argument('--seed-range', type=int, default=64)
    args = parser.parse_args()
    entries, table = load_entries(args.table, args.table_sha256)
    report = {'runtime_verified': False,
              'records': [{'seed': '0x%X' % int(text, 16),
                           'layout': dict(zip(('slots', 'width', 'height'),
                                              layout(entries[args.size_type], args.inventory_type, int(text, 16))))}
                          for text in args.seed[:64]],
              'limitations': ['Valid grid positions (routine 4cfe20) are not ported.',
                              'The seed and size type passed by natural callers are inputs.']}
    if args.executable and args.python_tools and args.emulator_tools:
        report['comparison'] = compare(args, entries, table)
    print(json.dumps(report, indent=2))
    if report.get('comparison', {}).get('mismatches'):
        raise SystemExit(1)


if __name__ == '__main__':
    main()
