# Where each seed comes from

Status on 2026-10-08: started. This note owns the question "what is this seed
and how does the game arrive at it", one seed per section, with the evidence
for each. What a seed *produces* (parts, colours, textures) is in
[model workshop](MODEL_WORKSHOP.md) and the older research it links.

Everything here is offline reading of the build 180836 executable
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

## Open, in the order they would be taken

1. Starship and multi-tool seeds of the ones a system offers: how the game
   gets them from the system (the workshop can already show any seed).
2. The freighter model seed of a system's freighter.
3. The owning class of each of the 122 seed fields.
4. Planet, creature and building seeds: partly covered by the older planet
   research ([planet and fauna seed flow](PLANET_FAUNA_SEED_FLOW.md)), not
   joined to this note yet.
