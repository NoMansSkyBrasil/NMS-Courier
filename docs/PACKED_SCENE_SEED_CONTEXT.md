# Packed scene materials, explicit pieces and acquisition seed context

Checkpoint: 2026-10-04. Offline executable build 180383, SHA-256
`671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.
Continue from [recursive selection and owned inputs](SEED_RECURSION_AND_OWNED_INPUTS.md).
The active scope remains gates 1–3. Rendering and inverse search are deferred.

## Acceptance and remaining boundaries

The default packed-scene **algorithm trace** now joins descriptor selection,
reference context propagation, material acquisition identity and collection order
for nineteen corpus roots. This is an implemented bounded offline evaluator,
not a native whole-game loading oracle or a production delivery capability.

| Gate | New completed comparison | Boundary still excluded from unrestricted completion |
| --- | --- | --- |
| 1: material order | Original packed MESH creator, concrete material validators, reference wrapper, material handle/context-bank resolver and resource collector; joined XML traversal across 19 roots | Asynchronous resource success/readiness, geometry-dependent factory success, actual bank population and unexamined factories are controlled assumptions or unsupported |
| 2: pieces | Complete seeded recursion retained; original explicit-list recursion agrees in 74 cases, including 19 roots; original filter resolver agrees in 192 cases | Caller-supplied customisation/group resolution and preset inputs are not universal entity generation; filter resource IO results remain controlled |
| 3: seed inputs | Original default context writer and purchase accessor; owned ship/tool/freighter source chains retained | All acquisition/update-message/NPC/preset branches and task overrides have not been joined into an unrestricted category oracle |

Do not mark the unrestricted three gates complete merely because the bounded
trace has no unsupported roots. `natural_resource_io_proven` remains false.

## Actual factory and material association

`183a900` registers resource type 4 with factory `1832f30`, which installs
material table `4afb510` and copies request context to resource `190`.
Scene factory registration `18df860` writes its creator at registry-record `28`;
lookup `18dfb10` returns record `10`, so loader `18ddc70` invokes returned `18`.
This establishes the packed MESH creator as **`189f400`**, not a node clone.

It examines 32-byte packed Attributes in array order. The two-qword key at
`50ad3e8` spells `MATERIAL`. Until node resolved pointer `98` is nonnull, a matching
attribute requests type 4 from `2d60100` with the attribute's filename, incoming
flags and incoming descriptor context. Null values become an empty filename.
The acquired handle goes to node `90`; `2d65280` produces node `98`. If the first
resolution is null, another MATERIAL attribute can retry; after success, later
matching attributes are ignored. Resource lookup itself is controlled IO in the
fixture, not original cache acquisition.

Concrete material table slots, read from the executable:

| Slot | Original routine | Recovered comparison |
| --- | --- | --- |
| `48` | `18319d0` | Exact filename bytes and resource type; case/slash normalization happens upstream |
| `50` | `2d62450` | Filename/type first; null request context accepts that result; otherwise context comparison |
| `58` | `18319a0` | Requires exact 64-bit resource flags at `110`, then calls slot `50` |

Strict mode (resource flag bit 26) compares both enabled flags, enabled seed values,
and every ordered 32-byte ID record. Non-strict mode first requires matching
enabled flags. With the first seed enabled it compares that seed, and the second
seed only if enabled, **without comparing IDs**. With the first seed disabled it
compares ordered IDs, **without comparing the second seed value**. These unusual
rules were tested against original instructions, including reordered IDs and
different disabled seed values. Compare only the low boolean byte of returns.

Material wrapper `2d65280` now also runs original instructions, rather than being
a resolved-pointer stub. It uses the separate material manager at global `5910190`,
rejects invalid/null pool entries and checks resource flag `13b`. Variant resources
forward type `8` and selector `110` into `2d646f0`. That routine uses the manager's
type bank and exact selector; on a missing nonzero selector, it tries selector
zero. Invalid handles at an existing selector return null without fallback.
The successful zero fallback performs the zero lookup twice. Twenty-four bank
cases and four invalid wrappers agree with these rules. Type/selector hash-index
helpers are controlled lookup stubs; actual engine bank population is not inferred.
The missing-type fatal branch is excluded from private execution, not treated as
a successful null fallback.

## Reference order and nonmesh nodes

`REFERENCE` wraps a scene resource in node table `4b01b08`. Its material collector
`18db0e0` first visits local children in vector order, then tail-calls the resource
at node `a8`, virtual slot `d8`. Scene resource factory `1839ac0` installs table
`4b01b58`; that slot is `18dae90`, which visits the root at resource `1c8`.
Thus **local reference children precede the referenced model's materials**.
Reference resource acquisition happens earlier during construction; acquisition
request order and final material collection order are different sequences.

The loader copies the current descriptor context into a selected REFERENCE when
selected IDs exist and its processed name passed membership. Otherwise ALTID can
provide space-delimited IDs through `56aff0`; each token is LOD-normalized,
uppercased and truncated to 31 bytes. That parser copies its incoming seed pair
only when ALTID is nonempty, even if it consists solely of spaces. Original
`56aff0..56b2a1` agrees in 102 cases (17 strings times three seeds times both
enabled flags). Duplicate tokens remain duplicated; a tab is not a separator;
the first literal uppercase `LOD` is removed only when its suffix is exactly
one decimal digit. `LOD0` alone produces an empty ID record, not no record.
The scene trace now reuses this compared port. C string operations, allocation
and temporary string construction are controlled helpers; vector capacity is 64.

MODEL `1855750 -> 1835d10` installs `4afb398`; JOINT `18a2990` installs `4afb630`;
LIGHT and COLLISION creators install `4afb2d8`; GROUP and LOCATOR use `4afb270`.
All these concrete tables have aggregate collector `1833ec0` at slot `20`.
The MODEL factory separately loads geometry, whose success is not emulated here.

EMITTER registration is separate: `196f3f0 -> 18df860`, type `0x28`, creator
`1974270`. It requires DATA and MATERIAL attributes, uses their last occurrences,
and calls constructor `19732a0`. That constructor acquires a material with flags
zero and the incoming context, but installs table `4b22d58`, whose slot `20` is
**aggregate-only `1833ec0`**. Its own material does not enter this material vector.
Particle rendering and effect-defined extra scene resources remain separate.

Factory/acquisition executes before the pairwise-scale insertion gate. A rejected
scale can therefore cause a request without an inserted node or any child loading.
Platform-mask and selected-descriptor rejection happen earlier. Do not simplify
scale rejection to "one zero axis" or reorder children by name.

## Complete explicit descriptor selection

Original `2d63810` chooses the first option whose **source 32-byte ID** matches
the supplied explicit list. If no option matches, it uses the group's first
option, including an `xNEVER` option. It then applies the existing inclusion
predicate, normalizes the output ID, deduplicates outputs, and recursively visits
nested lists and references. Each reference is resolved once; there are no seeded
draws or all-never suppression on this path. The natural path's double lookup and
seed schedule must not be reused for explicit customisation.

`evaluate_explicit` is compared with the complete original body
`2d63810..2d63bf0` by `emulate-descriptor-recursion.py --explicit-list`:
36 synthetic cases and 38 corpus cases, **74 total, zero mismatches/failures**.
The existing natural 273-case comparison is retained, not replaced by this result.

## Default writer and purchase source

Original `2d63670..2d636aa` clears the selected count, copies all sixteen incoming
seed-pair bytes to context `10`, **preserves the pair at `20`**, and forwards
`[output, filename, inclusion, input pair, prefix, filter input]` to `2d641c0`.
The Ghidra export incorrectly renders the first argument as the seed's low word;
the actual instructions leave RCX as the output context. The six writer fixtures
check argument forwarding and preservation of the second pair directly.

Original `2d652d0..2d6584f` now executes in `emulate-descriptor-filter.py`.
It resolves FILTER.MBIN records by case-sensitive prefix substring and returns
the first matching record, not the longest match. An empty prefix returns null
even if filter data exists. A null cached resource also returns null without
retrying IO. The cold branch replaces the first literal `.SCENE.MBIN` occurrence
with `.FILTER.MBIN`, checks existence, loads with arguments `(path, 0, 1)`, and
inserts the result under the original scene filename. Lowercase `.scene.mbin`
does not match that replacement. Upstream filename normalization is separate.

The 192-case matrix covers two filename cases, four ordered record lists, six
prefixes, and warm, warm-null, cold-missing and cold-loaded cache states.
Cold-loaded cases run a second call and assert no repeated load. Original cache
hashing, insertion and selection execute; string operations and existence/load
results are controlled. The recovered hash uses uint32 wraparound, per-byte
`(h + byte) * 0x401`, xor with `h >> 6`, then the final multiply/xor stages.
There are zero mismatches. This closes controlled nonempty filter resolution,
not real archive IO or every caller's choice of prefix/filter input.
Default preparation and seeded reference recursion use the empty-prefix route;
explicit-list recursion does not use the natural filter/PRNG route.

Purchase accessor `183cd20` resolves the handle in the resource manager and copies
the **stored descriptor context at `190`**, including ordered IDs and pairs
`1a0/1a8` and `1b0/1b8`. Invalid/null handles yield an empty list and disabled/-1
pairs. Purchase state `8e8830` prefers this loaded-resource seed pair; when disabled,
it falls back to purchase-object pair `10/18`. It later writes the chosen pair to
the working customisation object. This is not proof that every reward/offer branch
uses the same fallback or that IsGift assigns a freighter rank.

## Reproduction and evidence

Use the private pinned Python, Capstone 5.0.5 and Unicorn 2.1.4 from the existing
research tool directory. No end-user runtime requirement is implied.

```powershell
python runtime/research/emulate-packed-material-context.py `
  --executable "E:\SteamLibrary\steamapps\common\No Man's Sky\Binaries\NMS.exe" `
  --python-tools "$env:LOCALAPPDATA\NMSCourier\research-tools\python" `
  --emulator-tools "$env:LOCALAPPDATA\NMSCourier\research-tools\unicorn-2.1.4" `
  --output E:\NMS-Courier-Research\seed-analysis-180383\new-material-context.json
python runtime/research/trace-packed-scene-materials.py `
  --corpus E:\NMS-Courier-Research\corpus `
  --models-file runtime/research/appearance-recursion-models-180383.json `
  --seed 0x7 --engine-context-index 0 --resource-flags 0 `
  --output E:\NMS-Courier-Research\seed-analysis-180383\new-scene-trace.json
python -m unittest discover -s runtime/research -p test_packed_material_context.py
python runtime/research/emulate-descriptor-filter.py `
  --executable "E:\SteamLibrary\steamapps\common\No Man's Sky\Binaries\NMS.exe" `
  --python-tools "$env:LOCALAPPDATA\NMSCourier\research-tools\python" `
  --emulator-tools "$env:LOCALAPPDATA\NMSCourier\research-tools\unicorn-2.1.4" `
  --output E:\NMS-Courier-Research\seed-analysis-180383\new-filter-context.json
```

The context index is an explicit fixture input, **not a recovered universal PC
enum**. The scene trace uses an enabled model pair and disabled second pair as
explicit inputs. Native default preparation preserves a preexisting second pair;
the trace does not infer that all actual callers leave it disabled.

Native bounds: 128 MiB executable; pinned hash; 1 MiB private heap, 64 KiB stack,
50,000 instructions/one second per execution; no host imports or game calls.
Original instructions run only in committed windows; all IO/allocation seams are
controlled. Final material/context matrix: 32 creator cases, 242 context cases,
12 filename/type cases, 11 purchase contexts, four invalid handles, six default
writer cases, 18 reference-order cases, 24 variant bank cases and four invalid
material wrappers: **353 total**, zero mismatches. The report must confirm
zero mismatches before citing this count as successful.

Scene bounds: 1–32 roots; 256 assets/64 MiB XML per root; 8 MiB per file;
32,768 visits/depth 64; at most 65,536 indexed source rows. SQLite is read-only;
metadata is indexed once in private memory to avoid repeated full-table scans.
Files retain exact source archive and XML SHA-256 attribution; ambiguity fails.

External `seed-analysis-180383` reports:
`packed-material-variant-context-final-20261004.json`,
`explicit-descriptor-recursion-final-20261004.json` (void return semantics),
`descriptor-recursion-regression-final-20261004.json`,
`packed-scene-material-trace-final-20261004.json`,
`material-context-validator-windows-20261004.json`,
`default-context-writer-window-20261004.json`, and
`reference-explicit-descriptor-windows-20261004.json`.
Filter evidence: `filter-resolver-window-20261004.json` and
`descriptor-filter-cache-cold-20261004.json` (192 cases). The earlier 96-case
warm-cache report is retained as a historical checkpoint, not an additional
independent matrix.
ALTID evidence: `altid-parser-window-20261004.json`,
`altid-parser-body-20261004.json`, `reference-altid-parser-20261004.json`.
Reproduce with `emulate-reference-altid.py` and the same four executable/tool/output
arguments as `emulate-descriptor-filter.py`, using a new external output.
Nineteen joined scene traces succeeded for seed 7/context index 0/flags zero;
that is one explicit matrix, not all uint64 seeds or natural engine states.

New selected Ghidra stages: `appearancenaturalmeshloader20261004`,
`appearancepackednodecreators20261004`, `appearancematerialandofferinputs20261004`,
`appearancematerialvariantvalidator20261004`, `appearancereferencecontext20261004`,
`appearancesceneresourcecollector20261004`, `appearancereferenceresourcetraversal20261004`,
`appearancematerialnamevalidator20261004`, `appearancescenenonmeshfactories20261004`,
`appearanceemitterfactory20261004`, `appearanceemittermaterial20261004`,
`appearanceemittercollector20261004`. Portable TSV selections are committed.

Failures are preserved: geometry-consumer `18612a0` timed out after 30 seconds,
despite the containing stage completing. Do not count it as a successful export.
An unwind request for leaf `18dae90` failed because it has no unwind entry; its
three actual instructions were inspected directly. An initial leaf emulation
window omitted a REX-prefixed jump byte and failed decoding; corrected exclusive
end is `18dae9e`. The initial scene trace completed 5/19 roots and failed closed
on COLLISION/EMITTER; their concrete creators/collectors were then traced before
the 19/19 result. Missing BSS resource-manager constants were replaced solely by
private fixture pointers. The material wrapper also has no unwind entry; its
complete `2d65280..2d652c3` leaf was inspected directly. Guessed stage paths, premature export reads and
PowerShell glob errors were corrected through manifests. None was a disk error.
The first cold-filter fixture failed with a private unmapped write: its cache
entry omitted the byte at offset `120`, overlapping the next fixture allocation.
Allocating `130` bytes restored the observed entry layout; the full 192-case
matrix then passed. This was an emulator fixture error, not a game or disk write.
The first ALTID comparison rejected a long token at the shared 31-byte strncpy
fixture limit; the local bounded 255-byte input copy was added before all 102
cases passed. Direct IAT slots were initially passed to the FF25-thunk inspector,
which correctly rejected them; the harness instead verifies the import-name
records before replacing their slots with private string helpers.

Rollback state: no game process, installed executable, bridge, patch, save,
archive or corpus content changed. Only repository research tools/documentation
and new external analysis reports were written; no D: access or storage commands.
