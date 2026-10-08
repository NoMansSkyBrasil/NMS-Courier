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
// The paint a seed draws: five samples each, the first being the main one.
export type WorkshopPaint = { paint: WorkshopColor[]; undercoat: WorkshopColor[] }

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
      paint: WorkshopPaint | null
    }
  | { state: 'failed'; reason: WorkshopFailure }

// What can be chosen for a kind: the part groups and, where the kind is painted from the game's
// paint palette, its distinct colours.
export type WorkshopChoicesResult =
  | { state: 'listed'; groups: WorkshopPartGroup[]; paintColors: WorkshopColor[] }
  | { state: 'failed'; reason: WorkshopFailure }

export type WorkshopSeedResult =
  { state: 'found'; seed: string; tried: number } | { state: 'failed'; reason: WorkshopFailure }

// Kinds whose hull takes the paint and undercoat palettes with the model seed. Freighters take
// their colours from the star system, and the others have palettes of their own.
export function workshopPainted(category: string, kind: string): boolean {
  return (
    category === 'starship' && ['fighter', 'hauler', 'explorer', 'shuttle', 'solar'].includes(kind)
  )
}
