import { useEffect, useState } from 'react'
import { FolderOpenIcon, SaveIcon, ShieldCheckIcon } from 'lucide-react'
import { Badge } from '@renderer/components/ui/badge'
import { Button } from '@renderer/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@renderer/components/ui/card'
import { tones } from '@renderer/features/tones'
import { formatMessage, useLocale } from '@renderer/i18n/locale'
import { featureIds, type FeatureId } from '@renderer/i18n/messages'

type Overview = Awaited<ReturnType<typeof window.nms.getSavesOverview>>

// When each save slot was last written, and the safety copies made before the application's
// changes. Read only: the page opens no save and restores nothing by itself.
export function SavesCard(): React.JSX.Element {
  const { copy, locale } = useLocale()
  const text = copy.savesPage
  const [overview, setOverview] = useState<Overview | null>(null)

  useEffect(() => {
    let active = true
    const refresh = (): void => {
      void window.nms
        .getSavesOverview()
        .then((next) => active && setOverview(next))
        .catch(() => active && setOverview(null))
    }
    refresh()
    const timer = window.setInterval(refresh, 10000)
    return () => {
      active = false
      window.clearInterval(timer)
    }
  }, [])

  const when = (iso: string): string =>
    new Date(iso).toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' })
  const areaName = (feature: string): string =>
    (featureIds as readonly string[]).includes(feature)
      ? copy.features[feature as FeatureId].title
      : feature
  // The slot the game wrote most recently, shown first among equals by a coloured badge.
  const newest = overview?.slots.reduce<string>(
    (latest, slot) => (slot.lastSaved > latest ? slot.lastSaved : latest),
    ''
  )

  return (
    <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SaveIcon className="size-4" />
            {text.slotsTitle}
          </CardTitle>
          <CardDescription>{text.slotsHint}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col divide-y text-sm">
          {overview?.slots.map((slot) => (
            <div key={slot.slot} className="flex flex-wrap items-center gap-2 py-2">
              <span className="flex-1 font-medium">
                {formatMessage(text.slot, { number: slot.slot.toLocaleString(locale) })}
              </span>
              <Badge
                variant="secondary"
                className={slot.lastSaved === newest ? tones.good : undefined}
              >
                {formatMessage(text.lastSaved, { when: when(slot.lastSaved) })}
              </Badge>
            </div>
          ))}
          {overview !== null && overview.slots.length === 0 && (
            <p className="text-muted-foreground">{text.noSlots}</p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheckIcon className="size-4" />
            {text.backupsTitle}
          </CardTitle>
          <CardDescription>{text.backupsHint}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          {overview !== null && overview.backupCount > 0 && (
            <Badge variant="secondary" className={tones.good}>
              {formatMessage(text.backupCount, {
                count: overview.backupCount.toLocaleString(locale)
              })}
            </Badge>
          )}
          <div className="flex max-h-72 flex-col divide-y overflow-y-auto">
            {overview?.backups.map((backup) => (
              <div key={backup.name} className="flex flex-wrap items-center gap-2 py-2">
                <span className="flex-1">
                  {backup.createdAt ? when(backup.createdAt) : backup.name}
                </span>
                {backup.feature && (
                  <span className="text-xs text-muted-foreground">
                    {formatMessage(text.before, { feature: areaName(backup.feature) })}
                  </span>
                )}
              </div>
            ))}
          </div>
          {overview !== null && overview.backupCount === 0 && (
            <p className="text-muted-foreground">{text.noBackups}</p>
          )}
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => void window.nms.openBackupsFolder()}>
            <FolderOpenIcon data-icon="inline-start" />
            {text.openFolder}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
