import { Badge } from "@renderer/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@renderer/components/ui/card"
import { TrendingUpIcon, TrendingDownIcon } from "lucide-react"
import { useEffect, useState } from 'react'
import { useLocale } from '@renderer/i18n/locale-provider'

export function SectionCards() {
  const { copy } = useLocale()
  const [runtimeStatus, setRuntimeStatus] = useState<{ runtime: 'bundled' | 'unavailable'; runtimeVersion: string | null } | null>(null)
  const [runtime, protocol, localService, saveEditor] = copy.cards

  useEffect(() => {
    void window.nms.getFoundationStatus().then(setRuntimeStatus).catch(() => setRuntimeStatus({ runtime: 'unavailable', runtimeVersion: null }))
  }, [])

  const isBundled = runtimeStatus?.runtime === 'bundled'
  const runtimeTitle = isBundled ? copy.runtimeStatus.bundled : runtimeStatus?.runtime === 'unavailable' ? copy.runtimeStatus.unavailable : runtime[1]
  const runtimeDetail = isBundled && runtimeStatus.runtimeVersion
    ? copy.runtimeStatus.version.replace('{version}', runtimeStatus.runtimeVersion)
    : runtime[4]
  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>{runtime[0]}</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {runtimeTitle}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUpIcon
              />
              {runtime[2]}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {runtime[3]}{" "}
            <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {runtimeDetail}
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>{protocol[0]}</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {protocol[1]}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingDownIcon
              />
              {protocol[2]}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {protocol[3]}{" "}
            <TrendingDownIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {protocol[4]}
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>{localService[0]}</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {localService[1]}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUpIcon
              />
              {localService[2]}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {localService[3]}{" "}
            <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">{localService[4]}</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>{saveEditor[0]}</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {saveEditor[1]}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUpIcon
              />
              {saveEditor[2]}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {saveEditor[3]}{" "}
            <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">{saveEditor[4]}</div>
        </CardFooter>
      </Card>
    </div>
  )
}
