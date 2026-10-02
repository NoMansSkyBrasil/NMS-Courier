"""Catalog model/seed inputs from shipped reward definitions, without save access."""
import argparse
import hashlib
import json
from pathlib import Path
import sqlite3
import xml.etree.ElementTree as ET


def child(node, name):
    return next((item for item in node if item.get('name') == name), None) if node is not None else None


def value(node, name):
    item = child(node, name)
    return item.get('value') if item is not None else None


def catalog(root):
    parents = {item: node for node in root.iter() for item in node}
    records = []
    for node in root.iter():
        if node.get('name') != 'GcRewardSpecificShip':
            continue
        if len(records) >= 512:
            raise ValueError('Specific ship reward budget exceeded')
        ancestor, reward_id = node, None
        while ancestor is not None:
            reward_id = value(ancestor, 'Id')
            if reward_id is not None:
                break
            ancestor = parents.get(ancestor)
        resource = child(node, 'ShipResource')
        inventory = child(node, 'ShipInventory')
        samplers = child(child(resource, 'ProceduralTexture'), 'Samplers')
        customisation = child(node, 'Customisation')
        raw_seed = value(resource, 'Seed')
        normalized = None
        if raw_seed:
            try:
                number = int(raw_seed, 16 if raw_seed.lower().startswith('0x') else 10)
                if 0 <= number < 1 << 64:
                    normalized = hex(number)
            except ValueError:
                pass
        records.append({'reward_id': reward_id, 'name_override': value(node, 'NameOverride'),
                        'filename': value(resource, 'Filename'), 'seed_raw': raw_seed,
                        'seed_uint64_hex': normalized,
                        'inventory_class': value(child(inventory, 'Class'), 'InventoryClass'),
                        'ship_category': value(child(node, 'ShipType'), 'ShipClass'),
                        'is_gift': value(node, 'IsGift'), 'is_reward_ship': value(node, 'IsRewardShip'),
                        'cost_amount_raw': value(node, 'CostAmount'),
                        'cost_currency': value(child(node, 'CostCurrency'), 'Currency'),
                        'texture_sampler_count': len(samplers) if samplers is not None else None,
                        'customisation_palette_id': value(customisation, 'PaletteID'),
                        'customisation_counts': {key: len(item) if (item := child(customisation, key)) is not None else None
                                                 for key in ('DescriptorGroups', 'Colours', 'TextureOptions')},
                        'cargo_dimensions_raw': [value(inventory, 'Width'), value(inventory, 'Height')]})
    return records


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--corpus', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    corpus, output = args.corpus.resolve(), args.output.resolve()
    if output.exists() or output.is_relative_to(corpus) or output.is_relative_to(Path(__file__).resolve().parents[2]):
        parser.error('Output must be new and outside corpus/repository')
    database = sqlite3.connect((corpus / 'index.sqlite').as_uri() + '?mode=ro', uri=True)
    try:
        rows = database.execute('SELECT archive,xml_path FROM files WHERE lower(path)=? LIMIT 17',
                                ('metadata/reality/tables/rewardtable.mbin',)).fetchall()
    finally:
        database.close()
    if not 1 <= len(rows) <= 16:
        raise ValueError('Reward table missing or duplicate budget exceeded')
    sources = []
    for archive, xml in rows:
        if not xml:
            sources.append({'archive': archive, 'status': 'xml_unavailable'})
            continue
        path = Path(xml).resolve()
        if not path.is_relative_to(corpus) or path.stat().st_size > 32 * 1024 * 1024:
            raise ValueError('Reward XML containment/size budget exceeded')
        data = path.read_bytes()
        if b'<!DOCTYPE' in data or b'<!ENTITY' in data:
            raise ValueError('XML entity declarations are unsupported')
        root = ET.fromstring(data)
        sources.append({'archive': archive, 'status': 'cataloged',
                        'xml_sha256': hashlib.sha256(data).hexdigest(), 'records': catalog(root)})
    report = {'mode': 'shipped_reward_seed_presets', 'runtime_verified': False,
              'sources': sources, 'limitations': ['No reward is triggered.',
              'Source seed/model/class fields do not prove runtime output or IsGift causality.',
              'Dimensions are source fields, not verified unlocked slot counts.']}
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(report, indent=2), encoding='utf-8')
    print(json.dumps({'sources': len(sources), 'records': sum(len(s.get('records', [])) for s in sources)}))


if __name__ == '__main__':
    main()
