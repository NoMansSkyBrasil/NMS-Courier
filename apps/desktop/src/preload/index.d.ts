export {}

declare global {
  interface Window {
    nms: {
      getFoundationStatus: () => Promise<{
        apiVersion: string
        runtime: 'bundled' | 'unavailable'
        runtimeVersion: string | null
      }>
    }
  }
}
