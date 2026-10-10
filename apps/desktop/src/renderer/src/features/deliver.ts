import {
  AnchorIcon,
  BatteryChargingIcon,
  CoinsIcon,
  CrosshairIcon,
  GlobeIcon,
  MapPinIcon,
  OrbitIcon,
  PackageIcon,
  PawPrintIcon,
  RocketIcon,
  ShieldIcon,
  ShipIcon,
  WrenchIcon
} from 'lucide-react'
import type { Feature } from './types'

// Things handed to the player or changed on something the player owns.
export const deliverFeatures: readonly Feature[] = [
  {
    id: 'items',
    group: 'inventory',
    icon: PackageIcon,
    kind: 'delivery',
    // Sent from the application on 2026-10-08; see docs/CAPABILITY_STATUS.md.
    status: 'verified',
    scope: 'slot',
    rules: ['gameRoutines', 'backup']
  },
  {
    id: 'currencies',
    group: 'inventory',
    icon: CoinsIcon,
    kind: 'delivery',
    status: 'experimental',
    scope: 'slot',
    rules: ['gameRoutines', 'backup']
  },
  {
    id: 'teleport',
    group: 'travel',
    icon: MapPinIcon,
    kind: 'delivery',
    // Built on 2026-10-09 (bridge 1.21.0); not exercised in the running game yet.
    status: 'experimental',
    scope: 'slot',
    rules: ['gameRoutines', 'backup']
  },
  {
    id: 'planets',
    group: 'travel',
    icon: GlobeIcon,
    kind: 'delivery',
    // Built on 2026-10-10 over a survey made offline; one system was compared with the game.
    status: 'experimental',
    scope: 'slot',
    rules: ['gameRoutines', 'backup']
  },
  {
    id: 'exosuit',
    group: 'equipment',
    icon: ShieldIcon,
    kind: 'delivery',
    status: 'experimental',
    scope: 'slot',
    rules: ['gameRoutines', 'backup']
  },
  {
    id: 'starships',
    sections: ['obtain', 'upgrade'],
    group: 'equipment',
    icon: RocketIcon,
    kind: 'delivery',
    status: 'experimental',
    scope: 'slot',
    rules: ['gameRoutines', 'backup']
  },
  {
    id: 'multitools',
    sections: ['obtain', 'upgrade'],
    group: 'equipment',
    icon: CrosshairIcon,
    kind: 'delivery',
    status: 'experimental',
    scope: 'slot',
    rules: ['gameRoutines', 'backup']
  },
  {
    id: 'freighters',
    sections: ['obtain', 'upgrade'],
    group: 'equipment',
    icon: ShipIcon,
    kind: 'delivery',
    status: 'experimental',
    scope: 'slot',
    rules: ['gameRoutines', 'backup']
  },
  {
    id: 'pendingTech',
    group: 'equipment',
    icon: WrenchIcon,
    kind: 'delivery',
    // Built on 2026-10-10 from an offline reading of the game's install routine; not tried in the game.
    status: 'experimental',
    scope: 'slot',
    rules: ['gameRoutines', 'backup']
  },
  {
    id: 'upkeep',
    group: 'equipment',
    icon: BatteryChargingIcon,
    kind: 'delivery',
    // Built on 2026-10-10 from the game's own reward classes; not tried in the game.
    status: 'experimental',
    scope: 'slot',
    rules: ['gameRoutines', 'backup']
  },
  {
    id: 'corvettes',
    group: 'equipment',
    icon: OrbitIcon,
    kind: 'delivery',
    status: 'experimental',
    scope: 'slot',
    rules: ['gameRoutines', 'backup']
  },
  {
    id: 'frigates',
    group: 'equipment',
    icon: AnchorIcon,
    kind: 'delivery',
    status: 'planned',
    scope: 'slot'
  },
  {
    id: 'companions',
    group: 'equipment',
    icon: PawPrintIcon,
    kind: 'delivery',
    status: 'planned',
    scope: 'slot'
  }
]
