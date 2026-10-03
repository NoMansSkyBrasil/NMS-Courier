import { mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve, sep } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  advance,
  BasePalettePreviewAdapter,
  basePaletteBytes,
  generateBasePalette,
  seedState
} from './base-palette-preview'
import type { PreviewColor } from '../../shared/model-preview'

const families = Array.from({ length: 66 }, (_, index) => ({
  mode: index % 6,
  colors: Array.from(
    { length: 64 },
    (_, cell) => [cell / 63, 1 - cell / 63, (cell % 8) / 7, 1] as PreviewColor
  )
}))

describe('experimental base palette adapter', () => {
  it('preserves unsigned seed arithmetic without JavaScript number truncation', () => {
    expect(seedState(0n)).toEqual([1, 0])
    expect(seedState(0xffffffffffffffffn)).toEqual([0xffffffff, 0xffffffff])
    expect(advance([1, 0])).toEqual([0x5a76f899, 0])
    expect(advance([0xffffffff, 0xffffffff])).toEqual([0xa5890766, 0x5a76f899])
  })
  it('matches independent Python schedule vectors across ordinary and maximum seeds', () => {
    // Authored gradient banks, not proprietary game palette data.
    const indices = [0, 10, 32, 51, 52, 56, 65]
    const cases: [bigint, number[][]][] = [
      [
        0n,
        [
          [14, 55, 48, 2, 24],
          [50, 20, 4, 6, 8],
          [0, 4, 32, 36, 32],
          [6, 7, 0, 2, 1],
          [50, 0, 2, 54, 52],
          [32, 4, 8, 36, 4],
          [3, 55, 50, 5, 8]
        ]
      ],
      [
        7n,
        [
          [22, 5, 24, 9, 54],
          [52, 16, 20, 34, 4],
          [4, 8, 32, 36, 32],
          [6, 5, 0, 1, 7],
          [6, 4, 2, 8, 50],
          [36, 0, 4, 32, 4],
          [42, 47, 57, 10, 40]
        ]
      ],
      [
        0xffffffffffffffffn,
        [
          [2, 28, 34, 35, 32],
          [20, 36, 16, 4, 48],
          [4, 36, 0, 32, 36],
          [2, 4, 3, 5, 0],
          [36, 6, 16, 52, 34],
          [4, 36, 0, 32, 32],
          [59, 40, 8, 38, 26]
        ]
      ]
    ]
    for (const [seed, expected] of cases) {
      const preview = generateBasePalette(seed, families)
      expect(preview.families).toHaveLength(66)
      expect(preview.families.flatMap((row) => row.colors)).toHaveLength(330)
      expect(
        indices.map((index) => preview.families[index].colors.map((color) => color.index))
      ).toEqual(expected)
      for (const [index, row] of preview.families.entries())
        for (const color of row.colors)
          expect(color.rgba).toEqual(families[index].colors[color.lookupIndex])
    }
  })
  it('rejects malformed, negative, excessive and ambiguous seed inputs before computation', () => {
    const adapter = new BasePalettePreviewAdapter()
    for (const seed of [
      '7',
      '0x',
      '0x10000000000000000',
      '-0x1',
      '0x7 trailing',
      ' 0x7',
      7,
      null,
      {}
    ])
      expect(adapter.evaluate(seed)).toEqual({ state: 'failed', reason: 'INVALID_SEED' })
    expect(adapter.evaluate('0xFFFFFFFFFFFFFFFF')).toEqual({
      state: 'failed',
      reason: 'PALETTE_UNAVAILABLE'
    })
    expect(() => generateBasePalette(-1n, families)).toThrow()
    expect(() => generateBasePalette(1n << 64n, families)).toThrow()
  })
  it('bounds file reads and rejects wrong palette fingerprints without accepting state', async () => {
    const directory = mkdtempSync(join(tmpdir(), 'courier-palette-test-'))
    if (!resolve(directory).startsWith(resolve(tmpdir()) + sep))
      throw new Error('Invalid cleanup path.')
    try {
      const adapter = new BasePalettePreviewAdapter()
      const path = join(directory, 'palette.mbin')
      for (const size of [0, basePaletteBytes - 1, basePaletteBytes, basePaletteBytes + 1]) {
        writeFileSync(path, Buffer.alloc(size))
        expect(await adapter.importFile(path)).toEqual({
          state: 'failed',
          reason: 'INVALID_PALETTE'
        })
        expect(adapter.evaluate('0x7')).toEqual({ state: 'failed', reason: 'PALETTE_UNAVAILABLE' })
      }
      expect(await adapter.importFile(join(directory, 'missing.mbin'))).toEqual({
        state: 'failed',
        reason: 'FILE_UNAVAILABLE'
      })
    } finally {
      rmSync(directory, { recursive: true, force: true })
    }
  })
})
