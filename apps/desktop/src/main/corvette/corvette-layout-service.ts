import { cp, mkdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { join } from 'node:path'
import { openPakArchive } from '../game-data/pak-archive'
import { describeCorvette, readNmsShipFile, type ShipPart } from './nmsship-file'
import {
  buildShipBaseLayout,
  buildValidationOffOptions,
  debugOptionsPath,
  shipBaseLayoutPath
} from './ship-base-layout'

// Turns a corvette export (`.nmsship`) into what the game's corvette build mode starts from. The
// game reads its starting layout from one file when it starts; this service writes that file, built
// from the export's parts, into a folder of its own in the game's mod folder, together with the
// game's debug options with corvette validation switched off (many shared corvettes do not pass
// it). After a game restart, the build request of the Corvettes page opens build mode with the
// export assembled, and the player finishes it in the game. Proven by hand on 2026-10-07; see
// docs/CORVETTE_DELIVERY_NOTES.md. Nothing in a save is touched.

// The project's one folder in the game's mod folder; the reward entries live there too.
const modFolder = 'NMSCourier'
// The folder the research of 2026-10-07 used for the same two files; it must not stay beside ours.
const researchFolder = 'NMSCourierCorvetteLayoutResearch'
const layoutFile = ['METADATA', 'SIMULATION', 'SHIPBASES', 'DEFAULTSHIPBASE.MBIN']
const optionsFile = ['GCDEBUGOPTIONS.GLOBAL.MBIN']
const layoutArchive = 'NMSARC.Precache.pak'
const optionsArchive = 'NMSARC.globals.pak'
// A corvette export is small; anything larger is not one.
const largestFile = 16 * 1024 * 1024

export type CorvetteFileSummary =
  | {
      state: 'corvette'
      name: string
      partCount: number
      hullPartCount: number
      hasCockpit: boolean
      hasLandingGear: boolean
      hasHabitation: boolean
      hasReactor: boolean
    }
  // ship: an ordinary ship export, which this route cannot deliver.
  | { state: 'ship'; name: string }
  | {
      state: 'invalid'
      reason: 'not_a_ship_file' | 'too_many_parts' | 'invalid_part' | 'too_large'
    }

export type CorvetteLayoutStatus = {
  // The layout this application installed last, when its file is still in the mod folder.
  installed: { name: string; partCount: number; installedAt: string } | null
}

export type CorvetteInstallResult =
  | { state: 'installed'; name: string; partCount: number }
  | {
      state: 'failed'
      // unreadable: the game's own files could not be read; unwritable: the mod folder could not
      // be written.
      reason:
        | 'installation_not_selected'
        | 'no_file_chosen'
        | 'unknown_structure'
        | 'unreadable'
        | 'unwritable'
      // The system's error code, for the record.
      detail?: string
    }

type Record = { name: string; partCount: number; installedAt: string; layoutSha256: string }

export class CorvetteLayoutService {
  private chosen: { name: string; parts: ShipPart[] } | null = null

  constructor(private readonly userDataPath: string) {}

  private recordPath(): string {
    return join(this.userDataPath, 'corvette-layout.json')
  }

  // Read an export the user picked. A corvette is kept in memory until it is installed.
  async choose(path: string): Promise<CorvetteFileSummary> {
    this.chosen = null
    const info = await stat(path).catch(() => null)
    if (!info || info.size > largestFile) return { state: 'invalid', reason: 'too_large' }
    const file = readNmsShipFile(await readFile(path))
    if (typeof file === 'string') return { state: 'invalid', reason: file }
    if (file.kind === 'ship') return { state: 'ship', name: file.name }
    this.chosen = { name: file.name, parts: file.parts }
    return { state: 'corvette', name: file.name, ...describeCorvette(file.parts) }
  }

  async status(installationRoot: string | null): Promise<CorvetteLayoutStatus> {
    if (!installationRoot) return { installed: null }
    try {
      const record = JSON.parse(await readFile(this.recordPath(), 'utf8')) as Record
      const layout = await readFile(
        join(installationRoot, 'GAMEDATA', 'MODS', modFolder, ...layoutFile)
      )
      const same = createHash('sha256').update(layout).digest('hex') === record.layoutSha256
      return {
        installed: same
          ? { name: record.name, partCount: record.partCount, installedAt: record.installedAt }
          : null
      }
    } catch {
      return { installed: null }
    }
  }

  // Write the layout of the chosen export and the validation switch into the game's mod folder.
  async install(installationRoot: string | null): Promise<CorvetteInstallResult> {
    if (!installationRoot) return { state: 'failed', reason: 'installation_not_selected' }
    if (!this.chosen) return { state: 'failed', reason: 'no_file_chosen' }
    const banks = join(installationRoot, 'GAMEDATA', 'PCBANKS')
    let layout: Buffer
    let options: Buffer
    try {
      const read = (archive: string, name: string): Buffer => {
        const pak = openPakArchive(join(banks, archive))
        try {
          const data = pak.read(name)
          if (!data) throw new Error('missing')
          return data
        } finally {
          pak.close()
        }
      }
      layout = buildShipBaseLayout(read(layoutArchive, shipBaseLayoutPath), this.chosen.parts)
      options = buildValidationOffOptions(read(optionsArchive, debugOptionsPath))
    } catch (error) {
      const unknown = error instanceof Error && error.message === 'unknown_structure'
      return { state: 'failed', reason: unknown ? 'unknown_structure' : 'unreadable' }
    }

    const mods = join(installationRoot, 'GAMEDATA', 'MODS')
    try {
      // The research folder holds the same two files; it is moved out of the game, not deleted.
      const research = join(mods, researchFolder)
      if (await stat(research).catch(() => null)) {
        const kept = join(this.userDataPath, 'replaced-mods')
        await mkdir(kept, { recursive: true })
        const target = join(kept, `${researchFolder}-${Date.now()}`)
        // The game and the application's data are often on different drives, where a rename is
        // not possible: copy first, then remove the copy that was in the game.
        await rename(research, target).catch(async () => {
          await cp(research, target, { recursive: true })
          await rm(research, { recursive: true })
        })
      }
      const layoutPath = join(mods, modFolder, ...layoutFile)
      await mkdir(join(layoutPath, '..'), { recursive: true })
      await writeFile(layoutPath, layout)
      await writeFile(join(mods, modFolder, ...optionsFile), options)
      const record: Record = {
        name: this.chosen.name,
        partCount: this.chosen.parts.length,
        installedAt: new Date().toISOString(),
        layoutSha256: createHash('sha256').update(layout).digest('hex')
      }
      await writeFile(this.recordPath(), JSON.stringify(record, null, 2))
      return { state: 'installed', name: record.name, partCount: record.partCount }
    } catch (error) {
      const detail = (error as NodeJS.ErrnoException).code ?? String(error).slice(0, 120)
      return { state: 'failed', reason: 'unwritable', detail }
    }
  }
}
