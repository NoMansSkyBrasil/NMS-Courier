export {}

declare global {
  interface Window {
    nms: {
      getFoundationStatus: () => Promise<{
        apiVersion: string
        runtime: 'not-connected'
      }>
    }
  }
}
