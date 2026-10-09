import { describe, expect, it } from 'vitest'
import { childSeedsOfSystem, originsOfSeed, stepsBeforeChildSeed } from './star-system-stream'

// A live reading of build 180836 on 2026-10-09 (bridge 1.8.0, slot 3 by the owner's statement):
// the star system with seed 0x0001DB00F769C14E and the first ships the game generated for it.
const systemSeed = '0x0001DB00F769C14E'
const firstShips = [
  '0x05638F06BDAB9977',
  '0x16D9008C1196CEC0',
  '0xB355BF8A9DD8CD9D',
  '0x8A9FCA10D9621923',
  '0xC008554CF384158E',
  '0x36B194B7E91F1D56',
  '0x8E33AA5B78122A5F',
  '0x6751C664BC9DCC56',
  '0x996A44E44F6CE73B',
  '0xC40F719EBDCACC69',
  '0x86C5E244E015473A',
  '0xCB0E73052AF79A9A',
  '0xE3418D97187D7FC0',
  '0x37C7B2645D20F960',
  '0x35AE20B45876A9D2',
  '0xBBC2B1DEDF51D5CD',
  '0x2C390A5846A85F12',
  '0x3B41552602107A37',
  '0x920E61219033BB0F',
  '0x59BDA5403B6BE697',
  '0x8EEF1C10CD8A8062'
]

describe('star system stream', () => {
  it('finds the first ship 302 steps into the stream of the system seed', () => {
    expect(stepsBeforeChildSeed(systemSeed, firstShips[0])).toBe(302)
  })

  it('yields the twenty-one buyable ships as consecutive child seeds', () => {
    expect(childSeedsOfSystem(systemSeed, 302, firstShips.length)).toEqual(firstShips)
  })

  it('finds the first ship of a second system after a different number of steps', () => {
    expect(stepsBeforeChildSeed('0x0000E800F669E14C', '0xDDCF152DA3DD87F7')).toBe(447)
  })

  it('finds the system a ship seed was drawn in', () => {
    expect(originsOfSeed(firstShips[0])).toContainEqual({ systemSeed, steps: 302 })
    expect(originsOfSeed('0xDDCF152DA3DD87F7')).toContainEqual({
      systemSeed: '0x0000E800F669E14C',
      steps: 447
    })
  })

  it('does not place a foreign seed on the stream', () => {
    expect(stepsBeforeChildSeed(systemSeed, '0x5EEDC0DE70FAE007', 5000)).toBeNull()
  })
})
