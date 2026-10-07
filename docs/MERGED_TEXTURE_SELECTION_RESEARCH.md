# Ordered multi-resource texture selection

2026-10-04, offline build 180383, executable SHA-256
`671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.
This continues [collection](TEXTURE_COLLECTION_RESEARCH.md) and
[single-resource selection](TEXTURE_SELECTOR_EMULATION.md). The objective remains
chosen parts, colors and decals to a reproducing seed. This closes a restricted
forward stage, not the complete appearance inverse.

## Recovered sequence

The original `62f940` wrapper visits explicitly supplied resource rows in order,
then the eight layer positions in order. It calls `62fba0` to construct the
merged choice space before `631310` consumes the texture random stream.

1. Collect Name/Group layers and Name/selector/family alternatives with float32
   sums and occurrence counts; preserve first indices and encounter order.
2. Average collected probabilities by occurrence count. Perform the first
   presence/option draws with the recovered float32 cumulative-choice rule.
3. Return to each resource's original declarations to check compatibility.
   For the tested IgnoreName subset, the first eligible empty/BASE group matters.
   A same-name alternative with different selector/family can require fallback;
   collection alone is insufficient to predict the final rows.
4. Perform later draws for collected groups, including zero-probability groups.
   Base matching can copy an existing base choice/color while retaining the
   destination group. Compare the exit state, not only the first-pass state.

`evaluate_fresh_resources` reconstructs these stages. `--merged` in
`emulate-texture-selection.py` executes the original wrapper, collector, group
copy constructor and full selector consecutively in private Unicorn memory.
It compares collection records, first-pass records, final ordered records and
random states. Source fixtures are copied; game/corpus files are not altered.

## Comparison evidence

Six bounded configurations, five profiles and thirteen seeds each produced
**390 cases with zero collection, first-pass, final-row or state divergences**:

| Configuration | Resources in supplied order | Payload | Cases |
| --- | --- | --- | --- |
| Forward decals | Eight entries in `appearance-decal-assets-180383.md` | 0 | 65 |
| Reverse decals | Same entries reversed | 0 | 65 |
| Tool/freighter | First four priority weapon textures, then freighter paint | 0 | 65 |
| Repeated paint | Freighter paint twice, then logo | 0 | 65 |
| Pattern bundle | Logo, patterns, decalpaint | 0 | 65 |
| Alternate payload | Same repeated-paint bundle | 1 | 65 |

Profiles: original declarations; zero layer probabilities; uneven float32
layer/option probabilities; additional base-matching flags; and one-option
unnamed layers with the root mode flag. Seeds: 7, 0, 1, `ffffffff`,
`ffffffffffffffff`, plus eight deterministic `Random(180383)` samples.
Thirteen distinct resource inputs span selected ship decals, weapon textures
and freighter paint. These are synthetic combinations, not complete models.

Forward/reverse comparisons differed in selected choice/color multisets in
**64/65 cases**, after sorting rows to exclude mere output-order differences.
Resource order affects random consumption and matching, not just presentation.
This is not evidence for any natural scene's actual resource ordering.

Payloads 0 and 1 use different declaration/output slots. Existing `62ebd0`
exports initialize each payload from the supplied seed pair separately;
do not continue payload 0's RNG state into payload 1. The repeated-paint fixture
agrees on both paths, but natural payload resources and semantic labels remain
unproven. A separate current-source single-resource regression passed 26 cases.
Twenty-three tooling unit tests passed; these are not gameplay tests.

## Unnamed-layer exception

The wrapper passes the declaration byte at `+0x240` into the collector.
The inspected XML root exposes `AlwaysEnableUnnamedTextureLayers`. With that
fixture byte nonzero, exactly one option and an empty layer Name, the collector
bypasses existing-layer matching and appends a separate row. Empty option lists
still contribute nothing. The reconstructed collector now preserves this rule.

All 131 inspected catalog texture roots have this field false. The true-mode
comparison is synthetic; no naturally loaded true-mode resource was observed.
The field association follows the inspected schema and wrapper offset, not a
new runtime ABI guarantee or independently traced binary converter.

## Resource order: located boundary, unresolved producer

Existing worker and loader exports show state 4 calling `62f420`, then state 5
waiting for resources before `62ebd0`. `62f420` resolves a resource handle,
handles a proxy branch, and calls virtual slot `+0xd8` for an ordered handle
vector. It iterates that vector forward and appends context rows of stride
`0x228`, retaining fixed asynchronous-load indices for the two payloads.
No alphabetical sort was observed at this stage. `62f940` preserves row order.

The concrete implementation of that virtual producer is not identified.
An exact-executable bounded RTTI search found `cTkResource` and manager/base
types but no concrete scene/model/material resource type. Following the base
type's COL/vtable candidate yielded non-code data at the presumed `+0xd8` slot;
this lead was rejected rather than assigning an invented function name.
Next: identify the concrete resource producer and correlate its ordered
materials with selected descriptor/reference paths. Do not sort XML asset paths
and call that the native order.
The subsequent [REA/Ghidra investigation](REA_GHIDRA_ASSESSMENT.md) decompiles
the proxy lookup/reference acquisition helpers and rejects both as the producer.

## Isolation, fingerprints and rejected attempts

Python 3.14, private Unicorn 2.1.4 and Capstone 5.0.5. Per emulated call:
100,000 instructions and 200,000 microseconds. At most eight resources,
sixteen merged groups, 256 options/group, 32 selected records, 64 collector calls
and 512 stub calls/case; 1 MiB heap and 64 KiB stack. Unknown targets abort.
Container append/resize/copy/free are bounded stubs. Empty resource-path
substring checking is a dedicated private stub; no host import executes.

The additional wrapper window `62f940..62fb9a` hashes to
`2a048aee44e328bec13bae96bfd63a148b12d3e46d91f322888f3f79ae6c63cf`.
Other windows are recorded in the reports and owning collector/selector notes.
The selected wrapper disassembly contains 146 instructions across entry, body
and return fragments. Original Ghidra exports were reused; no re-extraction.

The first private import-pointer fixture used a mistyped RVA `3401140` and
failed with `UC_ERR_WRITE_UNMAPPED` before execution. RIP-relative decoding
established `3411140`; the corrected private stub passed. No game memory or
source file was touched and no failed comparison report was written.

## Open requirements for exact requested seeds

- Natural resource ordering and descriptor conditional/reference scheduling.
- LinkedLayer, gameplay-name filters, explicit palette indices and alternate
  palette/caller contexts. These unsupported fixtures fail explicitly.
- Exact category inputs, including freighter HomeSystemSeed/custom colors;
  supplied palette rows are not proof of every natural caller schedule.
- Binary/XML numeric fidelity, DDS masks, geometry, shader/decal composition.
- Complete forward appearance validation followed by an inverse solver that
  verifies every requested constraint; unsupported or unreachable combinations
  must not be reported as successful seeds.

Do not add earlier component-case counts to these 390 and label the sum complete
appearances. No game process, saves, installed bridge/mods, D: disk or BitLocker
were accessed or modified. External reports are transient evidence under
`E:\NMS-Courier-Research\seed-analysis-180383`:
`priority-merged-{forward,reverse,tools,repeat,patterns,payload-one}-20261004.json`,
`texture-single-regression-20261004.json`, and the three
`texture-resource-order-{wrapper,body,return}-20261004.json` instruction reports.
Portable sources and commands are in the [pipeline README](../runtime/research/README.md).
