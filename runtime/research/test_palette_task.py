"""Task routing boundaries without game files or runtime calls."""
from pathlib import Path
import runpy
import unittest

HERE = Path(__file__).resolve().parent
TASK = runpy.run_path(str(HERE / 'resolve-palette-task.py'))
SEARCH = runpy.run_path(str(HERE / 'search-appearance-seeds.py'))


class PaletteTaskTests(unittest.TestCase):
    def context(self, flag=0, mode=0, precomputed=False):
        return {'alternate_flag': flag, 'global_mode': mode, 'precomputed': precomputed}

    def test_nonzero_bytes_select_alternate_bank(self):
        base = TASK['resolve'](self.context())
        self.assertEqual((base['route'], base['bank_offset']), ('base', 0x520ac0))
        for flag in (1, 2, 255):
            self.assertEqual(TASK['resolve'](self.context(flag))['bank_offset'], 0x520ff0)

    def test_precomputed_bypasses_even_mode_five(self):
        result = TASK['resolve'](self.context(1, 5, True))
        self.assertEqual(result, {'route': 'precomputed', 'generator_rva': None,
                                  'bank_offset': None, 'initial_state': 1})

    def test_mode_five_does_not_invent_palette(self):
        self.assertEqual(TASK['resolve'](self.context(1, 5))['route'], 'generation_skipped')
        for context in (self.context(1, 5), self.context(0, 0, True)):
            with self.assertRaisesRegex(ValueError, 'bypasses'):
                SEARCH['palette_configuration']({'palette_task': context})

    def test_search_selects_route_and_rejects_conflicting_input(self):
        branch, parameters = SEARCH['palette_configuration']({'palette_task': self.context(255),
            'palette_parameters': {'similarity_threshold': 0}})
        self.assertEqual(branch, 'alternate')
        self.assertEqual(parameters['fallback_rgba'], (1.0, 0.0, 1.0, 1.0))
        with self.assertRaisesRegex(ValueError, 'conflicts'):
            SEARCH['palette_configuration']({'palette_task': self.context(1), 'palette_branch': 'base'})

    def test_context_must_be_bounded_and_complete(self):
        for context in ({}, self.context(True), self.context(-1), self.context(256),
                        self.context(0, 2**32), self.context(0, 0, 1)):
            with self.assertRaises(ValueError): TASK['resolve'](context)


if __name__ == '__main__': unittest.main()
