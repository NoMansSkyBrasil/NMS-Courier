import { useEffect, useState } from 'react'
import {
  CircleAlertIcon,
  CircleCheckIcon,
  CircleHelpIcon,
  ListChecksIcon,
  SendIcon
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
import { Button } from '@renderer/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@renderer/components/ui/card'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel
} from '@renderer/components/ui/field'
import { DeliverySelection, type DeliveryOption } from '@renderer/components/delivery-selection'
import { Input } from '@renderer/components/ui/input'
import { Spinner } from '@renderer/components/ui/spinner'
import { Switch } from '@renderer/components/ui/switch'
import { ToggleGroup, ToggleGroupItem } from '@renderer/components/ui/toggle-group'
import { formatMessage, useLocale } from '@renderer/i18n/locale'
import type { DeliveryStateId } from '@renderer/i18n/messages'
import { readNotifyPreference } from '@renderer/hooks/use-notify-preference'

type BridgeStatus = Awaited<ReturnType<typeof window.nms.getResearchBridgeStatus>>
type DeliveryResult = Awaited<ReturnType<typeof window.nms.raiseLevels>>
type Page = Parameters<typeof window.nms.getLevelStats>[0]
// How far to go: the next level, a number of levels, or the last level.
type Mode = 'one' | 'some' | 'all'

// A levelled stat has levels 0 to 10.
const levelTop = 10
const outcomeIcons = {
  completed: CircleCheckIcon,
  unknown: CircleHelpIcon,
  failed: CircleAlertIcon,
  refused: CircleAlertIcon
} as const

// Raises standings or journey milestones by levels through the game's own stat reward: every stat
// of the page or the chosen ones, one level, several or all the way. Nothing is ever lowered.
export function LevelsCard({ page }: { page: Page }): React.JSX.Element {
  const { copy, locale } = useLocale()
  const text = copy.levels
  const delivery = copy.delivery
  const [status, setStatus] = useState<BridgeStatus | null>(null)
  const [options, setOptions] = useState<DeliveryOption[]>([])
  const [chosen, setChosen] = useState<ReadonlySet<string>>(new Set())
  const [mode, setMode] = useState<Mode>('one')
  const [count, setCount] = useState(2)
  const [announce, setAnnounce] = useState(true)
  // What the open confirmation would send: the whole page or the chosen stats.
  const [confirming, setConfirming] = useState<'all' | 'chosen' | null>(null)
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<DeliveryResult | null>(null)

  useEffect(() => {
    let active = true
    void window.nms
      .getLevelStats(page, locale)
      .then(
        (stats) =>
          active &&
          setOptions(
            stats.map((stat) => ({
              id: stat.id,
              name: stat.name,
              // The row says whether the game announces a new level of it.
              group: `${stat.group} · ${text.message[stat.message]}`,
              icon: null
            }))
          )
      )
      .catch(() => active && setOptions([]))
    return () => {
      active = false
    }
  }, [page, locale, text.message])

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

  const levels = mode === 'one' ? 1 : mode === 'all' ? levelTop : count
  const send = async (): Promise<void> => {
    const what = confirming
    setConfirming(null)
    setSending(true)
    try {
      setResult(
        await window.nms.raiseLevels({
          page,
          stats: what === 'chosen' ? [...chosen] : null,
          levels,
          announce,
          notify: readNotifyPreference()
        })
      )
    } finally {
      setSending(false)
    }
  }

  const valid = Number.isInteger(levels) && levels >= 1 && levels <= levelTop
  const ready = status?.state === 'ready' && options.length > 0
  const stateText = status
    ? formatMessage(delivery.state[status.state], { id: status.processId ?? '' })
    : delivery.state.unavailable
  const reason = result?.reason as DeliveryStateId | null | undefined
  const OutcomeIcon = result ? outcomeIcons[result.outcome] : null

  return (
    <Card>
      <CardHeader>
        <CardTitle>{delivery.title}</CardTitle>
        <CardDescription>{text.hint[page]}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">{stateText}</p>
        <FieldGroup>
          <Field>
            <FieldLabel>{text.mode}</FieldLabel>
            <ToggleGroup
              variant="outline"
              value={[mode]}
              onValueChange={(value) => {
                if (value.length) setMode(value[0] as Mode)
              }}
              aria-label={text.mode}
            >
              <ToggleGroupItem value="one">{text.modeOne}</ToggleGroupItem>
              <ToggleGroupItem value="some">{text.modeSome}</ToggleGroupItem>
              <ToggleGroupItem value="all">{text.modeAll}</ToggleGroupItem>
            </ToggleGroup>
            <FieldDescription>{text.modeHint}</FieldDescription>
            <FieldDescription>{text.messageHint}</FieldDescription>
          </Field>
          {mode === 'some' && (
            <Field orientation="responsive">
              <FieldContent>
                <FieldLabel htmlFor={`levels-count-${page}`}>{text.count}</FieldLabel>
                <FieldDescription>
                  {formatMessage(text.countHint, { max: levelTop })}
                </FieldDescription>
              </FieldContent>
              <Input
                id={`levels-count-${page}`}
                type="number"
                min={1}
                max={levelTop}
                step={1}
                value={count}
                onChange={(event) => setCount(Math.trunc(Number(event.target.value)) || 0)}
              />
            </Field>
          )}
          <Field orientation="horizontal">
            <FieldContent>
              <FieldLabel htmlFor={`levels-announce-${page}`}>{text.announce}</FieldLabel>
              <FieldDescription>{text.announceHint}</FieldDescription>
            </FieldContent>
            <Switch
              id={`levels-announce-${page}`}
              checked={announce}
              onCheckedChange={setAnnounce}
            />
          </Field>
        </FieldGroup>
        {options.length > 0 && (
          <DeliverySelection options={options} chosen={chosen} onChange={setChosen} />
        )}
        {result && OutcomeIcon && (
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
        {result && result.steps.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">{delivery.result}</span>
            <pre className="internal-name max-h-64 overflow-auto rounded-lg bg-muted p-3 text-xs">
              {result.steps.map((step) => step.lines.join('\n')).join('\n\n')}
            </pre>
          </div>
        )}
        {result?.backupPath && (
          <p className="text-xs break-all text-muted-foreground">
            {formatMessage(delivery.backup, { path: result.backupPath })}
          </p>
        )}
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        <AlertDialog
          open={confirming !== null}
          onOpenChange={(open) => setConfirming(open ? 'all' : null)}
        >
          <AlertDialogTrigger render={<Button disabled={!ready || sending || !valid} />}>
            {sending ? <Spinner data-icon="inline-start" /> : <SendIcon data-icon="inline-start" />}
            {sending ? delivery.sending : text.action}
          </AlertDialogTrigger>
          <Button
            variant="outline"
            disabled={!ready || sending || !valid || chosen.size === 0}
            onClick={() => setConfirming('chosen')}
          >
            <ListChecksIcon data-icon="inline-start" />
            {formatMessage(text.actionChosen, { count: chosen.size.toLocaleString(locale) })}
          </Button>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{delivery.confirmTitle}</AlertDialogTitle>
              <AlertDialogDescription>{delivery.confirmSlot}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{delivery.cancel}</AlertDialogCancel>
              <AlertDialogAction onClick={() => void send()}>{delivery.confirm}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  )
}
