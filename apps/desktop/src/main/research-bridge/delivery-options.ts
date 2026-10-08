import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { DeliveryFeatureId, DeliveryPlan } from './delivery-plan'

// The entries of an area that may be sent one by one. The list is the same generated Markdown
// table the signal script reads for "all", so nothing can be chosen here that "all" would not
// send, and the blocked entries of the classification never appear.

export type DeliveryOption = {
  id: string
  // Class, category or kind inside the area, as the table names it.
  group: string
  // Catalogue domain the identifier belongs to, when the catalogue can name it.
  domain: 'product' | 'technology' | null
}

type Source = {
  // File of runtime/research and the columns of its table.
  table: string
  idColumn: number
  groupColumn: number
  accept: (cells: readonly string[]) => boolean
  domain: DeliveryOption['domain']
  script: string
  flag: string
  changesAccount: boolean
}

const product = (classes: readonly string[], script: string, changesAccount: boolean): Source => ({
  table: 'product-delivery-classification.md',
  idColumn: 0,
  groupColumn: 1,
  accept: (cells) => classes.includes(cells[1]),
  domain: 'product',
  script,
  flag: '-Id',
  changesAccount
})

const account = (kind: string, flag: string): Source => ({
  table: 'account-unlocks.md',
  idColumn: 1,
  groupColumn: 2,
  accept: (cells) => cells[0] === kind && cells[3] === 'yes',
  domain: null,
  script: 'signal-account-180836.ps1',
  flag,
  changesAccount: true
})

// Areas without an entry here are sent whole only: fishing and refiner recipes have no request
// for single entries, and Twitch and platform rewards depend on the keep list, which is per kind.
const sources: Partial<Record<DeliveryFeatureId, Source>> = {
  technologies: {
    table: 'technology-delivery-classification.md',
    idColumn: 0,
    groupColumn: 1,
    accept: (cells) => cells[2] === 'deliverable',
    domain: 'technology',
    script: 'signal-technology-180836.ps1',
    flag: '-Id',
    changesAccount: false
  },
  productRecipes: product(
    ['catalogue_item', 'catalogue_technology'],
    'signal-product-180836.ps1',
    false
  ),
  buildParts: product(
    ['catalogue_construction', 'research_tree'],
    'signal-product-180836.ps1',
    false
  ),
  customisation: product(['customisation'], 'signal-customisation-180836.ps1', true),
  titles: account('title', '-Title'),
  expeditions: account('season', '-Season'),
  quicksilver: account('special', '-Special')
}

const identifier = /^[A-Z0-9_]{1,15}$/
// A request of the profile carries at most this many entries.
const requestLimit = 4096

// Data rows of a generated Markdown table: the header and the separator are dropped.
export function parseMarkdownRows(text: string): string[][] {
  return text
    .split(/\r?\n/)
    .filter((line) => line.startsWith('| '))
    .slice(2)
    .map((line) =>
      line
        .slice(1, line.lastIndexOf('|'))
        .split('|')
        .map((cell) => cell.trim())
    )
}

export function supportsSelection(feature: DeliveryFeatureId): boolean {
  return feature in sources
}

export async function listDeliveryOptions(
  researchDirectory: string,
  feature: DeliveryFeatureId
): Promise<DeliveryOption[]> {
  const source = sources[feature]
  if (!source) return []
  const text = await readFile(join(researchDirectory, source.table), 'utf8').catch(() => '')
  return parseMarkdownRows(text)
    .filter((cells) => source.accept(cells) && identifier.test(cells[source.idColumn]))
    .map((cells) => ({
      id: cells[source.idColumn],
      group: cells[source.groupColumn],
      domain: source.domain
    }))
}

// The plan for the chosen entries, or null when one of them is not an option of the area.
export function getSelectionPlan(
  feature: DeliveryFeatureId,
  chosen: readonly string[],
  options: readonly DeliveryOption[]
): DeliveryPlan | null {
  const source = sources[feature]
  const allowed = new Set(options.map((option) => option.id))
  const ids = [...new Set(chosen)]
  if (!source || ids.length < 1 || ids.length > requestLimit) return null
  if (!ids.every((id) => identifier.test(id) && allowed.has(id))) return null
  return {
    changesAccount: source.changesAccount,
    steps: [{ script: source.script, args: [source.flag, ids.join(',')] }]
  }
}
