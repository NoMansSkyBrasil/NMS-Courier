import { open } from 'node:fs/promises'
import { basename } from 'node:path'
import { createHash } from 'node:crypto'
import type { PreviewImportResult } from '../shared/model-preview'

export const maxPreviewBytes = 16 * 1024 * 1024

function invalid(): never {
  throw new Error('INVALID_MODEL')
}

function unsupported(): never {
  throw new Error('UNSUPPORTED_MODEL')
}

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) invalid()
  return value as Record<string, unknown>
}

function integer(value: unknown, maximum: number): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0 || value > maximum)
    invalid()
  return value
}

function array(value: unknown, maximum: number): Record<string, unknown>[] {
  if (!Array.isArray(value) || value.length > maximum) invalid()
  return value.map(object)
}

/** Accept a bounded static, texture-free GLB subset without external resources. */
export function validatePreviewGlb(bytes: Uint8Array): void {
  if (bytes.byteLength < 28 || bytes.byteLength > maxPreviewBytes) invalid()
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  if (
    view.getUint32(0, true) !== 0x46546c67 ||
    view.getUint32(4, true) !== 2 ||
    view.getUint32(8, true) !== bytes.byteLength
  )
    invalid()
  const jsonSize = view.getUint32(12, true)
  if (
    jsonSize > 1024 * 1024 ||
    jsonSize % 4 ||
    20 + jsonSize + 8 > bytes.byteLength ||
    view.getUint32(16, true) !== 0x4e4f534a
  )
    invalid()
  const binaryOffset = 20 + jsonSize
  const binarySize = view.getUint32(binaryOffset, true)
  if (
    view.getUint32(binaryOffset + 4, true) !== 0x004e4942 ||
    binarySize % 4 ||
    binaryOffset + 8 + binarySize !== bytes.byteLength
  )
    invalid()
  const document = object(
    JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes.subarray(20, binaryOffset)))
  )
  if (object(document.asset).version !== '2.0') unsupported()
  // Deny unknown extensions and resource URIs before GLTFLoader can resolve them.
  const scan = (value: unknown, depth = 0): void => {
    if (depth > 64) invalid()
    if (!value || typeof value !== 'object') return
    for (const [key, child] of Object.entries(value)) {
      if (key === 'uri' || key === 'extensions') unsupported()
      scan(child, depth + 1)
    }
  }
  scan(document)
  for (const key of [
    'images',
    'textures',
    'skins',
    'animations',
    'extensionsRequired',
    'extensionsUsed'
  ]) {
    if (document[key] !== undefined && (!Array.isArray(document[key]) || document[key].length))
      unsupported()
  }
  const buffers = array(document.buffers, 1)
  if (buffers.length !== 1) invalid()
  const bufferSize = integer(buffers[0].byteLength, binarySize)
  if (binarySize - bufferSize > 3) invalid()
  const views = array(document.bufferViews, 4096)
  for (const item of views) {
    if (item.buffer !== 0) invalid()
    const offset = integer(item.byteOffset ?? 0, bufferSize)
    const length = integer(item.byteLength, bufferSize)
    if (offset + length > bufferSize) invalid()
    if (item.byteStride !== undefined) {
      const stride = integer(item.byteStride, 252)
      if (stride < 4 || stride % 4) invalid()
    }
  }
  const accessors = array(document.accessors, 4096)
  let elements = 0
  for (const item of accessors) {
    if (item.sparse !== undefined) unsupported()
    const source = views[integer(item.bufferView, views.length - 1)]
    const count = integer(item.count, 1_000_000)
    const sizes: Record<string, number> = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 }
    const components: Record<string, number> = {
      5120: 1,
      5121: 1,
      5122: 2,
      5123: 2,
      5125: 4,
      5126: 4
    }
    const width = sizes[String(item.type)] * components[String(item.componentType)]
    if (!width || !count) invalid()
    const stride = Number(source.byteStride ?? width)
    const offset = integer(item.byteOffset ?? 0, Number(source.byteLength))
    if (stride < width || offset + stride * (count - 1) + width > Number(source.byteLength))
      invalid()
    elements += count
    if (elements > 3_000_000) unsupported()
  }
  const meshes = array(document.meshes, 512)
  if (!meshes.length) invalid()
  let primitives = 0
  let vertices = 0
  const meshVertices: number[] = []
  for (const mesh of meshes) {
    let meshCount = 0
    for (const primitive of array(mesh.primitives, 256)) {
      if (++primitives > 1024) unsupported()
      if (primitive.mode !== undefined && primitive.mode !== 4) unsupported()
      if (primitive.targets !== undefined) unsupported()
      const attributes = object(primitive.attributes)
      const position = accessors[integer(attributes.POSITION, accessors.length - 1)]
      vertices += Number(position.count)
      meshCount += Number(position.count)
      if (vertices > 1_000_000) unsupported()
      if (position.type !== 'VEC3' || position.componentType !== 5126) unsupported()
      for (const reference of Object.values(attributes)) integer(reference, accessors.length - 1)
      if (primitive.indices !== undefined) {
        const index = accessors[integer(primitive.indices, accessors.length - 1)]
        if (index.type !== 'SCALAR' || ![5121, 5123, 5125].includes(Number(index.componentType)))
          invalid()
      }
      // Bounds computed by the renderer must never receive NaN or infinity.
      const source = views[Number(position.bufferView)]
      const start =
        binaryOffset + 8 + Number(source.byteOffset ?? 0) + Number(position.byteOffset ?? 0)
      const stride = Number(source.byteStride ?? 12)
      for (let vertex = 0; vertex < Number(position.count); vertex++) {
        for (let axis = 0; axis < 3; axis++) {
          const coordinate = view.getFloat32(start + vertex * stride + axis * 4, true)
          if (!Number.isFinite(coordinate) || Math.abs(coordinate) > 1_000_000) invalid()
        }
      }
    }
    meshVertices.push(meshCount)
  }
  const nodes = array(document.nodes, 512)
  const parents = new Set<number>()
  let instanceVertices = 0
  for (const node of nodes) {
    if (node.mesh !== undefined) {
      instanceVertices += meshVertices[integer(node.mesh, meshes.length - 1)]
      if (instanceVertices > 1_000_000) unsupported()
    }
    for (const key of ['matrix', 'translation', 'rotation', 'scale']) {
      const transform = node[key]
      if (
        transform !== undefined &&
        (!Array.isArray(transform) ||
          transform.length !== { matrix: 16, translation: 3, rotation: 4, scale: 3 }[key] ||
          transform.some(
            (v) => typeof v !== 'number' || !Number.isFinite(v) || Math.abs(v) > 1_000_000
          ))
      )
        invalid()
    }
    if (node.children !== undefined) {
      if (!Array.isArray(node.children) || node.children.length > 512) invalid()
      for (const child of node.children) {
        const index = integer(child, nodes.length - 1)
        if (parents.has(index)) invalid()
        parents.add(index)
      }
    }
  }
  const visited = new Set<number>()
  const visit = (index: number, ancestors: Set<number>): void => {
    if (ancestors.has(index) || ancestors.size > 64) invalid()
    if (visited.has(index)) return
    const next = new Set(ancestors).add(index)
    for (const child of (nodes[index].children ?? []) as number[]) visit(child, next)
    visited.add(index)
  }
  nodes.forEach((_, index) => visit(index, new Set()))
  const scenes = array(document.scenes, 16)
  if (!scenes.length) invalid()
  integer(document.scene ?? 0, scenes.length - 1)
  for (const scene of scenes) {
    if (!Array.isArray(scene.nodes) || scene.nodes.length > 512) invalid()
    const roots = new Set<number>()
    for (const value of scene.nodes) {
      const index = integer(value, nodes.length - 1)
      if (roots.has(index) || parents.has(index)) invalid()
      roots.add(index)
    }
  }
}

export async function importPreviewModel(path: string): Promise<PreviewImportResult> {
  try {
    const handle = await open(path, 'r')
    let bytes: Uint8Array
    try {
      const stat = await handle.stat()
      if (!stat.isFile() || stat.size < 28 || stat.size > maxPreviewBytes) invalid()
      const buffer = Buffer.alloc(stat.size)
      let offset = 0
      while (offset < buffer.length) {
        const result = await handle.read(buffer, offset, buffer.length - offset, offset)
        if (!result.bytesRead) invalid()
        offset += result.bytesRead
      }
      if ((await handle.stat()).size !== stat.size) invalid()
      bytes = buffer
    } finally {
      await handle.close()
    }
    validatePreviewGlb(bytes)
    return {
      state: 'loaded',
      model: {
        name: basename(path),
        sha256: createHash('sha256').update(bytes).digest('hex'),
        bytes: new Uint8Array(bytes)
      }
    }
  } catch (error) {
    const code = error instanceof Error ? error.message : ''
    return {
      state: 'failed',
      reason:
        code === 'UNSUPPORTED_MODEL'
          ? code
          : code === 'INVALID_MODEL' ||
              error instanceof SyntaxError ||
              error instanceof TypeError ||
              error instanceof RangeError
            ? 'INVALID_MODEL'
            : 'FILE_UNAVAILABLE'
    }
  }
}
