import { childSeed, seedState } from '../nms-adapters/base-palette-preview'
import type { PartList, PartOption } from './part-list'

// Which parts a seed selects from a model's part lists. A port of the research traversal
// (runtime/research/evaluate-descriptor-seed.py, compared with the game's instructions for its
// arithmetic) with an empty caller context: no forced, excluded or prefixed parts. It reproduces
// the shape of public reference seeds; it was not yet compared with the running game seed by seed.

export type SelectedPart = {
  depth: number
  // The alternative whose own lists this choice was made in; empty at the top of the model.
  parent: string
  // The group the choice was made in and the alternative chosen, as the game names them.
  typeId: string
  id: string
  name: string
  // How many alternatives of the group can be drawn at all, and whether this one is a rare one.
  alternatives: number
  rare: boolean
}

export type PartSelection = {
  // Normalised identifiers of every selected part; scene nodes are shown or hidden by these.
  selectedIds: string[]
  parts: SelectedPart[]
}

const maximumCalls = 4096
const maximumDepth = 64

// The game's weights come from markers in the option name, not from the stored chance.
export function optionWeight(name: string): number {
  if (name.includes('xRARE')) return 1
  if (name.includes('xNEVER')) return 0
  return 20
}

// A trailing level suffix ("LOD0") is dropped and the rest upper-cased, as the game does.
export function normalizedPartId(id: string): string {
  const position = id.indexOf('LOD')
  if (position >= 0 && id.length - position === 4 && /[0-9]$/.test(id)) {
    return id.slice(0, position).toUpperCase()
  }
  return id
}

function allNever(list: PartList): boolean {
  return (
    list.groups.length > 0 &&
    list.groups.every(
      (group) =>
        group.options.length > 0 && group.options.every((option) => optionWeight(option.name) === 0)
    )
  )
}

// One step of the game's generator (low * 0x5A76F899 + carry, split into two 32-bit words),
// done with plain numbers because a seed search takes it millions of times.
export function advance(state: [number, number]): [number, number] {
  const low = state[0] & 0xffff
  const high = state[0] >>> 16
  const middle = high * 0xf899 + low * 0x5a76
  const sum = low * 0xf899 + (middle % 0x10000) * 0x10000 + state[1]
  return [
    sum % 0x100000000,
    high * 0x5a76 + Math.floor(middle / 0x10000) + Math.floor(sum / 0x100000000)
  ]
}

export function selectParts(
  seed: bigint,
  root: PartList,
  resolve: (scenePath: string) => PartList | null
): PartSelection {
  // Identifiers of the chosen alternatives exactly as the part lists spell them.
  const sourceIds: string[] = []
  const selectedIds: string[] = []
  const parts: SelectedPart[] = []
  let calls = 0

  const visit = (list: PartList, localSeed: bigint, depth: number, parent: string): void => {
    calls += 1
    if (depth > maximumDepth || calls > maximumCalls) throw new Error('part_list_too_deep')
    let state = seedState(localSeed)
    for (const group of list.groups) {
      const weights = group.options.map((option) => optionWeight(option.name))
      const total = weights.reduce((sum, weight) => sum + weight, 0)
      // A group is skipped when nothing can be drawn or one of its alternatives was already
      // chosen elsewhere in the model. The comparison is by the identifier as spelled, level
      // suffix included: with the normalised identifier three of sixty-four known seeds drew
      // different parts (docs/MODEL_WORKSHOP.md).
      if (!total || group.options.some((option) => sourceIds.includes(option.id))) continue
      state = advance(state)
      let position = Math.floor((state[0] * total) / 0x100000000)
      let chosen: PartOption | null = null
      for (let index = 0; index < group.options.length; index += 1) {
        if (position < weights[index]) {
          chosen = group.options[index]
          break
        }
        position -= weights[index]
      }
      if (!chosen) throw new Error('part_choice_out_of_range')
      const id = normalizedPartId(chosen.id)
      if (!selectedIds.includes(id)) selectedIds.push(id)
      sourceIds.push(chosen.id)
      parts.push({
        depth,
        parent,
        typeId: group.typeId,
        id: chosen.id,
        name: chosen.name,
        alternatives: weights.filter((weight) => weight > 0).length,
        rare: chosen.name.includes('xRARE')
      })
      for (const child of chosen.children) {
        if (allNever(child)) continue
        if (group.typeId === '_PLAYER_') {
          visit(child, localSeed, depth + 1, chosen.id)
        } else {
          const [next, derived] = childSeed(state)
          state = next
          visit(child, derived, depth + 1, chosen.id)
        }
      }
      for (const reference of chosen.referencePaths) {
        const referenced = resolve(reference)
        if (referenced && allNever(referenced)) continue
        const [next, derived] = childSeed(state)
        state = next
        if (referenced) visit(referenced, derived, depth + 1, chosen.id)
      }
    }
  }

  visit(root, seed, 0, '')
  return { selectedIds, parts }
}

// Whether a loaded scene node is shown for a selection: names that are not part alternatives are
// always shown; an alternative is shown when its identifier (31 or 15 characters) was selected.
export function nodeIncluded(name: string, selected: ReadonlySet<string>): boolean {
  let tested = name
  if (tested.startsWith('_') && tested.length <= 31) tested = normalizedPartId(tested.toUpperCase())
  if (!tested.startsWith('_') || !tested.slice(1).includes('_')) return true
  return (
    selected.has(tested.slice(0, 31).toUpperCase()) ||
    selected.has(tested.slice(0, 15).toUpperCase())
  )
}
