import { createContext, useContext, useEffect, useState } from 'react'
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
import type { Messages } from './messages'

// The fourteen interface languages No Man's Sky lists on its store page; keep this set exact.
export const locales = [
  'en-US',
  'pt-BR',
  'nl-NL',
  'fr-FR',
  'de-DE',
  'it-IT',
  'ja-JP',
  'ko-KR',
  'pl-PL',
  'pt-PT',
  'ru-RU',
  'zh-CN',
  'es-ES',
  'zh-TW'
] as const
export type Locale = (typeof locales)[number]

export const gameLanguageSources: Readonly<Record<Locale, string>> = {
  'en-US': 'usenglish',
  'pt-BR': 'brazilianportuguese',
  'nl-NL': 'dutch',
  'fr-FR': 'french',
  'de-DE': 'german',
  'it-IT': 'italian',
  'ja-JP': 'japanese',
  'ko-KR': 'korean',
  'pl-PL': 'polish',
  'pt-PT': 'portuguese',
  'ru-RU': 'russian',
  'zh-CN': 'simplifiedchinese',
  'es-ES': 'spanish',
  'zh-TW': 'traditionalchinese'
}

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

type LocaleContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  copy: Messages
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

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

export function useLocale(): LocaleContextValue {
  const context = useContext(LocaleContext)
  if (!context) {
    throw new Error('useLocale must be used within LocaleProvider.')
  }

  return context
}

// Fill "{name}" placeholders of a message; sentences are never built by joining fragments.
export function formatMessage(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in values ? String(values[name]) : match
  )
}
