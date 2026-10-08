import { useEffect, useState } from 'react'
import { CircleAlertIcon, CircleCheckIcon, FileUpIcon, HardDriveDownloadIcon } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@renderer/components/ui/alert'
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
import { formatMessage, useLocale } from '@renderer/i18n/locale-provider'

type Summary = Awaited<ReturnType<typeof window.nms.chooseCorvetteFile>>
type Status = Awaited<ReturnType<typeof window.nms.getCorvetteLayout>>
type Installed = Awaited<ReturnType<typeof window.nms.installCorvetteLayout>>

// A corvette from a shared file: pick the export, see what it holds, and prepare the game so its
// build mode starts with that corvette. The build itself is started with the card below, after the
// game was restarted.
export function CorvetteFileCard(): React.JSX.Element {
  const { copy, locale } = useLocale()
  const text = copy.corvette
  const [summary, setSummary] = useState<Summary>(null)
  const [status, setStatus] = useState<Status | null>(null)
  const [installed, setInstalled] = useState<Installed | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    void window.nms.getCorvetteLayout().then(setStatus)
  }, [])

  const choose = async (): Promise<void> => {
    setBusy(true)
    try {
      setInstalled(null)
      setSummary(await window.nms.chooseCorvetteFile())
    } finally {
      setBusy(false)
    }
  }
  const install = async (): Promise<void> => {
    setBusy(true)
    try {
      setInstalled(await window.nms.installCorvetteLayout())
      setStatus(await window.nms.getCorvetteLayout())
    } finally {
      setBusy(false)
    }
  }

  const count = (value: number): string => value.toLocaleString(locale)
  const missing =
    summary?.state === 'corvette'
      ? [
          !summary.hasCockpit && text.partCockpit,
          !summary.hasLandingGear && text.partLandingGear,
          !summary.hasHabitation && text.partHabitation,
          !summary.hasReactor && text.partReactor
        ].filter((part): part is string => Boolean(part))
      : []

  return (
    <Card>
      <CardHeader>
        <CardTitle>{text.title}</CardTitle>
        <CardDescription>{text.hint}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          {status?.installed
            ? formatMessage(text.current, {
                name: status.installed.name || '—',
                count: count(status.installed.partCount)
              })
            : text.none}
        </p>
        {summary?.state === 'corvette' && (
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium">{summary.name || '—'}</span>
              <Badge variant="secondary">
                {formatMessage(text.parts, { count: count(summary.partCount) })}
              </Badge>
              <Badge variant="outline">
                {formatMessage(text.hullParts, { count: count(summary.hullPartCount) })}
              </Badge>
            </div>
            {missing.length > 0 && (
              <p className="text-muted-foreground">
                {formatMessage(text.missing, { parts: missing.join(', ') })}
              </p>
            )}
          </div>
        )}
        {summary && summary.state !== 'corvette' && (
          <Alert variant="destructive">
            <CircleAlertIcon />
            <AlertTitle>{text.rejectedTitle}</AlertTitle>
            <AlertDescription>
              {summary.state === 'ship' ? text.rejectedShip : text.rejectedInvalid}
            </AlertDescription>
          </Alert>
        )}
        {installed && (
          <Alert variant={installed.state === 'failed' ? 'destructive' : 'default'}>
            {installed.state === 'failed' ? <CircleAlertIcon /> : <CircleCheckIcon />}
            <AlertTitle>
              {installed.state === 'failed' ? text.installFailedTitle : text.installedTitle}
            </AlertTitle>
            <AlertDescription>
              {installed.state === 'failed'
                ? installed.reason === 'unknown_structure'
                  ? copy.catalogPage.failStructure
                  : installed.reason === 'unreadable'
                    ? copy.catalogPage.failUnreadable
                    : `${text.installFailed}${installed.detail ? ` (${installed.detail})` : ''}`
                : text.installedBody}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => void choose()} disabled={busy}>
          {busy ? <Spinner data-icon="inline-start" /> : <FileUpIcon data-icon="inline-start" />}
          {text.choose}
        </Button>
        <Button onClick={() => void install()} disabled={busy || summary?.state !== 'corvette'}>
          <HardDriveDownloadIcon data-icon="inline-start" />
          {text.install}
        </Button>
      </CardFooter>
    </Card>
  )
}
