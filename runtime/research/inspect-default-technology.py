"""List technologies that natural inventory generation can draw, by category.

Reads the already converted technology table and English localisation files of
the existing corpus, read-only. A technology is a *candidate* when its Rarity is
not Impossible and it is not a template; whether a given entity receives it is
decided by the seeded native routine (build 180383 RVA 4cef50), which this tool
does not reproduce. Output is a declarative catalog, not a loadout predictor.
"""
import argparse
import hashlib
import json
from pathlib import Path
import re
import sqlite3
import xml.etree.ElementTree as ElementTree

TABLE = 'metadata/reality/tables/nms_reality_gctechnologytable.mbin'
FIELDS = ('ID', 'Name', 'Category', 'Rarity', 'Core', 'Upgrade', 'Procedural', 'IsTemplate',
          'PrimaryItem', 'Level', 'RequiredTech', 'RequiredLevel', 'TechShopRarity')


def value(entry, name):
    for child in entry:
        if child.get('name') == name:
            nested = list(child)
            if nested and (child.get('value') or '').startswith('Gc'):
                return nested[0].get('value')
            return child.get('value')
    return None


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--corpus', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    output = args.output.resolve()
    if output.exists() or output.is_relative_to(Path(__file__).resolve().parents[2]):
        parser.error('Require a new output outside the repository')
    index = sqlite3.connect((args.corpus / 'index.sqlite').resolve().as_uri() + '?mode=ro', uri=True)
    row = index.execute('SELECT archive, content_hash, xml_path FROM files WHERE path = ?', (TABLE,)).fetchall()
    if len(row) != 1:
        parser.error('Expected exactly one technology table source')
    archive, content_hash, xml_path = row[0]
    data = Path(xml_path).read_bytes()
    if len(data) > 32 * 1024**2:
        parser.error('Technology table byte budget exceeded')
    root = ElementTree.fromstring(data)
    table = next(node for node in root.iter('Property') if node.get('name') == 'Table')
    entries = [{field: value(entry, field) for field in FIELDS} for entry in table]
    wanted = {entry['Name'] for entry in entries if entry['Name']}
    names, language_sources = {}, []
    for path, language_xml in index.execute(
            "SELECT path, xml_path FROM files WHERE path LIKE 'language/%english.mbin' "
            "AND path NOT LIKE '%usenglish%' ORDER BY path LIMIT 64"):
        text = Path(language_xml).read_text(encoding='utf-8')
        language_sources.append(path)
        for match in re.finditer(r'name="Id" value="([^"]+)"\s*/>\s*<Property name="English" value="([^"]*)"', text):
            if match.group(1) in wanted:
                names.setdefault(match.group(1), match.group(2))
    categories = {}
    for entry in entries:
        entry['english_name'] = names.get(entry['Name'])
        entry['natural_candidate'] = entry['Rarity'] != 'Impossible' and entry['IsTemplate'] != 'true'
        bucket = categories.setdefault(entry['Category'], {'total': 0, 'candidates': []})
        bucket['total'] += 1
        if entry['natural_candidate']:
            bucket['candidates'].append({key: entry[key] for key in
                                         ('ID', 'english_name', 'Rarity', 'Core', 'Upgrade', 'Level', 'RequiredTech')})
    report = {'source': {'path': TABLE, 'archive': archive, 'content_hash': content_hash,
                         'converted_sha256': hashlib.sha256(data).hexdigest()},
              'language_sources': language_sources, 'entries': len(entries),
              'unresolved_names': sorted(name for name in wanted if name not in names)[:200],
              'categories': categories, 'runtime_verified': False,
              'limitations': ['Declarative table reading; the seeded selection, its rarity weights, '
                              'count, dependency and progress conditions are native and not evaluated here.',
                              'Procedural upgrade table entries drawn for non-freighter stores are not listed.',
                              'Corpus belongs to build 180383.']}
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open('x', encoding='utf-8') as stream:
        json.dump(report, stream, indent=2)
    for category, bucket in sorted(categories.items()):
        print(category, bucket['total'], [(c['ID'], c['english_name'], c['Rarity']) for c in bucket['candidates']])


if __name__ == '__main__':
    main()
