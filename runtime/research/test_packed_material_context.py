"""Regression checks for reference order and material-context identity."""
from pathlib import Path
import runpy
import unittest
import xml.etree.ElementTree as ET

HERE = Path(__file__).resolve().parent
CONTEXTS = runpy.run_path(str(HERE / 'emulate-packed-material-context.py'))
SCENES = runpy.run_path(str(HERE / 'trace-packed-scene-materials.py'))
DESCRIPTORS = runpy.run_path(str(HERE / 'evaluate-descriptor-seed.py'))


def node(kind='MESH', name='NODE', material='models/a.material.mbin', children=(), reference=None, scales=('1', '1', '1')):
    root = ET.Element('Data', template='cTkSceneNodeData')
    for key, text in (('Name', name), ('Type', kind), ('PlatformExclusion', '0')):
        ET.SubElement(root, 'Property', name=key, value=text)
    transform = ET.SubElement(root, 'Property', name='Transform')
    for axis, text in zip('XYZ', scales): ET.SubElement(transform, 'Property', name='Scale' + axis, value=text)
    attributes = ET.SubElement(root, 'Property', name='Attributes')
    if kind == 'MESH' or reference:
        attribute = ET.SubElement(attributes, 'Property')
        ET.SubElement(attribute, 'Property', name='Name', value='SCENEGRAPH' if reference else 'MATERIAL')
        ET.SubElement(attribute, 'Property', name='Value', value=reference or material)
    vector = ET.SubElement(root, 'Property', name='Children')
    vector.extend(children)
    return root


class PackedMaterialTests(unittest.TestCase):
    def trace(self):
        trace = SCENES['SceneTrace'].__new__(SCENES['SceneTrace'])
        trace.visits, trace.context_index, trace.flags = 0, 0, 0
        trace.materials, trace.requests = [], []
        trace.load = lambda path: ET.Element('Data', template='cTkMaterialData')
        return trace

    def test_reference_local_children_precede_referenced_resource(self):
        trace = self.trace()
        referenced = node(material='models/reference.material.mbin')
        trace.load = lambda path: referenced if path.endswith('.scene.mbin') else ET.Element('Data', template='cTkMaterialData')
        root = node('REFERENCE', reference='models/reference.scene.mbin', children=(node(material='models/local.material.mbin'),))
        order = trace.visit(root, ((), 7, True, 0, False), 'models/root.scene.mbin')
        self.assertEqual([trace.materials[i - 1]['resource'] for i in order], ['models/local.material.mbin', 'models/reference.material.mbin'])
        self.assertEqual([r['resource'] for r in trace.requests], ['models/reference.material.mbin', 'models/local.material.mbin'])

    def test_scale_gate_occurs_after_creator_request(self):
        trace = self.trace()
        root = node(scales=('0', '0', '1'), children=(node(),))
        self.assertEqual(trace.visit(root, ((), 7, True, 0, False), 'models/root.scene.mbin'), [])
        self.assertEqual(len(trace.requests), 1)
        self.assertEqual(trace.visits, 1)

    def test_one_zero_scale_axis_does_not_skip_material(self):
        trace = self.trace()
        self.assertEqual(trace.visit(node(scales=('0', '1', '1')), ((), 7, True, 0, False), 'models/root.scene.mbin'), [1])

    def test_rejected_selected_node_skips_subtree_and_acquisition(self):
        trace = self.trace()
        root = node(name='_PART_B', children=(node(),))
        self.assertEqual(trace.visit(root, (('_PART_A',), 7, True, 0, False), 'models/root.scene.mbin'), [])
        self.assertEqual(trace.requests, [])
        self.assertEqual(trace.visits, 1)

    def test_unknown_factory_fails_instead_of_omitting_materials(self):
        with self.assertRaisesRegex(ValueError, 'Factory/collector'):
            self.trace().visit(node('UNKNOWN'), ((), 7, True, 0, False), 'models/root.scene.mbin')

    def test_repeated_resource_separators_require_native_normalization(self):
        with self.assertRaisesRegex(ValueError, 'Repeated separators'):
            self.trace().material('models//test.material.mbin', ((), 7, True, 0, False), 'fixture')

    def test_enabled_non_strict_seed_can_share_despite_different_ids(self):
        left, right = (('_A',), 7, True, 1, False), (('_B',), 7, True, 2, False)
        self.assertTrue(CONTEXTS['context_equal'](left, right, False))
        self.assertFalse(CONTEXTS['context_equal'](left, right, True))

    def test_disabled_first_seed_uses_ids_and_ignores_second_value_in_non_strict_mode(self):
        left, right = (('_A',), 7, False, 1, True), (('_A',), 8, False, 2, True)
        self.assertTrue(CONTEXTS['context_equal'](left, right, False))
        self.assertFalse(CONTEXTS['context_equal'](left, right, True))

    def test_explicit_fallback_keeps_never_option_and_uses_source_id_before_lod_normalization(self):
        choices = [{'id': '_FIRST', 'name': 'xNEVER', 'child_model_lists': [], 'reference_paths': []},
                   {'id': '_secondLOD1', 'name': 'normal', 'child_model_lists': [], 'reference_paths': []}]
        tree = {'groups': [{'type_id': 'PART', 'options': choices}]}
        self.assertEqual(DESCRIPTORS['evaluate_explicit'](tree, lambda _: None, ('_SECOND',))['selected_ids'], ['_FIRST'])
        self.assertEqual(DESCRIPTORS['evaluate_explicit'](tree, lambda _: None, ('_secondLOD1',))['selected_ids'], ['_SECOND'])


if __name__ == '__main__':
    unittest.main()
