import { readClassification, steps, wordRaces } from './delivery-plan'
import type { DeliveryFeatureId, DeliveryPlan, DeliveryStep } from './delivery-plan'

// The entries of an area that may be sent one by one. The list is the same generated table the
// whole-area request is built from, so nothing can be chosen here that "all" would not send, and
// the blocked entries of the classification never appear.

type CatalogDomain = 'product' | 'technology' | 'substance'

export type DeliveryOption = {
  id: string
  // Class, category or kind inside the area, as the table names it.
  group: string
  // Catalogue domain of the entry that names this one, when the catalogue can name it.
  domain: CatalogDomain | null
  // The catalogue entry that names this one when it is not the identifier itself: what a recipe
  // makes, the product of a Twitch or platform reward.
  catalogId?: string
  // A name the table itself gives, for entries the catalogue does not hold (the words of a group).
  name?: string
}

// What a selection needs besides the chosen entries.
export type SelectionContext = {
  // Entries the bridge already puts back in every session ("<kind>=<ID>"); a Twitch or platform
  // selection is added to them, never put in their place.
  keepEntries: readonly string[]
}

type Source = {
  // File of runtime/research and the columns of its table.
  table: string
  idColumn: number
  groupColumn: number
  accept: (cells: readonly string[]) => boolean
  domain: CatalogDomain | null | ((cells: readonly string[]) => CatalogDomain | null)
  // Column that holds the catalogue entry naming the row, when it is not the identifier.
  catalogColumn?: number
  // Column that holds the row's own name, shown as it is.
  nameColumn?: number
  // First of 14 columns holding the row's name, or its group, in each interface language.
  localeNameColumn?: number
  localeGroupColumn?: number
  // Column naming another row of the table whose name, when it has one, is this row's group.
  groupRowColumn?: number
  // Identifiers of the table when they are not 1 to 15 characters.
  idPattern?: RegExp
  changesAccount: boolean
  steps: (
    ids: readonly string[],
    notify: boolean,
    context: SelectionContext
  ) => ReadonlyArray<DeliveryStep | null>
}

const product = (
  classes: readonly string[],
  changesAccount: boolean,
  step: (ids: readonly string[], notify: boolean) => DeliveryStep | null
): Source => ({
  table: 'product-delivery-classification.md',
  idColumn: 0,
  groupColumn: 1,
  accept: (cells) => classes.includes(cells[1]),
  domain: 'product',
  changesAccount,
  steps: (ids, notify) => [step(ids, notify)]
})

// Season rewards and specials are entries of the game's product table, so the catalogue names them
// in the interface language; titles are not.
const account = (kind: string, domain: DeliveryOption['domain'] = null): Source => ({
  table: 'account-unlocks.md',
  idColumn: 1,
  groupColumn: 2,
  accept: (cells) => cells[0] === kind && cells[3] === 'yes',
  domain,
  changesAccount: true,
  steps: (ids) => [steps.account(ids.map((id) => `${kind}=${id}`))]
})

// A Twitch or platform reward: redeemed in the loaded slot, unlocked on the account, and added to
// the list the bridge puts back in every session. Its table row names the product it gives.
const kept = (kind: string): Source => ({
  table: 'account-unlocks.md',
  idColumn: 1,
  groupColumn: 0,
  accept: (cells) => cells[0] === kind && cells[3] === 'yes',
  domain: (cells) => (cells[2] ? 'product' : null),
  catalogColumn: 2,
  changesAccount: true,
  steps: (ids, _notify, context) => {
    const entries = ids.map((id) => `${kind}=${id}`)
    return [
      steps.redeem(ids),
      steps.account(entries),
      steps.keep([...new Set([...context.keepEntries, ...entries])])
    ]
  }
})

const sources: Partial<Record<DeliveryFeatureId, Source>> = {
  technologies: {
    table: 'technology-delivery-classification.md',
    idColumn: 0,
    groupColumn: 1,
    accept: (cells) => cells[2] === 'deliverable',
    domain: 'technology',
    changesAccount: false,
    steps: (ids, notify) => [steps.technology(ids, notify)]
  },
  productRecipes: product(['catalogue_item', 'catalogue_technology'], false, steps.product),
  buildParts: product(['catalogue_construction', 'research_tree'], false, steps.product),
  // A recipe is named by what it makes; several recipes make the same thing.
  refinerRecipes: {
    table: 'recipe-delivery.md',
    idColumn: 0,
    groupColumn: 1,
    accept: (cells) => cells[1] === 'cooking' || cells[1] === 'refiner',
    domain: (cells) => (cells[3] === 'substance' ? 'substance' : 'product'),
    catalogColumn: 2,
    idPattern: /^[A-Z0-9_]{1,31}$/,
    changesAccount: false,
    steps: (ids) => [steps.recipes(ids)]
  },
  customisation: product(['customisation'], true, (ids) => steps.redeem(ids)),
  fishing: {
    table: 'fish-delivery.md',
    idColumn: 0,
    groupColumn: 1,
    accept: (cells) => cells[2] === 'yes',
    domain: 'product',
    changesAccount: false,
    steps: (ids) => [steps.fish(ids)]
  },
  // A word group is named by the words it teaches; the request takes one race at a time.
  words: {
    table: 'word-delivery.md',
    idColumn: 0,
    groupColumn: 1,
    accept: (cells) => wordRaces.some((race) => race.table === cells[1]),
    domain: null,
    nameColumn: 3,
    idPattern: /^[A-Z0-9_'-]{1,31}$/,
    changesAccount: false,
    steps: (ids, notify) =>
      wordRaces
        .map((race) => ({
          race,
          groups: ids
            .filter((id) => id.startsWith(`${race.prefix}_`))
            .map((id) => id.slice(race.prefix.length + 1))
        }))
        .filter((entry) => entry.groups.length > 0)
        .map((entry) => steps.words(entry.race.request, entry.groups, notify))
  },
  // A topic of the game's guide, named with its category by the game's own texts.
  guide: {
    table: 'guide-topics.md',
    idColumn: 0,
    groupColumn: 1,
    accept: (cells) => cells[2] === 'no',
    domain: null,
    localeNameColumn: 4,
    localeGroupColumn: 18,
    idPattern: /^[A-Z0-9_]{1,31}$/,
    changesAccount: false,
    steps: (ids, notify) => [steps.wiki(ids, notify)]
  },
  // A mission is filed under its quest: the titled mission its identifier belongs to, or its table.
  missions: {
    table: 'missions.md',
    idColumn: 0,
    groupColumn: 1,
    accept: () => true,
    domain: null,
    localeNameColumn: 10,
    groupRowColumn: 3,
    changesAccount: false,
    steps: (ids, notify) => steps.missions(ids, notify)
  },
  titles: account('title'),
  // An expedition reward is only unlocked on the account. Claiming it is the player's own act in
  // the game (owner rule of 2026-10-09); it is never recorded as claimed for them.
  expeditions: account('season', 'product'),
  quicksilver: account('special', 'product'),
  twitch: kept('twitch'),
  platform: kept('platform')
}

const identifier = /^[A-Z0-9_]{1,15}$/

export function supportsSelection(feature: DeliveryFeatureId): boolean {
  return feature in sources
}

export async function listDeliveryOptions(
  researchDirectory: string,
  feature: DeliveryFeatureId,
  // Position of the interface language among the 14 language columns of a table.
  localeColumn = 3
): Promise<DeliveryOption[]> {
  const source = sources[feature]
  if (!source) return []
  const pattern = source.idPattern ?? identifier
  const rows = await readClassification(researchDirectory, source.table)
  // Names of the rows by identifier, for a group that is another row of the same table.
  const rowNames = new Map(
    source.groupRowColumn === undefined || source.localeNameColumn === undefined
      ? []
      : rows.map((cells) => [
          cells[source.idColumn],
          cells[source.localeNameColumn! + localeColumn] ?? ''
        ])
  )
  return rows
    .filter((cells) => source.accept(cells) && pattern.test(cells[source.idColumn]))
    .map((cells) => {
      const named = source.catalogColumn === undefined ? '' : cells[source.catalogColumn]
      return {
        id: cells[source.idColumn],
        group:
          source.groupRowColumn !== undefined
            ? rowNames.get(cells[source.groupRowColumn]) || cells[source.groupColumn]
            : source.localeGroupColumn === undefined
              ? cells[source.groupColumn]
              : (cells[source.localeGroupColumn + localeColumn] ?? cells[source.groupColumn]),
        domain: typeof source.domain === 'function' ? source.domain(cells) : source.domain,
        ...(named && identifier.test(named) ? { catalogId: named } : {}),
        ...(source.localeNameColumn !== undefined && cells[source.localeNameColumn + localeColumn]
          ? { name: cells[source.localeNameColumn + localeColumn] }
          : source.nameColumn !== undefined && cells[source.nameColumn]
            ? { name: cells[source.nameColumn] }
            : {})
      }
    })
}

// The plan for the chosen entries, or null when one of them is not an option of the area.
export function getSelectionPlan(
  feature: DeliveryFeatureId,
  chosen: readonly string[],
  options: readonly DeliveryOption[],
  notify: boolean,
  context: SelectionContext = { keepEntries: [] }
): DeliveryPlan | null {
  const source = sources[feature]
  const allowed = new Set(options.map((option) => option.id))
  const ids = [...new Set(chosen)]
  if (!source || ids.length < 1) return null
  const pattern = source.idPattern ?? identifier
  if (!ids.every((id) => pattern.test(id) && allowed.has(id))) return null
  const built = source.steps(ids, notify, context)
  // A step that cannot be built makes the whole selection unsendable: half of it is not sent.
  if (built.length < 1 || built.some((step) => step === null)) return null
  return { changesAccount: source.changesAccount, steps: built as DeliveryStep[] }
}
