"""Offline port of the build 180383 installed-technology selection (RVA 4cef50).

Given an inventory type, class argument, slot count, wealth row and seed, this
reproduces which technology entries natural inventory generation installs and
in which order. Table data comes from the original technology and procedural
technology binaries; three small literal tables are read from the pinned
executable. A procedural pick becomes an instance: the template entry with the
instance ID and, when an instance model is supplied, the statistics generated
by evaluate-procedural-technology.py; without one the template statistics are
used. No game process or save is accessed.
"""
import argparse
import hashlib
import json
from pathlib import Path
import struct

HASH = '671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4'
MASK32 = (1 << 32) - 1
MULTIPLIER = 0x5A76F899
DRAW_SCALE = struct.unpack('<d', bytes.fromhex('000010000000f03d'))[0]
ENTRY_SIZE, TABLE_START = 0x2e0, 0x30
PROCEDURAL_SIZE, PROCEDURAL_START = 0x290, 0x30
CATEGORY_TYPES_RVA, STAT_CLASSES_RVA, WEALTH_FACTORS_RVA = 0x4a5d414, 0x4a18404, 0x4b2f020
ALWAYS, IMPOSSIBLE = 6, 5
ALWAYS_WEIGHT = struct.unpack('<f', struct.pack('<f', 9999999.0))[0]


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


def file_bytes(raw, rva, size):
    pe = struct.unpack_from('<I', raw, 0x3c)[0]
    count, optional = struct.unpack_from('<H', raw, pe + 6)[0], struct.unpack_from('<H', raw, pe + 20)[0]
    for index in range(count):
        at = pe + 24 + optional + index * 40
        _, address, raw_size, raw_at = struct.unpack_from('<IIII', raw, at + 8)
        if address <= rva and rva + size <= address + raw_size:
            return raw[raw_at + rva - address:raw_at + rva - address + size]
    raise ValueError('Range is not file-backed: ' + hex(rva))


def load_literals(executable):
    raw = Path(executable).read_bytes()
    if len(raw) > 128 * 1024**2 or hashlib.sha256(raw).hexdigest() != HASH:
        raise ValueError('Executable fingerprint mismatch')
    return {'category_types': [struct.unpack('<i', file_bytes(raw, CATEGORY_TYPES_RVA + index * 8, 4))[0]
                               for index in range(18)],
            'stat_classes': [struct.unpack('<i', file_bytes(raw, STAT_CLASSES_RVA + index * 0x18, 4))[0]
                             for index in range(512)],
            'wealth_factors': list(struct.unpack('<4f', file_bytes(raw, WEALTH_FACTORS_RVA, 16)))}


def load_technologies(path, expected):
    data = Path(path).read_bytes()
    if len(data) > 8 * 1024**2 or hashlib.sha256(data).hexdigest() != expected.lower():
        raise ValueError('Technology table fingerprint or byte budget mismatch')
    offset, count = struct.unpack_from('<qI', data, 0x20)
    if 0x20 + offset != TABLE_START:
        raise ValueError('Unexpected technology table header')
    entries = []
    for index in range(count):
        at = TABLE_START + index * ENTRY_SIZE
        relative, items = struct.unpack_from('<qI', data, at + 0x158)
        stats = [struct.unpack_from('<i', data, at + 0x158 + relative + item * 0xc + 8)[0] for item in range(items)]
        entries.append({'index': index, 'id': data[at + 0x108:at + 0x118], 'category': struct.unpack_from('<i', data, at + 0x194)[0],
                        'rarity': struct.unpack_from('<i', data, at + 0x1b0)[0],
                        'level': struct.unpack_from('<i', data, at + 0x1b4)[0],
                        'required': data[at + 0x128:at + 0x138], 'stats': stats,
                        'base_stat': struct.unpack_from('<i', data, at + 0x18c)[0],
                        'template': data[at + 0x2c9] != 0, 'skip_store_requirement': data[at + 0x2cb] != 0})
    return entries


def load_procedural(path, expected):
    data = Path(path).read_bytes()
    if len(data) > 8 * 1024**2 or hashlib.sha256(data).hexdigest() != expected.lower():
        raise ValueError('Procedural table fingerprint or byte budget mismatch')
    offset, count = struct.unpack_from('<qI', data, 0x20)
    if 0x20 + offset != PROCEDURAL_START:
        raise ValueError('Unexpected procedural table header')
    return [{'id': data[at + 0x40:at + 0x50], 'template': data[at + 0x60:at + 0x70], 'skip': data[at + 0x284] != 0}
            for at in (PROCEDURAL_START + index * PROCEDURAL_SIZE for index in range(count))]


def eligible(literals, inventory_type, entry, class_argument):
    """Predicate 4d46d0 for inventory types other than 11."""
    category = entry['category']
    if class_argument != 0xc and category != 0xe:
        if class_argument == 7:
            if category != 0xd:
                return False
        elif class_argument == 9:
            if not 0 <= category - 0xf <= 1:
                return False
        elif class_argument == 10:
            if category & 0xffffffee or category == 1:
                return False
        elif category & 0xffffffef:
            if class_argument != 0 or category != 6:
                return False
    if inventory_type == 0xb:
        raise ValueError('Inventory type 11 depends on a runtime manager field and is not ported')
    return literals['category_types'][category] == inventory_type


def pick_quota(literals, inventory_type, size_argument, slots, wealth_row, seed):
    quotient = int(slots / (5 if inventory_type == 3 else 9))          # truncating signed division
    scaled = float32(float32(quotient) * float32(literals['wealth_factors'][wealth_row]))
    number = int(float32(scaled + (-0.5 if scaled < 0 else 0.5)))      # round half away from zero, then truncate
    minimum = 1
    if size_argument == 9:
        minimum, number = 5, max(9, number)
    number = 1 if number < 2 else 10 if number > 9 else number
    _, draw = advance(seed_state(seed))
    return (((number - minimum) + 1) * draw >> 32) + minimum


def select(literals, technologies, procedural, inventory_type, class_argument, size_argument, slots, wealth_row,
           seed, rarity_weights, progress=100, known=None, special_id=b'SOLAR_SAIL', free_slots=None,
           instance=None):
    """Return installed entries in native order as (id bytes, source) tuples.

    instance(procedural_id_bytes) -> (instance_id_bytes, stat_types) models the generated instance of a
    procedural pick; None keeps the bare procedural ID and the template stat list.
    """
    by_id = {entry['id']: entry for entry in technologies}
    known = {entry['id'] for entry in technologies} if known is None else set(known)
    special = special_id.ljust(16, b'\0')[:16]
    blank = bytes(16)
    candidates = []
    state = seed_state(seed)
    for entry in technologies:
        passes = not entry['template'] and eligible(literals, inventory_type, entry, class_argument)
        if entry['id'] == special:
            if not (class_argument == 8 and inventory_type == 5):
                continue
        elif not passes:
            continue
        state, draw = advance(state)
        candidates.append({'id': entry['id'], 'draw': unit(draw), 'template': entry, 'procedural': False})
    if inventory_type not in (7, 8, 9):
        state = seed_state(seed)
        for item in procedural:
            template = None if item['skip'] else by_id.get(item['template'])
            if template is None or not eligible(literals, inventory_type, template, class_argument):
                continue
            state, draw = advance(state)
            candidates.append({'id': item['id'], 'draw': unit(draw), 'template': template, 'procedural': True})
    quota = pick_quota(literals, inventory_type, size_argument, slots, wealth_row, seed)
    free = slots if free_slots is None else free_slots
    installed, stat_set, count = [], set(), 0
    while True:
        best, chosen = float32(-1.0), None
        if count < quota:
            store_ids = {entry_id for entry_id, _ in installed}
            for position, candidate in enumerate(candidates):
                template = candidate['template']
                weight = float32(float32(rarity_weights[template['rarity']]) * candidate['draw'])
                if template['rarity'] == ALWAYS:
                    weight = ALWAYS_WEIGHT
                elif template['rarity'] == IMPOSSIBLE:
                    weight = float32(-1.0)
                if progress < template['level']:
                    weight = float32(-1.0)
                required = template['required']
                unmet = False
                if required != blank:
                    if required not in known:
                        weight = float32(-1.0)
                    if not template['skip_store_requirement'] and required not in store_ids:
                        weight, unmet = float32(-1.0), True
                if not unmet and weight > 0:
                    penalty = False
                    if candidate['procedural']:
                        penalty = template['base_stat'] not in stat_set
                    else:
                        for stat in template['stats']:
                            stat_class = literals['stat_classes'][stat]
                            if stat == stat_class:
                                penalty = False        # the native loop leaves without applying a penalty
                                break
                            if stat_class not in stat_set:
                                penalty = True
                    if penalty:
                        weight = float32(weight * float32(0.1))
                if best < weight:
                    best, chosen = weight, position
        if chosen is None or best <= 0 or free < 1:
            break
        candidate = candidates.pop(chosen)
        template = candidate['template']
        installed_id, stats = candidate['id'], template['stats']
        if candidate['procedural'] and instance:
            installed_id, stats = instance(candidate['id'])
        stat_set.add(template['base_stat'])
        stat_set.update(stats)
        installed.append((installed_id, 'procedural' if candidate['procedural'] else 'table'))
        free -= 1
        if template['rarity'] != ALWAYS:
            count += 1
        if quota <= count:
            break
    return installed


def instance_model(procedural_port, procedural_entries, curves, seed, boost_chance=0):
    """Instance callback for select(): every procedural pick of one store shares the store-seed number."""
    by_id = {entry['id'].encode('ascii').ljust(16, bytes(1)): entry for entry in procedural_entries}
    number = procedural_port['instance_number'](seed)

    def build(procedural_id):
        entry = by_id[procedural_id]
        name = procedural_port['instance_id'](entry['id'], number).encode('ascii').ljust(16, bytes(1))[:16]
        return name, [stat for stat, _, _ in procedural_port['generate'](entry, number, curves, boost_chance)]
    return build


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for key in ('executable', 'table', 'procedural-table', 'reality-data'):
        parser.add_argument('--' + key, type=Path, required=True)
    parser.add_argument('--reality-data-sha256', required=True)
    parser.add_argument('--boost-chance', type=int, default=0)
    parser.add_argument('--table-sha256', required=True)
    parser.add_argument('--procedural-table-sha256', required=True)
    parser.add_argument('--inventory-type', type=int, required=True)
    parser.add_argument('--class-argument', type=int, default=0)
    parser.add_argument('--size-argument', type=int, default=0)
    parser.add_argument('--slots', type=int, required=True)
    parser.add_argument('--wealth-row', type=int, required=True, choices=range(4))
    parser.add_argument('--seed', action='append', required=True)
    parser.add_argument('--rarity-weights', default='10,50,25,2,1,0,9999999')
    args = parser.parse_args()
    literals = load_literals(args.executable)
    technologies = load_technologies(args.table, args.table_sha256)
    procedural = load_procedural(args.procedural_table, args.procedural_table_sha256)
    weights = [float(value) for value in args.rarity_weights.split(',')]
    import runpy
    procedural_port = runpy.run_path(str(Path(__file__).resolve().parent / 'evaluate-procedural-technology.py'))
    reality = args.reality_data.read_bytes()
    if hashlib.sha256(reality).hexdigest() != args.reality_data_sha256.lower():
        parser.error('Reality data fingerprint mismatch')
    offset = 0x20 + procedural_port['WEIGHTING_CURVES_OFFSET']
    curves = list(reality[offset:offset + 7])
    procedural_entries = procedural_port['load_procedural'](args.procedural_table, args.procedural_table_sha256)
    records = []
    for text in args.seed[:64]:
        seed = int(text, 16)
        model = instance_model(procedural_port, procedural_entries, curves, seed, args.boost_chance)
        installed = select(literals, technologies, procedural, args.inventory_type, args.class_argument,
                           args.size_argument, args.slots, args.wealth_row, seed, weights, instance=model)
        records.append({'seed': '0x%X' % seed,
                        'installed': [entry_id.split(bytes(1))[0].decode() for entry_id, _ in installed]})
    print(json.dumps({'runtime_verified': False, 'records': records,
                      'limitations': ['Runtime inputs (progress, known list, wealth row, boosted-roll percentage) '
                                      'are caller-supplied assumptions.',
                                      'Instance statistics come from the ported generator; names are not generated.']},
                     indent=2))


if __name__ == '__main__':
    main()
