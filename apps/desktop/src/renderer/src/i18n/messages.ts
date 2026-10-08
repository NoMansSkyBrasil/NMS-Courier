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
  'backup_failed',
  'selection_invalid'
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
    selectTitle: string
    selectHint: string
    selectSearch: string
    selectAllShown: string
    selectClear: string
    selectCount: string
    selectShowing: string
    selectAction: string
    selectNoCatalog: string
    selectNone: string
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
  bridgePage: {
    detect: string
    detecting: string
    detectNone: string
    detectSeveral: string
    installationTitle: string
    installationSelected: string
    installationNone: string
    installationInvalid: string
    select: string
    verifying: string
    bridgeTitle: string
    bridgeHint: string
    diagnosticsTitle: string
    diagnosticsHint: string
    connect: string
    starting: string
    diagNotConnected: string
    diagHostReady: string
    diagAuthenticated: string
    diagCallbackReady: string
    diagFailed: string
    diagEnded: string
  }
  catalogPage: {
    generate: string
    refresh: string
    generating: string
    generateHint: string
    imported: string
    failInstallation: string
    failArchives: string
    failStructure: string
    failUnreadable: string
    unavailableTitle: string
    unavailableBody: string
    title: string
    description: string
    buildBadge: string
    searchLabel: string
    searchPlaceholder: string
    all: string
    substance: string
    product: string
    technology: string
    matching: string
    loading: string
    languages: string
  }
  preview: {
    title: string
    description: string
    stage: string
    import: string
    loading: string
    empty: string
    hint: string
    limits: string
    warning: string
    parts: string
    all: string
    none: string
    filter: string
    tint: string
    original: string
    reset: string
    palettes: string
    paletteHelp: string
    importPalette: string
    seed: string
    calculatePalette: string
    calculatedSeed: string
    family: string
    samples: string
    sample: string
    paletteIndex: string
    colorTarget: string
    visibleTarget: string
    applyColor: string
    paletteWarning: string
    INVALID_PALETTE: string
    INVALID_SEED: string
    PALETTE_UNAVAILABLE: string
    failed: string
    INVALID_MODEL: string
    UNSUPPORTED_MODEL: string
    FILE_UNAVAILABLE: string
  }
  appearance: {
    title: string
    open: string
    apply: string
    help: string
    warning: string
    mismatch: string
    failed: string
    seed: string
    applied: string
    candidate: string
  }
  controls: {
    changeLanguage: string
    changeTheme: string
    light: string
    dark: string
    system: string
  }
}
