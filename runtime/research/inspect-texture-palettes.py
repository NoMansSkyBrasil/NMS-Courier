"""Inspect explicit procedural texture alternatives through the existing corpus.

Reports declarative palette bindings; never selects textures, evaluates a seed,
extracts assets, executes game code or claims complete rendered appearance.
"""
import argparse
import hashlib
import json
from pathlib import Path
import sqlite3
import xml.etree.ElementTree as ET


def properties(node):
    return {child.get('name'): child for child in node}


def inspect(corpus, assets):
    """Read at most 32 explicit, unique XML sources within a 16 MiB budget."""
    if not 1 <= len(assets) <= 32:
        raise ValueError('Provide 1..32 texture resources')
    database = sqlite3.connect((corpus / 'index.sqlite').resolve().as_uri() + '?mode=ro', uri=True)
    sources, total_bytes = [], 0
    try:
        for requested in assets:
            logical = requested.replace('\\', '/').lower()
            if not logical.endswith('.texture.mbin') or '..' in logical.split('/'):
                raise ValueError('Expected a logical texture MBIN resource')
            rows = database.execute('SELECT xml_path, content_hash FROM files WHERE path=? LIMIT 2', (logical,)).fetchall()
            if len(rows) != 1 or not rows[0][0]:
                sources.append({'resource': logical, 'status': 'missing_or_ambiguous_source'})
                continue
            xml = Path(rows[0][0]).resolve()
            binary = xml.with_suffix('.MBIN')
            if not xml.is_relative_to(corpus.resolve()) or not binary.is_relative_to(corpus.resolve()):
                raise ValueError('Source escaped corpus')
            size, binary_size = xml.stat().st_size, binary.stat().st_size
            total_bytes += size + binary_size
            if max(size, binary_size) > 2 * 1024 * 1024 or total_bytes > 16 * 1024 * 1024:
                raise ValueError('Texture inspection byte budget exceeded')
            xml_data = xml.read_bytes()
            if b'<!DOCTYPE' in xml_data or b'<!ENTITY' in xml_data:
                raise ValueError('XML entity declarations are unsupported')
            if hashlib.sha256(binary.read_bytes()).hexdigest() != rows[0][1]:
                raise ValueError('Texture source fingerprint mismatch')
            root = ET.fromstring(xml_data)
            fields = properties(root)
            if root.get('template') != 'cTkProceduralTextureList' or 'Layers' not in fields:
                raise ValueError('Unsupported texture schema')
            layers = []
            if len(fields['Layers']) > 64:
                raise ValueError('Layer budget exceeded')
            for layer in fields['Layers']:
                values = properties(layer)
                textures = values.get('Textures')
                if textures is None:
                    raise ValueError('Missing texture alternatives')
                if len(textures) > 256:
                    raise ValueError('Texture option budget exceeded')
                options = []
                for texture in textures:
                    option = properties(texture)
                    palette = option.get('Palette')
                    if palette is None or palette.get('value') != 'TkPaletteTexture':
                        raise ValueError('Missing palette binding')
                    options.append({
                        'fields': {key: child.get('value') for key, child in option.items() if key != 'Palette' and child.get('value') is not None},
                        'palette': {key: child.get('value') for key, child in properties(palette).items()}
                    })
                layers.append({'fields': {key: child.get('value') for key, child in values.items() if key != 'Textures'},
                               'options': options})
            sources.append({'resource': logical, 'status': 'inspected', 'binary_sha256': rows[0][1],
                            'xml_sha256': hashlib.sha256(xml_data).hexdigest(), 'layers': layers})
    finally:
        database.close()
    return {'mode': 'declarative_texture_palette_bindings', 'runtime_verified': False,
            'appearance_evaluator_complete': False, 'bytes_read': total_bytes, 'sources': sources,
            'limitations': ['All declared alternatives are retained; none is asserted to be selected.',
                            'ColourAlt None, explicit indices, texture pixels, blend masks and caller seed propagation require separate evaluation.']}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--corpus', type=Path, required=True)
    parser.add_argument('--asset', action='append', required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    corpus, output = args.corpus.resolve(), args.output.resolve()
    if output.exists() or output.is_relative_to(corpus) or output.is_relative_to(Path(__file__).resolve().parents[2]):
        parser.error('Output must be new and outside corpus/repository')
    report = inspect(corpus, args.asset)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(report, indent=2), encoding='utf-8')
    print(json.dumps({'sources': len(report['sources']), 'inspected': sum(source['status'] == 'inspected' for source in report['sources']),
                      'bytes_read': report['bytes_read']}))


if __name__ == '__main__':
    main()
