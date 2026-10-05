"""Alternate color branch regression boundaries without game assets."""
from pathlib import Path
import runpy
import unittest

HERE = Path(__file__).resolve().parent
M = runpy.run_path(str(HERE / 'evaluate-alternate-palettes.py'))
SEARCH = runpy.run_path(str(HERE / 'search-appearance-seeds.py'))


class AlternatePaletteTests(unittest.TestCase):
    def row(self, mode=5):
        return {'family': 'Fixture', 'mode': mode, 'colors': [(i / 64, 0, 0, 1) for i in range(64)]}

    def test_retry_consumes_fresh_draws_and_stops_at_64_attempts(self):
        row = {'family': 'Fixture', 'mode': 1, 'colors': [(1, 0, 0, 1)] * 64}
        state, result = M['palette_row']((7, 9), row, 0.1, [0, 0, 0, 1])
        expected = (7, 9)
        for _ in range(514): expected, _ = M['CORE']['advance'](expected)
        self.assertEqual(state, expected)
        self.assertEqual([r['retries'] for r in result], [0, 63, 63, 63, 63])

    def test_zero_threshold_keeps_duplicates_without_retries(self):
        _, rows = M['palette_row']((7, 9), None, 0, [0.25, 0.5, 0.75, 1])
        self.assertTrue(all(r['retries'] == 0 for r in rows))
        self.assertEqual(rows[0]['rgba'], (0.25, 0.5, 0.75, 1))

    def test_only_enabled_eight_color_mode_uses_eight_indices(self):
        _, enabled = M['palette_row']((7, 9), self.row(3), 0, [0, 0, 0, 1])
        _, disabled = M['palette_row']((7, 9), self.row(3), 0, [0, 0, 0, 1], collection_enabled=False)
        self.assertTrue(all(r['index'] < 8 for r in enabled))
        self.assertTrue(any(r['index'] >= 8 for r in disabled))

    def test_other_modes_do_not_apply_base_palette_remapping(self):
        _, one = M['palette_row']((7, 9), self.row(1), 0, [0, 0, 0, 1])
        _, all_colors = M['palette_row']((7, 9), self.row(5), 0, [0, 0, 0, 1])
        self.assertEqual(one, all_colors)
        self.assertTrue(any(r['index'] != 0 for r in one))

    def test_race_rows_reset_to_same_child_state(self):
        palettes = [dict(self.row(), family='Family' + str(i)) for i in range(66)]
        rows = M['generate'](7, palettes, 0, [0, 0, 0, 1])
        self.assertTrue(all(rows[i]['colors'] == rows[32]['colors'] for i in (32, 35, 34, 37, 33, 36)))
        self.assertNotEqual(rows[31]['input_state'], rows[32]['input_state'])

    def test_disabled_collection_cannot_invent_generated_output(self):
        with self.assertRaisesRegex(ValueError, 'untouched'):
            M['generate'](7, [self.row()] * 66, 0, [0, 0, 0, 1], collection_enabled=False)

    def test_parameters_must_be_explicit_and_finite(self):
        for config in ({'palette_branch': 'alternate'}, {'palette_branch': 'unknown'},
                       {'palette_parameters': {}}, {'palette_branch': 'alternate', 'palette_parameters':
                        {'similarity_threshold': float('nan'), 'fallback_rgba': [0, 0, 0, 1]}}):
            with self.assertRaises(ValueError): SEARCH['palette_configuration'](config)
        branch, parameters = SEARCH['palette_configuration']({'palette_branch': 'alternate',
            'palette_parameters': {'similarity_threshold': 0.1, 'fallback_rgba': [0, 0, 0, 1]}})
        self.assertEqual(branch, 'alternate')
        self.assertEqual(parameters['similarity_threshold'], M['BASE']['f32'](0.1))

    def test_missing_buffer_uses_pinned_magenta_without_override(self):
        _, rows = M['palette_row']((7, 9), None, 0.1)
        self.assertEqual([r['rgba'] for r in rows], [(1.0, 0.0, 1.0, 1.0)] * 5)
        self.assertEqual([r['retries'] for r in rows], [0, 63, 63, 63, 63])
        _, parameters = SEARCH['palette_configuration']({'palette_branch': 'alternate',
            'palette_parameters': {'similarity_threshold': 0}})
        self.assertEqual(parameters['fallback_rgba'], (1.0, 0.0, 1.0, 1.0))


if __name__ == '__main__': unittest.main()
