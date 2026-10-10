import { useEffect, useState } from 'react'
import {
  CircleAlertIcon,
  CircleCheckIcon,
  CircleHelpIcon,
  ClockIcon,
  GiftIcon,
  UsersIcon
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
  AlertDialogTitle
} from '@renderer/components/ui/alert-dialog'
import { Badge } from '@renderer/components/ui/badge'
import { Button } from '@renderer/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@renderer/components/ui/card'
import { GameIcon } from '@renderer/components/game-icon'
import { Input } from '@renderer/components/ui/input'
import { Spinner } from '@renderer/components/ui/spinner'
import { formatMessage, useLocale } from '@renderer/i18n/locale'
import type { DeliveryStateId } from '@renderer/i18n/messages'
import { giftAmountLimit, type GiftAnswer } from '../../../shared/player-gift'

type BridgeStatus = Awaited<ReturnType<typeof window.nms.getResearchBridgeStatus>>
type Report = Awaited<ReturnType<typeof window.nms.listSessionPlayers>>
type Player = Report['players'][number]
type Entry = Awaited<ReturnType<typeof window.nms.searchCatalog>>['entries'][number]

// What came back from the other player's game; each colour is shown with its word.
const answerTones: Record<GiftAnswer, string> = {
  none: '',
  waiting: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  accepted: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  refused: 'bg-red-500/15 text-red-700 dark:text-red-400',
  failed: 'bg-red-500/15 text-red-700 dark:text-red-400'
}
const answerIcons: Record<GiftAnswer, typeof ClockIcon> = {
  none: CircleHelpIcon,
  waiting: ClockIcon,
  accepted: CircleCheckIcon,
  refused: CircleAlertIcon,
  failed: CircleAlertIcon
}

// Hands an item to another player of the session: find the players, pick one, pick an item and an
// amount, confirm. The other player's game creates the item and answers.
export function PlayerGiftCard(): React.JSX.Element {
  const { copy, locale } = useLocale()
  const text = copy.gift
  const delivery = copy.delivery
  const [status, setStatus] = useState<BridgeStatus | null>(null)
  const [report, setReport] = useState<Report | null>(null)
  const [player, setPlayer] = useState<Player | null>(null)
  const [query, setQuery] = useState('')
  const [found, setFound] = useState<Entry[]>([])
  const [item, setItem] = useState<Entry | null>(null)
  const [amount, setAmount] = useState(1)
  const [working, setWorking] = useState(false)
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    let active = true
    const refresh = (): void => {
      void window.nms
        .getResearchBridgeStatus()
        .then((next) => active && setStatus(next))
        .catch(() => active && setStatus(null))
    }
    refresh()
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
        .searchCatalog({ query, locale, limit: 12 })
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

  // While the other player's game has not answered, the answer is read again.
  const waiting = report?.answer === 'waiting'
  useEffect(() => {
    if (!waiting) return
    const timer = window.setInterval(() => {
      void window.nms
        .getGiftAnswer()
        .then((answer) => answer && setReport((current) => current && { ...current, answer }))
        .catch(() => undefined)
    }, 1500)
    return () => window.clearInterval(timer)
  }, [waiting])

  const findPlayers = async (): Promise<void> => {
    setWorking(true)
    try {
      const next = await window.nms.listSessionPlayers()
      setReport(next)
      setPlayer((current) => next.players.find((entry) => entry.user === current?.user) ?? null)
    } finally {
      setWorking(false)
    }
  }

  const send = async (): Promise<void> => {
    setConfirming(false)
    if (!player || !item) return
    setWorking(true)
    try {
      setReport(
        await window.nms.sendGift({
          slot: player.slot,
          user: player.user,
          item: item.gameId,
          amount
        })
      )
    } finally {
      setWorking(false)
    }
  }

  const ready = status?.state === 'ready'
  const players = report?.players ?? []
  const result = report?.delivery ?? null
  const reason = result?.reason as DeliveryStateId | null | undefined
  const failed = result !== null && result.outcome !== 'completed'
  const refusal =
    report && report.result !== 'listed' && report.result !== 'sent'
      ? text.results[report.result]
      : null
  const AnswerIcon = report ? answerIcons[report.answer] : null

  return (
    <Card>
      <CardHeader>
        <CardTitle>{text.title}</CardTitle>
        <CardDescription>{text.hint}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">{text.stepPlayer}</span>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={players.length > 0 ? 'outline' : 'default'}
              disabled={!ready || working}
              onClick={() => void findPlayers()}
            >
              {working ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <UsersIcon data-icon="inline-start" />
              )}
              {text.findPlayers}
            </Button>
          </div>
          {report === null && <p className="text-sm text-muted-foreground">{text.notChecked}</p>}
          {report !== null && !failed && players.length === 0 && (
            <p className="text-sm text-muted-foreground">{text.noPlayers}</p>
          )}
          {players.length > 0 && (
            <div className="flex flex-col divide-y rounded-lg border">
              {players.map((entry, index) => (
                <button
                  key={entry.user}
                  type="button"
                  className={`flex flex-wrap items-center gap-3 px-4 py-2 text-left text-sm ${
                    player?.user === entry.user ? 'bg-muted' : ''
                  }`}
                  onClick={() => setPlayer(entry)}
                >
                  <span className="flex-1 font-medium">
                    {formatMessage(text.player, { number: (index + 1).toLocaleString(locale) })}
                  </span>
                  <span className="text-muted-foreground">{entry.user}</span>
                  <Badge variant="secondary">{entry.party ? text.party : text.session}</Badge>
                  {player?.user === entry.user && <CircleCheckIcon className="size-4" />}
                </button>
              ))}
            </div>
          )}
          {players.length > 0 && <p className="text-sm text-muted-foreground">{text.selfHint}</p>}
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">{text.stepItem}</span>
          <Input
            value={query}
            placeholder={text.search}
            onChange={(event) => setQuery(event.target.value)}
          />
          {found.length > 0 && (
            <div className="flex max-h-56 flex-col divide-y overflow-auto rounded-lg border">
              {found.map((entry) => (
                <button
                  key={entry.entryKey}
                  type="button"
                  className="flex items-center gap-3 px-4 py-2 text-left text-sm"
                  onClick={() => {
                    setItem(entry)
                    setQuery('')
                  }}
                >
                  <GameIcon locator={entry.icon} size="sm" />
                  <span className="min-w-0 flex-1 truncate" title={entry.gameId}>
                    {entry.name || entry.gameId}
                  </span>
                </button>
              ))}
            </div>
          )}
          {item && (
            <div className="flex flex-wrap items-center gap-3 rounded-lg border px-4 py-2 text-sm">
              <GameIcon locator={item.icon} size="sm" />
              <span className="min-w-0 flex-1 truncate font-medium" title={item.gameId}>
                {item.name || item.gameId}
              </span>
              <span className="text-muted-foreground">{text.amount}</span>
              <Input
                className="w-24"
                type="number"
                min={1}
                max={giftAmountLimit}
                value={amount}
                onChange={(event) =>
                  setAmount(
                    Math.min(
                      giftAmountLimit,
                      Math.max(1, Math.trunc(Number(event.target.value)) || 1)
                    )
                  )
                }
              />
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            disabled={!ready || working || !player || !item}
            onClick={() => setConfirming(true)}
          >
            <GiftIcon data-icon="inline-start" />
            {text.send}
          </Button>
          {report && AnswerIcon && report.answer !== 'none' && (
            <Badge variant="secondary" className={answerTones[report.answer]}>
              <AnswerIcon />
              {text.answers[report.answer as Exclude<GiftAnswer, 'none'>]}
            </Badge>
          )}
        </div>
        {refusal && (
          <Alert>
            <CircleAlertIcon />
            <AlertTitle>{refusal}</AlertTitle>
          </Alert>
        )}
        {result && failed && !refusal && (
          <Alert variant={result.outcome === 'failed' ? 'destructive' : 'default'}>
            <CircleAlertIcon />
            <AlertTitle>{delivery.outcome[result.outcome]}</AlertTitle>
            <AlertDescription>
              {reason && reason in delivery.state
                ? formatMessage(delivery.state[reason], { id: '' })
                : delivery.outcomeHint[result.outcome]}
            </AlertDescription>
          </Alert>
        )}
        <AlertDialog open={confirming} onOpenChange={setConfirming}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{delivery.confirmTitle}</AlertDialogTitle>
              <AlertDialogDescription>
                {formatMessage(text.confirm, {
                  amount: amount.toLocaleString(locale),
                  item: item?.name || item?.gameId || '',
                  player: player?.user ?? ''
                })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{delivery.cancel}</AlertDialogCancel>
              <AlertDialogAction onClick={() => void send()}>{text.send}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}
