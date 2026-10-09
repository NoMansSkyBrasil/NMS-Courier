import { createHash, randomBytes } from 'node:crypto'
import { workshopScene } from '../../shared/model-workshop'
import type {
  WorkshopChoicesResult,
  WorkshopColor,
  WorkshopColorSlot,
  WorkshopFailure,
  WorkshopModelResult,
  WorkshopPartGroup,
  WorkshopSeedResult,
  WorkshopSurface,
  WorkshopTextureGroup,
  WorkshopWantedLook,
  WorkshopWantedPart
} from '../../shared/model-workshop'
import { validatePreviewGlb } from '../model-preview-import'
import {
  familyNames,
  childSeed,
  generateBasePalette,
  seedState,
  leadingPaletteSamples,
  readBasePalette
} from '../nms-adapters/base-palette-preview'
import type { Family } from '../nms-adapters/base-palette-preview'
import {
  readShipModelTable,
  shipModel,
  shipModelTablePath
} from '../research-bridge/system-ship-models'
import type { StarSystemReport } from '../../shared/star-system'
import { ModelFileError } from './binary-table'
import type { ModelFiles } from './game-model-files'
import { partListPath, readPartList } from './part-list'
import type { PartList } from './part-list'
import { buildSceneModel, emptySceneModelCache, SceneModelError } from './scene-model'
import type { SceneSurface } from './scene-model'
import { nodeIncluded, optionWeight, selectParts } from './seed-part-selection'
import { readTextureList, textureListPath } from './texture-list'
import type { TextureList } from './texture-list'
import {
  chosenTextureName,
  textureLayerDrawn,
  collectTextureGroups,
  selectTextures,
  texturesSupported
} from './texture-selection'
import type { SelectedTexture } from './texture-selection'

// The model workshop's work in the main process: show what a seed looks like for a kind of
// starship, multi-tool or freighter, list the parts that can be chosen for a kind, and look for a
// seed that has the parts, colours and textures the user chose. Everything is read from the
// selected installation.

const seedPattern = /^0x[0-9a-f]{1,16}$/i
const palettePath = 'metadata/simulation/solarsystem/colours/basecolourpalettes.mbin'
// A search tries random seeds in slices, so the application stays responsive; it stops at
// whichever limit comes first.
const searchTries = 8_000_000
const searchMilliseconds = 25_000
const sliceTries = 2_000
// Budget for the tree of choices handed to the interface.
const maximumTreeGroups = 20_000
// No texture of a ship, multi-tool or freighter comes near this.
const largestTexture = 96 * 1024 * 1024
// Families the game draws again later in its palette schedule; for the others below this number
// the first samples drawn are the final ones, which makes a colour check cheap.
const redrawnFamilies = [0, 32, 33, 34, 35, 36, 37, 51]
const firstLateFamily = 52

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

// The sample of a palette family a texture alternative takes: the game uses the fourth sample
// for the channels above it, and channels 6 and 7 take no palette colour.
function sampleOf(channel: number): number | null {
  return channel < 6 ? Math.min(channel, 3) : null
}

// The seed a model's palette is drawn with. A starship draws it with its own seed. A multi-tool
// draws it with the first child seed of its own, while its texture layers still follow its own
// seed: seen on one tool bought in the game (docs/MODEL_WORKSHOP.md).
function paletteSeedOf(category: string, seed: bigint): bigint {
  return category === 'multitool' ? childSeed(seedState(seed))[1] : seed
}

// The texture side of a model for one seed: the lists in walk order, the seed's choices, and the
// materials they belong to.
type Texturing = {
  surfaces: SceneSurface[]
  lists: Map<string, TextureList>
  ordered: TextureList[]
  rows: SelectedTexture[]
}

export class ModelWorkshopService {
  private palette: Family[] | null = null
  // The newest search; an older one stops as soon as it notices.
  private search = 0
  // Textures the interface may ask for: those the last built model is painted with.
  private allowedTextures = new Set<string>()
  // Parsed files kept between requests; a search walks the same scenes thousands of times.
  private scenes = emptySceneModelCache()
  private textureLists = new Map<string, TextureList | null>()
  private cachedRoot: string | null = null

  constructor(
    private readonly files: ModelFiles,
    private readonly installationRoot: () => string | null
  ) {}

  // Drops everything remembered about another installation.
  private root(): string | null {
    const root = this.installationRoot()
    if (root !== this.cachedRoot) {
      this.cachedRoot = root
      this.palette = null
      this.scenes = emptySceneModelCache()
      this.textureLists.clear()
      this.allowedTextures.clear()
    }
    return root
  }

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

  private textureList(path: string): TextureList | null {
    if (!this.textureLists.has(path)) {
      let list: TextureList | null = null
      try {
        const data = this.files.read(path)
        list = data ? readTextureList(data) : null
      } catch {
        // A list that cannot be read leaves its materials with their plain texture.
      }
      this.textureLists.set(path, list)
    }
    return this.textureLists.get(path) ?? null
  }

  // What a seed chooses for the texture layers of a model whose materials were walked.
  private texturing(seed: bigint, surfaces: SceneSurface[]): Texturing {
    // Texture lists in the order their materials are first met while walking the model.
    const lists = new Map<string, TextureList>()
    const ordered: TextureList[] = []
    const seen = new Set<string>()
    for (const surface of surfaces) {
      if (!surface.diffuse) continue
      const path = textureListPath(surface.diffuse)
      if (seen.has(path)) continue
      seen.add(path)
      const list = this.textureList(path)
      if (list) {
        lists.set(path, list)
        ordered.push(list)
      }
    }
    return {
      surfaces,
      lists,
      ordered,
      rows: texturesSupported(ordered) ? selectTextures(seed, ordered) : []
    }
  }

  // The materials of a seed's model without its geometry: enough to know its textures.
  private walk(scene: string, selected: ReadonlySet<string>): SceneSurface[] {
    const surfaces: SceneSurface[] = []
    buildSceneModel(
      this.files,
      scene,
      (name) => nodeIncluded(name, selected),
      null,
      surfaces,
      this.scenes,
      false
    )
    return surfaces
  }

  // The layers in which the seed chooses between more than one alternative.
  private textureGroups(texturing: Texturing): WorkshopTextureGroup[] {
    const result: WorkshopTextureGroup[] = []
    for (const group of texturing.rows.length ? collectTextureGroups(texturing.ordered) : []) {
      const options: string[] = []
      for (const option of group.options) {
        if (option.name && option.probabilitySum > 0 && !options.includes(option.name)) {
          options.push(option.name)
        }
      }
      if (options.length > 1) {
        result.push({
          layer: group.layer,
          group: group.group,
          chosen: chosenTextureName(texturing.rows, group.layer, group.group),
          options
        })
      }
    }
    return result
  }

  // Adds to a star system report the model each ship uses, from the game's own table.
  withShipModels(report: StarSystemReport): StarSystemReport {
    if (report.state !== 'read' || !this.root()) return report
    try {
      const data = this.files.read(shipModelTablePath)
      const table = data ? readShipModelTable(data) : null
      if (!table) return report
      return {
        ...report,
        ships: report.ships.map((ship) => {
          const record = shipModel(table, ship)
          return record ? { ...ship, model: record.id, scene: record.scene } : ship
        })
      }
    } catch {
      return report
    }
  }

  // `colorSeed` is the seed the colours are drawn with when it is not the model seed: a
  // freighter takes its colours from its home star system.
  build(category: unknown, kind: unknown, seed: unknown, colorSeed?: unknown): WorkshopModelResult {
    const scene = workshopScene(String(category), String(kind))
    if (!scene) return { state: 'failed', reason: 'UNKNOWN_KIND' }
    if (typeof seed !== 'string' || !seedPattern.test(seed)) {
      return { state: 'failed', reason: 'INVALID_SEED' }
    }
    if (!this.root()) return { state: 'failed', reason: 'INSTALLATION_NOT_SELECTED' }
    try {
      const resolve = this.lists()
      const root = resolve(scene)
      if (!root) return { state: 'failed', reason: 'GAME_FILES_UNREADABLE' }
      const value = BigInt(seed)
      const selection = selectParts(value, root, resolve)
      const selected = new Set(selection.selectedIds)
      const sceneSurfaces: SceneSurface[] = []
      const bytes = buildSceneModel(
        this.files,
        scene,
        (name) => nodeIncluded(name, selected),
        null,
        sceneSurfaces,
        this.scenes
      )
      validatePreviewGlb(bytes)
      const texturing = this.texturing(value, sceneSurfaces)
      // A freighter is tinted only when the seed of its home system is given; without it its
      // textures are drawn as they are.
      const freighter = String(category) === 'freighter'
      const paletteSeed =
        typeof colorSeed === 'string' && seedPattern.test(colorSeed)
          ? BigInt(colorSeed)
          : freighter
            ? null
            : paletteSeedOf(String(category), value)
      const families = paletteSeed === null ? null : this.families()
      const samples =
        families && paletteSeed !== null
          ? generateBasePalette(paletteSeed, families).families
          : null
      const colors: WorkshopColorSlot[] = []
      const surfaces: WorkshopSurface[] = []
      for (const surface of sceneSurfaces) {
        if (!surface.diffuse) continue
        const list = texturing.lists.get(textureListPath(surface.diffuse))
        const layers: WorkshopSurface['layers'] = []
        for (const layer of texturing.rows.length && list ? list.layers : []) {
          if (!textureLayerDrawn(texturing.rows, layer.name, layer.group)) continue
          const chosen = chosenTextureName(texturing.rows, layer.name, layer.group)
          const option = layer.options.find((entry) => entry.name === chosen)
          if (!option || !option.texture.endsWith('.dds')) continue
          const sample = sampleOf(option.channel)
          const rgba =
            samples && families && sample !== null
              ? samples[option.family]?.colors[sample]?.rgba
              : undefined
          if (rgba && families && sample !== null) {
            if (!colors.some((slot) => slot.family === option.family && slot.sample === sample)) {
              colors.push({
                family: option.family,
                familyName: familyNames[option.family] ?? String(option.family),
                sample,
                color: rgba as WorkshopColor,
                palette: distinct(families[option.family].colors)
              })
            }
          }
          layers.push({ texture: option.texture, tint: rgba ? [rgba[0], rgba[1], rgba[2]] : null })
        }
        if (!layers.length) layers.push({ texture: surface.diffuse, tint: null })
        const overlay: WorkshopSurface['overlay'] = []
        // A second diffuse texture lies over the first. Its list is taken as it is when each of
        // its layers has a single alternative; a list with choices is not evaluated here.
        if (surface.overlay) {
          const overlayList = this.textureList(textureListPath(surface.overlay))
          const over: WorkshopSurface['layers'] = []
          for (const layer of overlayList ? overlayList.layers : []) {
            if (layer.options.length !== 1 || !layer.options[0].texture.endsWith('.dds')) continue
            const option = layer.options[0]
            const sample = sampleOf(option.channel)
            const rgba =
              samples && sample !== null ? samples[option.family]?.colors[sample]?.rgba : undefined
            over.push({ texture: option.texture, tint: rgba ? [rgba[0], rgba[1], rgba[2]] : null })
          }
          if (!over.length) over.push({ texture: surface.overlay, tint: null })
          overlay.push(...over)
        }
        surfaces.push({
          material: surface.material,
          cutout: /DECAL/.test(surface.name) && !overlay.length,
          layers,
          overlay
        })
      }
      // Then the colours the model's textures could take with other choices, so that every
      // colour of the kind can be seen and chosen.
      for (const list of samples && families ? texturing.ordered : []) {
        for (const layer of list.layers) {
          for (const option of layer.options) {
            const sample = sampleOf(option.channel)
            const rgba = sample === null ? undefined : samples![option.family]?.colors[sample]?.rgba
            if (
              rgba &&
              sample !== null &&
              !colors.some((slot) => slot.family === option.family && slot.sample === sample)
            ) {
              colors.push({
                family: option.family,
                familyName: familyNames[option.family] ?? String(option.family),
                sample,
                color: rgba as WorkshopColor,
                palette: distinct(families![option.family].colors)
              })
            }
          }
        }
      }
      this.allowedTextures = new Set(
        surfaces.flatMap((surface) =>
          [...surface.layers, ...surface.overlay].map((layer) => layer.texture)
        )
      )
      return {
        state: 'built',
        seed: formatSeed(value),
        model: {
          name: `${String(kind)} ${formatSeed(value)}`,
          sha256: createHash('sha256').update(bytes).digest('hex'),
          bytes
        },
        parts: selection.parts.map((part) => ({
          depth: part.depth,
          parent: part.parent,
          group: part.typeId,
          id: part.id,
          alternatives: part.alternatives,
          rare: part.rare
        })),
        colors,
        textureGroups: this.textureGroups(texturing),
        surfaces
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

  // The parts that can be chosen for a kind. A group is offered when a seed can draw more than
  // one alternative in it; a group with a single alternative is passed through, and what lies
  // under that alternative is offered in its place.
  choices(category: unknown, kind: unknown): WorkshopChoicesResult {
    const scene = workshopScene(String(category), String(kind))
    if (!scene) return { state: 'failed', reason: 'UNKNOWN_KIND' }
    if (!this.root()) return { state: 'failed', reason: 'INSTALLATION_NOT_SELECTED' }
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
      return { state: 'listed', groups: groupsOf(root, '', 0) }
    } catch (error) {
      return { state: 'failed', reason: failure(error) }
    }
  }

  // A seed that draws the wanted parts and, when asked, the wanted colours and textures. Seeds
  // are tried at random: no way is known to compute a seed from what it draws, only to check a
  // seed. The cheap checks come first: parts, then colours, then textures.
  async findSeed(
    category: unknown,
    kind: unknown,
    wantedParts: unknown,
    wantedLook: unknown
  ): Promise<WorkshopSeedResult> {
    const scene = workshopScene(String(category), String(kind))
    if (!scene) return { state: 'failed', reason: 'UNKNOWN_KIND' }
    if (!this.root()) return { state: 'failed', reason: 'INSTALLATION_NOT_SELECTED' }
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
    const look = (wantedLook ?? {}) as Partial<WorkshopWantedLook>
    const colors: WorkshopWantedLook['colors'] = []
    for (const entry of Array.isArray(look.colors) ? look.colors.slice(0, 16) : []) {
      if (
        entry &&
        Number.isInteger(entry.family) &&
        entry.family >= 0 &&
        entry.family < familyNames.length &&
        Number.isInteger(entry.sample) &&
        entry.sample >= 0 &&
        entry.sample < 4 &&
        Array.isArray(entry.color) &&
        entry.color.length >= 3 &&
        entry.color.every((value) => typeof value === 'number')
      ) {
        colors.push({ family: entry.family, sample: entry.sample, color: entry.color })
      }
    }
    const textures: WorkshopWantedLook['textures'] = []
    for (const entry of Array.isArray(look.textures) ? look.textures.slice(0, 32) : []) {
      if (
        entry &&
        typeof entry.layer === 'string' &&
        typeof entry.group === 'string' &&
        typeof entry.name === 'string' &&
        entry.name.length <= 32
      ) {
        textures.push({ layer: entry.layer, group: entry.group, name: entry.name })
      }
    }
    const mine = (this.search += 1)
    try {
      const resolve = this.lists()
      const root = resolve(scene)
      const families = colors.length && String(category) !== 'freighter' ? this.families() : null
      if (!root || (colors.length && !families)) {
        return { state: 'failed', reason: 'GAME_FILES_UNREADABLE' }
      }
      const highest = Math.max(0, ...colors.map((entry) => entry.family))
      const early =
        highest < firstLateFamily && !colors.some((entry) => redrawnFamilies.includes(entry.family))
      const started = Date.now()
      let tried = 0
      while (tried < searchTries && Date.now() - started < searchMilliseconds) {
        const block = randomBytes(8 * sliceTries)
        for (let index = 0; index < sliceTries; index += 1) {
          tried += 1
          const seed = block.readBigUInt64LE(index * 8)
          let selectedIds: string[] | null = null
          if (wanted.length || textures.length) {
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
            const paletteSeed = paletteSeedOf(String(category), seed)
            const drawn = early
              ? leadingPaletteSamples(paletteSeed, families, highest + 1)
              : generateBasePalette(paletteSeed, families).families.map((family) =>
                  family.colors.map((color) => color.rgba)
                )
            if (
              colors.some((entry) => !sameColor(drawn[entry.family][entry.sample], entry.color))
            ) {
              continue
            }
          }
          if (textures.length && selectedIds) {
            const { rows } = this.texturing(seed, this.walk(scene, new Set(selectedIds)))
            if (
              textures.some(
                (entry) => chosenTextureName(rows, entry.layer, entry.group) !== entry.name
              )
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
