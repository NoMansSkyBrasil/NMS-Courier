"""Offline inventory profile of one entity seed in build 180383: class, technologies and base stats.

Combines the separately compared ports (class draw, installed-technology
selection with procedural instances, base stats) in the order the game's
generation wrapper (RVA 4ccfa0) uses them, every step restarting from the same
seed. The size type decides the class row through the jump table of RVA
4d47f0, which is decoded from the pinned executable. The slot count is the
natural layout draw unless overridden. No game process is accessed.
"""
import argparse
import hashlib
import json
from pathlib import Path
import runpy
import struct
import xml.etree.ElementTree as ET

HERE = Path(__file__).resolve().parent
HASH = '671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4'
MAP_ROUTINE, MAP_LIMIT, MAP_BYTES, MAP_TARGETS = 0x4d47f0, 0x2b, 0x4d4880, 0x4d4854
DEFAULT_CLASS_ARGUMENT = 0xc
REQUEST_NATURAL = 4


def class_argument_table(raw, file_bytes):
    """Size type index -> class argument, decoded from the jump table of 4d47f0."""
    result = []
    for size_type in range(MAP_LIMIT + 1):
        case = file_bytes(raw, MAP_BYTES + size_type, 1)[0]
        target = struct.unpack('<I', file_bytes(raw, MAP_TARGETS + case * 4, 4))[0]
        code = file_bytes(raw, target, 6)
        if code[0] == 0xb8 and code[5] == 0xc3:            # mov eax, imm32; ret
            result.append(struct.unpack('<I', code[1:5])[0])
        elif code[:3] == bytes.fromhex('33c0c3'):          # xor eax, eax; ret
            result.append(0)
        else:
            raise ValueError('Unexpected size-type case at %x' % target)
    return result


def size_type_names(table_xml):
    root = ET.parse(table_xml).getroot()
    for node in root.iter('Property'):
        if node.get('name') == 'GenerationDataPerSizeType':
            return [item.get('name') for item in node]
    raise ValueError('Size type list not found')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for key in ('executable', 'inventory-table', 'inventory-table-xml', 'technology-table', 'procedural-table',
                'reality-data'):
        parser.add_argument('--' + key, type=Path, required=True)
    for key in ('inventory-table-sha256', 'inventory-table-xml-sha256', 'technology-table-sha256',
                'procedural-table-sha256', 'reality-data-sha256'):
        parser.add_argument('--' + key, required=True)
    parser.add_argument('--inventory-type', type=int, required=True,
                        help='Store type: 3 multitool, 4 ship main, 5 ship technology, 7/8/9 freighter stores')
    parser.add_argument('--size-type', required=True, help='Size type name such as FgtMedium or WeaponSmall')
    parser.add_argument('--weapon-class', type=int, default=0, help='Weapon class row for multitools (9 is staff)')
    parser.add_argument('--slots', type=int, help='Override the slot count; default is the natural layout draw')
    parser.add_argument('--wealth-row', type=int, required=True, choices=range(4))
    parser.add_argument('--requested-class', type=int, default=REQUEST_NATURAL, choices=range(5),
                        help='0..3 forces C/B/A/S; 4 asks for the natural draw')
    parser.add_argument('--boost-chance', type=int, default=0)
    parser.add_argument('--seed', action='append', required=True, help='Hex entity seed; maximum 64')
    args = parser.parse_args()

    classes = runpy.run_path(str(HERE / 'evaluate-inventory-class.py'))
    technology = runpy.run_path(str(HERE / 'evaluate-default-technology.py'))
    procedural = runpy.run_path(str(HERE / 'evaluate-procedural-technology.py'))
    stats = runpy.run_path(str(HERE / 'evaluate-base-stats.py'))
    grids = runpy.run_path(str(HERE / 'evaluate-inventory-layout.py'))
    raw = args.executable.read_bytes()
    if len(raw) > 128 * 1024**2 or hashlib.sha256(raw).hexdigest() != HASH:
        parser.error('Executable fingerprint mismatch')
    mapping = class_argument_table(raw, technology['file_bytes'])
    names = size_type_names(args.inventory_table_xml)
    if args.size_type not in names:
        parser.error('Unknown size type; known: ' + ', '.join(names))
    size_index = names.index(args.size_type)
    class_argument = mapping[size_index] if size_index <= MAP_LIMIT else DEFAULT_CLASS_ARGUMENT

    weights = classes['read_rows'](args.inventory_table_xml,
                                   args.inventory_table_xml_sha256)[classes['ROWS'][args.wealth_row]]
    literals = technology['load_literals'](args.executable)
    entries = technology['load_technologies'](args.technology_table, args.technology_table_sha256)
    templates = technology['load_procedural'](args.procedural_table, args.procedural_table_sha256)
    generated = procedural['load_procedural'](args.procedural_table, args.procedural_table_sha256)
    reality = args.reality_data.read_bytes()
    if hashlib.sha256(reality).hexdigest() != args.reality_data_sha256.lower():
        parser.error('Reality data fingerprint mismatch')
    first = 0x20 + procedural['WEIGHTING_CURVES_OFFSET']
    curves = list(reality[first:first + 7])
    rows = stats['load_table'](args.inventory_table, args.inventory_table_sha256)
    rarity = [10.0, 50.0, 25.0, 2.0, 1.0, 0.0, 9999999.0]
    shapes, _ = grids['load_entries'](args.inventory_table, args.inventory_table_sha256)

    records = []
    for text in args.seed[:64]:
        seed = int(text, 16)
        class_index = classes['wrapper_class'](args.inventory_type, args.requested_class, seed, weights)
        slots, width, height = grids['layout'](shapes[size_index], args.inventory_type, seed)
        if args.slots is not None:
            slots = args.slots
        model = technology['instance_model'](procedural, generated, curves, seed, args.boost_chance)
        installed = technology['select'](literals, entries, templates, args.inventory_type, class_argument,
                                         args.weapon_class, slots, args.wealth_row, seed, rarity,
                                         instance=model)
        base = stats['base_stats'](rows, args.inventory_type, class_index, class_argument, args.weapon_class, seed)
        records.append({'seed': '0x%X' % seed, 'class': classes['CLASSES'][class_index],
                        'slots': slots, 'grid': [width, height],
                        'technologies': [name.split(bytes(1))[0].decode() for name, _ in installed],
                        'base_stats': {name: value for name, value in base}})
    print(json.dumps({'runtime_verified': False, 'size_type': args.size_type, 'size_type_index': size_index,
                      'class_argument': class_argument,
                      'size_type_class_arguments': dict(zip(names, mapping)), 'records': records,
                      'limitations': ['Wealth row, weapon class, progress and known technologies are caller inputs; valid grid '
                                      'positions and special slots are not evaluated.',
                                      'Rarity weights are the table values recorded in the technology note.',
                                      'Agreement is with emulated original routines, not with a running game.']},
                     indent=2))


if __name__ == '__main__':
    main()
