"""Bounded first-pass candidate for the fresh 631310 texture branch.

Requires explicit texture and palette inputs; rejects grouping, linked layers,
base matching, gameplay name matching and non-default indices. No rendering,
runtime calls or complete entity/inverse-seed claim. Later compatibility and
base-matching passes are not evaluated; the final state is intermediate.
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
        if name in names or fields.get('Group') or fields.get('LinkedLayer'):
            raise ValueError('Grouped, linked or duplicate layers require collector evaluation')
        names.add(name)
        if fields.get('SelectToMatchBase') != 'false':
            raise ValueError('Base matching is unsupported')
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
            if fraction(draw) < chance:
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


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--corpus', type=Path, required=True)
    parser.add_argument('--asset', required=True)
    parser.add_argument('--texture-seed', type=lambda v: int(v, 0), required=True)
    parser.add_argument('--palette-seed', type=lambda v: int(v, 0), required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    corpus, output = args.corpus.resolve(), args.output.resolve()
    if output.exists() or output.is_relative_to(corpus) or output.is_relative_to(Path(__file__).resolve().parents[2]):
        parser.error('Output must be new and outside corpus/repository')
    source = T['inspect'](corpus, [args.asset])['sources'][0]
    rows = B['generate'](args.palette_seed, B['load_base'](corpus))
    report = {'mode': 'experimental_single_resource_texture_first_pass',
              'offline_exe_sha256': '671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4',
              'native_candidate_rva': '0x631310',
              'runtime_verified': False, 'appearance_evaluator_complete': False,
              'texture_seed': hex(args.texture_seed), 'palette_seed': hex(args.palette_seed),
              'source_hashes': {key: source.get(key) for key in ('binary_sha256', 'xml_sha256')},
              'palette_binary_sha256': B['BASE_HASH'],
              'result': evaluate(source, args.texture_seed, rows),
              'limitations': ['First pass only; later compatibility/base matching and their draws are not evaluated.',
                              'Single resource, at most 256 alternatives per layer; no merged collection.',
                              'Only fresh selection with empty groups, no links/base matching or gameplay-name filtering.',
                              'Explicit caller seeds; neither is inferred from an entity/model seed.',
                              'Base palette candidate only; no DDS masks/shaders, native rendering or full inverse.']}
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(report, indent=2), encoding='utf-8')
    print(json.dumps({'layers': len(report['result']['layers']), 'runtime_verified': False}))


if __name__ == '__main__':
    main()
