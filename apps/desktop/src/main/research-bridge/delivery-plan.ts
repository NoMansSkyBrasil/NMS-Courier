import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { bridgeReleases, compatibleBridgeVersions } from './bridge-version'
import type { BridgeStep } from './bridge-client'

// What the application may ask the bridge to do, as data. The renderer names an area or chooses
// entries; this module turns that into the request lines the bridge reads. Which entries an area
// has comes from the generated classification tables of runtime/research, so a blocked entry is
// never part of a request.

export const researchBridgeBuild = '180836'
// Executable of that build, as distributed by Steam.
export const researchBridgeGameSha256 =
  '13d5060d4efb9d2a6a6b1b349bc4257231056cc2a055df4bb15d816262cc3499'

// Bridge builds the application can send to: the listed builds of a compatible version.
export const testedBridgeSha256: readonly string[] = Object.entries(bridgeReleases)
  .filter(([, version]) => version !== null && compatibleBridgeVersions.includes(version))
  .map(([sha256]) => sha256)

export const deliveryFeatureIds = [
  'technologies',
  'productRecipes',
  'buildParts',
  'refinerRecipes',
  'customisation',
  'fishing',
  'words',
  'titles',
  'expeditions',
  'quicksilver',
  'twitch',
  'platform'
] as const
export type DeliveryFeatureId = (typeof deliveryFeatureIds)[number]

export type DeliveryStep = BridgeStep

export type DeliveryPlan = {
  // An account change needs the user settings file in the backup as well as the save folder.
  changesAccount: boolean
  steps: readonly DeliveryStep[]
}

export function isDeliveryFeatureId(value: unknown): value is DeliveryFeatureId {
  return typeof value === 'string' && (deliveryFeatureIds as readonly string[]).includes(value)
}

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

export async function readClassification(
  researchDirectory: string,
  table: string
): Promise<string[][]> {
  const text = await readFile(join(researchDirectory, table), 'utf8').catch(() => '')
  return parseMarkdownRows(text)
}

const identifier = /^[A-Z0-9_]{1,15}$/
const request = (name: string, lines: readonly string[]): BridgeStep['request'] => ({
  name: `${name}-request`,
  perProcess: true,
  lines
})

// The request each kind of entry travels in. Every builder returns null when the entries do not
// fit one request of the bridge.
// The races that have words: the game's name in the word table, the name a request takes, and the
// prefix of the race's groups.
export const wordRaces = [
  { table: 'Traders', request: 'traders', prefix: 'TRA' },
  { table: 'Warriors', request: 'warriors', prefix: 'WAR' },
  { table: 'Explorers', request: 'explorers', prefix: 'EXP' },
  { table: 'Atlas', request: 'atlas', prefix: 'ATLAS' },
  { table: 'Builders', request: 'builders', prefix: 'BUI' }
] as const

export const steps = {
  technology: (ids: readonly string[], notify: boolean): BridgeStep | null =>
    ids.length < 1 || ids.length > 256
      ? null
      : {
          label: 'technology',
          request: request('technology', [
            `silent=${notify ? 0 : 1}`,
            ...ids.map((id) => `id=${id}`)
          ]),
          signals: ['technology'],
          result: { name: 'technology-result', seconds: 12 }
        },
  product: (ids: readonly string[], notify: boolean): BridgeStep | null =>
    ids.length < 1 || ids.length > 2048
      ? null
      : {
          label: 'product',
          request: request('product', [`silent=${notify ? 0 : 1}`, ...ids.map((id) => `id=${id}`)]),
          signals: ['product'],
          result: { name: 'product-result', seconds: 20 }
        },
  // Appearance options go through the slot's redeem routine.
  redeem: (ids: readonly string[]): BridgeStep | null =>
    ids.length < 1 || ids.length > 512
      ? null
      : {
          label: 'redeem',
          request: request(
            'redeem',
            ids.map((id) => `id=${id}`)
          ),
          signals: ['redeem'],
          result: { name: 'redeem-result', seconds: 12 }
        },
  // Lines are "<kind>=<ID>" with kind title, special, season, twitch or platform.
  account: (entries: readonly string[]): BridgeStep | null =>
    entries.length < 1 || entries.length > 2048
      ? null
      : {
          label: 'account',
          request: request('account', entries),
          signals: ['account'],
          result: { name: 'account-result', seconds: 20 }
        },
  // The list the bridge re-applies in every game session; it is read at game start as well.
  keep: (entries: readonly string[]): BridgeStep | null =>
    entries.length < 1 || entries.length > 1024
      ? null
      : {
          label: 'keep',
          request: { name: 'account-keep', perProcess: false, lines: entries },
          signals: ['keep'],
          result: { name: 'account-keep-status', seconds: 14 }
        },
  allRecipes: (): BridgeStep => ({
    label: 'recipe',
    request: request('recipe', ['all=1']),
    signals: ['recipes'],
    result: { name: 'recipe-result', seconds: 12 }
  }),
  // Chosen refiner and cooking recipes, by the game's recipe identifiers.
  recipes: (ids: readonly string[]): BridgeStep | null =>
    ids.length < 1 || ids.length > 4096
      ? null
      : {
          label: 'recipe',
          request: request(
            'recipe',
            ids.map((id) => `id=${id}`)
          ),
          signals: ['recipes'],
          result: { name: 'recipe-result', seconds: 12 }
        },
  // The request file is always written (bridge 1.20.0 reads it), so a selection left over from an
  // earlier request can never narrow "all".
  fishingRecord: (): BridgeStep => ({
    label: 'fish',
    request: request('fish', ['all=1']),
    signals: ['fish'],
    result: { name: 'fish-result', seconds: 12 }
  }),
  // Word groups of one race, by the suffix the game's reward takes (bridge 1.22.0). The game shows
  // its message for each word unless silent.
  words: (race: string, groups: readonly string[], notify: boolean): BridgeStep | null =>
    groups.length < 1 || groups.length > 4096
      ? null
      : {
          label: `words ${race}`,
          request: request('word', [
            `race=${race}`,
            `silent=${notify ? 0 : 1}`,
            ...groups.map((group) => `group=${group}`)
          ]),
          signals: ['words'],
          result: { name: 'word-result', seconds: 30 },
          accept: (lines) => lines.includes('result=given')
        },
  // Chosen fish, by product identifier (bridge 1.20.0).
  fish: (ids: readonly string[]): BridgeStep | null =>
    ids.length < 1 || ids.length > 512
      ? null
      : {
          label: 'fish',
          request: request(
            'fish',
            ids.map((id) => `id=${id}`)
          ),
          signals: ['fish'],
          result: { name: 'fish-result', seconds: 12 }
        }
}

async function idsOfClass(
  researchDirectory: string,
  table: string,
  idColumn: number,
  accept: (cells: readonly string[]) => boolean
): Promise<string[]> {
  const rows = await readClassification(researchDirectory, table)
  return rows
    .filter((cells) => accept(cells) && identifier.test(cells[idColumn]))
    .map((cells) => cells[idColumn])
}

const rewardTable = 'unlockable-rewards.md'
const productTable = 'product-delivery-classification.md'
const accountTable = 'account-unlocks.md'

async function accountEntries(
  researchDirectory: string,
  kinds: readonly string[]
): Promise<string[]> {
  const rows = await readClassification(researchDirectory, accountTable)
  return rows
    .filter((cells) => kinds.includes(cells[0]) && cells[3] === 'yes' && identifier.test(cells[1]))
    .map((cells) => `${cells[0]}=${cells[1]}`)
}

function plan(
  changesAccount: boolean,
  built: ReadonlyArray<BridgeStep | null>
): DeliveryPlan | null {
  return built.every((step): step is BridgeStep => step !== null)
    ? { changesAccount, steps: built }
    : null
}

// Everything of one area. Null when a table is missing or does not fit a request.
export async function getDeliveryPlan(
  feature: DeliveryFeatureId,
  researchDirectory: string,
  notify: boolean
): Promise<DeliveryPlan | null> {
  const products = (classes: readonly string[]): Promise<string[]> =>
    idsOfClass(researchDirectory, productTable, 0, (cells) => classes.includes(cells[1]))
  // Twitch and platform rewards are put back by the bridge in every session, see the keep list.
  const keep = async (): Promise<BridgeStep | null> =>
    steps.keep(await accountEntries(researchDirectory, ['twitch', 'platform']))

  // Rewards are redeemed in the loaded slot first, then unlocked on the account, so both states
  // exist (columns: ID, kind, expedition, product, flags, deliverable).
  const redeem = async (kind: string): Promise<BridgeStep | null> =>
    steps.redeem(
      await idsOfClass(
        researchDirectory,
        rewardTable,
        0,
        (cells) => cells[1] === kind && cells[5] === 'yes'
      )
    )

  switch (feature) {
    case 'technologies':
      return plan(false, [
        steps.technology(
          await idsOfClass(
            researchDirectory,
            'technology-delivery-classification.md',
            0,
            (cells) => cells[2] === 'deliverable'
          ),
          notify
        )
      ])
    case 'productRecipes':
      return plan(false, [
        steps.product(await products(['catalogue_item']), notify),
        steps.product(await products(['catalogue_technology']), notify)
      ])
    case 'buildParts':
      return plan(false, [
        steps.product(await products(['catalogue_construction']), notify),
        steps.product(await products(['research_tree']), notify)
      ])
    case 'refinerRecipes':
      return plan(false, [steps.allRecipes()])
    case 'customisation':
      return plan(true, [steps.redeem(await products(['customisation']))])
    case 'fishing':
      return plan(false, [steps.fishingRecord()])
    case 'words': {
      // Every group of every race: one request a race (columns: group, race, suffix, words, category).
      const rows = await readClassification(researchDirectory, 'word-delivery.md')
      return plan(
        false,
        wordRaces.map((race) =>
          steps.words(
            race.request,
            rows.filter((cells) => cells[1] === race.table).map((cells) => cells[2]),
            notify
          )
        )
      )
    }
    case 'titles':
      return plan(true, [steps.account(await accountEntries(researchDirectory, ['title']))])
    case 'expeditions':
      return plan(true, [
        await redeem('season'),
        steps.account(await accountEntries(researchDirectory, ['season']))
      ])
    case 'quicksilver':
      return plan(true, [steps.account(await accountEntries(researchDirectory, ['special']))])
    case 'twitch':
      return plan(true, [
        await redeem('twitch'),
        steps.account(await accountEntries(researchDirectory, ['twitch'])),
        await keep()
      ])
    case 'platform':
      return plan(true, [
        await redeem('platform'),
        steps.account(await accountEntries(researchDirectory, ['platform'])),
        await keep()
      ])
  }
}

export type ItemRequest = { id: string; amount: number }

// Items for the exosuit cargo of the loaded slot, or null when the request is not well formed.
// With `notify` the game gives the items through its reward routine and shows its notification;
// without it they go straight into the cargo and nothing is shown.
export function getItemPlan(items: readonly ItemRequest[], notify: boolean): DeliveryPlan | null {
  const ids = new Set(items.map((item) => item.id))
  if (items.length < 1 || items.length > 32 || ids.size !== items.length) return null
  const valid = items.every(
    (item) =>
      identifier.test(item.id) &&
      Number.isInteger(item.amount) &&
      item.amount >= 1 &&
      item.amount <= 999999
  )
  if (!valid) return null
  return {
    changesAccount: false,
    steps: [
      {
        label: 'item',
        request: request('item', [
          `silent=${notify ? 0 : 1}`,
          ...items.map((item) => `${item.id}=${item.amount}`)
        ]),
        signals: ['item'],
        result: { name: 'item-result', seconds: 12 },
        // Nothing went in when every line ends in a refusal.
        accept: (lines) => lines.some((line) => /=(added|rewarded|partial)$/.test(line))
      }
    ]
  }
}
