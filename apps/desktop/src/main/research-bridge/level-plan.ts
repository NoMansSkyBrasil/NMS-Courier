import { readClassification } from './delivery-plan'
import type { DeliveryPlan } from './delivery-plan'

// Levels of journey milestones and standings for the loaded slot through the game's own stat
// reward (bridge 1.23.0, runtime/native/asi/profile_180836/stat_level.h). The bridge reads each
// stat with the game's routine and sets the value of the level a number of levels above; it never
// lowers one. The stats and the values of their levels come from the generated table
// runtime/research/stat-levels.md.

export const levelPages = ['standings', 'milestones'] as const
export type LevelPage = (typeof levelPages)[number]

// A levelled stat has levels 0 to 10, so ten levels up always reaches the last one.
export const levelTop = 10
// Stats one request of the bridge takes.
const statsPerRequest = 64
const levelCount = levelTop + 1
// Columns of stat-levels.md before the 14 titles, and of stat-sections.md before the 14 names.
const statColumns = 8
const sectionColumns = 1

export type LevelMessage = 'full' | 'quick' | 'silent'

export type LevelStat = {
  id: string
  // What the list shows first and what it shows as the kind of the row.
  name: string
  group: string
  // Values of levels 0 to 10.
  levels: number[]
  // How the game announces a new level of this stat; it shows nothing for a silent one.
  message: LevelMessage
  // Game text identifier of the stat's title, shown when a silent stat is made to announce.
  text: string
}

export type LevelRequest = {
  page: LevelPage
  // Chosen stats, or null for every stat of the page.
  stats: string[] | null
  // Levels to go up, 1 to 10.
  levels: number
  // Ask for the game's full milestone message on stats the game keeps silent.
  announce: boolean
  notify: boolean
}

export function isLevelPage(value: unknown): value is LevelPage {
  return typeof value === 'string' && (levelPages as readonly string[]).includes(value)
}

export function isLevelRequest(value: unknown): value is LevelRequest {
  if (!value || typeof value !== 'object') return false
  const request = value as Record<string, unknown>
  return (
    isLevelPage(request.page) &&
    (request.stats === null ||
      (Array.isArray(request.stats) && request.stats.every((stat) => typeof stat === 'string'))) &&
    typeof request.levels === 'number' &&
    typeof request.announce === 'boolean' &&
    typeof request.notify === 'boolean'
  )
}

const identifier = /^[A-Z0-9_]{1,15}$/
const textIdentifier = /^[A-Z0-9_]{1,31}$/

// The stats of a page that a request may raise, named in the interface language. `localeColumn` is
// the position of that language among the 14 language columns of the tables.
export async function listLevelStats(
  researchDirectory: string,
  page: LevelPage,
  localeColumn: number
): Promise<LevelStat[]> {
  const sections = new Map(
    (await readClassification(researchDirectory, 'stat-sections.md')).map((cells) => [
      cells[0],
      cells[sectionColumns + localeColumn] ?? cells[0]
    ])
  )
  const order = [...sections.keys()]
  const rows = await readClassification(researchDirectory, 'stat-levels.md')
  return rows
    .filter((cells) => cells[1] === page && cells[4] === 'yes' && identifier.test(cells[0]))
    .sort((a, b) => order.indexOf(a[2]) - order.indexOf(b[2]))
    .map((cells) => {
      const levels = cells[5].split(' ').map(Number)
      const message: LevelMessage =
        cells[6] === 'Full' ? 'full' : cells[6] === 'Quick' ? 'quick' : 'silent'
      const title = cells[statColumns + localeColumn] ?? cells[0]
      const section = sections.get(cells[2]) ?? cells[2]
      // Every standing has the same title, so its row is named by whom it is with.
      return page === 'standings'
        ? { id: cells[0], name: section, group: title, levels, message, text: cells[7] }
        : { id: cells[0], name: title, group: section, levels, message, text: cells[7] }
    })
    .filter(
      (stat) =>
        stat.levels.length === levelCount &&
        stat.levels.every(
          (value, index) =>
            Number.isInteger(value) && (index === 0 || value >= stat.levels[index - 1])
        ) &&
        stat.levels[levelTop] > stat.levels[0]
    )
}

// The plan for a request, or null when it asks for a stat the page does not offer.
export function getLevelPlan(
  request: LevelRequest,
  stats: readonly LevelStat[]
): DeliveryPlan | null {
  const { levels } = request
  if (!Number.isInteger(levels) || levels < 1 || levels > levelTop) return null
  const offered = new Map(stats.map((stat) => [stat.id, stat]))
  const chosen = request.stats === null ? [...offered.keys()] : [...new Set(request.stats)]
  if (chosen.length < 1 || !chosen.every((id) => offered.has(id))) return null
  const steps: DeliveryPlan['steps'][number][] = []
  for (let start = 0; start < chosen.length; start += statsPerRequest) {
    steps.push({
      label: 'stats',
      request: {
        name: 'stat-request',
        perProcess: true,
        lines: [
          `silent=${request.notify ? 0 : 1}`,
          `raise=${levels}`,
          `announce=${request.announce ? 1 : 0}`,
          ...chosen.slice(start, start + statsPerRequest).map((id) => {
            const stat = offered.get(id)!
            const shown = textIdentifier.test(stat.text) ? `,${stat.text}` : ''
            return `stat=${id},${stat.levels.join(',')}${shown}`
          })
        ]
      },
      signals: ['stats'],
      result: { name: 'stat-result', seconds: 12 },
      // unknown_reward: the game has not loaded the data file. bad_layout: nothing was called.
      accept: (lines) => lines.includes('result=given')
    })
  }
  return { changesAccount: false, steps }
}
