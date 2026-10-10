# Release checklist: what is built, what was seen working, what is left

Written on 2026-10-10 after a re-read of every page of the application
(1.41.0, bridge 1.31.0, game build 180836). It answers one question: what
still has to be fixed or tried before this can be handed to a player. The
[capability status table](CAPABILITY_STATUS.md) stays the full record; this
is the short working list.

A capability counts as verified only when it worked **from the application**
in the running game (`AGENTS.md`). "Checked offline" means an emulator or a
reading of the executable, which is not the same thing.

## Worked from the application, in the game

As the capability status table and the owner's reports record it.

| Area | What was seen |
| --- | --- |
| Items into the exosuit cargo | Delivered (2026-10-08) |
| Corvette build mode with class and slots | Worked (2026-10-08, owner's report) |
| Travel to a system | A space station reached (2026-10-09); a planet reached from the planet finder (2026-10-10) |
| Standings and milestones | The levels arrive; the game's message for silent entries was not seen |
| Expedition rewards | Unlocked and claimed at the Quicksilver companion (owner's report, 2026-10-09) |
| Waiting technologies | Worked (owner's report, 2026-10-10; no detail) |

## Worked in the game when sent by hand, not yet tried again from the application

These were seen working on 2026-10-06 to 2026-10-08, when requests were
still sent by scripts. The application now sends the same requests itself;
each wants one run from its page.

Technologies, crafting recipes, build parts, refiner and cooking recipes,
appearance, titles, fishing record, quicksilver shop, Twitch and platform
rewards; exosuit, starship and multi-tool slots, supercharged slots and
class; freighter offers and slots; new starship and new multi-tool offers;
currencies (fixed amounts then; any amount has never been run).

## Built, never tried in the game

Each line is one short test from the application, on save slot 3.

| Area | What to do | What to look at |
| --- | --- | --- |
| Repair and recharge (bridge 1.33.0) | "Repair everything"; "Recharge everything now"; the automatic recharge with one minute | Damaged technology is repaired; charges are full; the automatic one keeps them so |
| Purple stars on the map (bridge 1.33.0) | "Send to the game" | Purple systems show on the galaxy map |
| Search for planets around you (bridge 1.30.0, 1.31.0) | "Find a planet", "Around me", one minute, preset Earth-like | The game keeps its frame rate; planets appear; travel to one and compare biome, weather, sentinels and grass colour |
| Search in another galaxy | The same after travelling to another galaxy | The planets found are of that galaxy and travel lands there |
| Purple star and portal-only systems | Travel to one planet with each badge | The system is purple; the portal-only one is not on the galaxy map |
| Install button | Rename the bridge file in the game folder, open the application, press "Install" | The file is back and the game connects |
| Milestone screen for silent entries (bridge 1.24.0) | Raise one "no message" milestone with the switch on | The full "milestone reached" screen |
| Fractional milestones (bridge 1.25.0) | Raise one of them | The value and the message |
| Guide topics | Unlock a few | They are in the guide |
| Space Anomaly | "Send to the game" on a save that has not reached it | The Anomaly can be summoned |
| Missions (bridge 1.27.0, 1.28.0) | Complete one small secondary mission | Whether the next one starts and what the skipped steps gave |
| Words | Teach a few words of each race | They are known in a conversation |
| Portal glyphs | Learn the next glyphs | They are in the portal screen |
| Corvettes | Start a build from a shared file | The ship is assembled in the build screen |

## Known limits to say plainly to a player

- The application works with game build 180836 only; another build gets no
  change at all, by design.
- It is a development build: a packaged, installable application has not
  been verified on a clean machine (`docs/DISTRIBUTION.md`).
- Finishing a waiting technology does not spend its components.
- Completing a mission does not hand over what its steps would have given.
- The application carries no planet list; "My planets" is what the
  player's own searches found and what they imported.
- Item names are in capitals, as the game's own catalogue has them.

## Found by the re-read and fixed in 1.39.0 to 1.41.0

Cards that should have been hidden, category names in English, an empty
"Saves" page, a connection page full of internal words, exocraft shown as
numbers, planned areas looking like working ones, the planet list using the
wrong biome file for most variants and holding no purple star. See
[the changelog](../CHANGELOG.md).

## Still open in the interface

- A read-through in languages other than Portuguese.
- The card title "Send to the game" is the same on every page.
- Long lists load their icons a moment after the rows.
- The equipment pages keep a selector called "Action" whose choices could
  be buttons.
