import { seedState } from '../nms-adapters/base-palette-preview'
import { advance } from './seed-part-selection'
import type { TextureList } from './texture-list'

// Which alternative of each texture layer a seed selects for a whole model. A port of the
// research selector (runtime/research/evaluate-texture-options.py, "fresh merged" mode, with the
// collection step of emulate-texture-collection.py): the layers of every texture list of the
// model are first merged by layer name and group, then drawn in that order.
//
// The research compared the arithmetic with the game's instructions. Two inputs were candidates
// there: the texture seed (taken as the model seed) and the order of the texture lists (first
// appearance while walking the model). Both are what this port uses.

export type CollectedOption = {
  name: string
  channel: number
  family: number
  occurrences: number
  probabilitySum: number
}

export type CollectedGroup = {
  layer: string
  group: string
  occurrences: number
  probabilitySum: number
  baseMatch: boolean
  options: CollectedOption[]
}

// The final choice for one merged layer: the alternative's name (empty when none was drawn),
// its palette family and the sample it takes.
export type SelectedTexture = {
  layer: string
  group: string
  name: string
  family: number
  channel: number
}

const f32 = Math.fround
// The game scales a 32-bit draw by this double (bytes 00 00 10 00 00 00 f0 3d).
const drawScale = new DataView(
  Uint8Array.from([0x00, 0x00, 0x10, 0x00, 0x00, 0x00, 0xf0, 0x3d]).buffer
).getFloat64(0, true)

function fraction(draw: number): number {
  return f32(draw * drawScale)
}

// Strict cumulative single-precision comparison, as the game does it.
function choose(draw: number, weights: number[]): number | null {
  let total = 0
  for (const weight of weights) total = f32(total + weight)
  const target = f32(fraction(draw) * total)
  let cumulative = 0
  for (let index = 0; index < weights.length; index += 1) {
    cumulative = f32(cumulative + weights[index])
    if (target < cumulative) return index
  }
  return null
}

// Layers that this port cannot evaluate: linked layers and alternatives filtered by gameplay
// name. No ship, multi-tool or freighter list of build 180836 uses either.
export function texturesSupported(lists: readonly TextureList[]): boolean {
  return lists.every((list) =>
    list.layers.every(
      (layer) =>
        !layer.linkedLayer &&
        layer.options.every((option) => option.gameplayUse === 0 && option.paletteIndex === -1)
    )
  )
}

export function collectTextureGroups(lists: readonly TextureList[]): CollectedGroup[] {
  const groups: CollectedGroup[] = []
  for (const list of lists) {
    for (const layer of list.layers) {
      if (!layer.options.length) continue
      const forceNew = list.alwaysEnableUnnamed && layer.options.length === 1 && !layer.name
      let existing = forceNew
        ? undefined
        : groups.find((group) => group.layer === layer.name && group.group === layer.group)
      const isNew = !existing
      if (!existing) {
        existing = {
          layer: layer.name,
          group: layer.group,
          occurrences: 0,
          probabilitySum: 0,
          baseMatch: false,
          options: []
        }
        groups.push(existing)
      }
      existing.occurrences += 1
      existing.probabilitySum = f32(existing.probabilitySum + f32(layer.probability))
      existing.baseMatch ||= layer.selectToMatchBase
      for (const option of layer.options) {
        // Options of a layer's first occurrence are appended as they are; later occurrences
        // merge into an option with the same name, channel and family.
        let found = isNew
          ? undefined
          : existing.options.find(
              (known) =>
                known.name === option.name &&
                known.channel === option.channel &&
                known.family === option.family
            )
        if (!found) {
          found = {
            name: option.name,
            channel: option.channel,
            family: option.family,
            occurrences: 0,
            probabilitySum: 0
          }
          existing.options.push(found)
        }
        found.occurrences += 1
        found.probabilitySum = f32(found.probabilitySum + f32(option.probability))
      }
    }
  }
  return groups
}

export function selectTextures(seed: bigint, lists: readonly TextureList[]): SelectedTexture[] {
  const groups = collectTextureGroups(lists)
  let state = seedState(seed)
  const rows: SelectedTexture[] = []
  const chanceOf = (group: CollectedGroup): number => f32(group.probabilitySum / group.occurrences)
  const rowOf = (group: CollectedGroup, option: CollectedOption): SelectedTexture => ({
    layer: group.layer,
    group: group.group,
    name: option.name,
    family: option.family,
    channel: option.channel
  })
  for (const group of groups) {
    const chance = chanceOf(group)
    let selected: number | null = null
    if (chance > 0) {
      state = advance(state)
      if (fraction(state[0]) < chance && !group.baseMatch) {
        state = advance(state)
        selected = choose(
          state[0],
          group.options.map((option) => f32(option.probabilitySum / option.occurrences))
        )
      }
    }
    rows.push(
      selected === null
        ? { layer: group.layer, group: group.group, name: '', family: 4, channel: 0 }
        : rowOf(group, group.options[selected])
    )
  }
  // Each list's first layer of the base group keeps an alternative of its own when none of the
  // drawn rows fits it.
  for (const list of lists) {
    const eligible = list.layers.find(
      (layer) => layer.options.length > 0 && (layer.group === '' || layer.group === 'BASE')
    )
    if (!eligible) continue
    let remembered: SelectedTexture | null = null
    let matched = false
    for (const existing of rows) {
      if (existing.layer !== eligible.name || existing.group !== eligible.group) continue
      for (const option of eligible.options) {
        if (option.name !== existing.name) continue
        remembered = {
          layer: eligible.name,
          group: eligible.group,
          name: option.name,
          family: option.family,
          channel: option.channel
        }
        if (option.channel === existing.channel && option.family === existing.family) matched = true
      }
    }
    if (!matched) {
      const first = eligible.options[0]
      rows.push(
        remembered ?? {
          layer: eligible.name,
          group: eligible.group,
          name: first.name,
          family: first.family,
          channel: first.channel
        }
      )
    }
  }
  // A later pass draws once per merged layer; a base-matching layer may take the alternative
  // the base layer of the same name got.
  for (let index = 0; index < groups.length; index += 1) {
    const group = groups[index]
    state = advance(state)
    if (group.baseMatch && fraction(state[0]) < chanceOf(group)) {
      let match: CollectedOption | undefined
      for (const existing of rows) {
        if ((existing.group !== '' && existing.group !== 'BASE') || existing.layer !== group.layer)
          continue
        match = group.options.find((option) => option.name === existing.name)
        if (match) break
      }
      if (match) rows[index] = rowOf(group, match)
    }
  }
  return rows
}

// The alternative a layer of one list ends up with: the first row for its layer and group that
// names one, which is how a row left empty in the first pass takes the later fallback row.
export function chosenTextureName(
  rows: readonly SelectedTexture[],
  layer: string,
  group: string
): string {
  return rows.find((row) => row.layer === layer && row.group === group && row.name)?.name ?? ''
}
