export type PreviewModel = {
  name: string
  sha256: string
  bytes: Uint8Array
}

export type PreviewImportResult =
  | { state: 'loaded'; model: PreviewModel }
  | { state: 'canceled' }
  | { state: 'failed'; reason: 'INVALID_MODEL' | 'UNSUPPORTED_MODEL' | 'FILE_UNAVAILABLE' }

export type PreviewColor = [number, number, number, number]
export type PalettePreview = {
  seed: string
  families: { name: string; colors: { index: number; lookupIndex: number; rgba: PreviewColor }[] }[]
}
export type PaletteImportResult =
  | { state: 'loaded'; name: string; sha256: string }
  | { state: 'canceled' }
  | { state: 'failed'; reason: 'INVALID_PALETTE' | 'FILE_UNAVAILABLE' }
export type PaletteEvaluationResult =
  | { state: 'calculated'; preview: PalettePreview }
  | { state: 'failed'; reason: 'INVALID_SEED' | 'PALETTE_UNAVAILABLE' }
