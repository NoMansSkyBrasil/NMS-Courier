import { useEffect, useState } from 'react'
import { FolderOpenIcon, RadioIcon, SearchIcon } from 'lucide-react'
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
import { Spinner } from '@renderer/components/ui/spinner'
import { useGameState } from '@renderer/hooks/use-game-state'
import { SetupNotice } from '@renderer/components/setup-notice'
import { tones } from '@renderer/features/tones'
import { formatMessage, useLocale } from '@renderer/i18n/locale'

type Installation = Awaited<ReturnType<typeof window.nms.getInstallationStatus>>
type BridgeStatus = Awaited<ReturnType<typeof window.nms.getResearchBridgeStatus>>

const activeDiagnostics = [
  'checking',
  'starting',
  'host_ready',
  'bridge_authenticated',
  'callback_ready'
]

// Everything between the application and the game: which installation is used, whether the game
// runs, whether its build is known, and the state of the bridge that performs the deliveries.
export function BridgePage(): React.JSX.Element {
  const { copy } = useLocale()
  const text = copy.bridgePage
  const { game, build, diagnostics } = useGameState()
  const [installation, setInstallation] = useState<Installation | null>(null)
  const [bridge, setBridge] = useState<BridgeStatus | null>(null)
  const [selecting, setSelecting] = useState(false)
  const [detecting, setDetecting] = useState(false)
  // Installations found by the last detection; null until one has run.
  const [found, setFound] = useState<number | null>(null)
  const [starting, setStarting] = useState(false)
  const [trace, setTrace] = useState<string[]>([])

  // The reward trace is read again while the page is open; it is empty until it is switched on.
  useEffect(() => {
    let active = true
    const refresh = (): void => {
      void window.nms
        .getRewardTrace()
        .then((lines) => active && setTrace(lines))
        .catch(() => undefined)
    }
    refresh()
    const timer = window.setInterval(refresh, 3000)
    return () => {
      active = false
      window.clearInterval(timer)
    }
  }, [])

  useEffect(() => {
    let active = true
    const refresh = (): void => {
      void window.nms.getInstallationStatus().then((next) => active && setInstallation(next))
      void window.nms.getResearchBridgeStatus().then((next) => active && setBridge(next))
    }
    refresh()
    const timer = window.setInterval(refresh, 5000)
    return () => {
      active = false
      window.clearInterval(timer)
    }
  }, [])

  const selectInstallation = async (): Promise<void> => {
    setSelecting(true)
    try {
      setInstallation(await window.nms.selectInstallation())
      setBridge(await window.nms.getResearchBridgeStatus())
    } finally {
      setSelecting(false)
    }
  }

  const detectInstallation = async (): Promise<void> => {
    setDetecting(true)
    try {
      const result = await window.nms.detectInstallation()
      setInstallation(result.status)
      setFound(result.found)
      setBridge(await window.nms.getResearchBridgeStatus())
    } finally {
      setDetecting(false)
    }
  }

  const startDiagnostics = async (): Promise<void> => {
    setStarting(true)
    try {
      await window.nms.startRuntimeDiagnostics()
    } finally {
      setStarting(false)
    }
  }

  const installationText =
    installation?.state === 'available'
      ? formatMessage(text.installationSelected, { name: installation.displayName ?? '' })
      : installation?.state === 'invalid'
        ? text.installationInvalid
        : found === 0
          ? text.detectNone
          : found !== null && found > 1
            ? text.detectSeveral
            : text.installationNone
  const gameText =
    game?.state === 'running'
      ? copy.dashboard.running
      : game?.state === 'not_running'
        ? copy.dashboard.notRunning
        : game?.state === 'installation_not_selected'
          ? copy.dashboard.notSelected
          : copy.dashboard.unknown
  const buildText =
    build?.state === 'supported'
      ? copy.dashboard.supported
      : build?.state === 'unknown'
        ? copy.dashboard.unsupported
        : copy.dashboard.unknown
  const diagnosticsText =
    diagnostics?.state === 'callback_ready'
      ? text.diagCallbackReady
      : diagnostics?.state === 'bridge_authenticated'
        ? text.diagAuthenticated
        : diagnostics?.state === 'host_ready'
          ? text.diagHostReady
          : diagnostics?.state === 'failed'
            ? formatMessage(text.diagFailed, { reason: diagnostics.reasonCode ?? '' })
            : diagnostics?.state === 'ended'
              ? text.diagEnded
              : text.diagNotConnected
  const diagnosticsBusy = starting || activeDiagnostics.includes(diagnostics?.state ?? '')

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <SetupNotice bridge={bridge} showReady />
      <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{text.installationTitle}</CardTitle>
            <CardDescription>{installationText}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">{copy.dashboard.game}</span>
              <Badge
                variant="secondary"
                className={game?.state === 'running' ? tones.good : tones.info}
              >
                {gameText}
              </Badge>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">{copy.dashboard.build}</span>
              <Badge
                variant="secondary"
                className={
                  build?.state === 'supported'
                    ? tones.good
                    : build?.state === 'unknown'
                      ? tones.danger
                      : undefined
                }
              >
                {build?.buildLabel ?? buildText}
              </Badge>
            </div>
          </CardContent>
          <CardFooter className="flex flex-wrap gap-2">
            <Button onClick={() => void detectInstallation()} disabled={detecting || selecting}>
              {detecting ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <SearchIcon data-icon="inline-start" />
              )}
              {detecting ? text.detecting : text.detect}
            </Button>
            <Button
              variant="outline"
              onClick={() => void selectInstallation()}
              disabled={selecting}
            >
              {selecting ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <FolderOpenIcon data-icon="inline-start" />
              )}
              {selecting ? text.verifying : text.select}
            </Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{text.bridgeTitle}</CardTitle>
            <CardDescription>{text.bridgeHint}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            {bridge && (
              <>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">{text.versionApp}</span>
                  <Badge variant="outline">{bridge.appVersion}</Badge>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">{text.versionBridge}</span>
                  <Badge
                    variant="secondary"
                    className={
                      bridge.installedBridgeVersion === bridge.bridgeVersion
                        ? tones.good
                        : tones.caution
                    }
                  >
                    {bridge.bridgeSha256 === null
                      ? text.versionNone
                      : (bridge.installedBridgeVersion ?? text.versionOld)}
                  </Badge>
                </div>
                {bridge.bridgeSha256 !== null && (
                  <p className="text-muted-foreground">
                    {bridge.installedBridgeVersion === bridge.bridgeVersion
                      ? text.versionCurrent
                      : formatMessage(text.versionOutdated, { version: bridge.bridgeVersion })}
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
      {/* A developer's read-only probe; shown only with internal names switched on. */}
      <Card className="internal-name">
        <CardHeader>
          <CardTitle>{text.diagnosticsTitle}</CardTitle>
          <CardDescription>{text.diagnosticsHint}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
            {diagnosticsText}
          </p>
        </CardContent>
        <CardFooter>
          <Button
            variant="outline"
            onClick={() => void startDiagnostics()}
            disabled={
              diagnosticsBusy || installation?.state !== 'available' || game?.state !== 'running'
            }
          >
            <RadioIcon data-icon="inline-start" />
            {starting ? text.starting : text.connect}
          </Button>
        </CardFooter>
      </Card>
      {/* A developer's list of the rewards the game gives; shown only with internal names switched on. */}
      <Card className="internal-name">
        <CardHeader>
          <CardTitle>{text.traceTitle}</CardTitle>
          <CardDescription>{text.traceHint}</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="max-h-64 overflow-auto rounded-lg bg-muted p-3 text-xs">
            {trace.length > 0 ? trace.join('\n') : '-'}
          </pre>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            disabled={bridge?.state !== 'ready'}
            onClick={() => void window.nms.setRewardTrace(true)}
          >
            {text.traceStart}
          </Button>
          <Button
            variant="outline"
            disabled={bridge?.state !== 'ready'}
            onClick={() => void window.nms.setRewardTrace(false)}
          >
            {text.traceStop}
          </Button>
        </CardFooter>
      </Card>
    </main>
  )
}
