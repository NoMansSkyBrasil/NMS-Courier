import { useState } from 'react'
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

export function DeliveryPage(): React.JSX.Element {
  const [domain, setDomain] = useState<Domain>('substance')
  const [gameId, setGameId] = useState('FUEL1')
  const [quantity, setQuantity] = useState('500')
  const validQuantity = /^\d+$/.test(quantity) && Number(quantity) > 0

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
        <AlertTitle>Delivery runtime is unavailable</AlertTitle>
        <AlertDescription>
          The runtime bridge, supported build gate, player readiness check, and native delivery
          function have not been verified. No request can be queued from this screen.
        </AlertDescription>
      </Alert>
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
