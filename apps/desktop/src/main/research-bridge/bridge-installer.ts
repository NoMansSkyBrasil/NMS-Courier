import { createHash } from 'node:crypto'
import { copyFile, mkdir, readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { bridgeReleases, bridgeVersion } from './bridge-version'
import { currencyDataSha256 } from './currency-plan'

// Puts the two files the application needs inside the game: the bridge and the data file of the
// carrier rewards. The copies the application carries are in resources/bridge. Only plain file
// reads and copies, so it works the same on every platform.

export const bridgeFileName = 'xinput9_1_0.dll'
const dataFileParts = ['METADATA', 'REALITY', 'TABLES', 'REWARDTABLE.EXML'] as const

export type InstalledFile =
  // Not in the game folder.
  | 'missing'
  // The one this application was built with.
  | 'current'
  // An earlier one of this application; replaced on installation.
  | 'older'
  // A file of this name that is not ours (another mod); never replaced.
  | 'foreign'

export type BridgeInstallState = {
  bridge: InstalledFile
  data: InstalledFile
  // True when pressing "install" would change something.
  needed: boolean
  // Why an installation cannot be done right now; null when it can.
  blocked: 'game_running' | 'foreign_file' | 'files_unavailable' | null
}

export function bridgePathIn(installationRoot: string): string {
  return join(installationRoot, 'Binaries', bridgeFileName)
}

export function dataPathIn(installationRoot: string): string {
  return join(installationRoot, 'GAMEDATA', 'MODS', 'NMSCourier', ...dataFileParts)
}

async function sha256Of(path: string): Promise<string | null> {
  try {
    return createHash('sha256')
      .update(await readFile(path))
      .digest('hex')
  } catch {
    return null
  }
}

const currentBridgeSha256 = Object.entries(bridgeReleases).find(
  ([, version]) => version === bridgeVersion
)?.[0]

function bridgeKind(sha256: string | null): InstalledFile {
  if (sha256 === null) return 'missing'
  if (sha256 === currentBridgeSha256) return 'current'
  return sha256 in bridgeReleases ? 'older' : 'foreign'
}

// The data file lives in a folder of our own name, so one that differs is an earlier one of ours.
function dataKind(sha256: string | null): InstalledFile {
  if (sha256 === null) return 'missing'
  return sha256 === currencyDataSha256 ? 'current' : 'older'
}

// Whether the copies the application carries are the ones it was built with.
async function carriedFilesMatch(resourceDirectory: string): Promise<boolean> {
  const [bridge, data] = await Promise.all([
    sha256Of(join(resourceDirectory, bridgeFileName)),
    sha256Of(join(resourceDirectory, 'REWARDTABLE.EXML'))
  ])
  return bridge !== null && bridge === currentBridgeSha256 && data === currencyDataSha256
}

export async function getBridgeInstallState(
  installationRoot: string,
  resourceDirectory: string,
  gameRunning: boolean
): Promise<BridgeInstallState> {
  const [bridge, data] = await Promise.all([
    sha256Of(bridgePathIn(installationRoot)).then(bridgeKind),
    sha256Of(dataPathIn(installationRoot)).then(dataKind)
  ])
  const needed = bridge !== 'current' || data !== 'current'
  const blocked = !needed
    ? null
    : bridge === 'foreign'
      ? 'foreign_file'
      : !(await carriedFilesMatch(resourceDirectory))
        ? 'files_unavailable'
        : gameRunning
          ? 'game_running'
          : null
  return { bridge, data, needed, blocked }
}

// Copies what is missing or older. Does nothing when blocked; the returned state says why.
export async function installBridge(
  installationRoot: string,
  resourceDirectory: string,
  gameRunning: boolean
): Promise<BridgeInstallState> {
  const before = await getBridgeInstallState(installationRoot, resourceDirectory, gameRunning)
  if (!before.needed || before.blocked) return before
  try {
    if (before.bridge !== 'current') {
      await copyFile(join(resourceDirectory, bridgeFileName), bridgePathIn(installationRoot))
    }
    if (before.data !== 'current') {
      const target = dataPathIn(installationRoot)
      await mkdir(dirname(target), { recursive: true })
      await copyFile(join(resourceDirectory, 'REWARDTABLE.EXML'), target)
    }
  } catch {
    // The state read back below tells what did and did not get there.
  }
  return getBridgeInstallState(installationRoot, resourceDirectory, gameRunning)
}
