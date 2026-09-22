import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { inspectInstallation, InstallationService } from './installation-service'

const temporaryDirectories: string[] = []

function createInstallation(): string {
  const root = mkdtempSync(join(tmpdir(), 'nms-courier-installation-'))
  temporaryDirectories.push(root)
  mkdirSync(join(root, 'GAMEDATA', 'PCBANKS'), { recursive: true })
  writeFileSync(join(root, 'NMS.exe'), 'fixture executable')
  return root
}

afterEach(() => {
  while (temporaryDirectories.length)
    rmSync(temporaryDirectories.pop()!, { recursive: true, force: true })
})

describe('selected game installation', () => {
  it('rejects a directory that does not have the expected game layout', async () => {
    const root = mkdtempSync(join(tmpdir(), 'nms-courier-installation-'))
    temporaryDirectories.push(root)
    expect((await inspectInstallation(root)).state).toBe('invalid')
  })

  it('stores a selected installation fingerprint without exposing the root in status', async () => {
    const userDataPath = mkdtempSync(join(tmpdir(), 'nms-courier-user-data-'))
    temporaryDirectories.push(userDataPath)
    const status = await new InstallationService(userDataPath).select(createInstallation())
    expect(status).toMatchObject({
      state: 'available',
      displayName: expect.any(String),
      executableSha256: expect.stringMatching(/^[a-f0-9]{64}$/)
    })
    expect(status).not.toHaveProperty('rootPath')
  })
})
