import { createHash } from 'node:crypto'
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  bridgeFileName,
  bridgePathIn,
  dataPathIn,
  getBridgeInstallState,
  installBridge
} from './bridge-installer'
import { bridgeReleases, bridgeVersion } from './bridge-version'
import { currencyDataSha256 } from './currency-plan'

// The copies the application carries, in the repository.
const carried = join(__dirname, '..', '..', '..', 'resources', 'bridge')
const sha256 = async (path: string): Promise<string> =>
  createHash('sha256')
    .update(await readFile(path))
    .digest('hex')

async function emptyGame(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'courier-install-'))
  await mkdir(join(root, 'Binaries'), { recursive: true })
  return root
}

describe('bridge installer', () => {
  it('carries the bridge and the data file this application was built with', async () => {
    expect(bridgeReleases[await sha256(join(carried, bridgeFileName))]).toBe(bridgeVersion)
    expect(await sha256(join(carried, 'REWARDTABLE.EXML'))).toBe(currencyDataSha256)
  })

  it('installs into a game that has neither file, and then asks for nothing', async () => {
    const root = await emptyGame()
    expect(await getBridgeInstallState(root, carried, false)).toEqual({
      bridge: 'missing',
      data: 'missing',
      needed: true,
      blocked: null
    })
    expect(await installBridge(root, carried, false)).toEqual({
      bridge: 'current',
      data: 'current',
      needed: false,
      blocked: null
    })
    expect(await sha256(bridgePathIn(root))).toBe(await sha256(join(carried, bridgeFileName)))
    expect(await sha256(dataPathIn(root))).toBe(currencyDataSha256)
  })

  it('does not touch the game while it runs', async () => {
    const root = await emptyGame()
    const state = await installBridge(root, carried, true)
    expect(state.blocked).toBe('game_running')
    expect(state.bridge).toBe('missing')
  })

  it('never replaces a file of the same name that is not ours', async () => {
    const root = await emptyGame()
    await writeFile(bridgePathIn(root), 'another mod')
    const state = await installBridge(root, carried, false)
    expect(state).toMatchObject({ bridge: 'foreign', blocked: 'foreign_file' })
    expect(await readFile(bridgePathIn(root), 'utf8')).toBe('another mod')
  })

  it('refuses when the carried files are not the ones it was built with', async () => {
    const root = await emptyGame()
    const empty = await mkdtemp(join(tmpdir(), 'courier-carried-'))
    expect((await installBridge(root, empty, false)).blocked).toBe('files_unavailable')
  })
})
