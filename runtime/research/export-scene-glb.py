"""Convert one converted game scene and its geometry streams to a texture-free GLB.

Inputs are MBINCompiler XML files already present in the external research
corpus: a scene graph (cTkSceneNodeData), the geometry metadata
(cTkGeometryData) and the geometry stream container (cTkGeometryStreamData).
Referenced scenes are resolved through the read-only corpus index. The output
keeps the scene hierarchy, node names and transforms, so procedural descriptor
alternatives (names starting with an underscore) can be shown or hidden by a
viewer. Materials, textures, normals, skinning, lights and collision are not
exported. The output must be new and outside the repository and the corpus.
No archive is extracted and no game process or save is accessed.
"""
import argparse
import base64
import hashlib
import json
import math
import re
import runpy
from pathlib import Path
import sqlite3
import struct
import xml.etree.ElementTree as ET

HALF, FLOAT = 5131, 5126
# Import limits of the desktop model workshop (apps/desktop/src/main/model-preview-import.ts).
MAX_BYTES, MAX_JSON, MAX_ACCESSORS, MAX_ELEMENTS, MAX_COUNT = 64 * 1024**2, 4 * 1024**2, 16384, 12_000_000, 1_000_000
POSITION_SEMANTIC = 0
# Palette channels that index the five generated samples of a family.
CHANNELS = ('Primary', 'Alternative1', 'Alternative2', 'Alternative3', 'Alternative4')


def linear(value):
    value = min(max(value, 0.0), 1.0)
    return value / 12.92 if value <= 0.04045 else ((value + 0.055) / 1.055) ** 2.4


def child(node, name):
    for item in node:
        if item.get('name') == name:
            return item
    return None


def text(node, name, default=None):
    item = child(node, name)
    return default if item is None else item.get('value', default)


def load_xml(path, template, limit):
    path = Path(path)
    if path.stat().st_size > limit:
        raise ValueError('Input exceeds its byte budget: %s' % path.name)
    root = ET.parse(path).getroot()
    if root.get('template') != template:
        raise ValueError('%s is not %s' % (path.name, template))
    return root


def position_layout(geometry):
    """(from position stream, offset, component type, stride) of the position element.

    Models normally keep positions in the separate position stream; some keep them in the main vertex layout.
    """
    for name, separate in (('PositionVertexLayout', True), ('VertexLayout', False)):
        layout = child(geometry, name)
        elements = child(layout, 'VertexElements') if layout is not None else None
        for element in elements if elements is not None else ():
            if int(text(element, 'SemanticID')) == POSITION_SEMANTIC:
                kind, size = int(text(element, 'Type')), int(text(element, 'Size'))
                if kind not in (HALF, FLOAT) or size < 3:
                    raise ValueError('Unsupported position element type %d size %d' % (kind, size))
                return separate, int(text(element, 'Offset')), kind, int(text(layout, 'Stride'))
    raise ValueError('Geometry has no position element')


def load_streams(geometry_path, data_path):
    """Map stream hash -> (float32 positions bytes, vertex count, uint32 indices bytes, index count, min, max)."""
    geometry = load_xml(geometry_path, 'cTkGeometryData', 256 * 1024**2)
    if int(text(geometry, 'VertexCount', '0')) == 0:
        return {}          # container scenes carry an empty geometry file
    separate, offset, kind, stride = position_layout(geometry)
    narrow = int(text(geometry, 'Indices16Bit', '0')) != 0
    data = load_xml(data_path, 'cTkGeometryStreamData', 512 * 1024**2)
    streams = {}
    for item in child(data, 'StreamDataArray'):
        vertex_size = int(text(item, 'VertexDataSize'))
        index_size = int(text(item, 'IndexDataSize'))
        position_size = int(text(item, 'VertexPositionDataSize'))
        packed = base64.b64decode(text(item, 'MeshDataStream', ''))
        positions = base64.b64decode(text(item, 'MeshPositionDataStream', ''))
        if len(packed) != vertex_size + index_size or len(positions) != position_size:
            raise ValueError('Stream %s has inconsistent sizes' % text(item, 'IdString'))
        if not separate:
            positions = packed[:vertex_size]
        if len(positions) % stride:
            raise ValueError('Stream %s is not a whole number of vertices' % text(item, 'IdString'))
        count = len(positions) // stride
        code, width = ('e', 2) if kind == HALF else ('f', 4)
        out = bytearray(count * 12)
        low, high = [math.inf] * 3, [-math.inf] * 3
        for index in range(count):
            point = struct.unpack_from('<3' + code, positions, index * stride + offset)
            struct.pack_into('<3f', out, index * 12, *point)
            for axis in range(3):
                low[axis], high[axis] = min(low[axis], point[axis]), max(high[axis], point[axis])
        # A set file-level flag means sixteen-bit streams. A clear flag does not describe every stream
        # (observed: clear with sixteen-bit streams), so such a stream is read as thirty-two-bit only when
        # it has more vertices than sixteen bits address or every odd sixteen-bit word is zero.
        words = struct.unpack_from('<%dH' % (index_size // 2), packed, vertex_size)
        if not narrow and index_size % 4 == 0 and (count > 0xffff or (len(words) > 2 and not any(words[1::2]))):
            indices = struct.unpack_from('<%dI' % (index_size // 4), packed, vertex_size)
        else:
            indices = words
        if indices and max(indices) >= count:
            raise ValueError('Stream %s indexes beyond its vertices' % text(item, 'IdString'))
        # Sixteen-bit indices whenever the stream allows; 0xffff is avoided as a restart value.
        short = count < 0xffff
        streams[int(text(item, 'Hash'))] = (bytes(out), count,
                                           struct.pack('<%d%s' % (len(indices), 'H' if short else 'I'), *indices),
                                           len(indices), low, high, 5123 if short else 5125)
    return streams


def quaternion(x, y, z):
    """Quaternion (x, y, z, w) of R = Rz * Ry * Rx for angles in degrees.

    The composition order is the conventional scene-node order used by community importers; it is an
    assumption checked only by rendered inspection, not a traced engine fact.
    """
    cx, sx = math.cos(math.radians(x) / 2), math.sin(math.radians(x) / 2)
    cy, sy = math.cos(math.radians(y) / 2), math.sin(math.radians(y) / 2)
    cz, sz = math.cos(math.radians(z) / 2), math.sin(math.radians(z) / 2)
    return [sx * cy * cz - cx * sy * sz, cx * sy * cz + sx * cy * sz, cx * cy * sz - sx * sy * cz,
            cx * cy * cz + sx * sy * sz]


class Corpus:
    """Read-only path resolver over the research corpus index."""

    def __init__(self, root):
        self.connection = sqlite3.connect('file:%s?mode=ro' % (Path(root) / 'index.sqlite').as_posix(), uri=True)

    def xml(self, game_path, suffixes=('',)):
        wanted = game_path.replace('\\', '/').lower()
        for suffix in suffixes:
            row = self.connection.execute(
                "select xml_path from files where path = ? and conversion = 'ok' and xml_path is not null",
                (wanted + suffix,)).fetchone()
            if row:
                return Path(row[0])
        return None


class Builder:
    def __init__(self, corpus, max_depth, lod, exclude, included=None, colors=None):
        # colors: palette family -> five RGBA samples for one palette seed, or None for placeholders.
        self.colors, self.bindings = colors, []
        self.corpus, self.max_depth, self.lod, self.exclude = corpus, max_depth, lod, exclude
        # included(node name) -> bool: descriptor visibility of a loaded node for one evaluated seed.
        self.included, self.pruned = included, 0
        self.materials, self.material_cache = [], {}
        self.nodes, self.meshes, self.accessors, self.views = [], [], [], []
        self.binary = bytearray()
        self.stream_cache, self.scene_cache, self.mesh_cache, self.accessor_cache = {}, {}, {}, {}
        self.warnings, self.sources = [], {}
        self.elements = 0

    def view(self, data, target):
        while len(self.binary) % 4:
            self.binary.append(0)
        self.views.append({'buffer': 0, 'byteOffset': len(self.binary), 'byteLength': len(data), 'target': target})
        self.binary += data
        return len(self.views) - 1

    def binding(self, game_path):
        """Palette binding of a material's diffuse texture: (texture path, family, channel) or None.

        The diffuse map's sibling procedural texture list names a palette family and channel per option.
        Each layer contributes its most probable option; among layers with a sample channel the main
        paint layer is preferred by name. The seeded option choice of the game is not evaluated here.
        """
        source = self.corpus.xml(game_path)
        if source is None:
            return None
        diffuse = None
        root = load_xml(source, 'cTkMaterialData', 4 * 1024**2)
        samplers = child(root, 'Samplers')
        for sampler in samplers if samplers is not None else ():
            if text(sampler, 'Name') == 'gDiffuseMap':
                diffuse = text(sampler, 'Map', '')
        if not diffuse or not diffuse.upper().endswith('.DDS'):
            return None
        # 'DIR/NAME.DDS' and layered 'DIR/NAME.LAYER.DDS' both belong to the list 'DIR/NAME.texture.mbin'.
        folder, _, leaf = diffuse.replace('\\', '/').lower().rpartition('/')
        texture = folder + '/' + leaf.split('.')[0] + '.texture.mbin'
        listing = self.corpus.xml(texture)
        if listing is None:
            return None
        layers = child(load_xml(listing, 'cTkProceduralTextureList', 4 * 1024**2), 'Layers')
        candidates = []
        for layer in layers if layers is not None else ():
            options = child(layer, 'Textures')
            best = None
            for option in options if options is not None else ():
                palette = child(option, 'Palette')
                chance = float(text(option, 'Probability', '0'))
                if palette is not None and (best is None or chance > best[0]):
                    best = (chance, text(palette, 'Palette'), text(palette, 'ColourAlt'))
            if best and best[2] in CHANNELS:
                candidates.append((text(layer, 'Name', ''), best[1], best[2]))
        # One flat color cannot show stacked layers. The main paint layer is preferred by name; this
        # ranking is a viewing heuristic, not an engine rule.
        for wanted in ('PAINT1', 'BASE', 'PAINT'):
            for name, family, channel in candidates:
                if name == wanted:
                    return texture, family, channel
        return (texture, candidates[0][1], candidates[0][2]) if candidates else None

    def material(self, game_path):
        """Untextured material named after the game material; colored when a palette row is available."""
        key = game_path.replace('\\', '/').lower()
        if key not in self.material_cache:
            name = key.rsplit('/', 1)[-1].upper().replace('.MATERIAL.MBIN', '')
            glow = any(mark in name for mark in ('GLOW', 'BLINK')) or name.startswith(('LIGHT', 'HQLIGHT',
                                                                                      'HQWHITELIGHT', 'HEADLIGHT'))
            color = [0.95, 0.85, 0.6, 1.0] if glow else [0.62, 0.64, 0.68, 1.0]
            record = {'material': key, 'name': name, 'source': 'placeholder'}
            if self.colors is not None:
                found = self.binding(key)
                if found:
                    record.update(texture=found[0], family=found[1], channel=found[2], source='unbound')
                    row = self.colors.get(found[1])
                    if row and found[2] in CHANNELS:
                        sample = row[CHANNELS.index(found[2])]
                        # Palette samples are treated as display (sRGB) values; glTF factors are linear.
                        color = [linear(sample[0]), linear(sample[1]), linear(sample[2]), 1.0]
                        record.update(rgba=list(sample), source='palette')
            self.bindings.append(record)
            self.materials.append({'name': name, 'pbrMetallicRoughness': {
                'baseColorFactor': color, 'metallicFactor': 0.1, 'roughnessFactor': 0.8}})
            self.material_cache[key] = len(self.materials) - 1
        return self.material_cache[key]

    def mesh(self, geometry_key, stream_hash, material):
        key = (geometry_key, stream_hash, material)
        if key not in self.mesh_cache:
            positions, count, indices, index_count, low, high, index_type = self.stream_cache[geometry_key][stream_hash]
            if not count or not index_count or max(count, index_count) > MAX_COUNT:
                return None
            shared = self.accessor_cache.get(key[:2])
            if shared is None:
                self.accessors.append({'bufferView': self.view(positions, 34962), 'componentType': 5126,
                                       'count': count, 'type': 'VEC3', 'min': low, 'max': high})
                self.accessors.append({'bufferView': self.view(indices, 34963), 'componentType': index_type,
                                       'count': index_count, 'type': 'SCALAR'})
                self.elements += count + index_count
                shared = self.accessor_cache[key[:2]] = len(self.accessors) - 2
            self.meshes.append({'primitives': [{'attributes': {'POSITION': shared}, 'indices': shared + 1,
                                                'material': material}]})
            self.mesh_cache[key] = len(self.meshes) - 1
        return self.mesh_cache[key]

    def scene(self, game_path):
        """Parsed scene root and its geometry key; streams are loaded once per geometry file."""
        key = game_path.replace('\\', '/').lower()
        if key not in self.scene_cache:
            path = self.corpus.xml(key)
            if path is None:
                self.scene_cache[key] = None
                return None
            root = load_xml(path, 'cTkSceneNodeData', 64 * 1024**2)
            self.sources[key] = hashlib.sha256(path.read_bytes()).hexdigest()
            geometry = None
            attributes = self.attributes(root)
            if attributes.get('GEOMETRY'):
                base = attributes['GEOMETRY'].replace('\\', '/').lower()
                base = base[:-len('.geometry.mbin')] if base.endswith('.geometry.mbin') else base
                metadata = self.corpus.xml(base + '.geometry.mbin', ('.pc', ''))
                data = self.corpus.xml(base + '.geometry.data.mbin', ('.pc', ''))
                if metadata and data:
                    if base not in self.stream_cache:
                        try:
                            self.stream_cache[base] = load_streams(metadata, data)
                        except ValueError as error:
                            self.stream_cache[base] = None
                            self.warnings.append('geometry rejected: %s (%s)' % (base, error))
                        self.sources[base + '.geometry'] = hashlib.sha256(metadata.read_bytes()).hexdigest()
                        self.sources[base + '.geometry.data'] = hashlib.sha256(data.read_bytes()).hexdigest()
                    geometry = base if self.stream_cache[base] is not None else None
                else:
                    self.warnings.append('geometry unavailable: ' + base)
            self.scene_cache[key] = (root, geometry)
        return self.scene_cache[key]

    @staticmethod
    def attributes(node):
        result = {}
        holder = child(node, 'Attributes')
        for item in holder if holder is not None else ():
            result[text(item, 'Name')] = text(item, 'Value', '')
        return result

    def emit(self, node, geometry, depth, top=False):
        kind, name = text(node, 'Type'), text(node, 'Name', '')
        attributes = self.attributes(node)
        if self.included and not top and not self.included(name):
            self.pruned += 1
            return None
        if kind == 'COLLISION' or (kind == 'MESH' and int(attributes.get('LODLEVEL', '0') or 0) != self.lod):
            return None
        if kind == 'MESH' and self.exclude.search(name + '|' + attributes.get('MATERIAL', '')):
            return None
        record = {'name': name.rsplit('\\', 1)[-1] if top else name}
        transform = child(node, 'Transform')
        values = {key: float(text(transform, key, '0')) for key in
                  ('TransX', 'TransY', 'TransZ', 'RotX', 'RotY', 'RotZ', 'ScaleX', 'ScaleY', 'ScaleZ')}
        if any(values[key] for key in ('TransX', 'TransY', 'TransZ')):
            record['translation'] = [values['TransX'], values['TransY'], values['TransZ']]
        if any(values[key] for key in ('RotX', 'RotY', 'RotZ')):
            record['rotation'] = quaternion(values['RotX'], values['RotY'], values['RotZ'])
        if any(values[key] != 1 for key in ('ScaleX', 'ScaleY', 'ScaleZ')):
            record['scale'] = [values['ScaleX'], values['ScaleY'], values['ScaleZ']]
        index = len(self.nodes)
        self.nodes.append(record)
        children = []
        if kind == 'MESH' and geometry:
            stream = self.stream_cache[geometry].get(int(text(node, 'NameHash', '0')))
            mesh = self.mesh(geometry, int(text(node, 'NameHash', '0')),
                             self.material(attributes.get('MATERIAL', 'UNKNOWN'))) if stream else None
            if mesh is None:
                self.warnings.append('mesh without stream: ' + name)
            else:
                record['mesh'] = mesh
        elif kind == 'REFERENCE':
            target = attributes.get('SCENEGRAPH', '')
            if depth >= self.max_depth:
                self.warnings.append('reference depth limit: ' + target)
            else:
                target = target[:-len('.MBIN')] + '.mbin' if target.upper().endswith('.MBIN') else target
                loaded = self.scene(target)
                if loaded is None:
                    self.warnings.append('reference unavailable: ' + target)
                else:
                    inner = self.emit(loaded[0], loaded[1], depth + 1, top=True)
                    if inner is not None:
                        children.append(inner)
        holder = child(node, 'Children')
        for item in holder if holder is not None else ():
            inner = self.emit(item, geometry, depth)
            if inner is not None:
                children.append(inner)
        if children:
            record['children'] = children
        return index

    def glb(self, root):
        document = {'asset': {'version': '2.0', 'generator': 'NMS Courier research scene export'},
                    'scene': 0, 'scenes': [{'nodes': [root]}], 'nodes': self.nodes, 'meshes': self.meshes,
                    'materials': self.materials,
                    'accessors': self.accessors, 'bufferViews': self.views,
                    'buffers': [{'byteLength': len(self.binary)}]}
        body = json.dumps(document, separators=(',', ':')).encode('utf-8')
        body += b' ' * (-len(body) % 4)
        binary = bytes(self.binary) + bytes(-len(self.binary) % 4)
        total = 12 + 8 + len(body) + 8 + len(binary)
        return (struct.pack('<III', 0x46546c67, 2, total) + struct.pack('<II', len(body), 0x4e4f534a) + body
                + struct.pack('<II', len(binary), 0x004e4942) + binary), len(body)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--corpus', type=Path, required=True)
    parser.add_argument('--scene', required=True, help='Game path such as models/.../name.scene.mbin')
    parser.add_argument('--output', type=Path, required=True, help='New GLB outside the repository and corpus')
    parser.add_argument('--reference-depth', type=int, default=3, choices=range(0, 7))
    parser.add_argument('--lod', type=int, default=0, choices=range(0, 5))
    parser.add_argument('--seed', type=lambda value: int(value, 0),
                        help='Keep only the descriptor alternatives the ported traversal selects for this seed')
    parser.add_argument('--palette-seed', type=lambda value: int(value, 0),
                        help='Color materials from the base palette port for this seed (ships and tools use the '
                             'model seed; freighters use the home system seed)')
    parser.add_argument('--exclude', default='SHIELD|SHADOW|LOD[1-9]',
                        help='Case-insensitive pattern over mesh name and material path; matching meshes are dropped')
    args = parser.parse_args()
    output = args.output.resolve()
    repository = Path(__file__).resolve().parents[2]
    if output.exists() or repository in output.parents or args.corpus.resolve() in output.parents:
        parser.error('Output must be new and outside the repository and corpus')
    included = selection = None
    if args.seed is not None:
        # Selection comes from the separately audited explicit-context traversal port with an empty context.
        port = runpy.run_path(str(Path(__file__).with_name('evaluate-descriptor-seed.py')))
        loader = port['CorpusDescriptors'](args.corpus)
        tree = loader.load(args.scene)
        if tree is None:
            parser.error('Scene has no converted descriptor in the corpus index')
        selection = port['evaluate'](args.seed, tree, loader.load)
        loader.close()
        chosen = set(selection['selected_ids'])
        included = lambda name: port['loaded_node_included'](name, chosen)
    colors = None
    if args.palette_seed is not None:
        # Base collection only; alternate branch, bank and threshold state are separate, open inputs.
        palettes = runpy.run_path(str(Path(__file__).with_name('evaluate-base-palettes.py')))
        rows = palettes['generate'](args.palette_seed, palettes['load_base'](args.corpus.resolve()))
        colors = {row['family']: [sample['rgba'] for sample in row['colors']] for row in rows}
    builder = Builder(Corpus(args.corpus), args.reference_depth, args.lod, re.compile(args.exclude, re.IGNORECASE),
                      included, colors)
    loaded = builder.scene(args.scene)
    if loaded is None:
        parser.error('Scene is not available as converted XML in the corpus index')
    root = builder.emit(loaded[0], loaded[1], 0, top=True)
    data, json_size = builder.glb(root)
    budget = {'bytes': len(data), 'json_bytes': json_size, 'accessors': len(builder.accessors),
              'elements': builder.elements, 'nodes': len(builder.nodes), 'meshes': len(builder.meshes)}
    over = [name for name, value, limit in (('bytes', len(data), MAX_BYTES), ('json_bytes', json_size, MAX_JSON),
                                            ('accessors', len(builder.accessors), MAX_ACCESSORS),
                                            ('elements', builder.elements, MAX_ELEMENTS)) if value > limit]
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_bytes(data)
    report = {'scene': args.scene, 'seed': None if args.seed is None else '0x%X' % args.seed,
              'selected_ids': selection and selection['selected_ids'], 'pruned_nodes': builder.pruned,
              'palette_seed': None if args.palette_seed is None else '0x%X' % args.palette_seed,
              'material_bindings': builder.bindings[:2048],
              'classification': selection and selection['classification'],
              'output_sha256': hashlib.sha256(data).hexdigest(), 'budget': budget,
              'exceeds_workshop_limits': over, 'sources': builder.sources,
              'warnings': sorted(set(builder.warnings))[:200], 'warning_count': len(builder.warnings),
              'tool_sha256': hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
              'limitations': ['Positions and triangles only; materials are untextured placeholders named after the game material; '
                              'no textures, normals, skinning or decals.',
                              'Euler composition order Rz*Ry*Rx is an assumption checked by rendered inspection only.',
                              'Only meshes of the selected LOD level are exported; collision nodes and --exclude matches are dropped.',
                              'Without --seed every descriptor alternative is present. With --seed the selection is the offline traversal port with an empty caller context; it is not runtime verified.',
                              'With --palette-seed a material takes one flat color: the base palette sample bound by the most probable option of its diffuse texture list. Texture pixels, masks, the seeded option choice, the alternate palette branch and decals are not applied.']}
    output.with_suffix('.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
    print(json.dumps({key: report[key] for key in ('budget', 'exceeds_workshop_limits', 'warning_count')}))


if __name__ == '__main__':
    main()
