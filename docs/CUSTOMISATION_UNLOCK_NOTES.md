# Customisation unlock notes

Checkpoint: 2026-10-07. Owner of the character customisation domain:
unlocking appearance options (head, torso, armour, gloves, legs, boots,
backpack, capes), banners, jetpack trails, textures and titles **in the
loaded save slot**.

Status in one line: the link between each option and what unlocks it is
mapped offline and a product class exists for it; one product
was tested on slot 3: as a known product it did not open the option; the
game's slot-side special routine did. All 263 IDs were then sent through
that routine; the owner confirmed every appearance option open and the
automatic save holds them. Titles are a separate, open question.

## What the owner asked (2026-10-07)

Unlock everything in the character customiser, in the character (the slot),
not only on the account. Console-exclusive entries are wanted too. The
owner's screenshots of slot 3 showed about eleven helmet types and two
banner emblems (54 and 55, the latter named "NMSA") locked, the rest open.

## Where the game records what unlocks an option

Tables under `metadata/gamestate/playerdata/` of the build 180836 corpus:

| Table | Field | Links found |
| --- | --- | --- |
| `charactercustomisationdescriptorgroupsdata` | `LinkedProductOrSpecialID` per descriptor group | 132 |
| `bannercustomisationdata` | `LinkedSpecialID`, `ProductToUnlock` | 48 |
| `thrustercustomisationdata` | `LinkedSpecialID` | 22 |
| `charactercustomisationtextureoptiondata` | `ProductsToUnlock` | 5 |
| `playertitledata` | `UnlockedByProductRecipe`, `TitleUnlocksSpecials` | 61 and 21 |
| `bobbleheadcustomisationdata` | `LinkedTechId` (a technology, not a product) | 8 |

Together they name 273 distinct IDs. 263 are products of type
CustomisationPart that the catalogue hides (class `customisation` in the
[product delivery classification](../runtime/research/product-delivery-classification.md));
eight are technologies slot 3 already knows; one is a catalogue build part
already known; one (`SPEC_EMOTE16`) is an emote the learn routine refuses.

Of the 263: 80 are also purchasable specials (Quicksilver shop), 112 are
also expedition rewards, 71 are in neither table (for example `BANNER_NMSA`,
`BANNER_MAINFAM`, the `BUI_*` autophage parts).

## What slot 3 holds (saved files of 21:29)

None of the 263 is in the slot's known products (1,905), known specials
(11), redeemed season rewards (10), Twitch (0) or platform (1) lists. Yet the
customiser shows most options open. **Reading, not confirmed:** the
customiser also accepts the account's unlock lists, which on this account
were filled by a save editor; the entries still locked are those the account
lacks too.

## First plan (tried; the product route was rejected)

The product learn routine accepts customisation parts (`Type` 7), so the
existing product request can teach them to the slot:

1. With the game on slot 3: identify, back up, preflight.
2. `signal-product-180836.ps1 -Id BANNER_NMSA`; the owner checks banner
   emblem 55. This is the test of whether a known product in the slot opens
   the option.
3. If it does: `-AllOfClass customisation` (263).

## Live requests (2026-10-07, slot 3)

| Item | Value |
| --- | --- |
| Game | Build 180836, executable `13d5060d...`, process 8256 |
| Profile DLL | `68fd60bc51977404ef444f975d9a3073b8f937c5a06711fbaba7e271ec46d5a7` |
| Slot | 3, identified by content (205 technologies, 1,905 products in memory) |
| Backup | Save folder copied to the external `save-backups/20261007-before-customisation` |
| Preflight | Passed, `dispatch_state=0` |

| Request | Result file |
| --- | --- |
| `-Id BANNER_NMSA` | known products 1,905 -> 1,906, `BANNER_NMSA=learned` |

So the product routine writes a customisation part to the slot's known
products. **The owner then checked: emblem 55 was still locked.** A known
product in the slot does not open a customisation option; the hypothesis of
the plan above is rejected.

Second route, same process: the banner table calls its link
`LinkedSpecialID`, and the slot-side reward routine `5ab380` (see
[reward redemption notes](REWARD_REDEMPTION_NOTES.md)) adds an ID to the
slot's known specials. New script
`runtime/native/asi/signal/signal-customisation-180836.ps1` sends IDs of
class `customisation` through the profile's existing `redeem` event (no new
DLL).

| Request | Result file |
| --- | --- |
| `signal-customisation-180836.ps1 -Id BANNER_NMSA` | `changed`, redeemed season set 10 -> 10 (as expected: not a season reward) |

**Confirmed by the owner: emblem 55 opened.** The slot-side special routine
is the working route for customisation options.

The owner then asked for everything. Save folder copied to
`save-backups/20261007-before-customisation-all`; slot re-identified as 3.

| Request | Result file |
| --- | --- |
| `signal-customisation-180836.ps1 -All` (263) | 262 `changed`, 1 `no_change` (`BANNER_NMSA`, already done); redeemed season set 10 -> 122 |

The season set grew by 112, the number of customisation IDs that are also
expedition rewards: for those the routine records the redemption as well.
All of them are appearance parts, banners, trails or titles, for which
known and redeemed is the whole reward. Scope: slot 3 only; the account
lists were not touched. Game kept running.

**Confirmed by the owner: every appearance option is open.** The automatic
save of slot 3 (`save5.hg`, 23:24) holds 274 known specials (11 before, plus
263) and 122 redeemed season rewards (10 before); the manual save
(`save6.hg`, 23:19) is older and still has 11 and 10. So the list written is
the slot's known specials (`24<`), and it persists.

## Titles

`playertitledata` has 346 titles. By unlock condition: 159 by a statistic,
63 by a statistic rank, 14 by a statistic that also grants specials, 61 by a
known product, 27 by a mission, 16 by an interaction, 2 by a trophy, 4 with
no condition.

The only list of unlocked titles found so far is on the account (the set at
account `+0x140`, 346 of 346 on the owner's account, see
[known lists triage](KNOWN_LISTS_TRIAGE.md)). No per-slot list of titles has
been found: a slot holds the statistics, missions and known products from
which the game decides to unlock a title, and the result is written to the
account. Not verified: whether the title picker in a slot shows every
account title regardless of that slot's own statistics (ask the owner to
open the picker in slot 3), and whether the 61 product-linked titles react
to the known specials now in the slot.

Consequence for the project: "titles in the save" would mean giving the slot
the statistics, missions and products behind each title so the game unlocks
it itself. That is a statistics domain, not started. The owner said on
2026-10-07 that an account-level result is acceptable for titles.

Open questions:

- Which slot list the routine writes for a customisation part (known
  products or known specials); read both before and after the first request.
- Titles: 61 are unlocked by a known product and are covered above; the
  others depend on statistics, missions, standings or trophies and need
  their own study. The account's title list is separate and already full on
  this account.
- The 318 other CustomisationPart products (ship parts `FIGHT_*`, `DROPS_*`,
  `SCIEN_*`, `SAIL_*`, freighter and vehicle parts) belong to the ship,
  freighter and vehicle domains and are not part of this request.
- Which locked helmets are console-exclusive, and whether any of them is
  unlocked by something other than a product.
