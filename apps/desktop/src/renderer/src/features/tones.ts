import type { GroupId } from '@renderer/i18n/messages'

// Colours of the interface beyond the theme's own tokens. Each is always shown together with a
// word or an icon, never alone.

// How safe or how far along something is.
export const tones = {
  good: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  caution: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  danger: 'bg-red-500/15 text-red-700 dark:text-red-400',
  info: 'bg-sky-500/15 text-sky-700 dark:text-sky-400',
  neutral: 'bg-muted text-muted-foreground'
} as const
export type Tone = keyof typeof tones

// The same tones for a small dot.
export const toneDots: Record<Tone, string> = {
  good: 'bg-emerald-500',
  caution: 'bg-amber-500',
  danger: 'bg-red-500',
  info: 'bg-sky-500',
  neutral: 'bg-muted-foreground'
}

// One colour a group of the sidebar, for the icons of its areas.
export const groupIconTones: Record<GroupId, string> = {
  overview: 'text-sky-600 dark:text-sky-400',
  inventory: 'text-emerald-600 dark:text-emerald-400',
  travel: 'text-blue-600 dark:text-blue-400',
  equipment: 'text-orange-600 dark:text-orange-400',
  knowledge: 'text-violet-600 dark:text-violet-400',
  progress: 'text-teal-600 dark:text-teal-400',
  style: 'text-pink-600 dark:text-pink-400',
  rewards: 'text-amber-600 dark:text-amber-400',
  library: 'text-cyan-600 dark:text-cyan-400',
  system: 'text-zinc-600 dark:text-zinc-400'
}

// The same colours as the soft square behind an icon.
export const groupTileTones: Record<GroupId, string> = {
  overview: 'bg-sky-500/15 text-sky-700 dark:text-sky-400',
  inventory: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  travel: 'bg-blue-500/15 text-blue-700 dark:text-blue-400',
  equipment: 'bg-orange-500/15 text-orange-700 dark:text-orange-400',
  knowledge: 'bg-violet-500/15 text-violet-700 dark:text-violet-400',
  progress: 'bg-teal-500/15 text-teal-700 dark:text-teal-400',
  style: 'bg-pink-500/15 text-pink-700 dark:text-pink-400',
  rewards: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  library: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-400',
  system: 'bg-zinc-500/15 text-zinc-700 dark:text-zinc-400'
}
