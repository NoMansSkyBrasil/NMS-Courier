# Customisation unlock notes

Checkpoint: 2026-10-07. Owner of the character customisation domain:
unlocking appearance options (head, torso, armour, gloves, legs, boots,
backpack, capes), banners, jetpack trails, textures and titles **in the
loaded save slot**.

Status in one line: the link between each option and what unlocks it is
mapped offline and a product class exists for it; **nothing has been sent
and the unlock mechanism is not confirmed live.**

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

## Plan (proposed, not done)

The product learn routine accepts customisation parts (`Type` 7), so the
existing product request can teach them to the slot:

1. With the game on slot 3: identify, back up, preflight.
2. `signal-product-180836.ps1 -Id BANNER_NMSA`; the owner checks banner
   emblem 55. This is the test of whether a known product in the slot opens
   the option.
3. If it does: `-AllOfClass customisation` (263).

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
