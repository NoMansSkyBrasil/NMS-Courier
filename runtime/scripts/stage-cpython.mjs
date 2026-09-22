import { createHash } from 'node:crypto'
import { createWriteStream, existsSync, promises as fs } from 'node:fs'
import { basename, dirname, resolve } from 'node:path'
import { pipeline } from 'node:stream/promises'
import { execFileSync } from 'node:child_process'

const repositoryRoot = resolve(import.meta.dirname, '..', '..')
const runtimeRoot = resolve(repositoryRoot, 'runtime')
const stagingRoot = resolve(runtimeRoot, 'staging', 'cpython')
const archiveRoot = resolve(runtimeRoot, 'vendor')
const manifestPath = resolve(runtimeRoot, 'runtime-manifest.template.json')
const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'))
const archivePath = resolve(archiveRoot, basename(new URL(manifest.python.sourceUrl).pathname))

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

async function download(url, destination) {
  const response = await fetch(url)
  if (!response.ok || !response.body) {
    throw new Error(`Unable to download the private CPython archive: ${response.status} ${response.statusText}`)
  }

  await fs.mkdir(dirname(destination), { recursive: true })
  await pipeline(response.body, createWriteStream(destination))
}

async function main() {
  if (!existsSync(archivePath)) {
    await download(manifest.python.sourceUrl, archivePath)
  }

  const digest = await sha256(archivePath)
  if (digest !== manifest.python.sha256) {
    throw new Error(`CPython archive checksum mismatch. Expected ${manifest.python.sha256}, received ${digest}.`)
  }

  await fs.rm(stagingRoot, { recursive: true, force: true })
  await fs.mkdir(stagingRoot, { recursive: true })
  execFileSync('powershell.exe', [
    '-NoProfile',
    '-NonInteractive',
    '-Command',
    `Expand-Archive -LiteralPath '${archivePath}' -DestinationPath '${stagingRoot}' -Force`
  ], { stdio: 'inherit' })

  const interpreter = resolve(stagingRoot, 'python.exe')
  execFileSync(interpreter, ['-I', '-S', '-c', 'import sys; print(sys.version)'], {
    stdio: 'inherit',
    env: {
      SystemRoot: process.env.SystemRoot ?? 'C:\\Windows',
      WINDIR: process.env.WINDIR ?? 'C:\\Windows'
    }
  })

  console.log(`Private CPython staged at ${stagingRoot}`)
}

await main()
