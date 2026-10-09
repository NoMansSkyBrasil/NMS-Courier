// The seed of a star system is its address in the universe: the game generates a system with
// its 52-bit address as the seed (build 180836: both callers of the system generator at RVA
// 1649d10 pass the address, one of them masked with 0xFFFFFFFFFFFFF; docs/SEED_ORIGINS.md).
// A freighter's home system seed is that value.
//
// Address, from the low bits up: X (12 bits), Z (12), Y (8), galaxy (8), system index (12).
// A portal address is twelve hexadecimal glyphs: planet (1), system index (3), Y (2), Z (3),
// X (3). The galaxy is not part of the glyphs.

const glyphPattern = /^[0-9a-f]{12}$/i

// The seed of the system a portal address names, in the given galaxy (1 is Euclid); null when
// the glyphs or the galaxy are not valid.
export function systemSeedFromGlyphs(glyphs: string, galaxyNumber: number): string | null {
  const text = glyphs.replace(/\s+/g, '')
  if (!glyphPattern.test(text)) return null
  if (!Number.isInteger(galaxyNumber) || galaxyNumber < 1 || galaxyNumber > 256) return null
  const system = BigInt('0x' + text.slice(1, 4))
  const position = BigInt('0x' + text.slice(4))
  const seed = (system << 40n) | (BigInt(galaxyNumber - 1) << 32n) | position
  return '0x' + seed.toString(16).toUpperCase()
}

// The portal address and galaxy of a system seed; null when the seed is not a system address
// (it has bits above the 52 an address uses).
export function glyphsFromSystemSeed(
  seed: string
): { glyphs: string; galaxyNumber: number } | null {
  if (!/^0x[0-9a-f]{1,16}$/i.test(seed)) return null
  const value = BigInt(seed)
  if (value >> 52n !== 0n) return null
  const system = (value >> 40n) & 0xfffn
  const galaxy = (value >> 32n) & 0xffn
  const position = value & 0xffffffffn
  return {
    // Planet 0: the address of the system itself.
    glyphs: (
      '0' +
      system.toString(16).padStart(3, '0') +
      position.toString(16).padStart(8, '0')
    ).toUpperCase(),
    galaxyNumber: Number(galaxy) + 1
  }
}
