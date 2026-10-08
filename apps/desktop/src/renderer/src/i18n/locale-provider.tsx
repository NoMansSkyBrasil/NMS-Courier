import { useEffect, useState } from 'react'
import { deDE } from './locales/de-DE'
import { enUS } from './locales/en-US'
import { esES } from './locales/es-ES'
import { frFR } from './locales/fr-FR'
import { itIT } from './locales/it-IT'
import { jaJP } from './locales/ja-JP'
import { koKR } from './locales/ko-KR'
import { nlNL } from './locales/nl-NL'
import { plPL } from './locales/pl-PL'
import { ptBR } from './locales/pt-BR'
import { ptPT } from './locales/pt-PT'
import { ruRU } from './locales/ru-RU'
import { zhCN } from './locales/zh-CN'
import { zhTW } from './locales/zh-TW'
import { LocaleContext, locales, type Locale } from './locale'
import type { Messages } from './messages'

// The provider component alone lives in this file, so the development server can refresh it in
// place; the language list, the hook and the formatter are in ./locale.

// One resource per language; the Messages type makes each of them complete.
const resources: Readonly<Record<Locale, Messages>> = {
  'en-US': enUS,
  'pt-BR': ptBR,
  'nl-NL': nlNL,
  'fr-FR': frFR,
  'de-DE': deDE,
  'it-IT': itIT,
  'ja-JP': jaJP,
  'ko-KR': koKR,
  'pl-PL': plPL,
  'pt-PT': ptPT,
  'ru-RU': ruRU,
  'zh-CN': zhCN,
  'es-ES': esES,
  'zh-TW': zhTW
}

function getInitialLocale(): Locale {
  const savedLocale = window.localStorage.getItem('nms-courier.locale')
  return locales.includes(savedLocale as Locale) ? (savedLocale as Locale) : 'en-US'
}

export function LocaleProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [locale, setLocale] = useState<Locale>(getInitialLocale)

  useEffect(() => {
    window.localStorage.setItem('nms-courier.locale', locale)
    document.documentElement.lang = locale
  }, [locale])

  return (
    <LocaleContext.Provider value={{ locale, setLocale, copy: resources[locale] }}>
      {children}
    </LocaleContext.Provider>
  )
}
