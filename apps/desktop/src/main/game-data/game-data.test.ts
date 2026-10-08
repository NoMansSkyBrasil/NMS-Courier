import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import * as zlib from 'node:zlib'
import { describe, expect, it } from 'vitest'
import { CatalogImporter } from './catalog-import'
import { GameTableError, readCoreTable, tableStructure } from './core-tables'
import { localisationStructure, readLocalisationTable } from './localisation-table'
import { openPakArchive, PakArchiveError } from './pak-archive'

// Synthetic data only: no game file is part of the tests.

const chunkSize = 0x10000

// An archive in the game's layout holding the given files, each chunk compressed on its own.
function buildArchive(files: Record<string, Buffer>): Buffer {
  const names = Object.keys(files)
  const manifest = Buffer.from(names.join('\r\n') + '\r\n')
  const pad = (data: Buffer): Buffer =>
    Buffer.concat([data, Buffer.alloc((16 - (data.length % 16)) % 16)])
  const parts = [manifest, ...names.map((name) => files[name])].map(pad)
  const plain = Buffer.concat(parts)
  const chunks: Buffer[] = []
  for (let offset = 0; offset < plain.length; offset += chunkSize) {
    const piece = plain.subarray(offset, offset + chunkSize)
    const packed = zlib.zstdCompressSync(piece)
    chunks.push(piece.length === chunkSize && packed.length >= chunkSize ? piece : packed)
  }
  const fileCount = names.length + 1
  const dataOffset = Math.ceil((0x30 + fileCount * 0x20 + chunks.length * 8) / 16) * 16
  const header = Buffer.alloc(dataOffset)
  header.write('HGPAK', 0, 'latin1')
  header.writeBigUInt64LE(2n, 0x08)
  header.writeBigUInt64LE(BigInt(fileCount), 0x10)
  header.writeBigUInt64LE(BigInt(chunks.length), 0x18)
  header[0x20] = 1
  header.writeBigUInt64LE(BigInt(dataOffset), 0x28)
  let start = dataOffset
  ;[manifest, ...names.map((name) => files[name])].forEach((data, index) => {
    header.writeBigUInt64LE(BigInt(start), 0x30 + index * 0x20 + 0x10)
    header.writeBigUInt64LE(BigInt(data.length), 0x30 + index * 0x20 + 0x18)
    start += parts[index].length
  })
  chunks.forEach((chunk, index) =>
    header.writeBigUInt64LE(BigInt(chunk.length), 0x30 + fileCount * 0x20 + index * 8)
  )
  return Buffer.concat([header, ...chunks.map(pad)])
}

// A language table with the given entries, the text in the last language column.
function buildLocalisationTable(entries: Record<string, string>): Buffer {
  const keys = Object.keys(entries)
  const entrySize = 0x20 + 17 * 0x10
  const head = Buffer.alloc(0x30 + keys.length * entrySize)
  head.writeUInt32LE(0xcccccccc, 0)
  head.writeUInt32LE(0xcccccccc, 4)
  Buffer.from(localisationStructure, 'hex').copy(head, 8)
  head.writeBigInt64LE(0x10n, 0x20)
  head.writeUInt32LE(keys.length, 0x28)
  head[0x2c] = 1
  const tail: Buffer[] = []
  let tailOffset = head.length
  keys.forEach((key, index) => {
    const entry = 0x30 + index * entrySize
    head.write(key, entry, 'utf8')
    for (let column = 0; column < 17; column += 1) head[entry + 0x20 + column * 0x10 + 12] = 1
    const text = Buffer.from(entries[key] + '\0', 'utf8')
    const position = entry + 0x20 + 16 * 0x10
    head.writeBigInt64LE(BigInt(tailOffset - position), position)
    head.writeUInt32LE(text.length, position + 8)
    tail.push(text)
    tailOffset += text.length
  })
  return Buffer.concat([head, ...tail])
}

describe('game archive reader', () => {
  it('lists and returns files, including one that spans several chunks', () => {
    const large = Buffer.alloc(chunkSize * 2 + 1234)
    for (let index = 0; index < large.length; index += 1) large[index] = (index * 31) % 251
    const folder = mkdtempSync(join(tmpdir(), 'nmsc-pak-'))
    const path = join(folder, 'test.pak')
    writeFileSync(
      path,
      buildArchive({ 'a/small.mbin': Buffer.from('hello'), 'b/large.bin': large })
    )

    const archive = openPakArchive(path)
    try {
      expect(archive.names).toEqual(['a/small.mbin', 'b/large.bin'])
      expect(archive.read('A/SMALL.MBIN')?.toString()).toBe('hello')
      expect(archive.read('b/large.bin')?.equals(large)).toBe(true)
      expect(archive.read('missing')).toBeNull()
    } finally {
      archive.close()
    }
  })

  it('refuses a file that is not an archive', () => {
    const path = join(mkdtempSync(join(tmpdir(), 'nmsc-pak-')), 'bad.pak')
    writeFileSync(path, Buffer.alloc(0x40))
    expect(() => openPakArchive(path)).toThrow(PakArchiveError)
  })
})

describe('game tables', () => {
  it('reads the wanted keys of a language table and keeps earlier texts', () => {
    const table = buildLocalisationTable({ UI_ONE: 'Um', UI_TWO: 'Dois ção', UI_THREE: 'Três' })
    const texts = new Map([['UI_ONE', 'kept']])
    readLocalisationTable(table, new Set(['UI_ONE', 'UI_TWO']), texts)
    expect([...texts]).toEqual([
      ['UI_ONE', 'kept'],
      ['UI_TWO', 'Dois ção']
    ])
  })

  it('refuses a table whose structure it was not derived for', () => {
    const table = buildLocalisationTable({ UI_ONE: 'Um' })
    expect(tableStructure(table)).toBe(localisationStructure)
    for (const domain of ['substance', 'product', 'technology'] as const) {
      expect(() => readCoreTable(domain, table)).toThrow(GameTableError)
    }
    table[9] ^= 0xff
    expect(() => readLocalisationTable(table, new Set(), new Map())).toThrow(GameTableError)
    expect(() => tableStructure(Buffer.alloc(0x20))).toThrow(GameTableError)
  })
})

describe('catalogue import', () => {
  it('reports why nothing was imported and writes no generation', async () => {
    const data = mkdtempSync(join(tmpdir(), 'nmsc-cat-'))
    const importer = new CatalogImporter(data)
    const source = { executableSha256: null, productVersion: null }
    expect(await importer.run({ ...source, rootPath: null })).toMatchObject({
      reason: 'installation_not_selected'
    })
    expect(await importer.run({ ...source, rootPath: join(data, 'nowhere') })).toMatchObject({
      reason: 'archives_missing'
    })
  })
})
