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
  // Of the planet's system: star colour, kind of economy, wealth and conflict level. Wealth and
  // conflict `Pirate` together are what the game shows as an outlaw system.
  star: string
  economy: string
  wealth: string
  conflict: string
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

// What a biome subtype is, in words a player uses. The game reuses its 32 subtype names with a
// different meaning in each biome, so the kind comes from the biome file the pair loads
// (runtime/research/biome-variants.md), not from the subtype's name alone.
export const variantKinds = [
  'standard',
  'highQuality',
  'jungle',
  'worlds',
  'giant',
  'floral',
  'rocky',
  'tentacles',
  'bubbles',
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

// Pairs whose biome file is not what the subtype's name suggests.
const kindOfPair: Record<string, VariantKind> = {
  'Lush/Worlds': 'jungle',
  'Lush/HugePlant': 'floral',
  'Lush/HugeToxic': 'tentacles',
  'Lush/Bubble': 'bubbles',
  'Lush/HydroGarden': 'rocky',
  'Lush/Variant_C': 'rocky',
  'Lush/Variant_D': 'rocky',
  'Toxic/Variant_C': 'rocky',
  'Toxic/Variant_D': 'tentacles',
  'Frozen/Variant_B': 'rocky',
  'Frozen/Variant_C': 'rocky',
  'Barren/Variant_B': 'rocky',
  'Barren/Variant_C': 'rocky',
  'Barren/HydroGarden': 'variant'
}

export function variantKind(biome: string, subtype: string): VariantKind {
  return kindOfPair[`${biome}/${subtype}`] ?? kindOfSubtype[subtype] ?? 'shapes'
}

export const economies = [
  'Mining',
  'HighTech',
  'Trading',
  'Manufacturing',
  'Fusion',
  'Scientific',
  'PowerGeneration'
] as const
export type Economy = (typeof economies)[number]

// A system the game shows as controlled by pirates.
export function isPirateSystem(planet: Pick<SurveyPlanet, 'conflict'>): boolean {
  return planet.conflict === 'Pirate'
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
  // 'any', 'lawful' (no pirate systems) or 'pirate' (only pirate systems).
  system: string
  // 'any' or a wealth of the system: Poor, Average or Wealthy.
  wealth: string
  // True keeps only planets with corrupted sentinels, the ones players call dissonant.
  dissonant: boolean
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
  system: 'any',
  wealth: 'any',
  dissonant: false,
  perSystem: 1
}

export const openFilter: PlanetFilter = {
  biome: 'any',
  variant: 'any',
  storms: stormLevels.length - 1,
  sentinels: sentinelLevels.length - 1,
  allowExtreme: true,
  race: 'any',
  system: 'any',
  wealth: 'any',
  dissonant: false,
  perSystem: 1
}

// Planets whose sentinels are corrupted, whatever else they are.
export const dissonantFilter: PlanetFilter = { ...openFilter, dissonant: true }

function passes(planet: SurveyPlanet, filter: PlanetFilter): boolean {
  if (filter.biome !== 'any' && planet.biome !== filter.biome) return false
  if (filter.variant === 'earthLike') {
    if (!earthLikeSubtypes.includes(planet.subtype)) return false
  } else if (
    filter.variant !== 'any' &&
    variantKind(planet.biome, planet.subtype) !== filter.variant
  ) {
    return false
  }
  const storms = stormLevels.indexOf(planet.storms as (typeof stormLevels)[number])
  if (storms < 0 || storms > filter.storms) return false
  const sentinels = sentinelLevels.indexOf(planet.sentinels as (typeof sentinelLevels)[number])
  if (sentinels < 0 || sentinels > filter.sentinels) return false
  if (planet.extreme && !filter.allowExtreme) return false
  if (filter.race !== 'any' && planet.race !== filter.race) return false
  if (filter.wealth !== 'any' && planet.wealth !== filter.wealth) return false
  if (filter.dissonant && planet.sentinels !== 'Corrupt') return false
  if (filter.system !== 'any' && isPirateSystem(planet) !== (filter.system === 'pirate'))
    return false
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
