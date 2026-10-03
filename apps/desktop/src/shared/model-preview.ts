export type PreviewModel = {
  name: string
  sha256: string
  bytes: Uint8Array
}

export type PreviewImportResult =
  | { state: 'loaded'; model: PreviewModel }
  | { state: 'canceled' }
  | { state: 'failed'; reason: 'INVALID_MODEL' | 'UNSUPPORTED_MODEL' | 'FILE_UNAVAILABLE' }
