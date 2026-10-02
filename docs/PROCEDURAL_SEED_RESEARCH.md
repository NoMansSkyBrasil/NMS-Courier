# Procedural seed algorithm research

Goal: an independent local evaluator that reproduces the game's seed-to-parts
and seed-to-colors functions, followed by bounded seed search for desired options.
Status: descriptor extraction and native candidate tracing implemented; exact
seed evaluation and inverse search **not implemented**. No runtime capability.

## Separate inputs and outcomes

A model resource selects the descriptor family. A seed is an input to procedural
selection within that family; it is not a universal encoded list of part IDs.
Class, inventories, upgrades, ownership and custom overrides are separate
configuration domains. Preserve hexadecimal 64-bit seeds as strings across the
frontend boundary; do not round them through JavaScript Number.

First reproduce forward evaluation for a pinned build and resource, using known
seed/result pairs. Then search for a seed whose evaluated result satisfies the
requested pieces/colors. An arbitrary piece combination may violate descriptor
dependencies or have no known matching seed. Finding a matching model seed does
not establish its natural galaxy/system/planet location; a location search needs
the separate universe/system generation mapping and independent evidence.

## Evidence inspected on 2026-10-02

Current executable 180383 SHA-256:
`671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.

The existing corpus already contains converted descriptor assets. No new bulk
extraction is required. `inspect-procedural-descriptors.py` reads exact logical
paths through read-only SQLite, bounds each XML to 8 MiB and preserves archive
duplicates. Its option records retain raw Chance, reference paths and ancestor
conditions. Referenced scenes are not yet recursively expanded.

| Descriptor family | Groups | Options |
| --- | --- | --- |
| Sentinel ship | 62 | 190 |
| Fighter | 12 | 38 |
| Dropship | 19 | 137 |
| Sailship | 12 | 28 |
| Sentinel multitool | 4 | 5 |

These are parsed nodes, not independent combinations, probabilities or seeds.
Sentinel top-level groups include `_PIT_`, `_TOPFLAP_`, `_WINGS_`, `_SKIRT_`.
Zero Chance values are retained without treating options as impossible.

`scan-native-acquisition.py --metadata-only --type-name <exact-Tk/Gc-type>`
locates bounded metadata-name reference candidates in a fingerprint-checked PE.
`descriptor-metadata-180383.tsv` reproduces eight native exports via the existing
Ghidra launcher, using stage `descriptors` and project `Acquisition180383`.
The stage completed all eight exports in 46.1 seconds with no failures.
GcSeed had no matching metadata string in this scan; that is not proof that the
game lacks seed functions.

Inspected examples: `1bd1b70` is an XML/metadata path, `1bd4f00` and `1bd4b70`
combine descriptor fields into hashes. They do not yet establish the model PRNG
or selected part sequence. Do not implement these hashes as a ship-seed decoder.
The first `1bcfa0e` export is a split unwind fragment with unresolved registers.
`scan-native-callers.py` validates direct E8/E9 edges against instruction starts
decoded from the containing unwind range. For `1bd4f00` and `1bd4b70` it found
two edges in already inspected metadata fragments; no generation caller was
identified. Indirect/table dispatch and split-function calls remain incomplete.

External artifacts: `E:\NMS-Courier-Research\seed-analysis-180383` and
`E:\NMS-Courier-Research\acquisition-180383\descriptors-export`.
Keep game XML and pseudocode external; commit only reproducible scripts/seeds.

## Public references and rejected shortcuts

- [MetaIdea Ship Creator, pinned source](https://github.com/MetaIdea/nms-ship-creator/blob/15e962c767f8dad66a336b8dcbb3ded7a287239e/index.html):
  inspected local SHA-256 `5b2ad4237d8b1e3b70f41b3c1c55cc0e6b6864aef2ef66d4b230e83ad4b30ffc`.
  GenerateTree/SwitchDescriptor build dropdowns; RefreshModelDisplay toggles
  selected meshes. The application Lua contains no math.randomseed/math.random
  use. Bundled Three.js/Fengari random helpers do not prove the NMS algorithm.
- [NMS Model Viewer](https://github.com/gregkwaste/NMSMV): the author describes
  a custom procedural procedure that tries to emulate the game. That statement
  is not evidence of seed-identical output on build 180383.
- [Pi](https://github.com/zencq/Pi): procedural product/technology stat generation
  through game functions, with an explicit build list. It is useful architectural
  evidence for native evaluation; it does not provide our current ship appearance
  inverse algorithm.

No private service endpoint was called, no third-party plugin was obtained,
and no executable, bridge, mod or save was modified by this research.

## User Sentinel configuration

`runtime/research/sentinel-parts-example.json` maps all 24 screenshot selections
to exact option IDs in the current Sentinel descriptor. `--constraints <json>`
checks unique matches and ancestor choices; all 24 matched without branch
conflicts. `_TEETH_A` requires `_GRILL_SNOUT22` and `_AFRONT_SNOUT2`;
`_AXWINGSS_12` requires `_WINGSO_OTOP` and `_WINGS_V`.
Tests rejected direct alternative conflicts, incompatible ancestors and a missing
ID. This validates descriptor branches only: the example deliberately has no
seed and no verified reachability claim. Color/type names must not be converted
to final palette output without tracing the texture selection path.

## Next algorithm gates

1. Trace the native model-load path into descriptor selection, including indirect
   dispatch and selection state; distinguish metadata hash/serialization from RNG.
2. Recover generator state initialization, integer overflow, draw order, weighted
   choices, recursion and resource-dependent seed derivation from actual code.
3. Compare forward results for several fixed seeds with game-generated descriptor
   selections. Implement only reproduced behavior; record mismatches.
4. Trace textures/palettes independently and validate exact colors.
5. Add bounded/resumable local search with explicit limits and no-match outcome.
   Do not promise exhaustive 2^64 enumeration or every arbitrary configuration.
6. Integrate verified evaluation/search in Electron independently of delivery;
   rendering a requested preview does not prove the seed produces it in game.

## 2026-10-02: Generation path and integer primitives

The mechanism traced here is deterministic procedural generation, not encryption.
Knowing its forward arithmetic does not by itself invert arbitrary part/color
constraints or reveal a natural portal location.

The pinned [public signature database](https://github.com/monkeyman192/NMS.py/blob/52e2e55493ddade1d89d3e638491afff995f5631/tools/data.json)
has SHA-256 `1acdf18b60e9d23fb7f75cc4e7eb27d11be8ed0daaf4ab06de6539ba4d074089`.
The bounded scanner's new `--function-term` option located a unique candidate
for `cGcResourceCustomisation::CreateGenerationTask` at RVA `1149fe0`.
AddResource and ParseData signatures had no match. Public names remain candidate
labels, not current-build ABI or runtime verification.

| Offline RVA | Observed role in the traced path |
| --- | --- |
| `1149fe0` | Prepares customisation data and submits a generation task |
| `1149020` | Branches between seed-driven and explicit descriptor preparation |
| `637db0`, `6377e0` | Allocates, copies and queues task inputs; no PRNG established here |
| `2d63670`, `2d641c0` | Seed-driven preparation leading to automatic selection |
| `2d636b0`, `2d63810` | Explicit descriptor matching with nested/reference traversal |
| `2d649f0` | Descriptor resource lookup/cache path |
| `2d652d0` | Resource-linked matching/exclusion data lookup; not the PRNG |
| `2d63bf0` | Automatic selection, seed-state initialization and recursive seed derivation |
| `2d67800` | Filters options, computes weights and draws a group choice |
| `2d64800`, `2d623c0`, `2d69ad0` | Name classification, recursion and inclusion predicates |

All six stages completed: 1/2/3/3/3/3 exports in 31/19/19/19/19/19 seconds,
respectively, with no export failures. Their committed seed TSVs reproduce these
exports through the existing launcher. Proprietary pseudocode remains external.

### Assembly-checked arithmetic

`procedural-seed-primitives.py` is an **experimental research module**, independent
of runtime delivery. It implements only these observed integer operations:

- Enabled seed: initialize low word to `low32(seed)`, replacing zero with one;
  carry is `ror32(low32(seed),16) XOR high32(seed) XOR low32(seed)`.
  A disabled seed uses `(1,0)`.
- Draw: `product = low * 0x5a76f899 + carry`; store low/high 32-bit words of the
  product and use the low word as the draw.
- Unfiltered weighted choice: map the draw by `(draw * totalWeight) >> 32`.
  Native Name markers are case-sensitive: `xRARE` weight 1, `xNEVER` weight 0,
  ordinary and `xWEIRD` weight 20. Marker precedence is significant. XML Chance
  alone does not determine this branch's weights.
- Reference child seed: advance twice, concatenate second/first low-word draws,
  then apply three XOR-right-shift-33 operations with two intervening uint64
  multiplications by `0x64dd81482cbd31d7` and `0xe36aa5c613612997`.

Assembly windows: initialization `2d63c22..2d63c46`, group draw
`2d67c4f..2d67c79`, reference child derivation `2d63f70..2d63ff1`.
The first automatic-selector unwind fragment ends at `2d63c6e`; separate
fragments were needed to inspect the child arithmetic. Do not assume a single
unwind range contains the entire function. Literal windows resolved `xRARE`,
`xNEVER`, `xWEIRD`, `_PLAYER_` and `LOD`; `_PLAYER_` takes a distinct recursion
path. The task constructor has no demonstrated worker vtable.

`inspect-native-fragments.py` exports bounded instruction/literal windows from
the fingerprinted executable. `test_procedural_seed_primitives.py` passed three
boundary/choice tests and replayed the three actual assembly windows for 1,005
seeds with no mismatches. Its small fail-closed instruction interpreter does
not execute native code. This validates the arithmetic against offline assembly,
**not** complete native execution, selected ship parts, colors or delivery.

Unresolved: original seed propagation into every ship customisation input;
model-list boundaries and traversal order; `_PLAYER_` special handling; `_X`/X
inclusion and resource exclusions; override selection and duplicate suppression;
recursive reference loading and palettes. The isolated weighted-choice helper
does not implement those filters or overrides. Current Sentinel metadata has
27 options with reference paths; Fighter has 31. A flat list of groups is not
enough for a faithful ship evaluator. Do not expose this as a working generator.

### Supplied nms.center HTML

Static inspection of the supplied 652,667-byte HTML, SHA-256
`3a8e1db7e3d818987100a10a1a6cb341960f4ea38c8938062de4742bb28dfe05`,
shows `RemoteProceduralGeneration` submitting type/seed to a remote service and
receiving parts/colors/stats. `GenerateParts` traverses preview choices;
`GetCurrentPartsHash` uses CRC32 of selected configuration identifiers. That CRC32
is not evidence of the game's seed PRNG or its inverse. Search command creation
encodes categorical part/color selections for server processing. The private
server algorithm is absent from this client. No service requests were made,
scripts executed, authentication used or private backend obtained.

External evidence: `seed-analysis-180383/generation-signatures`,
`selector-assembly.json`, `selector-child-assembly.json` and the six
`acquisition-180383/procedural*-export` directories. No installed game, bridge,
mod, save, disk settings or runtime process changed.

## Category coverage and color investigation

The research scope includes all supported categories, not only Sentinel ships.
This is a coverage goal, not a claim that every category uses identical inputs
or that a complete algorithm has been recovered. Shared TkModelDescriptorList
metadata gives evidence for a reusable descriptor framework. Its use by each
runtime creation path still requires correlation. Class, inventory, statistics,
appearance and natural spawn location must remain separate contracts.

`procedural-categories-180383.json` reproducibly selects fourteen additional root
assets through `inspect-procedural-descriptors.py --models-file`. All fourteen
are indexed cTkModelDescriptorList assets: 340 groups and 986 option nodes.
This manifest complements the earlier five assets; it is not an exhaustive
inventory of every root, subpart, expedition preset or animated variant.

| Root asset / category candidate | Groups | Options | Options with scene references |
| --- | ---: | ---: | ---: |
| Pirate freighter | 1 | 1 | 1 |
| Capital freighter | 34 | 48 | 40 |
| Standard freighter | 48 | 98 | 88 |
| Shuttle | 67 | 261 | 253 |
| Scientific / Explorer | 46 | 176 | 140 |
| S-class appearance model | 6 | 13 | 13 |
| Bioship | 14 | 52 | 2 |
| Living frigate root | 2 | 2 | 0 |
| Standard multitool | 103 | 291 | 0 |
| Royal multitool | 4 | 4 | 0 |
| Atlas multitool | 1 | 3 | 3 |
| Staff | 9 | 31 | 0 |
| Sentinel multitool B | 3 | 3 | 0 |
| Rod multitool | 2 | 3 | 0 |

These are root-file counts, not total appearance counts or reachable combinations.
The Pirate root's only option references INVENTORY_MEDIUM.SCENE.MBIN; do not
infer that every detail/color of a Pirate freighter is therefore fixed. Reference
paths can point to scenes rather than descriptor files, so resolution must follow
the actual resource loader instead of blindly opening every reference as XML of
the same template. Other roots, notably frigates, may delegate variation to LOD
resources, textures or other paths.

### Colors are a separate branch

`inspect-appearance-fields.py` inspects exact existing assets with bounded reads,
read-only SQLite and explicit missing/unsupported statuses. It does not generate
colors or infer selection semantics. Current field evidence:

- `textures/common/spacecraft/industrial/shared/freighter_proc.texture.mbin`
  (SHA-256 `04423fbfae79ca96bedca39d50bcdb1e42c1dfab320467e219fd3e0a969726c3`)
  has Freighter/Rock palette selectors, Primary/Alternative2/None color slots
  and painted/unpainted texture alternatives.
- `textures/common/weapons/multitool/multitoolbase.texture.mbin`
  (SHA-256 `c109d5135715ce87df29194b09b990a3e51bc89577fbc8481b51285d5a86c945`)
  uses Paint/Rock and Primary/Alternative1/None slots.
- The old freighter texture uses a different palette/slot configuration. The
  customisation palette table is a separate GcCustomisationColourPalettes asset;
  its existence does not establish the default procedural RGB selection formula.

Public signatures located texture Load and LoadFromDds candidates at `1893960`
and `1894020`; both exported successfully in 30 seconds. The inspected Load path
handles DDS/header/pixel loading, not a demonstrated seed-to-palette evaluator.
Record this rejected route rather than porting DDS decode as the color algorithm.
`procedural-texture-180383.tsv` reproduces stage `proceduraltexture`.

Different seeds are not guaranteed distinct appearances. The recovered descriptor
initializer maps both `0` and `0x1000100000001` to `(1,0)`, producing the same
draw stream in this branch; a regression check covers 100 draws. This does not
prove their final colors or whole entities match, since other inputs can differ.
Conversely, the same numeric seed across different model categories is not a
universal ship/multitool/freighter identifier: the resource tree is also an input.

Next priorities: preserve model-list/child boundaries in a reference graph;
resolve referenced scene/material/texture assets; trace palette selection before
pixel loading; establish input seed channels at each category's creation path;
compare fixed-seed outputs in game. Only then build forward evaluators and bounded
configuration-to-seed searches. A complete recovery cannot be promised before
these gaps and per-build comparisons are resolved.

External evidence: `seed-analysis-180383/category-descriptors-reproduced.json`,
`appearance-fields.json`, `texture-signatures/` and
`acquisition-180383/proceduraltexture-export/`. No runtime delivery was attempted.

## Reward presets, resource graphs and palette arithmetic

All findings below concern build 180383 with the executable fingerprint stated
above. They are offline observations, not new bridge compatibility or delivery
capabilities. Proprietary XML, executable fragments and pseudocode remain external.

### A seed is an input, not a universal entity identifier

`inspect-seed-presets.py` catalogs the shipped reward table through read-only
SQLite, with a 32 MiB per-file limit and a 512-record ceiling. The inspected table
has XML SHA-256 `8ed7ae909e3cdffba01f02899aee4733d7d63c6c0fc4105ebea7cfce1b9b12d7`:
89 specific-ship records from one source. Duplicate reward IDs remain separate;
decimal uint64 seeds never pass through floating point. It does not access saves.

The Starborn Phoenix name resolves to reward `R_TGA_SHIP01`, whose model is
`MODELS/COMMON/SPACECRAFT/FIGHTERS/WRACERSE.SCENE.MBIN`, seed **6 (`0x6`)**, source
inventory class S and ship category Royal. Both `IsGift` and `IsRewardShip` are
true. Its customisation lists and procedural texture sampler list are empty.
This describes this build's reward definition, not every possible Phoenix save
representation. A remembered `0x1` must not override the inspected source.

Other special rewards use seeds 0 or 1 with different model resources. Twitch
specific-ship records also include class A with `IsGift=true`: that flag alone
does not imply class S. Keep resource, seed, preset inventory class, cost and
reward flags as independent fields. The source definition does not prove the
acquisition path will preserve each field at runtime.

### Dependency graph coverage

`build-appearance-graph.py` follows explicit scene/descriptor/material/texture
references, with 256 nodes and 64 MiB XML defaults. It records missing assets,
duplicate archive ambiguity and exhausted budgets. DDS assets are indexed without
decoding pixels. The native descriptor lookup's `.SCENE.` / `.DESCRIPTOR.` literals
support a scene-to-descriptor lookup candidate; diffuse texture sibling filenames
remain candidates, not established loader semantics.

The mixed special/Pirate/multitool graph stopped at its node ceiling: 256 nodes,
671 edges and 11,363,168 XML bytes. Narrower root investigations completed:

| Root | Nodes | Edges | XML bytes |
| --- | ---: | ---: | ---: |
| Phoenix `WRACERSE.SCENE.MBIN` | 39 | 50 | 1,052,468 |
| Pirate freighter | 255 | 567 | 7,142,052 |

The Phoenix graph has 13 inspected XML assets, 17 indexed binaries and nine
unindexed lookup candidates. Its root descriptor candidate is absent. This
supports investigating a fixed resource/preset path; it does **not** prove the
whole model ignores seeds, uniforms or dynamic recoloring. Missing optional
siblings are not extraction failures. Graph edges do not establish load precedence
or descriptor traversal order.

### Palette branch recovered from native candidates

The bounded arithmetic scanner checks instruction boundaries in at most 1 MiB
of executable text. Region `600000..660000` contained 81 raw multiplier matches
and 19 checked unwind-fragment candidates. Sharing an RNG constant does not prove
shared semantic identity. Exporting four selected candidates succeeded for
`628e80`, `629040`, `62c480` and failed for `61f4e0`; the exporter log supplies no
more specific cause. Do not classify that failure as a disk failure or silently
retry it. The first two successful candidates are not established color generators.

Candidate `62c480` initializes the recovered multiply/carry state and fills
66 palette families, five RGBA values each, through `62cbb0`. Each output row
occupies `0x70` bytes; the total `0x1ce0` matches the generation-task color-buffer
copy already traced. The shipped `basecolourpalettes.mbin` also has 66 families.
Candidate `2277f0` resolves a palette entry with a `0x410` row stride, corresponding
to 64 RGBA values followed by its color-count mode. Both new candidates exported.

For `62cbb0`, let A and B be the low words from two consecutive RNG advances,
`row = A >> 29` and `column = B >> 29`. The isolated initial index is:

| Color-count mode | Index |
| --- | --- |
| `_1` | `0` |
| `_4` | `((row >> 2) * 8 + (B >> 31)) * 4` |
| `_8` | `column` |
| `_16` | `((B >> 30) + (row >> 1) * 8) * 2` |
| `All` | `column + row * 8` |

The lookup remaps retry indices into that mode's allowed cells. It falls back to
collection set `0x10`, variant zero when the requested variant is absent or the
mode is Inactive. This collection set is not the palette-family enum value 16.
The row generator compares RGB squared distance against prior colors, excluding
alpha, and increments the index modulo 64 for at most 64 retries. The inspected
threshold bytes at `4b240cc` are `0000802f`, float32 `2^-32`. Exact float32 operation
order and source RGB precision still matter; do not substitute an arbitrary
perceptual distance or rounded display color.

Generation is not independent for every family. `62c480` stores the state just
before Paint (index 10), then reuses it for Freighter (index 56). Other families
are regenerated with mixed child seeds, including race and biological palettes.
Consequently, applying the original entity seed directly to each palette would
produce an incomplete evaluator even if the index arithmetic were correct.

`procedural-seed-primitives.py --palette-mode All` implements only the initial
index draws; `palette_lookup_index` implements the bounded lookup remap. Neither
implements RGBA, retries, collection fallback, caller seed propagation or complete
color-buffer generation. Six primitive tests pass; the existing independent
assembly replay still covers the three earlier integer windows for 1,005 seeds,
not the new palette branches. Three asset-inspector tests cover uint64 precision,
duplicate rewards, graph cycles, explicit budgets and archive ambiguity.

A direct-caller scan found 20 instruction-checked edges to `62c480`. All 20 caller
fragments exported successfully in 40 seconds, including candidate `6388f9` near
generation-task processing. Some exports begin mid-function and contain unknown
register inputs; their recovered parameter lists are not safe ABIs. Per-category
call-site input correlation remains outstanding.

Public schema cross-checks, pinned to MBINCompiler commit
`0e81c91aa51c78d7aa3e298e9ba7532bd0c7c49c`:
[GcPaletteData](https://github.com/monkeyman192/MBINCompiler/blob/0e81c91aa51c78d7aa3e298e9ba7532bd0c7c49c/libMBIN/Source/NMS/GameComponents/GcPaletteData.cs)
defines the six mode values and 64-color layout;
[TkPaletteTexture](https://github.com/monkeyman192/MBINCompiler/blob/0e81c91aa51c78d7aa3e298e9ba7532bd0c7c49c/libMBIN/Source/NMS/Toolkit/TkPaletteTexture.cs)
defines palette-family and Primary/Alternative color-slot enums. Schema agreement
does not itself verify native behavior or a complete seed-to-appearance algorithm.

Reproducible export seeds are the `procedural-generation-arithmetic`,
`procedural-palette`, `procedural-palette-lookup` and `procedural-palette-callers`
`-180383.tsv` files. External evidence under `seed-analysis-180383` includes
`reward-seed-presets-v2.json`, `appearance-graph-phoenix.json`,
`appearance-graph-pirate.json`, `generation-arithmetic.json`,
`palette-row-assembly.json` and `palette-generation-callers/`. The four new native
export stages are searchable in the research index, with failures retained.

Still required for complete recovery: preserve descriptor model-list boundaries
and traversal/filter semantics; resolve collection loading and float32 RGBA;
correlate each creation route's seed channels, overrides and customisation;
compare forward outputs against the game; then implement bounded inverse search.
Natural spawn addresses and acquisition class/slots remain separate problems.
No complete inverse generator, arbitrary seed preview or live equivalence is
claimed by this checkpoint.
