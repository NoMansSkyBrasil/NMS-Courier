import { useCallback, useState } from 'react'
import { BoxIcon, FolderOpenIcon } from 'lucide-react'
import type { PreviewModel, PreviewColor } from '../../../shared/model-preview'
import { useLocale } from '@renderer/i18n/locale'
import { ModelPreviewCanvas, type PreviewPart } from './model-preview-canvas'
import { ModelPaletteControls } from './model-palette-controls'
import { AppearanceRecipeControls } from './appearance-recipe-controls'
import { Button } from './ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card'
import { Badge } from './ui/badge'
import { Alert, AlertDescription } from './ui/alert'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from './ui/empty'
import { Input } from './ui/input'
import { Checkbox } from './ui/checkbox'
import { Field, FieldGroup, FieldLabel, FieldSet, FieldLegend } from './ui/field'

export function ModelPreviewPage(): React.JSX.Element {
  const { copy: messages } = useLocale()
  const copy = messages.preview
  const [model, setModel] = useState<PreviewModel | null>(null)
  const [parts, setParts] = useState<PreviewPart[]>([])
  const [hidden, setHidden] = useState(new Set<string>())
  const [tint, setTint] = useState<string | null>(null)
  const [partColors, setPartColors] = useState(new Map<string, PreviewColor>())
  const [reset, setReset] = useState(0)
  const [query, setQuery] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<keyof typeof copy | null>(null)
  const onLoaded = useCallback((items: PreviewPart[]) => {
    setParts(items)
    setBusy(false)
  }, [])
  const onError = useCallback(() => {
    setError('failed')
    setBusy(false)
  }, [])
  const selectModel = async (): Promise<void> => {
    setBusy(true)
    setError(null)
    try {
      const result = await window.nms.selectPreviewModel()
      if (result.state !== 'loaded') {
        setBusy(false)
        if (result.state === 'failed') setError(result.reason)
        return
      }
      setParts([])
      setHidden(new Set())
      setTint(null)
      setPartColors(new Map())
      setQuery('')
      setModel(result.model)
    } catch {
      setError('FILE_UNAVAILABLE')
      setBusy(false)
    }
  }
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>{copy.title}</CardTitle>
          <CardDescription>{copy.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={() => void selectModel()} disabled={busy}>
              <FolderOpenIcon data-icon="inline-start" />
              {busy ? copy.loading : copy.import}
            </Button>
            <Badge variant="secondary">{copy.stage}</Badge>
            {model && <Badge variant="outline">{model.name}</Badge>}
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{copy[error]}</AlertDescription>
            </Alert>
          )}
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="flex min-w-0 flex-col gap-2">
              {model ? (
                <ModelPreviewCanvas
                  model={model}
                  hidden={hidden}
                  tint={tint}
                  partColors={partColors}
                  reset={reset}
                  onLoaded={onLoaded}
                  onError={onError}
                />
              ) : (
                <Empty className="min-h-[440px] border">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <BoxIcon />
                    </EmptyMedia>
                    <EmptyTitle>{copy.empty}</EmptyTitle>
                  </EmptyHeader>
                </Empty>
              )}
              <p className="text-sm text-muted-foreground">{copy.hint}</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  disabled={!parts.length}
                  onClick={() => setReset(reset + 1)}
                >
                  {copy.reset}
                </Button>
                <Button
                  variant="outline"
                  disabled={!tint && !partColors.size}
                  onClick={() => {
                    setTint(null)
                    setPartColors(new Map())
                  }}
                >
                  {copy.original}
                </Button>
              </div>
            </div>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="preview-tint">{copy.tint}</FieldLabel>
                <Input
                  id="preview-tint"
                  type="color"
                  value={tint ?? '#ffffff'}
                  disabled={!parts.length}
                  onChange={(event) => {
                    setPartColors(new Map())
                    setTint(event.target.value)
                  }}
                />
              </Field>
              <ModelPaletteControls
                parts={parts}
                onApply={(target, color) => {
                  setTint(null)
                  setPartColors((previous) => {
                    const next = new Map(previous)
                    for (const part of parts)
                      if (target === part.id || (target === '*' && !hidden.has(part.id)))
                        next.set(part.id, color)
                    return next
                  })
                }}
              />
              <Field>
                <FieldLabel htmlFor="preview-filter">
                  {copy.parts} ({parts.length - hidden.size}/{parts.length})
                </FieldLabel>
                <Input
                  id="preview-filter"
                  placeholder={copy.filter}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </Field>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!parts.length}
                  onClick={() => setHidden(new Set())}
                >
                  {copy.all}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!parts.length}
                  onClick={() => setHidden(new Set(parts.map((part) => part.id)))}
                >
                  {copy.none}
                </Button>
              </div>
              <FieldSet className="max-h-72 overflow-auto">
                <FieldLegend className="sr-only">{copy.parts}</FieldLegend>
                {parts
                  .filter((part) => part.name.toLowerCase().includes(query.toLowerCase()))
                  .map((part) => (
                    <Field key={part.id} orientation="horizontal">
                      <Checkbox
                        id={part.id}
                        checked={!hidden.has(part.id)}
                        onCheckedChange={(checked) =>
                          setHidden((previous) => {
                            const next = new Set(previous)
                            if (checked) next.delete(part.id)
                            else next.add(part.id)
                            return next
                          })
                        }
                      />
                      <FieldLabel htmlFor={part.id}>{part.name}</FieldLabel>
                    </Field>
                  ))}
              </FieldSet>
            </FieldGroup>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-2">
          <p className="text-sm text-muted-foreground">{copy.warning}</p>
          <p className="text-sm text-muted-foreground">{copy.limits}</p>
        </CardFooter>
      </Card>
      <AppearanceRecipeControls
        key={model?.sha256 ?? 'no-model'}
        modelSha256={model?.sha256 ?? null}
        parts={parts}
        onApply={(bindings) => {
          setTint(null)
          setHidden((previous) => {
            const next = new Set(previous)
            for (const binding of bindings) {
              if (binding.visible) next.delete(binding.id)
              else next.add(binding.id)
            }
            return next
          })
          setPartColors((previous) => {
            const next = new Map(previous)
            for (const binding of bindings) {
              if (binding.rgba) next.set(binding.id, binding.rgba)
              else next.delete(binding.id)
            }
            return next
          })
        }}
      />
    </main>
  )
}
