import { createHash } from 'node:crypto'
import {
  createReadStream,
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync
} from 'node:fs'
import { basename, join, resolve } from 'node:path'

export type InstallationStatus = {
  state: 'not_selected' | 'available' | 'invalid'
  displayName: string | null
  executableSha256: string | null
  executableSize: number | null
  reason: string | null
}

type StoredInstallation = {
  rootPath: string
  executableSha256: string
  executableSize: number
}

export async function inspectInstallation(
  rootPath: string
): Promise<InstallationStatus & { rootPath?: string }> {
  const normalizedRoot = resolve(rootPath)
  const executablePath = join(normalizedRoot, 'NMS.exe')
  const dataPath = join(normalizedRoot, 'GAMEDATA', 'PCBANKS')

  if (!existsSync(executablePath) || !existsSync(dataPath)) {
    return {
      state: 'invalid',
      displayName: basename(normalizedRoot) || null,
      executableSha256: null,
      executableSize: null,
      reason: 'INSTALLATION_LAYOUT_INVALID'
    }
  }

  try {
    const executable = statSync(executablePath)
    if (!executable.isFile()) throw new Error('NMS executable is not a file.')
    return {
      state: 'available',
      displayName: basename(normalizedRoot),
      executableSha256: await hashFile(executablePath),
      executableSize: executable.size,
      reason: null,
      rootPath: normalizedRoot
    }
  } catch {
    return {
      state: 'invalid',
      displayName: basename(normalizedRoot) || null,
      executableSha256: null,
      executableSize: null,
      reason: 'INSTALLATION_INSPECTION_FAILED'
    }
  }
}

async function hashFile(filePath: string): Promise<string> {
  return await new Promise((resolveHash, reject) => {
    const hash = createHash('sha256')
    const stream = createReadStream(filePath)
    stream.on('data', (chunk: string | Buffer) => hash.update(chunk))
    stream.on('end', () => resolveHash(hash.digest('hex')))
    stream.on('error', reject)
  })
}

export class InstallationService {
  constructor(private readonly userDataPath: string) {}

  getStatus(): InstallationStatus {
    const stored = this.readStored()
    if (!stored) {
      return {
        state: 'not_selected',
        displayName: null,
        executableSha256: null,
        executableSize: null,
        reason: null
      }
    }
    const executablePath = join(stored.rootPath, 'NMS.exe')
    const dataPath = join(stored.rootPath, 'GAMEDATA', 'PCBANKS')
    if (!existsSync(executablePath) || !existsSync(dataPath)) {
      return {
        state: 'invalid',
        displayName: basename(stored.rootPath),
        executableSha256: null,
        executableSize: null,
        reason: 'INSTALLATION_LAYOUT_INVALID'
      }
    }
    return {
      state: 'available',
      displayName: basename(stored.rootPath),
      executableSha256: stored.executableSha256,
      executableSize: stored.executableSize,
      reason: null
    }
  }

  async select(rootPath: string): Promise<InstallationStatus> {
    const inspected = await inspectInstallation(rootPath)
    if (
      inspected.state !== 'available' ||
      !inspected.rootPath ||
      !inspected.executableSha256 ||
      !inspected.executableSize
    ) {
      return inspected
    }
    mkdirSync(this.userDataPath, { recursive: true })
    writeFileSync(
      join(this.userDataPath, 'installation.json'),
      JSON.stringify(
        {
          rootPath: inspected.rootPath,
          executableSha256: inspected.executableSha256,
          executableSize: inspected.executableSize
        } satisfies StoredInstallation,
        null,
        2
      ) + '\n',
      'utf8'
    )
    return this.getStatus()
  }

  getSelectedRootPath(): string | null {
    return this.readStored()?.rootPath ?? null
  }

  private readStored(): StoredInstallation | null {
    try {
      const parsed: unknown = JSON.parse(
        readFileSync(join(this.userDataPath, 'installation.json'), 'utf8')
      )
      if (!parsed || typeof parsed !== 'object') return null
      const value = parsed as Record<string, unknown>
      if (
        typeof value.rootPath !== 'string' ||
        typeof value.executableSha256 !== 'string' ||
        !/^[a-f0-9]{64}$/i.test(value.executableSha256) ||
        typeof value.executableSize !== 'number' ||
        !Number.isSafeInteger(value.executableSize) ||
        value.executableSize < 1
      )
        return null
      return value as StoredInstallation
    } catch {
      return null
    }
  }
}
