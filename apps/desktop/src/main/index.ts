import { app, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { CatalogRepository, catalogDomains, type CatalogDomain } from './catalog-repository'
import { inspectRuntimeBundle } from './runtime-resources'

let catalogRepository: CatalogRepository | null = null

function getCatalogRepository(): CatalogRepository {
  catalogRepository ??= new CatalogRepository(app.getPath('userData'))
  return catalogRepository
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
  if (typeof request.query !== 'string' || request.query.length > 160) throw new Error('Invalid catalog query.')
  if (typeof request.locale !== 'string' || request.locale.length > 32) throw new Error('Invalid catalog locale.')
  if (typeof limit !== 'number' || !Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new Error('Invalid catalog limit.')
  }
  if (request.domain !== undefined && !catalogDomains.includes(request.domain as CatalogDomain)) {
    throw new Error('Invalid catalog domain.')
  }
  return { query: request.query, locale: request.locale, domain: request.domain as CatalogDomain | undefined, limit }
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
  ipcMain.handle('nms:get-catalog-status', () => getCatalogRepository().getStatus())
  ipcMain.handle('nms:search-catalog', (_, request: unknown) => getCatalogRepository().search(parseCatalogSearchRequest(request)))

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
