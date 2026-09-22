import { useEffect, useState } from 'react'
import { CircleAlertIcon, PackagePlusIcon } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@renderer/components/ui/alert'
import { Button } from '@renderer/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@renderer/components/ui/card'
import { Input } from '@renderer/components/ui/input'
import { Label } from '@renderer/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/components/ui/select'

type Domain = 'substance' | 'product' | 'technology'
type DeliveryReadiness = Awaited<ReturnType<typeof window.nms.getDeliveryReadiness>>

const readinessMessages: Record<DeliveryReadiness['reasonCode'], string> = {
  INSTALLATION_NOT_SELECTED: 'Select a No Man’s Sky installation before delivery can be evaluated.',
  INSTALLATION_INVALID: 'The selected game installation changed or is no longer valid.',
  GAME_NOT_RUNNING:
    'Start the selected No Man’s Sky installation before delivery can be evaluated.',
  GAME_STATUS_UNAVAILABLE: 'The application could not safely confirm the selected game process.',
  RUNTIME_BUNDLE_INVALID: 'The private runtime bundle is not available.',
  ACTION_NOT_IMPLEMENTED: 'The native item-delivery action has not been verified or implemented.'
}

export function DeliveryPage(): React.JSX.Element {
  const [domain, setDomain] = useState<Domain>('substance')
  const [gameId, setGameId] = useState('FUEL1')
  const [quantity, setQuantity] = useState('500')
  const validQuantity = /^\d+$/.test(quantity) && Number(quantity) > 0
  const [installation, setInstallation] = useState<Awaited<
    ReturnType<typeof window.nms.getInstallationStatus>
  > | null>(null)
  const [gameStatus, setGameStatus] = useState<Awaited<
    ReturnType<typeof window.nms.getGameStatus>
  > | null>(null)
  const [readiness, setReadiness] = useState<DeliveryReadiness | null>(null)
  const [selectingInstallation, setSelectingInstallation] = useState(false)

  useEffect(() => {
    void window.nms
      .getInstallationStatus()
      .then((status) => {
        setInstallation(status)
        return window.nms.getGameStatus()
      })
      .then(setGameStatus)
    void window.nms.getDeliveryReadiness().then(setReadiness)
  }, [])

  const selectInstallation = async (): Promise<void> => {
    setSelectingInstallation(true)
    try {
      setInstallation(await window.nms.selectInstallation())
      setGameStatus(await window.nms.getGameStatus())
      setReadiness(await window.nms.getDeliveryReadiness())
    } finally {
      setSelectingInstallation(false)
    }
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Local item delivery</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Prepare a versioned local-player delivery intent. This form cannot submit a game mutation
          until a verified runtime capability is available.
        </p>
      </div>
      <Alert>
        <CircleAlertIcon />
        <AlertTitle>Delivery is unavailable</AlertTitle>
        <AlertDescription>
          {readiness ? readinessMessages[readiness.reasonCode] : 'Checking delivery readiness…'}
        </AlertDescription>
      </Alert>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Game installation</CardTitle>
          <CardDescription>
            {installation?.state === 'available'
              ? `${installation.displayName} is selected and fingerprinted. ${gameStatus?.state === 'running' ? 'The selected game process is running; runtime connection is still unavailable.' : 'The selected game process is not running.'}`
              : 'Choose the No Man’s Sky installation folder to verify its executable and game-data layout.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            onClick={() => void selectInstallation()}
            disabled={selectingInstallation}
          >
            {selectingInstallation ? 'Verifying installation…' : 'Select installation'}
          </Button>
          {installation?.state === 'invalid' && (
            <p className="text-sm text-destructive">
              The selected folder is not a valid No Man’s Sky installation.
            </p>
          )}
        </CardContent>
      </Card>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Delivery intent</CardTitle>
          <CardDescription>
            The protocol accepts only a local-player target at this stage. Network-player transfer
            remains a later, separately verified capability.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="delivery-domain">Item domain</Label>
            <Select value={domain} onValueChange={(value) => setDomain(value as Domain)}>
              <SelectTrigger id="delivery-domain">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="substance">Substance</SelectItem>
                <SelectItem value="product">Product</SelectItem>
                <SelectItem value="technology">Technology</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="delivery-game-id">Game ID</Label>
            <Input
              id="delivery-game-id"
              value={gameId}
              onChange={(event) => setGameId(event.target.value)}
              maxLength={128}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="delivery-quantity">Requested quantity</Label>
            <Input
              id="delivery-quantity"
              inputMode="numeric"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              aria-invalid={!validQuantity}
            />
            {!validQuantity && (
              <p className="text-sm text-destructive">Enter a positive whole number.</p>
            )}
          </div>
          <div className="flex items-end">
            <Button className="w-full" disabled aria-disabled="true">
              <PackagePlusIcon />
              Delivery unavailable
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
