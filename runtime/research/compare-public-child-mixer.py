"""Cross-check reviewed, hash-pinned public arithmetic against Courier primitives.

Only the PRNG class and _bodySeed function are compiled from the public source.
No module imports, top-level side effects, downloaded entrypoints or assets run.
"""
import argparse
import ast
import hashlib
import json
from pathlib import Path
import random
import runpy

HASHES = {'prng.py': 'fce048f001949fc196765523f8127a3ed5d93c1a5d99f24f8c56826aeadacb93',
          'iprng.py': '9d858e45072f0ab844bed6b662109f7cd2e19bb2715131fdcb6bed2a6a1ed065',
          'system.py': '9b2c4ea245a26bc8f7a7c7c936b3c917dd8bab38e3dc235fabcee26dd9556e70'}
COMMIT = '52ad48affaa4089c8f487a470a888dc9b7a650aa'


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--reference', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    if args.output.exists() or args.output.resolve().is_relative_to(Path(__file__).resolve().parents[2]):
        parser.error('Output must be new and external to the repository')
    source = {}
    for filename, expected in HASHES.items():
        path = args.reference / filename
        if path.stat().st_size > 65536:
            parser.error('Public source exceeds the 64 KiB per-file budget')
        raw = path.read_bytes()
        if hashlib.sha256(raw).hexdigest() != expected:
            parser.error('Public source fingerprint mismatch: ' + filename)
        source[filename] = raw.decode('utf-8')
    namespace = {'CONST_A': 0x64DD81482CBD31D7, 'CONST_B': 0xE36AA5C613612997}
    for filename, name in (('prng.py', 'PRNG'), ('system.py', '_bodySeed')):
        tree = ast.parse(source[filename])
        selected = next(n for n in tree.body if isinstance(n, (ast.ClassDef, ast.FunctionDef)) and n.name == name)
        exec(compile(ast.Module(body=[selected], type_ignores=[]), filename, 'exec'), namespace)
    p = runpy.run_path(str(Path(__file__).with_name('procedural-seed-primitives.py')))
    rng = random.Random(180383)
    seeds = [0, 1, 0xFFFFFFFFFFFFFFFF] + [rng.getrandbits(64) for _ in range(1024)]
    for seed in seeds:
        state = p['seed_state'](seed)
        reference = namespace['PRNG']((state[1] << 32) | state[0])
        child = namespace['_bodySeed'](reference)
        expected_state, expected = p['child_seed'](state)
        if child != expected or reference.seed != (expected_state[1] << 32) | expected_state[0]:
            raise AssertionError('Pinned public child mixer disagrees')
    report = {'source': 'https://github.com/hadsh/nms_namegen', 'commit': COMMIT,
              'source_sha256': HASHES, 'child_mixer_comparisons': len(seeds),
              'mismatches': 0, 'runtime_verified': False,
              'scope': 'Reviewed PRNG class and _bodySeed only; not planet/system appearance validation'}
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, indent=2), encoding='utf-8')
    print(json.dumps({'child_mixer_comparisons': len(seeds), 'mismatches': 0}))


if __name__ == '__main__':
    main()
