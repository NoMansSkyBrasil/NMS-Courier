import { describe, expect, it } from 'vitest'
import {
  installRequestLines,
  inventoryGroup,
  inventoryKey,
  isInstallRequest,
  parseInstallResult
} from './waiting-technology'

describe('waiting technologies', () => {
  it('names the inventory of a choice', () => {
    expect([0, 1, 2].map(inventoryGroup)).toEqual(['exosuit', 'exosuit', 'exosuit'])
    expect(inventoryGroup(3)).toBe('multitool')
    expect([4, 5, 6].map(inventoryGroup)).toEqual(['ship', 'ship', 'ship'])
    expect([7, 8, 9].map(inventoryGroup)).toEqual(['freighter', 'freighter', 'freighter'])
    expect([10, 11].map(inventoryGroup)).toEqual(['exocraft', 'exocraft'])
    expect(inventoryKey({ choice: 5, owner: 2, x: 0, y: 0 })).toBe('ship:2')
  })

  it('reads the answer of the bridge', () => {
    const report = parseInstallResult(
      [
        'result=listed',
        'entries=3',
        'finished=0',
        'truncated=0',
        'entry=5,0,6,1,HYPERDRIVE,waiting',
        'entry=1,-1,2,0,UT_JET,blocked',
        'entry=11,4,0,0,SUB_GUN,finished',
        'entry=1,-1,2,0,bad id here,waiting',
        'entry=1,-1,2,0,JET1,invented'
      ].join('\r\n')
    )
    expect(report).toEqual({
      result: 'listed',
      truncated: false,
      entries: [
        { choice: 5, owner: 0, x: 6, y: 1, id: 'HYPERDRIVE', state: 'waiting' },
        { choice: 1, owner: -1, x: 2, y: 0, id: 'UT_JET', state: 'blocked' },
        { choice: 11, owner: 4, x: 0, y: 0, id: 'SUB_GUN', state: 'finished' }
      ]
    })
    expect(parseInstallResult('entries=1')).toBeNull()
    expect(parseInstallResult('result=listed\ntruncated=1')?.truncated).toBe(true)
  })

  it('builds only requests the bridge accepts', () => {
    expect(installRequestLines('list')).toEqual(['mode=list'])
    expect(installRequestLines({ slots: null })).toEqual(['mode=finish', 'all=1'])
    expect(
      installRequestLines({
        slots: [
          { choice: 5, owner: 0, x: 6, y: 1 },
          { choice: 1, owner: -1, x: 2, y: 0 }
        ]
      })
    ).toEqual(['mode=finish', 'slot=5,0,6,1', 'slot=1,-1,2,0'])
    const slot = { choice: 5, owner: 0, x: 6, y: 1 }
    expect(installRequestLines({ slots: [slot, slot] })).toBeNull()
    expect(isInstallRequest({ slots: [] })).toBe(false)
    expect(isInstallRequest({ slots: [{ ...slot, choice: 12 }] })).toBe(false)
    expect(isInstallRequest({ slots: [{ ...slot, owner: -2 }] })).toBe(false)
    expect(isInstallRequest({ slots: [{ ...slot, x: 1.5 }] })).toBe(false)
    expect(isInstallRequest({})).toBe(false)
  })
})
