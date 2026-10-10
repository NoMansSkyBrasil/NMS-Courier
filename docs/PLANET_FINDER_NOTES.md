# Finding planets by what they are like

Owning note for the owner's wish of 2026-10-10: find "perfect" planets
(Earth-like: grass, abundant fauna and flora, water, few or no sentinels,
no extreme weather) across a galaxy, with their portal addresses so the
Travel page can take the player there. First offline pass; **nothing is
built in the application and nothing was checked in the running game.**

## Why it can be done without visiting

The game generates a star system from its address alone, and a planet from
its seed and biome. This project already runs the game's own system
generator outside the game, in an emulator
([seed origins](SEED_ORIGINS.md#the-generator-run-in-an-emulator-2026-10-09),
`runtime/research/emulate-star-system.py`, harness of NMS Shipwright, MIT
licence), checked against live readings for the ships of three systems.
The same harness calls the game's planet routine for each planet of the
system.

What the game's structures hold (class layouts from the executable's
metadata, build 180836):

- `GcSolarSystemData` has `Planet Generation Inputs`, one
  `GcPlanetGenerationInputData` (`0x58` bytes) a planet: Seed `+0x20`,
  Biome `+0x30`, BiomeSubType `+0x34`, Class `+0x38`, PlanetSize `+0x40`,
  Star `+0x48`, HasRings `+0x4d`, InAbandonedSystem `+0x4e`, InEmptySystem
  `+0x4f`.
- `GcPlanetData` (`0x3ae0` bytes): Weather `+0x1ce0`
  (`GcPlanetWeatherData`: StormFrequency `+0x168`, WeatherIntensity
  `+0x170`, WeatherType `+0x174`), Hazard `+0x3440`, Water `+0x3518`,
  BuildingLevel `+0x3528`, CreatureLife `+0x352c`, Life `+0x3538`,
  ResourceLevel `+0x3540`, GroundCombatDataPerDifficulty `+0x34b8` (four of
  `0x18` bytes, SentinelLevel `+0x14`).

## First run, 2026-10-10

Scratch scripts (not in the repository) drove the harness from the address
`0x0001DB00F769C14E` (Euclid) over the systems of its region and the next
ones.

- Speed: 2,000 systems with their 9,419 planets in 41 seconds on the
  owner's machine, one process (about 48 systems a second).
- Biome of the first 600 systems (2,789 planets): Lush 440, Exotic 398,
  Frozen 370, Scorched 369, Radioactive 327, Toxic 326, Barren 279, Lava
  71, Dead 68, Swamp 57, Green 34, Blue 28, Red 22.
- Sentinel level of those 440 lush planets at the normal difficulty
  preset: none 219, low 174, aggressive 35, corrupted 12.
- **Not usable yet:** Life, CreatureLife and BuildingLevel came out the
  same for every planet (3, 0, 2) and the weather and water fields held
  leftovers of memory. The harness stops the planet routine once the
  sentinel level is known and gives it empty stand-ins for the weather and
  biome tables, so those fields are not filled. Flora, fauna, weather and
  water therefore need more work: let the routine run further and give it
  the game's real tables.

So today a search can answer "lush planet, no sentinels" exactly as far as
the harness is right about both, and nothing more. Neither the biome nor
the sentinel level of a planet found this way was compared with the game
yet; the harness's authors use the same sentinel reading for their
"dissonant system" search.

Lush planets without sentinels found in that run, as portal addresses
(planet digit, system, then Y, Z, X) for the owner to check in Euclid:
`2069F769C14F`, `3071F769C14F`, `6072F769C14F`, `1073F769C14F`,
`1077F769C14F`, `1078F769C14F`, `207BF769C14F`, `407FF769C14F`.

## Second run, same day: the whole planet routine with the game's files

The owner asked for the study to go on. Tool:
`runtime/research/find-planets.py`. Result table: [planet-survey.md](../runtime/research/planet-survey.md), every
planet of the run below (28,287; one system compared with the game, see
[below](#checked-against-the-running-game-2026-10-10)); it
replaced the first table of 292 candidates the same day.

### What the planet routine is

The harness calls the short planet routine (`16a7570`) and stops inside its
levels part (`16956c0`, which the harness calls "planet sentinels"). The
game's full routine is `16a7880(generator, planet data, input)`: it derives
26 child seeds from the planet seed, then for each part seeds the
generator's stream (`+0xba4`, `+0xba8`) from one child and calls the part.
The parts in order: `16a49d0` (copies the input and asks for the subtype),
`16a4040`, `16956c0` (flora, fauna, resource and building levels, sentinel
level per difficulty), `1696760` (weather), then others not read
(`1696dc0`, `1695420`, `1694280`, `169f4a0`, `16a2870`). The tool runs
`16a7880` until the weather part has returned (`16a7ad4`).

### What had to be supplied, and what each thing proved to be

- **Subtype.** The input is: count at `+0x30`, seed at `+0x08`, and at
  `+0x10` the biome in the low byte with the class from bit 16.
  `16a49d0` then calls `16a3a50`, which generates the planet's whole system
  again in a local structure, reads the planet's `BiomeSubType` from it and
  passes it through `24b270`. In the emulator that inner generation gives
  subtype 0 for every planet. The system record the harness already made
  has the real one (`+0x34` of each input record), so the tool replaces
  `16a3a50` by code that returns that value. Mistake on the way, recorded
  because it cost a run: patching the returned constant for each planet
  does not work, the emulator keeps its first translation of the code; the
  replacement now reads a memory cell.
- **Fauna chances.** The generator's `+0x50` is `GcCreatureGenerationData`
  (`metadata/simulation/ecosystem/creaturegenerationdata`), whose
  `LifeChance` at `+0xf74` weighs the four fauna levels. The harness leaves
  a blank block there, hence the constant 0 of the first run.
- **Biome files.** The generator's `+0x90 + biome * 0x10` is the array of
  loaded biome files of that biome with its count, in the order of
  `biomefilenames`; the weather part takes the weather weights of the
  planet's star colour from the file (`WeatherOptions`, `+0xf0`, `0x44`
  bytes a colour).
- **Weather files.** `+0x508` is the array of the 17 weather files in the
  order of `weatherlist`, `+0x504` their count. With a count of 0 the
  weather part skips storms and extremes altogether, which is what the
  third attempt showed (every planet without storms). Storm thresholds are
  `HighStormsChance` (`+0xbd4`) and `LowStormsChance` (`+0xbd8`) of the
  planet's weather file; the extreme draw uses `ExtremePlanetChance` of
  the solar generation globals by star colour.
- **Scrap chance.** After the sentinel levels `16956c0` reads a table
  through the generator's first pointer (`[+0x00] + 0x2670 + building
  level * 4`) on about half of the planets; unmapped in the harness, it
  made 1,135 of 2,073 planets fail. A blank block there only makes
  `HasScrap` false.

### What the game's own tables say about flora and fauna

`LifeChance` of `biomelistperstartype` (flora) and `LifeChance` of
`creaturegenerationdata` (fauna) are both Dead 0, Low 0, Mid 0, Full 1. The
routine draws the level from those weights, so **every planet with life has
flora and fauna at Full**; only dead, gas giant and waterworld biomes are
set otherwise in code. "Abundant fauna and flora" is therefore not
something to search by with these two settings: all 4,570 lush planets of
the run have both at 3. What differs between lush planets is the subtype
(which file of plants and props), the weather and the sentinels. What the
planet page of the game prints as flora and fauna was not traced.

### Lush planets, 6,000 systems from `0x0001DB00F769C14E` (28,287 planets, 81 s)

| | |
| --- | --- |
| Biome | Lush 4,570; Frozen 3,597; Scorched 3,570; Radioactive 3,329; Toxic 3,311; Weird 3,168; Barren 2,694; Dead 1,780; Swamp 684; Lava 667; Green 317; Blue 314; Red 286 |
| Lush subtype (file) | Worlds 943 (jungle); HighQuality 688 (`LUSHHQ`); Standard 656; Swamp 524; Variant_C 285 (rocky); Variant_B 216 and Variant_A 200 (mushroom); HugePlant 213 (floral); HydroGarden 152; HugeToxic 140 (tentacle); HugeLush 133 (big props); Infested 122; Variant_D 117; Bubble 99; Structure 82 (ruins) |
| Weather | Humid 4,275; Swamp 164; Weird 131 |
| Storms | Low 2,767; None 1,104; High 699 |
| Extreme | no 3,539; yes 1,031 |
| Sentinels (normal preset) | Low 2,225; Default 1,776; Aggressive 436; Corrupt 133 |

The storm shares fit the humid weather file (LowStormsChance 0.6,
HighStormsChance 0.2), which is a sign that the weather part runs as in the
game. Enum names are the executable's own (`GcBiomeSubType` 32 values,
`GcWeatherOptions` 17, `GcPlanetSentinelLevel` Low, Default, Aggressive,
Corrupt; the harness's "none, low, aggressive, corrupted" is one step off).
The storm field has no enum in the metadata; 0 to 3 are taken as None, Low,
High, Always.

**Earth-like**, as the tool defines it: Lush; subtype Standard,
HighQuality, Worlds or HugeLush; storms None; not extreme; sentinels Low.
292 of the 4,570 lush planets pass: about one system in twenty has one.

### Still open

- One system was compared with the game (below); more are wanted.
- Grass colour (owner request of 2026-10-10): `GcPlanetData.Colours` is at
  `+0`, 66 palettes of 0x70 bytes (`GcPlanetColourData.Palettes`), `Grass`
  the first (then `Plant`, `Leaf`, `Wood`, ... as the executable's enum
  lists them). All 66 are still empty where the tool stops the routine
  (after weather, `16a7ad4`), so a later part fills them; that part was not
  identified and the routine does not run to its end in the emulator. Next:
  read the grass palette of a planet from the running game to know what a
  filled one looks like, then find the part that writes `+0`.
- The list has no purple star system, and so no water world, gas giant,
  ocean, island or remix variant. Whether the walked region has none or the
  emulated generator never gives one is not known.
- Water was not read (`GcPlanetData.Water`, the terrain settings of the
  biome file).
- The planet number of the portal address is taken as the record's place
  plus one, as the harness does; moons were not told apart.
- The game state value at `6e8d714` and the application flags the weather
  part tests are zero in the emulator; what they stand for is not read.
- The parts of the routine after weather were not run.
- Other galaxies, purple systems and abandoned systems were not walked.

## Checked against the running game, 2026-10-10

The owner travelled from the page and stood in system `0x00027200F769C14E`.
The game's memory was read from outside (read only) and compared.

| What | Game | Emulator before | Emulator after the fix |
| --- | --- | --- | --- |
| Planet 1 seed, biome | `C723AC0A7B5DD5A4`, Lush | same | same |
| Planet 1 subtype | Infested (24) | Worlds | Infested |
| Planet 2 seed, biome, subtype | `608545398F1119F2`, Lush, HighQuality | same | same |
| Weather, storms, extreme, sentinels (both) | Humid, none, no, Low | same | same |
| Economy, wealth, conflict, race, star | HighTech, Pirate, Pirate, Korvax, Yellow | not read | same |

What the owner saw agrees: planet 2 is a "Paradise planet" with low
sentinels, planet 1 is purple (infested), the system is a Korvax pirate
system with a technology economy.

The fix: after the first roll on `biomefilenames` (generator `+0x70`) the
system generator rolls again on `biomefilenamesarchive` (`+0x78`, code
`164ce75` to `164d0cb`); a planet that second roll calls infested is
infested. The harness leaves `+0x78` empty, so the tool now loads the file
and sets the pointer after each reset. Infested planets in the list went
from 560 to 889 (lush ones from 122 to 211); Earth-like by the preset from 292
to 268.

Not the same: the game holds Planets 2, PrimePlanets 1 and the "prime
included" flag 1; the emulator Planets 1, PrimePlanets 1, flag 0. The total
and the records agree.

### System type

`GcSolarSystemData` after generation: `TradingData` at `+0x2520`
(`TradingClass`, then `WealthClass` at `+0x2524`), `ConflictData` at
`+0x2530`, `InhabitingRace` at `+0x2534`, `StarType` at `+0x2550`. Enum
names read from the executable: economy `Mining, HighTech, Trading,
Manufacturing, Fusion, Scientific, PowerGeneration`; wealth `Poor, Average,
Wealthy, Pirate`; conflict `Low, Default, High, Pirate`; star `Yellow,
Green, Blue, Red, Purple`. In the list wealth and conflict are `Pirate`
together (1,427 planets); the page calls that a pirate system.

### What each variant really is

[biome-variants.md](../runtime/research/biome-variants.md)
(`runtime/research/list-biome-variants.py`) lists the 195 entries of the
two biome file lists with the file each loads and its weights (the second
weight is for purple systems). The subtype names are reused: for Lush,
`Worlds` loads `jungle/junglebiome`, `HugePlant` `floral/floralbiome`,
`HugeToxic` `lush/lushhqtentaclebiome`, `Bubble` `lush/lushbubblesbiome`,
`HydroGarden` `rocky/rockbiome`, `Swamp` `swamp/swampbiome`, `Structure`
`lush/lushruinsbiome`; for Toxic, `Worlds` loads `noxious/noxiousbiome` and
`Bubble` an ocean biome that only purple systems give. The page therefore
names a variant by biome and subtype together.

## The page (application 1.35.0)

"Planet finder" under "Deliver" (`components/planet-finder-card.tsx`,
`shared/planet-survey.ts`) reads `planet-survey.md` and filters it in the
interface: biome, variant, highest storm level, highest sentinel level,
extreme weather, the system's race, matches in one system, a search by
portal address, presets "Earth-like" and "Everything". A result can be
travelled to (the teleport request with `to=planet`, galaxy 1), saved to
the Travel page's destinations (the same local storage) or copied.

The game's 32 subtypes are shown as twelve kinds (standard, high quality,
jungle for `Worlds`, giant flora for the `Huge…` ones, other variant for
`Variant_A` to `D`, swampy, volcanic, ruins for `Structure`, infested,
exotic shapes, remix, unnamed); the row's tooltip has the game's name. A
wiki's biome page (nms.miraheze.org/wiki/Biome, read 2026-10-10) lists the
same biome types and names infested, corrupted and relic worlds as variants
that keep their biome, which is how the page files them.

Application 1.36.0 changed the kinds to sixteen (jungle only for lush
`Worlds`, "renewed" for `Worlds` elsewhere, flower fields, rocky,
tentacles, bubbles), added the system's economy and a pirate badge with a
"System" filter, and made storms, sentinels, extreme weather and pirate
systems coloured badges (green good, amber caution, red danger) under the
lay-user rule of `AGENTS.md`. The list is of Euclid only; travel always
asks for galaxy 1.

### What the owner asked for beyond it: a search the player runs

The owner wants to choose the conditions, let it search for a time of
their choosing and get portal addresses, anywhere. A table made beforehand
cannot do that. Three ways were weighed:

1. **Search inside the running game, through the bridge (preferred).** The
   routines the emulator runs are the game's: the bridge can call them
   natively on the game's thread, a slice of time each frame, for the
   addresses around the player or anywhere, in any galaxy, for as long as
   the player set, and write matches to a result file as it goes. No
   emulator, no extra runtime, the game's real tables and settings. To be
   solved first: the system generator writes into the game's current
   system object, so a generation into a separate buffer is needed. The
   game has one: `16a3a50` builds a whole system for another address in a
   local structure (`44f9e0`, `132d5e0`, `164c580`, `164da40`, `164c770`).
   That sequence has to be reproduced or its result captured, and proven
   not to disturb the system the player is in.
2. A port of the routines to the application's language: fastest, but the
   system routine (`132aee0`, Threefry) and the planet routine would have
   to be ported and checked planet by planet against the emulator.
3. Larger tables for more regions and galaxies: no new risk, but never a
   search of the player's own choosing.

## Plan

1. **Check what exists.** The owner visits two or three of the addresses
   above with the Travel page and says what the planets are (biome,
   sentinels, weather, fauna, flora). That tells whether the biome and
   sentinel readings can be trusted.
2. **Fill the rest.** Make the emulated planet routine produce flora
   (`Life`), fauna (`CreatureLife`), weather and storms, and water, by
   running it to its end with the game's real tables. Compare with the same
   visits.
3. **Score.** A planet is "perfect" by the owner's definition when: biome
   Lush; Life and CreatureLife at their highest setting; storm frequency
   none; sentinel level none or low; water present. A system is ranked by
   how many of its planets qualify.
4. **Ship it without a script.** The application must not run Python
   (`AGENTS.md`). Two ways, in order: (a) the research tool writes a
   Markdown data table of the best planets of each galaxy and the
   application lists it with a "Travel" button, which needs nothing new at
   run time; (b) later, the generator ported to the application's own
   language so the player can search near where they are, which needs the
   system routine at `132aee0` and the planet routine ported and checked
   against the emulator.

The galaxy is far too large to scan whole: 4,096 by 256 by 4,096 regions of
up to 767 systems each. At 48 systems a second one region takes 16 seconds;
a table of a few thousand best planets needs some hundred thousand systems,
an hour or two of one machine, once per game build.

## Reproduce

```text
python runtime/research/emulate-star-system.py --shipwright <clone> --game <game folder> system 0x0001DB00F769C14E
```

The planet list comes from the harness's `SystemGen.system(address,
planets=True)`.
