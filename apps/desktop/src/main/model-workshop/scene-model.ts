import { readMeshStreams } from './geometry-streams'
import type { MeshStream } from './geometry-streams'
import type { ModelFiles } from './game-model-files'
import { readSceneGraph } from './scene-graph'
import { readMaterialDiffuse } from './texture-list'
import type { SceneNode } from './scene-graph'

// Builds a binary glTF model from a game scene: the scene's nodes and transforms, the scenes it
// refers to, and the triangles of its meshes. With a node filter, only the part alternatives the
// filter accepts are kept, so the model is what one seed selects. A port of the research exporter
// (runtime/research/export-scene-glb.py). Materials are plain here; the interface paints them
// with the game's textures from the surfaces this hands back.

// The same limits the workshop's own model check applies (model-preview-import.ts).
const maximumBytes = 64 * 1024 * 1024
const maximumElements = 12_000_000
const referenceDepth = 3
// Meshes that would hide the model or repeat it: shield bubbles and shadow casters (by material),
// lower detail levels (by name), and engine exhaust, which the game draws as light, not as a solid.
const excludedMaterial = /SHIELD|SHADOW|ENGINEJET|JET_MAT|ENGINEGLOWPOLY|ENGINEFLARE/i
// Scenes of pure effects (exhaust, smoke, light) are not part of a model's shape.
const effectScene = /^models.effects./i
const excludedName = /SHADOW|FXSPHERE|LOD[1-9]/i

export class SceneModelError extends Error {
  constructor(readonly reason: 'scene_unavailable' | 'model_too_large' | 'no_geometry') {
    super(reason)
  }
}

// Parsed scenes and material textures kept between builds, so a search that walks many models
// reads each file once.
export type SceneModelCache = {
  scenes: Map<string, { root: SceneNode; geometryBase: string | null } | null>
  diffuse: Map<string, string | null>
}

export function emptySceneModelCache(): SceneModelCache {
  return { scenes: new Map(), diffuse: new Map() }
}

// One material of a built model, in the order materials are first met while walking the model:
// its number in the model, its game path and the diffuse texture it names.
export type SceneSurface = { material: number; path: string; name: string; diffuse: string | null }

// What was left out while a model was built, for checks: nothing here stops the build.
export type SceneModelReport = {
  missingScenes: string[]
  depthLimited: string[]
  unreadableGeometry: string[]
  meshesWithoutStream: string[]
  excludedMeshes: string[]
  otherLevelMeshes: number
  meshes: number
  // Names of every node that was kept, upper-cased.
  nodeNames: Set<string>
}

export function emptySceneModelReport(): SceneModelReport {
  return {
    missingScenes: [],
    depthLimited: [],
    unreadableGeometry: [],
    meshesWithoutStream: [],
    excludedMeshes: [],
    otherLevelMeshes: 0,
    meshes: 0,
    nodeNames: new Set()
  }
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
  report: SceneModelReport | null = null,
  surfaces: SceneSurface[] | null = null,
  cache: SceneModelCache | null = null,
  // False to walk the model for its materials only: no geometry is read and no model is built.
  shapes = true
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
  // First accessors of the meshes that carry texture coordinates.
  const textured = new Set<number>()
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
    materials.push({
      // The number makes the name unique: the interface finds a material by it.
      name: `${materials.length}:${name}`,
      pbrMetallicRoughness: {
        baseColorFactor: glow ? [0.95, 0.85, 0.6, 1] : [0.62, 0.64, 0.68, 1],
        metallicFactor: 0.1,
        roughnessFactor: 0.8
      }
    })
    materialIndex.set(key, materials.length - 1)
    if (surfaces) {
      let diffuse = cache?.diffuse.get(key)
      if (diffuse === undefined) {
        try {
          const data = files.read(key)
          diffuse = data ? readMaterialDiffuse(data) : null
        } catch {
          diffuse = null
        }
        cache?.diffuse.set(key, diffuse)
      }
      surfaces.push({ material: materials.length - 1, path: key, name, diffuse })
    }
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
      if (stream.coordinates) {
        accessors.push({
          bufferView: view(
            Buffer.from(
              stream.coordinates.buffer,
              stream.coordinates.byteOffset,
              stream.coordinates.byteLength
            ),
            34962
          ),
          componentType: 5126,
          count,
          type: 'VEC2'
        })
        elements += count
        textured.add(first)
      }
      accessorIndex.set(`${geometry}|${hash}`, first)
    }
    const attributes: Record<string, number> = { POSITION: first }
    if (textured.has(first)) attributes.TEXCOORD_0 = first + 2
    meshes.push({
      primitives: [{ attributes, indices: first + 1, material: materialNumber }]
    })
    meshIndex.set(key, meshes.length - 1)
    return meshes.length - 1
  }

  const scene = (gamePath: string): { root: SceneNode; geometry: string | null } | null => {
    const key = gamePath.split('\\').join('/').toLowerCase()
    if (sceneCache.has(key)) return sceneCache.get(key) ?? null
    let parsed = cache?.scenes.get(key)
    if (parsed === undefined) {
      const data = files.read(key)
      if (!data) parsed = null
      else {
        const root = readSceneGraph(data)
        const named = root.attributes.GEOMETRY
        parsed = {
          root,
          geometryBase: named
            ? named
                .split('\\')
                .join('/')
                .toLowerCase()
                .replace(/\.geometry\.mbin$/, '')
            : null
        }
      }
      cache?.scenes.set(key, parsed)
    }
    if (!parsed) {
      sceneCache.set(key, null)
      return null
    }
    let geometry: string | null = null
    const base = parsed.geometryBase
    if (base && shapes) {
      if (!streamCache.has(base)) {
        const description = files.read(base + '.geometry.mbin.pc')
        const streams = files.read(base + '.geometry.data.mbin.pc')
        try {
          streamCache.set(
            base,
            description && streams ? readMeshStreams(description, streams) : null
          )
        } catch (error) {
          // A part whose geometry cannot be read is left out; the rest of the model is still shown.
          streamCache.set(base, null)
          report?.unreadableGeometry.push(`${base}: ${String(error)}`)
        }
      }
      geometry = streamCache.get(base) ? base : null
    }
    const loaded = { root: parsed.root, geometry }
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
      if (Number.parseInt(node.attributes.LODLEVEL || '0', 10) !== 0) {
        if (report) report.otherLevelMeshes += 1
        return null
      }
      if (excludedName.test(node.name) || excludedMaterial.test(material_.slice(-48))) {
        report?.excludedMeshes.push(`${node.name}|${material_.slice(-40)}`)
        return null
      }
    }
    const record: GlbNode = { name: top ? (node.name.split('\\').pop() ?? node.name) : node.name }
    if (node.translation.some((value) => value !== 0)) record.translation = node.translation
    if (node.rotation.some((value) => value !== 0)) {
      record.rotation = quaternion(node.rotation[0], node.rotation[1], node.rotation[2])
    }
    if (node.scale.some((value) => value !== 1)) record.scale = node.scale
    const index = nodes.length
    nodes.push(record)
    report?.nodeNames.add(node.name.toUpperCase())
    const children: number[] = []
    if (node.type === 'MESH' && !shapes) {
      material(material_)
    } else if (node.type === 'MESH' && geometry) {
      const made = mesh(geometry, node.nameHash, material(material_))
      if (made !== null) {
        record.mesh = made
        if (report) report.meshes += 1
      } else report?.meshesWithoutStream.push(node.name)
    }
    // A reference's own children are walked before the scene it refers to. The order materials
    // are first met decides how texture layers merge, and this order is the one that reproduces
    // a known seed's texture choices (docs/MODEL_WORKSHOP.md).
    for (const child of node.children) {
      const inner = emit(child, geometry, depth, false)
      if (inner !== null) children.push(inner)
    }
    if (node.type === 'REFERENCE' && effectScene.test(node.attributes.SCENEGRAPH ?? '')) {
      // Left out on purpose.
    } else if (node.type === 'REFERENCE' && depth >= referenceDepth) {
      report?.depthLimited.push(node.attributes.SCENEGRAPH ?? '')
    } else if (node.type === 'REFERENCE') {
      const loaded = scene(node.attributes.SCENEGRAPH ?? '')
      if (!loaded) report?.missingScenes.push(node.attributes.SCENEGRAPH ?? '')
      if (loaded) {
        const inner = emit(loaded.root, loaded.geometry, depth + 1, true)
        if (inner !== null) children.push(inner)
      }
    }
    if (children.length) record.children = children
    return index
  }

  const loaded = scene(scenePath)
  if (!loaded) throw new SceneModelError('scene_unavailable')
  const root = emit(loaded.root, loaded.geometry, 0, true)
  if (!shapes) return new Uint8Array()
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
