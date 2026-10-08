import { inflateRawSync } from 'node:zlib'

// The few things of the ZIP format a corvette export needs: list the members and return one,
// stored or deflated. Sizes are bounded because the file comes from outside.

const endSignature = 0x06054b50
const centralSignature = 0x02014b50
const localSignature = 0x04034b50
const largestMember = 32 * 1024 * 1024
const mostMembers = 64

export function readZipMembers(file: Buffer): Map<string, Buffer> | null {
  // The end record is the last thing in the file, possibly followed by a comment.
  let end = -1
  for (
    let position = file.length - 22;
    position >= Math.max(0, file.length - 66_000);
    position -= 1
  ) {
    if (file.readUInt32LE(position) === endSignature) {
      end = position
      break
    }
  }
  if (end < 0) return null
  const count = file.readUInt16LE(end + 10)
  let position = file.readUInt32LE(end + 16)
  if (count < 1 || count > mostMembers) return null

  const members = new Map<string, Buffer>()
  for (let index = 0; index < count; index += 1) {
    if (position + 46 > file.length || file.readUInt32LE(position) !== centralSignature) return null
    const method = file.readUInt16LE(position + 10)
    const packedSize = file.readUInt32LE(position + 20)
    const size = file.readUInt32LE(position + 24)
    const nameLength = file.readUInt16LE(position + 28)
    const extraLength = file.readUInt16LE(position + 30)
    const commentLength = file.readUInt16LE(position + 32)
    const local = file.readUInt32LE(position + 42)
    const name = file.toString('utf8', position + 46, position + 46 + nameLength)
    position += 46 + nameLength + extraLength + commentLength

    if (size > largestMember || local + 30 > file.length) return null
    if (file.readUInt32LE(local) !== localSignature) return null
    const start = local + 30 + file.readUInt16LE(local + 26) + file.readUInt16LE(local + 28)
    if (start + packedSize > file.length) return null
    const packed = file.subarray(start, start + packedSize)
    let data: Buffer
    try {
      if (method === 0) data = packed
      else if (method === 8) data = inflateRawSync(packed, { maxOutputLength: largestMember })
      else return null
    } catch {
      return null
    }
    if (data.length !== size) return null
    members.set(name, data)
  }
  return members
}
