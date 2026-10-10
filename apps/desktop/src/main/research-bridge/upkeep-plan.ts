import { rechargeRequestLines, repairRequestLines, type RepairGroup } from '../../shared/upkeep'
import type { DeliveryPlan } from './delivery-plan'

// Repair and recharge through the game's own rewards (bridge 1.33.0,
// runtime/native/asi/profile_180836/inventory_repair.h and technology_recharge.h).

export function getRepairPlan(groups: readonly RepairGroup[], notify: boolean): DeliveryPlan {
  return {
    changesAccount: false,
    steps: [
      {
        label: 'repair',
        request: {
          name: 'repair-request',
          perProcess: true,
          lines: repairRequestLines(groups, notify)
        },
        signals: ['repair'],
        result: { name: 'repair-result', seconds: 12 },
        accept: (lines) => lines.includes('result=given')
      }
    ]
  }
}

export function getRechargePlan(threshold: number, notify: boolean): DeliveryPlan {
  return {
    changesAccount: false,
    steps: [
      {
        label: 'recharge',
        request: {
          name: 'recharge-request',
          perProcess: true,
          lines: rechargeRequestLines(threshold, notify)
        },
        signals: ['recharge'],
        result: { name: 'recharge-result', seconds: 12 },
        // "nothing_low" is a good answer too: every charge was above the threshold.
        accept: (lines) => lines.includes('result=given') || lines.includes('result=nothing_low')
      }
    ]
  }
}
