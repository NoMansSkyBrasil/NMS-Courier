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
import { Spinner } from '@renderer/components/ui/spinner'
import { DeliverySelection, type DeliveryOption } from '@renderer/components/delivery-selection'
import { WordMatrix } from '@renderer/components/word-matrix'
import type { Feature } from '@renderer/features'
import { formatMessage, useLocale } from '@renderer/i18n/locale'
import type { DeliveryStateId } from '@renderer/i18n/messages'
import { readNotifyPreference } from '@renderer/hooks/use-notify-preference'

type BridgeStatus = Awaited<ReturnType<typeof window.nms.getResearchBridgeStatus>>
type DeliveryResult = Awaited<ReturnType<typeof window.nms.deliver>>

const outcomeIcons = {
  completed: CircleCheckIcon,
  unknown: CircleHelpIcon,
  failed: CircleAlertIcon,
  refused: CircleAlertIcon
} as const

// Sends one area to the running game through the research bridge: state, a confirmation that names
// what changes, one request, and the game's answer. It never sends twice by itself.
export function DeliveryCard({ feature }: { feature: Feature }): React.JSX.Element {
  const { copy, locale } = useLocale()
  const text = copy.delivery
  const [status, setStatus] = useState<BridgeStatus | null>(null)
  // What the open confirmation would send: the whole area or the chosen entries.
  const [confirming, setConfirming] = useState<'all' | 'chosen' | null>(null)
  const [options, setOptions] = useState<DeliveryOption[]>([])
  const [chosen, setChosen] = useState<ReadonlySet<string>>(new Set())

  useEffect(() => {
    let active = true
    void window.nms
      .getDeliveryOptions(feature.id, locale)
      .then((next) => active && setOptions(next))
      .catch(() => active && setOptions([]))
    return () => {
      active = false
    }
  }, [feature.id, locale])
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
    const timer = window.setInterval(refresh, 5000)
    return () => {
      active = false
      window.clearInterval(timer)
    }
  }, [])

  const send = async (): Promise<void> => {
    const mode = confirming
    setConfirming(null)
    setSending(true)
    try {
      setResult(
        await window.nms.deliver(
          feature.id,
          mode === 'chosen' ? [...chosen] : undefined,
          readNotifyPreference()
        )
      )
    } finally {
      setSending(false)
    }
  }

  const ready = status?.state === 'ready'
  const reason = result?.reason as DeliveryStateId | null | undefined
  const OutcomeIcon = result ? outcomeIcons[result.outcome] : null

  return (
    <Card>
      <CardHeader>
        <CardTitle>{text.title}</CardTitle>
        <CardDescription>{text.hint}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {options.length > 0 &&
          // Words are a grid of word by race; every other area is a list.
          (feature.id === 'words' ? (
            <WordMatrix options={options} chosen={chosen} onChange={setChosen} />
          ) : (
            <DeliverySelection options={options} chosen={chosen} onChange={setChosen} />
          ))}
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
            <pre className="internal-name max-h-64 overflow-auto rounded-lg bg-muted p-3 text-xs">
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
      <CardFooter className="flex flex-wrap gap-2">
        <AlertDialog
          open={confirming !== null}
          onOpenChange={(open) => setConfirming(open ? 'all' : null)}
        >
          <AlertDialogTrigger render={<Button disabled={!ready || sending} />}>
            {sending ? <Spinner data-icon="inline-start" /> : <SendIcon data-icon="inline-start" />}
            {sending ? text.sending : options.length > 0 ? text.action : text.actionOne}
          </AlertDialogTrigger>
          {options.length > 0 && (
            <Button
              variant="outline"
              disabled={!ready || sending || chosen.size === 0}
              onClick={() => setConfirming('chosen')}
            >
              <ListChecksIcon data-icon="inline-start" />
              {formatMessage(text.selectAction, { count: chosen.size.toLocaleString(locale) })}
            </Button>
          )}
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{text.confirmTitle}</AlertDialogTitle>
              <AlertDialogDescription>
                {feature.scope === 'slot' ? text.confirmSlot : text.confirmAccount}
              </AlertDialogDescription>
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
