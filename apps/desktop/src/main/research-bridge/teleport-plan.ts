import { destinationFromGlyphs } from '../../shared/portal-address'
import type { DeliveryPlan } from './delivery-plan'

// One journey of the player to a star system named by galaxy and portal address, made by the
// running game (bridge 1.21.0, runtime/native/asi/profile_180836/teleport_request.h). The bridge
// has the game fill its own pending teleport request and writes the destination into it.

export type TeleportRequest = {
  // Twelve glyphs; the first is the planet.
  glyphs: string
  // 1 is the first galaxy.
  galaxyNumber: number
  // Arrive at the system's space station, or on the planet the first glyph names.
  to: 'station' | 'planet'
}

export function isTeleportRequest(value: unknown): value is TeleportRequest {
  if (!value || typeof value !== 'object') return false
  const request = value as Record<string, unknown>
  return (
    typeof request.glyphs === 'string' &&
    typeof request.galaxyNumber === 'number' &&
    (request.to === 'station' || request.to === 'planet')
  )
}

export function getTeleportPlan(request: TeleportRequest): DeliveryPlan | null {
  const destination = destinationFromGlyphs(request.glyphs, request.galaxyNumber)
  if (!destination) return null
  return {
    changesAccount: false,
    steps: [
      {
        label: 'teleport',
        request: {
          name: 'teleport-request',
          perProcess: true,
          lines: [
            `galaxy=${destination.galaxy}`,
            `system=${destination.system}`,
            `planet=${destination.planet}`,
            `x=${destination.x}`,
            `y=${destination.y}`,
            `z=${destination.z}`,
            `to=${request.to}`
          ]
        },
        signals: ['teleport'],
        result: { name: 'teleport-result', seconds: 12 },
        // not_ready: no save loaded or a journey already pending. not_filled: the game did not
        // fill its request, so nothing was written.
        accept: (lines) => lines.includes('result=requested')
      }
    ]
  }
}
