import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { getCurrencyPlan } from './currency-plan'
import { getSelectionPlan, listDeliveryOptions, supportsSelection } from './delivery-options'
import { getItemPlan, parseMarkdownRows } from './delivery-plan'
import { getEquipmentPlan } from './equipment-plan'

const research = join(__dirname, '..', '..', '..', '..', '..', 'runtime', 'research')

describe('delivery options', () => {
  it('reads the data rows of a generated table', () => {
    const text =
      '# Title\n\n| ID | Class |\n| --- | --- |\n| A1 | deliverable |\n| B2 | blocked |\n'
    expect(parseMarkdownRows(text)).toEqual([
      ['A1', 'deliverable'],
      ['B2', 'blocked']
    ])
  })

  it('offers only what the classification allows', async () => {
    const technologies = await listDeliveryOptions(research, 'technologies')
    expect(technologies.length).toBeGreaterThan(100)
    expect(technologies.every((option) => option.domain === 'technology')).toBe(true)
    // A damaged-slot entry and a repeatable purchase are never options.
    const products = [
      ...(await listDeliveryOptions(research, 'productRecipes')),
      ...(await listDeliveryOptions(research, 'buildParts')),
      ...(await listDeliveryOptions(research, 'customisation'))
    ].map((option) => option.id)
    expect(products).not.toContain('ODD_EGG')
    expect(products).not.toContain('MYSTERY_BEACON')
    const specials = (await listDeliveryOptions(research, 'quicksilver')).map((option) => option.id)
    expect(specials.some((id) => id.startsWith('SPEC_FIREWORK'))).toBe(false)
    expect(await listDeliveryOptions(research, 'fishing')).toEqual([])
    expect(supportsSelection('twitch')).toBe(false)
  })

  it('builds a request for chosen entries and refuses anything else', async () => {
    const options = await listDeliveryOptions(research, 'titles')
    const [first, second] = options.map((option) => option.id)
    const plan = getSelectionPlan('titles', [first, second, first], options, true)
    expect(plan?.changesAccount).toBe(true)
    expect(plan?.steps[0].request?.lines).toEqual([`title=${first}`, `title=${second}`])
    expect(plan?.steps[0].signals).toEqual(['account'])
    expect(getSelectionPlan('titles', [], options, true)).toBeNull()
    expect(getSelectionPlan('titles', [first, 'NOT_LISTED'], options, true)).toBeNull()
    expect(getSelectionPlan('titles', ['A\r\nid=B'], options, true)).toBeNull()
    expect(getSelectionPlan('fishing', ['ANY'], [], true)).toBeNull()
  })
})

describe('item, currency and equipment requests', () => {
  it('builds one item request and refuses malformed ones', () => {
    const plan = getItemPlan(
      [
        { id: 'FUEL1', amount: 500 },
        { id: 'CASING', amount: 10 }
      ],
      true
    )
    expect(plan?.steps[0].request?.lines).toEqual(['silent=0', 'FUEL1=500', 'CASING=10'])
    expect(getItemPlan([{ id: 'FUEL1', amount: 5 }], false)?.steps[0].request?.lines[0]).toBe(
      'silent=1'
    )
    expect(plan?.steps[0].accept?.(['requested=1', 'FUEL1:5/5 stack 9999=rewarded'])).toBe(true)
    expect(plan?.steps[0].signals).toEqual(['item'])
    expect(plan?.steps[0].accept?.(['requested=1', 'FUEL1:0/5 stack 0=no_room'])).toBe(false)
    expect(getItemPlan([], true)).toBeNull()
    expect(getItemPlan([{ id: 'FUEL1', amount: 0 }], true)).toBeNull()
    expect(getItemPlan([{ id: 'FUEL1', amount: 1.5 }], true)).toBeNull()
    expect(getItemPlan([{ id: 'FUEL1', amount: 1000000 }], true)).toBeNull()
    expect(getItemPlan([{ id: 'fuel1; x', amount: 1 }], true)).toBeNull()
    expect(
      getItemPlan(
        [
          { id: 'FUEL1', amount: 1 },
          { id: 'FUEL1', amount: 2 }
        ],
        true
      )
    ).toBeNull()
  })

  it('takes any currency amount up to the game maximum', () => {
    const plan = getCurrencyPlan({ currency: 'nanites', amount: 4294967295 }, false)
    expect(plan?.steps[0].request?.lines).toEqual([
      'currency=nanites',
      'amount=4294967295',
      'silent=1'
    ])
    expect(plan?.steps[0].accept?.(['currency=nanites', 'result=unknown_reward'])).toBe(false)
    expect(getCurrencyPlan({ currency: 'gold', amount: 5 }, true)).toBeNull()
    expect(getCurrencyPlan({ currency: 'units', amount: 4294967296 }, true)).toBeNull()
    expect(getCurrencyPlan({ currency: 'units', amount: 0 }, true)).toBeNull()
  })

  it('arms the options of an offer before the request that starts it', () => {
    const base = {
      slots: true,
      supercharge: true,
      extendedTechnology: true,
      itemClass: 'S',
      shipIndex: -1
    }
    expect(
      getEquipmentPlan({ ...base, area: 'corvettes', action: 'build' })?.steps[0].signals
    ).toEqual(['s', 'slots', 'techrows', 'super', 'corvette'])
    expect(
      getEquipmentPlan({ ...base, area: 'exosuit', action: 'grid' })?.steps[0].request?.lines
    ).toEqual(['target=suit', 'index=0', 'slots=1', 'super=1'])
    expect(
      getEquipmentPlan({ ...base, area: 'starships', action: 'classStep' })?.steps[0].request?.lines
    ).toEqual(['R_SHIPUPGRADE'])
    expect(getEquipmentPlan({ ...base, area: 'exosuit', action: 'build' })).toBeNull()
    expect(
      getEquipmentPlan({ ...base, area: 'freighters', action: 'offer', itemClass: 'X' })
    ).toBeNull()
  })
})
