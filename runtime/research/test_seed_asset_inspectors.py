"""Exercise preset precision and dependency graph safety with synthetic assets."""
from pathlib import Path
import runpy
import sqlite3
import tempfile
import unittest
import xml.etree.ElementTree as ET

presets = runpy.run_path(str(Path(__file__).with_name('inspect-seed-presets.py')))
graph = runpy.run_path(str(Path(__file__).with_name('build-appearance-graph.py')))


class AssetInspectorTests(unittest.TestCase):
    def test_duplicate_rewards_keep_uint64_precision_without_inferred_class(self):
        root = ET.fromstring('''<Data><Property name="Id" value="SAME_REWARD"/>
          <Property name="GcRewardSpecificShip">
            <Property name="ShipResource"><Property name="Seed" value="18446744073709551615"/></Property>
            <Property name="IsGift" value="true"/>
            <Property name="ShipInventory"><Property name="Class"><Property name="InventoryClass" value="A"/></Property></Property>
          </Property><Property name="GcRewardSpecificShip">
            <Property name="ShipResource"><Property name="Seed" value="18446744073709551616"/></Property>
          </Property></Data>''')
        records = presets['catalog'](root)
        self.assertEqual(len(records), 2)
        self.assertEqual([r['reward_id'] for r in records], ['SAME_REWARD'] * 2)
        self.assertEqual(records[0]['seed_uint64_hex'], '0xffffffffffffffff')
        self.assertEqual(records[0]['inventory_class'], 'A')
        self.assertIsNone(records[1]['seed_uint64_hex'])
        self.assertIsNone(records[1]['inventory_class'])

    def test_graph_cycles_missing_siblings_and_budget_are_explicit(self):
        with tempfile.TemporaryDirectory() as directory:
            corpus = Path(directory)
            asset = corpus / 'a.xml'
            asset.write_text('<Data template="Scene"><Property value="MODELS/A.SCENE.MBIN"/></Data>')
            db = sqlite3.connect(corpus / 'index.sqlite')
            db.execute('CREATE TABLE files(path TEXT,archive TEXT,xml_path TEXT)')
            db.execute('INSERT INTO files VALUES(?,?,?)', ('models/a.scene.mbin', 'archive', str(asset)))
            db.commit()
            db.close()
            report = graph['build'](corpus, ['models/a.scene.mbin'])
            self.assertEqual(report['status'], 'completed')
            self.assertEqual(len(report['nodes']), 2)
            self.assertEqual(report['nodes']['models/a.descriptor.mbin']['status'], 'not_indexed')
            self.assertEqual(graph['build'](corpus, ['models/a.scene.mbin'], max_nodes=1)['status'], 'node_budget_reached')
            self.assertEqual(graph['build'](corpus, ['models/a.scene.mbin'], max_bytes=1)['status'], 'xml_byte_budget_reached')

    def test_duplicate_archives_are_not_assigned_a_guessed_precedence(self):
        with tempfile.TemporaryDirectory() as directory:
            corpus = Path(directory)
            db = sqlite3.connect(corpus / 'index.sqlite')
            db.execute('CREATE TABLE files(path TEXT,archive TEXT,xml_path TEXT)')
            db.executemany('INSERT INTO files VALUES(?,?,?)', [('models/a.scene.mbin', archive, None) for archive in ('a', 'b')])
            db.commit()
            db.close()
            node = graph['build'](corpus, ['models/a.scene.mbin'])['nodes']['models/a.scene.mbin']
            self.assertEqual(node['status'], 'ambiguous_archive_sources')
            self.assertEqual(node['source_count'], 2)


if __name__ == '__main__':
    unittest.main()
