import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { openPakArchive } from '../game-data/pak-archive'
import type { PakArchive } from '../game-data/pak-archive'

// Reads model files (scenes, part lists, geometry) from the selected installation's own archives
// when the workshop asks for them. Nothing is extracted to disk. Archives are opened on first use
// and closed again after a quiet period.

// Archives that hold scene graphs, part lists and geometry; texture and audio archives are skipped.
const modelArchive = /^NMSARC\.(EntitySceneMBIN|Mesh[A-Za-z]*|Precache|MetadataEtc|Scenes)\.pak$/i
const idleMilliseconds = 60_000

export type ModelFiles = {
  // Contents of one game file by its game path (any case, either slash), or null when absent.
  read: (gamePath: string) => Buffer | null
}

export class GameModelFiles implements ModelFiles {
  private open: { root: string; archives: PakArchive[]; owner: Map<string, PakArchive> } | null =
    null
  private idleTimer: NodeJS.Timeout | null = null

  constructor(private readonly installationRoot: () => string | null) {}

  read(gamePath: string): Buffer | null {
    const root = this.installationRoot()
    if (!root) return null
    const name = gamePath.replace(/\\/g, '/').toLowerCase()
    const owner = this.archives(root).get(name)
    return owner ? owner.read(name) : null
  }

  close(): void {
    if (this.idleTimer) clearTimeout(this.idleTimer)
    this.idleTimer = null
    for (const archive of this.open?.archives ?? []) archive.close()
    this.open = null
  }

  private archives(root: string): Map<string, PakArchive> {
    if (this.open?.root !== root) {
      this.close()
      const folder = join(root, 'GAMEDATA', 'PCBANKS')
      const archives: PakArchive[] = []
      const owner = new Map<string, PakArchive>()
      for (const file of readdirSync(folder).sort()) {
        if (!modelArchive.test(file)) continue
        const archive = openPakArchive(join(folder, file))
        archives.push(archive)
        // The first archive that names a file serves it.
        for (const name of archive.names) if (!owner.has(name)) owner.set(name, archive)
      }
      this.open = { root, archives, owner }
    }
    if (this.idleTimer) clearTimeout(this.idleTimer)
    this.idleTimer = setTimeout(() => this.close(), idleMilliseconds)
    this.idleTimer.unref()
    return this.open.owner
  }
}
