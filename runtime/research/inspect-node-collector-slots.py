"""Inspect selected, source-identified node table slots in the pinned executable.

This checks five previously traced constructor assignments, not a generic
vtable detector. Bytes stay external and no native code or game process runs.
"""
import argparse
import hashlib
import json
from pathlib import Path
import runpy
import struct

HASH = '671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4'
TABLES = (0x4afb270, 0x4afb398, 0x4afb748, 0x4afb6f8, 0x4b21ec0)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--executable', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    output = args.output.resolve()
    if output.exists() or output.is_relative_to(Path(__file__).resolve().parents[2]) or output.is_relative_to(args.executable.resolve().parent.parent):
        parser.error('Require a new external output')
    if args.executable.stat().st_size > 128 * 1024**2:
        parser.error('Executable byte bound exceeded')
    raw = args.executable.read_bytes()
    if hashlib.sha256(raw).hexdigest() != HASH:
        parser.error('Executable fingerprint mismatch')
    sections = runpy.run_path(str(Path(__file__).parents[1] / 'native/asi/locate-frontend-hooks.py'))['executable_sections'](raw)
    rows = []
    for rva in TABLES:
        section = next(s for s in sections if s['name'] == '.rdata' and s['virtual_address'] <= rva and rva + 0x28 <= s['virtual_address'] + s['raw_size'])
        start = section['raw_offset'] + rva - section['virtual_address']
        target = struct.unpack_from('<Q', raw, start + 0x20)[0] - 0x140000000
        rows.append({'table_rva': hex(rva), 'slot': '0x20', 'target_rva': hex(target),
                     'known_collector': target in (0x1833ec0, 0x1839e10)})
    report = {'exe_sha256': HASH, 'runtime_verified': False, 'rows': rows,
              'scope': 'Only previously identified constructor tables; not every node type'}
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open('x', encoding='utf-8') as stream:
        json.dump(report, stream, indent=2)
    print(json.dumps({'tables': len(rows), 'known_collectors': sum(r['known_collector'] for r in rows)}))
    if not all(r['known_collector'] for r in rows):
        raise SystemExit(1)


if __name__ == '__main__':
    main()
