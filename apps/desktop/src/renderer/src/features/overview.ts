import { HistoryIcon, LayoutDashboardIcon } from 'lucide-react'
import type { Feature } from './types'

export const overviewFeatures: readonly Feature[] = [
  { id: 'dashboard', group: 'overview', icon: LayoutDashboardIcon, kind: 'tool' },
  { id: 'activity', group: 'overview', icon: HistoryIcon, kind: 'tool' }
]
