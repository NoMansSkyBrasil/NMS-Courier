// What the application may ask the research bridge to do, as data. The renderer names an area; this
// module turns it into fixed steps. No argument of a step ever comes from the renderer.

export const researchBridgeBuild = '180836'

// Profile DLLs the steps below were exercised against. Anything else installed is refused.
export const testedBridgeSha256: readonly string[] = [
  '6ad12b1caa2bfa94f6b4ca1bdcce0628b8d1b383cd03afa5e4056fe8324027fc'
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
