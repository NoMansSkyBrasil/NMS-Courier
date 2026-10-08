# Account unlock notes

Checkpoint: 2026-10-08. Owner of the account domain: unlocking titles,
specials and season (expedition) rewards on the account, which every save
slot shares, through the game's own routines in the running game.

Status in one line: the request was run live on 2026-10-08 on an account
emptied for the test: every title, every non-repeatable special and every
season reward of the game tables is now in the account sets in memory.
What the game shows, what it saves and what the remote copy does are not
confirmed yet. Scope of a request: the whole account.

## Owner direction

- 2026-10-07 (evening): account-level results are accepted.
- 2026-10-08: prefer the save slot where the game has a slot-side list; use
  the account where it does not. Never edit a save or account file as a
  delivery; send everything through the game and let the game write its
  files when it saves.

What that means per kind:

| Kind | Slot-side list | Account list | Route chosen |
| --- | --- | --- | --- |
| Specials (customisation, Quicksilver shop) | Known specials (`24<`) | Unlocked specials | Slot routine `5ab380`, which also unlocks on the account ([reward redemption notes](REWARD_REDEMPTION_NOTES.md)); the account routine below for IDs the slot already holds |
| Season rewards | Redeemed season set | Unlocked season rewards | Slot routine for the redemption; the account routine below for the account list, which the slot routine does not write |
| Titles | None found | Unlocked titles | Account routine below; there is no slot list to write |

## Where the account comes from (observed 2026-10-07 and 2026-10-08)

| Start condition | Account lists in memory after the start |
| --- | --- |
| `accountdata.hg` emptied by an editor, settings file full, store client online | Full again; both files rewritten to their earlier sizes |
| Both files emptied, store client online | Full again; both files rewritten to their earlier sizes |
| Both files emptied, **store client offline** (machine still online; the game showed an attempt to reconnect to the publisher's servers) | **Mostly empty**: titles 86, unlocked specials 458, season 0, platform 1 |

So the lists are restored from outside the machine when the store client
is online. Not determined: whether the copy comes from the store client's
cloud or from the publisher's service reached through it. When the client
went online again after the offline session of 2026-10-08, the two accounts
were **merged**, with the Twitch set as the one exception; see "Back
online" below.

In the offline start the 86 titles were not in either file: the game
unlocked them itself at load from the slot's own state. The 458 specials
are the ones the editor's emptied `accountdata.hg` still held; all 336
purchasable specials and 80 of the 263 customisation IDs were missing.

## Tests on the emptied account (process 25584, slot 3, DLL `68fd60bc...d5a7`)

Backup before: `save-backups/20261008-offline-empty-account-start` (save
folder and settings file).

| Request | Slot | Account |
| --- | --- | --- |
| `signal-customisation-180836.ps1 -Id BANNER_AF` (already in the slot's known specials, missing on the account) | `no_change` | Unchanged: still missing |
| `signal-reward-180836.ps1 -Id EXPD_POSTER23A` (new to the slot) | `changed`, redeemed season 122 -> 123 | Unlocked **specials** 458 -> 459 (the ID is there); unlocked **season** rewards still 0 |

Findings:

- The slot routine adds to the account's specials only when it adds to the
  slot. An ID the slot already knows is not pushed to the account again.
- The slot routine never writes the account's season list.

## The account routines (build 180836, offline)

All three take the account object (`manager + 0x315748`) and a pointer to a
16-byte ID, return 1 when they inserted, and set the account's changed flag
(`+0x2b0`). Relocated from build 180383 (`609bb0`, `609dd0`, `609ed0`) and
compared instruction by instruction.

| Routine | RVA | What it checks before inserting | Set |
| --- | --- | --- | --- |
| Unlock title | `60ab50` | The ID is a title of the title table (`*(manager + 0x308)`, entries of `0xf8` bytes); a helper (`60a380`) refuses a title already unlocked, a title blocked in the active expedition, and an empty ID. **It does not test the title's own unlock condition** (statistic, mission, product). After inserting it also runs the slot-side step for each special the title grants | `+0x140` |
| Unlock special | `60ad70` | The ID is in the specials map (`manager + 0x8a0`) or is a product whose field at `+0x1e4` is 8; not already present | `+0x180` |
| Unlock season reward | `60ae70` | The ID is in the season map (`manager + 0x8e0`) | `+0x1c0` |

Twitch and platform rewards have no such routine; see the triage notes.

## The request (research profile, build 180836)

- File `runtime/native/asi/profile_180836/account_unlock.h`; event
  `account`; request file `native-account-request-180836-<PID>.txt` with one
  `title=<ID>`, `special=<ID>` or `season=<ID>` per line, at most 2,048.
- On the game's update thread, for each line: the repeatable-purchase ID
  rule, then the matching routine. Nothing else: the profile does not insert
  into a set itself and does not touch a slot.
- Result file `native-account-result-180836-<PID>.txt`: entries of each of
  the three sets before and after, and one line per ID.
- Script `runtime/native/asi/signal/signal-account-180836.ps1` with
  `-Title`, `-Special`, `-Season` (IDs) or `-AllOfKind title,special,season`.
  It only sends IDs marked deliverable in
  [account unlocks](../runtime/research/account-unlocks.md) (generated by
  `runtime/research/list-account-unlocks.py`): 346 titles, 480 specials (14
  not deliverable: the repeatable purchases), 293 season rewards.

## Build (2026-10-08)

| Item | Value |
| --- | --- |
| Profile DLL | SHA-256 `95b99ad8ea600db3add26552d4644a025613204af96b200aed043a24b69de6f0`, built with `-Mode Profile180836` |
| Installed | Yes, 2026-10-08 00:31:06, by a waiting copy as soon as the owner closed the game (store client offline); replaces `68fd60bc...d5a7` |
| Checks run | Profile, technology and recipe fixtures pass. No fixture covers the account request |

## First live requests (2026-10-08, account; slot 3 loaded)

| Item | Value |
| --- | --- |
| Game | Build 180836, executable `13d5060d...`, process 25932, store client offline |
| Profile DLL | `95b99ad8ea600db3add26552d4644a025613204af96b200aed043a24b69de6f0` |
| Slot loaded | 3, identified by content (205 technologies, 1,906 products) |
| Account before | Titles 86, unlocked specials 459, season 0, platform 1 (read from memory) |
| Backup | Save folder and settings file copied to the external `save-backups/20261008-before-account-unlock` |
| Preflight | Passed, `dispatch_state=0` |

| Request | Result file | Account sets read back |
| --- | --- | --- |
| `-Title T_ABYSS` | `unlocked`, titles 86 -> 87 | `T_ABYSS` in titles |
| `-Special BANNER_AF` (already known in the slot) | `unlocked`, specials 459 -> 460 | `BANNER_AF` in specials |
| `-Season EXPD_POSTER23A` | `unlocked`, season 0 -> 1 | In season (and in specials since the slot-side test) |
| `-AllOfKind title,special,season` (1,105 IDs) | Titles 87 -> 346 (259 `unlocked`, 87 `no_change`); specials 460 -> 782 (all 466 reported `unlocked`); season 1 -> 293 (293 `unlocked`) | Titles 346 of 346; season 293 of 293; of the 336 purchasable specials only the 14 repeatable ones are absent; all 263 customisation IDs present |

The game kept running after every request. One attempt before the last
request failed in the script's argument check (a comma list passed through
`-File` arrives as one string) and sent nothing; call the script through
`-Command` when giving several kinds.

Noted: the specials routine reports 1 for an ID that was already present
(466 reported, 322 actually added), so `unlocked` for a special means
"present now", not "added by this request". The title routine reports
`no_change` for a title already unlocked.

Not proven: what the title picker, the customiser and the Quicksilver shop
show (awaiting the owner); that the game writes this state to the account
files; what happens when the store client goes online again; whether season
rewards unlocked on the account can be claimed in the shop. The slot-side
redemption of the remaining season rewards was deliberately not sent:
redeeming a ship, multitool or companion in the slot records a claim without
handing over the item.

Undo: with the game closed and the store client offline, copy the save
folder and settings file back from `20261008-before-account-unlock`. Putting
the store client online is also expected to bring back the remote account.

### Saved state after the requests (read from disk, game closed)

The owner saved and closed the game. Both account files, written by the
game at 00:38, hold the result: `UnlockedTitles` 346, `UnlockedSpecials`
782, `UnlockedSeasonRewards` 293 in the settings file and the same counts in
`accountdata.hg`. `UnlockedTwitchRewards` is 0 and `UnlockedPlatformRewards`
is 1 (`TGA_SHIP1`, in the settings file only). So the game persists what
its account routines inserted.

The owner's editor then showed every Twitch reward as not unlocked on the
account and asked why they were not all unlocked. They were never
requested: the account request has no Twitch or platform kind because the
game has no single-entry routine for them. That is the open part below.

## Twitch and platform rewards: what the code does (offline, 2026-10-08)

Slot side, read from the redeem routine `5ab380` on build 180836:

| Kind | How the ID is recognised | Slot set written | Account |
| --- | --- | --- | --- |
| Twitch | In the map at manager `+0x920`, or found by a product-side lookup (`eca510`, then the entry's field at `+0x20`) | Player state `+0xa8b00`, by helper `5ab7a0` | Not touched |
| Platform | In the map at manager `+0x960`, or found by `eca600` (field at `+0x10`) | Player state `+0xa8b40`, by helper `5ab840` | Not touched |

So "redeemed in save" for a Twitch or platform reward is reachable through
the existing `redeem` event (`signal-reward-180836.ps1 -AllOfKind twitch`).
It has not been run for these kinds. The editor already shows some Twitch
rewards as redeemed in the save; those are the customisation ones whose
specials were recorded on 2026-10-07.

Account side, read from the bulk routine of build 180383 (`342ec0`, blocks
at `345580` and `3456c2`; not yet relocated to 180836):

- The Twitch set is at account `+0x200` and the platform set at `+0x240`,
  as assumed.
- When settings are applied the routine empties the set, then looks at a
  byte at account `+0x2b1`. If it is zero the loaded list is **copied as it
  is into a plain list** (Twitch at account `+0x290`, platform at `+0x2a0`)
  and the set stays empty. If it is non-zero each loaded ID is inserted into
  the set only when the map of that kind contains it.
- This explains the earlier puzzle of an empty Twitch set beside a settings
  file with 435 entries: the IDs were being held in the plain list, or were
  filtered out by the map. Which of the two, and what sets the byte at
  `+0x2b1`, was not determined; the earlier read of `+0x290` assumed a
  different layout and has to be repeated.

What "unlock every Twitch reward" would take:

1. Read, in the running game: the byte at account `+0x2b1`, the two plain
   lists, and how many entries the Twitch map at manager `+0x920` holds.
2. Slot side: one Twitch reward through the `redeem` event, then all, for
   the rewards where redeemed is the whole reward (decorations, appearance).
   A ship, multitool, companion egg, firework or upgrade pack is an item:
   marking it redeemed hands over nothing.
3. Account side: no game routine adds one entry. The only way inside the
   running game is the game's container insert on the set, or an append to
   the plain list, with the changed flag; that is a direct write through a
   native helper, to be labelled so and decided by the owner.

### Owner decision and second build (2026-10-08)

The owner approved unlocking Twitch rewards both in the loaded slot and on
the account, on the condition that it is done in the running game and never
with a save editor. For the slot, only the rewards where redeemed is the
whole reward (decorations, appearance); ships, multitools, companion eggs,
fireworks and upgrade packs are left out of the slot-side request.

Account side as built, in `account_unlock.h`, kinds `twitch` and `platform`:

1. The ID must be in the game's own map of that kind (manager `+0x920` or
   `+0x960`), found with the game's lookup (`567610`) exactly as the redeem
   routine tests it.
2. The game's container routine (`3df740`, the one every account routine
   uses) finds or makes the slot in the account's set (`+0x200` or `+0x240`).
3. When the routine reports a new slot the profile stores the 16-byte ID in
   it, as the season routine does; then it sets the changed flag (`+0x2b0`)
   and increments the same counter byte the season routine increments.

**This is a direct write through native helpers, not a call of a game
unlock routine**; results are `inserted`, `present`, `unknown_id` or
`insert_failed`. The result file also reports the byte at account `+0x2b1`
and the sizes of the two plain lists, to settle which representation the
game is using.

| Item | Value |
| --- | --- |
| Profile DLL | SHA-256 `09a816dea38851f9bb57604d01fcffdd7107119ddde049671b69ac0a588c6813` |
| Checks | Profile, technology and recipe fixtures pass; none covers the account request |
| Table | [account unlocks](../runtime/research/account-unlocks.md) now lists 435 Twitch and 3 platform rewards as well |
| Installed | Yes, 2026-10-08 about 01:02, with the game closed; replaces `95b99ad8...e6f0` |

Unknown until tried: whether the map holds the Twitch IDs at all while the
store client is offline; whether the game keeps a directly inserted entry
when it next applies settings; whether an unlocked Twitch reward becomes
claimable in the shop.

### Twitch and platform requests run live (2026-10-08, slot 3 loaded)

| Item | Value |
| --- | --- |
| Game | Build 180836, executable `13d5060d...`, process 27024, store client offline |
| Profile DLL | `09a816dea38851f9bb57604d01fcffdd7107119ddde049671b69ac0a588c6813` |
| Slot loaded | 3, identified by content |
| Account before | Titles 346, specials 782, season 293, Twitch 0, platform 1 |
| Backup | Save folder and settings file copied to the external `save-backups/20261008-before-twitch` |
| Preflight | Passed |

| Request | Scope | Result |
| --- | --- | --- |
| `signal-account-180836.ps1 -Twitch TWITCH_406` | Account, direct write | `inserted`; Twitch set 0 -> 1. The result file reported `lists_ready_flag=1` and both plain lists empty, so the sets are the live representation in this session, and the Twitch map does hold the IDs with the store client offline |
| `signal-reward-180836.ps1 -Id TWITCH_406` | Slot, game routine | `changed` |
| `signal-account-180836.ps1 -AllOfKind twitch,platform` (438) | Account, direct write | Twitch 1 -> 435 (434 `inserted`, 1 `present`); platform 1 -> 3 (`SW_PREORDER`, `SW_PREORDER2` `inserted`, `TGA_SHIP1` `present`) |
| `signal-reward-180836.ps1 -Id <234 IDs>` | Slot, game routine | 173 `changed`, 61 `no_change` (already redeemed) |

The 234 slot-side IDs are the Twitch rewards whose product is a build part,
a customisation part or an emote, without the 66 firework packs. Left out
of the slot on purpose: those 66 and the 135 rewards whose product is of
type Curiosity (ships, multitools, companion eggs, upgrade packs), because
redeeming them in the slot would record a claim without handing over the
item. They are unlocked on the account only.

The game kept running after every request. Read back from memory: all 435
Twitch IDs and all 3 platform IDs are in the account sets.

Seen by the owner in the same session (screenshot): the game itself raised
its notification "Collect the reward! Twitch rewards available - find the
rewards obtained at the Quicksilver Synthesis Companion". So the game reads
the inserted Twitch set as real unlocks and offers them for claiming.

A second screenshot, same session and before any restart: the Quicksilver
Synthesis Companion's "Collect Twitch rewards" page lists the item-type
rewards as "Available" (multitools such as Memories of the Ancients and the
Improvised Ion Generator, companion eggs, and the Atlas firework pack as
"obtained 0 of 15"). These are exactly the rewards left out of the slot-side
request, so leaving them unredeemed in the slot keeps them claimable through
the game's own shop. The claim itself was not tried.

A third screenshot, same session: the companion's "Collect special rewards"
page lists the platform rewards. Horizon Vector NX (`SW_PREORDER`, exclusive
ship) and Infinite Neon Mark XXII (`SW_PREORDER2`, exclusive multitool) are
"Available"; Starborn Phoenix (`TGA_SHIP1`) shows "Already owned", which
matches its redeemed state in slot 3. So the PC build accepts the two
Switch pre-order rewards once they are in the account's platform set, which
answers the question left open on 2026-10-07. Claiming them was not tried.

Not proven: that the game writes these two sets to the account files when it
saves; that it keeps them when it next applies settings or when the store
client is online again (the remote copy has none of them); that an unlocked
Twitch or platform reward can be claimed in the Quicksilver shop; what the
owner's editor shows afterwards.

Undo: with the game closed and the store client offline, copy the save
folder and the settings file back from `20261008-before-twitch`.

### Saved state after the Twitch and platform requests (read from disk, game closed, 01:14)

The owner saved, closed the game, reported that it "apparently worked" and
asked for a comparison. No `NMS.exe` process; files read only.

| List | Settings file (01:13) | `accountdata.hg` (01:13) |
| --- | --- | --- |
| Unlocked titles | 346 | 346 |
| Unlocked specials | 782 | 782 |
| Unlocked season rewards | 293 | 293 |
| Unlocked Twitch rewards | 435 | 435 |
| Unlocked platform rewards | 3 (`SW_PREORDER`, `SW_PREORDER2`, `TGA_SHIP1`) | No non-empty list found for it |
| Seen substances / technologies / products | 34 / 153 / 1,956 | 34 / 153 / 1,956 |

So the game wrote the directly inserted Twitch and platform sets to its own
files, like the sets filled through its routines. The platform list is in
the settings file only; whether `accountdata.hg` carries platform rewards at
all is not known.

Slot 3, both files (01:13 and 01:14): known technologies 205, known products
1,906, known recipes 1,684, known specials 278, redeemed season 124,
redeemed Twitch 235, **redeemed platform 3** (1 before the session), fishing
record 220. This project sent no platform redemption to the slot, so the two
new platform entries come from the owner claiming the Switch ship and
multitool in the shop; to be confirmed with the owner, along with what the
ship claim did to the active ship.

Still not proven: the lists after a restart, and after the store client
goes online again.

### Entitlement rewards still not unlocked on the account (owner's editor, 2026-10-08)

After the session the owner's editor lists six "platform" rewards. Unlocked
on the account and redeemed in the save: `TGA_SHIP1`, `SW_PREORDER`,
`SW_PREORDER2`, `ENT_XO_HELMET`. Redeemed in the save but **not unlocked on
the account: `ENT_BOLTCASTER` (Boltcaster SM) and `ENT_PHOCORE` (Photonix
Core).** The owner confirmed by this that the two Switch rewards were claimed
in the shop.

What is known about the two missing ones:

- They are entitlement entries whose reward is a technology (`BOLT_SM`,
  `PHOTONIX_CORE`); both technologies are known in slot 3 and both are in the
  account's seen technologies, in the current settings file and in the full
  backup of 2026-10-07. So "unlocked on account" in the editor is neither of
  those lists.
- No `ENT_*` value appears anywhere in the settings file, now or in the full
  backup. `ENT_XO_HELMET` reads as unlocked presumably because its reward is
  the special `SPEC_XOHELMET`, which is in the account's specials.
- Which account field the editor sets for an entitlement technology is not
  known. The owner will enable the two in the editor; comparing
  `accountdata.hg` before (backup `20261008-offline-final-state`) and after
  will show the field. Then find the game routine that writes it.

To deliver later through the game: `ENT_BOLTCASTER` and `ENT_PHOCORE` on the
account.

### Back online: what the remote copy did, and Twitch sent again (2026-10-08, about 01:18 to 01:25)

The owner put the store client online, started the game on slot 3 and
reported that the Twitch option had disappeared from the Quicksilver
companion. Process 23800, DLL `09a816de...6813`, executable `13d5060d...`,
slot 3 identified.

Read-only first:

| List | Offline result (saved 01:13) | In memory online | Files rewritten by the game at 01:18 |
| --- | --- | --- | --- |
| Titles | 346 | 346 | 346 |
| Unlocked specials | 782 | 796 | 796 |
| Season rewards | 293 | 293 | 293 |
| Platform rewards | 3 | 3 (`SW_PREORDER`, `SW_PREORDER2`, `TGA_SHIP1`) | 3 |
| Twitch rewards | 435 | **0** | **435 in the settings file** |
| Seen substances / technologies / products | 34 / 153 / 1,956 | not read | 105 / 318 / 4,416 |

Findings:

- **The remote and the local account were merged, not replaced**: specials
  became 796 (more than either side had), the seen lists returned to their
  full sizes, and the two Switch platform rewards inserted offline survived.
- **Twitch is the exception**: the settings file lists all 435, but the set
  in memory is empty, exactly the state seen on 2026-10-07. The result file
  of the next request showed `lists_ready_flag=1` and empty plain lists, and
  the Twitch map accepted the IDs, so neither the plain-list path nor a
  missing table explains it. Something empties the Twitch set after load
  when online; the two unexamined users of these sets (`8880a0`, `888ec0` on
  build 180383) are the candidates, read as a refresh from the Twitch
  service.

Then, after a backup (`save-backups/20261008-online-before-twitch-resend`)
and a passed preflight:

| Request | Result |
| --- | --- |
| `signal-account-180836.ps1 -Twitch TWITCH_406` | `inserted`, Twitch 0 -> 1 |
| `signal-account-180836.ps1 -AllOfKind twitch` (435) | Twitch 1 -> 435 (434 `inserted`, 1 `present`) |

The set was read four times over the following minute and stayed at 435.
The owner confirmed that "Collect Twitch rewards" is back in the companion's
menu. Game kept running.

Not proven, and the expected weak point: **persistence across a restart
while online.** The settings file already held all 435 at the last start and
the game still came up with an empty set, so a saved list does not survive
by itself; the insert may have to be repeated in each session until the
routine that empties the set is understood. Claiming the rewards while they
are listed records them in the slot, which does persist.

### Next session: keep the Twitch rewards across online starts (owner request, 2026-10-08)

The owner asked for a way to keep the Twitch rewards available permanently,
since the game empties the set at every online start, and left it for the
next session. Nothing was started. Bounded plan:

1. Offline, build 180836: list every code reference to the Twitch set
   (account `+0x200`, that is `manager + 0x315948`) and to the changed
   flag, starting from the relocated counterparts of `342ec0`, `8880a0` and
   `888ec0` of build 180383. Identify the one that empties or replaces the
   set after load and what data it uses (a reply from the Twitch service, or
   the local list).
2. Choose the smallest intervention, in this order of preference: have the
   profile repeat the insert once after that routine has run in each
   session (no change to game code); only if that is not enough, hook the
   routine. Either is a research-profile behaviour pinned to this build.
3. Test: online start, read the set, apply, restart, read again.

Reminder of what already persists without any of this: a reward claimed in
the shop is recorded in the slot.

### Why the Twitch set does not survive an online start, and the keep list (2026-10-08, morning)

Offline reading of build 180836; the game was closed.

**What empties it.** Only one place in the executable writes the Twitch set
by absolute address: the block at `3455e0` inside the very large routine
that starts near `342f00`. The strings that routine uses identify it: `jwt`,
`routes`, `websocket`, `settings`, `seasonData`, `currentSeason`,
`cloudSaveStatus`, `rewards`, `twitch`, `switchpreorder`, `hgid`,
`platforms`, `myAlliances`. It parses the reply of the publisher's service
at sign-in. Inside its `rewards` object it reads two lists, `twitch` and
`switchpreorder`; then it empties the account's Twitch set and refills it
from the `twitch` list (through the plain list or the map filter, depending
on the byte at account `+0x2b1`), and does the same for the platform set
with `switchpreorder`.

So the "bulk routine" of the earlier notes is not "apply loaded settings":
it is the sign-in reply handler, and **the Twitch rewards an account holds
are whatever the service lists at each sign-in**. The 435 IDs in the local
settings file are not what the set is built from. This corrects the reading
in [known lists triage](KNOWN_LISTS_TRIAGE.md). The other two references to
the set (`5b6f1e`, `88a68e`) only test membership.

Not explained: on 2026-10-08 the platform set kept its three entries
through an online start although the same handler has a block that empties
it. Either the reply carried no usable `rewards` object and the Twitch set
was empty for another reason (never restored from the settings file), or the
platform block is skipped under a condition not read yet. The keep list
below covers both kinds either way.

**Chosen intervention: a keep list, no change to game code.** Preferred over
hooking the handler because it leaves the game's sign-in path untouched.

- A persistent file, `native-account-keep-180836.txt` in the diagnostics
  folder, holds `twitch=<ID>` and `platform=<ID>` lines (at most 1,024). It
  is shared by every game process.
- When the profile starts and the list is not empty it enables its hooks at
  once (before this, hooks were enabled only at the first request).
- On the game's update thread, every five seconds, once the account is
  loaded (its title set is not empty): for each kept kind, if the account's
  set holds fewer entries than the list, the profile repeats the direct
  insert of 2026-10-08 for that kind. A full set costs one count per check.
- A status file per process, `native-account-keep-status-180836-<PID>.txt`,
  reports the kept counts, how many times an insert pass was needed and what
  the last pass inserted or could not find.
- New event `keep` makes a running game load the list again. Script
  `runtime/native/asi/signal/signal-account-keep-180836.ps1` writes the list
  (`-AllOfKind twitch,platform` or `-Clear`) and can signal a running game.
- Limits: the profile's request window lasts 30 minutes per process, after
  which its hooks are disabled and the keeper stops; an insert done before
  that stays for the session. It remains a direct write through native
  helpers, repeated. Remove it with `-Clear`.

| Item | Value |
| --- | --- |
| Profile DLL | SHA-256 `6ad12b1caa2bfa94f6b4ca1bdcce0628b8d1b383cd03afa5e4056fe8324027fc` |
| Checks | Profile, technology and recipe fixtures pass (run without a keep list); none covers the keeper |
| Installed | Yes, 2026-10-08 morning, game closed; replaces `09a816de...6813` |
| Keep list | Written: 435 Twitch and 3 platform IDs |

Not proven: everything live. Test: start online on slot 3 without sending
anything, wait, read the Twitch set and the status file, check the shop.

### Boundary: no change to the publisher's records (2026-10-08)

The owner asked whether the Twitch rewards could be made permanent on the
publisher's side, so that they stay without the bridge. Not pursued, and not
to be built: the Twitch list is whatever the publisher's service returns at
sign-in, so making it permanent there would mean altering or forging what
that service holds for the account. The project changes only the local
running game. What already persists without the bridge:

- anything claimed in the Quicksilver shop: the claim and the item are in
  the save slot;
- the account's titles, specials, season rewards and platform rewards: after
  going online on 2026-10-08 they were kept and merged with the remote
  copy;
- everything delivered to the slot (technologies, products, recipes,
  customisation, fishing record).

Only the "available to claim" state of unclaimed Twitch rewards depends on
the keep list.

Clarified the same morning: the owner meant having the game itself report
the local state so that the service updates its own records, without
touching the servers. Same boundary: the project does not make the client
send the service claims about rewards it did not grant. What the game
uploads by itself as part of its normal account synchronisation (the lists
it wrote after the local changes) is the game's own behaviour and was only
observed. As read so far, the Twitch list travels one way, from the service
to the game in the sign-in reply; no client report of Twitch rewards was
found, and none was looked for further.

### Owner decisions for the product (2026-10-08): keep list with a warning, and a claim feature

1. **The keep list is the persistence mechanism**, and the interface must
   tell the user plainly: Twitch rewards stay available to claim only while
   the bridge is installed; removing it makes the unclaimed ones disappear
   at the next sign-in; claim what you want to keep. This text is
   user-facing and has to exist in all 14 interface languages when the
   interface is built.
2. **A claim feature**: deliver the item of a Twitch reward directly, so the
   player owns it and no longer depends on the keep list. Everything happens
   in the local running game.

What a claim is, read from the tables of build 180836 (nothing sent): the
Twitch table maps each reward to a product, and for item rewards the
product's `GiveRewardOnSpecialPurchase` names a shipped reward, which is
what the shop gives when the player claims.

| Twitch rewards | Product type | Shipped reward on claim | Count |
| --- | --- | --- | --- |
| Decorations | BuildingPart | none: known product and special are the whole reward | 147 |
| Appearance | CustomisationPart | none | 61 |
| Emotes | Emote | none | 13 |
| Appearance with a technology | CustomisationPart | `GcRewardSpecificTech` (for example `R_S14_MECH_ARMR`, `RS_S7_TRAIL`) | 14 |
| Firework packs | BuildingPart | `GcRewardMultiSpecificProducts` (for example `RS_S1_FIREWORKS`) | 65 |
| Ships | Curiosity | `GcRewardSpecificShip` (`R_TWIT_SHIP<n>`) | 65 |
| Multitools | Curiosity | `GcRewardSpecificWeapon` (`R_TWIT_GUN<n>`) | 33 |
| Companion eggs | Curiosity | `GcRewardSpecificPetEgg` (`R_TWIT_PET<n>`) | 32 |
| Multitool upgrade packs | Curiosity | `GcRewardMultiSpecificItems` (`R_TWIT_GUNUP<n>`) | 5 |

Consequences and open points:

- A claim is "give the shipped reward, then record the redemption in the
  slot". The profile already has both pieces: the shipped-reward dispatch
  (today limited to reward IDs compiled into the DLL) and the slot-side
  redeem. The claim feature needs the Twitch reward IDs added to what the
  dispatch accepts, generated from the tables.
- **Correction to the slot-side request of 2026-10-08:** the 14 "appearance
  with a technology" rewards were in the 234 redeemed in slot 3 as if
  redeemed were the whole reward. Their technology was not given by that
  request. Check whether slot 3 knows those technologies (the technology
  delivery of 2026-10-07 may cover them) and give the missing ones.
- Ships and multitools cannot all be owned at once: the game limits the
  fleet and the multitool slots, and there are 65 ships and 33 multitools.
  The feature has to let the user choose, not "claim all", for those two.
  What a ship reward does when the fleet is full, and whether it replaces
  the active ship, is not known; the owner's claim of the Switch ship in
  the shop on 2026-10-08 is the first evidence to collect.
- Firework packs, eggs and upgrade packs are inventory items: they need
  free slots.

## Plan that was followed

1. Close the game with the store client still offline; install the DLL;
   start on slot 3; identify the slot; read the account sets; back up the
   save folder and the settings file; preflight.
2. One title the account lacks (`-Title`), then one special the slot already
   knows (`-Special BANNER_AF`), then one season reward (`-Season`); read the
   account sets after each.
3. `-AllOfKind title,special,season`.
4. With the owner: check the title picker, the customiser and the Quicksilver
   shop; save; then decide when to put the store client online and read what
   the account holds afterwards.

Not known: whether unlocking a season reward on the account makes ships,
multitools and companions claimable in the shop as the reference service
describes; whether the game accepts titles whose conditions the slot does
not meet when it next evaluates them; what the remote copy does to an
account changed offline.
