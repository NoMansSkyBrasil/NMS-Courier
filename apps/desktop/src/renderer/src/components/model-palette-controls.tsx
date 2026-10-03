import { useState } from 'react'
import { Color, LinearSRGBColorSpace } from 'three'
import type { PalettePreview, PreviewColor } from '../../../shared/model-preview'
import { useLocale } from '@renderer/i18n/locale-provider'
import { previewCopy } from '@renderer/i18n/preview-copy'
import type { PreviewPart } from './model-preview-canvas'
import { Button } from './ui/button'
import { Alert, AlertDescription } from './ui/alert'
import { Badge } from './ui/badge'
import { Field, FieldGroup, FieldLabel, FieldDescription } from './ui/field'
import { Input } from './ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from './ui/select'
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group'

export function ModelPaletteControls({
  parts,
  onApply
}: {
  parts: PreviewPart[]
  onApply: (part: string, color: PreviewColor) => void
}): React.JSX.Element {
  const { locale } = useLocale()
  const copy = previewCopy[locale as keyof typeof previewCopy] ?? previewCopy['en-US']
  const [seed, setSeed] = useState('0x7')
  const [source, setSource] = useState<string | null>(null)
  const [preview, setPreview] = useState<PalettePreview | null>(null)
  const [family, setFamily] = useState('Paint')
  const [sample, setSample] = useState(['0'])
  const [target, setTarget] = useState('*')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<keyof typeof copy | null>(null)
  const selected = preview?.families.find((row) => row.name === family)
  const color = selected?.colors[Number(sample[0])]
  const calculate = async (): Promise<void> => {
    setError(null)
    setBusy(true)
    try {
      const result = await window.nms.previewPaletteSeed(seed)
      if (result.state === 'calculated') setPreview(result.preview)
      else setError(result.reason)
    } catch {
      setError('PALETTE_UNAVAILABLE')
    } finally {
      setBusy(false)
    }
  }
  const importPalettes = async (): Promise<void> => {
    setError(null)
    setBusy(true)
    try {
      const result = await window.nms.selectPreviewPalettes()
      if (result.state === 'loaded') {
        setSource(result.name)
        // A new bank invalidates the previous calculation until explicitly recalculated.
        setPreview(null)
      } else if (result.state === 'failed') setError(result.reason)
    } catch {
      setError('FILE_UNAVAILABLE')
    } finally {
      setBusy(false)
    }
  }
  return (
    <FieldGroup>
      <Field>
        <FieldLabel>{copy.palettes}</FieldLabel>
        <FieldDescription>{copy.paletteHelp}</FieldDescription>
        <Button variant="outline" onClick={() => void importPalettes()} disabled={busy}>
          {copy.importPalette}
        </Button>
        {source && <Badge variant="outline">{source}</Badge>}
      </Field>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{copy[error]}</AlertDescription>
        </Alert>
      )}
      <Field data-invalid={error === 'INVALID_SEED'}>
        <FieldLabel htmlFor="palette-seed">{copy.seed}</FieldLabel>
        <Input
          id="palette-seed"
          value={seed}
          maxLength={18}
          aria-invalid={error === 'INVALID_SEED'}
          onChange={(event) => setSeed(event.target.value)}
          disabled={busy}
        />
        <Button variant="outline" onClick={() => void calculate()} disabled={!source || busy}>
          {copy.calculatePalette}
        </Button>
        {preview && (
          <FieldDescription>
            {copy.calculatedSeed}: {preview.seed}
          </FieldDescription>
        )}
      </Field>
      {preview && (
        <>
          <Field>
            <FieldLabel htmlFor="palette-family">{copy.family}</FieldLabel>
            <Select
              value={family}
              onValueChange={(value) => {
                if (value) setFamily(value)
              }}
            >
              <SelectTrigger id="palette-family" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {preview.families.map((row) => (
                    <SelectItem key={row.name} value={row.name}>
                      {row.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel>{copy.samples}</FieldLabel>
            <ToggleGroup
              variant="outline"
              value={sample}
              onValueChange={(value) => {
                if (value.length) setSample(value)
              }}
              aria-label={copy.samples}
            >
              {selected?.colors.map((entry, index) => (
                <ToggleGroupItem
                  key={index}
                  value={String(index)}
                  aria-label={`${copy.sample} ${index + 1}`}
                >
                  <span
                    className="size-4 rounded-sm border"
                    style={{
                      backgroundColor:
                        '#' +
                        new Color()
                          .setRGB(
                            ...(entry.rgba.slice(0, 3) as [number, number, number]),
                            LinearSRGBColorSpace
                          )
                          .getHexString()
                    }}
                  />
                  {index + 1}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            {color && (
              <FieldDescription>
                {copy.paletteIndex}: {color.lookupIndex + 1}/64
              </FieldDescription>
            )}
          </Field>
          <Field>
            <FieldLabel htmlFor="palette-target">{copy.colorTarget}</FieldLabel>
            <Select
              value={parts.some((part) => part.id === target) ? target : '*'}
              onValueChange={(value) => {
                if (value) setTarget(value)
              }}
            >
              <SelectTrigger id="palette-target" className="w-full">
                <SelectValue>
                  {parts.find((part) => part.id === target)?.name ?? copy.visibleTarget}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="*">{copy.visibleTarget}</SelectItem>
                  {parts.map((part) => (
                    <SelectItem key={part.id} value={part.id}>
                      {part.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Button
              disabled={!parts.length || !color || busy}
              onClick={() => {
                if (color)
                  onApply(parts.some((part) => part.id === target) ? target : '*', color.rgba)
              }}
            >
              {copy.applyColor}
            </Button>
          </Field>
        </>
      )}
      <p className="text-sm text-muted-foreground">{copy.paletteWarning}</p>
    </FieldGroup>
  )
}
