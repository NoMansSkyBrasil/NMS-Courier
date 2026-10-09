import { expectStructure, fixedText, listAt, listText } from './binary-table'
import { ModelFileError } from './binary-table'

// Readers for what decides a model's surface: a material (".material.mbin") names its diffuse
// texture, and that texture's list (".texture.mbin") holds up to eight layers, each with the
// alternatives a seed chooses from and the palette colour each alternative takes.
//
// Layouts read from the build 180836 files by comparison with their converted text (2026-10-08).
// Texture list: eight layers of 0x48 bytes from 0x20 (group 0x10, linked layer 0x10, name 0x10,
// list of alternatives, probability float, base-matching flag), then the unnamed-layers flag at
// 0x260. An alternative is 0x60 bytes: average colour (four floats), name (0x20), texture path
// (text), colour channel, palette index, palette family, probability (float), gameplay use.
// Material: the list of samplers is the sixth list of the header (0x70); a sampler is 0x50 bytes
// with its texture path (text) at +0x20 and its name (text) at +0x30.

const textureListStructure = 'e40c000031c3f04c087fe55d0cc74825'
const materialStructure = 'e40c00008ad43747a9f1e538fccced2c'
const layerCount = 8
const layerSize = 0x48
const optionSize = 0x60

export type TextureOption = {
  name: string
  // Lower-case game path of the texture this alternative draws.
  texture: string
  // Index into the game's palette families, and which of a family's samples is taken
  // (0 primary, 1 to 4 alternatives, 5 unique, 6 ground, 7 none).
  family: number
  channel: number
  paletteIndex: number
  probability: number
  gameplayUse: number
  // The layer is multiplied by its palette colour instead of being recoloured toward it.
  multiply: boolean
  // The average colour the file gives for the texture, when it overrides the one the game
  // takes from the texture itself.
  average: [number, number, number] | null
}

export type TextureLayer = {
  name: string
  group: string
  linkedLayer: string
  probability: number
  selectToMatchBase: boolean
  options: TextureOption[]
}

export type TextureList = { alwaysEnableUnnamed: boolean; layers: TextureLayer[] }

export function readTextureList(data: Buffer): TextureList {
  expectStructure(data, textureListStructure)
  if (data.length < 0x20 + layerCount * layerSize + 4) throw new ModelFileError('corrupt_file')
  const layers: TextureLayer[] = []
  for (let index = 0; index < layerCount; index += 1) {
    const layer = 0x20 + index * layerSize
    const options = listAt(data, layer + 0x30, optionSize, 256)
    layers.push({
      group: fixedText(data, layer, 0x10),
      linkedLayer: fixedText(data, layer + 0x10, 0x10),
      name: fixedText(data, layer + 0x20, 0x10),
      probability: data.readFloatLE(layer + 0x40),
      selectToMatchBase: data[layer + 0x44] !== 0,
      options: Array.from({ length: options.count }, (_, item) => {
        const option = options.start + item * optionSize
        return {
          name: fixedText(data, option + 0x10, 0x20),
          texture: listText(data, option + 0x30, 1024)
            .replace(/\\/g, '/')
            .toLowerCase(),
          channel: data.readUInt32LE(option + 0x40),
          paletteIndex: data.readInt32LE(option + 0x44),
          family: data.readUInt32LE(option + 0x48),
          probability: data.readFloatLE(option + 0x4c),
          gameplayUse: data.readUInt32LE(option + 0x50),
          multiply: data[option + 0x54] !== 0,
          average:
            data[option + 0x55] !== 0
              ? [
                  data.readFloatLE(option),
                  data.readFloatLE(option + 4),
                  data.readFloatLE(option + 8)
                ]
              : null
        }
      })
    })
  }
  return { alwaysEnableUnnamed: data[0x20 + layerCount * layerSize] !== 0, layers }
}

// The diffuse texture a material names, as a lower-case game path; null when it has none.
// `sampler` picks the map: a material may name a second diffuse texture (gDiffuse2Map) that the
// game lays over the first.
export function readMaterialDiffuse(data: Buffer, sampler = 'gDiffuseMap'): string | null {
  expectStructure(data, materialStructure)
  const samplers = listAt(data, 0x70, 0x50, 64)
  for (let index = 0; index < samplers.count; index += 1) {
    const entry = samplers.start + index * 0x50
    if (listText(data, entry + 0x30, 256) === sampler) {
      const map = listText(data, entry + 0x20, 1024)
        .replace(/\\/g, '/')
        .toLowerCase()
      return map.endsWith('.dds') ? map : null
    }
  }
  return null
}

// The texture list a diffuse texture belongs to: "dir/name.dds" and the layered
// "dir/name.layer.dds" both belong to "dir/name.texture.mbin".
export function textureListPath(diffuse: string): string {
  const cut = diffuse.lastIndexOf('/')
  return `${diffuse.slice(0, cut)}/${diffuse.slice(cut + 1).split('.')[0]}.texture.mbin`
}
