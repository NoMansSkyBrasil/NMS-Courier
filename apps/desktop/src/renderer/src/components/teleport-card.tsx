import { useEffect, useState } from 'react'
import {
  CircleAlertIcon,
  CircleCheckIcon,
  CircleHelpIcon,
  DeleteIcon,
  SendIcon,
  StarIcon,
  Trash2Icon
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
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel
} from '@renderer/components/ui/field'
import { Input } from '@renderer/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/components/ui/select'
import { Spinner } from '@renderer/components/ui/spinner'
import { Table, TableBody, TableCell, TableRow } from '@renderer/components/ui/table'
import { formatMessage, useLocale } from '@renderer/i18n/locale'
import type { DeliveryStateId } from '@renderer/i18n/messages'
import {
  destinationFromGlyphs,
  galaxyCount,
  glyphDigits,
  glyphIcon
} from '../../../shared/portal-address'
import { GameIcon } from '@renderer/components/game-icon'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList
} from '@renderer/components/ui/combobox'

type BridgeStatus = Awaited<ReturnType<typeof window.nms.getResearchBridgeStatus>>
type DeliveryResult = Awaited<ReturnType<typeof window.nms.teleport>>
type Destination = 'station' | 'planet'
type Favourite = { name: string; glyphs: string; galaxyNumber: number }

const glyphLength = 12
const storageKey = 'nms-courier-teleport-favourites'
const outcomeIcons = {
  completed: CircleCheckIcon,
  unknown: CircleHelpIcon,
  failed: CircleAlertIcon,
  refused: CircleAlertIcon
} as const

// The saved destinations live in this application only; the game is not asked for them.
function readFavourites(): Favourite[] {
  try {
    const stored: unknown = JSON.parse(window.localStorage.getItem(storageKey) ?? '[]')
    if (!Array.isArray(stored)) return []
    return stored.filter(
      (entry): entry is Favourite =>
        typeof entry?.name === 'string' &&
        typeof entry?.glyphs === 'string' &&
        typeof entry?.galaxyNumber === 'number' &&
        destinationFromGlyphs(entry.glyphs, entry.galaxyNumber) !== null
    )
  } catch {
    return []
  }
}

// Sends the player to a star system chosen by galaxy and portal address, with a list of saved
// destinations. The journey is made by the running game.
export function TeleportCard(): React.JSX.Element {
  const { copy, locale } = useLocale()
  const text = copy.teleport
  const [galaxyNames, setGalaxyNames] = useState<string[]>([])
  const delivery = copy.delivery
  const [status, setStatus] = useState<BridgeStatus | null>(null)
  const [galaxyNumber, setGalaxyNumber] = useState(1)
  const [glyphs, setGlyphs] = useState('')
  const [to, setTo] = useState<Destination>('station')
  const [name, setName] = useState('')
  const [favourites, setFavourites] = useState<Favourite[]>(readFavourites)
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

  useEffect(() => {
    let active = true
    void window.nms
      .getGalaxyNames(locale)
      .then((names) => active && setGalaxyNames(names))
      .catch(() => active && setGalaxyNames([]))
    return () => {
      active = false
    }
  }, [locale])

  // Every galaxy by number with the game's name for it; numbers alone until the names are read.
  const galaxies = Array.from({ length: galaxyCount }, (_, index) => ({
    value: index + 1,
    label: galaxyNames[index] ? `${index + 1} - ${galaxyNames[index]}` : String(index + 1)
  }))
  const galaxyLabel = (number: number): string =>
    galaxies[number - 1]?.label ?? formatMessage(text.galaxyNumber, { number })

  const saveFavourites = (next: Favourite[]): void => {
    setFavourites(next)
    window.localStorage.setItem(storageKey, JSON.stringify(next))
  }
  const typeGlyphs = (value: string): void =>
    setGlyphs(
      value
        .replace(/[^0-9a-f]/gi, '')
        .slice(0, glyphLength)
        .toUpperCase()
    )

  const send = async (): Promise<void> => {
    setConfirming(false)
    setSending(true)
    try {
      setResult(await window.nms.teleport({ glyphs, galaxyNumber, to }))
    } finally {
      setSending(false)
    }
  }

  const valid = destinationFromGlyphs(glyphs, galaxyNumber) !== null
  const ready = status?.state === 'ready'
  const stateText = status
    ? formatMessage(delivery.state[status.state], { id: status.processId ?? '' })
    : delivery.state.unavailable
  const reason = result?.reason as DeliveryStateId | null | undefined
  const OutcomeIcon = result ? outcomeIcons[result.outcome] : null
  const destinations = [
    { value: 'station', label: text.toStation },
    { value: 'planet', label: text.toPlanet }
  ]

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{delivery.title}</CardTitle>
          <CardDescription>{text.hint}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">{stateText}</p>
          <FieldGroup>
            <Field orientation="responsive">
              <FieldContent>
                <FieldLabel htmlFor="teleport-galaxy">{text.galaxy}</FieldLabel>
                <FieldDescription>
                  {formatMessage(text.galaxyHint, { count: galaxyCount })}
                </FieldDescription>
              </FieldContent>
              <Combobox
                items={galaxies}
                value={galaxies[galaxyNumber - 1] ?? galaxies[0]}
                onValueChange={(entry) => setGalaxyNumber(entry?.value ?? 1)}
              >
                <ComboboxInput id="teleport-galaxy" />
                <ComboboxContent>
                  <ComboboxEmpty>{text.galaxyEmpty}</ComboboxEmpty>
                  <ComboboxList>
                    {(entry: (typeof galaxies)[number]) => (
                      <ComboboxItem key={entry.value} value={entry}>
                        {entry.label}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </Field>
            <Field>
              <FieldContent>
                <FieldLabel htmlFor="teleport-glyphs">{text.address}</FieldLabel>
                <FieldDescription>{text.addressHint}</FieldDescription>
              </FieldContent>
              <div className="flex flex-wrap gap-2" aria-label={text.address}>
                {glyphDigits.map((digit) => (
                  <Button
                    key={digit}
                    variant="outline"
                    className="h-auto flex-col gap-1 p-2 font-mono"
                    aria-label={digit}
                    disabled={glyphs.length >= glyphLength}
                    onClick={() => setGlyphs((current) => (current + digit).slice(0, glyphLength))}
                  >
                    <GameIcon locator={glyphIcon(digit)} size="lg" />
                    {digit}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="icon"
                  aria-label={text.erase}
                  disabled={!glyphs}
                  onClick={() => setGlyphs((current) => current.slice(0, -1))}
                >
                  <DeleteIcon />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  id="teleport-glyphs"
                  className="font-mono"
                  value={glyphs}
                  placeholder="01750B001FFD"
                  onChange={(event) => typeGlyphs(event.target.value)}
                />
                <Badge variant="secondary">
                  {glyphs.length} / {glyphLength}
                </Badge>
              </div>
              {glyphs && (
                <div className="flex flex-wrap gap-1" aria-hidden="true">
                  {glyphs.split('').map((digit, index) => (
                    <GameIcon key={`${index}${digit}`} locator={glyphIcon(digit)} />
                  ))}
                </div>
              )}
            </Field>
            <Field orientation="responsive">
              <FieldContent>
                <FieldLabel htmlFor="teleport-to">{text.destination}</FieldLabel>
                <FieldDescription>{text.destinationHint}</FieldDescription>
              </FieldContent>
              <Select
                items={destinations}
                value={to}
                onValueChange={(value) => setTo(value as Destination)}
              >
                <SelectTrigger id="teleport-to">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {destinations.map((entry) => (
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
        <CardFooter>
          <AlertDialog open={confirming} onOpenChange={setConfirming}>
            <AlertDialogTrigger render={<Button disabled={!ready || sending || !valid} />}>
              {sending ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <SendIcon data-icon="inline-start" />
              )}
              {sending ? delivery.sending : text.action}
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{delivery.confirmTitle}</AlertDialogTitle>
                <AlertDialogDescription>{text.confirmBody}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{delivery.cancel}</AlertDialogCancel>
                <AlertDialogAction onClick={() => void send()}>
                  {delivery.confirm}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{text.favourites}</CardTitle>
          <CardDescription>{text.favouritesHint}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Input
              aria-label={text.favouriteName}
              className="max-w-sm"
              placeholder={text.favouriteName}
              value={name}
              maxLength={60}
              onChange={(event) => setName(event.target.value)}
            />
            <Button
              variant="outline"
              disabled={!valid || !name.trim()}
              onClick={() => {
                saveFavourites([
                  ...favourites.filter(
                    (entry) => entry.glyphs !== glyphs || entry.galaxyNumber !== galaxyNumber
                  ),
                  { name: name.trim(), glyphs, galaxyNumber }
                ])
                setName('')
              }}
            >
              <StarIcon data-icon="inline-start" />
              {text.addFavourite}
            </Button>
          </div>
          {favourites.length === 0 ? (
            <p className="text-sm text-muted-foreground">{text.noFavourites}</p>
          ) : (
            <div className="h-72 overflow-auto rounded-lg border">
              <Table>
                <TableBody>
                  {favourites.map((entry) => (
                    <TableRow key={`${entry.galaxyNumber}:${entry.glyphs}`}>
                      <TableCell className="font-medium">{entry.name}</TableCell>
                      <TableCell className="font-mono text-muted-foreground">
                        {entry.glyphs}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{galaxyLabel(entry.galaxyNumber)}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setGlyphs(entry.glyphs)
                              setGalaxyNumber(entry.galaxyNumber)
                            }}
                          >
                            {text.useFavourite}
                          </Button>
                          <Button
                            variant="outline"
                            size="icon-sm"
                            aria-label={text.removeFavourite}
                            onClick={() =>
                              saveFavourites(favourites.filter((other) => other !== entry))
                            }
                          >
                            <Trash2Icon />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
