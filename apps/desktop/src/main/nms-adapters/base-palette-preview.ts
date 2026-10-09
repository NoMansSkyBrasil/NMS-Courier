import { createHash } from 'node:crypto'
import { open } from 'node:fs/promises'
import { basename } from 'node:path'
import type {
  PaletteEvaluationResult,
  PaletteImportResult,
  PalettePreview,
  PreviewColor
} from '../../shared/model-preview'

// Offline build-180383 base branch, ported from evaluate-base-palettes.py.
// Entity seed propagation, alternate collections and texture bindings are unverified.
export const basePaletteHash = '3521862b5b2bfb33afe3a8a5bf5a15b6b60ff60327656ec4f7ca9d5e590b9c4e'
export const basePaletteBytes = 32 + 66 * 0x410
export const familyNames = [
  'Grass',
  'Plant',
  'Leaf',
  'Wood',
  'Rock',
  'Stone',
  'Crystal',
  'Sand',
  'Dirt',
  'Metal',
  'Paint',
  'Plastic',
  'Fur',
  'Scale',
  'Feather',
  'Water',
  'Cloud',
  'Sky',
  'Space',
  'Underbelly',
  'Undercoat',
  'Snow',
  'SkyHorizon',
  'SkyFog',
  'SkyHeightFog',
  'SkySunset',
  'SkyNight',
  'WaterNear',
  'SpaceCloud',
  'SpaceBottom',
  'SpaceSolar',
  'SpaceLight',
  'Warrior',
  'Scientific',
  'Trader',
  'WarriorAlt',
  'ScientificAlt',
  'TraderAlt',
  'RockSaturated',
  'RockLight',
  'RockDark',
  'PlanetRing',
  'Custom_Head',
  'Custom_Torso',
  'Custom_Chest_Armour',
  'Custom_Backpack',
  'Custom_Arms',
  'Custom_Hands',
  'Custom_Legs',
  'Custom_Feet',
  'Cave',
  'GrassAlt',
  'BioShip_Body',
  'BioShip_Underbelly',
  'BioShip_Cockpit',
  'SailShip_Sails',
  'Freighter',
  'FreighterPaint',
  'PirateBase',
  'PirateAlt',
  'SpaceStationBase',
  'SpaceStationAlt',
  'SpaceStationLights',
  'DeepWaterBioLum',
  'Slime',
  'Hulk'
]
export type Family = { mode: number; colors: PreviewColor[] }
type State = [number, number]
const mask64 = (1n << 64n) - 1n

export function seedState(seed: bigint): State {
  const low = Number(seed & 0xffffffffn)
  return [low || 1, (((low >>> 16) | (low << 16)) ^ Number(seed >> 32n) ^ low) >>> 0]
}

export function advance(state: State): State {
  const product = BigInt(state[0]) * 0x5a76f899n + BigInt(state[1])
  return [Number(product & 0xffffffffn), Number(product >> 32n)]
}

export function childSeed(state: State): [State, bigint] {
  const first = advance(state)
  const second = advance(first)
  let value = (BigInt(second[0]) << 32n) | BigInt(first[0])
  value = ((value ^ (value >> 33n)) * 0x64dd81482cbd31d7n) & mask64
  value = ((value ^ (value >> 33n)) * 0xe36aa5c613612997n) & mask64
  return [second, value ^ (value >> 33n)]
}

function draw(state: State, mode: number): [State, number] {
  const first = advance(state)
  const second = advance(first)
  const row = first[0] >>> 29
  const column = second[0] >>> 29
  const index =
    mode === 1
      ? 0
      : mode === 2
        ? ((row >>> 2) * 8 + (second[0] >>> 31)) * 4
        : mode === 3
          ? column
          : mode === 4
            ? ((second[0] >>> 30) + (row >>> 1) * 8) * 2
            : column + row * 8
  return [second, index]
}

function lookup(index: number, mode: number): number {
  return mode === 1
    ? 0
    : mode === 2
      ? (Math.floor((index % 8) / 4) + Math.floor(index / 32) * 8) * 4
      : mode === 3
        ? index % 8
        : mode === 4
          ? (Math.floor((index % 8) / 2) + Math.floor(index / 16) * 8) * 2
          : index
}

function distance(left: PreviewColor, right: PreviewColor): number {
  const r = Math.fround(left[0] - right[0])
  const g = Math.fround(left[1] - right[1])
  const b = Math.fround(left[2] - right[2])
  return Math.fround(Math.fround(b * b) + Math.fround(Math.fround(g * g) + Math.fround(r * r)))
}

// The families of the game's base palette file, or null when the bytes are not that file.
export function readBasePalette(bytes: Buffer): Family[] | null {
  return readPaletteFile(bytes, basePaletteHash)
}

// The game's second palette file, used for things marked to use the legacy colours
// (metadata/simulation/solarsystem/colours/legacybasecolourpalettes.mbin of build 180836).
export const legacyPaletteHash = '5a2f5cfd3ba90f0344d628cf251a596d8c6ea9ffc66176bbb0af29f2d69bd02b'

export function readLegacyPalette(bytes: Buffer): Family[] | null {
  return readPaletteFile(bytes, legacyPaletteHash)
}

function readPaletteFile(bytes: Buffer, hash: string): Family[] | null {
  if (
    bytes.length !== basePaletteBytes ||
    createHash('sha256').update(bytes).digest('hex') !== hash
  )
    return null
  return familyNames.map((_, index) => {
    const base = 32 + index * 0x410
    return {
      mode: bytes.readUInt32LE(base + 0x400),
      colors: Array.from(
        { length: 64 },
        (_, cell) =>
          [0, 1, 2, 3].map((channel) =>
            bytes.readFloatLE(base + cell * 16 + channel * 4)
          ) as PreviewColor
      )
    }
  })
}

// The five samples of every family the way the game draws them for something marked to use the
// legacy colours (a multi-tool's `UseLegacyColours`): its second palette generator, read in the
// executable of build 180836 (routines 630310 and 6305b0; docs/MODEL_WORKSHOP.md). The families
// are taken in file order from one stream. A sample is two steps: the cell is the second step's
// top three bits, plus eight times the first's unless the family's mode is 3. A sample nearer
// than the game's `DuplicateColourThreshold` (1.0 in gcenvironmentglobals) to an earlier sample
// of its family is drawn again with two more steps, at most 64 draws; the 64th is kept as it is.
// Only the families of the file's own order are given; the game goes on to redraw six of them
// from a child seed, which no starship or multi-tool layer uses.
export function generateLegacyPalette(seed: bigint, families: Family[]): PreviewColor[][] {
  if (seed < 0n || seed > mask64 || families.length !== 66)
    throw new Error('Invalid palette input.')
  const threshold = 1
  let state = seedState(seed)
  return families.map((family) => {
    const chosen: PreviewColor[] = []
    for (let slot = 0; slot < 5; slot++) {
      let color = family.colors[0]
      for (let attempt = 0; attempt < 64; attempt++) {
        const first = advance(state)
        state = advance(first)
        const cell = family.mode === 3 ? state[0] >>> 29 : (state[0] >>> 29) + (first[0] >>> 29) * 8
        color = family.colors[cell]
        if (!chosen.some((other) => threshold > Math.fround(Math.sqrt(distance(other, color)))))
          break
      }
      chosen.push(color)
    }
    return chosen
  })
}

export const paintFamily = 10
export const undercoatFamily = 20

// The five samples of each of the first `count` families for a seed, in file order. The same
// schedule as generateBasePalette, stopped early: a ship's paint needs the first eleven families.
export function leadingPaletteSamples(
  seed: bigint,
  families: Family[],
  count: number
): PreviewColor[][] {
  let state = seedState(seed)
  const rows: PreviewColor[][] = []
  for (let index = 0; index < count; index++) {
    const family = families[index]
    const mode = family.mode || 5
    const colors: PreviewColor[] = []
    for (let slot = 0; slot < 5; slot++) {
      let position: number
      ;[state, position] = draw(state, mode)
      let retries = 0
      while (
        retries < 64 &&
        colors.some(
          (previous) => distance(previous, family.colors[lookup(position, mode)]) < 2 ** -32
        )
      ) {
        position = (position + 1) % 64
        retries++
      }
      colors.push(family.colors[lookup(position, mode)])
    }
    rows.push(colors)
  }
  return rows
}

export function generateBasePalette(seed: bigint, families: Family[]): PalettePreview {
  if (seed < 0n || seed > mask64 || families.length !== 66)
    throw new Error('Invalid palette input.')
  let state = seedState(seed)
  const rows: PalettePreview['families'] = []
  const emit = (index: number, source: State): State => {
    const family = families[index]
    const mode = family.mode || 5
    const colors: PalettePreview['families'][number]['colors'] = []
    let next = source
    for (let slot = 0; slot < 5; slot++) {
      let position: number
      ;[next, position] = draw(next, mode)
      let retries = 0
      while (
        retries < 64 &&
        colors.some(
          (previous) => distance(previous.rgba, family.colors[lookup(position, mode)]) < 2 ** -32
        )
      ) {
        position = (position + 1) % 64
        retries++
      }
      colors.push({
        index: position,
        lookupIndex: lookup(position, mode),
        rgba: [...family.colors[lookup(position, mode)]]
      })
    }
    rows[index] = { name: familyNames[index], colors }
    return next
  }
  let paintState: State = state
  for (let index = 0; index < 52; index++) {
    if (index === 10) paintState = state
    state = emit(index, state)
  }
  const [raceNext, raceSeed] = childSeed(state)
  const [grassNext, grassSeed] = childSeed(raceNext)
  state = grassNext
  const raceState = seedState(raceSeed)
  for (const index of [32, 35, 34, 37, 33, 36]) emit(index, raceState)
  const grassState = seedState(grassSeed)
  emit(0, grassState)
  state = emit(51, grassState)
  const [, otherSeed] = childSeed(state)
  state = seedState(otherSeed)
  for (let index = 52; index < 66; index++) {
    if (index === 56) emit(index, paintState)
    else state = emit(index, state)
  }
  return { seed: '0x' + seed.toString(16).toUpperCase(), families: rows }
}

export class BasePalettePreviewAdapter {
  private families: Family[] | null = null

  async importFile(path: string): Promise<PaletteImportResult> {
    try {
      const handle = await open(path, 'r')
      const bytes = Buffer.alloc(basePaletteBytes)
      try {
        const stat = await handle.stat()
        if (!stat.isFile() || stat.size !== basePaletteBytes) throw new Error('INVALID_PALETTE')
        let offset = 0
        while (offset < bytes.length) {
          const result = await handle.read(bytes, offset, bytes.length - offset, offset)
          if (!result.bytesRead) throw new Error('INVALID_PALETTE')
          offset += result.bytesRead
        }
        if ((await handle.stat()).size !== stat.size) throw new Error('INVALID_PALETTE')
      } finally {
        await handle.close()
      }
      if (createHash('sha256').update(bytes).digest('hex') !== basePaletteHash)
        throw new Error('INVALID_PALETTE')
      const families: Family[] = familyNames.map((_, index) => {
        const base = 32 + index * 0x410
        const mode = bytes.readUInt32LE(base + 0x400)
        if (mode > 5) throw new Error('INVALID_PALETTE')
        const colors: PreviewColor[] = Array.from(
          { length: 64 },
          (_, cell) =>
            [0, 1, 2, 3].map((channel) =>
              bytes.readFloatLE(base + cell * 16 + channel * 4)
            ) as PreviewColor
        )
        if (
          colors.some((color) =>
            color.some((value) => !Number.isFinite(value) || value < 0 || value > 1)
          )
        )
          throw new Error('INVALID_PALETTE')
        return { mode, colors }
      })
      this.families = families
      return { state: 'loaded', name: basename(path), sha256: basePaletteHash }
    } catch (error) {
      return {
        state: 'failed',
        reason:
          error instanceof Error && error.message === 'INVALID_PALETTE'
            ? 'INVALID_PALETTE'
            : 'FILE_UNAVAILABLE'
      }
    }
  }

  evaluate(seed: unknown): PaletteEvaluationResult {
    if (typeof seed !== 'string' || !/^0x[0-9a-f]{1,16}$/i.test(seed))
      return { state: 'failed', reason: 'INVALID_SEED' }
    if (!this.families) return { state: 'failed', reason: 'PALETTE_UNAVAILABLE' }
    return { state: 'calculated', preview: generateBasePalette(BigInt(seed), this.families) }
  }
}
