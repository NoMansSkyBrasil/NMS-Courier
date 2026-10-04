"""Check branch reachability, ambiguity and initializer boundary behavior."""
from pathlib import Path
import random
import runpy
import unittest

I = runpy.run_path(str(Path(__file__).with_name('invert-child-seed.py')))
P = I['P']


class ChildInverseTests(unittest.TestCase):
    def test_zero_child_has_no_initialized_seed_preimage(self):
        result = I['invert'](0)
        self.assertEqual(result['draws'], [0, 0])
        self.assertEqual(result['enabled_seed_candidates'], [])
        self.assertFalse(result['disabled_initializer_matches'])

    def test_collision_keeps_both_original_low_words(self):
        child = P['child_seed'](P['seed_state'](0))[1]
        seeds = {int(c['seed'], 16) for c in I['invert'](child)['enabled_seed_candidates']}
        self.assertIn(0, seeds)
        self.assertIn(0x1000100000001, seeds)
        self.assertTrue(I['invert'](child)['disabled_initializer_matches'])

    def test_maximum_initial_carry_is_not_restricted_to_steady_state(self):
        low = P['MASK32']
        carry = P['MASK32']
        rotated = ((low >> 16) | (low << 16)) & P['MASK32']
        seed = ((carry ^ rotated ^ low) << 32) | low
        child = P['child_seed']((low, carry))[1]
        result = I['invert'](child)
        self.assertEqual(result['carry_after_first'], P['MULTIPLIER'])
        self.assertIn(f'0x{seed:016X}', {c['seed'] for c in result['enabled_seed_candidates']})

    def test_inputs_outside_uint64_are_rejected(self):
        for child in (-1, 1 << 64):
            with self.subTest(child=child), self.assertRaises(ValueError):
                I['invert'](child)

    def test_original_seed_is_retained_without_assuming_unique_inverse(self):
        rng = random.Random(180383)
        counts = set()
        for _ in range(1024):
            seed = rng.getrandbits(64)
            child = P['child_seed'](P['seed_state'](seed))[1]
            candidates = I['invert'](child)['enabled_seed_candidates']
            counts.add(len(candidates))
            self.assertIn(f'0x{seed:016X}', {c['seed'] for c in candidates})
        self.assertIn(2, counts)
        self.assertIn(3, counts)


if __name__ == '__main__':
    unittest.main()
