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

## Why the account data is left alone

Besides the owner's direction: the executable contains requests named
`uploadaccountdata`, `getaccountdata`, `SubmitAccountData` and
`CheckAccountDataSyncState`. The account data is synchronised with the
publisher's servers. A change there leaves the machine; a slot change does
not, as far as the names show. The traffic itself was not observed.

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
| Profile DLL | SHA-256 `0983a24e0664f229147aea723b2535ed8e449bb23533127c5a42e7100a492106`; also contains the recipe request |
| Installed | Yes, with the game closed, replacing `22cf6a82...f545` (which was never started by the game) |
| Backup | `E:/NMS-Courier-Research/save-backups/20261007-before-recipes` (whole save folder and settings file, taken the same day before any of these requests) |
| Checks run | Recipe, technology and freighter fixtures pass. There is no fixture for the redeem request yet |
| Checks not run | Any live request |

## First live test (proposed, not done)

1. Start the game, load slot 3, run the slot identification
   (`runtime/research/identify-loaded-slot.py`) and the preflight.
2. One decoration-type season reward by ID; compare the result file with the
   slot's lists and with what the game shows.
3. One expedition's decorations; then decide about ships and other items
   with the owner before anything larger.
