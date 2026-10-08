import { expectStructure, fileHeaderSize, fixedText, listAt, listText } from './binary-table'
import { ModelFileError } from './binary-table'

// Reads a model's part list (the game's ".descriptor.mbin"): groups of alternatives, one of which
// the seed picks per group, each with the scenes it brings in and its own nested groups.
//
// Layout read from the build 180836 files by comparison with their converted text (2026-10-08):
// a list of groups; a group is its list of options (0x10) and a 0x10-byte type name; an option is
// 0xc8 bytes: identifier (0x20), nested part lists (list of references), referenced scenes (list of texts),
// chance (float, not used by the game's choice), name (0x80).

const structure = 'e40c00004f2926401448d118940eff96'
const groupSize = 0x20
const optionSize = 0xc8
// Budgets far above anything the game ships; a file beyond them is refused.
const maximumEntries = 4096
const maximumDepth = 64

export type PartOption = {
  id: string
  name: string
  referencePaths: string[]
  children: PartList[]
}
export type PartGroup = { typeId: string; options: PartOption[] }
export type PartList = { groups: PartGroup[] }

export function readPartList(data: Buffer): PartList {
  expectStructure(data, structure)
  let budget = 0
  // A nested part list is held through a 0x10-byte reference: offset relative to the reference.
  const pointee = (position: number): number => {
    const target = position + Number(data.readBigInt64LE(position))
    if (target <= position || target + 0x10 > data.length) throw new ModelFileError('corrupt_file')
    return target
  }
  const list = (position: number, depth: number): PartList => {
    if (depth > maximumDepth) throw new ModelFileError('too_large')
    const groups = listAt(data, position, groupSize, maximumEntries)
    const result: PartGroup[] = []
    for (let index = 0; index < groups.count; index += 1) {
      const group = groups.start + index * groupSize
      const options = listAt(data, group, optionSize, maximumEntries)
      const read: PartOption[] = []
      for (let item = 0; item < options.count; item += 1) {
        budget += 1
        if (budget > 16384) throw new ModelFileError('too_large')
        const option = options.start + item * optionSize
        const children = listAt(data, option + 0x20, 0x10, maximumEntries)
        const references = listAt(data, option + 0x30, 0x10, maximumEntries)
        read.push({
          id: fixedText(data, option, 0x20),
          name: fixedText(data, option + 0x44, 0x80),
          referencePaths: Array.from({ length: references.count }, (_, entry) =>
            listText(data, references.start + entry * 0x10, 1024)
          ),
          children: Array.from({ length: children.count }, (_, entry) =>
            list(pointee(children.start + entry * 0x10), depth + 1)
          )
        })
      }
      result.push({ typeId: fixedText(data, group + 0x10, 0x10), options: read })
    }
    return { groups: result }
  }
  return list(fileHeaderSize, 0)
}

// The part list that belongs to a scene path, as the game derives it.
export function partListPath(scenePath: string): string | null {
  const logical = scenePath
    .replace(/\\/g, '/')
    .toLowerCase()
    .replace('.scene.', '.descriptor.')
    .replace(/(\.descriptor\.mbin)\{[0-9]+\}$/, '$1')
  return logical.startsWith('models/') && logical.endsWith('.descriptor.mbin') ? logical : null
}
