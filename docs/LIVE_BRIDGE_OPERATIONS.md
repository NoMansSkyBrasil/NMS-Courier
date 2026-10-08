# How the research bridge applies changes to the running game

Checkpoint: 2026-10-07. This explains, in one place, **how** every live change
recorded on 2026-10-06 and 2026-10-07 was sent to the game: the pieces
involved, the path of one request, what each kind of request does inside the
game, and what protects against mistakes. It describes a **research profile
for build 180836**, not the product bridge; nothing here is a supported
capability. Results are in the owning notes linked at the end.

## The pieces

| Piece | Where | Role |
| --- | --- | --- |
| Profile DLL | [`runtime/native/asi/profile_180836/`](../runtime/native/asi/profile_180836/README.md) (one file per domain), built with `build-probe.ps1 -Mode Profile180836`, installed as `Binaries/xinput9_1_0.dll` | Loaded by the game at start in place of the system input library (it forwards the real input calls). Checks the executable hash and the bytes of every routine it will touch; if anything differs it does nothing. |
| Signal scripts | [`runtime/native/asi/signal/`](../runtime/native/asi/signal/README.md): one script per domain (freighter, corvette, ship, multitool, exosuit) over a shared `profile-180836.ps1` | Run from outside the game for each request. Checks the process, the installed DLL hash and the profile status, writes a small request file when needed, and sets named events. |
| Named events | One set per game process, names published in the status file | The only channel into the DLL: one event per kind of request. Setting an event carries no data. |
| Request files | `%LOCALAPPDATA%/NMSCourier/diagnostics/native-*-request-180836-<PID>.txt` | Carry the few parameters a request needs (scene and seeds, a reward ID, an owned target). The DLL validates every line and rejects the whole request on anything unexpected. |
| Status file | `%LOCALAPPDATA%/NMSCourier/diagnostics/native-profile-180836-<PID>.log` | Written by the DLL when it handles an event: hook state, counters and what was applied. Rewritten on events, so read it again a few seconds after a request. |
| Research mod | `GAMEDATA/MODS/NMSCourierCorvetteLayoutResearch` | Static data replacement used only for the corvette proof: the initial ship-base layout and the debug option that disables corvette validation. Loaded at game start. |

Nothing writes to save files. The game itself saves the results.

## The path of one request

1. The game must be closed to install or replace the DLL or the mod. The
   process list is checked instead of asking the user.
2. The user starts the game and loads the save.
3. The script runs a preflight: executable build, installed DLL hash equal to
   the expected one, profile status accepting requests, no dispatch in flight.
4. The script writes the request file if the request has parameters and sets
   the event or events.
5. A worker thread in the DLL wakes up, enables its hooks on first use, reads
   and validates the request and arms it.
6. The change happens on the **game's own update thread** or inside the game
   routine that is hooked, never on the worker thread.
7. The DLL writes the status file. The result is then confirmed three ways
   where possible: the status file, a read-only look at process memory or at
   the save the game wrote, and what the user sees on screen.

## What each kind of request does inside the game

| Request | Mechanism | Native or direct |
| --- | --- | --- |
| Reward dispatch (freighter offer `RS_S13_S4M6`, corvette build `R_BIGGS_NEW`, listed in-place rewards such as `R_WEAP_UPGRADE`) | On the update thread the DLL calls the game's reward routine with the reward manager and the reward ID, as the game does for mission rewards | Native call |
| Class on an offer (freighter, corvette) | A hook on the purchase-setup routine lets the original run, then writes the class into the offer's stores and calls the game's base-stat routine for that class | Class field write plus native call |
| Slot grids on an offer | A hook on the layout routine replaces the slot count for the armed offer's stores only; for 120 technology slots one table bound is raised for the duration of that single call and restored | Native routine with changed arguments |
| Special (supercharged) slots | Entries appended to the store's special-slot list with the game's own vector growth helper | Native helper |
| Scene and seeds of a freighter offer | The hook substitutes the seed and scene arguments of the setup call; a second hook replaces the home seed written at acceptance | Changed arguments |
| Technology carry at freighter acceptance | A hook on the special-slot generator, only when called from the purchase update, copies the offer's technology store with the game's store copy routine | Native routine |
| Corvette from an export | `R_BIGGS_NEW` opens the game's build mode; the mod makes the initial layout the export's part list and disables validation; class, grids and special slots are applied to the ship setup as for offers; the player finalizes and accepts in the game's interface | Native flow plus static mod |
| Teach known technologies (`technology` event; one, several or all) | On the update thread, for each requested ID: permanent ID rules, the game's definition lookup, structural refusal rules on that definition, then the game's own learn routine. Written and built on 2026-10-07, **not yet run live** ([technology delivery notes](TECHNOLOGY_DELIVERY_NOTES.md)) | Native call |
| Teach known recipes (`recipes` event; all or by ID) | On the update thread: read the game's recipe table, refuse unless the merge routine can add nothing but recipes, then call the game's own save-load merge routine once with a source that holds only the recipe list. Built on 2026-10-07, **not yet run live** ([recipe delivery notes](RECIPE_DELIVERY_NOTES.md)) | Native call |
| Redeem season, Twitch and platform rewards in the slot (`redeem` event) | On the update thread, for each requested ID: the game's own slot-side routine with the player state and the ID. **For a special that routine also unlocks it on the account** (observed 2026-10-07: account specials 741 -> 794, both account files rewritten), so this is a slot and account change. First run live on 2026-10-07 for customisation IDs ([reward redemption notes](REWARD_REDEMPTION_NOTES.md)) | Native call |
| Fill the fishing record of the slot (`fish` event) | On the update thread: for every fish of the game's table that is not mission-bound and not recorded, the game's own catch routine with a random size. Built on 2026-10-07, **not yet run live** ([reward redemption notes](REWARD_REDEMPTION_NOTES.md)) | Native call |
| Teach product recipes (`product` event) | On the update thread, for each requested ID: permanent ID rule, the game's product lookup, structural refusal rules (learnable, plausible layout), then the game's own learn routine, which also marks the product as seen on the account. First run live on 2026-10-07 on slot 3 ([product delivery notes](PRODUCT_DELIVERY_NOTES.md)) | Native call |
| Silent in-place change of an owned ship, equipped multitool or exosuit (`owned` event) | On the update thread the DLL finds the store at a fixed offset inside the game manager object, checks that its header is self-consistent, then writes the row masks, width, height and count of a full 10 x 12 grid and appends special slots | **Direct write** of the grid header (the native layout step is not called because its arguments for an owned store are unknown); native helper for special slots |

The last row is the only one that changes game data without going through a
game routine for the grid. It is recorded as such wherever its results are
described.

## Saves, slots and account data

Explained by the project owner on 2026-10-07 and checked against the files.
Every live action must say which slot it touched, and every delivery must say
whether it changes one slot or the whole account.

There is **one** save folder per platform account
(`%APPDATA%/HelloGames/NMS/st_<account>`). Inside it:

| Data | Files | Scope |
| --- | --- | --- |
| Slot N (1 to 15) | Two files: automatic save `save<2N-1>.hg` (slot 1 uses `save.hg`) and manual save `save<2N>.hg`, each with an `mf_` companion | One slot: inventories, ships, known technologies and products, known specials, what has been redeemed |
| Account data | `accountdata.hg` and its `mf_` companion, rewritten when the game starts | The whole account, every slot |
| User settings | `Binaries/SETTINGS/GCUSERSETTINGSDATA.MXML` in the game's install folder | The whole installation, every slot: seen substances, technologies and products, titles, unlocked specials and unlocked season, Twitch and platform rewards |

On the owner's installation the slots in use are 1 (`save.hg`, `save2.hg`),
2 (`save3.hg`, `save4.hg`), 3 (`save5.hg`, `save6.hg`) and 9 (`save17.hg`,
`save18.hg`). **The test save is slot 3.** Earlier notes that speak of "other
saves of the owner" mean the other slots of this one folder.

Consequences:

- A per-slot change (technologies taught on 2026-10-07, inventory grids,
  delivered ships) exists only in the slot that was loaded. The other slots
  are untouched.
- An account-level change (an unlocked season or platform reward) is seen by
  every slot. It cannot be undone by restoring one slot's files; a copy of
  the settings file and of `accountdata.hg` is needed as well.
- The account-level lists mix what every slot ever did. That is why the test
  slot shows thousands of seen products while it knows only a few hundred.
- Backups before a live change copy the whole folder, and the settings file
  when an account-level change is planned.

**Owner direction (2026-10-07): deliver into the slot, not only into the
account data.** A delivery is complete when the loaded slot itself holds the
result (known, owned or redeemed there). An account-level unlock alone is not
a delivery. Where a reward has both states, set both and report each.

Reason given by the owner: the current focus is localhost, the player's own
game, but the later goal is to deliver to a friend who has nothing installed,
as the reference services do. What follows from that, as a constraint to keep
in mind and not as work started:

- The routines used so far act on the player state of the process they run
  in. They change the sender's own slot. They cannot reach another player's
  slot or account data.
- A recipient without the tool can only receive what the game's own
  multiplayer lets one player hand to another. Which deliveries can take
  that form (items, ships, things that teach on use) has not been studied.
- So every delivery is recorded with its target: the local slot today; a
  network player later, as a separate route with its own evidence. A local
  result is never taken as proof for the network case.

**Slot identification (2026-10-07).** `runtime/research/identify-loaded-slot.py`
identifies the loaded slot without being told: it reads the known technology
and known product lists from the running game, read-only, and finds the slot
file whose saved lists are a prefix of them. It reports `identified`,
`ambiguous` or `no_slot_matches` and never guesses. It is identification by
content; the game's own slot variable has not been located (the executable
builds the file names from the wide strings `save.hg` and `save%d.hg`, which
is where that search would start). Written and syntax-checked only; **not yet
run against a game.**

**Owner direction (2026-10-07): work on the active slot and leave
`accountdata.hg` alone.** The account data is also synchronised with the
publisher's servers (requests named `uploadaccountdata` and
`SubmitAccountData` in the executable), which a slot change is not.

Still open: the profile itself does not identify which slot the running game has
loaded. Until it does, the slot is taken from the owner's statement and from
which pair of files the game writes, and is recorded as such. Finding the
loaded slot in the running game is required before any product use.

State of the test slot (owner, 2026-10-07): slot 3 has learned only the
technologies delivered that day. Known products, specials, words, glyphs,
fish and recipes are still as the slot was.

Read-only count of distinct IDs per file on 2026-10-07, which shows the scope
of each list:

| File | Fossil | Fish | Twitch | Recipe | Season reward (`EXPD_`) |
| --- | --- | --- | --- | --- | --- |
| Slot 1 (`save.hg`) | 4 | 210 | 435 | 1,684 | 197 |
| Slot 2 (`save4.hg`) | 0 | 0 | 149 | 0 | 94 |
| Slot 3 (`save5.hg`, `save6.hg`) | 1 | 0 | 0 | 7 | 9 |
| Slot 9 (`save18.hg`) | 1 | 0 | 61 | 2 | 135 |
| `accountdata.hg` | 146 | 210 | 435 | 0 | 197 |
| User settings file | 146 | 210 | 435 | 0 | 197 |

- `accountdata.hg` and the user settings file carry the same account lists
  (identical counts for every marker); which one the game treats as the
  source was not determined.
- The fossil IDs are in the account-wide seen-products list, not in slot 3
  (its single match is a statistic name). That is why a save editor's fossil
  page looks complete while slot 3 has found no fossil: the page reads
  account data shared by all slots. The owner will test this separately.
- Slot 1 holds complete fish, recipe and Twitch lists, consistent with an
  editor's "add all" on that slot.
- Twitch IDs are in both account files, so they are loaded from one of them;
  where they sit in memory is still not found.

## What protects against mistakes

- Build pinning: the DLL arms nothing unless the executable hash and the
  expected instruction bytes at every hooked or called address match.
- One-shot requests: each armed value is consumed by the first matching call.
- A dispatch that did not return blocks further dispatches in that process;
  an uncertain outcome is never retried automatically.
- Fixed lists: only compiled-in reward IDs can be dispatched; request files
  are parsed line by line and rejected on any unknown content.
- Scope: hooks act only on the armed item (matched by item pointer, thread
  and setup kind); a table bound is changed only for one call.
- Owned stores are changed only if their header passes consistency checks.
- Save copies before a new kind of in-place change (kept outside the
  repository, for example
  `E:/NMS-Courier-Research/save-backups/20261007-before-owned-upgrade`).
- A fixture (`tests/run-profile-fixture.ps1`) exercises the offer
  hooks against stand-in routines. It does **not** cover the corvette, listed
  reward or owned branches.

## Organization (2026-10-07)

The single combined signal script used for every run recorded up to this date
was replaced by one script per domain; the mapping from old parameters is in
the [signal script guide](../runtime/native/asi/signal/README.md). The new
scripts were parse-checked first and have since carried the technology
requests of 2026-10-07.

The profile DLL source was split the same day: one file per domain in
`runtime/native/asi/profile_180836/`, with the file map in that folder's
README. Function bodies were moved unchanged. The split build is
`2bd83437...ca78`; the fixtures pass on it, and **no live request has been
sent with it yet**, so the earlier live results belong to the earlier builds
until they are repeated.

## What this is not

- Not the product bridge: there is no authenticated pipe, no frontend
  connection and no packaging. Requests are sent by a developer script.
- Not portable: every address and offset belongs to build 180836. A game
  update requires the relocation and comparison tools before anything is
  armed again.
- Not multiplayer-tested.

## Where the results are

- Freighter class, slots, special slots, scene and seeds:
  [inventory class research](INVENTORY_CLASS_RESEARCH.md).
- Corvette from an export:
  [corvette delivery notes](CORVETTE_DELIVERY_NOTES.md).
- In-place class rewards and silent grid changes:
  [owned inventory upgrade notes](OWNED_INVENTORY_UPGRADE_NOTES.md).
- Every run, with build and DLL hashes: [experiment log](EXPERIMENT_LOG.md).
