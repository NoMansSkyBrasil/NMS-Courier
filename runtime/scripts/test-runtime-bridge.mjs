import { existsSync, readFileSync } from 'node:fs'
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

const pymhfMain = readFileSync(
  resolve(repositoryRoot, 'runtime', 'staging', 'cpython', 'Lib', 'site-packages', 'pymhf', 'main.py'),
  'utf8'
)
for (const requiredSource of [
  'target_process_ids = {pm_binary.process_id, log_pid} if start_exe else {log_pid}',
  'if REMOVE_SELF and start_exe:',
  'pyMHF injected runtime failed:',
  'pyMHF injected runtime exited without an exception.'
]) {
  if (!pymhfMain.includes(requiredSource)) {
    throw new Error(`The staged pyMHF runtime is missing its attached-process safety patch: ${requiredSource}`)
  }
}

for (const testName of [
  'test_bridge_protocol.py',
  'test_target_validation.py',
  'test_process_discovery.py',
  'test_nmspy_compatibility.py',
  'test_courier_callback.py',
  'test_inventory_179666.py',
  'test_host_delivery_contract.py',
  'test_named_pipe_loopback.py'
]) {
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
