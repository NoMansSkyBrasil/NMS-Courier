import { mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve, sep } from 'node:path'
import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { importPreviewModel, maxPreviewBytes, validatePreviewGlb } from './model-preview-import'

function triangleDocument(): Record<string, unknown> {
  return {
    asset: { version: '2.0' },
    buffers: [{ byteLength: 36 }],
    bufferViews: [{ buffer: 0, byteLength: 36 }],
    accessors: [{ bufferView: 0, componentType: 5126, count: 3, type: 'VEC3' }],
    meshes: [{ primitives: [{ attributes: { POSITION: 0 } }] }],
    nodes: [{ name: 'Test triangle', mesh: 0 }],
    scenes: [{ nodes: [0] }],
    scene: 0
  }
}

function glb(document: Record<string, unknown> = triangleDocument()): Buffer {
  const text = Buffer.from(JSON.stringify(document))
  const json = Buffer.alloc(Math.ceil(text.length / 4) * 4, 0x20)
  text.copy(json)
  const result = Buffer.alloc(28 + json.length + 36)
  result.writeUInt32LE(0x46546c67, 0)
  result.writeUInt32LE(2, 4)
  result.writeUInt32LE(result.length, 8)
  result.writeUInt32LE(json.length, 12)
  result.writeUInt32LE(0x4e4f534a, 16)
  json.copy(result, 20)
  result.writeUInt32LE(36, 20 + json.length)
  result.writeUInt32LE(0x004e4942, 24 + json.length)
  const offset = 28 + json.length
  ;[0, 0, 0, 1, 0, 0, 0, 1, 0].forEach((value, i) => result.writeFloatLE(value, offset + i * 4))
  return result
}

describe('local preview model import boundary', () => {
  it('accepts a self-contained static triangle', () => {
    expect(() => validatePreviewGlb(glb())).not.toThrow()
  })
  it('rejects network, local and data URIs before a loader can resolve them', () => {
    for (const uri of [
      'https://example.com/model.bin',
      'file:///C:/secret.bin',
      'data:application/octet-stream;base64,AAAA'
    ]) {
      const document = triangleDocument()
      document.buffers = [{ byteLength: 36, uri }]
      expect(() => validatePreviewGlb(glb(document))).toThrow('UNSUPPORTED_MODEL')
    }
  })
  it('rejects truncated containers and corrupt chunk lengths', () => {
    const bytes = glb()
    expect(() => validatePreviewGlb(bytes.subarray(0, bytes.length - 1))).toThrow('INVALID_MODEL')
    bytes.writeUInt32LE(0xffffffff, 12)
    expect(() => validatePreviewGlb(bytes)).toThrow('INVALID_MODEL')
  })
  it('rejects out-of-buffer accessors and nonfinite vertex coordinates', () => {
    const document = triangleDocument()
    document.accessors = [{ bufferView: 0, componentType: 5126, count: 4, type: 'VEC3' }]
    expect(() => validatePreviewGlb(glb(document))).toThrow('INVALID_MODEL')
    const bytes = glb()
    bytes.writeFloatLE(Infinity, bytes.length - 4)
    expect(() => validatePreviewGlb(bytes)).toThrow('INVALID_MODEL')
  })
  it('rejects cyclic and multiply parented node graphs', () => {
    for (const nodes of [
      [{ mesh: 0, children: [0] }],
      [{ children: [2] }, { children: [2] }, { mesh: 0 }]
    ]) {
      const document = triangleDocument()
      document.nodes = nodes
      expect(() => validatePreviewGlb(glb(document))).toThrow('INVALID_MODEL')
    }
  })
  it('rejects textures and unknown executable loader extensions', () => {
    for (const addition of [
      { images: [{ bufferView: 0, mimeType: 'image/png' }] },
      { extensions: { Unknown: {} } }
    ]) {
      expect(() => validatePreviewGlb(glb({ ...triangleDocument(), ...addition }))).toThrow(
        'UNSUPPORTED_MODEL'
      )
    }
  })
  it('enforces the input byte budget', () => {
    expect(() => validatePreviewGlb(new Uint8Array(maxPreviewBytes + 1))).toThrow('INVALID_MODEL')
  })
  it('returns only model bytes, basename and fingerprint, without the selected path', async () => {
    const directory = mkdtempSync(join(tmpdir(), 'courier-preview-test-'))
    if (!resolve(directory).startsWith(resolve(tmpdir()) + sep))
      throw new Error('Invalid test cleanup path')
    try {
      const bytes = glb()
      const path = join(directory, 'triangle.glb')
      writeFileSync(path, bytes)
      const result = await importPreviewModel(path)
      expect(result.state).toBe('loaded')
      if (result.state !== 'loaded') throw new Error('Expected imported fixture')
      expect(result.model.name).toBe('triangle.glb')
      expect(result.model.sha256).toBe(createHash('sha256').update(bytes).digest('hex'))
      expect(Array.from(result.model.bytes)).toEqual(Array.from(bytes))
      expect(JSON.stringify(result)).not.toContain(directory)
      writeFileSync(path, 'invalid')
      expect(await importPreviewModel(path)).toEqual({ state: 'failed', reason: 'INVALID_MODEL' })
      expect(await importPreviewModel(join(directory, 'missing.glb'))).toEqual({
        state: 'failed',
        reason: 'FILE_UNAVAILABLE'
      })
    } finally {
      rmSync(directory, { recursive: true, force: true })
    }
  })
})
