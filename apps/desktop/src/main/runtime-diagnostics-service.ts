import { randomBytes, randomUUID } from 'node:crypto'
import { appendFileSync, mkdirSync, readFileSync } from 'node:fs'
import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process'
import { delimiter, join } from 'node:path'
import type { InstallationStatus } from './installation-service'
import { getGameExecutablePath, inspectInstallation } from './installation-service'
import type { GameStatusService } from './game-status-service'
import {
  inspectRuntimeBundle,
  resolveRuntimeResourceDirectory,
  type RuntimeResourceContext
} from './runtime-resources'

export type RuntimeDiagnosticsStatus = {
  state:
    | 'not_started'
    | 'checking'
    | 'starting'
    | 'host_ready'
    | 'bridge_authenticated'
    | 'callback_ready'
    | 'failed'
    | 'ended'
  reasonCode: string | null
  processId: number | null
  buildLabel: string | null
}

type DiagnosticBuild = {
  executableSha256: string
  buildLabel: string
  mode: 'diagnostics_only'
}

type DiagnosticBuildRegistry = {
  schemaVersion?: unknown
  builds?: unknown
}

const eventPrefix = 'NMSCOURIER_EVENT '

function getDiagnosticBuilds(context: RuntimeResourceContext): DiagnosticBuild[] | null {
  try {
    const path = join(resolveRuntimeResourceDirectory(context), 'config', 'diagnostic-builds.json')
    const registry = JSON.parse(readFileSync(path, 'utf8')) as DiagnosticBuildRegistry
    if (registry.schemaVersion !== 1 || !Array.isArray(registry.builds)) return null
    const builds: DiagnosticBuild[] = []
    const hashes = new Set<string>()
    for (const value of registry.builds) {
      if (!value || typeof value !== 'object') return null
      const build = value as Record<string, unknown>
      if (
        typeof build.executableSha256 !== 'string' ||
        !/^[a-f0-9]{64}$/i.test(build.executableSha256) ||
        typeof build.buildLabel !== 'string' ||
        build.buildLabel.trim().length === 0 ||
        build.buildLabel.length > 160 ||
        build.mode !== 'diagnostics_only'
      ) {
        return null
      }
      const fingerprint = build.executableSha256.toLowerCase()
      if (hashes.has(fingerprint)) return null
      hashes.add(fingerprint)
      builds.push({
        executableSha256: fingerprint,
        buildLabel: build.buildLabel,
        mode: 'diagnostics_only'
      })
    }
    return builds
  } catch {
    return null
  }
}

export class RuntimeDiagnosticsService {
  private child: ChildProcessWithoutNullStreams | null = null
  private status: RuntimeDiagnosticsStatus = {
    state: 'not_started',
    reasonCode: null,
    processId: null,
    buildLabel: null
  }

  constructor(
    private readonly context: RuntimeResourceContext,
    private readonly userDataPath: string,
    private readonly gameStatusService: GameStatusService
  ) {}

  getStatus(): RuntimeDiagnosticsStatus {
    return { ...this.status }
  }

  hasActiveHost(): boolean {
    return this.child !== null && this.child.exitCode === null && this.child.signalCode === null
  }

  async start(
    selectedRoot: string | null,
    selected: InstallationStatus
  ): Promise<RuntimeDiagnosticsStatus> {
    if (this.hasActiveHost()) return this.getStatus()
    this.status = {
      state: 'checking',
      reasonCode: null,
      processId: null,
      buildLabel: null
    }

    if (!selectedRoot || selected.state !== 'available' || !selected.executableSha256) {
      return this.fail('INSTALLATION_NOT_AVAILABLE')
    }
    if (inspectRuntimeBundle(this.context).state !== 'bundled') {
      return this.fail('RUNTIME_BUNDLE_INVALID')
    }

    const current = await inspectInstallation(selectedRoot)
    if (current.state !== 'available' || current.executableSha256 !== selected.executableSha256) {
      return this.fail('INSTALLATION_FINGERPRINT_CHANGED')
    }
    const game = await this.gameStatusService.observe(selectedRoot)
    if (game.state !== 'running' || !game.processId || !game.startedAt) {
      return this.fail('SELECTED_GAME_NOT_RUNNING')
    }

    const builds = getDiagnosticBuilds(this.context)
    if (!builds) return this.fail('DIAGNOSTIC_BUILD_REGISTRY_INVALID')
    const build = builds.find(
      (candidate) => candidate.executableSha256 === current.executableSha256?.toLowerCase()
    )
    if (!build) return this.fail('BUILD_NOT_ALLOWED_FOR_DIAGNOSTICS')

    const runtimeDirectory = resolveRuntimeResourceDirectory(this.context)
    const executablePath = getGameExecutablePath(selectedRoot)
    const pythonPath = join(runtimeDirectory, 'python', 'python.exe')
    const pipeName = `nms-courier-${randomBytes(16).toString('hex')}`
    const tokenHex = randomBytes(32).toString('hex')
    const sessionId = randomUUID()
    const logDirectory = join(this.userDataPath, 'runtime-diagnostics')
    mkdirSync(logDirectory, { recursive: true })
    const logPath = join(logDirectory, 'bridge-events.jsonl')
    const child = spawn(
      pythonPath,
      ['-I', '-B', '-u', '-m', 'nms_courier_runtime.host', '--config-stdin'],
      {
        windowsHide: true,
        stdio: 'pipe',
        env: {
          SystemRoot: process.env.SystemRoot ?? 'C:\\Windows',
          WINDIR: process.env.WINDIR ?? 'C:\\Windows',
          APPDATA: process.env.APPDATA ?? '',
          USERPROFILE: process.env.USERPROFILE ?? '',
          TEMP: process.env.TEMP ?? '',
          TMP: process.env.TMP ?? '',
          PATH: [
            process.env.SystemRoot ?? 'C:\\Windows',
            join(process.env.SystemRoot ?? 'C:\\Windows', 'System32')
          ].join(delimiter),
          PYMHF_INTERACTIVE_CONFIGURATION: '0',
          PYTHONDONTWRITEBYTECODE: '1'
        }
      }
    )
    this.child = child
    this.status = {
      state: 'starting',
      reasonCode: null,
      processId: game.processId,
      buildLabel: build.buildLabel
    }

    let lineBuffer = ''
    const acceptOutput = (chunk: Buffer): void => {
      lineBuffer += chunk.toString('utf8')
      if (lineBuffer.length > 16_384 && !lineBuffer.includes('\n')) lineBuffer = ''
      let newline = lineBuffer.indexOf('\n')
      while (newline >= 0) {
        const line = lineBuffer.slice(0, newline).trim()
        lineBuffer = lineBuffer.slice(newline + 1)
        if (line.length <= 16_384 && line.startsWith(eventPrefix)) {
          this.acceptEvent(line.slice(eventPrefix.length), logPath)
        }
        newline = lineBuffer.indexOf('\n')
      }
    }
    child.stdout.on('data', acceptOutput)
    child.stderr.on('data', () => undefined)
    child.on('error', () => {
      this.child = null
      this.fail('RUNTIME_LAUNCH_FAILED')
    })
    child.on('close', (code) => {
      this.child = null
      if (this.status.state !== 'failed') {
        this.status = {
          ...this.status,
          state: code === 0 ? 'ended' : 'failed',
          reasonCode: code === 0 ? 'RUNTIME_SESSION_ENDED' : 'RUNTIME_HOST_EXITED'
        }
      }
    })

    child.stdin.end(
      JSON.stringify({
        executable_path: executablePath,
        executable_sha256: current.executableSha256,
        pid: game.processId,
        process_started_at: Date.parse(game.startedAt) / 1000,
        pipe_name: pipeName,
        token_hex: tokenHex,
        session_id: sessionId,
        log_directory: logDirectory
      })
    )

    const status = await new Promise<RuntimeDiagnosticsStatus>((resolve) => {
      let settled = false
      const finish = (value: RuntimeDiagnosticsStatus): void => {
        if (settled) return
        settled = true
        clearTimeout(timeout)
        resolve(value)
      }
      const observe = (): void => {
        if (this.status.state === 'host_ready' || this.status.state === 'failed') {
          finish(this.getStatus())
        } else if (this.child === null) {
          finish(this.getStatus())
        }
      }
      const timeout = setTimeout(() => {
        this.fail('RUNTIME_START_TIMEOUT')
        this.child?.kill()
        finish(this.getStatus())
      }, 15_000)
      const poll = setInterval(() => {
        observe()
        if (settled) clearInterval(poll)
      }, 25)
      observe()
    })
    return status
  }

  private acceptEvent(json: string, logPath: string): void {
    let event: { event?: unknown; reason?: unknown }
    try {
      event = JSON.parse(json) as typeof event
    } catch {
      return
    }
    const states: Record<string, RuntimeDiagnosticsStatus['state']> = {
      host_ready: 'host_ready',
      bridge_authenticated: 'bridge_authenticated',
      callback_ready: 'callback_ready',
      game_exited: 'ended',
      bridge_rejected: 'failed',
      pipe_failed: 'failed',
      host_failed: 'failed'
    }
    const state = typeof event.event === 'string' ? states[event.event] : undefined
    if (!state) return
    this.status = {
      ...this.status,
      state,
      reasonCode:
        state === 'failed'
          ? typeof event.reason === 'string'
            ? event.reason
            : 'RUNTIME_HOST_FAILED'
          : null
    }
    try {
      appendFileSync(
        logPath,
        JSON.stringify({ ...event, observedAt: new Date().toISOString() }) + '\n'
      )
    } catch {
      this.status = { ...this.status, reasonCode: 'DIAGNOSTIC_LOG_WRITE_FAILED' }
    }
  }

  private fail(reasonCode: string): RuntimeDiagnosticsStatus {
    this.status = {
      ...this.status,
      state: 'failed',
      reasonCode
    }
    return this.getStatus()
  }
}
