"""Candidate coverage tests independent of proprietary executable bytes."""
from pathlib import Path
import runpy
import struct
import unittest

SCAN = runpy.run_path(str(Path(__file__).with_name('scan-rip-data-references.py')))


class RipCandidateTests(unittest.TestCase):
    def test_negative_displacement_and_trailing_immediate(self):
        code = b'\xc7\x05' + struct.pack('<i', -20) + b'\x01\x00\x00\x00'
        self.assertEqual(SCAN['displacement_candidates'](code, 100, {90}), [(101, 90)])

    def test_overlapping_modrm_candidates_are_not_skipped(self):
        code = b'\x05\x05\0\0\0\0'
        # A trailing immediate can also explain the second target; decoding must filter it.
        self.assertCountEqual(SCAN['displacement_candidates'](code, 100, {110, 106}),
                              [(100, 110), (101, 106), (101, 110)])

    def test_outside_immediate_budget_is_rejected(self):
        self.assertEqual(SCAN['displacement_candidates'](b'\x05\0\0\0\0', 100, {114, 104}), [])

    def test_candidate_budget_is_enforced(self):
        with self.assertRaisesRegex(ValueError, 'budget'):
            SCAN['displacement_candidates'](b'\x05\0\0\0\0' * 513, 0, set(range(5, 2570, 5)))

    def test_virtual_tail_never_reads_neighboring_raw_bytes(self):
        sections = [{'name': '.data', 'virtual_address': 100, 'virtual_size': 50,
                     'raw_offset': 0, 'raw_size': 4}]
        result = SCAN['target_storage'](b'ABCDunrelated', sections, 105)
        self.assertEqual(result['storage'], 'zero_filled_virtual_tail')
        self.assertIsNone(result['hex'])
        self.assertEqual(SCAN['target_storage'](b'ABCDunrelated', sections, 102)['hex'], '4344')

    def test_unmapped_target_remains_unknown(self):
        self.assertEqual(SCAN['target_storage'](b'', [], 1)['storage'], 'outside_sections')


if __name__ == '__main__': unittest.main()
