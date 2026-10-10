# Courier reward entries

The folder `NMSCourier` is everything this project puts into the game's
`GAMEDATA\MODS` folder. Its reward table adds five entries to the game's
reward table. None of them is ever given by the game on its own: the bridge
uses each as a carrier, see
`runtime/native/asi/profile_180836/reward_carrier.h`. The bridge checks that
the entry still holds what this file gave it, writes the requested amount (or
item and amount), calls the game's own reward routine, and writes the original
content back. The game adds the money or the item and shows its own
notification.

| Entry | Content in this file | Used for |
| --- | --- | --- |
| `COURIER_UNITS` | 1 unit | Units of any amount |
| `COURIER_NANITES` | 1 nanite | Nanites of any amount |
| `COURIER_QS` | 1 quicksilver | Quicksilver of any amount |
| `COURIER_SUBST` | 1 Carbon (`FUEL1`), multiplier off | Any substance, with the game's notification |
| `COURIER_PRODUCT` | 1 Metal Plating (`CASING`) | Any product, with the game's notification |
| `COURIER_SHIP_*` (8) | a starship of one kind, seed 1, class S | A new starship of that kind |
| `COURIER_RUNE` | discover the next portal glyph | Portal glyphs, all or the next ones |
| `COURIER_STAT` | set the placeholder stat `COURIER` to 0 | Levels of standings and journey milestones |
| `COURIER_WIKI` | unlock the placeholder guide topic `COURIER` | Topics of the game's guide |
| `COURIER_NEXUS` | allow the Nexus | Access to the Space Anomaly |
| `COURIER_MISSION` | complete the placeholder mission `COURIER` | Completing named missions (experimental) |
| `COURIER_WORD` | one word of the Gek the player lacks | A number of words of any race the game chooses |
| `COURIER_WORDS` | 64 placeholder word groups of the Gek | Chosen word groups of any race |
| `COURIER_TOOL_*` (16) | a multi-tool of one scene and class, seed 1, class S | A new multi-tool of that kind |

The desktop application also writes the corvette layout it prepares from a
`.nmsship` file into the same folder (`METADATA/SIMULATION/SHIPBASES` and the
debug options file); those are made per corvette and are not in the
repository.

Install: copy the folder `NMSCourier` into the game's `GAMEDATA\MODS` folder
while the game is closed. Remove the folder to undo. No save and no account
file is touched; the game shows its usual notice that mods are present. The
application checks the table by its SHA-256, so the file must not be edited
and is kept byte-identical by `.gitattributes`.

History: the method delivered the three currencies on build 179666 on
2026-09-23 with three fixed entries
(`prototypes/data-mod/NMSCourierCurrencyRewardProbe`). On 2026-10-08 the
folder was first `NMSCourierCurrencyRewards` with twelve fixed amounts and two
item carriers; the owner asked for a clear name and it became this one, with
only the entries that are used.
