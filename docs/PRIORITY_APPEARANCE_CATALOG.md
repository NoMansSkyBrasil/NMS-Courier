# Priority appearance catalog and inverse-search objective

Superseding implementation: [appearance search and recipes](APPEARANCE_SEARCH_AND_RECIPE.md)
adds bounded partial-evaluator enumeration with replay and explicit preview
recipes. The exact-result acceptance rules below still apply; no full inverse
or native appearance equivalence is claimed.

Updated 2026-10-05. Priority: ships, multitools and freighters. Further NPC and
frigate work is deferred. [The category ledger](SEED_CATEGORY_LEDGER.md) preserves
completed NPC work and exact catalog counts. The requested outcome is **appearance constraints
to a seed that reproduces them**, not merely a random seed or a parts browser.

## What the desired inverse must solve

The forward input includes the resource/category and seed, default versus edited
customisation, palette source and material resources. The reverse problem is to
find a uint64 seed whose **complete forward result** satisfies the requested
piece IDs, palette/color channels, texture alternatives and decals for a fixed
resource/build/context. Different seeds can satisfy the same appearance. A
successful solver may return one matching seed; uniqueness is not required.

There is no verified universal assignment such as "these bits are wings and
those bits are paint". The recovered default PRNG initializes two uint32 words
from a uint64 input and advances with multiply-with-carry. Descriptor choices
consume ordered draws; nested/reference resources can derive child seeds.
Texture selection initializes a separate state from its input and consumes
conditional draws. Default owned ship/tool input propagation is connected;
freighter color inputs are separate. See [arithmetic](PROCEDURAL_SEED_RESEARCH.md),
[entity inputs](ENTITY_APPEARANCE_SEED_FLOW.md) and
[texture selection](TEXTURE_SELECTOR_EMULATION.md).

An arbitrary RGB picker does not imply that the chosen RGB exists in the
applicable procedural palette. Nor does a list of declared parts prove that
every cross-product is reachable. Exact mode must distinguish:

- **Verified matching seed**: all requested constraints reproduce through the
  validated forward path for the selected build/resource/context.
- **Candidate**: a partial evaluator matches, but another appearance stage is
  unresolved. Do not label this an exact game seed.
- **Incompatible descriptor branches** or **color unavailable in the selected
  palette**: a concrete constraint failure, where independently established.
- **Search exhausted within bounds**: not proof that no uint64 seed exists.
- **Requires separate input/customisation**: requested settings cannot currently
  be represented as a verified single-seed result; never silently add overrides.

No complete inverse solver is delivered in this increment. This catalog and
the native collector comparison remove prerequisites; they are not a substitute
for the remaining forward-path and inverse work.

### Concrete inverse constraints from the recovered branch

For an unfiltered descriptor group, let `W` be total integer Name weight and
`A`/`B` the cumulative weights before/after the desired option. The recovered
choice computes `q = (draw * W) >> 32`. Thus the desired option requires:

```text
ceil(A * 2^32 / W) <= draw < ceil(B * 2^32 / W)
```

This is an exact algebraic consequence of the recovered multiply-high branch,
not an inferred probability from XML Chance. Zero-weight choices have no draw
interval in this branch. Ancestor choices determine which groups and child
streams even execute; the catalog's guards/reference edges supply those inputs.
The solver must also satisfy the PRNG transition:

```text
t = low32 * 0x5A76F899 + carry32
next_low = t mod 2^32; next_carry = floor(t / 2^32)
draw = next_low
```

Initialization combines the input's low/high halves and a rotate; child streams
apply the separately recovered 64-bit mixer. Constraints must preserve overflow
widths and every intervening draw. The existing child inverse can return multiple
initializer preimages; it is not by itself an appearance inverse.

Texture choices require a different constraint: ordered **float32** cumulative
weights and a float32-scaled draw, after the presence roll and native collector's
per-option occurrence averages. Reusing the integer interval formula here would
be wrong. Color constraints must use the actual category's palette stream/bank
and channel binding, including any separate freighter input. This gives a
concrete constraint problem to solve after the remaining forward linkage closes;
it does not establish that every requested combination has a satisfying seed.

## Reproducible organization

`runtime/research/build-priority-appearance-catalog.py` reads the existing
read-only corpus index. It emits an external JSON containing:

- Per-resource archive, binary/XML fingerprints and explicit failure status.
- Descriptor group IDs, ordered alternatives, local ancestor guards, raw Chance,
  cross-resource reference paths and recovered default Name-weight candidates.
- Shallow scene candidates with descriptor sibling existence. Fixed/legacy/
  support scenes remain candidates, not automatically spawn roots.
- Texture layers, declared alternatives, Probability, SelectToMatchBase,
  palette family, ColourAlt and Index, including normal/mask/diffuse references
  already declared by those alternatives.

The source corpus is not redistributed. Generated game-derived records stay
external. The original script and these findings are tracked for another AI.
No asset extraction or game/save access occurs.

The 2026-10-05 catalog includes Corvette's shallow scene without a descriptor/
seed-constructor claim, NPC root/shared-part distinctions and unclassified
descriptor records. priority-catalog-intervals-20261005.json contains 293
descriptors, 1,665 groups, 3,709 alternatives, 87 shallow scenes and 343 textures.
The ship/tool/freighter subset has 229 descriptors, 1,320 groups and 3,037
alternatives. Source bytes: 6,777,077, within the unchanged 64 MiB budget.
Texture metadata row cap is explicitly 512; other guards remain. Per-option
draw intervals and group total weights apply only to the enabled unfiltered
integer branch; zero-weight alternatives have no interval, not a guessed seed.

Observed corpus snapshot: 229 descriptor sources, all uniquely indexed and
hash-checked; 1,320 groups and 3,037 declared option occurrences. This includes
referenced part resources and nested groups, **not 3,037 independently selectable
complete ships**. 131 texture sources contain 390 nonempty layers and 577 option
occurrences. Eleven texture paths have a decal/logo/stripe/pattern name hint;
that hint is not proof of how or where a decal renders. Total read: 4,069,456 bytes.

| Research category | Descriptor sources | Groups | Option occurrences | Shallow scene candidates |
| --- | ---: | ---: | ---: | ---: |
| Fighter | 29 | 81 | 135 | 12 |
| Hauler (dropships resource family) | 29 | 99 | 237 | 1 |
| Explorer (scientific family) | 36 | 119 | 269 | 1 |
| Shuttle | 44 | 146 | 460 | 2 |
| Exotic and living | 6 | 26 | 80 | 1 |
| Solar | 8 | 98 | 232 | 1 |
| Interceptor | 2 | 95 | 272 | 5 |
| Multitool | 19 | 301 | 764 | 21 |
| Freighter | 56 | 355 | 588 | 28 |

These are resource-family classifications, not exhaustive current gameplay
types. Expedition/fixed special models and assembled/custom ships must retain
their actual resource/preset instead of being forced into a procedural family.
The ordinary multitool descriptor itself contains subtypes; filename count
cannot be interpreted as gameplay subtype count.

### Entry points and conditional pieces

Paths below are relative to `models/common/spacecraft/`, except tools relative
to `models/common/weapons/multitool/`. Counts describe **top-level groups only**;
the external catalog retains deeper choices and reference dependencies.

| Resource | Top-level choices |
| --- | --- |
| `fighters/fighter_proc.descriptor.mbin` | `_ENGINE_` (3), `_WINGS_` (10), `_COCKPIT_` (5) |
| `dropships/dropship_proc.descriptor.mbin` | `_COCKPIT_` (9), `_HULL_` (1) |
| `scientific/scientific_proc.descriptor.mbin` | `_COCKPIT_` (2) |
| `shuttle/shuttle_proc.descriptor.mbin` | `_SHUTTLE_` (2) |
| `s-class/s-class_proc.descriptor.mbin` | `_SCLASSSHIP_` (2) |
| `s-class/bioparts/bioship_proc.descriptor.mbin` | `_TOPMID_` (2), `_TOPACC_` (3), `_FEET_` (5), `_COCKPITS_` (1), `_ENGINE_` (2), `_WINGS_` (3) |
| `sailship/sailship_proc.descriptor.mbin` | `_ROOTJNT_` (1), `_TIPS_` (5), `_WINGS_` (6), `_BODY_` (6), `_SAILS_` (3) |
| `sentinelship/sentinelship_proc.descriptor.mbin` | `_PIT_` (3), `_TOPFLAP_` (2), `_WINGS_` (3), `_SKIRT_` (2) |
| `industrial/freighter_proc.descriptor.mbin` | `_HULL_` (2) |
| `industrial/capitalfreighter_proc.descriptor.mbin` | `_HULL_` (1), nested choices remain substantial |
| `industrial/piratefreighter.descriptor.mbin` | `_PIRATEFREIGHTE` (1); identifier preserved verbatim |
| `multitool.descriptor.mbin` | `_MULTITOOL_` (2), nested piece/subtype choices |
| `atlasmultitool.descriptor.mbin` | `_TOOL_` (3) |

Additional tool resources include royal, sentinel A/B filenames, retro, Switch,
staff, Atlas/bone/ruin staff variants, swarm, gravity gun and fishing rod.
Their presence is catalog evidence; some are assembled, fixed, NPC or utility
resources. Do not promise natural-seed generation for every filename.

## Decals and colors remain separate constraints

A decal is not necessarily geometry. Existing samples include logo, stripes,
small decal sheet and paint-pattern texture alternatives. Each selected option
has its own palette family/channel. "No palette tint payload" is not synonymous
with a black visible decal, and choosing an option does not yet reproduce its
DDS pixels, masks or shader blending. Shared textures require proven scene to
material edges; this catalog intentionally does not assign them to ships by
similar filenames.

The next inverse prerequisite is **merged full selector equivalence with actual
material resource order**, then default/alternate palette source and pixel-mask
composition for selected roots. Keep explicit customization outside single-seed
exact mode until its separate inputs are represented honestly.

See [collector findings](TEXTURE_COLLECTION_RESEARCH.md),
[coverage](SEED_RESEARCH_COVERAGE.md) and [AI continuation](AI_CONTINUATION.md).
