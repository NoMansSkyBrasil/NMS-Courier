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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/components/ui/select'
import { Spinner } from '@renderer/components/ui/spinner'
import { Switch } from '@renderer/components/ui/switch'
import { formatMessage, useLocale } from '@renderer/i18n/locale-provider'
import type { DeliveryStateId } from '@renderer/i18n/messages'

type BridgeStatus = Awaited<ReturnType<typeof window.nms.getResearchBridgeStatus>>
type DeliveryResult = Awaited<ReturnType<typeof window.nms.deliverEquipment>>
import type { EquipmentArea } from '@renderer/features/equipment-areas'
type Action = 'grid' | 'classStep' | 'offer' | 'build'

// What each area can ask the bridge for; the main process checks the same table again.
const areaActions: Record<EquipmentArea, readonly Action[]> = {
  exosuit: ['grid'],
  starships: ['grid', 'classStep'],
  multitools: ['grid', 'classStep'],
  freighters: ['offer'],
  corvettes: ['build']
}
const classes = ['S', 'A', 'B', 'C']
const shipSlots = 12
const outcomeIcons = {
  completed: CircleCheckIcon,
  unknown: CircleHelpIcon,
  failed: CircleAlertIcon,
  refused: CircleAlertIcon
} as const

// Sends one request about something the player owns or is offered: inventory grid and supercharged
// slots in place, a class step, a freighter offer or a corvette build, with the chosen options.
export function EquipmentCard({ area }: { area: EquipmentArea }): React.JSX.Element {
  const { copy } = useLocale()
  const text = copy.delivery
  const [status, setStatus] = useState<BridgeStatus | null>(null)
  const [action, setAction] = useState<Action>(areaActions[area][0])
  const [slots, setSlots] = useState(true)
  const [supercharge, setSupercharge] = useState(true)
  const [extendedTechnology, setExtendedTechnology] = useState(false)
  const [itemClass, setItemClass] = useState('S')
  const [shipIndex, setShipIndex] = useState(-1)
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
        await window.nms.deliverEquipment({
          area,
          action,
          slots,
          supercharge,
          extendedTechnology,
          itemClass,
          shipIndex
        })
      )
    } finally {
      setSending(false)
    }
  }

  const actions = areaActions[area].map((value) => ({ value, label: text.equipAction[value] }))
  const classItems = classes.map((value) => ({ value, label: value }))
  const targets = [
    { value: '-1', label: text.equipTargetCurrent },
    ...Array.from({ length: shipSlots }, (_, index) => ({
      value: String(index),
      label: formatMessage(text.equipTargetSlot, { number: index + 1 })
    }))
  ]
  const hasOptions = action !== 'classStep'
  const hasClass = action === 'offer' || action === 'build'
  const ready = status?.state === 'ready'
  const sendable = ready && !sending && (action !== 'grid' || slots || supercharge)
  const stateText = status
    ? formatMessage(text.state[status.state], { id: status.processId ?? '' })
    : text.state.unavailable
  const reason = result?.reason as DeliveryStateId | null | undefined
  const OutcomeIcon = result ? outcomeIcons[result.outcome] : null

  return (
    <Card>
      <CardHeader>
        <CardTitle>{text.title}</CardTitle>
        <CardDescription>{text.equipActionHint[action]}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">{stateText}</p>
        <FieldGroup>
          {actions.length > 1 && (
            <Field orientation="responsive">
              <FieldContent>
                <FieldLabel htmlFor="equipment-action">{text.equipActionLabel}</FieldLabel>
              </FieldContent>
              <Select
                items={actions}
                value={action}
                onValueChange={(value) => setAction(value as Action)}
              >
                <SelectTrigger id="equipment-action">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {actions.map((entry) => (
                      <SelectItem key={entry.value} value={entry.value}>
                        {entry.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          )}
          {area === 'starships' && action === 'grid' && (
            <Field orientation="responsive">
              <FieldContent>
                <FieldLabel htmlFor="equipment-target">{text.equipTarget}</FieldLabel>
              </FieldContent>
              <Select
                items={targets}
                value={String(shipIndex)}
                onValueChange={(value) => setShipIndex(Number(value))}
              >
                <SelectTrigger id="equipment-target">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {targets.map((entry) => (
                      <SelectItem key={entry.value} value={entry.value}>
                        {entry.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          )}
          {hasClass && (
            <Field orientation="responsive">
              <FieldContent>
                <FieldLabel htmlFor="equipment-class">{text.equipClass}</FieldLabel>
              </FieldContent>
              <Select
                items={classItems}
                value={itemClass}
                onValueChange={(value) => setItemClass(value as string)}
              >
                <SelectTrigger id="equipment-class">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {classItems.map((entry) => (
                      <SelectItem key={entry.value} value={entry.value}>
                        {entry.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          )}
          {hasOptions && (
            <>
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldLabel htmlFor="equipment-slots">{text.equipSlots}</FieldLabel>
                  <FieldDescription>{text.equipSlotsHint}</FieldDescription>
                </FieldContent>
                <Switch id="equipment-slots" checked={slots} onCheckedChange={setSlots} />
              </Field>
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldLabel htmlFor="equipment-supercharge">{text.equipSupercharge}</FieldLabel>
                  <FieldDescription>{text.equipSuperchargeHint}</FieldDescription>
                </FieldContent>
                <Switch
                  id="equipment-supercharge"
                  checked={supercharge}
                  onCheckedChange={setSupercharge}
                />
              </Field>
            </>
          )}
          {hasClass && (
            <Field orientation="horizontal">
              <FieldContent>
                <FieldLabel htmlFor="equipment-extended">{text.equipExtended}</FieldLabel>
                <FieldDescription>{text.equipExtendedHint}</FieldDescription>
              </FieldContent>
              <Switch
                id="equipment-extended"
                checked={slots && extendedTechnology}
                disabled={!slots}
                onCheckedChange={setExtendedTechnology}
              />
            </Field>
          )}
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
          <AlertDialogTrigger render={<Button disabled={!sendable} />}>
            {sending ? <Spinner data-icon="inline-start" /> : <SendIcon data-icon="inline-start" />}
            {sending ? text.sending : text.equipAction[action]}
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
