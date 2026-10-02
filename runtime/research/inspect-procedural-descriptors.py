"""Map conditional procedural choices from already converted game assets, offline."""
import argparse
import hashlib
import json
from pathlib import Path
import sqlite3
import xml.etree.ElementTree as ET


def named(element, name):
    return next((child for child in element if child.get('name') == name), None)


def value(element, name):
    child = named(element, name)
    return child.get('value', '') if child is not None else ''


def descriptor_groups(root):
    """Keep ancestor choices; flattened option lists lose branch dependencies."""
    groups = []

    def walk(element, guards, position):
        if len(groups) >= 4096:
            raise ValueError('Descriptor group budget exceeded')
        if element.get('value') == 'TkResourceDescriptorList':
            key = position
            alternatives = named(element, 'Descriptors')
            options = []
            group = {'key': key, 'type_id': value(element, 'TypeId'),
                     'requires': guards, 'options': options}
            groups.append(group)
            if alternatives is not None:
                for index, option in enumerate(alternatives):
                    identity = value(option, 'Id')
                    paths = named(option, 'ReferencePaths')
                    options.append({'id': identity, 'name': value(option, 'Name'),
                                    'chance_raw': value(option, 'Chance'),
                                    'reference_paths': [p.get('value', '') for p in paths] if paths is not None else []})
                    children = named(option, 'Children')
                    if children is not None:
                        walk(children, guards + [{'group': key, 'option': identity}],
                             f'{position}/option-{index}')
            return
        for index, child in enumerate(element):
            walk(child, guards, f'{position}/{index}')

    walk(root, [], 'root')
    return groups


def inspect(corpus, models):
    db = sqlite3.connect((corpus / 'index.sqlite').resolve().as_uri() + '?mode=ro', uri=True)
    assets = []
    try:
        for model in models:
            rows = db.execute('SELECT archive,path,xml_path FROM files WHERE lower(path)=? LIMIT 17',
                              (model.lower().replace('\\', '/'),)).fetchall()
            if len(rows) > 16:
                raise ValueError('Duplicate asset budget exceeded; select an archive explicitly')
            if not rows:
                assets.append({'logical_path': model, 'status': 'not_indexed'})
            for archive, logical, xml in rows:
                record = {'archive': archive, 'logical_path': logical}
                if not xml:
                    record['status'] = 'not_converted'
                else:
                    path = Path(xml).resolve()
                    if not path.is_relative_to(corpus.resolve()) or path.stat().st_size > 8*1024*1024:
                        raise ValueError('XML exceeds corpus boundary or size budget')
                    raw = path.read_bytes()
                    if b'<!DOCTYPE' in raw or b'<!ENTITY' in raw:
                        raise ValueError('External XML declarations are unsupported')
                    root = ET.fromstring(raw)
                    record.update(status='indexed_choices', xml_sha256=hashlib.sha256(raw).hexdigest(),
                                  template=root.get('template'), groups=descriptor_groups(root))
                assets.append(record)
    finally:
        db.close()
    return {'mode': 'offline_descriptor_metadata', 'seed_evaluator_implemented': False,
            'runtime_verified': False, 'assets': assets,
            'limitations': ['Chance values are retained without inferred probability semantics.',
                            'Referenced scenes are not recursively expanded.',
                            'No PRNG, seed inversion, class, color or location inference.']}


def match_constraints(groups, required):
    """Validate unique option matches and their ancestor choices, not seed reachability."""
    selections, missing, ambiguous, conflicts, matches = {}, [], [], [], []
    for identity in required:
        hits = [g for g in groups if any(o['id'] == identity for o in g['options'])]
        if not hits:
            missing.append(identity)
            continue
        if len(hits) != 1:
            ambiguous.append(identity)
            continue
        group = hits[0]
        matches.append({'id': identity, 'group': group['key'], 'requires': group['requires']})
        for selection in group['requires'] + [{'group': group['key'], 'option': identity}]:
            key, option = selection['group'], selection['option']
            if key in selections and selections[key] != option:
                conflicts.append({'group': key, 'options': [selections[key], option]})
            selections[key] = option
    return {'status': 'incompatible' if missing or conflicts else 'ambiguous' if ambiguous else 'compatible_descriptor_branches',
            'matches': matches, 'missing': missing, 'ambiguous': ambiguous, 'conflicts': conflicts,
            'seed_reachability_verified': False}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--corpus', type=Path, required=True)
    inputs = parser.add_mutually_exclusive_group(required=True)
    inputs.add_argument('--model', action='append',
                        help='Exact logical descriptor MBIN path; maximum 16')
    inputs.add_argument('--models-file', type=Path,
                        help='JSON array of exact logical descriptor paths; maximum 16')
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--constraints', type=Path, help='Optional JSON with required_descriptor_ids')
    args = parser.parse_args()
    if args.models_file:
        if args.models_file.stat().st_size > 32768:
            parser.error('Model manifest size budget exceeded')
        args.model = json.loads(args.models_file.read_text(encoding='utf-8'))
        if not isinstance(args.model, list) or any(not isinstance(p, str) or not 1 <= len(p) <= 512 for p in args.model):
            parser.error('Model manifest must contain bounded path strings')
    if not 1 <= len(args.model) <= 16:
        parser.error('Select 1..16 descriptor assets')
    corpus = args.corpus.resolve()
    output = args.output.resolve()
    repo = Path(__file__).resolve().parents[2]
    if output.is_relative_to(corpus) or output.is_relative_to(repo) or output.exists():
        parser.error('Output must be new and outside the corpus and repository')
    report = inspect(corpus, args.model)
    if args.constraints:
        if args.constraints.stat().st_size > 128*1024:
            parser.error('Constraint file size budget exceeded')
        required = json.loads(args.constraints.read_text(encoding='utf-8'))['required_descriptor_ids']
        if not isinstance(required, list) or len(required) > 128 or any(not isinstance(v, str) or len(v) > 128 for v in required):
            parser.error('Require at most 128 bounded string identifiers')
        for asset in report['assets']:
            if 'groups' in asset:
                asset['constraints'] = match_constraints(asset['groups'], required)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(report, indent=2), encoding='utf-8')
    print(json.dumps({'assets': len(report['assets']), 'groups': sum(len(a.get('groups', [])) for a in report['assets']),
                      'options': sum(len(g['options']) for a in report['assets'] for g in a.get('groups', [])),
                      'output': str(output), 'seed_evaluator_implemented': False}))


if __name__ == '__main__':
    main()
