import { describe, expect, it } from 'vitest'

import {
  classifyTechnologyForDelivery,
  isPermanentlyBlockedTechnologyId,
  selectTechnologiesForDelivery,
  type TechnologyDefinitionFlags
} from '../src/index.js'

function entry(id: string, overrides: Partial<TechnologyDefinitionFlags> = {}): TechnologyDefinitionFlags {
  return {
    id,
    category: 'Suit',
    brokenSlotTech: false,
    isTemplate: false,
    procedural: false,
    repairTech: false,
    teach: true,
    wikiEnabled: true,
    ...overrides
  }
}

describe('technology delivery policy', () => {
  it('allows ordinary learnable technologies', () => {
    expect(classifyTechnologyForDelivery(entry('UT_JET'))).toBe('deliverable')
    expect(classifyTechnologyForDelivery(entry('VEHICLE_GUN', { category: 'Exocraft', teach: false }))).toBe('deliverable')
    expect(classifyTechnologyForDelivery(entry('T_SHIP_GOLD', { teach: false, wikiEnabled: false }))).toBe('deliverable')
  })

  it('refuses defective entries by structure, including IDs added by a later game version', () => {
    expect(classifyTechnologyForDelivery(entry('NEWTHING1', { brokenSlotTech: true }))).toBe('blocked_damaged')
    expect(classifyTechnologyForDelivery(entry('NEWTHING2', { category: 'Maintenance' }))).toBe('blocked_maintenance')
    expect(classifyTechnologyForDelivery(entry('NEWTHING3', { isTemplate: true }))).toBe('blocked_template')
    expect(classifyTechnologyForDelivery(entry('NEWTHING4', { procedural: true }))).toBe('blocked_template')
    expect(classifyTechnologyForDelivery(entry('NEWTHING5', { repairTech: true }))).toBe('blocked_repair')
    expect(classifyTechnologyForDelivery(entry('NEWTHING6', { wikiEnabled: false }))).toBe('blocked_hidden')
  })

  it('keeps reviewed IDs blocked even if a later table presents them as ordinary', () => {
    for (const id of ['SHIPSLOT_DMG1', 'WEAPSENT_DMG4', 'MAINT_TECH1', 'EXOPOD_TECH2', 'OBSOLETE', 'DUMMY_SCAN', 'SPIDERBRAIN', 'FLAME', 'BOLT_SM']) {
      expect(isPermanentlyBlockedTechnologyId(id)).toBe(true)
      expect(classifyTechnologyForDelivery(entry(id))).toBe('blocked_id')
    }
  })

  it('refuses entries it cannot read', () => {
    expect(classifyTechnologyForDelivery(entry('UT_JET', { teach: null }))).toBe('blocked_layout')
    expect(classifyTechnologyForDelivery(entry('UT_JET', { category: null }))).toBe('blocked_layout')
    expect(classifyTechnologyForDelivery(entry('bad id'))).toBe('blocked_layout')
  })

  it('resolves the three delivery modes and never selects a blocked or unknown entry', () => {
    const table = [entry('UT_JET'), entry('STRONGLASER'), entry('SHIPSLOT_DMG1', { brokenSlotTech: true }), entry('MAINT_TECH1', { category: 'Maintenance' })]
    expect(selectTechnologiesForDelivery({ mode: 'all' }, table)).toEqual({ ids: ['UT_JET', 'STRONGLASER'], refused: [] })
    expect(selectTechnologiesForDelivery({ mode: 'one', id: 'UT_JET' }, table).ids).toEqual(['UT_JET'])
    expect(selectTechnologiesForDelivery({ mode: 'one', id: 'SHIPSLOT_DMG1' }, table)).toEqual({
      ids: [],
      refused: [{ id: 'SHIPSLOT_DMG1', reason: 'blocked_damaged' }]
    })
    expect(selectTechnologiesForDelivery({ mode: 'several', ids: ['STRONGLASER', 'MAINT_TECH1', 'NOPE', 'STRONGLASER'] }, table)).toEqual({
      ids: ['STRONGLASER'],
      refused: [
        { id: 'MAINT_TECH1', reason: 'blocked_maintenance' },
        { id: 'NOPE', reason: 'unknown_id' }
      ]
    })
  })
})
