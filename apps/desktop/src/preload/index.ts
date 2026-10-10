import { contextBridge, ipcRenderer } from 'electron'

const nms = {
  selectPreviewModel: () => ipcRenderer.invoke('nms:select-preview-model'),
  selectAppearanceRecipe: () => ipcRenderer.invoke('nms:select-appearance-recipe'),
  selectPreviewPalettes: () => ipcRenderer.invoke('nms:select-preview-palettes'),
  previewPaletteSeed: (seed: string) => ipcRenderer.invoke('nms:preview-palette-seed', seed),
  workshopModel: (request: {
    category: string
    kind: string
    seed: string
    colorSeed?: string
    legacyColours?: boolean
  }) => ipcRenderer.invoke('nms:workshop-model', request),
  workshopChoices: (request: { category: string; kind: string }) =>
    ipcRenderer.invoke('nms:workshop-choices', request),
  workshopFindSeed: (request: {
    category: string
    kind: string
    parts: Array<{ parent: string; group: string; id: string }>
    look: { colors: Record<string, number[]>; baseTexture: string | null }
    legacyColours?: boolean
  }) => ipcRenderer.invoke('nms:workshop-find-seed', request),
  workshopTexture: (path: string) => ipcRenderer.invoke('nms:workshop-texture', path),
  getFoundationStatus: (): Promise<{
    apiVersion: string
    runtime: 'bundled' | 'unavailable'
    runtimeVersion: string | null
  }> => ipcRenderer.invoke('nms:get-foundation-status'),
  getCatalogStatus: () => ipcRenderer.invoke('nms:get-catalog-status'),
  importCatalog: () => ipcRenderer.invoke('nms:import-catalog'),
  getInstallationStatus: () => ipcRenderer.invoke('nms:get-installation-status'),
  getGameStatus: () => ipcRenderer.invoke('nms:get-game-status'),
  getBuildSupport: () => ipcRenderer.invoke('nms:get-build-support'),
  getRuntimeDiagnosticsStatus: () => ipcRenderer.invoke('nms:get-runtime-diagnostics-status'),
  startRuntimeDiagnostics: () => ipcRenderer.invoke('nms:start-runtime-diagnostics'),
  getDeliveryReadiness: () => ipcRenderer.invoke('nms:get-delivery-readiness'),
  selectInstallation: () => ipcRenderer.invoke('nms:select-installation'),
  detectInstallation: () => ipcRenderer.invoke('nms:detect-installation'),
  getResearchBridgeStatus: () => ipcRenderer.invoke('nms:get-research-bridge-status'),
  deliver: (feature: string, chosen?: string[], notify?: boolean) =>
    ipcRenderer.invoke('nms:deliver', feature, chosen ?? null, notify ?? true),
  deliverEquipment: (request: unknown) => ipcRenderer.invoke('nms:deliver-equipment', request),
  deliverCurrency: (request: { currency: string; amount: number; notify: boolean }) =>
    ipcRenderer.invoke('nms:deliver-currency', request),
  getGalaxyNames: (locale: string) => ipcRenderer.invoke('nms:get-galaxy-names', locale),
  getWordRows: (locale: string) => ipcRenderer.invoke('nms:get-word-rows', locale),
  getMissions: (locale: string) => ipcRenderer.invoke('nms:get-missions', locale),
  repairInventories: (request: { groups: string[] }, notify?: boolean) =>
    ipcRenderer.invoke('nms:repair-inventories', request, notify),
  recharge: (threshold: number, notify?: boolean) =>
    ipcRenderer.invoke('nms:recharge', threshold, notify),
  getAutoRecharge: () => ipcRenderer.invoke('nms:get-auto-recharge'),
  setAutoRecharge: (next: { enabled: boolean; minutes: number; whenLow: boolean }) =>
    ipcRenderer.invoke('nms:set-auto-recharge', next),
  getPlanetLibrary: () => ipcRenderer.invoke('nms:get-planet-library'),
  exportPlanetLibrary: () => ipcRenderer.invoke('nms:export-planet-library'),
  importPlanetLibrary: () => ipcRenderer.invoke('nms:import-planet-library'),
  getSubstanceNames: (locale: string) => ipcRenderer.invoke('nms:get-substance-names', locale),
  startPlanetSearch: (request: { seconds: number; filter: Record<string, unknown> }) =>
    ipcRenderer.invoke('nms:start-planet-search', request),
  stopPlanetSearch: () => ipcRenderer.invoke('nms:stop-planet-search'),
  getPlanetSearch: () => ipcRenderer.invoke('nms:get-planet-search'),
  installBridge: () => ipcRenderer.invoke('nms:install-bridge'),
  getSavesOverview: () => ipcRenderer.invoke('nms:get-saves-overview'),
  openBackupsFolder: () => ipcRenderer.invoke('nms:open-backups-folder'),
  listWaitingTechnologies: (locale: string) =>
    ipcRenderer.invoke('nms:list-waiting-technologies', locale),
  finishTechnologies: (
    request: { slots: Array<{ choice: number; owner: number; x: number; y: number }> | null },
    locale: string
  ) => ipcRenderer.invoke('nms:finish-technologies', request, locale),
  getLevelStats: (page: 'standings' | 'milestones', locale: string) =>
    ipcRenderer.invoke('nms:get-level-stats', page, locale),
  raiseLevels: (request: {
    page: 'standings' | 'milestones'
    stats: string[] | null
    levels: number
    announce: boolean
    notify: boolean
  }) => ipcRenderer.invoke('nms:raise-levels', request),
  discoverGlyphs: (request: { count: number | null; notify: boolean }) =>
    ipcRenderer.invoke('nms:discover-glyphs', request),
  teleport: (request: { glyphs: string; galaxyNumber: number; to: 'station' | 'planet' }) =>
    ipcRenderer.invoke('nms:teleport', request),
  getStackLimits: () => ipcRenderer.invoke('nms:get-stack-limits'),
  getStarSystem: () => ipcRenderer.invoke('nms:get-star-system'),
  chooseCorvetteFile: () => ipcRenderer.invoke('nms:choose-corvette-file'),
  installCorvetteLayout: () => ipcRenderer.invoke('nms:install-corvette-layout'),
  getCorvetteLayout: () => ipcRenderer.invoke('nms:get-corvette-layout'),
  getGameIcon: (locator: string) => ipcRenderer.invoke('nms:get-game-icon', locator),
  deliverItems: (items: Array<{ id: string; amount: number }>, notify?: boolean) =>
    ipcRenderer.invoke('nms:deliver-items', items, notify ?? true),
  getDeliveryOptions: (feature: string, locale: string) =>
    ipcRenderer.invoke('nms:get-delivery-options', feature, locale),
  getDeliveryActivity: () => ipcRenderer.invoke('nms:get-delivery-activity'),
  searchCatalog: (request: {
    query: string
    locale: string
    domain?: 'substance' | 'product' | 'technology'
    limit: number
  }) => ipcRenderer.invoke('nms:search-catalog', request)
}

contextBridge.exposeInMainWorld('nms', nms)
