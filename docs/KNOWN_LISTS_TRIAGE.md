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
rule above.

**Owner decision (2026-10-07): expedition, Twitch and platform rewards are to
be delivered too, and completing an expedition season is a later goal.** See
the next section for what that involves.

## Expedition, Twitch and platform rewards

The owner supplied the editor's three reward pages (personal data, not
committed). They match the game tables in size:

| Table | Entries | Fields worth noting |
| --- | --- | --- |
| `UNLOCKABLESEASONREWARDS.MBIN` | 293, expeditions 1 to 23 | `MustBeUnlocked` true for 7; `SwitchExclusive` true for `EXPD_ODD_EGG`; `UniqueInventoryItem` true for `MYSTERY_TRACKER` |
| `UNLOCKABLETWITCHREWARDS.MBIN` | 435 | Each maps a Twitch ID to one product; products are build parts 212, curiosities 135, customisation parts 75, emotes 13 |
| `UNLOCKABLEPLATFORMREWARDS.MBIN` | 3 in the corpus (`TGA_SHIP1`, `SW_PREORDER`, `SW_PREORDER2`) | The editor lists 6: also `ENT_BOLTCASTER`, `ENT_PHOCORE`, `ENT_XO_HELMET`, which the corpus table does not contain |

None of the 14 repeatable specials is a season or Twitch reward.

The editor shows **two separate states** for each reward, and they are
different things to deliver:

- *Unlocked on account*: the account knows the reward. For platform rewards
  the editor says this lives in a user settings file in the game's install
  directory; where the season and Twitch flags live was not examined.
- *Redeemed in save*: this save has claimed it (for a ship or multitool that
  is the moment the item is given).

Constraints that follow from the project rules, stated so the scope is clear:

- No file is edited as a delivery shortcut: not the save, not the account
  data, not the user settings file. Each state needs a route through the
  running game.
- A route exists at least for season rewards: the shipped reward
  `GcRewardUnlockSeasonReward`, whose handler was already located on build
  180383 (`f42160`, see [native acquisition research](NATIVE_ACQUISITION_RESEARCH.md)).
  It has not been relocated to 180836, called, or checked for which of the
  two states it sets. Twitch and platform routes are not identified.
- The three `ENT_*` rewards explain three technology entries reviewed
  earlier: Boltcaster SM (`BOLT_SM`), Photonix Core (`PHOTONIX_CORE`) and the
  X.O. suit items are entitlement rewards.
- "Completing an expedition season" (milestones, phases, the season's own
  progress) is another domain again and has not been looked at.

Things the owner should know before this is built, without changing the
decision: these rewards are tied to the publisher's events, Twitch campaigns
and, for `SW_PREORDER*`, a platform pre-order; an account-level unlock is
visible to the game's online services in a way a known technology is not.
What the services do with it is unknown here.

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
found by name in the reward table. Verdict: useful (it fills the catalogue
pages). **Route found later the same day** in the save-load merge routine;
see [recipe delivery notes](RECIPE_DELIVERY_NOTES.md).

## Fish

**Owner decision (2026-10-07): keep fish as its own separate operation, as
the save editor does; it is not part of "learn everything".**

The file is a fishing record: 220 fish, a catch count for each (1 to 100 in
the file) and a largest-catch size. It is statistics, not knowledge, and the
numbers in the file are made up. Writing them would falsify the player's
record and there is no game routine that "teaches" a catch. Verdict: do not
deliver as part of "learn everything". If the owner wants the fishing
catalogue filled, it needs a separate decision and a way that does not invent
counts.

### Season rewards per expedition (2026-10-07)

The owner pointed to the community list of expeditions
(<https://nomanssky.fandom.com/wiki/List_of_Expeditions>, marked up to date
as of February 2026 and listing 23 expeditions through "Our Journey
Continues"). The season reward table agrees on the set of expeditions: every
one of its 293 entries belongs to exactly one season, 1 to 23.

| No | Expedition (wiki title) | Rewards in the table | Notes from the table |
| --- | --- | --- | --- |
| 1 | The Pioneers | 8 | |
| 2 | Beachhead | 6 | 5 marked `MustBeUnlocked`, among them `EXPD_SPEC02` (the crossover ship) |
| 3 | Cartographers | 12 | |
| 4 | Emergence | 8 | |
| 5 | Exobiology | 10 | |
| 6 | The Blighted | 15 | `EXPD_ODD_EGG` is `SwitchExclusive` |
| 7 | Leviathan | 10 | |
| 8 | Polestar | 12 | |
| 9 | Utopia | 10 | |
| 10 | Singularity | 16 | |
| 11 | Voyagers | 12 | |
| 12 | Omega | 10 | |
| 13 | Adrift | 16 | |
| 14 | Liquidators | 17 | `EXPD_EGG_14` marked `MustBeUnlocked` |
| 15 | Aquarius | 13 | |
| 16 | The Cursed | 11 | |
| 17 | Titan | 10 | |
| 18 | Relics | 15 | |
| 19 | Corvette | 10 | |
| 20 | Breach | 16 | |
| 21 | Remnant | 15 | Stages 1 to 4 only |
| 22 | The Swarm | 24 | Stages 1 to 3 only; `SWARM_TROPHY_B` marked `MustBeUnlocked` |
| 23 | Our Journey Continues | 17 | |

The counts for expeditions 22 and 23 were checked against the owner's
editor listing and match (24 and 17).

How far the wiki comparison goes: the individual expedition pages list the
rewards of every milestone (mostly items handed out during the expedition,
such as nanites and modules) and describe the lasting rewards in free text
("Poster set", "Stealth Paint customization"). Where a page was readable by
script (expeditions 5, 6, 9, 10, 16, 19 and 20), its phase rewards are the
same items as the table's entries for that season; the table has a few more
per season that the pages list under single milestones. Pages for 17, 18, 21
and 22 were not found under the expected title, and several pages have
layouts the script could not read. So the wiki confirms the list of
expeditions and, by sample, the kind of rewards; it is not an item-by-item
check, and the table remains the source.

For the later "complete an expedition season" goal the pages are useful for
another reason: they show the structure, five phases of about eight
milestones each (31 to 48 milestones per expedition on the pages read).

### Where the account state lives on this installation (2026-10-07)

Asked by the owner: can platform rewards be forced to appear? Read-only look
at the installed game and the executable:

- The executable's metadata names three adjacent fields,
  `UnlockedSeasonRewards`, `UnlockedTwitchRewards` and
  `UnlockedPlatformRewards`. They are lists in the user settings object
  (`GcUserSettingsData`).
- On this Steam installation that object is the plain file
  `Binaries/SETTINGS/GCUSERSETTINGSDATA.MXML`, which the game itself reads at
  start and writes (its timestamp is the last game start). The owner's file
  currently lists 293 season rewards, 435 Twitch rewards and 1 platform
  reward (`TGA_SHIP1`); the first two were filled by the editor earlier.
- So the "unlocked on account" state of these three kinds is local data the
  running game holds in memory and saves by itself. Forcing a platform reward
  to appear is therefore possible in principle without editing a file: add
  its ID to the in-memory list through the routine the game uses for that and
  let the game write its own settings.
- Not done and not known: the routine that adds to the platform list has not
  been located; whether the game re-checks the platform and removes an entry
  it does not recognise; what the shop or the claim screen then requires.
- `ENT_BOLTCASTER`, `ENT_PHOCORE` and the other `ENT_*` entries are a
  different mechanism: the reward table's `EntitlementTable` maps a reward to
  an entitlement ID (`BOLTCASTER`, `PHOTONIXCORE`, `ALPHAVSHIP`, `HORIZOSHIP`,
  ...) that the platform answers for, and to an ordinary reward. For the two
  technology ones that reward is `GcRewardSpecificTech` for `BOLT_SM` and
  `PHOTONIX_CORE`, which the technology delivery of 2026-10-07 already
  taught. The ship ones are ship rewards and belong to ship delivery.

### Routines that write the account lists (build 180383, offline, 2026-10-07)

First step of the search, by disassembly only. Addresses are build 180383
RVAs; none is relocated to 180836 or called yet.

| Routine | What the code does | Reading |
| --- | --- | --- |
| `609ed0` (account object, reward ID) | Requires the ID in a table map at manager `+0x8e0`, inserts it into a set at account `+0x1c0`, sets a flag at account `+0x2b0`, returns 1 | Season unlock on the account. Called by the `GcRewardUnlockSeasonReward` handler (`f42160`) and from three other places |
| `5aa550` (player state, ID) | Called by that handler afterwards unless a payload flag says otherwise; looks the ID up in a map at manager `+0x8a0` or as a product and adds a known special through `5aa830` | The save-side step ("redeemed in save") |
| `609bb0` (account object, ID) | Finds the ID in a table at `*(manager + 0x308)` whose entries carry a list of products, calls a check (`6093e0`), inserts into the set at account `+0x140`, sets the same flag, then runs `5aa550` for each product | A sibling unlock that also redeems. Twitch or platform: **not determined** |
| `609dd0` (account object, ID) | Uses the map at manager `+0x8a0`, inserts into the set at account `+0x180`, sets the same flag | The other sibling: **not determined** |

The account object is at manager `+0x315748`, the same object the
learn-technology and learn-product routines notify. The flag at `+0x2b0` is
read as "settings changed, save them"; that reading is an inference from all
four writers setting it.

#### Step 1 result: which set is which (still build 180383, offline)

The settings object's list fields are named, in order, `SeenSubstances`,
`SeenTechnologies`, `SeenProducts`, `SeenWikiTopics`, `UnlockedWikiTopics`,
`UnlockedTitles`, `UnlockedSpecials`, `UnlockedSeasonRewards`,
`UnlockedTwitchRewards`, `UnlockedPlatformRewards`. In the account object:

| Set offset | Evidence | Reading |
| --- | --- | --- |
| `+0x80` | Writer `6096a0` uses the substance lookup | Seen substances |
| `+0xc0` | Writer `6098a0` uses the technology lookup | Seen technologies |
| `+0x100` | Writer `609780` uses the product lookup | Seen products |
| `+0x140` | Writer `609bb0` (table at `*(manager + 0x308)`, entries with product lists) | Probably unlocked titles; not confirmed. **Not** Twitch or platform, correcting the first guess above |
| `+0x180` | Writer `609dd0` uses the specials map (manager `+0x8a0`) | Unlocked specials |
| `+0x1c0` | Writer `609ed0` uses the season map (manager `+0x8e0`) | Unlocked season rewards |
| `+0x200` | No single-entry writer. A large routine starting at `342ec0` clears it and refills it from a list, keeping each ID found in a map at manager `+0x920`. **Corrected 2026-10-08:** that routine parses the service's sign-in reply; the list is the reply's `rewards.twitch`, not the saved settings ([account unlock notes](ACCOUNT_UNLOCK_NOTES.md)) | Unlocked Twitch rewards |
| `+0x240` | Same routine, next block | Unlocked platform rewards |

A scan of the whole executable for writers of the changed flag found only the
single-entry writers up to `+0x1c0` and that large routine. So:

- **Season rewards have a route in the game** (`609ed0`, reached through the
  shipped reward). That is the preferred path.
- **Twitch and platform rewards have no "add one" routine that was found.**
  Their sets are filled in bulk by the routine at `342ec0`, read as "apply
  loaded settings"; two more places that use these sets (`8880a0`, `888ec0`)
  were not examined and may be the online refresh or the claim screen.
- In that bulk routine an ID is kept when it exists in the game's own Twitch
  or platform table. No check against a platform service appears in the part
  read. This agrees with the owner's installation, where `TGA_SHIP1` and 435
  Twitch IDs written by an editor are still in the file the game rewrites.
  It is not proof that nothing else removes them.

What this means for forcing a platform reward: without a single-entry routine
the only way inside the running game is to insert the ID into the in-memory
set with the game's own container routine (`3df6c0`, the one every writer
above uses), after checking that the ID exists in the platform table, and set
the changed flag as the writers do. That is a direct change of game data
through a native helper, the same category as the special-slot lists of the
inventory work, and must be labelled so. It has not been built.

**Owner decision (2026-10-07): Switch-exclusive and every other platform or
event reward is in scope; nothing is left out for being exclusive.** Whether
the PC build accepts `SW_PREORDER`, `SW_PREORDER2` and `EXPD_ODD_EGG` is
unknown.

#### Steps 2 and 3 result: build 180836 and a read-only look at the running game

Relocation by masked byte search, one match each: reward handler `f44010`,
season unlock `60ae70`, specials unlock `60ad70`, save-side step `5ab380`,
container insert `3df740` (four candidates by bytes; this one is the target
of the relocated callers). The account object offset (`manager + 0x315748`)
and the set offsets are unchanged from 180383.

Read-only look at process 24688 (started 2026-10-07 16:50, the owner's test
save loaded), comparing each set with the settings file the game wrote at
16:50:42. Each set is a slot array (pointer at `+0x10`, end at `+0x18`,
16-byte IDs, empty slots zero):

| Set | Offset | Entries in memory | Entries in the file | Same IDs |
| --- | --- | --- | --- | --- |
| Seen substances | `+0x80` | 105 | 105 | yes |
| Seen technologies | `+0xc0` | 318 | 318 | yes |
| Seen products | `+0x100` | 4,383 | 4,383 | yes |
| Unlocked titles | `+0x140` | 346 | 346 | yes |
| Unlocked specials | `+0x180` | 741 | 741 | yes |
| Unlocked season rewards | `+0x1c0` | 293 | 293 | yes |
| Unlocked Twitch rewards (expected) | `+0x200` | **0** | 435 | **no** |
| Unlocked platform rewards | `+0x240` | 1 (`TGA_SHIP1`) | 1 | yes |

Seven of eight agree exactly, which confirms the offsets on this build and
that `+0x140` is the titles set. **The Twitch list does not: the set at
`+0x200` is empty while the file the game had just written holds 435 IDs.**
The two small lists beside the sets (`+0x290`, `+0x2a0`) are empty as well.
So either the Twitch rewards are held somewhere else, or `+0x200` is not what
it was taken for. Unresolved; nothing is built on the Twitch reading until it
is.

Nothing was written to the game in this step.

Plan from here, in order, each step recorded before the next:

1. Done (set identities; `+0x140` confirmed as titles by the live read).
2. Done (relocation). Entry-byte checks are taken when the request is built.
3. Done, with the Twitch set unresolved (see above).
4. Add a reward-unlock request to the research profile in its own domain
   file. First live test: **one** platform reward on a copied save and a
   copied settings file; observe the game's own settings file after it
   writes, the claim screen, and whether the entry survives a restart.
5. Only then the save-side step (`5aa550`) and the larger lists.

## Fossils

The owner listed the editor's fossil page: skull, limb, ribcage and tail
entries (`FOS_HEAD_*`, `FOS_LIMBS_*`, `FOS_BI_BODY_*`, `FOS_BI_TAIL_*`), each
with a status "Complete". The product tables hold 165 `FOS_` entries: 143 of
type ExhibitBone, not craftable, and 22 craftable build parts (display
pieces). The learn-product routine therefore refuses the 143 bones; the
"Complete" status is some other record, probably the collection catalogue
(`METADATA/REALITY/CATALOGUEWONDERS.MBIN` is a candidate) and, like the
fishing record, it describes what the player found. Where it is stored and
whether the game has a routine that sets it are unknown. Verdict: plausible,
needs study; same caution as fish about inventing a record.

## Raw materials

The editor's "raw materials" page is the substance table, 114 entries. It is
not all materials:

| Group | Entries | Examples |
| --- | --- | --- |
| Real substances shown in the game catalogue (`WikiEnabled` true) | 71 | Carbon, Ferrite Dust, Sodium, Gold, Chromatic Metal |
| Real substances hidden from the catalogue | 8 | `TECHFRAG`, `SCRAP_RAD`, `SCRAP_TOX`, `SCRAP_EXP`, `SQUIDFRAG`, `TIMEDUST`, `TIMEMILK`, `SWARMDUST` |
| Pseudo-substances: icons the interface uses for things that are not items | 35 | Currencies (`UNITS`, `QUICKSILVER`, `TECHFRAG_R`), faction and guild standing (`TRA_STANDING_UP`, `EGUILD_STAND_DN`, ...), settlement statistics (`SET_COST_NEG`, `SET_MOOD_POS`, ...), expedition teams (`TEAM_RED`, ...), `NEW_PERK` |

The owner's list contains the pseudo-substances (for example "AUTOPHAGE" for
`BUI_STANDING_UP`, "Maintenance Cost", "Units"). Proposed rule: the 35
pseudo-substances are never marked known; they are all category Special with
`WikiEnabled` false and belong to the ID families above. Whether marking one
known has any visible effect is unknown. The route by which the game records
a known substance is not identified.

## What is not known

- Whether the game reads a known entry that only an editor could have
  written (refused products, consumable specials) and misbehaves because of
  it, beyond the shop case the owner observed.
- The handlers for specials, glyphs, words and recipes on build 180836.
- Which craftable build parts and customisation parts are defective,
  internal or reward-only.

## Proposed order

Owner decisions so far: expedition, Twitch and platform rewards are in scope;
fish is still open.

1. Glyphs (smallest, one flag).
2. Product recipes, after classifying the three product tables.
3. Quicksilver specials with the consumable rule, after the owner decides on
   expedition, Twitch and platform rewards.
4. Words and recipes, each after its own study.
5. Season rewards through the game's unlock-season-reward route, then Twitch
   and platform rewards once their routes are found.
6. Fossils and raw materials after finding where the game records them.
7. Expedition season completion as its own domain.
