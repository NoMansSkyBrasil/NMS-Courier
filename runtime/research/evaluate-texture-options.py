"""Bounded first-pass and fresh-single candidates for 631310 texture selection.

Requires explicit texture and palette inputs; rejects merged/duplicate layers,
gameplay name matching and non-default indices. No rendering, runtime calls or
complete entity/inverse-seed claim. The first-pass state is intermediate;
fresh-single adds bounded fallback/base matching and later draws.
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


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--corpus', type=Path, required=True)
    parser.add_argument('--asset', required=True)
    parser.add_argument('--texture-seed', type=lambda v: int(v, 0), required=True)
    parser.add_argument('--palette-seed', type=lambda v: int(v, 0), required=True)
    parser.add_argument('--phase', choices=('first-pass', 'fresh-single'), default='first-pass')
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    corpus, output = args.corpus.resolve(), args.output.resolve()
    if output.exists() or output.is_relative_to(corpus) or output.is_relative_to(Path(__file__).resolve().parents[2]):
        parser.error('Output must be new and outside corpus/repository')
    source = T['inspect'](corpus, [args.asset])['sources'][0]
    rows = B['generate'](args.palette_seed, B['load_base'](corpus))
    result = (evaluate_fresh_single if args.phase == 'fresh-single' else evaluate)(source, args.texture_seed, rows)
    report = {'mode': 'experimental_single_resource_texture_' + args.phase.replace('-', '_'),
              'offline_exe_sha256': '671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4',
              'native_candidate_rva': '0x631310',
              'runtime_verified': False, 'appearance_evaluator_complete': False,
              'texture_seed': hex(args.texture_seed), 'palette_seed': hex(args.palette_seed),
              'source_hashes': {key: source.get(key) for key in ('binary_sha256', 'xml_sha256')},
              'palette_binary_sha256': B['BASE_HASH'],
              'result': result,
              'limitations': (['First pass only; compatibility/base matching and their draws are not evaluated.'] if args.phase == 'first-pass' else []) + [
                              'Single resource, at most 256 alternatives per layer; no merged collection.',
                              'Only fresh/default context, unique layer names, no links or gameplay-name filtering.',
                              'Explicit caller seeds; neither is inferred from an entity/model seed.',
                              'Base palette candidate only; no DDS masks/shaders, native rendering or full inverse.']}
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(report, indent=2), encoding='utf-8')
    print(json.dumps({'layers': len(result['layers'] if args.phase == 'first-pass' else result['first_pass']['layers']),
                      'phase': args.phase, 'runtime_verified': False}))


if __name__ == '__main__':
    main()
