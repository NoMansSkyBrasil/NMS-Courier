import { useState } from 'react'
import { bindAppearanceRecipe, type AppearanceRecipe } from '../../../shared/appearance-recipe'
import type { PreviewColor } from '../../../shared/model-preview'
import { useLocale } from '@renderer/i18n/locale-provider'
import { appearanceCopy } from '@renderer/i18n/appearance-copy'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Alert, AlertDescription } from './ui/alert'

type Props = {
  modelSha256: string | null
  parts: { id: string; name: string }[]
  onApply: (parts: { id: string; visible: boolean; rgba?: PreviewColor }[]) => void
}
export function AppearanceRecipeControls({
  modelSha256,
  parts,
  onApply
}: Props): React.JSX.Element {
  const { locale } = useLocale()
  const copy = appearanceCopy[locale as keyof typeof appearanceCopy] ?? appearanceCopy['en-US']
  const [recipe, setRecipe] = useState<AppearanceRecipe | null>(null)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<'failed' | 'mismatch' | 'applied' | null>(null)
  const open = async (): Promise<void> => {
    setBusy(true)
    try {
      const result = await window.nms.selectAppearanceRecipe()
      if (result.state === 'loaded') {
        setRecipe(result.recipe)
        setNotice(null)
      } else if (result.state === 'failed') setNotice('failed')
    } catch {
      setNotice('failed')
    } finally {
      setBusy(false)
    }
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.title}</CardTitle>
        <CardDescription>{copy.help}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Badge variant="secondary">{copy.candidate}</Badge>
        <Alert>
          <AlertDescription>{copy.warning}</AlertDescription>
        </Alert>
        {recipe && (
          <p className="break-all text-sm">
            {copy.seed}: {recipe.seed}
          </p>
        )}
        {notice && (
          <Alert variant={notice === 'applied' ? 'default' : 'destructive'}>
            <AlertDescription>{copy[notice]}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        <Button variant="outline" disabled={busy} onClick={() => void open()}>
          {copy.open}
        </Button>
        <Button
          disabled={busy || !recipe || !modelSha256 || !parts.length}
          onClick={() => {
            const bound =
              recipe && modelSha256 ? bindAppearanceRecipe(recipe, modelSha256, parts) : null
            if (!bound) {
              setNotice('mismatch')
              return
            }
            onApply(bound)
            setNotice('applied')
          }}
        >
          {copy.apply}
        </Button>
      </CardFooter>
    </Card>
  )
}
