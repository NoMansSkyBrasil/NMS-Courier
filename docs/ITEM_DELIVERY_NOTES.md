# Item delivery notes

Status on 2026-10-08: **implemented, not yet exercised against the running
game.** Build 180836 only (executable `13d5060d...3499`). The request puts
substances and products into the exosuit cargo of the loaded save slot through
the game's own store routines. It is a slot change; nothing on the account
changes. Currencies are a separate, still open problem (see the last section).

## What the game does itself

Found offline in the 180836 executable, starting from the store add routine
that delivered Carbon on build 179666 (`0x4ce130` there). Its first 32 bytes
occur exactly once in 180836, at `0x4d0780` (and once in 180383, at
`0x4d06f0`).

One of its 36 callers, the routine at `0x4ce7a0`, fills a store with starting
contents. For every entry of a list it:

1. looks the ID up as a substance (`0xebbf70`, table at manager + `0x60`),
   and when that finds nothing as a product (`0xec9ba0`);
2. asks for the stack limit of that item in this store: `0x4d43c0` for a
   substance, `0x4d4420` for a product. Both read the limit of the store's
   size group (store + `0xfc`) for the current difficulty settings and
   multiply it by the item's own stack multiplier, capped by a global
   maximum;
3. initialises a 48-byte element with `0x2a3aa80` (position -1/-1, amount 0,
   limit 100, fully installed);
4. copies the ID from the definition (substance + `0xc8`, product + `0x150`;
   the same offsets the catalogue layouts found independently), sets amount,
   limit and type (0 substance, 2 product);
5. calls the add routine `add(store, out position, element)`.

Element layout, unchanged from 179666: ID 16 bytes, x, y, amount, damage
factor, limit, type (4 bytes each), added-automatically and fully-installed
bytes, 6 bytes of padding.

## What the profile does

`runtime/native/asi/profile_180836/item_give.h` repeats steps 1 to 5 for each
requested ID on the game's update thread, one stack at a time, until the
amount is in or the add routine returns no position (cargo full). It writes
nothing to the store itself. All five routine entries are compared with their
recorded first 32 bytes before the profile accepts the build.

- Target: exosuit cargo, manager + `0xc250` (the active store the exosuit
  domain already uses). Ship, freighter and other stores are not offered yet.
- Request file `native-item-request-180836-<PID>.txt`, one `<ID>=<amount>` per
  line, 1 to 32 different IDs, amount 1 to 999,999; event `item`.
- Result file `native-item-result-180836-<PID>.txt`:
  `<ID>:<added>/<requested>=<result>` with result `added`, `partial`,
  `no_room`, `unknown_id`, `bad_limit` or `not_ready`.
- Script: `runtime/native/asi/signal/signal-item-180836.ps1 -Item FUEL1=500,CASING=10`.
- Application: the Items page searches the local catalogue (substances and
  products), takes an amount per item and sends one request
  (`apps/desktop/src/renderer/src/components/items-card.tsx`,
  `getItemPlan` in `delivery-plan.ts`).

## First live result and the notification (2026-10-08)

`FUEL1` x9999 sent from the application with bridge 1.3.0 arrived in the
exosuit cargo (`FUEL1:9999/9999 stack 9999=added`, confirmed by the owner). No
notification appeared; the owner wants the game's usual "received" message.

Bridge 1.4.0 therefore has two routes. With the notification wanted (the
default), the item is given through the game's reward routine: the data file
has two more entries, `CR_ITEM_SUB` (one specific-substance reward, `FUEL1`
x1, multiplier disabled) and `CR_ITEM_PROD` (one specific-product reward,
`CASING` x1), used as carriers exactly like the currency carriers: checked,
filled with the requested identifier and amount, given, restored
(`reward_carrier.h`, `item_give.h`). Reward layouts, each verified against
every single-reward entry of the table: substance (class hash `0x4551b575`)
identifier at +0, maximum +0x10, minimum +0x14; product (`0x21b90b77`)
identifier at +0x20, maximum +0x40, minimum +0x44. The result line then ends
in `rewarded`. Where the game puts an amount that does not fit the exosuit is
the game's decision and is not known yet. With silent delivery, or when the
carrier is not available, the store routine is used as before (`added`).
Not proven live.

## Stack sizes

Owner request of 2026-10-08. The stack of an item in a store is what the
game's two limit routines compute: the base stack of the store's size group
under the save's difficulty settings, times the item's own multiplier, at most
a cap; products of type 5 or 8 (creature eggs) and products with multiplier 0
are one per slot. The multiplier is in the tables (substance + `0x12c`,
product + `0x1e0`), verified for every entry, and is stored in the catalogue.
Bridge 1.2.0 reads the base and the cap for the exosuit cargo of the loaded
save and reports them; the Items page multiplies. Until a save is loaded the
page shows no stack. The bridge still asks the game for the limit of each item
when it sends, and an item result now names the stack it used.

## Not proven, and what to check in the first live test

- Nothing of this has run in the game. First test: slot 3, one substance
  (`FUEL1=500`) and one product (`CASING=10`), then look at the cargo, save,
  reload.
- Whether the add routine merges into an existing stack or always opens a new
  one. On 179666 it opened a second Carbon stack.
- Whether the game shows any pickup notification. On 179666 it did not; the
  add routine has no notification of its own, so the notification setting has
  no effect on items until a higher routine is found.
- Technology items, upgrade modules with seeds and other stores are out of
  scope here.
- Rollback: restore the save folder backup the application or the tester made
  before the request; the previous profile DLL (`6ad12b1c...27fc`) is kept in
  `E:\NMS-Courier-Research\native-builds\item-20261008\replaced`.

## Game notifications

Owner decision of 2026-10-08: deliveries show the game's own notification by
default and the user can choose silence in the settings; inventory upgrades
must never ask the user to accept anything. Implemented where the game
routine has a silent flag: technologies (`-ShowAlert`, existing) and product
recipes and build parts (`-ShowAlert`, new: request line `silent=0`). The
application passes it unless "Game notifications" is switched off
(`use-notify-preference.ts`, `withNotifications` in `delivery-plan.ts`).
Other areas have no notification in their routine and stay silent. Not yet
observed live: how the game queues several hundred notifications when a whole
area is sent; if that is unpleasant, limit notifications to chosen entries.

## Currencies: open

The 2026-09-23 success on build 179666 used three custom reward IDs
(`COURIER_UNITS`, `COURIER_NANITE`, `COURIER_QS`) from a data patch, sent
through the game's reward routine. No data patch exists for 180836 and none
is wanted. What is known for 180836: the reward routine (`0xf140f0`) is
already used by the profile, and the game's tables hold 98 rewards whose only
content is one money reward, with fixed amounts. Next step: find the routine
the money reward handler calls (it takes a currency and an amount and shows
the right-side notification) and call that with the requested amount. Do not
write the balance fields directly.
