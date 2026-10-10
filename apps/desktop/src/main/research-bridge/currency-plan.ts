import type { DeliveryPlan } from './delivery-plan'

// Currency requests: units, nanites or quicksilver of any amount through the game's own reward
// routine. The bridge needs the data file of runtime/mods/courier_rewards in the game's mod folder.

export const currencies = ['units', 'nanites', 'quicksilver'] as const
export type Currency = (typeof currencies)[number]
// The largest balance the game keeps.
export const currencyMaximum = 4294967295

// Where the data file must be, below the installation root, and what it must contain.
export const currencyDataFile = [
  'GAMEDATA',
  'MODS',
  'NMSCourier',
  'METADATA',
  'REALITY',
  'TABLES',
  'REWARDTABLE.EXML'
] as const
export const currencyDataSha256 = '239ce8efd10a0f0a68e5a199fab611ecafc48be38c2dc6bf3433c3054e0f1058'

export type CurrencyRequest = { currency: string; amount: number }

export function getCurrencyPlan(request: CurrencyRequest, notify: boolean): DeliveryPlan | null {
  const valid =
    (currencies as readonly string[]).includes(request.currency) &&
    Number.isInteger(request.amount) &&
    request.amount >= 1 &&
    request.amount <= currencyMaximum
  if (!valid) return null
  return {
    changesAccount: false,
    steps: [
      {
        label: 'currency',
        request: {
          name: 'currency-request',
          perProcess: true,
          lines: [
            `currency=${request.currency}`,
            `amount=${request.amount}`,
            `silent=${notify ? 0 : 1}`
          ]
        },
        signals: ['currency'],
        result: { name: 'currency-result', seconds: 12 },
        // unknown_reward: the game has not loaded the data file. bad_layout: nothing was written.
        accept: (lines) => lines.includes('result=given')
      }
    ]
  }
}
