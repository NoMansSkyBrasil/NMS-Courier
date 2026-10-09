// The star system the player is in, as the running bridge reports it (read only): the system's
// seed and the ships the game generated for it. Ship class numbers are the game's own
// (docs/SEED_ORIGINS.md).

export type StarSystemShip = {
  index: number
  shipClass: number
  shipRole: number
  faction: number
  frigateClass: number
  seed: string
  // The game's texture hint for the ship; often empty.
  hint: string
  // The model the game uses for the ship, from its table of ship models: the record's name
  // and its scene file. Absent when the game files could not be read.
  model?: string
  scene?: string
}

export type StarSystemReport =
  | { state: 'read'; seed: string; ships: StarSystemShip[] }
  // The game is not running with a bridge that reports the system, or no system is loaded.
  | { state: 'unavailable' }

// The workshop type a ship class is shown as; null for classes the workshop has no model for.
export const workshopKindOfShipClass: Readonly<Record<number, string>> = {
  1: 'hauler',
  2: 'fighter',
  3: 'explorer',
  4: 'shuttle',
  6: 'exotic',
  7: 'living',
  8: 'solar',
  9: 'interceptor'
}

// Parses the bridge's file; anything unexpected yields "unavailable".
export function parseStarSystemReport(text: string): StarSystemReport {
  if (!/^state=read$/m.test(text)) return { state: 'unavailable' }
  const seed = /^seed=(0x[0-9A-F]{16})$/m.exec(text)?.[1]
  if (!seed) return { state: 'unavailable' }
  const ships: StarSystemShip[] = []
  const line =
    /^ship=(\d+) class=(-?\d+) role=(-?\d+) faction=(-?\d+) frigate=(-?\d+) seed=(0x[0-9A-F]{16}) hint=([\x20-\x7e]{0,32})$/gm
  for (const match of text.matchAll(line)) {
    ships.push({
      index: Number(match[1]),
      shipClass: Number(match[2]),
      shipRole: Number(match[3]),
      faction: Number(match[4]),
      frigateClass: Number(match[5]),
      seed: match[6],
      hint: match[7]
    })
    if (ships.length >= 96) break
  }
  return { state: 'read', seed, ships }
}
