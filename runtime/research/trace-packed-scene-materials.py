"""Join descriptor IDs and packed scene material order for an explicit context.

This offline trace uses converted corpus XML and audited default loader rules.
It does not reproduce asynchronous acquisition, geometry, cache variants or
unknown factories. Unsupported inputs fail closed instead of yielding success.
"""
import argparse
import hashlib
import json
import math
from pathlib import Path
import runpy
import sqlite3
import struct
import xml.etree.ElementTree as ET

HERE = Path(__file__).resolve().parent
DESCRIPTORS = runpy.run_path(str(HERE / 'evaluate-descriptor-seed.py'))
CONTEXTS = runpy.run_path(str(HERE / 'emulate-packed-material-context.py'))
ALTID = runpy.run_path(str(HERE / 'emulate-reference-altid.py'))


def properties(element):
    return {child.get('name'): child for child in element if child.tag == 'Property'}


def value(element, name, default=None):
    item = properties(element).get(name)
    return default if item is None else item.get('value', default)


def canonical(path):
    if not path.isascii() or not 1 <= len(path) <= 255 or '\0' in path:
        raise ValueError('Resource name outside audited ASCII scope')
    result = path.replace('\\', '/').lower()
    if '//' in result:
        raise ValueError('Repeated separators require the unported native filename normalizer')
    if not result.startswith('models/') or '..' in result.split('/'):
        raise ValueError('Unsupported model resource name')
    return result


class SceneTrace:
    def __init__(self, corpus, context_index, flags, sources=None):
        self.corpus = corpus.resolve()
        self.database = sqlite3.connect((self.corpus / 'index.sqlite').as_uri() + '?mode=ro', uri=True)
        self.context_index, self.flags = context_index, flags
        self.assets, self.requests, self.materials = {}, [], []
        self.visits, self.xml_bytes = 0, 0
        if sources is None:
            rows = self.database.execute("SELECT path,archive,xml_path FROM files WHERE lower(path) LIKE 'models/%.scene.mbin' OR lower(path) LIKE 'models/%.material.mbin' LIMIT 65537").fetchall()
            if len(rows) > 65536:
                self.database.close()
                raise ValueError('Scene source metadata budget exceeded')
            sources = {}
            for path, archive, xml in rows:
                sources.setdefault(path.lower(), []).append((archive, xml))
        self.sources = sources

    def load(self, logical):
        logical = canonical(logical)
        if logical in self.assets:
            return self.assets[logical]['xml']
        if len(self.assets) >= 256:
            raise ValueError('Scene asset budget exceeded')
        rows = self.sources.get(logical, ())
        if len(rows) != 1 or not rows[0][1]:
            raise ValueError('Missing, ambiguous or unconverted scene resource: ' + logical)
        source = Path(rows[0][1]).resolve()
        size = source.stat().st_size
        if not source.is_relative_to(self.corpus) or size > 8 * 1024**2 or self.xml_bytes + size > 64 * 1024**2:
            raise ValueError('Scene XML containment/byte budget exceeded')
        data = source.read_bytes(); self.xml_bytes += size
        if b'<!DOCTYPE' in data or b'<!ENTITY' in data:
            raise ValueError('XML entities are unsupported')
        root = ET.fromstring(data)
        self.assets[logical] = {'xml': root, 'archive': rows[0][0], 'sha256': hashlib.sha256(data).hexdigest()}
        return root

    def material(self, path, context, owner, flags=None):
        flags = self.flags if flags is None else flags
        logical = canonical(path)
        root = self.load(logical)
        if root.get('template') != 'cTkMaterialData':
            raise ValueError('Unexpected material template: ' + logical)
        handle = None
        for index, old in enumerate(self.materials):
            if old['resource'] == logical and CONTEXTS['context_equal'](old['context'], context, bool((old['flags'] | flags) & 0x4000000)):
                handle = index + 1
                break
        if handle is None:
            self.materials.append({'resource': logical, 'context': context, 'flags': flags})
            handle = len(self.materials)
        self.requests.append({'resource': logical, 'owner': owner, 'flags': flags, 'fixture_handle': handle})
        return handle

    def visit(self, node, context, scene_path, chain=(), depth=0):
        self.visits += 1
        if depth > 64 or self.visits > 32768:
            raise ValueError('Packed scene depth/node budget exceeded')
        props = properties(node)
        name, kind = value(node, 'Name', ''), value(node, 'Type', '')
        mask = int(value(node, 'PlatformExclusion', '0'), 0)
        if mask & (1 << self.context_index):
            return []
        ids = context[0]
        processed_name = name
        position = name.find('LOD')
        if position >= 0 and len(name) - position == 4 and name[-1] in '0123456789':
            processed_name = name[:position]
        inherited = bool(ids) and kind in ('MESH', 'REFERENCE', 'LOCATOR', 'INSTANCEMODEL')
        if inherited and not DESCRIPTORS['loaded_node_included'](processed_name, ids):
            return []
        transform = props.get('Transform')
        if transform is None:
            raise ValueError('Missing packed transform')
        scales = [struct.unpack('<f', struct.pack('<f', float(value(transform, 'Scale' + axis))))[0] for axis in 'XYZ']
        if not all(math.isfinite(scale) for scale in scales):
            raise ValueError('Non-finite scale outside audited corpus scope')
        products = [struct.unpack('<f', struct.pack('<f', scales[a] * scales[b]))[0] for a, b in ((0, 1), (1, 2), (0, 2))]
        attributes = [(value(item, 'Name', ''), value(item, 'Value', '')) for item in props.get('Attributes', ())]
        own, reference = [], []
        if kind == 'MESH':
            path = next((path for key, path in attributes if key == 'MATERIAL'), None)
            if path is None:
                raise ValueError('Mesh has no resolvable material: ' + name)
            own.append(self.material(path, context, scene_path + ':' + name))
        elif kind == 'EMITTER':
            data = next((path for key, path in reversed(attributes) if key == 'DATA'), None)
            material = next((path for key, path in reversed(attributes) if key == 'MATERIAL'), None)
            if data is None or material is None:
                return []  # Registered creator returns null before child insertion.
            # Constructor acquires a material, but virtual +20 is aggregate-only.
            self.material(material, context, scene_path + ':' + name, flags=0)
        elif kind == 'REFERENCE':
            path = next((path for key, path in attributes if key == 'SCENEGRAPH'), None)
            if not path:
                raise ValueError('Reference has no SCENEGRAPH')
            path = canonical(path)
            if path in chain:
                raise ValueError('Cyclic scene reference: ' + path)
            if inherited:
                referenced_context = context
            else:
                altid = next((text for key, text in attributes if key == 'ALTID'), '')
                normalized = ALTID['parse_altid'](altid)
                referenced_context = (tuple(normalized), 0, False, 2**64 - 1, False)
            reference = self.visit(self.load(path), referenced_context, path, (*chain, path), depth + 1)
        elif kind not in ('GROUP', 'MODEL', 'LOCATOR', 'LIGHT', 'JOINT', 'COLLISION'):
            raise ValueError('Factory/collector not joined for node type: ' + kind)
        # The native creator/acquisition executes before the insertion scale gate.
        if not any(product != 0.0 for product in products):
            return []
        children = []
        for child in props.get('Children', ()):
            children.extend(self.visit(child, context, scene_path, chain, depth + 1))
        # The reference wrapper collects local children before the referenced root.
        return own + children + reference


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--corpus', type=Path, required=True)
    parser.add_argument('--models-file', type=Path, required=True)
    parser.add_argument('--seed', type=lambda v: int(v, 0), required=True)
    parser.add_argument('--engine-context-index', type=int, required=True)
    parser.add_argument('--resource-flags', type=lambda v: int(v, 0), required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    output, corpus = args.output.resolve(), args.corpus.resolve()
    if output.exists() or output.is_relative_to(corpus) or output.is_relative_to(HERE.parents[1]):
        parser.error('Require a new output outside corpus/repository')
    if not 0 <= args.engine_context_index <= 31 or args.resource_flags not in (0, 0x4000000):
        parser.error('Require explicit 0..31 context index and supported 0/4000000 flags')
    if args.models_file.stat().st_size > 32768:
        parser.error('Model manifest byte budget exceeded')
    roots = json.loads(args.models_file.read_text(encoding='utf-8'))
    if not isinstance(roots, list) or not 1 <= len(roots) <= 32:
        parser.error('Expected 1..32 model roots')
    records, descriptor_sources, scene_sources = [], None, None
    for descriptor in roots:
        loader = DESCRIPTORS['CorpusDescriptors'](corpus, descriptor_sources)
        scene = SceneTrace(corpus, args.engine_context_index, args.resource_flags, scene_sources)
        descriptor_sources, scene_sources = loader.sources, scene.sources
        record = {'model': descriptor}
        try:
            tree = loader.load(descriptor)
            if tree is None:
                raise ValueError('Root descriptor missing')
            selected = DESCRIPTORS['evaluate'](args.seed, tree, loader.load)['selected_ids']
            path = canonical(descriptor.replace('.descriptor.', '.scene.'))
            context = (tuple(selected), args.seed, True, 2**64 - 1, False)
            order = list(dict.fromkeys(scene.visit(scene.load(path), context, path, (path,))))
            record.update(status='bounded_context_trace', selected_ids=selected,
                          ordered_materials=[scene.materials[i - 1] for i in order], material_requests=scene.requests)
        except (ValueError, TypeError, OverflowError) as error:
            record.update(status='unsupported_or_budget', error=str(error))
        finally:
            record.update(scene_visits=scene.visits, xml_bytes=scene.xml_bytes,
                          sources=[{'path': path, 'archive': asset['archive'], 'sha256': asset['sha256']} for path, asset in scene.assets.items()])
            loader.close(); scene.database.close()
        records.append(record)
    report = {'runtime_verified': False, 'natural_resource_io_proven': False,
              'algorithm_executable_sha256': CONTEXTS['HASH'],
              'source_hashes': {path.name: hashlib.sha256(path.read_bytes()).hexdigest() for path in
                                (Path(__file__), HERE / 'evaluate-descriptor-seed.py', HERE / 'emulate-packed-material-context.py', HERE / 'emulate-reference-altid.py')},
              'context_index': args.engine_context_index, 'resource_flags': args.resource_flags,
              'seed': hex(args.seed), 'records': records,
              'limitations': ['Successful asset resolution and non-variant handles are fixture assumptions.',
                              'Unknown factories fail closed; runtime task/geometry/cache readiness is not reproduced.',
                              'ALTID parsing matches original instructions with controlled C string/allocation helpers.']}
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open('x', encoding='utf-8') as stream:
        json.dump(report, stream, indent=2)
        stream.write('\n')
    completed = sum(r['status'] == 'bounded_context_trace' for r in records)
    print(json.dumps({'roots': len(records), 'bounded_traces': completed, 'unsupported': len(records) - completed}))
    if completed != len(records): raise SystemExit(1)


if __name__ == '__main__':
    main()
