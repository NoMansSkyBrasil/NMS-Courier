# Runtime experiment log

## 2026-10-08: keep list holds at a second online start; `HDRIVEBOOST4` taught again

Process 18352, DLL `6ad12b1c...27fc`, executable `13d5060d...`, slot 3
identified, store client online.

- Read-only: keeper inserted 435 Twitch IDs in one pass again; Twitch 435,
  platform 3. See [account unlock notes](ACCOUNT_UNLOCK_NOTES.md).
- The slot's missing technology is `HDRIVEBOOST4` (present in the 01:13
  backup, absent from the 09:16 files). Cause unknown. Backup taken, then
  `signal-technology-180836.ps1 -Id HDRIVEBOOST4`: learned, 204 -> 205. See
  [technology delivery notes](TECHNOLOGY_DELIVERY_NOTES.md). Game kept
  running. Not proven: that it stays after a save and restart.

## 2026-10-08: keep list proven across an online start

Owner: [account unlock notes](ACCOUNT_UNLOCK_NOTES.md#why-the-twitch-set-does-not-survive-an-online-start-and-the-keep-list-2026-10-08-morning).
Process 22564, DLL `6ad12b1c...27fc`, executable `13d5060d...`, slot 3
identified, store client online. No request sent.

- Keeper status: one insert pass, 435 inserted, none unknown. Account in
  memory: Twitch 435, platform 3, titles 346, specials 796, season 293.
- Unexplained side observation: 204 known technologies in the slot instead
  of 205.
- Not proven: the shop on screen, the state after the 30-minute window.

## 2026-10-08: Twitch claim mapped from the tables; owner decisions (offline)

Owner: [account unlock notes](ACCOUNT_UNLOCK_NOTES.md#owner-decisions-for-the-product-2026-10-08-keep-list-with-a-warning-and-a-claim-feature).
Tables of build 180836 only; nothing sent. Of 435 Twitch rewards, 221 are
complete once known and redeemed; 214 give a shipped reward on claim (65
ships, 33 multitools, 32 eggs, 65 firework packs, 5 upgrade packs, 14
technologies attached to an appearance part). Found a gap: those 14 were
redeemed in slot 3 on 2026-10-08 without their technology being given.
Decisions: keep list plus a user warning; build a claim feature.

## 2026-10-08: what empties the Twitch set (offline) and the keep list build

Owner: [account unlock notes](ACCOUNT_UNLOCK_NOTES.md#why-the-twitch-set-does-not-survive-an-online-start-and-the-keep-list-2026-10-08-morning).
Offline, build 180836; game closed, executable `13d5060d...` unchanged.

- The only writer of the Twitch set is inside the handler of the service's
  sign-in reply (strings `jwt`, `seasonData`, `rewards`, `twitch`,
  `switchpreorder`): the set is rebuilt from the reply at each sign-in. The
  earlier name "apply loaded settings" was wrong.
- Built: keep list in the account domain (update-thread re-insert when a
  kept set is short), event `keep`, script
  `signal-account-keep-180836.ps1`. DLL `6ad12b1c...27fc`; fixtures pass
  without a keep list.
- Installed with the game closed; keep list written with 435 Twitch and 3
  platform IDs. Nothing proven live yet.
- Rollback: `signal-account-keep-180836.ps1 -Clear`; previous DLL
  `09a816de...6813` in the external native-builds directory.

## 2026-10-08: online again - accounts merged, Twitch set emptied by the game, Twitch inserted again

Owner: [account unlock notes](ACCOUNT_UNLOCK_NOTES.md#back-online-what-the-remote-copy-did-and-twitch-sent-again-2026-10-08-about-0118-to-0125).
Process 23800, DLL `09a816de...6813`, slot 3, store client online.

- Read-only: titles 346, specials 796, season 293, platform 3 in memory;
  Twitch 0 in memory although the settings file rewritten at 01:18 lists
  435. Remote and local accounts were merged; the Switch platform rewards
  survived.
- The owner saw the Twitch option missing from the Quicksilver companion.
- Backup `20261008-online-before-twitch-resend`; one Twitch ID, then all
  435, inserted on the account (direct write). Set stable at 435 for a
  minute; the owner saw the Twitch option return.
- Not proven: survival of the Twitch set across an online restart (the
  evidence is against it); the routine that empties it.

## 2026-10-08: two entitlement technologies not unlocked on the account (owner's report)

The owner's editor shows `ENT_BOLTCASTER` and `ENT_PHOCORE` redeemed in the
save but not unlocked on the account; the other four platform entries are
both. Read-only check: `BOLT_SM` and `PHOTONIX_CORE` are in the account's
seen technologies and no `ENT_*` value exists in the settings file, so the
field the editor means is unknown. The owner will enable them in the editor;
a diff of `accountdata.hg` against `20261008-offline-final-state` is the next
step. Added to the list of things to deliver through the game.

## 2026-10-08: saved files after the Twitch and platform requests (read-only)

Owner: [account unlock notes](ACCOUNT_UNLOCK_NOTES.md#saved-state-after-the-twitch-and-platform-requests-read-from-disk-game-closed-0114).
Game closed. Settings file: titles 346, specials 782, season 293, Twitch
435, platform 3. `accountdata.hg`: the same except no platform list. Slot 3
files: specials 278, season 124, Twitch 235, platform 3 (the two new ones
not sent by this project; presumably claimed by the owner in the shop),
technologies 205, products 1,906, recipes 1,684, fish 220. The game persists
the directly inserted sets. Open: restart, going online.

## 2026-10-08: Twitch and platform rewards on the account (direct write) and Twitch decorations in slot 3

Owner: [account unlock notes](ACCOUNT_UNLOCK_NOTES.md#twitch-and-platform-requests-run-live-2026-10-08-slot-3-loaded).
Process 27024, DLL `09a816de...6813`, executable `13d5060d...`, slot 3
identified, store client offline, backup `save-backups/20261008-before-twitch`,
preflight passed.

- One Twitch ID first on the account (`inserted`, flag `+0x2b1` is 1, plain
  lists empty) and in the slot (`changed`).
- Account, direct write: Twitch 1 -> 435, platform 1 -> 3.
- Slot, game routine: 234 Twitch rewards (build parts, customisation,
  emotes; no fireworks): 173 changed, 61 already redeemed. 201 item-type
  rewards deliberately not redeemed in the slot.
- Game kept running. Afterwards the owner saw the game's own notification
  that Twitch rewards are available at the Quicksilver companion.
- The owner then opened the Quicksilver companion: the Twitch page lists
  the item-type rewards as available, and the special rewards page lists
  the two Switch pre-order rewards as available and `TGA_SHIP1` as owned.
- Not proven: saved files, survival of the two sets at the next start or
  online, the claim itself.

## 2026-10-08: Twitch and platform account kinds built (direct write); owner decision

Owner: [account unlock notes](ACCOUNT_UNLOCK_NOTES.md#owner-decision-and-second-build-2026-10-08).
Offline. The owner approved Twitch in the slot and on the account, in the
running game only. Profile DLL `09a816de...6813` adds kinds `twitch` and
`platform` to the account request as a direct insert with the game's lookup
and container routines; fixtures pass. Installed with the game closed
(replaces `95b99ad8...e6f0`). No request sent.

## 2026-10-08: account unlocks persisted; Twitch and platform lists read in the code (offline)

Owner: [account unlock notes](ACCOUNT_UNLOCK_NOTES.md#twitch-and-platform-rewards-what-the-code-does-offline-2026-10-08).
Game closed; files and executables read only.

- Both account files of 00:38 hold titles 346, specials 782, season 293:
  the account requests of the night were saved by the game. Twitch 0,
  platform 1.
- The owner's editor shows no Twitch reward unlocked on the account. None
  was requested: no routine exists for it.
- Slot-side Twitch and platform sets identified (player state `+0xa8b00`,
  `+0xa8b40`), reachable through the existing `redeem` event; not run.
- Account-side: the bulk routine either keeps the loaded Twitch and platform
  lists as plain lists (account `+0x290`, `+0x2a0`) or filters them into the
  sets, depending on a byte at account `+0x2b1`. Explains the empty Twitch
  set seen on 2026-10-07; the plain lists must be read again.

## 2026-10-08: pre-order, platform and entitlement rewards mapped (offline)

Owner: [reward redemption notes](REWARD_REDEMPTION_NOTES.md#pre-order-platform-and-entitlement-rewards-what-they-are-offline-2026-10-08).
Tables of build 180836 only. Three platform rewards map to products (one
names the shipped reward `R_TGA_SHIP01`); twelve entitlement entries carry
inline rewards (two pre-order ships, two technologies already taught,
products, money, weapons, a special). No request sent; nothing installed can
deliver them. Open: how a ship reward treats owned ships, whether the
dispatch reaches `ENT_*` entries, the Switch products' route.

## 2026-10-08: titles, specials and season rewards unlocked on the account through the game's routines

Owner: [account unlock notes](ACCOUNT_UNLOCK_NOTES.md#first-live-requests-2026-10-08-account-slot-3-loaded).
Process 25932, DLL `95b99ad8...e6f0` (installed 00:31:06 with the game
closed), executable `13d5060d...`, slot 3 identified, store client offline,
backup `save-backups/20261008-before-account-unlock`, preflight passed.

- Single IDs first: one title, one special the slot already knew, one season
  reward; each appeared in its account set.
- All 1,105 deliverable IDs: titles 87 -> 346, specials 460 -> 782, season
  1 -> 293. Only the 14 repeatable specials remain absent, as intended.
- Game kept running. One earlier invocation failed in argument validation
  and sent nothing.
- Not proven: the game's interface, the saved account files, the remote
  copy, claiming season rewards in the shop.

## 2026-10-08: account opens mostly empty with the store client offline; two slot-side tests; account request built

Owner: [account unlock notes](ACCOUNT_UNLOCK_NOTES.md). Process 25584, slot
3 identified, DLL `68fd60bc...d5a7`, executable `13d5060d...`. The owner
saw the game try to reconnect to the publisher's servers.

- Read-only at start: titles 86, unlocked specials 458, season 0, platform
  1. Both account files rewritten at 00:22 in that state (44,679 and 221,988
  bytes). With the store client offline the remote copy was not applied.
- Backup `save-backups/20261008-offline-empty-account-start`.
- `signal-customisation-180836.ps1 -Id BANNER_AF`: `no_change`; account
  unchanged (the slot already knew it).
- `signal-reward-180836.ps1 -Id EXPD_POSTER23A`: `changed`; slot redeemed
  season 122 -> 123; account specials 458 -> 459; account season still 0.
- Offline: title, special and season account routines located on 180836
  (`60ab50`, `60ad70`, `60ae70`); request built into profile DLL
  `95b99ad8...e6f0`, **not installed** (game running). Fixtures pass.
- Not proven: anything about the account request live.

## 2026-10-08: account files emptied again for an offline start (direct file change, owner-authorised test preparation)

The owner put the store client in offline mode and asked for the files to be
emptied again. Game closed (no `NMS.exe` process). Not a delivery.

- Backup to the external `save-backups/20261008-before-offline-reset`: the
  full settings file (547,511 bytes, SHA-256 `a658d403...ae72`) and the whole
  save folder with the game's 00:13 `accountdata.hg` (114,431 bytes).
- Settings file: the same ten lists emptied as at 00:10; result 60,398
  bytes, SHA-256 `523611902a15...5a62`, identical to the earlier reset.
- `accountdata.hg` and `mf_accountdata.hg`: replaced by the copies the
  owner's editor had written at 00:02 (44,435 and 432 bytes, SHA-256 of the
  data file `410e3d7f...`), taken from
  `save-backups/20261008-before-settings-list-reset`. This project did not
  compose an account data file itself.
- Caveat recorded before the start: only the store client is offline; the
  machine still reaches the internet (a ping to the store's host answered).
  If the lists come back anyway, the source is the publisher's service
  rather than the store client's cloud.
- Undo: with the game closed, copy the settings file and the two account
  files back from `20261008-before-offline-reset`.

## 2026-10-08: with both account files emptied, the game still starts with the full account

Read-only. Before the start both local files were empty of unlocks: the
editor's `accountdata.hg` (00:02, 44,435 bytes) and the reset settings file
(00:10, 60,398 bytes). The owner started the game on slot 3: process 21972,
DLL `68fd60bc...d5a7`, executable `13d5060d...`, slot identified as 3.

- Account sets in memory: titles 346, unlocked specials 794, season 293,
  platform 1; Twitch set at `+0x200` empty as before. All 263 customisation
  IDs present. Identical to the state before any cleanup.
- At 00:13 the game rewrote both files to their exact earlier sizes
  (`accountdata.hg` 114,431 bytes; settings file 547,511 bytes, lists full
  again including 435 Twitch rewards).
- **Conclusion: the account's unlock lists do not come from either local
  file alone. They are restored from outside the machine at start**, either
  by the publisher's account data service (the executable has
  `getaccountdata`, `uploadaccountdata`, `CheckAccountDataSyncState`) or by
  the store client's cloud copy of `accountdata.hg`; which of the two was not
  determined. The earlier reading "the game loads from the settings file" is
  withdrawn: the settings file is an output here, not the source.
- Consequences: unlocks written to the account by a game routine are kept
  off the machine and come back; an account cannot be emptied for a test by
  editing local files while online; the unlocks an editor wrote earlier are
  now part of the synchronised account.
- No request was sent. The settings file reset of 00:10 has no remaining
  effect; nothing needs to be undone.
- Ways to test an account route on a lacking account (proposed, none done):
  start with the network disconnected and both files emptied; use another
  account; or test only what this account lacks (`SW_PREORDER`,
  `SW_PREORDER2`, the Twitch list).

## 2026-10-08: settings file unlock lists emptied as test preparation (direct file change, owner-authorised)

**This is a direct edit of an account file, not a delivery and not a game
routine.** The owner authorised it, with a backup, so that account-level
routes can be tested on an account without unlocks. It is the only such
edit made by this project and it is not a delivery method.

- Game closed (no `NMS.exe` process); executable `13d5060d...` unchanged.
- Backup first, to the external
  `save-backups/20261008-before-settings-list-reset`: the settings file
  (547,511 bytes, SHA-256 `a658d403a4e6df85f4607a392ce3259db2d1b6cfb3f411bf5d3432aaa0aeae72`)
  and the whole save folder (which holds the editor's emptied
  `accountdata.hg` of 00:02).
- Change to `Binaries/SETTINGS/GCUSERSETTINGSDATA.MXML`: ten list blocks
  replaced by empty elements, everything else byte-identical (checked by line
  accounting; the result parses). Entries removed: `SeenSubstances` 105,
  `SeenTechnologies` 318, `SeenProducts` 4,383, `SeenWikiTopics` 58,
  `UnlockedWikiTopics` 58, `UnlockedTitles` 346, `UnlockedSpecials` 794,
  `UnlockedSeasonRewards` 293, `UnlockedTwitchRewards` 435,
  `UnlockedPlatformRewards` 1. New file: 60,398 bytes, SHA-256
  `523611902a15b2a7295d46cde36244d060ba98c54634664c01ef4f7d08675a62`.
- Done with a one-off script kept outside the repository on purpose.
- Not known yet: what the game loads at the next start (the publisher's
  servers may restore the lists), and how the game treats slots whose own
  lists still hold what the account now lacks.
- Undo: with the game closed, copy the backed-up settings file back; for the
  account data file use `save-backups/20261007-before-account-cleanup`.

## 2026-10-08: game files repaired by the owner through the store client; installation unchanged (read-only)

The owner ran the store client's file repair with the game closed. Checked
afterwards:

- Executable: SHA-256 `13d5060d4efb9d2a6a6b1b349bc4257231056cc2a055df4bb15d816262cc3499`,
  unchanged (build 180836, file date 2026-10-05).
- Bridge `xinput9_1_0.dll`: `68fd60bc...d5a7`, still installed.
- `GAMEDATA/MODS`: both research mod folders still present.
- `Binaries/SETTINGS/GCUSERSETTINGSDATA.MXML`: untouched (2026-10-07 23:56,
  547,511 bytes) and still full (titles 346, specials 794, season 293,
  Twitch 435, platform 1). `accountdata.hg` is still the editor's emptied
  copy of 00:02.

So the repair neither removed the bridge nor reset the account lists; the
account will still be refilled from the settings file at the next start.

## 2026-10-08: second account cleanup checked on disk before starting the game (read-only)

The owner locked everything again in the editor and closed the game (no
`NMS.exe` process). Files on disk:

| File | Written | State |
| --- | --- | --- |
| `accountdata.hg` | 00:02, 44,435 bytes, stored by the editor as plain JSON | Emptied by the editor |
| `GCUSERSETTINGSDATA.MXML` | 2026-10-07 23:56, 547,511 bytes | **Unchanged and full**: titles 346, specials 794, season 293, Twitch 435, platform 1, seen products 4,383, seen technologies 318, seen substances 105, wiki topics 58 |

Same situation as the first attempt, so the same outcome is expected at the
next start (the game refills the account from the settings file). Also
noted: the settings file lists 435 Twitch rewards while the set read at
account `+0x200` is empty in memory, the open question of the triage notes.
Nothing was changed by this project.

## 2026-10-07: the account cleanup did not hold; the game restored the account from the settings file

Read-only. Game restarted by the owner at about 23:56: process 20732, slot 3
identified, DLL `68fd60bc...d5a7`, executable `13d5060d...`.

- Account sets in memory are full again: titles 346, unlocked specials 794,
  season 293, platform 1, Twitch set (unresolved) 0. Identical to the read
  before the cleanup.
- `accountdata.hg` was rewritten by the game at 23:56 and is back to exactly
  114,431 bytes; `GCUSERSETTINGSDATA.MXML` was rewritten at the same minute.
- Reading: on this installation the game loads the account lists from the
  settings file (which the editor did not change) and then writes
  `accountdata.hg` from memory. A server-side restore would look the same and
  is not excluded.
- Consequence: there is still nothing missing on the account to test an
  account route with. No request was sent.
- To get an account that lacks entries, both files have to lack them before
  the game starts. That is test preparation by the owner outside the project's
  delivery rules; this project's tools do not edit either file.

## 2026-10-07: owner will clear account unlocks with a save editor (backup taken)

The owner announced removing unlocks from the account with a third-party
save editor, outside this project's tools, so that account-level routes can
be tested on an account that lacks entries. Before that, the whole save
folder and `GCUSERSETTINGSDATA.MXML` were copied to the external
`save-backups/20261007-before-account-cleanup` (game process 8256 still
running at the time). Nothing was changed by this project. To record when
the owner returns: what was removed, with the game closed or not, and what
the account sets hold in memory after the next start (the account data is
synchronised with the publisher's servers and may come back).

Done by the owner at 23:54 with the game closed (no `NMS.exe` process): the
editor's account pages show every Quicksilver item, expedition reward,
Twitch reward, title, catalogue entry and guide topic locked.
`accountdata.hg` was rewritten (114,431 -> 44,435 bytes).
`GCUSERSETTINGSDATA.MXML` was **not** changed by the editor (still 23:22,
547,511 bytes) and still lists the old unlocks. Which of the two the game
loads from is not known; read the account sets in memory after the next
start before any request.

## 2026-10-07: the redeem routine also changes the account (read-only finding); owner accepts account results

Owner: [reward redemption notes](REWARD_REDEMPTION_NOTES.md#correction-the-slot-side-routine-also-writes-the-account-found-2026-10-07).
Process 8256, slot 3, DLL `68fd60bc...d5a7`; nothing was written in this step.

- Account unlocked specials 741 -> 794 since the 16:50 read; all 263
  customisation IDs present; `accountdata.hg` and the settings file rewritten
  at 23:22. The earlier statement that the request left the account alone
  was wrong.
- The settings file had not been backed up before that request.
- Account against the game tables: titles 346/346, purchasable specials
  336/336, season 293/293, platform 1/3; Twitch set unresolved.
- Owner decision the same evening: account-level results are accepted, by
  game routines only.

## 2026-10-07: all customisation specials recorded in slot 3

Owner: [customisation unlock notes](CUSTOMISATION_UNLOCK_NOTES.md#live-requests-2026-10-07-slot-3).
Process 8256, DLL `68fd60bc...d5a7`, slot 3 re-identified, backup taken.

- The owner confirmed banner emblem 55 open after the single-ID test.
- `signal-customisation-180836.ps1 -All` (263): 262 changed, 1 no change;
  redeemed season set 10 -> 122. Game kept running. Account lists untouched.
- Confirmed: the owner saw every appearance option open; `save5.hg` (23:24)
  holds 274 known specials and 122 redeemed season rewards.
- Titles: only an account list is known; see the notes.
- Rollback: `save-backups/20261007-before-customisation-all`.

## 2026-10-07: known product does not open a customisation option; special route tried

Owner: [customisation unlock notes](CUSTOMISATION_UNLOCK_NOTES.md#live-requests-2026-10-07-slot-3).
Process 8256, DLL `68fd60bc...d5a7`, slot 3.

- Rejected: after `BANNER_NMSA` became a known product, the owner saw banner
  emblem 55 still locked.
- `signal-customisation-180836.ps1 -Id BANNER_NMSA` (profile `redeem` event,
  game routine `5ab380`): `changed`. Game kept running.
- Not proven: the list that changed, the emblem on screen.

## 2026-10-07: first customisation product taught to slot 3

Owner: [customisation unlock notes](CUSTOMISATION_UNLOCK_NOTES.md#live-requests-2026-10-07-slot-3).
Process 8256, DLL `68fd60bc...d5a7`, slot 3 identified, backup taken,
preflight passed.

- `signal-product-180836.ps1 -Id BANNER_NMSA`: learned, known products
  1,905 -> 1,906. Game kept running.
- Not proven: banner emblem 55 open in the customiser.

## 2026-10-07: character customisation unlocks mapped (offline)

Owner: [customisation unlock notes](CUSTOMISATION_UNLOCK_NOTES.md). Game
closed; corpus of build 180836 and the saved slot 3 files read only.

- Six customisation tables name 273 IDs as what unlocks an option; 263 are
  hidden CustomisationPart products, now class `customisation`.
- Slot 3 holds none of the 263 in any of its lists, although the customiser
  shows most options open; reading: the account's lists also count.
- Nothing sent. Proposed first test: `-Id BANNER_NMSA`, banner emblem 55.

## 2026-10-07: research-tree products taught to slot 3 after the crash

Owner: [product delivery notes](PRODUCT_DELIVERY_NOTES.md#research-tree-products-sent-2026-10-07-slot-3).
Process 17548, DLL `68fd60bc...d5a7`, slot 3 identified; the game had loaded
the 21:19 autosave with every earlier delivery (1,802 products), so only the
new class was sent. Backup taken, preflight passed.

- `-AllOfClass research_tree` (106): 103 learned, 3 already known; known
  products 1,802 -> 1,905. Game kept running.
- Confirmed: the owner saw the trees unlocked and saved; both slot 3 files
  hold 1,905 known products. The crash did not repeat during the check.
- Rollback: `save-backups/20261007-before-research-tree`.

## 2026-10-07: game crash after the build part delivery; hidden research-tree products; second product build

Owner: [product delivery notes](PRODUCT_DELIVERY_NOTES.md#what-stayed-locked-and-a-game-crash).

- Observed by the owner: decorative modules unlocked; station decorations and
  containers 1 to 9 still locked. Cause: 103 research-tree products the
  catalogue hides, which the first build refused.
- **Crash**, process 20536, slot 3, DLL `a6c01dbc...ecda`: crash ID
  `180836M_nvoglv64@0x2DD59F4` (graphics driver module), minutes after the
  last request, no request in progress. Cause unknown; not shown to be ours,
  not ruled out. The 21:19 autosave holds all deliveries (1,802 products).
- Offline: class `research_tree` (106 products) added; the profile no longer
  refuses a product only because the catalogue hides it.
- Built and installed with the game closed: `68fd60bc...d5a7`. Fixtures pass.
  No request sent.
- Open: 62 corvette tree entries are not product IDs; mechanism unknown.
- Rollback for the save: `save-backups/20261007-before-build-parts` or
  `20261007-before-products`.

## 2026-10-07: all build parts taught to slot 3

Owner: [product delivery notes](PRODUCT_DELIVERY_NOTES.md#build-parts-same-day-same-process).
Process 20536, DLL `a6c01dbc...ecda`, slot 3 re-identified, new backup taken.
The owner asked for every locked or priced entry of the construction research
terminals.

- `-AllOfClass catalogue_construction` (1,067): 1,024 learned, 43 already
  known; known products 778 -> 1,802, equal to the number learned.
- Game kept running. Not proven: the terminals and build menu on screen,
  persistence after a save.
- Rollback: restore `20261007-before-build-parts` with the game closed.

## 2026-10-07: craftable technology products on slot 3 (Atlas Passes); five unrequested entries

Owner: [product delivery notes](PRODUCT_DELIVERY_NOTES.md#first-live-requests-2026-10-07-slot-3).
Same process 20536, DLL `a6c01dbc...ecda`, slot 3. The owner reported Atlas
Pass V1 to V3 still dark after the catalogue items.

- `-AllOfClass catalogue_technology` (91): 82 learned including `ACCESS1` to
  `ACCESS3`, 9 already known; known products 691 -> 778.
- Unexplained: +87 for 82 learned. The five extras are the freighter
  specialist rooms `FRE_ROOM_NPC*`, never requested.
- Saved slot 3 files hold 778 known products. Game kept running.
- Not proven: the passes lit on screen; the origin of the five extras.

## 2026-10-07: first live product recipe requests on slot 3

Owner: [product delivery notes](PRODUCT_DELIVERY_NOTES.md#first-live-requests-2026-10-07-slot-3).
Build 180836 (`13d5060d...`), process 20536, DLL `a6c01dbc...ecda`, slot 3
identified by content, save folder backed up first, preflight passed.

- `-Id ALLOY1`: known products 601 -> 602, learned.
- `-AllOfClass catalogue_item`: 602 -> 691; 89 learned, 19 already known.
- Game kept running. Not proven: the catalogue on screen, persistence after
  a save. Technology (91) and build parts (1,067) not sent.
- Rollback: reload without saving, or restore the backup with the game closed.

## 2026-10-07: recipes and fishing record persisted in slot 3; product build installed

The owner saved in the game (process 24704, DLL `2bd83437...ca78`) and closed
it. Read-only check of both slot 3 files (`save5.hg` 20:56, `save6.hg` 20:58):

| List | Saved size |
| --- | --- |
| Known technologies | 205 |
| Known products | 601 (not delivered by us) |
| Known recipes | 1,684 |
| Fishing record | 220 of 256 entries filled, 220 non-zero counts |
| Redeemed season / Twitch / platform | 10 / 0 / 1 (untouched) |

So the recipe and fish deliveries of the same day survive a save. Not checked:
how the game shows the fishing record in its interface.

Then, with no game process, profile DLL `a6c01dbc...ecda` (product request)
was installed over `2bd83437...ca78`; executable hash unchanged
(`13d5060d...`). No request sent yet. Undo: copy the previous build back.

## 2026-10-07: product recipes — classification and request built; fossil request withdrawn (offline)

Owner: [product delivery notes](PRODUCT_DELIVERY_NOTES.md). The game was
running (process 24704, slot 3) and was only read.

- Read-only: every catalogue product is already in the account's seen list;
  the dark catalogue entries the owner showed are craftable products whose
  recipe slot 3 does not know.
- Classified 4,446 products: 108 catalogue items, 91 technology, 1,067 build
  parts, 2,092 not learnable, 1,070 not in the catalogue, 18 repeatable.
- Built, **not installed** (game running): profile DLL `a6c01dbc...ecda` with
  a `product` event. Fixtures pass; none covers the product request.
- The account-level fossil request was removed at the owner's direction; its
  one run had added nothing.
- Not proven: everything live for products.

## 2026-10-07: fishing record and fossil seen list (live, slot 3)

Owner: [reward redemption notes](REWARD_REDEMPTION_NOTES.md). Build 180836
`13d5060d...3499`, profile DLL `2bd83437...ca78`, process 24704, slot 3.

- Fish: 220 recorded, 6 mission-bound skipped, none refused; record list 220.
- Fossils: 165 requested, all already in the account's seen list.
- The owner's catalogue screen after the recipe run: recipes 432 / 432,
  technology 358 / 358, build parts 37 / 925 (products not delivered yet).
- Process responding, no request error.
- Not proven: fishing catalogue as seen by the player, statistics and
  milestones touched, save and reload, the fossil routine actually adding.

## 2026-10-07: recipe delivery — one, then all 1,684 recipes (live, slot 3)

Owner: [recipe delivery notes](RECIPE_DELIVERY_NOTES.md#first-live-run-2026-10-07).
Build 180836 `13d5060d...3499`, profile DLL `2bd83437...ca78` (first start
of the split build), process 24704, **slot 3** identified automatically by
content match. Backup: `20261007-before-slot-lists`.

- Preflight passed. `-Id RECIPE_1`: known 7 to 8. `-All`: 1,676 sent, known
  8 to 1,684. No refusal, no side-effect refusal, no request error; known
  technologies (205) and products (601) unchanged; process responding.
- Not proven: the catalogue as seen by the player, save and reload.
- Rollback: quit without saving or restore the backup.

## 2026-10-07: profile source split into one file per domain (build only)

Owner: [profile file map](../runtime/native/asi/profile_180836/README.md).
Requested again by the project owner after domain code kept being added to
the single freighter-named file. No game process was involved.

- `runtime/native/asi/freighter_class_180836.c` was replaced by sixteen files
  in `runtime/native/asi/profile_180836/`; function bodies moved unchanged,
  glue rewritten. Build mode `Profile180836`; status file, mode string and
  event base renamed.
- Checks: profile fixture (offer hooks), technology and recipe guard fixtures
  pass. Not covered by a fixture: corvette, shipped reward, owned inventory,
  redeem, fish and fossil branches.
- Built and installed with the game closed: `2bd83437...ca78`, replacing
  `3c7a6fcc...4269`.
- Not proven: any live request on the split build. Earlier live results were
  obtained with earlier builds.

## 2026-10-07: fish and fossil requests built (offline)

Owner: [reward redemption notes](REWARD_REDEMPTION_NOTES.md). No game process
was involved.

- Fish table: 226 entries, 6 mission-bound and skipped by structure; entry
  layout confirmed against the compiled table (product ID `+0x20`, mission ID
  `+0x30`, quality `+0x44`).
- Built and installed with the game closed: profile DLL `3c7a6fcc...4269`
  with `fish` and `fossil` events added, replacing `0983a24e...2106` before
  it was ever started. Fixtures pass; none covers the new requests.
- Save folder and settings file copied to
  `E:/NMS-Courier-Research/save-backups/20261007-before-slot-lists`.
- Owner decisions recorded: random fish sizes, statistics accepted,
  account-level seen list accepted for fossils only.
- Not proven: everything live.

## 2026-10-07: slot-side reward redemption and slot identification (offline)

Owner: [reward redemption notes](REWARD_REDEMPTION_NOTES.md) and
[live bridge operations](LIVE_BRIDGE_OPERATIONS.md#saves-slots-and-account-data).
No game process was involved.

- Read-only look at the slot files: known specials, redeemed season, Twitch
  and platform rewards and known recipes are per slot. First reading: no
  fishing record in any slot. **Corrected the same day:** every slot has a
  fishing record of 256 fixed entries, empty in all four slots; the game
  fills it with routine `4678d0`. Individual fossil bones are only in the
  account's seen-products list; a slot has six fossil statistics.
- The slot-side routine `5ab380` (player state, ID) is what the season reward
  handler calls after the account unlock; it also has Twitch and platform
  branches.
- The executable names requests that upload and submit the account data.
- Built and installed with the game closed: profile DLL `0983a24e...2106`
  with a `redeem` event (and the recipe request), replacing `22cf6a82...f545`
  before it was ever started. Fixtures pass; none covers the redeem request.
- Added `identify-loaded-slot.py` (content match; syntax-checked only).
- Not proven: everything live, and whether redeeming a ship or similar reward
  this way blocks claiming the item.

## 2026-10-07: recipe delivery — routine found and request built (offline)

Owner: [recipe delivery notes](RECIPE_DELIVERY_NOTES.md). No game process was
involved; nothing was taught.

- Source: recipe table of the corpus (1,684 entries, no defective entry
  found), executable 180836 `13d5060d...3499`.
- Observed: known recipes are a set at player state `+0x18750`; the save-load
  merge routine `5a1670` takes a source with a recipe list at `+0x10` and
  inserts the recipes the table contains.
- Rejected: copying the inline insert of the single-recipe site; calling the
  merge routine without a guard, because it also adds entries of two manager
  lists to the known technologies and products.
- Built and installed with the game closed: profile DLL `22cf6a82...f545`
  with a `recipes` event, replacing `4cea02b7...f6b3`. Three fixtures pass.
  Save folder and settings file copied to
  `E:/NMS-Courier-Research/save-backups/20261007-before-recipes`.
- Not proven: everything live.

## 2026-10-07: account reward sets — relocation and read-only live check

Owner: [known lists triage](KNOWN_LISTS_TRIAGE.md). Build 180836
`13d5060d...3499`, process 24688, profile DLL `4cea02b7...f6b3` installed but
not signaled. Reads only; nothing was written to the game.

- Seven account sets read from memory equal the game's own settings file
  (seen substances, technologies and products; titles; specials; season
  rewards 293; platform rewards 1).
- The set expected to hold Twitch rewards is empty while the file has 435.
  Unresolved.
- The known technology list after a restart is still the 205 deliverable
  IDs; the owner confirmed them in the game's menus.

## 2026-10-07: triage of the other known lists and of the upgrade modules (offline)

Owner: [known lists triage](KNOWN_LISTS_TRIAGE.md) and
[technology delivery notes](TECHNOLOGY_DELIVERY_NOTES.md). Read-only: corpus
tables, reward table, executables 180383 and 180836, the owner's saves and
exported lists. No request was sent to the game.

- The learn-product routine (`5aa1a0` / `5aafd0`) accepts a product only when
  it is craftable or a customisation part; the 187 upgrade modules are
  neither, and no owner save has them as known technologies.
- The purchasable specials table marks 14 entries as consumable: the 8 the
  owner reported as unbuyable once known, plus 6 more.
- Of 3,583 exported products the routine would accept 1,779; of 284 exported
  specials 126 are expedition, Twitch or platform rewards.
- Not proven: any of the handlers for specials, glyphs, words and recipes;
  the behaviour of the 6 additional consumables in the shop.

## 2026-10-07: technology delivery — one, then all 205 deliverable technologies (live)

Owner: [technology delivery notes](TECHNOLOGY_DELIVERY_NOTES.md#first-live-run-2026-10-07).
Build 180836 `13d5060d...3499`, profile DLL `4cea02b7...f6b3`, process 11584,
the owner's save in ordinary gameplay; save folder copied beforehand to
`E:/NMS-Courier-Research/save-backups/20261007-before-technology`.

- Preflight passed. `-Id UT_JET -ShowAlert`: learned, known count 27 to 28.
  `-All`: 177 learned, 28 not added (the 28 already known), known count 28
  to 205. Process alive and responding, no request errors, no blocked or
  unknown result.
- Read-back: the known list in process memory and in the save the game
  wrote afterwards is exactly the 205 deliverable IDs.
- Corrected the same day: a save editor showing "204 / 392" is not counting
  blocked entries, as first written; its other 187 entries are upgrade-module
  products (`U_*`), which the game keeps in the known products list.
- Not proven: catalogue and build menus as seen by the player, loading the
  save in a new process, mission side effects, multiplayer.
- Rollback: quit without saving or restore the save copy.

## 2026-10-07: technology delivery — refusal rules, native learn routine and profile request (offline)

Owner: [technology delivery notes](TECHNOLOGY_DELIVERY_NOTES.md). No game
process was involved; nothing was taught.

- Source: converted technology table of the corpus (`NMSARC.Precache.pak`,
  converted table SHA-256 `29b1f803...5d65`), compiled table bytes of the same
  corpus, reward table, executables 180383 `671de226...97a4` and 180836
  `13d5060d...3499`.
- Observed: 393 entries; 36 damaged-slot, 91 maintenance, 59 template, 11
  hidden and 1 unnamed entry are classed as never delivered, 195 as
  deliverable. The reward handler for `GcRewardSpecificTech` calls a
  definition lookup and a learn routine; both and the handler relocate to
  180836 with one masked-byte match each (`f394a0`, `ec8dc0`, `5a95a0`). The
  learn routine itself refuses only `OBSOLETE`, procedural, repair and
  already known entries.
- Built: profile DLL `53b01c14...542d` with a `technology` event; installed
  with the game closed in place of `37eecaaf...f1fa` (backup kept outside the
  repository). Technology guard fixture and freighter class fixture pass.
- Owner review the same day: ten entries first refused only for being hidden
  from the game catalogue are valid; that rule was removed and the profile
  rebuilt as `4cea02b7...f6b3` (installed, game closed; fixtures pass again;
  205 deliverable, 188 blocked). `53b01c14...542d` was never started.
- Rejected: dispatching shipped rewards per technology — only 54 entries have
  a reward that teaches exactly one technology.
- Not proven: everything live — startup verification of the new DLL, the
  call from the update hook, the result in the game catalogue, save and
  reload, and the in-memory offsets of the fields the game's routine does not
  read itself.
- Rollback: restore the backed-up DLL with the game closed.

## 2026-10-07: in-place upgrades of owned items — class rewards, silent grids and special slots (live)

Owner: [owned inventory upgrade notes](OWNED_INVENTORY_UPGRADE_NOTES.md);
mechanism: [live bridge operations](LIVE_BRIDGE_OPERATIONS.md). Build 180836
`13d5060d...3499`. Saves copied unchanged beforehand to
`E:/NMS-Courier-Research/save-backups/20261007-before-owned-upgrade`.

- DLL `b408f090...4c5b`: `R_WEAP_UPGRADE` raised the equipped multitool one
  class per dispatch with the game's message (A to S; another from C to B);
  `R_SHIPUPGRADE` did nothing on an S ship; `RS_INV_SLOT` opened the game's
  slot window for one slot.
- DLL `a380fc1a...abfd`: `owned` event on ship slots 4 and 1 — 10 x 12 grids
  and 120 special technology slots, seen by the user on the current ship and
  present in the save the game wrote; on weapon record 0 the write was undone
  by the game.
- DLL `37eecaaf...f1fa`: equipped multitool through its active store and the
  exosuit through its two stores — both read back as 10 x 12 / 120 with 120
  special technology slots and confirmed on screen by the user.
- Read-only tools: `scan-owned-inventory-stores.py` (one full scan; a second
  attempt ran out of memory on a large region and a small fixed-offset reader
  was used instead).
- Not proven: restart persistence of multitool and exosuit; the game's own
  slot purchase afterwards; multiplayer.
- Rollback: restore the copied saves; reinstall an earlier DLL from the
  native-builds folder.

## 2026-10-07: owned S corvette from an export, 120 + 120 slots, validation bypassed (live)

Owner: [corvette delivery notes](CORVETTE_DELIVERY_NOTES.md#seventh-live-result-owned-s-corvette-120--120-slots-all-technology-slots-special-2026-10-07-one-run).
Build 180836 `13d5060d...3499`. Research mod
`NMSCourierCorvetteLayoutResearch`: layout `62792cfe...5e96` (976 objects),
debug options `817e5a65...9e4a` (`DisableCorvetteValidation`).

- Run A (DLL `9baba721...5c7e`): validation switch honoured — the warning is
  shown but finalize proceeds; class S on the offer; offer declined.
- Run B (DLL `5887b8ea...5b0d`): class S, 10 x 12 main and technology grids,
  119 special slots added at build start; user finalized, accepted, replaced
  their corvette and saved. The saved ship has class S in three inventories,
  120 + 120 valid slots, 120 special entries; its ship base has 976 objects.
- Not proven: persistence after restart, flight without landing gear, no
  prior corvette, add-as-new, the largest export, multiplayer.
- Rollback: the user's previous corvette was replaced by their choice; the
  research mod and DLL remain installed (delete the mod folder and restore an
  earlier DLL from the native-builds folder to revert the tooling).

## 2026-10-07: corvette class S applied at build start; validation blocks a gear-less export (live, one run)

Owner: [corvette delivery notes](CORVETTE_DELIVERY_NOTES.md#fourth-live-result-class-s-applied-a-larger-export-blocked-by-validation-2026-10-07-one-run).
Build 180836 `13d5060d...3499`; DLL `9baba721...5c7e`; mod layout
`62792cfe...5e96`; user in a space station.

- Trigger: class S plus one `corvette` event after a passing preflight.
- Observed: class written to three ship stores (0,0,0 to 3,3,3); the
  976-object corvette shown assembled; finalize refused for a missing landing
  gear, which the export does not contain.
- Earlier in the day (user action, previous process): finalizing the
  160-object build produced a ship offer of class C with a generated name.
- Not proven: class on the offer and on the owned ship; validation switch.
- State: `GCDEBUGOPTIONS.GLOBAL.MBIN` with validation disabled
  (`817e5a65...9e4a`) added to the research mod for the next restart.
- Rollback: delete `GAMEDATA/MODS/NMSCourierCorvetteLayoutResearch`.

## 2026-10-07: export shown assembled in corvette build mode (live, one run)

Owner: [corvette delivery notes](CORVETTE_DELIVERY_NOTES.md#second-live-result-the-export-appears-assembled-in-build-mode-2026-10-07-one-run).
Build 180836 `13d5060d...3499`; DLL `8c2c901c...17e2`; research mod
`DEFAULTSHIPBASE.MBIN` `cc3763b5...6130`; user in a space station.

- Trigger: one `corvette` event after a passing preflight.
- Observed: build mode opened with the 160-object export assembled and ship
  statistics shown; no missing-part warnings.
- Not proven: finalize, costs, larger exports, no-corvette saves.
- State: mod file replaced afterwards by the 976-object layout
  (`62792cfe...5e96`) for the next restart; nothing was finalized.

## 2026-10-07: corvette build reward dispatched live; layout mod prepared (live, one run)

Owner: [corvette delivery notes](CORVETTE_DELIVERY_NOTES.md#first-live-observation-the-reward-opens-build-mode-empty-2026-10-07-one-run).
Build 180836 `13d5060d...3499`; DLL `8c2c901c...17e2`; no ship-base mod
active during the run; user in a space station with an editor-added corvette.

- Trigger: `signal-freighter-class-180836.ps1 -Class C -DispatchCorvetteBuild`
  after a passing preflight; one dispatch.
- Observed: call returned (`dispatch_state=3`); corvette build mode opened
  empty with four missing-part warnings.
- Not proven: finalizing, costs, behaviour with no corvette owned.
- Prepared, not run: research mod replacing `DEFAULTSHIPBASE.MBIN` with a
  layout built from a 160-object export (`cc3763b5...6130`); needs a restart.
- Rollback: restore the earlier DLL from the native-builds folder if wanted;
  delete `GAMEDATA/MODS/NMSCourierCorvetteLayoutResearch` to remove the mod.
  The class request armed by the script for the next freighter offer is
  one-shot and was not used.

## 2026-10-07: corvette creation route read from data; observation build prepared (offline, not run)

Owner: [corvette delivery notes](CORVETTE_DELIVERY_NOTES.md#the-games-own-creation-route-read-from-shipped-data-2026-10-07).
Offline. Corpus data (identical in installed build 180836); three user
exports read; the user's newest save read in memory, not modified.

- Observed: exports share one ship record equal to the shipped
  `DefaultCorvette`; parts live in a `PlayerShipBase` entry linked by ship
  slot index; `R_BIGGS_NEW` starts build mode from `InitialLayouts`
  (`DEFAULTSHIPBASE`).
- Built, not run: profile DLL `8c2c901c...17e2` with a `corvette` event that
  dispatches `R_BIGGS_NEW` once.
- Not proven: anything about runtime behaviour of that reward; how the
  initial layout is read; validation, cost and limits.
- Rollback: the installed DLL is still `f36ba9d6...adf0`; nothing was
  installed or signaled.

## 2026-10-07: slot layout ported; build 180836 code and data compared; names by language (offline)

Owners: [inventory class research](INVENTORY_CLASS_RESEARCH.md#natural-slot-count-and-grid-ported-2026-10-07-offline)
and [name generation research](NAME_GENERATION_RESEARCH.md). Offline only.
Executables: 180383 `671de226...e497a4`, installed 180836 `13d5060d...3499`
(copied unchanged to `E:\NMS-Courier-Executables\180836`). Installed archives
were read in memory, nothing extracted or modified. The newest local save was
decompressed in memory, read only, to list model seeds; nothing was written.

- Source: `evaluate-inventory-layout.py`, `compare-native-routines.py`,
  `compare-installed-data.py`, `emulate-name-generation.py --build/--language`.
- Observed: layout port equals original code in 121,836 cases; 28 routines
  (11,329 instructions) are identical between the builds; 8,289 data members
  are byte-identical; `Hayasenn CV-5` is reproduced exactly with the Brazilian
  Portuguese format string; 54 names agree between the two executables.
- Failures: the first routine comparison reported six differences that were
  tool artifacts (image-relative table displacements, jump-table data decoded
  as code, leaf routines without unwind entries); the tool was corrected and
  all 28 compare identical. The first data comparison used one index query
  per member and was stopped for being slow; hashes are now loaded once.
- Not proven: valid grid positions; routines outside the 28; color placement
  on ships (a seed-0 hauler from the user's save was rendered for a visual
  comparison the user has not made yet).
- Rollback: nothing to roll back.

## 2026-10-07: wrapper seed at purchase setup; primary paint colors against references (offline)

Owners: [inventory class research](INVENTORY_CLASS_RESEARCH.md#one-wrapper-one-seed-natural-generation-order-2026-10-07-offline)
and [model preview research](MODEL_PREVIEW_RESEARCH.md#primary-paint-color-against-seven-public-references-2026-10-07).
Offline only, build 180383 executable `671de226...e497a4`.

- Observed: in setup functions `8e5710`, `8e6590` and `8e6880` the seed passed
  to the generation wrapper is the function's second argument (the entity
  seed) for main and technology stores. The first `Paint` sample for seven
  public seeds agrees with the hull color recorded for each.
- Not proven: the unread wrapper call sites; color placement; RGB accuracy.
- Rollback: nothing to roll back.

## 2026-10-07: name routines under emulation; natural generation wrapper read (offline)

Owners: [name generation research](NAME_GENERATION_RESEARCH.md) and
[inventory class research](INVENTORY_CLASS_RESEARCH.md#one-wrapper-one-seed-natural-generation-order-2026-10-07-offline).
Offline only, build 180383 executable `671de226...e497a4`, Unicorn 2.1.4,
Ghidra 12.1.4 stages `namegeneration20261007`, `nameword20261007`,
`namefrigate20261007`; English language files of the corpus.

- Source: `emulate-name-generation.py`, `name-generation-180383.md`.
- Observed: ship seed `0xA547AB958C97E439` gives `Radiant Pillar BC1`;
  routine `e8da90` with seed `0x8C968767B3282F13` gives `CV-5 Hayasenn`, the
  components of the name the user saw in game (`Hayasenn CV-5`) for the
  freighter delivered with that model seed. The technology routine has one
  direct caller; class, layout, technologies and base stats restart from one
  seed inside wrapper `4ccfa0`.
- Failures: two formatted-print imports were missing from the first runs; the
  routine first assumed for freighters (`e85aa0`) is a general place-name
  routine and did not produce the known name.
- Not proven: word order of the freighter name on build 180836; caller-side
  type and seed arguments; other languages; the seed passed to the wrapper.
- Rollback: nothing to roll back; reports are external.

## 2026-10-07: baked layer textures in the workshop; Atlas staff colors (offline)

Owner: [model preview research](MODEL_PREVIEW_RESEARCH.md#baked-layer-textures-in-the-workshop-2026-10-07).
Offline only; corpus data of build 180383; Pillow 12.3.0 and NumPy 2.5.3 in
`%LOCALAPPDATA%\NMSCourier\research-tools\python-imaging`.

- Source: `export-scene-glb.py --imaging-tools`, workshop importer, loader and
  content policy.
- Observed: textured renders of fighter `0xA547AB958C97E439`, the Atlas staff
  and the Atlas multitool. The Atlas staff is black with a red orb and has no
  palette-bound texture list, so its colors do not depend on the seed.
- Rejected: taking the first selector row per layer and group left unselected
  groups without an option (untextured primary surfaces); the fallback row is
  used now.
- Not proven: fighter colors against the public note (yellow accents rendered,
  red recorded); game recolour arithmetic; masks, emissive and transparency.
- Rollback: nothing to roll back; outputs are external.

## 2026-10-06 night: seed previews compared with public reference seeds (offline)

Owner: [model preview research](MODEL_PREVIEW_RESEARCH.md#comparison-with-public-reference-seeds-and-two-corrections-2026-10-06-night).
Offline only; corpus data of build 180383; reference notes from
`reddit-seed-observations.md` (publication builds unknown).

- Source: `export-scene-glb.py --seed --palette-seed --texture-seed`,
  `evaluate-texture-options.py` (optional budgets), capture harness.
- Observed: three reference seeds reproduce the recorded shape (fighter
  `0xA547AB958C97E439`, haulers `0xD440D42921FFFF7A` and
  `0xAB5A7EA8EB43A808`); dominant colors agree for the two haulers and not for
  the fighter's color placement.
- Failure found and fixed: parts whose mesh name ends in `LODn` were dropped
  (missing wings). Earlier seed-selected renders of this date predate the fix.
- Not proven: pixel or RGB agreement; natural texture seed and resource
  order; anything about builds other than the corpus build.
- Rollback: nothing to roll back; renders are external and disposable.

## 2026-10-06 late night: base-stat generation ported; colored seed previews (offline)

Owners: [inventory class research](INVENTORY_CLASS_RESEARCH.md#base-stat-generation-ported-2026-10-06-offline)
and [model preview research](MODEL_PREVIEW_RESEARCH.md#colored-seed-previews-2026-10-06-later).
Offline only, build 180383 executable `671de226...e497a4`, inventory table
`ccb6e685...240d`, base palette binary `3521862b...9c4e`, Unicorn 2.1.4.

- Source: `evaluate-base-stats.py`, `emulate-base-stats.py`,
  `export-scene-glb.py --palette-seed`.
- Observed: base-stat port equals the original routine in 71,264 cases
  (float bit patterns). The fighter render for seed `0x7` shows palette colors
  on 22 of 53 materials.
- Rejected: 10,480 first-run differences were a harness artifact (stale
  element count in the untouched "no row" case), not a port error.
- Not proven: the runtime byte selecting the range pair; natural caller
  arguments; the seeded texture option choice that decides paint style (the
  preview takes the most probable option); texture pixels, masks, decals.
- Rollback: nothing to roll back; reports and renders are external.

## 2026-10-06 late night: game scenes exported to the workshop, seed-selected renders (offline)

Owner: [model preview research](MODEL_PREVIEW_RESEARCH.md#native-scene-export-and-seed-selected-renders-2026-10-06).
Offline only; corpus data of build 180383; no game process, save, mod or
bridge touched. Tools: CPython 3.14, Electron build of this repository,
Playwright from the Codex runtime cache.

- Source: `runtime/research/export-scene-glb.py`,
  `runtime/scripts/capture-model-preview.cjs`; workshop limits and lighting in
  `apps/desktop/src/main/model-preview-import.ts` and
  `model-preview-canvas.tsx`.
- Observed: seventeen ship, multitool and freighter scenes exported with all
  alternatives; sixteen exported and rendered for seed `0x7` with the existing
  descriptor traversal port selecting the parts. Inspected renders are single
  coherent models (fighter, shuttle, sentinel ship, multitool, freighter,
  capital freighter, pirate freighter).
- Failures: old import limits exceeded; shield mesh hid the pirate hull;
  file-level index width flag wrong for fighter `wings_k`; one scripted edit
  broke the exporter for part of a batch. All corrected and rerun.
  `freightersmall_proc` exports almost nothing for seed `0x7` (open).
- Not proven: equality with the in-game model for the same seed; colors,
  textures, decals; the Euler order (assumed, visually coherent); in-app
  conversion of the user's own files.
- Rollback: nothing to roll back; outputs are external and disposable.

## 2026-10-06 late night: technology selection port and procedural instances compared (offline)

Owner: [default technology research](DEFAULT_TECHNOLOGY_RESEARCH.md#selection-port-compared-with-the-original-2026-10-06-later).
Offline only, build 180383 executable `671de226...e497a4`, technology table
`b8f35e5e...acf8b`, procedural table `8c72de23...b76df`, reality data
`239a2886...8513`, Unicorn 2.1.4.

- Source: `evaluate-default-technology.py`, `evaluate-procedural-technology.py`,
  `emulate-procedural-technology.py`, `emulate-default-technology.py`
  (`--compare-port`, `--seed-range`, `--reality-data`, `--boost-chance`).
- Observed: selection port equals the emulated original in 18,000 cases over
  freighter stores (types 8, 7, 9) and ship class arguments 1 to 4; the
  procedural generator port equals the original instruction windows (state
  10/10, statistics 4,256/4,256); instance-aware selection equals in 1,464
  hauler cases and a 204-case fighter run.
- Rejected: a first instance-aware matrix reported 303 differences; cause was
  the synthetic store (ten valid slots for five), not the port. Report lists
  were also aliased between cases. Both fixed; earlier committed reports were
  produced before the alias was introduced.
- Not proven: remaining ship classes and the multitool store (jobs still
  running); live agreement; the boosted-roll percentage; natural caller
  arguments.
- Rollback: nothing to roll back; reports are under
  `E:\NMS-Courier-Research\seed-analysis-180383\default-technology-port-matrix-20261006`.

## 2026-10-06 night: procedural upgrade table in the technology emulation (offline)

Owner: [default technology research](DEFAULT_TECHNOLOGY_RESEARCH.md#procedural-upgrade-table-added-2026-10-06-later-run).
Offline only, build 180383 executable `671de226...e497a4`, tables
`b8f35e5e...acf8b` and `8c72de23...b76df`, Unicorn 2.1.4.

- Observed: ship and multitool stores now receive procedural picks; eight
  cases without error. The pirate descriptor has one group with one option; the
  inventory generation ranges per size type were tabulated in the class note,
  which also corrects the size type used by the reward setup (index 28,
  FreighterMedium).
- Not proven: generated procedural statistics, natural callers' inputs, any
  live loadout, build 180836 tables.
- Rollback state: nothing to roll back.

## 2026-10-06 night: original technology routine executed under emulation (offline)

Owner: [default technology research](DEFAULT_TECHNOLOGY_RESEARCH.md#original-routine-under-emulation-2026-10-06).
Performed by Claude Code. Offline only.

- Build fingerprint: executable 180383 `671de226...e497a4` (recovered copy);
  technology table binary `b8f35e5e...acf8b`; Unicorn 2.1.4.
- Configuration: `emulate-default-technology.py`; whole `.text`, `.rdata` and
  `.data` mapped; synthetic manager, wealth row, progress 100, all
  technologies in the required-technology list, rarity weights from
  `gcplayerglobals`, special ID assumed `SOLAR_SAIL`, second table empty.
- Observed: all reported runs completed without error. Freighter store, type
  8, class argument 0: 24 cases for seed `0x8C968767B3282F13` and 16 further
  seeds; ship classes 1 to 9 and the multitool store with main-table picks.
  Results are tabulated in the owner note.
- Failures on the way, each resolved by a documented boundary: stack probe
  reading the thread block, three import thunks, the engine allocator, a
  settings pointer in the unmapped data tail, and a source-file null byte
  introduced by my own edit. Six discarded attempt reports
  (`default-technology-emulation-try1..6-20261006.json`) are kept externally.
  With the special ID left zero every non-living ship class received the
  Vesper Sail.
- Not proven: natural callers' seed and state, procedural upgrades, agreement
  with a running game, build 180836 tables.
- Rollback state: nothing to roll back.

## 2026-10-06 night: natural default technology rule, build 180383 (offline)

Owner: [default technology research](DEFAULT_TECHNOLOGY_RESEARCH.md). Performed
by Claude Code. Offline only; no game process, save, mod or bridge change.

- Build fingerprint: executable 180383 `671de226...e497a4` (recovered copy);
  corpus tables with the hashes listed in the owner note.
- Configuration: Ghidra 12.1.4, existing project, no autoanalysis, stage
  `defaulttechnology20261006`, selection `default-technology-180383.md`, three
  exports in 46 seconds; `inspect-default-technology.py` over the read-only
  corpus index.
- Observed: `F_HDRIVEBOOST2` is "Plasmatic Warp Injector" (Freighter,
  VeryRare, requires the hyperdrive); `F_TELEPORT` is rarity Impossible; rarity
  weights 10/50/25/2/1/0/9999999; routine `4cef50` builds seeded weighted
  candidates, with a pick count from slots and the solar-system wealth row, and
  freighter stores draw no procedural upgrades.
- Not proven: every numeric detail of the routine (no emulation), caller
  arguments, category enum order, build 180836 tables, any live loadout.
- Rollback state: nothing to roll back; one external report added.

## 2026-10-06 evening: pirate freighter by scene and seeds, three offers in one process (live)

Owner: [inventory class research](INVENTORY_CLASS_RESEARCH.md#fifth-live-result-pirate-freighter-by-scene-and-seeds-three-offers-in-one-process-2026-10-06-evening).
Performed by Claude Code with the user at the game.

- Build fingerprint: executable 180836 `13d5060d...cc3499`; bridge
  `f36ba9d65f97c82477b5daa043f8dd76ee8acbdecba23d459d65c30ff254adf0` (commit
  `97a4313`), installed with the game closed; no freighter data patch.
- Trigger and save conditions: PID 23116 started 18:48:33 local; user save in
  ordinary gameplay with the S 120/120 freighter from the fourth run. Three
  identical requests; each earlier dispatch had returned (`dispatch_state=3`)
  before the next was sent, at the user's explicit request.
- Observed: pirate model in the offer; acceptance ran twice (`carry_applied=2`,
  `home_applied=2`); owned statistics changed at once, model and name only
  after the user restarted the game, when the freighter appeared as the pirate
  model named "Hayasenn CV-5".
- Failures: one offer declined by mistake; the user perceived both acceptances
  as failed because the model did not change in that session.
- Offline follow-up: Ghidra stage `freighteraccept20261006`, selection
  `freighter-accept-180383.md`, four exports succeeded (265 s). Cause of the
  missing in-session refresh not identified.
- Not proven: in-session model refresh, base-transfer consequences, natural
  technology loadout, palette correctness, long-term stability.
- Rollback state: DLL `f36ba9d6...` installed; backups unchanged.

## 2026-10-06 evening: persistence of the delivered freighter confirmed; model request built

Owner: [inventory class research](INVENTORY_CLASS_RESEARCH.md#persistence-check-of-the-fourth-live-result-2026-10-06-evening).

- Build fingerprint: executable 180836 `13d5060d...cc3499`; installed bridge
  `99a887a3...4db61`; PID 13136 started 18:28:28 local. Nothing was signaled.
- Observed (user screenshot after restart): owned freighter S, storage 120,
  technology slots special with default technologies, hyperdrive range 210.0.
- Not proven: lower technology rows after restart, stability in play.
- Offline in the same session: located the model seed and scene arguments of
  purchase setup and the reward-acceptance home seed write; built DLL
  `f36ba9d6...adf0` with a file-based model/seed request and repeatable
  dispatch after a returned call. Fixture passed; not run in the game.
- Rollback state: unchanged; `99a887a3...` remains installed until replaced.

## 2026-10-06 local: owned S freighter, 120 cargo, 120 all-special technology slots (live, one run)

Owner: [inventory class research](INVENTORY_CLASS_RESEARCH.md#fourth-live-result-owned-s-freighter-with-120-cargo-and-120-all-special-technology-slots-2026-10-06).
Performed by Claude Code with the user at the game.

- Build fingerprint: executable 180836 `13d5060d...cc3499`; bridge
  `99a887a3aa9fba5307bcbe72779285cf4af2f21d552db0ea198209ea2d64db61` (commit
  `d21c2a7`), installed with the game closed; no freighter data patch.
- Trigger and save conditions: PID 436 started 11:37:19 local, user save in
  ordinary gameplay, owned freighter S with 120 cargo and 13 technology slots.
  Preflight passed; one signal identical to the third run.
- Observed: offer S, 120/120, all technology slots special. The user accepted
  through the comparison screen and declined the base transfer. Log
  `carry_applied=1`, `carry_exact_site=1`, `carry_callers=8ee2ca`,
  `carry_seed_equal=0`. Owned freighter screenshot: S, storage 120, technology
  grid all special with default technologies, hyperdrive range 210.0.
- Explains the third run: the earlier profile required the acceptance seed to
  equal the item seed, and it does not.
- Not proven: persistence after restart, base-transfer branch, stability of
  the non-native grid in play, repeatability, other entity types.
- Rollback state: DLL `99a887a3...` remains installed; backups under
  `E:\NMS-Courier-Research\native-builds\installed-backup-20261006`; one-shot
  dispatch of PID 436 consumed; the user closed the game after saving.

## 2026-10-06 local: 120/120 all-special freighter offer; acceptance carry failed (live, one run)

Owner: [inventory class research](INVENTORY_CLASS_RESEARCH.md#third-live-result-120120-offer-all-technology-slots-special-carry-not-applied-2026-10-06).
Performed by Claude Code with the user at the game.

- Build fingerprint: executable 180836 `13d5060d...cc3499`; bridge
  `ec4da1c76b313ab860b76fdcc40438b2d7a233fd167ede758a8e3eb3f652681c` (commit
  `a8fe8e0`), installed with the game closed; no freighter data patch.
- Trigger and save conditions: PID 9912 started 11:27:13 local, user save in
  ordinary gameplay, owned freighter S with 120 cargo and the old sparse
  technology grid. Preflight passed; one signal with class S, maximum slots,
  twelve technology rows, all special slots and one dispatch of `RS_S13_S4M6`.
- Observed: log `technology_grid=10,12,120`, `table_patches=1`,
  `super_added=119`, `super_errors=0`; offer screenshot with S, 120 and 120
  slots, all technology slots special, hyperdrive range 210.0.
- Failed: after the user accepted, `carry_applied=0` and the owned technology
  grid was unchanged. Cause not identified; the profile lacked diagnostics.
- Not proven: technology transfer, persistence of a 120-slot all-special
  technology store, repeatability.
- Rollback state: profile DLL installed; backups under
  `E:\NMS-Courier-Research\native-builds\installed-backup-20261006`; one-shot
  dispatch of PID 9912 consumed. A revised DLL `99a887a3...` is built, not run.

## 2026-10-06 local: S-class freighter offer with 120/60 grids, build 180836 (live, one run)

Owner: [inventory class research](INVENTORY_CLASS_RESEARCH.md#second-live-result-s-class-with-12060-grids-2026-10-06-build-180836).
Performed by Claude Code with the user at the game.

- Build fingerprint: executable 180836 `13d5060d...cc3499`; bridge
  `2e4403736cef5bed030fa082eba0fd077fac32ce7afdb61a0d635c6b140bc94c` (source at
  commit `12e3fef`), installed with the game closed; no freighter data patch.
- Trigger and save conditions: PID 22292 started 11:09:15 local; the user
  confirmed the save was loaded in ordinary gameplay and that the freighter
  accepted from the first run still showed S after restart. Preflight passed
  with `dispatch_state=0`. One signal: class S, maximum slots, one dispatch of
  `RS_S13_S4M6`.
- Observed: log `applied_count=1`, `class_after=3,3,3`, `layout_overrides=2`,
  `main_grid=10,12,120`, `technology_grid=10,6,60`; screenshot with S badge,
  120 and 60 slots, cost 600,000,000, default technologies present, one
  special technology slot. The user accepted, saved and closed the game.
- Not proven: owned grids and technology after this acceptance, persistence of
  the second freighter, repeatability.
- Follow-up built offline in the same session, **not yet run in the game**:
  all-valid-slot special marking, a scoped 12-row technology bound and an
  acceptance-time technology store copy; production DLL
  `ec4da1c76b313ab860b76fdcc40438b2d7a233fd167ede758a8e3eb3f652681c`.
- Rollback state: bridge backups remain under
  `E:\NMS-Courier-Research\native-builds\installed-backup-20261006`; the one-shot
  dispatch of PID 22292 is consumed.

## 2026-10-06 local: first S-class freighter offer, build 180836 (live, one run)

Owner and full procedure: [inventory class research](INVENTORY_CLASS_RESEARCH.md#first-live-result-s-class-freighter-offer-2026-10-06-build-180836).
Performed by Claude Code with the user at the game.

- Build fingerprint: executable 180836 `13d5060d4efb9d2a6a6b1b349bc4257231056cc2a055df4bb15d816262cc3499`;
  bridge `FreighterClass180836` `b3fcecf78eebc166e708ab17a73da650e72c1961fb9a3cfa6fd823705e342bb9`;
  no freighter data patch (only the older `NMSCourierCurrencyRewardProbe` folder present).
  Hashes were compared before installation (game closed) and again by the
  signaling script against the running process.
- Source/configuration: `runtime/native/asi/freighter_class_180836.c` at commit
  `7a47d1a`, built with `build-probe.ps1 -Mode FreighterClass180836`.
- Trigger and save conditions: PID 22104, started 10:45:58 local, user's loaded
  save in ordinary gameplay. Preflight passed with `dispatch_state=0`; no
  earlier one-shot outcome existed in this process. One signal: class S plus
  the one-shot dispatch of shipped reward `RS_S13_S4M6`.
- Observed: log `dispatch_state=3`, `freighter_setups=1`, `applied_count=1`,
  `class_before=0,0,0`, `class_after=3,3,3`; process alive and responsive. The
  user's screenshot shows the native offer screen with an **S badge**, cost
  23,000,000, 19/19 slots, hyperdrive range 168.2, fleet coordination 27.1.
- Not proven: ownership class after acceptance, persistence after save/reload,
  slot expansion, equivalence with naturally generated S stats, repeatability,
  other rewards/seeds/models/builds.
- Rollback state: the profile DLL remains installed; the previous DLL is backed
  up at `E:\NMS-Courier-Research\native-builds\installed-backup-20261006`.
  The one-shot dispatch is consumed for PID 22104 and must not be repeated
  there. Offer acceptance state was not yet reported.

## 2026-10-06 local: build 180836 relocation and freighter class profile (offline)

Owner: [inventory class research](INVENTORY_CLASS_RESEARCH.md). Performed by
Claude Code. **No game process was started, nothing was installed, no save or
mod changed.**

- Fingerprints: source build 180383 `671de226...e497a4` (recovered copy);
  target installed build 180836 `13d5060d4efb9d2a6a6b1b349bc4257231056cc2a055df4bb15d816262cc3499`
  (build string read from the executable). Installed bridge DLL remains
  `1cb8ed07...7a8040`; installed data mod folder `NMSCourierCurrencyRewardProbe`.
- Configuration: `relocate-native-signatures.py` with twelve windows; Capstone
  5.0.5; llvm-mingw 20260922 for the DLL builds; MinHook 1.3.4 as vendored.
- Observed: eleven windows relocate uniquely; the 180836 freighter block makes
  the same three class-0 stat calls; `4d1240` copies store `+0x100`, and the
  kind-3 acceptance block of `8e8830` copies offer stores into the player's
  type-7 and type-9 stores. Reference client inspection: the freighter request
  carries no class field ([feature catalog](REFERENCE_FEATURE_CATALOG.md)).
- Built: `FreighterClass180836` production DLL `b3fcecf7...342bb9` and fixture
  DLL `5bf9d9f5...c8243b`. Fixture passed every check listed in the owner note.
- Failures and limits: the 69-byte layout-initializer window had no match. The
  fake-host rejection run ended before a startup diagnostic was written, so
  only the absence of hooks/exports/profile log was observed. A `git push`
  attempt failed with a network connection error and was retried later.
- Not proven: everything live. Dispatch ABI and reward ID on 180836, badge,
  stats, ownership after acceptance, slots, persistence.
- Rollback state: nothing installed. External build outputs only under
  `E:\NMS-Courier-Research\native-builds`.

## 2026-10-06 local: inventory class draw, executable recovery and tool location

Owner: [inventory class research](INVENTORY_CLASS_RESEARCH.md). Offline only; no
game process, save, mod, bridge or corpus change. Performed by Claude Code.

- Build fingerprint: analysis used build 180383, SHA-256
  `671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`, recovered
  from the read-only Ghidra project's stored file bytes with
  `ExportOriginalExecutable.java` (88,545,352 bytes, hash verified by the script
  and again with `Get-FileHash`). The installed executable is now a different,
  unresearched build: SHA-256
  `13d5060d4efb9d2a6a6b1b349bc4257231056cc2a055df4bb15d816262cc3499`, Steam
  build ID 25732212, written 2026-10-05 15:05 local.
- Configuration: Ghidra 12.1.4 / Temurin 25 and Unicorn 2.1.4 from the physical
  Codex package directory; existing Acquisition180383 project, no autoanalysis,
  two CPUs, 4 GiB heap, 600-second process guard, 30-second per-function limit.
  Selection `class-generation-180383.md`, stage `classgeneration20261006`.
- Observed: `4cfd10` draws once from the seed and compares against cumulative
  `ClassProbabilityData` weights (table `+0x1a54`, row from
  `*(manager+0x72afb0)+0x2524`). Wrapper `4ccfa0` stores an explicit class, or
  for request value 4 keeps the generated class only for inventory types 3, 4
  and 7. NPC component `170a7a0` stores class 3 for ship-type values 6 and 7.
  Purchase setup `8e3a10` kind 3 never reads the payload class and generates
  base stats for class 0. Port versus original instructions: 619 cases, zero
  mismatches. Nine synthetic unit tests pass. Navigation index regenerated with
  the new stage registered; zero import warnings.
- Failures: nine of ten exports succeeded; `572c40` timed out. The first port
  had a transposed double literal: 421 arbitrary cases passed, 75 of 198
  boundary cases failed, then all 619 passed after correcting the bytes. A
  first caller scan was refused because its output was under the executable's
  grandparent directory; the recovered executable was moved to its own root.
- Static pattern only on the new build: masked bytes of `4cfd10` and the
  wrapper head each match once (RVAs `4cfda0`, `4cd030`); the `8e3a10` head
  does not match. No table values were read from the new build.
- Not proven: natural freighter purchase path and its seed, the live identity
  of the row source, any class-setting API, anything on the new build at
  runtime, slots or supercharged positions.
- Rollback state: nothing to roll back. New external files only:
  `E:\NMS-Courier-Executables\180383\NMS.exe`, the stage export and three
  emulation reports plus one caller report under `E:\NMS-Courier-Research`.

## 2026-10-05 local — category catalog, explicit colors and named tool flag

Offline build 180383 executable SHA-256:
`671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.
Owners: [explicit color rules](CUSTOMISATION_COLOR_RESEARCH.md),
[category ledger and continuation order](SEED_CATEGORY_LEDGER.md),
[input linkage](ENTITY_INPUT_PIPELINE.md) and
[catalog](PRIORITY_APPEARANCE_CATALOG.md). Exact algorithm windows, table hashes,
input limits, manifests and reproduction are in those notes. New AI handoff
rule requires every model to maintain owners/log/guide before stopping.

No game/save trigger or live process access. Existing corpus/index only;
private Unicorn 2.1.4, Capstone and Ghidra 12.1.4/Temurin 25. Ghidra used the
existing Acquisition180383 project, no autoanalysis, two CPUs, 4 GiB heap,
120-second guard and 20 GiB free-space reserve. Reproducible ports/manifests
remain in repository; game assets/pseudocode/reports remain external.

Observed catalog: 293 descriptors, 1,665 groups, 3,709 alternatives, 87 shallow
scenes, 343 texture sources, 17 explicitly unclassified descriptors; 6,777,077
source bytes read. Added enabled/unfiltered integer multiply-high draw intervals,
keeping ancestor guards, references and Name weights separate from XML Chance.
Active three-category subset: 229 descriptors, 1,320 groups, 3,037 alternatives.
Corvette scene assets are candidates, not a recovered seed constructor.

Explicit customisation table binary SHA-256:
`29410ccb0918d4dddb483757d2f819100eeed046b192a4acc1287d6a77188387`.
Native comparisons: 222 quantizer, 40 final-overlay, 47 lookup fixtures, zero
mismatches (309 total). Quantizer includes alpha, float32 reduction, first
component-tolerance match, all six modes and adjacent tolerance values.
Overlay checks all 330 RGBA slots across exact/nonexact alpha values. Lookup
checks 26 categories, 18 IDs and three captured fallback branches before TLS.
Four CLI categories 2/3/15/23 select NULL/SHIP/FREIGHTER/PIRATEFREIGHTER.
Family-43 fallback is supplied after edits; contradictory edits fail rather
than silently assuming native initialization. Unknown-ID fallback stays rejected.
Its leaf initializer fills white/inactive source state, not proven mutable
runtime state. No-unwind inspector rejection was preserved.

Owned-tool flag chain is source-associated: `551de0` exports runtime `+2bd`
to record `+281`; reused `2a126e0` emits the latter under literal `34f1430`,
exactly UseLegacyColours. `552730` writes argument 7 to `+2bd`; `553af0`
preserves it between selected slots; `553600` forwards it to setter argument 5,
then palette-task `+1c9`. Bounded field scanner: 285 fragments, ten candidates,
one skip. Literal scanner: four instruction-checked references, zero skips.
Overlapping copies in `551500/551630` were not assigned the same object type.
Explicit boolean tool input now derives the task flag without changing seed
channels; conflicting overrides and precomputed/mode-5 inverse claims fail.
Three integrated category searches examine eight seeds each and preserve
anchor `0x7`, zero mismatches; tool uses the named field instead of task flag.
Joined tool input also retains its descriptor/material trace while rejecting
a base-only color substitute for supplied UseLegacyColours=true. Evidence:
`tool-legacy-joined-input-20261005.json` and `tool-legacy-joined-result-20261005.json`.
45 focused unit tests pass: 13 input, 12 search, ten catalog, ten explicit color.
No UI implementation changed; application build/render repetition omitted.

NPC work completed before the user deferred it is preserved: eleven supplied
racial/named roots, 33 native recursive comparisons at seeds 0/7/max, zero
mismatches/failures; eleven joined scene/input traces and one candidate replay.
Three pinned tables expose nine race entries, 24 named NPCs, 60 placement
declarations, thirteen presets and seventeen color groups. These are
declarations/supplied contexts, not natural NPC spawn or bank proof. Latest
priority is ships, multitools and freighters; no further NPC research started.

Failures/rejected assumptions: an unclassified shallow scene initially reached
string membership with None; fixed by excluding unclassified scene candidates
while reporting unclassified descriptors. Guessed headings/path reads and
four documentation patches failed validation before writing; corrected
using existing headings. Rounded XML colors do not replace binary float32;
inactive Weapon palette does not quantize to ship colors. Constructor source
and matching offsets do not establish runtime global state or object identity.
No game, corpus or storage failures occurred.

Final bounded follow-up: direct E8/E9 scanner found two initializer edges.
`8ebd21` passes argument 7 from frame byte `[rbp+2b78]`; `13f8de3` supplies
literal 1. Two containing fragment windows decoded 964 instructions. Semantic
identities and split/indirect callers remain unresolved. Output was a directory
named with a .json suffix; an attempted file read and Windows rg wildcard failed,
then corrected to `callers.json`. This was a path/tool error, not storage damage.

External evidence under `seed-analysis-180383`: `priority-catalog-intervals-20261005.json`,
`customisation-colors-full-20261005.json`, `customisation-fallback-literal-20261005.json`,
`tool-alternate-field-20261005.json`, `tool-legacy-name-20261005.json`,
`tool-legacy-search-20261005/report.json`, `npc-recursion-20261005.json`,
`tool-legacy-callers-20261005.json/callers.json`,
`tool-legacy-caller-windows-20261005.json`,
`npc-tables-20261005.json`, `npc-input-traces-20261005.json`,
`npc-search-20261005.json`, `priority-search-regression-20261005/report.json`.
Ghidra manifests/exports: `customisation-palette-lookup-180383.md`,
`tool-palette-flag-180383.md`, `tool-palette-callers-180383.md`; `custompalette20261005-export`,
`custompalettefallback20261005-export`, `toolpaletteflag20261005-export`.
Native comparison reports contain source, table and code-window hashes.
The final explicit-color port only clarifies the unmatched-ID diagnostic to
describe unverified mutable runtime state; arithmetic/lookup/overlay code is
unchanged from the 309-case comparison fingerprint. Source navigation refreshed
to 138 files/546 definitions, preserving earlier data/native import snapshots
and zero import warnings; 12 changed Python sources parse and 795 local links
resolve. Generated metadata is not a new native compatibility claim.

Not proven: initializer argument-7 caller values, natural palette bank/threshold
initialization, all offer/gift/customization paths, full decal/mask/shader and
geometry assembly, exact arbitrary appearance-to-seed inversion, or delivery.
Next bounded work: identify the two checked initializer caller contexts and
their frame-byte producer from the existing windows/caller manifest,
then category precomputed palette/material assembly. Reuse closed matrices.
Rollback: executable, game DLLs/mods/saves and corpus unchanged. Only repository
code/docs and bounded external reports changed. No extraction, disk commands,
D: access or BitLocker operations.

## 2026-10-05 local — palette task routing and literal correction

Pinned offline build 180383 executable SHA-256:
`671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.
Exact sources, input configuration, instruction sites, byte bounds, reproduction
and unresolved targets: [palette task routing](PALETTE_TASK_ROUTING.md).
Sources: `resolve-palette-task.py`, `emulate-palette-task-route.py`,
`scan-rip-data-references.py`, `palette-task-data-180383.md`, updated alternate
port/emulator/search/integration and three focused test files.

No game/save trigger. Reused existing Ghidra exports and hash-pinned corpus;
Capstone inspection and private Unicorn 2.1.4 emulation only. Initial worker
dispatch slice `638a8a..638af2`, flags 0/1/2/255, modes 0/1/5/max uint32,
explicit seed pair `(7,1)` and private pointers. Calls to both generators are
captured no-op boundaries. Precomputed bypass is source/instruction evidence.
Separate color matrix uses file-backed magenta/padding 1, controlled thresholds
0/float32(0.1), explicit base collection, four seeds and all six palette modes.

Observed: 16 dispatch comparisons and 404 native-literal arithmetic comparisons,
zero mismatches. Three integrated searches route from explicit task inputs,
omit separate branch/fallback fields, and retain anchor `0x7` after eight seeds.
37 focused unit tests pass (8 alternate, 5 routing, 6 RIP/PE storage, 9 search,
3 base, 6 primitives). No UI change; application build/render repetition omitted.

Correction: earlier string inspection hid file-backed fallback bytes because
the first byte was zero. Raw bytes prove RGBA `(1,0,1,1)` at `4b2f8d0` and padding
float 1 at `4b26778`. Controlled previous fixtures remain valid but are not these
native constants. Threshold `525d910` is a zero-filled virtual `.data` tail;
manual raw-offset diagnostics produced unrelated bytes outside the raw section,
which were rejected, not treated as threshold data. New scanner reports storage
explicitly. It finds 28 candidates, 23 checked references, two no-unwind skips,
no checked RIP writer; indirect/absolute/relocated/nearby writes remain outside
coverage. Missing writer evidence does not establish runtime immutability.

Failures: arbitrary inspector RVA `638d00` was not an instruction boundary;
reissued at previously observed `638b9a`. One overlap test initially omitted an
allowed trailing-immediate false candidate; corrected expected candidate set,
not instruction truth. A guessed test glob name found zero tests; reran the
actual test filenames and required successful exit. Windows wildcard/path
reads were corrected to existing source paths. Source-index refresh initially
used a nonexistent navigation path and failed before writing; corrected to
the documented existing `E:/NMS-Courier-Research/navigation` index, preserving
data/native imports and warnings. No game/corpus/storage failure.

Not proven: runtime threshold initialization, category-wide values of source
flags `+70/+71`, population of both palette banks, native material pixels,
complete inverse seed solving or runtime delivery. Explicit task inputs do not
extend category/build support. Precomputed colors must not be inferred from seed.

External evidence: `seed-analysis-180383/palette-task-and-constants-20261005.json`,
`palette-route-bodies-20261005.json`, `palette-task-fields-20261005.json`,
`palette-global-storage-20261005.json`, `alternate-native-literals-20261005.json`,
`palette-task-route-20261005.json`, `alternate-task-search-final-20261005/report.json`.
Rollback: game executable, DLLs, mods, saves and corpus unchanged; only repository
source/docs and bounded external reports changed. No disk commands, D: access,
extraction or BitLocker changes.

## 2026-10-05 UTC — alternate palette branch and explicit search inputs

Build 180383 executable SHA-256:
`671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.
Exact implementation, windows, configurations, commands, evidence and remaining
targets: [alternate palette research](ALTERNATE_PALETTE_RESEARCH.md).
Sources: `evaluate-alternate-palettes.py`, `emulate-alternate-palettes.py`,
`validate-alternate-search.py`, updated `search-appearance-seeds.py` and
`alternate-palette-data-180383.md`. No game/save trigger; private offline
Unicorn 2.1.4 execution only, no host imports. Explicit corpus base bank;
threshold fixtures 0/float32(0.1), null fallback `(0.25,0.5,0.75,1)`.

Observed: 384 row + 16 collection + four disabled-output comparisons, zero
mismatches. Row checks include state/draw counts and 64-attempt cap; collection
checks all 330 RGBA/index values and common reset race child seed. Three
integrated category searches each examined eight seeds and include anchor `0x7`;
ship/tool have one candidate and Pirate freighter eight. HomeSystemSeed remains
fixed separately. Original base fixture still finds `0x7` after eight candidates.
25 focused Python tests passed (seven new, nine search, three base, six primitive).

Ghidra 12.1.4 noanalysis database query completed in 28 seconds: threshold has
one READ reference, fallback three READ references, owners unavailable and no
writer recovered. This database limitation does not prove the absence of writers.
No natural threshold/fallback values or complete appearance are established.

Failures: nonexistent emulator/path and PowerShell glob probes corrected using
existing scripts; inspector initially omitted required hash, then rejected a
non-file-backed threshold literal. Prologue fragments were insufficient; body/
return fragments added. Initial three-category integration reported mismatches
from JSON-list/Python-tuple comparison, fixed representation only before 3/3
passed. Preserve that failed report; no game/corpus/storage failures occurred.

Not proven: natural alternate branch/collection selection, runtime global writers,
precomputed customization colors, native materials/pixels, complete inverse or
runtime delivery. Explicit parameters are not game defaults. No end-user runtime
or packaging claim. No UI change, so application build/render repetition omitted.

External evidence: `seed-analysis-180383/alternate-palette-comparison-final-20261005.json`,
`alternate-search-final-20261005`, `base-search-regression-20261005.json`,
body/prologue reports, and `acquisition-180383/alternatepaletteglobals20261005-export`.
Rollback: installed executable/DLL/mods, saves and corpus unchanged. Only source,
documentation, existing external analysis database and new bounded reports changed.
No D: access, disk repair, BitLocker change or extraction.

## 2026-10-04 — bounded appearance search and recipe preview

Offline build 180383 fingerprint:
`671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.
Exact source/configuration and reproduction commands:
[appearance search and recipes](APPEARANCE_SEARCH_AND_RECIPE.md), committed
`appearance-search-fixture-180383.json`, `search-appearance-seeds.py`,
`test_appearance_search.py`, recipe adapter/shared contract and
`validate-appearance-recipe.cjs`. No game process/save trigger was used.

Observed: Fighter and Royal constraints each found candidate `0x7` after eight
enumerated seeds, with identical forward replay. Royal used two explicitly
supplied mesh bindings and GLB hash
`9e188cf03419ecbd6e2c868c67461d381539112115ac7e5902f38a0f4314e357`.
Nine search tests and six recipe tests passed. Full repository Vitest run:
52 tests passed; lint, typecheck and build passed. Rendered Electron import/apply
changed the canvas and bound visibility; hash mismatch, invalid recipe and
cancellation preserved state. Portuguese screenshot inspection: no horizontal
overflow/page errors. Native pixels were explicitly not asserted.

Not proven: native DDS/mask/decal/shader composition, complete GLB assembly,
natural material order, all category/preset contexts, complete uint64 inversion,
seed uniqueness or runtime delivery. Independent freighter palette/texture
channels remain fixed supplied inputs in model-seed enumeration.

Failures/corrections: initial inspection referenced nonexistent
`evaluate-texture-selection.py`; corrected to `evaluate-texture-options.py`.
Documentation patches used incorrect heading contexts and failed without
changes; corrected against actual headings. No storage/game/corpus failures.

External evidence under `E:/NMS-Courier-Research/seed-analysis-180383`:
`appearance-search-20261004.json`, `appearance-preview-request-20261004.json`,
`appearance-preview-search-20261004.json`. Rendered report/screenshots:
`E:/NMS-Courier-Research/preview-models/recipe-acceptance-20261004`.
Rollback/state: executable, bridge, mods, personal saves and corpus untouched;
only repository code/docs and new external reports changed. No D: access,
extraction or storage repair. Stages 4–5 remain partial, with owning continuation.

## 2026-10-04: category input linkage to descriptor/material/base palette trace

Offline build 180383, algorithm executable SHA-256
`671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.
Owning specification: [category input pipeline](ENTITY_INPUT_PIPELINE.md).
Exact source/configuration: `evaluate-entity-inputs.py`,
`entity-input-fixtures-180383.json`, `test_entity_inputs.py`; existing descriptor,
scene, ALTID, context and base palette evaluators. Private Python 3.14.
Trigger/save conditions: supplied synthetic input records, existing corpus
read-only; no game process, save, installed DLL or mod. Explicit context index 0;
both compared material flags, independent model/palette/second-context pairs.

Observed: six category traces succeeded with zero unsupported results, including
owned ship/tool/freighter, loaded ship purchase seed, purchase fallback and
explicit tool pieces. Optional base palettes emit 330 candidate samples per
record. Ten boundary tests pass; enabled zero loaded seed has priority, disabled
loaded seed falls back, and freighter HomeSystemSeed does not replace its model
or material second pair. Nine scene and fifteen descriptor regression tests pass.
The new input connection has no new native oracle comparisons; its underlying
native evidence remains separately recorded in the previous log entries.

Not proven: actual live input reads, all caller overrides, natural resource IO,
complete entity colors, texture masks, render matching, inverse generation or
delivery. Explicit mode exercises the compared helper, not every owned
customisation caller. Unsupported route/category/fields are rejected. The user's
input-linkage request was implemented internally in the offline algorithm; no
renderer integration or live mutation was inferred while scope clarification
remained unanswered. This does not close unrestricted gates 1–3.

Review corrections: uint64 decimal strings require up to twenty characters,
not eighteen; the parser now bounds decimal/hex syntax and rejects overflow.
Category/resource types are checked before set lookup. Both corrections preceded
publication; neither was a game or disk error. Rollback: source/docs and new
external report only; original corpus, archives, executable, bridge, patch and
saves untouched. Evidence: external `entity-inputs-linked-20261004.json`, superseded
by `entity-inputs-linked-final-20261004.json` after source-provenance review.

## 2026-10-04: descriptor filter cache and reference ALTID comparison

Offline build 180383, executable SHA-256
`671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.
Owning note: [packed scene context](PACKED_SCENE_SEED_CONTEXT.md).
Exact sources: `emulate-descriptor-filter.py`, `emulate-reference-altid.py`,
updated `trace-packed-scene-materials.py` and `test_packed_material_context.py`.
Private Python 3.14, Capstone 5.0.5, Unicorn 2.1.4. Native windows
`2d652d0..2d6584f` and `56aff0..56b2a1`; executable limit 128 MiB,
private heap 1 MiB/stack 64 KiB, 50,000 instructions/one second per call.

Trigger/save conditions: offline only, no process or save. Filter existence,
load results, string helpers and allocations are private fixture seams. ALTID
output capacity is 64. No host imports execute. Filter fixtures cover warm,
warm-null, cold-missing and cold-loaded states; successful cold cases repeat the
call and verify no second load. Scene trace uses seed 7/context index 0/flags 0.

Observed: 192 original filter comparisons and 102 original ALTID comparisons,
zero mismatches. First case-sensitive substring wins; empty prefix selects none.
Cold filters are cached under their original scene filename. Literal uppercase
`.SCENE.MBIN` replacement differs from lowercase. ALTID preserves duplicates,
uses only spaces as separators and copies the input seed pair for all nonempty
strings, including whitespace-only strings. The scene evaluator reuses the
compared parser; 19/19 roots pass, plus nine focused regression tests.
Repeated path separators now fail closed until native normalization is ported.

Failures: initial cold-cache fixture omitted entry byte `120`, which overlapped
the following allocation; corrected allocation `130` before passing. Initial
ALTID long-token copy hit the shared 31-byte strncpy limit; a local 255-byte
bounded copy was implemented. Raw IAT slots were rejected by the FF25-thunk
inspector; import-name records were then verified directly. A documentation patch
context mismatch caused no partial change. These were private fixture/tool errors,
not game crashes or disk failures.

Evidence under external `seed-analysis-180383`: `descriptor-filter-cache-cold-20261004.json`,
`reference-altid-parser-20261004.json`, `packed-scene-material-trace-altid-20261004.json`,
`filter-resolver-window-20261004.json`, and ALTID parser/body instruction reports.
The earlier 96-case warm-only filter report is historical, not an extra matrix.

Not proven: actual archive IO, asynchronous resource readiness, material bank
population, all acquisition/preset/custom task callers, complete appearance or
inverse solver. Gates 1–3 remain explicitly incomplete at those boundaries.
Rollback: no installed executable, bridge, mod, save, archive or corpus content
was modified. Only repository source/docs and new external reports were written.

## 2026-10-04: packed scene factory, material identity and explicit pieces

Offline build 180383, executable SHA-256
`671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.
Owning specification: [packed scene materials and seed context](PACKED_SCENE_SEED_CONTEXT.md).
Exact sources/configuration: `emulate-packed-material-context.py`,
`emulate-descriptor-recursion.py --explicit-list`, `evaluate_explicit`,
`trace-packed-scene-materials.py`, the existing nineteen-root manifest,
`inspect-native-fragments.py --unwind-only`, and the twelve portable native-stage
TSV selections listed in that note. Private Python 3.14/Capstone 5.0.5/Unicorn 2.1.4;
Ghidra 12.1.4/JDK 25.0.4.1+1, no autoanalysis, two CPUs/4 GiB heap/20 GiB reserve,
300-second stage limit, 30-second per-function decompilation timeout.

Trigger/conditions: no game trigger or save; existing executable and converted
corpus only. Original instructions execute in bounded private emulation. Scene
trace uses seed 7, explicit context index zero/flags zero, enabled model pair and
disabled second pair. Successful non-variant XML resource resolution is a fixture
assumption. No extraction, installation, disk repair or D: access.

Observed: 353 native creator/validator/reference/writer/accessor/variant-wrapper
cases, zero mismatches; 74 explicit-recursion comparisons, zero mismatches/failures;
19/19 joined scene traces. Packed MESH is registered creator `189f400`. MATERIAL
acquisition forwards the input context. Concrete slots `48/50/58` resolve exact
name/type, strict/non-strict seed/ID comparison and exact flags. References collect
local children before referenced-resource materials. EMITTER's own acquired
material is excluded from this aggregate vector. The default writer preserves
the second pair; the decompiler's seed-as-first-argument expression is rejected
by original RCX instructions. Purchase accessor copies stored resource context.
Variant wrapper exact/zero fallback and invalid-handle behavior are compared with
controlled bank-index lookup helpers. Eight new regression tests and fifteen
existing descriptor tests pass.

Failures/rejected assumptions: first scene trace stopped at COLLISION/EMITTER,
5/19 complete, before their concrete factories were identified. Missing private
BSS pointers, an omitted REX jump byte, guessed/premature export paths and invalid
PowerShell path globs were corrected; leaf wrapper/resource routines have no
unwind record. Geometry candidate `18612a0` decompilation timed out and remains a
failed manifest row despite stage completion. Exact transient reports, corrected
windows and reproduction bounds are in the owning note. Patch-context failures
made no partial edits and were corrected against the actual document headings.

Not proven: asynchronous resource readiness, actual bank population, geometry
success, all caller/preset/NPC/task override variants, complete natural appearance,
rendering, whole-entity inverse search or runtime compatibility. Do not label the
unrestricted three gates complete. Rollback: executable, bridge, installed data
patches, saves and corpus content remain unchanged; only source/docs and new
external research reports were written.

## 2026-10-04: complete recursive selection and owned freighter inputs

Offline build 180383, executable SHA-256
`671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.
Owning specification: [recursion and owned appearance inputs](SEED_RECURSION_AND_OWNED_INPUTS.md).
Sources/configuration: `emulate-descriptor-recursion.py`, the nineteen-root
`appearance-recursion-models-180383.json`, updated descriptor evaluator/shared
private fixture, `inspect-node-collector-slots.py`, bounded field/native metadata
scanners, and the nine portable TSV selections/stages listed in that note.

Conditions: user unavailable for live tests; only existing exact-build executable,
read-only corpus database and selected existing Ghidra project exports inspected.
Python 3.14, Unicorn 2.1.4, Capstone 5.0.5, Ghidra 12.1.4/JDK 25.0.4.1+1;
no autoanalysis, two CPUs, 4 GiB Java heap, 20 GiB reserve, 300-second stage timeout.
No game process/save opened, no delivery trigger and no runtime installation changed.

Observed: 273 complete original-recursion comparisons (216 controlled plus 57
over nineteen corpus roots) match selected IDs, recursive seed/flag visits,
double reference lookup schedule and classification; zero mismatches/failures.
Classification is not C/B/A/S rank. Shared fixture regression: 420 matches;
fifteen evaluator tests pass. Five constructor-associated node tables resolve
to the audited aggregate/mesh collectors. `TkSceneNodeData.Children` is the
ordered packed array at `10/18`, stride `80`. Owned loader `542910` copies the
named `CurrentFreighterHomeSystemSeed` pair `83c20/83c28` directly to cache
`2b0/2b8`; `CurrentFreighter.Resource` at `83898` supplies the separate model seed.
Resource acquisition/cache exports show filename normalization, type/hash buckets,
virtual request validators, selector variants and selector-zero fallback. The
three-function follow-up associates the filename hash and request-context
comparison of two enabled/value pairs plus ordered 32-byte selected records.

Not proven: natural full scene/factory/reference resource identity, every
offer/NPC/preset/custom context, final rendered appearance or any new runtime
compatibility. All three gates are not claimed universally complete. Gates 4–5
were not implemented. Proprietary pseudocode/reports remain external.

Failures/rejected leads: first corpus replay hit lookup bound; increasing only
fixture call count to 1,024 succeeded. Multi-root shared cache hit 128-resource
bound; resetting per root preserved that bound and succeeded. Broad freighter
literal scan exceeded 256-output bound; narrowed named-field search succeeded.
RBP field matches included stack vectors, not freighter seeds. Combined fragment
requests hit non-instruction/16-KiB bounds; no broad limits were raised.
Sync-component metadata and constructed-node clone root were rejected as palette
and packed-scene generators. Missing guessed output paths were resolved through
manifests. A combined hash/context unwind request failed on leaf `2d626c0`;
hash-only inspection succeeded with a 41-instruction first fragment, explicitly
not the whole hash function. These are research input/coverage failures, not
storage failures. Navigation rebuilt with 312 deduplicated native candidates,
zero import warnings and five passing index regression tests.

Rollback: no game/bridge/mod/save mutations, extraction, disk repair, D: access
or BitLocker operations; original executable and corpus preserved. Only portable
research code/docs and new external analysis artifacts changed.

## 2026-10-04: material order, descriptor contexts and priority input channels

Offline build 180383, SHA-256
`671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.
Owning note: [appearance context](APPEARANCE_CONTEXT_RESEARCH.md), with exact
selections, stages, reproduction, bounds and unresolved boundaries.
Sources: `appearance-material-*-180383.md`, freighter source-writer/input-caller
selections, context-loader/child-writer/child-method selections,
`scan-resource-material-tables.py`, `emulate-appearance-context.py`, updated
`evaluate-descriptor-seed.py`, bounded Ghidra runner and reference exporter.

Conditions: no game process, save or native Windows executable launched. Python
3.14/private Unicorn 2.1.4/Capstone 5.0.5, existing Ghidra 12.1.4 project/JDK
25.0.4.1+1, no autoanalysis, two CPU budget, bounded stages/20 GiB reserve.
No extraction, D: access, disk commands/repair, BitLocker changes or installed
runtime modifications. Proprietary outputs remain external.

Observed: 15 candidate resource tables/eight instruction-checked LEA references;
`18dd650` creates internal node at `1c8`; resource thunk `18dae90` forwards to
node virtual `+20`. Aggregate `1833ec0` and leaf `1839e10` traverse stored child
order, appending own material handle first and skipping previously present
handles. No name sorting/RNG. Descriptor inclusion/exclusion/prefix rules,
raw-ID suppression and Name weights are now implemented with explicit context.
Freighter setter `5417f0` copies incoming resource `d0` and palette pair `160/168`
into source `170` and `200/208`; two calls in `aea590` message branch `0x19`.
Ten function stages: 26 decompiled rows, zero export failures. Separate reference
stage produced zero database references; it is not a function export.

Verification: 375 private original-instruction fixtures (15 material/360 choice),
zero output or final-RNG divergences, plus eleven Python boundary/traversal tests.
Strings and vector allocation/free are bounded stubs. Unknown targets abort.
No rendered/live appearance or runtime support is proven.

Failures/rejected leads: large pointer-run heuristic missed mixed resource tables;
shared-slot anchors and instruction-checked references replaced it. Empty Ghidra
references were database coverage limitations. Thunk has no unwind entry; a
fabricated range was rejected. Offset-only searches found stack math (`544c00`)
and unrelated layouts (`1833130`, `1838a70`), not seed/child producers.
`1833780` updates name/hash, `1834500` destroys nodes and `1833dc0` propagates
context; none proves child construction. Two temporary guessed selections were
replaced with decoded caller addresses before execution. Wrong stage/script
paths, Windows rg wildcard paths, a directory-as-file read and a documentation
patch context failed; corrected exact paths/heading used. No corpus, storage or
game failure occurred.

Not proven: natural child construction/material association, all node overrides,
complete original recursive loading replay, automatic filter records, owned
freighter HomeSystemSeed association, all category variants, rendering, whole
appearance inverse or delivery. The three broad goals remain partially resolved.
Rollback: no live state changed; existing source assets/project preserved.
Transient evidence: `appearance-context-native-final-20261004.json`, material
table/fragment reports, field-writer/caller reports under
`E:\NMS-Courier-Research\seed-analysis-180383`; proprietary Ghidra outputs in
`acquisition-180383`. No live retry/class/slot mutation.

Resumed after the usage-limit interruption: three additional bounded stages
(`appearancescenepopulation20261004`, `appearancescenechildpopulation20261004`,
`appearancescenefilter20261004`) added ten successful function rows, zero export
failures. Resource loader `18ddc70` applies a context mask and selected-descriptor
filter to MESH/REFERENCE/LOCATOR/INSTANCEMODEL, appends created nodes to parent
`+78` and recurses over packed children in stored order. `21f4a0` append does not
sort/deduplicate. `2d698c0` uses uppercase 31-byte names and a 15-character
fallback. The first expanded 413-case native run disagreed once with a guessed
16-character fallback; the explicit terminator at buffer byte 15 explained it.
Corrected port, dedicated regression and 420-case matrix pass with zero
divergences; twelve traversal tests pass. IAT `34118c0` was checked to name strncpy
before replacing its pointer in private emulation; no host import executed.

Reproduction includes `scan-scene-child-fields.py`: 2,592 bounded fragments,
64 candidates and 14 explicit decode/size coverage skips, not file-read or SSD
errors. Offset matches remain candidates. `18361c0` is a destructor; `18e12c0`
instantiates existing nodes; `19444b0` is a derived constructor. Their parser
labels were rejected. Current evidence: `appearance-context-loader-corrected-20261004.json`,
retained failed `appearance-context-loader-final-20261004.json`, scene type literals,
filter instruction/body reports and `scene-child-field-scan-final-20261004.json`.
XML-to-packed conversion, reference/factory variants and owned freighter palette
schema remain open. No live state or storage change occurred.

Final checks: twelve descriptor/traversal tests, five native-index tests, seven
Python source parses, 148 relative documentation links and three repository-output
rejection checks passed; no probe file created. Navigation refreshed to 108
source files/383 source functions/286 native candidates, zero import warnings.
The 420-case native report retains executable/window/source hashes; no broad
appearance, UI rendering, runtime mutation or full inverse acceptance is claimed.

## 2026-10-04: REA source assessment and targeted Ghidra resource helpers

Offline build 180383, SHA-256
`671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.
[Owning assessment](REA_GHIDRA_ASSESSMENT.md) records exact external REA commit
`405732a7f55e3033c29533b18f7d8313dbd28570`, source files and primary links.
REA source cloned externally for read-only reference; no installer, dependencies,
skill or MCP setup run. Its JDK 21 requirement and fresh auto-analysis launch
do not match reuse of our existing portable JDK 25/Ghidra project.

Exact experiment: `appearance-resource-producer-180383.md`, existing
`analyze-acquisition-offline.py`/`ExportAcquisitionSeeds.java`, stage
`appearanceresourceproducer20261004`, project `Acquisition180383`, `-noanalysis`,
two CPUs, 4 GiB heap request, 300-second outer timeout, 30 seconds per function.
No game process/save trigger. Both `2d646f0` and `2d65980` decompiled in sixteen
seconds. Observed generic two-level proxy lookup with zero-variant fallback and
reference-count acquisition respectively. Neither identifies the indirect
material-vector producer; the 64-bit cache key is not proven to be a visual seed.

Failure: historical E: native-tool path caused `StopIteration` before Ghidra
launch. Existing stage report supplied the actual C: private tool path; corrected
invocation completed. A broad upstream text query encountered a huge generated
catalog line; follow-up inspected exact source files and bounded line lengths.
No source/executable/storage failure or automatic mutation retry occurred.
Rollback: installed executable/bridge/mods/saves and corpus untouched; external
analysis database retains new function records and exports. No D: access, disk
repair or BitLocker changes. Complete appearance inverse remains unproven.
Final navigation rebuild imported 104 source files, 355 repository functions and
251 native candidates with zero warnings. A bounded query returned the new proxy
export. Changed Python sources parsed, relative documentation links resolved and
`git diff --check` passed. No application build was needed for research-only work.

## 2026-10-04: ordered resource wrapper, merged texture selection and payload slots

Build: offline 180383, executable SHA-256
`671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.
Owning evidence: [merged selection](MERGED_TEXTURE_SELECTION_RESEARCH.md).
Exact source/configuration: updated `evaluate-texture-options.py`,
`emulate-texture-selection.py`, `emulate-texture-collection.py` and
`inspect-texture-palettes.py`; original windows `62f940..62fb9a`,
`62fba0..630273`, `63bb20..63bb9c`, `631310..631f78`, `1ac7450..1ac748d`,
`1ae4cf0..1ae4d05`. Reused worker/preparation/writer Ghidra exports, plus bounded
wrapper disassembly; sources, hashes, fixture definitions and commands are in
the owning note and pipeline README. No executable extraction repeated.

Trigger/save conditions: isolated Python 3.14 / Unicorn 2.1.4 / Capstone 5.0.5,
read-only corpus, explicit ordered resources and palette inputs. Five copied
profiles and thirteen deterministic/boundary seeds per configuration. No game
process, save or installed mod/bridge accessed. Original instructions execute
only in private memory with bounded container and empty-path substring stubs.

Observed: 390 integrated comparisons across six configurations, thirteen unique
resource inputs, zero collection/first-pass/final-row/RNG-state divergences.
Forward/reversed decal bundles differ in choice/color multisets in 64/65 cases.
The unnamed one-option layer mode bypasses merging; all 131 real catalog roots
have that mode false, so the true mode remains a synthetic comparison. Payload
0 and 1 comparisons pass with identical supplied inputs, without assigning
natural semantic labels. Single-resource regression: 26 cases, zero divergences.
Tooling tests: sixteen texture evaluator and seven catalog/collector tests pass.

Static boundary: `62f420` forwards a vector obtained through virtual slot
`+0xd8`; `62f940` preserves its order and fixed eight-layer order. Concrete
producer unresolved. A bounded base-resource RTTI/vtable lead yielded non-code
data at the presumed slot and was rejected. No natural scene material order,
all-category palette schedule, linked/name filtering, DDS/shader appearance or
complete appearance-to-seed inverse is proven. These comparisons do not extend
live bridge compatibility or prove delivery class/slots.

Failure: private import-pointer fixture typo `3401140` caused
`UC_ERR_WRITE_UNMAPPED` before execution. Decoded actual address `3411140` fixed
the fixture; no game memory/source modification or failed output report.
Rollback: executable, corpus, saves, installed mods and bridge unchanged. No D:
access, disk commands/repair or BitLocker changes. Only repository research
code/documentation and new external bounded reports changed.
External report basenames and exact continuation target are in the owning note.

This is the short entry point for resuming exact-build research. Detailed reasoning belongs in [runtime research](RESEARCH_AND_DECISIONS.md), implementation contracts in [protocol and runtime](PROTOCOL_AND_RUNTIME.md), and current tasks in [TODO](../TODO.md). Entries describe observations, not general compatibility claims. All live tests used the user's disposable local save; none used save-file editing.


## 2026-10-02: service-client, public tooling and independent .NET assessment

- Build/context: installed research target 180383, executable SHA-256
  `671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.
  This pass did not inspect or mutate a running game. The user will test later.
- Source/configuration: supplied HTML SHA-256
  `cc289ebd09f65a3cd88b856e8c9a32949f0e6e516c6e80f1d62869cf9f0b4340`,
  five pinned public repositories, selected raw files and read-only public pages;
  exact revisions/hashes and bounded tooling are documented in
  [the service assessment](METAIDEA_SERVICE_RESEARCH.md). SDK 10.0.400,
  `InspectNativeCandidates.cs`, built-in PEReader/SHA-256; no NuGet packages.
- Trigger/save conditions: static HTML/code parsing, bounded HTTPS GETs and five
  offline PE candidates. No service POST, login, downloaded-script execution,
  plugin installation, save access, callback arming or game mutation.
- Observed: ship commands include class options; freighter commands do not.
  Sharing Center multitools explicitly require the extender. Public Transcender
  documentation describes native exchange popups and claim/buy handling. Public
  builders patch data files rather than expose the private bot. The independent
  C# reader validated candidate bytes/unwind starts at f12240, f27cd0, f31490,
  8e3a10 and 4cea20. Python independently matched all five entry byte sequences
  and unwind bounds. Three static-client tests and three native-index tests passed;
  refreshed navigation has 66 source files, 143 functions and no import warnings.
- Not proven/rejected: private backend, multiplayer replication, free claim,
  freighter S/configuration, exact DLL implementation and runtime ABI remain
  unknown. A site label or missing option is not an engine-wide impossibility.
  Large pages exceeded web-reader limits; bounded direct GETs succeeded. Initial
  exploratory output hit console encoding limits, so UTF-8 output was used.
  Negative C# cases initially threw uncaught InvalidDataException; explicit
  handling corrected them and both now reject with exit 1 and no stack dump.
- Rollback: none required. All third-party snapshots/reports remain external.
  Only Courier research tooling, documentation and TODO priorities changed;
  no installed game files, disk settings or delivery outcomes changed. No private
  bot backend or MetaIdea extender implementation is planned.

## 2026-10-02: bounded capability metadata and handler mapping

- Build: 180383, executable SHA-256
  `671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.
- Source/configuration: exact-name scanner, ten GcReward names, pinned NMS.py
  database, Capstone 5.0.5, Ghidra 12.1.4/JDK 25.0.4.1+1;
  metadata seeds SHA-256 `3ccbb33c619978c6f9d59fa1d7880f2f7b232e448446639c296e0b9f957edeb5`,
  handler seeds SHA-256 `10600b0934648b58557fc7bd3f972a372b753729a29fd59d8038bd3c20899397`.
- Trigger/save conditions: two offline -noanalysis exports, two CPUs, existing
  external project; 17 seconds each. No save, process attachment or runtime command.
- Observed: all ten names present; ten metadata and nine handler exports completed,
  bringing the index to 65 unique candidates. Nine exact getter/tag comparisons
  connect dispatcher branches to slot, upgrade, technology and unlock handlers.
  FreighterSlot opens an upgrade purchase window with a cost reference;
  UpgradeShipClass updates class and regenerates three owned ship inventory stores.
  See [native acquisition research](NATIVE_ACQUISITION_RESEARCH.md).
- Not proven/rejected: InventorySlots metadata reference is a split-function
  fragment, so no tag/handler was inferred. An exploratory label regex initially
  stopped at the earlier word candidate; exact GcReward labels corrected the report.
  Slot tokens/windows do not prove unlocked slots; recipe, install, unlock and
  acquisition remain distinct. No ABI, free claim or persistence proof.
- Rollback: none required; bounded external exports and repository research only.
  No disk commands, D: access, installed-file changes or live mutation. A local
  documentation edit initially failed decoding UTF-8 under the default codepage;
  the explicit UTF-8 edit succeeded without touching game data.

## 2026-10-01: targeted offline native acquisition research

- Build: installed 180383 executable SHA-256
  `671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`;
  different from the live-tested 179666 bridge target.
- Source/configuration: [native acquisition research](NATIVE_ACQUISITION_RESEARCH.md),
  its pinned NMS.py/ReNMS revisions, `scan-native-acquisition.py`,
  `ExportAcquisitionSeeds.java`, Capstone 5.0.5, Ghidra 12.1.4, and pinned
  Temurin JDK 25.0.4.1+1. External `run.json` records source hashes.
- Trigger/save conditions: static PE reading and selected Ghidra disassembly;
  `-noanalysis`, two CPU configuration, initial 26 seeds/30-second decompilation
  limits, then two focused seeds/120-second limits. No process attachment,
  reward event, save access, mod installation, or mutation occurred.
- Observed: six unique public-signature matches at unwind starts; 25 of 26
  initial pseudocode exports succeeded. The purchase candidate timed out.
  The focused run successfully exported it and a reward-entry dispatcher,
  yielding 27 unique pseudocode candidates. Subsequent bounded metadata,
  handler, initializer, setup, inventory and layout passes added eight successful
  exports, for 35 unique candidates. The payload tag `0x8a37c4a2` links the
  specific-ship serializer/getter to handler `0xf27cd0`, purchase setup
  `0x8e4d30`/`0x8e3a10`, and inventory initialization `0x4cd270`/`0x4cea20`.
  The layout initializer zeros the field corresponding to public `mClass`;
  the type-3 setup branch creates types 8/9 with zero class-stat selection,
  unlike other branches with explicit class copies. Reward dispatch passes through
  separate entry handlers; purchase handling includes readiness, item-kind
  branches, callback and cleanup. The first unwind fragment is not the complete
  purchase function, so its static direct-call sample is incomplete.
- Not proven: payload-to-freighter handler identity, complete ABI, gift without
  UI, S class/Pirate/120 technology/all-supercharged delivery, current-build
  runtime compatibility, or persistence. The static C-class clue is not proof
  of the older build's badge source. Public 4.13 ownership layouts are reference
  clues only. The initial/focused runs were supervised headless commands; the
  subsequent stages used the new bounded launcher with 300-second deadlines.
- Rollback: none required; game/DLL/data/save remained unchanged. Tools on C:,
  pseudocode/project on E:, all prior and failed manifests retained. Navigation
  now imports the initial/focused candidates rather than reporting unavailable
  native exports. No D: access or disk maintenance occurred.

## Reference points

### 2026-10-02: explicit class-observation arming installed

- Build: the same verified 180383 executable. Process 19008's completed observer
  could not sample the NPC trade screen opened afterward. The user reported B;
  the supplied screenshot shows the ship named Voz de Kamots with a B badge.
  This is UI evidence only, not correlation with earlier argument counters.
- Source/configuration: `callback_observer_180383.c` now waits for a random,
  process-specific local event before enabling the class candidate detour.
  `signal-class-observer.ps1` requires the exact executable fingerprint, intended
  installed DLL hash, matching log PID, awaiting status and validated event name.
  The event starts observation only; no reward, class or inventory command exists.
  Awaiting time is bounded to 30 minutes; sampling remains ten minutes from the
  signal. Fixture-only startup bypass remains excluded from production.
- Validation: strict native compilation and PowerShell parsing passed. The armed
  fixture forwarded 400 original calls before signaling with zero sampled class
  arguments, then 400 more original calls after signaling, with 80 in each bucket.
  All eight arguments and original returns were preserved; both original
  functions had 800 calls. Production fake PID 24304 logged unsupported build,
  forwarded all 400 original Update calls and created no observer log. The signal
  script rejected process 19008 without signaling because the user had closed
  it before the check. This verifies absent-process rejection, not the intended
  expired-status branch; that separate branch remains untested.
- Prepared production DLL SHA-256:
  `f22a1d533ff54465bb775da2c910c2fe18b8ecf200e9fb20562a1ec6b89ce9d7`.
  External staging: `class-observer-armed-180383-20261002`. After the user closed
  NMS, executable, old DLL, prepared DLL and backup hashes were verified. The old
  automatic observer was preserved as `previous-automatic-class-observer.dll`,
  the new DLL installed, and destination readback matched. MODS remains empty.
  The user was invited to reopen and prepare an NPC comparison before signaling.
- Not proven: NPC comparison correlation, S-class
  freighter delivery, price, ownership or persistence. Merely reopening a cached
  offer may not invoke the stat-generation candidate.
- Live arming: new process 23212 reported the exact executable fingerprint,
  awaiting status and 6,115 Update callbacks after the user confirmed loaded-save
  station readiness. The hash-guarded script signaled observation once. The next
  read confirmed both hooks observing, class hook status zero and all class
  counters initially zero; Update then reached 7,162 calls. Immediate class-log
  reading raced its creation, but the subsequent diagnostic confirmed activation;
  no second signal was sent. The NPC comparison sequence is recorded below.
- NPC observation: the user opened a B-class comparison with sampling active.
  The first read showed 0/1/2/3/other counts 9/3/6/0/0 and 14,110 Update calls.
  Before a requested single close/reopen of the same B comparison, the sample
  was 12/3/9/0/0 with 17,121 Update calls. Other buckets changing while discussing
  a B screen show why aggregate counters cannot identify a particular entity.
  No class mutation or purchase occurred in this experiment. A B badge is not
  evidence that every captured argument in that interval belongs to that ship.
  After the user confirmed a single close/reopen of the same B screen, counters
  were 18/12/15/0/0 with 28,327 Update calls. Final timed removal reported
  `observation_complete`, hook status zero, 21/12/18/0/0 and 31,846 Update calls.
  This completes the observation window, not an S-class delivery test. Caller
  attribution is required before a generation change can be scoped safely.
- Rollback: retain the previous observation DLL and exact-hash backups; replace
  only with NMS closed. No data patch or save change is part of this experiment.

### 2026-10-02: bounded class caller tracing fixture-tested and installed

- Target fingerprint: build 180383, executable SHA-256
  `671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.
  The completed aggregate B-screen observation above motivated caller capture.
- Source/configuration: `class_observer_180383.c`, `.S`, and
  `tests/class_observer_fixture.c`; `ClassObserver180383` mode retains explicit
  arming, the existing verified prologue and the ten-minute sampling limit.
  Prepared production DLL SHA-256:
  `f9379312f6676d03634cf29a239c1744df59164761d8dfcd13d84ba87a01f0fa`.
  The detour records the existing return address and unchanged R9D value into
  DLL-owned storage, preserving scratch registers, flags and stack arguments.
  No game object dereference, reward dispatch, class change or save access occurs.
- Bound: 2,048 records, no allocation or file I/O in the detour. Atomic reservation
  and publication prevent a partial record from being consumed by the worker.
  Excess calls are counted as dropped samples and still forwarded. The worker
  publishes relative executable caller addresses in a separate TSV; callers
  outside the executable are labelled `external` without writing raw addresses.
- Tests: strict LLVM 23.1.2 compilation passed. The armed fake-host fixture first
  made 400 calls with no records before signaling, then collected 400 calls with
  80 per argument bucket. A further 2,000 calls preserved arguments and returns;
  all 2,800 original calls completed. Published TSV had 2,048 rows, 2,400 attempted
  samples, 352 dropped and two distinct fixture caller RVAs (400 and 1,648 rows).
  The production-mode DLL rejected fake NMS PID 3512 as `unsupported_build` while
  its 400 original Update calls completed normally.
- Failed setup: the first fixture was named `class-fixture.exe`, so the executable
  identity gate rejected it and the host returned 11 when its expected log was
  absent. Renaming the isolated host to `NMS.exe` resolved this fixture setup error;
  the identity check was retained. Fixture-only build bypasses remain forbidden
  for game deployment.
- Not proven: the captured caller does not identify a particular entity by
  itself, and no S/Pirate/max-slot freighter was delivered.
- Installation: after the user confirmed NMS closed, absence of its process was
  checked twice. Executable, previous aggregate observer and prepared DLL hashes
  matched; the MODS directory contained no files. The previous DLL was backed up
  with hash readback, then the new DLL was copied and its installed hash verified.
  Loaded-save execution was subsequently observed in PID 20456: startup reported
  the exact executable fingerprint, Update hook status zero and 10,798 callbacks
  while awaiting the signal. After the user confirmed save readiness, the guarded
  script signaled once. The class hook reported `observing`, status zero, all five
  counters zero, and the caller TSV reported zero attempted/dropped samples.
  The process was responding. An NPC comparison was requested after this baseline;
  no class/offer correlation or mutation has been established in this process.
  With the user reporting a C comparison open, six records shared return RVA
  `0x4cd226`: three argument-0 and three argument-2 calls. A later sample during
  the requested alternative B comparison had 24 records (12/9/3/0/0), all from
  the same caller and no dropped samples. Continued sampling reached 33 records
  (15/12/6/0/0). These are interval snapshots, not per-ship event counts; multiple
  buckets changed and a unique B record has not been identified. No buying,
  exchanging or Courier delivery command was requested.
  A later status snapshot reached 39 calls (18/12/6/3/0), with hook status zero
  and the process responding. Argument 3 appearing in an ongoing sample is not
  evidence that the user's open B ship changed to S; no mutation occurred.
- Rollback: the completed aggregate-only observer, SHA-256
  `f22a1d533ff54465bb775da2c910c2fe18b8ecf200e9fb20562a1ec6b89ce9d7`,
  is preserved in external C: research staging. No data patch, game-memory
  mutation, save edit or disk-maintenance command was part of this work.

### 2026-10-02: observed class caller inspected offline

- Fingerprint: the same pinned build 180383 executable above. Source/configuration:
  `inspect-executable-function.py --build 180383`, existing PE section parser and
  Capstone 5.0.5; bounded unwind-aware inspection at `0x4cd226`, `0x4cd112` and
  `0x4cd14c`. The inspector now accepts only the two explicitly pinned build
  choices; its previous 179666 default is preserved.
- Trigger/conditions: follow-up to the read-only NPC caller samples in PID 20456;
  offline executable reads only, no native invocation or process/save write.
- Observed: `0x4cd221` calls wrapper `0x4ccfa0`, giving return RVA `0x4cd226`.
  The wrapper loads R9D from `[rdi+0x100]`, restores its frame and tail-jumps to
  stat generation `0x4cea20`. This explains why the live caller is outside the
  wrapper and locates an existing class input for ordinary inventory generation.
  Current-build slice inspection passed; using the old default against the new
  executable rejected the fingerprint with exit 2 before disassembly.
- Not proven: the observed source field is not a runtime-validated object layout
  or setter. Ordinary NPC observations do not establish the Courier freighter
  request path, S-class display, model, slots, price or persistence. Detailed
  findings and reproducible commands are in native acquisition research.
- Rollback: no install, class mutation or save change was made by this inspection.

### 2026-10-02: Utopia expedition S reward compared with freighter configuration

- Fingerprint: current build 180383, executable `671de226...` (full hash above).
  Source/configuration: hash-checked extracted reward MXML `8ed7ae90...`, Courier
  explicit freighter source `a797679f...`, updated read-only generation audit,
  and existing exact-build `setup-export/8e3a10.c`. Full source hashes and the
  field comparison are in native acquisition research.
- Trigger/conditions: user supplied an S-badge Utopia Speeder offer screenshot
  and requested comparison of the native expedition path. XML and existing
  pseudocode were read offline; no claim, purchase, grant or save edit was sent.
- Observed: `RS_S9_SHIP` and `RS_S9_COMPLETE` declare Fighter/S, gift and reward
  flags true, 36 layout slots and FgtLarge. Courier source also declares S but
  Freighter and gift false. Original `RS_S13_S4M6` declares Freighter/B. The
  ordinary supplied-inventory setup branch copies class and generates matching
  stats; the freighter branch lacks that observed class copy and supplies zero.
  The expanded audit produced bounded Utopia/freighter samples and found no
  Courier reward-ID collision with the original table.
- Sampling checkpoint: PID 20456 completed normally with both hook statuses zero,
  51 records, no dropped samples, 24/12/6/9/0 class arguments and 29,918 Update
  callbacks. The final TSV includes three argument-3 records at each of
  `0x8e47bb`, `0x8e47e5` and `0x8e4813`, matching the supplied-inventory ship
  reward branch, plus ordinary wrapper callers `0x4cd226` and `0x4cd351`.
  Earlier interval samples contained only the first wrapper; they must not replace
  the final trace. The specific Utopia offer remains uncorrelated without timing
  or entity evidence, but S-input reward-setup calls were observed live.
- Not proven: complete flag-to-ABI mapping, `IsGift` as a freighter class fix,
  request-scoped S/Pirate/max-slot generation, or persistence. No reward data or
  installed DLL was changed; the next native scope target is reward initialization.

### 2026-10-02: offline flag mapping and expanded capability inventory

- Build/source: pinned 180383 executable above; repository seed lists
  `reward-flags-180383.md` and `reward-fields-180383.md`, existing bounded Ghidra
  launcher, Ghidra 12.1.4 and JDK 25.0.4.1+1. The three-function rewardflags pass
  completed in 28 seconds; the two-function rewardfields pass in 17 seconds, all
  five manifest rows successful. No whole-program analysis or fresh extraction.
- Conditions: user requested offline research and no further live tests today.
  Existing C: tools and E: project/corpus were used. No game, DLL, patch or save
  mutation; no disk repair, encryption changes or D: access.
- Observed: serializer `0x24f00d0` names payload +0x24d IsGift, +0x24e IsRewardShip,
  +0x24c FormatAsSeasonal and +0x24f UseOverrideSizeType. Bounded ASCII reference
  resolution and exact wrapper disassembly show core `param_10` is IsRewardShip,
  not IsGift. Gift status reaches core argument 9/object +0x21 separately.
  The earlier gift-controls-class hypothesis is rejected after stack-forwarding
  verification; the freighter branch still lacks the analogous S-class copy.
- Expanded evidence: the existing route collector now inventories concrete recipe,
  expedition-unlock, item and repair payloads in two corpus tables. External report
  `delivery-capabilities-20261002.json` records source/script hashes and scoped
  counts. The owning route assessment distinguishes module/recipe/installation,
  unlock/claim/acquisition, expansion tokens/actual valid slots and class/stats.
- Not proven: production ABI, free freighter class/ownership fix, multitool delivery,
  targeted/maximal slot expansion, complete expedition unlocking, or current-build
  delivery compatibility. Static field offsets are not approved runtime setters.
- Rollback: no installation to roll back. External manifests, failed hypotheses
  and reports retained; reproducible scripts/seeds and documentation are committed.

### 2026-10-02: offline multitool reward chain and serializer mapping

- Fingerprint/tools: same pinned 180383 executable, Ghidra/JDK and bounded launcher
  above. Exact source lists are `weapon-metadata-180383.md`,
  `weapon-handler-180383.md`, `weapon-serializer-180383.md` and
  `weapon-fields-180383.md`. Passes completed in 17/16/16/17 seconds respectively;
  six new functions exported successfully without a whole-program scan.
- Trigger/conditions: user requested study of future multitool delivery; offline
  metadata, existing dispatcher pseudocode, bounded exact PE disassembly and
  name resolution only. No resource request, native call, purchase or save write.
- Observed: SpecificWeapon named metadata uses tag 0x5f82ff34. Getter 0x24cc6b0
  checks it, dispatcher 0xf19c30 selects handler 0xf31490, which calls core setup
  0x8e3a10 with item-kind 1 and queues 0x26. Field serializer 0x24da180 names
  +0x1c1 IsGift, +0x1c2 IsRewardWeapon and +0x1c0 FormatAsSeasonal. The reward flag
  reaches core argument 10; its branch copies the supplied class and computes
  corresponding stats. Native acquisition research owns the detailed chain.
- Rejected scan interpretation: a preliminary 64-byte getter slice included the
  target tag in neighboring leaf functions. Exact entry disassembly confirmed
  only 0x24cc6b0; no neighboring address was exported or treated as a getter match.
- Not proven: safe callable ABI, free/no-UI ownership, full inventory or S-class
  multitool delivery on this build. Resource readiness and selection remain gates.
- Indexing/validation: new named stages are imported as pseudocode_unverified.
  Three native-index tests passed, including all six new stage names, focused
  success/failure preservation and invalid-fingerprint rejection. Name resolution
  passed positive IsGift/IsRewardShip assertions and rejected a fake executable.
- Rollback: no installation or live mutation; external outputs retained. No new
  tools, disk repair, D: access or additional game extraction was required.

### 2026-10-02: class-selection argument observer installed

- Build: 180383 executable SHA-256
  `671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.
  The user clarified that the naturally encountered C ships were consistent with
  the system's economy, resolving that reported global-generation suspicion.
  The separate reported Starborn Runner acquired-class discrepancy is not
  independently resolved by that clarification.
- Source/configuration: `build-probe.ps1 -Mode ClassObserver180383`,
  `callback_observer_180383.c`, `class_observer_180383.c` and `.S`, MinHook 1.3.4,
  llvm-mingw 20260922 / LLVM 23.1.2. Class candidate RVA `0x4cea20`, exact first
  32 bytes `48895c241048896c2420565741564881eca0000000488bf14963e9488d8c24d0`.
  Offline disassembly copies R9D into RBP, and existing exported pseudocode uses
  that fourth argument to index class-dependent stat segments. This is an
  observation target, not an approved callable delivery API or class setter.
- Trigger/conditions: assembly detour counts R9D values 0, 1, 2, 3 and other,
  preserves flags and all argument registers/stack arguments, then tail-jumps
  into MinHook's original trampoline. It makes no helper call and does not
  dereference game objects or change arguments. The callback logs every two
  seconds and removes both hooks after ten minutes. No reward events/data patch
  or inventory/save access are present. Class input counters are not proof of
  an entity's visible or resulting owned class.
- Fixture failure: an empty Update stub was too short for MinHook and rejected
  with hook status 8; class counters remained zero. The fixture stub was replaced
  by a counted original function. This did not involve the real game. An initial
  PowerShell compiler invocation also failed parsing an unquoted comma-containing
  linker option, before execution; quoting that option resolved it.
- Fixture result: 400 original generator calls and 400 original Update calls,
  80 inputs in each bucket, eight arguments and original return values preserved.
  Strict compilation passed. The production DLL rejected fake executable PID
  21360, forwarded 400 Update calls and produced no class hook log.
- Installed DLL SHA-256:
  `3f2ce882e975313d3a4381ba75aec23e62fcca8f922c1322bebcd000ad5d208a`.
  Installation required closed game, matching executable/source hashes, absent
  destination proxy and no MODS files. Readback matched. Process 19008 then
  logged exact-build startup, Update hook status zero and class hook status zero;
  its first sample had 653 callbacks and no class candidate invocations yet.
- Not proven: live class argument samples in loaded-save generation, which
  object/flow reaches this candidate, S-class delivery, visible badge, stats,
  slots, ownership or persistence. Await gameplay observations before mutation.
- Loaded-save observation: the user confirmed loading the disposable save.
  The next class sample had argument 0 twice, argument 1 twice and argument 3
  once, with no other arguments and hook status zero. Update reached 18,164
  callbacks and the process remained responsive. This confirms candidate
  execution with multiple inputs, not that they belong to particular NPCs or
  the requested freighter. A controlled NPC comparison remains pending; opening
  an existing owned inventory may not invoke this generator.
  Final ten-minute sample: `observation_complete` in both logs, class hook
  status zero, 0/1/2/3/other counts 8/2/0/1/0, Update count 29,296 and callback
  thread 23208. The timer expired while the user was locating an NPC ship;
  no controlled comparison-screen correlation was established in this window.
  Do not attribute later visible classes to these completed counters. Future
  observation should allow explicit arming after gameplay readiness rather than
  consuming the entire sampling window during startup/travel. No mutation was
  attempted and there is no unknown delivery outcome to retry.
- Rollback: remove only this exact-hash proxy while NMS is closed. Prior observer
  and reward files remain in the external generation-isolation backup. No data
  patch was restored, and no save or global class table was changed.

### 2026-10-02: current-build observation bridge verified in gameplay

- Build: installed NMS 180383 SHA-256
  `671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.
- Source/configuration: `callback_observer_180383.c`, startup verifier profile
  `COURIER_OBSERVE_180383`, `build-probe.ps1 -Mode Observer180383`, pinned
  MinHook 1.3.4 and llvm-mingw 20260922. Public NMS.py revision
  `52e2e55493ddade1d89d3e638491afff995f5631` has a unique Update signature match
  at RVA `0x2d7530`, with exact 16-byte prefix
  `40534883ec20e8a54792024889056ebd`. Its mangled name describes a void method
  with no explicit arguments. The observer forwards the original this pointer.
- Conditions: game closed; no reward event, inventory read/write, or save access.
  The observer source does not link legacy inventory or delivery adapters. It
  logs counters and disables its hook after 180 seconds. Old callback source
  explicitly rejects the new profile at compile time.
- Failure: the former compiler directory contained only two executable files;
  the build exited `-1073741515` (missing dependency). The official private
  toolchain ZIP was downloaded to C: and verified against its previously pinned
  SHA-256 `e3ad77d117a4bea19a7a3b333341824d79a5a371004a10e25b8504e7b3047666`.
  No system installation or disk operation was used to resolve the tool failure.
- Observed: strict `-Wall -Wextra -Werror` build succeeded. The isolated
  fixture forwarded all 400 original calls; the sampled diagnostic recorded
  385 callbacks and hook status zero. The production-mode fake executable
  logged `unsupported_build`, forwarded all 400 calls, and produced no observer
  log. Fixture hash bypass is never used in the installed DLL.
  The historical Callback profile also compiled under strict warnings. Two
  negative compilation checks rejected mixed observer/delivery macros and
  linking the legacy callback adapter into the current-build observer.
- Installed observer SHA-256:
  `755f8d374f13e1db4eb962f6bc8573bddaab58a22a7c8f903cd38b6c101d627d`.
  Executable, previous DLL, new DLL, and unchanged reward patch were checked.
  The known older DLL hash was `f20d9b41344fc7460471979f56598108ed8f750327a202b879a0716d651a441d`;
  it was backed up before replacement, and installed readback matched.
- Live result: process 20928 resolved to the intended Steam executable and
  logged `exact_build_startup_observed` with the exact fingerprint. The observer
  completed its 180-second window with `hook_status=0`, `callback_count=7042`,
  and callback thread 22420. The user confirmed the disposable save was loaded
  and the character stationary in gameplay. The process remained alive after
  the hook disabled itself. Transient evidence: `asi-startup-20928.log` and
  `native-observer-180383-20928.log` under the local diagnostics directory.
- Not proven: callback behavior across all gameplay transitions or long sessions,
  current-build inventory layouts, delivery, or freighter acquisition. No reward
  was dispatched and no inventory or save was accessed by this observer.
- Rollback: previous DLL retained under the external C: staging directory
  `observer-180383-20261002`; replacement requires the game closed and exact
  source/destination hashes. That older DLL rejects the current game build.
  Reward patch and game/save files were not changed.

### 2026-10-02: reported C-class generation; vanilla control prepared

- Build/configuration: the same exact 180383 executable and counter-only DLL
  as above. The installed reward EXML remains SHA-256
  `62840d2810e5ca2b30dccde5f75b9ab5d5ce07ade92ea1e2bb30ba555a9e9732`.
- Conditions/observation: the user reported C class both for ordinary NPC ships
  and a naturally encountered freighter, not just Courier's historical offers.
  No reward was dispatched in this process. The settings list only
  `NMSCOURIERCURRENCYREWARDPROBE` enabled, and the inspected MODS directory has
  its reward EXML and a `.before-explicit-backup` file. No global inventory,
  buildable-ship or fleet table patch was found there. The observer's original
  update forwarding and counter writes do not set inventory class.
- Not proven: a global generation regression, a causal relationship to Courier,
  or normal generation probabilities. The reward patch's narrow intended scope
  does not exclude a loader/merge effect. User observations lack a controlled
  vanilla comparison and a measured sample.
- Further user observations: multitools also appeared C; an expedition reward
  ship expected to be A/S appeared C and was reportedly C in a save editor.
  After changing systems, the user encountered a B-class ship. This contradicts
  an absolute all-C lock but does not establish expected class probabilities or
  whether the expedition reward's original expected class was correct.
- Control preparation: after confirming NMS was closed, verify the exact game
  fingerprint and all three Courier file hashes; copy the proxy, reward EXML,
  and its `.before-explicit-backup` to the external C: staging directory
  `generation-isolation-180383-20261002`, verify every copied hash, and remove
  only those three exact source files. The backup EXML's hash is
  `0745a424670c848ee17e7df5621236bd11b355dd8bd8f0640f3a20abbc1f45a3`.
  A manifest retains relative source paths and expected hashes. MODS contains
  no files afterward; the proxy is absent. Game settings and saves were not
  changed. Vanilla fresh-process class observations are pending.
- Rollback: preserve the external backups; restore only while NMS is closed,
  with expected executable/backup hashes and absent destination files. Existing
  owned entities can retain saved class independently of the removed patches;
  compare naturally generated entities before blaming or changing persistent
  state. Do not edit saves or force class during diagnosis.

### 2026-10-02: static class-generation and reward collision audit

- Build/source: 180383 executable fingerprint above. The installed
  `NMSARC.Precache.pak` SHA-256 is
  `a6371a8b2f065eca33fd306a16cbe2baca9d4ce75806c71e42f74e1ab9295032`,
  matching the corpus archive used for this audit. Inventory MXML SHA-256
  `2b6cb078323e33bfed649c0ed8a6026602a1e580780fbf9d33d30348f73dee25`;
  reward MXML SHA-256
  `8ed7ae909e3cdffba01f02899aee4733d7d63c6c0fc4105ebea7cfce1b9b12d7`.
- Configuration/trigger: new reproducible
  `runtime/research/audit-generation-inputs.py` parses those extracted tables and
  the exact backed-up reward patch. No game attachment, new extraction,
  disk maintenance or save access. Transient report: `static-audit.json` in the
  external generation-isolation staging directory.
- Observed: Poor inputs are C/B/A/S=60/30/10/0, Average=49/35/15/1,
  Wealthy=30/40/28/2, and Pirate stores 5/5/5/5. Do not normalize or interpret
  the Pirate values as final probabilities without tracing its selection path.
  The patch's only top-level property is GenericTable. Its three entry selectors
  match the three Courier reward IDs, and none collide with any original reward
  table Id property. The original specific-ship payloads contain 19 S, 66 A,
  two B and two C class definitions across all tables; some payloads lack an
  enclosing reward ID. Thus original reward data has not universally changed to
  C. The installed observer source only counts callbacks, forwards original
  Update and disables that hook; no class assignment is present or linked.
- Not proven: live merged reward data, the player's economy or entity-selection
  path, a particular expedition reward's expected class, or whether another
  historical integration changed an already-owned entity. Static parsing is not
  an implementation of the game's EXML merger. A linked documentation page was
  unavailable through browsing; no merger behavior was inferred from that error.
- Next/rollback: request the affected reward ship's exact name/model for a
  deterministic original-data lookup. Leave the proxy and patch isolated until
  the cause is understood; the removed files' verified backups remain intact.

#### Targeted Starborn Runner lookup

The user identified the affected ship as Starborn Runner. Hello Games identifies
that ship as the Omega/expedition-twelve reward in its
[Omega update announcement](https://www.nomanssky.com/omega-update/).
Running the same audit with `--model WRACER.SCENE.MBIN` found two original
payloads: `RS_S12_SHIP` and `RS_S12_COMPLETE`. Both specify
`MODELS/COMMON/SPACECRAFT/FIGHTERS/WRACER.SCENE.MBIN`, ship type Royal and inventory
class S. This verifies the user's expected class from the current original data;
the report of an acquired C instance is not explained by those source payloads.
It does not prove when or where its class changed. Do not dismiss that report as
ordinary random generation, and do not infer the patch caused it without a
live acquisition/merged-data comparison. Existing owned-ship class may remain
saved after removing runtime integration. No save was read or modified here.

| Subject | Location or identity | Use |
| --- | --- | --- |
| Tested game executable | Steam Windows build 179666, SHA-256 `b7913f268dfc62386b6b68f524bfc8ade4a44a9f4fbad39085b7bf51be3680cb` | Gate every runtime test; reject other builds |
| Historical known-good delivery DLL | `runtime/native/asi/`; SHA-256 `f20d9b41344fc7460471979f56598108ed8f750327a202b879a0716d651a441d`, backed up before the 180383 observer installation | Older-build native XInput forwarding, update callback, one-shot local reward triggers |
| Installed 180383 observer | `callback_observer_180383.c`; DLL SHA-256 `755f8d374f13e1db4eb962f6bc8573bddaab58a22a7c8f903cd38b6c101d627d` | Observation only; 7,042 callbacks and successful timed hook removal in process 20928 |
| Current installed reward patch | `GAMEDATA/MODS/NMSCourierCurrencyRewardProbe/METADATA/REALITY/TABLES/REWARDTABLE.EXML`, SHA-256 `62840d2810e5ca2b30dccde5f75b9ab5d5ce07ade92ea1e2bb30ba555a9e9732` | Maps the third currency test event to the explicit freighter offer for the next fresh-process test; Quicksilver is not available through that event while installed |
| Original currency reward backup | Local development scratch copy SHA-256 `d67a57493af349e6a50d624537e5fdce59fdfdd2d29a6e2a63366e6c817f08e7` | Restore only while the game is closed, with exact-hash checks |
| Live process diagnostics | `%LOCALAPPDATA%/NMSCourier/diagnostics/native-hook-<PID>.log` | Read callback and one-shot dispatch state; state `2` alone is not user-visible success |
| Reward and inventory sources | `runtime/mods/`, `runtime/native/asi/inspect-freighter-state.py` | Rebuild experiments and perform exact-build read-only inventory checks |
| Source research | [research decisions](RESEARCH_AND_DECISIONS.md#direct-free-freighter-offer-build-179666) | Trace upstream clue, extracted table field, live validation, and limitation |

The installed reward patch above is a development test configuration, not a release artifact. On 2026-09-24 the game was closed; executable, DLL, patch, and backup hashes were rechecked, and the only Courier mod directory in `GAMEDATA/MODS` was `NMSCourierCurrencyRewardProbe`. The repository was clean after commit `941fb1b` was pushed to `origin/main`.

## What was tested

The 2026-10-01 bulk-data investigation uses a newer installed executable: Windows
file/product version `180383`, SHA-256
`671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.
This is an offline extraction fingerprint, not a new runtime compatibility claim.

### 2026-10-01: offline comparison of delivery routes without offer UI

- Scope/configuration: `runtime/research/research-delivery-routes.py`, SHA-256
  `b8498bb76d2dfb9dbc6e8d59ac961e53dfd5090b42517e3ca7b5d1e48e7a9c88`; corpus executable build 180383,
  SHA-256 `671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.
  Read-only SQLite/selected XML inspection and bounded Lua inspection of the four
  supplied ZIPs. No game/save conditions apply and no runtime trigger was sent.
- Sources/provenance: archive/XML fingerprints and all four ZIP hashes retained
  in `E:\NMS-Courier-Research\delivery-routes.json`. Recipe, class, gift and
  slot payloads are schema clues. Re-inspected REWARDTABLE and buildable globals;
  separately inspected fleet globals and expedition reward field names.
- Observed: generic ship rewards have 86 non-freighter gift=true payloads and one
  freighter gift=false payload. Three ship-class and seven weapon-class upgrade
  payloads exist. Ship/weapon slot rewards expose window/token/cost fields.
  There is no demonstrated freighter-targeted class-upgrade call in this evidence.
  Buildable-global inline payloads are outside the collector's generic-entry
  scope; its empty generic count must not be interpreted as missing schemas.
- External reference: NoMansSky.Api inspected at
  `1974810b828802377129a03bb96fa2d6f10ded8a`; GitHub API reports last push in 2023.
  Its C# inventory extension delegates element access, not a demonstrated native
  freighter grant. Frameworks are research references; none installed or run.
- Decision: compare reward gift branches and native acquisition/finalization,
  with independent owned-entity upgrades and per-request generation as candidate
  routes. An offer is no longer mandatory. See [delivery alternatives](DELIVERY_ALTERNATIVES.md)
  for the matrix, order and proof requirements. This is an investigation plan,
  not new production capability or an adopted external dependency.
- Not proven: gift flags bypassing UI, freighter support in ship upgrade rewards,
  any build-180383 native function address/ABI, S/120/60 acquisition, 120 technology
  slots, all-supercharged slots, persistence or remote-player delivery.
- Rollback: no runtime mutations, data-patch installation, save editing, disk
  commands or proprietary-source copying. Only authored research and external
  evidence metadata were generated.

### 2026-10-01: completed corpus summaries and E: storage observation

- Source/configuration: existing batch, navigation and delivery-data tools;
  `runtime/research/summarize-corpus.py` SHA-256 `e91e2662f3e535586db444bb567e668c13b5efb949b962f6167b210245637f54`.
  Offline build 180383 executable SHA-256
  `671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`;
  compiler/dependencies match the earlier E: extraction entries. No save or
  runtime attachment; trigger was the completed corpus and user summary request.
- Observed: extraction finished at 2026-10-02 00:02:38 UTC (October 1, 21:02:38
  America/Fortaleza). All 97 PAKs processed, 194,641 entries extracted without
  extraction failures, 106,482 MBINs converted/indexed. One conversion failure:
  `metadata/inputtest.mbin` produced no MXML. No retries were attempted.
- Outputs: `E:\NMS-Courier-Research\SUMMARY.md` groups formats and archive outcomes;
  `navigation/` imports 194,641 data filenames, 52 source files and 110 source
  functions. Native exports are unavailable and explicitly warned. Delivery
  evidence covers three tables, one freighter reward and seven model definitions.
- Storage observation: E: Samsung 970 EVO Plus NVMe disk 1 remains Healthy/Online;
  volume Healthy/OK, 163,077,390,336 bytes free before summary generation. System
  queries since extraction start found six storahci event-129 warnings and no
  disk/NVMe/NTFS warnings. The watcher recorded normal worker exit. Physical
  reliability counters were denied CIM access; wear, temperature and uncorrected
  error totals could not be verified. Healthy summaries do not prove hardware
  reliability or establish the cause of the former D: failure.
- Not proven: native executable decompilation, game call identities, physical
  SSD health certification, or runtime integration support for this build.
- Rollback: only external summary/navigation artifacts created; no disk repair,
  encryption changes, game/save/mod changes, or extraction retries. Completion
  notification was delivered and the heartbeat was paused.

### 2026-10-01: full E: corpus rebuild started with conservative limits

- Source/configuration: `runtime/research/bulk-game-data.py`, SHA-256
  `63fa5ba037bdd67c10a7727e1749fef6c1b1cd56a48c04bdab9012425ccffd55`.
  Offline executable build 180383 SHA-256
  `671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`;
  compiler/dependencies match the three-table pilot above. Start 22:06:13 UTC.
- Trigger/conditions: explicit user authorization to extract all NMS archives.
  Inventory-only inspection found 97 PAKs, 194,641 entries, 106,483 MBIN candidates,
  71,022,968,519 uncompressed bytes. No game attachment or save conditions apply.
  Output `E:\NMS-Courier-Research\corpus`; report mirror/stdout/stderr on C: at
  `%LOCALAPPDATA%\NMSCourier\diagnostics\extraction-e-20261001`.
- Limits: one archive at a time; extraction throttled to 16 MiB/s; three seconds
  between archives; two logical CPUs for the converter; 20 GiB free-space reserve
  monitored during extraction/conversion/indexing. Storage and SQLite errors stop
  the worker rather than continuing to other archives. Unsupported conversions
  are indexed as failures. CPU limiting does not make converter I/O serial.
- Observed at startup: worker PID 17636 running, Precache extraction active,
  stderr empty, exact executable/compiler/dependency fingerprints recorded.
  Thirteen Python tests pass, including converter termination at the reserve.
- Follow-up observation: Precache conversion exited 0 and XML indexing began.
  Compiler affinity mask 3 confirmed two logical CPUs. Windows recorded new
  storahci/RaidPort0 reset warnings; the target remained online/Healthy and maps
  to Samsung NVMe disk 1. No target disk/NVMe event was observed in that query.
  A separate read-only storage monitor, `watch-extraction-storage.ps1`, started
  at 22:09:54 UTC (PID 26056). It can terminate the verified worker/compiler on
  target availability, space, disk-1, NVMe or NTFS failures; unrelated SATA events
  are logged. Its JSONL and stderr must be checked alongside the corpus report.
- First completed archive: Precache has 14,759 extracted entries, all 14,759
  MBINs converted and indexed successfully. MetadataEtc extraction then started;
  this remains partial progress toward the complete 97-archive run.
- Not proven: completion, aggregate conversion coverage, physical disk reliability,
  executable decompilation, or runtime support. Read the external report for live
  status; the initial startup entry must not be treated as completed extraction.
- Rollback: only new external corpus and C: diagnostics created. D:, game assets,
  mods, saves, encryption and storage configuration unchanged. Do not remove a
  live run.lock or start another writer; investigate the logged failure before
  explicitly resuming an interrupted run.

### 2026-10-01: bounded three-table rebuild published on E:

- Source/configuration: `runtime/research/extract-mbin-pilot.py`, source SHA-256
  `c94c5cc511ea0beba19540df0439f9b9e4966506d6b303a6505c2c05c5e0d2b3`;
  executable build 180383, SHA-256
  `671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.
  Precache SHA-256
  `a6371a8b2f065eca33fd306a16cbe2baca9d4ce75806c71e42f74e1ab9295032`.
  MBINCompiler 7.04.1-pre3 SHA-256
  `4179dddb665f7cddbe9dddddf6e529172abdd98b0097f65fdd224467d5bb3ea4`;
  HGPAKtool 1.1.3, zstandard 0.25.0, lz4 4.4.5.
- Trigger/conditions: offline CLI, no save or runtime attachment. Three explicit
  logical paths only: REWARDTABLE, INVENTORYTABLE, AISPACESHIPMANAGER. Extracted
  and converted serially on C:, then published one file at a time in
  `E:\NMS-Courier-Research-Pilot-20261001`; independent staging report remains in
  `%LOCALAPPDATA%\NMSCourier\research-staging\pilot-20261001` on C:.
- Observed: all three MXML files parse, and all six published MBIN/MXML files pass
  readback SHA-256 checks. Payload 11,165,040 bytes plus report. MXML hashes match
  the earlier recorded tables. E: maps to Samsung disk 1; Windows reports Healthy,
  with 255,667,372,032 bytes free after publication. The bounded post-run System
  query returned no warning/error events from disk, storahci, stornvme, or Ntfs
  during the preceding five minutes. Earlier disk-0 removal remains a separate
  recorded event; these observations do not establish its cause.
- Failed preflight: both BitLocker status commands were denied access. Their
  output cannot determine E: encryption status. No encryption settings were
  changed. The WindowsApps Python alias could not see the compiler downloaded by
  PowerShell; switching to the direct Python 3.14 runtime resolved the file lookup.
  That first failed attempt stopped before extraction/publication.
- Not proven: whole-corpus reliability, physical disk health, all MBIN mappings,
  native function identities, or runtime delivery support for build 180383. No
  full batch or native decompilation was restarted. Twelve Python tests pass,
  including containment, existing-directory preservation, and converter-budget
  termination fixtures.
- Rollback: no game files, mods, saves, D: files, partitions, or BitLocker settings
  changed. New research files remain available; no automatic cleanup or retry.

### 2026-10-01: external research storage diagnosis; repair blocked by OS privileges

- Scope/configuration: read-only inspection of D:, its research metadata, Windows
  System events, volume/partition information, and process inventory. No corpus or
  native-analysis workers remained active. The affected artifacts belong to the
  previously recorded build 180383 executable fingerprint
  `671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`;
  no game or save was accessed.
- Observed: D: maps to physical disk 0. Windows reported repeated System event 51
  paging-operation errors on `Harddisk0`. Volume and disk health summaries still
  reported Healthy/Online, so those summaries did not exclude actual I/O failures.
  Corpus SQLite/header reads failed; the full 6,434-byte `corpus/report.json`
  consisted of zero bytes, SHA-256
  `068789ae01065e68dd3a1aaaebac7ec6b8c4665f312cdfca93a14280ab60d13f`.
  Native report/log reads also failed. The specific hardware or filesystem cause
  is not established by these observations.
- Preservation: copied the readable zero-filled report verbatim to local C:
  diagnostics with a JSON diagnosis record. Inaccessible database/native files
  remain untouched; a complete backup could not be claimed. No further research
  writes were initiated on D:.
- Reproduction: `Get-Partition -DriveLetter D`, `Get-Disk`, `Get-Volume -DriveLetter D`,
  and `Get-WinEvent -FilterHashtable @{LogName='System'; Id=51}` expose the mapping
  and events. Python binary reads identify the zero-filled report without dumping
  assets. Read-only `chkdsk D:` and `fsutil dirty query D:` returned access denied;
  storage reliability counters also denied CIM access.
- Limits/rollback: OS privileges prevented filesystem verification/repair in this
  session. No format, forced dismount, filesystem modification, deletion, guessed
  SQLite repair, or research re-extraction was performed. An elevated storage
  diagnosis and preservation of other important D: data precede any repair or
  regeneration. The zero-filled report has no original JSON content to recover;
  rebuilding it would require verified retained metadata or a new extraction.

### 2026-10-01: research navigation map and unavailable external imports

- Configuration: [navigation index](RESEARCH_INDEX.md),
  [generator](../runtime/research/build-research-index.py) SHA-256
  `02a2210bf4696269fcb4c36534a480454415887c94aa5ebef2e6f2320f2a1be9`,
  and [synthetic validation](../runtime/research/validate-navigation-index.py).
  The external metadata belongs to the previously recorded 180383 executable
  fingerprint `671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`;
  this navigation operation did not read or attach to the executable or a save.
- Trigger: build repository-source, corpus-file, and Ghidra-function navigation
  metadata with bounded FTS queries; source links are preserved with line numbers.
  Generated SQLite/JSON/Markdown outputs used a disposable local temporary directory
  because external inputs in D: could not be read reliably.
- Observed: 48 repository source files and 99 source-function entries were indexed.
  Corpus SQLite returned `disk I/O error`; its report could not be parsed as JSON;
  native report/export reads also failed. Failed imports were rolled back and
  reported, so no external asset or native-function counts were invented.
- Validation: synthetic fixtures passed complete import, one-result filtered search,
  executable-fingerprint/RVA preservation, rebuild, and rollback after a partially
  imported malformed native TSV. An initial check exposed permissive malformed-row
  handling; explicit required-field/RVA validation fixed it before the passing run.
- Limits/rollback: Python entries use AST, C entries use signature matching, and
  topic labels use keywords. None proves a game function's identity or runtime
  safety. No game, mod, bridge, corpus asset, or save was changed. Storage repair
  and final native-analysis results remain unresolved; the generated source map
  and import code remain reproducible without the external files.

### 2026-10-01: resumed offline research and Pirate model reference

- Build: installed executable 180383, SHA-256
  `671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.
  No save or running-game test was needed. The user was unavailable for live tests.
- Source/configuration: [research scripts](../runtime/research/README.md), pinned
  HGPAKtool/MBINCompiler above, Ghidra 12.1.4 ZIP SHA-256
  `ddac49f903da9d5bac833e5cc79395098b9c33cfd3279be5f31bd00387d2d4db`, portable
  Temurin JDK 25.0.4.1+1 ZIP SHA-256
  `00c847d804f4a78e9f04f2683faf14fed898535b177b7fc704486cb0284e9283`.
  The Adoptium API returned HTTP 403; the official GitHub release and its checksum
  provided the pinned JDK instead. No global Java configuration was changed.
- Trigger/observations: resumed the 97-PAK batch with delivery tables prioritized;
  all 14,759 Precache MBIN candidates converted/indexed successfully. Nine unit
  checks passed, including malformed interrupted XML and numeric index filtering.
  The Ghidra Java exporter compiled against the downloaded release with exit zero;
  full headless executable analysis was started separately and remains pending.
- Concrete data discovery: the three-table summarizer found reward `RS_S13_S4M6`,
  seven freighter AI model entries, and unchanged FreighterLarge generation bounds.
  Model `FREIGHTER_CAPITAL_PIRATE` references the actual Pirate scene; its existence
  was independently confirmed in the EntitySceneMBIN archive (821,912 bytes).
  Table and PAK hashes are recorded in [research decisions](RESEARCH_AND_DECISIONS.md#offline-corpus-and-native-analysis-build-180383).
- Offline reward experiment: [the Pirate variant](../runtime/mods/freighter_pirate_model_research/README.md),
  source SHA-256 `6dd9e3c84f7b2357811ce51290c3858d481a4cbac5bf0974e1f5bd395f2ff62b`,
  compiled/decompiled with exit zero. Assertions retained Pirate scene, requested
  seed, S inventory class, 10 × 12 cargo, 60 technology request, and zero cost.
- Limits/rollback: no game executable, bridge, installed mod, or save was changed.
  No offer was sent. Source variants are uninstalled; schema retention and model
  existence do not prove a Pirate/S-class offer, slot unlocking, or supercharging.
  The remaining archive conversions and native candidate exports are still pending;
  consult external reports for eventual results rather than treating launch as completion.
- Indexing correction: a full-scan FTS cleanup per asset slowed the first metadata
  indexing attempt. The exact corpus worker was stopped, then restarted with an
  ordinary archive/path-to-rowid key table; existing indexed rows were migrated.
  Migration, replacement, cross-archive isolation, and repeated-slot preservation
  passed the nine-test suite. Converted assets were retained.
- Conversion failure: `metadata/inputtest.mbin` (560,144 bytes) was rejected as
  invalid MBIN. Its header starts `cccccccc00000000` and names `TkInputFrameArray`.
  The failure is recorded; no guessed header repair or fabricated conversion was
  used. MetadataEtc's converter reported 49,946 conversions and one failure;
  index validation remains the authority for individual success records.
- Extended reward evidence: the generic table supplied concrete slots, gift
  weapon, installed-tech, and UI-message payloads, with IDs and bounded examples.
  These offline schema findings are documented in research decisions and are not
  advertised as tested capabilities.
- Checkpoint after the indexing correction: Precache had 14,759 successful XML
  index records; MetadataEtc finished with 49,946 successes and the one input-test
  failure. All 49,947 MetadataEtc binary assets extracted successfully. The batch
  advanced to EntitySceneMBIN, SHA-256
  `58958536e58dfaeb81e0423b5508c7d3dbf3713bac09e857577feb275d9f2627`.
  No remaining PAKs are declared complete at this checkpoint.
- Native analysis checkpoint: Ghidra remained active beyond the requested analysis
  timeout, with its main thread waiting for `ConstantPropagationAnalyzer` parallel
  work. Its diagnostics also reported missing PDB, an invalid embedded PNG, and
  failed disassembly paths. These are recorded analysis limitations, not game
  crashes or verified function identities; final native exports remain pending.

### 2026-10-01: resumable bulk-data corpus

- Source/configuration: [bulk-game-data.py](../runtime/research/bulk-game-data.py),
  HGPAKtool 1.1.3, zstandard 0.25.0, lz4 4.4.5, development Python 3.14.7, and
  MBINCompiler 7.04.1-pre3 SHA-256
  `4179dddb665f7cddbe9dddddf6e529172abdd98b0097f65fdd224467d5bb3ea4`.
- Trigger/conditions: read-only scan of installed `GAMEDATA/PCBANKS`; no save read,
  runtime attachment, reward trigger, mod installation, or executable write.
  Compiler conversion uses explicit MBIN input/MXML output and an empty exclude
  filter, so its default geometry/language exclusions do not silently omit data.
- Observed: four reward/inventory-related tables converted successfully and a
  separate `.GEOMETRY.MBIN.PC` candidate produced validly named `.GEOMETRY.MXML`.
  Unit checks passed for traversal/drive/alternate-stream rejection, XML symbol
  extraction, malformed XML rejection, and observed geometry output naming.
  An isolated end-to-end D: validation corpus extracted and converted all six
  files in `NMSARC.MeshPlanetSKY.pak` (archive SHA-256
  `f7ae7fd21fe7c93bed2f269b474bcb25014f105cdd4129c393731430f3eefebb`). A second run
  reused all six records without invoking conversion, and an FTS query for
  `IndexCount` returned the corresponding generated MXML paths.
- Failed/revised approach: resolving every individual destination against the
  filesystem was too slow on a 49,947-entry archive. The pilot was stopped and
  replaced by lexical traversal rejection plus cached parent-directory containment
  checks during writes. The revised extraction recorded over 25,000 successful
  files without an extraction error before the user requested moving work to D:.
- Storage/rollback state: research tools were moved to
  `D:\NMS-Courier-Research\tools`. The partial C: corpus and small pilot outputs
  were relocated to `D:\NMS-Courier-Research\previous-pilot` because recursive
  deletion was rejected by automatic command review. A fresh full run was started
  against all 97 PAKs in `D:\NMS-Courier-Research\corpus`; the previous generated
  directory on C: no longer exists. Its `report.json` and
  `index.sqlite` are transient local evidence. Extraction/decompilation completion
  and compatibility across all MBIN types are not yet proven. Installed game files
  and saves were not changed; no old-build mutation was attempted on build 180383.

| Date | Experiment and trigger | Observed result | Boundary or rejected hypothesis |
| --- | --- | --- | --- |
| 2026-09-22/23 | Native XInput startup proxy, exact-build `cGcApplication.Update` hook | Game loaded and one read-only run observed 7,319 callbacks | A callback is not a delivery command channel. Python/pyMHF's earlier authentication did not reliably produce callbacks in later test processes. |
| 2026-09-23 | One native `cGcInventoryStore.Add` call for `FUEL1 ×500` | User saw a second Carbon stack; total went 15 → 515 and persisted after normal reload | No native pickup notification or automatic stack merge was proven. |
| 2026-09-23 | One-shot `GiveGenericReward` IDs for Units, Nanites, Quicksilver | User confirmed +1,000,000,000 of each, right-side native notifications, and normal-save persistence | The test DLL uses named events, not the authenticated Electron command channel. |
| 2026-09-23 | First freighter-specific reward from normal gameplay | Free acquisition offer opened; user accepted C-class freighter. Units balance stayed unchanged. Read-only owned inventory later showed 35 valid main and 13 valid technology slots. | Reward's S class and 120 layout values did not configure the offer. The 21-position technology grid was not 21 unlocked slots. |
| 2026-09-23/24 | Startup with a separate `FreighterOfferTest` DLL | NMS showed a hang/modification error before startup/hook diagnostics. No offer was sent. Known-good DLL was restored. | Passing the isolated fixture did not prove safe game startup. Do not reinstall this rejected DLL unchanged. |
| 2026-09-24 | Scoped live generation-table values set to 120/60 and S=100 only during reward dispatch | One offer remained C class, 35 cargo positions, 21 technology grid positions. User declined. Original table bytes were observed after the call. | The reward callback was too late or ignored these generation fields. This is not a per-offer solution. |
| 2026-09-24 | Explicit reward inventory width 10, height 12, `NumSlotsFromTech=60`, FreighterLarge override | One offer showed C class, 120 cargo grid positions and 30 technology grid positions. User closed it without accepting. Owned freighter remained C/35/13. | Cargo grid dimensions affected UI; 120 valid cargo slots, S class, 60 technology slots, and supercharged slots were not proven. The C-class technology cap in the extracted table is 30. |
| 2026-09-24 | Fresh-process repeat of the explicit offer, one event in PID 13152 | Before dispatch, the loaded owned freighter was C/35 main and 13 technology valid slots, and the frontend store was empty. During the open offer, the user confirmed C/120 cargo/30 technology. The frontend stores read C class, 120 valid main-grid bits and 30 valid technology-grid bits; the player-state main store also temporarily read C/120 while the offer UI was open. The user declined, then manually closed the game. | The player-state header is not a reliable ownership check while this preview is open. The process ended before a post-decline read, so this repeat did not prove what was restored or saved. No crash was reported, and no second event was dispatched. |
| 2026-09-24 | Preflight for a new class-generation-window test in PID 8544 | New process had a ready callback and unused reward event. With the frontend offer stores empty and **before any new dispatch**, the player-state freighter main store read C/120 while its technology store still read C/13. The original test script's C/35/13 precondition would have rejected this state. The user then closed the game to leave; no class probabilities or reward were changed in this process. | The user later clarified that they had replaced their freighter with a previous C/120 offer. The read was therefore consistent with the reported ownership change; it was not evidence that declining an offer changed the save. |
| 2026-09-24 | Fresh-process read-only preflight in PID 17828 | Verified executable, installed DLL, and reward patch hashes; callback and one-shot event were ready. After the save loaded, the player-state freighter stores read C/120 valid cargo bits and C/13 valid technology bits; all three frontend offer stores remained empty 1 × 1 placeholders. The user clarified they had accepted a prior C/120 offer and replaced the original freighter. No reward or class-probability mutation was triggered during this read. | This explains the changed owned-cargo reading. It does not prove that the new class-window experiment can yield S class, 60 technology slots, or supercharged slots. |
| 2026-09-24 | First class-window script attempt in PID 17828, before reward dispatch | The temporary probability write was issued, but its readback failed because PowerShell could not resolve the generic `SequenceEqual` overload. `finally` issued the baseline restoration; independent read-only inspection then found all four probability rows at their original values, frontend offer stores empty, and one-shot state still `0`. The verifier was replaced with byte-by-byte comparison. | **No offer was sent.** The exception was a verifier defect, not evidence about freighter class generation. Do not infer a reward outcome from this attempt. |
| 2026-09-24 | Corrected class-generation window in PID 17828, one explicit reward event | Exact-build preflight passed with owned C/120/13 and an empty frontend offer store. The script temporarily set the four shared economy class-probability rows to S=100, signaled one reward, observed frontend C/120/30, and restored the original rows. A separate read-only inspection verified all original probabilities and the offer's C/120/30 inventory headers; the user supplied a screenshot confirming C/120/30 in the game. The one-shot state became `2`. The user declined; a subsequent read still showed owned C/120/13. | Temporarily changing those probability rows **did not produce S class** for this offer. It does not identify whether class was selected before the window or by a separate path. The frontend stores retained stale C/120/30 headers after decline, so nonempty headers alone cannot prove an offer remains open. |
| 2026-09-24 | Temporary frontend offer-class probe in PID 26640 | A fresh exact-build process loaded the same disposable save with owned C/120/13 and empty offer stores. One explicit reward event opened C/120/30; the user kept the offer open. [The probe script](../runtime/native/asi/probe-freighter-offer-class.ps1) passed its active-offer preflight, set only the two frontend inventory class fields to S for eight seconds, read both fields as S on every second, and restored both C fields. Independent post-probe inspection found owned C/120/13, frontend C/120/30, and baseline class probabilities. The user reported the visible badge remained C throughout, then declined. A further read confirmed owned C/120/13; the frontend technology-store element count fell from 2 to 0. | The two observed frontend class headers are not sufficient to update the already displayed class badge. This does not rule out an earlier initialization/copy path or a separate UI model. No S-class offer or ownership was achieved. The stale C/120/30 frontend headers again remained after decline. |
| 2026-09-24 | Read-only reference-save comparison in PID 26640 | The user loaded a separate, previously modified reference save in the same verified process. The owned freighter main and technology inventories read C class; both had 10 × 12 grids and 120 valid bits. The technology store contained 540 `TechBonus` special-slot entries, covering exactly 120 unique coordinates inside the grid. Freighter cargo index 9 was empty and carried an S class header, which did not match the visible main/technology C class. No Courier event or process-memory write was performed in this save. | This demonstrates that this save can load 120 valid technology positions and 120 unique technology-bonus positions, but the 540 entries include duplicates and do not prove a clean vanilla generation path, an S-class freighter, or Courier delivery. The user is independently changing this reference save to S for a before/after comparison; Courier must still use a live delivery path. |
| 2026-09-24 | User-edited reference save reloaded in PID 4548, read-only comparison | The user independently changed the reference freighter to S with a save editor and reloaded it. The same exact executable and installed Courier test files were present; no Courier event was signaled. The owned main and technology inventories changed from C to S, while both retained 10 × 12 grids with 120 valid bits. Technology retained 540 `TechBonus` records over 120 unique in-grid coordinates. The user confirmed the visible freighter badge now shows S. | This verifies the reference save's S presentation and the live header values after an external save edit. It is **not** a Courier delivery method or evidence that changing an already open offer's headers will update its cached badge. Courier did not edit this save. |
| 2026-09-24 | Offline exact-executable frontend signature search | [The read-only locator](../runtime/native/asi/locate-frontend-hooks.py) used the pinned NMS.py `cGcFrontendManager` signatures and required the build 179666 executable hash. It found one `.text` match for `QueueFrontendPage` at RVA `0x3EB4D0` and one for `RenderPage` at RVA `0x900710`. No running process or save was touched. | Unique signature matches are research candidates, not live-verified function identities, safe hook sites, or a class setter. No DLL using these addresses has been compiled or installed. |
| 2026-09-24 | Offline frontend call-site analysis and read-only reference-save queue check | The hash-checked locator found two possible direct calls to `QueueFrontendPage`; disassembly with [the pinned-executable function inspector](../runtime/native/asi/inspect-executable-function.py) confirmed a call at RVA `0x1062E0F` with page argument `5`. The candidate queue routine writes a three-entry ring. A new optional queue read in the running S-class reference save, PID 4548, showed all three entries empty (`-1`), next index `0`, and owned S/120 cargo/120 technology unchanged. No Courier event, process write, or save edit occurred. | Static call proximity and a page number do not identify the freighter-offer path. The queue was observed only while idle, not during offer creation. Byte-level call-site candidates require instruction-boundary checks; the disassembled `0x1062E0F` call passed that check. No new hook has been installed. |
| 2026-09-24 | External read-only frontend watcher baseline in PID 4548 | [The exact-hash-checked watcher](../runtime/native/asi/watch-freighter-offer.py) polled the reference save for two seconds at a requested 5 ms interval: 347 samples, one initial state, no transition. All three queued pages were `-1`; both frontend offer stores were empty 1 × 1 placeholders, class header C, zero elements. No game-memory writes, reward signal, or save access occurred. | This confirms the watcher's idle baseline on the reference save, not its ability to capture a brief offer transition. The next observation belongs on the disposable save before and during one new offer; a missed page transition is possible with polling. |
| 2026-09-24 | Disposable-save offer timing watch, one explicit reward in PID 17696 | The installed executable (`b7913f26…`), bridge (`f20d9b41…`), and reward EXML (`62840d28…`) matched the pinned full hashes above. Loaded-save read showed owned C/120 valid cargo/13 valid technology, personal Carbon 515, empty frontend stores, and unused one-shot state `0`; the new no-signal preflight passed. The watcher started before one `COURIER_QS` event. Across 8,591 samples in 55 seconds, it logged one transition at 22,165 ms: queue index `0→1` and frontend store 0 changing from 1 × 1 to C/10 × 12/120. Every captured queue entry remained `-1`, so the page number was missed. The user confirmed the resulting offer visually as C/120 cargo/30 technology. A separate read found frontend store 2 at C/10 × 3/30 valid bits. The event reached state `2` and was not repeated. The user declined; owned state remained C/120/13, while stale frontend C/120/30 headers persisted. | Queue-index movement coincides with offer creation, but does not prove page `5` or identify the class initialization function. The first watcher version accidentally sampled frontend store 1 as “technology”; after correction it reads all three stores. The frontend technology element count changed from 2 to 0 while the user still reported the offer open, so that count is **not** a reliable active-offer guard. No S, Pirate model, 60/120 technology slots, or supercharged offer was delivered. |
| 2026-09-24 | Offline audit of four supplied mod archives and default-seed source update | Inspected the exact user-supplied ZIPs without installing or copying third-party assets: OnlyS SHA-256 `7326f3b9f4cbfde3f866f50df76870cf32937a1a26731aa6183bad19ee027c19`, SquareSCSlots `469913b90e97e591760fc551496e883b34a8f80999e61b033fcf72a3061caeab`, Season Rewards Unlocker `f460b115497c863f41da5bca3876ce4e7b3406fe8a4f203c696665b2514912d6`, Meta-Mod `9e03f6604fb10a248f8e499b7a6658253684b9bc297b788b1e2f4f90630fb771`. Read Lua source, packaged fragments/assets, and target MBIN paths. OnlyS variants change shared generation tables; Season and Meta wire in-game menu actions to `GcRewardAction`. The two uninstalled Courier reward source variants now contain the requested seed `0x1AD0003900054` as decimal `471690548084820`. No running process, installed EXML, DLL, or save was changed by this audit. | These archives do not prove an external per-offer class/model setter. SquareSCSlots does not raise the freighter supercharged-slot count beyond four. Meta-Mod's custom-seed generator is commented out. The Courier source still uses the ordinary procedural freighter scene; the seed does not prove Pirate type. The updated reward source has not been compiled, installed, or tested in game. Full analysis is in [runtime research](RESEARCH_AND_DECISIONS.md#direct-free-freighter-offer-build-179666). |
| 2026-09-24 | Offline `NumSlotsFromTech=120` reward and full-copy inventory-table control | MBINCompiler 7.04.0.1 round trips retained 120 in the reward, S technology cap 120, and FreighterLarge 10 × 12 technology bounds in the control | Serialization is not in-game support. The full-copy control includes global generation changes and was never installed. |
| 2026-09-24 | Sparse named `INVENTORYTABLE.EXML` array targeting check | Round trip placed requested FreighterLarge values into the first SciSmall array entry | Sparse inventory-table patch was removed from the repository and must not be installed. Use complete ordered data or a verified property-targeted builder. |

## Next reproducible gate

The specific freighter offer can be opened free of charge from ordinary gameplay, but its class is still generated as C. Determine the native path that creates or initializes **that particular offered freighter**. Use read-only inspection before any targeted mutation. Verify S class, 120 **valid/unlocked** cargo slots, and 60 valid technology slots in the offer and after acceptance. Only then assess a 120-technology experiment, because the vanilla S cap is 60 and the game may clamp or reject larger grids. Supercharged slots are a separate field and require separate evidence. Do not repeat a one-shot event in the same process or install a broad all-freighters generation patch to make this test appear successful.

The [class-generation window script](../runtime/native/asi/signal-freighter-class-window-test.ps1) now has a recorded negative live result: an S=100 window surrounding reward dispatch still yielded a C-class offer, and the original probability bytes were restored. `-PreflightOnly` checks the exact-build conditions without writing or dispatching. Do not repeat the same class-probability hypothesis. Investigate where the particular freighter's class is initialized or copied into the offered inventory; test any proposed hook on this verified build and keep global generation unchanged outside a bounded diagnostic. No automatic retry of the consumed one-shot event is permitted.

The [offer-class probe](../runtime/native/asi/probe-freighter-offer-class.ps1) also has a negative live result: both temporary frontend inventory class fields read S for eight seconds, but the user's badge remained C. The probe restored the original values and did not change the owned freighter. Do not repeat this same two-field mutation as a class solution. The active-offer marker (technology-store element count) dropped to zero after prior decline and rejected stale headers during the PID 17828 preflight; it is a diagnostic guard, not a full UI-state API. The next research target is the actual game state or function that sets the visible offered class before the offer screen opens, with read-only instrumentation first.


## 2026-10-02: Armed current-build reward argument collector

- Build 180383 executable SHA-256:
  `671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.
- Exact sources: `reward_observer_180383.c/.S`, `callback_observer_180383.c`,
  startup verifier, XInput proxy and existing MinHook; mode RewardObserver180383.
  LLVM 23.1.2 / llvm-mingw 20260922; warnings as errors.
- Target: offline candidate f12240 and pinned 24-byte prologue. Explicit random
  event arming; 30-minute arm wait, ten-minute observation; 512 immutable records
  containing caller address and ten raw register/stack slots. No game pointer
  dereference, native dispatch, save access or data patch.
- Simulation passed ten distinct arguments, weighted return, pre-signal exclusion,
  buffer bound, overflow forwarding and timed hook removal. 610 original calls
  reached the capacity assertion; another passed after removal. Existing class
  regression PID 18104 passed 2,048-record bound and 2,800 forwarded calls.
- Production rejection PID 9528: 400 forwarded Update calls, exit 0,
  unsupported_build startup diagnostic, no observer log. This is fixture evidence.
- Installation: game closed; executable and prior bridge SHA-256
  `f9379312f6676d03634cf29a239c1744df59164761d8dfcd13d84ba87a01f0fa`
  matched; GAMEDATA/MODS empty. Installed production DLL SHA-256:
  `1cb8ed07471d9ec2f36d566bf3a8a95616b91191123114fa9e8a72a4ea7a8040`.
  Backup/manifest preserved at
  `%LOCALAPPDATA%/NMSCourier/diagnostics/reward-observer-install-20261002181204`.
  Rollback requires NMS closed and installed hash still matching; restore only
  that verified prior DLL. No other game file was replaced.
- Not proven: live collector startup, reward ID contents, manager, full ABI,
  calling thread, readiness or acquisition. Upper bits of narrow arguments may
  be unspecified. No current-build ship, multitool or freighter delivery occurred.
- Next gate: disposable save, arm collector, observe one ordinary native reward
  or expedition offer without buying; correlate caller/arguments before preparing
  a separately gated delivery. No repeated mutation is authorized by a trace.
- Navigation: 70 source files, 147 source functions, 194,641 corpus paths,
  65 native candidates, no warnings. A documentation append initially failed
  because Windows default cp1252 could not decode existing UTF-8; explicit UTF-8
  corrected the append, with no game or storage operation involved.


## 2026-10-02: Procedural descriptor and native seed-algorithm research

Build 180383 / executable SHA-256
`671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.
Sources: `inspect-procedural-descriptors.py`, extended metadata scanner,
`descriptor-metadata-180383.md`, `scan-native-callers.py`; existing corpus and
Ghidra 12.1.4 / JDK 25.0.4.1. Offline trigger only; no save/process prerequisite.

Five descriptor assets yielded 109 conditional groups and 398 option nodes.
Sentinel accounts for 62 groups/190 options. Nested ancestor conditions and
empty descriptor behavior passed synthetic checks. Eight metadata candidates
were exported successfully in 46.1 seconds, no failures; selected exports expose
serialization and field hashing, not a confirmed appearance PRNG. Direct caller
scan of two metadata hash candidates found two instruction-checked edges in
already inspected fragments, not a model generation function. GcSeed had no
metadata string match. MetaIdea's pinned Ship Creator preview traversal does not
provide a demonstrated seed evaluator. Record these negative findings rather
than porting an unrelated hash or bundled random helper.

Evidence: external `seed-analysis-180383/descriptor-choices.json`,
`seed-analysis-180383/metadata-callers/`, `acquisition-180383/descriptors-export/`.
Scope and sources: [procedural seed research](PROCEDURAL_SEED_RESEARCH.md).
No installed executable, bridge, patch or save changed; prior observation DLL
remains installed. Exact seed evaluation, inversion, colors, class and natural
location mapping remain unimplemented/unverified. No delivery occurred.

The user's follow-up Sentinel screenshot was mapped to 24 exact descriptor IDs
in `sentinel-parts-example.json`. Current corpus validation matched all 24 with
no missing/ambiguous IDs or ancestor conflicts. Negative checks rejected
WINGS_V+WINGS_H, SKIRT_B+TEETH_A and a nonexistent ID. These checks validate
conditional metadata only; no seed was derived or evaluated. External result:
`seed-analysis-180383/sentinel-user-constraints.json`.

## 2026-10-02: Procedural generation chain and assembly arithmetic replay

Build 180383 / executable SHA-256
`671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.
Offline only; no loaded save, live trigger or runtime mutation required.
Sources/configuration: bounded public signature terms CreateGenerationTask,
AddResource and ParseData; pinned NMS.py database and supplied nms.center HTML
hashes in [procedural seed research](PROCEDURAL_SEED_RESEARCH.md).
Committed `procedural-*-180383.md` lists reproduce six Ghidra stages on the
existing Acquisition180383 project using Ghidra 12.1.4/JDK 25.0.4.1, max CPU 2.

CreateGenerationTask produced a unique candidate at 1149fe0; AddResource and
ParseData did not match. Six stages exported 15 candidates, all successful,
in 31/19/19/19/19/19 seconds. Traced descriptor preparation through 2d63bf0
and weighted group selection 2d67800. Literal windows resolved xRARE/xNEVER/
xWEIRD, _PLAYER_ and LOD. Name markers affect selection weights in this branch;
raw XML Chance is not sufficient. Explicit choice preparation is separate from
automatic selection. Task submission/construction copies inputs and does not
establish a worker vtable or appearance PRNG by itself.

Implemented experimental seed initialization, multiply/carry advance,
unfiltered weighted choice and reference-child seed mixing. Capstone 5.0.5
disassembly confirmed three arithmetic windows, including a split unwind fragment
that the first-fragment scan missed. A fail-closed instruction interpreter replayed
all three windows for 1,005 fixed/generated seeds (3,015 comparisons) without
mismatch. Three boundary/choice tests passed. No native instructions were executed.

Static HTML inspection found remote seed evaluation and configuration CRC32 keys,
not a client-side inverse algorithm. No remote API, authentication or private
service was used. External evidence: generation-signatures, selector-assembly.json,
selector-child-assembly.json under seed-analysis-180383; six procedural export
directories under acquisition-180383.

Not proven: original ship seed propagation, complete filtered/override selection,
reference traversal order, textures/colors, appearance equivalence with live NMS,
inverse search, natural locations or delivery. Keep proprietary exports external.
Rollback: none needed; game executable, installed bridge, patches and saves were
not changed. No disk repair, storage setting or BitLocker operation occurred.

Navigation rebuilt: 76 source files, 173 source functions, 194,641 data paths,
88 native candidates and no import warnings. Native index regression checks
include the new stages and retain their unverified status.

## 2026-10-02: Appearance category coverage and color-path investigation

Build 180383 / executable SHA-256
`671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.
Offline trigger only, no save prerequisites. Configuration: committed fourteen-root
`procedural-categories-180383.json`, existing descriptor inspector's new bounded
manifest input, `inspect-appearance-fields.py`, texture signature terms and
`procedural-texture-180383.md`. Ghidra 12.1.4/JDK 25.0.4.1; no native execution.

Fourteen additional cTkModelDescriptorList assets yielded 340 groups/986 option
nodes. Reproduction through the CLI retained the same asset contents. Pirate root
has one option referencing a scene; standard/capital freighters have nested groups
and many references. These counts are metadata coverage, not total appearances
or proof of runtime category equivalence. Four texture/customisation palette assets
were inspected successfully with recorded XML hashes. Freighter and multitool
texture selectors expose different palette families/color slots. The initially
guessed industrial texture path lacked the shared/ directory and had no exact
index match; a bounded filename query found the correct path. A Windows rg glob
argument failed with error 123; a corrected directory search completed without
storage changes.

Texture Load/LoadFromDds signatures were unique at 1893960/1894020. Both candidates
exported in 30 seconds with no failures; inspected Load is DDS/pixel loading, not
verified procedural color selection. Do not treat this route as a color decoder.
Descriptor initialization collision 0 versus 0x1000100000001 was confirmed in
the recovered arithmetic and regression-tested for 100 draws. This does not prove
whole-entity/color equality. Other category/resource/input channels remain unknown.

Evidence and category counts: [procedural seed research](PROCEDURAL_SEED_RESEARCH.md),
external category-descriptors-reproduced.json, appearance-fields.json,
texture-signatures and proceduraltexture-export. Complete forward appearance,
color algorithm, inversion, location and per-category runtime support remain
unverified. Rollback: none; installed game/bridge/mods and saves unchanged.

## 2026-10-02: Special reward seed identity and native palette branch

Build 180383, executable SHA-256
`671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.
Offline only; no save conditions or game trigger. Configuration: new bounded
reward preset/catalog and appearance graph scripts, Capstone 5.0.5 arithmetic
region 600000..660000, four committed native TSV seed lists, Ghidra 12.1.4 /
JDK 25.0.4.1, existing pinned PE and external corpus. No native instructions ran.

Reward catalog: 89 specific-ship records, one source, XML SHA-256
`8ed7ae909e3cdffba01f02899aee4733d7d63c6c0fc4105ebea7cfce1b9b12d7`.
Phoenix reward R_TGA_SHIP01 specifies WRACERSE.SCENE.MBIN, decimal seed 6,
source class S, Royal category and gift/reward flags. Other gift=true rewards
specify A: gift alone does not explain S. Small seeds belong with their model
resource, not a universal seed-to-entity catalog. No reward was dispatched.

Mixed dependency graph stopped at its 256-node ceiling (671 edges); preserved
the partial report. Separate Phoenix and Pirate roots completed with 39/50 and
255/567 nodes/edges. Optional descriptor/texture misses remain not_indexed,
not corpus extraction errors. No archive precedence or runtime load order inferred.

Arithmetic scan produced 81 raw occurrences and 19 instruction-checked candidates.
Stage proceduralarithmetic exported three of four candidates; 61f4e0 failed,
with no more specific reason in its headless log. No retry. Palette stages exported
62cbb0/62c960 and 2277f0 successfully. Candidate 62c480 fills 66 palette rows,
using the recovered RNG; row generation selects indices with two draws, remaps
color-count modes, resolves fallback palettes and tests prior RGB colors.
The Freighter family reuses the saved pre-Paint RNG state. Threshold bytes resolve
to float32 2^-32. Complete RGBA/collection/caller propagation is not implemented.

Direct caller scan found 20 checked edges to 62c480; all 20 fragments exported in
40 seconds. Their category roles and ABIs remain unverified, especially split
fragments with unknown registers. Public schema checks use MBINCompiler commit
0e81c91aa51c78d7aa3e298e9ba7532bd0c7c49c, linked in the owning specification.
Initial master raw-source paths returned 404; corrected pinned development paths
worked. A broad FTS output caused a terminal encoding error; bounded path-only
queries replaced it. An unavailable helper filename and a wrong log filename
were corrected through the existing source map/artifact directory. No disk error.

Validation: six primitive boundary/mode tests, three asset-inspector tests and
three native-index tests passed. Existing assembly replay passed 3,015 comparisons
for 1,005 seeds; it covers the earlier integer windows, not palette branch/RGBA
equivalence. New scripts preserve precision, explicit ambiguity/budgets and missing
status. Evidence and formulas: [procedural seed research](PROCEDURAL_SEED_RESEARCH.md).

Not proven: full forward appearance, inverse seed search, live color equivalence,
natural spawn location or new runtime delivery capability. Rollback: none needed;
game executable, installed bridge/mods and player saves unchanged. No disk repair,
BitLocker changes or D: access occurred. Proprietary data/pseudocode stays external.

Final research suite: all 28 tests passed. Navigation regenerated with 82 source
files, 193 source functions, 194,641 data paths and 117 native entries, including
one retained export failure; no import warnings. Diff whitespace check passed.

## 2026-10-02: Base palette evaluator, assembly replay and alternate route

Same build 180383 / executable SHA-256
`671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.
Offline only, no save or game trigger. Source/configuration: evaluate-base-palettes.py,
new palette assembly replay, original basecolourpalettes MBIN fingerprint
`3521862b5b2bfb33afe3a8a5bf5a15b6b60ff60327656ec4f7ca9d5e590b9c4e`,
three new branch/material seed lists, same Ghidra/Capstone/JDK tools.

Implemented candidate 66-family base schedule using exact float32 MBIN colors,
mode lookup remapping, index retries, saved Paint/Freighter state and reseeded
special families. Input seeds 0x6 and 0x1ad0003900054 each yielded 330 colors.
These are explicit base-collection traces, not verified entity color inputs.
Inactive base families remain the native default branch when fallback is the
same base collection; arbitrary collection fallback is not implemented.

First row disassembly only covered a prologue. Inspection of split body 62cbde
recovered draw/mode instructions and SSE reduction B²+(G²+R²). Corrected the
initial Python reduction order; preserved its old Pirate report as superseded,
and generated base-palette-pirate-seed-v2.json. Independent interpreter checks:
1,000 two-draw windows and 320 mode-selection windows passed. RGBA and full
scheduling have synthetic tests but no assembly replay or live comparison.

Worker seed path was traced through an aggregate copied by 227a40, including a
16-byte seed-shaped field at input +0x10/task +0x138. Default descriptor preparation
preserves the source seed; explicit-ID preparation disables its seed flag. Task
flag 1c9 chooses an alternate color branch 62e4e0/62e780. Unlike the first route,
the alternate retries consume fresh random draws and compare square-root RGB
distance with a runtime global. No name or ABI inferred from these offsets.

Three branch exports succeeded in 18 seconds, alternate row export in 19 seconds,
and two material-stage candidates in 26 seconds. All six succeeded. Candidate
630d50 is an asynchronous texture request/cache, not established color binding;
6381b0 is task removal/freeing, not color application. These rejected routes are
retained in the owning specification and index.

Routine failures: an initial read treated SQLite's extracted status 'ok' as a
filename; corrected by using the known XML sibling path with hash/size checks.
Searching a prologue-only assembly report for scalar multiplies found none;
the actual body uses packed SSE operations. Two documentation patch contexts
did not match and were corrected without changing game/storage artifacts.
An old report.json filename guess was corrected to candidates.json. No disk I/O
failure, disk command, repair, D: access or runtime mutation occurred.

Validation: all 31 research tests passed. New tests verify retry termination/RNG
consumption, RGB-only comparison, strict threshold boundary and schedule reuse.
Full appearance, caller seed channels, alternate collection, material binding,
inversion and game equivalence remain unresolved. Evidence is external under
seed-analysis-180383 and the three new native stage directories. Rollback: none;
installed executable/DLL/data mods/player saves unchanged.

Follow-up structural evidence: descriptor_tree now preserves ordered child model
lists, validated across fourteen roots with unchanged 340 groups/986 options.
Native selector predicates show that absent referenced descriptors may still
consume mixed seeds, all-xNEVER child lists can be skipped, and _PLAYER_ children
restart from the original seed input. Literal checks confirm LOD/_PLAYER_/empty
prefix bytes. These are traversal rules to port, not a finished recursive evaluator.
The synthetic ordered-child-list test passes. No additional game changes occurred.

## 2026-10-02: Default descriptor evaluator and rejected public-viewer oracle

Build 180383 / executable SHA-256
`671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.
Offline inputs only; no save loaded or runtime trigger. Configuration: new
evaluate-descriptor-seed.py, fourteen-category manifest plus five initial roots,
seed 0x7 and requested Pirate seed 0x1ad0003900054. Sources are hash-recorded
converted corpus descriptors; XML is bounded and SQLite remains read-only.

Implemented the unfiltered default candidate traversal, including ordered child
lists, Name weights, raw candidate-ID suppression, LOD normalization, missing
reference seed consumption and _PLAYER_ restart. Sentinel seed 0x7 yielded
22 IDs across eight calls. Nineteen roots yielded 18 traces and one unsupported
case, with 183 successful decisions; the fourteen-root CLI independently
reproduced 13 traces and the same unsupported Capital freighter reference:
`MODELS/EFFECTS/LIGHTS/LIGHT_BLUE.SCENE.MBIN{7}`. No annotation was guessed away.
These are experimental predictions, not observed ships or renderable previews.

Initial exact-path SQLite lookups rescanned metadata for each reference and were
slow. Replaced them with one bounded in-memory descriptor metadata map per CLI
batch, preserving per-root resource/byte/call budgets. Earlier runs completed;
an exact-process check for an obsolete command found no process to stop. No
disk/storage error or repair occurred. One documentation patch context failed
and was corrected. A guessed older export filename was absent; actual artifacts
were located through stage manifests instead.

Texture callback stage exported 6308a0 and 63ae70 in 97.8 seconds, both successful.
Their observed cache payload/readiness and async loader behavior rejected the
hypothesis that these functions directly establish final shader color binding.

Public C# NMSMV was inspected at commit
ee2ed17e79ff82ec4cfd069f33fcd2234e443e03, limited to two source files (10,472 and
10,508 bytes). Its uniform System.Random descriptor choices and palette draw
schedule differ from recovered native arithmetic. Rejected it as a seed oracle;
its descriptor/reference organization remains a structural clue only. Source
copies are external, no third-party code or assets vendored. Links and exact
limitations are in the owning procedural seed specification.

Not proven: whole traversal equivalence, filtered/prefix/customisation routes,
final color/material application, inverse search, universe spawn mapping or new
delivery support. Rollback: none needed; game executable, installed DLL/data
patches and all player saves remain unchanged. No D: access, disk command,
repair or BitLocker change.

Resource lookup follow-up: Ghidra stage proceduralresourcelookup timed out at
306.3 seconds with no manifest, log limited to Java option startup lines. Its
owned process tree was stopped by the launcher's existing limit; no retry or
disk command. The unavailable stage is now a separate native_analysis_run
navigation record, with checked fingerprint, rather than disappearing silently.

New bounded fragment inspection recovered seven unwind fragments (504
instructions), their byte hashes and fixed path-format literals. The PE import
table independently identifies thunk 33e0fc8 as VCRUNTIME140.dll!strrchr. Loader
2d5caa0 clears the final extension and rebuilds an MBIN path, explaining removal
of the numeric annotation on the Capital reference. Added this audited limited
reconstruction to the descriptor loader while retaining requested source paths.
The follow-up fourteen-root run yielded 14 experimental traces, including
Capital; original unsupported reports remain preserved. Still no live oracle.

Added synthetic PE import tests, numeric-annotation/path-scope tests and a
transactional source-only navigation refresh test. Source refresh preserves
data/native records and import warnings, avoiding another 194,641-row corpus
import for code-only changes. Repository and corpus/storage boundaries remain
unchanged; proprietary instructions/literals and third-party sources stay external.

Final validation: all 42 research tests passed. Navigation contains 87 source
files, 233 source functions, 194,641 data paths, 125 native function candidates
(including one retained export failure) and one unavailable analysis-run record.
No import warnings. This is metadata and offline evidence, not runtime support.
Arithmetic replay again passed 3,015 integer-window comparisons and 1,320
palette draw/index comparisons. RGBA, recursive selection and whole appearances
are not covered by those assembly replays. Review preserved the existing raw
32-byte `--literal` interface while adding bounded string/import inspection;
the raw threshold window was re-read without native execution.

## 2026-10-02: Historical NM Seeds image/seed reference

Source: user-provided https://www.nmseeds.club/ and its ship, freighter and
multitool catalog pages. Research baseline remains executable build 180383 /
SHA-256 `671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`,
as recorded in the previous offline experiments; no new executable inspection,
runtime trigger or save access in this website review.

Observed metadata includes type, seed, color labels, image URLs and version.
Recorded a three-entry historical reference set in the owning seed specification,
including separate model/Home inputs for a Capital freighter. Publisher states
the site is static with no future updates. Examples inspected carry Beyond
labels, not an exact current-build fingerprint. Found a malformed 1x seed prefix,
disputed living-ship colors and warnings to disregard freighter image colors.
These prevent treating every entry as a trusted seed-to-color fixture.

Not proven: current-build appearance equivalence, part-ID mapping, category model
paths, seed caller semantics or location reconstruction. No automatic bulk
collection, image download, native execution, save edit, disk operation or game
installation change. Rollback: none needed. Documentation-only change; no
application build required.

## 2026-10-02: Pi native procedural item oracle assessment

Source: user-supplied zencq/Pi, revision
80e397b0067016c7d4f9ae37b18afc38ad43185c. Six bounded source files (61,028 bytes)
inspected externally; exact SHA-256 values and pinned links are recorded in
[the owning assessment](PI_PROCEDURAL_ITEM_RESEARCH.md). GitHub tree was complete.
Research baseline remains recorded Courier build 180383 / executable SHA-256
671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4;
no new executable analysis, live trigger or save access.

Observed Pi enumerates 100,000 decimal procedural item seeds per base identifier
and calls native GenerateProceduralProduct/GenerateProceduralTechnology through
version-selected reality-manager bindings. Package.py separately calls
GetHashedIDForTech. Stats/names are native results; perfection is upstream scoring.
Rejected the interpretation that its Freighter/Weapon catalogs reproduce hull,
multitool appearance or the complete 64-bit model seed algorithm. Its old GOG
hash/layout support and version-dependent argument change do not authorize
calls in our current Steam executable. Pending-technology cleanup is another
ownership/gameplay question to resolve before any adapter.

Useful next step: exact-build identification of those generator calls and
controlled expected-output collection, using Courier's bridge if verified.
Not proven: current compatibility, delivery, appearance inversion or independent
stat-generation implementation. Initial web click to an upstream settings link
timed out; direct pinned source inspection worked. A PowerShell mixed-object
table hid path columns; a bounded JSON inventory replaced it. No runtime/tool
installation, source execution, bulk dataset download, disk operation or repair.
Rollback: none needed; installed DLL/mods, executable and saves unchanged.

## 2026-10-02: Pi collection port and current executable cross-check

User requested updating old Pi. Sources/configuration: pinned upstream types
SHA-256 `59ed0a093901e65d79786cbd88b8fa5248a033c756b4311ecb7e2b2b48edac14`,
Courier `scan-pi-compatibility.py`, `pi-seed-catalog.py` and their tests.
Fresh executable fingerprint: build 180383 /
`671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.
Python 3.14 / private Capstone 5.0.5; offline only, no trigger or loaded save.

Implemented original durable collection workflow without importing Pi source:
bounded decimal inputs, immutable build/evidence configuration, raw snapshots,
atomic idempotent imports, conflict rejection and streamed JSONL export.
CLI smoke test used explicitly simulated data: 10 planned, three imported,
resume inputs 3..5, three exported. Thirteen new tests and all 55 research tests
passed. Not a native generator, live Pi update, appearance algorithm or delivery.

Five historical signatures were scanned. Unique matches for product and reality
construction disagreed with checked string anchors; the product match was inside
another prologue. Language signature had two matches and disagreed with its
anchor. Technology signature and anchor both link to primary RVA `0xec1e60`;
package-ID signature has one match but no independent semantic confirmation.
All four anchors existed and their references passed instruction-boundary checks.
Version-1 chained unwind metadata yielded current primary candidates `0xeaf720`,
`0xebec00`, `0xec1e60`, `0x2bd84f0`. No chain warning or skipped anchor site.
Ownership, types, calling context and ABI remain unverified; runtime disabled.
Details and reproducible commands: [Pi assessment](PI_PROCEDURAL_ITEM_RESEARCH.md).

Failures: four-anchor full-fragment inspection rejected incomplete decoding;
no partial successful output claimed. Checked individual LEA references and
unwind chains provide narrower evidence, not a repair or full decompilation.
Initial reads used a nonexistent tests subdirectory and a report-directory
assumption; corrected via repository file inventory and inspector CLI source.
Two documentation patches rejected mismatched context atomically, then applied
with corrected anchors. PowerShell glob arguments to rg were corrected to -g.
No disk commands, repairs, dependency installation, injection, save editing or
changes to installed DLL/mods. Rollback: none needed; artifacts preserved outside
the repository, reusable tooling and findings retained in source control.

## 2026-10-03: public seed photographs and NMSMV preview assessment

Offline baseline: installed 180383 executable rehashed by the candidate batch,
SHA-256 `671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.
Base palette input matched
`3521862b5b2bfb33afe3a8a5bf5a15b6b60ff60327656ec4f7ca9d5e590b9c4e`.
Sources/configuration: committed `reddit-seed-observations.md`,
`compare-seed-observations.py`, existing descriptor/palette evaluators; NMSMV
external reference at `ee2ed17e79ff82ec4cfd069f33fcd2234e443e03`.
Public collection on 2026-10-03; source dates range 2022-08-02 to 2026-09-26.
Trigger: user requested about 50 community seed comparisons and added Kezyma
and NMSMV references. No save, gameplay trigger or process attachment involved.

Observed: 64 distinct posts cataloged, 34 images visually inspected, seven
unavailable and 23 metadata-only. 26 gated cases produced 26 experimental
descriptor/base-palette traces, zero evaluation failures. Six spherical-container
haulers select `_CONTAINER_B`, whose source references BALLCONTAINER; extended
neck cases select the descriptor adding COCKPITNECK_2. The fan-wing case chooses
a separate branch. These are coarse structural correspondences, not full visual
agreement. Malformed `1x...` and conflicting duplicate Solar seeds are retained
and excluded. Several flair labels disagree with visible category. Exact colors
are not scored: lighting, preserved customisation and unknown seed channels
prevent a valid final-material comparison.

NMSMV source uses .NET viewer RNG for procedural choices, not the audited game
PRNG. README explicitly marks procedural generation broken. Geometry/material
field paths are useful reference; current-format rendering and redistribution
permission were not established. No viewer build or executable was run. Kezyma
browser catalog corroborates Radiant Pillar and Golden Vector seed values and
lists separate companion seed channels; no exports downloaded or applied.

Bounded existing Fighter graph: 128-node cap reached, 126 converted XML nodes,
two unindexed nodes, 679 edges, 551 pending resources. This incomplete graph is
preserved as `seed-analysis-180383/viewer-fighter-dependencies-20261003.json`.
Batch report: `seed-analysis-180383/reddit-comparison-20261003.json`, retaining
observation/source hashes and no appearance-success score.

Research failures/limits: text web cache missed recent browser-visible posts;
CDN image opens yielded wrappers, so browser screenshots were used. An in-app
browser attachment timed out; existing Brave support worked. One screenshot
timed out and one overlong multi-page browser call reset the session; uncertain
images were not counted, a fresh research tab continued. Four images displayed
only placeholders and remain unavailable. Guessed manifest file locations did
not exist; corrected with existing report roots and bounded SQLite queries.
A graph diagnostic treated a dictionary as a list and failed; corrected the
read-only summary without changing its preserved report. NMSMV license/format
limitations and unproven runtime contracts remain explicit.

Validation: four new observation-gate tests; all 59 research tests passed.
Not proven: whole seed algorithm, inverse search, final material colors, mesh
equivalence, Electron 3D preview, current NMSMV compatibility or new deliveries.
Rollback: none needed. No installed DLL/mod/save changes, corpus re-extraction,
disk commands/repairs or runtime mutation. Source/notes retained in Courier;
upstream checkout and generated proprietary-data reports remain external.
Details: [model-preview assessment](MODEL_PREVIEW_RESEARCH.md).

## 2026-10-03: HGPAKTool source and supplied Journal video review

Trigger: user supplied a localhost catalogue recording and screenshots, asking
only to understand HGPAKTool and the displayed seed/color workflow. No save,
gameplay trigger, process attachment or runtime compatibility check involved.
Corpus baseline remains the recorded 180383 extraction, executable SHA-256
`671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`;
the installed executable and bridge were not rehashed for this offline review.
Source: external HGPAKTool checkout at
`8f04bfa4b1d9785dbf545d39041932e687048332`; Courier's existing dependency remains
1.1.3. Exact video identity, timestamps and upstream function locations are in
[the owning assessment](MODEL_PREVIEW_RESEARCH.md#hgpaktool-and-the-supplied-journal-demonstration).

Observed: selective archive APIs can avoid unpacking all assets. The existing
bulk worker already uses HGPAKTool. Its presence in research does not establish
packaged-application support. Visual inspection covered 12 overview samples and
six exact-time frames (0, 22, 30, 40, 46, 50 seconds). At 30 seconds the bird is
white/beige; at 40 seconds it is pink/blue, with the same displayed seed. Later
frames show different 3D viewing angles. Export contents and app source were
not available; no claim of reconstructed original appearance or inverse seeds.
The conversation's proposed HGPAK integration is not observed implementation.

Existing-corpus query found two scene paths with the BIRD basename. The creature
candidate's bounded graph completed with 24 nodes/23 edges, eight inspected XML
nodes, 12 indexed DDS files and four absent guessed texture siblings. This is
completion of the walker's limited traversal, not a complete mesh/material load.
Geometry/animation references are outside its present extension filter.
Report retained externally under `video-analysis/journal-20261003/`.

Tooling: no video decoder was initially present; imageio-ffmpeg 0.6.0 was
installed with --no-deps into an isolated external tools directory. Bundled
FFmpeg 7.1 executable SHA-256:
`2ce797a0f88d7f067180338fb227f7b1928ea727bd9a4d7a1d022f7c52af71a3`.
Frame sampling used `fps=1/4,scale=1280:-1` with a 13-frame limit; targeted
frames used seek plus a one-frame limit. Source media stayed read-only.
Initial guessed Python-tools directory was absent; the configured local
research-tools directory was located without retrying extraction. The metadata
FFmpeg call reports no output specified because it intentionally only inspected
the input; subsequent frame decoding succeeded. Blank preview samples and absent
guessed texture siblings were not mislabeled as failures.

Validation: bounded query/traversal and visual frame inspection; documentation
diff whitespace check. No application code changed, so no application build.
Not proven: webapp backend/library, export schema, animation, exact seed/colors,
full preview dependency closure, bundled tool acceptance or new live delivery.
Rollback: no installed DLL/mod/save changes, no corpus re-extraction, no disk
commands/repairs. External reference/decoder/frame artifacts preserved; findings
retained in repository documentation.

## 2026-10-03: static GLB workshop implementation and rendered acceptance

Trigger: user requested building the preview and supplied MetaIdea's raw ship
creator HTML. No live game/save conditions or runtime trigger were involved.
No installed executable/bridge fingerprint was used to authorize anything;
no runtime compatibility is established by this rendering experiment.
Upstream source revision `15e962c767f8dad66a336b8dcbb3ded7a287239e` matches the
earlier reference. It embeds Royal and PoliceShip GLBs, uses mesh-name selection
and global recolor, and supplies no demonstrated complete inverse seed solver.
No upstream code, HTML or model was copied into the repository/distribution.

Implemented: Electron-owned, zero-argument GLB selection with bounded read and
structural validation; restricted preload result; static Three.js viewer,
visibility/filter, preview tint/reset and orbit/zoom/pan. Shadcn CLI confirmed
Base UI/base-nova and its MCP supplied component/audit guidance. The renderer
does not expose a filesystem reader or execute source HTML/Lua. Full native
materials, Fighter conversion, conditional assembly and seeds remain unproven.
Dependency versions: three/@types/three 0.180.0; local test Electron 39.8.10,
Playwright 1.62.1. No first-launch/download dependency introduced for users.

Royal reference GLB SHA-256:
`9e188cf03419ecbd6e2c868c67461d381539112115ac7e5902f38a0f4314e357`.
Observed: all 13 meshes loaded, five selected, three wing alternatives filtered.
Rendered color and camera changes were checked with screenshots. Cancel kept
the existing model; PoliceShip with images was rejected by the supported subset.
No page errors; 1280×800 and 1024×720 windows had no horizontal overflow.
Portuguese minimum-window copy was visually inspected. The acceptance harness
uses a disposable external profile and stubs only its native selection dialog;
manual Windows-dialog interaction and clean offline packaged acceptance were
not performed. Fixtures/proprietary models/screenshots remain external.

Failures and corrections: raw web-reader fetch exceeded its size cap, so an
external pinned Git checkout was inspected. An overly broad line slice printed
embedded source text; subsequent searches were column-bounded. Initial source
search assumed a nonexistent root src directory and a nonexistent Vitest config;
corrected via file inventory. Initial TypeScript failed on sidebar locale scope;
passed after passing locale explicitly. Lint rejected a throw in finally; the
cleanup containment check was moved before try. First rendered tint check failed
because normalization left the translated model outside the camera; position
and scale now share the factor. Fit was then restricted to visible meshes.
A PowerShell quoting attempt to generate the acceptance script failed before
execution; apply_patch created the reproducible script instead. Documentation
patches rejected nonexistent anchors atomically and were reapplied correctly.

Validation: eight new importer tests; all 42 application/catalog/protocol tests
passed, plus lint/typecheck/build. Reproducible harness:
`runtime/scripts/validate-model-preview.cjs`; report/screenshots retained under
external `preview-models/acceptance-20261003-2/`. Root workshop code is lazy-loaded.
Not proven: original game appearance, native palette shader, all ship categories,
seed-to-model equivalence, inverse seeds, delivery or packaged-toolchain support.
Rollback: ordinary source revert only; no DLL/mod/save/game changes, no corpus
re-extraction or disk repair. Models remain external and are never bundled.
Details: [preview checkpoint](MODEL_PREVIEW_RESEARCH.md#implemented-glb-workshop-checkpoint).

## 2026-10-03 — Experimental base palette controls and declarative texture bindings

Scope: offline research plus rendered Electron preview; no running game, save,
DLL, mod, delivery command or storage repair. Corpus executable baseline:
SHA-256 `671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`,
build 180383; conversion tool MBINCompiler v7.04.1-pre3. This baseline does not
extend native runtime compatibility. Royal GLB SHA-256 remains
`9e188cf03419ecbd6e2c868c67461d381539112115ac7e5902f38a0f4314e357`.
Base palette SHA-256:
`3521862b5b2bfb33afe3a8a5bf5a15b6b60ff60327656ec4f7ca9d5e590b9c4e`.

Source/configuration: `main/nms-adapters/base-palette-preview.ts` ports the
existing experimental Python base schedule with BigInt uint64 and float32
operations. Main accepts one dialog-selected file of exactly 68,672 bytes with
the pinned hash. `ModelPaletteControls` uses narrow preload calls; renderer
assigns RGB samples to independent mesh materials, with an explicitly unverified
linear-sRGB display interpretation. Proprietary palette bytes are not committed.
No Python package installation or subprocess is needed to calculate in the app.

Trigger/conditions: isolated developer Electron profile, built application,
file-dialog stub selecting external Royal and extracted base palette. Seed
`0x7`, 66 families, 330 samples. Comparison used a separate report from
`evaluate-base-palettes.py` reading the same hash-pinned source. The harness
then applied a sample to `_Wings_A`, another sample to all visible meshes,
restored originals, calculated maximum uint64, rejected an invalid seed, canceled
import, rejected a wrong fingerprint and recalculated using the preserved bank.

Observed: all 330 seed-7 samples exactly matched the independent Python report;
per-part/all-visible canvas changes and exact original-canvas restoration;
maximum-seed calculation, error preservation, no page errors or minimum-window
horizontal overflow. Portuguese controls were visually inspected. First visual
inspection exposed raw `*` instead of the target label; SelectValue now renders
the localized label explicitly, and the final harness asserts it. A later
screenshot showed that the window-size request alone had not established the
minimum viewport; the harness now unmaximizes, awaits the actual viewport and
records its dimensions. The final run measured 1008×681, without overflow. Initial lint
rejected two destructured let variables; const pairs fixed this. An initial file
read assumed the wrong renderer directory and was corrected via rg file inventory.

Further offline evidence: `inspect-texture-palettes.py` inspected four explicit
texture sources, 36,502 bytes total, with binary/XML fingerprints. Royal declares
gold/silver and named paint texture alternatives; Fighter cockpit declares
Paint/Primary, Paint/Alternative1, Paint/Alternative3, Metal/Primary and
Rock/Primary; one industrial freighter source declares Freighter/Primary and
Freighter/Alternative2; the selected gun source declares Rock/None. All choices
remain retained; none was asserted to be selected by a seed. See
[the seed follow-up](PROCEDURAL_SEED_RESEARCH.md#texture-palette-binding-follow-up-2026-10-03).

Validation: 46 application/catalog/protocol tests, five synthetic asset-inspector
tests, lint, TypeScript checks and build passed. Authored gradient schedule
vectors cover seeds 0, 7 and maximum uint64; no proprietary data in test fixtures.
Rendered harness: `runtime/scripts/validate-palette-preview.cjs`, with external
reports/screenshots in `preview-models/palette-acceptance-20261003-1/` and final
`palette-acceptance-20261003-3/` (intermediate run 2 is also preserved). The independent Python palette report and
`texture-palette-bindings-20261003.json` remain external. Three.js 0.180.0,
Electron 39.8.10 and Playwright 1.62.1. Source navigation refreshed to 93 files /
273 functions, retaining 194,641 data records and 125 native records; no warnings.

Not proven: native entity seed propagation, alternate palette collection,
shader/color space, texture choice or masks, geometry conversion, whole ship
appearance, inverse seeds, spawn location, class/slot delivery, manual dialog
interaction or clean offline packaged operation. The two implementations agreeing
verifies the port, not game appearance. Rollback: ordinary source revert; no
installed game or corpus assets changed, no live retry or save editing.


## 2026-10-03 — Offline fauna callers and flora dependencies; research paused

Scope/trigger: user requested actual seed-algorithm investigation across
categories, then explicitly paused research and requested a method handoff for
another model. Offline only: no gameplay/save conditions, process attachment,
seed evaluation tests, feature implementation or installed-file changes.

Build: 180383, executable SHA-256
`671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.
Tools: existing Ghidra 12.1.4 PUBLIC project, bounded signature scanner,
ExportAcquisitionSeeds.java, instruction/literal inspector, read-only SQLite
and selected ElementTree corpus reads. Existing MXML converter version:
MBINCompiler 7.04.1-pre3. Pinned public NMS.py reference: 52e2e55493ddade1d89d3e638491afff995f5631.

Configuration/evidence: [handoff](SEED_RESEARCH_HANDOFF.md) records source hashes,
exact commands, limits, all RVAs and external artifact paths. Four unique
GenerateCreature/FillCreatureSpawn signature matches; faunageneration stage
completed four exports, exit 0, 53.1 seconds. Three selected type-name references
completed in faunametadata, exit 0, 25.0 seconds. Both launched workers finished
before the pause. Two metadata bodies are exported but not yet inspected.

Observed: known MWC/child mixing in fauna Roles; role-seed initialization and
bounded scale-like interpolation in spawn preparation; file-backed 0.25 float
and 1/4294967295 double constants. Bird role -> resource -> nested descriptor
and material palette bindings, and Lush object list -> 75 referenced tree
choices -> nested tree descriptor data are documented. Empty fir descriptor
is a counterexample to treating all flora variation as part selection.

Failures/limitations: requesting literal RVA 527a93c was rejected as outside
file-backed sections; this is a PE bounds limitation, not a storage error. The
attempt produced no output report; a narrower request retained two valid
constants and 363 instructions. Large text outputs were truncated and replaced
with selected windows. An early manifest lookup preceded export creation;
both runs later completed. A type-name reference initially selected as a
possible layout lead begins with structural hashing; do not relabel its hash
as appearance generation. No current layout was inferred from an obsolete web
search result. A documentation patch initially failed context verification and
was reapplied with valid anchors; no research was restarted after the pause.

Not proven: complete fauna/flora entry seed derivation, field-name mapping,
all branch/draw schedules, palette caller channels, shader composition, inverse
search, natural spawn locations or current runtime compatibility. Seven new
exports are not yet imported into generated navigation metadata.

Rollback/state: game, saves, mods and existing corpus unchanged. External Ghidra
project gained offline analysis results; all reports/exports retained. Repository
changes are documentation only. No application build or tests were run; paused
at user request with the continuation point in the handoff.

## 2026-10-04 — Offline planet child streams, fauna fields and resource seed overrides

Scope/trigger: user resumed seed research and explicitly requested deciphering
the procedural algorithm. Offline executable analysis only; no gameplay/save
conditions, runtime attachment, appearance tests, delivery, extraction or app
implementation. The earlier pause is historical, not the current instruction.

Build: 180383, executable SHA-256
`671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.
Tools: existing Ghidra 12.1.4 PUBLIC project, portable JDK 25.0.4.1+1,
Python 3.14, the repository's bounded native export/literal/caller inspectors,
and SQLite metadata queries. Public signature reference remained pinned to
NMS.py `52e2e55493ddade1d89d3e638491afff995f5631`; its labels are candidates,
not verified current-build callable interfaces.

Exact configurations and evidence: [planet/fauna seed flow](PLANET_FAUNA_SEED_FLOW.md)
links all ten stage TSVs, RVAs, fragment hashes and external report names.
`faunalayout20261004` used the external selected-layout TSV, now preserved
byte-for-byte as `runtime/research/fauna-layout-180383.md`.
External root: `E:\NMS-Courier-Research\acquisition-180383`; each
`run-<stage>.json` records the executable/configuration hashes, command and
elapsed time. All runs reused Acquisition180383 with `-noanalysis`, two CPUs,
4 GiB Java heap, 20 GiB reserve, 180/210/240-second outer budgets and the
default 30-second per-function decompilation limit.

Observed by static analysis: planet Generate derives 26 enabled child seeds
in 13 iterations (52 parent MWC draws), then resets selected consumers from
different children. Slots 10/11 precede the roles/spawn paths; the scale/fur
routine initializes its own role-seed stream, so the reset alone does not prove
that slot 11 affects visible appearance. Native XML field processors name
CreatureId, Seed, filters, resource variants, scale and fur fields. Spawn
preparation copies the role seed into Resource.Seed; two draws select scale
and AllowFur after CreatureId/size data lookup. Planet resource generation
consumes ordinary child draws even when an optional source seed overrides
the result, using a separately recovered 64-bit combination. Another resource
path derives an auxiliary seed and reaches the known descriptor/task pipeline.
Formula, branch and field evidence is documented in the owning note.

Results: ten stages produced 31 successful export rows and one failure;
one repeated RVA leaves 30 distinct successful RVAs. These include metadata
wrappers and fragments, not 30 complete visual algorithms. All launchers
completed with exit 0; manifests disclose the per-function failure. Prior
fauna stages were imported into navigation too: 163 native entries total,
161 successful/unverified and two failed (61f4e0 and 120a790). Navigation retains
93 source files, 273 source functions and 194,641 data-file records, with no
import warnings. Only metadata was refreshed, not the extracted corpus.

Failures/rejected hypotheses: 120a790 timed out at 30 seconds; its continuation
120a7ac lacks entry context and cannot stand in for a verified ABI. A combined
caller request exceeded the fixed budget without producing a report; a narrowed
1149fe0 scan yielded 34 edges/31 fragments. Structural hash processors,
PETACCESSORIES generation and debug resource-browser controls were rejected
as whole-creature appearance entry points. A final literal `*.c` Windows path
search failed with OS error 123; using `-g '*.c'` against the existing directory
succeeded. This was argument handling, not a storage/read failure.

Not proven: complete input/child schedules across all categories, every planet
collection name, the optional source field name, runtime scale cap, female/extra
resource derivation, color-swap writers, complete palette/texture composition,
rendered fauna/flora/minerals, inverse seeds, natural locations or runtime support.
There are no new game-appearance fixtures or live validation claims.

Rollback/state: game executable, bridge, mods, saves and corpus unchanged.
No disk repairs, D: access or BitLocker operations. Existing external Ghidra
project gained offline exports; reports remain external. Repository changes
are documentation, selected TSV configurations and navigation stage registration.
Application builds/tests are unnecessary for this scope; validate documentation
links, configuration hashes, manifest counts and the generated metadata instead.
Final verification passed: all ten configuration hashes match their launcher
reports; manifests total 31 successful/one failed rows and 30 distinct successful
RVAs; 387 relative links in changed Markdown files resolve; Python syntax and
`git diff --check` pass; the read-only native-index status counts match above.

## 2026-10-04: priority entity seed inputs, source writers and chained roots

Build/fingerprint: offline executable 180383, SHA-256
`671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.
Source/configuration: the thirteen repository TSV selections linked in
[entity appearance seed flow](ENTITY_APPEARANCE_SEED_FLOW.md#reproduction-and-evidence),
current named field processors, existing hash-pinned corpus declarations and
pinned NMS.py reference `52e2e554` (`data.json` SHA-256
`1acdf18b60e9d23fb7f75cc4e7eb27d11be8ed0daaf4ab06de6539ba4d074089`).
Ghidra 12.1.4 PUBLIC, portable JDK 25.0.4.1+1, Python 3.14; existing external
Acquisition180383 project with no analysis, two CPUs, 4-GiB heap, 20-GiB reserve,
30-second candidate limits and 180/360-second launcher limits. Portable tools
were reused; no new runtime or dependency was installed.

Trigger/save conditions: bounded static signatures, direct call edges, named
metadata fields, PE unwind/literal windows and selected read-only XML. No process
attachment, callback trigger, mod/bridge installation, game invocation or save
access. No live user test was requested for this pass.

Observed: ship writer 55cb20 supplies one input seed pair to both Resource.Seed
and its customisation object; the refresh uses the recovered custom-slot rule.
Tool writer 553600 forwards a selected record's seed/customisation to its visual
working object; other construction/offer layouts remain distinct. Freighter
root 549380 receives separate descriptor and optional palette seed pairs,
context fallback and explicit overrides. Frigate reward 8e5180 derives a missing
model seed with a two-multiply uint64 mixer, but the palette uses SystemSeed or
the original FrigateSeed. Assembly/literal evidence is retained in the owning
note. Explicit color input uses nearest allowed RGBA matching with 1/256 tolerance;
alpha=1 overrides must not be mistaken for natural seed generation.
The frigate fallback multiplier has modular inverse `0xDC56E6F5090B32D9`;
the owning note derives its mathematical inverse using the self-inverse 47-bit
XOR shift. Eight arithmetic round trips passed. No native inverse function or
inverse from chosen geometry/colors was observed.

Current named customisation fields are BoneScales, Colours, DescriptorGroups,
PaletteID, TextureOptions and Scale. The initial BoneScales vector was corrected
from an earlier texture interpretation. NPC schema/table references expose race,
models, presets and color data, but their loaders, component updates and registry
getters do not recover a natural appearance generator.

Results: thirteen launchers completed; every selection hash matches its report.
Manifests contain 69 successful rows, 69 distinct selected RVAs and no export
failures. Three repeat prior exports, adding 66 navigation candidates. Metadata
refresh now retains 229 native entries (227 successful/unverified, two prior
failures), one prior analysis-run failure, 94 source files, 280 source functions
and 194,641 corpus file records, with no import warnings. Verification report:
`E:\NMS-Courier-Research\seed-analysis-180383\priority-entity-verification-20261004.json`.
This describes export coverage, not 69 complete or verified appearance functions.

Failures/rejected hypotheses: old type names did not match current metadata;
the combined lookup reached the fixed reference cap, so omissions were not
treated as absence. A broad field-name report exceeded its 256-reference budget.
Leaf 10474e0 has no unwind entry; the dependent report read therefore found no
file. Bounded raw windows confirmed 16-bit getters instead. A six-fragment request
exceeded the 16-KiB bound at 572cea; five narrowed callers resolved successfully.
Two file reads used the wrong export stage and one guessed tool filename did not
exist; manifests/the source map resolved them. A literal wildcard argument
returned Windows OS error 123; direct reading of the existing selected JSON
resolved the lookup. These are lookup/context/budget failures, not device damage.
521d50 is attribute/trait preparation, not model selection; 11499c0 processes
texture options, not the initially guessed color state. Metadata hashes and
NPC color-table loaders are not RNG consumers. Rejected labels remain in original
selection files for hash provenance and are superseded by the owning note.

Not proven: every category/subcategory's complete input schedule, natural NPC
seed source, freighter HomeSystemSeed-to-runtime copy chain, texture/material
composition, exact whole-model previews, inverse seeds or natural locations.
No new runtime compatibility or delivery capability is established.

Rollback/state: executable, bridge, mods, saves and extracted corpus unchanged.
Only the external offline project/reports and navigation metadata gained output.
Repository changes are English research notes, source selections, bounded
inspection helpers, parser checks and navigation registration. The new priority
TSVs use a scoped LF checkout rule to retain recorded selection hashes. No disk repairs,
D: access, BitLocker operations or archive re-extraction. Twelve offline tooling
tests passed, including five unwind-chain bounds tests; these do not validate
game appearances. Application build/gameplay tests are outside this scope.
Final checks: all thirteen staged Git blob hashes match their export selections;
404 relative Markdown links resolve; changed Python files parse; three invalid
literal-query cases reject before opening the executable. Read-only navigation
status totals match above, and the staged diff has no whitespace errors.

## 2026-10-04 — Independent seed emulation, child inversion and freighter refresh

Conditions: user remote, no gameplay tests available. Offline build 180383,
SHA-256 `671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.
No process attachment, native game execution, live trigger or save access.
Owning evidence: [seed inversion/emulation](SEED_INVERSION_AND_EMULATION.md)
and [freighter propagation](ENTITY_APPEARANCE_SEED_FLOW.md#upstream-refresh-and-resource-copy-continuation).

Sources/configuration: new repository probes `emulate-seed-windows.py`,
`invert-child-seed.py`, `compare-public-child-mixer.py`; existing private
Python 3.14, Capstone 5.0.5, private Unicorn 2.1.4 binary wheel installed with
`--only-binary=:all: --no-deps --target`. No global dependency changes. Three
fixed x64 windows use one code page, two data pages, a 64-instruction cap and
10,000-microsecond per-window timeout. All input/register state is synthetic.
Pinned public hadsh/nms_namegen commit
`52ad48affaa4089c8f487a470a888dc9b7a650aa`; three selected source files were
downloaded externally and fingerprinted. Only the reviewed PRNG class and
`_bodySeed` AST definitions execute; no downloaded module entrypoint runs.

Observed: 520 inputs, 3,120 native-window/formula comparisons, zero mismatches.
All 1,489 inverse candidates reproduced their target child through emulator
instructions. Exact inverse recovered zero-to-four initialized-seed preimages
for the isolated immediate child branch, retaining initial carry and zero-low
ambiguity. Five inverse edge tests passed. Public mixer/state comparison passed
1,027 cases. These are arithmetic checks, not complete visual or runtime tests.
External reports: `seed-analysis-180383/seed-window-emulation-20261004.json`
and `namegen-reference-52ad48a/reproducible-comparison.json`.

Freighter exports: four sequential stages `freightersource20261004`,
`freightersourceroot20261004`, `freighterupstream20261004`,
`freighterresourcecopy20261004`, using matching repository priority TSVs and the
existing Acquisition180383 Ghidra 12.1.4/JDK 25.0.4.1+1 project. No reanalysis,
two CPUs, 4-GiB heap, 20-GiB space reserve, 30-second candidate limits. Seven
manifest rows succeeded, no export failures. Caller fragment `542480` chains to
root `542440`; root `549af0` forwards palette source `200`/`208` to cached
`2b0`/`2b8` and resource seed `1a0`/`1a8` to `308`/`310`, via inspected helper
`211870`. Equality and refresh conditions are recorded in the entity note.

Failures/rejected assumptions: one guessed arithmetic filename did not exist;
file inventory identified `procedural-seed-primitives.py`. One Windows literal
wildcard search returned OS error 123; directory searches with `-g` resolved it.
A raw-string apostrophe escape incorrectly inserted a backslash into the game
path, producing FileNotFoundError; a double-quoted literal resolved it before
reading bytes. Initial caller-fragment export had unresolved incoming registers;
chained-unwind root export resolved the object parameter. None is a disk error.
Public map/namegen documentation is not a whole entity seed oracle. The public
PRNG constructor is not interchangeable with resource-seed initialization.
Inverse does not assume unique seeds, steady-state initial carry, or reachability
of every arbitrary target child. Changing cache fields is not established as
the cause of previous class-C offers.

Not proven: desired parts/colors-to-seed inverse, preceding descriptor draw
schedules, texture/material composition, natural NPC appearance, current-build
world/address hash, natural entity location, HomeSystemSeed source writer,
complete previews, new runtime compatibility or delivery capability.

Rollback/state: no executable, bridge, mod, save or extracted corpus modifications.
No D: access, disk commands/repairs, BitLocker operations or archive extraction.
Only private research tools, bounded external reports/project exports and
original repository probes/English documentation/navigation metadata changed.
Final checks: all four selection hashes match their completed stage reports;
seven manifest rows succeeded. Twelve existing native-tooling tests and five
inverse tests passed; changed Python files parse and 415 relative Markdown links
resolve. Refreshed navigation contains 98 source files, 291 source functions,
194,641 corpus records and 236 native candidates (234 successful/unverified,
two prior failures), one prior failed analysis-run record and no import warnings.
Verification report: external
`seed-analysis-180383/seed-alternative-methods-verification-20261004.json`.

## 2026-10-04 - Category texture bindings and worker-root continuation

Mode: offline native/data research, followed by isolated Electron preview
inspection at the user's suggestion. No live game trigger/save conditions;
no game attachment or delivery. Build 180383 executable SHA-256:
`671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.
Owning findings: [appearance texture seed flow](APPEARANCE_TEXTURE_SEED_FLOW.md).

Configuration: Ghidra 12.1.4/JDK 25.0.4.1+1 existing Acquisition180383 project,
no reanalysis/import, two CPUs/4 GiB, 30 seconds per candidate, 180 seconds per
serial stage and 20 GiB free-space reserve. Exact committed selections:
`appearance-worker-root-180383.md`, `appearance-texture-selection-180383.md`,
`appearance-binding-callees-180383.md`,
`appearance-texture-preparation-180383.md`, `appearance-texture-loader-180383.md`.
Five stages recorded in the owning note completed; nine rows decompiled, zero
failures. The final loader repeated an existing candidate and added no new seed
consumer. Navigation deduplicates those candidate RVAs.

The existing read-only texture inspector examined ten resources (80,451 bytes)
from `appearance-texture-assets-180383.md`; no missing/ambiguous sources.
Repeating the documented command produced an identical JSON report, including
binary/XML hashes. Selected material channels differ among Paint, Metal,
Undercoat, BioShip_Body, Custom_Head, Rock and Freighter; alternatives and group
conditions are preserved rather than treated as independent random choices.

The full worker root 6388a0 confirms palette/descriptor preparation before
texture application. The 32-byte option input remains distinct from its seed
pair. 634930 checks preloaded handles; 634e10 matches already supplied options,
not a demonstrated new RNG choice. State 9 performs grouped four-float averaging;
its transient 0x70 records must not be confused with palette-family rows.
Attribute names remain unresolved. The async 630d50/6308a0/63ae70 route and
generic loader b04170 do not establish a natural NPC seed consumer.

Visual configuration: existing packaged-development Electron output and
`validate-palette-preview.cjs`, isolated profile/stubbed import dialog, external
Royal GLB hash `9e188cf03419ecbd6e2c868c67461d381539112115ac7e5902f38a0f4314e357`,
base palette hash `3521862b5b2bfb33afe3a8a5bf5a15b6b60ff60327656ec4f7ca9d5e590b9c4e`,
independent Python seed-7 report. All 330 samples matched. Per-part/all-visible
tinting, exact restoration, maximum seed input, invalid input/import preservation,
Portuguese UI and minimum-window fit passed with zero renderer errors. Actual
captures were inspected: wing-only yellow/olive beside gray surfaces, then pale
olive whole-model tint. This is a mesh-tint check, not native material fidelity.

Failures/rejected hypotheses: a read initially selected the wrong export directory
for 637db0; the existing manifests located it. An expected capture filename did
not exist; the harness's actual `all-colors.png` was inspected. An initial
documentation patch used an absent README context and was rejected before
application; the corrected patch succeeded. Two bounded console displays were
truncated; selected reads were used. None was a device/storage failure. No new
internet claim or native API/ABI was inferred from candidate names.

Not proven: full color/texture selection schedule, natural NPC option writer,
None/Index precedence, native masks/shaders, current multitool/frigate/NPC mesh
previews, complete inverse or exact requested appearance delivery.
Next target: the writer of the list consumed by 634e10; avoid re-exporting
known cache/loading paths. See the owning note for the explicit-customisation
route and category-specific continuation.

Rollback/state: no game executable, bridge, mod, save or corpus changed. No
extraction, D: access, disk repair or BitLocker operation. Only bounded external
reports/project exports and original repository documentation/selections/index
changed. Verification: five native-index tests passed, changed index source
parsed, 86 selected documentation links resolved, all five selection fingerprints
matched completed reports. Navigation: 98 source files, 291 source functions,
194,641 corpus rows, 243 unique native candidates; zero import warnings.
Report: external `seed-analysis-180383/appearance-texture-verification-20261004.json`.

## 2026-10-04 - Texture selector, decals and portable AI continuation

Offline only. Build 180383 executable SHA-256
`671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.
Source/configuration: four committed appearance-texture context/writer/callee/
collection TSVs and `appearance-decal-assets-180383.md`; owning method/results:
[decal selection](DECAL_TEXTURE_SELECTION_RESEARCH.md). Root AGENTS.md now routes
other AIs to [AI continuation](AI_CONTINUATION.md), with branch-specific sources,
statuses, bounded commands, failed leads and exact next target. No global skill
installation or duplicated proprietary code is required.

Trigger/save conditions: no game, no save; existing Acquisition180383 Ghidra
project, sequential stages, existing 2-CPU/4-GiB/timeout/free-space bounds.
Private Python 3.14, Capstone 5.0.5, Ghidra 12.1.4/JDK 25.0.4.1+1; existing
read-only corpus. Four stages completed six rows, zero export failures.
Eight decal resources inspected, zero missing, 64,924 bytes; binary/XML hashes
are recorded in external `decal-bindings-20261004.json`.

Observed: 63f290 writes a decimal hash/cache key, correcting the previous
32-byte-option-context hypothesis. State-5 preparation 62ebd0 reaches collection
62f940/62fba0 and genuine random selector 631310. Recovered first-pass float32
presence/weighted-choice draws and selector-to-palette mapping. Bounded
disassembly confirmed the four-option unrolled sum preserves ordered scalar
addition; the initial conservative rejection was lifted. Added original
`evaluate-texture-options.py`, explicit texture/palette seeds and first-pass
limitations. Seed-7 batch evaluated eight resources/ten layers, including logos
and paint; seven tooling tests passed. Continued static reading identifies later
compatibility fallback and base-matching state consumption; these remain outside
the evaluator. No new 3D capture or native decal composition was claimed.

Failures/rejected hypotheses: a requested multi-fragment read included undecoded
boundaries and was rejected; bounded known boundaries were read instead. An ASCII
literal reader could not interpret a floating constant; a bounded raw-constant
read identified its bytes. A guessed export `manifest.json` path did not exist;
the actual artifact is `manifest.tsv`. Two guessed prior evidence locations were
corrected by indexed filenames. These were tooling/path errors, not storage
failures. Do not revisit the known async-loader/cache path as a new selector.

Not proven: whole model-seed to final decal schedule, collector merge/fallback
equivalence, full NPC/frigate/tool geometry, native DDS rendering, inverse
appearance generation, or delivery support for this offline fingerprint.
Next: inspect later compatibility and collector rules, then correlate caller
seed channels by category and bind selected masks in the viewer.

Rollback: no game/bridge/mod/save/corpus changes, no archive extraction, no D:
access, disk repair or BitLocker command. Only bounded external research reports,
native project exports and original repository sources/documentation changed.

Verification: seven texture-option tests and five native-index tests passed;
100 selected relative documentation links resolved, Python AST checks passed,
all four selection hashes matched completed run reports. Navigation contains
100 source files, 306 source functions, 194,641 corpus rows and 249 unique native
candidates, zero import warnings. External `decal-verification-20261004.json`
records bounded checks; `logo-first-pass-final-20261004.json` exercises the final
CLI/report schema, with an explicitly intermediate `first_pass_state`.
One mistyped unittest pattern initially discovered no tests; the corrected exact
filename ran five tests. A guessed report filename was replaced by the actual
`run-<stage>.json` filename after directory inspection.

## 2026-10-04 - Restricted selector compatibility and cross-category emulation

Offline executable build 180383, SHA-256
`671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.
Original sources/configuration: `emulate-texture-selection.py`, the existing
decal/priority texture selections and `evaluate-texture-options.py --phase
fresh-single`. Owning findings and code hashes:
[selector emulation](TEXTURE_SELECTOR_EMULATION.md); category/remaining-input
map: [seed coverage](SEED_RESEARCH_COVERAGE.md). AI continuation updated.

Trigger/save conditions: no game or save; private Unicorn 2.1.4, Capstone 5.0.5,
Python 3.14, existing read-only corpus. Three bounded original code windows
plus copied constants run inside private synthetic memory. Resource declarations
and single-occurrence collection are fixtures; container operations are explicit
append/resize/free stubs. No imports, real game functions or OS endpoints execute.
Per-case caps: 1 MiB heap, 64 KiB stack, 100,000 instructions, 200,000 microseconds,
16 rows/64 stub calls. No increased extraction/storage budgets.

Observed: 468 cases across 18 resources/35 nonempty layers agreed on first-pass
choice/color, final ordered rows and first-pass/exit random states, zero
divergences. Matrices: 208 decal, 182 tool/frigate, 52 Explorer/Warrior NPC and
26 freighter base-match cases. Each resource used 13 seeds and declared/copied
zero-probability profiles. Added restricted fallback/base-match port; original
defaults are white RGBA/empty choice, not arbitrary black. Compatibility visits
the first eligible empty/BASE-group layer per resource. Later draws occur even
for zero chance or false base-match flags. Nonempty unique groups are admitted
in single-resource fixtures; merged collection is not silently approximated.
Ten meaningful tooling tests passed. The fresh-single CLI evaluated freighter
paint and outputs final rows/exit state with unsupported contexts explicit.

Reused existing task exports and inspected four input-copy fragments (241
instructions): the default owned ship/tool working seed goes through descriptor
pair +10/+18 and task +138/+140 to default texture selection. Explicit descriptors
instead disable the prepared seed; supplied palettes bypass state-0 generation.
Natural NPC inputs and every category acquisition path remain unproven.

Failures/rejected hypotheses: two initial evidence reads used nonexistent paths;
the function index/actual manifest corrected them. A leaf initializer had no
unwind range; its 64-byte bounded raw decode identified four instructions and a
return without widening extraction. The emulator initially denied execute on a
stub page first mapped as constant data; permissions were corrected only for
explicit private code/stub pages. Equal colors were falsely rejected as list
versus tuple; comparison now compares component tuples. A zero-probability
two-layer fixture rejected all-layer fallback: original branch targets advance
the resource after one eligible layer. The corrected port passed the matrix.
An owning-note patch context missed a line prefix and was rejected before change;
the corrected context applied. These are analysis/tooling errors, not disk errors.

Not proven: native merged collector, linked/name-filtered/edited-context modes,
alternate palette bank/ground color, natural NPC/category inputs, all model
materials/masks, accurate 3D native appearance, inverse from requested appearance,
or new runtime/delivery compatibility. Continue native collection/resource order
and natural inputs; do not reclassify this fixture check as a live validation.

Rollback/state: original executable, bridge, mods, saves and corpus untouched;
no extraction, D: access, disk repair or BitLocker commands. Only original tooling,
documentation and bounded external reports changed; no new Ghidra stage/import.
External evidence: four `texture-*-matrix-20261004.json` reports, bounded
compatibility/default/return/input instruction reports, and
`freighter-fresh-single-20261004.json` under seed-analysis-180383.

Final checks: ten selector tests and five native-index tests passed; 128 selected
relative documentation links resolved; all changed Python sources parsed.
Matrix report counts/window hashes/state fields verified; unsafe repository output
was rejected without writing. External `texture-compatibility-verification-20261004.json`
records these checks. Source navigation refreshed to 101 files/322 functions;
corpus/native counts unchanged, zero import warnings. XML float32 fixture values
and supplied palette candidates are explicit inputs; binary round-trip precision
and native bank generation are not claimed by these comparisons.

## 2026-10-04: priority parts catalog and restricted native texture collection

Offline build 180383, executable SHA-256
`671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.
Original sources/configuration: `build-priority-appearance-catalog.py`,
`emulate-texture-collection.py`, existing decal manifest plus first four priority
weapon textures and freighter_proc texture. Owning notes:
[priority catalog](PRIORITY_APPEARANCE_CATALOG.md),
[collector comparison](TEXTURE_COLLECTION_RESEARCH.md). The user's explicit
objective is chosen parts/colors/decals to a reproducing seed, not a random
generator or metadata browser. NPCs/frigates deferred.

Trigger/save conditions: no game process or save accessed. Python 3.14, private
Unicorn 2.1.4/Capstone 5.0.5, existing corpus opened read-only. Hash-check selected
MBIN and XML inputs. No extraction, disk repair, D: access or BitLocker changes.
Original collector and group-copy instructions execute only in private emulation;
append/copy/free are explicit bounded stubs. Preallocated group storage avoids
the unaudited vector-growth branch. Unknown targets abort. Limits and code
fingerprints are in the owning note and source/report.

Observed: catalog covers 229 descriptor sources, 1,320 groups, 3,037 option
occurrences, 131 texture resources/390 nonempty layers/577 texture options;
4,069,456 asset bytes read. All selected descriptors uniquely indexed and all
textures inspected. Ancestor guards, reference paths, Chance and default Name
weight clues preserved. Shallow scenes include fixed/support/legacy candidates;
catalog categories are research resource families, not verified spawn types.

Collector comparison: 65 cases/160 calls across 13 resources and five copied
profiles, zero divergences. Layer identity includes Name+Group; option identity
includes Name+selector+family but ignores Index. First retained Index survives.
Probability sums/counts and base-flag OR agree; initial duplicates are preserved,
later repeated declarations merge the first match. These are ordered collector
records, not rendered appearances or live observations.

Failures/rejected hypotheses: initial collector inspection read only the split
prologue (18 instructions); targeted body/return/helper inspection added 427.
One synthetic XML test fixture missed a closing tag; fixed the fixture before
all six tests passed. An attempted documentation patch missed an exact context
and failed without changing files; corrected patch applied. No game, source
corpus or storage failures occurred. No complete inverse or seed uniqueness
claim; same appearance may have multiple satisfying seeds.

Not proven: native resource order, merged full selector, linked/name-filtered
contexts, all palette input schedules, original binary/XML float precision,
DDS/shader composition, whole category forward oracle or exact inverse/delivery.
Next is collector-to-multi-resource selector linkage and actual material order.

Rollback/state: original executable, mods, bridge, saves and corpus untouched.
Only original research scripts/docs and new bounded external reports changed.
External evidence: `priority-appearance-catalog-20261004.json`,
`texture-priority-collector-matrix-20261004.json`, collector entry/body instruction
reports under `E:\NMS-Courier-Research\seed-analysis-180383`.

Final checks: six new dependency/collector boundary tests and ten existing
selector tests passed; three new Python sources parsed; 108 selected relative
documentation links resolved; `git diff --check` passed. Catalog repository
output was rejected before asset reads and without creating a file. The final
collector report `texture-priority-collector-final-20261004.json` confirms 65
zero-divergence cases with current source metadata/limits. Navigation refreshed
to 104 source files/344 functions, 249 native candidates, zero import warnings.
The catalog note derives a desired descriptor option's exact draw interval from
the recovered multiply-high branch; no texture float32 constraint is substituted
with that integer formula and no solver is claimed implemented.
