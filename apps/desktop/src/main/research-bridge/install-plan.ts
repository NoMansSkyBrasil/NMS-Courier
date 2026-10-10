import { installRequestLines, type InstallRequest } from '../../shared/waiting-technology'
import type { DeliveryPlan } from './delivery-plan'

// Technologies waiting for their components (bridge 1.29.0,
// runtime/native/asi/profile_180836/technology_install.h): a listing, which only reads, or a
// finish, where the bridge calls the game's own install routine once for each technology.

export const installResultName = 'install-result'

export function getInstallPlan(request: InstallRequest | 'list'): DeliveryPlan | null {
  const lines = installRequestLines(request)
  if (!lines) return null
  const wanted = request === 'list' ? 'result=listed' : 'result=finished'
  return {
    changesAccount: false,
    steps: [
      {
        label: request === 'list' ? 'install-list' : 'install-finish',
        request: { name: 'install-request', perProcess: true, lines },
        signals: ['install'],
        result: { name: installResultName, seconds: 20 },
        // not_ready: no save is loaded, so nothing was read or called.
        accept: (answer) => answer.includes(wanted)
      }
    ]
  }
}
