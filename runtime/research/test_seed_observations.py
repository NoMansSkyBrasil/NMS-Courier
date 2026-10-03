"""Public-reference gates prevent mislabeled photographs from becoming oracles."""
from pathlib import Path
import runpy
import tempfile
import unittest

MODULE = runpy.run_path(str(Path(__file__).with_name('compare-seed-observations.py')))
HEADER = 'post_id\tpublished_date\tcategory\tseed\timage_review\tobservation\n'


class ObservationTests(unittest.TestCase):
    def load(self, text):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'observations.tsv'
            path.write_text(HEADER + text, encoding='utf-8')
            return MODULE['read_observations'](path)

    def test_duplicate_seeds_with_different_hex_spelling_are_excluded(self):
        rows = self.load('abc123\t2022-08-10\tSolar\t0x000A\tviewed\tRed hull\n'
                         'def123\t2022-08-10\tSolar\t0xa\tviewed\tWhite hull\n')
        self.assertEqual(rows[0]['duplicate_seed_posts'], ['abc123', 'def123'])
        self.assertFalse(any(row['eligible_for_trace'] for row in rows))

    def test_malformed_seed_is_preserved_without_silent_correction(self):
        row = self.load('abc123\t2023-09-03\tFighter\t1x1234\tviewed\tWhite hull\n')[0]
        self.assertEqual(row['seed'], '1x1234')
        self.assertFalse(row['seed_valid'])
        self.assertFalse(row['eligible_for_trace'])

    def test_titles_and_unknown_model_routes_do_not_become_visual_fixtures(self):
        rows = self.load('abc123\t2023-09-03\tFighter\t0x1\tunavailable\tMissing photo\n'
                         'def123\t2023-09-03\tGoldenVector\t0x1\tviewed\tGold hull\n')
        self.assertFalse(any(row['eligible_for_trace'] for row in rows))

    def test_duplicate_post_or_truncated_row_is_rejected(self):
        row = 'abc123\t2023-09-03\tFighter\t0x1\tviewed\tHull\n'
        with self.assertRaisesRegex(ValueError, 'duplicate'):
            self.load(row + row)
        with self.assertRaises(ValueError):
            self.load('abc123\t2023-09-03\tFighter\n')


if __name__ == '__main__':
    unittest.main()
