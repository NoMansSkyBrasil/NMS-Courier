"""Explicit color semantics, category lookup and unsupported-input boundaries."""
from pathlib import Path
import runpy
import unittest

M = runpy.run_path(str(Path(__file__).with_name('evaluate-customisation-colors.py')))


def palette(colors, mode=2):
    return {'id': 'TEST', 'mode': mode, 'colors': colors + [(1, 1, 1, 1)] * (64 - len(colors))}


class CustomisationColorsTests(unittest.TestCase):
    def test_inactive_palette_preserves_supplied_rgba(self):
        color = (0.125, 0.25, 0.5, 0.75)
        self.assertEqual(M['quantize'](color, palette([], 0)),
                         {'rgba': color, 'palette_index': None, 'match': 'inactive_passthrough'})

    def test_tolerance_is_inclusive_and_returns_first_even_if_later_is_exact(self):
        first, exact = (0.5 + 1 / 256, 0.5, 0.5, 1), (0.5, 0.5, 0.5, 1)
        result = M['quantize'](exact, palette([first, exact]))
        self.assertEqual(result['rgba'], first)
        self.assertEqual(result['match'], 'component_tolerance')
        self.assertEqual(result['palette_index'], 0)

    def test_just_outside_tolerance_does_not_stop_at_first(self):
        result = M['quantize']((0.5, 0.5, 0.5, 1), palette([
            (0.5 + 1 / 256 + 2**-23, 0.5, 0.5, 1), (0.5, 0.5, 0.5, 1)]))
        self.assertEqual(result['palette_index'], 1)

    def test_nearest_distance_includes_alpha(self):
        result = M['quantize']((0, 0, 0, 1), palette([(0, 0, 0, 0), (0.125, 0.125, 0.125, 1)]))
        self.assertEqual(result['palette_index'], 1)

    def test_equal_distance_retains_first_candidate(self):
        result = M['quantize']((0.5, 0, 0, 1), palette([(0.25, 0, 0, 1), (0.75, 0, 0, 1)]))
        self.assertEqual(result['palette_index'], 0)

    def test_zero_palette_ignores_nonactive_colors(self):
        self.assertEqual(M['quantize']((0, 0, 0, 1), palette([(1, 1, 1, 1)], 1))['palette_index'], 0)

    def test_empty_id_maps_category_but_explicit_id_overrides_it(self):
        table = {'categories': [{'palette_id': 'A'}] * 26,
                 'palettes': [{'id': 'A'}, {'id': 'B'}]}
        self.assertEqual(M['select_palette'](table, '', 2), {'id': 'A'})
        self.assertEqual(M['select_palette'](table, 'B', 2), {'id': 'B'})
        for identity, category in (('', 26), ('a', 2), ('UNKNOWN', 2)):
            with self.assertRaisesRegex(ValueError, 'fallback'):
                M['select_palette'](table, identity, category)

    def test_exact_alpha_overlay_and_duplicate_final_write(self):
        fallback = [(0, 0, 0, 1)] * 5
        edits = [{'family': 65, 'slot': 4, 'rgba': [1, 0, 0, 1]},
                 {'family': 65, 'slot': 4, 'rgba': [1, 0, 0, 0.5]}]
        result = M['overlay'](edits, palette([], 0), fallback)
        self.assertTrue(result['precomputed'])
        self.assertEqual(result['rows'][65][4], fallback[4])
        self.assertEqual(result['edits'][0]['rgba'], (1, 0, 0, 1))
        self.assertFalse(M['overlay']([], palette([], 0), fallback)['precomputed'])

    def test_rejects_nonfinite_and_out_of_range_components_and_indices(self):
        for value in ([True, 0, 0, 1], [float('nan'), 0, 0, 1], [-0.01, 0, 0, 1], [0, 0, 0]):
            with self.assertRaises(ValueError): M['rgba'](value)
        for family, slot in ((66, 0), (0, 5), (True, 0)):
            with self.assertRaises(ValueError):
                M['overlay']([{'family': family, 'slot': slot, 'rgba': [0, 0, 0, 1]}], palette([], 0), [[0, 0, 0, 1]] * 5)
        with self.assertRaises(ValueError): M['quantize']([0, 0, 0, 1], palette([], True))

    def test_family_43_fallback_is_post_edit_and_cannot_conflict(self):
        fallback = [[0, 0, 0, 1]] * 5
        with self.assertRaisesRegex(ValueError, 'conflicts'):
            M['overlay']([{'family': 43, 'slot': 0, 'rgba': [1, 0, 0, 1]}], palette([], 0), fallback)
        fallback[0] = [1, 0, 0, 1]
        result = M['overlay']([{'family': 43, 'slot': 0, 'rgba': [1, 0, 0, 1]}], palette([], 0), fallback)
        self.assertEqual(result['rows'][0][0], (1, 0, 0, 1))


if __name__ == '__main__': unittest.main()
