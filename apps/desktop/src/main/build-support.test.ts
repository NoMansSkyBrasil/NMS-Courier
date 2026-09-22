import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { resolveBuildSupport } from './build-support'

const temporaryDirectories: string[] = []
const executableSha256 = 'a'.repeat(64)
const installation = {
  state: 'available' as const,
  displayName: 'No Man’s Sky',
  executableSha256,
  executableSize: 1,
  reason: null
}

function createResourceContext(registry: unknown): {
  isPackaged: false
  resourcesPath: string
  moduleDirectory: string
} {
  const root = mkdtempSync(join(tmpdir(), 'nms-courier-build-support-'))
  temporaryDirectories.push(root)
  const config = join(root, 'resources', 'runtime', 'config')
  mkdirSync(config, { recursive: true })
  writeFileSync(join(config, 'supported-builds.json'), JSON.stringify(registry), 'utf8')
  return { isPackaged: false, resourcesPath: '', moduleDirectory: join(root, 'out', 'main') }
}

afterEach(() => {
  while (temporaryDirectories.length)
    rmSync(temporaryDirectories.pop()!, { recursive: true, force: true })
})

describe('selected build support', () => {
  it('fails closed when no verified build matches the selected fingerprint', () => {
    const context = createResourceContext({ schemaVersion: 1, builds: [] })
    expect(resolveBuildSupport(installation, context)).toEqual({
      state: 'unknown',
      buildLabel: null,
      adapterVersion: null
    })
  })

  it('returns an explicit verified build entry only for an exact fingerprint match', () => {
    const context = createResourceContext({
      schemaVersion: 1,
      builds: [
        {
          executableSha256: executableSha256.toUpperCase(),
          buildLabel: 'Verified fixture build',
          adapterVersion: '0.1.0'
        }
      ]
    })
    expect(resolveBuildSupport(installation, context)).toEqual({
      state: 'supported',
      buildLabel: 'Verified fixture build',
      adapterVersion: '0.1.0'
    })
  })

  it('rejects malformed registries and invalid installations', () => {
    const malformedContext = createResourceContext({ schemaVersion: 1, builds: [{}] })
    expect(resolveBuildSupport(installation, malformedContext).state).toBe('registry_unavailable')
    expect(
      resolveBuildSupport(
        { ...installation, state: 'invalid', executableSha256: null },
        malformedContext
      ).state
    ).toBe('installation_invalid')
    const duplicateContext = createResourceContext({
      schemaVersion: 1,
      builds: [
        { executableSha256, buildLabel: 'First', adapterVersion: '0.1.0' },
        { executableSha256, buildLabel: 'Second', adapterVersion: '0.1.1' }
      ]
    })
    expect(resolveBuildSupport(installation, duplicateContext).state).toBe('registry_unavailable')
    const blankMetadataContext = createResourceContext({
      schemaVersion: 1,
      builds: [{ executableSha256, buildLabel: ' ', adapterVersion: ' ' }]
    })
    expect(resolveBuildSupport(installation, blankMetadataContext).state).toBe(
      'registry_unavailable'
    )
  })
})
