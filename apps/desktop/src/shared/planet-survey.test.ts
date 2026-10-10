import { describe, expect, it } from 'vitest'
import {
  earthLikeFilter,
  filterPlanets,
  isEarthLike,
  isPirateSystem,
  openFilter,
  variantKind,
  type SurveyPlanet
} from './planet-survey'

const planet = (portal: string, changes: Partial<SurveyPlanet> = {}): SurveyPlanet => ({
  portal,
  biome: 'Lush',
  subtype: 'Standard',
  weather: 'Humid',
  storms: 'None',
  extreme: false,
  sentinels: 'Low',
  race: 'Gek',
  star: 'Yellow',
  economy: 'Trading',
  wealth: 'Average',
  conflict: 'Default',
  ...changes
})

describe('planet survey', () => {
  it('names what a subtype is', () => {
    expect(variantKind('Lush', 'HighQuality')).toBe('highQuality')
    expect(variantKind('Toxic', 'HugeToxic')).toBe('giant')
    expect(variantKind('Scorched', 'Variant_A')).toBe('variant')
    expect(variantKind('Weird', 'Hexagon')).toBe('shapes')
  })

  it('names a subtype by its biome where the game reuses the name', () => {
    expect(variantKind('Lush', 'Worlds')).toBe('jungle')
    expect(variantKind('Frozen', 'Worlds')).toBe('worlds')
    expect(variantKind('Lush', 'HugeToxic')).toBe('tentacles')
    expect(variantKind('Lush', 'HugePlant')).toBe('floral')
    expect(variantKind('Lush', 'Bubble')).toBe('bubbles')
    expect(variantKind('Weird', 'Bubble')).toBe('shapes')
    expect(variantKind('Lush', 'HydroGarden')).toBe('rocky')
    expect(variantKind('Weird', 'HydroGarden')).toBe('shapes')
  })

  it('tells pirate systems apart', () => {
    const planets = [
      planet('1001F769C14E'),
      planet('1002F769C14E', { conflict: 'Pirate', wealth: 'Pirate' })
    ]
    expect(isPirateSystem(planets[0])).toBe(false)
    expect(isPirateSystem(planets[1])).toBe(true)
    expect(
      filterPlanets(planets, { ...openFilter, system: 'pirate' }).map((entry) => entry.portal)
    ).toEqual(['1002F769C14E'])
    expect(
      filterPlanets(planets, { ...openFilter, system: 'lawful' }).map((entry) => entry.portal)
    ).toEqual(['1001F769C14E'])
  })

  it('calls a planet Earth-like only when every condition holds', () => {
    expect(isEarthLike(planet('1001F769C14E'))).toBe(true)
    expect(isEarthLike(planet('1001F769C14E', { subtype: 'Infested' }))).toBe(false)
    expect(isEarthLike(planet('1001F769C14E', { storms: 'Low' }))).toBe(false)
    expect(isEarthLike(planet('1001F769C14E', { extreme: true }))).toBe(false)
    expect(isEarthLike(planet('1001F769C14E', { sentinels: 'Default' }))).toBe(false)
    expect(isEarthLike(planet('1001F769C14E', { biome: 'Frozen' }))).toBe(false)
  })

  it('filters, counts the matches of each system and lists the fullest systems first', () => {
    const planets = [
      planet('1001F769C14E'),
      planet('2002F769C14E'),
      planet('3002F769C14E', { subtype: 'Worlds' }),
      planet('4002F769C14E', { biome: 'Toxic', subtype: 'Standard', storms: 'High' }),
      planet('1003F769C14E', { sentinels: 'Aggressive' })
    ]
    const found = filterPlanets(planets, earthLikeFilter)
    expect(found.map((entry) => entry.portal)).toEqual([
      '2002F769C14E',
      '3002F769C14E',
      '1001F769C14E'
    ])
    expect(found.map((entry) => entry.inSystem)).toEqual([2, 2, 1])
    expect(filterPlanets(planets, { ...earthLikeFilter, perSystem: 2 })).toHaveLength(2)
    expect(filterPlanets(planets, openFilter)).toHaveLength(5)
    expect(filterPlanets(planets, { ...openFilter, biome: 'Toxic' })).toHaveLength(1)
    expect(filterPlanets(planets, { ...openFilter, sentinels: 1 })).toHaveLength(4)
    expect(filterPlanets(planets, { ...openFilter, wealth: 'Wealthy' })).toHaveLength(0)
    expect(filterPlanets(planets, { ...openFilter, wealth: 'Average' })).toHaveLength(5)
    expect(filterPlanets(planets, { ...openFilter, dissonant: true })).toHaveLength(0)
  })
})
