# Repair, recharge and purple stars on the map

Owner request of 2026-10-10 (ideas 1 to 3 of
[feature ideas](FEATURE_IDEAS.md#found-on-2026-10-10-while-reading-the-mission-rewards-and-the-planet-routines)):
repair a whole inventory, recharge technologies (also by themselves, every X
minutes and when a charge falls under 20%), and show purple star systems on
the galaxy map.

Status: **built (bridge 1.33.0, application 1.43.0, data file of the same
day) and installed; not tried in the running game.** Build 180836
(executable SHA-256
`13d5060d4efb9d2a6a6b1b349bc4257231056cc2a055df4bb15d816262cc3499`).

## The game's rewards used

Read from the executable's metadata and the mission tables:

| Reward class | Hash | Size | Fields | Use in the game's tables |
| --- | --- | --- | --- | --- |
| `GcRewardRepairWholeInventory` | `0xe7a841f6` | 4 | `InventoryToRepair` +0 (enum: Personal, PersonalTech, Ship, ShipTech, Freighter, Vehicle, AttachedAbandonedShip, Weapon) | 38 times, with Weapon and Ship |
| `GcRewardRechargeTech` | `0x865c738a` | 0x18 | `TechID` +0 (16 bytes), `Silent` +0x10 | `PROTECT`, `LAUNCHER`, `SUB_ENGINE` |
| `GcRewardPurpleSystems` | `0x56a095a7` | 1 | `Allow` +0 | three mission rewards, Allow true |

Not used: `GcRewardRefreshHazProt` (the game's tables give it mostly negative
amounts, so what a positive one does is not known) and
`GcRewardShowBlackHoles` (no entry of the tables uses it, so no example of
its `SignalScanType`).

## What was built

Data file (`build-courier-reward-table.py`): carriers `COURIER_REPAIR`
(placeholder Weapon), `COURIER_RECHARGE` (TechID `COURIER`, not silent) and
`COURIER_PURPLE` (Allow true). New SHA-256
`bade6eb738e5b70a6d43a08fc5d2357dd64839ca90bef92b0d864bcef327c200`.

Bridge 1.33.0 (`fea4a9633156b010e7e788e9fa9ce74d2ae036fd4715b95138275d816e541dab`):

- `inventory_repair.h`, event `repair`: request `silent=0|1` and
  `inventory=<n>` lines (0 to 5 or 7). For each, the carrier's enum is
  written, the reward given, and the placeholder put back.
- `technology_recharge.h`, event `recharge`: request `silent=0|1` and
  `threshold=<1..100>`. The bridge reads the same inventories the
  waiting-technology walk covers, notes every installed technology whose
  `Amount` is under `MaxAmount` and under the threshold percent (blocked
  identifiers left out, 64 at most), and gives the reward once for each
  identifier. Result `given` or `nothing_low`, then `tech=<ID>` lines.
- `galaxy_map_reveal.h`, event `purple`: request `allow=1`; the carrier is
  given as it is.

All three are native calls of the game's reward routine; the bridge writes
only its own carrier entry and restores it. Slot scope.

Application 1.43.0: page "Repair and recharge" under Equipment
(`upkeep-card.tsx`, `shared/upkeep.ts`, `upkeep-plan.ts`) and page "Purple
stars on the map" under Progress (the generic card). The automatic recharge
lives in the main process: every 30 seconds, while it is on and the game
runs, it recharges what is under 20% (when that is chosen) and, every X
minutes, everything that is not full; silent, one save backup each time it
is switched on, and not listed in the activity page.

## Not known

- Everything in the running game: which inventory each enum value repairs
  (taken from its name), whether `RechargeTech` recharges a technology in
  any inventory or only in one, whether a technology that cannot be charged
  ever has `Amount` under `MaxAmount`, where the purple-star state is kept.
- Undo: none is needed for a repair or a recharge; the purple-star view is
  not taken back by the application.

## Next

From the application on slot 3: damage a technology (or take one that is),
"Repair everything"; let hazard protection run down, "Recharge everything
now"; switch the automatic recharge on with one minute; "Purple stars on
the map" and look at the galaxy map.
