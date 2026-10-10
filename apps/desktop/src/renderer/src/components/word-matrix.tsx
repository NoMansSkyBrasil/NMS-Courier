import { useEffect, useMemo, useState } from 'react'
import { Badge } from '@renderer/components/ui/badge'
import { Button } from '@renderer/components/ui/button'
import { Checkbox } from '@renderer/components/ui/checkbox'
import { Input } from '@renderer/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@renderer/components/ui/table'
import { formatMessage, useLocale } from '@renderer/i18n/locale'
import type { DeliveryOption } from '@renderer/components/delivery-selection'

// The races that have words, in the order of the word table's group columns.
const races = ['Traders', 'Warriors', 'Explorers', 'Atlas', 'Builders'] as const

// One word of the game: its identifier, its text and the group that teaches it for each race.
type Row = { id: string; text: string; groups: string[] }

// Rows drawn at first and added each time the list is scrolled near its end.
const pageSize = 150

// The words of every race as a grid: one row a word, one column a race, a box where the race has
// the word. A marked box is a word group to send; the game is not asked what is already known.
// The game learns a group of a race at once, so the words of one group are marked together.
export function WordMatrix({
  options,
  chosen,
  onChange
}: {
  options: readonly DeliveryOption[]
  chosen: ReadonlySet<string>
  onChange: (next: Set<string>) => void
}): React.JSX.Element {
  const { copy, locale } = useLocale()
  const text = copy.words
  const delivery = copy.delivery
  const [words, setWords] = useState<Row[]>([])
  const [query, setQuery] = useState('')
  const [drawn, setDrawn] = useState(pageSize)

  useEffect(() => {
    let active = true
    void window.nms
      .getWordRows(locale)
      .then((rows) => active && setWords(rows))
      .catch(() => active && setWords([]))
    return () => {
      active = false
    }
  }, [locale])

  // Only groups the delivery offers get a box.
  const rows = useMemo(() => {
    const offered = new Set(options.map((option) => option.id))
    const order = new Intl.Collator(locale)
    return words
      .map((row) => ({
        ...row,
        groups: row.groups.map((group) => (offered.has(group) ? group : ''))
      }))
      .filter((row) => row.groups.some(Boolean))
      .sort((a, b) => order.compare(a.text, b.text) || order.compare(a.id, b.id))
  }, [words, options, locale])

  const matching = useMemo(() => {
    const wanted = query.trim().toLocaleLowerCase()
    if (!wanted) return rows
    return rows.filter((row) => `${row.text} ${row.id}`.toLocaleLowerCase().includes(wanted))
  }, [rows, query])
  const shown = matching.slice(0, drawn)

  const boxes = rows.flatMap((row) => row.groups.filter(Boolean))
  const marked = boxes.filter((group) => chosen.has(group)).length
  const groupsOf = (race: number): string[] => [
    ...new Set(matching.map((row) => row.groups[race]).filter(Boolean))
  ]
  const setMany = (ids: readonly string[], checked: boolean): void => {
    const next = new Set(chosen)
    for (const id of ids) {
      if (checked) next.add(id)
      else next.delete(id)
    }
    onChange(next)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium">{delivery.selectTitle}</span>
        <span className="text-sm text-muted-foreground">{text.hint}</span>
      </div>
      <Input
        aria-label={delivery.selectSearch}
        placeholder={delivery.selectSearch}
        value={query}
        onChange={(event) => {
          setQuery(event.target.value)
          setDrawn(pageSize)
        }}
      />
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setMany(
              races.flatMap((_, race) => groupsOf(race)),
              true
            )
          }
        >
          {delivery.selectAllShown}
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={chosen.size === 0}
          onClick={() => onChange(new Set())}
        >
          {delivery.selectClear}
        </Button>
        <Badge variant="secondary">
          {formatMessage(text.marked, {
            count: marked.toLocaleString(locale),
            total: boxes.length.toLocaleString(locale)
          })}
        </Badge>
      </div>
      <div
        className="h-[32rem] overflow-auto rounded-lg border"
        onScroll={(event) => {
          const list = event.currentTarget
          if (
            drawn < matching.length &&
            list.scrollTop + list.clientHeight > list.scrollHeight - 400
          ) {
            setDrawn(drawn + pageSize)
          }
        }}
      >
        <Table className="table-fixed">
          <TableHeader className="sticky top-0 z-10 bg-card">
            <TableRow>
              <TableHead>{text.word}</TableHead>
              <TableHead className="internal-name">{text.id}</TableHead>
              {races.map((race, index) => {
                const ids = groupsOf(index)
                const count = ids.filter((id) => chosen.has(id)).length
                return (
                  <TableHead key={race} className="w-24">
                    <div className="flex flex-col items-center gap-1.5 py-2">
                      <span>{text.race[race]}</span>
                      <Checkbox
                        aria-label={formatMessage(text.raceAll, { race: text.race[race] })}
                        checked={ids.length > 0 && count === ids.length}
                        disabled={ids.length === 0}
                        onCheckedChange={(checked) => setMany(ids, checked === true)}
                      />
                    </div>
                  </TableHead>
                )
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {shown.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="truncate font-medium">{row.text}</TableCell>
                <TableCell className="internal-name truncate font-mono text-xs text-muted-foreground">
                  {row.id}
                </TableCell>
                {races.map((race, index) => {
                  const group = row.groups[index]
                  return (
                    <TableCell key={race}>
                      {group && (
                        <div className="flex justify-center">
                          <Checkbox
                            aria-label={`${row.id} ${text.race[race]}`}
                            checked={chosen.has(group)}
                            onCheckedChange={(checked) => setMany([group], checked === true)}
                          />
                        </div>
                      )}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground">
        {matching.length === 0
          ? delivery.selectNone
          : formatMessage(delivery.selectShowing, {
              shown: matching.length.toLocaleString(locale),
              total: rows.length.toLocaleString(locale)
            })}
      </p>
    </div>
  )
}
