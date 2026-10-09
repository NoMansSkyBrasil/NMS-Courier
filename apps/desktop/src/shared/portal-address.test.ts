import { describe, expect, it } from 'vitest'
import { destinationFromGlyphs, normaliseGlyphs } from './portal-address'

describe('portal address', () => {
  it('splits the glyphs into planet, system and signed coordinates', () => {
    // The owner's freighter home system: address 0x175000B001FFD, galaxy 1 (docs/SEED_ORIGINS.md).
    expect(destinationFromGlyphs('01750B001FFD', 1)).toEqual({
      galaxy: 0,
      planet: 0,
      system: 0x175,
      y: 0x0b,
      z: 0x001,
      x: -3
    })
    expect(destinationFromGlyphs('4 01D F9 BA5 EDE', 24)).toEqual({
      galaxy: 23,
      planet: 4,
      system: 0x01d,
      y: -7,
      z: 0xba5 - 0x1000,
      x: 0xede - 0x1000
    })
  })

  it('refuses anything that is not twelve glyphs or a galaxy of the game', () => {
    expect(destinationFromGlyphs('01750B001FF', 1)).toBeNull()
    expect(destinationFromGlyphs('01750B001FFG', 1)).toBeNull()
    expect(destinationFromGlyphs('01750B001FFD', 0)).toBeNull()
    expect(destinationFromGlyphs('01750B001FFD', 257)).toBeNull()
    expect(normaliseGlyphs(' 0175 0b00 1ffd ')).toBe('01750B001FFD')
  })
})
