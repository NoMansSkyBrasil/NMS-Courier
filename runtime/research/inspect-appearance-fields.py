"""Inspect bounded palette/seed field evidence from existing converted assets."""
import argparse
import hashlib
import json
from pathlib import Path
import sqlite3
import xml.etree.ElementTree as ET

FIELDS = {'Palette', 'ColourAlt', 'NumColours', 'OverrideAverageColour',
          'Seed', 'HomeSystemSeed', 'ModelSeed', 'ColourSeed', 'Colours',
          'Textures', 'Layers', 'Probability', 'TextureName', 'Filename'}


def inspect(corpus, paths):
    if not 1 <= len(paths) <= 16:
        raise ValueError('Select 1..16 logical assets')
    database = sqlite3.connect((corpus / 'index.sqlite').resolve().as_uri() + '?mode=ro', uri=True)
    records = []
    try:
        for logical in paths:
            rows = database.execute('SELECT archive,path,xml_path FROM files WHERE lower(path)=? LIMIT 17',
                                    (logical.lower().replace('\\', '/'),)).fetchall()
            if len(rows) > 16:
                raise ValueError('Duplicate asset budget exceeded')
            if not rows:
                records.append({'logical_path': logical, 'status': 'not_indexed'})
            for archive, path, xml in rows:
                record = {'archive': archive, 'logical_path': path}
                records.append(record)
                if not xml:
                    record['status'] = 'xml_unavailable'
                    continue
                source = Path(xml).resolve()
                if not source.is_relative_to(corpus.resolve()) or source.stat().st_size > 8 * 1024 * 1024:
                    raise ValueError('XML containment/size budget exceeded')
                data = source.read_bytes()
                if b'<!DOCTYPE' in data or b'<!ENTITY' in data:
                    raise ValueError('XML entity declarations are unsupported')
                root = ET.fromstring(data)
                values, counts = {}, {}
                for element in root.iter():
                    name = element.get('name', '')
                    if name in FIELDS or 'Seed' in name:
                        counts[name] = counts.get(name, 0) + 1
                        samples = values.setdefault(name, [])
                        value = element.get('value', '')
                        if value not in samples and len(samples) < 16:
                            samples.append(value[:512])
                record.update(status='inspected_fields', template=root.get('template'),
                              xml_sha256=hashlib.sha256(data).hexdigest(), counts=counts,
                              bounded_values=values)
    finally:
        database.close()
    return {'mode': 'offline_appearance_fields', 'runtime_verified': False,
            'color_algorithm_verified': False, 'assets': records}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--corpus', type=Path, required=True)
    parser.add_argument('--asset', action='append', required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    corpus, output = args.corpus.resolve(), args.output.resolve()
    if output.exists() or output.is_relative_to(corpus) or output.is_relative_to(Path(__file__).resolve().parents[2]):
        parser.error('Output must be new and outside corpus/repository')
    report = inspect(corpus, args.asset)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(report, indent=2), encoding='utf-8')
    print(json.dumps({'assets': len(report['assets']), 'statuses': [a['status'] for a in report['assets']]}))


if __name__ == '__main__':
    main()
