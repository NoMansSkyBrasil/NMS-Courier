# Currency rewards data file

Twelve extra entries for the game's reward table, each holding one money
reward of a fixed amount. The bridge asks the game's own reward routine for
one of them, so the game adds the money and shows its own notification.
Nothing here gives money by itself: without a bridge request the entries are
never used.

| Currency | Reward IDs | Amounts |
| --- | --- | --- |
| Units | `CR_UNITS_1M`, `CR_UNITS_10M`, `CR_UNITS_100M`, `CR_UNITS_1B` | 1,000,000 to 1,000,000,000 |
| Nanites | `CR_NANITE_1K`, `CR_NANITE_10K`, `CR_NANITE_100K`, `CR_NANITE_1M` | 1,000 to 1,000,000 |
| Quicksilver | `CR_QS_1K`, `CR_QS_10K`, `CR_QS_100K`, `CR_QS_1M` | 1,000 to 1,000,000 |

Install: copy the folder `NMSCourierCurrencyRewards` into the game's
`GAMEDATA\MODS` folder while the game is closed. Remove the folder to undo.
It is a file in the game's mod folder; no save and no account file is
touched. The game shows its usual notice that mods are present.

History and evidence: the same method with three entries of 1,000,000,000
each (`prototypes/data-mod/NMSCourierCurrencyRewardProbe`) delivered Units,
Nanites and Quicksilver on build 179666 on 2026-09-23. The entry layout is
unchanged in the 180836 table. This file with twelve entries has not been
loaded by the game yet; see `docs/CURRENCY_DELIVERY_NOTES.md`.
