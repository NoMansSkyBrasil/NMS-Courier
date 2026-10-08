import { mkdir, rename, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { coreTableDomains, coreTablePath, GameTableError, readCoreTable } from './core-tables'
import type { CoreTableDomain, CoreTableEntry } from './core-tables'
import { gameLanguages, readLocalisationTable } from './localisation-table'
import { openPakArchive, PakArchiveError } from './pak-archive'
import type { PakArchive } from './pak-archive'

// Builds the local catalogue from the selected installation: reads the three core tables and the
// 14 interface languages out of the game's own archives and writes a new catalogue generation in
// the application's data folder. Nothing is written to the game folder, no save is read and the
// game process is not touched. The previous generation stays in place when anything fails.

// The archives that hold the tables and the language files; the first that has a file wins.
const sourceArchives = ['NMSARC.Precache.pak', 'NMSARC.MetadataEtc.pak']

export type CatalogImportResult =
  | { state: 'imported'; generationId: string; entryCount: number; untranslated: number }
  | {
      state: 'failed'
      // installation_not_selected: no folder; archives_missing: the game's archives were not
      // found; unknown_structure: a table changed with a game update this version does not know;
      // unreadable: an archive or table could not be read; busy: an import is already running.
      reason:
        | 'installation_not_selected'
        | 'archives_missing'
        | 'unknown_structure'
        | 'unreadable'
        | 'busy'
      detail: string | null
    }

export type CatalogImportSource = {
  rootPath: string | null
  executableSha256: string | null
  productVersion: string | null
}

type LocalisedText = { name: string; subtitle: string; description: string }

const pause = (): Promise<void> => new Promise((resolve) => setImmediate(resolve))

function readFromArchives(archives: readonly PakArchive[], name: string): Buffer | null {
  for (const archive of archives) {
    const data = archive.read(name)
    if (data) return data
  }
  return null
}

export class CatalogImporter {
  private running = false

  constructor(private readonly userDataPath: string) {}

  async run(source: CatalogImportSource, now: Date = new Date()): Promise<CatalogImportResult> {
    if (this.running) return { state: 'failed', reason: 'busy', detail: null }
    if (!source.rootPath) {
      return { state: 'failed', reason: 'installation_not_selected', detail: null }
    }
    this.running = true
    const archives: PakArchive[] = []
    try {
      const banks = join(source.rootPath, 'GAMEDATA', 'PCBANKS')
      for (const name of sourceArchives) {
        try {
          archives.push(openPakArchive(join(banks, name)))
        } catch (error) {
          if (error instanceof PakArchiveError) {
            return { state: 'failed', reason: 'unreadable', detail: name }
          }
          return { state: 'failed', reason: 'archives_missing', detail: name }
        }
      }

      const tables = new Map<CoreTableDomain, CoreTableEntry[]>()
      const wanted = new Set<string>()
      for (const domain of coreTableDomains) {
        const data = readFromArchives(archives, coreTablePath(domain))
        if (!data) return { state: 'failed', reason: 'archives_missing', detail: domain }
        const entries = readCoreTable(domain, data)
        tables.set(domain, entries)
        for (const entry of entries) {
          for (const key of [entry.nameKey, entry.subtitleKey, entry.descriptionKey]) {
            if (key) wanted.add(key)
          }
        }
        await pause()
      }

      const languageFiles = archives.flatMap((archive) =>
        archive.names.filter((name) => name.startsWith('language/') && name.endsWith('.mbin'))
      )
      const texts = new Map<string, Map<string, string>>()
      for (const [locale, language] of Object.entries(gameLanguages)) {
        const found = new Map<string, string>()
        for (const name of languageFiles.filter((file) => file.endsWith(`_${language}.mbin`))) {
          const data = readFromArchives(archives, name)
          if (data) readLocalisationTable(data, wanted, found)
          await pause()
        }
        texts.set(locale, found)
      }

      let untranslated = 0
      const domains: Record<string, number> = {}
      const entries: unknown[] = []
      for (const [domain, table] of tables) {
        domains[domain] = table.length
        for (const entry of table) {
          const localizations: Record<string, LocalisedText> = {}
          for (const [locale, found] of texts) {
            const name = found.get(entry.nameKey) ?? ''
            if (!name) untranslated += 1
            localizations[locale] = {
              name,
              subtitle: found.get(entry.subtitleKey) ?? '',
              description: found.get(entry.descriptionKey) ?? ''
            }
          }
          entries.push({
            entryKey: `${domain}:${entry.gameId}`,
            gameId: entry.gameId,
            domain,
            category: entry.category,
            icon: entry.icon,
            stackMultiplier: entry.stackMultiplier,
            stackSingle: entry.stackSingle,
            localizations
          })
        }
      }

      // Sortable by time, so the newest generation is the one the catalogue opens.
      const stamp = now
        .toISOString()
        .replace(/[-:]/g, '')
        .replace(/\.\d+Z$/, 'Z')
      const generationId = `${stamp}-${(source.executableSha256 ?? 'unknown').slice(0, 12)}`
      const generations = join(this.userDataPath, 'catalog', 'generations')
      const staging = join(generations, `.staging-${generationId}`)
      await mkdir(staging, { recursive: true })
      try {
        await writeFile(
          join(staging, 'core-catalog.json'),
          JSON.stringify({
            installation: {
              productVersion: source.productVersion,
              executableSha256: source.executableSha256
            },
            source: { archives: sourceArchives, reader: 'native-2' },
            domains,
            entries
          })
        )
        await rename(staging, join(generations, generationId))
      } catch (error) {
        await rm(staging, { recursive: true, force: true })
        throw error
      }
      return { state: 'imported', generationId, entryCount: entries.length, untranslated }
    } catch (error) {
      if (error instanceof GameTableError && error.reason === 'unknown_structure') {
        return { state: 'failed', reason: 'unknown_structure', detail: null }
      }
      return {
        state: 'failed',
        reason: 'unreadable',
        detail: error instanceof Error ? error.message.slice(0, 200) : null
      }
    } finally {
      for (const archive of archives) archive.close()
      this.running = false
    }
  }
}
