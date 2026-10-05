"""Catalog hash-pinned NPC race resources, presets and color declarations.

Uses the existing read-only corpus index. Declarations are not native selection
probabilities, transformed descriptor IDs or verified natural spawn inputs.
"""
import argparse
import hashlib
import json
from pathlib import Path
import runpy
import sqlite3
import xml.etree.ElementTree as ET

HERE = Path(__file__).resolve().parent
COLORS = runpy.run_path(str(HERE / 'evaluate-customisation-colors.py'))
SOURCES = {
    'npcspawntable': ('cGcNPCSpawnTable', '1d26f5e8580e51e2adb64c49451d78da6cc4106b6bb1c1f4a537347edd07e76d'),
    'npcpresetcustomisationsdata': ('cGcCustomisationPresets', 'cff4284581171aa17bccf255a9dd94dde95d1cc8f8b8eb9e13595eb8be692e3e'),
    'npccolourtable': ('cGcNPCColourTable', '8a84a5641693ae1c183ff67929037a39f46d94350fd27317d9bcb1122994f41d'),
}


def fields(node):
    result = {}
    for child in node:
        name = child.get('name')
        if name is None or name in result:
            raise ValueError('Missing or duplicate named property')
        result[name] = child
    return result


def value(node, name):
    return fields(node)[name].get('value')


def color(node):
    return COLORS['rgba']([float(value(node, channel)) for channel in ('R', 'G', 'B', 'A')])


def read_source(database, corpus, name):
    resource = 'metadata/simulation/npcs/' + name + '.mbin'
    rows = database.execute('SELECT xml_path,content_hash,archive FROM files WHERE path=? LIMIT 2', (resource,)).fetchall()
    if len(rows) != 1 or not rows[0][0] or rows[0][1] != SOURCES[name][1]:
        raise ValueError('NPC source missing, ambiguous or fingerprint mismatch: ' + resource)
    source = Path(rows[0][0]).resolve(); binary = source.with_suffix('.MBIN')
    if any(not p.is_relative_to(corpus) for p in (source, binary)) or max(source.stat().st_size, binary.stat().st_size) > 1024**2:
        raise ValueError('NPC source path/byte budget exceeded')
    raw, xml = binary.read_bytes(), source.read_bytes()
    if hashlib.sha256(raw).hexdigest() != rows[0][1] or b'<!DOCTYPE' in xml or b'<!ENTITY' in xml:
        raise ValueError('NPC binary/XML fingerprint mismatch')
    root = ET.fromstring(xml)
    if root.get('template') != SOURCES[name][0] or sum(1 for _ in root.iter()) > 20000:
        raise ValueError('NPC schema/node budget exceeded')
    return root, {'resource': resource, 'archive': rows[0][2], 'binary_sha256': rows[0][1],
                  'xml_sha256': hashlib.sha256(xml).hexdigest(), 'bytes_read': len(raw) + len(xml)}


def catalog(corpus):
    corpus = corpus.resolve()
    database = sqlite3.connect((corpus / 'index.sqlite').as_uri() + '?mode=ro', uri=True)
    try:
        loaded = {name: read_source(database, corpus, name) for name in SOURCES}
        spawn = fields(loaded['npcspawntable'][0])
        scales = {x.get('name'): x.get('value') for x in spawn['NPCRaceScale']}
        races = [{'race': x.get('name'), 'scene': x.get('value'), 'scale_raw': scales.get(x.get('name'))}
                 for x in spawn['NPCModelNames']]
        uniques = []
        for node in spawn['UniqueNPCs']:
            parts = fields(node); resource = fields(parts['ResourceElement'])
            uniques.append({'id': parts['Id'].get('value'), 'preset_id': parts['PresetId'].get('value'),
                'scene': resource['Filename'].get('value'), 'resource_seed_raw': resource['Seed'].get('value'),
                'alt_id': resource['AltId'].get('value'), 'race': value(parts['Race'], 'AlienRace'),
                'scale_raw': parts['Scale'].get('value')})
        placements = []
        for node in spawn['PlacementInfos']:
            parts = fields(node)
            placements.append({'rule': parts['PlacementRuleId'].get('value'),
                'specific_npc': parts['SpawnSpecific'].get('value'), 'race': value(parts['Race'], 'AlienRace'),
                'spawn_chance_raw': parts['SpawnChance'].get('value'),
                'fraction_active_raw': parts['FractionOfNodesActive'].get('value'),
                'max_nodes_raw': parts['MaxNodesActivated'].get('value'),
                'spawn_any_major_race_raw': parts['SpawnAnyMajorRace'].get('value')})
        presets = []
        for node in fields(loaded['npcpresetcustomisationsdata'][0])['Presets']:
            parts = fields(node); data = fields(parts['Data']); edits = []
            for entry in data['Colours']:
                item = fields(entry); palette = fields(item['Palette'])
                edits.append({'family': palette['Palette'].get('value'), 'slot': palette['ColourAlt'].get('value'),
                              'index_raw': palette['Index'].get('value'), 'rgba_xml_candidate': color(item['Colour'])})
            bones = [{x.get('name'): x.get('value') for x in node} for node in data['BoneScales']]
            presets.append({'name': parts['Name'].get('value'), 'seasonal_starter_raw': parts['CanBeSeasonalStarter'].get('value'),
                'descriptor_groups_raw': [x.get('value') for x in data['DescriptorGroups']],
                'palette_id': data['PaletteID'].get('value'), 'colors': edits,
                'bone_scales': bones, 'scale_raw': data['Scale'].get('value')})
        groups = [{'index': i, 'rarity_raw': value(node, 'Rarity'), 'primary_xml_candidate': color(fields(node)['Primary']),
                   'secondary_xml_candidates': [color(x) for x in fields(node)['Secondary']]}
                  for i, node in enumerate(fields(loaded['npccolourtable'][0])['Groups'])]
        resources = sorted({x['scene'].lower() for x in races + uniques if x['scene']})
        edges = []
        for scene in resources:
            descriptor = scene.replace('.scene.', '.descriptor.')
            rows = database.execute('SELECT archive,content_hash,xml_path FROM files WHERE path=? LIMIT 3', (descriptor,)).fetchall()
            edges.append({'scene': scene, 'descriptor_candidate': descriptor,
                          'status': 'unique_converted' if len(rows) == 1 and rows[0][2] else 'ambiguous_or_unavailable',
                          'descriptor_sources': [{'archive': x[0], 'sha256': x[1], 'converted': bool(x[2])} for x in rows]})
    finally:
        database.close()
    table = COLORS['load_table'](corpus)
    return {'mode': 'declarative_npc_catalog', 'runtime_verified': False, 'native_npc_seed_caller_proven': False,
            'sources': [x[1] for x in loaded.values()], 'race_models': races, 'unique_npcs': uniques,
            'placements': placements, 'presets': presets, 'color_groups': groups, 'resource_edges': edges,
            'customisation_categories': table['categories'], 'customisation_table_sha256': table['binary_sha256'],
            'limitations': ['Rarity/placement values are declarations; native draw schedule is not recovered.',
                'Preset descriptor groups require native transformation; they are not raw selected IDs.',
                'Preset/group colors are XML-decimal candidates; quantizer palettes use verified binary float32.',
                'Race resources and named NPC constants do not prove arbitrary natural spawn seed/palette inputs.',
                'Sibling descriptor edges are corpus associations, not verified scene/material factory order.']}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--corpus', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args(); corpus, output = args.corpus.resolve(), args.output.resolve()
    if output.exists() or any(output.is_relative_to(p) for p in (corpus, HERE.parents[1])):
        parser.error('Require a new external output')
    report = catalog(corpus)
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open('x', encoding='utf-8') as stream: json.dump(report, stream, indent=2)
    print(json.dumps({'races': len(report['race_models']), 'unique_npcs': len(report['unique_npcs']),
        'presets': len(report['presets']), 'color_groups': len(report['color_groups']), 'placements': len(report['placements'])}))


if __name__ == '__main__': main()
