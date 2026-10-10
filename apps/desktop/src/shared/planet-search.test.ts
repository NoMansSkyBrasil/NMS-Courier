import { describe, expect, it } from 'vitest'
import {
  grassHue,
  isPlanetSearchRequest,
  parsePlanetSearch,
  planetSearchRequestLines
} from './planet-search'
import { earthLikeFilter, openFilter } from './planet-survey'

describe('planet search', () => {
  it('reads the answer of the bridge into planets the finder understands', () => {
    const report = parsePlanetSearch(
      [
        'result=running',
        'galaxy=9',
        'centre=27200F769C14E',
        'regions=3',
        'systems=1500',
        'planets=7000',
        'found=2',
        'distance=1',
        'elapsed_ms=4200',
        'planet=2272F769C14E,0,2,2,0,0,0,2,0,1,3,3,3FA95C,0,0,3,2,COPPER,-,GOLD',
        'planet=1003F769C14F,1,24,4,2,1,1,7,3,0,0,0,AA22CC,1,1,0,1,-,-,-',
        'planet=broken'
      ].join('\r\n')
    )
    expect(report).toMatchObject({
      state: 'running',
      galaxy: 9,
      regions: 3,
      systems: 1500,
      planets: 7000,
      distance: 1,
      elapsedMilliseconds: 4200
    })
    expect(report?.entries).toEqual([
      {
        portal: '2272F769C14E',
        biome: 'Lush',
        subtype: 'HighQuality',
        weather: 'Humid',
        storms: 'None',
        extreme: false,
        sentinels: 'Low',
        race: 'Korvax',
        star: 'Yellow',
        economy: 'HighTech',
        wealth: 'Pirate',
        conflict: 'Pirate',
        grass: '3FA95C',
        distance: 0,
        portalOnly: false,
        flora: 'Full',
        fauna: 'Mid',
        resources: ['COPPER', 'GOLD']
      },
      {
        portal: '1003F769C14F',
        biome: 'Toxic',
        subtype: 'Infested',
        weather: 'Toxic',
        storms: 'High',
        extreme: true,
        sentinels: 'Default',
        race: 'none',
        star: 'Red',
        economy: 'Mining',
        wealth: 'Poor',
        conflict: 'Low',
        grass: 'AA22CC',
        distance: 1,
        portalOnly: true,
        flora: 'Dead',
        fauna: 'Low',
        resources: []
      }
    ])
    expect(parsePlanetSearch('found=1')).toBeNull()
    expect(parsePlanetSearch('result=invented')).toBeNull()
  })

  it('writes the request the bridge takes', () => {
    expect(planetSearchRequestLines('stop')).toEqual(['mode=stop'])
    expect(planetSearchRequestLines({ seconds: 300, filter: earthLikeFilter })).toEqual([
      'mode=start',
      'seconds=300',
      'biome=0',
      // Standard (1), HighQuality (2), HugeLush (15) and Worlds (27).
      'subtypes=08008006',
      'storms=0',
      'sentinels=0',
      'extreme=0',
      'pirate=-1',
      'race=-1',
      'limit=2000'
    ])
    expect(
      planetSearchRequestLines({
        seconds: 60,
        filter: { ...openFilter, race: 'Korvax', system: 'pirate' }
      })
    ).toEqual([
      'mode=start',
      'seconds=60',
      'biome=-1',
      'subtypes=ffffffff',
      'storms=3',
      'sentinels=3',
      'extreme=1',
      'pirate=1',
      'race=2',
      'limit=2000'
    ])
    // Infested is subtype 24 whatever the biome.
    expect(
      planetSearchRequestLines({ seconds: 60, filter: { ...openFilter, variant: 'infested' } })?.[3]
    ).toBe('subtypes=01000000')
  })

  it('refuses a request the bridge would refuse', () => {
    expect(planetSearchRequestLines({ seconds: 0, filter: openFilter })).toBeNull()
    expect(planetSearchRequestLines({ seconds: 86400, filter: openFilter })?.[1]).toBe(
      'seconds=86400'
    )
    expect(planetSearchRequestLines({ seconds: 86401, filter: openFilter })).toBeNull()
    expect(
      planetSearchRequestLines({ seconds: 60, filter: { ...openFilter, biome: 'Cheese' } })
    ).toBeNull()
    expect(isPlanetSearchRequest({ seconds: 60 })).toBe(false)
    expect(isPlanetSearchRequest({ seconds: 60, filter: { ...openFilter, storms: 7 } })).toBe(false)
  })

  it('names a grass colour by its hue', () => {
    expect(grassHue('3FA95C')).toBe('green')
    expect(grassHue('2060E0')).toBe('blue')
    expect(grassHue('E02020')).toBe('red')
    expect(grassHue('E0C020')).toBe('yellow')
    expect(grassHue('A030D0')).toBe('purple')
    expect(grassHue('E040B0')).toBe('pink')
    expect(grassHue('20C0B0')).toBe('teal')
    expect(grassHue('E08020')).toBe('orange')
    expect(grassHue('F0F0F0')).toBe('pale')
    expect(grassHue('nothex')).toBeNull()
  })
})
