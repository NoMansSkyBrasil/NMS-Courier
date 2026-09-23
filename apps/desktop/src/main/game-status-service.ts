import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { resolve } from 'node:path'
import { getGameExecutablePath } from './installation-service'

const execFileAsync = promisify(execFile)

export type GameProcessStatus = {
  state: 'installation_not_selected' | 'not_running' | 'running' | 'query_failed'
  processId: number | null
  startedAt: string | null
}

type ProcessRecord = { Id?: unknown; Path?: unknown; StartTime?: unknown }
type ProcessListQuery = () => Promise<string>

async function queryNmsProcesses(): Promise<string> {
  const { stdout } = await execFileAsync(
    'powershell.exe',
    [
      '-NoProfile',
      '-NonInteractive',
      '-Command',
      'Get-Process -Name NMS -ErrorAction SilentlyContinue | Select-Object Id,Path,StartTime | ConvertTo-Json -Compress'
    ],
    { windowsHide: true, timeout: 10_000, maxBuffer: 64 * 1024 }
  )
  return stdout
}

export function parseNmsProcessOutput(output: string, installationRoot: string): GameProcessStatus {
  if (!output.trim()) return { state: 'not_running', processId: null, startedAt: null }
  let parsed: unknown
  try {
    parsed = JSON.parse(output)
  } catch {
    return { state: 'query_failed', processId: null, startedAt: null }
  }
  const expectedPath = resolve(getGameExecutablePath(installationRoot)).toLocaleLowerCase()
  const records = Array.isArray(parsed) ? parsed : [parsed]
  for (const value of records) {
    const record = value as ProcessRecord
    if (
      typeof record.Id === 'number' &&
      Number.isInteger(record.Id) &&
      record.Id > 0 &&
      typeof record.Path === 'string' &&
      resolve(record.Path).toLocaleLowerCase() === expectedPath &&
      typeof record.StartTime === 'string' &&
      !Number.isNaN(Date.parse(record.StartTime))
    ) {
      return {
        state: 'running',
        processId: record.Id,
        startedAt: new Date(record.StartTime).toISOString()
      }
    }
  }
  return { state: 'not_running', processId: null, startedAt: null }
}

export class GameStatusService {
  private inFlight: { installationRoot: string; promise: Promise<GameProcessStatus> } | null = null

  constructor(private readonly processListQuery: ProcessListQuery = queryNmsProcesses) {}

  observe(installationRoot: string | null): Promise<GameProcessStatus> {
    if (!installationRoot)
      return Promise.resolve({
        state: 'installation_not_selected',
        processId: null,
        startedAt: null
      })

    if (this.inFlight?.installationRoot === installationRoot) return this.inFlight.promise

    const promise = this.observeSelectedInstallation(installationRoot).finally(() => {
      if (this.inFlight?.promise === promise) this.inFlight = null
    })
    this.inFlight = { installationRoot, promise }
    return promise
  }

  private async observeSelectedInstallation(installationRoot: string): Promise<GameProcessStatus> {
    try {
      const stdout = await this.processListQuery()
      return parseNmsProcessOutput(stdout, installationRoot)
    } catch {
      return { state: 'query_failed', processId: null, startedAt: null }
    }
  }
}
