import { createHash, randomBytes } from 'node:crypto'
import { workshopPainted, workshopPaintRoles, workshopScene } from '../../shared/model-workshop'
import type {
  WorkshopChoicesResult,
  WorkshopColor,
  WorkshopFailure,
  WorkshopModelResult,
  WorkshopPaint,
  WorkshopPaintRole,
  WorkshopPartGroup,
  WorkshopSeedResult,
  WorkshopSurface,
  WorkshopTextureChoice,
  WorkshopWantedPart
} from '../../shared/model-workshop'
import { validatePreviewGlb } from '../model-preview-import'
import {
  generateBasePalette,
  leadingPaletteSamples,
  paintFamily,
  readBasePalette,
  undercoatFamily
} from '../nms-adapters/base-palette-preview'
import type { Family } from '../nms-adapters/base-palette-preview'
import { ModelFileError } from './binary-table'
import type { ModelFiles } from './game-model-files'
import { partListPath, readPartList } from './part-list'
import type { PartList } from './part-list'
import { buildSceneModel, SceneModelError } from './scene-model'
import type { SceneSurface } from './scene-model'
import { nodeIncluded, optionWeight, selectParts } from './seed-part-selection'
import { readTextureList, textureListPath } from './texture-list'
import type { TextureList } from './texture-list'
import { chosenTextureName, selectTextures, texturesSupported } from './texture-selection'

// The model workshop's work in the main process: show what a seed looks like for a kind of
// starship, multi-tool or freighter, list what can be chosen for a kind, and look for a seed that
// has the parts, colours and base texture the user chose. Everything is read from the selected
// installation.

const seedPattern = /^0x[0-9a-f]{1,16}$/i
const palettePath = 'metadata/simulation/solarsystem/colours/basecolourpalettes.mbin'
// A search tries random seeds in slices, so the application stays responsive; it stops at
// whichever limit comes first.
const searchTries = 8_000_000
const searchMilliseconds = 25_000
const sliceTries = 4_000
// Budget for the tree of choices handed to the interface.
const maximumTreeGroups = 20_000
// No texture of a ship, multi-tool or freighter comes near this.
const largestTexture = 96 * 1024 * 1024
// Which of a family's five samples each paint role is.
const paintSample: Record<WorkshopPaintRole, [number, number]> = {
  primary: [paintFamily, 0],
  secondary: [paintFamily, 3],
  undercoat: [undercoatFamily, 0],
  decal1: [paintFamily, 2],
  decal2: [paintFamily, 1]
}

function failure(error: unknown): WorkshopFailure {
  if (error instanceof SceneModelError && error.reason === 'model_too_large') {
    return 'MODEL_TOO_LARGE'
  }
  if (error instanceof ModelFileError && error.reason === 'too_large') return 'MODEL_TOO_LARGE'
  return 'GAME_FILES_UNREADABLE'
}

function formatSeed(seed: bigint): string {
  return '0x' + seed.toString(16).toUpperCase().padStart(16, '0')
}

function sameColor(left: readonly number[], right: readonly number[]): boolean {
  return left[0] === right[0] && left[1] === right[1] && left[2] === right[2]
}

function distinct(colors: readonly WorkshopColor[]): WorkshopColor[] {
  const result: WorkshopColor[] = []
  for (const color of colors) {
    if (!result.some((known) => sameColor(known, color))) result.push(color)
  }
  return result
}

type Look = {
  textures: WorkshopTextureChoice[]
  surfaces: WorkshopSurface[]
  bytes: Uint8Array
}

export class ModelWorkshopService {
  private palette: Family[] | null = null
  // The newest search; an older one stops as soon as it notices.
  private search = 0
  // Textures the interface may ask for: those the last built model is painted with.
  private allowedTextures = new Set<string>()

  constructor(
    private readonly files: ModelFiles,
    private readonly installationRoot: () => string | null
  ) {}

  // Part lists by scene path for one request, so a list is read once however often it is drawn.
  private lists(): (scenePath: string) => PartList | null {
    const cache = new Map<string, PartList | null>()
    return (scenePath) => {
      const path = partListPath(scenePath)
      if (!path) return null
      if (!cache.has(path)) {
        const data = this.files.read(path)
        cache.set(path, data ? readPartList(data) : null)
      }
      return cache.get(path) ?? null
    }
  }

  private families(): Family[] | null {
    if (!this.palette) {
      const data = this.files.read(palettePath)
      this.palette = data ? readBasePalette(data) : null
    }
    return this.palette
  }

  // The paint a seed draws for a painted kind; null for the other kinds.
  private paint(category: string, kind: string, seed: bigint): WorkshopPaint | null {
    const families = workshopPainted(category, kind) ? this.families() : null
    if (!families) return null
    const rows = leadingPaletteSamples(seed, families, undercoatFamily + 1)
    const paint = {} as WorkshopPaint
    for (const role of workshopPaintRoles) {
      paint[role] = rows[paintSample[role][0]][paintSample[role][1]] as WorkshopColor
    }
    return paint
  }

  // The model of a seed with the textures the seed chooses. `tinted` is false for freighters,
  // whose colours come from the star system and not from the model seed.
  private look(
    scene: string,
    seed: bigint,
    selected: ReadonlySet<string>,
    paint: WorkshopPaint | null,
    tinted: boolean
  ): Look {
    const sceneSurfaces: SceneSurface[] = []
    const bytes = buildSceneModel(
      this.files,
      scene,
      (name) => nodeIncluded(name, selected),
      paint && { primary: paint.primary, secondary: paint.secondary, undercoat: paint.undercoat },
      null,
      sceneSurfaces
    )
    // Texture lists in the order their materials are first met while walking the model.
    const order: string[] = []
    const lists = new Map<string, TextureList>()
    for (const surface of sceneSurfaces) {
      if (!surface.diffuse) continue
      const path = textureListPath(surface.diffuse)
      if (lists.has(path) || order.includes(path)) continue
      order.push(path)
      try {
        const data = this.files.read(path)
        if (data) lists.set(path, readTextureList(data))
      } catch {
        // A list that cannot be read leaves its materials with their plain texture.
      }
    }
    const ordered = order.flatMap((path) => (lists.has(path) ? [lists.get(path)!] : []))
    const rows = texturesSupported(ordered) ? selectTextures(seed, ordered) : []
    const families = tinted ? this.families() : null
    const samples = families ? generateBasePalette(seed, families).families : null
    const surfaces: WorkshopSurface[] = []
    for (const surface of sceneSurfaces) {
      if (!surface.diffuse) continue
      const list = lists.get(textureListPath(surface.diffuse))
      const layers: WorkshopSurface['layers'] = []
      for (const layer of rows.length && list ? list.layers : []) {
        const chosen = chosenTextureName(rows, layer.name, layer.group)
        const option = layer.options.find((entry) => entry.name === chosen)
        if (!option || !option.texture.endsWith('.dds')) continue
        // The game takes sample 3 for the channels above it; channels 6 and 7 take no palette colour.
        const sample =
          samples && option.channel < 6
            ? samples[option.family]?.colors[Math.min(option.channel, 3)]?.rgba
            : undefined
        layers.push({
          texture: option.texture,
          tint: sample ? [sample[0], sample[1], sample[2]] : null
        })
      }
      if (!layers.length) layers.push({ texture: surface.diffuse, tint: null })
      surfaces.push({
        material: surface.material,
        cutout: /DECAL/.test(surface.name),
        layers
      })
    }
    return {
      bytes,
      surfaces,
      textures: rows
        .filter((row) => row.name)
        .map((row) => ({ layer: row.layer, group: row.group, name: row.name }))
        .filter(
          (row, index, all) =>
            all.findIndex((other) => other.layer === row.layer && other.group === row.group) ===
            index
        )
    }
  }

  build(category: unknown, kind: unknown, seed: unknown): WorkshopModelResult {
    const scene = workshopScene(String(category), String(kind))
    if (!scene) return { state: 'failed', reason: 'UNKNOWN_KIND' }
    if (typeof seed !== 'string' || !seedPattern.test(seed)) {
      return { state: 'failed', reason: 'INVALID_SEED' }
    }
    if (!this.installationRoot()) return { state: 'failed', reason: 'INSTALLATION_NOT_SELECTED' }
    try {
      const resolve = this.lists()
      const root = resolve(scene)
      if (!root) return { state: 'failed', reason: 'GAME_FILES_UNREADABLE' }
      const value = BigInt(seed)
      const selection = selectParts(value, root, resolve)
      const paint = this.paint(String(category), String(kind), value)
      const look = this.look(
        scene,
        value,
        new Set(selection.selectedIds),
        paint,
        String(category) !== 'freighter'
      )
      validatePreviewGlb(look.bytes)
      this.allowedTextures = new Set(
        look.surfaces.flatMap((surface) => surface.layers.map((layer) => layer.texture))
      )
      return {
        state: 'built',
        seed: formatSeed(value),
        model: {
          name: `${String(kind)} ${formatSeed(value)}`,
          sha256: createHash('sha256').update(look.bytes).digest('hex'),
          bytes: look.bytes
        },
        parts: selection.parts.map((part) => ({
          depth: part.depth,
          parent: part.parent,
          group: part.typeId,
          id: part.id,
          alternatives: part.alternatives,
          rare: part.rare
        })),
        paint,
        textures: look.textures,
        surfaces: look.surfaces
      }
    } catch (error) {
      return { state: 'failed', reason: failure(error) }
    }
  }

  // One texture of the model built last, as the game stores it; null for anything else.
  texture(path: unknown): Buffer | null {
    if (typeof path !== 'string' || !this.allowedTextures.has(path)) return null
    try {
      const data = this.files.readTexture(path)
      return data && data.length <= largestTexture ? data : null
    } catch {
      return null
    }
  }

  // Everything that can be chosen for a kind. A group is offered when a seed can draw more than
  // one alternative in it; a group with a single alternative is passed through, and what lies
  // under that alternative is offered in its place.
  choices(category: unknown, kind: unknown): WorkshopChoicesResult {
    const scene = workshopScene(String(category), String(kind))
    if (!scene) return { state: 'failed', reason: 'UNKNOWN_KIND' }
    if (!this.installationRoot()) return { state: 'failed', reason: 'INSTALLATION_NOT_SELECTED' }
    try {
      const resolve = this.lists()
      const root = resolve(scene)
      if (!root) return { state: 'failed', reason: 'GAME_FILES_UNREADABLE' }
      let budget = 0
      const groupsOf = (list: PartList, parent: string, depth: number): WorkshopPartGroup[] => {
        const result: WorkshopPartGroup[] = []
        if (depth > 24) return result
        for (const group of list.groups) {
          const drawable = group.options.filter((option) => optionWeight(option.name) > 0)
          const under = (option: (typeof drawable)[number]): WorkshopPartGroup[] => {
            budget += 1
            if (budget > maximumTreeGroups) throw new ModelFileError('too_large')
            const inner: WorkshopPartGroup[] = []
            for (const child of option.children) {
              inner.push(...groupsOf(child, option.id, depth + 1))
            }
            for (const reference of option.referencePaths) {
              const referenced = resolve(reference)
              if (referenced) inner.push(...groupsOf(referenced, option.id, depth + 1))
            }
            return inner
          }
          if (drawable.length === 1) {
            result.push(...under(drawable[0]))
          } else if (drawable.length > 1) {
            result.push({
              parent,
              group: group.typeId,
              options: drawable.map((option) => ({
                id: option.id,
                rare: option.name.includes('xRARE'),
                groups: under(option)
              }))
            })
          }
        }
        return result
      }
      const painted = workshopPainted(String(category), String(kind))
      const families = painted ? this.families() : null
      return {
        state: 'listed',
        groups: groupsOf(root, '', 0),
        paintColors: distinct(families?.[paintFamily].colors ?? []),
        undercoatColors: distinct(families?.[undercoatFamily].colors ?? []),
        // The alternatives of the base layer that a seed can draw on these kinds.
        baseTextures:
          painted && ['fighter', 'hauler'].includes(String(kind))
            ? ['COATING', 'PAINTED', 'PANELS']
            : []
      }
    } catch (error) {
      return { state: 'failed', reason: failure(error) }
    }
  }

  // A seed that draws the wanted parts and, when asked, the wanted colours and base texture.
  // Seeds are tried at random: no way is known to compute a seed from what it draws, only to
  // check a seed. The cheap checks come first: parts, then colours, then textures.
  async findSeed(
    category: unknown,
    kind: unknown,
    wantedParts: unknown,
    wantedLook: unknown
  ): Promise<WorkshopSeedResult> {
    const scene = workshopScene(String(category), String(kind))
    if (!scene) return { state: 'failed', reason: 'UNKNOWN_KIND' }
    if (!this.installationRoot()) return { state: 'failed', reason: 'INSTALLATION_NOT_SELECTED' }
    const wanted: WorkshopWantedPart[] = []
    for (const entry of Array.isArray(wantedParts) ? wantedParts.slice(0, 64) : []) {
      const part = entry as Partial<WorkshopWantedPart> | null
      if (
        part &&
        typeof part.parent === 'string' &&
        typeof part.group === 'string' &&
        typeof part.id === 'string' &&
        part.id.length <= 32
      ) {
        wanted.push({ parent: part.parent, group: part.group, id: part.id })
      }
    }
    const look = (wantedLook ?? {}) as { colors?: unknown; baseTexture?: unknown }
    const painted = workshopPainted(String(category), String(kind))
    const colors: [WorkshopPaintRole, number[]][] = []
    if (painted && look.colors && typeof look.colors === 'object') {
      for (const role of workshopPaintRoles) {
        const color = (look.colors as Record<string, unknown>)[role]
        if (
          Array.isArray(color) &&
          color.length >= 3 &&
          color.every((value) => typeof value === 'number')
        ) {
          colors.push([role, color as number[]])
        }
      }
    }
    const baseTexture =
      painted && typeof look.baseTexture === 'string' && look.baseTexture.length <= 32
        ? look.baseTexture
        : null
    const mine = (this.search += 1)
    try {
      const resolve = this.lists()
      const root = resolve(scene)
      const families = colors.length ? this.families() : null
      if (!root || (colors.length && !families)) {
        return { state: 'failed', reason: 'GAME_FILES_UNREADABLE' }
      }
      const depth = colors.some(([role]) => role === 'undercoat') ? undercoatFamily : paintFamily
      const started = Date.now()
      let tried = 0
      while (tried < searchTries && Date.now() - started < searchMilliseconds) {
        const block = randomBytes(8 * sliceTries)
        for (let index = 0; index < sliceTries; index += 1) {
          tried += 1
          const seed = block.readBigUInt64LE(index * 8)
          let selectedIds: string[] | null = null
          if (wanted.length || baseTexture) {
            const selection = selectParts(seed, root, resolve)
            let matches = 0
            for (const want of wanted) {
              if (
                selection.parts.some(
                  (part) =>
                    part.id === want.id && part.typeId === want.group && part.parent === want.parent
                )
              ) {
                matches += 1
              }
            }
            if (matches !== wanted.length) continue
            selectedIds = selection.selectedIds
          }
          if (families) {
            const rows = leadingPaletteSamples(seed, families, depth + 1)
            if (
              colors.some(
                ([role, color]) =>
                  !sameColor(rows[paintSample[role][0]][paintSample[role][1]], color)
              )
            ) {
              continue
            }
          }
          if (baseTexture && selectedIds) {
            const drawn = this.look(scene, seed, new Set(selectedIds), null, false).textures
            if (
              drawn.find((row) => row.layer === 'BASE' && row.group === '')?.name !== baseTexture
            ) {
              continue
            }
          }
          return { state: 'found', seed: formatSeed(seed), tried }
        }
        // Let other requests through, and stop when a newer search has started.
        await new Promise((resume) => setImmediate(resume))
        if (mine !== this.search) break
      }
      return { state: 'failed', reason: 'SEED_NOT_FOUND' }
    } catch (error) {
      return { state: 'failed', reason: failure(error) }
    }
  }
}
