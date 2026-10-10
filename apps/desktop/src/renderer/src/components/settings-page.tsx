import { FlaskConicalIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { languageNames } from '@renderer/i18n/language-names'
import { Alert, AlertDescription, AlertTitle } from '@renderer/components/ui/alert'
import { Card, CardContent } from '@renderer/components/ui/card'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel
} from '@renderer/components/ui/field'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/components/ui/select'
import { Switch } from '@renderer/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@renderer/components/ui/tabs'
import { useInternalNames } from '@renderer/hooks/use-internal-names'
import { useNotifyPreference } from '@renderer/hooks/use-notify-preference'
import { locales, useLocale, type Locale } from '@renderer/i18n/locale'

export function SettingsPage(): React.JSX.Element {
  const { copy, locale, setLocale } = useLocale()
  const { theme, setTheme } = useTheme()
  const text = copy.settings
  const [notify, setNotify] = useNotifyPreference()
  const [internalNames, setInternalNames] = useInternalNames()
  const themes = [
    { value: 'system', label: copy.controls.system },
    { value: 'light', label: copy.controls.light },
    { value: 'dark', label: copy.controls.dark }
  ]
  const languages = locales.map((code) => ({ value: code, label: languageNames[code] }))

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">{text.general}</TabsTrigger>
          <TabsTrigger value="appearance">{text.appearance}</TabsTrigger>
          <TabsTrigger value="about">{text.about}</TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <Card>
            <CardContent>
              <FieldGroup>
                <Field orientation="responsive">
                  <FieldContent>
                    <FieldLabel htmlFor="settings-language">{text.language}</FieldLabel>
                    <FieldDescription>{text.languageHint}</FieldDescription>
                  </FieldContent>
                  <Select
                    items={languages}
                    value={locale}
                    onValueChange={(value) => setLocale(value as Locale)}
                  >
                    <SelectTrigger id="settings-language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {languages.map((language) => (
                          <SelectItem key={language.value} value={language.value}>
                            {language.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldLabel htmlFor="settings-notify">{text.notifications}</FieldLabel>
                    <FieldDescription>{text.notificationsHint}</FieldDescription>
                  </FieldContent>
                  <Switch id="settings-notify" checked={notify} onCheckedChange={setNotify} />
                </Field>
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldLabel htmlFor="settings-internal-names">{text.internalNames}</FieldLabel>
                    <FieldDescription>{text.internalNamesHint}</FieldDescription>
                  </FieldContent>
                  <Switch
                    id="settings-internal-names"
                    checked={internalNames}
                    onCheckedChange={setInternalNames}
                  />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="appearance">
          <Card>
            <CardContent>
              <FieldGroup>
                <Field orientation="responsive">
                  <FieldContent>
                    <FieldLabel htmlFor="settings-theme">{text.theme}</FieldLabel>
                    <FieldDescription>{text.themeHint}</FieldDescription>
                  </FieldContent>
                  <Select
                    items={themes}
                    value={theme ?? 'system'}
                    onValueChange={(value) => setTheme(value as string)}
                  >
                    <SelectTrigger id="settings-theme">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {themes.map((entry) => (
                          <SelectItem key={entry.value} value={entry.value}>
                            {entry.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="about">
          <Alert>
            <FlaskConicalIcon />
            <AlertTitle>{text.experimental}</AlertTitle>
            <AlertDescription>{text.experimentalBody}</AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </main>
  )
}
