"""List every biome variant the game can give a planet, from its two lists of biome files.

The system generator picks a planet's biome, then a variant ("subtype") of it by weight from
`biomefilenames`; a second roll on the older `biomefilenamesarchive` decides the infested planets
(see docs/PLANET_FINDER_NOTES.md). Each variant names the biome file that says what grows and
stands on the planet, which is the only place the game says what a `Variant_A` actually is.

Usage:
    python list-biome-variants.py <extracted archive holding metadata/simulation> <output.md>
"""
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from markdown_data import write_table  # noqa: E402

COLUMNS = ('Biome', 'Subtype', 'List', 'File', 'Weight', 'PurpleSystemWeight')


def variants(path, label):
    root = ET.parse(path).getroot()
    files = next(node for node in root if node.get('name') == 'BiomeFiles')
    for biome in files:
        for option in biome.iter('Property'):
            if option.get('value') != 'GcBiomeFileListOption':
                continue
            fields = {child.get('name'): child for child in option}
            subtype = fields['SubType'].find('Property').get('value')
            filename = fields['Filename'].get('value') or ''
            if not filename:
                continue
            short = filename.rsplit('/', 2)
            yield (biome.get('name'), subtype, label, '/'.join(short[-2:]).replace('.MXML', '').lower(),
                   '%g' % float(fields['Weight'].get('value')),
                   '%g' % float(fields['PurpleSystemWeight'].get('value')) if 'PurpleSystemWeight' in fields else '')


def main():
    corpus, output = Path(sys.argv[1]), Path(sys.argv[2])
    biomes = corpus / 'metadata' / 'simulation' / 'solarsystem' / 'biomes'
    rows = list(variants(biomes / 'biomefilenames.MXML', 'current'))
    rows += list(variants(biomes / 'biomefilenamesarchive.MXML', 'archive'))
    write_table(
        output, 'Biome variants',
        'Every biome variant in the two lists of biome files of build 180836: `current` is '
        '`biomefilenames`, `archive` is `biomefilenamesarchive`. File is the biome file the variant loads, '
        'under `metadata/simulation/solarsystem/biomes`. Weights are relative within one biome of one list; '
        'the second weight is used in purple star systems.',
        COLUMNS, rows)
    print(len(rows), 'variants')


if __name__ == '__main__':
    main()
