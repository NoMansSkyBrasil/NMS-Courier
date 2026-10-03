"""Verify candidate indexing retains failure evidence and prefers focused exports."""
import importlib.util
import contextlib
import io
import json
from pathlib import Path
import tempfile
import unittest
from types import SimpleNamespace

spec = importlib.util.spec_from_file_location('research_index', Path(__file__).with_name('build-research-index.py'))
index = importlib.util.module_from_spec(spec)
spec.loader.exec_module(index)


class NativeIndexTests(unittest.TestCase):
    def test_source_refresh_preserves_imported_records_and_updates_search(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            repo, output = root / 'repo', root / 'navigation'
            source = repo / 'runtime/research'
            source.mkdir(parents=True)
            output.mkdir()
            (source / 'example.py').write_text('def recovered():\n    return 1\n')
            db = index.index_database(output / 'navigation.sqlite')
            for kind, name in (('source_function', 'obsolete'), ('data_file', 'preserved_data'),
                               ('native_function', 'preserved_native')):
                cursor = db.execute('INSERT INTO items VALUES (NULL,?,?,?,?,?,?,?,?,?)',
                                    (kind, 'research', name, 'fixture', 1, '', 'fixture', 'b' * 64, ''))
                db.execute('INSERT INTO search(rowid,name,topic,evidence) VALUES (?,?,?,?)',
                           (cursor.lastrowid, name, 'research', ''))
            db.commit()
            db.close()
            (output / 'navigation.json').write_text(json.dumps({'repository': str(repo),
                  'counts': {}, 'warnings': [{'source': 'fixture', 'error': 'retained'}], 'generated_utc': 'fixture'}))
            with contextlib.redirect_stdout(io.StringIO()):
                index.refresh_repository(SimpleNamespace(repo=repo, output=output))
            db = index.sqlite3.connect(output / 'navigation.sqlite')
            try:
                names = {row[0] for row in db.execute('SELECT name FROM items')}
                self.assertTrue({'recovered', 'preserved_data', 'preserved_native'} <= names)
                self.assertNotIn('obsolete', names)
                self.assertEqual(db.execute("SELECT count(*) FROM search WHERE search MATCH 'obsolete'").fetchone()[0], 0)
            finally:
                db.close()
            report = json.loads((output / 'navigation.json').read_text())
            self.assertEqual(report['counts']['data_file'], 1)
            self.assertEqual(report['counts']['native_function'], 1)
            self.assertEqual(report['warnings'][0]['error'], 'retained')
            self.assertEqual(report['imported_data_native_utc'], 'fixture')

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

    def test_integration_stages_remain_searchable_unverified_candidates(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            (root / 'run.json').write_text(json.dumps({'exe_sha256': 'b' * 64}))
            (root / 'export').mkdir()
            (root / 'export/manifest.tsv').write_text('rva\tpublic_candidate\tstatus\n')
            stages = ('rewardflags', 'rewardfields', 'weaponmetadata',
                      'weaponhandler', 'weaponserializer', 'weaponfields',
                      'capabilitymetadata', 'capabilityhandlers', 'descriptors',
                      'proceduraltask', 'proceduraltaskcallees', 'proceduraltaskconstructor',
                      'proceduralselection', 'proceduralselector', 'proceduralchoice',
                      'proceduraltexture', 'proceduralarithmetic', 'proceduralpalette',
                      'proceduralpalettelookup', 'proceduralpalettecallers',
                      'proceduralcolorbranches', 'proceduralalternatepalette',
                      'proceduralmaterialcolors', 'proceduraltexturecallback',
                      'proceduralresourcelookup')
            for number, stage in enumerate(stages, 1):
                target = root / (stage + '-export')
                target.mkdir()
                rva = format(number, 'x')
                (target / 'manifest.tsv').write_text(
                    f'rva\tpublic_candidate\tstatus\n{rva}\t{stage}\tdecompiled\n')
                (target / (rva + '.c')).write_text('void candidate(void) {}')
            rows = list(index.native_items(root))
            self.assertEqual({row[2] for row in rows}, set(stages))
            self.assertEqual(len(rows), len(stages))
            self.assertTrue(all(row[6] == 'pseudocode_unverified' for row in rows))
            self.assertTrue(all(row[7] == 'b' * 64 for row in rows))

    def test_missing_stage_export_preserves_timeout_and_rejects_wrong_build(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            (root / 'run.json').write_text(json.dumps({'exe_sha256': 'b' * 64}))
            (root / 'export').mkdir()
            (root / 'export/manifest.tsv').write_text('rva\tpublic_candidate\tstatus\n')
            report = root / 'run-proceduralresourcelookup.json'
            report.write_text(json.dumps({'exe_sha256': 'b' * 64, 'status': 'timeout'}))
            rows = list(index.native_items(root))
            self.assertEqual(len(rows), 1)
            self.assertEqual(rows[0][0], 'native_analysis_run')
            self.assertEqual(rows[0][6], 'export_unavailable_timeout')
            self.assertEqual(rows[0][5], '')
            report.write_text(json.dumps({'exe_sha256': 'c' * 64, 'status': 'timeout'}))
            with self.assertRaisesRegex(ValueError, 'fingerprint mismatch'):
                list(index.native_items(root))


if __name__ == '__main__':
    unittest.main()
