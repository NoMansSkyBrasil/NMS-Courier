"""Index priority entity choices and texture bindings from the existing corpus.

Declarative catalog only: resource labels are research classifications, not
runtime spawn types. Preserve guards, archive ambiguity and native weight clues.
No extraction, process access, seed search, rendering or save writes.
"""
import argparse
from collections import Counter
import hashlib
import json
from pathlib import Path
import runpy
import sqlite3
import xml.etree.ElementTree as ET

D = runpy.run_path(str(Path(__file__).with_name('inspect-procedural-descriptors.py')))
T = runpy.run_path(str(Path(__file__).with_name('inspect-texture-palettes.py')))
P = runpy.run_path(str(Path(__file__).with_name('procedural-seed-primitives.py')))
MODEL_FAMILIES = {
    'fighters': 'ship/fighter', 'dropships': 'ship/hauler',
    'scientific': 'ship/explorer', 'shuttle': 'ship/shuttle',
    's-class': 'ship/exotic-and-living', 'sailship': 'ship/solar',
    'sentinelship': 'ship/interceptor', 'industrial': 'freighter',
}


def category(path):
    if path.startswith('models/common/weapons/multitool/'):
        return 'multitool'
    prefix = 'models/common/spacecraft/'
    return MODEL_FAMILIES.get(path[len(prefix):].split('/')[0]) if path.startswith(prefix) else None


def descriptor_record(root, path):
    groups = D['descriptor_groups'](root)
    for group in groups:
        for option in group['options']:
            option['default_name_weight_candidate'] = P['option_weight'](option['name'])
    return {'resource': path, 'category': category(path), 'groups': groups,
            'group_count': len(groups), 'option_count': sum(len(g['options']) for g in groups)}


def build(corpus):
    corpus = corpus.resolve()
    db = sqlite3.connect((corpus / 'index.sqlite').as_uri() + '?mode=ro', uri=True)
    descriptors, scenes, textures, total = [], [], [], 0
    try:
        rows = db.execute("SELECT path,archive,xml_path,content_hash FROM files WHERE "
                          "(path LIKE 'models/common/spacecraft/%.descriptor.mbin' OR "
                          "path LIKE 'models/common/weapons/multitool/%.descriptor.mbin') "
                          "ORDER BY path,archive LIMIT 513").fetchall()
        if len(rows) > 512:
            raise ValueError('Descriptor query row budget exceeded')
        counts = Counter(r[0] for r in rows)
        for path, archive, xml, digest in rows:
            if not category(path):
                continue
            record = {'resource': path, 'category': category(path), 'archive': archive,
                      'binary_sha256': digest}
            descriptors.append(record)
            if counts[path] != 1 or not xml:
                record['status'] = 'ambiguous_source' if counts[path] != 1 else 'not_converted'
                continue
            source = Path(xml).resolve()
            binary = source.with_suffix('.MBIN')
            if any(not p.is_relative_to(corpus) for p in (source, binary)):
                raise ValueError('Source escaped corpus')
            sizes = source.stat().st_size, binary.stat().st_size
            total += sum(sizes)
            if max(sizes) > 8*1024*1024 or total > 64*1024*1024:
                raise ValueError('Descriptor byte budget exceeded')
            raw = source.read_bytes()
            if b'<!DOCTYPE' in raw or b'<!ENTITY' in raw:
                raise ValueError('XML entity declarations are unsupported')
            if hashlib.sha256(binary.read_bytes()).hexdigest() != digest:
                raise ValueError('Descriptor source fingerprint mismatch')
            root = ET.fromstring(raw)
            if root.get('template') != 'cTkModelDescriptorList':
                record['status'] = 'unsupported_schema'
                continue
            record.update(descriptor_record(root, path), status='indexed_choices',
                          xml_sha256=hashlib.sha256(raw).hexdigest())
        # Shallow scenes include fixed models as well as procedural roots. Do
        # not infer a spawn category or require a descriptor for fixed assets.
        for prefix in [f'models/common/spacecraft/{k}/' for k in MODEL_FAMILIES] + ['models/common/weapons/multitool/']:
            candidates = db.execute('SELECT path,archive,content_hash FROM files WHERE path LIKE ? '
                                    'ORDER BY path,archive LIMIT 2049', (prefix+'%.scene.mbin',)).fetchall()
            if len(candidates) > 2048:
                raise ValueError('Scene metadata row budget exceeded')
            for path, archive, digest in candidates:
                if '/' in path[len(prefix):]:
                    continue
                sibling = path.replace('.scene.', '.descriptor.', 1)
                scenes.append({'resource': path, 'category': category(path), 'archive': archive,
                               'binary_sha256': digest, 'descriptor_candidate': sibling,
                               'descriptor_indexed': any(d['resource'] == sibling for d in descriptors),
                               'role': 'shallow_scene_candidate_not_verified_spawn_root'})
        paths = db.execute("SELECT path FROM files WHERE path LIKE 'textures/common/spacecraft/%.texture.mbin' "
                           "OR path LIKE 'textures/common/weapons/%.texture.mbin' ORDER BY path LIMIT 257").fetchall()
        if len(paths) > 256:
            raise ValueError('Texture metadata row budget exceeded')
        # Exclude frigates from this priority pass. Shared paths remain shared;
        # filename resemblance is not a proven model-to-material association.
        assets = list(dict.fromkeys(r[0] for r in paths if '/frigates/' not in r[0]))
        for begin in range(0, len(assets), 16):
            batch = T['inspect'](corpus, assets[begin:begin+16])
            total += batch['bytes_read']
            if total > 64*1024*1024:
                raise ValueError('Catalog total byte budget exceeded')
            for source in batch['sources']:
                source['association'] = 'texture_resource_only_requires_scene_material_edges'
                source['decal_path_hint'] = any(word in source['resource'] for word in ('decal', 'logo', 'stripe', 'pattern'))
                textures.append(source)
    finally:
        db.close()
    totals = []
    for name in sorted({d['category'] for d in descriptors} | {s['category'] for s in scenes}):
        selected = [d for d in descriptors if d['category'] == name]
        totals.append({'category': name, 'descriptor_sources': len(selected),
                       'indexed': sum(d['status'] == 'indexed_choices' for d in selected),
                       'groups': sum(d.get('group_count', 0) for d in selected),
                       'options': sum(d.get('option_count', 0) for d in selected),
                       'shallow_scenes': sum(s['category'] == name for s in scenes)})
    return {'mode': 'declarative_priority_appearance_catalog', 'runtime_verified': False,
            'appearance_evaluator_complete': False, 'bytes_read': total,
            'categories': totals, 'descriptors': descriptors, 'scenes': scenes, 'textures': textures,
            'limitations': ['Catalog contains declared alternatives, not seed-selected or reachable combinations.',
                            'Ancestor guards are local to each descriptor; reference paths retain cross-resource dependencies.',
                            'Name weights describe the recovered default branch; Chance is retained separately.',
                            'Shared textures require proven material edges; decal path hints are not selection semantics.',
                            'Shallow scenes include fixed, legacy and support assets; role is not inferred.',
                            'No native pixels, complete appearance inverse, class/slots or delivery claim.']}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--corpus', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    corpus, output = args.corpus.resolve(), args.output.resolve()
    if output.exists() or any(output.is_relative_to(p) for p in (corpus, Path(__file__).resolve().parents[2])):
        parser.error('Output must be new and outside corpus/repository')
    report = build(corpus)
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open('x', encoding='utf-8') as stream:
        json.dump(report, stream, indent=2)
    print(json.dumps({'categories': report['categories'], 'texture_sources': len(report['textures']),
                      'bytes_read': report['bytes_read'], 'output': str(output)}))


if __name__ == '__main__':
    main()
