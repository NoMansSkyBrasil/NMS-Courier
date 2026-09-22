import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

export const catalogDomains = ['substance', 'product', 'technology'] as const
export type CatalogDomain = (typeof catalogDomains)[number]

export type CatalogStatus = {
  state: 'available' | 'unavailable'
  generationId: string | null
  productVersion: string | null
  entryCount: number
  domains: Record<CatalogDomain, number>
  locales: string[]
}

export type CatalogSearchRequest = {
  query: string
  locale: string
  domain?: CatalogDomain
  limit: number
}

export type CatalogSearchResult = {
  entries: Array<{
    entryKey: string
    gameId: string
    domain: CatalogDomain
    category: string | null
    name: string
    subtitle: string
    description: string
  }>
  total: number
}

type CatalogEntry = CatalogSearchResult['entries'][number] & {
  localizations: Record<string, { name?: string; subtitle?: string; description?: string }>
}

type CoreCatalog = {
  installation?: { productVersion?: string }
  domains?: Partial<Record<CatalogDomain, number>>
  entries?: CatalogEntry[]
}

function emptyStatus(): CatalogStatus {
  return {
    state: 'unavailable',
    generationId: null,
    productVersion: null,
    entryCount: 0,
    domains: { substance: 0, product: 0, technology: 0 },
    locales: []
  }
}

function isCatalogEntry(value: unknown): value is CatalogEntry {
  if (!value || typeof value !== 'object') return false
  const entry = value as Record<string, unknown>
  return (
    typeof entry.entryKey === 'string' &&
    typeof entry.gameId === 'string' &&
    typeof entry.domain === 'string' &&
    entry.localizations !== null &&
    typeof entry.localizations === 'object'
  )
}

export class CatalogRepository {
  private cached: { generationId: string; modifiedAtMs: number; catalog: CoreCatalog } | null = null

  constructor(private readonly userDataPath: string) {}

  getStatus(): CatalogStatus {
    const source = this.loadCurrent()
    if (!source) return emptyStatus()

    const entries = source.catalog.entries ?? []
    const firstEntry = entries[0]
    return {
      state: 'available',
      generationId: source.generationId,
      productVersion: source.catalog.installation?.productVersion ?? null,
      entryCount: entries.length,
      domains: {
        substance: source.catalog.domains?.substance ?? 0,
        product: source.catalog.domains?.product ?? 0,
        technology: source.catalog.domains?.technology ?? 0
      },
      locales: firstEntry ? Object.keys(firstEntry.localizations).sort() : []
    }
  }

  search(request: CatalogSearchRequest): CatalogSearchResult {
    const source = this.loadCurrent()
    if (!source) return { entries: [], total: 0 }

    const normalizedQuery = request.query.trim().toLocaleLowerCase()
    const matching = (source.catalog.entries ?? []).filter((entry) => {
      if (request.domain && entry.domain !== request.domain) return false
      const localized = entry.localizations[request.locale] ?? {}
      const searchable = [entry.gameId, entry.entryKey, localized.name ?? '', localized.subtitle ?? '']
        .join(' ')
        .toLocaleLowerCase()
      return !normalizedQuery || searchable.includes(normalizedQuery)
    })
    return {
      total: matching.length,
      entries: matching.slice(0, request.limit).map((entry) => {
        const localized = entry.localizations[request.locale] ?? {}
        return {
          entryKey: entry.entryKey,
          gameId: entry.gameId,
          domain: entry.domain,
          category: entry.category,
          name: localized.name ?? '',
          subtitle: localized.subtitle ?? '',
          description: localized.description ?? ''
        }
      })
    }
  }

  private loadCurrent(): { generationId: string; catalog: CoreCatalog } | null {
    const generationsPath = join(this.userDataPath, 'catalog', 'generations')
    let generationIds: string[]
    try {
      generationIds = readdirSync(generationsPath, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .sort()
        .reverse()
    } catch {
      return null
    }

    for (const generationId of generationIds) {
      const catalogPath = join(generationsPath, generationId, 'core-catalog.json')
      try {
        const modifiedAtMs = statSync(catalogPath).mtimeMs
        if (this.cached?.generationId === generationId && this.cached.modifiedAtMs === modifiedAtMs) {
          return { generationId, catalog: this.cached.catalog }
        }
        const parsed: unknown = JSON.parse(readFileSync(catalogPath, 'utf8'))
        if (!parsed || typeof parsed !== 'object') continue
        const catalog = parsed as CoreCatalog
        if (!Array.isArray(catalog.entries) || !catalog.entries.every(isCatalogEntry)) continue
        this.cached = { generationId, modifiedAtMs, catalog }
        return { generationId, catalog }
      } catch {
        continue
      }
    }
    return null
  }
}
