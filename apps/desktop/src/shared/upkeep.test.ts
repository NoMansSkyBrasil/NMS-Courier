import { describe, expect, it } from 'vitest'
import {
  isAutoRecharge,
  isRechargeThreshold,
  isRepairRequest,
  rechargeRequestLines,
  repairRequestLines
} from './upkeep'

describe('upkeep', () => {
  it('writes a repair for the inventories behind each choice', () => {
    expect(repairRequestLines(['exosuit', 'multitool'], true)).toEqual([
      'silent=0',
      'inventory=0',
      'inventory=1',
      'inventory=7'
    ])
    expect(repairRequestLines(['ship', 'freighter', 'exocraft'], false)).toEqual([
      'silent=1',
      'inventory=2',
      'inventory=3',
      'inventory=4',
      'inventory=5'
    ])
  })

  it('takes only known inventories, each once', () => {
    expect(isRepairRequest({ groups: ['ship'] })).toBe(true)
    expect(isRepairRequest({ groups: [] })).toBe(false)
    expect(isRepairRequest({ groups: ['ship', 'ship'] })).toBe(false)
    expect(isRepairRequest({ groups: ['base'] })).toBe(false)
    expect(isRepairRequest(null)).toBe(false)
  })

  it('writes a recharge with its threshold', () => {
    expect(rechargeRequestLines(100, true)).toEqual(['silent=0', 'threshold=100'])
    expect(rechargeRequestLines(20, false)).toEqual(['silent=1', 'threshold=20'])
    expect(isRechargeThreshold(0)).toBe(false)
    expect(isRechargeThreshold(101)).toBe(false)
    expect(isRechargeThreshold(20.5)).toBe(false)
  })

  it('checks the automatic recharge settings', () => {
    expect(isAutoRecharge({ enabled: true, minutes: 10, whenLow: true })).toBe(true)
    expect(isAutoRecharge({ enabled: true, minutes: 0, whenLow: true })).toBe(false)
    expect(isAutoRecharge({ enabled: true, minutes: 500, whenLow: false })).toBe(false)
    expect(isAutoRecharge({ minutes: 10 })).toBe(false)
  })
})
