import { deflateRawSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import { describeCorvette, readNmsShipFile } from './nmsship-file'
import {
  buildShipBaseLayout,
  buildValidationOffOptions,
  ShipBaseLayoutError
} from './ship-base-layout'
import { readZipMembers } from './zip-archive'

// Synthetic data only: no export of a real corvette and no game file is part of the tests.

function zip(members: Record<string, string>, deflate: boolean): Buffer {
  const locals: Buffer[] = []
  const central: Buffer[] = []
  let offset = 0
  for (const [name, text] of Object.entries(members)) {
    const data = Buffer.from(text)
    const packed = deflate ? deflateRawSync(data) : data
    const local = Buffer.alloc(30 + name.length)
    local.writeUInt32LE(0x04034b50, 0)
    local.writeUInt16LE(deflate ? 8 : 0, 8)
    local.writeUInt32LE(packed.length, 18)
    local.writeUInt32LE(data.length, 22)
    local.writeUInt16LE(name.length, 26)
    local.write(name, 30)
    const entry = Buffer.alloc(46 + name.length)
    entry.writeUInt32LE(0x02014b50, 0)
    entry.writeUInt16LE(deflate ? 8 : 0, 10)
    entry.writeUInt32LE(packed.length, 20)
    entry.writeUInt32LE(data.length, 24)
    entry.writeUInt16LE(name.length, 28)
    entry.writeUInt32LE(offset, 42)
    entry.write(name, 46)
    locals.push(local, packed)
    central.push(entry)
    offset += local.length + packed.length
  }
  const directory = Buffer.concat(central)
  const end = Buffer.alloc(22)
  end.writeUInt32LE(0x06054b50, 0)
  end.writeUInt16LE(central.length, 8)
  end.writeUInt16LE(central.length, 10)
  end.writeUInt32LE(directory.length, 12)
  end.writeUInt32LE(offset, 16)
  return Buffer.concat([...locals, directory, end])
}

const part = (id: string, z: number): object => ({
  ObjectID: `^${id}`,
  Position: [1.5, 0, z],
  Up: [0, 1, 0],
  At: [0, 0, 1],
  Timestamp: 1790000000,
  UserData: 7
})

// The game's shipped layout in miniature: the base record and two entries, one a snap point.
function shippedLayout(): Buffer {
  const file = Buffer.alloc(0x2d0 + 2 * 0x90)
  file.writeUInt32LE(0xcccccccc, 0)
  Buffer.from('e40c0000877f0723594674a0d43b2cbf', 'hex').copy(file, 8)
  file.writeBigInt64LE(0x270n, 0x60)
  file.writeUInt32LE(2, 0x68)
  file.write('BIGGSCONNECTOR', 0x2d0 + 0x30, 'latin1')
  file.write('U_PARAGON', 0x2d0 + 0x90 + 0x30, 'latin1')
  return file
}

describe('corvette export', () => {
  it('reads the part list of a stored or deflated archive', () => {
    for (const deflate of [false, true]) {
      const file = zip(
        {
          'objects.json': JSON.stringify([
            part('B_COK_A', 0),
            part('B_LND_B', 6),
            part('S_CUP0', 2)
          ]),
          'so.json': JSON.stringify({ Name: 'Test Ship' }),
          'ccd.json': '{}'
        },
        deflate
      )
      expect([...(readZipMembers(file)?.keys() ?? [])]).toEqual([
        'objects.json',
        'so.json',
        'ccd.json'
      ])
      const ship = readNmsShipFile(file)
      if (typeof ship === 'string' || ship.kind !== 'corvette') throw new Error('not a corvette')
      expect(ship.name).toBe('Test Ship')
      expect(ship.parts[1]).toMatchObject({ objectId: 'B_LND_B', position: [1.5, 0, 6] })
      expect(describeCorvette(ship.parts)).toEqual({
        partCount: 3,
        hullPartCount: 2,
        hasCockpit: true,
        hasLandingGear: true,
        hasHabitation: false,
        hasReactor: false
      })
    }
  })

  it('recognises an ordinary ship and refuses anything else', () => {
    const ship = Buffer.from(
      JSON.stringify({ Ship: { Name: 'Runner', Resource: { Filename: 'MODELS/X.SCENE.MBIN' } } })
    )
    expect(readNmsShipFile(ship)).toEqual({
      kind: 'ship',
      name: 'Runner',
      model: 'MODELS/X.SCENE.MBIN'
    })
    expect(readNmsShipFile(Buffer.from('hello'))).toBe('not_a_ship_file')
    const bad = zip(
      { 'objects.json': JSON.stringify([{ ...part('B_COK_A', 0), ObjectID: 'a b' }]) },
      false
    )
    expect(readNmsShipFile(bad)).toBe('invalid_part')
    const huge = zip({ 'objects.json': JSON.stringify(Array(5000).fill(part('S_CUP0', 0))) }, true)
    expect(readNmsShipFile(huge)).toBe('too_many_parts')
  })
})

describe('ship base layout', () => {
  it('keeps the snap points and appends the parts in the game layout', () => {
    const layout = buildShipBaseLayout(shippedLayout(), [
      {
        objectId: 'B_COK_A',
        position: [1, 2, 3],
        up: [0, 1, 0],
        at: [0, 0, 1],
        timestamp: 1790000000,
        userData: 7
      }
    ])
    expect(layout.length).toBe(0x2d0 + 2 * 0x90)
    expect(layout.readUInt32LE(0x68)).toBe(2)
    const added = 0x2d0 + 0x90
    expect(layout.toString('latin1', added + 0x30, added + 0x37)).toBe('B_COK_A')
    expect(layout.readFloatLE(added + 0x08)).toBe(1) // At z
    expect(layout.readFloatLE(added + 0x10)).toBe(1) // Position x
    expect(layout.readFloatLE(added + 0x24)).toBe(1) // Up y
    expect(layout.readFloatLE(added + 0x1c)).toBe(1) // fourth component
    expect(layout.readBigUInt64LE(added + 0x40)).toBe(1790000000n)
    expect(layout.readBigUInt64LE(added + 0x48)).toBe(7n)
  })

  it('refuses game files of another structure', () => {
    const other = shippedLayout()
    other[9] ^= 0xff
    expect(() => buildShipBaseLayout(other, [])).toThrow(ShipBaseLayoutError)
    expect(() => buildValidationOffOptions(Buffer.alloc(100))).toThrow(ShipBaseLayoutError)
    const options = Buffer.alloc(9767)
    options.writeUInt32LE(0xcccccccc, 0)
    expect(buildValidationOffOptions(options)[0x219c]).toBe(1)
    options[0x219c] = 1
    expect(() => buildValidationOffOptions(options)).toThrow(ShipBaseLayoutError)
  })
})
