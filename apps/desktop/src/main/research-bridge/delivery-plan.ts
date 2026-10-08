// What the application may ask the research bridge to do, as data. The renderer names an area; this
// module turns it into fixed steps. No argument of a step ever comes from the renderer.

export const researchBridgeBuild = '180836'
// Executable of that build, as distributed by Steam.
export const researchBridgeGameSha256 =
  '13d5060d4efb9d2a6a6b1b349bc4257231056cc2a055df4bb15d816262cc3499'

// Profile DLLs the steps below were exercised against. Anything else installed is refused.
export const testedBridgeSha256: readonly string[] = [
  '6ad12b1caa2bfa94f6b4ca1bdcce0628b8d1b383cd03afa5e4056fe8324027fc',
  // 2026-10-08: adds the item request and the notification option of product recipes. The other
  // requests are unchanged source; the item request itself has not been exercised live yet.
  '22f1637a46b8842bb9400b6594729a20a86a1ace4b18c73fd202d153fd48ac2f'
]

export const deliveryFeatureIds = [
  'technologies',
  'productRecipes',
  'buildParts',
  'refinerRecipes',
  'customisation',
  'fishing',
  'titles',
  'expeditions',
  'quicksilver',
  'twitch',
  'platform'
] as const
export type DeliveryFeatureId = (typeof deliveryFeatureIds)[number]

export type DeliveryStep = {
  // Script of runtime/native/asi/signal; its own preflight runs before anything is signaled.
  script: string
  // Constant arguments after -GameProcessId and -ExpectedDllSha256.
  args: readonly string[]
}

export type DeliveryPlan = {
  // An account change needs the user settings file in the backup as well as the save folder.
  changesAccount: boolean
  steps: readonly DeliveryStep[]
}

const keepRewards: DeliveryStep = {
  script: 'signal-account-keep-180836.ps1',
  args: ['-AllOfKind', 'twitch,platform']
}

const plans: Readonly<Record<DeliveryFeatureId, DeliveryPlan>> = {
  technologies: {
    changesAccount: false,
    steps: [{ script: 'signal-technology-180836.ps1', args: ['-All'] }]
  },
  productRecipes: {
    changesAccount: false,
    steps: [
      { script: 'signal-product-180836.ps1', args: ['-AllOfClass', 'catalogue_item'] },
      { script: 'signal-product-180836.ps1', args: ['-AllOfClass', 'catalogue_technology'] }
    ]
  },
  buildParts: {
    changesAccount: false,
    steps: [
      { script: 'signal-product-180836.ps1', args: ['-AllOfClass', 'catalogue_construction'] },
      { script: 'signal-product-180836.ps1', args: ['-AllOfClass', 'research_tree'] }
    ]
  },
  refinerRecipes: {
    changesAccount: false,
    steps: [{ script: 'signal-recipe-180836.ps1', args: ['-All'] }]
  },
  customisation: {
    changesAccount: true,
    steps: [{ script: 'signal-customisation-180836.ps1', args: ['-All'] }]
  },
  fishing: {
    changesAccount: false,
    steps: [{ script: 'signal-fish-180836.ps1', args: ['-All'] }]
  },
  titles: {
    changesAccount: true,
    steps: [{ script: 'signal-account-180836.ps1', args: ['-AllOfKind', 'title'] }]
  },
  expeditions: {
    changesAccount: true,
    steps: [{ script: 'signal-account-180836.ps1', args: ['-AllOfKind', 'season'] }]
  },
  quicksilver: {
    changesAccount: true,
    steps: [{ script: 'signal-account-180836.ps1', args: ['-AllOfKind', 'special'] }]
  },
  twitch: {
    changesAccount: true,
    steps: [{ script: 'signal-account-180836.ps1', args: ['-AllOfKind', 'twitch'] }, keepRewards]
  },
  platform: {
    changesAccount: true,
    steps: [{ script: 'signal-account-180836.ps1', args: ['-AllOfKind', 'platform'] }, keepRewards]
  }
}

// Scripts whose game routine can show the game's own notification for each entry.
const alertScripts: readonly string[] = [
  'signal-technology-180836.ps1',
  'signal-product-180836.ps1'
]

// The same plan with the game's notifications switched on where a routine has them.
export function withNotifications(plan: DeliveryPlan, notify: boolean): DeliveryPlan {
  if (!notify) return plan
  return {
    ...plan,
    steps: plan.steps.map((step) =>
      alertScripts.includes(step.script) ? { ...step, args: [...step.args, '-ShowAlert'] } : step
    )
  }
}

export type ItemRequest = { id: string; amount: number }

// Items for the exosuit cargo of the loaded slot, or null when the request is not well formed.
export function getItemPlan(items: readonly ItemRequest[]): DeliveryPlan | null {
  const ids = new Set(items.map((item) => item.id))
  if (items.length < 1 || items.length > 32 || ids.size !== items.length) return null
  const valid = items.every(
    (item) =>
      /^[A-Z0-9_]{1,15}$/.test(item.id) &&
      Number.isInteger(item.amount) &&
      item.amount >= 1 &&
      item.amount <= 999999
  )
  if (!valid) return null
  return {
    changesAccount: false,
    steps: [
      {
        script: 'signal-item-180836.ps1',
        args: ['-Item', items.map((item) => `${item.id}=${item.amount}`).join(',')]
      }
    ]
  }
}

export function isDeliveryFeatureId(value: unknown): value is DeliveryFeatureId {
  return typeof value === 'string' && (deliveryFeatureIds as readonly string[]).includes(value)
}

export function getDeliveryPlan(feature: DeliveryFeatureId): DeliveryPlan {
  return plans[feature]
}

// A script reports "No result yet" when the game did not answer in time: the outcome is unknown and
// the request must not be sent again.
export function classifyStepOutput(
  exitCode: number,
  stdout: string
): 'completed' | 'unknown' | 'failed' {
  if (exitCode !== 0) return 'failed'
  return /No result yet/i.test(stdout) ? 'unknown' : 'completed'
}

// "key=value" and "label: count" lines of a script, in order, bounded for the renderer.
export function summariseStepOutput(stdout: string): string[] {
  return stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && line.length <= 200)
    .slice(0, 60)
}
