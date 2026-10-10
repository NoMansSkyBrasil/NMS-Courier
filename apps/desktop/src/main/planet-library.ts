import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { isFoundPlanet, type FoundPlanet } from '../shared/planet-search'

// The player's own planets: everything their searches found, kept by galaxy in one file of the
// application's data folder. The application ships no list of its own (owner decision of
// 2026-10-10); a player fills this by searching and may hand the file to another player.

export type PlanetLibrary = {
  // One entry a galaxy that has planets, galaxies counted from 0 as the game does.
  galaxies: Array<{ galaxy: number; planets: FoundPlanet[] }>
}

type Stored = { version: 1; galaxies: Record<string, FoundPlanet[]> }

const galaxyLimit = 256
// A galaxy keeps its newest planets up to this many, so the file cannot grow without end.
const planetsPerGalaxy = 20000

function clean(value: unknown): Stored {
  const stored: Stored = { version: 1, galaxies: {} }
  const galaxies = (value as { galaxies?: unknown } | null)?.galaxies
  if (!galaxies || typeof galaxies !== 'object') return stored
  for (const [key, planets] of Object.entries(galaxies as Record<string, unknown>)) {
    const galaxy = Number(key)
    if (!Number.isInteger(galaxy) || galaxy < 0 || galaxy >= galaxyLimit || !Array.isArray(planets))
      continue
    const kept = planets.filter(isFoundPlanet)
    if (kept.length > 0) stored.galaxies[String(galaxy)] = kept
  }
  return stored
}

async function load(path: string): Promise<Stored> {
  try {
    return clean(JSON.parse(await readFile(path, 'utf8')))
  } catch {
    return { version: 1, galaxies: {} }
  }
}

function view(stored: Stored): PlanetLibrary {
  return {
    galaxies: Object.entries(stored.galaxies)
      .map(([galaxy, planets]) => ({ galaxy: Number(galaxy), planets }))
      .sort((a, b) => a.galaxy - b.galaxy)
  }
}

// Adds planets to one galaxy; a planet already there (same portal address) is replaced by the
// newer reading. Returns how many were new.
function merge(stored: Stored, galaxy: number, planets: readonly FoundPlanet[]): number {
  const known = new Map(
    (stored.galaxies[String(galaxy)] ?? []).map((planet) => [planet.portal, planet])
  )
  let added = 0
  for (const planet of planets) {
    if (!known.has(planet.portal)) added += 1
    known.delete(planet.portal)
    known.set(planet.portal, planet)
  }
  const all = [...known.values()]
  if (all.length > 0) stored.galaxies[String(galaxy)] = all.slice(-planetsPerGalaxy)
  return added
}

export class PlanetLibraryStore {
  constructor(private readonly path: string) {}

  async read(): Promise<PlanetLibrary> {
    return view(await load(this.path))
  }

  // What a search found, added to the galaxy it ran in. Writes only when something is new.
  async add(galaxy: number, planets: readonly FoundPlanet[]): Promise<number> {
    if (planets.length === 0 || !Number.isInteger(galaxy) || galaxy < 0 || galaxy >= galaxyLimit)
      return 0
    const stored = await load(this.path)
    const added = merge(stored, galaxy, planets.filter(isFoundPlanet))
    if (added > 0) await this.save(stored)
    return added
  }

  // Writes every planet to a file another player can import.
  async exportTo(target: string): Promise<number> {
    const stored = await load(this.path)
    await writeFile(target, JSON.stringify(stored), 'utf8')
    return Object.values(stored.galaxies).reduce((total, planets) => total + planets.length, 0)
  }

  // Adds the planets of a file made by exportTo; anything in it that is not a planet is left out.
  // Returns how many were new, or null when the file is not such a file.
  async importFrom(source: string): Promise<number | null> {
    let incoming: Stored
    try {
      incoming = clean(JSON.parse(await readFile(source, 'utf8')))
    } catch {
      return null
    }
    const stored = await load(this.path)
    let added = 0
    for (const [galaxy, planets] of Object.entries(incoming.galaxies)) {
      added += merge(stored, Number(galaxy), planets)
    }
    if (added > 0) await this.save(stored)
    return added
  }

  private async save(stored: Stored): Promise<void> {
    await mkdir(dirname(this.path), { recursive: true })
    await writeFile(this.path, JSON.stringify(stored), 'utf8')
  }
}
