import { useEffect, useMemo, useState } from 'react'
import {
  BanIcon,
  CircleAlertIcon,
  CircleCheckIcon,
  CircleHelpIcon,
  ClockIcon,
  SearchIcon,
  WrenchIcon
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
import { Spinner } from '@renderer/components/ui/spinner'
import { formatMessage, useLocale } from '@renderer/i18n/locale'
import type { DeliveryStateId } from '@renderer/i18n/messages'
import {
  inventoryGroup,
  inventoryKey,
  type WaitingSlot,
  type WaitingState
} from '../../../shared/waiting-technology'

type BridgeStatus = Awaited<ReturnType<typeof window.nms.getResearchBridgeStatus>>
type Report = Awaited<ReturnType<typeof window.nms.listWaitingTechnologies>>
type Entry = Report['entries'][number]

const outcomeIcons = {
  completed: CircleCheckIcon,
  unknown: CircleHelpIcon,
  failed: CircleAlertIcon,
  refused: CircleAlertIcon
} as const
// Colours that say at a glance what happened to a technology; each is shown with its word.
const stateTones: Record<WaitingState, string> = {
  waiting: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  finished: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  still_waiting: 'bg-red-500/15 text-red-700 dark:text-red-400',
  blocked: '',
  unknown_id: ''
}
const stateIcons: Record<WaitingState, typeof ClockIcon> = {
  waiting: ClockIcon,
  finished: CircleCheckIcon,
  still_waiting: CircleAlertIcon,
  blocked: BanIcon,
  unknown_id: CircleHelpIcon
}
const slotOf = (entry: Entry): WaitingSlot => ({
  choice: entry.choice,
  owner: entry.owner,
  x: entry.x,
  y: entry.y
})

// Lists the technologies that still ask for components in every inventory of the loaded save and
// has the game finish one, the ones of an inventory, or all of them.
export function PendingTechCard(): React.JSX.Element {
  const { copy, locale } = useLocale()
  const text = copy.pendingTech
  const delivery = copy.delivery
  const [status, setStatus] = useState<BridgeStatus | null>(null)
  const [report, setReport] = useState<Report | null>(null)
  const [working, setWorking] = useState(false)
  // What the confirmation is for: null is every waiting technology.
  const [target, setTarget] = useState<{ slots: WaitingSlot[] | null; count: number } | null>(null)

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

  const entries = useMemo(() => report?.entries ?? [], [report])
  const waiting = entries.filter((entry) => entry.state === 'waiting')
  const inventories = useMemo(() => {
    const byKey = new Map<string, Entry[]>()
    for (const entry of entries) {
      const key = inventoryKey(entry)
      byKey.set(key, [...(byKey.get(key) ?? []), entry])
    }
    return [...byKey.values()]
  }, [entries])

  const check = async (): Promise<void> => {
    setWorking(true)
    try {
      setReport(await window.nms.listWaitingTechnologies(locale))
    } finally {
      setWorking(false)
    }
  }

  const finish = async (): Promise<void> => {
    const wanted = target
    setTarget(null)
    if (!wanted) return
    setWorking(true)
    try {
      setReport(await window.nms.finishTechnologies({ slots: wanted.slots }, locale))
    } finally {
      setWorking(false)
    }
  }

  // An exocraft is named as the game names it; a ship by its place in the collection.
  const inventoryName = (entry: Entry): string => {
    const group = inventoryGroup(entry.choice)
    const exocraft =
      group === 'exocraft'
        ? (text.exocraft as Record<string, string>)[String(entry.owner)]
        : undefined
    return (
      exocraft ??
      formatMessage(text.groups[group], { number: (entry.owner + 1).toLocaleString(locale) })
    )
  }

  const ready = status?.state === 'ready'
  const result = report?.delivery ?? null
  const reason = result?.reason as DeliveryStateId | null | undefined
  const OutcomeIcon = result ? outcomeIcons[result.outcome] : null
  const failed = result !== null && result.outcome !== 'completed'

  return (
    <Card>
      <CardHeader>
        <CardTitle>{text.title}</CardTitle>
        <CardDescription>{text.hint}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button disabled={!ready || working} onClick={() => void check()}>
            {working ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <SearchIcon data-icon="inline-start" />
            )}
            {text.check}
          </Button>
          {waiting.length > 0 && (
            <Button
              variant="outline"
              disabled={!ready || working}
              onClick={() => setTarget({ slots: null, count: waiting.length })}
            >
              <WrenchIcon data-icon="inline-start" />
              {formatMessage(text.finishAll, { count: waiting.length.toLocaleString(locale) })}
            </Button>
          )}
        </div>
        {report === null && <p className="text-sm text-muted-foreground">{text.notChecked}</p>}
        {report !== null && !failed && entries.length === 0 && (
          <Alert>
            <CircleCheckIcon />
            <AlertTitle>{text.none}</AlertTitle>
          </Alert>
        )}
        {report?.truncated && <p className="text-sm text-muted-foreground">{text.truncated}</p>}
        {inventories.map((group) => {
          const groupWaiting = group.filter((entry) => entry.state === 'waiting')
          return (
            <div key={inventoryKey(group[0])} className="rounded-lg border">
              <div className="flex flex-wrap items-center gap-2 border-b px-4 py-2">
                <span className="flex-1 font-medium">{inventoryName(group[0])}</span>
                <Badge variant="secondary">{group.length.toLocaleString(locale)}</Badge>
                {groupWaiting.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!ready || working}
                    onClick={() =>
                      setTarget({ slots: groupWaiting.map(slotOf), count: groupWaiting.length })
                    }
                  >
                    {text.finishGroup}
                  </Button>
                )}
              </div>
              <div className="flex flex-col divide-y">
                {group.map((entry) => {
                  const StateIcon = stateIcons[entry.state]
                  return (
                    <div
                      key={`${entry.choice}:${entry.owner}:${entry.x}:${entry.y}`}
                      className="flex flex-wrap items-center gap-3 px-4 py-2 text-sm"
                    >
                      <span className="min-w-0 flex-1 truncate" title={entry.id}>
                        {entry.name || entry.id}
                      </span>
                      <Badge variant="secondary" className={stateTones[entry.state]}>
                        <StateIcon />
                        {text.states[entry.state]}
                      </Badge>
                      {entry.state === 'waiting' && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!ready || working}
                          onClick={() => setTarget({ slots: [slotOf(entry)], count: 1 })}
                        >
                          <WrenchIcon data-icon="inline-start" />
                          {text.finishOne}
                        </Button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
        {entries.some((entry) => entry.state === 'blocked' || entry.state === 'unknown_id') && (
          <p className="text-sm text-muted-foreground">{text.blockedHint}</p>
        )}
        {result && OutcomeIcon && failed && (
          <Alert variant={result.outcome === 'failed' ? 'destructive' : 'default'}>
            <OutcomeIcon />
            <AlertTitle>{delivery.outcome[result.outcome]}</AlertTitle>
            <AlertDescription>
              {reason && reason in delivery.state
                ? formatMessage(delivery.state[reason], { id: '' })
                : delivery.outcomeHint[result.outcome]}
            </AlertDescription>
          </Alert>
        )}
        <AlertDialog open={target !== null} onOpenChange={(open) => !open && setTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{delivery.confirmTitle}</AlertDialogTitle>
              <AlertDialogDescription>
                {target
                  ? formatMessage(text.confirm, { count: target.count.toLocaleString(locale) })
                  : ''}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{delivery.cancel}</AlertDialogCancel>
              <AlertDialogAction onClick={() => void finish()}>{text.finishOne}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}
