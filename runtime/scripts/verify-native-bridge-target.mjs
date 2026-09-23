import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const expectedHash = 'b7913f268dfc62386b6b68f524bfc8ade4a44a9f4fbad39085b7bf51be3680cb'
const targets = [
  {
    name: 'cGcApplication.Update',
    expectedRva: 0x2d7500,
    pattern: '40 53 48 83 EC 20 E8 ? ? ? ? 48 89'
  },
  {
    name: 'cGcInventoryStore.Add',
    expectedRva: 0x4ce130,
    pattern: '48 89 5C 24 ? 48 89 74 24 ? 55 57 41 56 48 8D 6C 24 ? 48 81 EC ? ? ? ? 41 0F 10 00'
  },
  {
    name: 'cGcRewardManager.GiveGenericReward',
    expectedRva: 0xf0bd70,
    pattern: '48 89 5C 24 08 48 89 6C 24 10 48 89 74 24 18 57 41 56 41 57 48 83 EC 70 48 8B 3D ? ? ? ? 48 8B F1 4D 8B F1 4D 8B F8 48 8B EA 48 8D 8F A0 07 00 00'
  }
]

function requireRange(bytes, offset, length) {
  if (!Number.isSafeInteger(offset) || offset < 0 || offset + length > bytes.length) {
    throw new Error('The executable has an invalid PE layout.')
  }
}

function textSection(bytes) {
  requireRange(bytes, 0, 0x40)
  if (bytes.toString('ascii', 0, 2) !== 'MZ') {
    throw new Error('The target is not a PE executable.')
  }
  const peOffset = bytes.readUInt32LE(0x3c)
  requireRange(bytes, peOffset, 24)
  if (bytes.toString('ascii', peOffset, peOffset + 4) !== 'PE\0\0') {
    throw new Error('The target has no PE signature.')
  }
  const sectionCount = bytes.readUInt16LE(peOffset + 6)
  const optionalHeaderSize = bytes.readUInt16LE(peOffset + 20)
  const firstSection = peOffset + 24 + optionalHeaderSize
  requireRange(bytes, firstSection, sectionCount * 40)
  for (let index = 0; index < sectionCount; index += 1) {
    const header = firstSection + index * 40
    const name = bytes.toString('ascii', header, header + 8).replace(/\0.*$/, '')
    if (name !== '.text') continue
    const virtualAddress = bytes.readUInt32LE(header + 12)
    const rawSize = bytes.readUInt32LE(header + 16)
    const rawOffset = bytes.readUInt32LE(header + 20)
    requireRange(bytes, rawOffset, rawSize)
    return { bytes: bytes.subarray(rawOffset, rawOffset + rawSize), virtualAddress }
  }
  throw new Error('The executable has no .text section.')
}

function importedFunction(bytes, dllName, functionName) {
  const peOffset = bytes.readUInt32LE(0x3c)
  const optionalHeader = peOffset + 24
  requireRange(bytes, optionalHeader, 120)
  if (bytes.readUInt16LE(optionalHeader) !== 0x20b) {
    throw new Error('The target is not a 64-bit PE executable.')
  }
  const importRva = bytes.readUInt32LE(optionalHeader + 120)
  const sectionCount = bytes.readUInt16LE(peOffset + 6)
  const firstSection = optionalHeader + bytes.readUInt16LE(peOffset + 20)
  const fileOffset = (rva) => {
    for (let index = 0; index < sectionCount; index += 1) {
      const header = firstSection + index * 40
      const virtualSize = bytes.readUInt32LE(header + 8)
      const virtualAddress = bytes.readUInt32LE(header + 12)
      const rawSize = bytes.readUInt32LE(header + 16)
      const rawOffset = bytes.readUInt32LE(header + 20)
      if (rva < virtualAddress || rva >= virtualAddress + Math.max(virtualSize, rawSize)) continue
      const offset = rawOffset + rva - virtualAddress
      requireRange(bytes, offset, 1)
      return offset
    }
    throw new Error('An import points outside the PE sections.')
  }
  const readString = (offset) => {
    requireRange(bytes, offset, 1)
    const end = bytes.indexOf(0, offset)
    if (end < 0 || end - offset > 512) throw new Error('An import has an invalid name.')
    return bytes.toString('ascii', offset, end)
  }
  for (let index = 0; index < 4096; index += 1) {
    const descriptor = fileOffset(importRva + index * 20)
    requireRange(bytes, descriptor, 20)
    const nameRva = bytes.readUInt32LE(descriptor + 12)
    if (nameRva === 0) break
    if (readString(fileOffset(nameRva)).toLowerCase() !== dllName.toLowerCase()) continue
    const thunkRva = bytes.readUInt32LE(descriptor) || bytes.readUInt32LE(descriptor + 16)
    for (let thunk = 0; thunk < 4096; thunk += 1) {
      const entry = fileOffset(thunkRva + thunk * 8)
      requireRange(bytes, entry, 8)
      const nameEntryRva = bytes.readBigUInt64LE(entry)
      if (nameEntryRva === 0n) break
      if (nameEntryRva >> 63n) continue
      if (nameEntryRva > 0xffffffffn) throw new Error('An import name RVA is invalid.')
      if (readString(fileOffset(Number(nameEntryRva)) + 2) === functionName) return true
    }
  }
  return false
}

function findRvas(section, patternText) {
  const pattern = patternText.split(' ').map((part) => part === '?' ? null : Number.parseInt(part, 16))
  const prefix = Buffer.from(pattern.slice(0, pattern.findIndex((part) => part === null)))
  if (prefix.length === 0) throw new Error('A hook pattern needs an exact prefix.')
  const matches = []
  let from = 0
  while (from <= section.bytes.length - pattern.length) {
    const index = section.bytes.indexOf(prefix, from)
    if (index < 0 || index + pattern.length > section.bytes.length) break
    if (pattern.every((byte, offset) => byte === null || section.bytes[index + offset] === byte)) {
      matches.push(section.virtualAddress + index)
    }
    from = index + 1
  }
  return matches
}

async function main() {
  if (process.argv.length !== 3) {
    throw new Error('Usage: node verify-native-bridge-target.mjs <absolute-path-to-NMS.exe>')
  }
  const executable = resolve(process.argv[2])
  const bytes = await readFile(executable)
  const sha256 = createHash('sha256').update(bytes).digest('hex')
  if (sha256 !== expectedHash) {
    throw new Error(`Unsupported executable fingerprint: ${sha256}`)
  }
  const section = textSection(bytes)
  const loaderImports = ['XInputGetState', 'XInputSetState']
  for (const functionName of loaderImports) {
    if (!importedFunction(bytes, 'XINPUT9_1_0.dll', functionName)) {
      throw new Error(`The expected startup import is missing: XINPUT9_1_0.dll!${functionName}`)
    }
  }
  const hooks = targets.map(({ name, expectedRva, pattern }) => {
    const matches = findRvas(section, pattern)
    if (matches.length !== 1 || matches[0] !== expectedRva) {
      throw new Error(`${name}: expected exactly one match at 0x${expectedRva.toString(16)}; found ${matches.map((rva) => `0x${rva.toString(16)}`).join(', ') || 'none'}`)
    }
    return { name, rva: `0x${expectedRva.toString(16)}` }
  })
  console.log(JSON.stringify({ executable, sha256, loaderImports, hooks }, null, 2))
}

main().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
