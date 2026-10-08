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
import { Field, FieldContent, FieldGroup, FieldLabel } from '@renderer/components/ui/field'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/components/ui/select'
import { Spinner } from '@renderer/components/ui/spinner'
import { formatMessage, useLocale } from '@renderer/i18n/locale-provider'
import type { DeliveryStateId } from '@renderer/i18n/messages'

type BridgeStatus = Awaited<ReturnType<typeof window.nms.getResearchBridgeStatus>>
type DeliveryResult = Awaited<ReturnType<typeof window.nms.deliverCurrency>>
type Currency = 'units' | 'nanites' | 'quicksilver'

// The fixed amounts of the currency rewards data file, as figures for display.
const amounts: Record<Currency, ReadonlyArray<{ value: string; figure: number }>> = {
  units: [
    { value: '1M', figure: 1_000_000 },
    { value: '10M', figure: 10_000_000 },
    { value: '100M', figure: 100_000_000 },
    { value: '1B', figure: 1_000_000_000 }
  ],
  nanites: [
    { value: '1K', figure: 1_000 },
    { value: '10K', figure: 10_000 },
    { value: '100K', figure: 100_000 },
    { value: '1M', figure: 1_000_000 }
  ],
  quicksilver: [
    { value: '1K', figure: 1_000 },
    { value: '10K', figure: 10_000 },
    { value: '100K', figure: 100_000 },
    { value: '1M', figure: 1_000_000 }
  ]
}
const outcomeIcons = {
  completed: CircleCheckIcon,
  unknown: CircleHelpIcon,
  failed: CircleAlertIcon,
  refused: CircleAlertIcon
} as const

// Adds units, nanites or quicksilver to the loaded slot through the game's own reward routine:
// choose the currency and one of the fixed amounts, confirm, one request.
export function CurrencyCard(): React.JSX.Element {
  const { copy, locale } = useLocale()
  const text = copy.delivery
  const [status, setStatus] = useState<BridgeStatus | null>(null)
  const [currency, setCurrency] = useState<Currency>('units')
  const [amount, setAmount] = useState('1M')
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
      setResult(await window.nms.deliverCurrency({ currency, amount }))
    } finally {
      setSending(false)
    }
  }

  const currencies = (Object.keys(amounts) as Currency[]).map((value) => ({
    value,
    label: text.currencyName[value]
  }))
  const amountItems = amounts[currency].map((entry) => ({
    value: entry.value,
    label: entry.figure.toLocaleString(locale)
  }))
  const ready = status?.state === 'ready'
  const stateText = status
    ? formatMessage(text.state[status.state], { id: status.processId ?? '' })
    : text.state.unavailable
  const reason = result?.reason as DeliveryStateId | null | undefined
  const OutcomeIcon = result ? outcomeIcons[result.outcome] : null

  return (
    <Card>
      <CardHeader>
        <CardTitle>{text.title}</CardTitle>
        <CardDescription>{text.currencyHint}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">{stateText}</p>
        <FieldGroup>
          <Field orientation="responsive">
            <FieldContent>
              <FieldLabel htmlFor="currency-kind">{text.currencyLabel}</FieldLabel>
            </FieldContent>
            <Select
              items={currencies}
              value={currency}
              onValueChange={(value) => {
                setCurrency(value as Currency)
                setAmount(amounts[value as Currency][0].value)
              }}
            >
              <SelectTrigger id="currency-kind">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {currencies.map((entry) => (
                    <SelectItem key={entry.value} value={entry.value}>
                      {entry.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Field orientation="responsive">
            <FieldContent>
              <FieldLabel htmlFor="currency-amount">{text.itemsAmount}</FieldLabel>
            </FieldContent>
            <Select
              items={amountItems}
              value={amount}
              onValueChange={(value) => setAmount(value as string)}
            >
              <SelectTrigger id="currency-amount">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {amountItems.map((entry) => (
                    <SelectItem key={entry.value} value={entry.value}>
                      {entry.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        </FieldGroup>
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
          <AlertDialogTrigger render={<Button disabled={!ready || sending} />}>
            {sending ? <Spinner data-icon="inline-start" /> : <SendIcon data-icon="inline-start" />}
            {sending ? text.sending : text.action}
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{text.confirmTitle}</AlertDialogTitle>
              <AlertDialogDescription>{text.confirmSlot}</AlertDialogDescription>
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
