// A portal address as the game's teleport request wants it. Twelve hexadecimal glyphs name, from
// the left: planet (1), system index (3), Y (2), Z (3), X (3). The game keeps the three
// coordinates signed, counted from the galaxy's centre: a glyph value in the upper half of its
// range is negative (X and Z are 12 bits, Y is 8). The galaxy is not part of the glyphs; the game
// numbers galaxies from 0 while players count from 1 (Euclid).

export type PortalDestination = {
  // The game's number of the galaxy: 0 for the first one.
  galaxy: number
  planet: number
  system: number
  x: number
  y: number
  z: number
}

export const galaxyCount = 256

// The game's own picture of each glyph, by its digit, in the interface texture archive.
export const glyphDigits = '0123456789ABCDEF'.split('')
export function glyphIcon(digit: string): string {
  return `textures/ui/frontend/icons/update3/portalsymbol.${digit.toLowerCase()}.dds`
}

const glyphPattern = /^[0-9a-f]{12}$/i

function signed(value: number, bits: number): number {
  return value >= 1 << (bits - 1) ? value - (1 << bits) : value
}

// The glyphs without spaces, in capitals; null when they are not twelve hexadecimal digits.
export function normaliseGlyphs(glyphs: string): string | null {
  const text = glyphs.replace(/\s+/g, '')
  return glyphPattern.test(text) ? text.toUpperCase() : null
}

// What a portal address in a galaxy (1 is the first) stands for; null when either is not valid.
export function destinationFromGlyphs(
  glyphs: string,
  galaxyNumber: number
): PortalDestination | null {
  const text = normaliseGlyphs(glyphs)
  if (!text) return null
  if (!Number.isInteger(galaxyNumber) || galaxyNumber < 1 || galaxyNumber > galaxyCount) return null
  return {
    galaxy: galaxyNumber - 1,
    planet: parseInt(text.slice(0, 1), 16),
    system: parseInt(text.slice(1, 4), 16),
    y: signed(parseInt(text.slice(4, 6), 16), 8),
    z: signed(parseInt(text.slice(6, 9), 16), 12),
    x: signed(parseInt(text.slice(9, 12), 16), 12)
  }
}
