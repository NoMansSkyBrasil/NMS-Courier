"""Offline candidate for explicit-context descriptor traversal in build 180383.

Explicit inclusion, exclusion and prefix inputs; no inferred caller context.
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


def included(identity, identities):
    """Reproduce the case-sensitive suffix predicate at RVA 2d69ad0."""
    if not identities:
        return True
    underscore = identity.find('_')
    if underscore >= 0 and identity[underscore:].startswith('_X'):
        return identity[underscore:] in identities
    x = identity.find('X')
    if x < 0:
        return True
    suffix = identity[x:]
    return any(suffix == entry or entry.startswith('_') and suffix == entry[1:]
               for entry in identities)


def loaded_node_included(name, selected):
    """Selected-descriptor membership at 2d698c0, after caller LOD processing."""
    if not name.isascii() or len(name) > 255 or '\0' in name:
        raise ValueError('Loaded node name exceeds audited ASCII scope')
    if len(selected) > 4096 or any(not value.isascii() or len(value) > 31 or '\0' in value for value in selected):
        raise ValueError('Selected node identity budget exceeded')
    if not name.startswith('_') or '_' not in name[1:]:
        return True
    # The 16-byte strncpy buffer is explicitly terminated at byte 15.
    return name[:31].upper() in selected or name[:15].upper() in selected


def choose_group(state, options, selected=(), inclusion=(), exclusion=(), prefix=''):
    """Explicit-context group selection at RVA 2d67800; return original index."""
    if len(options) > 4096 or any(len(values) > 4096 for values in (selected, inclusion, exclusion)):
        raise ValueError('Descriptor context count budget exceeded')
    for identity in [prefix, *selected, *inclusion, *exclusion, *(o['id'] for o in options)]:
        if not identity.isascii() or len(identity) > 31 or '\0' in identity:
            raise ValueError('Descriptor context requires bounded ASCII identities')
    eligible = [i for i, option in enumerate(options)
                if not any(token and token in option['id'] for token in exclusion)
                and included(option['id'], inclusion)]
    total = sum(core['option_weight'](options[i]['name']) for i in eligible)
    if not total or any(option['id'] in selected for option in options):
        return state, None
    matches = [i for i in eligible if prefix and prefix in options[i]['id']]
    if len(matches) == 1:
        return state, matches[0]
    state, draw = core['advance'](state)
    if matches:
        return state, matches[(draw * len(matches)) >> 32]
    position = (draw * total) >> 32
    for index in eligible:
        weight = core['option_weight'](options[index]['name'])
        if position < weight:
            return state, index
        position -= weight
    raise AssertionError('Weighted descriptor selection escaped its range')


def evaluate(seed, tree, resolve, enabled=True, inclusion=(), exclusion=(), prefix=''):
    selected, trace, visits = [], [], []
    calls = [0]

    def visit(model, local_seed, local_enabled, depth, local_prefix, local_exclusion):
        calls[0] += 1
        if depth > 64 or calls[0] > 4096:
            raise ValueError('Descriptor traversal depth/call budget exceeded')
        visits.append({'seed': hex(local_seed), 'enabled': local_enabled})
        state = core['seed_state'](local_seed, local_enabled)
        classification = 1
        for group in model['groups']:
            options = group['options']
            state, index = choose_group(state, options, selected, inclusion, local_exclusion, local_prefix)
            if index is None:
                continue
            option = options[index]
            if 'xRARE' in option['name']:
                classification = 2
            elif 'xNEVER' not in option['name'] and 'xWEIRD' in option['name']:
                classification = 3
            identity = normalized_id(option['id'])
            if identity not in selected:
                selected.append(identity)
            if len(trace) >= 16384:
                raise ValueError('Descriptor trace budget exceeded')
            trace.append({'depth': depth, 'seed': hex(local_seed), 'enabled': local_enabled,
                          'type_id': group['type_id'], 'selected_id': identity, 'source_id': option['id'],
                          'post_choice_state': list(state)})
            for child in option['child_model_lists']:
                if child is None or all_never(child):
                    continue
                if group['type_id'] == '_PLAYER_':
                    visit(child, local_seed, local_enabled, depth + 1, local_prefix, local_exclusion)
                else:
                    state, child_seed = core['child_seed'](state)
                    visit(child, child_seed, True, depth + 1, local_prefix, local_exclusion)
            for reference in option['reference_paths']:
                referenced = resolve(reference)
                if referenced is not None and all_never(referenced):
                    continue
                state, child_seed = core['child_seed'](state)
                # The native branch resolves the path twice. A loader failure
                # may change between lookups; never reuse the predicate result.
                referenced = resolve(reference)
                if referenced is not None:
                    # The audited reference branch resets prefix/exclusion;
                    # an empty prefix does not select a resource filter record.
                    visit(referenced, child_seed, True, depth + 1, '', ())
        return state, classification

    state, classification = visit(tree, seed, enabled, 0, prefix, exclusion)
    return {'selected_ids': selected, 'trace': trace, 'root_final_state': list(state),
            'calls': calls[0], 'visits': visits, 'classification': classification}


def evaluate_explicit(tree, resolve, choices=(), inclusion=()):
    """Port 2d63810: explicit matching, first-option fallback, no PRNG draws.

    Choice matching uses the source 32-byte ID before LOD normalization. Output
    IDs are normalized and deduplicated; fallback includes xNEVER entries.
    """
    if len(choices) > 4096 or len(inclusion) > 4096 or any(
            not identity.isascii() or len(identity) > 31 or '\0' in identity
            for identity in (*choices, *inclusion)):
        raise ValueError('Explicit descriptor context requires bounded ASCII IDs')
    selected, lookups = [], []
    calls = [0]
    def visit(current, depth):
        calls[0] += 1
        if depth > 64 or calls[0] > 4096:
            raise ValueError('Explicit descriptor traversal budget exceeded')
        for group in current['groups']:
            options = group['options']
            if not options:
                continue
            option = next((item for item in options if item['id'] in choices), options[0])
            if not included(option['id'], inclusion):
                continue
            identity = normalized_id(option['id'])
            if identity not in selected:
                selected.append(identity)
            for child in option['child_model_lists']:
                if child is not None:
                    visit(child, depth + 1)
            for path in option['reference_paths']:
                lookups.append(path)
                child = resolve(path)
                if child is not None:
                    visit(child, depth + 1)
    visit(tree, 0)
    return {'selected_ids': selected, 'calls': calls[0], 'lookups': lookups}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--corpus', type=Path, required=True)
    models = parser.add_mutually_exclusive_group(required=True)
    models.add_argument('--model')
    models.add_argument('--models-file', type=Path, help='JSON array of 1..32 exact model/descriptor paths')
    parser.add_argument('--seed', required=True, type=lambda value: int(value, 0))
    parser.add_argument('--include-id', action='append', default=[])
    parser.add_argument('--exclude-id', action='append', default=[])
    parser.add_argument('--prefix', default='')
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
    choose_group(core['seed_state'](args.seed), [], inclusion=args.include_id,
                 exclusion=args.exclude_id, prefix=args.prefix)
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
            record.update(evaluate(args.seed, tree, loader.load, inclusion=args.include_id,
                                   exclusion=args.exclude_id, prefix=args.prefix), status='experimental_trace')
        except ValueError as error:
            record.update(status='unsupported_or_budget', error=str(error))
        finally:
            record['sources'] = [{k: v for k, v in item.items() if k != 'tree'} for item in loader.cache.values()]
            loader.close()
        records.append(record)
    report = {'mode': 'experimental_explicit_context_descriptor_trace', 'runtime_verified': False,
              'appearance_evaluator_complete': False, 'seed': hex(args.seed), 'records': records,
              'context': {'inclusion': args.include_id, 'exclusion': args.exclude_id, 'prefix': args.prefix},
              'limitations': ['Caller context and resource filter records must be supplied explicitly.',
                              'Customisation and alternate loader paths are not inferred.',
                              'Class, colors, inventory and natural location are not evaluated.']}
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(report, indent=2), encoding='utf-8')
    print(json.dumps({'roots': len(records), 'traces': sum(item['status'] == 'experimental_trace' for item in records),
                      'runtime_verified': False}))


if __name__ == '__main__':
    main()
