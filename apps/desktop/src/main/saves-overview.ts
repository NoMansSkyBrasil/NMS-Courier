import { readdir, stat } from 'node:fs/promises'
import { join } from 'node:path'

// What the "Saves" page shows: when each save slot was last written by the game, and the safety
// copies this application made before its changes. Read only; nothing here opens a save file.

export type SaveSlot = {
  // 1 is the game's first slot. A slot is two files: save.hg and save2.hg are slot 1.
  slot: number
  // When the game last wrote either file of the slot.
  lastSaved: string
}

export type SaveBackup = {
  // The backup's folder name.
  name: string
  // When it was made; null when the folder is not named the way this application names them.
  createdAt: string | null
  // The area whose change it was made before ("items", "currencies", ...).
  feature: string
}

export type SavesOverview = {
  slots: SaveSlot[]
  // Newest first, at most the fifty newest.
  backups: SaveBackup[]
  backupCount: number
}

const saveFile = /^save(\d*)\.hg$/i
const backupFolder = /^(\d{4}-\d{2}-\d{2})T(\d{2})-(\d{2})-(\d{2})-(\d{3})Z-(.+)$/

async function entries(directory: string): Promise<string[]> {
  return readdir(directory).catch(() => [])
}

// The save files of one folder, as slot number and time of the last write.
async function slotsIn(directory: string): Promise<Map<number, number>> {
  const found = new Map<number, number>()
  for (const name of await entries(directory)) {
    const match = saveFile.exec(name)
    if (!match) continue
    const index = match[1] === '' ? 1 : Number(match[1])
    if (!Number.isInteger(index) || index < 1 || index > 60) continue
    const written = await stat(join(directory, name)).then(
      (info) => info.mtimeMs,
      () => null
    )
    if (written === null) continue
    const slot = Math.ceil(index / 2)
    found.set(slot, Math.max(found.get(slot) ?? 0, written))
  }
  return found
}

export function parseBackupName(name: string): SaveBackup {
  const match = backupFolder.exec(name)
  if (!match) return { name, createdAt: null, feature: '' }
  const [, day, hours, minutes, seconds, milliseconds, feature] = match
  return {
    name,
    createdAt: `${day}T${hours}:${minutes}:${seconds}.${milliseconds}Z`,
    feature
  }
}

export async function readSavesOverview(
  saveDirectory: string,
  backupDirectory: string
): Promise<SavesOverview> {
  // The game keeps one folder for each account under the save folder; older installations keep
  // the files in the save folder itself.
  const folders = [saveDirectory]
  for (const name of await entries(saveDirectory)) {
    const path = join(saveDirectory, name)
    if (
      await stat(path).then(
        (info) => info.isDirectory(),
        () => false
      )
    )
      folders.push(path)
  }
  const newest = new Map<number, number>()
  for (const folder of folders) {
    for (const [slot, written] of await slotsIn(folder)) {
      newest.set(slot, Math.max(newest.get(slot) ?? 0, written))
    }
  }
  const backups = (await entries(backupDirectory))
    .map(parseBackupName)
    .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
  return {
    slots: [...newest]
      .sort(([a], [b]) => a - b)
      .map(([slot, written]) => ({ slot, lastSaved: new Date(written).toISOString() })),
    backups: backups.slice(0, 50),
    backupCount: backups.length
  }
}
