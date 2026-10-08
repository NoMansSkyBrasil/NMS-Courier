import type { DeliveryPlan } from './delivery-plan'

// Currency requests: one dispatch of a currency reward of the data file in
// runtime/mods/currency_rewards through the game's own reward routine. The amounts are the fixed
// ones that file defines; the renderer names a currency and one of them.

export const currencyAmounts = {
  units: ['1M', '10M', '100M', '1B'],
  nanites: ['1K', '10K', '100K', '1M'],
  quicksilver: ['1K', '10K', '100K', '1M']
} as const
export type Currency = keyof typeof currencyAmounts

// Where the data file must be, below the installation root, and what it must contain.
export const currencyDataFile = [
  'GAMEDATA',
  'MODS',
  'NMSCourierCurrencyRewards',
  'METADATA',
  'REALITY',
  'TABLES',
  'REWARDTABLE.EXML'
] as const
export const currencyDataSha256 = 'cdf9552a4a64fd54b95aa0a2fcd9f25b61a9ceb8f872e8443518701352e26062'

export type CurrencyRequest = { currency: string; amount: string }

export function getCurrencyPlan(request: CurrencyRequest): DeliveryPlan | null {
  const amounts: readonly string[] | undefined =
    currencyAmounts[request.currency as Currency] ?? undefined
  if (!Object.hasOwn(currencyAmounts, request.currency) || !amounts?.includes(request.amount)) {
    return null
  }
  return {
    changesAccount: false,
    steps: [
      {
        script: 'signal-currency-180836.ps1',
        args: ['-Currency', request.currency, '-Amount', request.amount]
      }
    ]
  }
}
