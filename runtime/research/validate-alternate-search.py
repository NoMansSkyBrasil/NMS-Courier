"""Bounded corpus search regression for explicit ship/tool/freighter alternate colors."""
import argparse
import hashlib
import json
from pathlib import Path
import runpy
import subprocess
import sys

HERE = Path(__file__).resolve().parent
SEARCH = runpy.run_path(str(HERE / 'search-appearance-seeds.py'))
PROFILES = (
    ('ship', 'models/common/spacecraft/fighters/fighter_proc.descriptor.mbin'),
    ('multitool', 'models/common/weapons/multitool/multitool.descriptor.mbin'),
    ('freighter', 'models/common/spacecraft/industrial/piratefreighter.descriptor.mbin'),
)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--corpus', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--task-inputs', action='store_true', help='Resolve branch from task inputs and use pinned fallback')
    args = parser.parse_args()
    corpus, output = args.corpus.resolve(), args.output.resolve()
    if output.exists() or any(output.is_relative_to(p) for p in (corpus, HERE.parents[1])):
        parser.error('Require a new external output directory')
    palettes = SEARCH['B']['load_base'](corpus)
    loader = SEARCH['D']['CorpusDescriptors'](corpus)
    output.mkdir(parents=True, exist_ok=False)
    records = []
    try:
        for category, descriptor in PROFILES:
            selected = SEARCH['D']['evaluate'](7, loader.load(descriptor), loader.load)['selected_ids']
            palette_seed = 0x1ad0003900054 if category == 'freighter' else 7
            fallback = SEARCH['A']['FALLBACK_RGBA'] if args.task_inputs else [0.25, 0.5, 0.75, 1]
            rows = SEARCH['A']['generate'](palette_seed, palettes, 0.1, fallback)
            paint = next(row for row in rows if row['family'] == ('Freighter' if category == 'freighter' else 'Paint'))
            record = {'category': category, 'route': 'owned_default', 'descriptor': descriptor,
                      'model_seed': {'value': '0x7', 'enabled': True},
                      'material_second_seed': {'value': '0xffffffffffffffff', 'enabled': False},
                      'engine_context_index': 0, 'resource_flags': 0, 'selection': {'mode': 'seeded'}}
            if category == 'freighter': record['home_system_seed'] = {'value': hex(palette_seed), 'enabled': True}
            request = {'input': record, 'constraints': {'required_ids': selected,
                       'palette': [{'family': paint['family'], 'slot': 1, 'index': paint['colors'][1]['index'],
                                    'rgba': list(paint['colors'][1]['rgba'])}]},
                       'palette_branch': 'alternate', 'palette_parameters': {
                           'similarity_threshold': 0.1, 'fallback_rgba': [0.25, 0.5, 0.75, 1]},
                       'start': '0x0', 'count': 8, 'seconds': 60, 'max_results': 20}
            if args.task_inputs:
                del request['palette_branch']
                del request['palette_parameters']['fallback_rgba']
                request['palette_task'] = {'alternate_flag': 1, 'global_mode': 0, 'precomputed': False}
            request_at, report_at = output / (category + '-request.json'), output / (category + '-result.json')
            request_at.write_text(json.dumps(request, indent=2), encoding='utf-8')
            run = subprocess.run([sys.executable, str(HERE / 'search-appearance-seeds.py'), '--corpus', str(corpus),
                                  '--request', str(request_at), '--output', str(report_at)],
                                 capture_output=True, text=True, timeout=90, check=True)
            result = json.loads(report_at.read_text(encoding='utf-8'))
            anchor = next((r for r in result['candidates'] if r['seed'] == '0x7'), None)
            matched = result['palette_branch'] == 'alternate' and result.get('palette_task') == request.get('palette_task') and result['examined'] == 8 and anchor is not None and anchor['selected_ids'] == selected and all(
                list(color['rgba']) == list(reference['rgba']) for row, expected in zip(anchor['palette_rows'], rows)
                for color, reference in zip(row['colors'], expected['colors']))
            records.append({'category': category, 'descriptor': descriptor, 'examined': result['examined'],
                            'candidate_count': len(result['candidates']), 'anchor_seed': '0x7', 'matches': matched,
                            'palette_seed': hex(palette_seed), 'request_sha256': result['request_sha256'],
                            'report_sha256': hashlib.sha256(report_at.read_bytes()).hexdigest()})
    finally:
        loader.close()
    report = {'cases': len(records), 'mismatches': sum(not r['matches'] for r in records), 'records': records,
              'executable_sha256': SEARCH['INPUTS']['SCENES']['CONTEXTS']['HASH'], 'task_inputs': args.task_inputs, 'runtime_verified': False,
              'limitations': ['Round-trip integration uses recovered forward evaluators, not an independent game oracle.',
                              'Explicit alternate threshold and base collection; natural category branch selection is unproven.']}
    (output / 'report.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
    print(json.dumps({k: report[k] for k in ('cases', 'mismatches')}))
    if report['mismatches']: raise SystemExit(1)


if __name__ == '__main__': main()
