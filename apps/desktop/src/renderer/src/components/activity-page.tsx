import { useEffect, useState } from 'react'
import { HistoryIcon } from 'lucide-react'
import { Badge } from '@renderer/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@renderer/components/ui/card'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from '@renderer/components/ui/empty'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@renderer/components/ui/table'
import { featureHref, features } from '@renderer/features'
import { useLocale } from '@renderer/i18n/locale-provider'
import type { FeatureId } from '@renderer/i18n/messages'

type DeliveryResult = Awaited<ReturnType<typeof window.nms.getDeliveryActivity>>[number]

// Every delivery sent in this session of the application, newest first. The list is kept by the
// main process and is gone when the application closes.
export function ActivityPage(): React.JSX.Element {
  const { copy, locale } = useLocale()
  const [entries, setEntries] = useState<DeliveryResult[]>([])

  useEffect(() => {
    let active = true
    const refresh = (): void => {
      void window.nms.getDeliveryActivity().then((next) => active && setEntries(next))
    }
    refresh()
    const timer = window.setInterval(refresh, 5000)
    return () => {
      active = false
      window.clearInterval(timer)
    }
  }, [])

  if (entries.length === 0) {
    return (
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HistoryIcon />
            </EmptyMedia>
            <EmptyTitle>{copy.delivery.activityEmptyTitle}</EmptyTitle>
            <EmptyDescription>{copy.delivery.activityEmptyBody}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </main>
    )
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>{copy.features.activity.title}</CardTitle>
          <CardDescription>{copy.features.activity.summary}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{copy.delivery.time}</TableHead>
                <TableHead>{copy.dashboard.feature}</TableHead>
                <TableHead>{copy.delivery.result}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => {
                const feature = features.find((candidate) => candidate.id === entry.feature)
                return (
                  <TableRow key={entry.startedAt + entry.feature}>
                    <TableCell className="tabular-nums">
                      {new Date(entry.startedAt).toLocaleTimeString(locale)}
                    </TableCell>
                    <TableCell>
                      {feature ? (
                        <a
                          href={featureHref(feature.id)}
                          className="flex items-center gap-2 font-medium underline-offset-4 hover:underline"
                        >
                          <feature.icon className="size-4 text-muted-foreground" />
                          {copy.features[feature.id as FeatureId].title}
                        </a>
                      ) : (
                        entry.feature
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={entry.outcome === 'completed' ? 'secondary' : 'outline'}>
                        {copy.delivery.outcome[entry.outcome]}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  )
}
