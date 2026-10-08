# Reward redemption notes

Checkpoint: 2026-10-07. Owner of the reward domain: marking season
(expedition), Twitch and platform rewards as redeemed **in the loaded save
slot**.

Status in one line: the game routine is identified and a request is built
into the research profile and installed; **nothing has been redeemed in a
running game yet.**

Direction from the project owner (2026-10-07): work on the save slot that is
active at that moment and leave the account data alone.

## What the slot holds

Read-only look at the slot files (keys are the save file's own short keys):

| List in a slot | Key | Slot 1 | Slot 3 (test) |
| --- | --- | --- | --- |
| Known specials | `24<` | 927 | 11 |
| Redeemed season rewards | `FnB` | 293 | 10 |
| Redeemed Twitch rewards | `0Pa` | 435 | 0 |
| Redeemed platform rewards | `dgg` | (not seen) | 1 (`TGA_SHIP1`) |
| Known refiner recipes | `Ddk` | 1,684 | 7 |

These are the per-slot states the save editor shows as "Redeemed in Save".

## Fish and fossils: where they really are (corrected 2026-10-07)

An earlier version of this section said that no slot holds a fishing record.
**That was wrong.** The owner asked for a deeper look, and it shows:

### Fish: the record is in the slot

- Every slot file has a fishing record (save key `bTf`): a fixed list of 256
  product IDs (`5gB`), 256 counts (`yv6`) and the largest-catch values. In all
  four slots of the owner it is empty, which is why a search for fish IDs
  found nothing. The fish IDs that slot 1 does contain are known products.
- The game fills it through one routine, found from the catch message and
  statistic it uses: `4678d0` (fishing object at manager `+0x307788`, pointer
  to the fish's entry in the fish table, catch size as a float). The object
  keeps a record list at `+0x18` (capacity, count, pointer) with entries of
  `0x18` bytes: product ID, catch count, largest size. For a fish already
  recorded the routine adds one to the count and keeps the larger size; for a
  new fish it appends an entry with count 1.
- The fish table is at `*(manager + 0xe0)` with entries of `0x68` bytes; the
  product ID is at `+0x20` of an entry. The converted table gives each fish a
  quality and a size class, not a number of its own.

So fish **can** be delivered into the slot through the game's own routine.
What that routine does besides the record, each time it is called:

- adds one to the statistic `FISH_CAUGHT`, and to a per-fish statistic when
  the entry names one;
- adds to two counters of the fishing object;
- for a new fish, runs a check that mentions `FISH_LEGEND`, read as a
  milestone or achievement test.

Recording 220 fish this way therefore also says "220 fish caught" in the
statistics and may complete milestones. The catch size has to be supplied by
the caller, so any value is invented; which value to use is the owner's
decision. Nothing was built for fish yet.

### Fossils: the slot has statistics, the collection is account data

- A slot holds six fossil statistics (`FOS_MADE`, `FOS_BI_MADE`,
  `FOS_QUAD_MADE`, `FOS_BIRD_MADE`, `FOS_GRUN_MADE`, `FOS_WORM_MADE`), all
  empty in slot 3, and, in slot 1, the craftable fossil display pieces among
  the known products. It holds no list of the individual bones.
- The individual bones (`FOS_HEAD_*`, `FOS_LIMBS_*`, `FOS_BI_BODY_*`,
  `FOS_BI_TAIL_*`) appear only in the account's seen-products list. That is
  what a save editor's fossil page shows as complete.
- The game has a single-entry routine for that list too: "mark product as
  seen" (`60a720` on build 180836), which the catch routine above also calls
  for a new fish. It writes the account object and sets its changed flag.

So fossils can be marked through a game routine as well, but the place the
game keeps them is the account, not the slot. Whether the wonder records of
a slot (`WonderTreasureRecords` and the others named in the executable) play
a part was not examined.

### Owner decisions and what was built (2026-10-07)

The owner decided: fish sizes may be random, as the save editor's own values
are (its listing shows counts from 1 to 100 and sizes from about 1 to 101
with no relation to the fish); the added fishing statistics and possible
milestones are accepted; and fossils may be written to the account's
seen-products list.

Fish request, as built:

- The fish table of the corpus has 226 entries, all of them products, with no
  duplicate. Six are bound to a mission (`RequiresMissionActive` set):
  `F_BOSS_JELLY`, `S15_FISH`, `S15_BOT_1` to `S15_BOT_4`. They are the
  difference to the editor's 220 and are **skipped by structure** (the mission
  field at entry `+0x30`), so a later mission-only fish is skipped too.
- The profile walks the running game's fish table and, for every fish that is
  not mission-bound and has no record yet, calls the game's catch routine
  once with a size drawn at random between 1.0 and 100.0. Each fish gets
  count 1. The editor's higher counts are not reproduced: every extra count
  would be another call and another caught fish in the statistics.
- A fish already recorded is left alone, so sending the request twice does
  not count twice.
- Scope: the loaded slot. Native call; the profile writes nothing itself.
- Event `fish`, no request file; result file
  `native-fish-result-180836-<PID>.txt` with `table_fish`, `recorded`,
  `already_recorded`, `mission_only_skipped`, `refused_table_entries`,
  `records_after`. Script `signal-fish-180836.ps1 -All`.

Not verified for fish: the call outside the fishing interface (the routine
normally runs right after a catch); what the 256-entry list of the save
holds afterwards; the milestone check; the catalogue as the player sees it.
The catch message code also marks a new fish as seen on the account; this
request does not do that.

Fossil request, as built:

- Product list: [fossil products](../runtime/research/fossil-products.md),
  generated by `runtime/research/list-fossil-products.py`: 143 bones (type
  ExhibitBone) and 22 other fossil products.
- For each requested ID that begins with `FOS_`, the profile calls the game's
  "mark product as seen" routine (`60a720`) with the account object. The
  routine looks the product up, refuses some product types and IDs already
  listed, inserts the ID and sets the account's changed flag.
- Scope: **the account, every slot, and data the game synchronises with its
  servers.** This is the one request of the profile that changes account
  data, by the owner's decision for fossils only; the profile refuses any ID
  that does not begin with `FOS_`.
- Event `fossil`; request file `native-fossil-request-180836-<PID>.txt` with
  one `id=<ID>` per line; result file with `added`, `not_added`,
  `blocked_id` or `not_ready` per ID. Script `signal-fossil-180836.ps1` with
  `-Id`, or `-All` and optionally `-BonesOnly`.

On the owner's account all 165 are already in the list (an editor wrote them
earlier), so the first test can only show `not_added` for every ID.

### First live run of the fish and fossil requests (2026-10-07)

Build 180836, executable `13d5060d...3499`, profile DLL `2bd83437...ca78`,
process 24704, **slot 3** (identified automatically earlier in the same
process), backup `20261007-before-slot-lists`.

| Request | Result reported by the profile |
| --- | --- |
| `signal-fish-180836.ps1 -All` | `table_fish=226`, `recorded=220`, `already_recorded=0`, `mission_only_skipped=6`, `refused_table_entries=0`, `records_after=220` |
| `signal-fossil-180836.ps1 -All` | 165 requested, 165 `not_added` |

After both the process was alive and responding and `request_errors=0`.

- Fish: the catch routine ran 220 times from the update hook without
  stopping the game, and the record list of the fishing object holds 220
  entries. The six mission-bound fish were skipped as intended.
- Fossils: every ID was already in the account's seen list, as expected on
  this account, so the routine returned without adding. This shows only that
  the call is safe here; **it does not show that it adds.**

Not proven: what the fishing catalogue shows; the statistics and milestones
the catch routine touched; the fishing record written to the save and read
back after a restart; the fossil routine on an account that lacks the IDs.

### Fossil request withdrawn (2026-10-07)

After the run above the owner made clear that fossils were wanted **in the
save, not in the account**; the earlier "yes" to the account-level question
was not meant that way. The account-level fossil request was therefore
removed from the profile the same day (`fossil_seen.h` and
`signal-fossil-180836.ps1` deleted, replaced in the event table by the
product request).

What the single run did: nothing. All 165 IDs were already in the account's
seen list, written by a save editor before, and the routine returned without
adding. If the owner wants them out of the account, that is a change to the
account files with whatever tool wrote them; the profile has no routine that
removes a seen entry.

What a slot can hold for fossils: the 22 fossil display pieces as known
products (through the product request, class `catalogue_construction`, see
[product delivery notes](PRODUCT_DELIVERY_NOTES.md)) and six statistics. The
individual bones have no per-slot list in the game; that finding stands.

## Why the account data is left alone

Besides the owner's direction: the executable contains requests named
`uploadaccountdata`, `getaccountdata`, `SubmitAccountData` and
`CheckAccountDataSyncState`. The account data is synchronised with the
publisher's servers. A change there leaves the machine; a slot change does
not, as far as the names show. The traffic itself was not observed.

### Owner decision: account-level results are accepted (2026-10-07, evening)

The owner ruled that receiving on the account is acceptable, reasoning that
the reference service unlocks account-wide on the recipient and that only
console save editors are limited to the save. This replaces the earlier
"ignore the account data" direction of the same day. It does not change the
product boundary: account lists are changed only by the game's own routines
in the running game, never by editing `accountdata.hg` or the settings file.
Deliveries still go into the loaded slot as well, and every record states
both scopes.

### Correction: the slot-side routine also writes the account (found 2026-10-07)

These notes and the customisation notes said the `redeem` event "does not
touch the account lists". **That was wrong for specials.** Read-only look at
process 8256 after the customisation delivery of 263 IDs:

| Account set | Before (16:50 read) | After |
| --- | --- | --- |
| Unlocked specials (`+0x180`) | 741 | 794 |
| Unlocked titles (`+0x140`) | 346 | 346 |
| Unlocked season rewards (`+0x1c0`) | 293 | 293 |
| Unlocked platform rewards (`+0x240`) | 1 | 1 |
| Twitch (`+0x200`, unresolved) | 0 | 0 |

All 263 customisation IDs are now in the account's unlocked specials; 53 of
them were new there. Both account files were rewritten by the game at 23:22
(`accountdata.hg` and `GCUSERSETTINGSDATA.MXML`). So `5ab380`, when it adds
a known special to the slot, also unlocks the special on the account, and
the game then stores and presumably uploads the account data. Not verified:
that nothing else added those 53 (the product requests of the same session
only mark products as *seen*).

What was not done properly: the settings file was not copied before the
request, because the change was believed to be slot-only. The save folder
backup `20261007-before-customisation-all` does contain the earlier
`accountdata.hg`. From now on a `redeem` request counts as an account-level
change and both account files are backed up first.

### What can be done on the account (state on 2026-10-07)

Compared with the game's own tables, the owner's account already holds
every title (346 of 346), every purchasable special (336 of 336, plus 458
other IDs), every season reward (293 of 293) and one of three platform
rewards. Most of that was written by a save editor before this project.

| List | Route in the game | State |
| --- | --- | --- |
| Unlocked specials | Slot-side routine `5ab380` (profile `redeem` event) writes slot and account | Used live for 263 IDs |
| Unlocked season rewards | Account routine `60ae70`, called by the reward handler `f44010`, then `5ab380` for the slot | Slot side used live for 112 IDs; the account side is not exercised on this account because nothing is missing |
| Unlocked titles | Account routine found on build 180383 (`609bb0`: checks the title's condition through `6093e0`, inserts, then gives the title's specials); not relocated to 180836 | Not built; nothing missing on this account |
| Unlocked platform rewards | No single-entry routine found; only a bulk "apply loaded settings" routine | Not built. Missing here: `SW_PREORDER`, `SW_PREORDER2` |
| Unlocked Twitch rewards | Same; and the set expected at `+0x200` is empty in memory while the file lists 435 | Unresolved |
| Seen substances, technologies, products | Single-entry routines; the product learn routine calls the product one | Used indirectly |

Consequences:

- On an account that an editor has not touched, the `redeem` event alone
  would deliver specials to both scopes. Season rewards would need the
  account routine as well, or the whole reward handler; that needs a test on
  an account that lacks them, which the owner's account cannot give.
- Twitch and platform rewards are the open part; the only route known inside
  the running game is a direct insert with the game's container routine,
  which is a direct write and has to be labelled so.

### Pre-order, platform and entitlement rewards: what they are (offline, 2026-10-08)

The owner asked whether the pre-order items can be unlocked. Read from the
build 180836 tables only; nothing was sent.

Two different mechanisms carry them:

| Group | Where it is defined | Entries | What the entry gives |
| --- | --- | --- | --- |
| Platform rewards | `unlockableplatformrewards` (reward ID to product) | `TGA_SHIP1` -> `TGA_SHIP01`, `SW_PREORDER` -> `SWITCH_SHIP01`, `SW_PREORDER2` -> `SWITCH_GUN01` | A product; for `TGA_SHIP01` the product's `GiveRewardOnSpecialPurchase` names the shipped reward `R_TGA_SHIP01` (a `GcRewardSpecificShip`). The two Switch products have no reward named in the reward table |
| Entitlements | `EntitlementTable` at the end of `rewardtable` (reward ID, entitlement ID, inline reward) | `ENT_SHIP` / `ALPHAVSHIP` (ship), `ENT_SHIP_PC` / `HORIZOSHIP` (ship), `ENT_BOLTCASTER`, `ENT_PHOCORE` (technologies), `ENT_CHARISMA` (products), `ENT_UNITS` (money), `ENT_REZOSUZ` (weapon), and five `ENT_XO_*` entries without an entitlement ID (a special, two weapons, two money rewards) | The reward is written inside the entry, not as a named reward-table entry |

State and routes:

- The two technologies (`BOLT_SM`, `PHOTONIX_CORE`) were taught with the
  technology delivery of 2026-10-07.
- Account list of platform rewards: no single-entry routine is known; the
  account request does not cover it. The owner's account holds `TGA_SHIP1`.
- Receiving a ship or a weapon is not an unlock: the game hands the item over
  through a reward. `R_TGA_SHIP01` is a named reward and could be sent
  through the profile's shipped-reward dispatch, which only accepts reward
  IDs compiled into the DLL, so it needs a build. What a ship reward does to
  the ships the player owns (adds one, or replaces the active one, as the
  reference service warns for its own ship delivery) has not been observed.
- The entitlement rewards are inline; whether the dispatch routine can reach
  an entitlement entry by its `ENT_*` ID is not known. The routine that
  grants entitlements when the platform reports ownership has not been
  located.
- The Switch products: no reward found; route unknown.

Added after a corpus-wide search finished: the game also ships per-platform
entitlement tables under `metadata/entitlements/`. The PC ones list a single
entitlement: `HORIZOSHIP` (service ID `HORIZOSHIP000000`) redeeming reward
`ENT_SHIP_PC`, named `PC_ENTITLEMENT_HORIZON_OMEGA_SH`, with the error text
`REDEEM_SHIP_FAIL`. The generic and Xbox tables are longer. So on PC the
game has one redeem flow, for the Horizon Omega ship, gated by what the
store reports; `ALPHAVSHIP` belongs to another platform's list. The core
mission table also tests both ship entitlements in a mission condition
(around line 256,951 of the converted table). The redeem flow's routine is
the place to start reading.

So nothing here can be sent with what is installed today. These belong to
ship and multitool delivery, with the entitlement lookup as the first thing
to read in the executable.

## How the game redeems a reward in a slot (offline, build 180836)

The shipped reward `GcRewardUnlockSeasonReward` (306 uses; fields `ProductID`,
`Silent`, `MarkAsClaimedInShop`, `UniqueInventoryItem`,
`UseSpecialFormatting`, `EncryptedText`) is handled at `f44010`. The handler
unlocks the ID on the account (`60ae70`) and then, when the reward is marked
as claimed and is not a unique inventory item, calls one routine with the
player state and the ID: `5ab380`.

`5ab380` (player state, 16-byte ID), read from the disassembly:

- if the ID is a special, adds it to the slot's known specials (and, for a
  craftable build part, its recipe through the learn-product routine);
- if the ID is in the season table (map at manager `+0x8e0`), inserts it into
  a set at player state `+0xa8ac0`, read as the redeemed season rewards;
- if the ID is in the Twitch table (map at manager `+0x920`) or the platform
  table (map at manager `+0x960`), follows the matching branch for that kind.

It returns 1 when something changed. The profile calls this routine for each
requested ID and nothing else. This is a native call; the profile writes
nothing into game memory itself and does not touch the account lists.

Not verified, and important:

- **Redeeming is not receiving.** For a decoration, a title or a
  customisation part, known and redeemed is the whole reward. For a ship, a
  multitool, a frigate or a companion egg, the game normally hands over the
  item when the player claims it; this routine only records the claim.
  Whether the player can still claim the item afterwards is unknown. Until
  that is known, such rewards should not be redeemed this way on a slot that
  matters.
- Whether the game accepts a slot redemption for an ID the account has not
  unlocked. On the owner's account all season and Twitch IDs are unlocked, so
  the first tests cannot show it.
- The Twitch and platform branches were not read to the end; which sets they
  write is not identified, and the Twitch list was not found in memory at
  all on 2026-10-07.
- The call from the update hook instead of the reward handler.

## Never redeemed

The 14 repeatable specials (fireworks, Myth Beacon, Void Egg; see
[known lists triage](KNOWN_LISTS_TRIAGE.md)) are refused by the profile by ID
and are marked `no` in the generated table if they ever appear as a season,
Twitch or platform reward. None does today.

## Data and request

- Reward list: [unlockable rewards](../runtime/research/unlockable-rewards.md),
  generated by `runtime/research/list-unlockable-rewards.py` from the game
  tables: 293 season, 435 Twitch, 3 platform, with expedition number and
  flags.
- Event `redeem`; request file
  `%LOCALAPPDATA%/NMSCourier/diagnostics/native-redeem-request-180836-<PID>.txt`
  with one `id=<ID>` per line, at most 512.
- Result file `native-redeem-result-180836-<PID>.txt`: the size of the slot's
  redeemed season set before and after, and one line per ID (`changed`,
  `no_change`, `blocked_id`, `not_ready`).
- Script: `runtime/native/asi/signal/signal-reward-180836.ps1` with
  `-Id A[,B...]` or `-AllOfKind season|twitch|platform`, and `-Expedition N`
  to take one expedition.

## Build and installation (2026-10-07)

| Item | Value |
| --- | --- |
| Game build | 180836, executable SHA-256 `13d5060d...3499` |
| Profile DLL | SHA-256 `3c7a6fcc3602ae23851453edd07d22cb12c07282dc5418f2453f037205d54269`: recipe, redeem, fish and fossil requests. It replaced `0983a24e...2106` (recipe and redeem only), which was never started by the game |
| Installed | Yes, with the game closed |
| Backup | `E:/NMS-Courier-Research/save-backups/20261007-before-slot-lists` (whole save folder, with `accountdata.hg`, and the settings file; 28 files, taken before any of these requests) |
| Checks run | Recipe, technology and freighter fixtures pass. There is no fixture for the redeem, fish and fossil requests yet |
| Later build | The source was split per domain the same day; the installed DLL is `2bd83437...ca78` with the same requests |
| Checks not run | Any live request |

## First live test (proposed, not done)

1. Start the game, load slot 3, run the slot identification
   (`runtime/research/identify-loaded-slot.py`) and the preflight.
2. One decoration-type season reward by ID; compare the result file with the
   slot's lists and with what the game shows.
3. One expedition's decorations; then decide about ships and other items
   with the owner before anything larger.
