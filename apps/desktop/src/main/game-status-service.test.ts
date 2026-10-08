import { mkdtemp, utimes, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { GameStatusService } from './game-status-service'

const root = 'C:/Games/No Man’s Sky'

async function diagnostics(): Promise<string> {
  return mkdtemp(join(tmpdir(), 'courier-status-'))
}

describe('game process observation', () => {
  it('needs an installation and a diagnostics folder', async () => {
    const directory = await diagnostics()
    expect((await new GameStatusService(directory).observe(null)).state).toBe(
      'installation_not_selected'
    )
    expect((await new GameStatusService(join(directory, 'missing')).observe(root)).state).toBe(
      'not_running'
    )
    expect((await new GameStatusService(directory).observe(root)).state).toBe('not_running')
  })

  it('reports the game whose bridge status is fresh', async () => {
    const directory = await diagnostics()
    await writeFile(join(directory, 'native-profile-180836-111.log'), 'status=armed\npid=111\n')
    await writeFile(join(directory, 'native-profile-180836-222.log'), 'status=armed\npid=222\n')
    await writeFile(join(directory, 'asi-startup-222.log'), 'status=exact_build_startup_observed\n')
    const old = new Date(Date.now() - 3_600_000)
    await utimes(join(directory, 'native-profile-180836-111.log'), old, old)
    const started = new Date(Date.now() - 120_000)
    await utimes(join(directory, 'asi-startup-222.log'), started, started)

    const status = await new GameStatusService(directory).observe(root)
    expect(status).toEqual({
      state: 'running',
      processId: 222,
      startedAt: started.toISOString()
    })
  })

  it('reports a closed game once the status stops being rewritten', async () => {
    const directory = await diagnostics()
    await writeFile(join(directory, 'native-profile-180836-222.log'), 'status=armed\npid=222\n')
    const later = (): number => Date.now() + 60_000
    expect((await new GameStatusService(directory, later).observe(root)).state).toBe('not_running')
  })

  it('does not trust a status file that names another process', async () => {
    const directory = await diagnostics()
    await writeFile(join(directory, 'native-profile-180836-222.log'), 'status=armed\npid=999\n')
    expect((await new GameStatusService(directory).observe(root)).state).toBe('query_failed')
  })
})
