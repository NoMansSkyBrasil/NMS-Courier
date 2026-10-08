import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import type { GameProcessStatus } from '../game-status-service'
import { BridgeClient, summariseResult, type BridgeStep } from './bridge-client'
import {
  deliveryFeatureIds,
  getDeliveryPlan,
  isDeliveryFeatureId,
  testedBridgeSha256
} from './delivery-plan'
import { ResearchBridgeService, type StepSender } from './research-bridge-service'

const research = join(__dirname, '..', '..', '..', '..', '..', 'runtime', 'research')
const started = new Date(Date.now() - 60_000).toISOString()
const running: GameProcessStatus = { state: 'running', processId: 4242, startedAt: started }

// A fake installation whose bridge file hashes to the given bytes, plus save and data folders.
async function fixture(bridgeBytes: string | null): Promise<{
  root: string
  context: {
    enabled: boolean
    researchDirectory: string
    diagnosticsDirectory: string
    backupDirectory: string
    saveDirectory: string
  }
}> {
  const base = await mkdtemp(join(tmpdir(), 'courier-bridge-'))
  const root = join(base, 'game')
  await mkdir(join(root, 'Binaries', 'SETTINGS'), { recursive: true })
  await writeFile(join(root, 'Binaries', 'SETTINGS', 'GCUSERSETTINGSDATA.MXML'), '<Data />')
  if (bridgeBytes !== null) await writeFile(join(root, 'Binaries', 'xinput9_1_0.dll'), bridgeBytes)
  const saveDirectory = join(base, 'saves')
  await mkdir(saveDirectory)
  await writeFile(join(saveDirectory, 'save5.hg'), 'slot')
  return {
    root,
    context: {
      enabled: true,
      researchDirectory: research,
      diagnosticsDirectory: base,
      backupDirectory: join(base, 'backups'),
      saveDirectory
    }
  }
}

describe('delivery plan', () => {
  it('accepts only the listed areas', () => {
    expect(isDeliveryFeatureId('technologies')).toBe(true)
    expect(isDeliveryFeatureId('items')).toBe(false)
    expect(isDeliveryFeatureId('technologies; rm')).toBe(false)
    expect(isDeliveryFeatureId(7)).toBe(false)
  })

  it('gives every area requests the bridge knows, built from the classification', async () => {
    for (const feature of deliveryFeatureIds) {
      const plan = await getDeliveryPlan(feature, research, true)
      expect(plan?.steps.length).toBeGreaterThan(0)
      for (const step of plan?.steps ?? []) {
        for (const signal of step.signals) expect(signal).toMatch(/^[a-z]+$/)
        for (const line of step.request?.lines ?? []) expect(line).toMatch(/^[a-z]+=[A-Z0-9_]+$/)
      }
    }
    const technologies = await getDeliveryPlan('technologies', research, true)
    expect(technologies?.steps[0].request?.lines[0]).toBe('silent=0')
    expect(technologies?.steps[0].request?.lines.length).toBeGreaterThan(100)
    const silent = await getDeliveryPlan('technologies', research, false)
    expect(silent?.steps[0].request?.lines[0]).toBe('silent=1')
    const twitch = await getDeliveryPlan('twitch', research, true)
    expect(twitch?.steps.map((step) => step.label)).toEqual(['account', 'keep'])
    expect(twitch?.steps[1].request?.perProcess).toBe(false)
    expect(await getDeliveryPlan('technologies', join(research, 'missing'), true)).toBeNull()
  })
})

describe('bridge client', () => {
  const game = { processId: 4242, startedAt: started }
  const step: BridgeStep = {
    label: 'item',
    request: { name: 'item-request', perProcess: true, lines: ['FUEL1=500'] },
    signals: ['item'],
    result: { name: 'item-result', seconds: 1 }
  }
  const status = 'status=armed\npid=4242\nhook_status=0\nmode=research_profile\ndispatch_state=0\n'

  // Stands in for the bridge: takes each signal file and, when told to, answers.
  function fakeBridge(directory: string, answer: string | null): () => string[] {
    const taken: string[] = []
    const signal = join(directory, 'native-signal-180836-4242.txt')
    const timer = setInterval(() => {
      void readFile(signal, 'ascii')
        .then(async (text) => {
          await rm(signal)
          taken.push(text.trim())
          if (answer !== null) {
            await writeFile(join(directory, 'native-item-result-180836-4242.txt'), answer)
          }
        })
        .catch(() => undefined)
    }, 20)
    return () => {
      clearInterval(timer)
      return taken
    }
  }

  it('writes the request, signals it and returns the answer', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'courier-client-'))
    await writeFile(join(directory, 'native-profile-180836-4242.log'), status)
    const stop = fakeBridge(directory, 'requested=1\nFUEL1:500/500 stack 9999=added\n')
    const result = await new BridgeClient(directory).send(game, step)
    expect(stop()).toEqual(['item'])
    expect(result).toEqual({
      label: 'item',
      outcome: 'completed',
      lines: ['requested=1', 'FUEL1:500/500 stack 9999=added']
    })
    expect(await readFile(join(directory, 'native-item-request-180836-4242.txt'), 'ascii')).toBe(
      'FUEL1=500\r\n'
    )
  })

  it('reports an unknown outcome when the bridge took the request and did not answer', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'courier-client-'))
    await writeFile(join(directory, 'native-profile-180836-4242.log'), status)
    const stop = fakeBridge(directory, null)
    const result = await new BridgeClient(directory).send(game, step)
    stop()
    expect(result.outcome).toBe('unknown')
  })

  it('refuses without a bridge status, and when the bridge refuses to answer as asked', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'courier-client-'))
    expect((await new BridgeClient(directory).send(game, step)).outcome).toBe('failed')
    await writeFile(join(directory, 'native-profile-180836-4242.log'), status)
    const stop = fakeBridge(directory, 'requested=1\nNOPE:0/5 stack 0=unknown_id\n')
    const refused = await new BridgeClient(directory).send(game, {
      ...step,
      accept: (lines) => lines.some((line) => line.endsWith('=added'))
    })
    stop()
    expect(refused.outcome).toBe('failed')
    const waiting = status.replace('dispatch_state=0', 'dispatch_state=2')
    await writeFile(join(directory, 'native-profile-180836-4242.log'), waiting)
    const blocked = await new BridgeClient(directory).send(game, { ...step, dispatch: true })
    expect(blocked.outcome).toBe('failed')
  })

  it('shortens a long answer to its heading, counts and unusual lines', () => {
    const lines = ['requested=40', 'known_before=1', 'known_after=40']
    for (let index = 0; index < 39; index += 1) lines.push(`ID${index}=learned`)
    lines.push('ODD=blocked_id')
    expect(summariseResult(lines)).toEqual([
      'requested=40',
      'known_before=1',
      'known_after=40',
      'learned: 39',
      'blocked_id: 1',
      'ODD=blocked_id'
    ])
  })
})

describe('research bridge service', () => {
  it('refuses an installed bridge that was not tested', async () => {
    const { root, context } = await fixture('some other build')
    const service = new ResearchBridgeService(context, async () => {
      throw new Error('must not send')
    })
    const status = await service.getStatus(root, running)
    expect(status.state).toBe('bridge_untested')
    const result = await service.deliver('technologies', root, running)
    expect(result.outcome).toBe('refused')
    expect(result.steps).toEqual([])
    expect(result.backupPath).toBeNull()
  })

  it('is unavailable when disabled, and needs a running game', async () => {
    const { root, context } = await fixture('x')
    const disabled = new ResearchBridgeService({ ...context, enabled: false })
    expect((await disabled.getStatus(root, running)).state).toBe('unavailable')
    const service = new ResearchBridgeService(context)
    expect((await service.getStatus(null, running)).state).toBe('installation_not_selected')
  })

  it('backs up, sends each step once and stops at an unknown outcome', async () => {
    const { root, context } = await fixture('bridge')
    const hash = createHash('sha256').update('bridge').digest('hex')
    const sent: string[] = []
    const sender: StepSender = async (game, step) => {
      sent.push(`${game.processId}:${step.label}`)
      return { label: step.label, outcome: 'unknown', lines: [] }
    }
    ;(testedBridgeSha256 as string[]).push(hash)
    try {
      const service = new ResearchBridgeService(context, sender)
      expect((await service.getStatus(root, running)).state).toBe('ready')
      const result = await service.deliver('productRecipes', root, running)
      expect(result.outcome).toBe('unknown')
      expect(sent).toEqual(['4242:product'])
      expect(result.backupPath).not.toBeNull()
      expect(await readdir(join(result.backupPath as string, 'saves'))).toEqual(['save5.hg'])
      expect(service.getActivity()[0].feature).toBe('productRecipes')
    } finally {
      ;(testedBridgeSha256 as string[]).pop()
    }
  })

  it('copies the settings file for an account change', async () => {
    const { root, context } = await fixture('bridge2')
    const hash = createHash('sha256').update('bridge2').digest('hex')
    ;(testedBridgeSha256 as string[]).push(hash)
    try {
      const service = new ResearchBridgeService(context, async (_, step) => ({
        label: step.label,
        outcome: 'completed',
        lines: ['requested=346']
      }))
      const result = await service.deliver('titles', root, running)
      expect(result.outcome).toBe('completed')
      expect(await readdir(result.backupPath as string)).toContain('GCUSERSETTINGSDATA.MXML')
    } finally {
      ;(testedBridgeSha256 as string[]).pop()
    }
  })
})
