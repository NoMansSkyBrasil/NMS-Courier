# Account unlock notes

Checkpoint: 2026-10-08. Owner of the account domain: unlocking titles,
specials and season (expedition) rewards on the account, which every save
slot shares, through the game's own routines in the running game.

Status in one line: the three routines are located on build 180836 and a
request is built; **the build is not installed and nothing has been
unlocked through it.** Scope of a request: the whole account.

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
cloud or from the publisher's service reached through it, and what happens
to an offline session's account when the client goes online again (it may
be overwritten by the remote copy or merged).

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
| Installed | **No.** The game is running (process 25584); `68fd60bc...d5a7` stays installed until it is closed |
| Checks run | Profile, technology and recipe fixtures pass. No fixture covers the account request |

## First live test (proposed, not done)

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
