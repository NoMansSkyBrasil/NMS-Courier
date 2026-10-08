import type { Locale } from './locale-provider'

// Each language is shown in its own name, whatever the interface language is.
export const languageNames: Readonly<Record<Locale, string>> = {
  'en-US': 'English',
  'pt-BR': 'Português (Brasil)',
  'nl-NL': 'Nederlands',
  'fr-FR': 'Français',
  'de-DE': 'Deutsch',
  'it-IT': 'Italiano',
  'ja-JP': '日本語',
  'ko-KR': '한국어',
  'pl-PL': 'Polski',
  'pt-PT': 'Português (Portugal)',
  'ru-RU': 'Русский',
  'zh-CN': '简体中文',
  'es-ES': 'Español',
  'zh-TW': '繁體中文'
}
