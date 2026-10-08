import type { DeliveryPlan } from './delivery-plan'

// Requests for things the player owns or is offered: exosuit, starship, multitool, freighter and
// corvette. The renderer sends a small description; this module turns it into the fixed arguments
// of the area's own signal script, or into nothing when the description is not one it knows.

export const equipmentAreas = [
  'exosuit',
  'starships',
  'multitools',
  'freighters',
  'corvettes'
] as const
export type EquipmentArea = (typeof equipmentAreas)[number]

// grid: make every inventory position usable, and optionally supercharge the technology slots, in
// place and without any window in the game. classStep: the game's own reward that raises the class
// by one step. offer: arm the options and start the game's freighter offer. build: arm the options
// and start the game's corvette build mode.
export const equipmentActions: Readonly<Record<EquipmentArea, readonly string[]>> = {
  exosuit: ['grid'],
  starships: ['grid', 'classStep'],
  multitools: ['grid', 'classStep'],
  freighters: ['offer'],
  corvettes: ['build']
}

export type EquipmentRequest = {
  area: EquipmentArea
  action: string
  slots: boolean
  supercharge: boolean
  extendedTechnology: boolean
  itemClass: string
  // Ship slot 0 to 11, or -1 for the ship the player is using.
  shipIndex: number
}

const classes = ['C', 'B', 'A', 'S']

export function isEquipmentRequest(value: unknown): value is EquipmentRequest {
  if (!value || typeof value !== 'object') return false
  const request = value as Record<string, unknown>
  return (
    typeof request.area === 'string' &&
    (equipmentAreas as readonly string[]).includes(request.area) &&
    typeof request.action === 'string' &&
    typeof request.slots === 'boolean' &&
    typeof request.supercharge === 'boolean' &&
    typeof request.extendedTechnology === 'boolean' &&
    typeof request.itemClass === 'string' &&
    typeof request.shipIndex === 'number'
  )
}

export function getEquipmentPlan(request: EquipmentRequest): DeliveryPlan | null {
  if (!equipmentActions[request.area].includes(request.action)) return null
  const grid = [
    ...(request.slots ? ['-Slots'] : []),
    ...(request.supercharge ? ['-Supercharge'] : [])
  ]
  const offer = (): string[] | null =>
    classes.includes(request.itemClass)
      ? [
          '-Class',
          request.itemClass,
          ...(request.slots ? ['-MaxSlots'] : []),
          ...(request.slots && request.extendedTechnology ? ['-ExtendedTechnology'] : []),
          ...(request.supercharge ? ['-Supercharge'] : [])
        ]
      : null
  const plan = (script: string, args: readonly string[] | null): DeliveryPlan | null =>
    args ? { changesAccount: false, steps: [{ script, args }] } : null

  switch (`${request.area}:${request.action}`) {
    case 'exosuit:grid':
      return plan('signal-exosuit-180836.ps1', grid.length ? grid : null)
    case 'starships:grid': {
      const index = request.shipIndex
      if (!Number.isInteger(index) || index < -1 || index > 11) return null
      return plan(
        'signal-ship-180836.ps1',
        grid.length ? [...(index >= 0 ? ['-Index', String(index)] : []), ...grid] : null
      )
    }
    case 'starships:classStep':
      return plan('signal-ship-180836.ps1', ['-DispatchReward', 'R_SHIPUPGRADE'])
    case 'multitools:grid':
      return plan('signal-multitool-180836.ps1', grid.length ? grid : null)
    case 'multitools:classStep':
      return plan('signal-multitool-180836.ps1', ['-DispatchReward', 'R_WEAP_UPGRADE'])
    case 'freighters:offer': {
      const args = offer()
      return plan('signal-freighter-180836.ps1', args && [...args, '-DispatchOffer'])
    }
    case 'corvettes:build': {
      const args = offer()
      return plan('signal-corvette-180836.ps1', args && [...args, '-DispatchBuild'])
    }
    default:
      return null
  }
}
