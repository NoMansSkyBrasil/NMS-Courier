import { closeSync, openSync, readSync } from 'node:fs'
import * as zlib from 'node:zlib'

// Reader for the game's archive format (HGPAK revision 2, Windows: 64 KiB chunks, Zstandard).
// Format as documented by the HGPAKtool project (MIT); this is an independent read-only reader.
// It never writes, and it is never pointed at anything but the selected installation.

const chunkSize = 0x10000
const headerSize = 0x30
const formatRevision = 2n

export class PakArchiveError extends Error {
  constructor(readonly reason: 'not_an_archive' | 'unsupported_archive' | 'corrupt_archive') {
    super(reason)
  }
}

export type PakArchive = {
  // Lower-case, forward-slash paths of the files inside.
  names: readonly string[]
  // Contents of one file, or null when the archive does not hold it.
  read: (name: string) => Buffer | null
  close: () => void
}

type Decompress = (data: Buffer) => Buffer

function systemDecompress(): Decompress {
  const zstd = (zlib as { zstdDecompressSync?: Decompress }).zstdDecompressSync
  if (!zstd) throw new PakArchiveError('unsupported_archive')
  return zstd
}

export function openPakArchive(path: string, decompress?: Decompress): PakArchive {
  const inflate = decompress ?? systemDecompress()
  const handle = openSync(path, 'r')
  const readAt = (position: number, length: number): Buffer => {
    const buffer = Buffer.alloc(length)
    if (readSync(handle, buffer, 0, length, position) !== length) {
      throw new PakArchiveError('corrupt_archive')
    }
    return buffer
  }

  try {
    const header = readAt(0, headerSize)
    if (header.toString('latin1', 0, 5) !== 'HGPAK') throw new PakArchiveError('not_an_archive')
    const fileCount = Number(header.readBigUInt64LE(0x10))
    const chunkCount = Number(header.readBigUInt64LE(0x18))
    const dataOffset = Number(header.readBigUInt64LE(0x28))
    // Only compressed archives of the known revision were ever read by this project.
    if (header.readBigUInt64LE(0x08) !== formatRevision || header[0x20] !== 1 || fileCount < 1) {
      throw new PakArchiveError('unsupported_archive')
    }

    const fileIndex = readAt(headerSize, fileCount * 0x20)
    const chunkIndex = readAt(headerSize + fileCount * 0x20, chunkCount * 8)
    const chunkOffsets: number[] = []
    const chunkSizes: number[] = []
    let position = dataOffset
    for (let index = 0; index < chunkCount; index += 1) {
      const size = Number(chunkIndex.readBigUInt64LE(index * 8))
      chunkOffsets.push(position)
      chunkSizes.push(size)
      position += Math.ceil(size / 0x10) * 0x10
    }

    let cachedIndex = -1
    let cachedChunk: Buffer = Buffer.alloc(0)
    const chunk = (index: number): Buffer => {
      if (index === cachedIndex) return cachedChunk
      if (index >= chunkCount) throw new PakArchiveError('corrupt_archive')
      const stored = readAt(chunkOffsets[index], chunkSizes[index])
      let plain: Buffer
      try {
        plain = inflate(stored)
      } catch {
        // A chunk that did not shrink is stored as it is.
        if (stored.length !== chunkSize) throw new PakArchiveError('corrupt_archive')
        plain = stored
      }
      cachedIndex = index
      cachedChunk = plain
      return plain
    }
    // Bytes of the decompressed data area, which is what file offsets refer to.
    const slice = (offset: number, size: number): Buffer => {
      const parts: Buffer[] = []
      let remaining = size
      let cursor = offset
      while (remaining > 0) {
        const within = cursor % chunkSize
        const part = chunk(Math.floor(cursor / chunkSize)).subarray(within, within + remaining)
        if (part.length === 0) throw new PakArchiveError('corrupt_archive')
        parts.push(part)
        cursor += part.length
        remaining -= part.length
      }
      return Buffer.concat(parts, size)
    }

    // The first index record is the list of names, one per line, in index order.
    const manifestSize = Number(fileIndex.readBigUInt64LE(0x18))
    const names = slice(0, manifestSize)
      .toString('utf8')
      .replace(/(\r\n)+$/, '')
      .split('\r\n')
    if (names.length !== fileCount - 1) throw new PakArchiveError('corrupt_archive')
    const records = new Map<string, number>()
    names.forEach((name, index) => records.set(name, (index + 1) * 0x20))

    return {
      names,
      read: (name) => {
        const record = records.get(name.toLowerCase())
        if (record === undefined) return null
        const start = Number(fileIndex.readBigUInt64LE(record + 0x10)) - dataOffset
        return slice(start, Number(fileIndex.readBigUInt64LE(record + 0x18)))
      },
      close: () => closeSync(handle)
    }
  } catch (error) {
    closeSync(handle)
    throw error
  }
}
