import { Gamepad2Icon } from 'lucide-react'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@renderer/components/ui/sidebar'
import { featureHref } from '@renderer/features'
import { useGameState } from '@renderer/hooks/use-game-state'
import { useLocale } from '@renderer/i18n/locale'
import { toneDots, tones } from '@renderer/features/tones'

// Persistent footer: whether the game is running and which build it is. "Running" does not mean
// that a delivery is possible; the bridge page explains the rest.
export function NavStatus(): React.JSX.Element {
  const { copy } = useLocale()
  const { game, build, bridge } = useGameState()
  // Green when something can be sent, amber when the game runs without the connection.
  const tone =
    bridge?.state === 'ready' ? 'good' : game?.state === 'running' ? 'caution' : 'neutral'

  const gameLabel =
    game?.state === 'running'
      ? copy.dashboard.running
      : game?.state === 'installation_not_selected'
        ? copy.dashboard.notSelected
        : game?.state === 'not_running'
          ? copy.dashboard.notRunning
          : copy.dashboard.unknown
  const buildLabel = build?.buildLabel ?? copy.dashboard.unknown

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          tooltip={copy.features.bridge.title}
          render={<a href={featureHref('bridge')} />}
        >
          <div
            className={`flex aspect-square size-8 items-center justify-center rounded-lg ${tones[tone]}`}
          >
            <Gamepad2Icon className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="flex items-center gap-1.5 truncate font-medium">
              <span aria-hidden className={`size-2 shrink-0 rounded-full ${toneDots[tone]}`} />
              {gameLabel}
            </span>
            <span className="truncate text-xs">{buildLabel}</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
