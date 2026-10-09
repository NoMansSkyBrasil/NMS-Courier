import { useEffect, useState } from 'react'
import { CircleAlertIcon, CircleCheckIcon, CircleHelpIcon, SendIcon } from 'lucide-react'
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
import { GameIcon } from '@renderer/components/game-icon'
import { Input } from '@renderer/components/ui/input'
import { Spinner } from '@renderer/components/ui/spinner'
import { Switch } from '@renderer/components/ui/switch'
import { formatMessage, useLocale } from '@renderer/i18n/locale'
import type { DeliveryStateId } from '@renderer/i18n/messages'
import { readNotifyPreference } from '@renderer/hooks/use-notify-preference'
import { glyphDigits, glyphIcon } from '../../../shared/portal-address'

type BridgeStatus = Awaited<ReturnType<typeof window.nms.getResearchBridgeStatus>>
type DeliveryResult = Awaited<ReturnType<typeof window.nms.discoverGlyphs>>

const glyphCount = glyphDigits.length
const outcomeIcons = {
  completed: CircleCheckIcon,
  unknown: CircleHelpIcon,
  failed: CircleAlertIcon,
  refused: CircleAlertIcon
} as const

// Discovers portal glyphs through the game's own reward: all sixteen at once, or the next ones in
// the game's order. The game has no reward for a chosen glyph.
export function GlyphsCard(): React.JSX.Element {
  const { copy } = useLocale()
  const text = copy.glyphs
  const delivery = copy.delivery
  const [status, setStatus] = useState<BridgeStatus | null>(null)
  const [all, setAll] = useState(true)
  const [count, setCount] = useState(1)
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
    const timer = window.setInterval(refresh, 5000)
    return () => {
      active = false
      window.clearInterval(timer)
    }
  }, [])

  const send = async (): Promise<void> => {
    setConfirming(false)
    setSending(true)
    try {
      setResult(
        await window.nms.discoverGlyphs({
          count: all ? null : count,
          notify: readNotifyPreference()
        })
      )
    } finally {
      setSending(false)
    }
  }

  const valid = all || (Number.isInteger(count) && count >= 1 && count <= glyphCount)
  const ready = status?.state === 'ready'
  const stateText = status
    ? formatMessage(delivery.state[status.state], { id: status.processId ?? '' })
    : delivery.state.unavailable
  const reason = result?.reason as DeliveryStateId | null | undefined
  const OutcomeIcon = result ? outcomeIcons[result.outcome] : null

  return (
    <Card>
      <CardHeader>
        <CardTitle>{delivery.title}</CardTitle>
        <CardDescription>{text.hint}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">{stateText}</p>
        <div className="flex flex-wrap gap-2" aria-label={text.order}>
          {glyphDigits.map((digit, index) => (
            <div
              key={digit}
              className="flex flex-col items-center gap-1 rounded-lg border p-2 text-xs text-muted-foreground"
            >
              <GameIcon locator={glyphIcon(digit)} size="lg" />
              {index + 1}
            </div>
          ))}
        </div>
        <FieldGroup>
          <Field orientation="horizontal">
            <FieldContent>
              <FieldLabel htmlFor="glyphs-all">{text.all}</FieldLabel>
              <FieldDescription>{text.allHint}</FieldDescription>
            </FieldContent>
            <Switch id="glyphs-all" checked={all} onCheckedChange={setAll} />
          </Field>
          {!all && (
            <Field orientation="responsive">
              <FieldContent>
                <FieldLabel htmlFor="glyphs-count">{text.count}</FieldLabel>
                <FieldDescription>
                  {formatMessage(text.countHint, { max: glyphCount })}
                </FieldDescription>
              </FieldContent>
              <Input
                id="glyphs-count"
                type="number"
                min={1}
                max={glyphCount}
                step={1}
                value={count}
                onChange={(event) => setCount(Math.trunc(Number(event.target.value)) || 0)}
              />
            </Field>
          )}
        </FieldGroup>
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
            <pre className="max-h-64 overflow-auto rounded-lg bg-muted p-3 text-xs">
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
      <CardFooter>
        <AlertDialog open={confirming} onOpenChange={setConfirming}>
          <AlertDialogTrigger render={<Button disabled={!ready || sending || !valid} />}>
            {sending ? <Spinner data-icon="inline-start" /> : <SendIcon data-icon="inline-start" />}
            {sending ? delivery.sending : text.action}
          </AlertDialogTrigger>
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
