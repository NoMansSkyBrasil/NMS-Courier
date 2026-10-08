import layouts from './core-table-layouts.json'

// Reads the substance, product and technology tables as the game stores them, without a
// converter. Where things sit inside a table is not guessed: core-table-layouts.json is derived
// by runtime/research/derive-core-table-layouts.py and holds only offsets that matched every entry
// of the table. A table whose structure revision is not in that file is refused.

export const coreTableDomains = ['substance', 'product', 'technology'] as const
export type CoreTableDomain = (typeof coreTableDomains)[number]

type Field = { offset: number; kind: string }
type Layout = {
  path: string
  structure: string
  listPosition: number
  entrySize: number
  fields: Record<'gameId' | 'name' | 'nameLower' | 'subtitle' | 'description' | 'icon', Field>
  category: { offset: number; names: Record<string, string> }
}

export type CoreTableEntry = {
  gameId: string
  category: string | null
  // Localisation keys, resolved by the caller; and the game-relative icon locator.
  nameKey: string
  nameLowerKey: string
  subtitleKey: string
  descriptionKey: string
  icon: string
}

export class GameTableError extends Error {
  constructor(readonly reason: 'unknown_structure' | 'corrupt_table') {
    super(reason)
  }
}

const tableLayouts = layouts as Record<CoreTableDomain, Layout>
const tableMagic = 0xcccccccc

export function coreTablePath(domain: CoreTableDomain): string {
  return tableLayouts[domain].path
}

// The 16 header bytes that change whenever the game changes the table's structure.
export function tableStructure(data: Buffer): string {
  if (data.length < 0x20 || data.readUInt32LE(0) !== tableMagic) {
    throw new GameTableError('corrupt_table')
  }
  return data.toString('hex', 8, 24)
}

// A list or out-of-line string: relative offset, count, marker byte 1.
export function readReference(data: Buffer, position: number): { start: number; count: number } {
  if (position + 16 > data.length || data[position + 12] !== 1) {
    throw new GameTableError('corrupt_table')
  }
  const start = position + Number(data.readBigInt64LE(position))
  const count = data.readUInt32LE(position + 8)
  if (start < 0 || start > data.length) throw new GameTableError('corrupt_table')
  return { start, count }
}

function inlineString(data: Buffer, position: number): string {
  const end = data.indexOf(0, position)
  return data.toString('utf8', position, end < 0 ? data.length : end)
}

export function variableString(data: Buffer, position: number): string {
  const { start, count } = readReference(data, position)
  if (start + count > data.length) throw new GameTableError('corrupt_table')
  return data.toString('utf8', start, start + count).replace(/\0+$/, '')
}

export function readCoreTable(domain: CoreTableDomain, data: Buffer): CoreTableEntry[] {
  const layout = tableLayouts[domain]
  if (tableStructure(data) !== layout.structure) throw new GameTableError('unknown_structure')
  const list = readReference(data, layout.listPosition)
  if (list.start + list.count * layout.entrySize > data.length) {
    throw new GameTableError('corrupt_table')
  }
  const text = (entry: number, field: Field): string =>
    field.kind === 'inline'
      ? inlineString(data, entry + field.offset)
      : variableString(data, entry + field.offset)

  const entries: CoreTableEntry[] = []
  for (let index = 0; index < list.count; index += 1) {
    const entry = list.start + index * layout.entrySize
    entries.push({
      gameId: text(entry, layout.fields.gameId),
      category: layout.category.names[data.readInt32LE(entry + layout.category.offset)] ?? null,
      nameKey: text(entry, layout.fields.name),
      nameLowerKey: text(entry, layout.fields.nameLower),
      subtitleKey: text(entry, layout.fields.subtitle),
      descriptionKey: text(entry, layout.fields.description),
      icon: text(entry, layout.fields.icon)
    })
  }
  return entries
}
