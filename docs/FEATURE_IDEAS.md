# Feature ideas from a survey of the game

Asked by the project owner on 2026-10-10: a full look at the game for new
features that fit the project. Offline survey of build 180836 (executable
`13d5060d…`); **nothing here is built, nothing was sent to the game, and no
handler named here was read unless the text says so.** Every idea is a lead
to be confirmed before it is promised.

## How the survey was made

The project's rule is that the running game hands things over. The game's
own vocabulary for handing things over is its reward classes, so the survey
lists every class whose name begins with `GcReward` in the executable's
metadata (190 names, 180 of them rewards; the rest are table containers),
with its fields, and counts how often the shipped reward table uses each.
A class the game itself uses is a route this project can take with the
carrier method already used for currencies, words, glyphs, stats, guide
topics, the Space Anomaly and missions
([carrier README](../runtime/mods/courier_rewards/README.md)).

Reproduce: list the `cGcReward…` names of the executable, read each class
row (name, hash, fields) and count `value="GcReward…"` in
`metadata/reality/tables/rewardtable`.

## What already exists (for comparison)

Items and currencies; exosuit, starship, multi-tool, freighter and corvette
(slots, class, a new one by seed); technologies, crafting recipes, build
parts, refiner and cooking recipes, appearance; titles, expedition, Twitch
and platform rewards, Quicksilver shop; words, glyphs, guide, Space
Anomaly, missions (experimental), standings, milestones, fishing record;
travel by portal address; the catalogue and the model workshop. Planned and
not built: frigates, companions.

## Ideas, strongest first

Effort: **low** means a carrier and a page like the guide topics; **medium**
needs data work or a new kind of page; **high** needs research of live
state. "Uses" is the count in the shipped reward table.

### 1. Find a place on the planet you are on

`GcRewardScanEvent` (162 uses) starts one of the game's scan events: the
game then marks the nearest portal, crashed freighter, monolith,
manufacturing facility, distress signal, settlement, sentinel pillar and so
on, exactly as a navigation chart or a signal booster does. 108 distinct
events are named by rewards (`PORTAL`, `CRASHED_FREIGHTER`, `MONOLITH`,
`FACTORY`, `OBSERVATORY`, `DISTRESS`, `SETTLEMENT`, `DRONE_HIVE`,
`ABANDONED`, `LIBRARY`, `DEPOT` …). Related: `GcRewardSignalScan`
(crashed freighter, shelter), `GcRewardScanEventNearestBuilding`,
`GcRewardUnhideLocalSpacePOI` (space encounters).
A "Find" page: pick what you look for, the game puts the marker. Fits the
project best of all: it gives nothing, it only points. Effort **medium**
(which events work outside their mission has to be sorted, as for
technologies).

### 2. Upgrade modules of a chosen kind and class

`GcRewardProcTechProduct` (375 uses) hands over a procedural upgrade module
of a group with weights for Normal, Rare, Epic and Legendary; 33 groups are
used (hazard protection, jetpack, shields, hyperdrive, pulse engine, every
ship and multi-tool weapon, scanner, living-ship parts). The procedural
technology table has 254 entries (53 Legendary, 64 Epic, 22 Illegal, 2
Sentinel). A page that gives, say, three S-class hyperdrive modules through
the game's own routine, with its notification. Effort **low to medium**.

### 3. Slots and class through the game's own upgrade rewards

`GcRewardInventorySlots`, `GcRewardShipSlot`, `GcRewardWeaponSlot`,
`GcRewardFreighterSlot`, `GcRewardUpgradeShipClass`,
`GcRewardUpgradeWeaponClass` are what the game uses when a drop pod, a
station terminal or an expedition gives a slot or a class. Today part of
the inventory work of this project is direct writes to the stores
([live bridge operations](LIVE_BRIDGE_OPERATIONS.md)). Moving to these
rewards would make "one more slot" and "one class up" native calls with
the game's message, which is what the owner's rule asks for. Effort
**medium**; worth it mainly for the rule.

### 4. Frigates

`GcRewardSpecificFrigate` (11 uses): class, seed, home system seed, race,
name, primary trait. The feature is already planned in the application.
The frigate trait table has 178 traits. A page like "new starship":
choose class and race, draw or type a seed, receive the frigate from the
game. Effort **medium** (fleet full, freighter required: conditions to
read).

### 5. Companions

`GcRewardSpecificPetEgg` (62 uses, a full egg description), 
`GcRewardPetEgg`, `GcRewardPetEggHatch` (18 uses). Also planned already.
A companion egg of a chosen creature handed over by the game; the player
hatches it. Effort **medium to high** (the egg data is large).

### 6. Open any shop or research tree where you stand

`GcRewardOpenPage` (29 uses, 27 pages: building parts shop, the Anomaly's
technology shop, the scrap dealer, the companion shop, fleet and squadron
management, settlement management, weapon customisation, expedition
selection) and `GcRewardOpenUnlockTree` (17 uses, 11 trees: suit, ship,
weapon, exocraft, freighter, corvette, base parts, craftable products).
The player still pays and chooses; the application only opens the window.
Very close to the project's idea of helping without doing it for the
player. Effort **low**, but each page needs a check that it opens safely
away from its usual place; needs the same wait for the game window as the
offers.

### 7. Player condition

`GcRewardHealth`, `GcRewardShield`, `GcRewardEnergy`,
`GcRewardRefreshHazProt` (17 uses), `GcRewardFreeStamina`,
`GcRewardJetpackBoost`, `GcRewardRepairWholeInventory`,
`GcRewardRepairTech`, `GcRewardRechargeTech`. A small "Help" page: refill
life support and hazard protection, repair every damaged technology of the
ship, recharge a technology. Effort **low**.

### 8. Sentinels and wanted level

`GcRewardWantedLevel` (the shipped entry `R_CLEAR_WANTED`) and
`GcRewardDisableSentinels` (duration, the game's own message;
`R_SENTINELS_OFF`). "Clear wanted level" and "Sentinels off for a while".
Effort **low**.

### 9. Galaxy and star systems

- `GcRewardJourneyThroughCentre` (4 uses: Lush, Balanced, Vicious,
  Abandoned): the game's own move to the next galaxy of a chosen kind.
- `GcRewardPurpleSystems` (Allow): access to purple star systems, which
  the story unlocks; same shape as the Space Anomaly switch.
- `GcRewardShowBlackHoles`, `GcRewardForceDiscoverSystem`
  (`R_SYS_DISCOVER`), `GcRewardStationTeleportEndpoint` (adds the current
  station to the teleporter list), `GcRewardTeleport` to the base.
Effort **low** each; the galaxy move is a large change and needs a clear
warning.

### 10. Atlas path, builders, other story switches

`GcRewardAtlasPathProgress`, `GcRewardSetAtlasMissionActive`,
`GcRewardBuildersKnown`. Small switches that belong beside the Space
Anomaly page, or inside the missions work. Effort **low**; effects to be
read first.

### 11. Settlements

`GcRewardSettlementProgress`, `GcRewardBeginSettlementBuilding`,
`GcRewardSettlementStat`, `GcRewardSettlementJobGift`,
`GcRewardSettlementParty`, `GcRewardTriggerSettlementJudgement`,
`GcRewardSettlementCustomJudgement`; 90 settlement perks in the perk
table. Finish the building in progress, trigger the next decision, raise a
settlement stat. Effort **medium to high** (which settlement is "the
nearest", what the stats are).

### 12. Base helpers

`GcRewardWorker` (builder, farmer, scientist, vehicles, weapons expert):
the base specialists whose quests unlock blueprints. `GcRewardUpgradeBase`,
`GcRewardFreighterBaseReset`. Effort **medium**.

### 13. Weather and world events

`GcRewardTriggerStorm` (duration), `GcRewardPirateAttack`,
`GcRewardFrigateFlyby`, `GcRewardActivateFiends`,
`GcRewardTimeWarp` (0 uses in the table: unproven). For screenshots and
for players who want a storm for storm crystals. Effort **low**; clearly a
toy, to be kept apart from deliveries.

### 14. Lore and catalogue completions

The table `storiestable` (lore stories) and the stat rewards suggest a
"read every story" completion like the words; `GcRewardScan` (scan data).
Not examined. Effort unknown.

### 15. Find planets by what they are like

Added the same day at the owner's wish: Earth-like planets found offline
with the emulated generator and reached with the Travel page. See
[finding planets](PLANET_FINDER_NOTES.md).

## Ideas that are not about a new reward

- **Kits.** A named list of deliveries saved in the application ("start
  of a new save": glyphs, guide, Space Anomaly, a multi-tool, units) and
  sent in order with one confirmation. Everything it sends already exists.
  Effort **medium**, all in the application.
- **What do I still lack?** Read-only: ask the bridge which words,
  recipes, technologies, glyphs and milestones the loaded save already has
  and show only what is missing. The largest quality gain for the pages
  that exist; it needs read requests, which the words page, the milestone
  page and the missions page all wait for.
- **Favourites and sharing.** Export and import of teleport destinations,
  workshop seeds and kits as one file, so players can pass them on. The
  teleport export is already listed in `TODO.md`.
- **Activity with undo notes.** The activity page could say, for each
  thing sent, how to go back (which backup was made, what the game cannot
  take back).
- **Another player.** The project plan already names delivery to a
  network player through the game's multiplayer; `GcRewardNetworkPlayer`
  exists in the game (0 uses, one field) and is the first thing to read
  when that work starts.

## What the survey says not to build

`GcRewardForgetSpecificProductRecipe`, `GcRewardForgetSpecificTechRecipe`,
`GcRewardDeath`, `GcRewardDamage`, `GcRewardDamageTech`,
`GcRewardFillInventoryWithBrokenSlots`, `GcRewardReinitialise`: they take
away or break. They are outside "the application helps the player".

## Suggested order

1. Find a place (1): new, harmless, nothing like it in the application.
2. Upgrade modules (2): asked for by most players, low effort.
3. Player condition with sentinels and wanted level (7, 8): one small page.
4. Open shop or research tree (6): cheap, in the spirit of the project.
5. Frigates and companions (4, 5): already planned, larger.
6. "What do I still lack?": the read requests that many pages need.
7. Slots and class through the game's rewards (3): for the rule.
