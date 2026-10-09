import type { PreviewModel } from './model-preview'

// What the model workshop can show, by category and kind, and the shapes exchanged between the
// interface and the main process. Scene paths are the game's own procedural scenes
// (docs/MODEL_WORKSHOP.md lists where each was read).

export const workshopCategories = ['starship', 'multitool', 'freighter'] as const
export type WorkshopCategory = (typeof workshopCategories)[number]

const spacecraft = 'models/common/spacecraft/'
const multitool = 'models/common/weapons/multitool/'

export const workshopKinds = {
  starship: {
    fighter: spacecraft + 'fighters/fighter_proc.scene.mbin',
    hauler: spacecraft + 'dropships/dropship_proc.scene.mbin',
    explorer: spacecraft + 'scientific/scientific_proc.scene.mbin',
    shuttle: spacecraft + 'shuttle/shuttle_proc.scene.mbin',
    solar: spacecraft + 'sailship/sailship_proc.scene.mbin',
    exotic: spacecraft + 's-class/s-class_proc.scene.mbin',
    living: spacecraft + 's-class/bioparts/bioship_proc.scene.mbin',
    interceptor: spacecraft + 'sentinelship/sentinelship_proc.scene.mbin'
  },
  multitool: {
    standard: multitool + 'multitool.scene.mbin',
    royal: multitool + 'royalmultitool.scene.mbin',
    sentinel: multitool + 'sentinelmultitool.scene.mbin',
    sentinelB: multitool + 'sentinelmultitoolb.scene.mbin',
    atlas: multitool + 'atlasmultitool.scene.mbin',
    staff: multitool + 'staffmultitool.scene.mbin',
    atlasSceptre: multitool + 'staffmultitoolatlas.scene.mbin'
  },
  freighter: {
    regular: spacecraft + 'industrial/freighter_proc.scene.mbin',
    capital: spacecraft + 'industrial/capitalfreighter_proc.scene.mbin',
    small: spacecraft + 'industrial/freightersmall_proc.scene.mbin',
    tiny: spacecraft + 'industrial/freightertiny_proc.scene.mbin',
    pirate: spacecraft + 'industrial/piratefreighter.scene.mbin'
  }
} as const

export type WorkshopKind = {
  [Category in WorkshopCategory]: keyof (typeof workshopKinds)[Category]
}[WorkshopCategory]

export function workshopScene(category: string, kind: string): string | null {
  const kinds = (workshopKinds as Record<string, Record<string, string>>)[category]
  return kinds && Object.hasOwn(kinds, kind) ? kinds[kind] : null
}

// One choice the seed made: the group, the alternative chosen, the alternative it sits under and
// how deep in the model it is.
export type WorkshopPart = {
  depth: number
  parent: string
  group: string
  id: string
  alternatives: number
  rare: boolean
}

// A group the user can choose in: its alternatives, each with the groups that appear under it.
// `parent` is the alternative whose lists hold the group (empty at the top of the model).
export type WorkshopPartGroup = {
  parent: string
  group: string
  options: { id: string; rare: boolean; groups: WorkshopPartGroup[] }[]
}

// A part the user wants: the alternative `id` of `group` under `parent`.
export type WorkshopWantedPart = { parent: string; group: string; id: string }

export type WorkshopColor = [number, number, number, number]

// One colour a model takes from the game's palettes: the palette family (its number and the
// game's name for it), which of the family's samples, the colour the seed drew, and the distinct
// colours of the family to choose from.
export type WorkshopColorSlot = {
  family: number
  familyName: string
  sample: number
  color: WorkshopColor
  palette: WorkshopColor[]
}

// One texture layer of the model in which a seed chooses (for example the base layer: coating,
// painted or panels; or a decal layer: which logo): what the seed chose and what it can choose.
export type WorkshopTextureGroup = {
  layer: string
  group: string
  chosen: string
  options: string[]
}

// How one material of the model is painted: its number in the model, whether it is a decal (shown
// only where its texture is opaque), and its layers from top to bottom, each a game texture with
// the colour it is tinted to.
export type WorkshopSurface = {
  material: number
  cutout: boolean
  layers: {
    texture: string
    tint: [number, number, number] | null
    // Multiply by the tint instead of recolouring toward it.
    multiply: boolean
    // The texture's average colour when the game's files give one.
    average: [number, number, number] | null
  }[]
  // The layers of the material's second diffuse texture, laid over the first with the model's
  // second texture coordinates; empty when the material has none.
  overlay: {
    texture: string
    tint: [number, number, number] | null
    // Multiply by the tint instead of recolouring toward it.
    multiply: boolean
    // The texture's average colour when the game's files give one.
    average: [number, number, number] | null
  }[]
}

export type WorkshopFailure =
  | 'INSTALLATION_NOT_SELECTED'
  | 'UNKNOWN_KIND'
  | 'INVALID_SEED'
  | 'GAME_FILES_UNREADABLE'
  | 'MODEL_TOO_LARGE'
  | 'SEED_NOT_FOUND'

export type WorkshopModelResult =
  | {
      state: 'built'
      seed: string
      model: PreviewModel
      parts: WorkshopPart[]
      colors: WorkshopColorSlot[]
      textureGroups: WorkshopTextureGroup[]
      surfaces: WorkshopSurface[]
    }
  | { state: 'failed'; reason: WorkshopFailure }

export type WorkshopChoicesResult =
  { state: 'listed'; groups: WorkshopPartGroup[] } | { state: 'failed'; reason: WorkshopFailure }

export type WorkshopSeedResult =
  { state: 'found'; seed: string; tried: number } | { state: 'failed'; reason: WorkshopFailure }

// What the user wants of a seed besides parts: colours by family and sample, and the
// alternative of texture layers.
export type WorkshopWantedLook = {
  colors: { family: number; sample: number; color: number[] }[]
  textures: { layer: string; group: string; name: string }[]
}

// The names the five colours of a painted starship go by, by palette family and sample (read off
// a known seed, docs/MODEL_WORKSHOP.md). Paint is family 10 and undercoat family 20.
export const workshopPaintRoles = [
  { role: 'primary', family: 10, sample: 0 },
  { role: 'secondary', family: 10, sample: 3 },
  { role: 'undercoat', family: 20, sample: 0 },
  { role: 'decal1', family: 10, sample: 2 },
  { role: 'decal2', family: 10, sample: 1 }
] as const
export type WorkshopPaintRole = (typeof workshopPaintRoles)[number]['role']
