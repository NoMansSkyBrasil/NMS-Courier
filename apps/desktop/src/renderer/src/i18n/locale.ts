import { createContext, useContext } from 'react'
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

export type LocaleContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  copy: Messages
}

// Filled by LocaleProvider.
export const LocaleContext = createContext<LocaleContextValue | null>(null)

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
