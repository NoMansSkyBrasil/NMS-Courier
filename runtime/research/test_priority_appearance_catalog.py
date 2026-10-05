"""Verify dependency preservation and collector equivalence boundaries."""
import copy
from pathlib import Path
import runpy
import unittest
import xml.etree.ElementTree as ET

C = runpy.run_path(str(Path(__file__).with_name('build-priority-appearance-catalog.py')))
M = runpy.run_path(str(Path(__file__).with_name('emulate-texture-collection.py')))


def layer(name='PAINT', group='', index='-1', selector='Primary', probability='1'):
    return {'fields': {'Name':name,'Group':group,'LinkedLayer':'','Probability':probability,'SelectToMatchBase':'false'},
            'options':[{'fields':{'Name':'PANEL','Probability':'1','TextureGameplayUse':'IgnoreName'},
                        'palette':{'Palette':'Paint','ColourAlt':selector,'Index':index}}]}


class PriorityAppearanceTests(unittest.TestCase):
    def test_draw_interval_boundaries_match_integer_multiply_high(self):
        weights = [20, 1, 0, 20]
        intervals = C['draw_intervals'](weights)
        self.assertIsNone(intervals[2])
        self.assertEqual(intervals[0]['lower_inclusive'], 0)
        self.assertEqual(intervals[3]['upper_exclusive'], 2**32)
        cumulative = 0
        for weight, interval in zip(weights, intervals):
            if weight:
                lower, upper = interval['lower_inclusive'], interval['upper_exclusive']
                for draw in (lower, upper - 1):
                    self.assertLessEqual(cumulative, (draw * sum(weights)) >> 32)
                    self.assertLess((draw * sum(weights)) >> 32, cumulative + weight)
                if lower: self.assertLess(((lower - 1) * sum(weights)) >> 32, cumulative)
                if upper < 2**32: self.assertGreaterEqual((upper * sum(weights)) >> 32, cumulative + weight)
            cumulative += weight

    def test_zero_weights_have_no_default_draw_and_invalid_weights_fail(self):
        self.assertEqual(C['draw_intervals']([0, 0]), [None, None])
        for weights in ([True], [-1], [2**32], [1] * 4097):
            with self.assertRaises(ValueError): C['draw_intervals'](weights)

    def test_categories_do_not_label_frigates_or_shared_assets_as_ships(self):
        self.assertEqual(C['category']('models/common/spacecraft/sentinelship/parts/wingsb.descriptor.mbin'),'ship/interceptor')
        self.assertIsNone(C['category']('models/common/spacecraft/frigates/livingfrigate.descriptor.mbin'))
        self.assertIsNone(C['category']('textures/common/spacecraft/shared/decals/logo.texture.mbin'))

    def test_npc_roots_and_shared_parts_have_distinct_catalog_roles(self):
        prefix = 'models/common/player/playercharacter/'
        self.assertEqual(C['category'](prefix + 'npcgek.descriptor.mbin'), 'npc/gek')
        self.assertEqual(C['category'](prefix + 'parts/head/headclassic.descriptor.mbin'), 'npc/shared-character-parts')
        self.assertIsNone(C['category'](prefix + 'playercharacter.descriptor.mbin'))

    def test_descriptor_guards_and_chance_remain_separate_from_name_weight(self):
        root=ET.fromstring('''<Data template="cTkModelDescriptorList"><Property name="List">
        <Property value="TkResourceDescriptorList"><Property name="TypeId" value="_BODY_"/>
        <Property name="Descriptors"><Property value="TkResourceDescriptorData">
        <Property name="Id" value="_BODY_A"/><Property name="Name" value="BODYxRARE"/>
        <Property name="Chance" value="99"/><Property name="Children"><Property>
        <Property name="List"><Property value="TkResourceDescriptorList">
        <Property name="TypeId" value="_WING_"/><Property name="Descriptors">
        <Property value="TkResourceDescriptorData"><Property name="Id" value="_WING_A"/>
        <Property name="Name" value="WING"/></Property></Property></Property></Property>
        </Property></Property></Property></Property></Property></Property></Data>''')
        record=C['descriptor_record'](root,'models/common/spacecraft/fighters/fighter_proc.descriptor.mbin')
        self.assertEqual(record['groups'][0]['options'][0]['chance_raw'],'99')
        self.assertEqual(record['groups'][0]['options'][0]['default_name_weight_candidate'],1)
        self.assertEqual(record['groups'][1]['requires'][0]['option'],'_BODY_A')

    def test_index_is_not_merge_identity_and_first_index_is_retained(self):
        a,b=layer(),layer(index='17',probability='0.25')
        b['options'][0]['fields']['Probability']='0.125'
        b['fields']['SelectToMatchBase']='true'
        result=M['collect']([a,b],{'Paint':4})
        self.assertEqual(len(result),1)
        self.assertEqual(result[0]['probability_sum'],1.25)
        self.assertTrue(result[0]['base_match'])
        self.assertEqual(result[0]['options'][0],{'name':'PANEL','selector':0,'index':-1,
                         'family_index':4,'occurrences':2,'probability_sum':1.125})

    def test_group_and_selector_are_distinct_identity_inputs(self):
        result=M['collect']([layer(),layer(group='BASE'),layer(selector='None')],{'Paint':4})
        self.assertEqual(len(result),2)
        self.assertEqual([o['selector'] for o in result[0]['options']],[0,7])
        self.assertEqual(result[1]['group'],'BASE')

    def test_initial_duplicates_remain_and_later_calls_merge_first_match(self):
        a=layer();a['options']+=copy.deepcopy(a['options'])
        result=M['collect']([a,layer()],{'Paint':4})
        self.assertEqual([o['occurrences'] for o in result[0]['options']],[2,1])

    def test_unnamed_single_option_mode_creates_separate_rows(self):
        a=layer(name='');a['always_enable_unnamed']=True
        result=M['collect']([a,copy.deepcopy(a)],{'Paint':4})
        self.assertEqual(len(result),2)
        self.assertEqual([g['occurrences'] for g in result],[1,1])
        a['always_enable_unnamed']=False
        self.assertEqual(len(M['collect']([a,copy.deepcopy(a)],{'Paint':4})),1)

    def test_unsupported_context_fails_instead_of_guessing(self):
        a=layer();a['fields']['LinkedLayer']='BASE'
        with self.assertRaisesRegex(ValueError,'Unsupported'): M['collect']([a],{'Paint':4})
        a=layer();a['options'][0]['fields']['TextureGameplayUse']='MatchName'
        with self.assertRaisesRegex(ValueError,'Unsupported'): M['collect']([a],{'Paint':4})


if __name__ == '__main__':
    unittest.main()
