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

  it('offers nested groups and finds a seed for chosen parts and paint', async () => {
    const choices = service.choices('starship', 'fighter')
    expect(choices.state).toBe('listed')
    if (choices.state !== 'listed') return
    expect(choices.groups.map((group) => group.group)).toEqual(['_ENGINE_', '_WINGS_', '_COCKPIT_'])
    expect(choices.paintColors.length).toBeGreaterThan(8)
    const wings = choices.groups[1].options.find((option) => option.groups.length > 0)!
    const nested = wings.groups[0]
    const wanted = [
      { parent: '', group: '_WINGS_', id: wings.id },
      { parent: nested.parent, group: nested.group, id: nested.options[0].id }
    ]
    const paint = choices.paintColors[3]
    const found = await service.findSeed('starship', 'fighter', wanted, paint)
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
    expect(built.paint?.paint[0].slice(0, 3)).toEqual(paint.slice(0, 3))
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
})
