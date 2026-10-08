import type { LucideIcon } from 'lucide-react'
import type { FeatureId, GroupId, RowId, RuleId, ScopeId, StatusId } from '@renderer/i18n/messages'

// The game build the figures and statuses of the registry were established on.
export const researchBuild = '180836'

export type FeatureRow = { row: RowId; count: number }

export type Feature = {
  id: FeatureId
  group: GroupId
  icon: LucideIcon
  // A tool page reads or configures; a delivery page describes something sent to the game.
  kind: 'tool' | 'delivery'
  status?: StatusId
  scope?: ScopeId
  rows?: readonly FeatureRow[]
  rules?: readonly RuleId[]
  // The application can send this area to the game through the research bridge.
  wired?: boolean
}
