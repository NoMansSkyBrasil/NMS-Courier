import { describe, expect, it } from 'vitest'
import { resolveLocalItemDeliveryReadiness } from './delivery-readiness'

const installation = {
  state: 'available' as const,
  displayName: 'No Man’s Sky',
  executableSha256: 'a'.repeat(64),
  executableSize: 1,
  reason: null
}
const game = { state: 'running' as const, processId: 1, startedAt: '2026-09-22T00:00:00.000Z' }
const runtime = { state: 'bundled' as const, runtimeVersion: '3.11.9' }

describe('local item delivery readiness', () => {
  it('returns the earliest blocking condition', () => {
    expect(
      resolveLocalItemDeliveryReadiness({ ...installation, state: 'not_selected' }, game, runtime)
    ).toEqual({ available: false, reasonCode: 'INSTALLATION_NOT_SELECTED' })
    expect(
      resolveLocalItemDeliveryReadiness(
        installation,
        { ...game, state: 'not_running', processId: null, startedAt: null },
        runtime
      )
    ).toEqual({ available: false, reasonCode: 'GAME_NOT_RUNNING' })
    expect(
      resolveLocalItemDeliveryReadiness(installation, game, {
        state: 'unavailable',
        runtimeVersion: null
      })
    ).toEqual({ available: false, reasonCode: 'RUNTIME_BUNDLE_INVALID' })
  })

  it('does not claim an implemented delivery after every prerequisite is present', () => {
    expect(resolveLocalItemDeliveryReadiness(installation, game, runtime)).toEqual({
      available: false,
      reasonCode: 'ACTION_NOT_IMPLEMENTED'
    })
  })
})
