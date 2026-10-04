# Complete descriptor recursion and owned appearance inputs

Superseding continuation: [packed scene materials and seed context](PACKED_SCENE_SEED_CONTEXT.md)
connects the actual packed MESH factory, concrete cache validators, reference
wrapper order, explicit-list recursion and purchase seed accessor. The ledger
below is the earlier checkpoint; read the continuation before repeating research.

Checkpoint: 2026-10-04, offline build 180383. Executable SHA-256:
`671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.
This continues [appearance context](APPEARANCE_CONTEXT_RESEARCH.md). The user's
current scope is gates 1–3; final rendering and inverse search remain deferred.
Recovered contracts below must not be described as a complete natural appearance
oracle. No game process, mod, bridge, save or original corpus was modified.

## Acceptance ledger

| Gate | Accepted evidence | Remaining gap before unrestricted completion |
| --- | --- | --- |
| 1. Natural material order | Scene `Children` is the packed array consumed by the resource loader; increasing child insertion and preorder, first-occurrence material-handle collection; five source-identified node tables use the audited collectors | Reference expansion, factory variants and context-dependent material cache identity must be joined into a natural, whole-model resource oracle; filename equality is insufficient |
| 2. Piece selection and dependencies | Complete original recursive routine, chooser, classification and all-never predicate replayed against our port; IDs, recursive seed/flag visits, lookup schedule and return classification match | Actual engine resource resolution and every natural/custom caller context remain outside the fixture; explicit-context recursion is verified, unrestricted entity generation is not |
| 3. Category seed inputs | Default owned ship/tool routes retained; owned freighter named model/palette fields connected directly to appearance cache | Acquisition/NPC/preset variants and full task/override composition need separate evidence; do not assume every category has one seed |

This ledger intentionally does not mark all three gates complete. Correct private
fixtures cannot establish the excluded resource-loader/caller conditions.

## Recursive native comparison

[emulate-descriptor-recursion.py](../runtime/research/emulate-descriptor-recursion.py)
executes original instructions at `2d63bf0..2d641b3`, `2d623c0..2d6244d`,
`2d67800`, `2d64800` and `2d69ad0`. The entire recursion body is included;
the first unwind fragment alone ends at `2d63c6e` and is insufficient.
Private stubs implement bounded string operations, vector allocation/free,
nested model-wrapper access, descriptor resource lookup and empty reference-filter
resolution. They do not substitute the chooser, PRNG, seed mixer, recursive
function, classification or all-never predicate.

Final matrix: **273 cases, zero mismatches, zero reported failures**:

- 216 synthetic cases: nine trees, three uint64 seeds, enabled/disabled flags
  and four inclusion/exclusion/prefix configurations.
- 57 corpus cases: nineteen roots, three seeds each, default explicit context.
  The committed [root manifest](../runtime/research/appearance-recursion-models-180383.json)
  covers eight ship families, five freighter roots including Pirate, and six
  multitool roots. References are resolved from the existing corpus, not extracted
  again; missing descriptor resources remain explicit.

Compared outputs: ordered selected IDs, every recursive input seed and enabled
flag, both lookups of each traversed reference path, and the native return
classification. Root final PRNG state is not an output of this native routine;
this comparison does not claim to have observed it directly. The 420 existing
material/order/choice/node fixtures were rerun only because the private fixture
factory was refactored for reuse; all still match. Fifteen Python traversal tests
also pass.

### Corrected details

The reference branch resolves the path **twice**. The first result controls the
all-never check. Unless that result is a non-null all-never tree, two parent draws
derive a child seed, and the second lookup controls whether recursion occurs.
A missing first lookup followed by a successful second lookup can recurse;
a successful first lookup followed by failure consumes the seed but cannot recurse.
The evaluator now preserves that schedule rather than caching the predicate result.
The corpus loader is stable/cached, so changing lookup results are separately
covered by boundary tests, not presented as observed game behavior.

A null nested model-wrapper result consumes no child seed. A non-null empty
model does consume a child seed on an ordinary group. An all-never child is skipped.
`_PLAYER_` nested lists reuse the parent input seed and flag without advancing
the parent's random state. Reference recursion retains inclusion but resets
prefix and exclusion. Nested recursion retains all explicit context.

The root classification starts at 1. A selected `xRARE` option sets 2; a selected
`xWEIRD` option sets 3 unless the higher-priority `xRARE`/`xNEVER` marker applies.
Ordinary selections retain the previous classification. Child return values
do not propagate to the parent. These are descriptor classification values,
**not ship or freighter C/B/A/S ranks**.

All ten indexed `.FILTER.MBIN` files belong to creature paths in this corpus;
none is under `models/common/`. This is a bounded inventory observation, not proof
that the engine cannot synthesize or otherwise supply filters.

## Scene child and collector association

Exact string `Children` at `3430ea8` is passed by `1b22970` to `1b10a20` with
the `TkSceneNodeData` array pointer at `10` and count at `18`. Records have stride
`80`; the serializer advances its index and addresses `array + index * 80`.
This matches the packed child array used by `18ddc70` before increasing-index
insertion via `21f4a0`. `Attributes` is a separate array at `0`; `InstanceTransforms`
is a separate array at `20`. Do not reorder any of them by node name.

The following **previously traced constructor tables**, not arbitrary neighboring
data, were inspected with [inspect-node-collector-slots.py](../runtime/research/inspect-node-collector-slots.py):

| Node table | Virtual slot `20` |
| --- | --- |
| `4afb270` | Aggregate collector `1833ec0` |
| `4afb398` | Aggregate collector `1833ec0` |
| `4afb748` | Aggregate collector `1833ec0` |
| `4afb6f8` | Mesh collector `1839e10` |
| `4b21ec0` | Mesh collector `1839e10` |

The mesh collector emits its resolved material's handle at `resource + 130`
before children, skipping handles already present. Existing duplicate entries in
the initial vector are preserved. Mesh constructor `1839ce0` initializes the
material wrapper at `90` using `184d8d0`; its resolved resource pointer is at `98`.
`19444b0` inherits that constructor, and its table has the same collector.
The subsequently inspected root `194f0e0` operates on already constructed nodes;
it is **not** a packed scene-attribute parser. Its earlier fragment `194f73c`
must not be relabeled as one.

## Material cache identity and context variants

The completed `appearancematerialcachekey20261004` export connects the generic
resource acquisition path to its cache lookup, insertion and context resolver:

- `2d60100` calls `2d627a0` with resource type, filename, request context and
  flags. A `4000000` flag additionally requires the descriptor comparison at
  `2d626c0` against the resource record at `190`. This comparison is a separate
  condition, not a filename hash.
- `2d627a0` normalizes ASCII lowercase to uppercase and normalizes/collapses
  slash separators with a special leading-backslash condition, in a bounded
  256-byte local buffer. It passes the normalized bytes to `1d3340`. The cache
  first selects a bucket by resource type, then compares this filename hash.
  The eight hash bytes also feed an FNV-1a-style bucket hash; that bucket hash
  must not be confused with the filename hash function itself.
- Matching the hash is only a candidate hit. The resource's virtual validator
  at `50`, or `58` when the `400000000` variant flag applies, checks the request
  name/context/type (and flags in the latter branch). Failed validation walks
  the next entry. Readiness/loading flags also affect whether a hit is usable.
- `2d60720` assigns a table-backed handle at resource `130`, stores it under
  resource type `8` and the hash of its stored filename at `c`, and links entries
  in the hash bucket. A filename therefore does not uniquely determine an
  acquired handle across request contexts and variants.
- `2d646f0` resolves a type-keyed context table at manager `b8`: an exact
  selector match yields a handle and dereferences the manager's resource table
  at `60`, subject to the count at `5c`. When a nonzero selector is absent, it
  tries selector zero. An absent type table follows an assertion path; an
  unavailable selector or invalid handle can return null.

The material wrapper thunk `2d65280` uses this resolver for variant resources
(`13b` flag), through the material manager at `5910190`. The mesh collector then
deduplicates **resolved handles**, not filenames. This explains why reusing one
filename-based set in an offline collector can change the material draw schedule.
These are static control-flow associations. The concrete material validators,
factory/reference expansion and request-context initialization have not all been
replayed together. The natural whole-model resource oracle remains open.

The subsequent three-function `appearanceresourcecachechecks20261004` export
narrows the request-validation contract. `2d626c0` compares two enabled/value
pairs at request `10/18` and `20/28`, the selected-record count at `4`, and
ordered 32-byte records from the pointer at `8`. Disabled pair values are ignored
after matching enabled flags; enabled pairs must match exactly. Record contents
are compared as four qwords, in stored order. These offsets are request-context
offsets, not a save layout or a universal ship seed record.

Shared slot validator `2d62450` first invokes resource virtual `48`. Null request
context returns that result directly. Otherwise it checks the stored context
at resource `190`; flag bit 26 selects strict comparison of both pairs and all
records. Its non-strict branches can compare only the relevant enabled pair,
rather than always requiring full context equality. Concrete material overrides
and the flag-taking `58` validator remain separate targets.

Filename hash `1d3340` uses 128-bit multiplication with XOR of the low/high
halves and constants `a0761d6478bd642f`, `e7037ed1a0b428db`,
`8ebc6af09c88c6e3`, `589965cc75374cc3`. It has short-input, 16-byte and
48-byte block branches. This static association is distinct from the appearance
MWC stream and child-seed mixer. No claim of instruction-verified hash port is
made by this export alone.

## Owned freighter: named fields reach the appearance cache

The exact current field name is `CurrentFreighterHomeSystemSeed`, not an inferred
association with standalone `GcFreighterSaveData.HomeSystemSeed`.
Current player-state field processor `2a15900` binds:

| Named serialized input | Player-state offset | Native owned-load destination |
| --- | --- | --- |
| `CurrentFreighterHomeSystemSeed` value/flag | `83c20` / `83c28` | `542910` copies the full 16-byte pair to freighter cache `2b0` / `2b8` |
| `CurrentFreighter` resource | `83898` | `542910` copies through `211870` into cache `2d8`; resource seed pair is `308` / `310` |

The instruction-checked copy at `54298d` reads `[rdi + 83c20]` and the store at
`54299d` writes `[rbx + 2b0]`. This **direct owned-load route** bypasses the update
message's source fields `200/208`; it closes the earlier named palette association
without guessing that the two source layouts are equal.

Caller `48f9d0` forwards its fifth input (the player-state object) into `542910`
with the freighter object at its first input plus `2b82e0`. `48e370` is another
instruction-checked direct caller. Existing `549380` consumes the cached palette
pair for generated freighter colors and the resource pair for the model, retaining
disabled-palette fallback and customization overlays. `5485f0` called after loading
updates existing scene components; it is not itself the palette PRNG generator.
No live freighter, S-class offer or complete visual preview was produced here.

## Method, artifacts and reproduction

Tools: Python 3.14, private Unicorn 2.1.4/Capstone 5.0.5, existing Ghidra 12.1.4
project and JDK 25.0.4.1+1. Selected exports use `-noanalysis`, two CPUs, a private
4 GiB Java heap, a 20 GiB free-space reserve and a 300-second outer limit.
No native Windows executable is launched by the Unicorn tests.

```powershell
python runtime/research/emulate-descriptor-recursion.py `
  --executable "E:\SteamLibrary\steamapps\common\No Man's Sky\Binaries\NMS.exe" `
  --python-tools "$env:LOCALAPPDATA\NMSCourier\research-tools\python" `
  --emulator-tools "$env:LOCALAPPDATA\NMSCourier\research-tools\unicorn-2.1.4" `
  --corpus E:\NMS-Courier-Research\corpus `
  --models-file runtime/research/appearance-recursion-models-180383.json `
  --output E:\NMS-Courier-Research\seed-analysis-180383\descriptor-recursion-new.json
python -m unittest discover -s runtime/research -p test_descriptor_seed_evaluator.py
```

Bounds: new external output; pinned executable under 128 MiB; private 1 MiB heap,
64 KiB stack; 50,000 instructions/one second per execution; 128 recursive visits,
128 model allocations, depth 16, 1,024 resource lookups, 256 selected IDs;
up to 32 roots. Corpus budget remains 128 resources/64 MiB XML **per root**.
Reports retain window/source hashes, selected IDs, visits, lookup sequences,
native classification and corpus source attribution. Unsupported/budget errors
produce a partial report with explicit failures rather than a success claim.

Selected stages under external `acquisition-180383`:
`appearancescenesyncmetadata20261004`, `appearancesceneseedorigins20261004`,
`appearanceownedfreighterpalette20261004`, `appearancemeshownedcallers20261004`,
`appearancemeshfactory20261004`, `appearancemeshfactoryroot20261004`,
`appearancematerialidentity20261004`, `appearancematerialcachekey20261004`,
`appearanceresourcecachechecks20261004`.
Corresponding portable TSV selections are in `runtime/research`.

External `seed-analysis-180383` reports include:
`descriptor-recursion-classification-20261004.json` (273 cases),
`appearance-context-shared-fixture-20261004.json` (420 cases),
`node-collector-slots-reproducible-20261004.json`,
`owned-freighter-palette-name-20261004/`,
`owned-freighter-scene-names-20261004.json`,
`owned-freighter-field-users-a-20261004.json` and `-b-20261004.json`,
`freighter-writer-fragment-only-20261004.json`,
`mesh-factory-root-chain-20261004.json`, and
`descriptor-filter-inventory-20261004.json`.

Rejected leads/failures: the first corpus replay exceeded a 128-lookup fixture
bound; a 1,024-call bound succeeded. A later multi-root replay shared one corpus
cache and exceeded 128 resources; resetting it per root succeeded without raising
the existing corpus limit. A general freighter-name scan exceeded its 256-output
bound; narrowing to seed/resource/save names exposed the exact current field.
Including RBP/SIMD writes found stack-frame lookalikes at `54e4a0`/`561fa0`;
`54ec85` was proved to manipulate a stack-local vector, not a freighter seed.
A combined fragment request included a non-instruction address and aborted;
the actual writer boundary succeeded separately. A two-target MESH-name request
hit the 16-KiB fragment budget; no limit was raised. `GcFreighterSyncComponentData`
references led to metadata registration/hashing/serialization, not the desired
owned appearance input. Missing guessed `.asm`, metadata-report and helper paths
were corrected by reading existing manifests/source paths. These are research
coverage/input errors, not device/storage failures.

The resource-cache follow-up requested unwind windows for both `1d3340` and
leaf `2d626c0`; the latter has no containing unwind record, so the combined
request aborted without producing its report. A hash-only request succeeded
with one 41-instruction fragment at `1d3340..1d33df`. That first fragment is
not the complete hash function; do not emulate it as a full oracle. The selected
Ghidra exports remain the static evidence for both functions.

Navigation rebuild: 111 source files, 397 source definitions, 194,641 corpus
entries, 312 deduplicated native function candidates, one preserved unavailable
analysis run and zero import warnings. The five native-index regression tests pass.

No disk repair, D: access, BitLocker change, game mutation, re-extraction,
rendering implementation or new inverse-search implementation occurred.
