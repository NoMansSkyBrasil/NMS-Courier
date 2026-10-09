import { crc32 } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import { workshopKinds } from '../../shared/model-workshop'
import { GameModelFiles } from './game-model-files'
import { ModelWorkshopService } from './model-workshop-service'
import { partListPath, readPartList } from './part-list'
import { selectParts } from './seed-part-selection'
import {
  generateBasePalette,
  leadingPaletteSamples,
  readBasePalette
} from '../nms-adapters/base-palette-preview'

// Runs only when NMS_COURIER_GAME_ROOT names a No Man's Sky installation: these checks read the
// game's own archives, which are not in the repository. The expected selections were produced by
// the research port (runtime/research/evaluate-descriptor-seed.py) on 2026-10-08.

const root = process.env.NMS_COURIER_GAME_ROOT ?? ''
const fighterPartChecksums =
  '756635:0x5EEDC0DE523DF454,2847669:0x5EEDC0DEB1EFBCC6,5235880:0x5EEDC0DE3215FC27,11418125:0x5EEDC0DE057872C2,18106866:0x5EEDC0DE0A90F307,18745605:0x5EEDC0DE63454C36,24673986:0x5EEDC0DE685FBFE1,25090309:0x5EEDC0DE678C61C6,25199372:0x5EEDC0DE4CF26BD3,27820294:0x5EEDC0DE262AC32F,32625640:0x5EEDC0DE0B6F8BC3,34659580:0x5EEDC0DEDE5A6CFE,34788271:0x5EEDC0DE504DF338,34982211:0x5EEDC0DE823FE5D5,38533746:0x5EEDC0DE6B6A754C,40056388:0x5EEDC0DE0586AA9C,40110748:0x5EEDC0DE4CCC6B3D,40451972:0x5EEDC0DE0A472D8C,43242822:0x5EEDC0DE4A5463BE,50134902:0x5EEDC0DE0AAD98B1,50202493:0x5EEDC0DE37514E26,50537505:0x5EEDC0DEA106D5CD,51108799:0x5EEDC0DEC3D45BE9,55056044:0x5EEDC0DE85C6CD48,57155210:0x5EEDC0DE5A564742,58530065:0x5EEDC0DEEDE6D54E,62467347:0x5EEDC0DECD69481F,62667496:0x5EEDC0DE69C69BB0,63476588:0x5EEDC0DEDE80F8C1,65927046:0x5EEDC0DE4E0DB27E,69227250:0x5EEDC0DE307350AB,70621299:0x5EEDC0DE09E4FFBD,71463793:0x5EEDC0DE3BB25CAF,71819242:0x5EEDC0DE2501F63E,74886573:0x5EEDC0DE741E93F4,76120258:0x5EEDC0DE0D1DEA93,76563062:0x5EEDC0DE01A8631D,81081908:0x5EEDC0DE4646AA1F,86680179:0x5EEDC0DE34DFA26F,89403525:0x5EEDC0DE1A5B3154,89709582:0x5EEDC0DE338FEA4A,92169798:0x5EEDC0DE60E6D393,94737572:0x5EEDC0DE3121EA3E,100838069:0x5EEDC0DE18677851,105098474:0x5EEDC0DE9D5E3680,109180405:0x5EEDC0DEC8DF8BDE,110478751:0x5EEDC0DEA77C6E42,112398868:0x5EEDC0DE3457970D,115545652:0x5EEDC0DEB83C666C,117778646:0x5EEDC0DE20B14521,118647982:0x5EEDC0DE3E8EC21B,119686863:0x5EEDC0DE2FD8BE3B,121395466:0x5EEDC0DE4278CDAB,124205904:0x5EEDC0DEFA86D813,126000061:0x5EEDC0DE29C024BC,128112869:0x5EEDC0DE532F5377,129900655:0x5EEDC0DED19D1D25,130708409:0x5EEDC0DE74C513BB,132292851:0x5EEDC0DE3A0EB4C2,137107884:0x5EEDC0DE176B544D,519043181:0x5EEDC0DE70FAE007,1567561460:0x5EEDC0DE5A508483,1566761207:0x5EEDC0DE76FDFEEA,1562621193:0x5EEDC0DE41DDC205'
const references: [string, string, string][] = [
  [
    workshopKinds.starship.fighter,
    '0x7',
    '_ENGINE_C _WINGS_K _WINGSK_A _RECTANGLERIGHT_A _LOGORIGHT_A _SUBWINGS_NONE _LETTERRIGHT_A _COCKPIT_D _LOGOR_A2 _LOGOL_A1'
  ],
  [
    workshopKinds.starship.fighter,
    '0xA547AB958C97E439',
    '_ENGINE_B _WINGS_G _ACC_NONE4 _LETTERR_A _WINGS2_G _SMALLSIGNL_A _SMALLSIGNR_A _LETTERL_A _COCKPIT_A _ANOSE_B _NOSEB_BASE _LOGO1_A2 _NUMBER4_A4 _NUMBER3_A3 _LOGO2_A3 _NUMBER2_A3 _NUMBER1_A2'
  ],
  [
    workshopKinds.starship.hauler,
    '0xD440D42921FFFF7A',
    '_COCKPIT_A _COCKPITA_0NEW _LOGOR_A _LOGOL_A _HULL_A _WINGS_D _CONTAINER_B _SUBWINGS_B6 _LETTER_A1 _CONTACC_1XRARE _ENGINES_A _SUBWINGS_NULL27 _SMALLSIGNL_A _SMALLSIGNR_A _SIDEL_A _SIDER_A'
  ],
  [
    workshopKinds.starship.interceptor,
    '0x7',
    '_PIT_B _LIGHTS_I1 _TOPFLAP_NULL _WINGS_V _WINGSO_OTOP _AXWINGSS_12 _JETTOP_NULL _TYPE_WHITE1 _EXWINGS_5S436 _TIPLIGHTS4_A _WINGSU_CBOT _JETBOT_NULL _SKIRT_A _SIDEENGINES_NULL _UNDERWING_A _ASIDES_AE _AFRONT_SNOUT2 _GRILL_SNOUT10S3 _AALTSKIRT_NULL _AENDWINGS_NULL _ENGINEFLAME_2 _ASKIRTING_A1S10'
  ],
  [
    workshopKinds.freighter.regular,
    '0x8C968767B3282F13',
    '_HULL_A _HULLSIDE_A1 _HULLATOP_B _BRIDGE_A1 _VERTICALFIN_A4 _HULLABOT_B5 _VERTICALFIN_NONE3 _ENGINE_A _CARGO_ABOT5 _CARGO_CAPB5 _CARGOB_C _CONTAINER_C _SMALLSIGN_A1 _SMALLSIGN2_A2 _CARGOSMALL_B _NUMBER2_A2 _RECTANGLE_A1 _CONTAINER_B _NUMBER1_A1 _CARGO_B'
  ]
]

describe.skipIf(!root)('model workshop against the installed game', () => {
  const files = new GameModelFiles(() => root)
  const service = new ModelWorkshopService(files, () => root)
  const resolve = (scene: string): ReturnType<typeof readPartList> | null => {
    const data = files.read(partListPath(scene) ?? '')
    return data ? readPartList(data) : null
  }

  it.each(references)('selects the reference parts for %s %s', (scene, seed, expected) => {
    const list = resolve(scene)
    expect(list).not.toBeNull()
    expect(selectParts(BigInt(seed), list!, resolve).selectedIds.join(' ')).toBe(expected)
  })

  it('builds a model for every kind', () => {
    for (const [category, kinds] of Object.entries(workshopKinds)) {
      for (const kind of Object.keys(kinds)) {
        const result = service.build(category, kind, '0x7')
        expect([category, kind, result.state]).toEqual([category, kind, 'built'])
      }
    }
  }, 120_000)

  it('offers nested groups and finds a seed for chosen parts, colour and textures', async () => {
    const choices = service.choices('starship', 'fighter')
    expect(choices.state).toBe('listed')
    if (choices.state !== 'listed') return
    expect(choices.groups.map((group) => group.group)).toEqual(['_ENGINE_', '_WINGS_', '_COCKPIT_'])
    const wings = choices.groups[1].options.find((option) => option.groups.length > 0)!
    const nested = wings.groups[0]
    const wanted = [
      { parent: '', group: '_WINGS_', id: wings.id },
      { parent: nested.parent, group: nested.group, id: nested.options[0].id }
    ]
    const first = service.build('starship', 'fighter', '0x7')
    expect(first.state).toBe('built')
    if (first.state !== 'built') return
    const primary = first.colors.find((slot) => slot.family === 10 && slot.sample === 0)!
    const color = primary.palette[3]
    const found = await service.findSeed('starship', 'fighter', wanted, {
      colors: [{ family: 10, sample: 0, color }],
      textures: [{ layer: 'BASE', group: '', name: 'PAINTED' }]
    })
    expect(found.state).toBe('found')
    if (found.state !== 'found') return
    const built = service.build('starship', 'fighter', found.seed)
    expect(built.state).toBe('built')
    if (built.state !== 'built') return
    for (const want of wanted) {
      expect(built.parts.some((part) => part.id === want.id && part.parent === want.parent)).toBe(
        true
      )
    }
    expect(
      built.colors.find((slot) => slot.family === 10 && slot.sample === 0)?.color.slice(0, 3)
    ).toEqual(color.slice(0, 3))
    expect(
      built.textureGroups.find((group) => group.layer === 'BASE' && group.group === '')?.chosen
    ).toBe('PAINTED')
  }, 90_000)

  it('finds a seed for a chosen decal and for a colour of a kind with its own palette', async () => {
    const decal = await service.findSeed('starship', 'fighter', [], {
      colors: [],
      textures: [{ layer: 'BASE', group: 'DECALNUMBER', name: 'A1' }]
    })
    expect(decal.state).toBe('found')
    const living = service.build('starship', 'living', '0x7')
    expect(living.state).toBe('built')
    if (living.state !== 'built') return
    expect(living.colors.length).toBeGreaterThan(0)
    const slot = living.colors[0]
    const color = slot.palette[slot.palette.length - 1]
    const found = await service.findSeed('starship', 'living', [], {
      colors: [{ family: slot.family, sample: slot.sample, color }],
      textures: []
    })
    expect(found.state).toBe('found')
    if (found.state !== 'found') return
    const built = service.build('starship', 'living', found.seed)
    expect(
      built.state === 'built' &&
        built.colors
          .find((entry) => entry.family === slot.family && entry.sample === slot.sample)
          ?.color.slice(0, 3)
    ).toEqual(color.slice(0, 3))
  }, 120_000)

  // What the community customizer at nms.center shows for this seed (read on 2026-10-08): its
  // parts, its five colours with their palette numbers, and its texture and decal choices.
  it('agrees with an independent tool on a known fighter seed', () => {
    const built = service.build('starship', 'fighter', '0x5EEDC0DE70FAE007')
    expect(built.state).toBe('built')
    if (built.state !== 'built') return
    expect(built.parts.map((part) => part.id).join(' ')).toBe(
      '_ENGINE_B _WINGS_A _ACC_A _COCKPIT_A _ANOSE_A _NOSEA_BASELOD0 _LOGO1_A2 _NUMBER4_A4 _NUMBER3_A3 _LOGO2_A3 _NUMBER2_A3 _NUMBER1_A2'
    )
    const near = (family: number, sample: number, expected: number[]): void => {
      const slot = built.colors.find((entry) => entry.family === family && entry.sample === sample)
      expect(slot).toBeDefined()
      expected.forEach((value, index) => expect(slot!.color[index]).toBeCloseTo(value, 5))
    }
    near(10, 0, [0.976471, 0.92549, 0.066667])
    near(10, 3, [0.901961, 0.901961, 0.901961])
    near(20, 0, [0.435294, 0.447059, 0.435294])
    near(10, 2, [0.243137, 0.560784, 0.792157])
    near(10, 1, [1, 0.87451, 0.709804])
    const chosen = Object.fromEntries(
      built.textureGroups.map((group) => [`${group.layer}/${group.group}`, group.chosen])
    )
    expect(chosen).toMatchObject({
      'BASE/': 'PAINTED',
      'PAINT/': 'PANELS',
      'BASE/DECALLET': 'A1',
      'BASE/DECALNUMBER': 'C9',
      'BASE/DECALLOGO': 'L',
      'BASE/DECALSMALLSIGN': 'C'
    })
    expect(built.surfaces.length).toBeGreaterThan(10)
    const texture = built.surfaces[0].layers[0].texture
    expect(service.texture(texture)?.subarray(0, 4).toString('latin1')).toBe('DDS ')
    expect(service.texture('textures/not/of/this/model.dds')).toBeNull()
  })

  // Seeds from the same site's table of fighter seeds, each with the CRC-32 of the identifiers of
  // the parts it draws, joined in drawing order (read on 2026-10-08; a sample of its 1,809 pairs).
  it('draws the parts an independent table records for sixty-four fighter seeds', () => {
    const list = resolve(workshopKinds.starship.fighter)!
    const failed: string[] = []
    for (const pair of fighterPartChecksums.split(',')) {
      const [checksum, seed] = pair.split(':')
      const joined = selectParts(BigInt(seed), list, resolve)
        // The site's table was made with an older game version, whose mecha wing alternatives
        // carried a level suffix.
        .parts.map((part) =>
          /^_WINGSJ_(FULL|MID|LOW)$/.test(part.id) ? part.id + 'LOD0' : part.id
        )
        .join('')
        // The site's own correction for one wing, applied before it takes the checksum.
        .replace(
          '_D_LEFT_DECALA_A1_CDECAL1_A1',
          '_D_LEFT_DECALA_A1_CDECAL1_A1_DECALA_A1_CDECAL1_A1'
        )
      if (crc32(Buffer.from(joined, 'latin1')) !== Number(checksum)) failed.push(seed)
    }
    expect(failed).toEqual([])
  })

  // The pirate freighter the project owner supplied on 2026-10-06, with the colours the research
  // recorded for its home seed (docs/SEED_CATEGORY_LEDGER.md).
  it('tints a freighter with the colours of its home system seed', () => {
    const plain = service.build('freighter', 'pirate', '0x8C968767B3282F13')
    expect(plain.state === 'built' && plain.colors.length).toBe(0)
    const built = service.build('freighter', 'pirate', '0x8C968767B3282F13', '0x175000B001FFD')
    expect(built.state).toBe('built')
    if (built.state !== 'built') return
    const hex = (color: readonly number[]): string =>
      '#' +
      color
        .slice(0, 3)
        .map((value) =>
          Math.round(value * 255)
            .toString(16)
            .padStart(2, '0')
        )
        .join('')
        .toUpperCase()
    const drawn = Object.fromEntries(
      built.colors.map((slot) => [`${slot.familyName}/${slot.sample}`, hex(slot.color)])
    )
    expect(drawn).toMatchObject({
      'PirateBase/1': '#212324',
      'PirateAlt/0': '#949494'
    })
    expect(built.surfaces.some((surface) => surface.layers.some((layer) => layer.tint))).toBe(true)
  }, 60_000)

  it('draws the same paint as the full palette port', () => {
    const data = files.read('metadata/simulation/solarsystem/colours/basecolourpalettes.mbin')
    const families = readBasePalette(data!)!
    for (const seed of [0x7n, 0xa547ab958c97e439n, 0xd440d42921ffff7an]) {
      const full = generateBasePalette(seed, families).families
      const leading = leadingPaletteSamples(seed, families, 21)
      for (const family of [10, 20]) {
        expect(leading[family]).toEqual(full[family].colors.map((color) => color.rgba))
      }
    }
  })

  // Ships of the system 0x0001DB00F769C14E as read from the running game on 2026-10-09:
  // entry, owner, kind, class, frigate class, seed and the model the game's table gives.
  it('names the model of each ship of a star system', () => {
    const rows: [number, number, number, number, number, string, string][] = [
      [21, 1, 2, 0, 11, '0xF3092FBA82AD7A45', 'FREIGHTER'],
      [24, 1, 3, 0, 11, '0x6F4F20D39F13C80E', 'FREIGHTER_CAPTIAL'],
      [25, 1, 4, 0, 11, '0x65A2981F5380676E', 'FREIGHTER_SMALL'],
      [26, 1, 5, 0, 11, '0x26877DDA87AF61A9', 'FREIGHTER_TINY'],
      [27, 1, 6, 0, 0, '0x85F0AE86A0028E02', 'FRIGATE_COMBAT'],
      [34, 1, 6, 0, 7, '0x79D64D7AD8BDC093', 'FRIGATE_LIVING_PROC'],
      [35, 3, 0, 9, 11, '0x0B6A5D5C6ECDED6A', 'ROBOT'],
      [43, 2, 3, 0, 11, '0xE75B4F26089732A3', 'FREIGHTER_CAPITAL_PIRATE'],
      [20, 1, 0, 6, 11, '0x8EEF1C10CD8A8062', 'ROYAL']
    ]
    const report = service.withShipModels({
      state: 'read',
      seed: '0x0001DB00F769C14E',
      ships: rows.map(([index, faction, shipRole, shipClass, frigateClass, seed]) => ({
        index,
        faction,
        shipRole,
        shipClass,
        frigateClass,
        seed,
        hint: ''
      }))
    })
    if (report.state !== 'read') throw new Error('unavailable')
    expect(report.ships.map((ship) => ship.model)).toEqual(rows.map((row) => row[6]))
    expect(report.ships[1].scene).toBe(workshopKinds.freighter.capital)
    expect(report.ships[7].scene).toBe(workshopKinds.freighter.pirate)
  })

  // Two multi-tools bought in the running game on 2026-10-09 and their colours as the game
  // showed them: the first has a yellow grip and a beige coat, the second a red body.
  it('draws a multi-tool with the legacy colours', () => {
    const hex = (color: readonly number[]): string =>
      '#' +
      color
        .slice(0, 3)
        .map((value) =>
          Math.round(value * 255)
            .toString(16)
            .padStart(2, '0')
        )
        .join('')
    const colours = (seed: string): Record<string, string> => {
      const result = service.build('multitool', 'standard', seed)
      if (result.state !== 'built') throw new Error(JSON.stringify(result))
      return Object.fromEntries(
        result.colors.map((slot) => [`${slot.familyName} ${slot.sample}`, hex(slot.color)])
      )
    }
    const first = colours('0x81E18111081140E1')
    expect(first['Paint 0']).toBe('#fbc85f')
    expect(first['Paint 3']).toBe('#ff9375')
    expect(first['Undercoat 0']).toBe('#cec8c1')
    const second = colours('0xB46E55097073F0AA')
    expect(second['Paint 0']).toBe('#ec5f4f')
    expect(second['Paint 3']).toBe('#fbc85f')
  })
})
