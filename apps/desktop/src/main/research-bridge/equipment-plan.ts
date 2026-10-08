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

// In place: every position of the grids usable and/or every technology slot supercharged.
function owned(
  label: string,
  target: string,
  index: number,
  request: EquipmentRequest
): DeliveryPlan | null {
  if (!request.slots && !request.supercharge) return null
  return {
    changesAccount: false,
    steps: [
      {
        label,
        request: {
          name: 'owned-request',
          perProcess: true,
          lines: [
            `target=${target}`,
            `index=${index}`,
            ...(request.slots ? ['slots=1'] : []),
            ...(request.supercharge ? ['super=1'] : [])
          ]
        },
        signals: ['owned']
      }
    ]
  }
}

// One call of a reward the game ships; only identifiers compiled into the bridge are accepted.
function shippedReward(label: string, rewardId: string): DeliveryPlan {
  return {
    changesAccount: false,
    steps: [
      {
        label,
        request: { name: 'reward-request', perProcess: true, lines: [rewardId] },
        signals: ['reward'],
        dispatch: true
      }
    ]
  }
}

// Class and grid options for the next offer or build, then the request that starts it.
function offer(label: string, start: string, request: EquipmentRequest): DeliveryPlan | null {
  if (!classes.includes(request.itemClass)) return null
  return {
    changesAccount: false,
    steps: [
      {
        label,
        signals: [
          request.itemClass.toLowerCase(),
          ...(request.slots ? ['slots'] : []),
          ...(request.slots && request.extendedTechnology ? ['techrows'] : []),
          ...(request.supercharge ? ['super'] : []),
          start
        ],
        dispatch: true
      }
    ]
  }
}

export function getEquipmentPlan(request: EquipmentRequest): DeliveryPlan | null {
  if (!equipmentActions[request.area].includes(request.action)) return null
  switch (`${request.area}:${request.action}`) {
    case 'exosuit:grid':
      return owned('exosuit', 'suit', 0, request)
    case 'starships:grid': {
      const index = request.shipIndex
      if (!Number.isInteger(index) || index < -1 || index > 11) return null
      return index >= 0
        ? owned('starship', 'ship', index, request)
        : owned('starship', 'primary-ship', 0, request)
    }
    case 'starships:classStep':
      return shippedReward('starship', 'R_SHIPUPGRADE')
    case 'multitools:grid':
      return owned('multitool', 'equipped-weapon', 0, request)
    case 'multitools:classStep':
      return shippedReward('multitool', 'R_WEAP_UPGRADE')
    case 'freighters:offer':
      return offer('freighter', 'dispatch', request)
    case 'corvettes:build':
      return offer('corvette', 'corvette', request)
    default:
      return null
  }
}
