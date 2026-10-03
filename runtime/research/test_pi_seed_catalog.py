"""Verify provenance separation, bounded enumeration and atomic seed capture."""
import json
from pathlib import Path
import runpy
import struct
import tempfile
import unittest

catalog = runpy.run_path(str(Path(__file__).with_name('pi-seed-catalog.py')))
scanner = runpy.run_path(str(Path(__file__).with_name('scan-pi-compatibility.py')))


class CatalogTests(unittest.TestCase):
    def setUp(self):
        self.folder = tempfile.TemporaryDirectory()
        self.addCleanup(self.folder.cleanup)
        self.path = Path(self.folder.name) / 'catalog.sqlite'
        self.config = {'exe_sha256': 'a' * 64, 'kind': 'technology', 'item': 'UP_FRHYP',
                       'start': 0, 'stop': 100000, 'evidence': 'simulated'}
        self.connection, _ = catalog['open_catalog'](self.path, self.config)
        self.addCleanup(self.connection.close)

    def result(self, seed=0):
        return {key: self.config[key] for key in ('exe_sha256', 'kind', 'item', 'evidence')} | {
            'seed': seed, 'procedural_id': f'UP_FRHYP#{seed:05d}',
            'raw': {'stats': [{'stat': 'Freighter_Hyperdrive', 'bonus': 1.125, 'level': 3}]},
            'provenance': {'source': 'Synthetic test fixture; not game output'}}

    def test_resume_returns_only_missing_inputs_and_preserves_raw_stats(self):
        catalog['import_results'](self.connection, self.config, [self.result(0), self.result(2)])
        batch = catalog['pending'](self.connection, self.config, 3)
        self.assertEqual([row['seed'] for row in batch], [1, 3, 4])
        self.assertTrue(all(row['runtime_call_authorized'] is False for row in batch))
        reopened, config = catalog['open_catalog'](self.path)
        try:
            self.assertEqual(config, self.config)
            payload = reopened.execute('SELECT payload FROM results WHERE seed=2').fetchone()[0]
            self.assertEqual(json.loads(payload)['raw']['stats'][0]['bonus'], 1.125)
        finally:
            reopened.close()

    def test_duplicate_is_idempotent_but_conflict_rolls_back_entire_batch(self):
        catalog['import_results'](self.connection, self.config, [self.result()])
        catalog['import_results'](self.connection, self.config, [self.result()])
        changed = self.result()
        changed['raw'] = {'bonus': 9}
        with self.assertRaisesRegex(ValueError, 'Conflicting'):
            catalog['import_results'](self.connection, self.config, [self.result(1), changed])
        self.assertEqual(self.connection.execute('SELECT seed FROM results').fetchall(), [(0,)])

    def test_build_and_evidence_are_immutable(self):
        for key, value in [('exe_sha256', 'b' * 64), ('evidence', 'observed')]:
            changed = self.config | {key: value}
            with self.assertRaisesRegex(ValueError, 'configuration mismatch'):
                catalog['open_catalog'](self.path, changed)
            with self.assertRaisesRegex(ValueError, 'provenance'):
                catalog['validate_result'](self.result() | {key: value}, self.config)

    def test_seed_boundaries_and_identifier_mismatch_are_rejected(self):
        for seed in (-1, 100000, True):
            with self.assertRaises(ValueError):
                catalog['validate_result'](self.result(seed), self.config)
        with self.assertRaisesRegex(ValueError, 'identifier'):
            catalog['validate_result'](self.result() | {'procedural_id': 'UP_FRHYP#0'}, self.config)
        last = catalog['pending'](self.connection, self.config | {'start': 99999}, 1)
        self.assertEqual(last[0]['procedural_id'], 'UP_FRHYP#99999')

    def test_observed_capture_requires_adapter_and_capture_fingerprints(self):
        config = self.config | {'evidence': 'observed'}
        result = self.result() | {'evidence': 'observed'}
        with self.assertRaisesRegex(ValueError, 'SHA-256'):
            catalog['validate_result'](result, config)
        result['provenance'].update(adapter_sha256='b' * 64, capture_sha256='c' * 64)
        self.assertEqual(json.loads(catalog['validate_result'](result, config)), result)

    def test_invalid_nonfinite_and_large_results_are_rejected(self):
        for raw in ({'bonus': float('nan')}, {'bonus': float('inf')}, {'name': 'x' * 65536}):
            with self.assertRaises(ValueError):
                catalog['validate_result'](self.result() | {'raw': raw}, self.config)
        nested = {}
        for _ in range(14):
            nested = {'child': nested}
        with self.assertRaisesRegex(ValueError, 'nesting'):
            catalog['validate_result'](self.result() | {'raw': nested}, self.config)

    def test_import_budget_failure_is_atomic(self):
        with self.assertRaisesRegex(ValueError, 'batch budget'):
            catalog['import_results'](self.connection, self.config, (self.result(seed) for seed in range(1001)))
        self.assertEqual(self.connection.execute('SELECT COUNT(*) FROM results').fetchone()[0], 0)
        with self.assertRaisesRegex(ValueError, 'Batch limit'):
            catalog['pending'](self.connection, self.config, 1001)

    def test_reject_invalid_base_identifiers_and_ranges(self):
        for update in ({'item': 'UP_FRHYP#00000'}, {'item': 'lower'}, {'start': True}, {'stop': 100001}):
            with self.assertRaises(ValueError):
                catalog['validate_config'](self.config | update)

    def test_jsonl_import_rejects_oversize_line(self):
        path = Path(self.folder.name) / 'input.jsonl'
        path.write_text('x' * 65538, encoding='utf-8')
        with self.assertRaisesRegex(ValueError, 'line exceeds'):
            list(catalog['read_jsonl'](path))


class BindingTests(unittest.TestCase):
    def test_odd_unwind_codes_align_chain_to_even_slot_count(self):
        raw = bytearray(80)
        raw[0:4] = bytes([1 | (4 << 3), 0, 1, 0])
        struct.pack_into('<III', raw, 8, 0x100, 0x120, 32)
        raw[32] = 1
        section = {'virtual_address': 0, 'raw_offset': 0, 'raw_size': len(raw)}
        chain = scanner['unwind_chain'](raw, [section], (0x140, 0x150, 0))
        self.assertEqual([item['begin'] for item in chain], ['0x140', '0x100'])

    def test_cyclic_and_unsupported_unwind_chains_are_rejected(self):
        raw = bytearray(32)
        raw[0] = 1 | (4 << 3)
        struct.pack_into('<III', raw, 4, 0x100, 0x120, 0)
        section = {'virtual_address': 0, 'raw_offset': 0, 'raw_size': len(raw)}
        with self.assertRaisesRegex(ValueError, 'cyclic'):
            scanner['unwind_chain'](raw, [section], (0x100, 0x120, 0))
        raw[0] = 3
        with self.assertRaisesRegex(ValueError, 'Unsupported'):
            scanner['unwind_chain'](raw, [section], (0x100, 0x120, 0))

    def test_decorators_are_read_without_executing_source(self):
        source = '''raise RuntimeError("Never execute this file")
class Manager:
    @function_hook(signature="48 89 5C 24 08 45 0F", offset=0x123)
    def Generate(self): pass
'''
        record, = scanner['extract_signatures'](source)
        self.assertEqual(record['name'], 'Manager::Generate')
        self.assertEqual(record['historical_offset_not_used'], 0x123)
        self.assertNotIn('offset', record)

    def test_computed_signature_is_rejected_without_evaluation(self):
        source = '''class Manager:
    @function_hook(signature=run_untrusted_code())
    def Generate(self): pass
'''
        with self.assertRaises(ValueError):
            scanner['extract_signatures'](source)


if __name__ == '__main__':
    unittest.main()
