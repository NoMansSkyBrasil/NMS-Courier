import { describe, expect, it } from 'vitest'
import { glyphsFromSystemSeed, systemSeedFromGlyphs } from './system-address'

describe('system address', () => {
  // The home system seed the project owner supplied for a pirate freighter on 2026-10-06.
  it('reads a home system seed as a portal address', () => {
    expect(glyphsFromSystemSeed('0x175000B001FFD')).toEqual({
      glyphs: '01750B001FFD',
      galaxyNumber: 1
    })
  })

  it('builds the seed from glyphs and galaxy, ignoring the planet glyph', () => {
    expect(systemSeedFromGlyphs('01750B001FFD', 1)).toBe('0x175000B001FFD')
    expect(systemSeedFromGlyphs('3175 0B 001 FFD', 1)).toBe('0x175000B001FFD')
    expect(systemSeedFromGlyphs('01750B001FFD', 10)).toBe('0x175090B001FFD')
  })

  it('refuses what is not an address', () => {
    expect(systemSeedFromGlyphs('01750B001FF', 1)).toBeNull()
    expect(systemSeedFromGlyphs('01750B001FFD', 0)).toBeNull()
    expect(systemSeedFromGlyphs('01750B001FFD', 257)).toBeNull()
    expect(glyphsFromSystemSeed('0x8C968767B3282F13')).toBeNull()
    expect(glyphsFromSystemSeed('nonsense')).toBeNull()
  })
})
