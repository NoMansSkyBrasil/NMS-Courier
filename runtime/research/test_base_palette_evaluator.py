"""Check retry termination, stream scheduling and float32 reduction boundaries."""
from pathlib import Path
import runpy
import unittest

module = runpy.run_path(str(Path(__file__).with_name('evaluate-base-palettes.py')))


class BasePaletteTests(unittest.TestCase):
    def test_one_color_mode_terminates_retries_without_extra_random_draws(self):
        palette = {'family': 'synthetic', 'mode': 1, 'colors': [(1.0, 0.0, 0.0, 1.0)] * 64}
        state, records = module['palette_row']((1, 0), palette)
        expected = (1, 0)
        for _ in range(10):
            expected, _ = module['core']['advance'](expected)
        self.assertEqual(state, expected)
        self.assertEqual([item['retries'] for item in records], [0, 64, 64, 64, 64])
        self.assertTrue(all(item['lookup_index'] == 0 for item in records))

    def test_alpha_does_not_change_rgb_similarity(self):
        self.assertEqual(module['distance_squared']((0.25, 0.5, 0.75, 0.0), (0.25, 0.5, 0.75, 1.0)), 0.0)
        self.assertEqual(module['distance_squared']((0.0, 0.0, 0.0, 1.0), (2 ** -16, 0.0, 0.0, 1.0)), 2 ** -32)

    def test_freighter_reuses_paint_state_and_race_pairs_share_seed(self):
        palettes = [{'family': str(i), 'mode': 5,
                     'colors': [(cell / 64, 0.0, 0.0, 1.0) for cell in range(64)]} for i in range(66)]
        rows = module['generate'](0x1ad0003900054, palettes)
        self.assertEqual(len(rows), 66)
        self.assertEqual(rows[10]['input_state'], rows[56]['input_state'])
        self.assertEqual(rows[10]['colors'], rows[56]['colors'])
        for index in (33, 34, 35, 36, 37):
            self.assertEqual(rows[index]['input_state'], rows[32]['input_state'])
        self.assertEqual(rows[0]['input_state'], rows[51]['input_state'])
        with self.assertRaises(ValueError):
            module['generate'](0, palettes[:65])


if __name__ == '__main__':
    unittest.main()
