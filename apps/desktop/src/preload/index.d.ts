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
