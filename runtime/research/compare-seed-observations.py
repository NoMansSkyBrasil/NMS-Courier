"""Bounded offline comparison preparation; public photographs are not native oracles.

No network, native execution, process attachment, save access or image downloading.
Outputs experimental descriptor IDs and base palettes, never an appearance score.
"""
import argparse
import csv
import hashlib
import json
from pathlib import Path
import re
import runpy
import sys

HERE = Path(__file__).resolve().parent
DESCRIPTORS = runpy.run_path(str(HERE / 'evaluate-descriptor-seed.py'))
PALETTES = runpy.run_path(str(HERE / 'evaluate-base-palettes.py'))
BUILD_SHA256 = '671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4'
MODELS = {
    'Fighter': 'models/common/spacecraft/fighters/fighter_proc.descriptor.mbin',
    'Hauler': 'models/common/spacecraft/dropships/dropship_proc.descriptor.mbin',
    'Sentinel': 'models/common/spacecraft/sentinelship/sentinelship_proc.descriptor.mbin',
    'Solar': 'models/common/spacecraft/sailship/sailship_proc.descriptor.mbin',
    'Capital': 'models/common/spacecraft/industrial/capitalfreighter_proc.descriptor.mbin',
    'Pirate': 'models/common/spacecraft/industrial/piratefreighter.descriptor.mbin',
    'Explorer': 'models/common/spacecraft/scientific/scientific_proc.descriptor.mbin',
    'Multitool': 'models/common/weapons/multitool/multitool.descriptor.mbin',
    'RoyalMultitool': 'models/common/weapons/multitool/royalmultitool.descriptor.mbin',
}


def read_observations(path):
    """Reject malformed metadata; preserve invalid seed text and duplicate conflicts."""
    if path.stat().st_size > 128 * 1024:
        raise ValueError('Observation input exceeds byte budget')
    if path.suffix.lower() == '.md':
        # The committed observations are a Markdown data table.
        sys.path.insert(0, str(HERE))
        import markdown_data
        header, table = markdown_data.read_table(path)
        rows = [dict(zip(header, cells)) for cells in table]
    else:
        with path.open(encoding='utf-8', newline='') as stream:
            rows = list(csv.DictReader(stream, delimiter='\t'))
    if not 1 <= len(rows) <= 128:
        raise ValueError('Expected 1..128 observations')
    ids, by_seed = set(), {}
    for row in rows:
        if set(row) != {'post_id', 'published_date', 'category', 'seed', 'image_review', 'observation'}:
            raise ValueError('Observation fields do not match schema')
        if not re.fullmatch(r'[a-z0-9]{5,10}', row['post_id']) or row['post_id'] in ids:
            raise ValueError('Invalid or duplicate public post ID')
        ids.add(row['post_id'])
        if row['image_review'] not in ('viewed', 'metadata_only', 'unavailable'):
            raise ValueError('Unknown image review status')
        if any(not isinstance(value, str) or len(value) > 1024 for value in row.values()):
            raise ValueError('Observation text budget exceeded')
        if not re.fullmatch(r'\d{4}-\d{2}-\d{2}', row['published_date']):
            raise ValueError('Expected publication date in ISO format')
        row['url'] = 'https://www.reddit.com/r/NoMansSkySeedExchange/comments/' + row['post_id'] + '/'
        row['seed_valid'] = bool(re.fullmatch(r'0[xX][0-9a-fA-F]{1,16}', row['seed']))
        if row['seed_valid']:
            row['normalized_seed'] = hex(int(row['seed'], 16))
            by_seed.setdefault((row['category'], row['normalized_seed']), []).append(row['post_id'])
    for row in rows:
        row['duplicate_seed_posts'] = by_seed.get((row['category'], row.get('normalized_seed')), [])
        row['eligible_for_trace'] = (row['seed_valid'] and row['image_review'] == 'viewed'
                                    and len(row['duplicate_seed_posts']) == 1
                                    and row['category'] in MODELS)
    return rows


def build_report(corpus, observations):
    """Resolve candidates once; do not equate a complete trace with visual agreement."""
    palettes = PALETTES['load_base'](corpus)
    loader = DESCRIPTORS['CorpusDescriptors'](corpus)
    results = []
    try:
        for row in observations:
            record = dict(row, comparison='not_evaluated', appearance_match=None)
            if row['eligible_for_trace']:
                model = MODELS[row['category']]
                record['candidate_model'] = model
                try:
                    tree = loader.load(model)
                    if tree is None:
                        raise ValueError('Candidate root not indexed')
                    record['descriptor_candidate'] = DESCRIPTORS['evaluate'](int(row['seed'], 16), tree, loader.load)
                    record['base_palette_candidate'] = PALETTES['generate'](int(row['seed'], 16), palettes)
                    record['comparison'] = 'inconclusive_without_mesh_and_material_binding'
                except ValueError as error:
                    record.update(comparison='unsupported_or_budget', error=str(error))
            results.append(record)
        sources = [{k: v for k, v in item.items() if k != 'tree'} for item in loader.cache.values()]
    finally:
        loader.close()
    return {'build': 180383, 'executable_sha256': BUILD_SHA256,
            'mode': 'offline_public_reference_candidates', 'runtime_verified': False,
            'appearance_evaluator_complete': False, 'sources': sources, 'records': results,
            'counts': {'posts': len(results), 'images_viewed': sum(r['image_review'] == 'viewed' for r in results),
                       'eligible': sum(r['eligible_for_trace'] for r in results),
                       'traces': sum('descriptor_candidate' in r for r in results),
                       'failures': sum(r['comparison'] == 'unsupported_or_budget' for r in results)},
            'limitations': ['Historical photographs have no verified executable fingerprints or customization state.',
                            'Candidate category roots do not recover native filters or caller seed channels.',
                            'Descriptor IDs require mesh correspondence; base palettes are not final hull colors.',
                            'No numeric visual accuracy score, inverse search, class or location inference.']}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--corpus', type=Path, required=True)
    parser.add_argument('--executable', type=Path, required=True)
    parser.add_argument('--observations', type=Path, default=HERE / 'reddit-seed-observations.md')
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    corpus, output = args.corpus.resolve(), args.output.resolve()
    if output.exists() or output.is_relative_to(corpus) or output.is_relative_to(HERE.parents[1]):
        parser.error('Output must be new and outside corpus/repository')
    with args.executable.open('rb') as stream:
        actual = hashlib.file_digest(stream, 'sha256').hexdigest()
    if actual != BUILD_SHA256:
        parser.error('Executable fingerprint differs from the candidate baseline')
    report = build_report(corpus, read_observations(args.observations))
    report['observations_sha256'] = hashlib.sha256(args.observations.read_bytes()).hexdigest()
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open('x', encoding='utf-8') as stream:
        json.dump(report, stream, indent=2)
    print(json.dumps(report['counts']))


if __name__ == '__main__':
    main()
