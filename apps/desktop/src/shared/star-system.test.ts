import { describe, expect, it } from 'vitest'
import { parseStarSystemReport } from './star-system'

describe('star system report', () => {
  it('reads the seed and the ships', () => {
    const report = parseStarSystemReport(
      [
        'state=read',
        'seed=0x000175000B001FFD',
        'ships=2',
        'ship=0 class=2 role=0 faction=1 frigate=11 seed=0x5EEDC0DE70FAE007 hint=',
        'ship=1 class=0 role=2 faction=3 frigate=11 seed=0x8C968767B3282F13 hint=PIRATE'
      ].join('\n')
    )
    expect(report).toEqual({
      state: 'read',
      seed: '0x000175000B001FFD',
      ships: [
        {
          index: 0,
          shipClass: 2,
          shipRole: 0,
          faction: 1,
          frigateClass: 11,
          seed: '0x5EEDC0DE70FAE007',
          hint: ''
        },
        {
          index: 1,
          shipClass: 0,
          shipRole: 2,
          faction: 3,
          frigateClass: 11,
          seed: '0x8C968767B3282F13',
          hint: 'PIRATE'
        }
      ]
    })
  })

  it('is unavailable without a system or with anything else', () => {
    expect(parseStarSystemReport('state=no_system\n')).toEqual({ state: 'unavailable' })
    expect(parseStarSystemReport('')).toEqual({ state: 'unavailable' })
    expect(parseStarSystemReport('state=read\nseed=nonsense\n')).toEqual({ state: 'unavailable' })
  })
})
