import { CheckIcon, LanguagesIcon } from 'lucide-react'

import { languageNames } from '@renderer/i18n/language-names'
import { locales, useLocale } from '@renderer/i18n/locale-provider'
import { Button } from '@renderer/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@renderer/components/ui/dropdown-menu'

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
        {locales.map((code) => (
          <DropdownMenuItem key={code} onClick={() => setLocale(code)}>
            {languageNames[code]}
            {locale === code && <CheckIcon className="ml-auto" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
