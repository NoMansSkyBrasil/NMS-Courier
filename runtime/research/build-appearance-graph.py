"""Build a bounded offline appearance dependency graph from converted game assets.

Edges are asset references or explicit filename conventions, not proof of seed
selection order, runtime loading precedence, appearance equivalence or delivery.
"""
import argparse
from collections import deque
import hashlib
import json
from pathlib import Path
import sqlite3
import xml.etree.ElementTree as ET


def canonical(path):
    return path.replace('\\', '/').lower()


def linked_assets(root):
    """Collect resource references without treating arbitrary strings as paths."""
    edges = set()
    for element in root.iter():
        raw = element.get('value', '')
        path = canonical(raw)
        if not path.startswith(('models/', 'textures/')):
            continue
        if any(path.endswith(suffix) for suffix in ('.scene.mbin', '.descriptor.mbin', '.material.mbin', '.texture.mbin')):
            edges.add((path, 'xml_reference'))
        elif path.endswith('.dds'):
            edges.add((path, 'binary_texture_reference'))
            if not path.endswith(('.normal.dds', '.masks.dds', '.occlusion.dds', '.parallax.dds')):
                # This is a lookup candidate only; absent siblings remain absent.
                edges.add((path[:-4] + '.texture.mbin', 'texture_sibling_candidate'))
    return edges


def build(corpus, roots, max_nodes=256, max_bytes=64 * 1024 * 1024):
    if not 1 <= len(roots) <= 32 or not 1 <= max_nodes <= 1024 or not 1 <= max_bytes <= 128 * 1024 * 1024:
        raise ValueError('Graph budget out of range')
    pending = deque(canonical(p) for p in roots)
    nodes, edges, seen_edges = {}, [], set()
    total_bytes = 0
    database = sqlite3.connect((corpus / 'index.sqlite').resolve().as_uri() + '?mode=ro', uri=True)
    try:
        while pending:
            logical = pending.popleft()
            if logical in nodes:
                continue
            if len(nodes) >= max_nodes:
                return {'status': 'node_budget_reached', 'nodes': nodes, 'edges': edges,
                        'pending_count': len(pending) + 1, 'xml_bytes': total_bytes, 'runtime_verified': False}
            rows = database.execute('SELECT archive,xml_path FROM files WHERE lower(path)=? LIMIT 17', (logical,)).fetchall()
            node = nodes.setdefault(logical, {})
            if not rows:
                node['status'] = 'not_indexed'
                continue
            if len(rows) != 1:
                node.update(status='ambiguous_archive_sources', source_count=len(rows))
                continue
            archive, xml = rows[0]
            node['archive'] = archive
            links = set()
            if logical.endswith('.scene.mbin'):
                links.add((logical.replace('.scene.', '.descriptor.', 1), 'native_scene_descriptor_lookup_candidate'))
            if not xml:
                node['status'] = 'binary_indexed' if logical.endswith('.dds') else 'xml_unavailable'
            else:
                path = Path(xml).resolve()
                size = path.stat().st_size
                if not path.is_relative_to(corpus.resolve()) or size > 8 * 1024 * 1024:
                    raise ValueError('XML containment/size budget exceeded')
                if total_bytes + size > max_bytes:
                    node['status'] = 'xml_byte_budget_reached'
                    return {'status': 'xml_byte_budget_reached', 'nodes': nodes, 'edges': edges,
                            'pending_count': len(pending) + 1, 'xml_bytes': total_bytes, 'runtime_verified': False}
                data = path.read_bytes()
                total_bytes += len(data)
                if b'<!DOCTYPE' in data or b'<!ENTITY' in data:
                    raise ValueError('XML entity declarations are unsupported')
                root = ET.fromstring(data)
                node.update(status='inspected_xml', template=root.get('template'),
                            xml_sha256=hashlib.sha256(data).hexdigest())
                links.update(linked_assets(root))
            for target, kind in sorted(links):
                key = logical, target, kind
                if key not in seen_edges:
                    if len(edges) >= 8192:
                        raise ValueError('Graph edge budget exceeded')
                    edges.append({'source': logical, 'target': target, 'kind': kind})
                    seen_edges.add(key)
                    pending.append(target)
    finally:
        database.close()
    return {'status': 'completed', 'nodes': nodes, 'edges': edges, 'xml_bytes': total_bytes,
            'pending_count': 0, 'runtime_verified': False}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--corpus', type=Path, required=True)
    parser.add_argument('--root', action='append', required=True)
    parser.add_argument('--max-nodes', type=int, default=256)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    corpus, output = args.corpus.resolve(), args.output.resolve()
    if output.exists() or output.is_relative_to(corpus) or output.is_relative_to(Path(__file__).resolve().parents[2]):
        parser.error('Output must be new and outside corpus/repository')
    report = build(corpus, args.root, args.max_nodes)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(report, indent=2), encoding='utf-8')
    print(json.dumps({'status': report['status'], 'nodes': len(report['nodes']),
                      'edges': len(report['edges']), 'xml_bytes': report['xml_bytes']}))


if __name__ == '__main__':
    main()
