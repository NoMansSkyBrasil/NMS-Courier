import { describe, expect, it } from 'vitest'
import { giftRequestLines, isGiftRequest, parseGiftResult } from './player-gift'

describe('player gift', () => {
  it('writes the request the bridge reads', () => {
    expect(giftRequestLines('list')).toEqual(['mode=list'])
    expect(
      giftRequestLines({ slot: 1, user: 'ST_76561190000000000', item: 'FUEL1', amount: 250 })
    ).toEqual(['mode=send', 'slot=1', 'user=ST_76561190000000000', 'item=FUEL1', 'amount=250'])
  })

  it('refuses a request the bridge would refuse', () => {
    const good = { slot: 0, user: 'A', item: 'FUEL1', amount: 1 }
    expect(isGiftRequest(good)).toBe(true)
    expect(isGiftRequest({ ...good, slot: 36 })).toBe(false)
    expect(isGiftRequest({ ...good, user: 'has space' })).toBe(false)
    expect(isGiftRequest({ ...good, item: 'lower' })).toBe(false)
    expect(isGiftRequest({ ...good, amount: 0 })).toBe(false)
    expect(isGiftRequest({ ...good, amount: 10000 })).toBe(false)
    expect(giftRequestLines({ ...good, amount: 1.5 })).toBeNull()
  })

  it('reads the answer and keeps each player once', () => {
    const report = parseGiftResult(
      [
        'result=sent',
        'answer=waiting',
        'player=0,party,ST_1',
        'player=1,party,ST_2',
        'player=4,session,ST_2',
        'player=5,session,ST_3',
        'player=99,session,ST_4',
        'player=6,session,bad id'
      ].join('\n')
    )
    expect(report).toEqual({
      result: 'sent',
      answer: 'waiting',
      players: [
        { slot: 0, party: true, user: 'ST_1' },
        { slot: 1, party: true, user: 'ST_2' },
        { slot: 5, party: false, user: 'ST_3' }
      ]
    })
    expect(parseGiftResult('result=what\nanswer=none')).toBeNull()
    expect(parseGiftResult('')).toBeNull()
  })
})
