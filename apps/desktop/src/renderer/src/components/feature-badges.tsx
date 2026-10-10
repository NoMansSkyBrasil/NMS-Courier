import {
  CircleCheckIcon,
  CircleDashedIcon,
  FlaskConicalIcon,
  SaveIcon,
  UserIcon
} from 'lucide-react'
import { Badge } from '@renderer/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@renderer/components/ui/tooltip'
import { useLocale } from '@renderer/i18n/locale'
import type { ScopeId, StatusId } from '@renderer/i18n/messages'
import { tones } from '@renderer/features/tones'

// Green once seen working in the game, amber while it is still being tried.
const statusTones = { verified: tones.good, experimental: tones.caution, planned: '' } as const
const statusIcons = {
  verified: CircleCheckIcon,
  experimental: FlaskConicalIcon,
  planned: CircleDashedIcon
} as const

// How far an area has been proven. The icon carries the meaning as well as the label.
export function StatusBadge({ status }: { status: StatusId }): React.JSX.Element {
  const { copy } = useLocale()
  const Icon = statusIcons[status]

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Badge
            variant={status === 'planned' ? 'outline' : 'secondary'}
            className={statusTones[status]}
          />
        }
      >
        <Icon data-icon="inline-start" />
        {copy.status[status]}
      </TooltipTrigger>
      <TooltipContent>{copy.statusHint[status]}</TooltipContent>
    </Tooltip>
  )
}

// What a delivery changes: the loaded save slot, the account shared by every slot, or both.
export function ScopeBadge({ scope }: { scope: ScopeId }): React.JSX.Element {
  const { copy } = useLocale()
  const Icon = scope === 'account' ? UserIcon : SaveIcon

  return (
    <Tooltip>
      <TooltipTrigger render={<Badge variant="outline" />}>
        {scope !== 'none' && <Icon data-icon="inline-start" />}
        {copy.scope[scope]}
      </TooltipTrigger>
      <TooltipContent>{copy.scopeHint[scope]}</TooltipContent>
    </Tooltip>
  )
}
