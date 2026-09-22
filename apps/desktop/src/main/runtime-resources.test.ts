import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { inspectRuntimeBundle, resolveRuntimeResourceDirectory } from './runtime-resources'

const temporaryDirectories: string[] = []

function createTemporaryDirectory(): string {
  const directory = mkdtempSync(join(tmpdir(), 'nms-courier-runtime-'))
  temporaryDirectories.push(directory)
  return directory
}

function createValidRuntime(directory: string): void {
  mkdirSync(join(directory, 'python'), { recursive: true })
  mkdirSync(join(directory, 'config'), { recursive: true })
  writeFileSync(join(directory, 'python', 'python.exe'), '')
  writeFileSync(join(directory, 'config', 'runtime-defaults.toml'), '[pymhf]\n')
  writeFileSync(
    join(directory, 'runtime-manifest.json'),
    JSON.stringify({
      schemaVersion: 1,
      python: { version: '3.11.9' },
      dependencies: [{ distribution: 'nmspy' }]
    })
  )
}

afterEach(() => {
  while (temporaryDirectories.length > 0) {
    rmSync(temporaryDirectories.pop()!, { recursive: true, force: true })
  }
})

describe('private runtime resources', () => {
  it('resolves the unpacked packaged resource directory', () => {
    expect(
      resolveRuntimeResourceDirectory({
        isPackaged: true,
        resourcesPath: 'C:/NMS Courier/resources',
        moduleDirectory: 'unused'
      })
    ).toBe(join('C:/NMS Courier/resources', 'app.asar.unpacked', 'resources', 'runtime'))
  })

  it('reports a valid private bundle without exposing its directory', () => {
    const root = createTemporaryDirectory()
    const runtimeDirectory = join(root, 'app.asar.unpacked', 'resources', 'runtime')
    createValidRuntime(runtimeDirectory)

    expect(
      inspectRuntimeBundle({ isPackaged: true, resourcesPath: root, moduleDirectory: 'unused' })
    ).toEqual({ state: 'bundled', runtimeVersion: '3.11.9' })
  })

  it('rejects an incomplete bundle', () => {
    const root = createTemporaryDirectory()

    expect(
      inspectRuntimeBundle({ isPackaged: true, resourcesPath: root, moduleDirectory: 'unused' })
    ).toEqual({ state: 'unavailable', runtimeVersion: null })
  })
})
