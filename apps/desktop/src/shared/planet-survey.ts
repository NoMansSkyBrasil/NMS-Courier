// Planets as the research tool reads them from the game's generators (runtime/research/
// find-planets.py, table planet-survey.md). Names are the game's own enum names.

export type SurveyPlanet = {
  // Portal address: planet, system (3), Y (2), Z (3), X (3), as twelve hexadecimal digits.
  portal: string
  biome: string
  subtype: string
  weather: string
  // None, Low, High or Always.
  storms: string
  extreme: boolean
  // Low, Default, Aggressive or Corrupt, at the normal difficulty preset.
  sentinels: string
  race: string
}

export const surveyBiomes = [
  'Lush',
  'Toxic',
  'Scorched',
  'Radioactive',
  'Frozen',
  'Barren',
  'Dead',
  'Weird',
  'Swamp',
  'Lava',
  'Red',
  'Green',
  'Blue',
  'Waterworld',
  'GasGiant'
] as const
export type SurveyBiome = (typeof surveyBiomes)[number]

// What a biome subtype is, in words a player uses. Several of the game's 32 subtypes share one.
export const variantKinds = [
  'standard',
  'highQuality',
  'worlds',
  'giant',
  'variant',
  'swamp',
  'lava',
  'ruins',
  'infested',
  'shapes',
  'remix',
  'none'
] as const
export type VariantKind = (typeof variantKinds)[number]

const kindOfSubtype: Record<string, VariantKind> = {
  Standard: 'standard',
  HighQuality: 'highQuality',
  Worlds: 'worlds',
  HugePlant: 'giant',
  HugeLush: 'giant',
  HugeRing: 'giant',
  HugeRock: 'giant',
  HugeScorch: 'giant',
  HugeToxic: 'giant',
  Variant_A: 'variant',
  Variant_B: 'variant',
  Variant_C: 'variant',
  Variant_D: 'variant',
  Swamp: 'swamp',
  Lava: 'lava',
  Structure: 'ruins',
  Infested: 'infested',
  Remix_A: 'remix',
  Remix_B: 'remix',
  Remix_C: 'remix',
  Remix_D: 'remix',
  None: 'none'
}

export function variantKind(subtype: string): VariantKind {
  return kindOfSubtype[subtype] ?? 'shapes'
}

export const stormLevels = ['None', 'Low', 'High', 'Always'] as const
export const sentinelLevels = ['Low', 'Default', 'Aggressive', 'Corrupt'] as const

// The system part of a portal address: everything but the planet digit.
export function systemOfPortal(portal: string): string {
  return portal.slice(1)
}

// What the owner called a perfect planet: grass, no storms or extreme weather, few sentinels, and
// none of the lush variants that are infested, swampy or overgrown with tentacles.
const earthLikeSubtypes = ['Standard', 'HighQuality', 'Worlds', 'HugeLush']
export function isEarthLike(planet: SurveyPlanet): boolean {
  return (
    planet.biome === 'Lush' &&
    earthLikeSubtypes.includes(planet.subtype) &&
    planet.storms === 'None' &&
    !planet.extreme &&
    planet.sentinels === 'Low'
  )
}

export type PlanetFilter = {
  // 'any' or one biome.
  biome: string
  // 'any', 'earthLike' (the four subtypes above) or one kind.
  variant: string
  // Highest storm level accepted: an index into stormLevels.
  storms: number
  // Highest sentinel level accepted: an index into sentinelLevels.
  sentinels: number
  allowExtreme: boolean
  // 'any' or a race of the system.
  race: string
  // Only planets of systems that hold at least this many matching planets.
  perSystem: number
}

export const earthLikeFilter: PlanetFilter = {
  biome: 'Lush',
  variant: 'earthLike',
  storms: 0,
  sentinels: 0,
  allowExtreme: false,
  race: 'any',
  perSystem: 1
}

export const openFilter: PlanetFilter = {
  biome: 'any',
  variant: 'any',
  storms: stormLevels.length - 1,
  sentinels: sentinelLevels.length - 1,
  allowExtreme: true,
  race: 'any',
  perSystem: 1
}

function passes(planet: SurveyPlanet, filter: PlanetFilter): boolean {
  if (filter.biome !== 'any' && planet.biome !== filter.biome) return false
  if (filter.variant === 'earthLike') {
    if (!earthLikeSubtypes.includes(planet.subtype)) return false
  } else if (filter.variant !== 'any' && variantKind(planet.subtype) !== filter.variant) {
    return false
  }
  const storms = stormLevels.indexOf(planet.storms as (typeof stormLevels)[number])
  if (storms < 0 || storms > filter.storms) return false
  const sentinels = sentinelLevels.indexOf(planet.sentinels as (typeof sentinelLevels)[number])
  if (sentinels < 0 || sentinels > filter.sentinels) return false
  if (planet.extreme && !filter.allowExtreme) return false
  if (filter.race !== 'any' && planet.race !== filter.race) return false
  return true
}

// The planets that pass, each with the number of passing planets of its system, systems with the
// most first.
export function filterPlanets(
  planets: readonly SurveyPlanet[],
  filter: PlanetFilter
): Array<SurveyPlanet & { inSystem: number }> {
  const passing = planets.filter((planet) => passes(planet, filter))
  const perSystem = new Map<string, number>()
  for (const planet of passing) {
    const system = systemOfPortal(planet.portal)
    perSystem.set(system, (perSystem.get(system) ?? 0) + 1)
  }
  return passing
    .map((planet) => ({ ...planet, inSystem: perSystem.get(systemOfPortal(planet.portal)) ?? 1 }))
    .filter((planet) => planet.inSystem >= filter.perSystem)
    .sort((a, b) => b.inSystem - a.inSystem)
}
