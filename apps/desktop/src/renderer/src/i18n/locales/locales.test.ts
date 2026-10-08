import { describe, expect, it } from 'vitest'
import { deDE } from './de-DE'
import { enUS } from './en-US'
import { esES } from './es-ES'
import { frFR } from './fr-FR'
import { itIT } from './it-IT'
import { jaJP } from './ja-JP'
import { koKR } from './ko-KR'
import { nlNL } from './nl-NL'
import { plPL } from './pl-PL'
import { ptBR } from './pt-BR'
import { ptPT } from './pt-PT'
import { ruRU } from './ru-RU'
import { zhCN } from './zh-CN'
import { zhTW } from './zh-TW'

const resources = {
  'de-DE': deDE,
  'es-ES': esES,
  'fr-FR': frFR,
  'it-IT': itIT,
  'ja-JP': jaJP,
  'ko-KR': koKR,
  'nl-NL': nlNL,
  'pl-PL': plPL,
  'pt-BR': ptBR,
  'pt-PT': ptPT,
  'ru-RU': ruRU,
  'zh-CN': zhCN,
  'zh-TW': zhTW
}

// Every string of a resource, keyed by its path ("page.open").
function flatten(node: unknown, path: string, out: Map<string, string>): Map<string, string> {
  if (typeof node === 'string') out.set(path, node)
  else if (node && typeof node === 'object') {
    for (const [key, value] of Object.entries(node))
      flatten(value, path ? `${path}.${key}` : key, out)
  }
  return out
}

const placeholders = (text: string): string[] => (text.match(/\{\w+\}/g) ?? []).sort()

describe('locale resources', () => {
  const source = flatten(enUS, '', new Map())

  it('cover the thirteen languages besides English', () => {
    expect(Object.keys(resources)).toHaveLength(13)
  })

  for (const [locale, resource] of Object.entries(resources)) {
    it(`${locale} has every string, none empty, with the same placeholders`, () => {
      const strings = flatten(resource, '', new Map())
      expect([...strings.keys()].sort()).toEqual([...source.keys()].sort())
      for (const [path, text] of strings) {
        expect(text.trim(), path).not.toBe('')
        expect(placeholders(text), path).toEqual(placeholders(source.get(path) as string))
      }
    })
  }
})
