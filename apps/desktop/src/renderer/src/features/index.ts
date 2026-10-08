import { groupIds, type FeatureId, type GroupId } from '@renderer/i18n/messages'
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

// The dashboard is the empty hash; every other page is "#<feature id>".
export function featureHref(id: FeatureId): string {
  return id === 'dashboard' ? '#' : `#${id}`
}

export function featureFromHash(hash: string): Feature {
  const id = hash.replace(/^#/, '')
  return features.find((feature) => feature.id === id) ?? features[0]
}
