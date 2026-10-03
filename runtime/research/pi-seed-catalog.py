"""Resumable procedural item seed catalog adapted from Pi's enumeration approach.

Plans and imports owned result snapshots only. No injection, native calls, save
editing, memory-container clearing, or automatic runtime retries are performed.
"""
import argparse
import hashlib
import json
import math
from pathlib import Path
import re
import sqlite3


def canonical(value):
    return json.dumps(value, sort_keys=True, separators=(',', ':'), allow_nan=False)


def validate_config(config):
    if set(config) != {'exe_sha256', 'kind', 'item', 'start', 'stop', 'evidence'}:
        raise ValueError('Invalid catalog configuration fields')
    if not re.fullmatch('[0-9a-f]{64}', config['exe_sha256']):
        raise ValueError('Expected lowercase executable SHA-256')
    if config['kind'] not in ('technology', 'product') or config['evidence'] not in ('simulated', 'observed'):
        raise ValueError('Invalid item kind or evidence level')
    if not re.fullmatch('[A-Z0-9_]{1,48}', config['item']):
        raise ValueError('Expected an uppercase base item identifier without a seed suffix')
    if any(type(config[key]) is not int for key in ('start', 'stop')) or not 0 <= config['start'] < config['stop'] <= 100000:
        raise ValueError('Seed interval must lie in 0..99999')
    return config


def open_catalog(path, config=None):
    """Keep provenance immutable; reopening never silently changes the game build."""
    if config is not None:
        validate_config(config)
    elif not path.is_file():
        raise ValueError('Catalog does not exist')
    connection = sqlite3.connect(path)
    try:
        connection.execute('CREATE TABLE IF NOT EXISTS metadata (id INTEGER PRIMARY KEY CHECK(id=1), config TEXT NOT NULL)')
        connection.execute('CREATE TABLE IF NOT EXISTS results (seed INTEGER PRIMARY KEY, payload TEXT NOT NULL, sha256 TEXT NOT NULL)')
        row = connection.execute('SELECT config FROM metadata WHERE id=1').fetchone()
        if row is None:
            if config is None:
                raise ValueError('Catalog metadata is missing')
            connection.execute('INSERT INTO metadata VALUES (1, ?)', (canonical(config),))
            connection.commit()
        else:
            stored = validate_config(json.loads(row[0]))
            if config is not None and canonical(config) != canonical(stored):
                raise ValueError('Catalog configuration mismatch; use a separate catalog')
            config = stored
        return connection, config
    except Exception:
        connection.close()
        raise


def pending(connection, config, limit):
    """Return bounded missing inputs; a missing result does not authorize a call."""
    if not 1 <= limit <= 1000:
        raise ValueError('Batch limit must be 1..1000')
    result = []
    cursor = connection.execute('SELECT seed FROM results ORDER BY seed')
    existing = next(cursor, None)
    for seed in range(config['start'], config['stop']):
        while existing is not None and existing[0] < seed:
            existing = next(cursor, None)
        if existing is not None and existing[0] == seed:
            continue
        result.append({**config, 'seed': seed, 'procedural_id': f"{config['item']}#{seed:05d}",
                       'runtime_call_authorized': False})
        if len(result) == limit:
            break
    return result


def validate_result(record, config):
    required = {'exe_sha256', 'kind', 'item', 'evidence', 'seed', 'procedural_id', 'raw', 'provenance'}
    if set(record) != required or any(record[key] != config[key] for key in ('exe_sha256', 'kind', 'item', 'evidence')):
        raise ValueError('Result fields or provenance do not match the catalog')
    seed = record['seed']
    if type(seed) is not int or not config['start'] <= seed < config['stop']:
        raise ValueError('Result seed is outside the configured interval')
    if record['procedural_id'] != f"{config['item']}#{seed:05d}":
        raise ValueError('Procedural identifier does not match the decimal seed')
    if not isinstance(record['raw'], dict) or not record['raw']:
        raise ValueError('Owned raw result fields are required')
    provenance = record['provenance']
    if not isinstance(provenance, dict) or not isinstance(provenance.get('source'), str) or not provenance['source'].strip():
        raise ValueError('Result source is required')
    if config['evidence'] == 'observed':
        for key in ('adapter_sha256', 'capture_sha256'):
            if not isinstance(provenance.get(key), str) or not re.fullmatch('[0-9a-f]{64}', provenance[key]):
                raise ValueError('Observed results require adapter and capture SHA-256 provenance')
    def check(value, depth=0):
        if depth > 12:
            raise ValueError('Result nesting budget exceeded')
        if isinstance(value, float) and not math.isfinite(value):
            raise ValueError('Non-finite raw values are not accepted')
        if isinstance(value, dict):
            for child in value.values():
                check(child, depth + 1)
        elif isinstance(value, list):
            for child in value:
                check(child, depth + 1)
    check(record)
    encoded = canonical(record)
    if len(encoded.encode('utf-8')) > 65536:
        raise ValueError('Result exceeds 64 KiB budget')
    return encoded


def import_results(connection, config, records):
    """One atomic bounded batch; conflicting duplicates never replace evidence."""
    count = 0
    with connection:
        for count, record in enumerate(records, 1):
            if count > 1000:
                raise ValueError('Import exceeds 1000-result batch budget')
            encoded = validate_result(record, config)
            digest = hashlib.sha256(encoded.encode()).hexdigest()
            old = connection.execute('SELECT payload, sha256 FROM results WHERE seed=?', (record['seed'],)).fetchone()
            if old is not None:
                if old != (encoded, digest):
                    raise ValueError('Conflicting result for an existing seed')
            else:
                connection.execute('INSERT INTO results VALUES (?, ?, ?)', (record['seed'], encoded, digest))
    return count


def read_jsonl(path):
    with path.open(encoding='utf-8') as stream:
        while True:
            line = stream.readline(65538)
            if not line:
                break
            if len(line.encode('utf-8')) > 65537:
                raise ValueError('JSONL line exceeds result budget')
            yield json.loads(line)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--catalog', type=Path, required=True)
    commands = parser.add_subparsers(dest='command', required=True)
    plan = commands.add_parser('plan')
    plan.add_argument('--exe-sha256', required=True)
    plan.add_argument('--kind', choices=('technology', 'product'), required=True)
    plan.add_argument('--item', required=True)
    plan.add_argument('--evidence', choices=('simulated', 'observed'), required=True)
    plan.add_argument('--start', type=int, default=0)
    plan.add_argument('--stop', type=int, default=100)
    batch = commands.add_parser('pending')
    batch.add_argument('--limit', type=int, default=25)
    batch.add_argument('--output', type=Path, required=True)
    ingest = commands.add_parser('import')
    ingest.add_argument('--input', type=Path, required=True)
    export = commands.add_parser('export')
    export.add_argument('--output', type=Path, required=True)
    commands.add_parser('status')
    args = parser.parse_args()
    repo = Path(__file__).resolve().parents[2]
    for path in (args.catalog, getattr(args, 'output', None)):
        if path is not None and path.resolve().is_relative_to(repo):
            parser.error('Catalog and outputs must remain outside the repository')
    if getattr(args, 'output', None) is not None and args.output.resolve() == args.catalog.resolve():
        parser.error('Output must not overwrite the catalog')
    config = None
    if args.command == 'plan':
        config = {key: getattr(args, key) for key in ('exe_sha256', 'kind', 'item', 'start', 'stop', 'evidence')}
    connection, config = open_catalog(args.catalog, config)
    try:
        if args.command == 'pending':
            with args.output.open('x', encoding='utf-8') as stream:
                for row in pending(connection, config, args.limit):
                    stream.write(canonical(row) + '\n')
        elif args.command == 'import':
            import_results(connection, config, read_jsonl(args.input))
        elif args.command == 'export':
            if args.output.resolve() == args.catalog.resolve():
                raise ValueError('Export must not overwrite the catalog')
            with args.output.open('x', encoding='utf-8') as stream:
                for payload, in connection.execute('SELECT payload FROM results ORDER BY seed'):
                    stream.write(payload + '\n')
        count = connection.execute('SELECT COUNT(*) FROM results').fetchone()[0]
        print(canonical({'configuration': config, 'completed': count,
                         'remaining': config['stop'] - config['start'] - count, 'runtime_calls_enabled': False}))
    finally:
        connection.close()


if __name__ == '__main__':
    main()
