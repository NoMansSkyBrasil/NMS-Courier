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
// and start the game's corvette build mode. slotReward: the game's own reward for one more
// inventory slot, which opens the game's window to place it.
export const equipmentActions: Readonly<Record<EquipmentArea, readonly string[]>> = {
  exosuit: ['grid', 'slotReward'],
  starships: ['offer', 'grid', 'classStep', 'slotReward'],
  multitools: ['offer', 'grid', 'classStep', 'slotReward'],
  freighters: ['offer', 'slotReward'],
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
  // A new starship or multi-tool: the kind. Its seed is `modelSeed`; empty draws a random one.
  model: string
  // Freighter offer only, each optional: the game scene of the model and the two seeds.
  scene: string
  modelSeed: string
  homeSeed: string
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
    typeof request.shipIndex === 'number' &&
    typeof request.model === 'string' &&
    typeof request.scene === 'string' &&
    typeof request.modelSeed === 'string' &&
    typeof request.homeSeed === 'string'
  )
}

export const shipModels = ['fighter', 'hauler', 'explorer', 'shuttle', 'solar'] as const
export const multitoolModels = ['pistol', 'rifle', 'experimental', 'alien', 'staff'] as const

// A new starship or multi-tool of a kind, seed and class: the bridge writes them into its own reward
// table entry and the game shows its offer screen. `randomSeed` supplies the seed when none is given.
function obtain(
  label: string,
  kind: 'ship' | 'weapon',
  models: readonly string[],
  request: EquipmentRequest,
  randomSeed: () => string
): DeliveryPlan | null {
  const seed = request.modelSeed || randomSeed()
  if (!models.includes(request.model) || !classes.includes(request.itemClass)) return null
  if (!/^0x[0-9A-Fa-f]{1,16}$/.test(seed) || /^0x0+$/.test(seed)) return null
  return {
    changesAccount: false,
    steps: [
      {
        label,
        request: {
          name: `${kind}-request`,
          perProcess: true,
          lines: [
            `model=${request.model}`,
            `seed=0x${seed.slice(2).toUpperCase()}`,
            `class=${request.itemClass.toLowerCase()}`
          ]
        },
        signals: [kind],
        result: { name: `${kind}-result`, seconds: 12 },
        accept: (lines) => lines.includes('result=offered')
      }
    ]
  }
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

const scenePattern = /^MODELS\/[A-Z0-9_/.]{12,100}\.SCENE\.MBIN$/
const seedPattern = /^0x[0-9A-Fa-f]{1,16}$/

// The model and seeds of a freighter offer, as request lines; null when one is malformed.
function freighterModel(request: EquipmentRequest): string[] | null {
  const lines: string[] = []
  if (request.scene) {
    if (!scenePattern.test(request.scene)) return null
    lines.push(`scene=${request.scene}`)
  }
  for (const [name, seed] of [
    ['model_seed', request.modelSeed],
    ['home_seed', request.homeSeed]
  ]) {
    if (!seed) continue
    if (!seedPattern.test(seed)) return null
    lines.push(`${name}=0x${seed.slice(2).toUpperCase()}`)
  }
  return lines
}

// Class and grid options for the next offer or build, then the request that starts it.
function offer(
  label: string,
  start: string,
  request: EquipmentRequest,
  model: readonly string[] = []
): DeliveryPlan | null {
  if (!classes.includes(request.itemClass)) return null
  return {
    changesAccount: false,
    steps: [
      {
        label,
        ...(model.length
          ? { request: { name: 'freighter-request', perProcess: true, lines: model } }
          : {}),
        signals: [
          ...(model.length ? ['model'] : []),
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

const drawSeed = (): string =>
  `0x${[...crypto.getRandomValues(new Uint8Array(8))].map((byte) => byte.toString(16).padStart(2, '0')).join('')}`

export function getEquipmentPlan(
  request: EquipmentRequest,
  randomSeed: () => string = drawSeed
): DeliveryPlan | null {
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
    case 'starships:offer':
      return obtain('starship', 'ship', shipModels, request, randomSeed)
    case 'multitools:offer':
      return obtain('multitool', 'weapon', multitoolModels, request, randomSeed)
    case 'starships:classStep':
      return shippedReward('starship', 'R_SHIPUPGRADE')
    case 'multitools:grid':
      return owned('multitool', 'equipped-weapon', 0, request)
    case 'multitools:classStep':
      return shippedReward('multitool', 'R_WEAP_UPGRADE')
    case 'freighters:offer': {
      const model = freighterModel(request)
      return model ? offer('freighter', 'dispatch', request, model) : null
    }
    case 'exosuit:slotReward':
      return shippedReward('exosuit', 'RS_INV_SLOT')
    case 'starships:slotReward':
      return shippedReward('starship', 'R_SHIPSLOT_CASH')
    case 'multitools:slotReward':
      return shippedReward('multitool', 'R_WEAPSLOT_CASH')
    case 'freighters:slotReward':
      return shippedReward('freighter', 'R_FREIGHTSLOT')
    case 'corvettes:build':
      return offer('corvette', 'corvette', request)
    default:
      return null
  }
}
