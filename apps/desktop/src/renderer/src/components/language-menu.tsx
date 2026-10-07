import { LanguagesIcon } from 'lucide-react'

import { useLocale, type Locale } from '@renderer/i18n/locale-provider'
import { Button } from '@renderer/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@renderer/components/ui/dropdown-menu'

const languages: { code: Locale; label: string }[] = [
  { code: 'en-US', label: 'English' },
  { code: 'pt-BR', label: 'Português (Brasil)' },
  { code: 'nl-NL', label: 'Nederlands' },
  { code: 'fr-FR', label: 'Français' },
  { code: 'de-DE', label: 'Deutsch' },
  { code: 'it-IT', label: 'Italiano' },
  { code: 'ja-JP', label: '日本語' },
  { code: 'ko-KR', label: '한국어' },
  { code: 'pl-PL', label: 'Polski' },
  { code: 'pt-PT', label: 'Português (Portugal)' },
  { code: 'ru-RU', label: 'Русский' },
  { code: 'zh-CN', label: '简体中文' },
  { code: 'es-ES', label: 'Español' },
  { code: 'zh-TW', label: '繁體中文' }
]

export function LanguageMenu(): React.JSX.Element {
  const { locale, setLocale, copy } = useLocale()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon" aria-label={copy.controls.changeLanguage} />}
      >
        <LanguagesIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem key={language.code} onClick={() => setLocale(language.code)}>
            {language.label}
            {locale === language.code && <span className="ml-auto">✓</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
