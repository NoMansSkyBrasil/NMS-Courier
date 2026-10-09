import { useCallback, useEffect, useState } from 'react'
import { EyeIcon, OrbitIcon, RotateCwIcon } from 'lucide-react'
import { workshopKinds } from '../../../shared/model-workshop'
import { workshopKindOfShipClass } from '../../../shared/star-system'
import type { StarSystemReport, StarSystemShip } from '../../../shared/star-system'
import { stepsBeforeChildSeed } from '../../../shared/star-system-stream'
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
  // Where on the system's number stream its first ship is drawn; a check of the algorithm.
  const steps =
    report.state === 'read' && report.ships.length > 0
      ? stepsBeforeChildSeed(report.seed, report.ships[0].seed)
      : null
  const classLabel = (shipClass: number): string => {
    const kind = workshopKindOfShipClass[shipClass]
    if (kind) return copy.delivery.shipModel[kind as keyof typeof copy.delivery.shipModel]
    return shipClass === 0
      ? text.category.freighter
      : formatMessage(text.systemClassNumber, { number: shipClass })
  }
  // A freighter is shown with this system as its home; any other class the workshop has opens
  // as that type of starship.
  // The game's table says which scene a ship uses; the workshop type with that scene is opened.
  const viewLink = (ship: StarSystemShip): string | null => {
    if (report.state !== 'read') return null
    if (ship.scene) {
      for (const [category, kinds] of Object.entries(workshopKinds)) {
        for (const [kind, scene] of Object.entries(kinds)) {
          if (scene !== ship.scene) continue
          const home = category === 'freighter' ? `&home=${report.seed}` : ''
          return `#models?tab=view&category=${category}&kind=${kind}&seed=${ship.seed}${home}`
        }
      }
      return null
    }
    const kind = workshopKindOfShipClass[ship.shipClass]
    if (kind) return `#models?tab=view&category=starship&kind=${kind}&seed=${ship.seed}`
    return ship.shipClass === 0
      ? `#models?tab=view&category=freighter&kind=regular&seed=${ship.seed}&home=${report.seed}`
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
              <FieldDescription>
                {steps === null
                  ? text.systemStreamUnknown
                  : formatMessage(text.systemStream, { steps })}
              </FieldDescription>
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
                    const link = viewLink(ship)
                    return (
                      <TableRow key={ship.index}>
                        <TableCell>{ship.index + 1}</TableCell>
                        <TableCell>
                          {classLabel(ship.shipClass)}
                          {ship.model && (
                            <span className="text-muted-foreground ml-2 font-mono text-xs">
                              {ship.model}
                            </span>
                          )}
                        </TableCell>
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
