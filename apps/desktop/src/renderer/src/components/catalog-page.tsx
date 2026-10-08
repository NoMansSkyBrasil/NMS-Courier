import { useEffect, useState } from 'react'
import { SearchIcon, DatabaseIcon, RefreshCwIcon } from 'lucide-react'
import { Badge } from '@renderer/components/ui/badge'
import { Button } from '@renderer/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@renderer/components/ui/card'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from '@renderer/components/ui/empty'
import { Input } from '@renderer/components/ui/input'
import { Skeleton } from '@renderer/components/ui/skeleton'
import { GameIcon } from '@renderer/components/game-icon'
import { Spinner } from '@renderer/components/ui/spinner'
import { formatMessage, useLocale } from '@renderer/i18n/locale-provider'

type Domain = 'substance' | 'product' | 'technology'
type Status = Awaited<ReturnType<typeof window.nms.getCatalogStatus>>
type SearchResult = Awaited<ReturnType<typeof window.nms.searchCatalog>>
type ImportResult = Awaited<ReturnType<typeof window.nms.importCatalog>>

const domains: Array<Domain | undefined> = [undefined, 'substance', 'product', 'technology']

export function CatalogPage(): React.JSX.Element {
  const { copy, locale } = useLocale()
  const text = copy.catalogPage
  const [status, setStatus] = useState<Status | null>(null)
  const [query, setQuery] = useState('')
  const [domain, setDomain] = useState<Domain | undefined>()
  const [result, setResult] = useState<SearchResult | null>(null)
  const [importing, setImporting] = useState(false)
  const [imported, setImported] = useState<ImportResult | null>(null)

  // Read the catalogue from the selected installation; the previous one stays when this fails.
  const importCatalog = async (): Promise<void> => {
    setImporting(true)
    try {
      setImported(await window.nms.importCatalog())
      setStatus(await window.nms.getCatalogStatus())
    } finally {
      setImporting(false)
    }
  }

  const importText = !imported
    ? text.generateHint
    : imported.state === 'imported'
      ? formatMessage(text.imported, { count: imported.entryCount.toLocaleString(locale) })
      : imported.reason === 'installation_not_selected'
        ? text.failInstallation
        : imported.reason === 'archives_missing'
          ? text.failArchives
          : imported.reason === 'unknown_structure'
            ? text.failStructure
            : imported.reason === 'busy'
              ? text.generating
              : text.failUnreadable
  const importButton = (
    <Button variant="outline" onClick={() => void importCatalog()} disabled={importing}>
      {importing ? (
        <Spinner data-icon="inline-start" />
      ) : (
        <RefreshCwIcon data-icon="inline-start" />
      )}
      {importing ? text.generating : status?.state === 'available' ? text.refresh : text.generate}
    </Button>
  )

  useEffect(() => {
    void window.nms.getCatalogStatus().then(setStatus)
  }, [])

  useEffect(() => {
    if (status?.state !== 'available') return
    const timer = window.setTimeout(() => {
      void window.nms.searchCatalog({ query, locale, domain, limit: 50 }).then(setResult)
    }, 150)
    return () => window.clearTimeout(timer)
  }, [domain, locale, query, status?.state])

  if (!status) {
    return (
      <div className="p-4 md:p-6">
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (status.state === 'unavailable') {
    return (
      <div className="p-4 md:p-6">
        <Empty className="min-h-72 border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <DatabaseIcon />
            </EmptyMedia>
            <EmptyTitle>{text.unavailableTitle}</EmptyTitle>
            <EmptyDescription>{text.unavailableBody}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            {importButton}
            <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
              {importText}
            </p>
          </EmptyContent>
        </Empty>
      </div>
    )
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>{text.title}</CardTitle>
            <Badge variant="secondary">
              {formatMessage(text.buildBadge, {
                build: status.productVersion ?? copy.dashboard.unknown
              })}
            </Badge>
            <Badge variant="outline">
              {formatMessage(copy.dashboard.entriesCount, {
                count: status.entryCount.toLocaleString(locale)
              })}
            </Badge>
          </div>
          <CardDescription>{text.description}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
            <Input
              aria-label={text.searchLabel}
              className="pl-8"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={text.searchPlaceholder}
            />
          </div>
          <div className="flex flex-wrap gap-2" aria-label={text.searchLabel}>
            {domains.map((value) => (
              <Button
                key={value ?? 'all'}
                variant={domain === value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDomain(value)}
              >
                {value ? text[value] : text.all}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
      <div className="flex flex-wrap items-center gap-3">
        {importButton}
        <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
          {importText}
        </p>
      </div>
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {result
            ? formatMessage(text.matching, { count: result.total.toLocaleString(locale) })
            : text.loading}
        </span>
        <span>{formatMessage(text.languages, { count: status.locales.length })}</span>
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        {result?.entries.map((entry) => (
          <Card key={entry.entryKey}>
            <CardHeader className="gap-1">
              <div className="flex items-start gap-3">
                <GameIcon locator={entry.icon} size="lg" />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-base">{entry.name || entry.gameId}</CardTitle>
                    <Badge variant="outline">{text[entry.domain]}</Badge>
                  </div>
                  <CardDescription>{entry.subtitle || entry.gameId}</CardDescription>
                </div>
              </div>
            </CardHeader>
            {entry.description && (
              <CardContent className="text-sm text-muted-foreground">
                {entry.description}
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </main>
  )
}
