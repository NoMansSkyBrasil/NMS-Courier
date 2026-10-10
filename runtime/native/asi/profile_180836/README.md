# Research profile for build 180836: source layout

One file per game domain, as the repository rules require. `profile_core.c` is
the only translation unit; it includes the other files once, in the order
below. A file marked *shared* holds plumbing that several domains need and
nothing that belongs to one of them. Built with
`build-probe.ps1 -Mode Profile180836`; how requests reach the game is in
[live bridge operations](../../../../docs/LIVE_BRIDGE_OPERATIONS.md).

| File | Domain | Contents |
| --- | --- | --- |
| `profile_core.c` | core | Build check, addresses used by all, the hook on the game's update routine, per-process events, status file, target verification |
| `file_signal.h` | shared | Requests from the desktop application: a per-process file names the request, the worker takes and deletes it |
| `bridge_version.h` | core | The bridge version, written to the status file |
| `inventory_store.h` | shared | Layout of one inventory store; special slots; full grid; store consistency check |
| `ship_inventory.h` | starship | Owned ship stores, primary ship, ship class and slot rewards |
| `multitool_inventory.h` | multitool | Owned multitool stores, equipped multitool, multitool class and slot rewards |
| `exosuit_inventory.h` | exosuit | Exosuit cargo and technology stores, exosuit slot reward |
| `owned_inventory_request.h` | shared | The in-place request (full grids, special slots) over the three files above |
| `purchase_setup_hooks.h`, `purchase_setup_hooks_functions.h` | shared | Hooks on the purchase setup and layout routines, which the game uses for both freighter offers and corvette builds |
| `freighter_offer.h` | freighter | Offer class, scene and seeds, technology carry at acceptance, freighter rewards |
| `corvette_build.h` | corvette | Class at build start, build-mode reward |
| `shipped_reward_dispatch.h` | shared | One dispatch of a shipped reward; the allow-list is assembled from the IDs the domain files name |
| `technology_learn.h` | technology | Learn known technologies, with the permanent refusal rules |
| `recipe_learn.h` | recipes | Learn refiner and cooking recipes |
| `reward_redeem.h` | rewards | Redeem season, Twitch and platform rewards in the slot |
| `fish_record.h` | fish | Fill the slot's fishing record |
| `product_learn.h` | products | Learn product recipes in the slot, with the refusal rules |
| `reward_carrier.h` | shared | Find this project's own reward table entry and call the game's reward routine with it (currencies, items with notification) |
| `obtain_request.h` | shared | The request for getting a new starship or multi-tool: model, seed and class written into a carrier entry, then the game's reward routine |
| `ship_obtain.h` | starship | Models and reward fields for getting a new starship |
| `multitool_obtain.h` | multitool | Models and reward fields for getting a new multi-tool |
| `currency_reward.h` | currencies | Units, nanites or quicksilver of any amount through the game's reward routine, with the data file's entries as carriers |
| `teleport_request.h` | travel | Send the player to a star system by galaxy and portal address through the game's teleport reward handler |
| `word_teach.h` | words | Teach alien word groups of one race through the game's rewards |
| `rune_discover.h` | glyphs | Discover portal glyphs in the game's order through the game's reward |
| `stat_level.h` | levelled stats | Raise standings and journey milestones by levels through the game's stat reward |
| `star_system.h` | star system | Read only: the seed of the star system the player is in and the ships the game generated for it, written to a file when they change |
| `item_give.h` | items | Put substances and products into the exosuit cargo through the game's store routines; report the cargo's stack sizes |
| `account_unlock.h` | account | Unlock titles, specials and season rewards on the account through the game's routines |

Rules for this folder:

- A new domain is a new file, included from `profile_core.c` with one line in
  the event table. Do not add a second domain to an existing file.
- What two domains share goes into a file named for what it is, not into the
  core and not into one of the domains.
- Class, inventory and technology of one kind of item stay in that item's
  files; when one of them grows, split it by topic inside the domain
  (`ship_class.h`, `ship_inventory.h`), not across domains.
- The hooks file has two parts only because C needs the domain files between
  the declarations and the functions that call them.

History: until 2026-10-07 all of this was one file,
`runtime/native/asi/freighter_class_180836.c`, built with
`-Mode FreighterClass180836`. The split moved every function body unchanged
and rewrote only the glue; the status file became
`native-profile-180836-<PID>.log`, its mode `research_profile` and the event
base `NMSCourier-Profile180836-`.
