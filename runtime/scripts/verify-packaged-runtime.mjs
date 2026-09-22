import { createHash } from 'node:crypto'
import { existsSync, promises as fs } from 'node:fs'
import { resolve } from 'node:path'
import { execFileSync } from 'node:child_process'

const repositoryRoot = resolve(import.meta.dirname, '..', '..')
const packageDirectory = process.env.NMS_COURIER_PACKAGE_DIRECTORY ?? resolve(repositoryRoot, 'apps', 'desktop', 'dist', 'win-unpacked')
const runtimeRoot = resolve(packageDirectory, 'resources', 'app.asar.unpacked', 'resources', 'runtime')

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

async function verifyManifest(manifest) {
  for (const file of manifest.files) {
    const packagedPath = file.path.replace(/^cpython\//, 'python/')
    const resource = resolve(runtimeRoot, packagedPath)
    if (!existsSync(resource)) {
      throw new Error(`Packaged runtime is missing ${packagedPath}.`)
    }
    if ((await sha256(resource)) !== file.sha256) {
      throw new Error(`Packaged runtime checksum mismatch: ${packagedPath}.`)
    }
  }
}

async function main() {
  const manifestPath = resolve(runtimeRoot, 'runtime-manifest.json')
  const interpreter = resolve(runtimeRoot, 'python', 'python.exe')
  const defaults = resolve(runtimeRoot, 'config', 'runtime-defaults.toml')
  const buildRegistry = resolve(runtimeRoot, 'config', 'supported-builds.json')
  if (!existsSync(manifestPath) || !existsSync(interpreter) || !existsSync(defaults) || !existsSync(buildRegistry)) {
    throw new Error('The packaged private runtime resource bundle is incomplete.')
  }

  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'))
  if (manifest.python?.version !== '3.11.9' || !Array.isArray(manifest.dependencies) || manifest.dependencies.length === 0) {
    throw new Error('The packaged runtime manifest is incompatible.')
  }
  const builds = JSON.parse(await fs.readFile(buildRegistry, 'utf8'))
  if (builds.schemaVersion !== 1 || !Array.isArray(builds.builds)) {
    throw new Error('The packaged verified-build registry is incompatible.')
  }
  await verifyManifest(manifest)

  execFileSync(interpreter, [
    '-I',
    '-B',
    '-c',
    'import importlib.util, nmspy, pymhf; assert importlib.util.find_spec("dearpygui") is None; assert importlib.util.find_spec("fastapi") is None; assert importlib.util.find_spec("uvicorn") is None; print("Packaged private runtime verification passed")'
  ], {
    stdio: 'inherit',
    env: {
      SystemRoot: process.env.SystemRoot ?? 'C:\\Windows',
      WINDIR: process.env.WINDIR ?? 'C:\\Windows',
      PYTHONDONTWRITEBYTECODE: '1',
      PYMHF_INTERACTIVE_CONFIGURATION: '0'
    }
  })
}

await main()
