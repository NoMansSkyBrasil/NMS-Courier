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
accepted). `signal-freighter-class-180836.ps1 -DispatchCorvetteBuild` sends
it. DLL built 2026-10-07 with `build-probe.ps1 -Mode FreighterClass180836`,
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
