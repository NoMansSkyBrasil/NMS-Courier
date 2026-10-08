import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { openPakArchive } from '../game-data/pak-archive'
import type { PakArchive } from '../game-data/pak-archive'

// Reads model files (scenes, part lists, geometry) from the selected installation's own archives
// when the workshop asks for them. Nothing is extracted to disk. Archives are opened on first use
// and closed again after a quiet period.

// Archives that hold scene graphs, part lists and geometry; texture and audio archives are skipped.
const modelArchive = /^NMSARC\.(EntitySceneMBIN|Mesh[A-Za-z]*|Precache|MetadataEtc|Scenes)\.pak$/i
// Archives that hold the textures of ships, multi-tools and freighters; planet and creature
// texture archives are skipped.
const textureArchive = /^NMSARC\.Tex(?!Biomes|Creature|Planet)[A-Za-z]*\.pak$/i
const idleMilliseconds = 60_000

export type ModelFiles = {
  // Contents of one game file by its game path (any case, either slash), or null when absent.
  read: (gamePath: string) => Buffer | null
  readTexture: (gamePath: string) => Buffer | null
}

type OpenSet = { archives: PakArchive[]; owner: Map<string, PakArchive> }

export class GameModelFiles implements ModelFiles {
  private root: string | null = null
  private sets = new Map<RegExp, OpenSet>()
  private idleTimer: NodeJS.Timeout | null = null

  constructor(private readonly installationRoot: () => string | null) {}

  read(gamePath: string): Buffer | null {
    return this.from(modelArchive, gamePath)
  }

  // A texture file; the texture archives are opened only when the first texture is asked for.
  readTexture(gamePath: string): Buffer | null {
    return this.from(textureArchive, gamePath)
  }

  close(): void {
    if (this.idleTimer) clearTimeout(this.idleTimer)
    this.idleTimer = null
    for (const set of this.sets.values()) for (const archive of set.archives) archive.close()
    this.sets.clear()
  }

  private from(pattern: RegExp, gamePath: string): Buffer | null {
    const root = this.installationRoot()
    if (!root) return null
    if (this.root !== root) {
      this.close()
      this.root = root
    }
    let set = this.sets.get(pattern)
    if (!set) {
      const folder = join(root, 'GAMEDATA', 'PCBANKS')
      set = { archives: [], owner: new Map() }
      for (const file of readdirSync(folder).sort()) {
        if (!pattern.test(file)) continue
        const archive = openPakArchive(join(folder, file))
        set.archives.push(archive)
        // The first archive that names a file serves it.
        for (const name of archive.names) if (!set.owner.has(name)) set.owner.set(name, archive)
      }
      this.sets.set(pattern, set)
    }
    if (this.idleTimer) clearTimeout(this.idleTimer)
    this.idleTimer = setTimeout(() => this.close(), idleMilliseconds)
    this.idleTimer.unref()
    const name = gamePath.split('\\').join('/').toLowerCase()
    const owner = set.owner.get(name)
    return owner ? owner.read(name) : null
  }
}
