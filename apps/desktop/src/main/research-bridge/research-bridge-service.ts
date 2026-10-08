import { getSelectionPlan, listDeliveryOptions, type DeliveryOption } from './delivery-options'
import { execFile } from 'node:child_process'
import { createHash } from 'node:crypto'
import { cp, mkdir, readFile, stat } from 'node:fs/promises'
import { join } from 'node:path'
import type { GameProcessStatus } from '../game-status-service'
import {
  classifyStepOutput,
  getDeliveryPlan,
  summariseStepOutput,
  testedBridgeSha256,
  type DeliveryFeatureId,
  type DeliveryStep
} from './delivery-plan'

export type ResearchBridgeStatus = {
  state:
    | 'unavailable' // packaged build, or the signal scripts are not present
    | 'installation_not_selected'
    | 'game_not_running'
    | 'bridge_missing'
    | 'bridge_untested'
    | 'ready'
  processId: number | null
  bridgeSha256: string | null
}

export type DeliveryStepResult = {
  script: string
  outcome: 'completed' | 'unknown' | 'failed'
  lines: string[]
}

export type DeliveryResult = {
  feature: DeliveryFeatureId
  // "refused" means nothing was sent. After "unknown" or "failed" the remaining steps are not run.
  outcome: 'completed' | 'unknown' | 'failed' | 'refused'
  reason: ResearchBridgeStatus['state'] | 'busy' | 'backup_failed' | 'selection_invalid' | null
  startedAt: string
  backupPath: string | null
  steps: DeliveryStepResult[]
}

export type StepRunner = (
  scriptPath: string,
  args: readonly string[]
) => Promise<{ exitCode: number; stdout: string }>

// Run one signal script with constant arguments. The command line is built from values this module
// owns (a script path under the signal directory, a process id, a hash and plan constants).
const runSignalScript: StepRunner = (scriptPath, args) =>
  new Promise((resolve) => {
    const quoted = [`& '${scriptPath.replace(/'/g, "''")}'`, ...args].join(' ')
    execFile(
      'powershell.exe',
      ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command', quoted],
      { windowsHide: true, timeout: 120_000, maxBuffer: 1024 * 1024 },
      (error, stdout, stderr) => {
        const exitCode = error ? (typeof error.code === 'number' ? error.code : 1) : 0
        resolve({ exitCode, stdout: exitCode === 0 ? stdout : `${stdout}\n${stderr}` })
      }
    )
  })

export type ResearchBridgeContext = {
  // False in a packaged application: the research bridge is a development capability.
  enabled: boolean
  signalDirectory: string
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
    private readonly runStep: StepRunner = runSignalScript
  ) {}

  async getStatus(
    installationRoot: string | null,
    game: GameProcessStatus
  ): Promise<ResearchBridgeStatus> {
    const none = { processId: null, bridgeSha256: null }
    if (!this.context.enabled || !(await exists(this.context.signalDirectory))) {
      return { state: 'unavailable', ...none }
    }
    if (!installationRoot) return { state: 'installation_not_selected', ...none }
    const bridgeSha256 = await sha256OfFile(join(installationRoot, 'Binaries', 'xinput9_1_0.dll'))
    if (!bridgeSha256) return { state: 'bridge_missing', ...none }
    if (!testedBridgeSha256.includes(bridgeSha256)) {
      return { state: 'bridge_untested', processId: null, bridgeSha256 }
    }
    if (game.state !== 'running' || game.processId === null) {
      return { state: 'game_not_running', processId: null, bridgeSha256 }
    }
    return { state: 'ready', processId: game.processId, bridgeSha256 }
  }

  getOptions(feature: DeliveryFeatureId): Promise<DeliveryOption[]> {
    return listDeliveryOptions(
      join(this.context.signalDirectory, '..', '..', '..', 'research'),
      feature
    )
  }

  getActivity(): DeliveryResult[] {
    return [...this.activity].reverse()
  }

  async deliver(
    feature: DeliveryFeatureId,
    installationRoot: string | null,
    game: GameProcessStatus,
    // Chosen entries; without them the whole area is sent.
    chosen: readonly string[] | null = null
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
      const plan = chosen
        ? getSelectionPlan(feature, chosen, await this.getOptions(feature))
        : getDeliveryPlan(feature)
      if (!plan) return this.record({ ...result, reason: 'selection_invalid' })
      result.backupPath = await this.backUp(feature, installationRoot, plan.changesAccount)
      if (!result.backupPath) return this.record({ ...result, reason: 'backup_failed' })

      result.outcome = 'completed'
      for (const step of plan.steps) {
        const stepResult = await this.send(step, status.processId as number, status.bridgeSha256)
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

  private async send(
    step: DeliveryStep,
    processId: number,
    bridgeSha256: string
  ): Promise<DeliveryStepResult> {
    const { exitCode, stdout } = await this.runStep(
      join(this.context.signalDirectory, step.script),
      ['-GameProcessId', String(processId), '-ExpectedDllSha256', bridgeSha256, ...step.args]
    )
    return {
      script: step.script,
      outcome: classifyStepOutput(exitCode, stdout),
      lines: summariseStepOutput(stdout)
    }
  }

  // The whole save folder before every change; the user settings file too before an account change.
  private async backUp(
    feature: DeliveryFeatureId,
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
