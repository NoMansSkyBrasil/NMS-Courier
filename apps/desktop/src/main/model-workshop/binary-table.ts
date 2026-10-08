// Small reading helpers shared by the workshop's readers of the game's binary model files (part
// lists, scene graphs, geometry). Every read is bounds-checked: a file that does not fit the
// expected layout is refused instead of being read past its end.

export class ModelFileError extends Error {
  constructor(readonly reason: 'unknown_structure' | 'corrupt_file' | 'too_large') {
    super(reason)
  }
}

export const fileHeaderSize = 0x20

// The 16 header bytes that change whenever the game changes the structure of a file type.
export function fileStructure(data: Buffer): string {
  if (data.length < fileHeaderSize) throw new ModelFileError('corrupt_file')
  return data.toString('hex', 8, 24)
}

export function expectStructure(data: Buffer, structure: string): void {
  if (fileStructure(data) !== structure) throw new ModelFileError('unknown_structure')
}

// A list field: 64-bit offset relative to the field itself, then a 32-bit count.
export function listAt(
  data: Buffer,
  position: number,
  entrySize: number,
  maximum: number
): { start: number; count: number } {
  if (position < 0 || position + 0x10 > data.length) throw new ModelFileError('corrupt_file')
  const count = data.readUInt32LE(position + 8)
  if (count === 0) return { start: 0, count: 0 }
  if (count > maximum) throw new ModelFileError('too_large')
  const offset = data.readBigInt64LE(position)
  const start = position + Number(offset)
  if (offset <= 0n || start + count * entrySize > data.length) {
    throw new ModelFileError('corrupt_file')
  }
  return { start, count }
}

// Text held in a fixed number of bytes, ending at the first zero byte.
export function fixedText(data: Buffer, position: number, size: number): string {
  if (position < 0 || position + size > data.length) throw new ModelFileError('corrupt_file')
  const end = data.indexOf(0, position)
  return data.toString('latin1', position, end < 0 || end > position + size ? position + size : end)
}

// Text held as a list of bytes (the count includes the closing zero byte).
export function listText(data: Buffer, position: number, maximum: number): string {
  const { start, count } = listAt(data, position, 1, maximum)
  return count === 0 ? '' : fixedText(data, start, count)
}
