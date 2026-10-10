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
