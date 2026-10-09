import type { DeliveryPlan } from './delivery-plan'

// Portal glyphs for the loaded slot through the game's own reward (bridge 1.22.0,
// runtime/native/asi/profile_180836/rune_discover.h): all sixteen, or the next ones in the game's
// order. The game has no reward for a chosen glyph.

export type GlyphRequest = {
  // How many of the next glyphs, 1 to 16; null for all of them at once.
  count: number | null
  notify: boolean
}

export const glyphTotal = 16

export function isGlyphRequest(value: unknown): value is GlyphRequest {
  if (!value || typeof value !== 'object') return false
  const request = value as Record<string, unknown>
  return (
    (request.count === null || typeof request.count === 'number') &&
    typeof request.notify === 'boolean'
  )
}

export function getGlyphPlan(request: GlyphRequest): DeliveryPlan | null {
  const { count } = request
  if (count !== null && (!Number.isInteger(count) || count < 1 || count > glyphTotal)) return null
  return {
    changesAccount: false,
    steps: [
      {
        label: 'runes',
        request: {
          name: 'rune-request',
          perProcess: true,
          lines: [`silent=${request.notify ? 0 : 1}`, count === null ? 'all=1' : `count=${count}`]
        },
        signals: ['runes'],
        result: { name: 'rune-result', seconds: 12 },
        // unknown_reward: the game has not loaded the data file. bad_layout: nothing was called.
        accept: (lines) => lines.includes('result=given')
      }
    ]
  }
}
