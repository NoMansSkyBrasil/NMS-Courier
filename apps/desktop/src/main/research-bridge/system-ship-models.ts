import { advance } from '../model-workshop/seed-part-selection'
import { seedState } from '../nms-adapters/base-palette-preview'
import type { StarSystemShip } from '../../shared/star-system'

// Which model each ship of a star system uses. The game's table
// METADATA/SIMULATION/SPACE/AISPACESHIPMANAGER.MBIN holds six lists of model names by owner
// (frigates, traders, pirates, police, one unused, swarm) and the model records: name, scene
// file, kind, ship class, frigate class. For a ship the game shuffles its owner's list with the
// ship's seed and takes the first record of the ship's kind and class (a frigate must match the
// frigate class too). Layout and rule are those of NMS Shipwright's aiships.py (MIT licence,
// Shikhar Tiwari), which found them in the executable; checked here against two systems read
// from the running game (docs/SEED_ORIGINS.md).

export const shipModelTablePath = 'metadata/simulation/space/aispaceshipmanager.mbin'

type ModelRecord = {
  id: string
  scene: string
  kind: number
  shipClass: number
  frigateClass: number
}
export type ShipModelTable = { lists: string[][]; records: Map<string, ModelRecord> }

const header = 0x20
const frigateKind = 6

function text(data: Buffer, start: number, length: number): string {
  if (start < 0 || start + length > data.length) return ''
  const slice = data.subarray(start, start + length)
  const end = slice.indexOf(0)
  return slice.subarray(0, end < 0 ? length : end).toString('latin1')
}

// A list field: 64-bit offset relative to the field, then the count.
function list(data: Buffer, field: number): { start: number; count: number } | null {
  const at = header + field
  if (at + 12 > data.length) return null
  const count = data.readUInt32LE(at + 8)
  const start = at + Number(data.readBigInt64LE(at))
  if (count > 4096 || start < 0 || start > data.length) return null
  return { start: count ? start : 0, count }
}

export function readShipModelTable(data: Buffer): ShipModelTable | null {
  const lists: string[][] = []
  for (let owner = 0; owner < 6; owner += 1) {
    const names = list(data, 0x10 * owner)
    if (!names) return null
    lists.push(
      Array.from({ length: names.count }, (_, item) => text(data, names.start + 0x20 * item, 0x20))
    )
  }
  const models = list(data, 0x60)
  if (!models) return null
  const records = new Map<string, ModelRecord>()
  for (let item = 0; item < models.count; item += 1) {
    const record = models.start + 0x40 * item
    if (record + 0x40 > data.length) return null
    const file = list(data, record - header + 0x20)
    const id = text(data, record, 0x20)
    records.set(id, {
      id,
      scene:
        file && file.count
          ? text(data, file.start, file.count).replace(/\\/g, '/').toLowerCase()
          : '',
      kind: data.readInt32LE(record + 0x30),
      shipClass: data.readInt32LE(record + 0x34),
      frigateClass: data.readInt32LE(record + 0x38)
    })
  }
  return { lists, records }
}

// The record a ship of a system uses; null when the table has none for it.
export function shipModel(table: ShipModelTable, ship: StarSystemShip): ModelRecord | null {
  const names = table.lists[ship.faction] ?? []
  const order = names.map((_, index) => index)
  let state = seedState(BigInt(ship.seed))
  for (let index = names.length - 1; index > 0; index -= 1) {
    state = advance(state)
    const other = Number((BigInt(state[0]) * BigInt(index + 1)) >> 32n)
    ;[order[index], order[other]] = [order[other], order[index]]
  }
  for (const index of order) {
    const record = table.records.get(names[index])
    if (
      record &&
      record.kind === ship.shipRole &&
      record.shipClass === ship.shipClass &&
      (record.kind !== frigateKind || record.frigateClass === ship.frigateClass)
    ) {
      return record
    }
  }
  return null
}
