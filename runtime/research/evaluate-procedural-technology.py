"""Offline port of procedural upgrade statistics in build 180383 (RVA ec1a10, ec1e60).

A procedural technology instance is named '<first nine ID characters>#<number>'.
The number comes from one draw of the owning store seed; the instance's
statistics come from a second stream seeded only by that number. This module
ports the number, the stream initialization, the stat count, the stat order
and each stat value. Instance naming, descriptions, colours and the template
fields copied into the instance are not ported. No game process is accessed.
"""
import argparse
import hashlib
import json
from pathlib import Path
import struct

MASK32 = (1 << 32) - 1
MULTIPLIER = 0x5A76F899
DRAW_SCALE = struct.unpack('<d', bytes.fromhex('000010000000f03d'))[0]
PROCEDURAL_SIZE, PROCEDURAL_START = 0x290, 0x30
# Curve bytes of DefaultReality.WeightingCurves in enum order (struct offset 85d2).
WEIGHTING_CURVES_OFFSET = 0x85d2
LINEAR, IN_QUAD, OUT_QUAD, IN_QUART, OUT_QUART, IN_EXPO, OUT_EXPO = 0x00, 0x10, 0x11, 0x13, 0x14, 0x19, 0x1a
# Qualities for which one extra draw decides the boosted-roll flag.
BOOSTED_QUALITIES = (4, 5, 6)


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


def unit(draw):
    return float32(draw * DRAW_SCALE)


def instance_number(store_seed, enabled=True):
    """Number appended to the procedural ID: one draw scaled to 0..99999."""
    _, draw = advance(seed_state(store_seed, enabled))
    return draw * 100000 >> 32


def instance_id(procedural_id, number):
    """'%.9s#%05u', upper-cased and cut to fifteen characters as the native routine does."""
    return ('%.9s#%05u' % (procedural_id, number)).upper()[:15]


def stream_state(number):
    """State of the statistics stream for an instance number (ec1f9b..ec1fe0)."""
    value = (((number ^ 0x3d0000) >> 16) ^ number) & MASK32
    value = (value * 9) & MASK32
    value = ((value >> 4) ^ value) & MASK32
    value = (value * 0x1b873593) & MASK32
    value = ((value >> 15) ^ value) & MASK32
    return (value or 1), (((value >> 16) | (value << 16)) & MASK32) ^ value


def curve(kind, value, power=None):
    """Curve kinds used by DefaultReality.WeightingCurves (cases of RVA 2d6b820); float32 in and out.

    power(base, exponent) stands for the imported single-precision power function; the default rounds
    the double-precision result, which may differ from the C runtime in the last bit.
    """
    power = power or (lambda base, exponent: float32(base ** exponent))
    if kind == LINEAR:
        return value
    if kind == IN_QUAD:
        return float32(value * value)
    if kind == OUT_QUAD:
        return float32(-float32(float32(value - 2.0) * value))
    if kind == IN_QUART:
        return float32(value * float32(float32(value * value) * value))
    if kind == OUT_QUART:
        inverse = float32(value - 1.0)
        cubed = float32(float32(inverse * inverse) * inverse)
        return float32(float32(cubed * float32(1.0 - value)) + 1.0)
    if kind == IN_EXPO:
        return value if value == 0.0 else power(2.0, float32(float32(value - 1.0) * 10.0))
    if kind == OUT_EXPO:
        return value if value == 1.0 else float32(1.0 - power(2.0, float32(value * -10.0)))
    raise ValueError('Curve kind %#x is not ported' % kind)


def load_procedural(path, expected):
    data = Path(path).read_bytes()
    if len(data) > 8 * 1024**2 or hashlib.sha256(data).hexdigest() != expected.lower():
        raise ValueError('Procedural table fingerprint or byte budget mismatch')
    offset, count = struct.unpack_from('<qI', data, 0x20)
    if 0x20 + offset != PROCEDURAL_START:
        raise ValueError('Unexpected procedural table header')
    entries = []
    for index in range(count):
        at = PROCEDURAL_START + index * PROCEDURAL_SIZE
        relative, items = struct.unpack_from('<qI', data, at + 0x50)
        levels = []
        for item in range(items):
            stat, maximum, minimum, weighting, always = struct.unpack_from('<iffiB', data, at + 0x50 + relative + item * 0x14)
            levels.append({'stat': stat, 'max': maximum, 'min': minimum, 'weighting': weighting, 'always': bool(always)})
        entries.append({'index': index, 'id': data[at + 0x40:at + 0x50].split(b'\0')[0].decode('ascii'),
                        'template': data[at + 0x60:at + 0x70].split(b'\0')[0].decode('ascii'),
                        'quality': struct.unpack_from('<i', data, at + 0x7c)[0],
                        'stats_max': struct.unpack_from('<i', data, at + 0x74)[0],
                        'stats_min': struct.unpack_from('<i', data, at + 0x78)[0],
                        'weighting': struct.unpack_from('<i', data, at + 0x80)[0],
                        'skip': data[at + 0x284] != 0, 'levels': levels})
    return entries


def generate(entry, number, curves, boost_chance=0, forced=False, power=None):
    """Statistics of one instance: list of (stat, value, level) in native order.

    curves: the seven curve-kind bytes in WeightingCurves order. boost_chance: the runtime percentage
    compared with the extra draw for boosted qualities. forced: the caller flag (or the debug global)
    that replaces every draw-dependent factor by constants.
    """
    state = stream_state(number)
    boosted = False
    if entry['quality'] in BOOSTED_QUALITIES:
        state, draw = advance(state)
        boosted = (draw * 100 >> 32) < boost_chance
    state, draw = advance(state)
    factor = curve(curves[entry['weighting']], unit(draw), power)
    if forced or boosted:
        factor = float32(1.0)
    minimum, maximum = float32(entry['stats_min']), float32(entry['stats_max'])
    wanted = float32(float32(float32(maximum - minimum) * factor) + minimum)
    wanted = int(float32(wanted + (-0.5 if wanted < 0 else 0.5)))
    always = [level for level in entry['levels'] if level['always']]
    optional = [level for level in entry['levels'] if not level['always']]
    for position in range(len(optional) - 1, 0, -1):
        state, draw = advance(state)
        other = draw * (position + 1) >> 32
        optional[position], optional[other] = optional[other], optional[position]
    ordered = always + optional
    count = min(4, len(ordered), wanted + len(always))
    result = []
    for level in ordered[:max(count, 0)]:
        state, draw = advance(state)
        value = curve(curves[level['weighting']], unit(draw), power)
        if forced:
            value = float32(0.0) if level['weighting'] >= 4 else float32(1.0)
        elif boosted:
            state, draw = advance(state)
            if level['weighting'] > 4:
                value = float32(float32(unit(draw) * float32(0.14)) + float32(0.01))
            else:
                value = float32(float32(unit(draw) * float32(0.14999998)) + float32(0.85))
        amount = float32(float32(float32(level['max'] - level['min']) * value) + level['min'])
        result.append((level['stat'], amount, entry['quality'] + 1))
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--procedural-table', type=Path, required=True)
    parser.add_argument('--procedural-table-sha256', required=True)
    parser.add_argument('--reality-data', type=Path, required=True, help='Original defaultreality binary')
    parser.add_argument('--reality-data-sha256', required=True)
    parser.add_argument('--id', action='append', required=True, help='Procedural technology ID; maximum 32')
    parser.add_argument('--store-seed', action='append', default=[], help='Hex store seed; maximum 64')
    parser.add_argument('--number', action='append', type=int, default=[], help='Instance number; maximum 64')
    parser.add_argument('--boost-chance', type=int, default=0)
    args = parser.parse_args()
    reality = args.reality_data.read_bytes()
    if hashlib.sha256(reality).hexdigest() != args.reality_data_sha256.lower():
        parser.error('Reality data fingerprint mismatch')
    curves = list(reality[0x20 + WEIGHTING_CURVES_OFFSET:0x20 + WEIGHTING_CURVES_OFFSET + 7])
    entries = {entry['id']: entry for entry in load_procedural(args.procedural_table, args.procedural_table_sha256)}
    numbers = [(None, number) for number in args.number[:64]]
    numbers += [(int(text, 16), instance_number(int(text, 16))) for text in args.store_seed[:64]]
    records = []
    for name in args.id[:32]:
        entry = entries[name]
        for store_seed, number in numbers:
            records.append({'id': instance_id(name, number), 'store_seed': store_seed and '0x%X' % store_seed,
                            'quality': entry['quality'],
                            'stats': [{'stat': stat, 'value': value, 'level': level}
                                      for stat, value, level in generate(entry, number, curves, args.boost_chance)]})
    print(json.dumps({'runtime_verified': False, 'curves': curves, 'records': records,
                      'limitations': ['Names, descriptions and copied template fields are not generated.',
                                      'The boosted-roll percentage is a runtime value supplied by the caller.',
                                      'The exponential curves use a double-precision power rounded to float32.']}, indent=2))


if __name__ == '__main__':
    main()
