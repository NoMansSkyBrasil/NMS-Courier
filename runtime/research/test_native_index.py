"""Verify candidate indexing retains failure evidence and prefers focused exports."""
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

spec = importlib.util.spec_from_file_location('research_index', Path(__file__).with_name('build-research-index.py'))
index = importlib.util.module_from_spec(spec)
spec.loader.exec_module(index)


class NativeIndexTests(unittest.TestCase):
    def test_focused_success_replaces_timeout_without_claiming_verification(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            (root / 'run.json').write_text(json.dumps({'exe_sha256': 'a' * 64}))
            for directory, status in (('export', 'failed'), ('focused-export', 'decompiled')):
                target = root / directory
                target.mkdir()
                (target / 'manifest.tsv').write_text('rva\tpublic_candidate\tstatus\n123\tPurchaseCandidate\t' + status + '\n')
            (root / 'focused-export/123.c').write_text('void candidate(void) {}')
            rows = list(index.native_items(root))
            self.assertEqual(len(rows), 1)
            self.assertEqual(rows[0][6], 'pseudocode_unverified')
            self.assertEqual(rows[0][7], 'a' * 64)
            self.assertIn('focused-export', rows[0][3])
            (root / 'focused-export/123.c').unlink()
            rows = list(index.native_items(root))
            self.assertEqual(rows[0][6], 'decompilation_failed')

    def test_invalid_fingerprint_cannot_enter_native_index(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            (root / 'run.json').write_text(json.dumps({'exe_sha256': 'unknown'}))
            with self.assertRaisesRegex(ValueError, 'SHA-256'):
                list(index.native_items(root))


if __name__ == '__main__':
    unittest.main()
