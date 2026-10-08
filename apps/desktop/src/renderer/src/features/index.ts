import {
  groupIds,
  sectionIds,
  type FeatureId,
  type GroupId,
  type SectionId
} from '@renderer/i18n/messages'
import { deliverFeatures } from './deliver'
import { libraryFeatures } from './library'
import { overviewFeatures } from './overview'
import { rewardFeatures } from './rewards'
import { systemFeatures } from './system'
import type { Feature } from './types'
import { unlockFeatures } from './unlock'

export { researchBuild } from './types'
export type { Feature } from './types'

export const features: readonly Feature[] = [
  ...overviewFeatures,
  ...deliverFeatures,
  ...unlockFeatures,
  ...rewardFeatures,
  ...libraryFeatures,
  ...systemFeatures
]

export const featureGroups: readonly { id: GroupId; features: readonly Feature[] }[] = groupIds.map(
  (id) => ({ id, features: features.filter((feature) => feature.group === id) })
)

// The dashboard is the empty hash; every other page is "#<feature id>" or, for an area with
// sections, "#<feature id>/<section>".
export function featureHref(id: FeatureId, section?: SectionId): string {
  if (id === 'dashboard') return '#'
  return section ? `#${id}/${section}` : `#${id}`
}

export function featureFromHash(hash: string): Feature {
  const id = hash.replace(/^#/, '').split('?')[0].split('/')[0]
  return features.find((feature) => feature.id === id) ?? features[0]
}

// The section of the page the hash names; the area's first section when it names none.
export function sectionFromHash(hash: string, feature: Feature): SectionId | null {
  if (!feature.sections) return null
  const named = hash.replace(/^#/, '').split('?')[0].split('/')[1]
  return (sectionIds as readonly string[]).includes(named) &&
    feature.sections.includes(named as SectionId)
    ? (named as SectionId)
    : feature.sections[0]
}

// Values a page hands to another through the hash, after a question mark ("#area/section?a=b").
export function hashParameters(hash: string): URLSearchParams {
  const position = hash.indexOf('?')
  return new URLSearchParams(position < 0 ? '' : hash.slice(position + 1))
}
