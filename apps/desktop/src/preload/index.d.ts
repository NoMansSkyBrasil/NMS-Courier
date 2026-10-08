export {}

type DeliveryResult = {
  feature: string
  outcome: 'completed' | 'unknown' | 'failed' | 'refused'
  reason: string | null
  startedAt: string
  backupPath: string | null
  steps: Array<{
    script: string
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
      }>
      deliver: (feature: string, chosen?: string[], notify?: boolean) => Promise<DeliveryResult>
      deliverItems: (items: Array<{ id: string; amount: number }>) => Promise<DeliveryResult>
      deliverEquipment: (request: {
        area: 'exosuit' | 'starships' | 'multitools' | 'freighters' | 'corvettes'
        action: 'grid' | 'classStep' | 'offer' | 'build'
        slots: boolean
        supercharge: boolean
        extendedTechnology: boolean
        itemClass: string
        shipIndex: number
      }) => Promise<DeliveryResult>
      deliverCurrency: (request: {
        currency: string
        amount: number
        notify: boolean
      }) => Promise<DeliveryResult>
      getGameIcon: (locator: string) => Promise<Uint8Array | null>
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
