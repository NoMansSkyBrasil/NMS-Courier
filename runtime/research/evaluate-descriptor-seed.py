"""Offline candidate for unfiltered default descriptor traversal in build 180383.

No prefix overrides, inclusion/exclusion channels, customisation or native calls.
The generated ID trace is not a verified full appearance or inverse seed search.
"""
import argparse
import hashlib
import json
from pathlib import Path
import runpy
import re
import sqlite3
import xml.etree.ElementTree as ET

core = runpy.run_path(str(Path(__file__).with_name('procedural-seed-primitives.py')))
metadata = runpy.run_path(str(Path(__file__).with_name('inspect-procedural-descriptors.py')))


def normalized_id(identity):
    """Native suffix branch uses the first LOD occurrence and an ASCII prefix."""
    if len(identity.encode('utf-8')) > 31 or not identity.isascii():
        raise ValueError('Descriptor identity is outside the audited ASCII ID scope')
    position = identity.find('LOD')
    if position >= 0 and len(identity) - position == 4 and identity[-1] in '0123456789':
        return identity[:position].upper()
    return identity


def all_never(tree):
    groups = tree['groups']
    return bool(groups) and all(group['options'] and all(core['option_weight'](option['name']) == 0
                                                        for option in group['options']) for group in groups)


def logical_descriptor_path(resource):
    """Audited loader rebuilds the final extension; limit annotations to digits."""
    if not resource.isascii() or len(resource.encode('ascii')) > 255:
        raise ValueError('Resource path exceeds audited ASCII byte scope')
    logical = resource.replace('\\', '/').lower().replace('.scene.', '.descriptor.', 1)
    annotated = re.fullmatch(r'(.+\.descriptor\.mbin)\{[0-9]+\}', logical)
    if annotated:
        logical = annotated.group(1)
    if not logical.startswith('models/') or not logical.endswith('.descriptor.mbin'):
        raise ValueError('Unsupported referenced resource path: ' + repr(resource[:512]))
    return logical


class CorpusDescriptors:
    """Bounded exact-path loader; ambiguous archives fail instead of guessing."""
    def __init__(self, corpus, sources=None):
        self.corpus = corpus.resolve()
        self.cache = {}
        self.xml_bytes = 0
        self.database = sqlite3.connect((self.corpus / 'index.sqlite').as_uri() + '?mode=ro', uri=True)
        if sources is None:
            rows = self.database.execute("SELECT path,xml_path,archive FROM files WHERE lower(path) LIKE 'models/%.descriptor.mbin' LIMIT 8193").fetchall()
            if len(rows) > 8192:
                self.database.close()
                raise ValueError('Descriptor metadata row budget exceeded')
            sources = {}
            for path, xml, archive in rows:
                sources.setdefault(path.lower(), []).append((xml, archive))
        self.sources = sources

    def close(self):
        self.database.close()

    def load(self, resource):
        logical = logical_descriptor_path(resource)
        if logical in self.cache:
            if resource not in self.cache[logical]['requested_resources']:
                self.cache[logical]['requested_resources'].append(resource)
            return self.cache[logical]['tree']
        if len(self.cache) >= 128:
            raise ValueError('Descriptor resource budget exceeded')
        rows = self.sources.get(logical, [])
        record = {'logical_path': logical, 'requested_resources': [resource], 'status': 'not_indexed', 'tree': None}
        self.cache[logical] = record
        if not rows:
            return None
        if len(rows) != 1 or not rows[0][0]:
            raise ValueError('Descriptor source ambiguous or not converted: ' + logical)
        source = Path(rows[0][0]).resolve()
        size = source.stat().st_size
        if not source.is_relative_to(self.corpus) or size > 8 * 1024 * 1024 or self.xml_bytes + size > 64 * 1024 * 1024:
            raise ValueError('Descriptor containment/byte budget exceeded')
        data = source.read_bytes()
        self.xml_bytes += len(data)
        if b'<!DOCTYPE' in data or b'<!ENTITY' in data:
            raise ValueError('XML entity declarations are unsupported')
        tree = metadata['descriptor_tree'](ET.fromstring(data))
        record.update(status='loaded', archive=rows[0][1], xml_sha256=hashlib.sha256(data).hexdigest(), tree=tree)
        return tree


def evaluate(seed, tree, resolve, enabled=True):
    selected, trace = [], []
    calls = [0]

    def visit(model, local_seed, local_enabled, depth):
        calls[0] += 1
        if depth > 64 or calls[0] > 4096:
            raise ValueError('Descriptor traversal depth/call budget exceeded')
        state = core['seed_state'](local_seed, local_enabled)
        for group in model['groups']:
            options = group['options']
            if not options or not any(core['option_weight'](option['name']) for option in options):
                continue
            # Native suppression compares candidate IDs before LOD normalization.
            if any(option['id'] in selected for option in options):
                continue
            state, index = core['choose_unfiltered'](state, [option['name'] for option in options])
            option = options[index]
            identity = normalized_id(option['id'])
            if identity not in selected:
                selected.append(identity)
            if len(trace) >= 16384:
                raise ValueError('Descriptor trace budget exceeded')
            trace.append({'depth': depth, 'seed': hex(local_seed), 'enabled': local_enabled,
                          'type_id': group['type_id'], 'selected_id': identity, 'source_id': option['id'],
                          'post_choice_state': list(state)})
            for child in option['child_model_lists']:
                if all_never(child):
                    continue
                if group['type_id'] == '_PLAYER_':
                    visit(child, local_seed, local_enabled, depth + 1)
                else:
                    state, child_seed = core['child_seed'](state)
                    visit(child, child_seed, True, depth + 1)
            for reference in option['reference_paths']:
                referenced = resolve(reference)
                if referenced is not None and all_never(referenced):
                    continue
                state, child_seed = core['child_seed'](state)
                if referenced is not None:
                    visit(referenced, child_seed, True, depth + 1)
        return state

    state = visit(tree, seed, enabled, 0)
    return {'selected_ids': selected, 'trace': trace, 'root_final_state': list(state), 'calls': calls[0]}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--corpus', type=Path, required=True)
    models = parser.add_mutually_exclusive_group(required=True)
    models.add_argument('--model')
    models.add_argument('--models-file', type=Path, help='JSON array of 1..32 exact model/descriptor paths')
    parser.add_argument('--seed', required=True, type=lambda value: int(value, 0))
    parser.add_argument('--output', required=True, type=Path)
    args = parser.parse_args()
    corpus, output = args.corpus.resolve(), args.output.resolve()
    if output.exists() or output.is_relative_to(corpus) or output.is_relative_to(Path(__file__).resolve().parents[2]):
        parser.error('Output must be new and outside corpus/repository')
    if args.models_file:
        if args.models_file.stat().st_size > 32768:
            parser.error('Model manifest size budget exceeded')
        paths = json.loads(args.models_file.read_text(encoding='utf-8'))
        if not isinstance(paths, list) or not 1 <= len(paths) <= 32 or any(not isinstance(p, str) or not 1 <= len(p) <= 512 for p in paths):
            parser.error('Model manifest must contain 1..32 bounded path strings')
    else:
        paths = [args.model]
    core['seed_state'](args.seed)
    records = []
    sources = None
    for path in paths:
        loader = CorpusDescriptors(corpus, sources)
        sources = loader.sources
        record = {'model': path}
        try:
            tree = loader.load(path)
            if tree is None:
                raise ValueError('Root descriptor is absent; no procedural trace can be inferred')
            record.update(evaluate(args.seed, tree, loader.load), status='experimental_trace')
        except ValueError as error:
            record.update(status='unsupported_or_budget', error=str(error))
        finally:
            record['sources'] = [{k: v for k, v in item.items() if k != 'tree'} for item in loader.cache.values()]
            loader.close()
        records.append(record)
    report = {'mode': 'experimental_unfiltered_descriptor_trace', 'runtime_verified': False,
              'appearance_evaluator_complete': False, 'seed': hex(args.seed), 'records': records,
              'limitations': ['No inclusion/exclusion channel or prefix override is supplied.',
                              'Native filters/customisation may change both selections and draw consumption.',
                              'Class, colors, inventory and natural location are not evaluated.']}
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(report, indent=2), encoding='utf-8')
    print(json.dumps({'roots': len(records), 'traces': sum(item['status'] == 'experimental_trace' for item in records),
                      'runtime_verified': False}))


if __name__ == '__main__':
    main()
