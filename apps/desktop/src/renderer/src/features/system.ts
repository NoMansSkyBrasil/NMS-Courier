import { Gamepad2Icon, SaveIcon, SettingsIcon } from 'lucide-react'
import type { Feature } from './types'

export const systemFeatures: readonly Feature[] = [
  { id: 'bridge', group: 'system', icon: Gamepad2Icon, kind: 'tool' },
  {
    id: 'saves',
    group: 'system',
    icon: SaveIcon,
    kind: 'tool',
    rules: ['slotIdentified', 'accountShared', 'backup', 'gameRoutines']
  },
  { id: 'settings', group: 'system', icon: SettingsIcon, kind: 'tool' }
]
