import { createHash } from 'node:crypto'
import { existsSync, promises as fs } from 'node:fs'
import { resolve } from 'node:path'
import { execFileSync } from 'node:child_process'

const repositoryRoot = resolve(import.meta.dirname, '..', '..')
const runtimeRoot = resolve(repositoryRoot, 'runtime')
const stagingRoot = resolve(runtimeRoot, 'staging', 'cpython')
const wheelRoot = resolve(runtimeRoot, 'vendor', 'wheels')
const requirementsPath = resolve(runtimeRoot, 'requirements.runtime.txt')
const runtimeSource = resolve(runtimeRoot, 'src', 'nms_courier_runtime')
const compatibilitySource = resolve(runtimeRoot, 'compat', 'pymhf-partial-struct.py')
const buildToolLockPath = resolve(runtimeRoot, 'build-tool-lock.json')
const sitePackages = resolve(stagingRoot, 'Lib', 'site-packages')
const pymhfInitPath = resolve(sitePackages, 'pymhf', '__init__.py')
const pymhfInjectedPath = resolve(sitePackages, 'pymhf', 'injected.py')
const pymhfMainPath = resolve(sitePackages, 'pymhf', 'main.py')
const pymhfMetadataPath = resolve(sitePackages, 'pymhf-0.2.4.dist-info', 'METADATA')
const nmspyMetadataPath = resolve(sitePackages, 'nmspy-147803.1.dist-info', 'METADATA')
const pymhfStructsPath = resolve(sitePackages, 'pymhf', 'core', 'structs.py')
const pymhfCtypesPath = resolve(sitePackages, 'pymhf', 'extensions', 'ctypes.py')
const pymhfCompatPath = resolve(sitePackages, 'pymhf', 'utils', 'partial_struct.py')
const expectedPymhfSourceHash = '6e0f58ebdc98acf91685b7176d927e9865d0b62a78b2fef3d5d49b7520118a50'
const expectedPymhfInjectedSourceHash = '3bdcdd7e33c33433963f3d4413a059f57c74b17a52ef80d732f2899e0508aa2c'
const expectedPymhfMainSourceHash = 'c4d593f437a692a403915e264ae4c47b1df7bc80bebc0f38de3141a8f690f61a'
const upstreamPromptCondition = 'if not SPHINX_AUTODOC_RUNNING and os.environ.get("PYTEST_VERSION") is None:'
const patchedPromptCondition = 'if not SPHINX_AUTODOC_RUNNING and os.environ.get("PYTEST_VERSION") is None and os.environ.get("PYMHF_INTERACTIVE_CONFIGURATION") == "1":'
const upstreamExecutionServerBlock = [
  '    # Each client connection will create a new protocol instance',
  '    coro = loop.create_server(ExecutingProtocol, "127.0.0.1", 6770)',
  '    server = loop.run_until_complete(coro)'
].join('\n')
const patchedExecutionServerBlock = [
  '    execution_server_enabled = _internal.CONFIG.get("execution_server", {}).get("enabled", False)',
  '    server = None',
  '    if execution_server_enabled:',
  '        # Each client connection will create a new protocol instance.',
  '        coro = loop.create_server(ExecutingProtocol, "127.0.0.1", 6770)',
  '        server = loop.run_until_complete(coro)'
].join('\n')
const upstreamServingLog = '    logging.info(f"Serving on executor {server.sockets[0].getsockname()}")'
const patchedServingLog = '    if server is not None:\n        logging.info(f"Serving on executor {server.sockets[0].getsockname()}")'
const upstreamServerClose = '    # Close the server.\n    server.close()\n    loop.run_until_complete(server.wait_closed())'
const patchedServerClose = '    # Close the optional execution server.\n    if server is not None:\n        server.close()\n        loop.run_until_complete(server.wait_closed())'
const upstreamInteractiveConsoleSetting = '    interactive_console = config.get("interactive_console", True)'
const patchedInteractiveConsoleSetting = '    interactive_console = config.get("interactive_console", True)\n    execution_server_enabled = config.get("execution_server", {}).get("enabled", False)'
const upstreamKillFunction = '    def kill_injected_code(loop: asyncio.AbstractEventLoop):\n        # End one last "escape sequence" message:'
const patchedKillFunction = '    def kill_injected_code(loop: asyncio.AbstractEventLoop):\n        if not execution_server_enabled:\n            return\n        # End one last "escape sequence" message:'
const upstreamCloseCallback = [
  '        def close_callback(x):',
  '            print("pyMHF exiting...")',
  '            for _pid in {pm_binary.process_id, log_pid}:',
  '                if _pid:',
  '                    try:',
  '                        os.kill(_pid, SIGTERM)',
  '                    except Exception:',
  '                        # If we can\'t kill it, it\'s probably already dead. Just continue.',
  '                        pass',
  '            END_EVENT.set()',
  '            # Finally, send a SIGTERM to ourselves...',
  '            if REMOVE_SELF:',
  '                os.kill(os.getpid(), SIGTERM)'
].join('\n')
const patchedCloseCallback = [
  '        def close_callback(x):',
  '            print("pyMHF exiting...")',
  '            try:',
  '                x.result()',
  '            except BaseException as error:',
  '                print(f"pyMHF injected runtime failed: {type(error).__name__}: {error}")',
  '            else:',
  '                print("pyMHF injected runtime exited without an exception.")',
  '            target_process_ids = {pm_binary.process_id, log_pid} if start_exe else {log_pid}',
  '            for _pid in target_process_ids:',
  '                if _pid:',
  '                    try:',
  '                        os.kill(_pid, SIGTERM)',
  '                    except Exception:',
  '                        # If we can\'t kill it, it\'s probably already dead. Just continue.',
  '                        pass',
  '            END_EVENT.set()',
  '            # Finally, send a SIGTERM to ourselves only when we started the game.',
  '            if REMOVE_SELF and start_exe:',
  '                os.kill(os.getpid(), SIGTERM)'
].join('\n')

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

async function findPipWheel() {
  const buildTools = JSON.parse(await fs.readFile(buildToolLockPath, 'utf8'))
  const pip = buildTools.pip
  if (!pip?.wheel || !pip?.sha256) {
    throw new Error('The build-tool lock does not define a verified pip wheel.')
  }

  const pipWheel = resolve(wheelRoot, pip.wheel)
  if (!existsSync(pipWheel)) {
    throw new Error(`The private wheel cache does not contain ${pip.wheel} for build-time staging.`)
  }

  const digest = await sha256(pipWheel)
  if (digest !== pip.sha256) {
    throw new Error(`The pip wheel checksum mismatch. Expected ${pip.sha256}, received ${digest}.`)
  }

  return pipWheel
}

async function configurePrivatePath() {
  const files = await fs.readdir(stagingRoot)
  const pthFile = files.find((file) => /^python\d+\._pth$/i.test(file))
  if (!pthFile) {
    throw new Error('The embeddable CPython path-control file was not found.')
  }

  const content = ['python311.zip', '.', 'Lib/site-packages', 'import site', ''].join('\r\n')
  await fs.writeFile(resolve(stagingRoot, pthFile), content, 'utf8')
}

async function applyPymhfNoninteractiveStartupPatch() {
  const content = await fs.readFile(pymhfInitPath, 'utf8')
  const digest = await sha256(pymhfInitPath)
  if (digest !== expectedPymhfSourceHash) {
    throw new Error(`pyMHF startup patch rejected an unexpected source hash: ${digest}.`)
  }
  if (!content.includes(upstreamPromptCondition)) {
    throw new Error('pyMHF startup patch rejected an unexpected prompt condition.')
  }

  await fs.writeFile(pymhfInitPath, content.replace(upstreamPromptCondition, patchedPromptCondition), 'utf8')
}

async function applyPymhfExecutionServerPatch() {
  const injected = (await fs.readFile(pymhfInjectedPath, 'utf8')).replaceAll('\r\n', '\n')
  const main = (await fs.readFile(pymhfMainPath, 'utf8')).replaceAll('\r\n', '\n')
  if ((await sha256(pymhfInjectedPath)) !== expectedPymhfInjectedSourceHash) {
    throw new Error('pyMHF execution-server patch rejected an unexpected injected.py source hash.')
  }
  if ((await sha256(pymhfMainPath)) !== expectedPymhfMainSourceHash) {
    throw new Error('pyMHF execution-server patch rejected an unexpected main.py source hash.')
  }
  if (![upstreamExecutionServerBlock, upstreamServingLog, upstreamServerClose].every((value) => injected.includes(value))) {
    throw new Error('pyMHF execution-server patch rejected an unexpected injected.py structure.')
  }
  if (![upstreamInteractiveConsoleSetting, upstreamKillFunction, upstreamCloseCallback].every((value) => main.includes(value))) {
    throw new Error('pyMHF execution-server patch rejected an unexpected main.py structure.')
  }

  await fs.writeFile(
    pymhfInjectedPath,
    injected
      .replace(upstreamExecutionServerBlock, patchedExecutionServerBlock)
      .replace(upstreamServingLog, patchedServingLog)
      .replace(upstreamServerClose, patchedServerClose),
    'utf8'
  )
  await fs.writeFile(
    pymhfMainPath,
    main
      .replace(upstreamInteractiveConsoleSetting, patchedInteractiveConsoleSetting)
      .replace(upstreamKillFunction, patchedKillFunction)
      .replace(upstreamCloseCallback, patchedCloseCallback),
    'utf8'
  )
  const patchedMain = await fs.readFile(pymhfMainPath, 'utf8')
  if (!patchedMain.includes('target_process_ids = {pm_binary.process_id, log_pid} if start_exe else {log_pid}') ||
      !patchedMain.includes('if REMOVE_SELF and start_exe:') ||
      !patchedMain.includes('pyMHF injected runtime failed:') ||
      !patchedMain.includes('pyMHF injected runtime exited without an exception.')) {
    throw new Error('pyMHF attached-process safety patch failed post-patch verification.')
  }
}

async function addNmspyPymhfCompatibilityModule() {
  const [pymhfMetadata, nmspyMetadata, structs, ctypes] = await Promise.all([
    fs.readFile(pymhfMetadataPath, 'utf8'),
    fs.readFile(nmspyMetadataPath, 'utf8'),
    fs.readFile(pymhfStructsPath, 'utf8'),
    fs.readFile(pymhfCtypesPath, 'utf8')
  ])
  if (!/^Name: pyMHF\r?\nVersion: 0\.2\.4$/m.test(pymhfMetadata)) {
    throw new Error('NMSpy compatibility patch requires the reviewed pyMHF 0.2.4 package.')
  }
  if (!/^Name: NMSpy\r?\nVersion: 147803\.1$/m.test(nmspyMetadata)) {
    throw new Error('NMSpy compatibility patch requires the reviewed NMSpy 147803.1 package.')
  }
  if (!structs.includes('class Field:') || !structs.includes('def partial_struct(')) {
    throw new Error('NMSpy compatibility patch could not verify pyMHF struct exports.')
  }
  if (!ctypes.includes('class c_enum32(')) {
    throw new Error('NMSpy compatibility patch could not verify pyMHF enum exports.')
  }
  if (existsSync(pymhfCompatPath)) {
    throw new Error('NMSpy compatibility module already exists in the pinned pyMHF package.')
  }
  await fs.mkdir(resolve(sitePackages, 'pymhf', 'utils'), { recursive: true })
  await fs.copyFile(compatibilitySource, pymhfCompatPath)
}

async function main() {
  const interpreter = resolve(stagingRoot, 'python.exe')
  if (!existsSync(interpreter)) {
    throw new Error('Private CPython is not staged. Run pnpm stage:runtime first.')
  }

  await configurePrivatePath()
  await fs.rm(sitePackages, { recursive: true, force: true })
  await fs.mkdir(sitePackages, { recursive: true })
  const pipWheel = await findPipWheel()

  execFileSync('powershell.exe', [
    '-NoProfile',
    '-NonInteractive',
    '-Command',
    `Expand-Archive -LiteralPath '${pipWheel}' -DestinationPath '${sitePackages}' -Force`
  ], { stdio: 'inherit' })

  execFileSync(interpreter, [
    '-I',
    '-m',
    'pip',
    'install',
    '--no-index',
    '--find-links',
    wheelRoot,
    '--only-binary=:all:',
    '--no-deps',
    '--target',
    sitePackages,
    '--requirement',
    requirementsPath
  ], { stdio: 'inherit' })

  await fs.rm(resolve(sitePackages, 'pip'), { recursive: true, force: true })
  const installed = await fs.readdir(sitePackages)
  await Promise.all(
    installed
      .filter((entry) => /^pip-[\d.]+\.dist-info$/i.test(entry))
      .map((entry) => fs.rm(resolve(sitePackages, entry), { recursive: true, force: true }))
  )
  await applyPymhfNoninteractiveStartupPatch()
  await applyPymhfExecutionServerPatch()
  await addNmspyPymhfCompatibilityModule()
  await fs.cp(runtimeSource, resolve(sitePackages, 'nms_courier_runtime'), { recursive: true })

  execFileSync(interpreter, [
    '-I',
    '-c',
    'import cyminhook, nmspy, nmspy._internal_mods.singletons, nmspy.data.types, nms_courier_runtime.authentication, nms_courier_runtime.framing, pymem, pymhf, pyrun_injected, win32api; from pymhf.utils.partial_struct import Field, c_enum32, partial_struct; print("Private runtime imports passed")'
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
