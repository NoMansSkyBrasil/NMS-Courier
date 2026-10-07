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
| Profile DLL | `runtime/native/asi/freighter_class_180836.c`, built with `build-probe.ps1 -Mode FreighterClass180836`, installed as `Binaries/xinput9_1_0.dll` | Loaded by the game at start in place of the system input library (it forwards the real input calls). Checks the executable hash and the bytes of every routine it will touch; if anything differs it does nothing. |
| Signal scripts | [`runtime/native/asi/signal/`](../runtime/native/asi/signal/README.md): one script per domain (freighter, corvette, ship, multitool, exosuit) over a shared `profile-180836.ps1` | Run from outside the game for each request. Checks the process, the installed DLL hash and the profile status, writes a small request file when needed, and sets named events. |
| Named events | One set per game process, names published in the status file | The only channel into the DLL: one event per kind of request. Setting an event carries no data. |
| Request files | `%LOCALAPPDATA%/NMSCourier/diagnostics/native-*-request-180836-<PID>.txt` | Carry the few parameters a request needs (scene and seeds, a reward ID, an owned target). The DLL validates every line and rejects the whole request on anything unexpected. |
| Status file | `%LOCALAPPDATA%/NMSCourier/diagnostics/native-freighter-class-180836-<PID>.log` | Written by the DLL when it handles an event: hook state, counters and what was applied. Rewritten on events, so read it again a few seconds after a request. |
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
| Silent in-place change of an owned ship, equipped multitool or exosuit (`owned` event) | On the update thread the DLL finds the store at a fixed offset inside the game manager object, checks that its header is self-consistent, then writes the row masks, width, height and count of a full 10 x 12 grid and appends special slots | **Direct write** of the grid header (the native layout step is not called because its arguments for an owned store are unknown); native helper for special slots |

The last row is the only one that changes game data without going through a
game routine for the grid. It is recorded as such wherever its results are
described.

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
- A fixture (`tests/run-freighter-class-fixture.ps1`) exercises the offer
  hooks against stand-in routines. It does **not** cover the corvette, listed
  reward or owned branches.

## Organization (2026-10-07)

The single combined signal script used for every run recorded up to this date
was replaced by one script per domain; the mapping from old parameters is in
the [signal script guide](../runtime/native/asi/signal/README.md). The new
scripts are parse-checked only: **no live request has been sent with them
yet**. The profile DLL source is still one file
(`freighter_class_180836.c`) that serves all domains; splitting it changes
the binary and therefore requires a new build, hash and live retest, so it is
tracked as pending work rather than done silently.

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
