# NMS seed systems: categories, parts, colors and generated properties

Updated: 2026-10-03. This is a short synthesis of existing source inspection,
not a new experiment or implementation plan. No tests, extraction or game
execution were performed for this note. Evidence concerns the previously
inspected build 180383, executable SHA-256
`671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.

The complete seed-to-appearance algorithm has **not** been recovered. The
integer generator is supported by inspected assembly; descriptor traversal and
the base palette schedule are partial evaluators. Category-specific input
propagation and final texture composition remain unresolved.

Scope is the game's seed systems in general, not only ships. The category map
below separates evidence from unresearched areas. It is a coverage inventory,
not a claim to enumerate every internal game type or to have recovered every
algorithm. A shared generator primitive does not prove identical inputs or
draw schedules across categories.

## Categories and subcategories

| Category | Subcategory | What is understood; what remains unknown |
| --- | --- | --- |
| Starships | Fighter | Descriptor groups and references select parts; inspected cockpit layers use Paint, Metal and Rock. Complete caller/filter/texture selection remains unverified. |
| Starships | Hauler / Dropship | Nested descriptor choices include hull, neck, wings and containers. Some coarse public-image correspondences exist; complete geometry/color equivalence is unverified. |
| Starships | Explorer / Scientific; Shuttle | Descriptor roots and nested references are indexed and have experimental traces. Category-specific seed propagation and complete colors remain unverified. |
| Starships | Exotic / S-class appearance family | The inspected root has six groups and thirteen options; Royal texture alternatives are described below. An appearance-family name is not a general class-generation rule. |
| Starships | Solar / Sailship | Descriptor choices are indexed; the base palette table includes SailShip_Sails. That family name does not prove the complete sail/hull seed schedule. |
| Starships | Sentinel / Interceptor | Groups such as cockpit, wings and skirt have conditional children. Supplied part selections were mapped to valid branches; reachability from a seed and final colors remain unverified. |
| Starships | Living / Bioship | Descriptor roots and BioShip_Body, BioShip_Underbelly and BioShip_Cockpit palettes exist. Their caller inputs and final appearance mapping remain incomplete. |
| Starships | Expedition, preorder and other special rewards | Resource/preset, seed, inventory class and customisation fields must remain separate. Some use small seeds and dedicated resources; they are not universal numeric ship IDs. |
| Starships | Corvette and other explicitly assembled/customised models | No complete seed algorithm established here. Explicit assembly/customisation must not be assumed to have one natural seed equivalent. |
| Freighters | Standard / system; Capital | Distinct descriptor roots and referenced resources are indexed. Model Seed and Home Seed must be retained separately; their full current-build roles are unresolved. |
| Freighters | Pirate | Inspected root contains one option with a scene reference. This does not make all details/colors constant. Complete resource, color and secondary-seed semantics remain unverified. |
| Frigates | Conventional | No complete generation algorithm recovered. Model appearance, generated statistics, traits and fleet ownership are different outputs. |
| Frigates | Living | Root descriptors are indexed, but variation can be delegated to other resources or paths. The seed-to-model/color/stat relationship is unresolved. |
| Multitools | Standard procedural models | Indexed root contains extensive descriptor groups. An inspected multitool texture uses Paint/Rock with Primary/Alternative1/None. Complete tool-specific seed flow is unresolved. |
| Multitools | Royal; Atlas; Sentinel variants; staff; rod | Separate roots have been inventoried. A small or single-option root does not prove a fixed whole appearance. Staff assembly/customisation cannot be equated with seed-only generation. |
| Fauna / companions | Bird and other ground/flying/aquatic resource families | One bird dependency graph and material/palette inputs were inspected. A complete category-wide evaluator is absent. A resource name and seed together are necessary context. |
| Fauna / companions | Creature, secondary creature, genus and species channels | Public export tooling exposes these as separate seed labels. Their complete native meaning, derivation and interaction have not been recovered; they must not be collapsed into one seed. |
| Flora | Plants, trees and other vegetation resources | Base families include Plant, Leaf, Wood and Grass. Their presence is evidence of color data, not recovery of plant shape, placement or per-planet seed derivation. |
| Minerals / environmental objects | Rocks, crystals and related procedural resources | Rock/Stone/Crystal and related palette families exist. Shape selection, distribution and seed derivation remain unresearched in this recovery. |
| Universe | Galaxy / system | Natural location and entity spawn derivation have not been recovered. An appearance seed is not a portal address or a unique system identifier. |
| Worlds | Planets / moons; terrain / biome; atmosphere / water | Palette families for sky, fog, clouds, water and terrain exist. Terrain generation, biome selection, climate and nested world-seed schedules are not established by the palette evaluator. |
| Procedural technologies | Upgrade modules, separated by equipment/item identifier | Pi calls native technology generation and records names/stat bonuses. This is a different seed namespace and output from visual model generation; the independent native stat formula remains unrecovered. |
| Procedural products | Treasures and other generated products | Pi calls native product generation for name, value and descriptive fields. Product identity plus seed is the context; this is not a ship/creature appearance decoder. |
| Other customisation/content | Exosuit appearance, exocraft, bases, missions and unlocks | No general seed mechanism established in this investigation. These feature areas can have explicit definitions, selection or state; do not invent seeds merely because Courier may eventually manipulate them. |

For every category, keep separate questions: which resource/type is selected,
which seed channels are passed, which properties are generated, and which values
come from explicit configuration. The table records unknowns instead of
presenting the ship branch as a universal algorithm.

## What a seed represents

A seed is a 64-bit input to deterministic procedural choices, not an encrypted
list of parts and colors. The model resource supplies the available choices.
Consequently, the same number can produce different results for a Fighter,
Sentinel, freighter or multitool: they use different resources and may receive
different additional inputs. Preserve the full uint64 value; JavaScript Number
cannot represent every such seed exactly.

Conceptually, the inspected paths combine:

`resource + seed inputs + descriptor rules + texture/palette data + overrides`

The result is then rendered with materials and lighting. Class, inventory size,
supercharged slots and acquisition price are separate configuration domains;
appearance seed alone does not establish them.

## The recovered number generator

For an enabled seed, let `L` and `H` be its original low and high 32-bit words:

```text
state.low   = L, except replace zero with 1
state.carry = rotateRight32(L, 16) XOR H XOR L

Each draw:
product     = state.low * 0x5A76F899 + state.carry
state.low   = low32(product)
state.carry = high32(product)
draw        = state.low
```

A disabled seed initializes `(1, 0)`. The order and number of draws matter.
Taking an extra branch can change subsequent choices. Referenced child models
can receive derived seeds: the inspected branch concatenates two draws, then
mixes them with XOR-right-shift-33 operations and uint64 multiplications by
`0x64DD81482CBD31D7` and `0xE36AA5C613612997`, wrapping at 64 bits.

These operations are reproduced in
[procedural-seed-primitives.py](../runtime/research/procedural-seed-primitives.py).
They do not by themselves identify every caller's input seed.

## What changes the parts

`.DESCRIPTOR.MBIN` resources organize alternatives into groups and nested
dependencies. A selected option can enable child groups or reference another
scene. Parts therefore cannot be treated as independent dropdown choices.

In the inspected unfiltered choice branch, ordinary names have weight 20,
`xRARE` has weight 1 and `xNEVER` has weight 0; marker order is significant.
The draw selects a position using `(draw * totalWeight) >> 32`, then the
cumulative weights select an option. These rules are specific to that branch;
the XML `Chance` field alone is not its selection algorithm.

Changing the seed can change choices and descendants. Changing the resource,
filters, explicit descriptor overrides or traversal path can also change the
result. The existing evaluator preserves nested lists and references but does
not reproduce every native filter/customisation route. A displayed combination
of parts does not prove that a natural seed can produce it.

## What changes the colors

There are several distinct contributors, rather than a universal "color digit"
inside the seed:

| Contributor | Effect supported by existing inspection |
| --- | --- |
| Palette collection and family | Supplies candidate RGBA colors, such as Paint, Metal or Freighter. |
| Palette seed/state and draw schedule | Selects indices within those candidates. The actual entity input channel remains unresolved. |
| Palette size mode | The inspected base table uses modes including 1, 4, 8, 16 and All, with different index mappings. |
| Texture alternative | Selects an option such as painted/panels or a named gold/silver texture. |
| `Palette`, `ColourAlt`, `Index` binding | Declares the color source for an individual procedural texture layer. |
| Texture pixels, masks and shader | Determines where/how colors appear; the complete native composition is not reproduced. |
| Customisation and lighting | Additional appearance inputs; a screenshot is not a direct measurement of the palette value. |

The partial base evaluator processes 66 families, each containing 64 source
colors, and produces five samples per family. It consumes two draws per initial
index and uses a float32 color-distance comparison to avoid repeated colors,
with a bounded index-advance loop. Some family groups reseed or reuse state;
it is not simply one uninterrupted list of 330 random RGB values.

Actual inspected examples show why a single whole-model tint is insufficient:

- **Fighter cockpit:** paint uses Paint/Primary, markings Paint/Alternative1,
  signage Paint/Alternative3, and the base Metal/Primary.
- **One industrial freighter texture:** PAINT1 uses Freighter/Primary and
  PAINT2 uses Freighter/Alternative2. This does not establish the Home Seed's
  role or a universal rule for every freighter resource.
- **Royal trim:** declares SILVER/GOLD and YELLOW/BLUE/RED/DEFAULT/BROWN texture
  alternatives. Its options declare Rock/None; the meaning of `None` must not
  be replaced with a guessed palette sample.

Changing a seed can affect several choices at once. Incrementing it is not a
known operation for changing only red to blue while preserving all parts.
Conversely, recoloring a preview or applying a customisation does not calculate
a replacement seed.

## Special models and important limits

Small seeds such as `0x1` are ordinary inputs interpreted with a resource or
preset, not universal names for special ships. In the inspected reward table,
Starborn Phoenix uses `WRACERSE.SCENE.MBIN`, seed `0x6`, and a separate S-class
inventory definition. This is build-specific source evidence, not a claim
about every saved representation or successful delivery.

Different seeds need not produce distinct results. The inspected initializer
maps both `0` and `0x1000100000001` to `(1,0)`. This proves a shared draw stream
for that branch, not necessarily identical complete entities across all inputs.
Likewise, an appearance seed is not a portal coordinate: natural spawn locations
require the separate universe/system derivation.

We understand meaningful forward components. We do not yet have a verified
whole-appearance function, nor its inverse from desired parts/colors to a seed.
Agreement between our Python and TypeScript calculations confirms the port;
it does not establish that every game's entity passes those exact inputs.

Procedural item seeds also need their own interpretation. The inspected Pi
workflow enumerates 0–99,999 and constructs an item identifier followed by `#`
and a five-digit decimal seed. This describes Pi's enumeration/identifier format,
not a proven universal upper limit on every game seed. Pi uses native game
functions as its generator; its Python ranking calculations do not recover the
underlying technology/product generation formula. Equipment domain, item ID,
generated statistics and visual resource seeds must remain distinct.

## Evidence and code pointers

- [Paused investigation and method handoff](SEED_RESEARCH_HANDOFF.md): fauna
  native callers, role-to-spawn arithmetic, bird/tree data chains, exact
  evidence locations and unresolved seed propagation.
- [Detailed research and assembly evidence](PROCEDURAL_SEED_RESEARCH.md):
  generation primitives, category coverage, reward presets, base palette
  arithmetic and the texture palette binding follow-up.
- [Partial descriptor evaluator](../runtime/research/evaluate-descriptor-seed.py).
- [Partial base palette evaluator](../runtime/research/evaluate-base-palettes.py).
- [Texture binding inspector](../runtime/research/inspect-texture-palettes.py).
- [Preview conventions and limits](MODEL_PREVIEW_RESEARCH.md#experimental-palette-workshop-checkpoint).
- [Procedural technology/product seeds and Pi](PI_PROCEDURAL_ITEM_RESEARCH.md).
