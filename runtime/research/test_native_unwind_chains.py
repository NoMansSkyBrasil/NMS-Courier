"""Validate bounds and failure behavior of offline PE unwind-chain inspection."""
import runpy
from pathlib import Path
import struct
import unittest


unwind_chain = runpy.run_path(str(Path(__file__).with_name('inspect-native-fragments.py')))['unwind_chain']


class UnwindChainTests(unittest.TestCase):
    def setUp(self):
        self.raw = bytearray(512)
        self.sections = [{'virtual_address': 0, 'raw_offset': 0, 'raw_size': 512}]
        self.entry = (0x1000, 0x1020, 0x40)

    def test_chained_fragment_preserves_original_and_root(self):
        self.raw[0x40] = 0x21
        struct.pack_into('<III', self.raw, 0x44, 0x2000, 0x2020, 0x80)
        self.raw[0x80] = 1
        records = unwind_chain(self.raw, self.sections, self.entry)
        self.assertEqual([r['begin'] for r in records], ['0x1000', '0x2000'])
        self.assertEqual([r['flags'] for r in records], [4, 0])

    def test_cycle_is_rejected(self):
        self.raw[0x40] = 0x21
        struct.pack_into('<III', self.raw, 0x44, *self.entry)
        with self.assertRaisesRegex(ValueError, 'cyclic'):
            unwind_chain(self.raw, self.sections, self.entry)

    def test_chain_payload_cannot_cross_section(self):
        self.raw[0x40] = 0x21
        self.sections[0]['raw_size'] = 0x4f
        with self.assertRaisesRegex(ValueError, 'outside file-backed section'):
            unwind_chain(self.raw, self.sections, self.entry)

    def test_handler_and_chain_flags_cannot_coexist(self):
        self.raw[0x40] = 0x29
        with self.assertRaisesRegex(ValueError, 'flags'):
            unwind_chain(self.raw, self.sections, self.entry)

    def test_long_acyclic_chain_still_has_a_budget(self):
        for i in range(17):
            offset = 0x40 + i * 16
            self.raw[offset] = 0x21
            struct.pack_into('<III', self.raw, offset + 4,
                             0x2000 + i * 32, 0x2020 + i * 32, offset + 16)
        with self.assertRaisesRegex(ValueError, '16-record bound'):
            unwind_chain(self.raw, self.sections, self.entry)


if __name__ == '__main__':
    unittest.main()
