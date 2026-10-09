// The number stream a star system is generated with, and the ship seeds it yields.
//
// The game seeds a generator with the system's seed (its address) and takes every ship of the
// system as a "child seed": two steps of the generator mixed by a fixed finalizer. This was read
// in the executable and then confirmed on a live reading of build 180836 (docs/SEED_ORIGINS.md):
// all fifty ship seeds of a system were consecutive child seeds, and walking the stream back
// from the first one reached the system seed's initial state after 302 steps. A second system
// gave 447: the number of steps before the ships differs per system.

const multiplier = 0x5a76f899n
const mask32 = 0xffffffffn
const mask64 = (1n << 64n) - 1n
const mixA = 0x64dd81482cbd31d7n
const mixB = 0xe36aa5c613612997n
// Inverses of the two odd multipliers modulo 2^64.
const unmixA = modularInverse(mixA)
const unmixB = modularInverse(mixB)

type State = [bigint, bigint]

function modularInverse(value: bigint): bigint {
  // Newton iteration; five rounds are enough for 64 bits.
  let inverse = value
  for (let round = 0; round < 6; round += 1) {
    inverse = (inverse * (2n - value * inverse)) & mask64
  }
  return inverse
}

function initialState(seed: bigint): State {
  const low = seed & mask32
  const rotated = ((low >> 16n) | (low << 16n)) & mask32
  return [low || 1n, rotated ^ (seed >> 32n) ^ low]
}

function step([low, carry]: State): State {
  const product = low * multiplier + carry
  return [product & mask32, product >> 32n]
}

// The state one step earlier. Valid for every state that is itself the result of a step.
function stepBack([low, carry]: State): State {
  const whole = low + (carry << 32n)
  return [whole / multiplier, whole % multiplier]
}

function childOf(first: bigint, second: bigint): bigint {
  let value = (second << 32n) | first
  value = ((value ^ (value >> 33n)) * mixA) & mask64
  value = ((value ^ (value >> 33n)) * mixB) & mask64
  return value ^ (value >> 33n)
}

// The stream state right before the two steps that produced a child seed.
function stateBefore(child: bigint): State {
  let value = child ^ (child >> 33n)
  value = (value * unmixB) & mask64
  value ^= value >> 33n
  value = (value * unmixA) & mask64
  value ^= value >> 33n
  const first = value & mask32
  const second = value >> 32n
  // The carry between the two steps follows from the two results.
  const carry = (second - first * multiplier) & mask32
  return stepBack([first, carry])
}

export type SeedOrigin = { systemSeed: string; steps: number }

// The star systems whose stream yields `seed` as a child seed within `limit` steps, nearest
// first: the stream is walked backwards and every state that is the initial state of an address
// is kept. A seed the game did not draw from a system usually has none; a random seed has a
// false one about once in eight at 3,000 steps, so a result is a lead and not a proof. The
// method is that of NMS Shipwright's locate.py (MIT licence, Shikhar Tiwari).
export function originsOfSeed(seed: string, limit = 3000): SeedOrigin[] {
  let value = BigInt(seed)
  value ^= value >> 33n
  value = (value * unmixB) & mask64
  value ^= value >> 33n
  value = (value * unmixA) & mask64
  value ^= value >> 33n
  const first = value & mask32
  const carry = ((value >> 32n) - first * multiplier) & mask32
  if (carry > multiplier) return []
  let state: State = [first, carry]
  const origins: SeedOrigin[] = []
  for (let steps = 0; steps < limit; steps += 1) {
    const whole = (state[1] << 32n) | state[0]
    const low = whole / multiplier
    const rest = whole % multiplier
    // An initial state may hold a carry at or above the multiplier, which a division does not
    // give back: the neighbouring splits of the same number are tried too.
    for (let shift = 0n; shift < 3n; shift += 1n) {
      const candidateLow = low - shift
      const candidateCarry = rest + shift * multiplier
      if (candidateLow < 0n || candidateCarry > mask32) break
      // A low word of 1 also stands for an address whose low word is 0.
      for (const addressLow of candidateLow === 1n ? [1n, 0n] : [candidateLow]) {
        const rotated = ((addressLow >> 16n) | (addressLow << 16n)) & mask32
        const address = ((candidateCarry ^ rotated ^ addressLow) << 32n) | addressLow
        if (address >> 52n === 0n && ((address >> 40n) & 0xfffn) < 0x300n) {
          origins.push({
            systemSeed: '0x' + address.toString(16).toUpperCase().padStart(16, '0'),
            steps
          })
        }
      }
    }
    state = [low, rest]
  }
  return origins
}

// The child seeds a system's stream yields from a position on: `count` seeds, the first taken
// after `stepsBefore` steps.
export function childSeedsOfSystem(
  systemSeed: string,
  stepsBefore: number,
  count: number
): string[] {
  let state = initialState(BigInt(systemSeed))
  for (let index = 0; index < stepsBefore; index += 1) state = step(state)
  const seeds: string[] = []
  for (let index = 0; index < count; index += 1) {
    const first = step(state)
    state = step(first)
    seeds.push('0x' + childOf(first[0], state[0]).toString(16).toUpperCase().padStart(16, '0'))
  }
  return seeds
}

// How many steps the system's stream takes before the child seed `shipSeed` is drawn; null when
// that seed is not on the stream within `limit` steps.
export function stepsBeforeChildSeed(
  systemSeed: string,
  shipSeed: string,
  limit = 100_000
): number | null {
  const start = initialState(BigInt(systemSeed))
  let state = stateBefore(BigInt(shipSeed))
  for (let steps = 0; steps <= limit; steps += 1) {
    if (state[0] === start[0] && state[1] === start[1]) return steps
    // A carry at or above the multiplier cannot come from a step: this is not the stream.
    if (state[1] >= multiplier) return null
    state = stepBack(state)
  }
  return null
}
