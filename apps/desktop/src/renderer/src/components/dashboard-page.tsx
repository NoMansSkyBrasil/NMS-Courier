import { BookOpenIcon, CableIcon, Gamepad2Icon, HashIcon } from 'lucide-react'
import { ScopeBadge, StatusBadge } from '@renderer/components/feature-badges'
import { Badge } from '@renderer/components/ui/badge'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@renderer/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@renderer/components/ui/table'
import { featureHref, features } from '@renderer/features'
import { useGameState } from '@renderer/hooks/use-game-state'
import { formatMessage, useLocale } from '@renderer/i18n/locale-provider'

// Answers one question: can something be delivered right now, and if not, what is missing.
export function DashboardPage(): React.JSX.Element {
  const { copy, locale } = useLocale()
  const { game, build, catalog, diagnostics } = useGameState()
  const text = copy.dashboard

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
      value:
        diagnostics?.state === 'callback_ready' || diagnostics?.state === 'bridge_authenticated'
          ? text.connected
          : text.notConnected,
      detail: diagnostics?.buildLabel ?? ''
    },
    {
      label: text.catalog,
      icon: BookOpenIcon,
      value: catalog?.state === 'available' ? text.available : text.unavailable,
      detail:
        catalog?.state === 'available'
          ? formatMessage(text.entriesCount, { count: catalog.entryCount.toLocaleString(locale) })
          : ''
    }
  ]
  const deliveries = features.filter((feature) => feature.kind === 'delivery' && feature.status)

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{text.feature}</TableHead>
                <TableHead>{text.area}</TableHead>
                <TableHead>{copy.page.scope}</TableHead>
                <TableHead>{copy.page.status}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deliveries.map((feature) => (
                <TableRow key={feature.id}>
                  <TableCell>
                    <a
                      href={featureHref(feature.id)}
                      className="flex items-center gap-2 font-medium underline-offset-4 hover:underline"
                    >
                      <feature.icon className="size-4 text-muted-foreground" />
                      {copy.features[feature.id].title}
                    </a>
                  </TableCell>
                  <TableCell>
                    <Badge variant="ghost">{copy.groups[feature.group]}</Badge>
                  </TableCell>
                  <TableCell>{feature.scope && <ScopeBadge scope={feature.scope} />}</TableCell>
                  <TableCell>{feature.status && <StatusBadge status={feature.status} />}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  )
}
