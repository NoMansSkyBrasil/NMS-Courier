import { useEffect, useState } from 'react'
import {
  CircleAlertIcon,
  CircleCheckIcon,
  CircleHelpIcon,
  PlusIcon,
  SendIcon,
  XIcon
} from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@renderer/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@renderer/components/ui/alert-dialog'
import { Badge } from '@renderer/components/ui/badge'
import { Button } from '@renderer/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@renderer/components/ui/card'
import { Input } from '@renderer/components/ui/input'
import { Spinner } from '@renderer/components/ui/spinner'
import { Table, TableBody, TableCell, TableRow } from '@renderer/components/ui/table'
import { formatMessage, useLocale } from '@renderer/i18n/locale-provider'
import type { DeliveryStateId } from '@renderer/i18n/messages'

type BridgeStatus = Awaited<ReturnType<typeof window.nms.getResearchBridgeStatus>>
type DeliveryResult = Awaited<ReturnType<typeof window.nms.deliverItems>>
type Entry = Awaited<ReturnType<typeof window.nms.searchCatalog>>['entries'][number]
type Chosen = { id: string; name: string; amount: number }

const outcomeIcons = {
  completed: CircleCheckIcon,
  unknown: CircleHelpIcon,
  failed: CircleAlertIcon,
  refused: CircleAlertIcon
} as const
// One request of the bridge carries this many different items.
const requestLimit = 32
const amountLimit = 999999

// Puts substances and products into the exosuit cargo of the loaded slot: search the local
// catalogue, set an amount for each chosen item, confirm, one request, the game's answer.
export function ItemsCard(): React.JSX.Element {
  const { copy, locale } = useLocale()
  const text = copy.delivery
  const [status, setStatus] = useState<BridgeStatus | null>(null)
  const [query, setQuery] = useState('')
  const [found, setFound] = useState<Entry[]>([])
  const [catalog, setCatalog] = useState<boolean | null>(null)
  const [chosen, setChosen] = useState<Chosen[]>([])
  const [confirming, setConfirming] = useState(false)
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<DeliveryResult | null>(null)

  useEffect(() => {
    let active = true
    const refresh = (): void => {
      void window.nms
        .getResearchBridgeStatus()
        .then((next) => active && setStatus(next))
        .catch(() => active && setStatus(null))
    }
    refresh()
    void window.nms
      .getCatalogStatus()
      .then((next) => active && setCatalog(next.state === 'available'))
    const timer = window.setInterval(refresh, 5000)
    return () => {
      active = false
      window.clearInterval(timer)
    }
  }, [])

  useEffect(() => {
    let active = true
    const timer = window.setTimeout(() => {
      if (!query.trim()) {
        setFound([])
        return
      }
      void window.nms
        .searchCatalog({ query, locale, limit: 40 })
        .then(
          (next) =>
            active && setFound(next.entries.filter((entry) => entry.domain !== 'technology'))
        )
    }, 150)
    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [locale, query])

  const add = (entry: Entry): void => {
    setChosen((current) =>
      current.length >= requestLimit || current.some((item) => item.id === entry.gameId)
        ? current
        : [...current, { id: entry.gameId, name: entry.name || entry.gameId, amount: 1 }]
    )
  }
  const setAmount = (id: string, value: string): void => {
    const amount = Math.min(amountLimit, Math.max(1, Math.trunc(Number(value)) || 1))
    setChosen((current) => current.map((item) => (item.id === id ? { ...item, amount } : item)))
  }

  const send = async (): Promise<void> => {
    setConfirming(false)
    setSending(true)
    try {
      setResult(await window.nms.deliverItems(chosen.map(({ id, amount }) => ({ id, amount }))))
    } finally {
      setSending(false)
    }
  }

  const ready = status?.state === 'ready'
  const stateText = status
    ? formatMessage(text.state[status.state], { id: status.processId ?? '' })
    : text.state.unavailable
  const reason = result?.reason as DeliveryStateId | null | undefined
  const OutcomeIcon = result ? outcomeIcons[result.outcome] : null

  return (
    <Card>
      <CardHeader>
        <CardTitle>{text.itemsTitle}</CardTitle>
        <CardDescription>{text.itemsHint}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">{stateText}</p>
        {catalog === false && (
          <Alert>
            <CircleHelpIcon />
            <AlertTitle>{copy.catalogPage.unavailableTitle}</AlertTitle>
            <AlertDescription>{text.selectNoCatalog}</AlertDescription>
          </Alert>
        )}
        <Input
          aria-label={text.selectSearch}
          placeholder={text.selectSearch}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        {found.length > 0 && (
          <div className="max-h-64 overflow-auto rounded-lg border">
            <Table>
              <TableBody>
                {found.map((entry) => (
                  <TableRow key={entry.entryKey}>
                    <TableCell className="font-medium">{entry.name || entry.gameId}</TableCell>
                    <TableCell className="text-muted-foreground">{entry.gameId}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{copy.catalogPage[entry.domain]}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={
                          chosen.length >= requestLimit ||
                          chosen.some((item) => item.id === entry.gameId)
                        }
                        onClick={() => add(entry)}
                      >
                        <PlusIcon data-icon="inline-start" />
                        {text.itemsAdd}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        {chosen.length === 0 ? (
          <p className="text-sm text-muted-foreground">{text.itemsEmpty}</p>
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableBody>
                {chosen.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-muted-foreground">{item.id}</TableCell>
                    <TableCell className="w-36">
                      <Input
                        aria-label={text.itemsAmount}
                        type="number"
                        min={1}
                        max={amountLimit}
                        value={item.amount}
                        onChange={(event) => setAmount(item.id, event.target.value)}
                      />
                    </TableCell>
                    <TableCell className="w-10 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={text.itemsRemove}
                        onClick={() =>
                          setChosen((current) => current.filter((other) => other.id !== item.id))
                        }
                      >
                        <XIcon />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        {result && OutcomeIcon && (
          <Alert variant={result.outcome === 'failed' ? 'destructive' : 'default'}>
            <OutcomeIcon />
            <AlertTitle>{text.outcome[result.outcome]}</AlertTitle>
            <AlertDescription>
              {reason && reason in text.state
                ? formatMessage(text.state[reason], { id: '' })
                : text.outcomeHint[result.outcome]}
            </AlertDescription>
          </Alert>
        )}
        {result && result.steps.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">{text.result}</span>
            <pre className="max-h-64 overflow-auto rounded-lg bg-muted p-3 text-xs">
              {result.steps.map((step) => step.lines.join('\n')).join('\n\n')}
            </pre>
          </div>
        )}
        {result?.backupPath && (
          <p className="text-xs break-all text-muted-foreground">
            {formatMessage(text.backup, { path: result.backupPath })}
          </p>
        )}
      </CardContent>
      <CardFooter>
        <AlertDialog open={confirming} onOpenChange={setConfirming}>
          <AlertDialogTrigger
            render={<Button disabled={!ready || sending || chosen.length === 0} />}
          >
            {sending ? <Spinner data-icon="inline-start" /> : <SendIcon data-icon="inline-start" />}
            {sending
              ? text.sending
              : formatMessage(text.itemsAction, { count: chosen.length.toLocaleString(locale) })}
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{text.confirmTitle}</AlertDialogTitle>
              <AlertDialogDescription>{text.itemsConfirm}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{text.cancel}</AlertDialogCancel>
              <AlertDialogAction onClick={() => void send()}>{text.confirm}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  )
}
