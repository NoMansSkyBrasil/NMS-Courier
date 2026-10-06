"""Offline port of the build 180383 seed-to-inventory-class draw at RVA 4cfd10.

One multiply-with-carry draw from the supplied 64-bit seed is normalized to
float32 and compared with cumulative class weights of one probability row.
The row index is a runtime solar-system value which this module never reads;
callers must supply the row. Explicit class arguments, fixed-class ship types
and the type filter in wrapper 4ccfa0 are caller behavior, described separately
by `wrapper_class`. No native code, game process or save is accessed.
"""
import argparse
import hashlib
import json
from pathlib import Path
import struct
import xml.etree.ElementTree as ElementTree

MASK32 = (1 << 32) - 1
MASK64 = (1 << 64) - 1
MULTIPLIER = 0x5A76F899
# File-backed literals: double at RVA 4b251f8 and float32 at RVA 4b243a0.
DRAW_SCALE = struct.unpack('<d', bytes.fromhex('000010000000f03d'))[0]
WEIGHT_SCALE = struct.unpack('<f', bytes.fromhex('0ad7233c'))[0]
CLASSES = ('C', 'B', 'A', 'S')
ROWS = ('Poor', 'Average', 'Wealthy', 'Pirate')
UNSPECIFIED = 4
# Inventory type arguments for which 4ccfa0 keeps the generated class.
GENERATED_CLASS_TYPES = (3, 4, 7)


def float32(value):
    return struct.unpack('<f', struct.pack('<f', value))[0]


def seed_state(seed, enabled=True):
    if not 0 <= seed <= MASK64:
        raise ValueError('Seed must fit an unsigned 64-bit integer')
    if not enabled:
        return 1, 0
    low = seed & MASK32
    rotated = ((low >> 16) | (low << 16)) & MASK32
    return low or 1, rotated ^ (seed >> 32) ^ low


def class_draw(seed, enabled=True):
    """Return the first uint32 draw and its float32 normalization."""
    low, carry = seed_state(seed, enabled)
    draw = (low * MULTIPLIER + carry) & MASK32
    return draw, float32(draw * DRAW_SCALE)


def thresholds(weights):
    """Cumulative float32 sums in native operation order."""
    if len(weights) != 4:
        raise ValueError('Expected four class weights')
    total, result = float32(0.0), []
    for weight in weights:
        total = float32(total + float32(float32(weight) * WEIGHT_SCALE))
        result.append(total)
    return result


def class_from_seed(seed, weights, enabled=True):
    """Class index 0..3; the native default of 0 remains when no sum reaches the draw."""
    _, value = class_draw(seed, enabled)
    for index, total in enumerate(thresholds(weights)):
        if total >= value:
            return index
    return 0


def wrapper_class(inventory_type, requested_class, seed, weights, enabled=True):
    """Class stored by wrapper 4ccfa0 before layout and base-stat generation."""
    if requested_class != UNSPECIFIED:
        return requested_class
    if inventory_type in GENERATED_CLASS_TYPES:
        return class_from_seed(seed, weights, enabled)
    return 0


def first_draw_above(limit):
    """Smallest draw whose float32 normalization exceeds limit; 2**32 if none."""
    low, high = 0, MASK32 + 1
    while low < high:
        middle = (low + high) // 2
        if float32(middle * DRAW_SCALE) > limit:
            high = middle
        else:
            low = middle + 1
    return low


def draw_interval(weights, class_index):
    """Inclusive uint32 draw bounds matched at class_index, or None if unreachable."""
    sums = thresholds(weights)
    begin = 0 if class_index == 0 else first_draw_above(max(sums[:class_index]))
    end = first_draw_above(sums[class_index]) - 1
    return (begin, end) if begin <= end else None


def default_interval(weights):
    """Draws above every cumulative sum; the native result stays class 0."""
    begin = first_draw_above(max(thresholds(weights)))
    return (begin, MASK32) if begin <= MASK32 else None


def seed_for_draw(low_word, draw):
    """The unique enabled seed with this low word whose first draw equals draw."""
    if not 0 <= low_word <= MASK32 or not 0 <= draw <= MASK32:
        raise ValueError('Words must fit uint32')
    rotated = ((low_word >> 16) | (low_word << 16)) & MASK32
    carry = (draw - (low_word or 1) * MULTIPLIER) & MASK32
    return ((carry ^ rotated ^ low_word) << 32) | low_word


def high_words_for_class(low_word, weights, class_index):
    """Count and bounds of seed high words giving class_index for a fixed low word.

    The draw is linear in the initial carry, so the matching high words are an
    exact XOR image of one contiguous draw interval. Class 0 also receives the
    draws above every cumulative sum; that tail is reported separately.
    """
    intervals = [draw_interval(weights, class_index)]
    if class_index == 0:
        intervals.append(default_interval(weights))
    result = []
    for interval in intervals:
        if interval is None:
            continue
        result.append({'draw_begin': interval[0], 'draw_end': interval[1],
                       'count': interval[1] - interval[0] + 1,
                       'first_seed': hex(seed_for_draw(low_word, interval[0]))})
    return result


def read_rows(path, expected_sha256):
    """Read the four ClassProbabilityData rows from a hash-pinned converted table."""
    data = Path(path).read_bytes()
    if len(data) > 8 * 1024**2 or hashlib.sha256(data).hexdigest() != expected_sha256.lower():
        raise ValueError('Inventory table fingerprint or byte budget mismatch')
    root = ElementTree.fromstring(data)
    block = next(node for node in root.iter('Property') if node.get('name') == 'ClassProbabilityData')
    rows = {}
    for row in block:
        values = {leaf.get('name'): float(leaf.get('value')) for leaf in row.iter('Property')
                  if leaf.get('name') in CLASSES}
        rows[row.get('name')] = [values[name] for name in CLASSES]
    if tuple(rows) != ROWS:
        raise ValueError('Unexpected probability row order')
    return rows


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--table', type=Path, required=True, help='Converted INVENTORYTABLE MXML')
    parser.add_argument('--table-sha256', required=True)
    parser.add_argument('--seed', action='append', default=[], help='Hex seed; maximum 64')
    parser.add_argument('--low-word', action='append', default=[],
                        help='Hex low word for which high-word solutions are counted; maximum 16')
    parser.add_argument('--disabled-seed', action='store_true', help='Evaluate the invalid-seed state (1, 0)')
    args = parser.parse_args()
    if not 1 <= len(args.seed) + len(args.low_word) <= 64 or len(args.low_word) > 16:
        parser.error('Select 1..64 seeds/low words, at most 16 low words')
    rows = read_rows(args.table, args.table_sha256)
    report = {'source_rva': '4cfd10', 'executable_build': 180383, 'runtime_verified': False,
              'rows': {name: {'weights': weights, 'cumulative_float32': thresholds(weights),
                              'draw_intervals': {CLASSES[i]: draw_interval(weights, i) for i in range(4)},
                              'default_class_c_interval': default_interval(weights)}
                       for name, weights in rows.items()}, 'seeds': [], 'low_words': [],
              'limitations': ['The probability row is a runtime solar-system value supplied by the caller.',
                              'Explicit class arguments and fixed-class ship types bypass this draw.',
                              'The seed source of each natural caller is a separate association.']}
    for text in args.seed:
        seed = int(text, 16)
        draw, value = class_draw(seed, not args.disabled_seed)
        report['seeds'].append({'seed': hex(seed), 'draw': draw, 'normalized_float32': value,
                                'class_by_row': {name: CLASSES[class_from_seed(seed, weights, not args.disabled_seed)]
                                                 for name, weights in rows.items()}})
    for text in args.low_word:
        low_word = int(text, 16)
        report['low_words'].append({'low_word': hex(low_word), 'solutions': {
            name: {CLASSES[i]: high_words_for_class(low_word, weights, i) for i in range(4)}
            for name, weights in rows.items()}})
    print(json.dumps(report, indent=2))


if __name__ == '__main__':
    main()
