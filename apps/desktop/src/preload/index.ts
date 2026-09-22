import { contextBridge, ipcRenderer } from 'electron'

const nms = {
  getFoundationStatus: (): Promise<{ apiVersion: string; runtime: 'not-connected' }> =>
    ipcRenderer.invoke('nms:get-foundation-status')
}

contextBridge.exposeInMainWorld('nms', nms)
