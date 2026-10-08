import { join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  findInstallationCandidates,
  parseSteamLibraryFolders,
  type DetectionSources
} from './installation-detection'

const vdf = `"libraryfolders"
{
	"0"
	{
		"path"		"C:\\\\Program Files (x86)\\\\Steam"
		"apps" { "228980" "1" }
	}
	"1"
	{
		"path"		"E:\\\\SteamLibrary"
		"apps" { "275850" "20000000000" }
	}
}`

function sources(overrides: Partial<DetectionSources>): DetectionSources {
  return {
    readRegistryValue: async () => null,
    readTextFile: async () => null,
    listRunningGamePaths: async () => [],
    ...overrides
  }
}

describe('installation detection', () => {
  it('reads the library folders of the Steam client', () => {
    expect(parseSteamLibraryFolders(vdf)).toEqual([
      'C:\\Program Files (x86)\\Steam',
      'E:\\SteamLibrary'
    ])
    expect(parseSteamLibraryFolders('not a library file')).toEqual([])
  })

  it('returns nothing when no store client and no running game are found', async () => {
    expect(await findInstallationCandidates(sources({}))).toEqual([])
  })

  it('puts the running game first and lists every Steam library once', async () => {
    const steamRoot = 'C:\\Program Files (x86)\\Steam'
    const found = await findInstallationCandidates(
      sources({
        listRunningGamePaths: async () => [
          "E:\\SteamLibrary\\steamapps\\common\\No Man's Sky\\Binaries\\NMS.exe"
        ],
        readRegistryValue: async (key) => (key.startsWith('HKCU') ? steamRoot : null),
        readTextFile: async (path) => (path.endsWith('libraryfolders.vdf') ? vdf : null)
      })
    )
    const game = join('steamapps', 'common', "No Man's Sky")
    expect(found).toEqual([resolve('E:\\SteamLibrary', game), resolve(steamRoot, game)])
  })
})
