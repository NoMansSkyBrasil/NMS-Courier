"""Explicit-input port of the alternate palette branch; no natural caller inference."""
import math
from pathlib import Path
import runpy

BASE = runpy.run_path(str(Path(__file__).with_name('evaluate-base-palettes.py')))
CORE = BASE['core']


def configuration(threshold, fallback):
    if type(threshold) not in (int, float) or not math.isfinite(threshold) or not 0 <= threshold <= 2:
        raise ValueError('Require explicit finite similarity threshold 0..2')
    if not isinstance(fallback, (list, tuple)) or len(fallback) != 4 or any(
            type(v) not in (int, float) or not math.isfinite(v) or not 0 <= v <= 1 for v in fallback):
        raise ValueError('Require explicit finite fallback RGBA')
    return BASE['f32'](threshold), tuple(BASE['f32'](v) for v in fallback)


def palette_row(state, palette, threshold, fallback, count=5, collection_enabled=True):
    threshold, fallback = configuration(threshold, fallback)
    if type(count) is not int or not 0 <= count <= 5:
        raise ValueError('Alternate row count must be 0..5')
    if palette is not None and (type(palette['mode']) is not int or not 0 <= palette['mode'] <= 5 or
                                len(palette['colors']) != 64):
        raise ValueError('Invalid alternate palette row')
    records = []
    for _ in range(count):
        for attempt in range(64):
            state, first = CORE['advance'](state)
            state, second = CORE['advance'](state)
            index = second >> 29
            if palette is None or not collection_enabled or palette['mode'] != 3:
                index += (first >> 29) * 8
            color = fallback if palette is None else tuple(palette['colors'][index])
            close = any(BASE['f32'](math.sqrt(BASE['distance_squared'](previous['rgba'], color))) < threshold
                        for previous in records)
            if not close:
                break
        records.append({'index': index, 'lookup_index': index, 'rgba': color, 'retries': attempt})
    return state, records


def generate(seed, palettes, threshold, fallback, enabled=True, collection_enabled=True):
    configuration(threshold, fallback)
    if len(palettes) != 66:
        raise ValueError('Expected 66 palette families')
    if not collection_enabled:
        raise ValueError('Disabled collection leaves native output untouched; no fresh rows can be inferred')
    state = CORE['seed_state'](seed, enabled)
    rows = {}
    def emit(index, source):
        result, colors = palette_row(source, palettes[index], threshold, fallback)
        rows[index] = {'family': palettes[index]['family'], 'input_state': list(source), 'colors': colors}
        return result
    for index in range(66):
        state = emit(index, state)
    _, race_seed = CORE['child_seed'](state)
    race_state = CORE['seed_state'](race_seed)
    for index in (32, 35, 34, 37, 33, 36):
        emit(index, race_state)
    return [rows[index] for index in range(66)]
