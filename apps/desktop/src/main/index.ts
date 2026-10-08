import { app, BrowserWindow, dialog, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { CatalogRepository, catalogDomains, type CatalogDomain } from './catalog-repository'
import { CatalogImporter } from './game-data/catalog-import'
import { InstallationService } from './installation-service'
import { GameStatusService } from './game-status-service'
import { resolveLocalItemDeliveryReadiness } from './delivery-readiness'
import { resolveBuildSupport } from './build-support'
import { inspectRuntimeBundle, type RuntimeResourceContext } from './runtime-resources'
import { RuntimeDiagnosticsService } from './runtime-diagnostics-service'
import { importPreviewModel } from './model-preview-import'
import { BasePalettePreviewAdapter } from './nms-adapters/base-palette-preview'
import { importAppearanceRecipe } from './nms-adapters/appearance-recipe'
import {
  isDeliveryFeatureId,
  researchBridgeBuild,
  researchBridgeGameSha256
} from './research-bridge/delivery-plan'
import { ResearchBridgeService } from './research-bridge/research-bridge-service'

let catalogRepository: CatalogRepository | null = null
let installationService: InstallationService | null = null
let catalogImporter: CatalogImporter | null = null
const gameStatusService = new GameStatusService()
let runtimeDiagnosticsService: RuntimeDiagnosticsService | null = null
const palettePreview = new BasePalettePreviewAdapter()
let researchBridgeService: ResearchBridgeService | null = null

// The research bridge exists only in a development checkout: it drives the signal scripts of the
// repository and is not a packaged capability.
function getResearchBridgeService(): ResearchBridgeService {
  researchBridgeService ??= new ResearchBridgeService({
    enabled: is.dev,
    signalDirectory: join(app.getAppPath(), '..', '..', 'runtime', 'native', 'asi', 'signal'),
    backupDirectory: join(app.getPath('userData'), 'save-backups'),
    saveDirectory: join(app.getPath('appData'), 'HelloGames', 'NMS')
  })
  return researchBridgeService
}

function getCatalogRepository(): CatalogRepository {
  catalogRepository ??= new CatalogRepository(app.getPath('userData'))
  return catalogRepository
}

function getCatalogImporter(): CatalogImporter {
  catalogImporter ??= new CatalogImporter(app.getPath('userData'))
  return catalogImporter
}

function getInstallationService(): InstallationService {
  installationService ??= new InstallationService(app.getPath('userData'))
  return installationService
}

function getRuntimeDiagnosticsService(): RuntimeDiagnosticsService {
  runtimeDiagnosticsService ??= new RuntimeDiagnosticsService(
    getRuntimeResourceContext(),
    app.getPath('userData'),
    gameStatusService
  )
  return runtimeDiagnosticsService
}

function parseCatalogSearchRequest(value: unknown): {
  query: string
  locale: string
  domain?: CatalogDomain
  limit: number
} {
  if (!value || typeof value !== 'object') throw new Error('Invalid catalog search request.')
  const request = value as Record<string, unknown>
  const limit = request.limit
  if (typeof request.query !== 'string' || request.query.length > 160)
    throw new Error('Invalid catalog query.')
  if (typeof request.locale !== 'string' || request.locale.length > 32)
    throw new Error('Invalid catalog locale.')
  if (typeof limit !== 'number' || !Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new Error('Invalid catalog limit.')
  }
  if (request.domain !== undefined && !catalogDomains.includes(request.domain as CatalogDomain)) {
    throw new Error('Invalid catalog domain.')
  }
  return {
    query: request.query,
    locale: request.locale,
    domain: request.domain as CatalogDomain | undefined,
    limit
  }
}

function getFoundationStatus(): {
  apiVersion: string
  runtime: 'bundled' | 'unavailable'
  runtimeVersion: string | null
} {
  const bundle = inspectRuntimeBundle({
    isPackaged: app.isPackaged,
    resourcesPath: process.resourcesPath,
    moduleDirectory: __dirname
  })

  return {
    apiVersion: '1',
    runtime: bundle.state,
    runtimeVersion: bundle.runtimeVersion
  }
}

function getRuntimeResourceContext(): RuntimeResourceContext {
  return {
    isPackaged: app.isPackaged,
    resourcesPath: process.resourcesPath,
    moduleDirectory: __dirname
  }
}

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 720,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.on('close', (event) => {
    if (!getRuntimeDiagnosticsService().hasActiveHost()) return
    event.preventDefault()
    dialog.showMessageBoxSync(mainWindow, {
      type: 'warning',
      title: 'Runtime diagnostics are active',
      message: 'Close No Man’s Sky before closing NMS Courier.',
      detail:
        'The diagnostic module cannot be unloaded safely from the running game. It has no delivery commands. Close the game first; this window will remain open until its runtime host exits.',
      buttons: ['OK'],
      noLink: true
    })
  })

  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))
  mainWindow.webContents.on('will-navigate', (event) => event.preventDefault())

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    void mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    void mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('io.github.nms-courier.desktop')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.handle('nms:get-foundation-status', () => getFoundationStatus())
  ipcMain.handle('nms:select-preview-model', async (event) => {
    const owner = BrowserWindow.fromWebContents(event.sender)
    if (!owner || event.senderFrame !== event.sender.mainFrame) return { state: 'canceled' }
    const result = await dialog.showOpenDialog(owner, {
      title: 'Select a local static GLB model',
      filters: [{ name: 'Binary glTF model', extensions: ['glb'] }],
      properties: ['openFile']
    })
    if (result.canceled || result.filePaths.length !== 1) return { state: 'canceled' }
    return importPreviewModel(result.filePaths[0])
  })
  ipcMain.handle('nms:select-appearance-recipe', async (event) => {
    const owner = BrowserWindow.fromWebContents(event.sender)
    if (!owner || event.senderFrame !== event.sender.mainFrame) return { state: 'canceled' }
    const result = await dialog.showOpenDialog(owner, {
      title: 'Select an experimental appearance recipe',
      filters: [{ name: 'Appearance recipe or search report', extensions: ['json'] }],
      properties: ['openFile']
    })
    if (result.canceled || result.filePaths.length !== 1) return { state: 'canceled' }
    return importAppearanceRecipe(result.filePaths[0])
  })
  ipcMain.handle('nms:select-preview-palettes', async (event) => {
    const owner = BrowserWindow.fromWebContents(event.sender)
    if (!owner || event.senderFrame !== event.sender.mainFrame) return { state: 'canceled' }
    const result = await dialog.showOpenDialog(owner, {
      title: 'Select the supported base palette MBIN',
      filters: [{ name: 'Base palette MBIN', extensions: ['mbin'] }],
      properties: ['openFile']
    })
    if (result.canceled || result.filePaths.length !== 1) return { state: 'canceled' }
    return palettePreview.importFile(result.filePaths[0])
  })
  ipcMain.handle('nms:preview-palette-seed', (event, seed: unknown) => {
    const owner = BrowserWindow.fromWebContents(event.sender)
    if (!owner || event.senderFrame !== event.sender.mainFrame)
      return { state: 'failed', reason: 'PALETTE_UNAVAILABLE' }
    return palettePreview.evaluate(seed)
  })
  ipcMain.handle('nms:get-installation-status', () => getInstallationService().getStatus())
  ipcMain.handle('nms:get-game-status', () =>
    gameStatusService.observe(getInstallationService().getSelectedRootPath())
  )
  ipcMain.handle('nms:get-build-support', () =>
    resolveBuildSupport(getInstallationService().getStatus(), getRuntimeResourceContext())
  )
  ipcMain.handle('nms:get-runtime-diagnostics-status', () =>
    getRuntimeDiagnosticsService().getStatus()
  )
  ipcMain.handle('nms:start-runtime-diagnostics', () =>
    getRuntimeDiagnosticsService().start(
      getInstallationService().getSelectedRootPath(),
      getInstallationService().getStatus()
    )
  )
  ipcMain.handle('nms:get-delivery-readiness', async () => {
    const installation = getInstallationService().getStatus()
    const game = await gameStatusService.observe(getInstallationService().getSelectedRootPath())
    const context = getRuntimeResourceContext()
    const build = resolveBuildSupport(installation, context)
    const runtime = inspectRuntimeBundle(context)
    return resolveLocalItemDeliveryReadiness(installation, build, game, runtime)
  })
  ipcMain.handle('nms:select-installation', async () => {
    const result = await dialog.showOpenDialog({
      title: 'Select No Man’s Sky installation',
      properties: ['openDirectory']
    })
    if (result.canceled || result.filePaths.length !== 1)
      return getInstallationService().getStatus()
    return await getInstallationService().select(result.filePaths[0])
  })
  ipcMain.handle('nms:get-research-bridge-status', async () => {
    const root = getInstallationService().getSelectedRootPath()
    return getResearchBridgeService().getStatus(root, await gameStatusService.observe(root))
  })
  ipcMain.handle('nms:deliver', async (_, feature: unknown, chosen: unknown) => {
    if (!isDeliveryFeatureId(feature)) throw new Error('Invalid delivery area.')
    if (
      chosen != null &&
      !(Array.isArray(chosen) && chosen.every((id) => typeof id === 'string'))
    ) {
      throw new Error('Invalid selection.')
    }
    const root = getInstallationService().getSelectedRootPath()
    return getResearchBridgeService().deliver(
      feature,
      root,
      await gameStatusService.observe(root),
      (chosen as string[] | null | undefined) ?? null
    )
  })
  // Entries of an area that can be sent one by one, named by the local catalogue when it can.
  ipcMain.handle('nms:get-delivery-options', async (_, feature: unknown, locale: unknown) => {
    if (!isDeliveryFeatureId(feature) || typeof locale !== 'string') {
      throw new Error('Invalid delivery area.')
    }
    const options = await getResearchBridgeService().getOptions(feature)
    const names = getCatalogRepository().names(locale)
    return options.map((option) => ({
      id: option.id,
      group: option.group,
      name: (option.domain && names.get(`${option.domain}:${option.id}`)) || ''
    }))
  })
  ipcMain.handle('nms:get-delivery-activity', () => getResearchBridgeService().getActivity())
  ipcMain.handle('nms:detect-installation', () => getInstallationService().detect())
  ipcMain.handle('nms:get-catalog-status', () => getCatalogRepository().getStatus())
  ipcMain.handle('nms:import-catalog', () => {
    const installation = getInstallationService().getStatus()
    return getCatalogImporter().run({
      rootPath: getInstallationService().getSelectedRootPath(),
      executableSha256: installation.executableSha256,
      productVersion:
        resolveBuildSupport(installation, getRuntimeResourceContext()).buildLabel ??
        (installation.executableSha256 === researchBridgeGameSha256 ? researchBridgeBuild : null)
    })
  })
  ipcMain.handle('nms:search-catalog', (_, request: unknown) =>
    getCatalogRepository().search(parseCatalogSearchRequest(request))
  )

  createWindow()

  // First start: look for the game by itself, after the window is up.
  if (getInstallationService().getStatus().state === 'not_selected') {
    void getInstallationService()
      .detect()
      .catch(() => undefined)
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
