import { useEffect, useState } from 'react'
import {
  BatteryChargingIcon,
  CircleAlertIcon,
  CircleCheckIcon,
  CircleHelpIcon,
  WrenchIcon
} from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@renderer/components/ui/alert'
import { Badge } from '@renderer/components/ui/badge'
import { Button } from '@renderer/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@renderer/components/ui/card'
import { Field, FieldContent, FieldDescription, FieldLabel } from '@renderer/components/ui/field'
import { Input } from '@renderer/components/ui/input'
import { Spinner } from '@renderer/components/ui/spinner'
import { Switch } from '@renderer/components/ui/switch'
import { tones } from '@renderer/features/tones'
import { readNotifyPreference } from '@renderer/hooks/use-notify-preference'
import { formatMessage, useLocale } from '@renderer/i18n/locale'
import type { DeliveryStateId } from '@renderer/i18n/messages'
import { repairGroupIds, type AutoRecharge, type RepairGroup } from '../../../shared/upkeep'

type BridgeStatus = Awaited<ReturnType<typeof window.nms.getResearchBridgeStatus>>
type DeliveryResult = Awaited<ReturnType<typeof window.nms.recharge>>

const outcomeIcons = {
  completed: CircleCheckIcon,
  unknown: CircleHelpIcon,
  failed: CircleAlertIcon,
  refused: CircleAlertIcon
} as const

// Repairs every damaged technology of an inventory and recharges technologies, by the game's own
// rewards; the recharge can also run by itself while the application is open.
export function UpkeepCard(): React.JSX.Element {
  const { copy } = useLocale()
  const text = copy.upkeep
  const delivery = copy.delivery
  const [status, setStatus] = useState<BridgeStatus | null>(null)
  const [working, setWorking] = useState(false)
  const [result, setResult] = useState<DeliveryResult | null>(null)
  const [auto, setAuto] = useState<AutoRecharge>({ enabled: false, minutes: 10, whenLow: true })

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
      .getAutoRecharge()
      .then((next) => active && setAuto(next))
      .catch(() => undefined)
    const timer = window.setInterval(refresh, 5000)
    return () => {
      active = false
      window.clearInterval(timer)
    }
  }, [])

  const run = async (action: () => Promise<DeliveryResult>): Promise<void> => {
    setWorking(true)
    try {
      setResult(await action())
    } finally {
      setWorking(false)
    }
  }
  const repair = (groups: RepairGroup[]): Promise<void> =>
    run(() => window.nms.repairInventories({ groups }, readNotifyPreference()))
  const changeAuto = (changes: Partial<AutoRecharge>): void => {
    const minutes = Math.min(240, Math.max(1, Math.round(changes.minutes ?? auto.minutes) || 1))
    const next = { ...auto, ...changes, minutes }
    setAuto(next)
    void window.nms.setAutoRecharge(next)
  }

  const ready = status?.state === 'ready'
  const reason = result?.reason as DeliveryStateId | null | undefined
  const OutcomeIcon = result ? outcomeIcons[result.outcome] : null

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <WrenchIcon className="size-4" />
            {text.repairTitle}
          </CardTitle>
          <CardDescription>{text.repairHint}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button disabled={!ready || working} onClick={() => void repair([...repairGroupIds])}>
            {working ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <WrenchIcon data-icon="inline-start" />
            )}
            {text.repairAll}
          </Button>
          {repairGroupIds.map((group) => (
            <Button
              key={group}
              variant="outline"
              disabled={!ready || working}
              onClick={() => void repair([group])}
            >
              {text.inventories[group]}
            </Button>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BatteryChargingIcon className="size-4" />
            {text.rechargeTitle}
          </CardTitle>
          <CardDescription>{text.rechargeHint}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div>
            <Button
              disabled={!ready || working}
              onClick={() => void run(() => window.nms.recharge(100, readNotifyPreference()))}
            >
              {working ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <BatteryChargingIcon data-icon="inline-start" />
              )}
              {text.rechargeNow}
            </Button>
          </div>
          <Field orientation="horizontal">
            <FieldContent>
              <FieldLabel htmlFor="upkeep-auto">{text.autoTitle}</FieldLabel>
              <FieldDescription>{text.autoHint}</FieldDescription>
            </FieldContent>
            {auto.enabled && (
              <Badge variant="secondary" className={tones.good}>
                {text.autoOn}
              </Badge>
            )}
            <Switch
              id="upkeep-auto"
              checked={auto.enabled}
              onCheckedChange={(checked) => changeAuto({ enabled: checked })}
            />
          </Field>
          <Field orientation="horizontal">
            <FieldContent>
              <FieldLabel htmlFor="upkeep-minutes">{text.autoEvery}</FieldLabel>
            </FieldContent>
            <Input
              id="upkeep-minutes"
              type="number"
              min={1}
              max={240}
              className="w-24"
              value={auto.minutes}
              onChange={(event) => changeAuto({ minutes: Number(event.target.value) })}
            />
          </Field>
          <Field orientation="horizontal">
            <FieldContent>
              <FieldLabel htmlFor="upkeep-low">{text.autoLow}</FieldLabel>
            </FieldContent>
            <Switch
              id="upkeep-low"
              checked={auto.whenLow}
              onCheckedChange={(checked) => changeAuto({ whenLow: checked })}
            />
          </Field>
        </CardContent>
      </Card>
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
    </div>
  )
}
