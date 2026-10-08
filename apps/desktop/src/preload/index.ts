import { contextBridge, ipcRenderer } from 'electron'

const nms = {
  selectPreviewModel: () => ipcRenderer.invoke('nms:select-preview-model'),
  selectAppearanceRecipe: () => ipcRenderer.invoke('nms:select-appearance-recipe'),
  selectPreviewPalettes: () => ipcRenderer.invoke('nms:select-preview-palettes'),
  previewPaletteSeed: (seed: string) => ipcRenderer.invoke('nms:preview-palette-seed', seed),
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
  getStackLimits: () => ipcRenderer.invoke('nms:get-stack-limits'),
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
