export {}

declare global {
  interface Window {
    nms: {
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
        }>
        total: number
      }>
    }
  }
}
