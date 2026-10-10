import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { PlanetLibraryStore } from './planet-library'
import type { FoundPlanet } from '../shared/planet-search'

const planet = (portal: string, changes: Partial<FoundPlanet> = {}): FoundPlanet => ({
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
  conflict: 'Low',
  grass: '3FA95C',
  distance: 0,
  portalOnly: false,
  flora: 'Full',
  fauna: 'Mid',
  resources: ['COPPER'],
  ...changes
})

async function store(): Promise<{ library: PlanetLibraryStore; folder: string }> {
  const folder = await mkdtemp(join(tmpdir(), 'courier-planets-'))
  return { library: new PlanetLibraryStore(join(folder, 'deep', 'planet-library.json')), folder }
}

describe('planet library', () => {
  it('keeps what searches found, by galaxy, without repeating a planet', async () => {
    const { library } = await store()
    expect(await library.read()).toEqual({ galaxies: [] })
    expect(await library.add(0, [planet('1001F769C14E'), planet('2001F769C14E')])).toBe(2)
    expect(await library.add(0, [planet('2001F769C14E', { weather: 'Clear' })])).toBe(0)
    expect(await library.add(9, [planet('1001F769C14E')])).toBe(1)
    const read = await library.read()
    expect(read.galaxies.map((entry) => [entry.galaxy, entry.planets.length])).toEqual([
      [0, 2],
      [9, 1]
    ])
  })

  it('passes planets from one player to another through a file', async () => {
    const first = await store()
    const second = await store()
    await first.library.add(3, [planet('1001F769C14E'), planet('2001F769C14E')])
    const file = join(first.folder, 'shared.json')
    expect(await first.library.exportTo(file)).toBe(2)
    await second.library.add(3, [planet('2001F769C14E')])
    expect(await second.library.importFrom(file)).toBe(1)
    expect((await second.library.read()).galaxies[0].planets).toHaveLength(2)
  })

  it('takes only planets from a file and refuses what is not one', async () => {
    const { library, folder } = await store()
    const file = join(folder, 'other.json')
    await writeFile(
      file,
      JSON.stringify({
        galaxies: { 0: [planet('1001F769C14E'), { portal: 'nope' }, 7], 999: [planet('1')], x: 1 }
      })
    )
    expect(await library.importFrom(file)).toBe(1)
    await writeFile(file, 'not json')
    expect(await library.importFrom(file)).toBeNull()
    expect(await library.importFrom(join(folder, 'missing.json'))).toBeNull()
  })
})
