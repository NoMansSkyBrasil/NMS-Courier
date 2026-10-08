import { execFile } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'

// Where an installation may be, without scanning disks: the running game, the store clients'
// own records of their libraries, and nothing else.

const steamGameFolder = join('steamapps', 'common', "No Man's Sky")
// GOG's product number for No Man's Sky, as used in its registry key. Not verified on a GOG
// installation by this project.
const gogGameKey = 'HKLM\\SOFTWARE\\WOW6432Node\\GOG.com\\Games\\1446213994'

export type DetectionSources = {
  // Value of a registry entry, or null when the key or the value does not exist.
  readRegistryValue: (key: string, value: string) => Promise<string | null>
  readTextFile: (path: string) => Promise<string | null>
  // Full paths of running NMS.exe processes.
  listRunningGamePaths: () => Promise<string[]>
}

// Library folders listed in Steam's libraryfolders.vdf ("path" entries, backslashes escaped).
export function parseSteamLibraryFolders(vdf: string): string[] {
  const paths: string[] = []
  for (const match of vdf.matchAll(/"path"\s+"((?:[^"\\]|\\.)*)"/g)) {
    paths.push(match[1].replace(/\\\\/g, '\\'))
  }
  return paths
}

// Candidate installation roots, most certain first, without duplicates. Nothing is validated here.
export async function findInstallationCandidates(sources: DetectionSources): Promise<string[]> {
  const candidates: string[] = []
  const add = (path: string | null): void => {
    if (!path) return
    const normalized = resolve(path)
    if (!candidates.some((known) => known.toLowerCase() === normalized.toLowerCase())) {
      candidates.push(normalized)
    }
  }

  // A running game is at <root>\Binaries\NMS.exe.
  for (const executable of await sources.listRunningGamePaths()) add(dirname(dirname(executable)))

  const steamRoots = [
    await sources.readRegistryValue('HKCU\\Software\\Valve\\Steam', 'SteamPath'),
    await sources.readRegistryValue('HKLM\\SOFTWARE\\WOW6432Node\\Valve\\Steam', 'InstallPath')
  ]
  for (const steamRoot of steamRoots) {
    if (!steamRoot) continue
    add(join(steamRoot, steamGameFolder))
    const vdf = await sources.readTextFile(join(steamRoot, 'steamapps', 'libraryfolders.vdf'))
    for (const library of vdf ? parseSteamLibraryFolders(vdf) : []) {
      add(join(library, steamGameFolder))
    }
  }

  add(await sources.readRegistryValue(gogGameKey, 'path'))
  return candidates
}

function run(file: string, args: string[]): Promise<string | null> {
  return new Promise((resolveOutput) => {
    execFile(
      file,
      args,
      { windowsHide: true, timeout: 10_000, maxBuffer: 256 * 1024 },
      (error, stdout) => resolveOutput(error ? null : stdout)
    )
  })
}

export const systemDetectionSources: DetectionSources = {
  readRegistryValue: async (key, value) => {
    const output = await run('reg.exe', ['query', key, '/v', value])
    const match = output?.match(new RegExp(`^\\s*${value}\\s+REG_\\w+\\s+(.+?)\\s*$`, 'im'))
    return match ? match[1] : null
  },
  readTextFile: (path) => readFile(path, 'utf8').catch(() => null),
  listRunningGamePaths: async () => {
    const output = await run('powershell.exe', [
      '-NoProfile',
      '-NonInteractive',
      '-Command',
      '(Get-Process -Name NMS -ErrorAction SilentlyContinue).Path'
    ])
    return (output ?? '')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => /\\NMS\.exe$/i.test(line))
  }
}
