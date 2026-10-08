# Currency delivery notes

Status on 2026-10-08: **implemented in bridge 1.2.0, not yet exercised against
the running game.** Build 180836 only. Units, nanites and quicksilver of any
amount from 1 to 4,294,967,295 (the largest balance the game keeps; owner
statement) go to the loaded save slot through the game's own reward routine.
It is a slot change; the account is not touched.

## History

- 2026-09-23, build 179666: three extra reward table entries from a data file
  in the game's mod folder (`COURIER_UNITS`, `COURIER_NANITE`, `COURIER_QS`,
  1,000,000,000 each) were given through the game's reward routine. The owner
  saw the balances rise, the game's right-side notification and persistence
  after a normal save and reload. Source of that patch:
  `prototypes/data-mod/NMSCourierCurrencyRewardProbe`.
- 2026-10-08, bridge 1.1.0: twelve entries of fixed amounts
  (`runtime/mods/currency_rewards`). The owner rejected fixed amounts the same
  day; that request never ran in the game.
- 2026-10-08, bridge 1.2.0: any amount, described below.

## How it works

The game has no reward of an arbitrary amount, and no routine that adds money
was identified in this build (see "Rejected"). The bridge therefore uses three
entries of the data file as carriers, one per currency: `CR_UNITS_1M`,
`CR_NANITE_1K`, `CR_QS_1K`.

For one request, on the game's update thread
(`runtime/native/asi/profile_180836/currency_reward.h`):

1. Find the carrier in the game's reward table the way the game's reward
   routine (`0xf140f0`) does: map at manager + `0x7a0`, lookup `0x567610`,
   entries of 24 bytes at map + `0x10`, the entry pointer at + `0x10`.
2. Check that it is exactly the data file's entry: identifier at entry +
   `0x28`, one item in the list at entry + `0x10` (corrected on 2026-10-08,
   see "First live result" below), the item's reward reference at
   item + `0x10` with the money class hash `0xac3b9854`, and a money structure
   whose maximum and minimum both equal the file's amount, whose currency is
   the expected one (0 units, 1 nanites, 2 quicksilver) and which is not
   rounded. Any difference refuses the request with `bad_layout`; a missing
   carrier refuses it with `unknown_reward`.
3. Write the requested amount into that structure's maximum and minimum, call
   the reward routine, and write the file's amount back. An amount above
   2,147,483,647 is given in two calls, because the structure holds signed
   32-bit numbers.

What is written directly is only this project's own reward table entry. The
balance is changed by the game, which also applies its maximum and shows its
notification (or nothing, when the request says silent).

Layout evidence, offline: in the 180836 `rewardtable.mbin` every one of the 41
rewards that consist of a single money reward has the list reference at entry
+ 0, the identifier at + `0x18`, the reward reference at item + `0x10` with
hash `0xac3b9854`, and the money structure as maximum, minimum, currency,
round flag. Whether a loaded reference is a pointer or still a file offset is
not known; the bridge tries both and accepts only what passes the checks in
step 2.

## First live result (2026-10-08, bridge 1.3.0)

Units x1,000,000 from the application: `result=bad_layout`, nothing written.
The carrier was found, so the game loads the sparse `.EXML` data file on build
180836. The check failed because a table entry begins with the stat
identifier: the game's reward routine `0xf19e90` reads the entry's choice
flags at +0x24 and +0x25, which puts the item list at +0x10, the choice mode at
+0x20 and the entry's identifier at +0x28. In the file the same bytes had been
read as "list at +0, identifier at +0x18" of an entry that starts 16 bytes
later. Bridge 1.4.0 uses the corrected offsets
(`runtime/native/asi/profile_180836/reward_carrier.h`). Not yet run again.

## Files and requests

- Data file: `runtime/mods/currency_rewards/NMSCourierCurrencyRewards`, copied
  to the game's `GAMEDATA\MODS`. Table SHA-256
  `654e4f6ee459c992833cc4350148a66f737bc6943de94fb666fb93aae5a87b17` since the
  item carriers were added. The
  application refuses a currency request when the file is absent or differs.
  The nine entries that are not carriers are unused.
- Request `native-currency-request-180836-<PID>.txt`: `currency=`, `amount=`,
  optional `silent=1`; event `currency`. Result
  `native-currency-result-180836-<PID>.txt`: `result=given`,
  `unknown_reward`, `bad_layout` or `not_ready`, and the number of calls.
- Script `runtime/native/asi/signal/signal-currency-180836.ps1 -Currency units -Amount 5000000 [-ShowAlert]`.
- Application: the Currencies page, a currency and a free amount
  (`currency-card.tsx`, `currency-plan.ts`).

## Not proven

- Everything live. In particular whether this build still loads a sparse
  `.EXML` reward table from the mod folder: the result `unknown_reward` means
  it did not, and the next thing to try is the same file named
  `REWARDTABLE.MXML`.
- `given` means the game's routine was called, not that the balance changed;
  compare the balance in the game.
- The maximum of 4,294,967,295 is the owner's statement; how the game behaves
  at the limit was not observed.

## Rejected

- Fixed amounts (owner, 2026-10-08).
- The NMS.py byte patterns for `cGcPlayerState::AwardUnits` and
  `AwardNanites` do not occur in the 180836 or 180383 executables, and two
  structural searches for three sibling routines over consecutive balance
  fields found nothing. A routine that adds money directly is therefore not
  identified; do not guess one.
- Writing the balance fields: never, they are not located and the project does
  not write game state where a game routine exists.
