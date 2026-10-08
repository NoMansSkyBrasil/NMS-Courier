import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  getSelectionPlan,
  listDeliveryOptions,
  parseMarkdownRows,
  supportsSelection
} from './delivery-options'

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

  it('builds a plan for chosen entries and refuses anything else', async () => {
    const options = await listDeliveryOptions(research, 'titles')
    const [first, second] = options.map((option) => option.id)
    expect(getSelectionPlan('titles', [first, second, first], options)).toEqual({
      changesAccount: true,
      steps: [{ script: 'signal-account-180836.ps1', args: ['-Title', `${first},${second}`] }]
    })
    expect(getSelectionPlan('titles', [], options)).toBeNull()
    expect(getSelectionPlan('titles', [first, 'NOT_LISTED'], options)).toBeNull()
    expect(getSelectionPlan('titles', ["A'; Remove-Item x"], options)).toBeNull()
    expect(getSelectionPlan('fishing', ['ANY'], [])).toBeNull()
  })
})
