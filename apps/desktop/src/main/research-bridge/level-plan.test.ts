import { describe, expect, it } from 'vitest'
import { getLevelPlan, isLevelRequest, type LevelStat } from './level-plan'

const stats: LevelStat[] = [
  {
    id: 'TRA_STANDING',
    name: 'The Gek',
    group: 'Standing',
    levels: [-5, -2, 0, 3, 8, 14, 21, 30, 40, 60, 100]
  },
  {
    id: 'WAR_STANDING',
    name: 'The Vy’keen',
    group: 'Standing',
    levels: [-5, -2, 0, 3, 8, 14, 21, 30, 40, 60, 100]
  }
]

describe('level plan', () => {
  it('sends every stat of the page with the values of its levels', () => {
    const plan = getLevelPlan({ page: 'standings', stats: null, levels: 10, notify: true }, stats)
    expect(plan?.changesAccount).toBe(false)
    expect(plan?.steps).toHaveLength(1)
    expect(plan?.steps[0].request?.lines).toEqual([
      'silent=0',
      'raise=10',
      'stat=TRA_STANDING,-5,-2,0,3,8,14,21,30,40,60,100',
      'stat=WAR_STANDING,-5,-2,0,3,8,14,21,30,40,60,100'
    ])
  })

  it('sends only the chosen stats, once each, and can be silent', () => {
    const plan = getLevelPlan(
      { page: 'standings', stats: ['WAR_STANDING', 'WAR_STANDING'], levels: 1, notify: false },
      stats
    )
    expect(plan?.steps[0].request?.lines).toEqual([
      'silent=1',
      'raise=1',
      'stat=WAR_STANDING,-5,-2,0,3,8,14,21,30,40,60,100'
    ])
  })

  it('refuses a stat the page does not offer, an empty choice and a number of levels out of range', () => {
    const request = { page: 'standings' as const, notify: true }
    expect(getLevelPlan({ ...request, stats: ['MONEY'], levels: 1 }, stats)).toBeNull()
    expect(getLevelPlan({ ...request, stats: [], levels: 1 }, stats)).toBeNull()
    expect(getLevelPlan({ ...request, stats: null, levels: 0 }, stats)).toBeNull()
    expect(getLevelPlan({ ...request, stats: null, levels: 11 }, stats)).toBeNull()
    expect(getLevelPlan({ ...request, stats: null, levels: 1.5 }, stats)).toBeNull()
  })

  it('accepts only the result the bridge gives after calling the game', () => {
    const plan = getLevelPlan({ page: 'standings', stats: null, levels: 1, notify: true }, stats)
    expect(plan?.steps[0].accept?.(['result=given', 'reward_calls=2'])).toBe(true)
    expect(plan?.steps[0].accept?.(['result=unknown_reward'])).toBe(false)
  })

  it('checks the shape of a request from the interface', () => {
    expect(isLevelRequest({ page: 'milestones', stats: null, levels: 3, notify: true })).toBe(true)
    expect(isLevelRequest({ page: 'words', stats: null, levels: 3, notify: true })).toBe(false)
    expect(isLevelRequest({ page: 'milestones', stats: [1], levels: 3, notify: true })).toBe(false)
  })
})
