import { BookOpenIcon, BoxIcon } from 'lucide-react'
import type { Feature } from './types'

export const libraryFeatures: readonly Feature[] = [
  { id: 'catalog', group: 'library', icon: BookOpenIcon, kind: 'tool' },
  { id: 'models', group: 'library', icon: BoxIcon, kind: 'tool' }
]
