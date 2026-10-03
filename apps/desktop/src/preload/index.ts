import { contextBridge, ipcRenderer } from 'electron'

const nms = {
  selectPreviewModel: () => ipcRenderer.invoke('nms:select-preview-model'),
  selectPreviewPalettes: () => ipcRenderer.invoke('nms:select-preview-palettes'),
  previewPaletteSeed: (seed: string) => ipcRenderer.invoke('nms:preview-palette-seed', seed),
  getFoundationStatus: (): Promise<{
    apiVersion: string
    runtime: 'bundled' | 'unavailable'
    runtimeVersion: string | null
  }> => ipcRenderer.invoke('nms:get-foundation-status'),
  getCatalogStatus: () => ipcRenderer.invoke('nms:get-catalog-status'),
  getInstallationStatus: () => ipcRenderer.invoke('nms:get-installation-status'),
  getGameStatus: () => ipcRenderer.invoke('nms:get-game-status'),
  getBuildSupport: () => ipcRenderer.invoke('nms:get-build-support'),
  getRuntimeDiagnosticsStatus: () => ipcRenderer.invoke('nms:get-runtime-diagnostics-status'),
  startRuntimeDiagnostics: () => ipcRenderer.invoke('nms:start-runtime-diagnostics'),
  getDeliveryReadiness: () => ipcRenderer.invoke('nms:get-delivery-readiness'),
  selectInstallation: () => ipcRenderer.invoke('nms:select-installation'),
  searchCatalog: (request: {
    query: string
    locale: string
    domain?: 'substance' | 'product' | 'technology'
    limit: number
  }) => ipcRenderer.invoke('nms:search-catalog', request)
}

contextBridge.exposeInMainWorld('nms', nms)
