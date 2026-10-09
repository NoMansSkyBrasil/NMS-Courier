import { useMemo, useState } from 'react'
import { Badge } from '@renderer/components/ui/badge'
import { Button } from '@renderer/components/ui/button'
import { Checkbox } from '@renderer/components/ui/checkbox'
import { Input } from '@renderer/components/ui/input'
import { GameIcon } from '@renderer/components/game-icon'
import { Table, TableBody, TableCell, TableRow } from '@renderer/components/ui/table'
import { formatMessage, useLocale } from '@renderer/i18n/locale'

export type DeliveryOption = Awaited<ReturnType<typeof window.nms.getDeliveryOptions>>[number]

// Rows drawn at once; the search narrows a longer list.
const shownLimit = 600

// The entries of one area with a search box and a checkbox each. The chosen identifiers live in
// the delivery card, which sends them.
export function DeliverySelection({
  options,
  chosen,
  onChange
}: {
  options: readonly DeliveryOption[]
  chosen: ReadonlySet<string>
  onChange: (next: Set<string>) => void
}): React.JSX.Element {
  const { copy, locale } = useLocale()
  const text = copy.delivery
  const [query, setQuery] = useState('')

  const matching = useMemo(() => {
    const wanted = query.trim().toLocaleLowerCase()
    if (!wanted) return options
    return options.filter((option) =>
      `${option.id} ${option.name} ${option.group}`.toLocaleLowerCase().includes(wanted)
    )
  }, [options, query])
  const shown = matching.slice(0, shownLimit)
  // Areas the catalogue cannot name (titles, rewards) have no icons either.
  const hasIcons = options.some((option) => option.icon)

  const toggle = (id: string, checked: boolean): void => {
    const next = new Set(chosen)
    if (checked) next.add(id)
    else next.delete(id)
    onChange(next)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium">{text.selectTitle}</span>
        <span className="text-sm text-muted-foreground">{text.selectHint}</span>
      </div>
      <Input
        aria-label={text.selectSearch}
        placeholder={text.selectSearch}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onChange(new Set([...chosen, ...matching.map((option) => option.id)]))}
        >
          {text.selectAllShown}
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={chosen.size === 0}
          onClick={() => onChange(new Set())}
        >
          {text.selectClear}
        </Button>
        <Badge variant="secondary">
          {formatMessage(text.selectCount, { count: chosen.size.toLocaleString(locale) })}
        </Badge>
      </div>
      <div className="max-h-96 overflow-auto rounded-lg border">
        <Table>
          <TableBody>
            {shown.map((option) => (
              <TableRow key={option.id}>
                <TableCell className="w-8">
                  <Checkbox
                    aria-label={option.name || option.id}
                    checked={chosen.has(option.id)}
                    onCheckedChange={(checked) => toggle(option.id, checked === true)}
                  />
                </TableCell>
                {hasIcons && (
                  <TableCell className="w-10">
                    <GameIcon locator={option.icon} />
                  </TableCell>
                )}
                <TableCell className="font-medium">{option.name || option.id}</TableCell>
                <TableCell className="text-muted-foreground">{option.id}</TableCell>
                <TableCell className="text-right">
                  <Badge variant="outline">{option.group}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground">
        {matching.length === 0
          ? text.selectNone
          : matching.length > shown.length
            ? formatMessage(text.selectShowing, {
                shown: shown.length.toLocaleString(locale),
                total: matching.length.toLocaleString(locale)
              })
            : options.every((option) => !option.name)
              ? text.selectNoCatalog
              : ''}
      </p>
    </div>
  )
}
