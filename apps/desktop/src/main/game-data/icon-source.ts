import { join } from 'node:path'
import { openPakArchive } from './pak-archive'
import type { PakArchive } from './pak-archive'

// Hands the renderer the texture of a catalogue icon exactly as the game stores it. The texture
// is read from the game's own interface texture archive when it is asked for; nothing is extracted
// to disk and nothing is cached outside memory. Only locators that the local catalogue names are
// served, so the renderer cannot use this to read other game files.

const iconArchive = 'NMSARC.TexUI.pak'
// The archive is closed again when no icon was asked for during this time.
const idleMilliseconds = 30_000
// An interface icon with its smaller copies stays far below this.
const largestIcon = 8 * 1024 * 1024

export class IconSource {
  private open: { root: string; archive: PakArchive } | null = null
  private idleTimer: NodeJS.Timeout | null = null

  // Bytes of the texture file, or null when it cannot be served.
  read(
    installationRoot: string | null,
    locator: string,
    allowed: ReadonlySet<string>
  ): Buffer | null {
    const name = locator.toLowerCase()
    if (!installationRoot || !allowed.has(name) || !name.endsWith('.dds')) return null
    try {
      const data = this.archive(installationRoot).read(name)
      return data && data.length <= largestIcon ? data : null
    } catch {
      this.close()
      return null
    }
  }

  close(): void {
    if (this.idleTimer) clearTimeout(this.idleTimer)
    this.idleTimer = null
    this.open?.archive.close()
    this.open = null
  }

  private archive(installationRoot: string): PakArchive {
    if (this.open?.root !== installationRoot) {
      this.close()
      this.open = {
        root: installationRoot,
        archive: openPakArchive(join(installationRoot, 'GAMEDATA', 'PCBANKS', iconArchive))
      }
    }
    if (this.idleTimer) clearTimeout(this.idleTimer)
    this.idleTimer = setTimeout(() => this.close(), idleMilliseconds)
    this.idleTimer.unref()
    return this.open.archive
  }
}
