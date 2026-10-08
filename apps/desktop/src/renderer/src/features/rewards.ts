import { FlagIcon, GemIcon, GiftIcon, TvIcon } from 'lucide-react'
import type { Feature } from './types'

// Rewards the game normally grants from outside the save: events, campaigns, platforms, the shop.
export const rewardFeatures: readonly Feature[] = [
  {
    id: 'expeditions',
    group: 'rewards',
    icon: FlagIcon,
    kind: 'delivery',
    status: 'verified',
    scope: 'both',
    rows: [
      { row: 'deliverable', count: 293 },
      { row: 'redeemedInSave', count: 112 }
    ],
    rules: ['gameRoutines', 'claimItems', 'accountShared', 'backup']
  },
  {
    id: 'twitch',
    group: 'rewards',
    icon: TvIcon,
    kind: 'delivery',
    status: 'verified',
    scope: 'both',
    rows: [
      { row: 'deliverable', count: 435 },
      { row: 'redeemedInSave', count: 234 },
      { row: 'itemRewards', count: 201 }
    ],
    rules: ['keepList', 'claimItems', 'accountShared', 'backup']
  },
  {
    id: 'platform',
    group: 'rewards',
    icon: GiftIcon,
    kind: 'delivery',
    status: 'verified',
    scope: 'account',
    rows: [{ row: 'deliverable', count: 3 }],
    rules: ['claimItems', 'accountShared', 'backup']
  },
  {
    id: 'quicksilver',
    group: 'rewards',
    icon: GemIcon,
    kind: 'delivery',
    status: 'verified',
    scope: 'account',
    rows: [
      { row: 'deliverable', count: 322 },
      { row: 'repeatableNever', count: 14 },
      { row: 'total', count: 336 }
    ],
    rules: ['gameRoutines', 'repeatableNever', 'accountShared', 'backup']
  }
]
