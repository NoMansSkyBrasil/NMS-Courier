import {
  AnchorIcon,
  CoinsIcon,
  CrosshairIcon,
  OrbitIcon,
  PackageIcon,
  PawPrintIcon,
  RocketIcon,
  ShieldIcon,
  ShipIcon
} from 'lucide-react'
import type { Feature } from './types'

// Things handed to the player or changed on something the player owns.
export const deliverFeatures: readonly Feature[] = [
  {
    id: 'items',
    group: 'deliver',
    icon: PackageIcon,
    kind: 'delivery',
    status: 'experimental',
    scope: 'slot',
    rules: ['gameRoutines', 'slotIdentified', 'backup']
  },
  {
    id: 'currencies',
    group: 'deliver',
    icon: CoinsIcon,
    kind: 'delivery',
    status: 'experimental',
    scope: 'slot',
    rules: ['gameRoutines', 'backup']
  },
  {
    id: 'exosuit',
    group: 'deliver',
    icon: ShieldIcon,
    kind: 'delivery',
    status: 'experimental',
    scope: 'slot',
    rules: ['gameRoutines', 'slotIdentified', 'backup']
  },
  {
    id: 'starships',
    group: 'deliver',
    icon: RocketIcon,
    kind: 'delivery',
    status: 'experimental',
    scope: 'slot',
    rules: ['gameRoutines', 'slotIdentified', 'backup']
  },
  {
    id: 'multitools',
    group: 'deliver',
    icon: CrosshairIcon,
    kind: 'delivery',
    status: 'experimental',
    scope: 'slot',
    rules: ['gameRoutines', 'slotIdentified', 'backup']
  },
  {
    id: 'freighters',
    group: 'deliver',
    icon: ShipIcon,
    kind: 'delivery',
    status: 'experimental',
    scope: 'slot',
    rules: ['gameRoutines', 'backup']
  },
  {
    id: 'corvettes',
    group: 'deliver',
    icon: OrbitIcon,
    kind: 'delivery',
    status: 'experimental',
    scope: 'slot',
    rules: ['gameRoutines', 'backup']
  },
  {
    id: 'frigates',
    group: 'deliver',
    icon: AnchorIcon,
    kind: 'delivery',
    status: 'planned',
    scope: 'slot'
  },
  {
    id: 'companions',
    group: 'deliver',
    icon: PawPrintIcon,
    kind: 'delivery',
    status: 'planned',
    scope: 'slot'
  }
]
