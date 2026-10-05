"""Bounded appearance-constraint search with forward replay and optional preview recipe.

Matches are candidates for partial offline evaluators, never verified game seeds.
Explicit texture order and mesh bindings are supplied, not inferred from names.
"""
import argparse
import hashlib
import json
import math
from pathlib import Path
import runpy
import time

HERE = Path(__file__).resolve().parent
INPUTS = runpy.run_path(str(HERE / 'evaluate-entity-inputs.py'))
D = INPUTS['DESCRIPTORS']
B = INPUTS['PALETTES']
T = runpy.run_path(str(HERE / 'evaluate-texture-options.py'))


def constraints(value):
    if not isinstance(value, dict) or set(value) - {'required_ids', 'forbidden_ids', 'palette', 'textures'}:
        raise ValueError('Unknown appearance constraint fields')
    required, forbidden = INPUTS['ids'](value.get('required_ids', [])), INPUTS['ids'](value.get('forbidden_ids', []))
    if set(required) & set(forbidden):
        raise ValueError('Required and forbidden IDs overlap')
    palette, textures = value.get('palette', []), value.get('textures', [])
    if not isinstance(palette, list) or not isinstance(textures, list) or len(palette) > 32 or len(textures) > 16:
        raise ValueError('Constraint list budget exceeded')
    for row in palette:
        if not isinstance(row, dict) or set(row) - {'family', 'slot', 'index', 'rgba', 'tolerance'}:
            raise ValueError('Unknown palette constraint')
        if not isinstance(row.get('family'), str) or len(row['family']) > 64 or type(row.get('slot')) is not int or not 0 <= row['slot'] < 5:
            raise ValueError('Palette constraint requires family and slot 0..4')
        if 'index' not in row and 'rgba' not in row:
            raise ValueError('Palette constraint requires source index or RGBA')
        if 'index' in row and (type(row['index']) is not int or not 0 <= row['index'] < 64):
            raise ValueError('Invalid palette index')
        if 'rgba' in row and (not isinstance(row['rgba'], list) or len(row['rgba']) != 4 or any(
                type(v) not in (int, float) or not math.isfinite(v) or not 0 <= v <= 1 for v in row['rgba'])):
            raise ValueError('Invalid RGBA constraint')
        tolerance = row.get('tolerance', 0)
        if type(tolerance) not in (int, float) or not math.isfinite(tolerance) or not 0 <= tolerance <= 1 or 'rgba' not in row and tolerance != 0:
            raise ValueError('Invalid color tolerance')
    for row in textures:
        if not isinstance(row, dict) or set(row) != {'layer', 'group', 'name'} or any(
                not isinstance(v, str) or not v.isascii() or len(v) > 128 or '\0' in v for v in row.values()):
            raise ValueError('Texture constraint requires bounded layer/group/name')
    if not (required or forbidden or palette or textures):
        raise ValueError('At least one appearance constraint is required')
    return {'required': required, 'forbidden': forbidden, 'palette': palette, 'textures': textures}


def matches_ids(selected, wanted):
    selected = set(selected)
    return set(wanted['required']) <= selected and not set(wanted['forbidden']) & selected


def matches_colors(rows, wanted):
    families = {row['family']: row for row in rows}
    for condition in wanted['palette']:
        if condition['family'] not in families:
            raise ValueError('Requested palette family unavailable')
        sample = families[condition['family']]['colors'][condition['slot']]
        if 'index' in condition and sample['index'] != condition['index']:
            return False
        if 'rgba' in condition and any(abs(a - b) > condition.get('tolerance', 0)
                                      for a, b in zip(sample['rgba'], condition['rgba'])):
            return False
    return True


def matches_textures(rows, wanted):
    return all(any(all(row[key] == value for key, value in condition.items()) for row in rows)
               for condition in wanted['textures'])


def search(start, count, seconds, maximum, evaluate, wanted, clock=time.monotonic):
    if type(start) is not int or not 0 <= start < 2**64 or type(count) is not int or not 1 <= count <= 100000:
        raise ValueError('Require uint64 start and 1..100000 candidates')
    if start + count > 2**64 or type(seconds) not in (int, float) or not 0 < seconds <= 60 or type(maximum) is not int or not 1 <= maximum <= 20:
        raise ValueError('Invalid range/time/result budget')
    began, results, examined, stopped = clock(), [], 0, 'range_exhausted'
    for seed in range(start, start + count):
        if clock() - began >= seconds:
            stopped = 'time_budget'; break
        candidate = evaluate(seed)
        examined += 1
        if candidate is not None:
            replay = evaluate(seed)
            if candidate != replay:
                raise ValueError('Forward replay changed; no seed result may be trusted')
            results.append({'seed': hex(seed), 'evidence': 'candidate', **candidate})
            if len(results) >= maximum:
                stopped = 'result_limit'; break
    return {'status': 'candidate_matches' if results else 'search_exhausted_within_bounds',
            'stop_reason': stopped, 'examined': examined, 'next_seed': hex(start + examined) if start + examined < 2**64 else None,
            'elapsed_seconds': clock() - began, 'candidates': results,
            'unique_seed_proven': False, 'all_uint64_seeds_searched': False}


def preview_recipe(binding, result):
    if not isinstance(binding, dict) or set(binding) != {'model_sha256', 'parts'}:
        raise ValueError('Preview binding requires model_sha256 and parts')
    digest = binding['model_sha256']
    if not isinstance(digest, str) or len(digest) != 64 or any(c not in '0123456789abcdef' for c in digest):
        raise ValueError('Invalid preview model fingerprint')
    if not isinstance(binding['parts'], list) or not 1 <= len(binding['parts']) <= 4096:
        raise ValueError('Preview binding budget exceeded')
    parts, names = [], set()
    families = {row['family']: row for row in result['palette_rows']}
    for part in binding['parts']:
        if not isinstance(part, dict) or set(part) - {'name', 'required_ids', 'family', 'slot'}:
            raise ValueError('Unknown preview binding fields')
        name = part.get('name')
        if not isinstance(name, str) or not 1 <= len(name) <= 128 or '\0' in name or name in names:
            raise ValueError('Preview mesh names must be unique and bounded')
        names.add(name)
        required = INPUTS['ids'](part.get('required_ids', []))
        row = {'name': name, 'visible': set(required) <= set(result['selected_ids'])}
        if 'family' in part or 'slot' in part:
            family, slot = part.get('family'), part.get('slot')
            if not isinstance(family, str) or family not in families or type(slot) is not int or not 0 <= slot < 5:
                raise ValueError('Invalid preview palette binding')
            row['rgba'] = families[family]['colors'][slot]['rgba']
        parts.append(row)
    return {'schema': 1, 'evidence': 'candidate', 'modelSha256': digest,
            'seed': result['seed'], 'descriptor': result['descriptor'], 'parts': parts}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for key in ('corpus', 'request', 'output'):
        parser.add_argument('--' + key, type=Path, required=True)
    args = parser.parse_args()
    corpus, source, output = args.corpus.resolve(), args.request.resolve(), args.output.resolve()
    if output.exists() or output == source or any(output.is_relative_to(p) for p in (corpus, HERE.parents[1])):
        parser.error('Require a new external output outside corpus/repository')
    if source.stat().st_size > 1024 * 1024:
        parser.error('Request byte budget exceeded')
    raw = source.read_bytes(); request = json.loads(raw)
    if not isinstance(request, dict) or set(request) - {'input', 'constraints', 'start', 'count', 'seconds', 'max_results', 'texture_resources', 'texture_seed', 'preview_binding'}:
        parser.error('Unknown search request fields')
    resolved = INPUTS['resolve_inputs'](request.get('input'))
    if resolved['selection_mode'] != 'seeded' or not resolved['model_pair'][1]:
        parser.error('Seed search requires enabled seeded model input; explicit overrides are not inverted')
    wanted = constraints(request.get('constraints'))
    palettes = B['load_base'](corpus)
    texture_sources, texture_pair = None, None
    assets = request.get('texture_resources')
    if assets is not None:
        if not isinstance(assets, list) or not 1 <= len(assets) <= 8 or any(not isinstance(v, str) for v in assets):
            parser.error('Require 1..8 explicit ordered texture resources')
        texture_sources = T['T']['inspect'](corpus, assets)['sources']
        texture_pair = INPUTS['pair'](request.get('texture_seed'))
    elif wanted['textures'] or 'texture_seed' in request:
        parser.error('Texture constraints require explicit resources and texture_seed')
    loader = D['CorpusDescriptors'](corpus)
    try:
        tree = loader.load(resolved['descriptor'])
        if tree is None:
            raise ValueError('Root descriptor missing')
        def evaluate(seed):
            selected = D['evaluate'](seed, tree, loader.load, True, resolved['inclusion'], resolved['exclusion'], resolved['prefix'])['selected_ids']
            if not matches_ids(selected, wanted):
                return None
            # Separate freighter HomeSystemSeed remains fixed in a model-seed search.
            palette_seed, enabled = resolved['palette_pair'] if resolved['category'] == 'freighter' else (seed, True)
            rows = B['generate'](palette_seed, palettes, enabled=enabled)
            if not matches_colors(rows, wanted):
                return None
            textures = T['evaluate_fresh_resources'](texture_sources, texture_pair[0], rows, enabled=texture_pair[1])['final_rows'] if texture_sources else []
            if not matches_textures(textures, wanted):
                return None
            return {'descriptor': resolved['descriptor'], 'selected_ids': selected,
                    'palette_seed': hex(palette_seed), 'palette_rows': rows, 'texture_rows': textures}
        result = search(INPUTS['pair']({'value': request.get('start'), 'enabled': True})[0],
                        request.get('count'), request.get('seconds'), request.get('max_results'), evaluate, wanted)
        if 'preview_binding' in request and result['candidates']:
            result['preview_recipe'] = preview_recipe(request['preview_binding'], result['candidates'][0])
        result.update(runtime_verified=False, appearance_evaluator_complete=False,
            algorithm_executable_sha256=INPUTS['SCENES']['CONTEXTS']['HASH'],
            request_sha256=hashlib.sha256(raw).hexdigest(),
            source_sha256=hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
            descriptor_sources=[{k: v for k, v in row.items() if k != 'tree'} for row in loader.cache.values()],
            texture_sources=[] if texture_sources is None else [{k: v for k, v in row.items() if k != 'layers'} for row in texture_sources],
            limitations=['Bounded enumeration, not a complete uint64 inverse solver.',
                        'Matches are partial-evaluator candidates; base colors and explicit texture order are not final game appearance.',
                        'Freighter palette input and supplied texture seed remain independent fixed channels.',
                        'Preview mesh bindings are explicit research mappings; DDS pixels, masks and shaders are not reproduced.'])
    finally:
        loader.close()
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open('x', encoding='utf-8') as stream:
        json.dump(result, stream, indent=2); stream.write('\n')
    print(json.dumps({k: result[k] for k in ('status', 'stop_reason', 'examined')}))


if __name__ == '__main__':
    main()
