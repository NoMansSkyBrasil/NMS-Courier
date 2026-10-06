"""Inventory-class port boundaries with synthetic rows; no game files or runtime calls."""
from pathlib import Path
import runpy
import unittest

HERE = Path(__file__).resolve().parent
PORT = runpy.run_path(str(HERE / 'evaluate-inventory-class.py'))
UNIFORM = [25.0, 25.0, 25.0, 25.0]
NO_TOP = [50.0, 50.0, 0.0, 0.0]
SPARSE = [5.0, 5.0, 5.0, 5.0]


class InventoryClassTests(unittest.TestCase):
    def test_literals_match_recorded_values(self):
        self.assertEqual(PORT['DRAW_SCALE'], 2.3283064370807974e-10)
        self.assertEqual(PORT['WEIGHT_SCALE'], PORT['float32'](0.01))

    def test_disabled_seed_uses_fixed_state(self):
        self.assertEqual(PORT['seed_state'](0xdeadbeef, False), (1, 0))
        self.assertEqual(PORT['class_draw'](0xdeadbeef, False)[0], 0x5A76F899)

    def test_zero_low_word_is_normalized_only_in_the_multiplicand(self):
        self.assertEqual(PORT['seed_state'](0x1200000000), (1, 0x12))

    def test_intervals_partition_every_draw(self):
        for weights in (UNIFORM, NO_TOP, SPARSE):
            spans = [PORT['draw_interval'](weights, index) for index in range(4)]
            spans.append(PORT['default_interval'](weights))
            covered = sorted(span for span in spans if span)
            self.assertEqual(covered[0][0], 0)
            self.assertEqual(covered[-1][1], 0xffffffff)
            for left, right in zip(covered, covered[1:]):
                self.assertEqual(left[1] + 1, right[0])

    def test_interval_edges_agree_with_forward_evaluation(self):
        for weights in (UNIFORM, SPARSE):
            for index in range(4):
                begin, end = PORT['draw_interval'](weights, index)
                for draw in (begin, end):
                    seed = PORT['seed_for_draw'](7, draw)
                    self.assertEqual(PORT['class_draw'](seed)[0], draw)
                    self.assertEqual(PORT['class_from_seed'](seed, weights), index)

    def test_zero_weight_class_is_unreachable(self):
        self.assertIsNone(PORT['draw_interval'](NO_TOP, 2))
        self.assertIsNone(PORT['draw_interval'](NO_TOP, 3))

    def test_draw_above_all_sums_keeps_default_class(self):
        begin, _ = PORT['default_interval'](SPARSE)
        self.assertEqual(PORT['class_from_seed'](PORT['seed_for_draw'](1, begin), SPARSE), 0)
        self.assertEqual(PORT['class_from_seed'](PORT['seed_for_draw'](1, begin - 1), SPARSE), 3)

    def test_high_word_solutions_reproduce_requested_class(self):
        for low_word in (0, 7, 0xffffffff):
            for solution in PORT['high_words_for_class'](low_word, SPARSE, 3):
                seed = int(solution['first_seed'], 16)
                self.assertEqual(seed & 0xffffffff, low_word)
                self.assertEqual(PORT['class_from_seed'](seed, SPARSE), 3)

    def test_wrapper_keeps_explicit_class_and_filters_generated_types(self):
        seed = PORT['seed_for_draw'](7, PORT['draw_interval'](UNIFORM, 3)[0])
        self.assertEqual(PORT['wrapper_class'](8, 2, seed, UNIFORM), 2)
        for inventory_type in (3, 4, 7):
            self.assertEqual(PORT['wrapper_class'](inventory_type, 4, seed, UNIFORM), 3)
        for inventory_type in (0, 5, 6, 8, 9):
            self.assertEqual(PORT['wrapper_class'](inventory_type, 4, seed, UNIFORM), 0)


if __name__ == '__main__':
    unittest.main()
