"""Offline candidate for the 62c480 base-collection branch, not full appearance.

Reads one hash-pinned shipped palette MBIN through the existing corpus index.
No native execution, game process, save, texture sampling or model creation.
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

core = runpy.run_path(str(Path(__file__).with_name('procedural-seed-primitives.py')))
BASE_HASH = '3521862b5b2bfb33afe3a8a5bf5a15b6b60ff60327656ec4f7ca9d5e590b9c4e'
MODES = ('Inactive', '_1', '_4', '_8', '_16', 'All')


def f32(value):
    return struct.unpack('<f', struct.pack('<f', value))[0]


def distance_squared(left, right):
    """Float32 SSE reduction: B squared plus (G squared plus R squared)."""
    blue = f32(left[2] - right[2])
    green = f32(left[1] - right[1])
    red = f32(left[0] - right[0])
    return f32(f32(blue * blue) + f32(f32(green * green) + f32(red * red)))


def load_base(corpus):
    database = sqlite3.connect((corpus / 'index.sqlite').resolve().as_uri() + '?mode=ro', uri=True)
    try:
        rows = database.execute('SELECT xml_path,content_hash FROM files WHERE path=? LIMIT 2',
                                ('metadata/simulation/solarsystem/colours/basecolourpalettes.mbin',)).fetchall()
    finally:
        database.close()
    if len(rows) != 1 or rows[0][1] != BASE_HASH:
        raise ValueError('Base palette source missing, ambiguous or fingerprint mismatch')
    xml = Path(rows[0][0]).resolve()
    binary = xml.with_suffix('.MBIN').resolve()
    if not xml.is_relative_to(corpus.resolve()) or not binary.is_relative_to(corpus.resolve()):
        raise ValueError('Palette source escaped corpus')
    if binary.stat().st_size != 32 + 66 * 0x410 or xml.stat().st_size > 4 * 1024 * 1024:
        raise ValueError('Palette source size/layout mismatch')
    data = binary.read_bytes()
    if hashlib.sha256(data).hexdigest() != BASE_HASH:
        raise ValueError('Palette binary fingerprint mismatch')
    xml_data = xml.read_bytes()
    if b'<!DOCTYPE' in xml_data or b'<!ENTITY' in xml_data:
        raise ValueError('XML entity declarations are unsupported')
    root = ET.fromstring(xml_data)
    families = next(item for item in root if item.get('name') == 'Palettes')
    if root.get('template') != 'cGcPaletteList' or len(families) != 66:
        raise ValueError('Palette family schema mismatch')
    palettes = []
    for index, family in enumerate(families):
        mode = struct.unpack_from('<I', data, 32 + index * 0x410 + 0x400)[0]
        xml_mode = next(item.get('value') for item in family if item.get('name') == 'NumColours')
        if not 0 <= mode < len(MODES) or MODES[mode] != xml_mode:
            raise ValueError('Palette mode disagreement between binary and XML')
        colors = [struct.unpack_from('<4f', data, 32 + index * 0x410 + cell * 16) for cell in range(64)]
        if not all(math.isfinite(v) for color in colors for v in color):
            raise ValueError('Nonfinite palette color')
        palettes.append({'family': family.get('name'), 'mode': mode, 'colors': colors})
    return palettes


def palette_row(state, palette):
    """Base set is already the fallback; inactive fallback follows default branch."""
    mode = MODES[palette['mode']] if palette['mode'] else 'All'
    records = []
    for _ in range(5):
        state, index = core['palette_draw'](state, mode)
        retries = 0
        while True:
            color = palette['colors'][core['palette_lookup_index'](index, mode)]
            if retries >= 64 or not any(distance_squared(previous['rgba'], color) < 2 ** -32 for previous in records):
                break
            index = (index + 1) % 64
            retries += 1
        records.append({'index': index, 'lookup_index': core['palette_lookup_index'](index, mode),
                        'rgba': color, 'retries': retries})
    return state, records


def generate(seed, palettes, enabled=True):
    """Candidate base-only 66-family schedule; caller seed channels unverified."""
    if len(palettes) != 66:
        raise ValueError('Expected 66 palette families')
    state = core['seed_state'](seed, enabled)
    rows = {}

    def emit(index, source):
        result, colors = palette_row(source, palettes[index])
        rows[index] = {'family': palettes[index]['family'], 'input_state': list(source), 'colors': colors}
        return result

    for index in range(52):
        if index == 10:
            paint_state = state
        state = emit(index, state)
    state, race_seed = core['child_seed'](state)
    state, grass_seed = core['child_seed'](state)
    race_state = core['seed_state'](race_seed)
    for index in (32, 35, 34, 37, 33, 36):
        emit(index, race_state)
    grass_state = core['seed_state'](grass_seed)
    emit(0, grass_state)
    state = emit(51, grass_state)
    _, other_seed = core['child_seed'](state)
    state = core['seed_state'](other_seed)
    for index in range(52, 66):
        if index == 56:
            emit(index, paint_state)
        else:
            state = emit(index, state)
    return [rows[index] for index in range(66)]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--corpus', type=Path, required=True)
    parser.add_argument('--seed', type=lambda value: int(value, 0), required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    corpus, output = args.corpus.resolve(), args.output.resolve()
    if output.exists() or output.is_relative_to(corpus) or output.is_relative_to(Path(__file__).resolve().parents[2]):
        parser.error('Output must be new and outside corpus/repository')
    rows = generate(args.seed, load_base(corpus))
    report = {'mode': 'experimental_base_palette_schedule', 'runtime_verified': False,
              'appearance_evaluator_complete': False, 'seed': hex(args.seed),
              'palette_binary_sha256': BASE_HASH, 'rows': rows,
              'limitations': ['Only the explicit base collection is modeled.',
                             'Caller seed propagation, alternative color branch and final material mapping remain unverified.',
                             'This report is not a ship preview or inverse seed search.']}
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(report, indent=2), encoding='utf-8')
    print(json.dumps({'families': len(rows), 'colors': sum(len(row['colors']) for row in rows), 'runtime_verified': False}))


if __name__ == '__main__':
    main()
