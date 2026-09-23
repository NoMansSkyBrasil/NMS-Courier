import { describe, expect, it, vi } from 'vitest'
import { GameStatusService, parseNmsProcessOutput } from './game-status-service'

describe('game process observation', () => {
  const installationRoot = 'C:/Games/No Man’s Sky'

  it('accepts only an NMS process from the selected installation', () => {
    expect(
      parseNmsProcessOutput(
        JSON.stringify({
          Id: 1234,
          Path: 'C:/Games/No Man’s Sky/Binaries/NMS.exe',
          StartTime: '2026-09-22T12:00:00.000Z'
        }),
        installationRoot
      )
    ).toEqual({ state: 'running', processId: 1234, startedAt: '2026-09-22T12:00:00.000Z' })
  })

  it('does not mistake another installation for the selected game process', () => {
    expect(
      parseNmsProcessOutput(
        JSON.stringify({
          Id: 1234,
          Path: 'D:/Other/Binaries/NMS.exe',
          StartTime: '2026-09-22T12:00:00.000Z'
        }),
        installationRoot
      ).state
    ).toBe('not_running')
  })

  it('fails closed for malformed process output', () => {
    expect(parseNmsProcessOutput('{not-json', installationRoot).state).toBe('query_failed')
  })

  it('shares an in-flight process query for the same installation', async () => {
    let resolveQuery: ((output: string) => void) | undefined
    const processListQuery = vi.fn(() => new Promise<string>((resolve) => (resolveQuery = resolve)))
    const service = new GameStatusService(processListQuery)
    const output = JSON.stringify({
      Id: 1234,
      Path: 'C:/Games/No Man’s Sky/Binaries/NMS.exe',
      StartTime: '2026-09-22T12:00:00.000Z'
    })

    const firstObservation = service.observe(installationRoot)
    const secondObservation = service.observe(installationRoot)
    expect(processListQuery).toHaveBeenCalledTimes(1)
    resolveQuery?.(output)

    await expect(Promise.all([firstObservation, secondObservation])).resolves.toEqual([
      { state: 'running', processId: 1234, startedAt: '2026-09-22T12:00:00.000Z' },
      { state: 'running', processId: 1234, startedAt: '2026-09-22T12:00:00.000Z' }
    ])
  })

  it('reports a failed process query distinctly from a stopped game', async () => {
    const service = new GameStatusService(vi.fn().mockRejectedValue(new Error('timeout')))

    await expect(service.observe(installationRoot)).resolves.toEqual({
      state: 'query_failed',
      processId: null,
      startedAt: null
    })
  })
})
