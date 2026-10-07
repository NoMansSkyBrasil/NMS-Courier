# Triage of the "known" lists a player can be taught

Checkpoint: 2026-10-07. The project owner exported six lists from a
third-party save editor (glyphs, words, recipes, fish, specials, products;
personal files, not committed) and asked which are useful to deliver and
which are not, together with a list of items that become impossible to buy
once they are marked known. This note is the triage. **It is offline analysis
of tables and of one game routine; nothing in it has been delivered or
tested.** Technology is covered separately in
[technology delivery notes](TECHNOLOGY_DELIVERY_NOTES.md).

Sources: converted tables of the corpus (`NMSARC.Precache.pak` and
`NMSARC.MetadataEtc.pak`), reward table, executables 180383 and 180836.

## Summary

| List | Entries in the owner's file | What it is in the game | Verdict | Main hazard |
| --- | --- | --- | --- | --- |
| Glyphs | 16 flags | Known portal runes | Useful, simple | None found |
| Words | 1,980 | Words known per alien race | Useful | The file's IDs are not the table's word groups; mapping not studied |
| Recipes | 1,684 | Refiner (361) and cooking (1,323) recipes | Useful | Route in the game not identified yet |
| Products | 3,583 | Known product recipes and build parts | Partly useful | Half are entries the game itself refuses to learn |
| Specials | 284 | Quicksilver, expedition, Twitch and platform unlocks | Partly useful, needs owner decisions | 14 repeatable items must never be marked known; 126 are expedition, Twitch or platform rewards |
| Fish | 220 | Fishing record with catch counts and sizes | Not a "learn" list | It is a statistics record; the file's numbers are invented |

## Items that must never be marked known (repeatable purchases)

The owner's list: Triple Burst Firework, Dual Chrome Firework, Wheel of Hirk
Firework, Myth Beacon, Void Egg, Green Firework, Blue Firework, Red Firework.
Once known, the Quicksilver shop treats them as owned and stops selling them.

The game's own table of purchasable specials
(`METADATA/REALITY/TABLES/PURCHASEABLESPECIALS.MBIN`, 336 entries) has a field
for exactly this, `IsConsumable`. It is true for 14 entries: the owner's 8
and 6 more.

| ID | Name | On the owner's list | Marked known in the owner's exported specials |
| --- | --- | --- | --- |
| `SPEC_FIREWORK01` | Blue Firework | yes | no |
| `SPEC_FIREWORK02` | Red Firework | yes | no |
| `SPEC_FIREWORK03` | Green Firework | yes | no |
| `SPEC_FIREWORK04` | Triple Burst Firework | yes | no |
| `SPEC_FIREWORK05` | Dual Chrome Firework | yes | no |
| `SPEC_FIREWORK06` | Wheel of Hirk Firework | yes | no |
| `SPEC_FIREWORK07` | Red Titan Firework | **no** | yes |
| `SPEC_FIREWORK08` | Golden Titan Firework | **no** | yes |
| `SPEC_FIREWORK09` | Green Titan Firework | **no** | yes |
| `SPEC_FIREWORK10` | Purple Ribbon Firework | **no** | yes |
| `SPEC_FIREWORK11` | Blue Ribbon Firework | **no** | yes |
| `SPEC_FIREWORK12` | Teal Ribbon Firework | **no** | yes |
| `MYSTERY_BEACON` | Myth Beacon | yes | yes |
| `ODD_EGG` | Void Egg | yes | no |

Proposed permanent rule, by structure so that later additions are covered: a
special whose `IsConsumable` is true is never marked known, in any list. All
14 are also products with `IsCraftable` false, so the game's product routine
(below) already refuses them as known products; the exported products file
marks all 14 as known.

Not verified in the game: that the six additional entries behave like the
eight the owner observed. The field says so; no purchase was tried.

## Products

The game has three product tables, 4,446 entries together: the main table
(2,199), base part products (1,820) and modular customisation products (427).

The game's learn-product routine (`5aa1a0` on 180383, `5aafd0` on 180836;
found through the shipped reward `GcRewardSpecificProductRecipe`) adds a
product to the known list only when `IsCraftable` is true or `Type` is
CustomisationPart. Applied to the owner's file:

| Part of the file | Entries | Note |
| --- | --- | --- |
| Accepted by the game's routine | 1,779 | Build parts 1,393; customisation parts 202; curiosities 104; tradeables 31; consumables 20; components 12; salvage 12; fish 5 |
| Refused by the game's routine | 1,733 | Consumables 611 (the 187 upgrade modules among them); base parts 607; fish 219; curiosities 156; tradeables 66; and others |
| Not in any product table | 71 | Substance IDs (`FUEL1`, `OXYGEN`, ...); the editor mixes them in |

There are also 557 products the routine would accept that the file does not
contain (station, expedition, ship-part and other families); they have not
been examined.

Verdict: a product-recipe delivery is feasible through the game's own routine
and it would refuse the non-craftable half by itself. Before any "all
products" option the 2,336 craftable or customisation entries need the same
review the technology table got: defective, internal, cut and reward-only
entries are expected among build parts and customisation parts and have not
been looked for yet.

## Specials

Shipped reward: `GcRewardSpecificSpecial` (262 uses) with the special's ID.
The owner's 284 entries are named by these tables (an entry can appear in
more than one):

| Table | Entries of the file | Meaning |
| --- | --- | --- |
| `PURCHASEABLESPECIALS.MBIN` | 108 | Quicksilver shop items |
| `UNLOCKABLESEASONREWARDS.MBIN` | 69 | Expedition rewards (the table has a `SwitchExclusive` field) |
| `UNLOCKABLETWITCHREWARDS.MBIN` | 54 | Twitch drop rewards |
| `UNLOCKABLEPLATFORMREWARDS.MBIN` | 3 | Platform or promotion rewards |

The purchasable table has 228 further entries the file does not contain.

Verdict: the Quicksilver part is deliverable in principle with the consumable
rule above. Expedition, Twitch and platform rewards are a product decision
for the owner, not a technical one: they are items the publisher hands out
through events and accounts. No recommendation is made here; nothing is
delivered until the owner decides.

## Glyphs

Sixteen flags. The game awards glyphs with `GcRewardDiscoverRune` (40 uses,
one field `AllRunes`) and keeps them in a player-state field named
`KnownPortalRunes`. The technology entries `MAINT_PORTAL1`-`16` are portal
slots, not these glyphs (see the technology notes). Verdict: useful and
probably the simplest of the six; the handler has not been located.

## Words

Shipped rewards: `GcRewardTeachWord` (70 uses; race, category, amount) and
`GcRewardTeachSpecificWords` (5 uses; race and a list of word groups such as
`YOU`, `IS`, `NEW`). The speech table has 3,831 word groups over four races
and the Atlas. The owner's file has 1,980 entries in another form (plain
words such as `ABANDONED`), and none of them equals a table group, so the
relation between the editor's list and the game's groups is not understood
yet. Verdict: useful; needs its own study before anything is promised.

## Recipes

The file equals the recipe table exactly: 1,684 entries, 361 refiner recipes
and 1,323 cooking recipes. No shipped reward type that teaches these was
found by name in the reward table, so how the game records a discovered
recipe is not identified. Verdict: useful (it fills the catalogue pages);
route unknown.

## Fish

The file is a fishing record: 220 fish, a catch count for each (1 to 100 in
the file) and a largest-catch size. It is statistics, not knowledge, and the
numbers in the file are made up. Writing them would falsify the player's
record and there is no game routine that "teaches" a catch. Verdict: do not
deliver as part of "learn everything". If the owner wants the fishing
catalogue filled, it needs a separate decision and a way that does not invent
counts.

## What is not known

- Whether the game reads a known entry that only an editor could have
  written (refused products, consumable specials) and misbehaves because of
  it, beyond the shop case the owner observed.
- The handlers for specials, glyphs, words and recipes on build 180836.
- Which craftable build parts and customisation parts are defective,
  internal or reward-only.

## Proposed order

1. Glyphs (smallest, one flag).
2. Product recipes, after classifying the three product tables.
3. Quicksilver specials with the consumable rule, after the owner decides on
   expedition, Twitch and platform rewards.
4. Words and recipes, each after its own study.
