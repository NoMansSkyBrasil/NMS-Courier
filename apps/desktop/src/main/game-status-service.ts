import { readdir, readFile, stat } from 'node:fs/promises'
import { join } from 'node:path'

// Whether the game is running, told by the bridge itself: while the game runs, the bridge rewrites
// its status file every two seconds. No operating system command is involved, so this works the
// same on every platform. A game without the bridge installed is therefore reported as not
// running, which is also all the application could do with it.

export type GameProcessStatus = {
  state: 'installation_not_selected' | 'not_running' | 'running' | 'query_failed'
  processId: number | null
  startedAt: string | null
}

const statusFile = /^native-profile-180836-(\d+)\.log$/
// The bridge writes every two seconds; a file older than this belongs to a game that has closed.
const aliveMilliseconds = 8000

export class GameStatusService {
  constructor(
    private readonly diagnosticsDirectory: string,
    private readonly now: () => number = Date.now
  ) {}

  async observe(installationRoot: string | null): Promise<GameProcessStatus> {
    const none = { processId: null, startedAt: null }
    if (!installationRoot) return { state: 'installation_not_selected', ...none }
    let names: string[]
    try {
      names = await readdir(this.diagnosticsDirectory)
    } catch {
      // The folder appears with the first start of a game that has the bridge.
      return { state: 'not_running', ...none }
    }

    let newest: { processId: number; modified: number } | null = null
    for (const name of names) {
      const match = statusFile.exec(name)
      if (!match) continue
      const info = await stat(join(this.diagnosticsDirectory, name)).catch(() => null)
      if (info && (!newest || info.mtimeMs > newest.modified)) {
        newest = { processId: Number(match[1]), modified: info.mtimeMs }
      }
    }
    if (!newest || this.now() - newest.modified > aliveMilliseconds) {
      return { state: 'not_running', ...none }
    }

    // The bridge writes this file once, when the game starts.
    const started = await stat(
      join(this.diagnosticsDirectory, `asi-startup-${newest.processId}.log`)
    ).catch(() => null)
    const text = await readFile(
      join(this.diagnosticsDirectory, `native-profile-180836-${newest.processId}.log`),
      'utf8'
    ).catch(() => '')
    if (!new RegExp(`^pid=${newest.processId}$`, 'm').test(text)) {
      return { state: 'query_failed', ...none }
    }
    return {
      state: 'running',
      processId: newest.processId,
      startedAt: new Date(started ? started.mtimeMs : newest.modified).toISOString()
    }
  }
}
