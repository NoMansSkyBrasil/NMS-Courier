import { describe, expect, it } from 'vitest'
import { parseNmsProcessOutput } from './game-status-service'

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
})
