import { mkdir, mkdtemp, utimes, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { parseBackupName, readSavesOverview } from './saves-overview'

describe('saves overview', () => {
  it('reads the area and the time from a backup folder name', () => {
    expect(parseBackupName('2026-10-10T05-30-12-345Z-pendingTech')).toEqual({
      name: '2026-10-10T05-30-12-345Z-pendingTech',
      createdAt: '2026-10-10T05:30:12.345Z',
      feature: 'pendingTech'
    })
    expect(parseBackupName('something else')).toEqual({
      name: 'something else',
      createdAt: null,
      feature: ''
    })
  })

  it('lists slots by their newest file and backups newest first', async () => {
    const base = await mkdtemp(join(tmpdir(), 'courier-saves-'))
    const saves = join(base, 'saves')
    const account = join(saves, 'st_1')
    const backups = join(base, 'backups')
    await mkdir(account, { recursive: true })
    await mkdir(join(backups, '2026-10-09T10-00-00-000Z-items'), { recursive: true })
    await mkdir(join(backups, '2026-10-10T10-00-00-000Z-currencies'), { recursive: true })
    const write = async (name: string, when: string): Promise<void> => {
      await writeFile(join(account, name), 'x')
      await utimes(join(account, name), new Date(when), new Date(when))
    }
    await write('save.hg', '2026-10-01T10:00:00Z')
    await write('save2.hg', '2026-10-02T10:00:00Z')
    await write('save5.hg', '2026-10-05T10:00:00Z')
    await write('accountdata.hg', '2026-10-06T10:00:00Z')
    await write('mf_save.hg', '2026-10-07T10:00:00Z')

    const overview = await readSavesOverview(saves, backups)
    expect(overview.slots).toEqual([
      { slot: 1, lastSaved: '2026-10-02T10:00:00.000Z' },
      { slot: 3, lastSaved: '2026-10-05T10:00:00.000Z' }
    ])
    expect(overview.backups.map((backup) => backup.feature)).toEqual(['currencies', 'items'])
    expect(overview.backupCount).toBe(2)
  })

  it('answers with nothing when the folders do not exist', async () => {
    const base = await mkdtemp(join(tmpdir(), 'courier-saves-'))
    expect(await readSavesOverview(join(base, 'none'), join(base, 'nope'))).toEqual({
      slots: [],
      backups: [],
      backupCount: 0
    })
  })
})
