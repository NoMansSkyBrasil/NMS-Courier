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
