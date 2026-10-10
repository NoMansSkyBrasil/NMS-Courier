# Capability status

One table for what the project can do, built on 2026-10-08 from the whole
commit history (260 commits, 2026-09-21 to 2026-10-08), the experiment log and
the owning notes. It answers three questions per capability: was it ever seen
working in the running game, is it in the desktop application, and has it
worked **from the application**. Keep it current with every change; the owning
note stays the place for details.

Words used: *live* means seen in the running game on a real save; *script*
means the request was sent by hand with the research scripts that existed
until 2026-10-08; *app* means sent from the desktop application. Since
2026-10-08 only *app* counts as verified for the product.

Current versions: application 1.35.0, bridge 1.28.0, game build 180836.

## History in five steps

1. **2026-09-21 to 09-22: foundations.** Electron shell, private Python
   runtime, catalogue model, protocol schemas, installation and process
   checks. A Python bridge (NMS.py) authenticated but never delivered.
2. **2026-09-23 to 09-24, build 179666: first deliveries.** A native DLL
   (XInput proxy) added Carbon through the game's inventory routine (no
   notification) and gave units, nanites and quicksilver through the game's
   reward routine with three custom reward table entries (with the game's
   notification). Freighter offers were studied; class stayed C.
3. **2026-10-01 to 10-06: research.** Offline corpus of all game data,
   procedural seed research, model workshop, and the move to builds 180383 and
   180836. Freighter offers with class S, full slots, supercharged slots,
   chosen model and seeds were delivered live.
4. **2026-10-07 to 10-08: the research profile.** One bridge with a request
   per domain: corvette from an export, in-place upgrades, technologies,
   recipes, products, build parts, appearance, fishing, titles, expedition,
   Twitch and platform rewards with the keep list. All sent by script.
5. **2026-10-08: the product.** Interface by domain in 14 languages, the
   catalogue and icons read from the installation, versions, and the requests
   moved from scripts into the application. First delivery from the
   application the same day.

## Deliver

| Capability | Live before (script) | In the application | Worked from the app | Owning note |
| --- | --- | --- | --- | --- |
| Items into the exosuit cargo, silent | Carbon on 179666 (2026-09-23) | Items page | **Yes**, `FUEL1` x9999, 2026-10-08, bridge 1.3.0 | [items](ITEM_DELIVERY_NOTES.md) |
| Items with the game's notification | Never (a planter reward patch was prepared on 179666, not run) | Items page, default | No. Needs bridge 1.4.0 and the new data file | [items](ITEM_DELIVERY_NOTES.md) |
| Stack size of each item | Not applicable | Items page | Sizes were written by the bridge (2026-10-08); the page was not looked at by the owner yet | [items](ITEM_DELIVERY_NOTES.md) |
| Units, nanites, quicksilver, fixed 1,000,000,000 | Yes on 179666 (2026-09-23), with notification and persistence | Replaced by free amounts | Not applicable | [currencies](CURRENCY_DELIVERY_NOTES.md) |
| Units, nanites, quicksilver, any amount | Never | Currencies page | No. Bridge 1.3.0 refused (`bad_layout`); corrected in 1.4.0, not run | [currencies](CURRENCY_DELIVERY_NOTES.md) |
| Exosuit: all slots, supercharged slots, in place | Yes (2026-10-07) | Exosuit page | No | [owned upgrades](OWNED_INVENTORY_UPGRADE_NOTES.md) |
| Exosuit: one more slot through the game's reward | Yes (2026-10-07) | Exosuit page (added 2026-10-08) | No | [owned upgrades](OWNED_INVENTORY_UPGRADE_NOTES.md) |
| Starship: all slots, supercharged, current ship or a ship slot | Yes (2026-10-07) | Starships page | No | [owned upgrades](OWNED_INVENTORY_UPGRADE_NOTES.md) |
| Starship: class step, slot reward | Yes (2026-10-07) | Starships page | No | [owned upgrades](OWNED_INVENTORY_UPGRADE_NOTES.md) |
| Read the current star system: seed and ships | 2026-10-09 (file read directly) | Model workshop, "Current system" (2026-10-08, bridge 1.8.0) | Not yet seen in the application by the owner | [seed origins](SEED_ORIGINS.md#reading-a-system-from-the-running-game) |
| Alien words of a race, chosen groups or all | Never | Words page (2026-10-09, bridge 1.22.0) | No | [words and glyphs](WORD_AND_GLYPH_NOTES.md) |
| Portal glyphs, all or the next ones | Never | Portal glyphs page (2026-10-09, bridge 1.22.0) | No | [words and glyphs](WORD_AND_GLYPH_NOTES.md) |
| Guide topics (50), chosen or all | Never | Guide page (2026-10-09, bridge 1.26.0) | No | [past expeditions and other unlocks](EXPEDITION_HISTORY_NOTES.md) |
| Access to the Space Anomaly | Never | Space Anomaly page (2026-10-09, bridge 1.26.0) | No | [past expeditions and other unlocks](EXPEDITION_HISTORY_NOTES.md) |
| Planets by biome, weather and sentinels with portal addresses (a survey made offline; one system matched the game on 2026-10-10) | Read only: one system compared (2026-10-10) | Planet finder page (2026-10-10); travel uses the teleport request | No | [finding planets](PLANET_FINDER_NOTES.md) |
| Reward trace (diagnostic, reads only): list the rewards the game gives with seed and calling code | Never | "Game and bridge" page with internal names on (2026-10-10, bridge 1.34.0) | No | [seed origins](SEED_ORIGINS.md#the-stations-multi-tool-where-its-seed-is-taken-from-2026-10-10) |
| Repair a whole inventory; recharge technologies, also automatically; purple stars on the galaxy map (experimental) | Never | Repair and recharge page, Purple stars page (2026-10-10, bridge 1.33.0) | No | [upkeep](UPKEEP_NOTES.md) |
| Planet search around the player, any galaxy, with grass colour (experimental) | Never | Find a planet, "Around me" (2026-10-10, bridge 1.30.0) | No | [finding planets](PLANET_FINDER_NOTES.md#the-search-around-the-player-bridge-1300-application-1400) |
| Finishing technologies that wait for components, in every inventory (experimental) | Never | Waiting technologies page (2026-10-10, bridge 1.29.0) | **Yes** (owner's report, 2026-10-10; no detail) | [finishing waiting technologies](TECHNOLOGY_INSTALL_NOTES.md) |
| Completing named missions (experimental; effect on skipped stages unknown) | Never | Missions page (2026-10-09, bridge 1.27.0) | No | [completing missions](MISSION_COMPLETION_NOTES.md) |
| Standing with races, guilds and outlaws, by levels | Never | Standing page (2026-10-09, bridge 1.23.0) | No | [levelled stats](STAT_LEVEL_NOTES.md) |
| Journey milestones (43 counters), by levels | 2026-10-09: level arrived, no message (a silent stat) | Milestones page (2026-10-09, bridge 1.23.0) | Partly: level yes, message unproven | [levelled stats](STAT_LEVEL_NOTES.md) |
| Travel to a system by galaxy and portal address | Station in the same galaxy reached (2026-10-09); exact address, planet and other galaxies not checked | Teleport page (2026-10-09, bridge 1.21.0) | Yes, station in the same galaxy | [teleport](TELEPORT_NOTES.md) |
| New starship: kind (eight), seed, class | Fighter offered with chosen seed, 120 cargo and 120 supercharged technology slots (2026-10-09, bridge 1.19.0); other kinds and persistence not checked | Starships, "Get a new one" (2026-10-08, bridge 1.7.0) | No | [obtain](SHIP_AND_MULTITOOL_OBTAIN_NOTES.md) |
| New multi-tool: kind, seed, class | Offer with chosen seed, legacy colours, up to 120 supercharged slots and a working cursor (2026-10-09, bridges 1.11.0 to 1.18.0); persistence of the accepted tool not checked | Multi-tools, "Get a new one" (2026-10-08, bridge 1.6.0) | No | [obtain](SHIP_AND_MULTITOOL_OBTAIN_NOTES.md) |
| Starship from a plain `.nmsship` file | Never; no route known | File is recognised by the reader only | No | [owned upgrades](OWNED_INVENTORY_UPGRADE_NOTES.md) |
| Multi-tool: all slots, supercharged, class step, slot reward | Yes (2026-10-07) | Multi-tools page | No | [owned upgrades](OWNED_INVENTORY_UPGRADE_NOTES.md) |
| Freighter offer: class, 120 + 120 slots, supercharged | Yes, owned and persistent (2026-10-06) | Freighters page | No | [inventory class](INVENTORY_CLASS_RESEARCH.md) |
| Freighter offer: chosen model and seeds | Yes, pirate freighter (2026-10-06) | Freighters page (added 2026-10-08) | No | [inventory class](INVENTORY_CLASS_RESEARCH.md) |
| Freighter: one more slot through the game's reward | Yes (2026-10-07) | Freighters page (added 2026-10-08) | No | [owned upgrades](OWNED_INVENTORY_UPGRADE_NOTES.md) |
| Corvette build mode with class and slots | Yes (2026-10-07) | Corvettes page | **Yes**, 2026-10-08, bridge 1.4.0 (owner's report) | [corvette](CORVETTE_DELIVERY_NOTES.md) |
| Corvette from a `.nmsship` export | Yes, owned, with a layout file made by hand and a game restart (2026-10-07) | Corvettes page: choose file, prepare in the game, restart, start build (2026-10-08) | No | [corvette](CORVETTE_DELIVERY_NOTES.md) |
| Frigates | Never researched | Page says so | No | none |
| Companions | Never researched | Page says so | No | none |

## Unlock

| Capability | Live before (script) | In the application | Worked from the app | Owning note |
| --- | --- | --- | --- | --- |
| Technologies, one or all 205 | Yes (2026-10-07), persistent | Technologies page, all or chosen | No | [technology](TECHNOLOGY_DELIVERY_NOTES.md) |
| Product recipes (items and technology products) | Yes (2026-10-07) | Crafting recipes page, all or chosen | No | [product](PRODUCT_DELIVERY_NOTES.md) |
| Build parts and research-tree products | Yes (2026-10-07); one crash afterwards, cause unknown | Build parts page, all or chosen | No | [product](PRODUCT_DELIVERY_NOTES.md) |
| Refiner and cooking recipes, all | Yes (2026-10-07) | Refiner and cooking page, all only | No | [recipes](RECIPE_DELIVERY_NOTES.md) |
| Appearance options | Yes (2026-10-07) | Appearance page, all or chosen | No | [customisation](CUSTOMISATION_UNLOCK_NOTES.md) |
| Fishing record | Yes (2026-10-07) | Fishing page, all only | No | [known lists](KNOWN_LISTS_TRIAGE.md) |
| Titles | Yes (2026-10-08) | Titles page, all or chosen | No | [account](ACCOUNT_UNLOCK_NOTES.md) |
| Corvette part unlocks | Never; the entries are not products | Not offered | No | [product](PRODUCT_DELIVERY_NOTES.md) |

## Rewards

| Capability | Live before (script) | In the application | Worked from the app | Owning note |
| --- | --- | --- | --- | --- |
| Expedition rewards: slot and account | Yes (2026-10-08) | Expeditions page; slot redemption added to the plan 2026-10-08 | No | [rewards](REWARD_REDEMPTION_NOTES.md), [account](ACCOUNT_UNLOCK_NOTES.md) |
| Quicksilver shop items | Yes (2026-10-08) | Quicksilver page, all or chosen | No | [account](ACCOUNT_UNLOCK_NOTES.md) |
| Twitch rewards: slot, account, kept across online starts | Yes (2026-10-08), two online starts | Twitch page, all only | No | [account](ACCOUNT_UNLOCK_NOTES.md) |
| Platform and pre-order rewards | Yes (2026-10-08) | Platform page, all only | No | [account](ACCOUNT_UNLOCK_NOTES.md) |
| Twitch claim (ships, multi-tools, companions of the drops) | Never; mapped only | Not offered | No | [account](ACCOUNT_UNLOCK_NOTES.md) |
| Entitlement technologies and ships | Never | Not offered | No | [account](ACCOUNT_UNLOCK_NOTES.md) |

## Library and system

| Capability | State | Worked from the app |
| --- | --- | --- |
| Catalogue read from the installation (substances, products, technologies, 14 languages) | Implemented 2026-10-08 | **Yes**, 2,706 entries |
| Game icons read from the installation | Implemented 2026-10-08 | **Yes**, seen in a started application |
| Other tables in the catalogue (recipes, rewards, titles, parts) | Not implemented | No |
| Model workshop (GLB, palettes by seed) | Implemented 2026-10-03 to 10-06 | Yes, since then |
| Palettes and models read from the installation | Not implemented | No |
| Installation found automatically | Implemented 2026-10-08, Steam on Windows | **Yes** |
| Running game recognised | From the bridge's status, 2026-10-08 | **Yes**, by the owner's send |
| Versions of application and bridge shown | Implemented 2026-10-08 | **Yes** |
| Bridge and data file installed by the application | Implemented 2026-10-10 (application 1.38.0); tested on temporary folders only | No |
| Packaged build with the bridge | Not implemented | No |
| macOS and Linux | Requests are portable; installation search and bridge loading are not | No |
| Delivery to another player | Not researched; later goal | No |

## What the comparison says

- Everything that was delivered by script exists in the application, except
  the corvette from a file, which is half done.
- Almost nothing has been sent from the application yet: one item request.
  The next sessions should walk the tables above from the application and fill
  the "worked from the app" column, area by area, on slot 3.
- Open defects known from the history: five `FRE_ROOM_NPC*` products learned
  without being requested; one crash after the build part delivery; one
  technology that had to be taught again after an online start; fourteen
  Twitch appearance rewards redeemed without their technology; the profile
  fixture must be run with its own data folder.
