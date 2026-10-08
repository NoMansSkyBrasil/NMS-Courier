import type { ShipPart } from './nmsship-file'

// Writes the layout file the game's corvette build mode starts from
// (METADATA/SIMULATION/SHIPBASES/DEFAULTSHIPBASE.MBIN) for the parts of an export, and the copy of
// the game's debug options with corvette validation switched off. Both start from the game's own
// files, read from the user's installation, and both are refused when those files do not have the
// structure this was written for (build 180836; see docs/CORVETTE_DELIVERY_NOTES.md).

export class ShipBaseLayoutError extends Error {
  constructor(readonly reason: 'unknown_structure') {
    super(reason)
  }
}

export const shipBaseLayoutPath = 'metadata/simulation/shipbases/defaultshipbase.mbin'
export const debugOptionsPath = 'gcdebugoptions.global.mbin'

// Header bytes 8 to 23 of the two files, which change when the game changes their structure.
const layoutStructure = 'e40c0000877f0723594674a0d43b2cbf'
const tableMagic = 0xcccccccc
// The base record: the part list reference at 0x60, the parts right after the record.
const listPosition = 0x60
const partsStart = 0x2d0
const partSize = 0x90
// A part: At, Position and Up as four floats each (the fourth is 1), the identifier, the
// timestamp, the user data, then the message, which stays empty.
const atOffset = 0x00
const positionOffset = 0x10
const upOffset = 0x20
const idOffset = 0x30
const timestampOffset = 0x40
const userDataOffset = 0x48
// The snap points of the shipped layout, kept in front of the export's parts.
const connectorId = 'BIGGSCONNECTOR'

const debugOptionsSize = 9767
// DisableCorvetteValidation, found as the one data byte that differs between the game's file and
// the converter's output with that option set.
const validationFlagOffset = 0x219c

function structure(file: Buffer): string {
  return file.length >= 0x20 && file.readUInt32LE(0) === tableMagic
    ? file.toString('hex', 8, 24)
    : ''
}

function writeVector(target: Buffer, offset: number, value: readonly number[]): void {
  target.writeFloatLE(value[0], offset)
  target.writeFloatLE(value[1], offset + 4)
  target.writeFloatLE(value[2], offset + 8)
  target.writeFloatLE(1, offset + 12)
}

export function buildShipBaseLayout(shipped: Buffer, parts: readonly ShipPart[]): Buffer {
  if (structure(shipped) !== layoutStructure || shipped.length < partsStart) {
    throw new ShipBaseLayoutError('unknown_structure')
  }
  const shippedCount = shipped.readUInt32LE(listPosition + 8)
  const listStart = listPosition + Number(shipped.readBigInt64LE(listPosition))
  if (listStart !== partsStart || partsStart + shippedCount * partSize !== shipped.length) {
    throw new ShipBaseLayoutError('unknown_structure')
  }

  const connectors: Buffer[] = []
  for (let index = 0; index < shippedCount; index += 1) {
    const entry = shipped.subarray(
      partsStart + index * partSize,
      partsStart + (index + 1) * partSize
    )
    const end = entry.indexOf(0, idOffset)
    if (entry.toString('latin1', idOffset, end) === connectorId) connectors.push(entry)
  }

  const record = Buffer.from(shipped.subarray(0, partsStart))
  record.writeUInt32LE(connectors.length + parts.length, listPosition + 8)
  const written = parts.map((part) => {
    const entry = Buffer.alloc(partSize)
    writeVector(entry, atOffset, part.at)
    writeVector(entry, positionOffset, part.position)
    writeVector(entry, upOffset, part.up)
    entry.write(part.objectId, idOffset, 15, 'latin1')
    entry.writeBigUInt64LE(BigInt(part.timestamp), timestampOffset)
    entry.writeBigUInt64LE(BigInt(part.userData), userDataOffset)
    return entry
  })
  return Buffer.concat([record, ...connectors, ...written])
}

export function buildValidationOffOptions(shipped: Buffer): Buffer {
  if (
    structure(shipped) === '' ||
    shipped.length !== debugOptionsSize ||
    shipped[validationFlagOffset] !== 0
  ) {
    throw new ShipBaseLayoutError('unknown_structure')
  }
  const options = Buffer.from(shipped)
  options[validationFlagOffset] = 1
  return options
}
