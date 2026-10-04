"""Check float boundaries, draw consumption and unsupported selection contexts."""
from pathlib import Path
import runpy
import unittest

E = runpy.run_path(str(Path(__file__).with_name('evaluate-texture-options.py')))


def source(chance='1', count=1):
    return {'status': 'inspected', 'resource': 'synthetic.texture.mbin', 'layers': [
        {'fields': {'Name': 'BASE', 'Probability': chance, 'Group': '',
                    'LinkedLayer': '', 'SelectToMatchBase': 'false'},
         'options': [{'fields': {'Name': 'CHOICE', 'Probability': '1', 'TextureGameplayUse': 'IgnoreName'},
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

    def test_link_and_excessive_option_count_are_rejected(self):
        grouped = source()
        grouped['layers'][0]['fields']['LinkedLayer'] = 'SHARED'
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

    def test_fallback_visits_first_eligible_layer_only(self):
        import copy
        data = source('0')
        other = copy.deepcopy(data['layers'][0])
        other['fields']['Name'] = 'OVERLAY'
        data['layers'].append(other)
        result = E['evaluate_fresh_single'](data, 7, [{'family': 'Rock'}])
        self.assertEqual([r['name'] for r in result['final_rows']], ['', '', 'CHOICE'])
        self.assertEqual(result['fallback_layers'], ['BASE'])
        self.assertEqual(len(result['later_draws']), 2)
        self.assertNotEqual(result['selector_exit_state'], result['first_pass']['first_pass_state'])

    def test_nonbase_group_has_no_fallback_but_consumes_later_draw(self):
        data = source('0')
        data['layers'][0]['fields']['Group'] = 'VMARK'
        result = E['evaluate_fresh_single'](data, 7, [{'family': 'Rock'}])
        self.assertEqual(result['fallback_layers'], [])
        self.assertEqual(result['final_rows'][0]['group'], 'VMARK')
        self.assertEqual(result['final_rows'][0]['rgba'], [1.0]*4)
        self.assertEqual(len(result['later_draws']), 1)

    def test_base_matching_consumes_presence_without_weighted_choice(self):
        data = source()
        data['layers'][0]['fields']['SelectToMatchBase'] = 'true'
        result = E['evaluate_fresh_single'](data, 7, [{'family': 'Rock'}])
        self.assertEqual(len(result['first_pass']['layers'][0]['draws']), 1)
        self.assertEqual([r['name'] for r in result['final_rows']], ['CHOICE', 'CHOICE'])
        self.assertEqual(result['final_rows'][0]['rgba'], [0.0]*4)

    def test_merged_single_agrees_with_restricted_single_rows_and_states(self):
        data = source()
        palette = [{'family': 'Rock'}]
        single = E['evaluate_fresh_single'](data, 7, palette)
        merged = E['evaluate_fresh_resources']([data], 7, palette)
        self.assertEqual(merged['final_rows'], single['final_rows'])
        self.assertEqual(merged['first_pass']['first_pass_state'], single['first_pass']['first_pass_state'])
        self.assertEqual(merged['selector_exit_state'], single['selector_exit_state'])

    def test_repeated_resource_averages_occurrences_without_extra_rng_groups(self):
        import copy
        first, second = source(), source('0.25')
        second['layers'][0]['options'][0]['fields']['Probability'] = '0.125'
        result = E['evaluate_fresh_resources']([first, second], 7, [{'family': 'Rock'}])
        self.assertEqual(len(result['first_pass']['layers']), 1)
        self.assertEqual(result['collected'][0]['occurrences'], 2)
        self.assertEqual(result['collected'][0]['probability_sum'], 1.25)
        self.assertEqual(result['collected'][0]['options'][0]['probability_sum'], 1.125)
        self.assertEqual(len(result['later_draws']), 1)
        repeated = E['evaluate_fresh_resources']([first, copy.deepcopy(first)], 7, [{'family': 'Rock'}])
        single = E['evaluate_fresh_single'](first, 7, [{'family': 'Rock'}])
        self.assertEqual(repeated['final_rows'], single['final_rows'])
        self.assertEqual(repeated['selector_exit_state'], single['selector_exit_state'])

    def test_declared_order_changes_first_choice_with_the_same_seed(self):
        a, b = source(), source()
        a['layers'][0]['options'][0]['fields']['Name'] = 'A'
        b['layers'][0]['options'][0]['fields']['Name'] = 'B'
        forward = E['evaluate_fresh_resources']([a,b], 7, [{'family': 'Rock'}])
        reverse = E['evaluate_fresh_resources']([b,a], 7, [{'family': 'Rock'}])
        self.assertEqual(forward['first_pass']['layers'][0]['option_index'], reverse['first_pass']['layers'][0]['option_index'])
        self.assertNotEqual(forward['first_pass']['layers'][0]['row']['name'], reverse['first_pass']['layers'][0]['row']['name'])
        self.assertEqual(forward['selector_exit_state'], reverse['selector_exit_state'])

    def test_each_resource_has_its_own_first_eligible_fallback(self):
        a, b = source('0'), source('0')
        b['layers'][0]['fields']['Name'] = 'OVERLAY'
        result = E['evaluate_fresh_resources']([a,b], 7, [{'family': 'Rock'}])
        self.assertEqual([x['layer'] for x in result['fallback_layers']], ['BASE', 'OVERLAY'])
        self.assertEqual([x['name'] for x in result['final_rows']], ['', '', 'CHOICE', 'CHOICE'])

    def test_merged_base_matching_ors_flags_and_retains_collected_group(self):
        a, b = source(), source()
        b['layers'][0]['fields']['Group'] = 'PAINTGROUP'
        b['layers'][0]['fields']['SelectToMatchBase'] = 'true'
        result = E['evaluate_fresh_resources']([a,b], 7, [{'family': 'Rock'}])
        self.assertEqual(result['final_rows'][1]['name'], 'CHOICE')
        self.assertEqual(result['final_rows'][1]['group'], 'PAINTGROUP')
        self.assertEqual(len(result['first_pass']['layers'][1]['draws']), 1)

    def test_merged_unsupported_inputs_fail_explicitly(self):
        with self.assertRaises(ValueError): E['evaluate_fresh_resources']([],7,[])
        bad = source()
        bad['layers'][0]['options'][0]['palette']['Index'] = '17'
        with self.assertRaises(ValueError): E['evaluate_fresh_resources']([bad],7,[{'family':'Rock'}])
        bad = source()
        bad['layers'][0]['options'][0]['fields']['TextureGameplayUse'] = 'MatchName'
        with self.assertRaises(ValueError): E['evaluate_fresh_resources']([bad],7,[{'family':'Rock'}])


if __name__ == '__main__':
    unittest.main()
