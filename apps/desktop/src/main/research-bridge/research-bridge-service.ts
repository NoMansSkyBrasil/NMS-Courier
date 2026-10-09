import { parseStarSystemReport } from '../../shared/star-system'
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

export type DeliveryResult = {
  feature: DeliveryFeatureId | 'items' | 'currencies' | EquipmentArea
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
}

// Sends the deliveries of the research profile on behalf of the interface. It owns the order of
// work the project requires around a live change: check, back up, send once, report, never retry.
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

  getOptions(feature: DeliveryFeatureId): Promise<DeliveryOption[]> {
    return listDeliveryOptions(this.context.researchDirectory, feature)
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

  private async run(
    feature: DeliveryResult['feature'],
    plan: DeliveryPlan | null,
    installationRoot: string | null,
    game: GameProcessStatus
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
      result.backupPath = await this.backUp(feature, installationRoot, plan.changesAccount)
      if (!result.backupPath) return this.record({ ...result, reason: 'backup_failed' })

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
