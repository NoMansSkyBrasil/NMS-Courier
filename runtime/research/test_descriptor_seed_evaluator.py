"""Check traversal contracts that affect seed consumption and descriptor identity."""
from pathlib import Path
import runpy
import unittest

module = runpy.run_path(str(Path(__file__).with_name('evaluate-descriptor-seed.py')))


def group(identity, children=None, references=None, type_id='GROUP', name='normal'):
    return {'type_id': type_id, 'options': [{'id': identity, 'name': name,
                                           'child_model_lists': children or [], 'reference_paths': references or []}]}


class DescriptorSeedTests(unittest.TestCase):
    def test_annotated_extension_uses_audited_loader_reconstruction(self):
        normalize = module['logical_descriptor_path']
        self.assertEqual(normalize('MODELS/EFFECTS/LIGHTS/LIGHT_BLUE.SCENE.MBIN{7}'),
                         'models/effects/lights/light_blue.descriptor.mbin')
        self.assertEqual(normalize('models/a.b/c.descriptor.mbin{12}'),
                         'models/a.b/c.descriptor.mbin')
        with self.assertRaisesRegex(ValueError, 'Unsupported referenced'):
            normalize('models/test.scene.mbin{unknown}')
        with self.assertRaisesRegex(ValueError, 'byte scope'):
            normalize('models/' + 'a' * 256 + '.scene.mbin')

    def test_missing_reference_consumes_child_seed(self):
        tree = {'groups': [group('ROOT', references=['models/missing.scene.mbin']), group('NEXT')]}
        report = module['evaluate'](7, tree, lambda _: None)
        state = module['core']['seed_state'](7)
        state, _ = module['core']['advance'](state)
        state, _ = module['core']['child_seed'](state)
        state, _ = module['core']['advance'](state)
        self.assertEqual(report['root_final_state'], list(state))
        self.assertEqual(report['selected_ids'], ['ROOT', 'NEXT'])

    def test_never_child_is_skipped_but_empty_child_consumes_a_seed(self):
        never = {'groups': [group('NEVER', name='xNEVER')]}
        empty = {'groups': []}
        tree = {'groups': [group('ROOT', children=[never, empty])]}
        report = module['evaluate'](7, tree, lambda _: None)
        state = module['core']['seed_state'](7)
        state, _ = module['core']['advance'](state)
        state, _ = module['core']['child_seed'](state)
        self.assertEqual(report['root_final_state'], list(state))
        self.assertEqual(report['calls'], 2)

    def test_player_child_restarts_original_seed_without_advancing_parent(self):
        child = {'groups': [group('CHILD')]}
        tree = {'groups': [group('ROOT', children=[child], type_id='_PLAYER_')]}
        report = module['evaluate'](7, tree, lambda _: None)
        state, _ = module['core']['advance'](module['core']['seed_state'](7))
        self.assertEqual(report['root_final_state'], list(state))
        self.assertEqual([entry['seed'] for entry in report['trace']], ['0x7', '0x7'])

    def test_lod_normalization_and_duplicate_suppression_keep_different_rules(self):
        self.assertEqual(module['normalized_id']('_partLOD1'), '_PART')
        self.assertEqual(module['normalized_id']('_partLOD12'), '_partLOD12')
        tree = {'groups': [group('DUPLICATE'), group('DUPLICATE')]}
        report = module['evaluate'](0, tree, lambda _: None)
        self.assertEqual(len(report['trace']), 1)
        self.assertEqual(report['selected_ids'], ['DUPLICATE'])

    def test_recursive_resource_cycle_hits_a_bound_instead_of_running_forever(self):
        # LOD normalization makes the stored ID differ from each raw candidate,
        # so suppression must not accidentally hide a resource recursion cycle.
        tree = {'groups': [group('_cycleLOD1', references=['models/cycle.scene.mbin'])]}
        with self.assertRaisesRegex(ValueError, 'depth/call budget'):
            module['evaluate'](0, tree, lambda _: tree)


if __name__ == '__main__':
    unittest.main()
