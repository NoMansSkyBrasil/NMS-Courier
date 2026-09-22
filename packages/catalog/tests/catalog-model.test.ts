import { describe, expect, it } from 'vitest'

import { createCatalogEntryKey, validateCatalogGeneration } from '../src/index.js'

const sourceHash = 'a'.repeat(64)

describe('catalog identity model', () => {
  it('keeps a Game ID distinct from its localized display name', () => {
    const entryKey = createCatalogEntryKey('substance', 'FUEL1')

    const issues = validateCatalogGeneration({
      entries: [{
        domain: 'substance',
        gameId: 'FUEL1',
        category: 'fuel',
        sourceTable: 'METADATA/REALITY/TABLES/NMS_REALITY_GCSUBSTANCETABLE.MBIN',
        sourceHash
      }],
      localizations: [{
        entryKey,
        locale: 'en-US',
        displayName: 'Carbon',
        subtitle: null,
        description: null,
        sourceLocator: 'LANGUAGE/NMS_LOC1_ENGLISH.MBIN:FUEL1',
        isFallback: false
      }],
      relations: []
    })

    expect(entryKey).toBe('substance:FUEL1')
    expect(issues).toEqual([])
  })

  it('preserves unusual Game IDs while safely encoding their application key', () => {
    expect(createCatalogEntryKey('product', '^item_01')).toBe('product:%5Eitem_01')
  })

  it('rejects duplicate localizations and source locators outside game data', () => {
    const entryKey = createCatalogEntryKey('substance', 'FUEL1')
    const issues = validateCatalogGeneration({
      entries: [{
        domain: 'substance',
        gameId: 'FUEL1',
        category: null,
        sourceTable: '../outside.mbin',
        sourceHash
      }],
      localizations: [
        { entryKey, locale: 'en-US', displayName: 'Carbon', subtitle: null, description: null, sourceLocator: 'language/loc.mbin:FUEL1', isFallback: false },
        { entryKey, locale: 'en-US', displayName: 'Carbon', subtitle: null, description: null, sourceLocator: 'language/loc.mbin:FUEL1', isFallback: false }
      ],
      relations: []
    })

    expect(issues.map((issue) => issue.message)).toEqual([
      'Catalog entries require a source table and SHA-256 source hash.',
      'Duplicate localization key: substance:FUEL1:en-US.'
    ])
  })

  it('rejects duplicate entries and references without proven source records', () => {
    const issues = validateCatalogGeneration({
      entries: [
        { domain: 'substance', gameId: 'FUEL1', category: null, sourceTable: '', sourceHash: 'not-a-hash' },
        { domain: 'substance', gameId: 'FUEL1', category: null, sourceTable: 'table', sourceHash }
      ],
      localizations: [{
        entryKey: 'substance:MISSING',
        locale: 'en-US',
        displayName: '',
        subtitle: null,
        description: null,
        sourceLocator: '',
        isFallback: false
      }],
      relations: [{
        sourceEntryKey: 'substance:FUEL1',
        relation: 'recipe_input',
        targetEntryKey: 'product:MISSING',
        ordinal: -1,
        quantity: 0,
        sourceLocator: ''
      }]
    })

    expect(issues).toHaveLength(6)
  })
})
