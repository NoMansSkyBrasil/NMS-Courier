import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { CatalogRepository } from './catalog-repository'

const temporaryDirectories: string[] = []

function createCatalog(entries: unknown[]): CatalogRepository {
  const userDataPath = mkdtempSync(join(tmpdir(), 'nms-courier-catalog-'))
  temporaryDirectories.push(userDataPath)
  const generationPath = join(userDataPath, 'catalog', 'generations', 'steam-test')
  mkdirSync(generationPath, { recursive: true })
  writeFileSync(
    join(generationPath, 'core-catalog.json'),
    JSON.stringify({
      installation: { productVersion: '179666' },
      domains: { substance: 1, product: 1, technology: 0 },
      entries
    })
  )
  return new CatalogRepository(userDataPath)
}

afterEach(() => {
  while (temporaryDirectories.length) rmSync(temporaryDirectories.pop()!, { recursive: true, force: true })
})

describe('catalog repository', () => {
  it('reports unavailable when no private generation exists', () => {
    const userDataPath = mkdtempSync(join(tmpdir(), 'nms-courier-catalog-'))
    temporaryDirectories.push(userDataPath)
    expect(new CatalogRepository(userDataPath).getStatus().state).toBe('unavailable')
  })

  it('returns localized, domain-scoped search results without exposing source paths', () => {
    const repository = createCatalog([
      {
        entryKey: 'substance:FUEL1',
        gameId: 'FUEL1',
        domain: 'substance',
        category: null,
        localizations: { 'pt-BR': { name: 'Carbono', subtitle: 'Substância', description: 'Combustível.' } }
      },
      {
        entryKey: 'product:ATLAS_SEED',
        gameId: 'ATLAS_SEED',
        domain: 'product',
        category: 'Curiosity',
        localizations: { 'pt-BR': { name: 'Semente do Atlas', subtitle: '', description: '' } }
      }
    ])

    expect(repository.getStatus()).toMatchObject({ state: 'available', entryCount: 2, locales: ['pt-BR'] })
    expect(repository.search({ query: 'carbon', locale: 'pt-BR', domain: 'substance', limit: 10 })).toEqual({
      total: 1,
      entries: [
        {
          entryKey: 'substance:FUEL1', gameId: 'FUEL1', domain: 'substance', category: null,
          name: 'Carbono', subtitle: 'Substância', description: 'Combustível.'
        }
      ]
    })
  })
})
