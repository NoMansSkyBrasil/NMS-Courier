import { planetSearchRequestLines, type PlanetSearchRequest } from '../../shared/planet-search'
import type { DeliveryPlan } from './delivery-plan'

// The search around the player (bridge 1.30.0,
// runtime/native/asi/profile_180836/planet_search.h). The bridge asks the game's own generators
// for the systems around the one the player is in, a few milliseconds every frame, and keeps
// writing what it found to its result file, which the application reads while the search runs.
// Nothing in the game or in a save changes, so no backup is made for it.

export const planetSearchResultName = 'planets-result'

export function getPlanetSearchPlan(request: PlanetSearchRequest | 'stop'): DeliveryPlan | null {
  const lines = planetSearchRequestLines(request)
  if (!lines) return null
  return {
    changesAccount: false,
    steps: [
      {
        label: request === 'stop' ? 'planets-stop' : 'planets-start',
        request: { name: 'planets-request', perProcess: true, lines },
        signals: ['planets'],
        result: { name: planetSearchResultName, seconds: 12 },
        // A start is taken once the bridge says the search runs; not_ready means no star system
        // is loaded. A stop is answered with whatever state the search ended in.
        accept: (answer) => request === 'stop' || answer.includes('result=running')
      }
    ]
  }
}
