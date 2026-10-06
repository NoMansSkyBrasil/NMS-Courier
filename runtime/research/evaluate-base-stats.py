"""Offline port of inventory base-stat generation in build 180383 (RVA 4cea20, 4ce9b0).

Given an inventory type, a class (C/B/A/S), the ship or weapon class row and a
store seed, this reproduces the base statistics (for example SHIP_DAMAGE,
WEAPON_SCAN, FREI_HYPERDRIVE) natural generation stores. Ranges come from the
original inventory table binary. No game process or save is accessed.
"""
import argparse
import hashlib
import json
from pathlib import Path
import struct

MASK32 = (1 << 32) - 1
MULTIPLIER = 0x5A76F899
DRAW_SCALE = struct.unpack('<d', bytes.fromhex('000010000000f03d'))[0]
TABLE_START, ROW_SIZE, ROWS, ENTRY_SIZE = 0x20, 0x40, 23, 0x20
# Row order read from the table: ship class rows 0..11, weapon class rows 12..21, vehicle row 22.
SHIP_ROWS = ('Freighter', 'Dropship', 'Fighter', 'Scientific', 'Shuttle', 'PlayerFreighter', 'Royal', 'Alien',
             'Sail', 'Robot', 'Corvette', 'Unused11')
WEAPON_ROWS = ('Pistol', 'Rifle', 'Pristine', 'Alien', 'Royal', 'Robot', 'Atlas', 'AtlasYellow', 'AtlasBlue', 'Staff')
CLASSES = 'CBAS'


def float32(value):
    return struct.unpack('<f', struct.pack('<f', value))[0]


def seed_state(seed, enabled=True):
    if not enabled:
        return 1, 0
    low = seed & MASK32
    return low or 1, (((low >> 16) | (low << 16)) & MASK32) ^ (seed >> 32) ^ low


def advance(state):
    product = state[0] * MULTIPLIER + state[1]
    return (product & MASK32, product >> 32), product & MASK32


def load_table(path, expected):
    """rows[row][class] -> list of (id, max, max_alternate, min, min_alternate)."""
    data = Path(path).read_bytes()
    if len(data) > 4 * 1024**2 or hashlib.sha256(data).hexdigest() != expected.lower():
        raise ValueError('Inventory table fingerprint or byte budget mismatch')
    rows = []
    for row in range(ROWS):
        cells = []
        for column in range(4):
            at = TABLE_START + row * ROW_SIZE + column * 16
            relative, count = struct.unpack_from('<qI', data, at)
            if count > 64 or not 0 <= at + relative <= len(data) - count * ENTRY_SIZE:
                raise ValueError('Unexpected base-stat row layout')
            entries = []
            for index in range(count):
                name, *values = struct.unpack_from('<16s4f', data, at + relative + index * ENTRY_SIZE)
                entries.append((name.split(bytes(1))[0].decode('ascii'), *values))
            cells.append(entries)
        rows.append(cells)
    return rows


def row_index(inventory_type, ship_class, weapon_class):
    """Table row chosen by 4ce9b0, or None when the routine generates nothing."""
    if 4 <= inventory_type <= 9:
        return None if ship_class == 12 else ship_class
    if inventory_type == 3:
        return None if weapon_class == 10 else weapon_class + 12
    if inventory_type in (10, 11):
        return 22
    return None


def base_stats(rows, inventory_type, class_index, ship_class, weapon_class, seed, enabled=True,
               primary_ranges=True, minimum=False):
    """Generated (stat id, value) pairs in table order.

    primary_ranges mirrors a runtime byte (RVA 525d35b): set selects the Min/Max pair, clear selects the
    second pair, which is zero for every entry of the examined table. minimum is the caller flag that
    stores the lower bound instead of the drawn value.
    """
    row = row_index(inventory_type, ship_class, weapon_class)
    if row is None or not 0 <= row < len(rows):
        return []
    state = seed_state(seed, enabled)
    result = []
    for name, upper, upper_alternate, lower, lower_alternate in rows[row][class_index]:
        state, draw = advance(state)
        high, low = (upper, lower) if primary_ranges else (upper_alternate, lower_alternate)
        value = float32(float32(float32(draw * DRAW_SCALE) * float32(high - low)) + low)
        result.append((name, low if minimum else value))
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--table', type=Path, required=True, help='Original inventorytable binary')
    parser.add_argument('--table-sha256', required=True)
    parser.add_argument('--inventory-type', type=int, required=True)
    parser.add_argument('--class', dest='class_name', choices=CLASSES, required=True)
    parser.add_argument('--ship-class', type=int, default=0, help='Row for inventory types 4 to 9')
    parser.add_argument('--weapon-class', type=int, default=0, help='Row offset for inventory type 3')
    parser.add_argument('--seed', action='append', required=True, help='Hex store seed; maximum 64')
    args = parser.parse_args()
    rows = load_table(args.table, args.table_sha256)
    records = [{'seed': '0x%X' % int(text, 16),
                'stats': dict(base_stats(rows, args.inventory_type, CLASSES.index(args.class_name), args.ship_class,
                                         args.weapon_class, int(text, 16)))} for text in args.seed[:64]]
    print(json.dumps({'runtime_verified': False, 'records': records,
                      'limitations': ['The range-pair byte is a runtime value; the primary pair is assumed.',
                                      'Which store seed and class each natural caller passes is not established here.',
                                      'Displayed bonuses apply further rules that are not ported.']}, indent=2))


if __name__ == '__main__':
    main()
