# Finishing technologies that are waiting to be installed

Owner request of 2026-10-10: walk the inventories of the player, the ship, the
multi-tool, the freighter and the exocraft (the land vehicles, the Nautilon
included) and finish every technology that is still waiting for its
components. In the game such a technology shows a gear in its top right corner
and asks for "required components" before "Install technology" completes it.

Status: **built (bridge 1.29.0, application 1.37.0); the owner reported on
2026-10-10 that it worked from the application**, without detail (which
technology, message, reload). The reading below was offline.
Build 180836 (executable SHA-256
`13d5060d4efb9d2a6a6b1b349bc4257231056cc2a055df4bb15d816262cc3499`).

## What marks a technology as waiting

`GcInventoryElement` (0x30 bytes, metadata of the executable): `Id` +0,
`Index` +0x10, `Amount` +0x18, `DamageFactor` +0x1c, `MaxAmount` +0x20,
`Type` +0x24, `AddedAutomatically` +0x28, `FullyInstalled` +0x29. A waiting
technology is an element of type technology with `FullyInstalled` 0.

## The game's own routine that finishes one (candidate)

Found by searching the code for uses of `+0x29`; the only place that takes
the address of the flag of an element it looked up in a store and then sets
it is the function at `10b7c80`. Read so far:

- One argument, an object of which it reads only three fields: an inventory
  choice at `+0x4f0`, an owner index at `+0x4f4` (`-1` means the current
  one, taken from the player state: `+0x182a0` for the ship choices 4, 5, 6,
  `+0x17ea0` for the choices 10 and 11) and a slot index at `+0x4f8`.
- It picks the store from the choice (stores are 0x248 bytes apart from the
  object at manager `+0xc240`; offsets seen: `+0x10` for choice -1, `+0x4b68`
  for 10, `+0x5b60` for 11, `+0x6b58` for 4, `+0x86c8` for 6, `+0xa228` for
  5, and two more at `+0x85bc30` and `+0x870258`), then asks the store for
  the element at the slot (`56b530(store, &index)`).
- If the element is not fully installed it builds a message with `%TECH%`
  replaced by the technology's name (`ebb9e0`, `2be4e20`, then `b1ee20` on
  manager `+0x942b50`), tells the mission events list (manager `+0x847d78`),
  and remembers the element at manager `+0x26340`.
- Then, in every case: `DamageFactor` becomes 0, `FullyInstalled` becomes 1,
  the charge is set from the technology's definition and the difficulty
  setting, the store is refreshed (`54d060`, `5945a0`), and the matching
  entry is removed from the list of installs in progress at manager
  `+0x23be8` (entries of 0x1b0 bytes: slot at `+0x1a0`, owner index at
  `+0x1a8`, choice at `+0x1ac`; `5bc420`).

It does not take the components away in what was read; the caller is
expected to have done that.

## Its caller, and the stores (read the same day)

- The only caller is `7d63ae`, inside the state machine of the game's
  install and repair screen (`7d6168`..`7d63cc`). When no component of the
  screen's list is still missing (entries of 0x30 bytes, `+0x1c` above
  zero means missing) it calls `10b8750` (is the element not yet fully
  installed?), then `10b7c80`, and moves to the state that later shows
  `UI_INSTALLED_OSD` or `TECH_REPAIRED` with `%TECH%`. So the on-screen
  "installed" message belongs to the screen, not to `10b7c80`; a call from
  the bridge may show nothing.
- `47de30(holder at manager +0xc240, choice, owner)` returns the store of a
  `GcInventoryChoice` and `10b7c80` picks stores the same way. Enum, from
  the executable: `Personal, Personal_TechOnly, Personal_Cargo, Weapon, Ship,
  Ship_TechOnly, Ship_Cargo, Freighter, Freighter_TechOnly, Freighter_Cargo,
  Vehicle, Vehicle_TechOnly, Chest1..Chest10, ChestMagic, ChestMagic2,
  MaintenanceObject, FrontendPage, CookingIngredients, RocketLocker,
  SeasonTransfer, FishPlatform, FishBaitBox, FoodUnit, CorvetteParts`.
  Choices 0 to 3 and 7 to 9 are at `+0x10 + choice * 0x248` (3 is the
  bridge's active multi-tool store, 1 its exosuit technology store); ships
  are twelve stores each for 4 (`+0x6b58`), 6 (`+0x86c8`) and 5 (`+0xa228`);
  exocraft seven stores each for 10 (`+0x4b68`) and 11 (`+0x5b60`).
- A store holds its element count at `+0x8c` and its elements at `+0x90`.
- The routine reads to its end (`10b82ad`) only the three fields of its
  argument; for the ship choices it also flags the current ship's display
  to refresh.

## What was built

Bridge 1.29.0 (`technology_install.h`, SHA-256
`77f4876da12d74168150e32dfdbd84857dcf3aed9b218983959acfc77cfc46e3`), request
`native-install-request-180836-<pid>.txt`, event `install`:

- `mode=list`: reads only. Walks the exosuit (choices 0 to 2), the
  multi-tool in hand (3), the twelve ships (4 to 6), the freighter (7 to 9)
  and the seven exocraft (10, 11) and reports every technology element with
  `FullyInstalled` 0.
- `mode=finish` with `all=1` or `slot=<choice>,<owner>,<x>,<y>` lines: for
  each wanted element calls `10b7c80` with a blank block holding the three
  fields, then reads the flag back. **A native call of the game's routine;
  the bridge writes nothing into a store.** The components are not taken.
- Never finished: an identifier refused by the technology rules
  (`technology_learn.h`: damaged-slot, maintenance, template, repair,
  `OBSOLETE`) or one the running game has no definition for.
- Result `native-install-result-…`: `result=listed|finished|not_ready`,
  `entries=`, `finished=`, `truncated=`, then
  `entry=<choice>,<owner>,<x>,<y>,<ID>,<waiting|finished|still_waiting|blocked|unknown_id>`.

Application 1.37.0: page "Waiting technologies" under "Deliver"
(`components/pending-tech-card.tsx`, `shared/waiting-technology.ts`,
`main/research-bridge/install-plan.ts`): a check button, the list by
inventory with the technology's name, and "finish" for one, for an
inventory or for all. A listing makes no save backup (it changes nothing);
a finish does. It changes the loaded slot only.

## Not known yet

- Everything live: whether the list matches what the game shows, whether a
  finish works from a blank block, whether the game shows a message, and
  whether the technology then works and survives a save and reload.
- The multi-tools not in hand (only the active one is walked).
- Known since application 1.39.0: the owner index of an exocraft is its
  `GcVehicleType` (read from the executable: Buggy, Bike, Truck,
  WheeledBike, Hovercraft, Submarine, Mech), which the game's texts name
  Roamer, Nomad, Colossus, Pilgrim, Dragonfly, Nautilon and Minotaur
  (`VEHICLE_<TYPE>_TITLE_L`).
- Undo: none from the application. The save backup made before a finish is
  the way back.
- Rejected: the other writers of `+0x29` (`5b4930` swaps a missing
  technology for `OBSOLETE` when a store is read; `1108e40`, `f77c05`,
  `3869c3`, `1372de2` and `4c66eb` belong to other structures).

## Next

Live test from the application on slot 3: leave a technology waiting (the
owner's ship has an Emergency Warp Unit waiting), press "Check my
inventories", finish that one, look at the slot in the game, save, reload.

## Reproduce

Disassemble `10b7c80` of build 180836 (about 0x600 bytes). Search bytes for
the flag: `C6 4x 29 01` (set), `80 7x 29 00` (test), `lea reg, [rax+0x29]`
at `10b7d64`.
