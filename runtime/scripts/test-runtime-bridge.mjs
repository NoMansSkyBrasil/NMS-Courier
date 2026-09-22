import { existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'

const repositoryRoot = resolve(import.meta.dirname, '..', '..')
const candidates = [
  resolve(repositoryRoot, 'runtime', 'staging', 'cpython', 'python.exe'),
  resolve(repositoryRoot, 'apps', 'desktop', 'resources', 'runtime', 'python', 'python.exe'),
  resolve(
    repositoryRoot,
    'apps',
    'desktop',
    'dist',
    'win-unpacked',
    'resources',
    'app.asar.unpacked',
    'resources',
    'runtime',
    'python',
    'python.exe'
  )
]
const interpreter = candidates.find(existsSync)

if (!interpreter) {
  throw new Error('Stage the private CPython runtime before running bridge tests.')
}

for (const testName of ['test_bridge_protocol.py', 'test_named_pipe_loopback.py']) {
  execFileSync(
    interpreter,
    ['-I', '-B', resolve(repositoryRoot, 'runtime', 'tests', testName)],
    {
      stdio: 'inherit',
      env: {
        SystemRoot: process.env.SystemRoot ?? 'C:\\Windows',
        WINDIR: process.env.WINDIR ?? 'C:\\Windows',
        PATH: resolve(process.env.SystemRoot ?? 'C:\\Windows', 'System32'),
        PYTHONDONTWRITEBYTECODE: '1',
        PYMHF_INTERACTIVE_CONFIGURATION: '0'
      }
    }
  )
}
