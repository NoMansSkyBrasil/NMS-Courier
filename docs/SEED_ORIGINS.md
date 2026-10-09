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

### Next step, bounded

Read `164a4a0` from its start to `164b700` and list every use of the
generator words at `+0x510` and `+0x514` (each is one draw) and every routine
called that receives the state. That gives the number of draws before the
first ship, which with the system seed gives every ship seed of a system.
`runtime/research/read-class-members.py` names any structure the code
touches.

## Open, in the order they would be taken

1. The draws of the system generator before the ships (above), then a port
   that lists the ship seeds of a system address.
2. Multi-tool seeds of a system.
3. The freighter model seed of a system's freighter.
4. Slots, stats and name of a seed.
5. The owning class of each of the 122 seed fields.
6. Planet, creature and building seeds: partly covered by the older planet
   research ([planet and fauna seed flow](PLANET_FAUNA_SEED_FLOW.md)), not
   joined to this note yet.
