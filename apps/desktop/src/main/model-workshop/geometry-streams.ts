import { expectStructure, listAt } from './binary-table'
import { ModelFileError } from './binary-table'

// Reads the triangles of a model part: the geometry description (".geometry.mbin.pc") says where
// each mesh's vertices and indices are inside the stream file (".geometry.data.mbin.pc").
//
// Layout read from the build 180836 files by comparison with their converted text (2026-10-08):
// description: position layout at 0x20 and vertex layout at 0x40 (each: list of 12-byte elements,
// 8 bytes, element count, stride), the mesh table list at 0x160 (0x38 per mesh: name text, hash,
// index offset, index size, vertex offset, vertex size, position offset, position size), then the
// index width flag at 0x178 and the vertex count at 0x17c. A vertex element is: instancing (4),
// type (4), normalise, offset, semantic, size (1 byte each). Offsets in the mesh table are
// positions in the stream file; the indices follow the vertex data.

const descriptionStructure = 'e40c000020329c81a6f6de9aa96c1fda'
const streamStructure = 'e40c0000545702401363b3a89568b4cc'
const halfFloat = 5131
const float = 5126
const positionSemantic = 0
const coordinateSemantic = 1
const maximumMeshes = 8192
// One mesh never comes near this in the game's ships, multi-tools and freighters.
export const maximumMeshCount = 1_000_000

export type MeshStream = {
  // x y z per vertex, and three vertex numbers per triangle.
  positions: Float32Array
  indices: Uint32Array
  // u v per vertex (first row of a texture is v = 0), or null when the mesh has none.
  coordinates: Float32Array | null
  // The second pair of texture coordinates of the same vertex, which a material's second
  // diffuse texture is laid out with; null when the vertex holds one pair only.
  secondCoordinates: Float32Array | null
  low: [number, number, number]
  high: [number, number, number]
}

type Layout = {
  separate: boolean
  offset: number
  type: number
  stride: number
  // Offset and type of the texture coordinates in the same vertex, when present.
  coordinates: { offset: number; type: number; pairs: number } | null
}

function halfToFloat(value: number): number {
  const exponent = (value >> 10) & 0x1f
  const fraction = value & 0x3ff
  const sign = value & 0x8000 ? -1 : 1
  if (exponent === 0) return sign * 2 ** -14 * (fraction / 1024)
  if (exponent === 0x1f) return fraction ? NaN : sign * Infinity
  return sign * 2 ** (exponent - 15) * (1 + fraction / 1024)
}

// Models normally keep positions in the separate position stream; some keep them in the main one.
function positionLayout(description: Buffer): Layout {
  for (const [position, separate] of [
    [0x20, true],
    [0x40, false]
  ] as const) {
    const elements = listAt(description, position, 12, 64)
    const stride = description.readUInt32LE(position + 0x1c)
    for (let index = 0; index < elements.count; index += 1) {
      const element = elements.start + index * 12
      if (description[element + 10] !== positionSemantic) continue
      const type = description.readUInt32LE(element + 4)
      if ((type !== halfFloat && type !== float) || description[element + 11] < 3 || stride < 6) {
        throw new ModelFileError('unknown_structure')
      }
      let coordinates: Layout['coordinates'] = null
      for (let other = 0; other < elements.count; other += 1) {
        const candidate = elements.start + other * 12
        const candidateType = description.readUInt32LE(candidate + 4)
        if (
          description[candidate + 10] === coordinateSemantic &&
          (candidateType === halfFloat || candidateType === float) &&
          description[candidate + 11] >= 2
        ) {
          coordinates = {
            offset: description[candidate + 9],
            type: candidateType,
            pairs: description[candidate + 11] >= 4 ? 2 : 1
          }
        }
      }
      return { separate, offset: description[element + 9], type, stride, coordinates }
    }
  }
  throw new ModelFileError('unknown_structure')
}

// Every mesh of one geometry file, by the hash scene nodes refer to. An empty map for the
// container files that hold no geometry of their own.
export function readMeshStreams(description: Buffer, streams: Buffer): Map<number, MeshStream> {
  expectStructure(description, descriptionStructure)
  if (description.length < 0x180) throw new ModelFileError('corrupt_file')
  const result = new Map<number, MeshStream>()
  if (description.readUInt32LE(0x17c) === 0) return result
  expectStructure(streams, streamStructure)
  const layout = positionLayout(description)
  const narrow = description.readUInt32LE(0x178) !== 0
  const table = listAt(description, 0x160, 0x38, maximumMeshes)
  for (let mesh = 0; mesh < table.count; mesh += 1) {
    const entry = table.start + mesh * 0x38
    const hash = description.readUInt32LE(entry + 0x10)
    const indexOffset = description.readUInt32LE(entry + 0x18)
    const indexSize = description.readUInt32LE(entry + 0x1c)
    const vertexOffset = description.readUInt32LE(entry + 0x20)
    const vertexSize = description.readUInt32LE(entry + 0x24)
    const positionOffset = description.readUInt32LE(entry + 0x28)
    const positionSize = description.readUInt32LE(entry + 0x2c)
    const source = layout.separate ? positionOffset : vertexOffset
    const size = layout.separate ? positionSize : vertexSize
    const indexStart = vertexOffset + indexOffset
    if (
      source + size > streams.length ||
      indexStart + indexSize > streams.length ||
      size % layout.stride !== 0
    ) {
      throw new ModelFileError('corrupt_file')
    }
    const count = size / layout.stride
    if (count > maximumMeshCount) throw new ModelFileError('too_large')
    const positions = new Float32Array(count * 3)
    const low: [number, number, number] = [Infinity, Infinity, Infinity]
    const high: [number, number, number] = [-Infinity, -Infinity, -Infinity]
    for (let vertex = 0; vertex < count; vertex += 1) {
      const at = source + vertex * layout.stride + layout.offset
      for (let axis = 0; axis < 3; axis += 1) {
        const value =
          layout.type === halfFloat
            ? halfToFloat(streams.readUInt16LE(at + axis * 2))
            : streams.readFloatLE(at + axis * 4)
        positions[vertex * 3 + axis] = value
        if (value < low[axis]) low[axis] = value
        if (value > high[axis]) high[axis] = value
      }
    }
    // A set file-level flag means sixteen-bit indices. A clear flag does not describe every mesh
    // (seen: clear with sixteen-bit meshes), so a mesh is read as thirty-two-bit only when it has
    // more vertices than sixteen bits address or every odd sixteen-bit word is zero. This rule
    // comes from the research exporter and is an inference from the files, not from the engine.
    const words = Math.floor(indexSize / 2)
    let wide = !narrow && indexSize % 4 === 0 && count > 0xffff
    if (!narrow && indexSize % 4 === 0 && !wide && words > 2) {
      wide = true
      for (let word = 1; word < words; word += 2) {
        if (streams.readUInt16LE(indexStart + word * 2) !== 0) {
          wide = false
          break
        }
      }
    }
    const indexCount = wide ? indexSize / 4 : words
    if (indexCount > maximumMeshCount) throw new ModelFileError('too_large')
    const indices = new Uint32Array(indexCount)
    for (let index = 0; index < indexCount; index += 1) {
      const value = wide
        ? streams.readUInt32LE(indexStart + index * 4)
        : streams.readUInt16LE(indexStart + index * 2)
      if (value >= count) throw new ModelFileError('corrupt_file')
      indices[index] = value
    }
    let coordinates: Float32Array | null = null
    let secondCoordinates: Float32Array | null = null
    if (layout.coordinates) {
      coordinates = new Float32Array(count * 2)
      if (layout.coordinates.pairs === 2) secondCoordinates = new Float32Array(count * 2)
      for (let vertex = 0; vertex < count; vertex += 1) {
        const at = source + vertex * layout.stride + layout.coordinates.offset
        for (let axis = 0; axis < layout.coordinates.pairs * 2; axis += 1) {
          const value =
            layout.coordinates.type === halfFloat
              ? halfToFloat(streams.readUInt16LE(at + axis * 2))
              : streams.readFloatLE(at + axis * 4)
          const target = axis < 2 ? coordinates : secondCoordinates!
          target[vertex * 2 + (axis % 2)] = Number.isFinite(value) ? value : 0
        }
      }
    }
    result.set(hash, { positions, indices, low, high, coordinates, secondCoordinates })
  }
  return result
}
