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
