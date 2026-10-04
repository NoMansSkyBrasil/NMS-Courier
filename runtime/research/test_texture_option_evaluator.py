"""Check float boundaries, draw consumption and unsupported selection contexts."""
from pathlib import Path
import runpy
import unittest

E = runpy.run_path(str(Path(__file__).with_name('evaluate-texture-options.py')))


def source(chance='1', count=1):
    return {'status': 'inspected', 'resource': 'synthetic.texture.mbin', 'layers': [
        {'fields': {'Name': 'BASE', 'Probability': chance, 'Group': '',
                    'LinkedLayer': '', 'SelectToMatchBase': 'false'},
         'options': [{'fields': {'Probability': '1', 'TextureGameplayUse': 'IgnoreName'},
                      'palette': {'Palette': 'Rock', 'ColourAlt': 'None', 'Index': '-1'}}] * count}]}


class TextureOptionTests(unittest.TestCase):
    def test_maximum_draw_is_one_and_does_not_select_upper_endpoint(self):
        self.assertEqual(E['fraction'](0xffffffff), 1.0)
        self.assertIsNone(E['choose'](0xffffffff, [1.0]))
        self.assertEqual(E['choose'](0, [1.0]), 0)

    def test_zero_probability_consumes_no_draws(self):
        result = E['evaluate'](source('0'), 7, [])
        self.assertEqual(result['layers'][0]['draws'], [])
        self.assertEqual(tuple(result['first_pass_state']), E['P']['seed_state'](7))

    def test_one_option_still_consumes_presence_and_choice_draw(self):
        result = E['evaluate'](source(), 7, [])
        state, first = E['P']['advance'](E['P']['seed_state'](7))
        state, second = E['P']['advance'](state)
        self.assertEqual(result['layers'][0]['draws'], [first, second])
        self.assertEqual(tuple(result['first_pass_state']), state)
        self.assertEqual(result['layers'][0]['color']['rgba'], [0.0]*4)

    def test_zero_weight_is_not_selected(self):
        self.assertEqual(E['choose'](0, [0.0, 1.0]), 1)
        self.assertIsNone(E['choose'](123, [0.0, 0.0]))

    def test_group_and_excessive_option_count_are_rejected(self):
        grouped = source()
        grouped['layers'][0]['fields']['Group'] = 'SHARED'
        with self.assertRaises(ValueError): E['evaluate'](grouped, 7, [])
        with self.assertRaises(ValueError): E['evaluate'](source(count=257), 7, [])

    def test_unrolled_weights_preserve_ordered_float32_rounding(self):
        # Binary32 cannot retain 1 added to 2**24; grouping small weights differs.
        weights = [16777216.0, 1.0, 1.0, 1.0]
        self.assertEqual(E['choose'](0xffffffff, weights), None)
        self.assertEqual(E['choose'](0, weights), 0)
        self.assertEqual(E['evaluate'](source(count=6), 7, [])['layers'][0]['option_index'], 0)

    def test_observed_alternative_four_alias_is_explicit(self):
        colors = [{'rgba': [i, i, i, 1]} for i in range(5)]
        result = E['color_binding']({'Palette': 'Paint', 'ColourAlt': 'Alternative4', 'Index': '-1'},
                                    [{'family': 'Paint', 'colors': colors}])
        self.assertEqual(result['sample_slot'], 3)
        self.assertEqual(result['rgba'], [3, 3, 3, 1])


if __name__ == '__main__':
    unittest.main()
