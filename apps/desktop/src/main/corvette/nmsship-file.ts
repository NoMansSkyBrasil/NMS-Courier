import { readZipMembers } from './zip-archive'

// Reads a `.nmsship` export. Two kinds exist: a corvette is a ZIP archive whose `objects.json` is
// the list of placed parts (with `so.json`, the ship record, and `ccd.json`); an ordinary ship is
// one JSON document with a `Ship` record. Only the corvette's part list is used for delivery. The
// file is data: nothing in it is executed, and every value is checked before it is kept.

export type ShipPart = {
  objectId: string
  position: [number, number, number]
  up: [number, number, number]
  at: [number, number, number]
  timestamp: number
  userData: number
}

export type NmsShipFile =
  | { kind: 'corvette'; name: string; parts: ShipPart[] }
  | { kind: 'ship'; name: string; model: string }

export type NmsShipError = 'not_a_ship_file' | 'too_many_parts' | 'invalid_part'

// The largest export seen has 1,934 parts.
const mostParts = 4096
const objectIdPattern = /^[A-Z0-9_]{1,15}$/

function vector(value: unknown): [number, number, number] | null {
  if (!Array.isArray(value) || value.length < 3) return null
  const [x, y, z] = value
  return [x, y, z].every((part) => typeof part === 'number' && Number.isFinite(part))
    ? [x, y, z]
    : null
}

function wholeNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 ? value : null
}

function parseJson(data: Buffer): unknown {
  try {
    const text = data.toString('utf8')
    // Some exports start with a byte order mark.
    return JSON.parse(text.charCodeAt(0) === 0xfeff ? text.slice(1) : text)
  } catch {
    return null
  }
}

function text(value: unknown): string {
  return typeof value === 'string' ? value.slice(0, 80) : ''
}

export function readNmsShipFile(file: Buffer): NmsShipFile | NmsShipError {
  if (file.length >= 2 && file.toString('latin1', 0, 2) === 'PK') {
    const members = readZipMembers(file)
    const objects = members?.get('objects.json')
    if (!members || !objects) return 'not_a_ship_file'
    const list = parseJson(objects)
    if (!Array.isArray(list) || list.length < 1) return 'not_a_ship_file'
    if (list.length > mostParts) return 'too_many_parts'
    const parts: ShipPart[] = []
    for (const value of list) {
      const entry = (value ?? {}) as Record<string, unknown>
      const objectId = typeof entry.ObjectID === 'string' ? entry.ObjectID.replace(/^\^/, '') : ''
      const position = vector(entry.Position)
      const up = vector(entry.Up)
      const at = vector(entry.At)
      const timestamp = wholeNumber(entry.Timestamp)
      const userData = wholeNumber(entry.UserData)
      if (
        !objectIdPattern.test(objectId) ||
        !position ||
        !up ||
        !at ||
        timestamp === null ||
        userData === null
      ) {
        return 'invalid_part'
      }
      parts.push({ objectId, position, up, at, timestamp, userData })
    }
    const record = members.get('so.json')
    const owner = (record ? parseJson(record) : null) as Record<string, unknown> | null
    return { kind: 'corvette', name: text(owner?.Name), parts }
  }

  const document = parseJson(file) as { Ship?: Record<string, unknown> } | null
  const ship = document?.Ship
  if (!ship || typeof ship !== 'object') return 'not_a_ship_file'
  const resource = (ship.Resource ?? {}) as Record<string, unknown>
  return { kind: 'ship', name: text(ship.Name), model: text(resource.Filename) }
}

// Facts the page shows before anything is installed. The game warns about a corvette without
// these parts; with validation switched off it still builds one.
export function describeCorvette(parts: readonly ShipPart[]): {
  partCount: number
  hullPartCount: number
  hasCockpit: boolean
  hasLandingGear: boolean
  hasHabitation: boolean
  hasReactor: boolean
} {
  const ids = parts.map((part) => part.objectId)
  const has = (prefix: string): boolean => ids.some((id) => id.startsWith(prefix))
  return {
    partCount: parts.length,
    hullPartCount: ids.filter((id) => id.startsWith('B_')).length,
    hasCockpit: has('B_COK_'),
    hasLandingGear: has('B_LND_'),
    hasHabitation: has('B_HAB'),
    hasReactor: has('B_GEN_')
  }
}
