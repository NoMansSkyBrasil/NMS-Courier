# Material order, descriptor context and priority input channels

Checkpoint: 2026-10-04. Offline executable build 180383, SHA-256
`671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.
This pass addresses the first three missing boundaries from the
[merged selector checkpoint](MERGED_TEXTURE_SELECTION_RESEARCH.md). It closes
specific loaded-object and explicit-context rules, **not all natural loaders,
all category variants or the complete appearance-to-seed inverse**. Original
executable bytes and pseudocode remain external. No game process, installed
bridge/patch, save, source corpus or storage configuration was changed.

All bare RVAs and object offsets below are hexadecimal. Case counts are decimal.
Offsets belong to the stated object at this fingerprint, not a public ABI.

## Results and remaining boundaries

| Requested boundary | New result | Still required for complete natural appearance |
| --- | --- | --- |
| Material resource order | Concrete producer recovered; original aggregate and mesh-like methods agree with ordered, first-occurrence material-handle traversal in 15 cases | Scene loader child insertion/filtering, other node overrides, handle-to-material-path correspondence for each loaded entity |
| Piece selection and conditions | Inclusion, exclusion, prefix overrides, weights, duplicate suppression and RNG consumption agree with original selector in 360 cases; traversal accepts explicit context | Natural caller/filter-record acquisition, complete original recursive traversal replay and assembled/customised variants |
| Category inputs | Default owned ship/tool seed routes retained; freighter upstream source setter and update-message copy route recovered | Owned freighter save-field association, offer/natural variants, every category's filter/resource selection and full forward composition |

The initial 375 original-instruction comparisons have zero divergences. A resumed
loader/filter pass expanded this to **420 zero-divergence cases**: 15 material,
360 group choice, 42 loaded-node membership and three child append cases.
These are private
Unicorn fixtures, not observations inside the game. Eleven Python traversal and
boundary tests initially passed; the new 15-character regression makes twelve.
They do not replace the native comparisons.

## 1. Concrete material-vector producer

The previous resource method `62f420` invokes virtual slot `+d8`. A raw-pointer-run
heuristic was insufficient: resource tables include mixed data and unrelated
following tables. The revised bounded scanner anchors the shared base slot
`+50 -> 2d62450`, checks its shared prefix, and then instruction-checks RIP-relative
LEA references to matching tables. It finds 15 candidate tables and eight code
references to the five tables whose `+d8` target is `18dae90`. These remain
candidate table families; matching pointers alone do not establish type names.

The existing no-autoanalysis Ghidra reference database returned zero references
for the selected tables. That was a database coverage limitation, not evidence
that the code does not use them. Bounded instruction decoding recovered the
actual references without full autoanalysis or fresh extraction.

The constructor `18dd650` installs the resource table at `4b01b58`, creates an
internal node through `18334a0`, installs internal table `4afb270`, and stores the
node at resource offset `1c8`. Thunk `18dae90` forwards the material-vector call
to that internal node's virtual slot `+20`. It has no `.pdata` unwind entry;
the thunk was inspected directly rather than assigned a fabricated unwind range.

Two concrete internal methods establish the order:

- `1833ec0`: iterate children at node `+80`, count at `+7c`, in increasing index
  order; call each child's virtual `+20`. No own material is appended.
- `1839e10`: read material handle from the object reached through node `+98`,
  at that material object's `+130`; append through `167aca0` only if the handle
  is absent from the existing vector; then visit children in increasing order.

Constructor `1839ce0` installs table `4afb6f8`, whose `+20` is `1839e10`.
Its material wrapper at `+90/+98` is prepared through `184d8d0`, which resolves
the resource's handle at `+130`. The handle is the deduplication identity;
deduplicating material filenames instead has not been justified.

Equivalent rule for these loaded node implementations:

```text
visit(node):
    if node has a material and its handle is absent from output:
        append that handle
    for child in node.children in stored order:
        visit(child)
```

This is depth-first preorder with first-occurrence uniqueness. It does not sort
names and consumes no RNG. Preexisting output entries remain, including any
duplicates already present. The 15 native cases cover empty/aggregate roots,
handle zero, nested mesh nodes, duplicate branches, nonascending child order and
prepopulated vectors. Append allocation is an explicit stub using 64 preallocated
handle positions; original traversal and equality instructions execute.

Child serialization `1833f10` also iterates this stored order, but serialization
does not prove that the scene loader preserves XML order under all conditions.
`1833dc0` propagates a context over children; `1834500` is a destructor wrapper,
not a builder. Field-offset searches also found `1833130` and `1838a70` in different
layouts; they are rejected as evidence for this child array. No unverified
constructor candidate is promoted into a material-loading API.

### Resumed child construction and selected-node connection

The resource loader `18ddc70` connects selected pieces to the stored tree:

1. An input mask at `+78` can reject a node for the current engine context.
2. For types MESH, REFERENCE, LOCATOR or INSTANCEMODEL, when selected descriptor
   count is nonzero, call `2d698c0` with the node's processed name. A failed
   membership test skips the node/subtree. The caller strips a trailing `LOD`
   plus one digit before this test. Type identities were checked from original
   literals at `4b274b0`, `4b2b840`, `4b29930`, `50ad4b0`.
3. Resolve the factory using `18dfb10` and construct the node. A factory failure
   or failed pairwise-products scale gate prevents insertion and child loading.
   The scale condition is not simply "any zero axis rejects a node".
4. At the root, store the resulting node in resource `+1c8`. Otherwise append it
   to the parent vector at `+78` through `21f4a0`.
5. Iterate incoming children at `+10`, count at `+18`, stride `80`, in increasing
   index order, recursively calling the resource virtual `+f0` with the new parent.

`21f4a0` writes at pointer-vector index `count` and increments count. It does not
sort or deduplicate child pointers. Three original-instruction comparisons cover
zero/one/eight initial capacity, including growth via the bounded append stub,
and preserve repeated input pointers in insertion order. Later material traversal
performs handle deduplication separately.

`2d698c0` accepts null names, names not beginning `_`, and names with no subsequent
underscore without selected-ID matching. Other names are uppercased as ASCII,
truncated to 31 bytes and compared exactly to selected 32-byte IDs. On failure,
it retries with **15 characters**, not 16: `strncpy(..., 16)` is followed by an
explicit terminator at byte 15. A first 413-case run had one disagreement because
the candidate incorrectly used 16. The instruction-checked correction and a
dedicated regression test preserve that failure; the expanded 420-case run passes.
This fallback is separate from chooser inclusion/exclusion and LOD normalization.

The selected IAT entry at `34118c0` was verified to name `strncpy` before replacing
its pointer in private emulation with a bounded 16-byte copy stub. No host import
was invoked. The original membership instructions and append instructions execute.

This now establishes ordered insertion **for this packed resource-loader path**,
followed by preorder material traversal. It still does not establish how every
XML/reference input is converted into that packed child list, all factory/node
implementations, cross-resource ordering or every specialised loader. A mesh
constructor caller at `18e12c0` is a runtime instantiation path, and `19444b0` is
a thin derived constructor; neither independently proves the packed XML writer.
`18361c0` is another destructor, and `18341e0` collects a different node resource
while preserving child order. Those rejected labels remain explicit.

## 2. Descriptor choice with explicit context

The original group chooser is `2d67800`; inclusion is `2d69ad0`; Name marker
classification is `2d64800`. The Python implementation is
[evaluate-descriptor-seed.py](../runtime/research/evaluate-descriptor-seed.py).
It now accepts inclusion IDs, exclusion IDs and a prefix, including CLI options
`--include-id`, `--exclude-id` and `--prefix`. These inputs are supplied by the
researcher; the tool does not claim to infer a natural caller's context.

Recovered operation order matters:

1. Exclude an option when any nonempty exclusion token is a case-sensitive
   substring of its raw ID. Empty exclusion tokens do not exclude everything.
2. Apply the inclusion predicate below. Sum the eligible Name weights: `xRARE`
   gives 1, otherwise `xNEVER` gives 0, otherwise ordinary/`xWEIRD` gives 20.
   If markers coexist, `xRARE` is checked first. XML `Chance` is not consulted
   by this chooser.
3. If the total is zero, return no option without drawing. Otherwise compare
   **all raw candidate IDs**, including ineligible ones, with previously selected
   IDs. Any exact match suppresses the entire group without drawing.
4. A nonempty prefix collects eligible raw IDs containing that substring. One
   match is selected without drawing. Multiple matches use one MWC draw and
   `high32(draw * matchCount)`, ignoring weights within the prefix list. A zero-
   weight option can therefore be selected by prefix if the group already had
   positive eligible total weight. An entirely zero-weight group still returns.
5. With no prefix match, consume one draw and use the weighted interval
   `high32(draw * totalWeight)` in declared candidate order.

Inclusion uses suffixes, not arbitrary substring matching:

```text
if inclusion list is empty: accept
if suffix from first underscore starts with "_X":
    accept only if that whole suffix equals an inclusion ID
otherwise find the first uppercase "X":
    if absent: accept
    accept if that whole X suffix equals an inclusion ID,
    or equals that ID after stripping one leading underscore
```

For example `_XA` matches inclusion `_XA` but not `XA`; `PARTXA` matches either
`XA` or `_XA`. `_PART_XA` follows the plain-X branch because its first underscore
suffix is `_PART_XA`, not `_X...`. ASCII case is significant.

The existing recursive port preserves selected IDs, LOD normalization, nested
model ordering, `_PLAYER_` seed reuse, two-draw child mixing, all-never skips and
missing-reference draw consumption. Nested model lists retain the prefix and
exclusion context. The audited reference branch retains inclusion but resets
prefix and exclusion. The root caller `2d641c0` resolves descriptors with
`2d649f0` and obtains a filter record via `2d652d0` before traversal. Its filename
transformation targets `.FILTER.MBIN`; an empty prefix returns no record.
Automatic filter-file parsing and every customised caller are not implemented.

The native matrix compares 360 contexts: three seeds including uint64 boundaries,
four inclusion lists, three exclusion lists, five prefixes and two selected-ID
states. Every chosen option index and both final MWC words match. Original
chooser/classification/inclusion instructions run; string operations and temporary
prefix-vector allocation/free are bounded semantic stubs. This verifies the
choice rule, not a whole entity's recursive native loading lifecycle.

## 3. Priority category input contracts

The following are supported static routes, not universal category rules:

| Route | Descriptor/model input | Palette/texture input | Overrides and limits |
| --- | --- | --- | --- |
| Owned ship assignment `55cb20` | Resource seed pair copied into `global + 23850 + shipIndex * 48` | Same pair passed to custom working object via `11480a0`; default preparation/task path already connected | Explicit descriptor IDs, part strings, edited colors and texture options can replace generated choices |
| Active owned multitool `553600` | Selected owned record pair at `2c0`; resource handle at `290` supplies filename | Same pair into `global + 2f910`; category argument `2`; task via `13f6d30` | Offer, accessory and assembled record paths remain distinct |
| Freighter cache/appearance `549af0 -> 542440 -> 549380` | Source resource at `170`, seed pair at `1a0/1a8`, copied to cache `2d8`, seed `308/310` | Separate source pair `200/208` copied to cache `2b0/2b8`; enabled palette generation uses mode All | Disabled palette flag copies current context palette; index overrides and custom alpha overlays are separate |
| New freighter source setter `5417f0` | Incoming resource at `d0`, seed pair `100/108`, copied into source resource `170` | Incoming pair `160/168` copied into source `200/208` | Incoming second resource at `118` and other fields are copied separately; do not label every pair from offsets alone |

Two instruction-checked direct calls to `5417f0` occur in root `aea590`, numeric
message branch `0x19`, using the message object as source. This is an update-message
route; the message's named schema and every upstream writer remain unverified.
It closes one upstream pair-copy link, **not** the serialized owned freighter's
`GcFreighterSaveData.HomeSystemSeed -> runtime palette` association. The separately
known serialized offsets `4c8/4d0` must not be equated with message `160/168`.

Default ship/tool inputs can therefore share one seed for pieces and texture
preparation in the audited owned route. A freighter can have independently supplied
model and palette seeds, plus custom overrides. Supplying one number everywhere
would hide this distinction and cannot be accepted as an exact appearance oracle.
Class, inventory size, acquisition semantics and delivery are independent of
these recovered appearance routes.

## Reproduction and evidence

Use existing portable tools; no installation, extraction or full autoanalysis:

```powershell
python runtime/research/emulate-appearance-context.py `
  --executable "E:\SteamLibrary\steamapps\common\No Man's Sky\Binaries\NMS.exe" `
  --python-tools "$env:LOCALAPPDATA\NMSCourier\research-tools\python" `
  --emulator-tools "$env:LOCALAPPDATA\NMSCourier\research-tools\unicorn-2.1.4" `
  --output E:\NMS-Courier-Research\seed-analysis-180383\appearance-context-new.json
python -m unittest discover -s runtime/research -p test_descriptor_seed_evaluator.py
```

Requires private Unicorn 2.1.4/Capstone 5.0.5; used Python 3.14. Seven bounded
original windows, exact fingerprint check, 1 MiB heap, 64 KiB stack, 50,000
instructions/one second per call, maximum 1,024 stub calls, 32 nodes and depth 16.
Unapproved execution addresses abort. The script does not execute the original
Windows binary or make host OS/import calls. Reports use new external filenames.

Portable selections are `appearance-material-*-180383.md`,
`appearance-freighter-source-writers-180383.md`,
`appearance-freighter-input-callers-180383.md`,
`appearance-context-loaders-180383.md`, `appearance-child-writers-180383.md`
and `appearance-child-methods-180383.md` in `runtime/research`.
The initial ten bounded function stages produced 26 rows; three resumed stages
added ten rows, all decompiled successfully. Additional selections are
`appearance-scene-population-180383.md`, `appearance-scene-child-population-180383.md`
and `appearance-scene-filter-180383.md`.
`scan-scene-child-fields.py` reproduces bounded offset leads: 2,592 fragments,
64 candidates and 14 explicit coverage skips. These are neither type identities
nor file/storage failures.
The separate data-reference stage exports no functions and is deliberately not
imported as function evidence by navigation.

External reports under `seed-analysis-180383`:
`appearance-context-loader-corrected-20261004.json`, `material-resource-table-final-20261004.json`,
`material-and-filter-instructions-20261004.json`, `descriptor-inclusion-body-20261004.json`,
`freighter-source-writes-20261004.json`, `scene-child-field-writers-20261004.json`,
and `freighter-input-callers-20261004/`. Resumed evidence includes
`scene-loader-type-literals-20261004.json`, `scene-child-filter-instructions-20261004.json`,
`scene-child-filter-body-20261004.json`, `scene-child-vector-addresses-20261004.json`,
and the one-mismatch `appearance-context-loader-final-20261004.json` (retained).
These are transient evidence, not Git assets.
The owning [experiment log](EXPERIMENT_LOG.md) records failures and rejected leads.

Continuation: [recursive selection and owned inputs](SEED_RECURSION_AND_OWNED_INPUTS.md)
adds 273 matching complete-recursion cases across nineteen model roots, the named
owned-freighter palette field and material cache/context identity. It supersedes
the pending owned-field association below; it does not close the unrestricted
natural resource loader or all caller contexts.

Next work should connect the recovered loaded-tree order to actual scene child
construction/material associations, replay the complete recursive descriptor
path with controlled resource resolution, and identify the owned freighter
palette writer independently of the message path. Then join these contracts to
the previously verified merged selector. Rendering and inverse constraint search
remain separate gates; this pass does not generate a promised exact whole-entity seed.
