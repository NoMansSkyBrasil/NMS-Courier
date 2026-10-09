import { useCallback, useEffect, useState } from 'react'
import { EyeIcon, OrbitIcon, RotateCwIcon } from 'lucide-react'
import { workshopKindOfShipClass } from '../../../shared/star-system'
import type { StarSystemReport } from '../../../shared/star-system'
import { glyphsFromSystemSeed } from '../../../shared/system-address'
import { Button } from '@renderer/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@renderer/components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia } from '@renderer/components/ui/empty'
import { Field, FieldDescription, FieldLabel } from '@renderer/components/ui/field'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@renderer/components/ui/table'
import { formatMessage, useLocale } from '@renderer/i18n/locale'

// The star system the player is in, read from the running game by the bridge: its seed and the
// ships the game generated for it, each with a link that shows it in the workshop.

const refreshMilliseconds = 5000

export function StarSystemCard(): React.JSX.Element {
  const { copy } = useLocale()
  const text = copy.workshop
  const [report, setReport] = useState<StarSystemReport>({ state: 'unavailable' })

  const refresh = useCallback(() => {
    void window.nms
      .getStarSystem()
      .then(setReport)
      .catch(() => setReport({ state: 'unavailable' }))
  }, [])
  useEffect(() => {
    // Started from a callback: the effect itself changes no state.
    const first = window.setTimeout(refresh, 0)
    const timer = window.setInterval(refresh, refreshMilliseconds)
    return () => {
      window.clearTimeout(first)
      window.clearInterval(timer)
    }
  }, [refresh])

  const address = report.state === 'read' ? glyphsFromSystemSeed(report.seed) : null
  const classLabel = (shipClass: number): string => {
    const kind = workshopKindOfShipClass[shipClass]
    if (kind) return copy.delivery.shipModel[kind as keyof typeof copy.delivery.shipModel]
    return shipClass === 0
      ? text.category.freighter
      : formatMessage(text.systemClassNumber, { number: shipClass })
  }
  // A freighter is shown with this system as its home; any other class the workshop has opens
  // as that type of starship.
  const viewLink = (shipClass: number, seed: string): string | null => {
    if (report.state !== 'read') return null
    const kind = workshopKindOfShipClass[shipClass]
    if (kind) return `#models?tab=view&category=starship&kind=${kind}&seed=${seed}`
    return shipClass === 0
      ? `#models?tab=view&category=freighter&kind=regular&seed=${seed}&home=${report.seed}`
      : null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{text.tabSystem}</CardTitle>
        <CardDescription>{text.systemDescription}</CardDescription>
        <CardAction>
          <Button variant="outline" size="sm" onClick={refresh}>
            <RotateCwIcon data-icon="inline-start" />
            {text.systemRefresh}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {report.state !== 'read' ? (
          <Empty className="min-h-48 border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <OrbitIcon />
              </EmptyMedia>
              <EmptyDescription>{text.systemNone}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            <Field>
              <FieldLabel>{text.systemSeed}</FieldLabel>
              <p className="font-mono text-sm">{report.seed}</p>
              {address && (
                <FieldDescription>
                  {formatMessage(text.homeAddress, {
                    glyphs: address.glyphs,
                    galaxy: address.galaxyNumber
                  })}
                </FieldDescription>
              )}
            </Field>
            <Field>
              <FieldLabel>
                {text.systemShips} ({report.ships.length})
              </FieldLabel>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>{text.systemClass}</TableHead>
                    <TableHead>{text.systemRole}</TableHead>
                    <TableHead>{text.systemShipSeed}</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.ships.map((ship) => {
                    const link = viewLink(ship.shipClass, ship.seed)
                    return (
                      <TableRow key={ship.index}>
                        <TableCell>{ship.index + 1}</TableCell>
                        <TableCell>{classLabel(ship.shipClass)}</TableCell>
                        <TableCell>{ship.shipRole}</TableCell>
                        <TableCell className="font-mono">{ship.seed}</TableCell>
                        <TableCell>
                          {link && (
                            <Button variant="outline" size="sm" render={<a href={link} />}>
                              <EyeIcon data-icon="inline-start" />
                              {text.systemView}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </Field>
          </>
        )}
      </CardContent>
    </Card>
  )
}
