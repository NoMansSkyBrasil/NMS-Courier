import { app, BrowserWindow, dialog, ipcMain } from 'electron'
import { isGlyphRequest } from './research-bridge/glyph-plan'
import { isLevelPage, isLevelRequest } from './research-bridge/level-plan'
import { glyphDigits, glyphIcon } from '../shared/portal-address'
import { isTeleportRequest } from './research-bridge/teleport-plan'
import { isInstallRequest } from '../shared/waiting-technology'
import { join } from 'path'
import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { CatalogRepository, catalogDomains, type CatalogDomain } from './catalog-repository'
import { CatalogImporter } from './game-data/catalog-import'
import { IconSource } from './game-data/icon-source'
import { CorvetteLayoutService } from './corvette/corvette-layout-service'
import { isEquipmentRequest } from './research-bridge/equipment-plan'
import { InstallationService } from './installation-service'
import { GameStatusService } from './game-status-service'
import { resolveLocalItemDeliveryReadiness } from './delivery-readiness'
import { resolveBuildSupport } from './build-support'
import { inspectRuntimeBundle, type RuntimeResourceContext } from './runtime-resources'
import { RuntimeDiagnosticsService } from './runtime-diagnostics-service'
import { importPreviewModel } from './model-preview-import'
import { GameModelFiles } from './model-workshop/game-model-files'
import { ModelWorkshopService } from './model-workshop/model-workshop-service'
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
const iconSource = new IconSource()
let corvetteLayoutService: CorvetteLayoutService | null = null

function getCorvetteLayoutService(): CorvetteLayoutService {
  corvetteLayoutService ??= new CorvetteLayoutService(app.getPath('userData'))
  return corvetteLayoutService
}
const diagnosticsDirectory = join(process.env.LOCALAPPDATA ?? '', 'NMSCourier', 'diagnostics')
const gameStatusService = new GameStatusService(diagnosticsDirectory)
let runtimeDiagnosticsService: RuntimeDiagnosticsService | null = null
const palettePreview = new BasePalettePreviewAdapter()
let modelWorkshopService: ModelWorkshopService | null = null

function getModelWorkshopService(): ModelWorkshopService {
  const root = (): string | null => getInstallationService().getSelectedRootPath()
  modelWorkshopService ??= new ModelWorkshopService(new GameModelFiles(root), root)
  return modelWorkshopService
}
let researchBridgeService: ResearchBridgeService | null = null

// The research bridge exists only in a development checkout so far: the classification tables it
// reads are those of the repository and the packaged application does not carry the bridge yet.
function getResearchBridgeService(): ResearchBridgeService {
  researchBridgeService ??= new ResearchBridgeService({
    enabled: is.dev,
    researchDirectory: join(app.getAppPath(), '..', '..', 'runtime', 'research'),
    diagnosticsDirectory,
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
  if (typeof limit !== 'number' || !Number.isInteger(limit) || limit < 1 || limit > 20000) {
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
  // The model workshop: what a seed looks like, which parts can be drawn, and a seed for chosen
  // parts. All three read the selected installation's archives; nothing is written.
  ipcMain.handle('nms:workshop-model', (_, request: unknown) => {
    const value = (request ?? {}) as Record<string, unknown>
    return getModelWorkshopService().build(
      value.category,
      value.kind,
      value.seed,
      value.colorSeed,
      value.legacyColours
    )
  })
  // One texture of the model built last, as the game stores it; the renderer draws it.
  ipcMain.handle('nms:workshop-texture', (_, path: unknown) =>
    getModelWorkshopService().texture(path)
  )
  ipcMain.handle('nms:workshop-choices', (_, request: unknown) => {
    const value = (request ?? {}) as Record<string, unknown>
    return getModelWorkshopService().choices(value.category, value.kind)
  })
  ipcMain.handle('nms:workshop-find-seed', (_, request: unknown) => {
    const value = (request ?? {}) as Record<string, unknown>
    return getModelWorkshopService().findSeed(
      value.category,
      value.kind,
      value.parts,
      value.look,
      value.legacyColours
    )
  })
  ipcMain.handle('nms:get-installation-status', () => getInstallationService().getStatus())
  ipcMain.handle('nms:get-game-status', () =>
    gameStatusService.observe(getInstallationService().getSelectedRootPath())
  )
  ipcMain.handle('nms:get-build-support', () => {
    const installation = getInstallationService().getStatus()
    const support = resolveBuildSupport(installation, getRuntimeResourceContext())
    // The research bridge supports its own build, whatever the older runtime registry says.
    return installation.executableSha256 === researchBridgeGameSha256
      ? { state: 'supported' as const, buildLabel: researchBridgeBuild, adapterVersion: null }
      : support
  })
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
    const status = await getResearchBridgeService().getStatus(
      root,
      await gameStatusService.observe(root)
    )
    return { ...status, appVersion: app.getVersion() }
  })
  ipcMain.handle('nms:deliver', async (_, feature: unknown, chosen: unknown, notify: unknown) => {
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
      (chosen as string[] | null | undefined) ?? null,
      notify !== false
    )
  })
  ipcMain.handle('nms:deliver-equipment', async (_, request: unknown) => {
    if (!isEquipmentRequest(request)) throw new Error('Invalid request.')
    const root = getInstallationService().getSelectedRootPath()
    const { area, action, slots, supercharge, extendedTechnology, itemClass, shipIndex } = request
    const { model, scene, modelSeed, homeSeed, legacyColours } = request
    return getResearchBridgeService().deliverEquipment(
      {
        area,
        action,
        slots,
        supercharge,
        extendedTechnology,
        itemClass,
        shipIndex,
        model,
        scene,
        modelSeed,
        homeSeed,
        legacyColours: legacyColours === true
      },
      root,
      await gameStatusService.observe(root)
    )
  })
  // The 256 galaxies by number, named in the interface language (runtime/research/galaxy-names.md).
  ipcMain.handle('nms:get-galaxy-names', (_, locale: unknown) =>
    typeof locale === 'string' ? getResearchBridgeService().getGalaxyNames(locale) : []
  )
  // Every alien word with its text in the interface language and the group that teaches it for
  // each race (runtime/research/word-names.md).
  ipcMain.handle('nms:get-word-rows', (_, locale: unknown) =>
    typeof locale === 'string' ? getResearchBridgeService().getWordRows(locale) : []
  )
  ipcMain.handle('nms:get-planet-survey', () => getResearchBridgeService().getPlanetSurvey())
  ipcMain.handle('nms:get-missions', (_, locale: unknown) =>
    typeof locale === 'string' ? getResearchBridgeService().getMissions(locale) : []
  )
  // Standings and journey milestones: the stats of a page, and a request to raise them by levels.
  ipcMain.handle('nms:get-level-stats', (_, page: unknown, locale: unknown) =>
    isLevelPage(page) && typeof locale === 'string'
      ? getResearchBridgeService().getLevelStats(page, locale)
      : []
  )
  ipcMain.handle('nms:raise-levels', async (_, request: unknown) => {
    if (!isLevelRequest(request)) throw new Error('Invalid request.')
    const root = getInstallationService().getSelectedRootPath()
    return getResearchBridgeService().raiseLevels(
      {
        page: request.page,
        stats: request.stats,
        levels: request.levels,
        announce: request.announce,
        notify: request.notify
      },
      root,
      await gameStatusService.observe(root)
    )
  })
  ipcMain.handle('nms:discover-glyphs', async (_, request: unknown) => {
    if (!isGlyphRequest(request)) throw new Error('Invalid request.')
    const root = getInstallationService().getSelectedRootPath()
    return getResearchBridgeService().discoverGlyphs(
      { count: request.count, notify: request.notify },
      root,
      await gameStatusService.observe(root)
    )
  })
  // Technologies waiting for components: the listing reads, the finish has the game complete them.
  const waitingTechnologies = async (
    request: Parameters<ReturnType<typeof getResearchBridgeService>['waitingTechnologies']>[0],
    locale: unknown
  ): Promise<unknown> => {
    const root = getInstallationService().getSelectedRootPath()
    const report = await getResearchBridgeService().waitingTechnologies(
      request,
      root,
      await gameStatusService.observe(root)
    )
    const names = getCatalogRepository().names(typeof locale === 'string' ? locale : 'en-US')
    return {
      ...report,
      entries: report.entries.map((entry) => ({
        ...entry,
        name: names.get(`technology:${entry.id}`) ?? ''
      }))
    }
  }
  ipcMain.handle('nms:list-waiting-technologies', (_, locale: unknown) =>
    waitingTechnologies('list', locale)
  )
  ipcMain.handle('nms:finish-technologies', (_, request: unknown, locale: unknown) => {
    if (!isInstallRequest(request)) throw new Error('Invalid request.')
    return waitingTechnologies(
      {
        slots:
          request.slots?.map((slot) => ({
            choice: slot.choice,
            owner: slot.owner,
            x: slot.x,
            y: slot.y
          })) ?? null
      },
      locale
    )
  })
  ipcMain.handle('nms:teleport', async (_, request: unknown) => {
    if (!isTeleportRequest(request)) throw new Error('Invalid request.')
    const root = getInstallationService().getSelectedRootPath()
    return getResearchBridgeService().teleport(
      { glyphs: request.glyphs, galaxyNumber: request.galaxyNumber, to: request.to },
      root,
      await gameStatusService.observe(root)
    )
  })
  ipcMain.handle('nms:deliver-currency', async (_, request: unknown) => {
    const value = request as { currency?: unknown; amount?: unknown; notify?: unknown } | null
    if (!value || typeof value.currency !== 'string' || typeof value.amount !== 'number') {
      throw new Error('Invalid request.')
    }
    const root = getInstallationService().getSelectedRootPath()
    return getResearchBridgeService().deliverCurrency(
      { currency: value.currency, amount: value.amount },
      root,
      await gameStatusService.observe(root),
      value.notify !== false
    )
  })
  // The texture of one catalogue icon, as the game stores it; the renderer draws it.
  ipcMain.handle('nms:get-game-icon', (_, locator: unknown) => {
    if (typeof locator !== 'string' || locator.length > 260) return null
    // Catalogue icons, and the sixteen portal glyphs of the teleport page.
    const allowed = new Set(getCatalogRepository().iconLocators())
    for (const digit of glyphDigits) allowed.add(glyphIcon(digit))
    return iconSource.read(getInstallationService().getSelectedRootPath(), locator, allowed)
  })
  // A corvette export: the user picks the file, the application reads it; nothing is installed yet.
  ipcMain.handle('nms:choose-corvette-file', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'No Man’s Sky ship', extensions: ['nmsship'] }]
    })
    if (result.canceled || result.filePaths.length !== 1) return null
    return getCorvetteLayoutService().choose(result.filePaths[0])
  })
  ipcMain.handle('nms:install-corvette-layout', () =>
    getCorvetteLayoutService().install(getInstallationService().getSelectedRootPath())
  )
  ipcMain.handle('nms:get-corvette-layout', () =>
    getCorvetteLayoutService().status(getInstallationService().getSelectedRootPath())
  )
  // Read only: the star system the player is in and its ships, as the bridge reports them.
  ipcMain.handle('nms:get-star-system', async () => {
    const game = await gameStatusService.observe(getInstallationService().getSelectedRootPath())
    const report = await getResearchBridgeService().getStarSystem(game.processId)
    return getModelWorkshopService().withShipModels(report)
  })
  ipcMain.handle('nms:get-stack-limits', async () => {
    const root = getInstallationService().getSelectedRootPath()
    const game = await gameStatusService.observe(root)
    return getResearchBridgeService().getStackLimits(game.processId)
  })
  ipcMain.handle('nms:deliver-items', async (_, items: unknown, notify: unknown) => {
    const valid =
      Array.isArray(items) &&
      items.every(
        (item) =>
          item &&
          typeof item === 'object' &&
          typeof item.id === 'string' &&
          typeof item.amount === 'number'
      )
    if (!valid) throw new Error('Invalid items.')
    const root = getInstallationService().getSelectedRootPath()
    return getResearchBridgeService().deliverItems(
      (items as Array<{ id: string; amount: number }>).map(({ id, amount }) => ({ id, amount })),
      root,
      await gameStatusService.observe(root),
      notify !== false
    )
  })
  // Entries of an area that can be sent one by one, named by the local catalogue when it can.
  ipcMain.handle('nms:get-delivery-options', async (_, feature: unknown, locale: unknown) => {
    if (!isDeliveryFeatureId(feature) || typeof locale !== 'string') {
      throw new Error('Invalid delivery area.')
    }
    const options = await getResearchBridgeService().getOptions(feature, locale)
    const names = getCatalogRepository().names(locale)
    const icons = getCatalogRepository().icons()
    return options.map((option) => {
      // Some entries are named by another one: a recipe by what it makes, a reward by its product.
      const key = option.domain ? `${option.domain}:${option.catalogId ?? option.id}` : ''
      return {
        id: option.id,
        group: option.group,
        name: option.name || (key && names.get(key)) || '',
        icon: (key && icons.get(key)) || null
      }
    })
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
