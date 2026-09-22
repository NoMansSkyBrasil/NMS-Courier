import type { BuildSupportStatus } from './build-support'
import type { GameProcessStatus } from './game-status-service'
import type { InstallationStatus } from './installation-service'
import type { RuntimeBundleStatus } from './runtime-resources'

export type DeliveryReadiness = {
  available: false
  reasonCode:
    | 'INSTALLATION_NOT_SELECTED'
    | 'INSTALLATION_INVALID'
    | 'BUILD_NOT_SUPPORTED'
    | 'BUILD_REGISTRY_UNAVAILABLE'
    | 'GAME_NOT_RUNNING'
    | 'GAME_STATUS_UNAVAILABLE'
    | 'RUNTIME_BUNDLE_INVALID'
    | 'ACTION_NOT_IMPLEMENTED'
}

export function resolveLocalItemDeliveryReadiness(
  installation: InstallationStatus,
  build: BuildSupportStatus,
  game: GameProcessStatus,
  runtime: RuntimeBundleStatus
): DeliveryReadiness {
  if (installation.state === 'not_selected') {
    return { available: false, reasonCode: 'INSTALLATION_NOT_SELECTED' }
  }
  if (installation.state === 'invalid') {
    return { available: false, reasonCode: 'INSTALLATION_INVALID' }
  }
  if (build.state === 'registry_unavailable') {
    return { available: false, reasonCode: 'BUILD_REGISTRY_UNAVAILABLE' }
  }
  if (build.state !== 'supported') {
    return { available: false, reasonCode: 'BUILD_NOT_SUPPORTED' }
  }
  if (game.state === 'query_failed') {
    return { available: false, reasonCode: 'GAME_STATUS_UNAVAILABLE' }
  }
  if (game.state !== 'running') {
    return { available: false, reasonCode: 'GAME_NOT_RUNNING' }
  }
  if (runtime.state !== 'bundled') {
    return { available: false, reasonCode: 'RUNTIME_BUNDLE_INVALID' }
  }
  return { available: false, reasonCode: 'ACTION_NOT_IMPLEMENTED' }
}
