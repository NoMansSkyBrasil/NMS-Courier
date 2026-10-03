"""Check PE import resolution with a synthetic image, never game code execution."""
from pathlib import Path
import runpy
import struct
import unittest

module = runpy.run_path(str(Path(__file__).with_name('inspect-native-fragments.py')))


def image():
    raw = bytearray(8192)
    struct.pack_into('<I', raw, 0x3c, 0x80)
    struct.pack_into('<H', raw, 0x98, 0x20b)
    struct.pack_into('<II', raw, 0x98 + 120, 0x1000, 40)
    sections = [{'virtual_address': 0x1000, 'raw_offset': 512, 'raw_size': 4096}]

    def offset(rva):
        return rva - 0x1000 + 512

    struct.pack_into('<5I', raw, offset(0x1000), 0x1200, 0, 0, 0x1300, 0x1100)
    struct.pack_into('<QQ', raw, offset(0x1200), 0x1400, 0)
    raw[offset(0x1300):offset(0x1300) + 9] = b'test.dll\0'
    raw[offset(0x1400) + 2:offset(0x1400) + 10] = b'strrchr\0'
    raw[offset(0x1500):offset(0x1500) + 2] = b'\xff\x25'
    struct.pack_into('<i', raw, offset(0x1500) + 2, 0x1100 - 0x1506)
    return raw, sections


class NativeFragmentTests(unittest.TestCase):
    def test_import_thunk_resolves_symbol_without_executing_it(self):
        raw, sections = image()
        result = module['import_thunks'](raw, sections, {0x1500})
        self.assertEqual(result[0]['symbol'], 'strrchr')
        self.assertEqual(result[0]['dll'], 'test.dll')
        self.assertEqual(result[0]['iat_rva'], '0x1100')

    def test_wrong_opcode_and_terminated_import_array_fail_closed(self):
        raw, sections = image()
        raw[1792] = 0
        with self.assertRaisesRegex(ValueError, 'FF25'):
            module['import_thunks'](raw, sections, {0x1500})
        raw, sections = image()
        struct.pack_into('<Q', raw, 1024, 0)
        with self.assertRaisesRegex(ValueError, 'missing or ambiguous'):
            module['import_thunks'](raw, sections, {0x1500})


if __name__ == '__main__':
    unittest.main()
