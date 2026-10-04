# Planet and fauna seed flow: recovered components

Investigated: 2026-10-04. This resumes the user-requested procedural algorithm
investigation. Scope: offline executable analysis and documentation only.
Build: 180383; executable SHA-256:
`671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.
No game execution, appearance tests, delivery, save editing or asset extraction.

Read [the shared primitives](PROCEDURAL_SEED_RESEARCH.md) and
[the method/handoff](SEED_RESEARCH_HANDOFF.md) first. This note adds actual
seed propagation, named field associations and rejected leads. It does not
claim complete recovery of every category or a whole appearance oracle.
All RVAs below are offline candidates, not callable runtime interfaces.

## Planet generation divides the random streams

The public signature candidate `cGcPlanetGenerator::Generate`, RVA `168ce60`,
reads a 64-bit value at input `+0x20` with an enabled byte at `+0x28`. These have
the previously recovered seed initialization semantics. The value/flag pair is
also copied to output `+0x3220` and `+0x2ae0`; the enclosing input/output field
names have not been independently resolved yet.

Its native loop derives **26 child seeds in 13 iterations**, two children per
iteration. Each child consumes two MWC draws and applies the known 64-bit mixer.
The derivation loop therefore consumes 52 parent draws before downstream work.
This count describes this entry path, not every procedural generator in NMS.

Conceptually, with unsigned wraparound and `next`/`mix` defined in the shared
research, the observed seed array is:

```text
state = initialise(input_seed, enabled)
for pair in 0..12:
    first_draw = next(state)
    second_draw = next(state)
    children[2*pair] = mix((second_draw << 32) | first_draw)
    first_draw = next(state)
    second_draw = next(state)
    children[2*pair+1] = mix((second_draw << 32) | first_draw)
```

Both entries are enabled in the derivation loop. Before many consumers, the
routine initializes generator fields `+0xba4/+0xba8` from one array entry.
Other consecutive calls share the already advanced state. Consequently, one
global stream advanced continuously through every feature would reproduce the
wrong schedule. A consumer may also initialize its own nested stream.

Selected **zero-based** child-array entries, resolved from stack offsets:

| Slot | Reset precedes | What is supported by inspected code |
| --- | --- | --- |
| 7 | `1699f90` | Builds output arrays at `+0x3200/+0x3210`; semantic category unresolved. |
| 8 | `169af70` | Calls `169a700`, then `169b360` for four collections of resource-placement entries. Conditional on an additional output object being present. |
| 9 | `169ba30` | Copies resource filenames, derives resource seeds, writes their value/flag at `+0x30/+0x38`, then calls `169cd40`. Category/collection names unresolved. |
| 10 | `169d4e0` | Public GenerateCreatureRoles candidate. Its own child streams are derived from the reset generator state. |
| 11 | `16a08b0` | Public GenerateCreatureSpawnData candidate. The observed scale/fur routine uses each role's seed, not a draw directly from this newly reset state. Do not infer that slot 11 affects appearance merely because the reset exists. |
| 17 | `1698a60` | Additional generator consumer, exported but its output category is not resolved. |

GenerateQueryInfo, candidate `168a680`, also derives child streams and performs
multiple resets, including one before GenerateCreatureRoles. It has a different
consumer sequence from Generate. Do not reuse stack labels or a query path's
schedule as if it were the full generation path.

Assembly evidence for Generate: `168ce60..168d75b`, fragment SHA-256
`f3f9d8263a8365ff8ef5f1e620f7576ba8c87bcc9e89bb364afb1ef898d1b729`.
The loop counter is `0xd`, its stride is `0x20`, and direct calls to roles/spawn
are at `168d527/168d562`. These checks establish the native branch/reset path;
they do not establish end-to-end rendered results.

## Creature seed, filters, resources and named fields

Following XML wrappers to their field processors resolved the previous raw
offsets. The ASCII property names are read from the same hash-pinned executable.
This is stronger field-name evidence than matching a historical struct by size.

| Structure / processor RVA | Offset | Native property association |
| --- | --- | --- |
| GcCreatureRoleData / `22a0600` | `0x518` | Description (GcCreatureRoleDescription) |
| GcCreatureRoleData | `0x580` | Filter, a 32-byte value, distinct from Description.Filter |
| GcCreatureRoleData | `0x5a0` | CreatureId |
| GcCreatureRoleData | `0x5b0 / 0x5b8` | Seed value / enabled flag |
| GcCreatureRoleDescription / `22a0d70` | `0x54 / 0x5c` | MaxSize / MinSize (GcCreatureSizeClasses) |
| GcCreatureRoleDescription | `0x50 / 0x58` | MaxGroupSize / MinGroupSize |
| GcCreatureRoleDescription | `0x64 / 0x40` | Role / ActiveTime |
| GcCreatureRoleDescription | `0x00` | Filter |
| GcCreatureData / `22fee30` | `0xa8 / 0xa4` | MinScale / MaxScale |
| GcCreatureData | `0x94` | FurChance |
| GcCreatureSpawnData / `22a2330` | `0x90 / 0x48 / 0x00` | Resource / FemaleResource / ExtraResource (GcResourceElement) |
| GcCreatureSpawnData | `0xc0 / 0xc8` | Resource.Seed value / flag, derived from the nested resource layout |
| GcCreatureSpawnData | `0xd8 / 0xf8` | Filter / CreatureID |
| GcCreatureSpawnData | `0x134 / 0x130` | MinScale / MaxScale; native name at `0x134` has a trailing space |
| GcCreatureSpawnData | `0x144` | AllowFur |
| GcCreatureSpawnData | `0x146 / 0x147` | SwapPrimaryForRandomColour / SwapPrimaryForSecondaryColour |
| GcResourceElement / `1c81100` | `0x10` | Filename storage |
| GcResourceElement | `0x20` | ProceduralTexture (TkProceduralTextureChosenOptionList) |
| GcResourceElement | `0x30 / 0x38` | Seed value / flag |
| GcResourceElement | `0x00` | AltId storage |

GcCreatureComponentData, reached through `22b7cc0 -> 22bffb0 -> 22c1720`, describes
scaling, axes, UI, effects and other component settings. It did **not** identify
the unknown runtime color-seed fields in the fragment discussed below. A runtime
component and its declarative component metadata are not interchangeable layouts.

FillCreatureSpawnDataFromDescription (`16a0a50`) copies:

```text
role.Seed       -> spawn.Resource.Seed
role.CreatureId -> spawn.CreatureID
role.Filter    -> spawn.Filter
```

GenerateCreatureSpawnData (`16a08b0`) iterates roles with stride `0x5d8`, produces
spawn records with stride `0x148`, and can replace filenames by CreatureID using
an additional loaded table. Thus identical numeric seeds with different resource
filenames, filters or loaded overrides need not produce identical appearances.
FemaleResource and ExtraResource are separate visual inputs; their full seed
derivation was not recovered by this field-name inspection.

## Recovered scale and fur decisions

At the start of `16a0a50`, a CreatureId lookup selects GcCreatureData. Let:

```text
m = creature.MinScale
M = min(creature.MaxScale, runtime_scale_cap)
a = role.Description.MinSize ordinal
b = role.Description.MaxSize ordinal
lo = m + float32(a) * 0.25 * (M - m)
hi = m + float32(b + 1) * 0.25 * (M - m)
state = initialise(role.Seed, role.Seed.enabled)
u1 = float32(double(next(state)) / 4294967295.0)
scale = clamp(lo + (hi - lo) * u1, m, M)
spawn.MinScale = scale
spawn.MaxScale = scale
u2 = float32(double(next(state)) / 4294967295.0)
spawn.AllowFur = (u2 < creature.FurChance)
```

This expresses the native operation order; exact reproduction must preserve
float32 intermediates and compiler instruction behavior. The scale cap is a
runtime global at RVA `527a93c`, not a file-backed literal. Its actual value and
all size-class ordinal names remain unresolved. Do not substitute a guessed cap
or infer size from the seed without the CreatureId data and role description.

The second draw is specifically a **fur permission** decision. This corrects
the previous generic "probability comparison" description. AllowFur does not
prove the final material visibly contains fur: renderer/material constraints
remain separate. The color-swap flags are now named, but their writers and the
palette consumer applying them are still missing from this recovered path.

## How initially unspecified environmental resource seeds are filled

The collection helper `169b360`, reached from planet slot 8, operates on source
entries of stride `0x168`. It consumes two generator draws and mixes them into a
helper seed **before** checking whether the source collection is empty. Inside
the loop it derives another seed for each entry and for each nested resource.
Thus skipping an empty call can already change later outputs within that stream.

Source entries have an optional pair at `+0xf0/+0xf8`. Its **field name remains
unresolved**; do not yet call it a model seed, placement seed or color seed.
When enabled, the candidate replaces the derived per-entry and per-resource
seed with the following combination of helper seed `p` and source value `q`:

```text
k = 0x9DDFEA08EB382D69
x = (p XOR q) * k
x = (x XOR (x >> 47) XOR p) * k
result = (x XOR (x >> 47)) * k
```

Operations are uint64 with wraparound. **The ordinary child draws are still
consumed before this override**, so replacing the formula alone would miss the
schedule. The result is written to nested GcResourceElement.Seed with enabled=1.
The enabled override reuses the same helper/source combination for that entry's
nested resources; the otherwise-derived per-resource seeds vary with the stream.
This describes native code, not a tested flora renderer.

The override's flag, constant, unsigned shifts and combination were checked in
the continuation fragment `169b41f..169ba0e`, SHA-256
`f28e50d4e16b10aebc3c95b6a28ec6d61c76ddc52d1ebfdbfa384d765506bbff`.
The two override sites occur after ordinary derivation at `169b716` and
`169b8c1`. Preserving that advancement is part of the recovered algorithm.

Slot 9's `169ba30` separately derives and writes seeds to resources before
`169cd40`. That helper retains resource filename, Seed, AltId and explicit
ProceduralTexture state, chooses different descriptor paths according to
flags, and eventually submits a task through `637db0`. In the branch where an
alternate seed is disabled and `param_12 == 0`, it derives an auxiliary seed by
applying the shared finalizer directly to Resource.Seed.value, without drawing
two new MWC values there, and passes both to `2d62120`. This is a concrete
connection from generated resource seeds into the existing descriptor pipeline.
The auxiliary seed's eventual color/texture role is not yet established.

Some branches copy an output palette-sized block (`0x1ce0` bytes) and call
`16a1570`; others take an alternate task path. That is a native palette/task
connection, not proof of the complete final color formula. The collection names,
source optional field and branch flags must be resolved before labeling this
as a general flora/mineral algorithm.

## Creature-related palette lead, still incomplete

Existing fragment `120755b` uses a lookup key at runtime object `+0x2310` and
copies 32 bytes from `+0x2330`. If byte `+0x2388` is enabled, it passes the pair
at `+0x2380` to palette generator `62c480`, with mode from `+0x2480`, 66 families
and output pointing to the runtime object. Assembly confirms those arguments.
It then constructs task inputs and calls `637db0`.

The disabled branch uses a 64-bit value at `+0x2330` for the subsequent formatted
value instead. These are **offset associations**, not a fully named creature
seed ABI. Both the root function and runtime enclosing layout remain unknown;
`unaff_RDI/RBP` in fragment pseudocode explicitly signal missing entry context.
Do not identify this optional field with a species/genus/secondary seed merely
because an export tool uses those labels.

## Rejected leads and remaining links

- Previous exports `229a410`, `229c280`, `22f7d70` are structural-hashing
  candidates, not appearance-generation functions. Their constants/defaults
  must not be ported as visual RNG behavior.
- `1227110` uses PET_ACC_NULL and PETACCESSORIES.SCENE.MBIN. It is a pet accessory
  generation path, not the whole creature body generator.
- `165a470` contains Seed, Randomise Seed, Generated Resources and Regenerate
  Resources UI labels. It is a debug resource-browser path, not evidence of
  natural planet generation. Its helper `165b530 -> 165b880` can still expose
  shared generation mechanics, but does not establish ecosystem behavior.
- Prepare entry `120a790` timed out after 30 seconds. Bounded continuation
  `120a7ac` decompiled, but lacks entry register context and did not resolve the
  unknown color channel. This is not repaired by inventing parameters.
- A combined direct-caller scan exceeded the fixed caller budget. It emitted
  no report. Narrowing to `1149fe0` succeeded (34 edges, 31 fragments); indirect
  calls and other split-function edges remain out of scope.

Next analysis should name the input of `168ce60`, the `0x168` source-entry
optional pair in `169b360`, and the resource/palette branch flags of `169cd40`.
Follow `169a700` for the four collection origins, then `2d62120` and `16a1570`
for auxiliary seed and palette effects. For fauna, recover the root and writes
feeding `120755b`, and consumers of both named color-swap flags. These are
algorithm/call-order questions, not a request to extract more assets or build UI.

## Reproducible evidence

External root: `E:\NMS-Courier-Research\acquisition-180383`. Each stage has
`run-<stage>.json` and `<stage>-export/manifest.tsv`, pseudocode and error files.
All launcher reports returned completed/exit 0; **one individual export failed**.
Inspect manifests rather than equating process exit with successful decompilation.

| Stage | Exported / failed | Selected configuration |
| --- | --- | --- |
| faunalayout20261004 | 3 / 0 | [fauna-layout-180383.tsv](../runtime/research/fauna-layout-180383.tsv): `2297850`, `2298950`, `22f60e0` |
| faunaseedlinks20261004 | 5 / 1 | [fauna-seed-links-180383.tsv](../runtime/research/fauna-seed-links-180383.tsv) |
| faunaseedfields20261004 | 4 / 0 | [fauna-seed-fields-180383.tsv](../runtime/research/fauna-seed-fields-180383.tsv) |
| faunaresourcelinks20261004 | 5 / 0 | [fauna-resource-links-180383.tsv](../runtime/research/fauna-resource-links-180383.tsv) |
| faunaresourcefields20261004 | 2 / 0 | [fauna-resource-fields-180383.tsv](../runtime/research/fauna-resource-fields-180383.tsv) |
| faunacomponentfields20261004 | 3 / 0 | [fauna-component-fields-180383.tsv](../runtime/research/fauna-component-fields-180383.tsv) |
| faunarolefields20261004 | 1 / 0 | [fauna-role-description-180383.tsv](../runtime/research/fauna-role-description-180383.tsv) |
| planetseedentry20261004 | 2 / 0 | [planet-seed-entry-180383.tsv](../runtime/research/planet-seed-entry-180383.tsv) |
| planetseedconsumers20261004 | 4 / 0 | [planet-seed-consumers-180383.tsv](../runtime/research/planet-seed-consumers-180383.tsv) |
| planetresourceseeds20261004 | 2 / 0 | [planet-resource-seed-flow-180383.tsv](../runtime/research/planet-resource-seed-flow-180383.tsv) |

That is 31 successful export rows and one failed row; `229ee20` was exported in
two stages, leaving 30 distinct successful RVAs. Earlier stage results are
retained. These counts include wrappers and fragments, not 30 newly decoded
appearance algorithms.

External arithmetic/name evidence lives under
`E:\NMS-Courier-Research\seed-analysis-180383`:

- `fauna-fields-fragments-20261004.json` and
  `planet-split-resource-fields-20261004.json`: bounded assembly and hashes.
- `environment-resource-seed-flow-20261004.json`: bounded resource-generation
  fragments. Split prologues do not by themselves cover the complete override.
- `environment-resource-seed-body-20261004.json`: continuation assembly covering
  both resource seed override sites and the ordinary draws preceding them.
- `<rva>-names-20261004.json`: bounded ASCII resolution for inspected field
  processors and rejected caller leads, including input pseudocode hashes.
- `customisation-entry-callers-20261004/callers.json`: direct caller edges.
- `fauna-component-metadata-20261004/candidates.json` and
  `planet-entry-20261004/candidates.json`: metadata/signature provenance.

Tools remain the handoff's pinned Python, Ghidra 12.1.4 and portable JDK. Runs
reuse the existing project with no whole-program analysis, two CPUs, 4 GiB heap,
20 GiB reserve, 180/210/240-second outer budgets and default 30 seconds per export.

The existing exports are the first read. If a selected export genuinely needs
reproduction later, the following is a bounded command for the two resource
candidates; use a new stage name to preserve earlier artifacts:

```powershell
& "$env:LOCALAPPDATA\Python\pythoncore-3.14-64\python.exe" runtime/research/analyze-acquisition-offline.py `
  --executable 'E:\SteamLibrary\steamapps\common\No Man''s Sky\Binaries\NMS.exe' `
  --sha256 671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4 `
  --tools "$env:LOCALAPPDATA\NMSCourier\research-tools\native" `
  --seeds runtime/research/planet-resource-seed-flow-180383.tsv `
  --output E:\NMS-Courier-Research\acquisition-180383 `
  --project-name Acquisition180383 --stage planetresourceseeds-reproduction --timeout 180
```

No corpus re-extraction, disk repairs, D: access or BitLocker changes occurred.
Game, bridge, mods and saves were unchanged. Proprietary exports remain external.
