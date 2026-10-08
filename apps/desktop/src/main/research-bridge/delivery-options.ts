import { readClassification, steps } from './delivery-plan'
import type { DeliveryFeatureId, DeliveryPlan, DeliveryStep } from './delivery-plan'

// The entries of an area that may be sent one by one. The list is the same generated table the
// whole-area request is built from, so nothing can be chosen here that "all" would not send, and
// the blocked entries of the classification never appear.

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
  changesAccount: boolean
  step: (ids: readonly string[], notify: boolean) => DeliveryStep | null
}

const product = (
  classes: readonly string[],
  changesAccount: boolean,
  step: Source['step']
): Source => ({
  table: 'product-delivery-classification.md',
  idColumn: 0,
  groupColumn: 1,
  accept: (cells) => classes.includes(cells[1]),
  domain: 'product',
  changesAccount,
  step
})

const account = (kind: string): Source => ({
  table: 'account-unlocks.md',
  idColumn: 1,
  groupColumn: 2,
  accept: (cells) => cells[0] === kind && cells[3] === 'yes',
  domain: null,
  changesAccount: true,
  step: (ids) => steps.account(ids.map((id) => `${kind}=${id}`))
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
    changesAccount: false,
    step: steps.technology
  },
  productRecipes: product(['catalogue_item', 'catalogue_technology'], false, steps.product),
  buildParts: product(['catalogue_construction', 'research_tree'], false, steps.product),
  customisation: product(['customisation'], true, (ids) => steps.redeem(ids)),
  titles: account('title'),
  expeditions: account('season'),
  quicksilver: account('special')
}

const identifier = /^[A-Z0-9_]{1,15}$/

export function supportsSelection(feature: DeliveryFeatureId): boolean {
  return feature in sources
}

export async function listDeliveryOptions(
  researchDirectory: string,
  feature: DeliveryFeatureId
): Promise<DeliveryOption[]> {
  const source = sources[feature]
  if (!source) return []
  const rows = await readClassification(researchDirectory, source.table)
  return rows
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
  options: readonly DeliveryOption[],
  notify: boolean
): DeliveryPlan | null {
  const source = sources[feature]
  const allowed = new Set(options.map((option) => option.id))
  const ids = [...new Set(chosen)]
  if (!source || ids.length < 1) return null
  if (!ids.every((id) => identifier.test(id) && allowed.has(id))) return null
  const step = source.step(ids, notify)
  return step ? { changesAccount: source.changesAccount, steps: [step] } : null
}
