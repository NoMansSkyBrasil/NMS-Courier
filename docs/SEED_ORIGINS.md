# Where each seed comes from

Status on 2026-10-08: started. This note owns the question "what is this seed
and how does the game arrive at it", one seed per section, with the evidence
for each. What a seed *produces* (parts, colours, textures) is in
[model workshop](MODEL_WORKSHOP.md) and the older research it links.

## The algorithm, layer by layer

How far each layer is understood on 2026-10-08. "Checked" names what the claim
was compared with; nothing was compared with the running game.

| Layer | What it is | State | Checked against |
| --- | --- | --- | --- |
| Number generator | Two 32-bit words; a step is `low * 0x5A76F899 + carry`; a child seed is two steps mixed by a fixed finalizer | Known exactly | The game's instructions, 3,120 cases ([inversion and emulation](SEED_INVERSION_AND_EMULATION.md)) |
| Seed to parts | One weighted draw per group of a model's part lists, in list order; a child seed for every nested list and referenced scene | Known for the plain case | 64 fighter seeds of an independent table ([model workshop](MODEL_WORKSHOP.md#checked-against-a-table-of-fighter-seeds)) |
| Seed to texture layers and decals | Layers of all texture lists merged by name and group, one draw per merged layer | Known for the plain case | One fighter seed, six choices ([model workshop](MODEL_WORKSHOP.md#compared-with-an-independent-tool)) |
| Seed to colours | Five samples per palette family, drawn family by family from the 64 colours of each | Known for the base palette | One fighter seed, five colours; one pirate freighter home seed |
| Seed to class, slots, stats, name | Separate draws of the same seed | Class known; slots, stats and names not ported | Class: the game's instructions, 619 cases ([inventory class](INVENTORY_CLASS_RESEARCH.md)) |
| Where a seed comes from | The system's address, then the system generator's stream | System seed known; a system's ships located, not reproduced | The executable only (this note) |

"Plain case" means no caller context: the part selection can be told to force,
exclude or prefer alternatives, and which callers do so for which entity is
not established.

Everything below is offline reading of the build 180836 executable
(SHA-256 `13d5060d4efb9d2a6a6b1b349bc4257231056cc2a055df4bb15d816262cc3499`)
unless a section says otherwise. Nothing was run in the game for it.

## Freighter home system seed

**Answer: it is the seed of the star system the freighter was accepted in, and
a system's seed is its address in the universe.** So the home seed can be
computed from the system's portal address and galaxy, and read back as one.

### What the game does

| Step | Where (RVA) | What |
| --- | --- | --- |
| The owned freighter keeps two seeds | field tables | `CurrentFreighter` (model: scene and seed) and `CurrentFreighterHomeSystemSeed`, offset `0x83c20` of the player state |
| Accepting a freighter writes the home seed | `8ee71a` to `8ee730` | takes the current solar system (`+0x25e020` of the application object) and copies 16 bytes from its `+0x2480` with the setter `546d40` |
| `+0x2480` of the solar system is its `Seed` | field table of `cGcSolarSystemData` | `Seed`, offset `0x2480`, size `0x10`; the class is `0x25e0` bytes with 38 fields |
| A system is generated with its address as the seed | `62a343` to `62a3c8` | reads a 64-bit value, masks it with `0xFFFFFFFFFFFFF` (52 bits), marks it in use and passes it as the seed argument of the system generator `1649d10` |
| The generator stores that argument as the seed | `1649f6b` to `1649f7a` | copies the 16 bytes of the argument to `+0x2480` of the system data |
| The second caller builds the same value from parts | `1659b30` to `1659b92` | assembles a 64-bit value with shifts of 8, 12 and 32 bits and passes it to the same generator |

A second generator (`164a4a0`, called from `163bb02`) stores its seed argument
at the same field (`164a784`); its caller was not read.

The colours of the system are in the same structure: `Colours`, offset 0, size
`0x1ce0`, which is the size of the palette block the earlier research saw
copied around. The freighter is tinted from the palette drawn with this seed
([model workshop](MODEL_WORKSHOP.md#colours-textures-and-decals)).

### The address

52 bits, from the low bits up:

| Bits | Width | Meaning |
| --- | --- | --- |
| 0 to 11 | 12 | X |
| 12 to 23 | 12 | Z |
| 24 to 31 | 8 | Y |
| 32 to 39 | 8 | galaxy (0 is Euclid) |
| 40 to 51 | 12 | system index |

The 4 bits above (52 to 55) are the planet index, which the mask removes.

A portal address is twelve glyphs, each a hexadecimal digit: planet (1 digit),
system index (3), Y (2), Z (3), X (3). So for glyphs `P SSS YY ZZZ XXX` in
galaxy number `G` (1 is Euclid):

```text
home seed = SSS << 40 | (G - 1) << 32 | YY << 24 | ZZZ << 12 | XXX
```

Example, the pirate freighter the owner supplied on 2026-10-06: home seed
`0x175000B001FFD` is system `175`, galaxy 1, Y `0B`, Z `001`, X `FFD`, portal
address `01750B001FFD`.

What is read from the executable: the 52-bit mask, that the masked value is
the seed, and the shifts of the second caller. The meaning of the bit fields
(which twelve bits are X and which Z, and the glyph order) is the community's
portal convention, the same one the customizer at `nms.center` uses to turn
its stored addresses into glyphs; it was not derived from the executable here.
The owner's seed fits it exactly, with nothing in the planet bits.

### In the application

`apps/desktop/src/shared/system-address.ts` converts both ways and has a test
with the owner's seed. The model workshop shows, under a freighter's home
seed, the portal address and galaxy it stands for, and takes a portal address
and a galaxy number to fill the seed.

### Not established

- That every way of getting a freighter uses the current system. Only the
  reward-acceptance path was read; the setter has one other direct caller,
  `8ee49f`, in the branch for a freighter taken over from its captain, which
  reads the same field of the same object.
- Whether the freighter's *model* seed is also derived from the system. It is
  an argument of the purchase setup; where the game takes it from when a
  freighter appears in a system was not traced.
- The bit order inside the address from the executable itself.

## Seeds the game has fields for

`runtime/research/read-class-members.py` reads the field table of any data
class of the executable (name, offset, size of every field). Run with
`--field-name Seed` it lists 122 member records whose name contains `Seed`:
[seed fields 180836](../runtime/research/seed-fields-180836.md). The owning
class of each is not resolved yet; that is the next step for a catalogue of
"every seed, where it lives".

Reproduce:

```bash
python runtime/research/read-class-members.py --executable <NMS.exe> --class cGcSolarSystemData
python runtime/research/read-class-members.py --executable <NMS.exe> --field-name Seed
```

## Ships of a star system

**Answer so far: each ship of a system has its own seed, and that seed is a
child seed taken from the system generator's number stream, in the order the
ships are created. A ship's seed is used as it is: it is the seed the
workshop shows.** Which seeds a given system gets is not reproduced yet,
because that needs every draw the generator makes before the ships.

### What the game does

| Step | Where (RVA) | What |
| --- | --- | --- |
| A system keeps a list of ships | field table of `cGcSolarSystemData` | `SystemShips`, offset `0x24a0`, elements of `0x40` bytes |
| One element | field table of `cGcAISpaceshipPreloadCacheData` | `TextureDescriptorHint` `+0x00` (32 bytes), `Seed` `+0x20`, `Faction` `+0x30`, `FrigateClass` `+0x34`, `ShipClass` `+0x38`, `ShipRole` `+0x3c` |
| The system generator builds the list | `164b700` to `164baf8`, inside the generator `164a4a0` | a run of calls to `164c2a0`, one loop of five that does the same inline, then the list is sized (`1654160`) and the elements copied to `+0x24a0` |
| One call creates one ship | `164c2a0` | arguments: generator context, faction, role, ship class, frigate class, texture hint; the element is filled and appended |
| The ship's seed | `164c343` to `164c3c1` | two steps of the generator whose words are at `+0x510` and `+0x514` of the generator's state, then the child seed finalizer (`>> 33`, `* 0x64DD81482CBD31D7`, `>> 33`, `* 0xE36AA5C613612997`, `>> 33`); stored with its in-use flag |
| A ship may become a solar ship | `164c3d3` to `164c4ab` | only for faction 1, role 0 and a class other than 6: the ship seed and the system seed are combined (`0x9DDFEA08EB382D69` mix, the one the planet research found), turned into a fraction, and when it is below a threshold the class becomes 8 (`Sail`). A flag of the system (`+0x2e17`) and class 4 (`Shuttle`) choose between two thresholds |

The child seed is the same routine the part selection uses for nested lists,
already ported (`childSeed` in the application, `child_seed` in
`runtime/research/procedural-seed-primitives.py`).

Ship class numbers are the game's `cGcSpaceshipClasses`: 0 freighter, 1
hauler, 2 fighter, 3 explorer, 4 shuttle, 6 exotic, 7 living, 8 solar, 9
interceptor ([obtain notes](SHIP_AND_MULTITOOL_OBTAIN_NOTES.md)).

### Not established

- The list of calls with their arguments, in order. They were seen (about
  twelve calls and a loop of five) but not all of their arguments were read
  with certainty, so no table is given here.
- The two solar ship thresholds. They are read from data that is filled when
  the game starts; the public wiki gives 10% and 85% (outlaw systems).
- The state of the generator's stream when the ships are created. The
  generator (`164a4a0`, `0x1e00` bytes, about thirty routines called) draws
  for the star, the planets and more before it reaches the ships.
- That the ships a player can buy in a system are these elements, and how a
  landing ship picks one. The public wiki describes 21 designs per system.
- Multi-tools of a system: the table `gcsimulationglobals` has the pools
  (standard 2 to 4 draws, royal, sentinel and Atlas 1 each); where their seeds
  come from was not looked at.

### Reading a system from the running game

Bridge 1.8.0 (`star_system.h`) reads the current system every 300 frames and
writes `native-star-system-180836-<PID>.txt` when the reading changes:

```text
state=read
seed=0x<16 hex digits>
ships=<count>
ship=<index> class=<n> role=<n> faction=<n> frigate=<n> seed=0x<16 hex digits> hint=<text>
```

or `state=no_system`. It is a read: nothing is written to the game and no game
routine is called. The application shows it in the workshop's "Current system"
tab; a ship of a class the workshop has opens there with its seed, and a
freighter opens with this system as its home.

Not run live yet. The first reading answers three things at once: whether the
offsets hold, whether these are the ships that land and can be bought, and
whether a ship seen in the game equals the workshop's model for its seed.

### First live reading, 2026-10-09

Bridge 1.8.0, build 180836, one system (seed `0x0001DB00F769C14E`, which as an
address is system `1DB`, galaxy 1, portal `01DBF769C14E`).

| Entries | Faction | Role | Classes |
| --- | --- | --- | --- |
| 1 to 21 | 1 | 0 | 3 haulers, 3 fighters, 7 explorers, 7 shuttles (2 became solar), 1 exotic |
| 22 to 27 | 1 | 2, 2, 2, 3, 4, 5 | freighter (class 0) |
| 28 to 35 | 1 | 6 | freighter class with frigate classes 0 to 7 |
| 36 | 3 | 0 | interceptor (class 9), hint `POLICE` |
| 37 | 3 | 2 | freighter |
| 38 to 42 | 2 | 0 | 5 fighters |
| 43 to 48 | 1, 2, 5 | 6 and 3 | frigates (frigate classes 8, 9, 10) and freighters |
| 49, 50 | 5, 1 | 8, 7 | classes 11 and 10 |

What it settles:

- The offsets hold: the seed has the shape of an address and the list is
  well formed.
- **Every ship seed is the next child seed of one number stream**, with one
  gap of two steps (between entries 42 and 43).
- **That stream starts at the system seed**: walking it backwards from the
  first ship reaches the initial state of the system seed after exactly 302
  steps. So for this system the ship seeds follow from the address alone:
  child seeds number 1 to 21 after 302 steps are the 21 ships above.
- The first 21 entries have the composition the public wiki gives for the
  ships a system offers (seven shuttles, three of each specialist type, four
  more of one type, one exotic); the four extra here are explorers.

`apps/desktop/src/shared/star-system-stream.ts` holds the stream (forward,
backward, child seed and its inverse) with this reading as its test, and the
"Current system" tab shows the step count for whatever system is loaded.

Still open after it: whether 302 is the same in other systems. The tab shows
the number for each system visited, so a few visits answer it.

### Reading the game's memory, 2026-10-09

Same process and system as the first reading. `runtime/research/read-live-star-system.py`
opens the game with read rights only and reads the system record and, with
`scan`, every 8-byte value in writable memory that is a child seed of the
system's stream. It is a research tool for Windows; the application does not
use it.

Layout of the system's stream, from a scan of the first 20,000 positions
(7,253 copies found, at 75 positions):

| Steps before | Child seeds | What they are | How it was identified |
| --- | --- | --- | --- |
| 0 | 1 | The space station (`SpaceStationSpawn`, record `+0x1f00`) | Field of the record |
| 2 to 42 | 21 | Characters of the system (station staff and visitors) | Copies sit beside player character part names (`_HEAD_KORVAX`, `_CHEST_VANILLA`, NPC chairs, `STAFFNPCMULTITOOL`) |
| 44 to 301 | none | 258 plain draws, no child seed | No copy of any child seed at these positions |
| 302 to 384 | 42 | Ships 1 to 42 of the list | The ship list |
| 386 | 1 | `SentinelCrashSiteShipSeed` (record `+0x2490`) | Field of the record; this is the gap of two steps in the ship list |
| 388 to 402 | 8 | Ships 43 to 50 | The ship list |
| 522 | 1 | Used while loading destroyed freighter parts | Copies beside `..._DESTROYED.SCENE.MBIN` names; role not established |

So the freighters and frigates of a system are in the same list as its ships
and have the same origin: child seeds of the system stream.

Record fields of this system: `Planets` 3, `PrimePlanets` 2, `StarType` 0,
`Class` 1, `InhabitingRace` 2, `ConflictData` 0, `MaxNumFreighters` 2,
`NumTradeRoutes` 3.

#### Planet seeds come from another stream of the same address

The planet seeds are not on the system stream. The generator copies them
from the result of the routine at `132bf90`, which takes the address and:

1. Applies the finalizer (the two multiplications of the child seed formula)
   to the address and seeds a stream with the result.
2. For each ordinary planet draws once: size class = `(draw * 3) >> 32`. A
   size class of 0 draws once more for a number of moons (0 to 2, limited by
   the room left).
3. Takes one child seed per ordinary planet.
4. For each prime planet draws once for the size class, takes a child seed,
   and on size class 0 draws once more for moons, each moon taking a child
   seed.

Emulated for this system with one ordinary and two prime planets, it gives
exactly the three planet seeds the game holds (`0xA6E40ED1C9C7D920`,
`0x14448EA005643FDE`, `0x69F5341A67A5D068`). The numbers of planets and prime
planets come from the routine at `132aee0`, which is a Threefry generator
(constant `0x1BD11BDAA9FC1A22`, the 4x64 rotation set) keyed by the 40 low
bits of the address (the region, without the system index) and advanced by
the system index. It is not ported. With it, planets, star type and race of
any address follow without visiting it, which is what a search for systems
by their planets needs.

#### The player's own things

The player state is at manager `+0xb940`. Its first eight bytes are the
current address. The owned ships are resource elements (file name pointer,
seed 0x20 later, in-use byte after the seed) from `+0x17ef0`, 0x48 apart; the
ship names follow from `+0x1ad90`, 0x20 apart. The test slot holds reward
ships with fixed small seeds, so nothing about seed origin follows from them.

#### Multi-tools in memory

About thirty resource elements for `MULTITOOL.SCENE.MBIN` with full 64-bit
seeds were in memory in the station. None is a child seed of the system
stream (first 1,200 positions) nor on the stream of any seed drawn from it
(walking back 2,000 steps). Their origin is not established; a deeper level
(a part seed inside a character) is the next thing to test.

The game files hold more procedural multi-tool scenes than the workshop
offers: `retromultitool`, `switchmultitool`, `swarmmultitool`, `rodmultitool`
(fishing rod), `staffmultitoolbone`, `staffmultitoolruin`, `gravitygun` and
`staffnpcmultitool`. They are listed in `TODO.md`.

### Second system, 2026-10-09

Same process, after two warps by the owner: system `0x0000E800F669E14C`
(`Planets` 4, `PrimePlanets` 2, `InhabitingRace` 2, `ConflictData` 1).

| | First system | Second system |
| --- | --- | --- |
| Station | 0 | 0 |
| Characters | 2 to 42 (21) | 2 to 42 (21) |
| Plain draws | 258 | 403 |
| First ship | **302** | **447** |
| Sentinel crash site ship | 386 (first ship + 84) | 531 (first ship + 84) |
| Ships in the list | 50 | 50 |
| Ships 1 to 21 | 3 haulers, 3 fighters, 7 explorers, 7 shuttles (2 solar), 1 exotic | 3 haulers, 3 fighters, 7 explorers, 7 shuttles (1 solar), 1 exotic |

- **The number of steps before the first ship is not fixed.** Everything
  else has the same layout, so one number per system is what is missing to
  list the ships of an address. It is produced by the routine at `164da40`
  (1,147 instructions, twelve places that step the generator, 38 calls),
  which runs between the characters and the ships. Two readings do not
  determine it (258 and 403 with three and four planets).
- Position 522 holds a child seed in both systems although the ships start
  at different places, so it belongs to a second walk of the same stream
  from its start (child seed number 262), left on the stack; its user is not
  identified.
- The multi-tool seeds found beside `MULTITOOL.SCENE.MBIN` are the same 35
  in both systems, so they are a fixed set the game keeps loaded, not the
  tool a station offers.
- The tool offered in the second station (a class B pistol; the owner sent
  the screen) was searched for while shown: its name is in memory only as
  interface text, and no node seed of it was found among child seeds of the
  first 60,000 positions of the system stream. Its seed is not a child seed
  of the system stream. Buying it puts the seed in the player state, which
  gives a known value to test origins against.

Two ways to the ships of any address remain: port `164da40` far enough to
count its draws, or have the bridge ask the game to generate the record for
an address (the routine at `164a190` takes the address and fills a system
record). The second is exact by construction but works only with the game
running and needs its own safety review, because the routine also writes
the generator state in its context object.

### The station's multi-tool, bought, 2026-10-09

The owner bought the tool offered in the second station (a class B pistol
the game names "Choque Caçador A96/BE0-OK0" in Brazilian Portuguese). The
player state then held, for the current weapon, the file name
`MODELS/COMMON/WEAPONS/MULTITOOL/MULTITOOL.SCENE.MBIN` at `+0x8d8` and the
seed **`0x81E18111081140E1`** at `+0x8e8` (in-use byte after it).

- **First comparison of the workshop with the running game.** The workshop,
  given that seed and the standard multi-tool type, builds the same tool the
  game showed in its purchase screen: same body, barrel, round side part,
  grip with guard and top stripe (`Multitool NORMAL`, `Gunmode 2`,
  `Barrel 3`, `Magslot 1`, `Toolstock 1`). Part selection for multi-tools is
  therefore confirmed against the game for one seed.
- **The colours differed, and why.** The game shows a white body with
  orange stripes and a yellow grip; the workshop drew red stripes and a teal
  grip. With the palette drawn from the **first child seed** of the tool's
  seed, and nothing else changed, the Paint samples become yellow (sample 0,
  the grip's `PAINT1` layer) and orange-red (sample 3, the trim's `PAINTALT`
  and the decals), and the Undercoat stays white: the game's colours. The
  texture layers still follow the tool's own seed: drawn with the child seed
  the coating would be `DEFAULT` (a yellow body), with the own seed it is
  `CLEAN` (white), as in the game. Application 1.16.1 uses this rule for
  multi-tools. It rests on this one tool; the other multi-tool types are
  not compared.
- Two more faults showed in the same comparison and are fixed in 1.16.1: a
  layer whose chance is not met was still drawn when its alternative has no
  name (the rust layer, chance 0.2), and the second diffuse texture of a
  material (`gDiffuse2Map`, here `multitooldecals_1`, laid out with the
  second pair of texture coordinates of each vertex) was not drawn at all.
- Still different: unpainted metal (the top housing, the front flap) is grey
  in the workshop and beige or black in the game. The trim texture has no
  coating there; the game's look comes from its metal shading (the masks
  map), which the workshop does not do.
- **The origin of the seed is not established.** It is not a child seed of
  the system stream, of the stream of the mixed address, of any planet seed
  or of any seed drawn from the system stream (walked back three million
  steps), nor the finalizer of any of them. Only 20 of its 64 bits are set,
  which a child seed (the output of the finalizer) would show about once in
  a thousand; it may be built from packed fields instead. Finding the code
  that fills the offered tool is the next step for multi-tools.

### The generator run in an emulator, 2026-10-09

[NMS Shipwright](https://github.com/S-T-0-7/NMS-Shipwright) (MIT licence,
Shikhar Tiwari, commit `a9320fc`) runs the game's own star system generator
without the game: it maps `NMS.exe` into the Unicorn emulator, stands in for
imports, heap and the application object, and calls the generator for an
address. Its addresses for build 180836 are the ones found here
independently (generator `164a4a0`, application pointer `6e8d708`, current
system slot `0x72afb0`, ship list at `+0x24a0`). Its seed arithmetic, option
weights and palette families are also the same as this project's.

`runtime/research/emulate-star-system.py` drives that harness (not included
in this repository; the packages `unicorn`, `pefile` and `hgpaktool` are kept
in `%LOCALAPPDATA%\NMSCourier\research-tools\python-emulation`).

- **Checked against both live readings:** for `0x0001DB00F769C14E` and
  `0x0000E800F669E14C` the emulated generator gives the same fifty ships
  (seed and class), the same sentinel crash site ship and the same planet
  seeds the running game held. About 0.03 s per system once started.
- So the ships of any address can be listed offline, exactly, by emulation.
  What the record calls `PrimePlanets` are the moons.

#### What the draws before the ships are

`emulate-star-system.py draws` hooks every write of the generator's stream
word and places it on the stream. The generator walks the stream twice: a
first walk (planets and their layout), then the state is set again from the
seed and the second walk produces everything up to the ships. For the second
walk, over 120 systems of one region:

| Part | Steps | Notes |
| --- | --- | --- |
| Fixed start | 39 | the same instructions and positions in all 120 systems |
| Points of interest, per planet that is not a moon | 1 + 4 or 5 per try | one draw for the number of tries, 30 to 65 (`30 + ((36 * draw) >> 32)`); each try draws 4 times, and a fifth time unless it was rejected |
| Before the ships | 3 | three single draws (`164acbf`, `164ad20`, `164ad71`) |
| Ships | 2 each | the list; the sentinel crash site ship after the 42nd |

A try is a point on a sphere around the planet (two draws for the direction,
one for the distance), a draw for its kind (`(draw * 100) >> 32 < 5`), then a
distance test against every point placed so far: too close and the try is
dropped without its fifth draw. The fifth draw (`< 20` of 100) adds a
companion point. The limits are fields of `GCSOLARGENERATIONGLOBALS` (30, 65,
5, 20, and a distance of 40000). About 3 in 100 tries are rejected (807 of
25,913), so almost every system has some.

This is why the number differs per system (302 = 39 + 1 + 52 * 5 + 2 for the
first system, which has one planet and no rejected try) and why it cannot be
had without the geometry: **a hand port must reproduce the positions of the
planets and of every point in the game's single-precision arithmetic,
including its sine and cosine routines (`206e60`, `206d80`), or the count is
wrong after the first rejected try.** It also needs the number of planets of
the address, from the Threefry routine (`132aee0`, called through `132d5e0`).

State of the hand port: the stream, the child seeds, the ship list layout
and the planet seeds are ported and tested; the count of steps before the
ships is not. The emulator is the reference to test each further piece
against, system by system.

### Next step, bounded

The draws are listed (above). The next piece of the hand port is the number
of planets of an address: port the Threefry routine at `132aee0` and compare
`planets` and `moons` with `emulate-star-system.py survey` over a region.
After it, the planet positions of the first walk, then the points of
interest loop at `1653030` to `16535e9`.

## Open, in the order they would be taken

1. The draws of the system generator before the ships (above), then a port
   that lists the ship seeds of a system address. A reading in a second
   system (the "Current system" tab shows the step count) says at once
   whether 302 is fixed.
2. Multi-tool seeds of a system.
3. The freighter model seed of a system's freighter.
4. Slots, stats and name of a seed.
5. The owning class of each of the 122 seed fields.
6. Planet, creature and building seeds: partly covered by the older planet
   research ([planet and fauna seed flow](PLANET_FAUNA_SEED_FLOW.md)), not
   joined to this note yet.
