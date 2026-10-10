// The search the bridge runs around the player with the game's own generators (bridge 1.30.0,
// runtime/native/asi/profile_180836/planet_search.h): the request the application writes and the
// answer it reads back. A found planet is given as a SurveyPlanet, so the finder treats a planet
// of the ready-made list and one found live the same way.

import {
  sentinelLevels,
  stormLevels,
  surveyBiomes,
  variantKind,
  type PlanetFilter,
  type SurveyPlanet
} from './planet-survey'

// Enum names of the game, by number, as the executable's metadata lists them.
const biomeNames = [
  'Lush',
  'Toxic',
  'Scorched',
  'Radioactive',
  'Frozen',
  'Barren',
  'Dead',
  'Weird',
  'Red',
  'Green',
  'Blue',
  'Test',
  'Swamp',
  'Lava',
  'Waterworld',
  'GasGiant',
  'All'
] as const
export const subtypeNames = [
  'None',
  'Standard',
  'HighQuality',
  'Structure',
  'Beam',
  'Hexagon',
  'FractCube',
  'Bubble',
  'Shards',
  'Contour',
  'Shell',
  'BoneSpire',
  'WireCell',
  'HydroGarden',
  'HugePlant',
  'HugeLush',
  'HugeRing',
  'HugeRock',
  'HugeScorch',
  'HugeToxic',
  'Variant_A',
  'Variant_B',
  'Variant_C',
  'Variant_D',
  'Infested',
  'Swamp',
  'Lava',
  'Worlds',
  'Remix_A',
  'Remix_B',
  'Remix_C',
  'Remix_D'
] as const
const weatherNames = [
  'Clear',
  'Dust',
  'Humid',
  'Snow',
  'Toxic',
  'Scorched',
  'Radioactive',
  'RedWeather',
  'GreenWeather',
  'BlueWeather',
  'Swamp',
  'Lava',
  'Bubble',
  'Weird',
  'Fire',
  'ClearCold',
  'GasGiant'
] as const
// The races as the ready-made list names them; the interface shows the three it has systems of.
const raceNames = [
  'Gek',
  "Vy'keen",
  'Korvax',
  'Robots',
  'Atlas',
  'Diplomats',
  'Exotics',
  'none',
  'Autophage'
] as const
const starNames = ['Yellow', 'Green', 'Blue', 'Red', 'Purple'] as const
const economyNames = [
  'Mining',
  'HighTech',
  'Trading',
  'Manufacturing',
  'Fusion',
  'Scientific',
  'PowerGeneration'
] as const
const wealthNames = ['Poor', 'Average', 'Wealthy', 'Pirate'] as const
const conflictNames = ['Low', 'Default', 'High', 'Pirate'] as const
const earthLikeSubtypes = ['Standard', 'HighQuality', 'Worlds', 'HugeLush']

const named = (names: readonly string[], value: number): string => names[value] ?? String(value)

// A planet the search found, with what only a live search knows.
export type FoundPlanet = SurveyPlanet & {
  // First colour of the planet's grass palette, as six hexadecimal digits.
  grass: string
  // How many regions from the start, the largest of the three axes.
  distance: number
  // True for a system that is not a star of the galaxy map: only a portal or the application's
  // travel reaches it.
  portalOnly: boolean
  // How much plant and animal life: Dead, Low, Mid or Full.
  flora: string
  fauna: string
  // Identifiers of the planet's common, uncommon and rare resource, where the game gave one.
  resources: string[]
}

const lifeNames = ['Dead', 'Low', 'Mid', 'Full'] as const

// Whether a value read from a file is a found planet (a list another player exported).
export function isFoundPlanet(value: unknown): value is FoundPlanet {
  if (!value || typeof value !== 'object') return false
  const planet = value as Record<string, unknown>
  const texts = [
    'biome',
    'subtype',
    'weather',
    'storms',
    'sentinels',
    'race',
    'star',
    'economy',
    'wealth',
    'conflict',
    'flora',
    'fauna'
  ]
  return (
    typeof planet.portal === 'string' &&
    /^[0-9A-F]{12}$/.test(planet.portal) &&
    texts.every((key) => typeof planet[key] === 'string' && (planet[key] as string).length <= 24) &&
    typeof planet.extreme === 'boolean' &&
    typeof planet.portalOnly === 'boolean' &&
    typeof planet.grass === 'string' &&
    /^[0-9A-F]{6}$/.test(planet.grass) &&
    typeof planet.distance === 'number' &&
    Array.isArray(planet.resources) &&
    planet.resources.length <= 3 &&
    planet.resources.every((id) => typeof id === 'string' && /^[A-Z0-9_]{1,15}$/.test(id))
  )
}

export const searchStates = [
  'running',
  'done',
  'stopped',
  'travelled',
  'failed',
  'not_ready'
] as const
export type SearchState = (typeof searchStates)[number]

export type PlanetSearchReport = {
  state: SearchState
  // The galaxy the search ran in, counted from 0 as the game does.
  galaxy: number
  regions: number
  systems: number
  planets: number
  distance: number
  elapsedMilliseconds: number
  entries: FoundPlanet[]
}

// Reads the bridge's answer: "result=", the counters, then one "planet=" line a planet found:
// portal address, then the numbers of biome, subtype, weather, storms, extreme, sentinels, race,
// star, economy, wealth and conflict, the grass colour, the distance, the kind of system (0 a star
// of the galaxy map, 1 reached by portal only, 2 a purple star), flora, fauna and three resources.
export function parsePlanetSearch(text: string): PlanetSearchReport | null {
  const lines = text.split(/\r?\n/).filter((line) => line.trim())
  const field = (name: string): string | undefined =>
    lines.find((line) => line.startsWith(`${name}=`))?.slice(name.length + 1)
  const state = field('result') as SearchState | undefined
  if (!state || !searchStates.includes(state)) return null
  const entries: FoundPlanet[] = []
  for (const line of lines) {
    const match =
      /^planet=([0-9A-F]{12})((?:,-?\d+){11}),([0-9A-F]{6}),(\d+),(\d),(-?\d+),(-?\d+),([A-Z0-9_-]+),([A-Z0-9_-]+),([A-Z0-9_-]+)$/.exec(
        line
      )
    if (!match) continue
    const [
      biome,
      subtype,
      weather,
      storms,
      extreme,
      sentinels,
      race,
      star,
      economy,
      wealth,
      conflict
    ] = match[2].slice(1).split(',').map(Number)
    entries.push({
      portal: match[1],
      biome: named(biomeNames, biome),
      subtype: named(subtypeNames, subtype),
      weather: named(weatherNames, weather),
      storms: named(stormLevels, storms),
      extreme: extreme !== 0,
      sentinels: named(sentinelLevels, sentinels),
      race: named(raceNames, race),
      star: named(starNames, star),
      economy: named(economyNames, economy),
      wealth: named(wealthNames, wealth),
      conflict: named(conflictNames, conflict),
      grass: match[3],
      distance: Number(match[4]),
      portalOnly: match[5] === '1',
      flora: named(lifeNames, Number(match[6])),
      fauna: named(lifeNames, Number(match[7])),
      resources: [match[8], match[9], match[10]].filter((id) => id !== '-')
    })
  }
  const count = (name: string): number => Number(field(name)) || 0
  return {
    state,
    galaxy: count('galaxy'),
    regions: count('regions'),
    systems: count('systems'),
    planets: count('planets'),
    distance: count('distance'),
    elapsedMilliseconds: count('elapsed_ms'),
    entries
  }
}

export type PlanetSearchRequest = {
  // How long the search may run.
  seconds: number
  filter: PlanetFilter
}

export function isPlanetSearchRequest(value: unknown): value is PlanetSearchRequest {
  if (!value || typeof value !== 'object') return false
  const request = value as { seconds?: unknown; filter?: unknown }
  const filter = request.filter as Partial<PlanetFilter> | null | undefined
  return (
    typeof request.seconds === 'number' &&
    Number.isInteger(request.seconds) &&
    request.seconds >= 1 &&
    request.seconds <= 86400 &&
    !!filter &&
    typeof filter === 'object' &&
    typeof filter.biome === 'string' &&
    typeof filter.variant === 'string' &&
    typeof filter.race === 'string' &&
    typeof filter.system === 'string' &&
    typeof filter.allowExtreme === 'boolean' &&
    [filter.storms, filter.sentinels].every(
      (level) => typeof level === 'number' && Number.isInteger(level) && level >= 0 && level <= 3
    )
  )
}

// The subtypes a variant choice lets through, one bit a subtype. With no biome chosen the mask is
// the union over every biome: the bridge then lets a little too much through and the finder's own
// filter, which knows the biome of each planet, does the rest.
function subtypeMask(filter: PlanetFilter): number {
  if (filter.variant === 'any') return 0xffffffff
  let mask = 0
  subtypeNames.forEach((subtype, bit) => {
    const wanted =
      filter.variant === 'earthLike'
        ? earthLikeSubtypes.includes(subtype)
        : (filter.biome === 'any' ? surveyBiomes : [filter.biome]).some(
            (biome) => variantKind(biome, subtype) === filter.variant
          )
    if (wanted) mask |= 1 << bit
  })
  return mask >>> 0
}

// The request file of the bridge, or null when the filter names something the game does not have.
export function planetSearchRequestLines(request: PlanetSearchRequest | 'stop'): string[] | null {
  if (request === 'stop') return ['mode=stop']
  if (!isPlanetSearchRequest(request)) return null
  const { filter } = request
  const biome =
    filter.biome === 'any' ? -1 : (biomeNames as readonly string[]).indexOf(filter.biome)
  const race = filter.race === 'any' ? -1 : (raceNames as readonly string[]).indexOf(filter.race)
  if ((filter.biome !== 'any' && biome < 0) || (filter.race !== 'any' && race < 0)) return null
  const mask = subtypeMask(filter)
  if (mask === 0) return null
  return [
    'mode=start',
    `seconds=${request.seconds}`,
    `biome=${biome}`,
    `subtypes=${mask.toString(16).padStart(8, '0')}`,
    `storms=${filter.storms}`,
    `sentinels=${filter.sentinels}`,
    `extreme=${filter.allowExtreme ? 1 : 0}`,
    `pirate=${filter.system === 'pirate' ? 1 : filter.system === 'lawful' ? 0 : -1}`,
    `race=${race}`,
    'limit=2000'
  ]
}

export const grassHues = [
  'green',
  'teal',
  'blue',
  'purple',
  'pink',
  'red',
  'orange',
  'yellow',
  'pale'
] as const
export type GrassHue = (typeof grassHues)[number]

// The plain name of a grass colour, from its hue; a colour with almost no colour in it is "pale".
export function grassHue(hex: string): GrassHue | null {
  if (!/^[0-9A-Fa-f]{6}$/.test(hex)) return null
  const [red, green, blue] = [0, 2, 4].map((at) => parseInt(hex.slice(at, at + 2), 16) / 255)
  const high = Math.max(red, green, blue)
  const low = Math.min(red, green, blue)
  if (high - low < 0.12) return 'pale'
  const span = high - low
  const turn =
    high === red
      ? ((green - blue) / span + 6) % 6
      : high === green
        ? (blue - red) / span + 2
        : (red - green) / span + 4
  const degrees = turn * 60
  if (degrees < 15 || degrees >= 345) return 'red'
  if (degrees < 45) return 'orange'
  if (degrees < 70) return 'yellow'
  if (degrees < 160) return 'green'
  if (degrees < 195) return 'teal'
  if (degrees < 255) return 'blue'
  if (degrees < 290) return 'purple'
  return 'pink'
}
