import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { InstallationStatus } from './installation-service'
import { resolveRuntimeResourceDirectory, type RuntimeResourceContext } from './runtime-resources'

export type BuildSupportStatus = {
  state:
    | 'installation_not_selected'
    | 'installation_invalid'
    | 'unknown'
    | 'supported'
    | 'registry_unavailable'
  buildLabel: string | null
  adapterVersion: string | null
}

type SupportedBuild = {
  executableSha256: string
  buildLabel: string
  adapterVersion: string
}

type BuildRegistry = {
  schemaVersion?: unknown
  builds?: unknown
}

function readRegistry(context: RuntimeResourceContext): SupportedBuild[] | null {
  const registryPath = join(
    resolveRuntimeResourceDirectory(context),
    'config',
    'supported-builds.json'
  )
  if (!existsSync(registryPath)) return null

  try {
    const registry = JSON.parse(readFileSync(registryPath, 'utf8')) as BuildRegistry
    if (registry.schemaVersion !== 1 || !Array.isArray(registry.builds)) return null

    const builds: SupportedBuild[] = []
    const fingerprints = new Set<string>()
    for (const candidate of registry.builds) {
      if (!candidate || typeof candidate !== 'object') return null
      const build = candidate as Record<string, unknown>
      if (
        typeof build.executableSha256 !== 'string' ||
        !/^[a-f0-9]{64}$/i.test(build.executableSha256) ||
        typeof build.buildLabel !== 'string' ||
        build.buildLabel.length === 0 ||
        build.buildLabel.length > 160 ||
        typeof build.adapterVersion !== 'string' ||
        build.adapterVersion.length === 0 ||
        build.adapterVersion.length > 80
      ) {
        return null
      }
      const executableSha256 = build.executableSha256.toLowerCase()
      if (fingerprints.has(executableSha256)) return null
      fingerprints.add(executableSha256)
      builds.push({
        executableSha256,
        buildLabel: build.buildLabel,
        adapterVersion: build.adapterVersion
      })
    }
    return builds
  } catch {
    return null
  }
}

export function resolveBuildSupport(
  installation: InstallationStatus,
  context: RuntimeResourceContext
): BuildSupportStatus {
  if (installation.state === 'not_selected') {
    return { state: 'installation_not_selected', buildLabel: null, adapterVersion: null }
  }
  if (installation.state !== 'available' || !installation.executableSha256) {
    return { state: 'installation_invalid', buildLabel: null, adapterVersion: null }
  }

  const builds = readRegistry(context)
  if (!builds) return { state: 'registry_unavailable', buildLabel: null, adapterVersion: null }

  const matched = builds.find(
    (build) => build.executableSha256 === installation.executableSha256?.toLowerCase()
  )
  if (!matched) return { state: 'unknown', buildLabel: null, adapterVersion: null }

  return {
    state: 'supported',
    buildLabel: matched.buildLabel,
    adapterVersion: matched.adapterVersion
  }
}
