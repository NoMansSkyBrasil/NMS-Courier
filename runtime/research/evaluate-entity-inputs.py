"""Join supplied category inputs to bounded descriptor, scene and palette traces.

Inputs are explicit research snapshots, not saves or live process reads.
Only source-associated owned/default and ship purchase routes are supported.
Palette output remains a base-only candidate, not an appearance oracle.
"""
import argparse
import hashlib
import json
import re
from pathlib import Path
import runpy

HERE = Path(__file__).resolve().parent
SCENES = runpy.run_path(str(HERE / 'trace-packed-scene-materials.py'))
DESCRIPTORS = SCENES['DESCRIPTORS']
PALETTES = runpy.run_path(str(HERE / 'evaluate-base-palettes.py'))
ROOTS = json.loads((HERE / 'appearance-recursion-models-180383.json').read_text(encoding='utf-8'))
FREIGHTERS = frozenset(path for path in ROOTS if '/industrial/' in path)
TOOLS = frozenset(path for path in ROOTS if '/weapons/' in path)
SHIPS = frozenset(ROOTS) - FREIGHTERS - TOOLS
PAIR_KEYS = {'value', 'enabled'}


def pair(value):
    if not isinstance(value, dict) or set(value) != PAIR_KEYS or type(value['enabled']) is not bool:
        raise ValueError('Seed pair requires exactly value and boolean enabled')
    text = value['value']
    if not isinstance(text, str) or not re.fullmatch(r'(?:0[xX][0-9a-fA-F]{1,16}|[0-9]{1,20})', text):
        raise ValueError('Seed value must be a bounded decimal or hexadecimal string')
    try:
        number = int(text, 16 if text.startswith(('0x', '0X')) else 10)
    except ValueError as error:
        raise ValueError('Invalid seed value') from error
    if not 0 <= number < 2**64 or any(c.isspace() for c in text):
        raise ValueError('Seed outside uint64 scope')
    return number, value['enabled']


def ids(values):
    if not isinstance(values, list) or len(values) > 256 or any(
            not isinstance(value, str) or not value.isascii() or '\0' in value or len(value) > 31
            for value in values):
        raise ValueError('Descriptor IDs require at most 256 ASCII records of 31 bytes')
    return tuple(values)


def resolve_inputs(record):
    """Keep model, palette and material second-pair channels distinct."""
    allowed = {'category', 'route', 'descriptor', 'model_seed', 'home_system_seed',
               'loaded_resource_seed', 'material_second_seed', 'engine_context_index',
               'resource_flags', 'selection', 'inclusion', 'exclusion', 'prefix'}
    if not isinstance(record, dict) or set(record) - allowed:
        raise ValueError('Unknown entity input fields')
    category, route, descriptor = (record.get(key) for key in ('category', 'route', 'descriptor'))
    roots = {'ship': SHIPS, 'multitool': TOOLS, 'freighter': FREIGHTERS}
    if not isinstance(category, str) or not isinstance(descriptor, str) or category not in roots or descriptor not in roots[category]:
        raise ValueError('Category/resource is outside the nineteen-root evidence scope')
    if not isinstance(route, str) or route not in ('owned_default', 'ship_purchase') or route == 'ship_purchase' and category != 'ship':
        raise ValueError('Category route is not source-associated')
    model = pair(record.get('model_seed'))
    model_source = {'ship': '55cb20 resource model pair', 'multitool': '553600 selected Resource pair',
                    'freighter': '542910 CurrentFreighter.Resource model pair'}[category]
    if route == 'ship_purchase':
        loaded = pair(record.get('loaded_resource_seed'))
        model, model_source = (loaded, '8e8830 loaded resource context pair') if loaded[1] else (
            model, '8e8830 purchase-object fallback pair')
    elif 'loaded_resource_seed' in record:
        raise ValueError('Loaded resource seed is only supported for ship_purchase')
    if category == 'freighter':
        palette, palette_source = pair(record.get('home_system_seed')), '542910 CurrentFreighterHomeSystemSeed pair'
    else:
        if 'home_system_seed' in record:
            raise ValueError('Home system seed route is only associated with owned freighters')
        palette, palette_source = model, model_source
    second = pair(record.get('material_second_seed'))
    context_index, flags = record.get('engine_context_index'), record.get('resource_flags')
    if type(context_index) is not int or not 0 <= context_index <= 31 or type(flags) is not int or flags not in (0, 0x4000000):
        raise ValueError('Explicit context index 0..31 and flags 0/4000000 required')
    selection = record.get('selection')
    if not isinstance(selection, dict) or selection.get('mode') not in ('seeded', 'explicit'):
        raise ValueError('Selection mode must be seeded or explicit')
    explicit = selection['mode'] == 'explicit'
    if set(selection) != ({'mode', 'ids'} if explicit else {'mode'}):
        raise ValueError('Selection fields do not match mode')
    choices = ids(selection['ids']) if explicit else ()
    inclusion, exclusion = ids(record.get('inclusion', [])), ids(record.get('exclusion', []))
    prefix = record.get('prefix', '')
    ids([prefix])
    if explicit and (exclusion or prefix):
        raise ValueError('Explicit selection does not use seeded prefix/exclusion')
    return {'category': category, 'route': route, 'descriptor': descriptor,
            'model_pair': model, 'palette_pair': palette, 'material_second_pair': second,
            'model_source': model_source, 'palette_source': palette_source,
            'material_second_source': 'Explicit preserved context pair; not inferred from palette input',
            'context_index': context_index, 'flags': flags, 'selection_mode': selection['mode'],
            'choices': choices, 'inclusion': inclusion, 'exclusion': exclusion, 'prefix': prefix}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for key in ('corpus', 'inputs', 'output'):
        parser.add_argument('--' + key, type=Path, required=True)
    parser.add_argument('--base-palettes', action='store_true', help='Include experimental base-only colors')
    args = parser.parse_args()
    corpus, source, output = args.corpus.resolve(), args.inputs.resolve(), args.output.resolve()
    if output.exists() or output == source or any(output.is_relative_to(path) for path in (corpus, HERE.parents[1])):
        parser.error('Require a new external output outside corpus/repository')
    if source.stat().st_size > 32768:
        parser.error('Input byte budget exceeded')
    raw = source.read_bytes()
    records = json.loads(raw)
    if not isinstance(records, list) or not 1 <= len(records) <= 32:
        parser.error('Expected 1..32 entity input records')
    inputs = [resolve_inputs(record) for record in records]
    palettes = PALETTES['load_base'](corpus) if args.base_palettes else None
    results, descriptor_sources, scene_sources = [], None, None
    for values in inputs:
        loader = DESCRIPTORS['CorpusDescriptors'](corpus, descriptor_sources)
        scene = SCENES['SceneTrace'](corpus, values['context_index'], values['flags'], scene_sources)
        descriptor_sources, scene_sources = loader.sources, scene.sources
        result = {'inputs': values}
        try:
            tree = loader.load(values['descriptor'])
            if tree is None:
                raise ValueError('Root descriptor missing')
            model, enabled = values['model_pair']
            if values['selection_mode'] == 'explicit':
                evaluated = DESCRIPTORS['evaluate_explicit'](tree, loader.load, values['choices'], values['inclusion'])
            else:
                evaluated = DESCRIPTORS['evaluate'](model, tree, loader.load, enabled,
                    values['inclusion'], values['exclusion'], values['prefix'])
            selected = evaluated['selected_ids']
            texture, texture_enabled = values['material_second_pair']
            context = (tuple(selected), model, enabled, texture, texture_enabled)
            path = SCENES['canonical'](values['descriptor'].replace('.descriptor.', '.scene.'))
            order = list(dict.fromkeys(scene.visit(scene.load(path), context, path, (path,))))
            result.update(status='bounded_input_trace', selected_ids=selected,
                ordered_materials=[scene.materials[i - 1] for i in order], material_requests=scene.requests)
            if palettes is not None:
                palette_seed, palette_enabled = values['palette_pair']
                result['base_palette_candidate'] = PALETTES['generate'](palette_seed, palettes, enabled=palette_enabled)
        except (ValueError, TypeError, OverflowError) as error:
            result.update(status='unsupported_or_budget', error=str(error))
        finally:
            result['sources'] = [{'path': path, 'archive': asset['archive'], 'sha256': asset['sha256']}
                                 for path, asset in scene.assets.items()]
            loader.close(); scene.database.close()
        results.append(result)
    report = {'runtime_verified': False, 'natural_resource_io_proven': False,
              'algorithm_executable_sha256': SCENES['CONTEXTS']['HASH'],
              'inputs_sha256': hashlib.sha256(raw).hexdigest(),
              'records': results, 'source_hashes': {path.name: hashlib.sha256(path.read_bytes()).hexdigest()
                  for path in (Path(__file__), HERE / 'trace-packed-scene-materials.py',
                               HERE / 'evaluate-descriptor-seed.py', HERE / 'evaluate-base-palettes.py',
                               HERE / 'emulate-reference-altid.py', HERE / 'emulate-packed-material-context.py',
                               HERE / 'procedural-seed-primitives.py')},
              'limitations': ['Supplied inputs are not live reads or save data.',
                              'Explicit piece inputs exercise the compared helper, not every category customisation caller.',
                              'Palette output is base-only; material masks, overrides and rendering remain unverified.',
                              'Material cache handles and geometry/async success remain controlled assumptions.']}
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open('x', encoding='utf-8') as stream:
        json.dump(report, stream, indent=2); stream.write('\n')
    successful = sum(record['status'] == 'bounded_input_trace' for record in results)
    print(json.dumps({'inputs': len(results), 'traces': successful, 'unsupported': len(results) - successful}))
    if successful != len(results):
        raise SystemExit(1)


if __name__ == '__main__':
    main()
