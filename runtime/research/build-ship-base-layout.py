"""Turn a corvette export into a ship-base layout in the game's own metadata form.

Reads the object list of a `.nmsship` archive (member objects.json) or of the
JSON variant (key Objects) and writes a cGcPersistentBase document in the
converter's XML form, with the structure of the shipped
METADATA/SIMULATION/SHIPBASES/DEFAULTSHIPBASE layout. The shipped layout's
connector entries can be kept in front of the export's objects. The output is
research input for the metadata compiler; it must be new and outside the
repository, and the export itself is never copied into the repository. No
game process or save is accessed.
"""
import argparse
import hashlib
import json
from pathlib import Path
import xml.etree.ElementTree as ET
import zipfile

MAX_OBJECTS = 4096


def read_objects(path):
    if zipfile.is_zipfile(path):
        with zipfile.ZipFile(path) as archive:
            data = json.loads(archive.read('objects.json').decode('utf-8-sig'))
    else:
        data = json.loads(Path(path).read_text(encoding='utf-8-sig'))
        data = data['Objects'] if isinstance(data, dict) else data
    if not isinstance(data, list) or not 1 <= len(data) <= MAX_OBJECTS:
        raise ValueError('Expected 1..%d objects' % MAX_OBJECTS)
    return data


def vector(parent, name, values):
    node = ET.SubElement(parent, 'Property', name=name)
    for axis, value in zip('XYZ', values):
        ET.SubElement(node, 'Property', name=axis, value='%.6f' % float(value))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--export', type=Path, required=True, help='.nmsship archive or its JSON variant')
    parser.add_argument('--template', type=Path, required=True,
                        help='Converted shipped layout (DEFAULTSHIPBASE in the converter XML form)')
    parser.add_argument('--keep-connectors', action='store_true',
                        help='Keep the template entries with ID BIGGSCONNECTOR in front of the export objects')
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    output = args.output.resolve()
    if output.exists() or output.is_relative_to(Path(__file__).resolve().parents[2]):
        parser.error('Require a new output outside the repository')
    objects = read_objects(args.export)
    tree = ET.parse(args.template)
    root = tree.getroot()
    if root.get('template') != 'cGcPersistentBase':
        parser.error('Template is not a persistent base document')
    holder = next(node for node in root if node.get('name') == 'Objects')
    kept = [node for node in holder
            if args.keep_connectors and any(child.get('name') == 'ObjectID' and child.get('value') == 'BIGGSCONNECTOR'
                                            for child in node)]
    for node in list(holder):
        holder.remove(node)
    for node in kept:
        holder.append(node)
    for item in objects:
        identity = str(item['ObjectID']).lstrip('^')
        if not identity.isascii() or not identity.replace('_', '').isalnum() or len(identity) > 15:
            raise ValueError('Unexpected object ID: ' + identity[:32])
        entry = ET.SubElement(holder, 'Property', name='Objects', value='GcPersistentBaseEntry')
        ET.SubElement(entry, 'Property', name='Timestamp', value=str(int(item.get('Timestamp', 0))))
        ET.SubElement(entry, 'Property', name='ObjectID', value=identity)
        ET.SubElement(entry, 'Property', name='UserData', value=str(int(item.get('UserData', 0))))
        vector(entry, 'Position', item['Position'])
        vector(entry, 'Up', item['Up'])
        vector(entry, 'At', item['At'])
        ET.SubElement(entry, 'Property', name='Message', value='')
    for index, node in enumerate(holder):
        node.set('_index', str(index))
    ET.indent(tree, '\t')
    output.parent.mkdir(parents=True, exist_ok=True)
    tree.write(output, encoding='utf-8', xml_declaration=True)
    print(json.dumps({'objects_from_export': len(objects), 'connectors_kept': len(kept),
                      'entries_written': len(holder), 'export_sha256': hashlib.sha256(args.export.read_bytes()).hexdigest(),
                      'output_sha256': hashlib.sha256(output.read_bytes()).hexdigest()}))


if __name__ == '__main__':
    main()
