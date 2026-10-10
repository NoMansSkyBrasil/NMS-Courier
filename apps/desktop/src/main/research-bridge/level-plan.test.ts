import { describe, expect, it } from 'vitest'
import { fractionBits, getLevelPlan, isLevelRequest, type LevelStat } from './level-plan'

const stats: LevelStat[] = [
  {
    id: 'TRA_STANDING',
    name: 'The Gek',
    group: 'Standing',
    levels: [-5, -2, 0, 3, 8, 14, 21, 30, 40, 60, 100],
    message: 'quick',
    fractional: false,
    text: 'UI_MEDAL_STANDING'
  },
  {
    id: 'WAR_STANDING',
    name: 'The Vy’keen',
    group: 'Standing',
    levels: [-5, -2, 0, 3, 8, 14, 21, 30, 40, 60, 100],
    message: 'quick',
    fractional: false,
    text: 'UI_MEDAL_STANDING'
  }
]

describe('level plan', () => {
  it('sends every stat of the page with the values of its levels', () => {
    const plan = getLevelPlan(
      { page: 'standings', stats: null, levels: 10, announce: true, notify: true },
      stats
    )
    expect(plan?.changesAccount).toBe(false)
    expect(plan?.steps).toHaveLength(1)
    expect(plan?.steps[0].request?.lines).toEqual([
      'silent=0',
      'raise=10',
      'announce=1',
      'stat=TRA_STANDING,-5,-2,0,3,8,14,21,30,40,60,100,UI_MEDAL_STANDING',
      'stat=WAR_STANDING,-5,-2,0,3,8,14,21,30,40,60,100,UI_MEDAL_STANDING'
    ])
  })

  it('sends only the chosen stats, once each, and can be silent', () => {
    const plan = getLevelPlan(
      {
        page: 'standings',
        stats: ['WAR_STANDING', 'WAR_STANDING'],
        levels: 1,
        announce: false,
        notify: false
      },
      stats
    )
    expect(plan?.steps[0].request?.lines).toEqual([
      'silent=1',
      'raise=1',
      'announce=0',
      'stat=WAR_STANDING,-5,-2,0,3,8,14,21,30,40,60,100,UI_MEDAL_STANDING'
    ])
  })

  it('refuses a stat the page does not offer, an empty choice and a number of levels out of range', () => {
    const request = { page: 'standings' as const, announce: true, notify: true }
    expect(getLevelPlan({ ...request, stats: ['MONEY'], levels: 1 }, stats)).toBeNull()
    expect(getLevelPlan({ ...request, stats: [], levels: 1 }, stats)).toBeNull()
    expect(getLevelPlan({ ...request, stats: null, levels: 0 }, stats)).toBeNull()
    expect(getLevelPlan({ ...request, stats: null, levels: 11 }, stats)).toBeNull()
    expect(getLevelPlan({ ...request, stats: null, levels: 1.5 }, stats)).toBeNull()
  })

  it('accepts only the result the bridge gives after calling the game', () => {
    const plan = getLevelPlan(
      { page: 'standings', stats: null, levels: 1, announce: true, notify: true },
      stats
    )
    expect(plan?.steps[0].accept?.(['result=given', 'reward_calls=2'])).toBe(true)
    expect(plan?.steps[0].accept?.(['result=unknown_reward'])).toBe(false)
  })

  it('sends a fractional stat as the bits of its level values', () => {
    expect(fractionBits(0)).toBe(0)
    expect(fractionBits(8000)).toBe(0x45fa0000)
    const walked: LevelStat = {
      id: 'DIST_WALKED',
      name: 'On-foot Exploration',
      group: 'Survival Milestones',
      levels: [0, 8000, 10000, 15000, 20000, 25000, 30000, 40000, 50000, 75000, 100000],
      message: 'full',
      fractional: true,
      text: 'DIST_STAT_TITLE'
    }
    const plan = getLevelPlan(
      { page: 'milestones', stats: null, levels: 1, announce: false, notify: true },
      [walked]
    )
    expect(plan?.steps[0].request?.lines[3]).toBe(
      `stat=DIST_WALKED,${walked.levels.map(fractionBits).join(',')},DIST_STAT_TITLE`
    )
  })

  it('checks the shape of a request from the interface', () => {
    expect(
      isLevelRequest({ page: 'milestones', stats: null, levels: 3, announce: true, notify: true })
    ).toBe(true)
    expect(
      isLevelRequest({ page: 'words', stats: null, levels: 3, announce: true, notify: true })
    ).toBe(false)
    expect(
      isLevelRequest({ page: 'milestones', stats: [1], levels: 3, announce: true, notify: true })
    ).toBe(false)
  })
})
