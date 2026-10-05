"""Search outcomes, replay and explicit preview bindings; no game or corpus."""
from pathlib import Path
import runpy
import unittest

M = runpy.run_path(str(Path(__file__).with_name('search-appearance-seeds.py')))


class AppearanceSearchTests(unittest.TestCase):
    def test_multitool_legacy_flag_selects_branch_without_changing_seed_channels(self):
        for flag, expected in ((0, 'base'), (1, 'alternate')):
            request = {'palette_task': {'global_mode': 0, 'precomputed': False}}
            if flag:
                request['palette_parameters'] = {'similarity_threshold': 0}
            self.assertEqual(M['palette_configuration'](request, {'palette_alternate_flag': flag})[0], expected)
        request = {'palette_task': {'global_mode': 5, 'precomputed': False}}
        with self.assertRaisesRegex(ValueError, 'bypasses'):
            M['palette_configuration'](request, {'palette_alternate_flag': 1})
        request['palette_task'].update(global_mode=0, precomputed=True)
        with self.assertRaisesRegex(ValueError, 'bypasses'):
            M['palette_configuration'](request, {'palette_alternate_flag': 1})

    def test_multitool_legacy_flag_rejects_unknown_task_and_conflicting_overrides(self):
        for request in ({}, {'palette_task': {'alternate_flag': 0, 'global_mode': 0, 'precomputed': False}},
                        {'palette_task': {'alternate_flag': True, 'global_mode': 0, 'precomputed': False}},
                        {'palette_task': {'global_mode': 0, 'precomputed': False}, 'palette_branch': 'base',
                         'palette_parameters': {'similarity_threshold': 0}}):
            with self.assertRaises(ValueError):
                M['palette_configuration'](request, {'palette_alternate_flag': 1})

    def test_model_seed_search_preserves_independent_npc_and_freighter_palette(self):
        for category in ('npc', 'freighter'):
            self.assertEqual(M['palette_pair_for_candidate']({'category': category, 'palette_pair': (123, False)}, 7), (123, False))
        self.assertEqual(M['palette_pair_for_candidate']({'category': 'ship', 'palette_pair': (123, False)}, 7), (7, True))

    def test_required_and_forbidden_ids_both_apply(self):
        wanted = M['constraints']({'required_ids': ['_WING'], 'forbidden_ids': ['_BAD']})
        self.assertTrue(M['matches_ids'](['_WING', '_BODY'], wanted))
        self.assertFalse(M['matches_ids'](['_WING', '_BAD'], wanted))
        self.assertFalse(M['matches_ids'](['_BODY'], wanted))

    def test_exact_color_and_tolerance_are_distinct(self):
        rows = [{'family': 'Paint', 'colors': [{'index': 7, 'rgba': [0.1, 0.2, 0.3, 1]}]}]
        exact = M['constraints']({'palette': [{'family': 'Paint', 'slot': 0, 'rgba': [0.11, 0.2, 0.3, 1]}]})
        self.assertFalse(M['matches_colors'](rows, exact))
        exact['palette'][0]['tolerance'] = 0.02
        self.assertTrue(M['matches_colors'](rows, exact))
        exact['palette'][0]['index'] = 8
        self.assertFalse(M['matches_colors'](rows, exact))

    def test_texture_constraints_include_group_and_layer(self):
        wanted = M['constraints']({'textures': [{'layer': 'LOGO', 'group': 'BASE', 'name': 'A'}]})
        self.assertFalse(M['matches_textures']([{'layer': 'LOGO', 'group': 'OTHER', 'name': 'A'}], wanted))
        self.assertTrue(M['matches_textures']([{'layer': 'LOGO', 'group': 'BASE', 'name': 'A'}], wanted))

    def test_candidate_is_replayed_and_never_marked_verified(self):
        calls = []
        def evaluate(seed):
            calls.append(seed)
            return {'selected_ids': ['_WING']} if seed == 9 else None
        result = M['search'](7, 5, 1, 1, evaluate, {}, clock=lambda: 0)
        self.assertEqual(calls, [7, 8, 9, 9])
        self.assertEqual(result['candidates'][0]['seed'], '0x9')
        self.assertEqual(result['candidates'][0]['evidence'], 'candidate')
        self.assertEqual(result['stop_reason'], 'result_limit')

    def test_changed_replay_rejects_results(self):
        calls = []
        def evaluate(seed):
            calls.append(seed); return {'counter': len(calls)}
        with self.assertRaisesRegex(ValueError, 'Forward replay changed'):
            M['search'](0, 1, 1, 1, evaluate, {}, clock=lambda: 0)

    def test_exhaustion_is_not_nonexistence(self):
        result = M['search'](2**64 - 1, 1, 1, 1, lambda _: None, {}, clock=lambda: 0)
        self.assertEqual(result['status'], 'search_exhausted_within_bounds')
        self.assertFalse(result['all_uint64_seeds_searched'])
        self.assertIsNone(result['next_seed'])

    def test_time_budget_stops_before_next_candidate(self):
        ticks = iter([0, 2, 2])
        result = M['search'](0, 100, 1, 1, lambda _: self.fail('Must not evaluate'), {}, clock=lambda: next(ticks))
        self.assertEqual(result['examined'], 0)
        self.assertEqual(result['stop_reason'], 'time_budget')

    def test_empty_conflicting_and_nonfinite_constraints_rejected(self):
        for value in ({}, {'required_ids': ['A'], 'forbidden_ids': ['A']},
                      {'palette': [{'family': 'Paint', 'slot': 0, 'rgba': [float('nan'), 0, 0, 1]}]}):
            with self.assertRaises(ValueError): M['constraints'](value)

    def test_preview_recipe_uses_explicit_ids_and_palette_channels(self):
        binding = {'model_sha256': 'a' * 64, 'parts': [{'name': 'Wing', 'required_ids': ['A'], 'family': 'Paint', 'slot': 0},
                                                     {'name': 'Other', 'required_ids': ['B']}]}
        result = {'seed': '0x7', 'descriptor': 'models/a.descriptor.mbin', 'selected_ids': ['A'],
                  'palette_rows': [{'family': 'Paint', 'colors': [{'rgba': [1, 0, 0, 1]}]}]}
        recipe = M['preview_recipe'](binding, result)
        self.assertTrue(recipe['parts'][0]['visible'])
        self.assertFalse(recipe['parts'][1]['visible'])
        self.assertEqual(recipe['parts'][0]['rgba'], [1, 0, 0, 1])
        self.assertEqual(recipe['evidence'], 'candidate')


if __name__ == '__main__':
    unittest.main()
