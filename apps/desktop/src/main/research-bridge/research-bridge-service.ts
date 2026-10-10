import { parseStarSystemReport } from '../../shared/star-system'
import { getGlyphPlan, type GlyphRequest } from './glyph-plan'
import {
  getLevelPlan,
  listLevelStats,
  type LevelPage,
  type LevelRequest,
  type LevelStat
} from './level-plan'
import { readClassification, wordRaces } from './delivery-plan'
import { getTeleportPlan, type TeleportRequest } from './teleport-plan'
import { getInstallPlan, installResultName } from './install-plan'
import { getGiftPlan, giftResultName } from './gift-plan'
import { parseGiftResult, type GiftReport, type GiftRequest } from '../../shared/player-gift'
import { getPlanetSearchPlan, planetSearchResultName } from './planet-search-plan'
import { getRechargePlan, getRepairPlan } from './upkeep-plan'
import type { RepairGroup } from '../../shared/upkeep'
import {
  parsePlanetSearch,
  type PlanetSearchReport,
  type PlanetSearchRequest
} from '../../shared/planet-search'
import { getBridgeInstallState, installBridge, type BridgeInstallState } from './bridge-installer'
import {
  parseInstallResult,
  type InstallRequest,
  type WaitingTechnology
} from '../../shared/waiting-technology'
import type { StarSystemReport } from '../../shared/star-system'
import { getSelectionPlan, listDeliveryOptions, type DeliveryOption } from './delivery-options'
import { createHash } from 'node:crypto'
import { cp, mkdir, readFile, stat } from 'node:fs/promises'
import { join } from 'node:path'
import type { GameProcessStatus } from '../game-status-service'
import { bridgeReleases, bridgeVersion } from './bridge-version'
import {
  currencyDataFile,
  currencyDataSha256,
  getCurrencyPlan,
  type CurrencyRequest
} from './currency-plan'
import { getEquipmentPlan, type EquipmentArea, type EquipmentRequest } from './equipment-plan'
import {
  BridgeClient,
  type BridgeGame,
  type BridgeStep,
  type BridgeStepResult
} from './bridge-client'
import {
  getDeliveryPlan,
  getItemPlan,
  testedBridgeSha256,
  type DeliveryFeatureId,
  type DeliveryPlan,
  type ItemRequest
} from './delivery-plan'

export type ResearchBridgeStatus = {
  state:
    | 'unavailable' // packaged build, or the classification tables are not present
    | 'installation_not_selected'
    | 'game_not_running'
    | 'bridge_missing'
    | 'bridge_untested'
    | 'ready'
  processId: number | null
  bridgeSha256: string | null
  // Version of the installed bridge; null when none is installed or it predates versions.
  installedBridgeVersion: string | null
  // Version this application was built with.
  bridgeVersion: string
}

export type StackLimits = {
  substanceBase: number
  substanceCap: number
  productBase: number
  productCap: number
}

export type DeliveryStepResult = BridgeStepResult

export type MissionRow = {
  id: string
  // Title in the interface language; empty when the game gives the mission none.
  title: string
  // The line the game's log shows under the title.
  subtitle: string
  // The titled mission this one is filed under, and its title; empty when there is none.
  quest: string
  questTitle: string
  table: string
  // The game's class of the mission (Primary, Secondary, Guide, Seasonal and so on).
  kind: string
  stages: number
  // Reward table entries the mission's stages hand over.
  rewards: string[]
  // Missions the game requires complete before it starts this one.
  after: string[]
  // Whether the game shows its message when this mission is completed.
  announced: boolean
}

export type DeliveryResult = {
  feature:
    | DeliveryFeatureId
    | 'items'
    | 'currencies'
    | 'teleport'
    | 'glyphs'
    | 'pendingTech'
    | 'planets'
    | 'upkeep'
    | 'bridge'
    | 'gift'
    | LevelPage
    | EquipmentArea
  // "refused" means nothing was sent. After "unknown" or "failed" the remaining steps are not run.
  outcome: 'completed' | 'unknown' | 'failed' | 'refused'
  reason:
    | ResearchBridgeStatus['state']
    | 'busy'
    | 'backup_failed'
    | 'selection_invalid'
    | 'currency_data_missing'
    | null
  startedAt: string
  backupPath: string | null
  steps: DeliveryStepResult[]
}

// What a listing or a finish of waiting technologies gave: how the request went and the
// technologies the bridge reported, each with what happened to it.
export type WaitingTechnologyReport = {
  delivery: DeliveryResult
  truncated: boolean
  entries: WaitingTechnology[]
}

// Sends one request to the bridge of a running game; replaced in tests.
export type StepSender = (game: BridgeGame, step: BridgeStep) => Promise<BridgeStepResult>

export type ResearchBridgeContext = {
  // False in a packaged application: the research bridge is a development capability.
  enabled: boolean
  // The generated classification tables of runtime/research, which say what each area holds.
  researchDirectory: string
  // Where the bridge writes its status and result files.
  diagnosticsDirectory: string
  backupDirectory: string
  saveDirectory: string
  // The bridge and the data file the application carries, to install into the game.
  bridgeResourceDirectory: string
}

// Sends the deliveries of the research profile on behalf of the interface. It owns the order of
// work the project requires around a live change: check, back up, send once, report, never retry.
// Columns of runtime/research/galaxy-names.md after the number, in the table's order; the word
// names table has the same columns after its five race columns.
const galaxyNameLocales = [
  'pt-BR',
  'pt-PT',
  'ja-JP',
  'en-US',
  'fr-FR',
  'it-IT',
  'de-DE',
  'es-ES',
  'nl-NL',
  'ko-KR',
  'pl-PL',
  'ru-RU',
  'zh-CN',
  'zh-TW'
]

export class ResearchBridgeService {
  private busy = false
  private readonly activity: DeliveryResult[] = []

  constructor(
    private readonly context: ResearchBridgeContext,
    private readonly sendStep: StepSender = (game, step) =>
      new BridgeClient(context.diagnosticsDirectory).send(game, step)
  ) {}

  async getStatus(
    installationRoot: string | null,
    game: GameProcessStatus
  ): Promise<ResearchBridgeStatus> {
    const none = {
      processId: null,
      bridgeSha256: null,
      installedBridgeVersion: null,
      bridgeVersion
    }
    if (!this.context.enabled || !(await exists(this.context.researchDirectory))) {
      return { state: 'unavailable', ...none }
    }
    if (!installationRoot) return { state: 'installation_not_selected', ...none }
    const bridgeSha256 = await sha256OfFile(join(installationRoot, 'Binaries', 'xinput9_1_0.dll'))
    if (!bridgeSha256) return { state: 'bridge_missing', ...none }
    const installed = {
      bridgeSha256,
      installedBridgeVersion: bridgeReleases[bridgeSha256] ?? null,
      bridgeVersion
    }
    if (!testedBridgeSha256.includes(bridgeSha256)) {
      return { state: 'bridge_untested', processId: null, ...installed }
    }
    if (game.state !== 'running' || game.processId === null) {
      return { state: 'game_not_running', processId: null, ...installed }
    }
    return { state: 'ready', processId: game.processId, ...installed }
  }

  // Whether the application's files are in the game folder, and whether they can be put there.
  getInstallState(installationRoot: string, game: GameProcessStatus): Promise<BridgeInstallState> {
    return getBridgeInstallState(
      installationRoot,
      this.context.bridgeResourceDirectory,
      game.state === 'running'
    )
  }

  // Copies the bridge and the data file into the game folder; never while the game runs.
  installIntoGame(installationRoot: string, game: GameProcessStatus): Promise<BridgeInstallState> {
    return installBridge(
      installationRoot,
      this.context.bridgeResourceDirectory,
      game.state === 'running'
    )
  }

  getOptions(feature: DeliveryFeatureId, locale = 'en-US'): Promise<DeliveryOption[]> {
    const column = galaxyNameLocales.indexOf(locale)
    return listDeliveryOptions(
      this.context.researchDirectory,
      feature,
      column < 0 ? galaxyNameLocales.indexOf('en-US') : column
    )
  }

  // The list the bridge puts back in every session, as it was last written ("<kind>=<ID>" lines).
  private async keepEntries(): Promise<string[]> {
    const text = await readFile(
      join(this.context.diagnosticsDirectory, 'native-account-keep-180836.txt'),
      'utf8'
    ).catch(() => '')
    return text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => /^(twitch|platform)=[A-Z0-9_]{1,15}$/.test(line))
  }

  // Stack sizes of the exosuit cargo, as the running bridge last reported them; null before the
  // game has a save loaded or with an older bridge.
  async getStackLimits(processId: number | null): Promise<StackLimits | null> {
    if (processId === null) return null
    const text = await readFile(
      join(this.context.diagnosticsDirectory, `native-item-limits-180836-${processId}.txt`),
      'utf8'
    ).catch(() => '')
    const value = (name: string): number =>
      Number(new RegExp(`^${name}=(-?\\d+)$`, 'm').exec(text)?.[1] ?? -1)
    const limits = {
      substanceBase: value('substance_base'),
      substanceCap: value('substance_cap'),
      productBase: value('product_base'),
      productCap: value('product_cap')
    }
    return Object.values(limits).every((entry) => entry > 0) ? limits : null
  }

  // The star system the player is in and its ships, as the running bridge last reported them.
  async getStarSystem(processId: number | null): Promise<StarSystemReport> {
    if (processId === null) return { state: 'unavailable' }
    const text = await readFile(
      join(this.context.diagnosticsDirectory, `native-star-system-180836-${processId}.txt`),
      'utf8'
    ).catch(() => '')
    return parseStarSystemReport(text)
  }

  getActivity(): DeliveryResult[] {
    return [...this.activity].reverse()
  }

  async deliver(
    feature: DeliveryFeatureId,
    installationRoot: string | null,
    game: GameProcessStatus,
    // Chosen entries; without them the whole area is sent.
    chosen: readonly string[] | null = null,
    // Let the game show its own notifications where the routine has them.
    notify = true
  ): Promise<DeliveryResult> {
    const plan = chosen
      ? getSelectionPlan(feature, chosen, await this.getOptions(feature), notify, {
          keepEntries: await this.keepEntries()
        })
      : await getDeliveryPlan(feature, this.context.researchDirectory, notify)
    return this.run(feature, plan, installationRoot, game)
  }

  // Substances and products for the exosuit cargo of the loaded slot.
  deliverItems(
    items: readonly ItemRequest[],
    installationRoot: string | null,
    game: GameProcessStatus,
    notify = true
  ): Promise<DeliveryResult> {
    return this.run('items', getItemPlan(items, notify), installationRoot, game)
  }

  // Inventory grids, class steps, a freighter offer or a corvette build, with the chosen options.
  deliverEquipment(
    request: EquipmentRequest,
    installationRoot: string | null,
    game: GameProcessStatus
  ): Promise<DeliveryResult> {
    return this.run(request.area, getEquipmentPlan(request), installationRoot, game)
  }

  // Units, nanites or quicksilver. The game can only give them when the currency rewards data file
  // is in its mod folder, so its presence and content are checked first.
  async deliverCurrency(
    request: CurrencyRequest,
    installationRoot: string | null,
    game: GameProcessStatus,
    notify = true
  ): Promise<DeliveryResult> {
    const data = installationRoot
      ? await sha256OfFile(join(installationRoot, ...currencyDataFile))
      : null
    if (installationRoot && data !== currencyDataSha256) {
      return this.record({
        feature: 'currencies',
        outcome: 'refused',
        reason: 'currency_data_missing',
        startedAt: new Date().toISOString(),
        backupPath: null,
        steps: []
      })
    }
    return this.run('currencies', getCurrencyPlan(request, notify), installationRoot, game)
  }

  // Names of the galaxies in order, the first being galaxy 1; empty when the table cannot be read.
  async getGalaxyNames(locale: string): Promise<string[]> {
    const column = galaxyNameLocales.indexOf(locale)
    const rows = await readClassification(this.context.researchDirectory, 'galaxy-names.md')
    if (rows.length !== 256) return []
    return rows.map(
      (cells) => cells[(column < 0 ? galaxyNameLocales.indexOf('en-US') : column) + 1]
    )
  }

  // Every alien word: its identifier, its text in the interface language and, for the five races
  // in the order of wordRaces, the group that teaches it (empty where the race lacks the word).
  async getWordRows(
    locale: string
  ): Promise<Array<{ id: string; text: string; groups: string[] }>> {
    const column = galaxyNameLocales.indexOf(locale)
    const rows = await readClassification(this.context.researchDirectory, 'word-names.md')
    const text = 1 + wordRaces.length + (column < 0 ? galaxyNameLocales.indexOf('en-US') : column)
    return rows
      .filter((cells) => cells.length === 1 + wordRaces.length + galaxyNameLocales.length)
      .map((cells) => ({
        id: cells[0],
        text: cells[text],
        groups: cells.slice(1, 1 + wordRaces.length)
      }))
  }

  // Every mission of the list with its quest, for the Missions page (runtime/research/missions.md:
  // mission, table, class, quest, stages, rewards, after, next, auto, message, then 14 titles and 14
  // subtitles).
  async getMissions(locale: string): Promise<MissionRow[]> {
    const column = galaxyNameLocales.indexOf(locale)
    const title = 10 + (column < 0 ? galaxyNameLocales.indexOf('en-US') : column)
    const rows = await readClassification(this.context.researchDirectory, 'missions.md')
    const titles = new Map(rows.map((cells) => [cells[0], cells[title] ?? '']))
    return rows
      .filter((cells) => /^[A-Z0-9_]{1,15}$/.test(cells[0]))
      .map((cells) => ({
        id: cells[0],
        title: cells[title] ?? '',
        subtitle: cells[title + galaxyNameLocales.length] ?? '',
        quest: cells[3],
        questTitle: titles.get(cells[3]) ?? '',
        table: cells[1],
        kind: cells[2],
        stages: Number(cells[4]) || 0,
        rewards: cells[5] ? cells[5].split(' ') : [],
        after: cells[6] ? cells[6].split(' ') : [],
        announced: cells[9] !== 'Never'
      }))
  }

  // The levelled stats of a page (standings or milestones), named in the interface language.
  getLevelStats(page: LevelPage, locale: string): Promise<LevelStat[]> {
    const column = galaxyNameLocales.indexOf(locale)
    return listLevelStats(
      this.context.researchDirectory,
      page,
      column < 0 ? galaxyNameLocales.indexOf('en-US') : column
    )
  }

  // Levels of standings or milestones through the game's own stat reward.
  async raiseLevels(
    request: LevelRequest,
    installationRoot: string | null,
    game: GameProcessStatus
  ): Promise<DeliveryResult> {
    const stats = await this.getLevelStats(request.page, 'en-US')
    return this.run(request.page, getLevelPlan(request, stats), installationRoot, game)
  }

  // Portal glyphs through the game's own reward: all, or the next ones in the game's order.
  discoverGlyphs(
    request: GlyphRequest,
    installationRoot: string | null,
    game: GameProcessStatus
  ): Promise<DeliveryResult> {
    return this.run('glyphs', getGlyphPlan(request), installationRoot, game)
  }

  // One journey of the player to a star system, made by the running game.
  teleport(
    request: TeleportRequest,
    installationRoot: string | null,
    game: GameProcessStatus
  ): Promise<DeliveryResult> {
    return this.run('teleport', getTeleportPlan(request), installationRoot, game)
  }

  // Another player of the session: list the players, or have the game send one of them an item.
  // Nothing changes in this player's save, so no backup is made.
  async gift(
    request: GiftRequest | 'list',
    installationRoot: string | null,
    game: GameProcessStatus
  ): Promise<{ delivery: DeliveryResult } & GiftReport> {
    const delivery = await this.run('gift', getGiftPlan(request), installationRoot, game, false)
    const report = delivery.steps.length > 0 ? await this.getGiftReport(game.processId) : null
    return {
      delivery,
      result: report?.result ?? 'not_ready',
      answer: report?.answer ?? 'none',
      players: report?.players ?? []
    }
  }

  // The bridge writes its gift answer again when the other player's game answers.
  async getGiftReport(processId: number | null): Promise<GiftReport | null> {
    if (processId === null) return null
    const text = await readFile(
      join(this.context.diagnosticsDirectory, `native-${giftResultName}-180836-${processId}.txt`),
      'utf8'
    ).catch(() => '')
    return parseGiftResult(text)
  }

  // Diagnostic: switches the bridge's list of the rewards the game gives on or off. Reads only.
  rewardTrace(
    on: boolean,
    installationRoot: string | null,
    game: GameProcessStatus
  ): Promise<DeliveryResult> {
    return this.run(
      'bridge',
      {
        changesAccount: false,
        steps: [
          {
            label: 'reward-trace',
            request: {
              name: 'rewardtrace-request',
              perProcess: true,
              lines: [`trace=${on ? 1 : 0}`]
            },
            signals: ['rewardtrace'],
            result: { name: 'rewardtrace-result', seconds: 12 }
          }
        ]
      },
      installationRoot,
      game,
      false
    )
  }

  // The lines the reward trace last wrote: "call=<reward>,<mission>,<seed>,<seed in use>,<caller>,…".
  async getRewardTrace(processId: number | null): Promise<string[]> {
    if (processId === null) return []
    const text = await readFile(
      join(this.context.diagnosticsDirectory, `native-rewardtrace-result-180836-${processId}.txt`),
      'utf8'
    ).catch(() => '')
    return text.split(/\r?\n/).filter((line) => line.trim())
  }

  // Has the game repair every damaged technology of the chosen inventories.
  repair(
    groups: readonly RepairGroup[],
    notify: boolean,
    installationRoot: string | null,
    game: GameProcessStatus
  ): Promise<DeliveryResult> {
    return this.run('upkeep', getRepairPlan(groups, notify), installationRoot, game)
  }

  // Has the game recharge the technologies whose charge is under the threshold. The automatic
  // recharge calls this often: it backs the saves up once, when it is switched on, and keeps its
  // runs out of the activity list.
  async recharge(
    threshold: number,
    notify: boolean,
    installationRoot: string | null,
    game: GameProcessStatus,
    automatic: { backup: boolean } | null = null
  ): Promise<DeliveryResult> {
    const result = await this.run(
      'upkeep',
      getRechargePlan(threshold, notify),
      installationRoot,
      game,
      automatic ? automatic.backup : true
    )
    if (automatic && this.activity[this.activity.length - 1] === result) this.activity.pop()
    return result
  }

  // Starts, or stops, the search for planets around the player. The game's generators are only
  // read from, so no backup is made.
  planetSearch(
    request: PlanetSearchRequest | 'stop',
    installationRoot: string | null,
    game: GameProcessStatus
  ): Promise<DeliveryResult> {
    return this.run('planets', getPlanetSearchPlan(request), installationRoot, game, false)
  }

  // What the search has found so far, as the bridge last wrote it; null when none ran.
  async getPlanetSearch(processId: number | null): Promise<PlanetSearchReport | null> {
    if (processId === null) return null
    const text = await readFile(
      join(
        this.context.diagnosticsDirectory,
        `native-${planetSearchResultName}-180836-${processId}.txt`
      ),
      'utf8'
    ).catch(() => '')
    return parsePlanetSearch(text)
  }

  // Technologies waiting for their components in every inventory of the loaded save. A listing
  // only reads, so it makes no backup; a finish has the game complete the named ones, or all.
  async waitingTechnologies(
    request: InstallRequest | 'list',
    installationRoot: string | null,
    game: GameProcessStatus
  ): Promise<WaitingTechnologyReport> {
    const delivery = await this.run(
      'pendingTech',
      getInstallPlan(request),
      installationRoot,
      game,
      request !== 'list'
    )
    // The whole answer is read from the bridge's file: the step keeps only a summary of it.
    const text =
      delivery.steps.length > 0 && game.processId !== null
        ? await readFile(
            join(
              this.context.diagnosticsDirectory,
              `native-${installResultName}-180836-${game.processId}.txt`
            ),
            'utf8'
          ).catch(() => '')
        : ''
    const report = parseInstallResult(text)
    return { delivery, truncated: report?.truncated ?? false, entries: report?.entries ?? [] }
  }

  private async run(
    feature: DeliveryResult['feature'],
    plan: DeliveryPlan | null,
    installationRoot: string | null,
    game: GameProcessStatus,
    // False only for a request that reads and changes nothing.
    backup = true
  ): Promise<DeliveryResult> {
    const result: DeliveryResult = {
      feature,
      outcome: 'refused',
      reason: null,
      startedAt: new Date().toISOString(),
      backupPath: null,
      steps: []
    }
    if (this.busy) return this.record({ ...result, reason: 'busy' })
    this.busy = true
    try {
      const status = await this.getStatus(installationRoot, game)
      if (status.state !== 'ready' || !installationRoot || !status.bridgeSha256) {
        return this.record({ ...result, reason: status.state })
      }
      if (!plan) return this.record({ ...result, reason: 'selection_invalid' })
      if (backup) {
        result.backupPath = await this.backUp(feature, installationRoot, plan.changesAccount)
        if (!result.backupPath) return this.record({ ...result, reason: 'backup_failed' })
      }

      result.outcome = 'completed'
      const running = { processId: status.processId as number, startedAt: game.startedAt ?? '' }
      for (const step of plan.steps) {
        const stepResult = await this.sendStep(running, step)
        result.steps.push(stepResult)
        if (stepResult.outcome !== 'completed') {
          result.outcome = stepResult.outcome
          break
        }
      }
      return this.record(result)
    } finally {
      this.busy = false
    }
  }

  // The whole save folder before every change; the user settings file too before an account change.
  private async backUp(
    feature: string,
    installationRoot: string,
    withSettings: boolean
  ): Promise<string | null> {
    try {
      const stamp = new Date().toISOString().replace(/[:.]/g, '-')
      const target = join(this.context.backupDirectory, `${stamp}-${feature}`)
      await mkdir(target, { recursive: true })
      await cp(this.context.saveDirectory, join(target, 'saves'), { recursive: true })
      if (withSettings) {
        const settings = join(installationRoot, 'Binaries', 'SETTINGS', 'GCUSERSETTINGSDATA.MXML')
        await cp(settings, join(target, 'GCUSERSETTINGSDATA.MXML'))
      }
      return target
    } catch {
      return null
    }
  }

  private record(result: DeliveryResult): DeliveryResult {
    this.activity.push(result)
    if (this.activity.length > 200) this.activity.shift()
    return result
  }
}

async function exists(path: string): Promise<boolean> {
  return stat(path).then(
    () => true,
    () => false
  )
}

async function sha256OfFile(path: string): Promise<string | null> {
  try {
    return createHash('sha256')
      .update(await readFile(path))
      .digest('hex')
  } catch {
    return null
  }
}
