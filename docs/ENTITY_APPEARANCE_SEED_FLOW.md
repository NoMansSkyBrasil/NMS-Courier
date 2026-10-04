# Entity appearance seed flow: ships, tools, fleets and NPCs

Updated: 2026-10-04. Offline build 180383, executable SHA-256
`671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.
Read the [seed handoff](SEED_RESEARCH_HANDOFF.md) and
[shared algorithm research](PROCEDURAL_SEED_RESEARCH.md) first.

This continuation follows native input propagation, rather than assigning a
plausible seed to a model because its screenshot looks similar. It recovers
specific branches and field associations. **It does not complete the five
categories' appearance algorithms or establish a callable runtime interface.**
No game process, installed patch, bridge, save or archive was changed.

Later continuation: [appearance context](APPEARANCE_CONTEXT_RESEARCH.md) identifies
freighter setter `5417f0`: incoming resource `d0` -> source `170` and incoming
palette pair `160/168` -> source `200/208`. Caller `aea590` uses this in numeric
update-message branch `0x19`. This extends the static copy chain, but does not
establish the serialized owned HomeSystemSeed association discussed below.

Notation: bare RVAs and byte offsets/strides are hexadecimal. Counts, byte sizes
and array lengths in prose are decimal; enum/slot values below use `0x` explicitly.

## Shared appearance inputs

The same model can reach different paths depending on whether it has natural
descriptor choices, explicit descriptor IDs, an assembled preset, custom colors
or texture overrides. Class, inventory and acquisition semantics remain separate.

| Static path, RVA | Recovered behavior | Remaining boundary |
| --- | --- | --- |
| `1149020` -> `2d63670` | With zero explicit descriptor count at customisation offset `14`, builds the default descriptor input from the filename and seed pair at offset `0`. | Caller must supply the correct resource and seed pair. |
| `1149020` -> `2d636b0` | With a nonzero count, supplies explicit descriptor IDs instead. The previously inspected helper uses a disabled/-1 palette seed in this route. | Do not reuse the natural branch's draw schedule. |
| `1149fe0` -> `637db0` | Forwards explicit texture options at `20`/`28`, optional palette block at `1d70` when flag `71` is set, and another mode flag at `70`. | Four trailing 8-byte fields at `3ac0..3ad8` remain unnamed. |
| `1149350` | Resolves selected group IDs through customisation data, creates uppercase descriptor IDs and handles conditional additions including `CHESTVAN_XL/XR`. | A UI group ID is not necessarily a raw scene descriptor ID. |
| `11499c0` | Rebuilds texture-option input from selections and the table at global offset `d5e48`. | The original TSV called this color postprocessing; that label was rejected. |

The common output block has 66 palette families, a `70`-byte stride per family
and five RGBA entries. Passing this block is not itself a complete material or
pixel renderer. Texture alternatives, color bindings, masks and shaders still
determine the visible surface.

### Named customisation data and explicit colors

The current executable's `2a899c0` field processor identifies the input to
`11480a0` as `GcCharacterCustomisationData`. Its offsets are:

| Field | Offset | Row shape observed at the consumer |
| --- | --- | --- |
| BoneScales | `0`, count `8` | 24-byte rows |
| Colours | `10`, count `18` | 32-byte rows |
| DescriptorGroups | `20`, count `28` | 16-byte IDs |
| PaletteID | `30` | 16-byte ID |
| TextureOptions | `40`, count `48` | 48-byte rows |
| Scale | `50` | float32 |

Do not confuse the **source schema** above with the larger working object's
offsets. In particular, the source's first vector is BoneScales, not textures.
The wrapper `2a126e0` embeds this type inside a larger record; its whole record
is not itself a `GcCharacterCustomisationData` instance.

`11480a0` copies its incoming 16-byte seed pair to the working object, resolves
descriptor selections and texture selections, and looks up the palette using
PaletteID plus the category argument via `5a6210`. For each explicit color:

1. Search that palette's allowed RGBA entries. Stop at the first entry for
   which all four absolute component differences are at most `1/256`.
2. Otherwise keep the entry with the smallest sum of four squared component
   differences. Comparisons are float32; strict improvement preserves the
   earlier entry in a distance tie.
3. Write the result at working-object offset
   `90 + 70 * paletteSelector + 10 * colorSelector`, as calculated by the
   inspected integer indexing expression. The selectors' names must not be
   inferred from the numeric offset alone.

The tolerance is backed by four float32 literals at `4b2ec80..4b2ec8c`.
The initial best distance at `4b26f90` is float32 maximum.
This operation quantizes an explicit color; it does not find another seed.

The final 66-by-five loop tests the edited alpha against **exactly 1.0**
(`4b26778`, bytes `0000803f`). On equality it copies the edited RGBA to the
working palette block at `1d70`. Otherwise this setter copies the corresponding
sample from the fixed working-object block `1360..13a0`, not from an invented
zero-alpha rule or an arbitrary fresh RNG draw. The semantics of that fallback
block need its initializer/context. In the freighter overlay described below,
the fallback is instead the freshly prepared per-family palette.
The working offset equals `0x90 + 43 * 0x70`; index 43 in the existing hash-pinned
base-table report is Custom_Torso. This is a table/order clue, not proof that
the fallback block was generated from a torso seed or initialized by this setter.

Scale is copied to working offset `3a50`; category argument zero clamps it to
`[1.0, 1.100000023841858]`. Other categories take a different branch. This is
not a universal maximum on fauna, ships or NPC scale.

## Ships

### Owned ship mesh refresh

The public signature candidate for UpdateMeshRefresh uniquely matched `562d10`.
Static code reads the active ship index from global offset `23be0` and a resource
entry from `23820 + index * 48`. Relative to that entry:

- `0`: optional explicit-part string;
- `10`: model filename;
- `30`/`38`: resource seed value/enabled pair.

With no part string, it reaches `2d63670` using that resource seed. With a part
string it reaches `56aff0` and `2d69d00`. The part parser space-tokenizes input,
removes a trailing `LOD` plus one digit, uppercases ASCII and appends bounded
32-byte descriptor IDs. This is explicit selection, not inverse seed recovery.

The generated task then receives a different object:

```text
customSlot = index + 3   if index <= 5
customSlot = index + 11  otherwise
customObject = global + 0x28350 + customSlot * 0x3ae0
task = 1149fe0(customObject, handle, resourceFilename)
```

`55a0e0` independently uses the same slot rule for filenames under
`MODELS/COMMON/SPACECRAFT`. The nonmatching-resource branch calls `560780` and
is not recovered here. The writer described next connects the two seeds in one
owned-resource path; observing it does not prove they agree in every path.
This owned-ship path also does not establish every NPC,
expedition offer, Living ship or Corvette path.

The SpawnNewShip signature candidate at `55a570` was exported. Its downstream
`55b2b0` primarily handles post-spawn work; treating it as the procedural model
generator was rejected.

### Source writer connecting an owned ship's inputs

Following direct callers of `11480a0` identifies root `55cb20`. In its successful
resource assignment branch, it copies the incoming 16-byte seed pair into
`global + 23850 + shipIndex * 48`, the Resource.Seed pair read above. It then
uses the same pair as the setter's sixth argument for
`global + 28350 + customSlot * 3ae0`, using the same `index + 3/index + 11` rule.
The setter copies that pair to the custom object's beginning.

The branch supports both absent customisation, which creates a default input,
and an explicit customisation input. Consequently **the two seed channels are
equal at this writer, while explicit parts/colors can still override output**.
This closes a concrete propagation link, not the whole owned-ship lifecycle.
The subsequent [texture selector continuation](TEXTURE_SELECTOR_EMULATION.md#owned-resource-input-chain)
connects the default working seed through descriptor preparation/task copying
to texture selection. Explicit descriptors and supplied edited palettes differ.

The existing purchase-state export `8e8830` also writes the custom-object seed.
It chooses an enabled seed pair returned by `183cd20`; otherwise it uses the
purchase object's pair at `10`. The returned resource field and complete
acquisition branch require separate naming, so do not equate this fallback
unconditionally with every expedition or NPC ship's final seed.

## Multitools

`13f6d30`, containing the `ATLASMULTITOOL` literal, routes the ordinary visual
task through working object `global + 2f910` and filename at `global + c218`.
`1147a90` reaches that same task input during a separate update transition.

Numeric branches `0x13` and `0x14` instead reach `140fa70` and `140fbc0`. Both look
up an explicit record via `54f2f0`, load a resource table and construct a temporary
customisation object before `114a160`, `1149350` and `1149fe0`. The second path
uses the table at `global + 307840`; it compares two 8-byte ID halves in 32-byte
records. These enum values are kept numeric until independently associated with
the current named enum. No Staff/rod label is proven by proximity alone.

The earlier `171f340` palette caller obtains a seed from planet context before
the shared generator, whereas the owned/customised task uses its own working
object. The offer, owned and accessory paths must be connected separately.
`156d470` contains `FISHINGFLOATSCENE`; this is an accessory lead, not a universal
multitool generator. No complete tool-specific color/texture evaluator is claimed.

### Owned-tool seed writers

Root `553600` selects one of up to six 800-byte records. In its active branch it
resets `global + 2f910`, copies the record's 16-byte seed pair at `2c0`, and passes
it to `11480a0` along with customisation at `2d8`, category argument `2` and
mode byte `2bd`. It separately resolves the record's resource handle at `290`
and writes its filename to `global + c218`. The same object/filename subsequently
reach the owned-tool generation task in `13f6d30`.

Root `551630` prepares a record using another input object's seed at `2b0` and
customisation at `2c8`, builds a temporary custom object and reaches either
`2d63670` or `2d636b0` depending on explicit descriptor count. These are concrete
owned-tool associations, not an identification of every offer record or staff
part. Root `5da8f0` also passes category `2`, but selects between input seed pairs
at `218` and `248` depending on flag `250`; its exact acquisition role remains
unnamed. Do not merge these layouts or assume one pointer always contains the
same kind of seed.

## Freighters

PE chained unwind information identifies `549380` as the root of fragment
`5493db`. Exporting the root recovers the shared `param_1` object instead of
inventing origins for the fragment's uninitialized registers.

| Input in this object | Static consumer |
| --- | --- |
| Filename pointer `2e8` | Empty filename returns without a generation task. |
| Optional part string `2d8` | `56aff0`/`2d69d00` explicit path when nonempty. |
| Resource seed pair `308` | Default descriptor path through `2d63670`. |
| Optional palette seed `2b0`, flag `2b8` | Base palette generator `62c480`, mode `0x10` (All), 66 families. |
| Three palette indices per mapped family, starting `480` | NPC/noncustomised branch: indices below 64 overwrite prepared palette samples. |

If flag `2b8` is disabled, the code copies `1ce0` bytes from the current palette
object at `global + 72afb0`. If enabled, it generates that block from the object's
palette seed using the palette collection at context offset `520ac0`.
This is a verified static seed distinction, not yet proof of the source field's
name or of every offer's inputs.

With the identifier string at `54` empty, the code takes a customisation route.
A filename containing `PIRATE` selects custom slot `0x17`; otherwise slot `0xf`.
Each sample whose edited alpha equals 1.0 replaces the generated/context sample;
the remaining samples retain the prepared per-family palette. It forwards
the resolved descriptor seed to that custom object, sets the override flag,
adds `PLAYERFREIGHT` data and calls `1149fe0`.

The other branch uses the explicit palette indices mentioned above and calls
`637db0` directly. Thus a single model seed is insufficient to describe all
freighter colors, even before texture and material composition.

Current `GcFreighterSaveData` field processor `2a39b60` separately declares
Resource at `450` and HomeSystemSeed at `4c8`/`4d0`. These are serialized-data
offsets, **not the runtime object's offsets above**. No complete copy chain from
HomeSystemSeed to runtime `2b0` has been proven.

### Upstream refresh and resource copy continuation

The 2026-10-04 follow-up located the direct call to `549380` at `5425e1`.
Its unwind fragment begins `542480`, but the chained root is **`542440`**.
The fragment-only export initially left register origins unresolved; exporting
the root recovers the object parameter. This refresh rejects an empty filename
and prepares its auxiliary string before calling the appearance root.

Three direct callers of `542440` were located: `546290`, fragment `549ef9`
(chained root `549af0`), and `13b7340`. The latter contains a staged initialization
switch, not a complete identified natural seed generator. `546290` manages
activation/transforms and does not close the palette seed's source chain.

The state update at `549af0` compares source and cached appearance inputs. When
they differ, it sets a refresh flag and performs these copies in the same object:

| Source | Cached field used downstream | Evidence |
| --- | --- | --- |
| `200` / enabled flag `208` | `2b0` / `2b8` | Direct pair copy before appearance refresh. |
| Resource-like block at `170` | Resource-like block at `2d8` | Copy helper `211870`; source seed pair at `1a0`/`1a8` maps to `308`/`310`. |
| Second resource-like block at `1b8` | Block at `320` | Same helper; its role is not identified as the freighter model. |
| Index block `240..268` | Index block `480..4a8` | Six 8-byte copies, matching the existing explicit-color index path. |

The inspected helper `211870` copies string-like members at relative `0` and
`10`, processes the member at `20` through another helper, and copies **all four
32-bit words at `30..3c`**, including the resource seed value and enabled flag.
The equality helper `1c79230` compares strings, the member at `20`, the uint64
seed at `30`, enabled byte `38`, and member `40`. These give field propagation
evidence, not verified native type names or callable ABIs.

`549af0` checks source/cached palette seed and resource equality, then index
differences, before setting the refresh flag. It eventually calls `542440`
when its refresh flag is set. This is concrete cache/change-detection evidence;
it must not be generalized into a cause of the earlier class-C offers. Class
generation and save field ownership remain separate investigations.

The previously missing link is now narrowed to **the writer of source fields
`200`/`208`**. No current evidence names those fields HomeSystemSeed or proves
their copy from serialized `GcFreighterSaveData`. Do not substitute a similarly
named field from an old build.

Selections:
[caller fragment](../runtime/research/priority-freighter-source-180383.tsv),
[caller root](../runtime/research/priority-freighter-source-root-180383.tsv),
[upstream callers](../runtime/research/priority-freighter-upstream-180383.tsv),
[copy/equality helpers](../runtime/research/priority-freighter-resource-copy-180383.tsv).
External stage names are `freightersource20261004`, `freightersourceroot20261004`,
`freighterupstream20261004`, and `freighterresourcecopy20261004`, all under
`acquisition-180383`. Seven selections exported successfully, with no export
failures. Raw instructions and pseudocode remain external. Direct-call scanning
does not enumerate indirect callers or every split-function edge.

## Frigates

### Named channels and reward propagation

`GcFleetFrigateSaveData` field processor `2a39350` names:

| Channel | Serialized value/flag offsets |
| --- | --- |
| ForcedTraitsSeed | `0` / `8` |
| HomeSystemSeed | `10` / `18` |
| ResourceSeed | `20` / `28` |

Current reward processor `24eebb0` associates `GcRewardSpecificFrigate` with
FrigateSeed at `30`, SystemSeed at `38`, AlienRace at `40`, FrigateClass at `44`
and UseSeedFromCommunicator at `4c`. Here **FrigateClass denotes the frigate
type enum**, not a recovered C/B/A/S rank rule. Gift/reward flags are separate.
Caller `f28010` forwards these fields into `8e5180`.

For that reward path, let `F` be FrigateSeed, `S` SystemSeed and `U` the first
uint64 at an optional source pointer supplied by the caller. The assembly
at `8e51c1..8e5220` establishes:

```text
effectiveResourceSeed = F
if sourcePointer exists and F == 0:
    x = wrap64(U * 0x9DDFEA08EB382D69)
    effectiveResourceSeed = wrap64((x XOR (x >> 47)) * 0x9DDFEA08EB382D69)

paletteSeed = S if S != 0 else F
```

The fallback does **not** substitute the newly derived resource seed for `F`
in the palette expression. With source present, F=0 and S=0, the inspected
path can use a derived resource seed and an enabled numeric-zero palette seed.
This is a separate two-multiply mixer, not the full structural hash-combination
routine and not an extra draw from the descriptor PRNG.

### Mathematical inverse of this specific mixer

This recovered forward component can be inverted without enumerating seeds.
The multiplier is odd, so its inverse modulo 2^64 is
`0xDC56E6F5090B32D9`. A 47-bit XOR-right-shift is its own inverse on a uint64
because two such shifts exceed the word width. For desired mixed value `Y`:

```text
z = wrap64(Y * 0xDC56E6F5090B32D9)
x = z XOR (z >> 47)
U = wrap64(x * 0xDC56E6F5090B32D9)
```

This is a mathematical deduction from the instruction-checked forward formula,
**not an observed native inverse function**. The identity holds over all uint64
values; eight arithmetic round trips additionally checked zero, one, uint64
maximum, the high bit, two mixed-width boundaries and two ordinary seeds.
For example, U=1 produces `0x29EDBE24F43DFBC6`, whose inverse returns U=1.

It inverts only the optional-source fallback when F=0. It does not invert
descriptor choices, palette colors, class or a whole frigate. Whether the caller
allows this source value to be selected independently remains unresolved.

Reproduce the arithmetic check with Python's standard library only; it does not
read the game or any save:

```python
mask = (1 << 64) - 1
k = 0x9DDFEA08EB382D69
inverse = pow(k, -1, 1 << 64)
assert inverse == 0xDC56E6F5090B32D9
for source in (0, 1, mask, 1 << 63, 0x1AD0003900054,
               0x0123456789ABCDEF, 0xFFFFFFFF00000000, 0xFFFFFFFF):
    x = (source * k) & mask
    mixed = ((x ^ (x >> 47)) * k) & mask
    z = (mixed * inverse) & mask
    recovered = ((z ^ (z >> 47)) * inverse) & mask
    assert recovered == source
```

If AlienRace is greater than 2, the first MWC output initialized from the
effective resource seed selects a race with `high32(draw * 3)`. Otherwise
the supplied race is retained. This initializes a temporary stream; it does
not prove that subsequent descriptor selection resumes from that race draw.

`8e5180` calculates the palette with `62c480` from the **paletteSeed** pair.
The visual cache/preparation call `1721820` matches category/race records,
forwards the **resource seed** to `2d63670`, then passes the computed palette
block into `637db0`. Cached resources can be reused when seed pairs agree.
Material and texture composition remain necessary for the final image.

### Rejected model-selector interpretation

`521d50` was initially labeled model selection in its export configuration.
Inspection disproved that: it generates attribute ranges, selects/adds traits,
handles trait seeds and prepares fleet state. It contains eleven initial MWC
draws for bounded values followed by conditional trait branches and stream
resets. Some apparent float constants are integer enum bit patterns in the
decompiler, not meaningful floating-point frigate types. Do not use this function
as a seed-to-geometry evaluator. Conventional, special and Living frigates
still need their resource/type paths distinguished.

## NPCs

`GcNPCComponentData` named processor `2414a20` exposes Race, HologramEffect,
IsOldStyleNPC, HasChatter, IsMech, AlternateAnims and Tags. **This component
declaration does not contain the appearance seed.** Race alone cannot decode
an NPC, and registry code `1047a60` is not itself an appearance generator.

The corpus declarations add concrete context:

- NPCSpawnTable has nine race entries, race-specific model resources and scale
  entries, 24 UniqueNPCs and 60 PlacementInfos.
- NPC preset customisations contain 13 presets and a declared but empty
  DescriptorGroupFallbackMap; seed-only assumptions do not cover unique/preset characters.
- NPCColourTable contains 17 groups, each declaring Primary, Secondary and
  Rarity. Current named field processors map Primary to `0`, Secondary to
  vector `10`/count `18` and Rarity to float `20`.

The exact asset-path reference reaches `1676130` -> `167b540` -> `1f29e10`.
This path loads/merges table Groups from files. It does **not** expose which RNG
chooses the group or how Rarity is interpreted during character generation.
The structural hash at `240dec0` and the component registry table are other
leads, not seed algorithms. `5f9120` builds two resource instances and reads
NPC metadata; it remains an unclassified construction/preview path rather than
proof of natural NPC spawning. `b04170` and root caller `b03b20` likewise lack
a proven category association.

The registry vtable at `4abf6e0` led to `10477c0`, `1047700` and `1047980`.
Inspection recovered update/timer processing and vector batching, not the
appearance seed constructor. Three adjacent leaf entries (`10474e0`, `10474f0`,
`1047500`) only read 16-bit registry properties. Keep their semantic method
names unknown. They cannot replace the missing natural NPC generation route.

NPCs currently have the largest native input-propagation gap in this priority
set. Do not claim the table's presence deciphers their appearance.

## Seeds requested by the user and future preview correctness

The user's target is a natural seed that produces selected parts and colors,
then a delivery that uses it consistently. Recoloring while preserving a seed
is a separate mode. The forward input tuple must retain:

```text
build fingerprint + category/subcategory + resource
+ model/resource seed + palette/context seed(s)
+ descriptor/filter mode + explicit customisation and texture state
```

The unresolved source channels above must be recovered before an inverse search
can guarantee matching output. A bounded search against the existing partial
descriptor evaluator can produce **candidates**, not verified whole appearances.
Different seeds can collide; some explicit combinations may have no natural
seed. A recipe needing a separate color seed cannot be promised through a
delivery accepting only one seed.

The future frontend needs category adapters sharing descriptor/material work,
while retaining these different input paths. Existing preview code is not
upgraded or relabeled as complete by this research. Full geometry decoding,
texture-option selection, DDS/mask composition, shaders, category fixtures and
game comparison remain independent gates. No new frontend feature is delivered
in this offline investigation.

## Reproduction and evidence

All exports remain under `E:\NMS-Courier-Research\acquisition-180383`.
Each stage has `run-<stage>.json`, `<stage>-export/manifest.tsv` and pseudocode.
Use the manifest's actual status, not the candidate label or launcher exit alone.
The thirteen stages below have 69 successful export rows, 69 distinct selected
RVAs and no export failures. Three repeat prior exports, leaving 66 additional
navigation candidates. `priority-entity-verification-20261004.json` checks every
selection hash, manifest/status, requested row and pseudocode-file presence.
The new `priority-*.tsv` selections are pinned to LF by `.gitattributes` so
Windows checkout conversion does not invalidate those byte hashes.

| Stage | Repository selection | Rows |
| --- | --- | --- |
| priorityentityentries20261004 | [entries](../runtime/research/priority-entity-entries-180383.tsv) | 8 |
| priorityentitymetadata20261004 | [metadata](../runtime/research/priority-entity-metadata-180383.tsv) | 9 |
| priorityentityfields20261004 | [fields](../runtime/research/priority-entity-fields-180383.tsv) | 9 |
| priorityentityfieldbodies20261004 | [field bodies](../runtime/research/priority-entity-field-bodies-180383.tsv) | 8 |
| priorityentitylinks20261004 | [links](../runtime/research/priority-entity-links-180383.tsv) | 8 |
| priorityentitymodels20261004 | [models](../runtime/research/priority-entity-models-180383.tsv) | 5 |
| priorityentityinputfields20261004 | [input fields](../runtime/research/priority-entity-input-fields-180383.tsv) | 5 |
| priorityentityinputbodies20261004 | [input bodies](../runtime/research/priority-entity-input-bodies-180383.tsv) | 3 |
| priorityentitysplitroots20261004 | [split roots](../runtime/research/priority-entity-split-roots-180383.tsv) | 3 |
| priorityentitynamedbodies20261004 | [named bodies](../runtime/research/priority-entity-named-bodies-180383.tsv) | 2 |
| prioritynpccolourloader20261004 | [NPC table path](../runtime/research/priority-npc-colour-loader-180383.tsv) | 1 |
| prioritynpccomponentfactory20261004 | [NPC component factory](../runtime/research/priority-npc-component-factory-180383.tsv) | 3 |
| prioritycustomisationsources20261004 | [customisation source writers](../runtime/research/priority-customisation-sources-180383.tsv) | 5 |

Export commands reuse Acquisition180383 with `-noanalysis`, two CPUs, 4 GiB
heap, 20 GiB reserve, 180/360-second outer limits and 30 seconds per candidate.
The configs intentionally preserve rejected initial labels for provenance;
the interpretations in this note supersede them.

Additional evidence under `E:\NMS-Courier-Research\seed-analysis-180383`:

- `priority-entity-entry-20261004/`, `priority-entity-fields-20261004/` and
  `priority-named-inputs-20261004/`: signature/metadata candidates and input hashes.
- `priority-visual-callers-20261004/`: bounded direct-call provenance.
- `priority-frigate-arithmetic-20261004.json`: instruction-checked fallback,
  palette/race branches; fragments `8e5180` and `521d50`.
- `priority-customisation-constants-20261004.json`: bounded fragments and
  raw literal windows, including alpha=1, the scale cap and color tolerances.
- `priority-split-unwind-reproducible-20261004.json`: four chains linking
  split fragments to their roots. The earlier inline chain report is retained.
- `npc-colour-loader-20261004/`: exact asset-path reference, not a seed consumer.
- `npc-colour-groups-20261004.json`, `priority-npc-declarations-20261004.json`:
  selected corpus declarations, archive attribution and MBIN/XML hashes.
- `<rva>-priority-names-20261004.json`: bounded ASCII field resolution and
  input pseudocode hashes.
- `priority-npc-registry-vtable-20261004.json` and
  `priority-npc-registry-getter-windows-20261004.json`: selected registry slots
  and bounded raw windows for leaf getters.
- `priority-customisation-source-callers-20261004/`: 27 instruction-boundary-
  checked direct edges in 13 caller fragments; indirect edges remain unknown.
- `priority-customisation-source-roots-narrow-20261004.json`: five selected
  caller fragments and chained roots, including `551630`, `553600`, `5ddfa0`.

The fragment inspector now resolves up to 16 PE chained unwind records and
rejects cycles, invalid flags and section escapes. Reproduce the root discovery
with `inspect-native-fragments.py --rva 5493db --rva b03e1b --rva 167b627
--rva 2a89b77`, the pinned executable/hash and a new external output path.
Five synthetic inspector tests cover these parser boundaries, not game behavior.
The acquisition scanner's new `--literal-name` supports separate bounded ASCII
asset-path lookups; its LEA matches remain potential references, not verified APIs.

Failures and limitations: combined type lookup hit the global 64-reference cap;
names absent under old labels required current metadata names instead. A broad
`2a15900` pseudocode exceeded the fixed 256-name-reference bound and was left
unresolved; bounded field processors were used instead. Metadata hashes,
serialization wrappers and table loaders were rejected as appearance generators.
Selecting leaf `10474e0` as an unwind fragment failed with `Target has no
containing unwind range`; the dependent report read then failed because no
report was produced. Bounded raw windows instead confirmed the leaf getter.
The six-caller fragment request exceeded the fixed 16-KiB fragment bound at
`572cea`; a narrowed five-caller request succeeded without raising the limit.
Two reads initially used the wrong export stage for `114aca0` and `1721820`;
their existing manifests located the preserved files. A guessed caller-tool
filename was absent; the repository map identified `scan-native-callers.py`.
Another literal wildcard argument produced Windows OS error 123 during a palette
lookup; reading the existing selected JSON directly resolved it without a rerun.
No device/storage failure, disk repair, D: access, BitLocker change or re-extraction
occurred. Runtime support and complete seed inversion remain unverified.

## Exact continuation point

The [owned-input continuation](SEED_RECURSION_AND_OWNED_INPUTS.md) now connects
`CurrentFreighterHomeSystemSeed` directly through owned loader `542910` to the
palette cache; the update-message association alone is no longer the best route.
Use its ledger for remaining acquisition/preset inputs and material context gaps.

Read [the texture continuation](APPEARANCE_TEXTURE_SEED_FLOW.md) before following
the third item below. It resolves the worker root and rejects readiness/cache
helpers as random selectors; the option-list writer remains the next target.

1. Start from the source writers above, not another bulk extraction. Recover
   upstream constructors/copy paths into freighter runtime palette seed `2b0`
   and the tool-record seed pairs, retaining branch-specific layouts.
2. Connect natural NPC spawn/unique-preset selection to the resource and palette
   consumers. Registry updates and NPCColourTable loading are rejected shortcuts.
3. Follow the working palette fallback block's initializer and texture-option
   processing before turning a correct base-palette trace into a whole image.
4. Keep current evaluators labeled partial. Exact-build selected descriptor,
   palette and texture fixtures from the game remain a later validation gate;
   no amount of agreement between our ports replaces those fixtures.
