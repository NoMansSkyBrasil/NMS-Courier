import { readMeshStreams } from './geometry-streams'
import type { MeshStream } from './geometry-streams'
import type { ModelFiles } from './game-model-files'
import { readSceneGraph } from './scene-graph'
import type { SceneNode } from './scene-graph'

// Builds a binary glTF model from a game scene: the scene's nodes and transforms, the scenes it
// refers to, and the triangles of its meshes. With a node filter, only the part alternatives the
// filter accepts are kept, so the model is what one seed selects. A port of the research exporter
// (runtime/research/export-scene-glb.py) without textures: each material is a plain colour.

// The same limits the workshop's own model check applies (model-preview-import.ts).
const maximumBytes = 64 * 1024 * 1024
const maximumElements = 12_000_000
const referenceDepth = 3
// Meshes that would hide the model or repeat it: shield bubbles, shadow casters, lower detail levels.
const excluded = /SHIELD|SHADOW|LOD[1-9]/i

export class SceneModelError extends Error {
  constructor(readonly reason: 'scene_unavailable' | 'model_too_large' | 'no_geometry') {
    super(reason)
  }
}

// Colours for a painted model: main paint, second paint and undercoat, as display values.
export type ScenePaint = {
  primary: readonly number[]
  secondary: readonly number[]
  undercoat: readonly number[]
}

function linear(value: number): number {
  const clamped = Math.min(Math.max(value, 0), 1)
  return clamped <= 0.04045 ? clamped / 12.92 : ((clamped + 0.055) / 1.055) ** 2.4
}

// Which colour a material takes, judged by its name alone. The game decides this per pixel with
// layered textures and masks, which are not read yet; this only gives the hull its main colours.
function paintFor(name: string, paint: ScenePaint): number[] | null {
  const sample = /DECAL|GLASS|ENGINE|JET/.test(name)
    ? null
    : /^(PRIMARY|HQTRIMPRIMARY|RACERMAIN|SCIENTIFIC_MAT|SHUTTLE_?MAT)/.test(name)
      ? paint.primary
      : /^SECONDARY/.test(name)
        ? paint.secondary
        : /^TERTIARY/.test(name)
          ? paint.undercoat
          : null
  if (sample) return [linear(sample[0]), linear(sample[1]), linear(sample[2]), 1]
  return /METAL|TRIM|PIPING|RUBBER/.test(name) ? [0.16, 0.17, 0.19, 1] : null
}

type GlbNode = {
  name: string
  translation?: number[]
  rotation?: number[]
  scale?: number[]
  mesh?: number
  children?: number[]
}

// Quaternion (x, y, z, w) of R = Rz * Ry * Rx for angles in degrees. The order is the one
// community importers use; it was checked by looking at rendered models, not traced in the engine.
function quaternion(x: number, y: number, z: number): number[] {
  const half = Math.PI / 360
  const [cx, sx, cy, sy, cz, sz] = [
    Math.cos(x * half),
    Math.sin(x * half),
    Math.cos(y * half),
    Math.sin(y * half),
    Math.cos(z * half),
    Math.sin(z * half)
  ]
  return [
    sx * cy * cz - cx * sy * sz,
    cx * sy * cz + sx * cy * sz,
    cx * cy * sz - sx * sy * cz,
    cx * cy * cz + sx * sy * sz
  ]
}

export function buildSceneModel(
  files: ModelFiles,
  scenePath: string,
  included: ((nodeName: string) => boolean) | null,
  paint: ScenePaint | null = null
): Uint8Array {
  const nodes: GlbNode[] = []
  const meshes: object[] = []
  const materials: object[] = []
  const accessors: object[] = []
  const views: object[] = []
  const chunks: Buffer[] = []
  let binaryLength = 0
  let elements = 0
  const materialIndex = new Map<string, number>()
  const meshIndex = new Map<string, number>()
  const accessorIndex = new Map<string, number>()
  const sceneCache = new Map<string, { root: SceneNode; geometry: string | null } | null>()
  const streamCache = new Map<string, Map<number, MeshStream> | null>()

  const view = (data: Buffer, target: number): number => {
    const padding = (4 - (binaryLength % 4)) % 4
    if (padding) chunks.push(Buffer.alloc(padding))
    binaryLength += padding
    views.push({ buffer: 0, byteOffset: binaryLength, byteLength: data.length, target })
    chunks.push(data)
    binaryLength += data.length
    if (binaryLength > maximumBytes) throw new SceneModelError('model_too_large')
    return views.length - 1
  }

  const material = (gamePath: string): number => {
    const key = gamePath.replace(/\\/g, '/').toLowerCase()
    const known = materialIndex.get(key)
    if (known !== undefined) return known
    const name = (key.split('/').pop() ?? key).toUpperCase().replace('.MATERIAL.MBIN', '')
    const glow = /GLOW|BLINK/.test(name) || /^(LIGHT|HQLIGHT|HQWHITELIGHT|HEADLIGHT)/.test(name)
    const painted = paint && !glow ? paintFor(name, paint) : null
    materials.push({
      name,
      pbrMetallicRoughness: {
        baseColorFactor: painted ?? (glow ? [0.95, 0.85, 0.6, 1] : [0.62, 0.64, 0.68, 1]),
        metallicFactor: 0.1,
        roughnessFactor: 0.8
      }
    })
    materialIndex.set(key, materials.length - 1)
    return materials.length - 1
  }

  const mesh = (geometry: string, hash: number, materialNumber: number): number | null => {
    const key = `${geometry}|${hash}|${materialNumber}`
    const known = meshIndex.get(key)
    if (known !== undefined) return known
    const stream = streamCache.get(geometry)?.get(hash)
    if (!stream || !stream.indices.length || !stream.positions.length) return null
    let first = accessorIndex.get(`${geometry}|${hash}`)
    if (first === undefined) {
      const count = stream.positions.length / 3
      const short = count < 0xffff
      const indices = short ? Uint16Array.from(stream.indices) : stream.indices
      accessors.push({
        bufferView: view(Buffer.from(stream.positions.buffer), 34962),
        componentType: 5126,
        count,
        type: 'VEC3',
        min: stream.low,
        max: stream.high
      })
      accessors.push({
        bufferView: view(
          Buffer.from(indices.buffer, indices.byteOffset, indices.byteLength),
          34963
        ),
        componentType: short ? 5123 : 5125,
        count: stream.indices.length,
        type: 'SCALAR'
      })
      elements += count + stream.indices.length
      if (elements > maximumElements) throw new SceneModelError('model_too_large')
      first = accessors.length - 2
      accessorIndex.set(`${geometry}|${hash}`, first)
    }
    meshes.push({
      primitives: [
        { attributes: { POSITION: first }, indices: first + 1, material: materialNumber }
      ]
    })
    meshIndex.set(key, meshes.length - 1)
    return meshes.length - 1
  }

  const scene = (gamePath: string): { root: SceneNode; geometry: string | null } | null => {
    const key = gamePath.replace(/\\/g, '/').toLowerCase()
    if (sceneCache.has(key)) return sceneCache.get(key) ?? null
    const data = files.read(key)
    if (!data) {
      sceneCache.set(key, null)
      return null
    }
    const root = readSceneGraph(data)
    let geometry: string | null = null
    const named = root.attributes.GEOMETRY
    if (named) {
      const base = named
        .replace(/\\/g, '/')
        .toLowerCase()
        .replace(/\.geometry\.mbin$/, '')
      if (!streamCache.has(base)) {
        const description = files.read(base + '.geometry.mbin.pc')
        const streams = files.read(base + '.geometry.data.mbin.pc')
        try {
          streamCache.set(
            base,
            description && streams ? readMeshStreams(description, streams) : null
          )
        } catch {
          // A part whose geometry cannot be read is left out; the rest of the model is still shown.
          streamCache.set(base, null)
        }
      }
      geometry = streamCache.get(base) ? base : null
    }
    const loaded = { root, geometry }
    sceneCache.set(key, loaded)
    return loaded
  }

  const emit = (
    node: SceneNode,
    geometry: string | null,
    depth: number,
    top: boolean
  ): number | null => {
    if (included && !top && !included(node.name)) return null
    const material_ = node.attributes.MATERIAL ?? 'UNKNOWN'
    if (node.type === 'COLLISION') return null
    if (node.type === 'MESH') {
      if (Number.parseInt(node.attributes.LODLEVEL || '0', 10) !== 0) return null
      if (excluded.test(`${node.name}|${material_}`)) return null
    }
    const record: GlbNode = { name: top ? (node.name.split('\\').pop() ?? node.name) : node.name }
    if (node.translation.some((value) => value !== 0)) record.translation = node.translation
    if (node.rotation.some((value) => value !== 0)) {
      record.rotation = quaternion(node.rotation[0], node.rotation[1], node.rotation[2])
    }
    if (node.scale.some((value) => value !== 1)) record.scale = node.scale
    const index = nodes.length
    nodes.push(record)
    const children: number[] = []
    if (node.type === 'MESH' && geometry) {
      const made = mesh(geometry, node.nameHash, material(material_))
      if (made !== null) record.mesh = made
    } else if (node.type === 'REFERENCE' && depth < referenceDepth) {
      const loaded = scene(node.attributes.SCENEGRAPH ?? '')
      if (loaded) {
        const inner = emit(loaded.root, loaded.geometry, depth + 1, true)
        if (inner !== null) children.push(inner)
      }
    }
    for (const child of node.children) {
      const inner = emit(child, geometry, depth, false)
      if (inner !== null) children.push(inner)
    }
    if (children.length) record.children = children
    return index
  }

  const loaded = scene(scenePath)
  if (!loaded) throw new SceneModelError('scene_unavailable')
  const root = emit(loaded.root, loaded.geometry, 0, true)
  if (root === null || meshes.length === 0) throw new SceneModelError('no_geometry')

  const binary = Buffer.concat([...chunks, Buffer.alloc((4 - (binaryLength % 4)) % 4)])
  const document = {
    asset: { version: '2.0', generator: 'NMS Courier model workshop' },
    scene: 0,
    scenes: [{ nodes: [root] }],
    nodes,
    meshes,
    materials,
    accessors,
    bufferViews: views,
    buffers: [{ byteLength: binary.length }]
  }
  let body = Buffer.from(JSON.stringify(document), 'utf8')
  body = Buffer.concat([body, Buffer.alloc((4 - (body.length % 4)) % 4, 0x20)])
  const header = Buffer.alloc(20)
  header.writeUInt32LE(0x46546c67, 0)
  header.writeUInt32LE(2, 4)
  header.writeUInt32LE(28 + body.length + binary.length, 8)
  header.writeUInt32LE(body.length, 12)
  header.writeUInt32LE(0x4e4f534a, 16)
  const binaryHeader = Buffer.alloc(8)
  binaryHeader.writeUInt32LE(binary.length, 0)
  binaryHeader.writeUInt32LE(0x004e4942, 4)
  return Buffer.concat([header, body, binaryHeader, binary])
}
