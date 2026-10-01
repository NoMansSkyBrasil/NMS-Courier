"""Verify pilot containment and converter failure boundaries with fixtures."""

import importlib.util
from pathlib import Path
import tempfile
import unittest
from unittest.mock import Mock, patch

spec = importlib.util.spec_from_file_location("pilot", Path(__file__).with_name("extract-mbin-pilot.py"))
pilot = importlib.util.module_from_spec(spec)
spec.loader.exec_module(pilot)


class PilotTests(unittest.TestCase):
    def test_existing_stage_is_rejected_without_modifying_contents(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory).resolve()
            marker = root / "marker"
            marker.write_text("preserve", encoding="utf-8")
            with self.assertRaisesRegex(ValueError, "new directories"):
                pilot.validate_roots(root / "game", root, root / "out",
                                     root / "tools/compiler", root / "tools/python")
            self.assertEqual(marker.read_text(encoding="utf-8"), "preserve")

    def test_game_output_overlap_is_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory).resolve()
            with self.assertRaisesRegex(ValueError, "protected"):
                pilot.validate_roots(root / "game", root / "game/stage", root / "out",
                                     root / "tools/compiler", root / "tools/python")

    def test_budget_excess_kills_converter_and_keeps_evidence(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            child = Mock()
            child.poll.return_value = None
            with patch.object(pilot.subprocess, "Popen", return_value=child), \
                 patch.object(pilot, "stage_size", return_value=pilot.MAX_STAGE + 1):
                with self.assertRaisesRegex(RuntimeError, "budget"):
                    pilot.convert(root / "compiler", root / "asset.mbin", root)
            child.kill.assert_called_once()
            child.wait.assert_called_once()
            self.assertTrue((root / "asset.conversion.log").is_file())


if __name__ == "__main__":
    unittest.main()
