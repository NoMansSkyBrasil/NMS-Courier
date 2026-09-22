import { contextBridge, ipcRenderer } from 'electron'

const nms = {
  getFoundationStatus: (): Promise<{
    apiVersion: string
    runtime: 'bundled' | 'unavailable'
    runtimeVersion: string | null
  }> => ipcRenderer.invoke('nms:get-foundation-status'),
  getCatalogStatus: () => ipcRenderer.invoke('nms:get-catalog-status'),
  getInstallationStatus: () => ipcRenderer.invoke('nms:get-installation-status'),
  getGameStatus: () => ipcRenderer.invoke('nms:get-game-status'),
  selectInstallation: () => ipcRenderer.invoke('nms:select-installation'),
  searchCatalog: (request: {
    query: string
    locale: string
    domain?: 'substance' | 'product' | 'technology'
    limit: number
  }) => ipcRenderer.invoke('nms:search-catalog', request)
}

contextBridge.exposeInMainWorld('nms', nms)
