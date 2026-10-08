import { createHash, randomBytes } from 'node:crypto'
import { workshopPainted, workshopScene } from '../../shared/model-workshop'
import type {
  WorkshopChoicesResult,
  WorkshopColor,
  WorkshopFailure,
  WorkshopModelResult,
  WorkshopPaint,
  WorkshopPartGroup,
  WorkshopSeedResult,
  WorkshopWantedPart
} from '../../shared/model-workshop'
import { validatePreviewGlb } from '../model-preview-import'
import {
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
import { nodeIncluded, optionWeight, selectParts } from './seed-part-selection'

// The model workshop's work in the main process: show what a seed looks like for a kind of
// starship, multi-tool or freighter, list what can be chosen for a kind, and look for a seed that
// has the parts and the paint colour the user chose. Everything is read from the selected
// installation.

const seedPattern = /^0x[0-9a-f]{1,16}$/i
const palettePath = 'metadata/simulation/solarsystem/colours/basecolourpalettes.mbin'
// A search tries random seeds in slices, so the application stays responsive; it stops at
// whichever limit comes first.
const searchTries = 6_000_000
const searchMilliseconds = 20_000
const sliceTries = 4_000
// Budget for the tree of choices handed to the interface.
const maximumTreeGroups = 20_000

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

export class ModelWorkshopService {
  private palette: Family[] | null = null
  // The newest search; an older one stops as soon as it notices.
  private search = 0

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
    return {
      paint: rows[paintFamily] as WorkshopColor[],
      undercoat: rows[undercoatFamily] as WorkshopColor[]
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
      const selected = new Set(selection.selectedIds)
      const paint = this.paint(String(category), String(kind), value)
      const bytes = buildSceneModel(
        this.files,
        scene,
        (name) => nodeIncluded(name, selected),
        paint && {
          primary: paint.paint[0],
          secondary: paint.paint[1],
          undercoat: paint.undercoat[0]
        }
      )
      validatePreviewGlb(bytes)
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
        paint
      }
    } catch (error) {
      return { state: 'failed', reason: failure(error) }
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
      const families = workshopPainted(String(category), String(kind)) ? this.families() : null
      const paintColors: WorkshopColor[] = []
      for (const color of families?.[paintFamily].colors ?? []) {
        if (!paintColors.some((known) => sameColor(known, color))) paintColors.push(color)
      }
      return { state: 'listed', groups: groupsOf(root, '', 0), paintColors }
    } catch (error) {
      return { state: 'failed', reason: failure(error) }
    }
  }

  // A seed that draws the wanted parts and, when asked, the wanted main paint colour. Seeds are
  // tried at random: no way is known to compute a seed from its parts, only to check a seed.
  async findSeed(
    category: unknown,
    kind: unknown,
    wantedParts: unknown,
    wantedPaint: unknown
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
    const paint =
      Array.isArray(wantedPaint) &&
      wantedPaint.length >= 3 &&
      wantedPaint.every((value) => typeof value === 'number')
        ? (wantedPaint as number[])
        : null
    const mine = (this.search += 1)
    try {
      const resolve = this.lists()
      const root = resolve(scene)
      const families =
        paint && workshopPainted(String(category), String(kind)) ? this.families() : null
      if (!root || (paint && !families)) return { state: 'failed', reason: 'GAME_FILES_UNREADABLE' }
      const started = Date.now()
      let tried = 0
      while (tried < searchTries && Date.now() - started < searchMilliseconds) {
        const block = randomBytes(8 * sliceTries)
        for (let index = 0; index < sliceTries; index += 1) {
          tried += 1
          const seed = block.readBigUInt64LE(index * 8)
          if (wanted.length) {
            const { parts } = selectParts(seed, root, resolve)
            let matches = 0
            for (const want of wanted) {
              if (
                parts.some(
                  (part) =>
                    part.id === want.id && part.typeId === want.group && part.parent === want.parent
                )
              ) {
                matches += 1
              }
            }
            if (matches !== wanted.length) continue
          }
          if (paint && families) {
            const rows = leadingPaletteSamples(seed, families, paintFamily + 1)
            if (!sameColor(rows[paintFamily][0], paint)) continue
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
