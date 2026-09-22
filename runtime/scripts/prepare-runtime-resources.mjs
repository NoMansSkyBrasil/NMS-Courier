import { createHash } from 'node:crypto'
import { existsSync, promises as fs } from 'node:fs'
import { dirname, resolve } from 'node:path'

const repositoryRoot = resolve(import.meta.dirname, '..', '..')
const stagingRoot = resolve(repositoryRoot, 'runtime', 'staging')
const manifestPath = resolve(stagingRoot, 'runtime-manifest.json')
const defaultsPath = resolve(repositoryRoot, 'runtime', 'config', 'runtime-defaults.toml')
const buildRegistryPath = resolve(repositoryRoot, 'runtime', 'config', 'supported-builds.json')
const resourcesRoot = resolve(repositoryRoot, 'apps', 'desktop', 'resources', 'runtime')

async function sha256(path) {
  const hash = createHash('sha256')
  const file = await fs.open(path, 'r')

  try {
    for await (const chunk of file.createReadStream()) {
      hash.update(chunk)
    }
  } finally {
    await file.close()
  }

  return hash.digest('hex')
}

async function validateManifest(manifest) {
  for (const file of manifest.files) {
    const source = resolve(stagingRoot, file.path)
    if (!existsSync(source)) {
      throw new Error(`Runtime manifest references a missing file: ${file.path}`)
    }
    if ((await sha256(source)) !== file.sha256) {
      throw new Error(`Runtime manifest checksum mismatch: ${file.path}`)
    }
  }
}

function hasValidBuildRegistry(registry) {
  if (!registry || registry.schemaVersion !== 1 || !Array.isArray(registry.builds)) return false
  const fingerprints = new Set()
  return registry.builds.every((build) => {
    if (
      !build ||
      typeof build !== 'object' ||
      typeof build.executableSha256 !== 'string' ||
      !/^[a-f0-9]{64}$/i.test(build.executableSha256) ||
      typeof build.buildLabel !== 'string' ||
      build.buildLabel.trim().length === 0 ||
      build.buildLabel.length > 160 ||
      typeof build.adapterVersion !== 'string' ||
      build.adapterVersion.trim().length === 0 ||
      build.adapterVersion.length > 80
    ) {
      return false
    }
    const fingerprint = build.executableSha256.toLowerCase()
    if (fingerprints.has(fingerprint)) return false
    fingerprints.add(fingerprint)
    return true
  })
}

async function main() {
  if (!existsSync(manifestPath) || !existsSync(defaultsPath) || !existsSync(buildRegistryPath)) {
    throw new Error('Generate the private runtime manifest before preparing Electron resources.')
  }

  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'))
  if (manifest.python?.version !== '3.11.9' || !Array.isArray(manifest.dependencies) || manifest.dependencies.length === 0) {
    throw new Error('The staged runtime manifest is incomplete or incompatible.')
  }
  const buildRegistry = JSON.parse(await fs.readFile(buildRegistryPath, 'utf8'))
  if (!hasValidBuildRegistry(buildRegistry)) {
    throw new Error('The verified-build registry is incomplete or incompatible.')
  }
  await validateManifest(manifest)

  await fs.rm(resourcesRoot, { recursive: true, force: true })
  await fs.mkdir(resourcesRoot, { recursive: true })
  await fs.cp(resolve(stagingRoot, 'cpython'), resolve(resourcesRoot, 'python'), { recursive: true })
  if (existsSync(resolve(stagingRoot, 'licenses'))) {
    await fs.cp(resolve(stagingRoot, 'licenses'), resolve(resourcesRoot, 'licenses'), { recursive: true })
  }
  await fs.copyFile(manifestPath, resolve(resourcesRoot, 'runtime-manifest.json'))
  await fs.mkdir(resolve(resourcesRoot, 'config'), { recursive: true })
  await fs.copyFile(defaultsPath, resolve(resourcesRoot, 'config', 'runtime-defaults.toml'))
  await fs.copyFile(buildRegistryPath, resolve(resourcesRoot, 'config', 'supported-builds.json'))

  const markerPath = resolve(resourcesRoot, 'runtime-manifest.json')
  if (!existsSync(markerPath)) {
    throw new Error('The runtime resource bundle was not created.')
  }
  console.log(`Prepared verified private runtime resources at ${resourcesRoot}`)
}

await main()
