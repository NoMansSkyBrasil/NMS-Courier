import {
  AnchorIcon,
  CoinsIcon,
  CrosshairIcon,
  GlobeIcon,
  MapPinIcon,
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
    // Sent from the application on 2026-10-08; see docs/CAPABILITY_STATUS.md.
    status: 'verified',
    scope: 'slot',
    rules: ['gameRoutines', 'backup']
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
    id: 'teleport',
    group: 'deliver',
    icon: MapPinIcon,
    kind: 'delivery',
    // Built on 2026-10-09 (bridge 1.21.0); not exercised in the running game yet.
    status: 'experimental',
    scope: 'slot',
    rules: ['gameRoutines', 'backup']
  },
  {
    id: 'planets',
    group: 'deliver',
    icon: GlobeIcon,
    kind: 'delivery',
    // Built on 2026-10-10 over a survey made offline; one system was compared with the game.
    status: 'experimental',
    scope: 'slot',
    rows: [{ row: 'total', count: 28287 }],
    rules: ['gameRoutines', 'backup']
  },
  {
    id: 'exosuit',
    group: 'deliver',
    icon: ShieldIcon,
    kind: 'delivery',
    status: 'experimental',
    scope: 'slot',
    rules: ['gameRoutines', 'backup']
  },
  {
    id: 'starships',
    sections: ['obtain', 'upgrade'],
    group: 'deliver',
    icon: RocketIcon,
    kind: 'delivery',
    status: 'experimental',
    scope: 'slot',
    rules: ['gameRoutines', 'backup']
  },
  {
    id: 'multitools',
    sections: ['obtain', 'upgrade'],
    group: 'deliver',
    icon: CrosshairIcon,
    kind: 'delivery',
    status: 'experimental',
    scope: 'slot',
    rules: ['gameRoutines', 'backup']
  },
  {
    id: 'freighters',
    sections: ['obtain', 'upgrade'],
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
