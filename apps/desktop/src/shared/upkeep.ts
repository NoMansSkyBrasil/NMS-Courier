// Upkeep of what the player owns, done by the game's own rewards (bridge 1.33.0): repairing every
// damaged technology of an inventory and recharging technologies whose charge is low.

// What a player calls an inventory, and the game's InventoryToRepair values behind each
// (Personal 0, PersonalTech 1, Ship 2, ShipTech 3, Freighter 4, Vehicle 5, Weapon 7).
export const repairGroups = {
  exosuit: [0, 1],
  ship: [2, 3],
  multitool: [7],
  freighter: [4],
  exocraft: [5]
} as const
export type RepairGroup = keyof typeof repairGroups
export const repairGroupIds = Object.keys(repairGroups) as RepairGroup[]

export function isRepairRequest(value: unknown): value is { groups: RepairGroup[] } {
  const groups = (value as { groups?: unknown } | null)?.groups
  return (
    Array.isArray(groups) &&
    groups.length >= 1 &&
    new Set(groups).size === groups.length &&
    groups.every((group) => (repairGroupIds as readonly unknown[]).includes(group))
  )
}

// The request file of the bridge for a repair.
export function repairRequestLines(groups: readonly RepairGroup[], notify: boolean): string[] {
  return [
    `silent=${notify ? 0 : 1}`,
    ...groups.flatMap((group) => repairGroups[group].map((value) => `inventory=${value}`))
  ]
}

// A recharge of every technology whose charge is under the threshold, in percent; 100 recharges
// anything that is not full.
export function isRechargeThreshold(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 100
}

export function rechargeRequestLines(threshold: number, notify: boolean): string[] {
  return [`silent=${notify ? 0 : 1}`, `threshold=${threshold}`]
}

// Recharging by itself: everything every so many minutes, and at once what falls under a fifth.
export type AutoRecharge = {
  enabled: boolean
  // 1 to 240.
  minutes: number
  // Also recharge a technology as soon as its charge is under 20%.
  whenLow: boolean
}

export const lowChargePercent = 20

export function isAutoRecharge(value: unknown): value is AutoRecharge {
  const auto = value as Partial<AutoRecharge> | null
  return (
    !!auto &&
    typeof auto.enabled === 'boolean' &&
    typeof auto.whenLow === 'boolean' &&
    typeof auto.minutes === 'number' &&
    Number.isInteger(auto.minutes) &&
    auto.minutes >= 1 &&
    auto.minutes <= 240
  )
}
