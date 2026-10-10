export {}

type FoundPlanetEntry = {
  portal: string
  biome: string
  subtype: string
  weather: string
  storms: string
  extreme: boolean
  sentinels: string
  race: string
  star: string
  economy: string
  wealth: string
  conflict: string
  grass: string
  distance: number
  portalOnly: boolean
  flora: string
  fauna: string
  resources: string[]
}

type BridgeInstallState = {
  bridge: 'missing' | 'current' | 'older' | 'foreign'
  data: 'missing' | 'current' | 'older' | 'foreign'
  needed: boolean
  blocked: 'game_running' | 'foreign_file' | 'files_unavailable' | null
}

type WaitingTechnologyReport = {
  delivery: DeliveryResult
  truncated: boolean
  entries: Array<{
    choice: number
    owner: number
    x: number
    y: number
    id: string
    state: 'waiting' | 'finished' | 'still_waiting' | 'blocked' | 'unknown_id'
    name: string
  }>
}

type DeliveryResult = {
  feature: string
  outcome: 'completed' | 'unknown' | 'failed' | 'refused'
  reason: string | null
  startedAt: string
  backupPath: string | null
  steps: Array<{
    label: string
    outcome: 'completed' | 'unknown' | 'failed'
    lines: string[]
  }>
}

declare global {
  interface Window {
    nms: {
      selectPreviewModel: () => Promise<import('../shared/model-preview').PreviewImportResult>
      selectAppearanceRecipe: () => Promise<
        import('../shared/appearance-recipe').RecipeImportResult
      >
      selectPreviewPalettes: () => Promise<import('../shared/model-preview').PaletteImportResult>
      previewPaletteSeed: (
        seed: string
      ) => Promise<import('../shared/model-preview').PaletteEvaluationResult>
      workshopModel: (request: {
        category: string
        kind: string
        seed: string
        colorSeed?: string
        legacyColours?: boolean
      }) => Promise<import('../shared/model-workshop').WorkshopModelResult>
      workshopChoices: (request: {
        category: string
        kind: string
      }) => Promise<import('../shared/model-workshop').WorkshopChoicesResult>
      workshopFindSeed: (request: {
        category: string
        kind: string
        parts: import('../shared/model-workshop').WorkshopWantedPart[]
        look: import('../shared/model-workshop').WorkshopWantedLook
        legacyColours?: boolean
      }) => Promise<import('../shared/model-workshop').WorkshopSeedResult>
      workshopTexture: (path: string) => Promise<Uint8Array | null>
      getFoundationStatus: () => Promise<{
        apiVersion: string
        runtime: 'bundled' | 'unavailable'
        runtimeVersion: string | null
      }>
      getCatalogStatus: () => Promise<{
        state: 'available' | 'unavailable'
        generationId: string | null
        productVersion: string | null
        entryCount: number
        domains: { substance: number; product: number; technology: number }
        locales: string[]
      }>
      importCatalog: () => Promise<
        | { state: 'imported'; generationId: string; entryCount: number; untranslated: number }
        | {
            state: 'failed'
            reason:
              | 'installation_not_selected'
              | 'archives_missing'
              | 'unknown_structure'
              | 'unreadable'
              | 'busy'
            detail: string | null
          }
      >
      getInstallationStatus: () => Promise<{
        state: 'not_selected' | 'available' | 'invalid'
        displayName: string | null
        executableSha256: string | null
        executableSize: number | null
        reason: string | null
      }>
      getGameStatus: () => Promise<{
        state: 'installation_not_selected' | 'not_running' | 'running' | 'query_failed'
        processId: number | null
        startedAt: string | null
      }>
      getBuildSupport: () => Promise<{
        state:
          | 'installation_not_selected'
          | 'installation_invalid'
          | 'unknown'
          | 'supported'
          | 'registry_unavailable'
        buildLabel: string | null
        adapterVersion: string | null
      }>
      getRuntimeDiagnosticsStatus: () => Promise<{
        state:
          | 'not_started'
          | 'checking'
          | 'starting'
          | 'host_ready'
          | 'bridge_authenticated'
          | 'callback_ready'
          | 'failed'
          | 'ended'
        reasonCode: string | null
        processId: number | null
        buildLabel: string | null
      }>
      startRuntimeDiagnostics: () => Promise<{
        state:
          | 'not_started'
          | 'checking'
          | 'starting'
          | 'host_ready'
          | 'bridge_authenticated'
          | 'callback_ready'
          | 'failed'
          | 'ended'
        reasonCode: string | null
        processId: number | null
        buildLabel: string | null
      }>
      getDeliveryReadiness: () => Promise<{
        available: false
        reasonCode:
          | 'INSTALLATION_NOT_SELECTED'
          | 'INSTALLATION_INVALID'
          | 'BUILD_NOT_SUPPORTED'
          | 'BUILD_REGISTRY_UNAVAILABLE'
          | 'GAME_NOT_RUNNING'
          | 'GAME_STATUS_UNAVAILABLE'
          | 'RUNTIME_BUNDLE_INVALID'
          | 'ACTION_NOT_IMPLEMENTED'
      }>
      selectInstallation: () => Promise<{
        state: 'not_selected' | 'available' | 'invalid'
        displayName: string | null
        executableSha256: string | null
        executableSize: number | null
        reason: string | null
      }>
      detectInstallation: () => Promise<{
        status: {
          state: 'not_selected' | 'available' | 'invalid'
          displayName: string | null
          executableSha256: string | null
          executableSize: number | null
          reason: string | null
        }
        found: number
      }>
      getResearchBridgeStatus: () => Promise<{
        state:
          | 'unavailable'
          | 'installation_not_selected'
          | 'game_not_running'
          | 'bridge_missing'
          | 'bridge_untested'
          | 'ready'
        processId: number | null
        bridgeSha256: string | null
        installedBridgeVersion: string | null
        bridgeVersion: string
        appVersion: string
        install: BridgeInstallState | null
      }>
      deliver: (feature: string, chosen?: string[], notify?: boolean) => Promise<DeliveryResult>
      deliverItems: (
        items: Array<{ id: string; amount: number }>,
        notify?: boolean
      ) => Promise<DeliveryResult>
      deliverEquipment: (request: {
        area: 'exosuit' | 'starships' | 'multitools' | 'freighters' | 'corvettes'
        action: 'grid' | 'classStep' | 'slotReward' | 'offer' | 'build'
        slots: boolean
        supercharge: boolean
        extendedTechnology: boolean
        itemClass: string
        shipIndex: number
        model: string
        scene: string
        modelSeed: string
        homeSeed: string
        legacyColours?: boolean
      }) => Promise<DeliveryResult>
      deliverCurrency: (request: {
        currency: string
        amount: number
        notify: boolean
      }) => Promise<DeliveryResult>
      getGalaxyNames: (locale: string) => Promise<string[]>
      getWordRows: (
        locale: string
      ) => Promise<Array<{ id: string; text: string; groups: string[] }>>
      repairInventories: (
        request: { groups: Array<'exosuit' | 'ship' | 'multitool' | 'freighter' | 'exocraft'> },
        notify?: boolean
      ) => Promise<DeliveryResult>
      recharge: (threshold: number, notify?: boolean) => Promise<DeliveryResult>
      getAutoRecharge: () => Promise<{ enabled: boolean; minutes: number; whenLow: boolean }>
      setAutoRecharge: (next: {
        enabled: boolean
        minutes: number
        whenLow: boolean
      }) => Promise<{ enabled: boolean; minutes: number; whenLow: boolean }>
      setRewardTrace: (on: boolean) => Promise<DeliveryResult>
      getRewardTrace: () => Promise<string[]>
      getPlanetLibrary: () => Promise<{
        galaxies: Array<{ galaxy: number; planets: FoundPlanetEntry[] }>
      }>
      exportPlanetLibrary: () => Promise<number | null>
      importPlanetLibrary: () => Promise<{
        state: 'cancelled' | 'invalid' | 'imported'
        added: number
      }>
      getSubstanceNames: (locale: string) => Promise<Record<string, string>>
      getMissions: (locale: string) => Promise<
        Array<{
          id: string
          title: string
          subtitle: string
          quest: string
          questTitle: string
          table: string
          kind: string
          stages: number
          rewards: string[]
          after: string[]
          announced: boolean
        }>
      >
      getLevelStats: (
        page: 'standings' | 'milestones',
        locale: string
      ) => Promise<
        Array<{
          id: string
          name: string
          group: string
          levels: number[]
          message: 'full' | 'quick' | 'silent'
        }>
      >
      raiseLevels: (request: {
        page: 'standings' | 'milestones'
        stats: string[] | null
        levels: number
        announce: boolean
        notify: boolean
      }) => Promise<DeliveryResult>
      discoverGlyphs: (request: {
        count: number | null
        notify: boolean
      }) => Promise<DeliveryResult>
      installBridge: () => Promise<BridgeInstallState | null>
      startPlanetSearch: (request: {
        seconds: number
        filter: {
          biome: string
          variant: string
          storms: number
          sentinels: number
          allowExtreme: boolean
          race: string
          system: string
          wealth: string
          dissonant: boolean
          perSystem: number
        }
      }) => Promise<DeliveryResult>
      stopPlanetSearch: () => Promise<DeliveryResult>
      getPlanetSearch: () => Promise<{
        state: 'running' | 'done' | 'stopped' | 'travelled' | 'failed' | 'not_ready'
        galaxy: number
        regions: number
        systems: number
        planets: number
        distance: number
        elapsedMilliseconds: number
        entries: FoundPlanetEntry[]
      } | null>
      getSavesOverview: () => Promise<{
        slots: Array<{ slot: number; lastSaved: string }>
        backups: Array<{ name: string; createdAt: string | null; feature: string }>
        backupCount: number
      }>
      openBackupsFolder: () => Promise<boolean>
      listWaitingTechnologies: (locale: string) => Promise<WaitingTechnologyReport>
      finishTechnologies: (
        request: { slots: Array<{ choice: number; owner: number; x: number; y: number }> | null },
        locale: string
      ) => Promise<WaitingTechnologyReport>
      teleport: (request: {
        glyphs: string
        galaxyNumber: number
        to: 'station' | 'planet'
      }) => Promise<DeliveryResult>
      getGameIcon: (locator: string) => Promise<Uint8Array | null>
      chooseCorvetteFile: () => Promise<
        | {
            state: 'corvette'
            name: string
            partCount: number
            hullPartCount: number
            hasCockpit: boolean
            hasLandingGear: boolean
            hasHabitation: boolean
            hasReactor: boolean
          }
        | { state: 'ship'; name: string }
        | { state: 'invalid'; reason: string }
        | null
      >
      installCorvetteLayout: () => Promise<
        | { state: 'installed'; name: string; partCount: number }
        | { state: 'failed'; reason: string; detail?: string }
      >
      getCorvetteLayout: () => Promise<{
        installed: { name: string; partCount: number; installedAt: string } | null
      }>
      getStarSystem: () => Promise<import('../shared/star-system').StarSystemReport>
      getStackLimits: () => Promise<{
        substanceBase: number
        substanceCap: number
        productBase: number
        productCap: number
      } | null>
      getDeliveryOptions: (
        feature: string,
        locale: string
      ) => Promise<Array<{ id: string; group: string; name: string; icon: string | null }>>
      getDeliveryActivity: () => Promise<DeliveryResult[]>
      searchCatalog: (request: {
        query: string
        locale: string
        domain?: 'substance' | 'product' | 'technology'
        limit: number
      }) => Promise<{
        entries: Array<{
          entryKey: string
          gameId: string
          domain: 'substance' | 'product' | 'technology'
          category: string | null
          name: string
          subtitle: string
          description: string
          icon: string | null
          stackMultiplier: number | null
          stackSingle: boolean
        }>
        total: number
      }>
    }
  }
}
