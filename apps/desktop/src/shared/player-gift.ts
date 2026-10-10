// Items handed to another player of the session, as the bridge takes and answers the request
// (runtime/native/asi/profile_180836/player_gift.h, bridge 1.35.0).

export const giftSlotCount = 36
export const giftAmountLimit = 9999

export const giftResults = [
  'listed',
  'sent',
  'no_player',
  'player_changed',
  'unknown_id',
  'busy',
  'not_ready'
] as const
export type GiftResult = (typeof giftResults)[number]

export const giftAnswers = ['none', 'waiting', 'accepted', 'refused', 'failed'] as const
export type GiftAnswer = (typeof giftAnswers)[number]

export type SessionPlayer = {
  // Where the game keeps the player: 0 to 3 its party table, 4 to 35 its session table.
  slot: number
  party: boolean
  // The player's identifier on their platform, as the game holds it.
  user: string
}

export type GiftRequest = {
  slot: number
  user: string
  item: string
  amount: number
}

export type GiftReport = {
  result: GiftResult
  answer: GiftAnswer
  players: SessionPlayer[]
}

export function isGiftRequest(value: unknown): value is GiftRequest {
  if (typeof value !== 'object' || value === null) return false
  const request = value as Record<string, unknown>
  return (
    Number.isInteger(request.slot) &&
    (request.slot as number) >= 0 &&
    (request.slot as number) < giftSlotCount &&
    typeof request.user === 'string' &&
    /^[\x21-\x7e]{1,63}$/.test(request.user) &&
    typeof request.item === 'string' &&
    /^[A-Z0-9_]{1,15}$/.test(request.item) &&
    Number.isInteger(request.amount) &&
    (request.amount as number) >= 1 &&
    (request.amount as number) <= giftAmountLimit
  )
}

export function giftRequestLines(request: GiftRequest | 'list'): string[] | null {
  if (request === 'list') return ['mode=list']
  if (!isGiftRequest(request)) return null
  return [
    'mode=send',
    `slot=${request.slot}`,
    `user=${request.user}`,
    `item=${request.item}`,
    `amount=${request.amount}`
  ]
}

// Reads the bridge's answer: "result=", "answer=", then one "player=<slot>,<party|session>,<user>"
// line for each player. A player in both tables is kept once, from the party table.
export function parseGiftResult(text: string): GiftReport | null {
  const lines = text.split(/\r?\n/).filter((line) => line.trim())
  const result = lines.find((line) => line.startsWith('result='))?.slice(7) as GiftResult
  const answer = lines.find((line) => line.startsWith('answer='))?.slice(7) as GiftAnswer
  if (!giftResults.includes(result) || !giftAnswers.includes(answer)) return null
  const players: SessionPlayer[] = []
  for (const line of lines) {
    const match = /^player=(\d+),(party|session),([\x21-\x7e]{1,63})$/.exec(line)
    if (!match) continue
    const slot = Number(match[1])
    if (slot >= giftSlotCount || players.some((player) => player.user === match[3])) continue
    players.push({ slot, party: match[2] === 'party', user: match[3] })
  }
  return { result, answer, players }
}
