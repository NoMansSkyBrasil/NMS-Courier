import { contextBridge, ipcRenderer } from 'electron'

const nms = {
  getFoundationStatus: (): Promise<{
    apiVersion: string
    runtime: 'bundled' | 'unavailable'
    runtimeVersion: string | null
  }> => ipcRenderer.invoke('nms:get-foundation-status')
}

contextBridge.exposeInMainWorld('nms', nms)
