import { open } from 'node:fs/promises'
import type { AppearanceRecipe, RecipeImportResult } from '../../shared/appearance-recipe'
import type { PreviewColor } from '../../shared/model-preview'

const maxRecipeBytes = 4 * 1024 * 1024
function invalid(): never {
  throw new Error('INVALID_RECIPE')
}
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) invalid()
  return value as Record<string, unknown>
}
function keys(value: Record<string, unknown>, allowed: string[]): void {
  if (Object.keys(value).some((key) => !allowed.includes(key))) invalid()
}

export function validateAppearanceRecipe(value: unknown): AppearanceRecipe {
  const report = object(value)
  const recipe = object('preview_recipe' in report ? report.preview_recipe : report)
  keys(recipe, ['schema', 'evidence', 'modelSha256', 'seed', 'descriptor', 'parts'])
  if (
    recipe.schema !== 1 ||
    recipe.evidence !== 'candidate' ||
    typeof recipe.modelSha256 !== 'string' ||
    !/^[0-9a-f]{64}$/.test(recipe.modelSha256) ||
    typeof recipe.seed !== 'string' ||
    !/^0x[0-9a-f]{1,16}$/i.test(recipe.seed) ||
    typeof recipe.descriptor !== 'string' ||
    recipe.descriptor.length > 255 ||
    !/^models\/[a-z0-9_/.-]+\.descriptor\.mbin$/.test(recipe.descriptor) ||
    recipe.descriptor.split('/').includes('..') ||
    !Array.isArray(recipe.parts) ||
    !recipe.parts.length ||
    recipe.parts.length > 4096
  )
    invalid()
  const names = new Set<string>()
  const parts = recipe.parts.map((item) => {
    const part = object(item)
    keys(part, ['name', 'visible', 'rgba'])
    if (
      typeof part.name !== 'string' ||
      !part.name.length ||
      part.name.length > 128 ||
      part.name.includes('\0') ||
      names.has(part.name) ||
      typeof part.visible !== 'boolean'
    )
      invalid()
    names.add(part.name)
    if (
      part.rgba !== undefined &&
      (!Array.isArray(part.rgba) ||
        part.rgba.length !== 4 ||
        part.rgba.some(
          (value) => typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 1
        ))
    )
      invalid()
    return {
      name: part.name,
      visible: part.visible,
      ...(part.rgba === undefined ? {} : { rgba: part.rgba as PreviewColor })
    }
  })
  return {
    schema: 1,
    evidence: 'candidate',
    modelSha256: recipe.modelSha256,
    seed: recipe.seed,
    descriptor: recipe.descriptor,
    parts
  }
}

export async function importAppearanceRecipe(path: string): Promise<RecipeImportResult> {
  try {
    const handle = await open(path, 'r')
    let bytes: Buffer
    try {
      const stat = await handle.stat()
      if (!stat.isFile() || stat.size < 2 || stat.size > maxRecipeBytes) invalid()
      bytes = Buffer.alloc(stat.size)
      let offset = 0
      while (offset < bytes.length) {
        const read = await handle.read(bytes, offset, bytes.length - offset, offset)
        if (!read.bytesRead) invalid()
        offset += read.bytesRead
      }
      if ((await handle.stat()).size !== stat.size) invalid()
    } finally {
      await handle.close()
    }
    return {
      state: 'loaded',
      recipe: validateAppearanceRecipe(
        JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes))
      )
    }
  } catch (error) {
    return {
      state: 'failed',
      reason:
        (error instanceof Error && error.message === 'INVALID_RECIPE') ||
        error instanceof SyntaxError ||
        error instanceof TypeError
          ? 'INVALID_RECIPE'
          : 'FILE_UNAVAILABLE'
    }
  }
}
