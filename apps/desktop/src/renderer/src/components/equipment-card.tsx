import { useEffect, useState } from 'react'
import type { WorkshopToolKind } from '../../../shared/model-workshop'
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
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList
} from '@renderer/components/ui/combobox'
import { Input } from '@renderer/components/ui/input'
import { Spinner } from '@renderer/components/ui/spinner'
import { Switch } from '@renderer/components/ui/switch'
import { formatMessage, useLocale } from '@renderer/i18n/locale'
import type { DeliveryStateId, SectionId } from '@renderer/i18n/messages'

type BridgeStatus = Awaited<ReturnType<typeof window.nms.getResearchBridgeStatus>>
type DeliveryResult = Awaited<ReturnType<typeof window.nms.deliverEquipment>>
import { hashParameters } from '@renderer/features'
import type { EquipmentArea } from '@renderer/features/equipment-areas'
type Action = 'grid' | 'classStep' | 'slotReward' | 'offer' | 'build'

// What each area can ask the bridge for; the main process checks the same table again.
const areaActions: Record<EquipmentArea, readonly Action[]> = {
  exosuit: ['grid', 'slotReward'],
  starships: ['offer', 'grid', 'classStep', 'slotReward'],
  multitools: ['offer', 'grid', 'classStep', 'slotReward'],
  freighters: ['offer', 'slotReward'],
  corvettes: ['build']
}
const classes = ['S', 'A', 'B', 'C']
// Actions that give something new; the others change what the player already owns.
const obtainActions: readonly Action[] = ['offer', 'build']
// Kinds of starship and multi-tool the bridge can offer; the seed decides the look within a kind.
const shipModels = [
  'fighter',
  'hauler',
  'explorer',
  'shuttle',
  'solar',
  'exotic',
  'living',
  'interceptor'
] as const
const toolModels = [
  'pistol',
  'rifle',
  'experimental',
  'alien',
  'staff',
  'royal',
  'sentinel',
  'sentinelb',
  'atlas',
  'switch',
  'retro',
  'swarm',
  'staffnpc',
  'staffruin',
  'staffbone',
  'atlasstaff'
] as const
// The models that are one scene of the workshop each take the workshop's name for it.
const toolModelKind: Partial<Record<(typeof toolModels)[number], WorkshopToolKind>> = {
  royal: 'royal',
  sentinel: 'sentinel',
  sentinelb: 'sentinelB',
  atlas: 'atlas',
  switch: 'switch',
  retro: 'retro',
  swarm: 'swarm',
  staffnpc: 'staffNpc',
  staffruin: 'staffRuin',
  staffbone: 'staffBone',
  atlasstaff: 'atlasSceptre'
}

// Freighter models a player can own, by the game scene of each; the first leaves the choice to the
// game. Only the pirate model was delivered so far (2026-10-06).
const industrial = 'MODELS/COMMON/SPACECRAFT/INDUSTRIAL/'
const freighterModels = [
  { id: 'default', scene: '' },
  { id: 'regular', scene: `${industrial}FREIGHTER_PROC.SCENE.MBIN` },
  { id: 'small', scene: `${industrial}FREIGHTERSMALL_PROC.SCENE.MBIN` },
  { id: 'tiny', scene: `${industrial}FREIGHTERTINY_PROC.SCENE.MBIN` },
  { id: 'capital', scene: `${industrial}CAPITALFREIGHTER_PROC.SCENE.MBIN` },
  { id: 'pirate', scene: `${industrial}PIRATEFREIGHTER.SCENE.MBIN` }
] as const
const shipSlots = 12
const outcomeIcons = {
  completed: CircleCheckIcon,
  unknown: CircleHelpIcon,
  failed: CircleAlertIcon,
  refused: CircleAlertIcon
} as const

// Sends one request about something the player owns or is offered: inventory grid and supercharged
// slots in place, a class step, a freighter offer or a corvette build, with the chosen options.
export function EquipmentCard({
  area,
  section
}: {
  area: EquipmentArea
  section: SectionId | null
}): React.JSX.Element {
  const { copy } = useLocale()
  const text = copy.delivery
  const [status, setStatus] = useState<BridgeStatus | null>(null)
  // A section shows only its own actions: getting a new one, or upgrading the one owned.
  const available = areaActions[area].filter(
    (value) => section === null || obtainActions.includes(value) === (section === 'obtain')
  )
  const [action, setAction] = useState<Action>(available[0] ?? 'grid')
  const [slots, setSlots] = useState(true)
  const [supercharge, setSupercharge] = useState(true)
  const [extendedTechnology, setExtendedTechnology] = useState(false)
  const [itemClass, setItemClass] = useState('S')
  const [shipIndex, setShipIndex] = useState(-1)
  const [scene, setScene] = useState('')
  // The model workshop hands over a kind and a seed through the hash.
  const [handed] = useState(() => hashParameters(window.location.hash))
  const handedKind = handed.get('kind') ?? ''
  const [model, setModel] = useState<string>(
    area === 'multitools'
      ? (toolModels as readonly string[]).includes(handedKind)
        ? handedKind
        : toolModels[0]
      : (shipModels as readonly string[]).includes(handedKind)
        ? handedKind
        : shipModels[0]
  )
  const [modelSeed, setModelSeed] = useState(
    /^0x[0-9a-f]{1,16}$/i.test(handed.get('seed') ?? '') ? (handed.get('seed') as string) : ''
  )
  const [homeSeed, setHomeSeed] = useState('')
  // Off unless the workshop hands over a tool it showed with the legacy colours (owner decision,
  // 2026-10-09).
  const [legacyColours, setLegacyColours] = useState(handed.get('legacy') === '1')
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
          shipIndex,
          model,
          scene: scene.trim(),
          modelSeed: modelSeed.trim(),
          homeSeed: homeSeed.trim(),
          legacyColours: area === 'multitools' && legacyColours
        })
      )
    } finally {
      setSending(false)
    }
  }

  const actions = available.map((value) => ({ value, label: text.equipAction[value] }))
  const models = freighterModels.map((model) => ({
    value: model.scene,
    label: text.freighterModel[model.id]
  }))
  const classItems = classes.map((value) => ({ value, label: value }))
  const targets = [
    { value: '-1', label: text.equipTargetCurrent },
    ...Array.from({ length: shipSlots }, (_, index) => ({
      value: String(index),
      label: formatMessage(text.equipTargetSlot, { number: index + 1 })
    }))
  ]
  const toolName = (model: (typeof toolModels)[number]): string => {
    const kind = toolModelKind[model]
    return kind
      ? copy.workshop.toolKind[kind]
      : text.toolModel[model as keyof typeof text.toolModel]
  }
  // A new starship or multi-tool is described by kind, seed and class only.
  const isNew = action === 'offer' && area !== 'freighters'
  const kinds = (area === 'multitools' ? toolModels : shipModels).map((value) => ({
    value,
    label:
      area === 'multitools'
        ? toolName(value as (typeof toolModels)[number])
        : text.shipModel[value as (typeof shipModels)[number]]
  }))
  const hasOptions = action !== 'classStep' && action !== 'slotReward' && !isNew
  const hasClass = action === 'offer' || action === 'build'
  // A new multi-tool has a technology grid only; its slots are set once the offer is accepted.
  const newTool = isNew && area === 'multitools'
  const hasExtended = hasClass
  const ready = status?.state === 'ready'
  const sendable = ready && !sending && (action !== 'grid' || slots || supercharge)
  const stateText = status
    ? formatMessage(text.state[status.state], { id: status.processId ?? '' })
    : text.state.unavailable
  const reason = result?.reason as DeliveryStateId | null | undefined
  const OutcomeIcon = result ? outcomeIcons[result.outcome] : null

  if (available.length === 0) {
    return (
      <Alert>
        <CircleHelpIcon />
        <AlertTitle>{copy.page.availabilityTitle}</AlertTitle>
        <AlertDescription>{text.obtainPlanned}</AlertDescription>
      </Alert>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{text.title}</CardTitle>
        <CardDescription>
          {isNew
            ? area === 'multitools'
              ? text.obtainToolHint
              : text.obtainShipHint
            : text.equipActionHint[action]}
        </CardDescription>
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
          {isNew && (
            <>
              <Field orientation="responsive">
                <FieldContent>
                  <FieldLabel htmlFor="equipment-kind">{text.equipScene}</FieldLabel>
                </FieldContent>
                {kinds.length > 5 ? (
                  <Combobox
                    items={kinds}
                    value={kinds.find((entry) => entry.value === model) ?? kinds[0]}
                    onValueChange={(entry) => setModel(entry?.value ?? kinds[0].value)}
                  >
                    <ComboboxInput id="equipment-kind" />
                    <ComboboxContent>
                      <ComboboxEmpty>{text.equipSceneEmpty}</ComboboxEmpty>
                      <ComboboxList>
                        {(entry: (typeof kinds)[number]) => (
                          <ComboboxItem key={entry.value} value={entry}>
                            {entry.label}
                          </ComboboxItem>
                        )}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                ) : (
                  <Select
                    items={kinds}
                    value={model}
                    onValueChange={(value) => setModel(value as string)}
                  >
                    <SelectTrigger id="equipment-kind">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {kinds.map((entry) => (
                          <SelectItem key={entry.value} value={entry.value}>
                            {entry.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              </Field>
              <Field orientation="responsive">
                <FieldContent>
                  <FieldLabel htmlFor="equipment-new-seed">{text.equipModelSeed}</FieldLabel>
                  <FieldDescription>{text.equipSeedHint}</FieldDescription>
                </FieldContent>
                <Input
                  id="equipment-new-seed"
                  value={modelSeed}
                  placeholder="0x8C968767B3282F13"
                  onChange={(event) => setModelSeed(event.target.value)}
                />
              </Field>
              {area === 'multitools' && (
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldLabel htmlFor="equipment-legacy">{text.equipLegacyColours}</FieldLabel>
                    <FieldDescription>{text.equipLegacyColoursHint}</FieldDescription>
                  </FieldContent>
                  <Switch
                    id="equipment-legacy"
                    checked={legacyColours}
                    onCheckedChange={setLegacyColours}
                  />
                </Field>
              )}
            </>
          )}
          {area === 'freighters' && action === 'offer' && (
            <>
              <Field>
                <FieldLabel htmlFor="equipment-scene">{text.equipScene}</FieldLabel>
                <Combobox
                  items={models}
                  value={models.find((model) => model.value === scene) ?? models[0]}
                  onValueChange={(model) => setScene(model?.value ?? '')}
                >
                  <ComboboxInput id="equipment-scene" />
                  <ComboboxContent>
                    <ComboboxEmpty>{text.equipSceneEmpty}</ComboboxEmpty>
                    <ComboboxList>
                      {(model: (typeof models)[number]) => (
                        <ComboboxItem key={model.value} value={model}>
                          {model.label}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
                <FieldDescription>{text.equipSceneHint}</FieldDescription>
              </Field>
              <Field orientation="responsive">
                <FieldContent>
                  <FieldLabel htmlFor="equipment-model-seed">{text.equipModelSeed}</FieldLabel>
                </FieldContent>
                <Input
                  id="equipment-model-seed"
                  value={modelSeed}
                  placeholder="0x8C968767B3282F13"
                  onChange={(event) => setModelSeed(event.target.value)}
                />
              </Field>
              <Field orientation="responsive">
                <FieldContent>
                  <FieldLabel htmlFor="equipment-home-seed">{text.equipHomeSeed}</FieldLabel>
                </FieldContent>
                <Input
                  id="equipment-home-seed"
                  value={homeSeed}
                  placeholder="0x175000B001FFD"
                  onChange={(event) => setHomeSeed(event.target.value)}
                />
              </Field>
            </>
          )}
          {(hasOptions || isNew) && (
            <>
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldLabel htmlFor="equipment-slots">
                    {newTool ? text.equipToolSlots : text.equipSlots}
                  </FieldLabel>
                  <FieldDescription>
                    {newTool ? text.equipToolSlotsHint : text.equipSlotsHint}
                  </FieldDescription>
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
          {hasExtended && (
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
      <CardFooter>
        <AlertDialog open={confirming} onOpenChange={setConfirming}>
          <AlertDialogTrigger render={<Button disabled={!sendable} />}>
            {sending ? <Spinner data-icon="inline-start" /> : <SendIcon data-icon="inline-start" />}
            {sending ? text.sending : isNew ? text.obtainAction : text.equipAction[action]}
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
