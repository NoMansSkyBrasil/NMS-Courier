import { useMemo, useCallback, useEffect, useRef, useState } from 'react'
import { BoxIcon, DicesIcon, EraserIcon, EyeIcon, SendIcon } from 'lucide-react'
import type { PreviewModel, PreviewColor } from '../../../shared/model-preview'
import {
  workshopCategories,
  workshopKinds,
  workshopPaintRoles
} from '../../../shared/model-workshop'
import type {
  WorkshopCategory,
  WorkshopColorSlot,
  WorkshopFailure,
  WorkshopPart,
  WorkshopPartGroup,
  WorkshopSurface,
  WorkshopTextureGroup,
  WorkshopWantedLook,
  WorkshopWantedPart
} from '../../../shared/model-workshop'
import { Alert, AlertDescription } from '@renderer/components/ui/alert'
import { Badge } from '@renderer/components/ui/badge'
import { Button } from '@renderer/components/ui/button'
import { Checkbox } from '@renderer/components/ui/checkbox'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@renderer/components/ui/card'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from '@renderer/components/ui/empty'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet
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
import { ToggleGroup, ToggleGroupItem } from '@renderer/components/ui/toggle-group'
import { originsOfSeed } from '../../../shared/star-system-stream'
import { glyphsFromSystemSeed, systemSeedFromGlyphs } from '../../../shared/system-address'
import { hashParameters } from '@renderer/features'
import { formatMessage, useLocale } from '@renderer/i18n/locale'
import { ModelPreviewCanvas } from './model-preview-canvas'

// The two screens of the model workshop. "Build": choose parts and the main colour, and the
// application looks for a seed that has them. "View": type or draw a seed and see what it is.
// Both start with the same choice of category and kind.

export type WorkshopMode = 'build' | 'view'

const noneHidden = new Set<string>()
const noColors = new Map<string, PreviewColor>()
// The value of a list that leaves the choice to the seed.
const anyPart = 'any'

function randomSeed(): string {
  const words = crypto.getRandomValues(new Uint32Array(2))
  return (
    '0x' +
    [words[0], words[1]]
      .map((word) => word.toString(16).padStart(8, '0'))
      .join('')
      .toUpperCase()
  )
}

// "_ENGINE_" reads "Engine"; "_ENGINE_C" in that group reads "C". These are the game's own
// identifiers, shown as they are because the game has no display text for parts.
function groupLabel(group: string): string {
  const plain = group.replace(/^_+|_+$/g, '').replace(/_/g, ' ')
  return plain.charAt(0).toUpperCase() + plain.slice(1).toLowerCase()
}
function partLabel(group: string, id: string): string {
  const rest = id.toUpperCase().startsWith(group.toUpperCase())
    ? id.slice(group.length)
    : id.replace(/^_+/, '')
  // A trailing level suffix ("LOD0") is not part of the name.
  return (
    rest
      .replace(/LOD[0-9]$/, '')
      .replace(/_/g, ' ')
      .trim() || id.replace(/^_+/, '')
  )
}
function cssColor(color: readonly number[]): string {
  return `rgb(${color
    .slice(0, 3)
    .map((value) => Math.round(value * 255))
    .join(' ')})`
}
// The named colours of a painted starship come first, in their usual order.
function namedFirst(colors: readonly WorkshopColorSlot[]): WorkshopColorSlot[] {
  const rank = (slot: WorkshopColorSlot): number => {
    const index = workshopPaintRoles.findIndex(
      (entry) => entry.family === slot.family && entry.sample === slot.sample
    )
    return index < 0 ? workshopPaintRoles.length : index
  }
  return [...colors].sort((left, right) => rank(left) - rank(right))
}
// A texture layer is named by its group when it has one ("DECALLOGO" reads "Logo").
function layerLabel(layer: string, group: string): string {
  return groupLabel((group || layer).replace(/^DECAL/, ''))
}
const seedShape = /^0x[0-9a-f]{1,16}$/i
const noLook: WorkshopWantedLook = { colors: [], textures: [] }
function hasLook(look: WorkshopWantedLook): boolean {
  return look.colors.length > 0 || look.textures.length > 0
}
function sameRgb(left: readonly number[], right: readonly number[]): boolean {
  return left[0] === right[0] && left[1] === right[1] && left[2] === right[2]
}
function pinKey(group: WorkshopPartGroup): string {
  return `${group.parent}>${group.group}`
}

// The chosen parts that can still be reached: a choice under a part that is no longer chosen is
// dropped, and each remaining one is named the way the search wants it.
function reachable(
  groups: readonly WorkshopPartGroup[],
  pins: Readonly<Record<string, string>>
): { pins: Record<string, string>; wanted: WorkshopWantedPart[] } {
  const kept: Record<string, string> = {}
  const wanted: WorkshopWantedPart[] = []
  const walk = (list: readonly WorkshopPartGroup[]): void => {
    for (const group of list) {
      const option = group.options.find((entry) => entry.id === pins[pinKey(group)])
      if (!option) continue
      kept[pinKey(group)] = option.id
      wanted.push({ parent: group.parent, group: group.group, id: option.id })
      walk(option.groups)
    }
  }
  walk(groups)
  return { pins: kept, wanted }
}

// The model "get a new one" takes for each multi-tool scene of the workshop.
const toolModelOfKind: Record<string, string> = {
  standard: 'pistol',
  staff: 'staff',
  royal: 'royal',
  sentinel: 'sentinel',
  sentinelB: 'sentinelb',
  atlas: 'atlas',
  atlasSceptre: 'atlasstaff',
  staffRuin: 'staffruin',
  staffBone: 'staffbone',
  staffNpc: 'staffnpc',
  switch: 'switch',
  retro: 'retro',
  swarm: 'swarm'
}

export function ModelWorkshopCard({ mode }: { mode: WorkshopMode }): React.JSX.Element {
  const { copy } = useLocale()
  const text = copy.workshop
  // Another page, or a link, may name what to open: "#models?tab=view&category=…&kind=…&seed=…".
  const [handed] = useState(() => hashParameters(window.location.hash))
  const handedCategory = workshopCategories.find((value) => value === handed.get('category'))
  const [category, setCategory] = useState<WorkshopCategory>(handedCategory ?? 'starship')
  const [kind, setKind] = useState<string>(() => {
    const kinds = Object.keys(workshopKinds[handedCategory ?? 'starship'])
    return kinds.includes(handed.get('kind') ?? '') ? (handed.get('kind') as string) : kinds[0]
  })
  const handedSeed = /^0x[0-9a-f]{1,16}$/i.test(handed.get('seed') ?? '')
    ? handed.get('seed')
    : null
  const kindItems = Object.keys(workshopKinds[category]).map((value) => ({
    value,
    label:
      category === 'starship'
        ? copy.delivery.shipModel[value as keyof typeof copy.delivery.shipModel]
        : category === 'multitool'
          ? text.toolKind[value as keyof typeof text.toolKind]
          : copy.delivery.freighterModel[value as keyof typeof copy.delivery.freighterModel]
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === 'build' ? text.tabBuild : text.tabView}</CardTitle>
        <CardDescription>
          {mode === 'build' ? text.buildDescription : text.viewDescription}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel>{text.categoryLabel}</FieldLabel>
            <ToggleGroup
              variant="outline"
              value={[category]}
              onValueChange={(value) => {
                const next = value[0] as WorkshopCategory | undefined
                if (!next || next === category) return
                setCategory(next)
                setKind(Object.keys(workshopKinds[next])[0])
              }}
            >
              {workshopCategories.map((value) => (
                <ToggleGroupItem key={value} value={value}>
                  {text.category[value]}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </Field>
          <Field>
            <FieldLabel htmlFor={`workshop-kind-${mode}`}>{text.kindLabel}</FieldLabel>
            <Select
              items={kindItems}
              value={kind}
              onValueChange={(value) => setKind(value as string)}
            >
              <SelectTrigger id={`workshop-kind-${mode}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {kindItems.map((entry) => (
                    <SelectItem key={entry.value} value={entry.value}>
                      {entry.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        </div>
        <WorkshopModel
          key={`${category}/${kind}`}
          mode={mode}
          category={category}
          kind={kind}
          firstSeed={mode === 'view' ? handedSeed : null}
          firstHomeSeed={seedShape.test(handed.get('home') ?? '') ? handed.get('home') : null}
          firstLegacy={
            handed.get('legacy') === '1' ? true : handed.get('legacy') === '0' ? false : null
          }
        />
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground">{text.note}</p>
      </CardFooter>
    </Card>
  )
}

// One kind's seed, model and choices. It is created anew for each kind, so nothing of the
// previous kind is left on screen.
function WorkshopModel({
  mode,
  category,
  kind,
  firstSeed,
  firstHomeSeed,
  firstLegacy
}: {
  mode: WorkshopMode
  category: WorkshopCategory
  kind: string
  // The seed to open with; a random one when null.
  firstSeed: string | null
  firstHomeSeed: string | null
  // Whether to open with the legacy colours; the kind's usual choice when null.
  firstLegacy: boolean | null
}): React.JSX.Element {
  const { copy } = useLocale()
  const text = copy.workshop
  const [typed, setTyped] = useState('')
  // A freighter's colours come from the seed of its home star system, typed beside its own.
  const [homeSeed, setHomeSeed] = useState(firstHomeSeed ?? '')
  const homeSeedRef = useRef(firstHomeSeed ?? '')
  // The game draws a palette in one of two ways; multi-tools it hands out use the legacy one.
  const [legacy, setLegacy] = useState(firstLegacy ?? category === 'multitool')
  const legacyRef = useRef(firstLegacy ?? category === 'multitool')
  const [glyphs, setGlyphs] = useState('')
  const [galaxy, setGalaxy] = useState('1')
  const homeAddress = glyphsFromSystemSeed(homeSeed.trim())
  // Where the seed can be got in the game: any starship type and any multi-tool scene (the standard
  // scene is the game's pistol, rifle, experimental and alien tools; the link names the pistol).
  const getLink =
    category === 'starship'
      ? `#starships/obtain?kind=${kind}&seed=${encodeURIComponent(typed.trim())}`
      : category === 'multitool' && toolModelOfKind[kind]
        ? `#multitools/obtain?kind=${toolModelOfKind[kind]}&seed=${encodeURIComponent(typed.trim())}&legacy=${legacy ? 1 : 0}`
        : null
  // The star system a typed ship seed was drawn in, when it has one.
  const origin = useMemo(() => {
    if (category === 'multitool' || !/^0x[0-9a-f]{16}$/i.test(typed.trim())) return null
    const found = originsOfSeed(typed.trim())[0]
    const address = found ? glyphsFromSystemSeed(found.systemSeed) : null
    return found && address ? { ...address, steps: found.steps } : null
  }, [category, typed])
  const fromGlyphs = systemSeedFromGlyphs(glyphs, Number(galaxy))
  const [model, setModel] = useState<PreviewModel | null>(null)
  const [parts, setParts] = useState<WorkshopPart[]>([])
  const [colors, setColors] = useState<WorkshopColorSlot[]>([])
  const [textureGroups, setTextureGroups] = useState<WorkshopTextureGroup[]>([])
  const [surfaces, setSurfaces] = useState<WorkshopSurface[]>([])
  const [groups, setGroups] = useState<WorkshopPartGroup[]>([])
  const [pinned, setPinned] = useState<Record<string, string>>({})
  const [look, setLook] = useState<WorkshopWantedLook>(noLook)
  // The colour being chosen, as "family:sample"; the model's first colour until one is picked.
  const [slotKey, setSlotKey] = useState<string | null>(null)
  const [busy, setBusy] = useState(true)
  const [tried, setTried] = useState<number | null>(null)
  const [error, setError] = useState<WorkshopFailure | null>(null)
  const [reset, setReset] = useState(0)
  // Only the answer to the latest request is shown.
  const request = useRef(0)

  // Asks for the model of a seed; state changes only once the answer is back.
  const load = useCallback(
    async (seed: string) => {
      const mine = (request.current += 1)
      try {
        const home = homeSeedRef.current.trim()
        const result = await window.nms.workshopModel({
          category,
          kind,
          seed,
          ...(category === 'freighter' && seedShape.test(home) ? { colorSeed: home } : {}),
          legacyColours: legacyRef.current
        })
        if (mine !== request.current) return
        if (result.state === 'built') {
          setSurfaces(result.surfaces)
          setModel(result.model)
          setParts(result.parts)
          setColors(namedFirst(result.colors))
          setTextureGroups(result.textureGroups)
          setTyped(result.seed)
        } else {
          setError(result.reason)
        }
      } catch {
        if (mine === request.current) setError('GAME_FILES_UNREADABLE')
      } finally {
        if (mine === request.current) setBusy(false)
      }
    },
    [category, kind]
  )
  const show = (seed: string): Promise<void> => {
    setBusy(true)
    setError(null)
    setTried(null)
    return load(seed)
  }

  // What can be chosen for the kind, and a first random seed so there is something to look at.
  useEffect(() => {
    let active = true
    if (mode === 'build') {
      void window.nms
        .workshopChoices({ category, kind })
        .then((result) => {
          if (!active || result.state !== 'listed') return
          setGroups(result.groups)
        })
        .catch(() => undefined)
    }
    // Started from a callback: the effect itself changes no state.
    void Promise.resolve().then(() => load(firstSeed ?? randomSeed()))
    return () => {
      active = false
    }
  }, [mode, category, kind, load, firstSeed])

  // A seed with the chosen parts, colours and base texture, or any seed when nothing is chosen.
  const search = async (
    pins: Record<string, string>,
    wanted: WorkshopWantedLook
  ): Promise<void> => {
    const { wanted: wantedParts } = reachable(groups, pins)
    if (wantedParts.length === 0 && !hasLook(wanted)) {
      await show(randomSeed())
      return
    }
    const mine = (request.current += 1)
    setBusy(true)
    setError(null)
    setTried(null)
    try {
      const found = await window.nms.workshopFindSeed({
        category,
        kind,
        parts: wantedParts,
        look: wanted,
        legacyColours: legacyRef.current
      })
      if (mine !== request.current) return
      if (found.state === 'found') {
        await load(found.seed)
        if (mine + 1 === request.current) setTried(found.tried)
      } else {
        setError(found.reason)
        setBusy(false)
      }
    } catch {
      if (mine === request.current) {
        setError('GAME_FILES_UNREADABLE')
        setBusy(false)
      }
    }
  }

  const seedValid = /^0x[0-9a-f]{1,16}$/i.test(typed.trim())
  const hasChoices = Object.keys(pinned).length > 0 || hasLook(look)
  const drawn = parts.filter((part) => part.alternatives > 1)
  // A painted starship's five colours have names; any other colour goes by the game's name for
  // its palette family and the number of the sample.
  const slotLabel = (slot: { family: number; sample: number; familyName?: string }): string => {
    const named = workshopPaintRoles.find(
      (entry) => entry.family === slot.family && entry.sample === slot.sample
    )
    if (named) return named.role === 'undercoat' ? text.undercoatLabel : text.roles[named.role]
    return `${(slot.familyName ?? String(slot.family)).replace(/_/g, ' ')} ${slot.sample + 1}`
  }
  const keyOf = (slot: { family: number; sample: number }): string =>
    `${slot.family}:${slot.sample}`
  const activeSlot = colors.find((slot) => keyOf(slot) === slotKey) ?? colors[0] ?? null
  const wantedColor = (slot: { family: number; sample: number }): number[] | null =>
    look.colors.find((entry) => entry.family === slot.family && entry.sample === slot.sample)
      ?.color ?? null
  const wantedTexture = (group: WorkshopTextureGroup): string | null =>
    look.textures.find((entry) => entry.layer === group.layer && entry.group === group.group)
      ?.name ?? null
  const textureLabel = (name: string): string =>
    text.baseTexture[name as keyof typeof text.baseTexture] ?? name
  const onLoaded = useCallback(() => undefined, [])
  const onError = useCallback(() => setError('GAME_FILES_UNREADABLE'), [])
  const fetchTexture = useCallback(
    (texture: string) => window.nms.workshopTexture(texture).catch(() => null),
    []
  )

  const partLists = (list: readonly WorkshopPartGroup[]): React.ReactNode =>
    list.map((group, index) => {
      const key = pinKey(group)
      const items = [
        { value: anyPart, label: text.anyPart },
        ...group.options.map((option) => ({
          value: option.id,
          label: option.rare
            ? `${partLabel(group.group, option.id)} (${text.rare})`
            : partLabel(group.group, option.id)
        }))
      ]
      const value = pinned[key] ?? anyPart
      const option = group.options.find((entry) => entry.id === value)
      return (
        <FieldGroup key={`${key}-${index}`}>
          <Field>
            <FieldLabel htmlFor={`workshop-part-${key}-${index}`}>
              {groupLabel(group.group)}
            </FieldLabel>
            <Select
              items={items}
              value={value}
              onValueChange={(next) => {
                const changed = { ...pinned }
                if (next === anyPart) delete changed[key]
                else changed[key] = next as string
                const kept = reachable(groups, changed).pins
                setPinned(kept)
                void search(kept, look)
              }}
            >
              <SelectTrigger id={`workshop-part-${key}-${index}`} disabled={busy}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {items.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          {option && option.groups.length > 0 && (
            <div className="flex flex-col gap-4 border-l pl-4">{partLists(option.groups)}</div>
          )}
        </FieldGroup>
      )
    })

  const swatch = (color: readonly number[]): React.ReactNode => (
    <span
      className="inline-block size-4 rounded-sm border"
      style={{ backgroundColor: cssColor(color) }}
    />
  )
  const activeColor = activeSlot ? wantedColor(activeSlot) : null

  return (
    <>
      <Field>
        <FieldLabel htmlFor={`workshop-seed-${mode}`}>{text.seedLabel}</FieldLabel>
        <div className="flex flex-wrap gap-2">
          <Input
            id={`workshop-seed-${mode}`}
            className="max-w-xs"
            value={typed}
            readOnly={mode === 'build'}
            placeholder="0x8C968767B3282F13"
            spellCheck={false}
            onChange={(event) => setTyped(event.target.value)}
            onKeyDown={(event) => {
              if (mode === 'view' && event.key === 'Enter' && seedValid) void show(typed.trim())
            }}
          />
          {mode === 'view' && (
            <Button
              variant="outline"
              disabled={!seedValid || busy}
              onClick={() => void show(typed.trim())}
            >
              <EyeIcon data-icon="inline-start" />
              {text.show}
            </Button>
          )}
          <Button
            disabled={busy}
            onClick={() => void (mode === 'build' ? search(pinned, look) : show(randomSeed()))}
          >
            {busy ? <Spinner data-icon="inline-start" /> : <DicesIcon data-icon="inline-start" />}
            {mode === 'build' && hasChoices ? text.generateWithParts : text.generate}
          </Button>
          {mode === 'build' && hasChoices && (
            <Button
              variant="ghost"
              disabled={busy}
              onClick={() => {
                setPinned({})
                setLook(noLook)
                setTried(null)
              }}
            >
              <EraserIcon data-icon="inline-start" />
              {text.clearParts}
            </Button>
          )}
          {getLink && model && seedValid && (
            <Button variant="outline" render={<a href={getLink} />}>
              <SendIcon data-icon="inline-start" />
              {text.getInGame}
            </Button>
          )}
        </div>
        {mode === 'view' && <FieldDescription>{text.seedHint}</FieldDescription>}
        {origin && (
          <FieldDescription>
            {formatMessage(text.seedOrigin, {
              glyphs: origin.glyphs,
              galaxy: origin.galaxyNumber,
              steps: origin.steps
            })}
          </FieldDescription>
        )}
      </Field>
      {category !== 'freighter' && (
        <Field orientation="horizontal">
          <Checkbox
            id={`workshop-legacy-${mode}`}
            checked={legacy}
            onCheckedChange={(checked) => {
              legacyRef.current = checked === true
              setLegacy(checked === true)
              if (seedShape.test(typed.trim())) void show(typed.trim())
            }}
          />
          <div className="flex flex-col gap-1">
            <FieldLabel htmlFor={`workshop-legacy-${mode}`}>{text.legacyColours}</FieldLabel>
            <FieldDescription>{text.legacyColoursHint}</FieldDescription>
          </div>
        </Field>
      )}
      {category === 'freighter' && (
        <Field>
          <FieldLabel htmlFor={`workshop-home-seed-${mode}`}>
            {copy.delivery.equipHomeSeed}
          </FieldLabel>
          <div className="flex flex-wrap gap-2">
            <Input
              id={`workshop-home-seed-${mode}`}
              className="max-w-xs"
              value={homeSeed}
              placeholder="0x175000B001FFD"
              spellCheck={false}
              onChange={(event) => {
                setHomeSeed(event.target.value)
                homeSeedRef.current = event.target.value
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && seedValid) void show(typed.trim())
              }}
            />
            <Button
              variant="outline"
              disabled={busy || !seedValid}
              onClick={() => {
                const drawn = randomSeed()
                setHomeSeed(drawn)
                homeSeedRef.current = drawn
                void show(typed.trim())
              }}
            >
              <DicesIcon data-icon="inline-start" />
              {text.generate}
            </Button>
            <Button
              variant="outline"
              disabled={busy || !seedValid}
              onClick={() => void show(typed.trim())}
            >
              <EyeIcon data-icon="inline-start" />
              {text.show}
            </Button>
          </div>
          <FieldDescription>
            {text.homeSeedHint}
            {homeAddress &&
              ' ' +
                formatMessage(text.homeAddress, {
                  glyphs: homeAddress.glyphs,
                  galaxy: homeAddress.galaxyNumber
                })}
          </FieldDescription>
          <div className="flex flex-wrap items-end gap-2">
            <Field className="max-w-48">
              <FieldLabel htmlFor={`workshop-glyphs-${mode}`}>{text.glyphsLabel}</FieldLabel>
              <Input
                id={`workshop-glyphs-${mode}`}
                value={glyphs}
                maxLength={15}
                placeholder="01750B001FFD"
                spellCheck={false}
                onChange={(event) => setGlyphs(event.target.value)}
              />
            </Field>
            <Field className="max-w-28">
              <FieldLabel htmlFor={`workshop-galaxy-${mode}`}>{text.galaxyLabel}</FieldLabel>
              <Input
                id={`workshop-galaxy-${mode}`}
                type="number"
                min={1}
                max={256}
                value={galaxy}
                onChange={(event) => setGalaxy(event.target.value)}
              />
            </Field>
            <Button
              variant="outline"
              disabled={busy || !fromGlyphs || !seedValid}
              onClick={() => {
                if (!fromGlyphs) return
                setHomeSeed(fromGlyphs)
                homeSeedRef.current = fromGlyphs
                void show(typed.trim())
              }}
            >
              {text.useAddress}
            </Button>
          </div>
        </Field>
      )}
      {tried !== null && (
        <div>
          <Badge variant="secondary">
            {formatMessage(text.found, { tries: tried.toLocaleString() })}
          </Badge>
        </div>
      )}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{text.errors[error]}</AlertDescription>
        </Alert>
      )}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex min-w-0 flex-col gap-3">
          {model ? (
            <ModelPreviewCanvas
              model={model}
              hidden={noneHidden}
              tint={null}
              partColors={noColors}
              reset={reset}
              surfaces={surfaces}
              fetchTexture={fetchTexture}
              tall
              onLoaded={onLoaded}
              onError={onError}
            />
          ) : (
            <Empty className="min-h-[440px] border">
              <EmptyHeader>
                <EmptyMedia variant="icon">{busy ? <Spinner /> : <BoxIcon />}</EmptyMedia>
                <EmptyTitle>{busy ? text.building : text.empty}</EmptyTitle>
              </EmptyHeader>
            </Empty>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!model}
              onClick={() => setReset(reset + 1)}
            >
              {copy.preview.reset}
            </Button>
            <p className="text-sm text-muted-foreground">{copy.preview.hint}</p>
          </div>
          {colors.length > 0 && (
            <Field>
              <FieldLabel>{text.seedColorsTitle}</FieldLabel>
              <div className="flex flex-wrap gap-1">
                {colors.map((slot) => (
                  <Badge key={keyOf(slot)} variant="outline">
                    {swatch(slot.color)}
                    {slotLabel(slot)}
                  </Badge>
                ))}
              </div>
            </Field>
          )}
          {textureGroups.length > 0 && (
            <Field>
              <FieldLabel>{text.seedTexturesTitle}</FieldLabel>
              <div className="flex flex-wrap gap-1">
                {textureGroups
                  .filter((entry) => entry.chosen)
                  .map((entry) => (
                    <Badge key={`${entry.layer}/${entry.group}`} variant="outline">
                      {layerLabel(entry.layer, entry.group)} {textureLabel(entry.chosen)}
                    </Badge>
                  ))}
              </div>
            </Field>
          )}
          {drawn.length > 0 && (
            <Field>
              <FieldLabel>{text.detailsTitle}</FieldLabel>
              <div className="flex flex-wrap gap-1">
                {drawn.map((part, index) => (
                  <Badge key={`${part.id}-${index}`} variant={part.rare ? 'default' : 'outline'}>
                    {groupLabel(part.group)} {partLabel(part.group, part.id)}
                  </Badge>
                ))}
              </div>
            </Field>
          )}
        </div>
        {mode === 'build' && (
          <div className="flex flex-col gap-6">
            {activeSlot && category !== 'freighter' && (
              <FieldSet>
                <FieldLegend>{text.colorTitle}</FieldLegend>
                <FieldDescription>{text.colorHint}</FieldDescription>
                <ToggleGroup
                  variant="outline"
                  size="sm"
                  className="flex-wrap"
                  value={[keyOf(activeSlot)]}
                  onValueChange={(value) => value[0] && setSlotKey(value[0] as string)}
                >
                  {colors.map((slot) => (
                    <ToggleGroupItem key={keyOf(slot)} value={keyOf(slot)}>
                      {swatch(wantedColor(slot) ?? slot.color)}
                      {slotLabel(slot)}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
                <div className="flex flex-wrap gap-1">
                  <Button
                    size="sm"
                    variant={activeColor ? 'outline' : 'secondary'}
                    disabled={busy}
                    onClick={() => {
                      const next = {
                        ...look,
                        colors: look.colors.filter((entry) => keyOf(entry) !== keyOf(activeSlot))
                      }
                      setLook(next)
                      void search(pinned, next)
                    }}
                  >
                    {text.anyPart}
                  </Button>
                  {activeSlot.palette.map((color, index) => {
                    const active = activeColor !== null && sameRgb(activeColor, color)
                    return (
                      <Button
                        key={index}
                        size="icon-sm"
                        variant="outline"
                        aria-label={`${slotLabel(activeSlot)} ${index + 1}`}
                        aria-pressed={active}
                        disabled={busy}
                        className={active ? 'ring-2 ring-ring' : undefined}
                        style={{ backgroundColor: cssColor(color) }}
                        onClick={() => {
                          const next = {
                            ...look,
                            colors: [
                              ...look.colors.filter((entry) => keyOf(entry) !== keyOf(activeSlot)),
                              { family: activeSlot.family, sample: activeSlot.sample, color }
                            ]
                          }
                          setLook(next)
                          void search(pinned, next)
                        }}
                      />
                    )
                  })}
                </div>
              </FieldSet>
            )}
            {textureGroups.length > 0 && (
              <FieldSet>
                <FieldLegend>{text.texturesTitle}</FieldLegend>
                <FieldGroup>
                  {textureGroups.map((group) => {
                    const id = `workshop-texture-${group.layer}-${group.group}`
                    const items = [
                      { value: anyPart, label: text.anyPart },
                      ...group.options.map((name) => ({ value: name, label: textureLabel(name) }))
                    ]
                    return (
                      <Field key={id}>
                        <FieldLabel htmlFor={id}>{layerLabel(group.layer, group.group)}</FieldLabel>
                        <Select
                          items={items}
                          value={wantedTexture(group) ?? anyPart}
                          onValueChange={(value) => {
                            const others = look.textures.filter(
                              (entry) => entry.layer !== group.layer || entry.group !== group.group
                            )
                            const next = {
                              ...look,
                              textures:
                                value === anyPart
                                  ? others
                                  : [
                                      ...others,
                                      {
                                        layer: group.layer,
                                        group: group.group,
                                        name: value as string
                                      }
                                    ]
                            }
                            setLook(next)
                            void search(pinned, next)
                          }}
                        >
                          <SelectTrigger id={id} disabled={busy}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {items.map((item) => (
                                <SelectItem key={item.value} value={item.value}>
                                  {item.label}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </Field>
                    )
                  })}
                </FieldGroup>
              </FieldSet>
            )}
            <FieldSet>
              <FieldLegend>{text.partsTitle}</FieldLegend>
              <FieldDescription>{text.partsHint}</FieldDescription>
              {partLists(groups)}
            </FieldSet>
          </div>
        )}
      </div>
    </>
  )
}
