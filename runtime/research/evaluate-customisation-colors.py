"""Explicit customisation color lookup, quantization and overlay, offline only.

Defaults and matching order follow pinned build-180383 native code. Source
category/PaletteID and edited colors are supplied inputs, never inferred seeds.
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

BASE = runpy.run_path(str(Path(__file__).with_name('evaluate-base-palettes.py')))
F32 = BASE['f32']
COUNTS = (0, 1, 4, 8, 16, 64)
TOLERANCE = 1 / 256
RESOURCE = 'metadata/gamestate/playerdata/customisationcolourpalettes.mbin'
TABLE_SHA256 = '29410ccb0918d4dddb483757d2f819100eeed046b192a4acc1287d6a77188387'


def rgba(value):
    if not isinstance(value, (list, tuple)) or len(value) != 4 or any(
            type(v) not in (int, float) or not math.isfinite(v) or not 0 <= v <= 1 for v in value):
        raise ValueError('Expected four finite RGBA components in 0..1')
    return tuple(F32(v) for v in value)


def quantize(color, palette):
    color = rgba(color)
    mode = palette['mode']
    if type(mode) is not int or not 0 <= mode < len(COUNTS) or len(palette['colors']) != 64:
        raise ValueError('Expected bounded native palette shape')
    best, index, distance = color, None, F32(3.4028234663852886e38)
    for i, raw in enumerate(palette['colors'][:COUNTS[mode]]):
        candidate = rgba(raw)
        if all(abs(F32(a - b)) <= TOLERANCE for a, b in zip(color, candidate)):
            return {'rgba': candidate, 'palette_index': i, 'match': 'component_tolerance'}
        squares = [F32(F32(a - b) ** 2) for a, b in zip(candidate, color)]
        squared = F32(F32(squares[0] + squares[1]) + F32(squares[2] + squares[3]))
        if squared < distance:
            best, index, distance = candidate, i, squared
    return {'rgba': best, 'palette_index': index, 'match': 'nearest' if index is not None else 'inactive_passthrough'}


def select_palette(table, palette_id, category_index):
    if not isinstance(palette_id, str) or not palette_id.isascii() or '\0' in palette_id or len(palette_id) > 16:
        raise ValueError('Palette ID requires at most sixteen ASCII bytes')
    if type(category_index) is not int or not 0 <= category_index <= 26:
        raise ValueError('Customisation category must be 0..26')
    effective = table['categories'][category_index]['palette_id'] if not palette_id and category_index != 26 else palette_id
    palette = next((p for p in table['palettes'] if p['id'] == effective), None)
    if palette is None:
        raise ValueError('Unmatched ID reaches mutable native fallback object whose runtime state is unverified')
    return palette


def overlay(edits, palette, fallback):
    """Require the five post-edit fallback slots from working offsets 1360..13a0.

    Their initialization and interaction with family-43 edits are not inferred.
    This is a supplied snapshot port of the final overlay, not the whole setter.
    """
    if not isinstance(edits, list) or len(edits) > 330 or not isinstance(fallback, list) or len(fallback) != 5:
        raise ValueError('Expected at most 330 edits and five supplied fallback slots')
    fallback = [rgba(v) for v in fallback]
    rows, resolved = [[(0, 0, 0, 0) for _ in range(5)] for _ in range(66)], []
    for edit in edits:
        if not isinstance(edit, dict) or set(edit) != {'family', 'slot', 'rgba'}:
            raise ValueError('Color edit requires family, slot and rgba')
        family, slot = edit['family'], edit['slot']
        if type(family) is not int or not 0 <= family < 66 or type(slot) is not int or not 0 <= slot < 5:
            raise ValueError('Color destination outside 66x5 working palette')
        color = quantize(edit['rgba'], palette)
        rows[family][slot] = color['rgba']
        resolved.append({'family': family, 'slot': slot, **color})
    for slot in range(5):
        if any(e['family'] == 43 and e['slot'] == slot for e in resolved) and rows[43][slot] != fallback[slot]:
            raise ValueError('Family-43 final edit conflicts with supplied post-edit fallback snapshot')
    rows[43] = fallback
    return {'precomputed': bool(edits), 'rows': overlay_snapshot(rows), 'edits': resolved}


def overlay_snapshot(rows):
    """Apply final alpha selection to an explicit post-transform 66x5 snapshot."""
    if not isinstance(rows, list) or len(rows) != 66 or any(not isinstance(row, list) or len(row) != 5 for row in rows):
        raise ValueError('Expected explicit 66x5 working-color snapshot')
    rows = [[rgba(color) for color in row] for row in rows]
    fallback = rows[43]
    return [[color if color[3] == 1.0 else fallback[slot] for slot, color in enumerate(row)] for row in rows]


def load_table(corpus):
    corpus = corpus.resolve()
    db = sqlite3.connect((corpus / 'index.sqlite').as_uri() + '?mode=ro', uri=True)
    try:
        sources = db.execute('SELECT xml_path,content_hash FROM files WHERE path=? LIMIT 2', (RESOURCE,)).fetchall()
    finally:
        db.close()
    if len(sources) != 1 or not sources[0][0]:
        raise ValueError('Customisation palette source missing or ambiguous')
    source = Path(sources[0][0]).resolve(); binary = source.with_suffix('.MBIN')
    if any(not p.is_relative_to(corpus) for p in (source, binary)) or max(source.stat().st_size, binary.stat().st_size) > 1024**2:
        raise ValueError('Customisation palette source path/byte budget exceeded')
    raw, xml = binary.read_bytes(), source.read_bytes()
    if hashlib.sha256(raw).hexdigest() != sources[0][1] or sources[0][1] != TABLE_SHA256 or b'<!DOCTYPE' in xml or b'<!ENTITY' in xml:
        raise ValueError('Customisation source fingerprint/XML mismatch')
    root = ET.fromstring(xml)
    fields = {x.get('name'): x for x in root}
    if root.get('template') != 'cGcCustomisationColourPalettes' or len(fields['CustomisationTypePalettes']) != 26:
        raise ValueError('Unsupported customisation palette schema')
    start = 32 + 0x1a0
    relative, count = struct.unpack_from('<qI', raw, start)
    start += relative
    if count != len(fields['Palettes']) or not 1 <= count <= 32 or not 32 <= start <= len(raw) - count * 0x440:
        raise ValueError('Customisation palette vector shape mismatch')
    palettes = []
    for i, node in enumerate(fields['Palettes']):
        offset = start + i * 0x440
        identity = raw[offset + 0x430:offset + 0x440].split(b'\0', 1)[0].decode('ascii')
        named = {x.get('name'): x for x in node}
        mode = struct.unpack_from('<I', raw, offset + 0x400)[0]
        declared = next(x.get('value') for x in named['PaletteData'] if x.get('name') == 'NumColours')
        if identity != named['ID'].get('value') or not 0 <= mode <= 5 or declared != BASE['MODES'][mode]:
            raise ValueError('Customisation palette binary/XML identity mismatch')
        palettes.append({'id': identity, 'mode': mode, 'colors': [struct.unpack_from('<4f', raw, offset + j * 16) for j in range(64)]})
    categories = []
    for i, node in enumerate(fields['CustomisationTypePalettes']):
        identity = raw[32 + i * 16:48 + i * 16].split(b'\0', 1)[0].decode('ascii')
        if identity != node.get('value'):
            raise ValueError('Category palette mapping mismatch')
        categories.append({'index': i, 'name': node.get('name'), 'palette_id': identity})
    return {'resource': RESOURCE, 'binary_sha256': sources[0][1], 'xml_sha256': hashlib.sha256(xml).hexdigest(),
            'palettes': palettes, 'categories': categories}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for key in ('corpus', 'request', 'output'):
        parser.add_argument('--' + key, type=Path, required=True)
    args = parser.parse_args()
    corpus, source, output = args.corpus.resolve(), args.request.resolve(), args.output.resolve()
    if output.exists() or output == source or any(output.is_relative_to(p) for p in (corpus, Path(__file__).resolve().parents[2])):
        parser.error('Require a new external output')
    if source.stat().st_size > 128 * 1024:
        parser.error('Color request byte budget exceeded')
    raw = source.read_bytes(); request = json.loads(raw)
    if not isinstance(request, dict) or set(request) != {'palette_id', 'category_index', 'edits', 'fallback_snapshot'}:
        parser.error('Require palette_id, category_index, edits and fallback_snapshot')
    table = load_table(corpus)
    palette = select_palette(table, request['palette_id'], request['category_index'])
    report = overlay(request['edits'], palette, request['fallback_snapshot'])
    report.update(runtime_verified=False, procedural_seed_inverse=False, effective_palette_id=palette['id'],
                  request_sha256=hashlib.sha256(raw).hexdigest(), table_sha256=table['binary_sha256'],
                  source_sha256=hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
                  limitations=['Quantizer, matched lookup and snapshot overlay compared with native instructions.',
                    'Fallback snapshot is supplied after all edits/transforms; its initializer is unresolved.',
                    'Explicit colors are not procedural seed-generated colors, native pixels or delivery.'])
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open('x', encoding='utf-8') as stream: json.dump(report, stream, indent=2)
    print(json.dumps({'palette': palette['id'], 'mode': palette['mode'], 'edits': len(report['edits']),
                      'precomputed': report['precomputed']}))


if __name__ == '__main__': main()
