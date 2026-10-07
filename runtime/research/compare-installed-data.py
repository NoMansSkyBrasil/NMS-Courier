"""Compare members of the installed game's archives with the research corpus by content hash.

Reads selected members straight from the installed PAK files (in memory,
through the pinned archive reader) and compares their SHA-256 with the hash
the corpus index recorded for the same path. Nothing is extracted to disk and
neither the game nor the corpus is modified. Use it to learn whether data a
port was checked against is unchanged in the installed build.
"""
import argparse
import fnmatch
import hashlib
import importlib.metadata
import json
from pathlib import Path
import sqlite3
import sys


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--game-archives', type=Path, required=True, help='Folder holding the installed NMSARC.*.pak files')
    parser.add_argument('--corpus', type=Path, required=True)
    parser.add_argument('--python-tools', type=Path, required=True)
    parser.add_argument('--archive', action='append', required=True, help='Archive file name; repeatable, maximum 8')
    parser.add_argument('--match', action='append', required=True,
                        help='Case-insensitive path pattern (fnmatch) of members to compare; repeatable')
    parser.add_argument('--byte-budget', type=int, default=512 * 1024**2)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    output = args.output.resolve()
    if output.exists() or output.is_relative_to(Path(__file__).resolve().parents[2]):
        parser.error('Require a new output outside the repository')
    sys.path.insert(0, str(args.python_tools))
    from hgpaktool import HGPAKFile
    if importlib.metadata.version('hgpaktool') != '1.1.3':
        parser.error('This script requires the audited HGPAKtool 1.1.3 API')
    database = sqlite3.connect((args.corpus / 'index.sqlite').resolve().as_uri() + '?mode=ro', uri=True)
    patterns = [pattern.lower() for pattern in args.match]
    records, read = [], 0
    summary = {'identical': 0, 'changed': 0, 'not_in_corpus': 0, 'skipped_budget': 0}
    archives = {}
    for name in args.archive[:8]:
        path = args.game_archives / name
        seen = set()
        # One indexed read per archive; per-member queries would scan the whole table.
        known = dict(database.execute('select path, content_hash from files where archive = ?', (name,)))
        with HGPAKFile(path) as pak:
            for member in pak.files:
                key = member.lower()
                if not any(fnmatch.fnmatchcase(key, pattern) for pattern in patterns):
                    continue
                seen.add(key)
                size = pak.files[member].size
                if read + size > args.byte_budget:
                    summary['skipped_budget'] += 1
                    continue
                digest = hashlib.sha256()
                # Pinned reader iterator: streams decompressed chunks without writing them anywhere.
                for chunk in pak._extractor_function(member):
                    digest.update(chunk)
                read += size
                recorded = known.get(key)
                state = 'not_in_corpus' if not recorded else (
                    'identical' if recorded == digest.hexdigest() else 'changed')
                summary[state] += 1
                if state != 'identical' and len(records) < 2000:
                    records.append({'archive': name, 'path': key, 'state': state, 'bytes': size})
        missing = [path for path in known
                   if path not in seen and any(fnmatch.fnmatchcase(path, pattern) for pattern in patterns)]
        archives[name] = {'matched_members': len(seen), 'in_corpus_only': missing[:200],
                          'in_corpus_only_count': len(missing)}
    report = {'game_archives': str(args.game_archives), 'patterns': patterns, 'bytes_read': read,
              'summary': summary, 'archives': archives, 'differences': records,
              'tool_sha256': hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
              'limitations': ['Only members matching the patterns are compared.',
                              'Equal content does not validate a port; it shows the checked input is unchanged.']}
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open('x', encoding='utf-8') as stream:
        json.dump(report, stream, indent=2)
    print(json.dumps({'summary': summary, 'bytes_read': read,
                      'differences': [record['path'] for record in records[:40]]}))


if __name__ == '__main__':
    main()
