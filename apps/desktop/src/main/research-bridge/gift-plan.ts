import { giftRequestLines, type GiftRequest } from '../../shared/player-gift'
import type { DeliveryPlan } from './delivery-plan'

// Items for another player of the session (bridge 1.35.0,
// runtime/native/asi/profile_180836/player_gift.h): a listing of the players, which only reads, or
// a send, where the bridge calls the game's own remote item routine for one player. The other
// player's game creates the item; nothing changes in this player's save.

export const giftResultName = 'gift-result'

export function getGiftPlan(request: GiftRequest | 'list'): DeliveryPlan | null {
  const lines = giftRequestLines(request)
  if (!lines) return null
  const wanted = request === 'list' ? 'result=listed' : 'result=sent'
  return {
    changesAccount: false,
    steps: [
      {
        label: request === 'list' ? 'gift-list' : 'gift-send',
        request: { name: 'gift-request', perProcess: true, lines },
        signals: ['gift'],
        result: { name: giftResultName, seconds: 12 },
        // Any other result means the game's send routine was not called.
        accept: (answer) => answer.includes(wanted)
      }
    ]
  }
}
