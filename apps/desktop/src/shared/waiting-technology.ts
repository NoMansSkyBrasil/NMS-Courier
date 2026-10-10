// Technologies that sit in an inventory still waiting for their components, as the bridge lists
// them (runtime/native/asi/profile_180836/technology_install.h, bridge 1.29.0).

export const waitingStates = [
  'waiting',
  'finished',
  'still_waiting',
  'blocked',
  'unknown_id'
] as const
export type WaitingState = (typeof waitingStates)[number]

export type WaitingSlot = {
  // The game's inventory choice: 0 to 2 exosuit, 3 multi-tool in hand, 4 to 6 a ship, 7 to 9 the
  // freighter, 10 and 11 an exocraft.
  choice: number
  // Which ship or exocraft, counted from 0; -1 where there is only one.
  owner: number
  x: number
  y: number
}

export type WaitingTechnology = WaitingSlot & {
  id: string
  state: WaitingState
}

export const inventoryGroups = ['exosuit', 'multitool', 'ship', 'freighter', 'exocraft'] as const
export type InventoryGroup = (typeof inventoryGroups)[number]

export function inventoryGroup(choice: number): InventoryGroup {
  if (choice <= 2) return 'exosuit'
  if (choice === 3) return 'multitool'
  if (choice <= 6) return 'ship'
  if (choice <= 9) return 'freighter'
  return 'exocraft'
}

// One key an inventory: the group and, for ships and exocraft, which one.
export function inventoryKey(slot: WaitingSlot): string {
  return `${inventoryGroup(slot.choice)}:${slot.owner}`
}

export type InstallReport = {
  // 'listed', 'finished' or 'not_ready', as the bridge wrote it.
  result: string
  // True when more were waiting than one answer holds.
  truncated: boolean
  entries: WaitingTechnology[]
}

// Reads the bridge's answer: "result=", "entries=", "finished=", "truncated=", then one
// "entry=<choice>,<owner>,<x>,<y>,<ID>,<state>" line for each technology.
export function parseInstallResult(text: string): InstallReport | null {
  const lines = text.split(/\r?\n/).filter((line) => line.trim())
  const result = lines.find((line) => line.startsWith('result='))?.slice(7)
  if (!result) return null
  const entries: WaitingTechnology[] = []
  for (const line of lines) {
    const match = /^entry=(\d+),(-?\d+),(\d+),(\d+),([\x21-\x7e]{1,15}),([a-z_]+)$/.exec(line)
    if (!match) continue
    const state = match[6] as WaitingState
    if (!waitingStates.includes(state)) continue
    entries.push({
      choice: Number(match[1]),
      owner: Number(match[2]),
      x: Number(match[3]),
      y: Number(match[4]),
      id: match[5],
      state
    })
  }
  return { result, truncated: lines.includes('truncated=1'), entries }
}

// What to finish: every waiting technology, or the named slots.
export type InstallRequest = { slots: WaitingSlot[] | null }

const whole = (value: unknown, low: number, high: number): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= low && value <= high

export function isInstallRequest(value: unknown): value is InstallRequest {
  if (!value || typeof value !== 'object') return false
  const slots = (value as { slots?: unknown }).slots
  if (slots === null) return true
  return (
    Array.isArray(slots) &&
    slots.length >= 1 &&
    slots.length <= 256 &&
    slots.every(
      (slot: unknown) =>
        !!slot &&
        typeof slot === 'object' &&
        whole((slot as WaitingSlot).choice, 0, 11) &&
        whole((slot as WaitingSlot).owner, -1, 11) &&
        whole((slot as WaitingSlot).x, 0, 15) &&
        whole((slot as WaitingSlot).y, 0, 15)
    )
  )
}

// The request file of the bridge: a listing, or a finish of everything or of the named slots.
export function installRequestLines(request: InstallRequest | 'list'): string[] | null {
  if (request === 'list') return ['mode=list']
  if (!isInstallRequest(request)) return null
  if (request.slots === null) return ['mode=finish', 'all=1']
  const lines = request.slots.map((slot) => `slot=${slot.choice},${slot.owner},${slot.x},${slot.y}`)
  if (new Set(lines).size !== lines.length) return null
  return ['mode=finish', ...lines]
}
