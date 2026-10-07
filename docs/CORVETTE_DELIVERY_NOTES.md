# Corvette delivery: first look (deferred feature)

Checkpoint: 2026-10-07. Status: **planned, not researched**. This note records
only what one user-supplied export file shows. No game function, save field or
delivery route was studied, and nothing here is a capability. The feature is
deferred by the user; see `TODO.md`. Never implement it by editing saves.

## What the reference service states

The user supplied a screenshot of the reference service's corvette page. It
says delivery **replaces** the player's current corvette, and that the player
must first own a minimal corvette (fewer than ten parts; their example uses
seven), make it the primary ship, then save and restart. Parts do not need to
be owned or unlocked. The user's goal for Courier is direct delivery without
that precondition, if a verified native route allows it.

## What a `.nmsship` export contains

One export supplied by the user was opened read-only (a personal file; it is
not in the repository and its seed is not recorded here). It is a ZIP archive
with three JSON members:

| Member | Content |
| --- | --- |
| `so.json` | One ship ownership record: `Name`, `Resource` (`Filename` is `MODELS/COMMON/SPACECRAFT/BIGGS/BIGGS.SCENE.MBIN`, plus a seed), three inventories (`Inventory`, `Inventory_Cargo`, `Inventory_TechOnly`, each with class, valid slot list, base stat values, special slots, width and height), `InventoryLayout` (slots, seed, level), position and direction |
| `objects.json` | A flat list of placed objects, each with `ObjectID`, `Position`, `Up`, `At`, `Timestamp` and `UserData` — the same shape as base-building objects |
| `ccd.json` | A character-customisation style block (preset, descriptor groups, palette, colours, texture options, bone scales, scale), empty in this file |

In the examined file the object list has 976 entries with 249 distinct IDs.
About 150 entries use IDs starting with `B_` and look like the hull modules
(cockpit `B_COK_A`, habitation `B_HAB1_*`, structure `B_STR_*`, wings
`B_WNG_*`, turrets `B_TUR_*`, generators `B_GEN_*`, shields `B_SHL_*`, floors,
roofs, walls, doors, landing gear and similar). The remaining entries are
ordinary base decorations placed inside (plants, lights, screens, tables,
decals). The technology inventory lists installed technologies by ID with
slot positions (for example `LAUNCHER`, `SHIPJUMP1`, `HYPERDRIVE`,
`SHIPSHIELD`).

Reading: a corvette is a ship whose model is the fixed `BIGGS` scene plus a
list of positioned building parts, stored like a base attached to the ship.
Its shape is therefore not a function of a seed in the way procedural ships
are; it is the part list.

## How an owned corvette is stored in a save (read-only look, 2026-10-07)

The user added a corvette to their own save with a third-party save editor
(their action, outside Courier) and left the game running. The newest save
file was decompressed in memory and read; nothing was written and the file
was not copied. Key names in the file are obfuscated, so field names below are
inferred from values and from the export format above.

- **Ship record.** The corvette occupies one entry of the ship ownership
  list (index 5 in this save) with a name, the resource
  `MODELS/COMMON/SPACECRAFT/BIGGS/BIGGS.SCENE.MBIN`, a seed and the usual
  inventories. The seed equals the one in the export examined earlier, so it
  is carried over by the export or is not what distinguishes one corvette
  from another.
- **Part list.** The parts are **not** inside the ship record. They are one
  entry of the persistent base list, next to the player's planetary bases:
  base type `PlayerShipBase`, name `Default`, 160 objects in the same shape
  as base-building objects (object ID, position, up, at, timestamp, user
  data).
- **Link.** That base entry carries the value 5 in the field that the export
  format calls user data — the corvette's index in the ship ownership list.
  The link between ship and part list is therefore the ship slot index.
- A second base entry with 45 objects and another base type sits beside it
  (the freighter base); planetary bases have their own entries.

Corvette-related names present in the 180383 executable, noted for the later
study and not yet located in code: `CorvetteDraftShipSeed`,
`CorvetteEditAssociatedShipIndex`, `CorvetteEditShipName`,
`AllowSaveContextCorvetteTransfer`, `DisableCorvetteValidation`,
`DisableCorvetteSwapParts`, `CorvetteComplexityLimit`, `CorvetteBaseLimit`,
`CorvetteMaxBoundsLimit`, `CorvetteRewardFrequency`, `DefaultCorvette`,
`AllowOnlyCorvetteShipPurchases`, and the routine name
`cGcPlayer::UpdateExitCorvetteRecovery`.

## The game's own creation route, read from shipped data (2026-10-07)

Three exports supplied by the user (160, 976 and 1,934 objects) were compared.
Their ship records are **identical**: same resource, seed, class C, slot
layout, base stats and technologies. Only the object lists differ. The JSON
variant of an export is exactly one persistent base entry of type
`PlayerShipBase` with its object list.

That shared ship record is the game's own default. In the corpus (build
180383 data, byte-identical in 180836):

- `gcbuildableshipglobals.global` has `DefaultCorvette`, a
  `GcRewardSpecificShip` with the `BIGGS` scene, ship class and size type
  `Corvette`, flagged as gift and reward ship. The low 32 bits of its seed
  are the seed found in every export and in the user's save.
- The same file has `InitialLayouts`, a list with one entry:
  `METADATA/SIMULATION/SHIPBASES/DEFAULTSHIPBASE.MXML`. That file is a
  `cGcPersistentBase` with 170 object entries — a shipped part list in the
  same structure as the exports. `EMERGENCYSHIPBASE` (10 entries) sits beside
  it.
- The reward table has `R_BIGGS_NEW`: `GcRewardStartShipBuildMode` with
  `ShipBuildType = CreateFromDefault`. `R_BIGGS_EDIT` uses
  `CreateFromDockedShip` and `R_BIGGS_RESUME` uses `ResumeBuild`.

Reading: the native way to obtain a corvette from nothing is the reward
`R_BIGGS_NEW`, which starts ship build mode from the default ship plus an
initial layout file. An export is a replacement for that layout.

### Proposed route (not implemented, not verified)

1. Dispatch `R_BIGGS_NEW` through the reward manager the profile already
   uses, and observe what the game does away from a corvette workshop.
2. Locate where build mode reads the initial layout, and supply the chosen
   export's object list there for one request (in memory, restored
   afterwards), so the build starts as the requested corvette.
3. Let the player confirm the build in the game's own interface, so the ship
   record and the linked ship base are created by the game.

Unknown and decisive: whether step 1 works outside a workshop; whether build
mode charges or requires the parts; how part validation and the complexity
limits react to large layouts (one export has 1,934 objects; the shipped
warning thresholds are 100 and 40); multiplayer visibility.

### First observation build (built, **not yet run**)

The research profile gained one event, `corvette`, which requests a single
dispatch of `R_BIGGS_NEW` (constant in the source; no arbitrary reward ID is
accepted). `signal-freighter-class-180836.ps1 -DispatchCorvetteBuild` (replaced on 2026-10-07 by the per-domain scripts in [`signal/`](../runtime/native/asi/signal/README.md))
sends it. DLL built 2026-10-07 with `build-probe.ps1 -Mode FreighterClass180836`,
SHA-256 `8c2c901c4cea8b20b054d1a201b9dccfe1feb574f0e1eea55efb9e16509f17e2`,
under `E:/NMS-Courier-Research/native-builds/freighter-class-180836-corvette-20261007`.
The existing fixture passes; it has no check specific to the new event. Not
installed. Before a run: game closed, install, compare hashes, start the game,
load the save, then signal once. The outcome of a dispatch that does not
return is unknown and must not be retried in the same process.

### First live observation: the reward opens build mode, empty (2026-10-07, one run)

Conditions: installed build 180836 (`13d5060d...3499`), profile DLL
`8c2c901c...17e2` (replacing `f36ba9d6...adf0`), no research mod active for
ship bases, user on foot inside a space station, an editor-added corvette as
primary ship. Preflight passed; one `corvette` event sent.

- Observed (log): `dispatch_state=3` (the call returned), one ship setup call
  afterwards (`setup_calls=1`, `last_kind=0`), no errors.
- Observed (user screenshot): the corvette workshop interface opened in the
  station — module menu, colours, "Finalizar", and four validation warnings
  (no landing gear, no habitation module, no cockpit, no reactor). The build
  started **empty**.
- So `R_BIGGS_NEW` works away from a corvette workshop terminal and does not
  touch the existing corvette.
- The emptiness agrees with the shipped data: `DEFAULTSHIPBASE` holds 169
  `BIGGSCONNECTOR` entries (the snap points) and one `U_PARAGON`, no hull
  parts. `EMERGENCYSHIPBASE` is a nine-part minimal corvette (two landing
  gears, two wings, turret, habitation, generator, cockpit, access).
- Not proven: what finalizing does (the user was asked to cancel); whether
  parts are charged; behaviour without any existing corvette.

### Second experiment prepared: export as the initial layout (installed, **not yet run**)

`runtime/research/build-ship-base-layout.py` converts an export's object list
to a `cGcPersistentBase` document shaped like `DEFAULTSHIPBASE`, optionally
keeping the shipped connector entries first. For the 160-object export:
169 connectors kept + 160 objects = 329 entries; compiled with MBINCompiler
7.04.1-pre3 to `DEFAULTSHIPBASE.MBIN`, SHA-256
`cc3763b5e1f714db858ed043199bae6c1285d85bb8e3003436d6d6d1787f6130`.
Installed as a loose-file research mod at
`GAMEDATA/MODS/NMSCourierCorvetteLayoutResearch/METADATA/SIMULATION/SHIPBASES/`.
It takes effect only after a game restart. Question for the run: does build
mode from `R_BIGGS_NEW` now start with the export's ship? Rollback: delete
that mod folder. A static mod cannot serve per-request delivery; if this
works, the per-request version must supply the layout in memory.

### Second live result: the export appears assembled in build mode (2026-10-07, one run)

Conditions as in the first observation, in a new game process, with the
research mod active (`DEFAULTSHIPBASE.MBIN` `cc3763b5...6130`, 169 connectors
plus the 160 objects of one export). Preflight passed; one `corvette` event.

- Observed (log): `dispatch_state=3`, `setup_calls=1`, no errors.
- Observed (user screenshot): build mode opened with the export's corvette
  fully assembled; the panel reads "Finalização de nave" and shows damage
  158.5, shield 207.0, hyperdrive 671.4 and manoeuvrability 352.7; none of
  the four missing-part warnings of the empty run is shown.
- So the layout file named by `InitialLayouts` is what `CreateFromDefault`
  loads, and an export's object list is accepted there as written.
- Not proven: finalizing (not pressed yet); cost or part requirements at
  finalize; the two larger exports (976 and 1,934 objects, layouts built:
  `62792cfe...5e96` and `7c980657...a8e5`); behaviour with no corvette owned;
  class and slot choices; multiplayer.

Next: the 976-object layout is installed for a restart test; then finalize
once on a save state the user accepts to change; then replace the static mod
by supplying the layout in memory per request.

### Third observation: finalize leads to a ship offer, class C (2026-10-07, user action)

In the same process as the second result the user pressed "Finalizar". The
game showed the usual ship offer screen for the built corvette: a generated
name, class **C**, the installed technologies, the same four statistics as in
build mode, and "Comparar" / "Recusar". Whether the offer was then accepted
is not recorded here. The profile log still showed one setup call of kind 0
and no class applied, as expected: the profile so far only handled freighter
setups (kind 3).

Class C is the shipped default (`DefaultCorvette` carries no class request and
the purchase setup draws no class for it). The user wants the class to be
selectable, with S as the default.

### Class on the corvette build (built, **not yet run**)

The `corvette` event now also arms the requested class for the next ship
setup (kind 0). After the original setup returns, the profile writes the
class into the ship item's three stores (main `+0x980`, technology `+0xe10`,
cargo `+0xbc8`; the user's owned S ships carry S in all three) and calls the
native base-stat routine for each with ship class row 10 (Corvette). One
shot, consumed with the class request. DLL SHA-256
`9baba721a7c2d56a3f1dd82ef8b6910696d7fe98e21124543bc12db2eafc5c7e`, under
`E:/NMS-Courier-Research/native-builds/freighter-class-180836-corvette-class-20261007`.
The existing fixture passes; it has no check for the ship branch. Unknown
until run: that the kind-0 setup at build start is the corvette's item, that
the class survives finalize and acceptance, and how the displayed statistics
react.

### Fourth live result: class S applied; a larger export blocked by validation (2026-10-07, one run)

Conditions: build 180836, DLL `9baba721...5c7e`, research mod layout
`62792cfe...5e96` (169 connectors plus the 976 objects of the second export),
user in a space station. Preflight passed; class S armed, one `corvette`
event.

- Observed (log): `dispatch_state=3`, `setup_calls=1`, `last_kind=0`,
  `applied_count=1`, `applied_class=3`, `class_before=0,0,0`,
  `class_after=3,3,3`, no rejected item. The kind-0 setup at build start is
  therefore a writable ship item with the expected three stores.
- Observed (user screenshot): the 976-object corvette is assembled in build
  mode, but the panel shows "AVISO: nenhum trem de pouso foi instalado" and
  the user cannot finalize.
- Cause in the data: this export has no landing-gear part (`B_LND_*`); the
  third export has neither landing gear nor a habitation module. Such ships
  exist because they were built outside the game's validation. The first
  export has one `B_LND_B`, which is why it finalized.
- Not proven: that class S reaches the offer screen and the owned ship (the
  run could not be finalized).

The shipped debug options (`gcdebugoptions.global`, identical in the
installed build) contain `DisableCorvetteValidation` (false),
`EnforceCorvetteComplexityLimit` (false) and `DisableCorvetteSwapParts`
(true).

### Fifth live result: class S on the corvette offer; second dispatch in one process (2026-10-07)

Same process as the fourth result (so the validation mod was not loaded yet).
The user left build mode to buy a landing gear, a second `corvette` event was
sent with class S (`applied_count=2`, `class_after=3,3,3`, `setup_calls=3`),
the user added the landing gear to the 976-object build and finalized.

- Observed (user screenshot): the ship offer shows class **S**, a generated
  name, damage 210.5, shield 369.3, hyperdrive 1041.2, manoeuvrability 369.3.
  The user declined the offer.
- So the class written at build start reaches the offer, and the dispatch is
  repeatable inside one game process.
- Not proven: the class on an accepted, owned corvette and after a restart;
  whether accepting adds a ship or replaces one.

Requirement stated by the user: validation must be bypassed for everything,
because many shared corvettes are made with external tools and glitch
techniques and would never pass the game's checks.

### Validation switch as a research mod (installed, **not yet run**)

`GCDEBUGOPTIONS.GLOBAL.MBIN` recompiled from the converted original with only
`DisableCorvetteValidation` set to true (one data byte plus compiler header
bytes differ, seven bytes in total), SHA-256
`817e5a653ea16155ae6f5c2066275ccc73b51755de7b26d48f916cdbcc439e4a`, placed
in the research mod folder beside the layout. Takes effect after a restart.
Unknown: whether the release build honours this option at all. If it does,
the per-request version would set the same in-memory flag for one build
only; if it does not, the alternatives are locating the validation routine
or refusing exports the game itself would reject.

### Sixth live result: validation switch honoured (2026-10-07, one run)

New process with the research mod carrying both the 976-object layout and the
debug options with `DisableCorvetteValidation = true` (`817e5a65...9e4a`);
DLL `9baba721...5c7e`; class S armed, one `corvette` event
(`applied_class=3`, `class_after=3,3,3`).

- Observed (user report): the missing-landing-gear message is still shown,
  but finalizing now proceeds to the ship offer. The user declined the offer.
- So the release build honours this debug option: the warning remains as
  text and no longer blocks.
- Not proven: the third export (no landing gear and no habitation module);
  an accepted corvette without those parts in flight, landing and after a
  restart; the per-request form (setting the flag in memory instead of a mod).

Note on the status file: it is rewritten when an event is handled, so a read
within a few seconds of the signal can predate the setup call; read it again
before concluding.

### Slots and special slots on the corvette build (built and installed, **not yet run**)

User default requested: 120 cargo and 120 technology slots, every technology
slot special, as for freighters. The corvette size type has the same large
bounds as the freighter entry (main 10 x 12, technology 10 x 6), so the
profile's existing slot scope, technology-row table patch and special-slot
marking now also apply to the corvette ship setup when the `slots`,
`techrows` and `super` events are armed together with `corvette`. DLL SHA-256
`5887b8ea119deb71f09af2bb588f9ad93547096b593c5b156cbf011235665b0d`
(installed, replacing `9baba721...5c7e`). Unknown until run: whether the ship
setup goes through the hooked layout routine at all (`layout_overrides` in
the log will tell), and whether grids and special slots survive finalize and
acceptance, since ship acceptance copies stores by a different path than the
freighter reward.

### Seventh live result: owned S corvette, 120 + 120 slots, all technology slots special (2026-10-07, one run)

Conditions: build 180836 (`13d5060d...3499`), DLL `5887b8ea...5b0d`, research
mod with the 976-object layout (`62792cfe...5e96`) and validation disabled
(`817e5a65...9e4a`), user in a space station. Preflight passed; class S,
`slots`, `techrows`, `super` and one `corvette` event.

- Observed (log, at build start): `applied_class=3`, `class_after=3,3,3`,
  `slots_applied=1`, `layout_overrides=2`, `main_grid=10,12,120`,
  `technology_grid=10,12,120`, `table_patches=1`, `table_rejected=0`,
  `super_added=119`, `super_errors=0`. The corvette ship setup therefore goes
  through the hooked layout routine, like the freighter.
- Observed (user screenshot): the offer shows class S, a full-width
  technology grid with every visible slot marked special, a ten-wide cargo
  grid, and statistics 198.4 / 435.5 / 1311.3 / 2045.1. The missing-gear
  message did not block finalizing.
- The user **accepted**, chose to replace their existing corvette, and saved.
- Observed (newest save, read in memory, not modified): ship slot 5 holds a
  `BIGGS` ship with the generated name, class S in all three inventories,
  120 valid slots in a 10 x 12 main grid, 120 valid slots in a 10 x 12
  technology grid with 120 special-slot entries and 27 installed
  technologies. The `PlayerShipBase` entry linked to slot 5 now has 976
  objects — the export's count; the connector entries of the layout were not
  stored.

So one request produced, through the game's own build and offer flow, an
owned corvette from an export file with the requested class, grids and
special slots, and the result is in the save the game wrote.

User report after the run (same process): flying and landing the delivered
corvette, which has no landing gear, worked normally.

Not proven: the same after a game restart; a save with no corvette (this run replaced one);
adding as a new ship instead of replacing; the 1,934-object export;
multiplayer visibility; class and grid choices other than the maximum.

### Eighth live result: added as a new ship with no usable corvette owned (2026-10-07, one run)

Before this run the user confirmed after a restart that the delivered
corvette was still there, then removed it with their save editor. That left
a remnant in the save (slot 5 still named and pointing at the `BIGGS` scene
with empty inventories; the linked ship base with 0 objects), and, by the
user's report, a leftover entry in the game's corvette project list. So this
is "no usable corvette", not a save that never had one.

Same DLL (`5887b8ea...5b0d`) and mod (976-object layout, validation off), new
process; class S, `slots`, `techrows`, `super`, one `corvette` event. Log:
`applied_class=3`, `main_grid=10,12,120`, `technology_grid=10,12,120`,
`super_added=119`, no errors.

- Observed (user report and screenshot): build mode opened with the export
  assembled; after finalizing, the comparison screen listed the new ship as
  "Corveta (120, 120)" with class S, a 10-wide technology grid with every
  slot marked special, and three choices: obtain for free and add to the
  collection, trade the current ship, or decline. The screen shows a cost
  figure, but the obtain option is labelled free. The user chose to add it to
  the collection.
- The leftover project did not interfere in this run.
- Not proven: a save that never had a corvette; the state of the save after
  this acceptance (not read yet); the 1,934-object export.

### From proof to product: what the mod does that the bridge must do

The research mod is static: one layout, fixed at game start. For delivery
the bridge has to do the same two things per request, in memory:

1. Make build mode start from the requested export's objects instead of the
   shipped layout (find where `CreateFromDefault` reads `InitialLayouts`, or
   fill the draft base through the game's own add-object routine).
2. Set the validation switch for that one build and restore it afterwards.

Then the frontend can accept a `.nmsship` (or its JSON form) and class and
slot options, with S and 120 + 120 special as the user's stated defaults.

## What this suggests, unverified

- The reference service's precondition (own a minimal corvette first) is
  consistent with writing a part list into an existing corvette's record
  rather than creating the ship and its part container. That is an inference
  from their instructions, not an observation of their method.
- A direct route for Courier would need two native steps that are both
  unknown: creating the ship ownership with the corvette resource, and
  creating or filling the attached part container through the game's own
  building functions. Neither has been located.
- The research corpus holds the `models/common/spacecraft/biggs` assets, so
  the scene exporter could in principle render a corvette from a part list
  for the workshop. Not attempted.

## Open questions for when this is taken up

1. Which routine builds the ship from the `PlayerShipBase` entry linked by
   ship slot index, and which routine creates that entry when the player
   builds a corvette in game (the `CorvetteDraft*` and `CorvetteEdit*` names
   above are the first leads).
2. Whether the specific-ship reward path can produce a corvette resource at
   all, and what it does without a part list.
3. Which build-part IDs are legal for corvettes and how limits are enforced.
4. Multiplayer visibility of delivered corvettes.
