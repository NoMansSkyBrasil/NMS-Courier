"""Category input boundaries and channel precedence; no game or corpus reads."""
from pathlib import Path
import runpy
import unittest

MODULE = runpy.run_path(str(Path(__file__).with_name('evaluate-entity-inputs.py')))
resolve = MODULE['resolve_inputs']


def fixture(category='ship'):
    return {'category': category, 'route': 'owned_default',
            'descriptor': sorted(MODULE[{'ship': 'SHIPS', 'multitool': 'TOOLS', 'freighter': 'FREIGHTERS'}[category]])[0],
            'model_seed': {'value': '0x7', 'enabled': True},
            'material_second_seed': {'value': '0xffffffffffffffff', 'enabled': False},
            'engine_context_index': 0, 'resource_flags': 0, 'selection': {'mode': 'seeded'}}


class EntityInputsTests(unittest.TestCase):
    def test_owned_multitool_legacy_flag_is_explicit_and_category_bound(self):
        record = fixture('multitool')
        self.assertIsNone(resolve(record)['palette_alternate_flag'])
        for value, expected in ((False, 0), (True, 1)):
            record['use_legacy_colours'] = value
            result = resolve(record)
            self.assertEqual(result['palette_alternate_flag'], expected)
            self.assertIn('UseLegacyColours', result['palette_flag_source'])
            self.assertEqual(result['model_pair'], (7, True))
        for value in (0, 1, None, 'true'):
            record['use_legacy_colours'] = value
            with self.assertRaises(ValueError): resolve(record)
        record = fixture(); record['use_legacy_colours'] = False
        with self.assertRaises(ValueError): resolve(record)

    def test_owned_freighter_palette_does_not_replace_model_or_material_pair(self):
        record = fixture('freighter')
        record['home_system_seed'] = {'value': '0x123', 'enabled': True}
        result = resolve(record)
        self.assertEqual(result['model_pair'], (7, True))
        self.assertEqual(result['palette_pair'], (0x123, True))
        self.assertEqual(result['material_second_pair'], (2**64 - 1, False))

    def test_purchase_prefers_enabled_loaded_pair_including_zero(self):
        record = fixture(); record['route'] = 'ship_purchase'
        record['loaded_resource_seed'] = {'value': '0', 'enabled': True}
        self.assertEqual(resolve(record)['model_pair'], (0, True))
        self.assertEqual(resolve(record)['palette_pair'], (0, True))

    def test_disabled_loaded_pair_uses_purchase_object(self):
        record = fixture(); record['route'] = 'ship_purchase'
        record['loaded_resource_seed'] = {'value': '18446744073709551615', 'enabled': False}
        self.assertEqual(resolve(record)['model_pair'], (7, True))

    def test_material_second_pair_is_required_not_inferred(self):
        record = fixture(); del record['material_second_seed']
        with self.assertRaises(ValueError): resolve(record)

    def test_missing_freighter_home_pair_fails_without_guessing(self):
        with self.assertRaises(ValueError): resolve(fixture('freighter'))

    def test_unknown_category_and_mismatched_resource_fail(self):
        record = fixture(); record['category'] = 'npc'
        with self.assertRaises(ValueError): resolve(record)
        record['category'] = 'multitool'
        with self.assertRaises(ValueError): resolve(record)

    def test_unverified_routes_and_unknown_overrides_fail(self):
        for field, value in (('route', 'expedition_gift'), ('custom_palette', 'red')):
            record = fixture(); record[field] = value
            with self.assertRaises(ValueError): resolve(record)

    def test_explicit_selection_cannot_silently_ignore_seeded_filters(self):
        record = fixture(); record['selection'] = {'mode': 'explicit', 'ids': ['_BODY']}
        self.assertEqual(resolve(record)['choices'], ('_BODY',))
        record['prefix'] = '_WING'
        with self.assertRaises(ValueError): resolve(record)

    def test_uint64_max_and_overflow(self):
        self.assertEqual(MODULE['pair']({'value': '18446744073709551615', 'enabled': True}), (2**64 - 1, True))
        for value in ('18446744073709551616', '-1', '+1', ' 1', '0x10000000000000000'):
            with self.assertRaises(ValueError): MODULE['pair']({'value': value, 'enabled': True})

    def test_boolean_context_index_is_not_an_integer_context(self):
        record = fixture(); record['engine_context_index'] = True
        with self.assertRaises(ValueError): resolve(record)

    def test_npc_requires_supplied_route_and_independent_palette_pair(self):
        record = fixture(); record.update(category='npc', route='npc_supplied', descriptor=sorted(MODULE['NPCS'])[0])
        with self.assertRaises(ValueError): resolve(record)
        record['palette_seed'] = {'value': '0x123', 'enabled': False}
        result = resolve(record)
        self.assertEqual(result['model_pair'], (7, True))
        self.assertEqual(result['palette_pair'], (0x123, False))
        self.assertIn('unresolved', result['palette_source'])
        record['route'] = 'owned_default'
        with self.assertRaises(ValueError): resolve(record)

    def test_independent_palette_cannot_silently_override_ship_route(self):
        record = fixture(); record['palette_seed'] = {'value': '0x123', 'enabled': True}
        with self.assertRaises(ValueError): resolve(record)


if __name__ == '__main__':
    unittest.main()
