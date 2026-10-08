// Shape of the interface copy. Every locale resource in ./locales implements it completely, so a
// missing string is a type error instead of a silent English fallback.

export const groupIds = ['overview', 'deliver', 'unlock', 'rewards', 'library', 'system'] as const
export type GroupId = (typeof groupIds)[number]

export const featureIds = [
  'dashboard',
  'activity',
  'items',
  'currencies',
  'exosuit',
  'starships',
  'multitools',
  'freighters',
  'frigates',
  'corvettes',
  'companions',
  'technologies',
  'productRecipes',
  'buildParts',
  'refinerRecipes',
  'customisation',
  'titles',
  'fishing',
  'expeditions',
  'twitch',
  'platform',
  'quicksilver',
  'catalog',
  'models',
  'bridge',
  'saves',
  'settings'
] as const
export type FeatureId = (typeof featureIds)[number]

export const statusIds = ['verified', 'experimental', 'planned'] as const
export type StatusId = (typeof statusIds)[number]

export const scopeIds = ['slot', 'account', 'both', 'none'] as const
export type ScopeId = (typeof scopeIds)[number]

export const rowIds = [
  'deliverable',
  'blockedDamaged',
  'blockedMaintenance',
  'blockedTemplates',
  'blockedById',
  'catalogueItems',
  'craftableTechnology',
  'buildParts',
  'researchTree',
  'repeatableNever',
  'missionBound',
  'redeemedInSave',
  'itemRewards',
  'total'
] as const
export type RowId = (typeof rowIds)[number]

export const ruleIds = [
  'gameRoutines',
  'defectiveNever',
  'repeatableNever',
  'claimItems',
  'keepList',
  'backup',
  'slotIdentified',
  'accountShared'
] as const
export type RuleId = (typeof ruleIds)[number]

export const deliveryStateIds = [
  'unavailable',
  'installation_not_selected',
  'game_not_running',
  'bridge_missing',
  'bridge_untested',
  'ready',
  'busy',
  'backup_failed'
] as const
export type DeliveryStateId = (typeof deliveryStateIds)[number]

export const deliveryOutcomeIds = ['completed', 'unknown', 'failed', 'refused'] as const
export type DeliveryOutcomeId = (typeof deliveryOutcomeIds)[number]

export type Messages = {
  app: { name: string; tagline: string }
  groups: Record<GroupId, string>
  features: Record<FeatureId, { title: string; summary: string }>
  status: Record<StatusId, string>
  statusHint: Record<StatusId, string>
  scope: Record<ScopeId, string>
  scopeHint: Record<ScopeId, string>
  rows: Record<RowId, string>
  rules: Record<RuleId, string>
  page: {
    availabilityTitle: string
    availabilityBody: string
    includes: string
    includesHint: string
    rulesTitle: string
    rulesHint: string
    entries: string
    kind: string
    status: string
    scope: string
    researchBuild: string
    plannedTitle: string
    plannedBody: string
    open: string
  }
  dashboard: {
    game: string
    build: string
    bridge: string
    catalog: string
    capabilities: string
    capabilitiesHint: string
    feature: string
    area: string
    running: string
    notRunning: string
    notSelected: string
    unknown: string
    supported: string
    unsupported: string
    connected: string
    notConnected: string
    available: string
    unavailable: string
    entriesCount: string
    processId: string
  }
  settings: {
    general: string
    appearance: string
    about: string
    language: string
    languageHint: string
    theme: string
    themeHint: string
    experimental: string
    experimentalBody: string
  }
  delivery: {
    title: string
    hint: string
    action: string
    sending: string
    confirmTitle: string
    confirmSlot: string
    confirmAccount: string
    confirm: string
    cancel: string
    result: string
    backup: string
    time: string
    activityEmptyTitle: string
    activityEmptyBody: string
    state: Record<DeliveryStateId, string>
    outcome: Record<DeliveryOutcomeId, string>
    outcomeHint: Record<DeliveryOutcomeId, string>
  }
  controls: {
    changeLanguage: string
    changeTheme: string
    light: string
    dark: string
    system: string
  }
}
