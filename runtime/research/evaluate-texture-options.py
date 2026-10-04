"""Bounded first-pass, fresh-single and fresh-merged texture selection candidates.

Requires explicit ordered texture and palette inputs; rejects linked layers,
gameplay name matching and non-default indices. No rendering, runtime calls or
complete entity/inverse-seed claim. The first-pass state is intermediate;
fresh modes add bounded fallback/base matching and later draws. Merged mode
reconstructs collection before selection; natural material order remains open.
"""
import argparse
import json
import math
from pathlib import Path
import runpy
import struct

P = runpy.run_path(str(Path(__file__).with_name('procedural-seed-primitives.py')))
T = runpy.run_path(str(Path(__file__).with_name('inspect-texture-palettes.py')))
B = runpy.run_path(str(Path(__file__).with_name('evaluate-base-palettes.py')))
DRAW_SCALE = struct.unpack('<d', bytes.fromhex('000010000000f03d'))[0]
CHANNELS = ('Primary', 'Alternative1', 'Alternative2', 'Alternative3',
            'Alternative4', 'Unique', 'MatchGround', 'None')


def f32(value):
    return struct.unpack('<f', struct.pack('<f', value))[0]


def probability(value):
    result = f32(float(value))
    if not math.isfinite(result) or result < 0:
        raise ValueError('Probability must be finite and nonnegative')
    return result


def fraction(draw):
    if not 0 <= draw <= P['MASK32']:
        raise ValueError('Draw must fit uint32')
    return f32(draw * DRAW_SCALE)


def choose(draw, weights):
    """Strict cumulative float32 comparison, not integer descriptor weighting."""
    total = 0.0
    for weight in weights:
        total = f32(total + weight)
    if not math.isfinite(total):
        raise ValueError('Texture weight sum overflow')
    target = f32(fraction(draw) * total)
    cumulative = 0.0
    for index, weight in enumerate(weights):
        cumulative = f32(cumulative + weight)
        if target < cumulative:
            return index
    return None


def color_binding(binding, rows, ground=None):
    """Port the observed selector branch; zero RGBA is not a rendered black claim."""
    if binding.get('Index') != '-1':
        raise ValueError('Only declared default Index=-1 is supported')
    channel = binding['ColourAlt']
    if channel not in CHANNELS:
        raise ValueError('Unknown color channel')
    if channel == 'None':
        return {'mode': 'no_palette_tint_payload', 'rgba': [0.0] * 4}
    if channel == 'MatchGround':
        return {'mode': 'caller_ground_color', 'rgba': ground}
    slot = CHANNELS.index(channel)
    # Native 631660..63167a uses slot 3 for selectors above 3, except 6/7.
    slot = slot if slot < 4 else 3
    families = {row['family']: row for row in rows}
    if binding['Palette'] not in families:
        raise ValueError('Palette family unavailable')
    return {'mode': 'experimental_base_palette', 'sample_slot': slot,
            'rgba': families[binding['Palette']]['colors'][slot]['rgba']}


def evaluate(source, texture_seed, palette_rows, enabled=True):
    if source.get('status') != 'inspected' or len(source['layers']) > 8:
        raise ValueError('Expected inspected native eight-layer resource')
    state = P['seed_state'](texture_seed, enabled)
    output, names = [], set()
    for layer in source['layers']:
        fields = layer['fields']
        options = layer['options']
        if not options:
            continue
        name = fields['Name']
        if name in names or fields.get('LinkedLayer'):
            raise ValueError('Linked or duplicate layers require collector evaluation')
        names.add(name)
        if fields.get('SelectToMatchBase') not in ('false', 'true'):
            raise ValueError('Unknown base-matching flag')
        if any(o['fields'].get('TextureGameplayUse') != 'IgnoreName' for o in options):
            raise ValueError('Gameplay name matching requires caller context')
        if len(options) > 256:
            raise ValueError('Texture option budget exceeded')
        if any(o['palette'].get('Index') != '-1' for o in options):
            raise ValueError('Explicit palette indices are unsupported')
        weights = [probability(o['fields']['Probability']) for o in options]
        chance = probability(fields['Probability'])
        before = list(state)
        draws = []
        selected = None
        if chance > 0:
            state, draw = P['advance'](state)
            draws.append(draw)
            if fraction(draw) < chance and fields['SelectToMatchBase'] == 'false':
                state, draw = P['advance'](state)
                draws.append(draw)
                selected = choose(draw, weights)
        record = {'layer': name, 'state_before': before, 'draws': draws,
                  'option_index': selected, 'state_after': list(state)}
        if selected is not None:
            option = options[selected]
            record.update(option=option, color=color_binding(option['palette'], palette_rows))
        output.append(record)
    return {'source': source['resource'], 'layers': output, 'first_pass_state': list(state)}


def evaluate_fresh_single(source, texture_seed, palette_rows, enabled=True):
    """Add compatibility fallback/state draws for the restricted default case.

    The first-pass validator enforces unique layers, no links or name
    filters. No merged-resource, edited-context or alternate palette claim.
    """
    first = evaluate(source, texture_seed, palette_rows, enabled)
    layers = [layer for layer in source['layers'] if layer['options']]
    family_indices = {row['family']: i for i, row in enumerate(palette_rows)}
    if any(o['palette']['ColourAlt'] == 'MatchGround' for layer in layers for o in layer['options']):
        raise ValueError('Fresh-single requires an explicit ground color implementation')

    def option_row(layer, option):
        binding = option['palette']
        return {'name': option['fields']['Name'], 'layer': layer['fields']['Name'],
                'group': layer['fields']['Group'], 'rgba': list(color_binding(binding, palette_rows)['rgba']),
                'selector': CHANNELS.index(binding['ColourAlt']),
                'family_index': family_indices[binding['Palette']]}

    rows, fallback = [], []
    for layer, selected in zip(layers, first['layers'], strict=True):
        if selected.get('option'):
            rows.append(option_row(layer, selected['option']))
        else:
            rows.append({'name': '', 'layer': layer['fields']['Name'], 'group': layer['fields']['Group'],
                         'rgba': [1.0]*4, 'selector': 0, 'family_index': 4})
    # 631c42..631c5e advances the resource after its first eligible layer.
    # Only empty/BASE groups qualify; other groups remain independent here.
    eligible = [layer for layer in layers if layer['fields']['Group'] in ('', 'BASE')]
    for layer in eligible[:1]:
        options = [option_row(layer, o) for o in layer['options']]
        if not any(row['layer'] == layer['fields']['Name'] and
                   all(row[key] == option[key] for key in ('name', 'group', 'selector', 'family_index'))
                   for row in rows for option in options):
            rows.append(options[0])
            fallback.append(layer['fields']['Name'])
    state, later_draws = tuple(first['first_pass_state']), []
    # Native later loop rolls every collected row, even when its base flag is false.
    for index, layer in enumerate(layers):
        state, draw = P['advance'](state)
        later_draws.append({'layer': layer['fields']['Name'], 'draw': draw})
        if layer['fields']['SelectToMatchBase'] == 'true' and fraction(draw) < probability(layer['fields']['Probability']):
            compatible = next((option for row in rows
                               if row['group'] in ('', 'BASE') and row['layer'] == layer['fields']['Name']
                               for option in layer['options'] if row['name'] == option['fields']['Name']), None)
            if compatible is not None:
                replacement = option_row(layer, compatible)
                replacement['group'] = rows[index]['group']
                rows[index] = replacement
    return {'first_pass': first, 'final_rows': rows, 'fallback_layers': fallback,
            'later_draws': later_draws, 'selector_exit_state': list(state),
            'scope': 'Restricted fresh single resource; default context only'}


def evaluate_fresh_resources(sources, texture_seed, palette_rows, enabled=True):
    """Merged unlinked IgnoreName candidate with explicit resource order.

    Source/caller order must be supplied; this does not discover material order.
    Default indices and no caller ground color only. Returns complete row/state
    traces for isolated native comparison, not a whole entity appearance claim.
    """
    if not 1 <= len(sources) <= 8 or any(s.get('status') != 'inspected' or len(s['layers']) > 8 for s in sources):
        raise ValueError('Expected 1..8 inspected eight-layer resources')
    layers = []
    for source in sources:
        flag = source.get('declaration_fields', {}).get('AlwaysEnableUnnamedTextureLayers', 'false')
        if flag not in ('true', 'false'):
            raise ValueError('Unknown unnamed-layer mode')
        layers += [dict(layer, always_enable_unnamed=flag == 'true') for layer in source['layers']]
    for layer in layers:
        if layer['fields'].get('SelectToMatchBase') not in ('true', 'false'):
            raise ValueError('Unknown base-matching flag')
        if len(layer['options']) > 256 or any(o['palette']['Index'] != '-1' or
                o['palette']['ColourAlt'] == 'MatchGround' for o in layer['options']):
            raise ValueError('Unsupported option count/index/ground context')
    families = {row['family']: i for i, row in enumerate(palette_rows)}
    collector = runpy.run_path(str(Path(__file__).with_name('emulate-texture-collection.py')))
    groups = collector['collect'](layers, families)
    if not 1 <= len(groups) <= 16 or any(len(g['options']) > 256 for g in groups):
        raise ValueError('Merged group/option budget exceeded')
    family_names = {i: name for name, i in families.items()}

    def binding(option):
        return {'Index': '-1', 'Palette': family_names[option['family_index']],
                'ColourAlt': CHANNELS[option['selector']]}

    def row(group, option):
        return {'name': option['name'], 'layer': group['layer'], 'group': group['group'],
                'selector': option['selector'], 'family_index': option['family_index'],
                'rgba': list(color_binding(binding(option), palette_rows)['rgba'])}

    def declared_row(layer, option):
        b = option['palette']
        return {'name': option['fields']['Name'], 'layer': layer['fields']['Name'],
                'group': layer['fields']['Group'], 'selector': CHANNELS.index(b['ColourAlt']),
                'family_index': families[b['Palette']],
                'rgba': list(color_binding(b, palette_rows)['rgba'])}

    state, records, rows = P['seed_state'](texture_seed, enabled), [], []
    for group in groups:
        chance = f32(group['probability_sum'] / group['occurrences'])
        weights = [f32(o['probability_sum'] / o['occurrences']) for o in group['options']]
        before, draws, selected = list(state), [], None
        if chance > 0:
            state, draw = P['advance'](state); draws.append(draw)
            if fraction(draw) < chance and not group['base_match']:
                state, draw = P['advance'](state); draws.append(draw)
                selected = choose(draw, weights)
        chosen = row(group, group['options'][selected]) if selected is not None else {
            'name': '', 'layer': group['layer'], 'group': group['group'],
            'selector': 0, 'family_index': 4, 'rgba': [1.0]*4}
        rows.append(chosen)
        records.append({'layer': group['layer'], 'group': group['group'], 'state_before': before,
                        'draws': draws, 'option_index': selected, 'row': dict(chosen), 'state_after': list(state)})
    first_state, fallback = list(state), []
    for source in sources:
        eligible = next((l for l in source['layers'] if l['options'] and l['fields']['Group'] in ('', 'BASE')), None)
        if eligible is None:
            continue
        options = [declared_row(eligible, o) for o in eligible['options']]
        remembered, matched = None, False
        for existing in rows:
            if (existing['layer'], existing['group']) != (eligible['fields']['Name'], eligible['fields']['Group']):
                continue
            for option in options:
                if option['name'] == existing['name']:
                    remembered = option
                    if all(option[k] == existing[k] for k in ('selector', 'family_index')):
                        matched = True
        if not matched:
            rows.append(dict(remembered or options[0]))
            fallback.append({'resource': source['resource'], 'layer': eligible['fields']['Name']})
    later = []
    for i, group in enumerate(groups):
        state, draw = P['advance'](state)
        later.append({'layer': group['layer'], 'group': group['group'], 'draw': draw})
        chance = f32(group['probability_sum'] / group['occurrences'])
        if group['base_match'] and fraction(draw) < chance:
            match = next((o for existing in rows if existing['group'] in ('', 'BASE') and
                          existing['layer'] == group['layer'] for o in group['options'] if o['name'] == existing['name']), None)
            if match is not None:
                rows[i] = row(group, match)
    return {'first_pass': {'layers': records, 'first_pass_state': first_state},
            'collected': groups, 'final_rows': rows, 'fallback_layers': fallback,
            'later_draws': later, 'selector_exit_state': list(state),
            'scope': 'Merged fresh default candidate; explicit declaration order, unlinked IgnoreName'}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--corpus', type=Path, required=True)
    parser.add_argument('--asset', action='append', required=True)
    parser.add_argument('--texture-seed', type=lambda v: int(v, 0), required=True)
    parser.add_argument('--palette-seed', type=lambda v: int(v, 0), required=True)
    parser.add_argument('--phase', choices=('first-pass', 'fresh-single', 'fresh-merged'), default='first-pass')
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    corpus, output = args.corpus.resolve(), args.output.resolve()
    if output.exists() or output.is_relative_to(corpus) or output.is_relative_to(Path(__file__).resolve().parents[2]):
        parser.error('Output must be new and outside corpus/repository')
    if not 1 <= len(args.asset) <= 8 or args.phase != 'fresh-merged' and len(args.asset) != 1:
        parser.error('Use exactly one asset unless fresh-merged (1..8 in explicit order)')
    sources = T['inspect'](corpus, args.asset)['sources']
    source = sources[0]
    rows = B['generate'](args.palette_seed, B['load_base'](corpus))
    result = (evaluate_fresh_resources(sources, args.texture_seed, rows) if args.phase == 'fresh-merged' else
              (evaluate_fresh_single if args.phase == 'fresh-single' else evaluate)(source, args.texture_seed, rows))
    report = {'mode': 'experimental_texture_' + args.phase.replace('-', '_'),
              'offline_exe_sha256': '671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4',
              'native_candidate_rva': '0x631310',
              'runtime_verified': False, 'appearance_evaluator_complete': False,
              'texture_seed': hex(args.texture_seed), 'palette_seed': hex(args.palette_seed),
              'source_hashes': {key: source.get(key) for key in ('binary_sha256', 'xml_sha256')},
              'ordered_sources': [{key: s.get(key) for key in ('resource', 'binary_sha256', 'xml_sha256')} for s in sources],
              'palette_binary_sha256': B['BASE_HASH'],
              'result': result,
              'limitations': (['First pass only; compatibility/base matching and their draws are not evaluated.'] if args.phase == 'first-pass' else []) + [
                              ('Explicit resource order; at most 16 merged groups and 256 options per group.' if args.phase == 'fresh-merged'
                               else 'Single resource, at most 256 alternatives per layer; no merged collection.'),
                              'Only fresh/default context, no links or gameplay-name filtering.',
                              'Explicit caller seeds; neither is inferred from an entity/model seed.',
                              'Base palette candidate only; no DDS masks/shaders, native rendering or full inverse.']}
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open('x', encoding='utf-8') as stream:
        json.dump(report, stream, indent=2)
    print(json.dumps({'layers': len(result['layers'] if args.phase == 'first-pass' else result['first_pass']['layers']),
                      'phase': args.phase, 'runtime_verified': False}))


if __name__ == '__main__':
    main()
