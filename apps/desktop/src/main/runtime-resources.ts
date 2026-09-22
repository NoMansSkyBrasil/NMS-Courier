import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

export type RuntimeBundleStatus = {
  state: 'bundled' | 'unavailable'
  runtimeVersion: string | null
}

type RuntimeManifest = {
  schemaVersion?: unknown
  python?: {
    version?: unknown
  }
  dependencies?: unknown
}

type RuntimeResourceContext = {
  isPackaged: boolean
  resourcesPath: string
  moduleDirectory: string
}

export function resolveRuntimeResourceDirectory(context: RuntimeResourceContext): string {
  if (context.isPackaged) {
    return join(context.resourcesPath, 'app.asar.unpacked', 'resources', 'runtime')
  }

  return join(context.moduleDirectory, '..', '..', 'resources', 'runtime')
}

export function inspectRuntimeBundle(context: RuntimeResourceContext): RuntimeBundleStatus {
  const runtimeDirectory = resolveRuntimeResourceDirectory(context)
  const manifestPath = join(runtimeDirectory, 'runtime-manifest.json')
  const interpreterPath = join(runtimeDirectory, 'python', 'python.exe')
  const defaultsPath = join(runtimeDirectory, 'config', 'runtime-defaults.toml')

  if (!existsSync(manifestPath) || !existsSync(interpreterPath) || !existsSync(defaultsPath)) {
    return { state: 'unavailable', runtimeVersion: null }
  }

  try {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as RuntimeManifest
    const version = manifest.python?.version
    if (
      manifest.schemaVersion !== 1 ||
      version !== '3.11.9' ||
      !Array.isArray(manifest.dependencies) ||
      manifest.dependencies.length === 0
    ) {
      return { state: 'unavailable', runtimeVersion: null }
    }

    return { state: 'bundled', runtimeVersion: version }
  } catch {
    return { state: 'unavailable', runtimeVersion: null }
  }
}
