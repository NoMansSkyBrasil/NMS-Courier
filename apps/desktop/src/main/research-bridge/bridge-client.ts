import { readFile, rename, rm, stat, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

// Talks to the bridge inside the running game with nothing but files in the bridge's own
// diagnostics folder: a request file with the details, a signal file that names the request, and
// the result file the bridge writes back. No helper program and no script is involved. The bridge
// deletes the signal file when it takes the request, so an untaken request is known not to have
// been sent, and several signals arrive in the order they were written.

export type BridgeStep = {
  // Short name for the activity list.
  label: string
  // Details of the request. A per-process file is `native-<name>-180836-<pid>.txt`; a file the
  // bridge also reads when the game starts has no process number.
  request?: { name: string; perProcess: boolean; lines: readonly string[] }
  // Request names, in order: what the bridge is to do.
  signals: readonly string[]
  // The file the bridge answers with, `native-<name>-180836-<pid>.txt`, and how long to wait.
  result?: { name: string; seconds: number }
  // The request starts one call of the game's reward routine: refused while an earlier call of
  // this game process has not returned, and reported unknown when this one does not return.
  dispatch?: boolean
  // Result lines that mean the game did what was asked; without it any result counts.
  accept?: (lines: readonly string[]) => boolean
}

export type BridgeStepResult = {
  label: string
  // unknown: the request was taken but no answer came; it must not be sent again.
  // failed: nothing was done, either refused before sending or answered with a refusal.
  outcome: 'completed' | 'unknown' | 'failed'
  lines: string[]
}

export type BridgeGame = { processId: number; startedAt: string }

const signalTakenMilliseconds = 5000
const dispatchSeconds = 12
const pollMilliseconds = 100

const pause = (milliseconds: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, milliseconds))

async function present(path: string): Promise<boolean> {
  return stat(path).then(
    () => true,
    () => false
  )
}

// A long answer is shown as its heading, the count of each outcome and the unusual lines.
export function summariseResult(lines: readonly string[]): string[] {
  const kept = lines.map((line) => line.trim()).filter((line) => line && line.length <= 200)
  if (kept.length <= 16) return kept
  const outcome = (line: string): string => line.slice(line.lastIndexOf('=') + 1)
  const counts = new Map<string, number>()
  for (const line of kept.slice(3)) counts.set(outcome(line), (counts.get(outcome(line)) ?? 0) + 1)
  const rare = kept.slice(3).filter((line) => (counts.get(outcome(line)) ?? 0) <= 20)
  return [
    ...kept.slice(0, 3),
    ...[...counts].map(([name, count]) => `${name}: ${count}`),
    ...rare.slice(0, 30)
  ]
}

export class BridgeClient {
  constructor(private readonly diagnosticsDirectory: string) {}

  private file(name: string, processId: number | null): string {
    const suffix = processId === null ? '' : `-${processId}`
    return join(this.diagnosticsDirectory, `native-${name}-180836${suffix}.txt`)
  }

  // What the bridge says about itself, or the reason it cannot take a request.
  async status(game: BridgeGame): Promise<Record<string, string> | string> {
    const path = join(this.diagnosticsDirectory, `native-profile-180836-${game.processId}.log`)
    const [text, info] = await Promise.all([
      readFile(path, 'utf8').catch(() => null),
      stat(path).catch(() => null)
    ])
    if (text === null || !info) return 'The bridge has not written its status for this game.'
    // A file older than the game belongs to an earlier process that had the same number.
    if (info.mtimeMs + 2000 < Date.parse(game.startedAt)) {
      return 'The bridge status is older than this game process.'
    }
    const fields: Record<string, string> = {}
    for (const line of text.split(/\r?\n/)) {
      const separator = line.indexOf('=')
      if (separator > 0) fields[line.slice(0, separator)] = line.slice(separator + 1)
    }
    const accepting =
      (fields.status === 'awaiting_request' || fields.status === 'armed') &&
      fields.pid === String(game.processId) &&
      fields.hook_status === '0' &&
      fields.mode === 'research_profile'
    return accepting ? fields : `The bridge is not accepting requests (${fields.status ?? '?'}).`
  }

  async send(game: BridgeGame, step: BridgeStep): Promise<BridgeStepResult> {
    const done = (outcome: BridgeStepResult['outcome'], lines: string[]): BridgeStepResult => ({
      label: step.label,
      outcome,
      lines
    })
    const before = await this.status(game)
    if (typeof before === 'string') return done('failed', [before])
    if (step.dispatch && before.dispatch_state !== '0' && before.dispatch_state !== '3') {
      return done('failed', [
        'An earlier request of this game process did not return; its outcome is uncertain.'
      ])
    }

    const resultPath = step.result ? this.file(step.result.name, game.processId) : null
    try {
      if (resultPath) await rm(resultPath, { force: true })
      if (step.request) {
        await writeFile(
          this.file(step.request.name, step.request.perProcess ? game.processId : null),
          step.request.lines.join('\r\n') + '\r\n',
          'ascii'
        )
      }
    } catch {
      return done('failed', ['The request could not be written.'])
    }

    const signalPath = this.file('signal', game.processId)
    for (const [index, signal] of step.signals.entries()) {
      try {
        // Written under another name first, so the bridge never reads half a file.
        await writeFile(`${signalPath}.new`, `${signal}\r\n`, 'ascii')
        await rename(`${signalPath}.new`, signalPath)
      } catch {
        return done('failed', ['The request could not be written.'])
      }
      let taken = false
      for (let waited = 0; waited < signalTakenMilliseconds && !taken; waited += pollMilliseconds) {
        await pause(pollMilliseconds)
        taken = !(await present(signalPath))
      }
      if (!taken) {
        await rm(signalPath, { force: true })
        return done('failed', [
          index === 0
            ? 'The bridge did not take the request. Nothing was sent.'
            : `The bridge stopped taking requests after "${step.signals[index - 1]}".`
        ])
      }
    }

    if (resultPath && step.result) {
      for (let waited = 0; waited < step.result.seconds * 1000; waited += pollMilliseconds * 2) {
        await pause(pollMilliseconds * 2)
        const text = await readFile(resultPath, 'utf8').catch(() => null)
        if (text === null || !text.trim()) continue
        const lines = text.split(/\r?\n/).filter((line) => line.trim())
        return done(
          step.accept && !step.accept(lines) ? 'failed' : 'completed',
          summariseResult(lines)
        )
      }
      return done('unknown', ['No answer from the game yet. Do not send this again.'])
    }

    // No result file: report what the bridge's status says once the game thread has acted.
    for (let waited = 0; waited < dispatchSeconds * 1000; waited += 500) {
      await pause(500)
      const after = await this.status(game)
      if (typeof after === 'string') return done('unknown', [after])
      const report = [
        'dispatch_state',
        'applied_class',
        'slots_applied',
        'super_added',
        'owned_applied',
        'owned_rejected',
        'request_errors'
      ]
        .filter((name) => name in after)
        .map((name) => `${name}=${after[name]}`)
      if (!step.dispatch && waited >= 2500) return done('completed', report)
      // The status is rewritten every two seconds; an earlier call may have left "returned" there.
      if (step.dispatch && waited >= 3000 && after.dispatch_state === '3') {
        return done('completed', report)
      }
    }
    return done('unknown', ['The game has not answered this request. Do not send it again.'])
  }
}
