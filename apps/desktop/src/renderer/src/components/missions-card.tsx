import { Fragment, useEffect, useMemo, useState } from 'react'
import {
  CircleAlertIcon,
  CircleCheckIcon,
  CircleHelpIcon,
  ListChecksIcon,
  SendIcon
} from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@renderer/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@renderer/components/ui/alert-dialog'
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
import { Checkbox } from '@renderer/components/ui/checkbox'
import { Field, FieldContent, FieldDescription, FieldLabel } from '@renderer/components/ui/field'
import { Input } from '@renderer/components/ui/input'
import { Spinner } from '@renderer/components/ui/spinner'
import { Switch } from '@renderer/components/ui/switch'
import { formatMessage, useLocale } from '@renderer/i18n/locale'
import type { DeliveryStateId } from '@renderer/i18n/messages'
import { readNotifyPreference } from '@renderer/hooks/use-notify-preference'

type BridgeStatus = Awaited<ReturnType<typeof window.nms.getResearchBridgeStatus>>
type DeliveryResult = Awaited<ReturnType<typeof window.nms.deliver>>
type Mission = Awaited<ReturnType<typeof window.nms.getMissions>>[number]
// A title of the game's log with the missions that carry it.
// `part` is the mission's place in its quest, counted over all of the quest's missions.
type Quest = {
  key: string
  title: string
  subtitle: string
  section: Section
  // Place of the quest's first mission in the game's tables, which follow the story.
  place: number
  // `needs` names the quest that must be finished before this part starts, when it is another one.
  missions: Array<Mission & { part: number; needs: string }>
}

// The page's sections, in the order they are shown, and the game's mission classes of each.
const sections = ['story', 'atlas', 'secondary', 'guide', 'seasonal'] as const
type Section = (typeof sections)[number]
const sectionOfClass: Record<string, Section> = {
  Primary: 'story',
  Atlas: 'atlas',
  BlackHole: 'atlas',
  Milestone: 'guide',
  Guide: 'guide',
  Wiki: 'guide',
  Seasonal: 'seasonal'
}

const tableRank: Record<string, number> = { coremissiontable: 0, missiontable: 1 }

// Quests drawn at first and added each time the list is scrolled near its end.
const pageSize = 40
const outcomeIcons = {
  completed: CircleCheckIcon,
  unknown: CircleHelpIcon,
  failed: CircleAlertIcon,
  refused: CircleAlertIcon
} as const

// Asks the game to complete missions through its own reward. The missions are shown as the game's
// log files them: one block a quest, its missions inside, each with a box. Experimental.
export function MissionsCard(): React.JSX.Element {
  const { copy, locale } = useLocale()
  const text = copy.missions
  const delivery = copy.delivery
  const [status, setStatus] = useState<BridgeStatus | null>(null)
  const [missions, setMissions] = useState<Mission[]>([])
  const [chosen, setChosen] = useState<ReadonlySet<string>>(new Set())
  const [query, setQuery] = useState('')
  const [untitled, setUntitled] = useState(false)
  const [drawn, setDrawn] = useState(pageSize)
  // What the open confirmation would send: every mission or the marked ones.
  const [confirming, setConfirming] = useState<'all' | 'chosen' | null>(null)
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<DeliveryResult | null>(null)

  useEffect(() => {
    let active = true
    void window.nms
      .getMissions(locale)
      .then((rows) => active && setMissions(rows))
      .catch(() => active && setMissions([]))
    return () => {
      active = false
    }
  }, [locale])

  useEffect(() => {
    let active = true
    const refresh = (): void => {
      void window.nms
        .getResearchBridgeStatus()
        .then((next) => active && setStatus(next))
        .catch(() => active && setStatus(null))
    }
    refresh()
    const timer = window.setInterval(refresh, 5000)
    return () => {
      active = false
      window.clearInterval(timer)
    }
  }, [])

  // Missions that share a quest's title are one quest; a mission without any title of its own or of
  // a quest belongs to the block of untitled ones.
  const quests = useMemo(() => {
    const byKey = new Map<string, Quest>()
    for (const [place, mission] of missions.entries()) {
      const title = mission.title || mission.questTitle
      const key = title ? `t:${title}` : 'untitled'
      const quest = byKey.get(key) ?? {
        key,
        title,
        subtitle: title ? mission.subtitle : '',
        section: sectionOfClass[mission.kind] ?? 'secondary',
        // The table of the main story comes first, then the general mission table, then the rest.
        place: place + (tableRank[mission.table] ?? 2) * missions.length,
        missions: []
      }
      quest.missions.push({ ...mission, part: 0, needs: '' })
      byKey.set(key, quest)
    }
    const titleOf = new Map(
      missions.map((mission) => [mission.id, mission.title || mission.questTitle])
    )
    for (const quest of byKey.values()) {
      // The game starts a mission when the ones it requires are complete: parts are put in that
      // order, and keep the table's order where the game states none between them.
      const inside = new Set(quest.missions.map((mission) => mission.id))
      const placed: Quest['missions'] = []
      const waiting = [...quest.missions]
      while (waiting.length > 0) {
        const at = waiting.findIndex((mission) =>
          mission.after.every(
            (id) => !inside.has(id) || placed.some((other) => other.id === id) || id === mission.id
          )
        )
        placed.push(...waiting.splice(at < 0 ? 0 : at, 1))
      }
      // The log's second line names the quest when every part carries the same one; where the parts
      // differ, each line is the name of its part.
      const lines = new Set(placed.map((mission) => mission.subtitle))
      if (lines.size > 1) quest.subtitle = ''
      quest.missions = placed.map((mission, index) => ({
        ...mission,
        part: index + 1,
        needs:
          mission.after
            .filter((id) => !inside.has(id))
            .map((id) => titleOf.get(id) ?? '')
            .find((title) => title && title !== quest.title) ?? ''
      }))
    }
    // Main story first, then the Atlas, the secondary missions, the guide and the expeditions; inside
    // a section the order of the game's tables, which is the order of the story.
    return [...byKey.values()].sort(
      (a, b) =>
        Number(!a.title) - Number(!b.title) ||
        sections.indexOf(a.section) - sections.indexOf(b.section) ||
        a.place - b.place
    )
  }, [missions])

  const matching = useMemo(() => {
    const wanted = query.trim().toLocaleLowerCase()
    return quests
      .filter((quest) => untitled || quest.title)
      .map((quest) =>
        !wanted || `${quest.title} ${quest.subtitle}`.toLocaleLowerCase().includes(wanted)
          ? quest
          : {
              ...quest,
              missions: quest.missions.filter((mission) =>
                `${mission.id} ${mission.title} ${mission.subtitle}`
                  .toLocaleLowerCase()
                  .includes(wanted)
              )
            }
      )
      .filter((quest) => quest.missions.length > 0)
  }, [quests, query, untitled])
  const shown = matching.slice(0, drawn)
  const total = quests.filter((quest) => untitled || quest.title).length

  const setMany = (ids: readonly string[], checked: boolean): void => {
    const next = new Set(chosen)
    for (const id of ids) {
      if (checked) next.add(id)
      else next.delete(id)
    }
    setChosen(next)
  }

  const send = async (): Promise<void> => {
    const what = confirming
    setConfirming(null)
    setSending(true)
    try {
      setResult(
        await window.nms.deliver(
          'missions',
          what === 'chosen' ? [...chosen] : undefined,
          readNotifyPreference()
        )
      )
    } finally {
      setSending(false)
    }
  }

  const ready = status?.state === 'ready' && missions.length > 0
  const stateText = status
    ? formatMessage(delivery.state[status.state], { id: status.processId ?? '' })
    : delivery.state.unavailable
  const reason = result?.reason as DeliveryStateId | null | undefined
  const OutcomeIcon = result ? outcomeIcons[result.outcome] : null
  const number = (value: number): string => value.toLocaleString(locale)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{delivery.title}</CardTitle>
        <CardDescription>{delivery.hint}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">{stateText}</p>
        <Alert>
          <CircleAlertIcon />
          <AlertTitle>{text.warningTitle}</AlertTitle>
          <AlertDescription>{text.warning}</AlertDescription>
        </Alert>
        <Input
          aria-label={text.search}
          placeholder={text.search}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setDrawn(pageSize)
          }}
        />
        <Field orientation="horizontal">
          <FieldContent>
            <FieldLabel htmlFor="missions-untitled">{text.untitled}</FieldLabel>
            <FieldDescription>{text.untitledHint}</FieldDescription>
          </FieldContent>
          <Switch id="missions-untitled" checked={untitled} onCheckedChange={setUntitled} />
        </Field>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setMany(
                matching.flatMap((quest) => quest.missions.map((mission) => mission.id)),
                true
              )
            }
          >
            {delivery.selectAllShown}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={chosen.size === 0}
            onClick={() => setChosen(new Set())}
          >
            {delivery.selectClear}
          </Button>
          <Badge variant="secondary">
            {formatMessage(text.chosen, { count: number(chosen.size) })}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {formatMessage(text.quests, { shown: number(matching.length), total: number(total) })}
          </span>
        </div>
        <div
          className="flex h-[36rem] flex-col gap-3 overflow-y-auto pr-1"
          onScroll={(event) => {
            const list = event.currentTarget
            if (
              drawn < matching.length &&
              list.scrollTop + list.clientHeight > list.scrollHeight - 600
            ) {
              setDrawn(drawn + pageSize)
            }
          }}
        >
          {shown.map((quest, index) => {
            const ids = quest.missions.map((mission) => mission.id)
            const marked = ids.filter((id) => chosen.has(id)).length
            const title = quest.title || text.untitledGroup
            // A quest of one mission is a single line: its box is the mission's.
            const single = quest.title && quest.missions.length === 1 ? quest.missions[0] : null
            // Shown on hover: the mission's identifier and whether the game announces its completion.
            const tip = (mission: Mission): string =>
              mission.announced ? mission.id : `${mission.id} · ${text.silent}`
            const details = (mission: Quest['missions'][number]): React.JSX.Element => (
              <>
                {mission.needs && (
                  <span className="truncate text-xs text-muted-foreground">
                    {formatMessage(text.after, { quest: mission.needs })}
                  </span>
                )}
                {mission.rewards.length > 0 && (
                  <Badge variant="outline" title={mission.rewards.join(', ')}>
                    {formatMessage(text.rewards, { count: number(mission.rewards.length) })}
                  </Badge>
                )}
              </>
            )
            const heading =
              quest.title && shown[index - 1]?.section !== quest.section
                ? text.section[quest.section]
                : null
            return (
              <Fragment key={quest.key}>
                {heading && (
                  <h3 className="pt-2 text-sm font-medium text-muted-foreground">{heading}</h3>
                )}
                <section className="rounded-lg border">
                  <header
                    className={`flex items-center gap-3 px-4 py-3 ${single ? '' : 'border-b'}`}
                    title={single ? tip(single) : undefined}
                  >
                    <Checkbox
                      aria-label={title}
                      checked={marked === ids.length}
                      onCheckedChange={(checked) => setMany(ids, checked === true)}
                    />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate font-medium">{title}</span>
                      {quest.subtitle && (
                        <span className="truncate text-xs text-muted-foreground">
                          {quest.subtitle}
                        </span>
                      )}
                    </div>
                    {single ? (
                      details(single)
                    ) : (
                      <Badge variant="outline">
                        {formatMessage(text.count, { count: number(ids.length) })}
                      </Badge>
                    )}
                    {!single && marked > 0 && marked < ids.length && (
                      <Badge variant="secondary">
                        {formatMessage(text.chosen, { count: number(marked) })}
                      </Badge>
                    )}
                  </header>
                  {!single && (
                    <ul className="flex flex-col divide-y">
                      {quest.missions.map((mission) => (
                        <li
                          key={mission.id}
                          className="flex items-center gap-3 px-4 py-2 text-sm"
                          title={tip(mission)}
                        >
                          <Checkbox
                            aria-label={mission.id}
                            checked={chosen.has(mission.id)}
                            onCheckedChange={(checked) => setMany([mission.id], checked === true)}
                          />
                          {quest.title ? (
                            <span className="flex flex-1 items-baseline gap-2 truncate">
                              {!quest.subtitle && mission.subtitle ? (
                                <>
                                  <span className="truncate">{mission.subtitle}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {formatMessage(text.part, { number: number(mission.part) })}
                                  </span>
                                </>
                              ) : (
                                formatMessage(text.part, { number: number(mission.part) })
                              )}
                            </span>
                          ) : (
                            // The game gives these no name at all; the identifier is all there is.
                            <span className="flex-1 truncate font-mono text-xs text-muted-foreground">
                              {mission.id}
                            </span>
                          )}
                          {details(mission)}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </Fragment>
            )
          })}
          {matching.length === 0 && (
            <p className="text-sm text-muted-foreground">{delivery.selectNone}</p>
          )}
        </div>
        {result && OutcomeIcon && (
          <Alert variant={result.outcome === 'failed' ? 'destructive' : 'default'}>
            <OutcomeIcon />
            <AlertTitle>{delivery.outcome[result.outcome]}</AlertTitle>
            <AlertDescription>
              {reason && reason in delivery.state
                ? formatMessage(delivery.state[reason], { id: '' })
                : delivery.outcomeHint[result.outcome]}
            </AlertDescription>
          </Alert>
        )}
        {result && result.steps.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">{delivery.result}</span>
            <pre className="max-h-64 overflow-auto rounded-lg bg-muted p-3 text-xs">
              {result.steps.map((step) => step.lines.join('\n')).join('\n\n')}
            </pre>
          </div>
        )}
        {result?.backupPath && (
          <p className="text-xs break-all text-muted-foreground">
            {formatMessage(delivery.backup, { path: result.backupPath })}
          </p>
        )}
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        <AlertDialog
          open={confirming !== null}
          onOpenChange={(open) => setConfirming(open ? 'all' : null)}
        >
          <AlertDialogTrigger render={<Button disabled={!ready || sending} />}>
            {sending ? <Spinner data-icon="inline-start" /> : <SendIcon data-icon="inline-start" />}
            {sending ? delivery.sending : text.action}
          </AlertDialogTrigger>
          <Button
            variant="outline"
            disabled={!ready || sending || chosen.size === 0}
            onClick={() => setConfirming('chosen')}
          >
            <ListChecksIcon data-icon="inline-start" />
            {formatMessage(text.actionChosen, { count: number(chosen.size) })}
          </Button>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{delivery.confirmTitle}</AlertDialogTitle>
              <AlertDialogDescription>{delivery.confirmSlot}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{delivery.cancel}</AlertDialogCancel>
              <AlertDialogAction onClick={() => void send()}>{delivery.confirm}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  )
}
