import { useEffect, useMemo, useState } from 'react'
import {
  CircleAlertIcon,
  CircleCheckIcon,
  CircleHelpIcon,
  CloudLightningIcon,
  CopyIcon,
  DownloadIcon,
  MapPinIcon,
  DoorOpenIcon,
  PlayIcon,
  UploadIcon,
  RadarIcon,
  ShieldIcon,
  SkullIcon,
  SparklesIcon,
  SquareIcon,
  StarIcon,
  TriangleAlertIcon
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
import { Spinner } from '@renderer/components/ui/spinner'
import { Switch } from '@renderer/components/ui/switch'
import { tones as stateTones } from '@renderer/features/tones'
import { formatMessage, useLocale } from '@renderer/i18n/locale'
import type { DeliveryStateId } from '@renderer/i18n/messages'
import {
  dissonantFilter,
  earthLikeFilter,
  filterPlanets,
  isPirateSystem,
  openFilter,
  sentinelLevels,
  stormLevels,
  surveyBiomes,
  variantKind,
  variantKinds,
  type Economy,
  type PlanetFilter,
  type SurveyBiome,
  type SurveyPlanet
} from '../../../shared/planet-survey'
import { grassHue, grassHues, type GrassHue } from '../../../shared/planet-search'

type BridgeStatus = Awaited<ReturnType<typeof window.nms.getResearchBridgeStatus>>
type DeliveryResult = Awaited<ReturnType<typeof window.nms.teleport>>
// A planet found live also has its grass colour and how far it is.
type Found = SurveyPlanet & {
  inSystem: number
  grass?: string
  distance?: number
  portalOnly?: boolean
  flora?: string
  fauna?: string
  resources?: string[]
}
type Library = Awaited<ReturnType<typeof window.nms.getPlanetLibrary>>
const wealths = ['Poor', 'Average', 'Wealthy'] as const
type LifeLevel = 'Dead' | 'Low' | 'Mid' | 'Full'
// A search may run for a minute or for a whole day.
const longestMinutes = 1440
type SearchReport = NonNullable<Awaited<ReturnType<typeof window.nms.getPlanetSearch>>>
const searchTones = {
  running: stateTones.info,
  done: stateTones.good,
  stopped: stateTones.neutral,
  travelled: stateTones.caution,
  failed: stateTones.danger,
  not_ready: stateTones.caution
} as const

// Where the Travel page keeps its saved destinations.
const favouritesKey = 'nms-courier-teleport-favourites'
// Rows drawn at first and added each time the list is scrolled near its end.
const pageSize = 80
const races = ['Gek', "Vy'keen", 'Korvax', 'none'] as const
// Colours that say at a glance how safe something is; each is always shown with its word.
const tones = {
  good: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  caution: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  danger: 'bg-red-500/15 text-red-700 dark:text-red-400',
  pirate: 'bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-400'
} as const
const stormTones: Record<string, string> = {
  None: tones.good,
  Low: tones.caution,
  High: tones.danger,
  Always: tones.danger
}
const sentinelTones: Record<string, string> = {
  Low: tones.good,
  Default: '',
  Aggressive: tones.caution,
  Corrupt: tones.danger
}
// One colour a biome, for the dot beside its name.
const biomeDots: Record<string, string> = {
  Lush: 'bg-emerald-500',
  Toxic: 'bg-lime-500',
  Scorched: 'bg-orange-500',
  Radioactive: 'bg-yellow-400',
  Frozen: 'bg-sky-400',
  Barren: 'bg-amber-700',
  Dead: 'bg-zinc-400',
  Weird: 'bg-violet-500',
  Swamp: 'bg-teal-600',
  Lava: 'bg-red-600',
  Red: 'bg-red-500',
  Green: 'bg-green-500',
  Blue: 'bg-blue-500',
  Waterworld: 'bg-cyan-500',
  GasGiant: 'bg-indigo-400'
}

function BiomeDot({ biome }: { biome: string }): React.JSX.Element {
  return (
    <span
      aria-hidden
      className={`inline-block size-2.5 shrink-0 rounded-full ${biomeDots[biome] ?? 'bg-muted-foreground'}`}
    />
  )
}
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
  // Where the planets come from: a search the game runs around the player, or the player's own
  // list, which is everything earlier searches found and whatever lists they imported.
  const [source, setSource] = useState<'live' | 'mine'>('live')
  const [library, setLibrary] = useState<Library>({ galaxies: [] })
  // The galaxy of the list shown, counted from 0; null until the player or a search chooses one.
  const [chosenGalaxy, setChosenGalaxy] = useState<number | null>(null)
  const [galaxyNames, setGalaxyNames] = useState<string[]>([])
  const [substances, setSubstances] = useState<Record<string, string>>({})
  const [shared, setShared] = useState<string | null>(null)
  const [minutes, setMinutes] = useState<number>(5)
  const [live, setLive] = useState<SearchReport | null>(null)
  const [starting, setStarting] = useState(false)
  const [startFailure, setStartFailure] = useState<DeliveryResult | null>(null)
  const [grass, setGrass] = useState<'any' | GrassHue>('any')
  const [filter, setFilter] = useState<PlanetFilter>(earthLikeFilter)
  const [query, setQuery] = useState('')
  const [drawn, setDrawn] = useState(pageSize)
  const [target, setTarget] = useState<Found | null>(null)
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<DeliveryResult | null>(null)
  const [noted, setNoted] = useState<{ portal: string; what: 'copied' | 'saved' } | null>(null)

  // The player's list, read again every few seconds: a running search keeps adding to it.
  useEffect(() => {
    let active = true
    const refresh = (): void => {
      void window.nms
        .getPlanetLibrary()
        .then((next) => active && setLibrary(next))
        .catch(() => undefined)
    }
    refresh()
    const timer = window.setInterval(refresh, 4000)
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
      .catch(() => undefined)
    void window.nms
      .getSubstanceNames(locale)
      .then((names) => active && setSubstances(names))
      .catch(() => undefined)
    return () => {
      active = false
    }
  }, [locale])

  // While the live search is shown, what it has found is read again every second and a half.
  useEffect(() => {
    if (source !== 'live') return
    let active = true
    const refresh = (): void => {
      void window.nms
        .getPlanetSearch()
        .then((next) => active && setLive(next))
        .catch(() => undefined)
    }
    refresh()
    const timer = window.setInterval(refresh, 1500)
    return () => {
      active = false
      window.clearInterval(timer)
    }
  }, [source])

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

  // The galaxy shown: the one chosen, else the one the last search ran in, else the first with planets.
  const galaxy = chosenGalaxy ?? live?.galaxy ?? library.galaxies[0]?.galaxy ?? 0
  const planets = useMemo(
    () => library.galaxies.find((entry) => entry.galaxy === galaxy)?.planets ?? [],
    [library, galaxy]
  )
  const found = useMemo(() => {
    const wanted = query.replace(/\s+/g, '').toUpperCase()
    const listed: readonly SurveyPlanet[] = source === 'live' ? (live?.entries ?? []) : planets
    const resourceText = (planet: Found): string =>
      (planet.resources ?? [])
        .map((id) => `${id} ${substances[id] ?? ''}`)
        .join(' ')
        .toUpperCase()
    const passing = (filterPlanets(listed, filter) as Found[]).filter(
      (planet) =>
        grass === 'any' || (planet.grass !== undefined && grassHue(planet.grass) === grass)
    )
    return wanted
      ? passing.filter(
          (planet) =>
            planet.portal.includes(wanted) ||
            resourceText(planet).replace(/\s+/g, '').includes(wanted)
        )
      : passing
  }, [planets, live, source, filter, query, grass, substances])
  // A search runs in the galaxy the player is in; the list shown is of the galaxy chosen.
  // The travel request counts galaxies from 1.
  const galaxyNumber = (source === 'live' ? (live?.galaxy ?? 0) : galaxy) + 1
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
  const systemText = (kind: string): string =>
    kind === 'lawful' ? text.systemLawful : kind === 'pirate' ? text.systemPirate : text.any
  const perSystemText = (count: number): string =>
    count === 1 ? text.perSystemOne : formatMessage(text.perSystemOption, { count: number(count) })
  const describe = (planet: SurveyPlanet): string =>
    `${biomeName(planet.biome)} · ${text.variants[variantKind(planet.biome, planet.subtype)]}`

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

  const startSearch = async (): Promise<void> => {
    setStarting(true)
    setStartFailure(null)
    try {
      const seconds = Math.min(longestMinutes, Math.max(1, Math.round(minutes) || 1)) * 60
      const started = await window.nms.startPlanetSearch({ seconds, filter })
      setStartFailure(started.outcome === 'completed' ? null : started)
      setLive(await window.nms.getPlanetSearch())
    } finally {
      setStarting(false)
    }
  }

  const stopSearch = async (): Promise<void> => {
    setStarting(true)
    try {
      await window.nms.stopPlanetSearch()
      setLive(await window.nms.getPlanetSearch())
    } finally {
      setStarting(false)
    }
  }

  const ready = status?.state === 'ready'
  const searching = live?.state === 'running'
  const reason = result?.reason as DeliveryStateId | null | undefined
  const OutcomeIcon = result ? outcomeIcons[result.outcome] : null
  const preset =
    JSON.stringify(filter) === JSON.stringify(earthLikeFilter)
      ? 'earth'
      : JSON.stringify(filter) === JSON.stringify(openFilter)
        ? 'all'
        : JSON.stringify(filter) === JSON.stringify(dissonantFilter)
          ? 'dissonant'
          : 'custom'
  const galaxyName = (index: number): string =>
    galaxyNames[index] ? `${index + 1} - ${galaxyNames[index]}` : String(index + 1)

  const exportList = async (): Promise<void> => {
    const count = await window.nms.exportPlanetLibrary()
    if (count !== null) setShared(formatMessage(text.exported, { count: number(count) }))
  }

  const importList = async (): Promise<void> => {
    const outcome = await window.nms.importPlanetLibrary()
    if (outcome.state === 'cancelled') return
    setShared(
      outcome.state === 'invalid'
        ? text.importFailed
        : formatMessage(text.imported, { count: number(outcome.added) })
    )
    setLibrary(await window.nms.getPlanetLibrary())
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{text.title}</CardTitle>
        <CardDescription>{text.hint}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={source === 'live' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setSource('live')
              setDrawn(pageSize)
            }}
          >
            <RadarIcon data-icon="inline-start" />
            {text.sourceLive}
          </Button>
          <Button
            variant={source === 'mine' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setSource('mine')
              setDrawn(pageSize)
            }}
          >
            <StarIcon data-icon="inline-start" />
            {text.sourceMine}
          </Button>
        </div>
        {source === 'mine' ? (
          <div className="flex flex-col gap-3 rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">{text.mineHint}</p>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium">{text.galaxy}</span>
              <Select
                value={String(galaxy)}
                onValueChange={(value) => {
                  if (!value) return
                  setChosenGalaxy(Number(value))
                  setDrawn(pageSize)
                }}
              >
                <SelectTrigger aria-label={text.galaxy} className="w-64">
                  <SelectValue>{galaxyName(galaxy)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {(library.galaxies.length > 0
                      ? library.galaxies
                      : [{ galaxy, planets: [] }]
                    ).map((entry) => (
                      <SelectItem key={entry.galaxy} value={String(entry.galaxy)}>
                        {galaxyName(entry.galaxy)} ({number(entry.planets.length)})
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={() => void exportList()}>
                <UploadIcon data-icon="inline-start" />
                {text.exportList}
              </Button>
              <Button variant="outline" size="sm" onClick={() => void importList()}>
                <DownloadIcon data-icon="inline-start" />
                {text.importList}
              </Button>
            </div>
            {shared && <p className="text-sm text-muted-foreground">{shared}</p>}
          </div>
        ) : (
          <div className="flex flex-col gap-3 rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">{text.liveHint}</p>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium">{text.duration}</span>
              <Input
                aria-label={text.duration}
                type="number"
                min={1}
                max={longestMinutes}
                className="w-24"
                value={minutes}
                onChange={(event) => setMinutes(Number(event.target.value))}
              />
              <span className="text-xs text-muted-foreground">{text.durationHint}</span>
              <Button disabled={!ready || starting} onClick={() => void startSearch()}>
                {starting ? (
                  <Spinner data-icon="inline-start" />
                ) : (
                  <PlayIcon data-icon="inline-start" />
                )}
                {text.start}
              </Button>
              {searching && (
                <Button variant="outline" disabled={starting} onClick={() => void stopSearch()}>
                  <SquareIcon data-icon="inline-start" />
                  {text.stop}
                </Button>
              )}
            </div>
            {live && (
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <Badge variant="secondary" className={searchTones[live.state]}>
                  {searching && <Spinner />}
                  {text.liveState[live.state]}
                </Badge>
                <span className="text-muted-foreground">
                  {formatMessage(text.progress, {
                    systems: number(live.systems),
                    distance: number(live.distance)
                  })}
                </span>
              </div>
            )}
            {startFailure && (
              <Alert variant="destructive">
                <CircleAlertIcon />
                <AlertTitle>{delivery.outcome[startFailure.outcome]}</AlertTitle>
                <AlertDescription>
                  {startFailure.reason && startFailure.reason in delivery.state
                    ? formatMessage(delivery.state[startFailure.reason as DeliveryStateId], {
                        id: ''
                      })
                    : delivery.outcomeHint[startFailure.outcome]}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
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
          <Button
            variant={preset === 'dissonant' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setFilter(dissonantFilter)
              setDrawn(pageSize)
            }}
          >
            {text.presetDissonant}
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
                      <BiomeDot biome={biome} />
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
            <FieldLabel htmlFor="planets-system">{text.system}</FieldLabel>
            <Select
              value={filter.system}
              onValueChange={(value) => value && change({ system: value })}
            >
              <SelectTrigger id="planets-system" className="w-full">
                <SelectValue>{systemText(filter.system)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {['any', 'lawful', 'pirate'].map((kind) => (
                    <SelectItem key={kind} value={kind}>
                      {systemText(kind)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="planets-wealth">{text.wealth}</FieldLabel>
            <Select
              value={filter.wealth}
              onValueChange={(value) => value && change({ wealth: value })}
            >
              <SelectTrigger id="planets-wealth" className="w-full">
                <SelectValue>
                  {filter.wealth === 'any'
                    ? text.any
                    : text.wealthNames[filter.wealth as (typeof wealths)[number]]}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="any">{text.any}</SelectItem>
                  {wealths.map((wealth) => (
                    <SelectItem key={wealth} value={wealth}>
                      {text.wealthNames[wealth]}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="planets-grass">{text.grass}</FieldLabel>
            <Select
              value={grass}
              onValueChange={(value) => value && setGrass(value as 'any' | GrassHue)}
            >
              <SelectTrigger id="planets-grass" className="w-full">
                <SelectValue>{grass === 'any' ? text.any : text.grassHues[grass]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="any">{text.any}</SelectItem>
                  {grassHues.map((hue) => (
                    <SelectItem key={hue} value={hue}>
                      {text.grassHues[hue]}
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
                <SelectValue>{perSystemText(filter.perSystem)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {[1, 2, 3, 4].map((count) => (
                    <SelectItem key={count} value={String(count)}>
                      {perSystemText(count)}
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
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="flex items-center gap-2 font-medium" title={planet.subtype}>
                  <BiomeDot biome={planet.biome} />
                  <span className="truncate">{describe(planet)}</span>
                  {planet.grass !== undefined && (
                    <span
                      className="inline-block size-3.5 shrink-0 rounded-sm border"
                      style={{ backgroundColor: `#${planet.grass}` }}
                      title={`${text.grass}: ${text.grassHues[grassHue(planet.grass) ?? 'pale']}`}
                    />
                  )}
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant="secondary" className={stormTones[planet.storms]}>
                    <CloudLightningIcon />
                    {text.storms}:{' '}
                    {text.stormLevels[planet.storms as (typeof stormLevels)[number]] ??
                      planet.storms}
                  </Badge>
                  <Badge variant="secondary" className={sentinelTones[planet.sentinels]}>
                    <ShieldIcon />
                    {text.sentinels}:{' '}
                    {text.sentinelLevels[planet.sentinels as (typeof sentinelLevels)[number]] ??
                      planet.sentinels}
                  </Badge>
                  {planet.extreme && (
                    <Badge variant="secondary" className={tones.danger}>
                      <TriangleAlertIcon />
                      {text.extremeYes}
                    </Badge>
                  )}
                  {isPirateSystem(planet) && (
                    <Badge variant="secondary" className={tones.pirate}>
                      <SkullIcon />
                      {text.pirate}
                    </Badge>
                  )}
                  {planet.star === 'Purple' && (
                    <Badge
                      variant="secondary"
                      className="bg-violet-500/15 text-violet-700 dark:text-violet-400"
                      title={text.purpleHint}
                    >
                      <SparklesIcon />
                      {text.purple}
                    </Badge>
                  )}
                  {planet.portalOnly && (
                    <Badge
                      variant="secondary"
                      className={stateTones.info}
                      title={text.portalOnlyHint}
                    >
                      <DoorOpenIcon />
                      {text.portalOnly}
                    </Badge>
                  )}
                  <span className="truncate text-xs text-muted-foreground">
                    {[
                      planet.race === 'none' ? text.raceNone : planet.race,
                      text.economy[planet.economy as Economy] ?? '',
                      planet.flora
                        ? `${text.flora}: ${text.life[planet.flora as LifeLevel] ?? planet.flora}`
                        : '',
                      planet.fauna
                        ? `${text.fauna}: ${text.life[planet.fauna as LifeLevel] ?? planet.fauna}`
                        : '',
                      (planet.resources ?? []).map((id) => substances[id] ?? id).join(', ')
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                </div>
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
            <p className="p-4 text-sm text-muted-foreground">{text.liveEmpty}</p>
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
          <pre className="internal-name max-h-48 overflow-auto rounded-lg bg-muted p-3 text-xs">
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
