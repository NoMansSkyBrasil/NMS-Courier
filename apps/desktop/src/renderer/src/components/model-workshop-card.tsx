import { useCallback, useEffect, useRef, useState } from 'react'
import { BoxIcon, DicesIcon, EraserIcon, EyeIcon, SendIcon } from 'lucide-react'
import type { PreviewModel, PreviewColor } from '../../../shared/model-preview'
import { workshopCategories, workshopKinds } from '../../../shared/model-workshop'
import type {
  WorkshopCategory,
  WorkshopColor,
  WorkshopFailure,
  WorkshopPaint,
  WorkshopPart,
  WorkshopPartGroup,
  WorkshopWantedPart
} from '../../../shared/model-workshop'
import { Alert, AlertDescription } from '@renderer/components/ui/alert'
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

export function ModelWorkshopCard({ mode }: { mode: WorkshopMode }): React.JSX.Element {
  const { copy } = useLocale()
  const text = copy.workshop
  const [category, setCategory] = useState<WorkshopCategory>('starship')
  const [kind, setKind] = useState<string>('fighter')
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
        <WorkshopModel key={`${category}/${kind}`} mode={mode} category={category} kind={kind} />
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
  kind
}: {
  mode: WorkshopMode
  category: WorkshopCategory
  kind: string
}): React.JSX.Element {
  const { copy } = useLocale()
  const text = copy.workshop
  const [typed, setTyped] = useState('')
  const [model, setModel] = useState<PreviewModel | null>(null)
  const [parts, setParts] = useState<WorkshopPart[]>([])
  const [paint, setPaint] = useState<WorkshopPaint | null>(null)
  const [groups, setGroups] = useState<WorkshopPartGroup[]>([])
  const [paintColors, setPaintColors] = useState<WorkshopColor[]>([])
  const [pinned, setPinned] = useState<Record<string, string>>({})
  const [wantedPaint, setWantedPaint] = useState<WorkshopColor | null>(null)
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
        const result = await window.nms.workshopModel({ category, kind, seed })
        if (mine !== request.current) return
        if (result.state === 'built') {
          setModel(result.model)
          setParts(result.parts)
          setPaint(result.paint)
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
          setPaintColors(result.paintColors)
        })
        .catch(() => undefined)
    }
    // Started from a callback: the effect itself changes no state.
    void Promise.resolve().then(() => load(randomSeed()))
    return () => {
      active = false
    }
  }, [mode, category, kind, load])

  // A seed with the chosen parts and colour, or any seed when nothing is chosen.
  const search = async (
    pins: Record<string, string>,
    color: WorkshopColor | null
  ): Promise<void> => {
    const { wanted } = reachable(groups, pins)
    if (wanted.length === 0 && !color) {
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
        parts: wanted,
        paint: color
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
  const chosen = pinned
  const hasChoices = Object.keys(chosen).length > 0 || wantedPaint !== null
  const drawn = parts.filter((part) => part.alternatives > 1)
  const onLoaded = useCallback(() => undefined, [])
  const onError = useCallback(() => setError('GAME_FILES_UNREADABLE'), [])

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
      const value = chosen[key] ?? anyPart
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
                const changed = { ...chosen }
                if (next === anyPart) delete changed[key]
                else changed[key] = next as string
                const kept = reachable(groups, changed).pins
                setPinned(kept)
                void search(kept, wantedPaint)
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

  const swatches = (label: string, colors: readonly WorkshopColor[]): React.ReactNode => (
    <Field orientation="horizontal">
      <FieldLabel className="w-24">{label}</FieldLabel>
      <div className="flex gap-1">
        {colors.map((color, index) => (
          <span
            key={index}
            className="size-6 rounded-md border"
            style={{ backgroundColor: cssColor(color) }}
          />
        ))}
      </div>
    </Field>
  )

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
            onClick={() =>
              void (mode === 'build' ? search(chosen, wantedPaint) : show(randomSeed()))
            }
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
                setWantedPaint(null)
                setTried(null)
              }}
            >
              <EraserIcon data-icon="inline-start" />
              {text.clearParts}
            </Button>
          )}
          {category === 'starship' && model && seedValid && (
            <Button
              variant="outline"
              render={
                <a
                  href={`#starships/obtain?kind=${kind}&seed=${encodeURIComponent(typed.trim())}`}
                />
              }
            >
              <SendIcon data-icon="inline-start" />
              {text.getInGame}
            </Button>
          )}
        </div>
        {mode === 'view' && <FieldDescription>{text.seedHint}</FieldDescription>}
      </Field>
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
        <div className="flex min-w-0 flex-col gap-2">
          {model ? (
            <ModelPreviewCanvas
              model={model}
              hidden={noneHidden}
              tint={null}
              partColors={noColors}
              reset={reset}
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
          {paint && (
            <FieldSet>
              <FieldLegend variant="label">{text.seedColorsTitle}</FieldLegend>
              {swatches(text.paintLabel, paint.paint)}
              {swatches(text.undercoatLabel, paint.undercoat)}
            </FieldSet>
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
            {paintColors.length > 0 && (
              <FieldSet>
                <FieldLegend>{text.colorTitle}</FieldLegend>
                <FieldDescription>{text.colorHint}</FieldDescription>
                <div className="flex flex-wrap gap-1">
                  <Button
                    size="sm"
                    variant={wantedPaint ? 'outline' : 'secondary'}
                    disabled={busy}
                    onClick={() => {
                      setWantedPaint(null)
                      void search(chosen, null)
                    }}
                  >
                    {text.anyPart}
                  </Button>
                  {paintColors.map((color, index) => {
                    const active =
                      wantedPaint !== null && wantedPaint.every((value, at) => value === color[at])
                    return (
                      <Button
                        key={index}
                        size="icon-sm"
                        variant="outline"
                        aria-label={`${text.paintLabel} ${index + 1}`}
                        aria-pressed={active}
                        disabled={busy}
                        className={active ? 'ring-2 ring-ring' : undefined}
                        style={{ backgroundColor: cssColor(color) }}
                        onClick={() => {
                          setWantedPaint(color)
                          void search(chosen, color)
                        }}
                      />
                    )
                  })}
                </div>
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
