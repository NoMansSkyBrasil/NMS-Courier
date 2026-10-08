import { mkdir, mkdtemp, readdir, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import type { GameProcessStatus } from '../game-status-service'
import {
  classifyStepOutput,
  deliveryFeatureIds,
  getDeliveryPlan,
  isDeliveryFeatureId,
  testedBridgeSha256
} from './delivery-plan'
import { ResearchBridgeService, type StepRunner } from './research-bridge-service'

const running: GameProcessStatus = { state: 'running', processId: 4242, startedAt: null }

// A fake installation whose bridge file hashes to `sha256`, plus save and signal directories.
async function fixture(bridgeBytes: string | null): Promise<{
  root: string
  context: {
    enabled: boolean
    signalDirectory: string
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
  const signalDirectory = join(base, 'signal')
  await mkdir(signalDirectory)
  return {
    root,
    context: {
      enabled: true,
      signalDirectory,
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

  it('gives every area constant steps of known scripts', () => {
    for (const feature of deliveryFeatureIds) {
      const plan = getDeliveryPlan(feature)
      expect(plan.steps.length).toBeGreaterThan(0)
      for (const step of plan.steps) {
        expect(step.script).toMatch(/^signal-[a-z-]+-180836\.ps1$/)
        for (const argument of step.args) expect(argument).toMatch(/^-?[A-Za-z_,]+$/)
      }
    }
  })

  it('treats a missing answer as an unknown outcome, not a failure to retry', () => {
    expect(classifyStepOutput(0, 'requested=1\nlearned: 1')).toBe('completed')
    expect(classifyStepOutput(0, 'No result yet. Do not send the request again')).toBe('unknown')
    expect(classifyStepOutput(1, '')).toBe('failed')
  })
})

describe('research bridge service', () => {
  it('refuses an installed bridge that was not tested', async () => {
    const { root, context } = await fixture('some other build')
    const service = new ResearchBridgeService(context, async () => ({ exitCode: 0, stdout: '' }))
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
    // The tested hash cannot be produced from chosen bytes, so the service is given a subclass view
    // of "tested" through a bridge file whose hash is checked directly below.
    const { root, context } = await fixture('bridge')
    const hash = createHash('sha256').update('bridge').digest('hex')
    const calls: string[][] = []
    const runner: StepRunner = async (script, args) => {
      calls.push([script, ...args])
      return { exitCode: 0, stdout: calls.length === 1 ? 'No result yet.' : 'requested=1' }
    }
    ;(testedBridgeSha256 as string[]).push(hash)
    try {
      const service = new ResearchBridgeService(context, runner)
      expect((await service.getStatus(root, running)).state).toBe('ready')
      const result = await service.deliver('productRecipes', root, running)
      expect(result.outcome).toBe('unknown')
      expect(calls).toHaveLength(1)
      expect(calls[0]).toContain('4242')
      expect(calls[0]).toContain(hash)
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
      const service = new ResearchBridgeService(context, async () => ({
        exitCode: 0,
        stdout: 'requested=346'
      }))
      const result = await service.deliver('titles', root, running)
      expect(result.outcome).toBe('completed')
      expect(await readdir(result.backupPath as string)).toContain('GCUSERSETTINGSDATA.MXML')
    } finally {
      ;(testedBridgeSha256 as string[]).pop()
    }
  })
})
