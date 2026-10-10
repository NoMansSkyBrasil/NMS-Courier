import { useEffect, useMemo, useState } from 'react'
import {
  CircleAlertIcon,
  CircleCheckIcon,
  CircleHelpIcon,
  CopyIcon,
  MapPinIcon,
  StarIcon
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
import { Field, FieldContent, FieldDescription, FieldLabel } from '@renderer/components/ui/field'
import { Input } from '@renderer/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/components/ui/select'
import { Switch } from '@renderer/components/ui/switch'
import { formatMessage, useLocale } from '@renderer/i18n/locale'
import type { DeliveryStateId } from '@renderer/i18n/messages'
import {
  earthLikeFilter,
  filterPlanets,
  openFilter,
  sentinelLevels,
  stormLevels,
  surveyBiomes,
  variantKind,
  variantKinds,
  type PlanetFilter,
  type SurveyBiome,
  type SurveyPlanet
} from '../../../shared/planet-survey'

type BridgeStatus = Awaited<ReturnType<typeof window.nms.getResearchBridgeStatus>>
type DeliveryResult = Awaited<ReturnType<typeof window.nms.teleport>>
type Found = SurveyPlanet & { inSystem: number }

// The survey is of the first galaxy; the travel request counts galaxies from 1.
const galaxyNumber = 1
// Where the Travel page keeps its saved destinations.
const favouritesKey = 'nms-courier-teleport-favourites'
// Rows drawn at first and added each time the list is scrolled near its end.
const pageSize = 80
const races = ['Gek', "Vy'keen", 'Korvax', 'none'] as const
const outcomeIcons = {
  completed: CircleCheckIcon,
  unknown: CircleHelpIcon,
  failed: CircleAlertIcon,
  refused: CircleAlertIcon
} as const

// Finds planets by what they are like in the survey the research tool made with the game's own
// generators, and hands a chosen one to the travel request, the Travel page's saved destinations
// or the clipboard.
export function PlanetFinderCard(): React.JSX.Element {
  const { copy, locale } = useLocale()
  const text = copy.planets
  const delivery = copy.delivery
  const [status, setStatus] = useState<BridgeStatus | null>(null)
  const [planets, setPlanets] = useState<SurveyPlanet[]>([])
  const [filter, setFilter] = useState<PlanetFilter>(earthLikeFilter)
  const [query, setQuery] = useState('')
  const [drawn, setDrawn] = useState(pageSize)
  const [target, setTarget] = useState<Found | null>(null)
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<DeliveryResult | null>(null)
  const [noted, setNoted] = useState<{ portal: string; what: 'copied' | 'saved' } | null>(null)

  useEffect(() => {
    let active = true
    void window.nms
      .getPlanetSurvey()
      .then((rows) => active && setPlanets(rows))
      .catch(() => active && setPlanets([]))
    return () => {
      active = false
    }
  }, [])

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

  const found = useMemo(() => {
    const wanted = query.replace(/\s+/g, '').toUpperCase()
    const passing = filterPlanets(planets, filter)
    return wanted ? passing.filter((planet) => planet.portal.includes(wanted)) : passing
  }, [planets, filter, query])
  const shown = found.slice(0, drawn)
  const systems = useMemo(
    () => new Set(found.map((planet) => planet.portal.slice(1))).size,
    [found]
  )

  const change = (changes: Partial<PlanetFilter>): void => {
    setFilter({ ...filter, ...changes })
    setDrawn(pageSize)
  }
  const number = (value: number): string => value.toLocaleString(locale)
  const biomeName = (biome: string): string =>
    (surveyBiomes as readonly string[]).includes(biome) ? text.biomes[biome as SurveyBiome] : biome
  const describe = (planet: SurveyPlanet): string =>
    `${biomeName(planet.biome)} · ${text.variants[variantKind(planet.subtype)]}`

  const travel = async (): Promise<void> => {
    const planet = target
    setTarget(null)
    if (!planet) return
    setSending(true)
    try {
      setResult(await window.nms.teleport({ glyphs: planet.portal, galaxyNumber, to: 'planet' }))
    } finally {
      setSending(false)
    }
  }

  const copyPortal = (planet: Found): void => {
    void navigator.clipboard
      .writeText(planet.portal)
      .then(() => setNoted({ portal: planet.portal, what: 'copied' }))
      .catch(() => setNoted(null))
  }

  // Adds the planet to the destinations the Travel page keeps, under a name that says what it is.
  const save = (planet: Found): void => {
    try {
      const stored: unknown = JSON.parse(window.localStorage.getItem(favouritesKey) ?? '[]')
      const list = Array.isArray(stored) ? stored : []
      const entry = { name: describe(planet), glyphs: planet.portal, galaxyNumber }
      const next = [
        entry,
        ...list.filter(
          (other) =>
            !(
              other &&
              typeof other === 'object' &&
              (other as { glyphs?: unknown }).glyphs === planet.portal
            )
        )
      ]
      window.localStorage.setItem(favouritesKey, JSON.stringify(next))
      setNoted({ portal: planet.portal, what: 'saved' })
    } catch {
      setNoted(null)
    }
  }

  const ready = status?.state === 'ready'
  const stateText = status
    ? formatMessage(delivery.state[status.state], { id: status.processId ?? '' })
    : delivery.state.unavailable
  const reason = result?.reason as DeliveryStateId | null | undefined
  const OutcomeIcon = result ? outcomeIcons[result.outcome] : null
  const preset =
    JSON.stringify(filter) === JSON.stringify(earthLikeFilter)
      ? 'earth'
      : JSON.stringify(filter) === JSON.stringify(openFilter)
        ? 'all'
        : 'custom'

  return (
    <Card>
      <CardHeader>
        <CardTitle>{text.title}</CardTitle>
        <CardDescription>{text.hint}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">{stateText}</p>
        <Alert>
          <CircleAlertIcon />
          <AlertTitle>{text.unverifiedTitle}</AlertTitle>
          <AlertDescription>
            {formatMessage(text.unverified, { count: number(planets.length) })}
          </AlertDescription>
        </Alert>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={preset === 'earth' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setFilter(earthLikeFilter)
              setDrawn(pageSize)
            }}
          >
            {text.presetEarth}
          </Button>
          <Button
            variant={preset === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setFilter(openFilter)
              setDrawn(pageSize)
            }}
          >
            {text.presetAll}
          </Button>
          <span className="text-xs text-muted-foreground">{text.presetHint}</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Field>
            <FieldLabel htmlFor="planets-biome">{text.biome}</FieldLabel>
            <Select
              value={filter.biome}
              onValueChange={(value) => value && change({ biome: value })}
            >
              <SelectTrigger id="planets-biome" className="w-full">
                <SelectValue>
                  {filter.biome === 'any' ? text.any : biomeName(filter.biome)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="any">{text.any}</SelectItem>
                  {surveyBiomes.map((biome) => (
                    <SelectItem key={biome} value={biome}>
                      {text.biomes[biome]}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="planets-variant">{text.variant}</FieldLabel>
            <Select
              value={filter.variant}
              onValueChange={(value) => value && change({ variant: value })}
            >
              <SelectTrigger id="planets-variant" className="w-full">
                <SelectValue>
                  {filter.variant === 'any'
                    ? text.any
                    : filter.variant === 'earthLike'
                      ? text.variantEarth
                      : text.variants[filter.variant as (typeof variantKinds)[number]]}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="any">{text.any}</SelectItem>
                  <SelectItem value="earthLike">{text.variantEarth}</SelectItem>
                  {variantKinds.map((kind) => (
                    <SelectItem key={kind} value={kind}>
                      {text.variants[kind]}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="planets-storms">{text.storms}</FieldLabel>
            <Select
              value={String(filter.storms)}
              onValueChange={(value) => value && change({ storms: Number(value) })}
            >
              <SelectTrigger id="planets-storms" className="w-full">
                <SelectValue>{text.stormLimit[stormLevels[filter.storms]]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {stormLevels.map((level, index) => (
                    <SelectItem key={level} value={String(index)}>
                      {text.stormLimit[level]}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="planets-sentinels">{text.sentinels}</FieldLabel>
            <Select
              value={String(filter.sentinels)}
              onValueChange={(value) => value && change({ sentinels: Number(value) })}
            >
              <SelectTrigger id="planets-sentinels" className="w-full">
                <SelectValue>{text.sentinelLimit[sentinelLevels[filter.sentinels]]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {sentinelLevels.map((level, index) => (
                    <SelectItem key={level} value={String(index)}>
                      {text.sentinelLimit[level]}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="planets-race">{text.race}</FieldLabel>
            <Select value={filter.race} onValueChange={(value) => value && change({ race: value })}>
              <SelectTrigger id="planets-race" className="w-full">
                <SelectValue>
                  {filter.race === 'any'
                    ? text.any
                    : filter.race === 'none'
                      ? text.raceNone
                      : filter.race}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="any">{text.any}</SelectItem>
                  {races.map((race) => (
                    <SelectItem key={race} value={race}>
                      {race === 'none' ? text.raceNone : race}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="planets-per-system">{text.perSystem}</FieldLabel>
            <Select
              value={String(filter.perSystem)}
              onValueChange={(value) => value && change({ perSystem: Number(value) })}
            >
              <SelectTrigger id="planets-per-system" className="w-full">
                <SelectValue>
                  {formatMessage(text.perSystemOption, { count: number(filter.perSystem) })}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {[1, 2, 3, 4].map((count) => (
                    <SelectItem key={count} value={String(count)}>
                      {formatMessage(text.perSystemOption, { count: number(count) })}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        </div>
        <Field orientation="horizontal">
          <FieldContent>
            <FieldLabel htmlFor="planets-extreme">{text.extreme}</FieldLabel>
            <FieldDescription>{text.extremeHint}</FieldDescription>
          </FieldContent>
          <Switch
            id="planets-extreme"
            checked={filter.allowExtreme}
            onCheckedChange={(checked) => change({ allowExtreme: checked })}
          />
        </Field>
        <Input
          aria-label={text.search}
          placeholder={text.search}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setDrawn(pageSize)
          }}
        />
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">
            {formatMessage(text.found, { planets: number(found.length), systems: number(systems) })}
          </Badge>
        </div>
        <div
          className="flex h-[32rem] flex-col divide-y overflow-y-auto rounded-lg border"
          onScroll={(event) => {
            const list = event.currentTarget
            if (
              drawn < found.length &&
              list.scrollTop + list.clientHeight > list.scrollHeight - 500
            ) {
              setDrawn(drawn + pageSize)
            }
          }}
        >
          {shown.map((planet) => (
            <div
              key={planet.portal}
              className="flex flex-wrap items-center gap-3 px-4 py-2 text-sm"
            >
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate font-medium" title={planet.subtype}>
                  {describe(planet)}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {[
                    `${text.storms}: ${text.stormLevels[planet.storms as (typeof stormLevels)[number]] ?? planet.storms}`,
                    `${text.sentinels}: ${text.sentinelLevels[planet.sentinels as (typeof sentinelLevels)[number]] ?? planet.sentinels}`,
                    planet.extreme ? text.extremeYes : '',
                    planet.race === 'none' ? text.raceNone : planet.race
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
              </div>
              {planet.inSystem > 1 && (
                <Badge variant="outline">
                  {formatMessage(text.inSystem, { count: number(planet.inSystem) })}
                </Badge>
              )}
              <span className="font-mono text-xs">{planet.portal}</span>
              {noted?.portal === planet.portal && (
                <span className="text-xs text-muted-foreground">{text[noted.what]}</span>
              )}
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={text.copy}
                title={text.copy}
                onClick={() => copyPortal(planet)}
              >
                <CopyIcon />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={text.save}
                title={text.save}
                onClick={() => save(planet)}
              >
                <StarIcon />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!ready || sending}
                onClick={() => setTarget(planet)}
              >
                <MapPinIcon data-icon="inline-start" />
                {text.travel}
              </Button>
            </div>
          ))}
          {found.length === 0 && (
            <p className="p-4 text-sm text-muted-foreground">
              {planets.length === 0 ? text.empty : delivery.selectNone}
            </p>
          )}
        </div>
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
          <pre className="max-h-48 overflow-auto rounded-lg bg-muted p-3 text-xs">
            {result.steps.map((step) => step.lines.join('\n')).join('\n\n')}
          </pre>
        )}
        <AlertDialog open={target !== null} onOpenChange={(open) => !open && setTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{delivery.confirmTitle}</AlertDialogTitle>
              <AlertDialogDescription>
                {target
                  ? formatMessage(text.confirm, { planet: describe(target), portal: target.portal })
                  : ''}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{delivery.cancel}</AlertDialogCancel>
              <AlertDialogAction onClick={() => void travel()}>{text.travel}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}
