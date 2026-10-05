import { describe, expect, it } from 'vitest'
import { validateAppearanceRecipe } from './appearance-recipe'
import { bindAppearanceRecipe } from '../../shared/appearance-recipe'

const recipe = {
  schema: 1,
  evidence: 'candidate',
  modelSha256: 'a'.repeat(64),
  seed: '0x7',
  descriptor: 'models/common/spacecraft/fighters/fighter_proc.descriptor.mbin',
  parts: [{ name: 'Wing', visible: true, rgba: [1, 0, 0, 1] }]
}
describe('experimental appearance recipe boundary', () => {
  it('extracts a recipe from a search report without exposing the report', () => {
    expect(validateAppearanceRecipe({ preview_recipe: recipe, private_data: 'ignored' })).toEqual(
      recipe
    )
  })
  it('rejects fabricated verified evidence and arbitrary fields', () => {
    expect(() => validateAppearanceRecipe({ ...recipe, evidence: 'verified' })).toThrow(
      'INVALID_RECIPE'
    )
    expect(() => validateAppearanceRecipe({ ...recipe, execute: 'code' })).toThrow('INVALID_RECIPE')
  })
  it('rejects nonfinite channels, duplicate bindings and nonboolean visibility', () => {
    for (const parts of [
      [{ name: 'Wing', visible: true, rgba: [NaN, 0, 0, 1] }],
      [...recipe.parts, ...recipe.parts],
      [{ name: 'Wing', visible: 'true' }]
    ])
      expect(() => validateAppearanceRecipe({ ...recipe, parts })).toThrow('INVALID_RECIPE')
  })
  it('rejects seed overflow and external descriptor paths', () => {
    expect(() => validateAppearanceRecipe({ ...recipe, seed: '0x10000000000000000' })).toThrow(
      'INVALID_RECIPE'
    )
    expect(() =>
      validateAppearanceRecipe({ ...recipe, descriptor: 'https://example.com/a' })
    ).toThrow('INVALID_RECIPE')
  })
  it('binds the matching model and changes only explicit mesh targets', () => {
    expect(
      bindAppearanceRecipe(validateAppearanceRecipe(recipe), recipe.modelSha256, [
        { id: '1', name: 'Wing' },
        { id: '2', name: 'Body' }
      ])
    ).toEqual([{ id: '1', visible: true, rgba: [1, 0, 0, 1] }])
  })
  it('rejects mismatching models, absent meshes and ambiguous names atomically', () => {
    const parsed = validateAppearanceRecipe(recipe)
    expect(bindAppearanceRecipe(parsed, 'b'.repeat(64), [{ id: '1', name: 'Wing' }])).toBeNull()
    expect(bindAppearanceRecipe(parsed, recipe.modelSha256, [{ id: '1', name: 'Body' }])).toBeNull()
    expect(
      bindAppearanceRecipe(parsed, recipe.modelSha256, [
        { id: '1', name: 'Wing' },
        { id: '2', name: 'Wing' }
      ])
    ).toBeNull()
  })
})
