import { describe, expect, it } from 'vitest'
import { averageOfTexture } from './model-surface-painter'

// A DDS file of 8 by 8 pixels with four levels (8, 4, 2, 1), every block zero except the last.
function texture(fourCc: string, blockBytes: number, lastBlock: number[]): Uint8Array {
  const blocks = 4 + 1 + 1 + 1
  const file = new Uint8Array(128 + blocks * blockBytes)
  const view = new DataView(file.buffer)
  view.setUint32(0, 0x20534444, true)
  view.setUint32(8, 0x21007, true)
  view.setUint32(12, 8, true)
  view.setUint32(16, 8, true)
  view.setUint32(28, 4, true)
  for (let index = 0; index < 4; index += 1) file[84 + index] = fourCc.charCodeAt(index)
  file.set(lastBlock, file.length - blockBytes)
  return file
}

describe('average colour of a texture', () => {
  it('is the first pixel of the smallest level of a BC1 file', () => {
    // Colours 0xF800 (red) and 0x001F (blue), first pixel takes the second colour.
    const average = averageOfTexture(texture('DXT1', 8, [0x00, 0xf8, 0x1f, 0x00, 0x01, 0, 0, 0]))
    expect(average).toEqual([0, 0, 1])
  })

  it('mixes two thirds and one third when the first colour is the larger', () => {
    const average = averageOfTexture(texture('DXT1', 8, [0x00, 0xf8, 0x1f, 0x00, 0x02, 0, 0, 0]))
    expect(average).toEqual([170 / 255, 0, 85 / 255])
  })

  it('takes the colour half of a BC3 block', () => {
    const block = [0, 0, 0, 0, 0, 0, 0, 0, 0xe0, 0x07, 0x00, 0x00, 0x00, 0, 0, 0]
    expect(averageOfTexture(texture('DXT5', 16, block))).toEqual([0, 1, 0])
  })

  it('takes the colour stored in the header before anything else', () => {
    const file = texture('DXT1', 8, [0x00, 0xf8, 0x1f, 0x00, 0x01, 0, 0, 0])
    // Blue, green, red, alpha, as in the game's multitoolbase.paint1.dds.
    file.set([0xcd, 0xb8, 0x40, 0xff], 0x38)
    expect(averageOfTexture(file)).toEqual([0x40 / 255, 0xb8 / 255, 0xcd / 255])
  })

  it('refuses a file it cannot place', () => {
    expect(averageOfTexture(new Uint8Array(64))).toBeNull()
  })
})
