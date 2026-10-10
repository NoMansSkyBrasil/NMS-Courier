import { CheckIcon, InfoIcon } from 'lucide-react'
import { DeliveryCard } from '@renderer/components/delivery-card'
import { CorvetteFileCard } from '@renderer/components/corvette-file-card'
import { CurrencyCard } from '@renderer/components/currency-card'
import { TeleportCard } from '@renderer/components/teleport-card'
import { GlyphsCard } from '@renderer/components/glyphs-card'
import { LevelsCard } from '@renderer/components/levels-card'
import { MissionsCard } from '@renderer/components/missions-card'
import { PendingTechCard } from '@renderer/components/pending-tech-card'
import { SavesCard } from '@renderer/components/saves-card'
import { SetupNotice } from '@renderer/components/setup-notice'
import { useGameState } from '@renderer/hooks/use-game-state'
import { PlanetFinderCard } from '@renderer/components/planet-finder-card'
import { EquipmentCard } from '@renderer/components/equipment-card'
import { isEquipmentArea } from '@renderer/features/equipment-areas'
import { ItemsCard } from '@renderer/components/items-card'
import { ScopeBadge, StatusBadge } from '@renderer/components/feature-badges'
import { Alert, AlertDescription, AlertTitle } from '@renderer/components/ui/alert'
import { Badge } from '@renderer/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@renderer/components/ui/card'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from '@renderer/components/ui/empty'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@renderer/components/ui/table'
import { researchBuild, type Feature } from '@renderer/features'
import type { SectionId } from '@renderer/i18n/messages'
import { formatMessage, useLocale } from '@renderer/i18n/locale'

// One area of the application: what it changes, how far it is proven, what it covers and the rules
// it always follows. Nothing is sent from here; the page states that plainly.
export function FeaturePage({
  feature,
  section
}: {
  feature: Feature
  section: SectionId | null
}): React.JSX.Element {
  const { copy, locale } = useLocale()
  const { bridge } = useGameState()
  const text = copy.features[feature.id]

  if (feature.status === 'planned') {
    return (
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <feature.icon />
            </EmptyMedia>
            <EmptyTitle>{copy.page.plannedTitle}</EmptyTitle>
            <EmptyDescription>{text.summary}</EmptyDescription>
            <EmptyDescription>{copy.page.plannedBody}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </main>
    )
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>{text.title}</CardTitle>
            {feature.status && <StatusBadge status={feature.status} />}
            {feature.scope && <ScopeBadge scope={feature.scope} />}
          </div>
          <CardDescription>{text.summary}</CardDescription>
        </CardHeader>
      </Card>
      {feature.kind === 'delivery' && <SetupNotice bridge={bridge} />}
      {feature.id === 'items' ? (
        <ItemsCard />
      ) : feature.id === 'currencies' ? (
        <CurrencyCard />
      ) : feature.id === 'teleport' ? (
        <TeleportCard />
      ) : feature.id === 'glyphs' ? (
        <GlyphsCard />
      ) : feature.id === 'planets' ? (
        <PlanetFinderCard />
      ) : feature.id === 'pendingTech' ? (
        <PendingTechCard />
      ) : feature.id === 'saves' ? (
        <SavesCard />
      ) : feature.id === 'missions' ? (
        <MissionsCard />
      ) : feature.id === 'standings' || feature.id === 'milestones' ? (
        <LevelsCard key={feature.id} page={feature.id} />
      ) : isEquipmentArea(feature.id) ? (
        <>
          {feature.id === 'corvettes' && <CorvetteFileCard />}
          <EquipmentCard
            key={`${feature.id}/${section ?? ''}`}
            area={feature.id}
            section={section}
          />
        </>
      ) : feature.wired ? (
        <DeliveryCard key={feature.id} feature={feature} />
      ) : (
        feature.kind === 'delivery' && (
          <Alert>
            <InfoIcon />
            <AlertTitle>{copy.page.availabilityTitle}</AlertTitle>
            <AlertDescription>{copy.page.availabilityBody}</AlertDescription>
          </Alert>
        )
      )}
      <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
        {feature.rows && (
          <Card className="internal-name">
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle>{copy.page.includes}</CardTitle>
                <Badge variant="outline">
                  {formatMessage(copy.page.researchBuild, { build: researchBuild })}
                </Badge>
              </div>
              <CardDescription>{copy.page.includesHint}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{copy.page.kind}</TableHead>
                    <TableHead className="text-right">{copy.page.entries}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feature.rows.map((entry) => (
                    <TableRow key={entry.row}>
                      <TableCell>{copy.rows[entry.row]}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {entry.count.toLocaleString(locale)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
        {feature.rules && (
          <Card>
            <CardHeader>
              <CardTitle>{copy.page.rulesTitle}</CardTitle>
              <CardDescription>{copy.page.rulesHint}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-3 text-sm">
                {feature.rules.map((rule) => (
                  <li key={rule} className="flex items-start gap-2">
                    <CheckIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <span>{copy.rules[rule]}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
