// Shape of the interface copy. Every locale resource in ./locales implements it completely, so a
// missing string is a type error instead of a silent English fallback.

export const groupIds = ['overview', 'deliver', 'unlock', 'rewards', 'library', 'system'] as const
export type GroupId = (typeof groupIds)[number]

export const sectionIds = ['obtain', 'upgrade'] as const
export type SectionId = (typeof sectionIds)[number]

export const featureIds = [
  'dashboard',
  'activity',
  'items',
  'currencies',
  'teleport',
  'planets',
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
  'words',
  'glyphs',
  'guide',
  'nexus',
  'missions',
  'standings',
  'milestones',
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
  'selection_invalid',
  'currency_data_missing'
] as const
export type DeliveryStateId = (typeof deliveryStateIds)[number]

export const deliveryOutcomeIds = ['completed', 'unknown', 'failed', 'refused'] as const
export type DeliveryOutcomeId = (typeof deliveryOutcomeIds)[number]

export type Messages = {
  app: { name: string; tagline: string }
  groups: Record<GroupId, string>
  sections: Record<SectionId, string>
  corvette: Record<
    | 'title'
    | 'hint'
    | 'none'
    | 'current'
    | 'parts'
    | 'hullParts'
    | 'missing'
    | 'partCockpit'
    | 'partLandingGear'
    | 'partHabitation'
    | 'partReactor'
    | 'rejectedTitle'
    | 'rejectedShip'
    | 'rejectedInvalid'
    | 'installedTitle'
    | 'installedBody'
    | 'installFailedTitle'
    | 'installFailed'
    | 'choose'
    | 'install',
    string
  >
  features: Record<FeatureId, { title: string; summary: string }>
  status: Record<StatusId, string>
  statusHint: Record<StatusId, string>
  scope: Record<ScopeId, string>
  scopeHint: Record<ScopeId, string>
  rows: Record<RowId, string>
  rules: Record<RuleId, string>
  page: {
    errorTitle: string
    errorReload: string
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
    heroBody: string
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
    notifications: string
    notificationsHint: string
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
    shipModel: Record<
      'fighter' | 'hauler' | 'explorer' | 'shuttle' | 'solar' | 'exotic' | 'living' | 'interceptor',
      string
    >
    toolModel: Record<'pistol' | 'rifle' | 'experimental' | 'alien' | 'staff', string>
    equipSeedHint: string
    obtainAction: string
    obtainShipHint: string
    obtainToolHint: string
    obtainPlanned: string
    equipSceneEmpty: string
    freighterModel: Record<'default' | 'regular' | 'small' | 'tiny' | 'capital' | 'pirate', string>
    equipScene: string
    equipSceneHint: string
    equipModelSeed: string
    equipLegacyColours: string
    equipLegacyColoursHint: string
    equipHomeSeed: string
    currencyAmountHint: string
    itemsStack: string
    equipActionLabel: string
    equipTarget: string
    equipTargetCurrent: string
    equipTargetSlot: string
    equipClass: string
    equipSlots: string
    equipSlotsHint: string
    equipToolSlots: string
    equipToolSlotsHint: string
    equipSupercharge: string
    equipSuperchargeHint: string
    equipExtended: string
    equipExtendedHint: string
    currencyHint: string
    currencyLabel: string
    equipAction: Record<'grid' | 'classStep' | 'slotReward' | 'offer' | 'build', string>
    equipActionHint: Record<'grid' | 'classStep' | 'slotReward' | 'offer' | 'build', string>
    currencyName: Record<'units' | 'nanites' | 'quicksilver', string>
    itemsTitle: string
    itemsHint: string
    itemsAdd: string
    itemsAmount: string
    itemsRemove: string
    itemsEmpty: string
    itemsAction: string
    itemsConfirm: string
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
    versionApp: string
    versionBridge: string
    versionNone: string
    versionOld: string
    versionCurrent: string
    versionOutdated: string
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
  words: {
    hint: string
    word: string
    id: string
    marked: string
    raceAll: string
    race: Record<'Traders' | 'Warriors' | 'Explorers' | 'Atlas' | 'Builders', string>
  }
  planets: {
    title: string
    hint: string
    scopeTitle: string
    scope: string
    presetEarth: string
    presetAll: string
    presetHint: string
    biome: string
    variant: string
    variantEarth: string
    storms: string
    sentinels: string
    race: string
    raceNone: string
    perSystem: string
    perSystemOption: string
    perSystemOne: string
    system: string
    systemLawful: string
    systemPirate: string
    pirate: string
    economy: Record<
      | 'Mining'
      | 'HighTech'
      | 'Trading'
      | 'Manufacturing'
      | 'Fusion'
      | 'Scientific'
      | 'PowerGeneration',
      string
    >
    extreme: string
    extremeHint: string
    extremeYes: string
    any: string
    search: string
    found: string
    inSystem: string
    copy: string
    copied: string
    save: string
    saved: string
    travel: string
    confirm: string
    empty: string
    biomes: Record<
      | 'Lush'
      | 'Toxic'
      | 'Scorched'
      | 'Radioactive'
      | 'Frozen'
      | 'Barren'
      | 'Dead'
      | 'Weird'
      | 'Swamp'
      | 'Lava'
      | 'Red'
      | 'Green'
      | 'Blue'
      | 'Waterworld'
      | 'GasGiant',
      string
    >
    variants: Record<
      | 'standard'
      | 'highQuality'
      | 'jungle'
      | 'worlds'
      | 'giant'
      | 'floral'
      | 'rocky'
      | 'tentacles'
      | 'bubbles'
      | 'variant'
      | 'swamp'
      | 'lava'
      | 'ruins'
      | 'infested'
      | 'shapes'
      | 'remix'
      | 'none',
      string
    >
    stormLimit: Record<'None' | 'Low' | 'High' | 'Always', string>
    stormLevels: Record<'None' | 'Low' | 'High' | 'Always', string>
    sentinelLimit: Record<'Low' | 'Default' | 'Aggressive' | 'Corrupt', string>
    sentinelLevels: Record<'Low' | 'Default' | 'Aggressive' | 'Corrupt', string>
  }
  missions: {
    warningTitle: string
    warning: string
    search: string
    untitled: string
    untitledHint: string
    untitledGroup: string
    section: Record<'story' | 'atlas' | 'secondary' | 'guide' | 'seasonal', string>
    part: string
    after: string
    silent: string
    quests: string
    count: string
    stages: string
    rewards: string
    chosen: string
    action: string
    actionChosen: string
  }
  levels: {
    hint: Record<'standings' | 'milestones', string>
    mode: string
    modeOne: string
    modeSome: string
    modeAll: string
    modeHint: string
    messageHint: string
    announce: string
    announceHint: string
    message: Record<'full' | 'quick' | 'silent', string>
    count: string
    countHint: string
    action: string
    actionChosen: string
  }
  glyphs: {
    hint: string
    order: string
    all: string
    allHint: string
    count: string
    countHint: string
    action: string
  }
  teleport: {
    hint: string
    galaxy: string
    galaxyHint: string
    galaxyNumber: string
    galaxyEmpty: string
    address: string
    addressHint: string
    erase: string
    destination: string
    destinationHint: string
    toStation: string
    toPlanet: string
    action: string
    confirmBody: string
    favourites: string
    favouritesHint: string
    favouriteName: string
    addFavourite: string
    useFavourite: string
    removeFavourite: string
    noFavourites: string
  }
  workshop: {
    title: string
    description: string
    tabBuild: string
    tabView: string
    buildDescription: string
    viewDescription: string
    colorTitle: string
    roles: Record<'primary' | 'secondary' | 'decal1' | 'decal2', string>
    texturesTitle: string
    baseTexture: Record<'COATING' | 'PAINTED' | 'PANELS', string>
    seedTexturesTitle: string
    colorHint: string
    seedColorsTitle: string
    paintLabel: string
    undercoatLabel: string
    tabSystem: string
    systemDescription: string
    systemNone: string
    systemSeed: string
    systemShips: string
    systemClass: string
    systemRole: string
    systemShipSeed: string
    systemView: string
    systemRefresh: string
    systemClassNumber: string
    systemStream: string
    systemStreamUnknown: string
    tabFile: string
    categoryLabel: string
    category: Record<'starship' | 'multitool' | 'freighter', string>
    kindLabel: string
    toolKind: Record<
      | 'standard'
      | 'royal'
      | 'sentinel'
      | 'sentinelB'
      | 'atlas'
      | 'staff'
      | 'atlasSceptre'
      | 'staffRuin'
      | 'staffBone'
      | 'staffNpc'
      | 'switch'
      | 'retro'
      | 'swarm',
      string
    >
    seedLabel: string
    homeSeedHint: string
    homeAddress: string
    glyphsLabel: string
    galaxyLabel: string
    useAddress: string
    legacyColours: string
    legacyColoursHint: string
    seedOrigin: string
    seedHint: string
    show: string
    generate: string
    generateWithParts: string
    clearParts: string
    getInGame: string
    found: string
    building: string
    empty: string
    partsTitle: string
    partsHint: string
    anyPart: string
    rare: string
    detailsTitle: string
    note: string
    errors: Record<import('../../../shared/model-workshop').WorkshopFailure, string>
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
