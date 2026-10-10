import { useState } from 'react'
import {
  CircleCheckIcon,
  DownloadIcon,
  FolderSearchIcon,
  Gamepad2Icon,
  TriangleAlertIcon
} from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@renderer/components/ui/alert'
import { Button } from '@renderer/components/ui/button'
import { Spinner } from '@renderer/components/ui/spinner'
import { featureHref } from '@renderer/features'
import { tones, type Tone } from '@renderer/features/tones'
import type { BridgeStatus } from '@renderer/hooks/use-game-state'
import { useLocale } from '@renderer/i18n/locale'

// The one thing the player has to do next before anything can be sent: choose the game folder,
// install the application's files into the game, or open the game. Shows nothing once the game is
// connected, unless the page asks for the "ready" line.
export function SetupNotice({
  bridge,
  showReady = false
}: {
  bridge: BridgeStatus | null
  showReady?: boolean
}): React.JSX.Element | null {
  const { copy } = useLocale()
  const text = copy.setup
  const [working, setWorking] = useState(false)
  // What the last installation left, until the next status read replaces it.
  const [installed, setInstalled] = useState<BridgeStatus['install'] | null>(null)

  if (!bridge || bridge.state === 'unavailable') return null
  const install = installed ?? bridge.install

  const run = async (): Promise<void> => {
    setWorking(true)
    try {
      setInstalled(await window.nms.installBridge())
    } finally {
      setWorking(false)
    }
  }

  const notice = (
    tone: Tone,
    Icon: typeof Gamepad2Icon,
    title: string,
    body: string,
    action?: React.JSX.Element
  ): React.JSX.Element => (
    <Alert className={`border-transparent ${tones[tone]}`}>
      <Icon />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="text-current/80">
        {body}
        {action && <div className="mt-2">{action}</div>}
      </AlertDescription>
    </Alert>
  )

  if (bridge.state === 'installation_not_selected') {
    return notice(
      'info',
      FolderSearchIcon,
      text.chooseTitle,
      text.chooseBody,
      <Button size="sm" render={<a href={featureHref('bridge')} />}>
        {text.chooseButton}
      </Button>
    )
  }
  if (install?.needed) {
    if (install.blocked === 'foreign_file') {
      return notice('danger', TriangleAlertIcon, text.foreignTitle, text.foreignBody)
    }
    if (install.blocked === 'files_unavailable') {
      return notice('danger', TriangleAlertIcon, text.unavailableTitle, text.unavailableBody)
    }
    if (install.blocked === 'game_running') {
      return notice('caution', TriangleAlertIcon, text.closeGameTitle, text.closeGameBody)
    }
    const update = install.bridge === 'older' || install.data === 'older'
    return notice(
      'caution',
      DownloadIcon,
      update ? text.updateTitle : text.installTitle,
      text.installBody,
      <Button size="sm" disabled={working} onClick={() => void run()}>
        {working ? <Spinner data-icon="inline-start" /> : <DownloadIcon data-icon="inline-start" />}
        {update ? text.updateButton : text.installButton}
      </Button>
    )
  }
  if (bridge.state === 'ready') {
    return showReady ? notice('good', CircleCheckIcon, text.readyTitle, text.readyBody) : null
  }
  return notice('info', Gamepad2Icon, text.openGameTitle, text.openGameBody)
}
