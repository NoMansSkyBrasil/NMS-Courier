import {
  AwardIcon,
  BlocksIcon,
  CookingPotIcon,
  CpuIcon,
  FishIcon,
  FlaskConicalIcon,
  PaletteIcon
} from 'lucide-react'
import type { Feature } from './types'

// Knowledge the character or the account gains: nothing is placed in an inventory.
export const unlockFeatures: readonly Feature[] = [
  {
    id: 'technologies',
    wired: true,
    group: 'unlock',
    icon: CpuIcon,
    kind: 'delivery',
    status: 'verified',
    scope: 'slot',
    rows: [
      { row: 'deliverable', count: 205 },
      { row: 'blockedDamaged', count: 36 },
      { row: 'blockedMaintenance', count: 91 },
      { row: 'blockedTemplates', count: 59 },
      { row: 'blockedById', count: 2 },
      { row: 'total', count: 393 }
    ],
    rules: ['gameRoutines', 'defectiveNever', 'backup']
  },
  {
    id: 'productRecipes',
    wired: true,
    group: 'unlock',
    icon: FlaskConicalIcon,
    kind: 'delivery',
    status: 'verified',
    scope: 'slot',
    rows: [
      { row: 'catalogueItems', count: 108 },
      { row: 'craftableTechnology', count: 91 },
      { row: 'repeatableNever', count: 18 }
    ],
    rules: ['gameRoutines', 'repeatableNever', 'backup']
  },
  {
    id: 'buildParts',
    wired: true,
    group: 'unlock',
    icon: BlocksIcon,
    kind: 'delivery',
    status: 'verified',
    scope: 'slot',
    rows: [
      { row: 'buildParts', count: 1067 },
      { row: 'researchTree', count: 106 }
    ],
    rules: ['gameRoutines', 'backup']
  },
  {
    id: 'refinerRecipes',
    wired: true,
    group: 'unlock',
    icon: CookingPotIcon,
    kind: 'delivery',
    status: 'verified',
    scope: 'slot',
    rows: [
      { row: 'deliverable', count: 1684 },
      { row: 'total', count: 1684 }
    ],
    rules: ['gameRoutines', 'backup']
  },
  {
    id: 'customisation',
    wired: true,
    group: 'unlock',
    icon: PaletteIcon,
    kind: 'delivery',
    status: 'verified',
    scope: 'both',
    rows: [{ row: 'deliverable', count: 263 }],
    rules: ['gameRoutines', 'accountShared', 'backup']
  },
  {
    id: 'titles',
    wired: true,
    group: 'unlock',
    icon: AwardIcon,
    kind: 'delivery',
    status: 'verified',
    scope: 'account',
    rows: [
      { row: 'deliverable', count: 346 },
      { row: 'total', count: 346 }
    ],
    rules: ['gameRoutines', 'accountShared', 'backup']
  },
  {
    id: 'fishing',
    wired: true,
    group: 'unlock',
    icon: FishIcon,
    kind: 'delivery',
    status: 'verified',
    scope: 'slot',
    rows: [
      { row: 'deliverable', count: 220 },
      { row: 'missionBound', count: 6 },
      { row: 'total', count: 226 }
    ],
    rules: ['gameRoutines', 'backup']
  }
]
