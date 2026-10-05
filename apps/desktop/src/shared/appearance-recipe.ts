import type { PreviewColor } from './model-preview'

export type AppearanceRecipe = {
  schema: 1
  evidence: 'candidate'
  modelSha256: string
  seed: string
  descriptor: string
  parts: { name: string; visible: boolean; rgba?: PreviewColor }[]
}
export type RecipeImportResult =
  | { state: 'loaded'; recipe: AppearanceRecipe }
  | { state: 'canceled' }
  | { state: 'failed'; reason: 'INVALID_RECIPE' | 'FILE_UNAVAILABLE' }

/** Resolve every explicit binding before changing preview state. */
export function bindAppearanceRecipe(
  recipe: AppearanceRecipe,
  modelSha256: string,
  parts: { id: string; name: string }[]
): { id: string; visible: boolean; rgba?: PreviewColor }[] | null {
  if (recipe.modelSha256 !== modelSha256) return null
  const targets = new Map<string, string[]>()
  for (const part of parts) targets.set(part.name, [...(targets.get(part.name) ?? []), part.id])
  const result: { id: string; visible: boolean; rgba?: PreviewColor }[] = []
  for (const part of recipe.parts) {
    const ids = targets.get(part.name)
    if (ids?.length !== 1) return null
    result.push({ id: ids[0], visible: part.visible, rgba: part.rgba })
  }
  return result
}
