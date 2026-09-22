import { useEffect, useState } from 'react'
import { SearchIcon, DatabaseIcon } from 'lucide-react'
import { Badge } from '@renderer/components/ui/badge'
import { Button } from '@renderer/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@renderer/components/ui/empty'
import { Input } from '@renderer/components/ui/input'
import { Skeleton } from '@renderer/components/ui/skeleton'
import { useLocale } from '@renderer/i18n/locale-provider'

type Domain = 'substance' | 'product' | 'technology'
type Status = Awaited<ReturnType<typeof window.nms.getCatalogStatus>>
type SearchResult = Awaited<ReturnType<typeof window.nms.searchCatalog>>

const domains: Array<Domain | undefined> = [undefined, 'substance', 'product', 'technology']

export function CatalogPage(): React.JSX.Element {
  const { locale } = useLocale()
  const [status, setStatus] = useState<Status | null>(null)
  const [query, setQuery] = useState('')
  const [domain, setDomain] = useState<Domain | undefined>()
  const [result, setResult] = useState<SearchResult | null>(null)

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
    return <div className="p-4 md:p-6"><Skeleton className="h-48 w-full" /></div>
  }

  if (status.state === 'unavailable') {
    return (
      <div className="p-4 md:p-6">
        <Empty className="min-h-72 border">
          <EmptyHeader>
            <EmptyMedia variant="icon"><DatabaseIcon /></EmptyMedia>
            <EmptyTitle>Local catalog is not available</EmptyTitle>
            <EmptyDescription>
              No verified catalog generation exists in this application profile. Catalog refresh will remain unavailable until its bundled, selected-installation workflow is implemented.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    )
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>Local catalog</CardTitle>
            <Badge variant="secondary">Build {status.productVersion ?? 'unknown'}</Badge>
            <Badge variant="outline">{status.entryCount.toLocaleString()} entries</Badge>
          </div>
          <CardDescription>
            Read-only definitions extracted from the selected game installation. Results do not imply a supported delivery action.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
            <Input aria-label="Search local catalog" className="pl-8" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name or Game ID" />
          </div>
          <div className="flex flex-wrap gap-2" aria-label="Catalog domain">
            {domains.map((value) => (
              <Button key={value ?? 'all'} variant={domain === value ? 'default' : 'outline'} size="sm" onClick={() => setDomain(value)}>
                {value ?? 'All'}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{result ? `${result.total.toLocaleString()} matching definitions` : 'Loading definitions…'}</span>
        <span>{status.locales.length} local game languages</span>
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        {result?.entries.map((entry) => (
          <Card key={entry.entryKey}>
            <CardHeader className="gap-1">
              <div className="flex items-start justify-between gap-3">
                <CardTitle className="text-base">{entry.name || entry.gameId}</CardTitle>
                <Badge variant="outline">{entry.domain}</Badge>
              </div>
              <CardDescription>{entry.subtitle || entry.gameId}</CardDescription>
            </CardHeader>
            {entry.description && <CardContent className="text-sm text-muted-foreground">{entry.description}</CardContent>}
          </Card>
        ))}
      </div>
    </main>
  )
}
