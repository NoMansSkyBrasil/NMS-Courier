import { useEffect, useState } from 'react'
import { BookOpenIcon, CableIcon, Gamepad2Icon, HashIcon, SendIcon } from 'lucide-react'
import { StatusBadge } from '@renderer/components/feature-badges'
import { GameIcon } from '@renderer/components/game-icon'
import { AvatarGroup } from '@renderer/components/ui/avatar'
import { Badge } from '@renderer/components/ui/badge'
import { Button } from '@renderer/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@renderer/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@renderer/components/ui/tabs'
import { featureGroups, featureHref } from '@renderer/features'
import { useGameState } from '@renderer/hooks/use-game-state'
import { formatMessage, useLocale } from '@renderer/i18n/locale-provider'

// Items whose game icons decorate the hero; any that the catalogue does not hold is skipped.
const heroItems = ['FUEL1', 'LAND1', 'OXYGEN', 'LAUNCHSUB', 'CASING', 'NANOTUBES', 'ASTEROID1']
// Groups whose areas send something to the game, in the order of the sidebar.
const areaGroups = ['deliver', 'unlock', 'rewards'] as const

// The start page: what the application is, whether something can be sent right now, and every
// area one click away.
export function DashboardPage(): React.JSX.Element {
  const { copy, locale } = useLocale()
  const { game, build, catalog, bridge } = useGameState()
  const text = copy.dashboard
  const [icons, setIcons] = useState<string[]>([])

  const catalogReady = catalog?.state === 'available'
  useEffect(() => {
    if (!catalogReady) return
    let active = true
    void Promise.all(
      heroItems.map((id) =>
        window.nms
          .searchCatalog({ query: id, locale, limit: 20 })
          .then((found) => found.entries.find((entry) => entry.gameId === id)?.icon ?? null)
          .catch(() => null)
      )
    ).then((found) => active && setIcons(found.filter((icon): icon is string => icon !== null)))
    return () => {
      active = false
    }
  }, [catalogReady, locale])

  const cards = [
    {
      label: text.game,
      icon: Gamepad2Icon,
      value:
        game?.state === 'running'
          ? text.running
          : game?.state === 'installation_not_selected'
            ? text.notSelected
            : game?.state === 'not_running'
              ? text.notRunning
              : text.unknown,
      detail:
        game?.state === 'running' && game.processId !== null
          ? formatMessage(text.processId, { id: game.processId })
          : ''
    },
    {
      label: text.build,
      icon: HashIcon,
      value:
        build?.state === 'supported'
          ? text.supported
          : build?.state === 'unknown'
            ? text.unsupported
            : build?.state === 'installation_not_selected'
              ? text.notSelected
              : text.unknown,
      detail: build?.buildLabel ?? ''
    },
    {
      label: text.bridge,
      icon: CableIcon,
      value: bridge?.state === 'ready' ? text.connected : text.notConnected,
      detail: bridge?.installedBridgeVersion ?? ''
    },
    {
      label: text.catalog,
      icon: BookOpenIcon,
      value: catalogReady ? text.available : text.unavailable,
      detail: catalogReady
        ? formatMessage(text.entriesCount, { count: catalog.entryCount.toLocaleString(locale) })
        : ''
    }
  ]
  const groups = featureGroups.filter((group) =>
    (areaGroups as readonly string[]).includes(group.id)
  )

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            {bridge && (
              <>
                <Badge variant="secondary">
                  {copy.bridgePage.versionApp} {bridge.appVersion}
                </Badge>
                <Badge variant="outline">
                  {text.bridge} {bridge.installedBridgeVersion ?? bridge.bridgeVersion}
                </Badge>
              </>
            )}
          </div>
          <CardTitle className="text-3xl font-semibold tracking-tight @xl/main:text-4xl">
            {copy.app.name}
          </CardTitle>
          <CardDescription className="max-w-prose text-base">{text.heroBody}</CardDescription>
          {icons.length > 0 && (
            <CardAction>
              <AvatarGroup>
                {icons.map((icon) => (
                  <GameIcon key={icon} locator={icon} size="lg" />
                ))}
              </AvatarGroup>
            </CardAction>
          )}
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
            {bridge
              ? formatMessage(copy.delivery.state[bridge.state], { id: bridge.processId ?? '' })
              : copy.delivery.state.unavailable}
          </p>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2">
          <Button render={<a href={featureHref('items')} />}>
            <SendIcon data-icon="inline-start" />
            {copy.delivery.itemsTitle}
          </Button>
          <Button variant="outline" render={<a href={featureHref('bridge')} />}>
            <CableIcon data-icon="inline-start" />
            {copy.features.bridge.title}
          </Button>
          <Button variant="ghost" render={<a href={featureHref('catalog')} />}>
            <BookOpenIcon data-icon="inline-start" />
            {copy.features.catalog.title}
          </Button>
        </CardFooter>
      </Card>
      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label} className="@container/card">
            <CardHeader>
              <CardDescription>{card.label}</CardDescription>
              <CardTitle className="text-2xl font-semibold @[250px]/card:text-3xl">
                {card.value}
              </CardTitle>
              <CardAction>
                <card.icon className="size-4 text-muted-foreground" />
              </CardAction>
            </CardHeader>
            {card.detail && (
              <CardFooter className="text-sm text-muted-foreground">{card.detail}</CardFooter>
            )}
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{text.capabilities}</CardTitle>
          <CardDescription>{text.capabilitiesHint}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={groups[0]?.id}>
            <TabsList>
              {groups.map((group) => (
                <TabsTrigger key={group.id} value={group.id}>
                  {copy.groups[group.id]}
                </TabsTrigger>
              ))}
            </TabsList>
            {groups.map((group) => (
              <TabsContent key={group.id} value={group.id}>
                <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
                  {group.features.map((feature) => (
                    <a key={feature.id} href={featureHref(feature.id)}>
                      <Card size="sm" className="h-full transition-colors hover:bg-muted/50">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <feature.icon className="size-4 text-muted-foreground" />
                            {copy.features[feature.id].title}
                          </CardTitle>
                          <CardDescription>{copy.features[feature.id].summary}</CardDescription>
                          {feature.status && (
                            <CardAction>
                              <StatusBadge status={feature.status} />
                            </CardAction>
                          )}
                        </CardHeader>
                      </Card>
                    </a>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </main>
  )
}
