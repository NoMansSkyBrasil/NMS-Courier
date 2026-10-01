"""Validate corpus path containment and generated XML indexing contracts."""

import importlib.util
from pathlib import Path
import tempfile
import unittest
import xml.etree.ElementTree as ET
from unittest.mock import Mock, patch

spec = importlib.util.spec_from_file_location("bulk_game_data", Path(__file__).with_name("bulk-game-data.py"))
bulk = importlib.util.module_from_spec(spec)
spec.loader.exec_module(bulk)


class CorpusTests(unittest.TestCase):
    def test_low_space_stops_converter_and_waits_for_termination(self):
        child = Mock()
        child.poll.return_value = None
        with patch.object(bulk.subprocess, "Popen", return_value=child), \
             patch.object(bulk.shutil, "disk_usage", return_value=Mock(free=10)):
            with self.assertRaisesRegex(OSError, "reserve"):
                bulk.monitored_conversion(["fixture"], Path("."), None, 20, 0)
        child.kill.assert_called_once()
        child.wait.assert_called_once()

    def test_symbol_replacement_and_migration_keep_other_archives_searchable(self):
        with tempfile.TemporaryDirectory() as temporary:
            path = Path(temporary) / "index.sqlite"
            db = bulk.database(path)
            db.execute("INSERT INTO symbols VALUES ('old','same.mbin','old.MXML','Legacy')")
            db.commit()
            db.close()
            db = bulk.database(path)
            self.assertEqual(db.execute("SELECT count(*) FROM symbol_keys").fetchone()[0], 1)
            bulk.replace_symbols(db, "old", "same.mbin", "old.MXML", "Freighter")
            bulk.replace_symbols(db, "new", "same.mbin", "new.MXML", "Pirate")
            self.assertEqual(db.execute("SELECT archive_hash FROM symbols WHERE symbols MATCH 'Freighter'").fetchall(), [("old",)])
            self.assertEqual(db.execute("SELECT archive_hash FROM symbols WHERE symbols MATCH 'Legacy'").fetchall(), [])
            bulk.discard_symbols(db, "old", "same.mbin")
            self.assertEqual(db.execute("SELECT archive_hash FROM symbols WHERE symbols MATCH 'Pirate'").fetchall(), [("new",)])
            self.assertEqual(db.execute("SELECT count(*) FROM symbol_keys").fetchone()[0], 1)
            db.close()

    def test_archive_paths_cannot_escape_or_address_another_drive(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary).resolve()
            for name in ("../escape", "a/../../escape", "/absolute", "C:\\escape", "file:stream"):
                with self.subTest(name=name), self.assertRaises(ValueError):
                    bulk.safe_destination(root, name)
            self.assertEqual(bulk.safe_destination(root, "metadata\\tables\\a.mbin"),
                             root / "metadata" / "tables" / "a.mbin")

    def test_xml_index_keeps_game_identifiers_and_rejects_malformed_output(self):
        with tempfile.TemporaryDirectory() as temporary:
            path = Path(temporary) / "a.MXML"
            path.write_text('<Data template="GcRewardTable"><Property name="Id" value="COURIER"/></Data>')
            self.assertEqual(set(bulk.xml_symbols(path).splitlines()), {"GcRewardTable", "Id", "COURIER"})
            path.write_text('<Data><Property>')
            with self.assertRaises(ET.ParseError):
                bulk.xml_symbols(path)

    def test_geometry_candidate_uses_observed_compiler_output_name(self):
        self.assertEqual(bulk.converted_path(Path("tech.geometry.mbin.pc")), Path("tech.geometry.MXML"))
        self.assertEqual(bulk.converted_path(Path("rewardtable.mbin")), Path("rewardtable.MXML"))

    def test_interrupted_xml_is_rejected_before_converter_keep_mode(self):
        with tempfile.TemporaryDirectory() as temporary:
            path = Path(temporary) / "partial.MXML"
            path.write_text('<Data><Property name="Class"')
            self.assertFalse(bulk.validate_existing_xml(path))
            path.write_text('<Data><Property name="Class" value="S"/></Data>')
            self.assertTrue(bulk.validate_existing_xml(path))

    def test_symbol_index_omits_numeric_payload_and_retains_seed_identifiers(self):
        with tempfile.TemporaryDirectory() as temporary:
            path = Path(temporary) / "a.MXML"
            path.write_text('<Data><Property name="Amount" value="123.456"/><Property name="Seed" value="0x1AD"/></Data>')
            self.assertEqual(set(bulk.xml_symbols(path).splitlines()), {"Amount", "Seed", "0x1AD"})


if __name__ == "__main__":
    unittest.main()
