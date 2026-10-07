# Alternate procedural palette branch

Superseded constant/routing statements: [palette task inputs](PALETTE_TASK_ROUTING.md)
recover the file-backed magenta fallback, add 404 native-literal comparisons,
16 dispatch comparisons and connect explicit task inputs to search.

Checkpoint: 2026-10-05 UTC (2026-10-04 local). The previously unimplemented
alternate color route now has an explicit-input port and **404 matching
original-instruction comparisons**. It is connected to bounded appearance
search. This closes a concrete arithmetic/scheduling gap, not all natural color
inputs or native rendering. No live game, save, mod or bridge was accessed.

## Recovered behavior

The previously exported `62e4e0` collection and `62e780` row were inspected
beyond their split unwind prologues. Approved complete windows are
`62e4e0..62e775` and `62e780..62eb62`, exclusive ends. The first prologue-only
inspection yielded 17 instructions; the body/return inspection added 395.
Decompiler parameter lists are not used as public runtime ABIs.

The row consumes two multiply/carry draws for **every attempt**. With a positive
collection flag, present palette buffer and mode `_8` (enum 3), the index is
`second >> 29`. Otherwise it is `(first >> 29) * 8 + (second >> 29)`.
The other mode fields do not use the base branch's `_1`/`_4`/`_16` remapping.
Color lookup is direct from the selected 64-entry row, including Inactive mode.
A missing palette buffer uses the pinned magenta fallback; fixtures may override it.

For each sample, the RGB distance to every preceding sample uses float32
subtraction/multiplication, `B² + (G² + R²)` with rounded additions, then a
rounded square root. Alpha is not part of that distance. A distance strictly
less than the runtime threshold rejects the sample. Each rejection consumes
two fresh draws; there are at most 64 attempts per sample. At the cap the last
sample is retained even if it remains similar. This differs from the base
branch, whose retry changes an index without consuming fresh random draws.

The collection generates all 66 families in order, five samples per row, then
mixes a two-draw child seed from the resulting state. Rows 32, 35, 34, 37, 33
and 36 are regenerated from the **same reset child state**, not a progressing
shared state. The alternate route does not reuse the base branch's saved Paint
state for Freighter or its Grass reseeding schedule. A disabled collection
returns without touching the output; the fresh-output port rejects that case
instead of inventing colors. Disabled seed pairs still use the recovered
initializer `(1, 0)` when the collection itself is enabled.

## Comparison evidence and limits

Pinned offline executable build 180383 SHA-256:
`671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.
Corpus palette binary SHA-256:
`3521862b5b2bfb33afe3a8a5bf5a15b6b60ff60327656ec4f7ca9d5e590b9c4e`.
The base bank is supplied as an explicit fixture collection, not asserted to be
the natural collection selected by every alternate task.

Original code runs only in private Unicorn 2.1.4 memory, using the existing
Capstone tool directory. Unknown execution addresses and external instructions
are rejected; there are no host imports or game calls. Private heap is 1 MiB,
stack 64 KiB, each row at most 50,000 instructions/one second, each full
collection at most 2,000,000 instructions/two seconds. IO reads at most a
128 MiB hash-pinned executable and the existing hash-pinned palette bank.

- 384 row cases: four seeds (0, 7, Pirate seed, max uint64), six modes,
  thresholds 0/float32(0.1), present/null palettes, counts 1/5 and enabled/disabled
  collection flag. Exact RGBA, selected indices, final state and draw count match.
- 16 full collection cases: four seeds, enabled/disabled seed pairs, thresholds
  0/float32(0.1). All 330 RGBA/index outputs match, including race reseeding.
- Four disabled collection cases preserve every byte of a sentinel output and
  consume zero row draws.

The threshold at RVA `525d910` is runtime state. Fallback RGBA at `4b2f8d0` was
initially unresolved, then recovered as file-backed magenta (see superseding
checkpoint). This earlier comparison supplies `(0.25, 0.5, 0.75, 1)` as its fixture
fallback and zero as the SIMD padding lane; neither is inferred game data.
An existing Ghidra database reference query found one READ of the threshold and
three READs of the fallback, no writer. Owners were unavailable in that database.
This query's incompleteness does not prove no writer exists. Do not replace
these values with fixture defaults in a native appearance prediction.

Seven unit tests cover capped retries, zero threshold, `_8`, differing base-mode
semantics, reset race states, disabled output and mandatory finite parameters.
Nine existing search, three base-palette and six primitive tests also pass.

## Search integration and reproduction

The [bounded search](APPEARANCE_SEARCH_AND_RECIPE.md) defaults to `base` as before.
Select the new path explicitly in the request:

```json
{
  "palette_branch": "alternate",
  "palette_parameters": {
    "similarity_threshold": 0.1,
    "fallback_rgba": [0.25, 0.5, 0.75, 1]
  }
}
```

These fields supplement the existing request; they are research inputs, not
the natural settings of the pictured ship. Missing threshold/unknown parameters fail;
fallback omission now selects the pinned magenta constant.
Reports retain branch, rounded parameters and evaluator/palette fingerprints.
Recipes still carry candidate evidence and use the existing preview importer.

```powershell
python runtime/research/emulate-alternate-palettes.py `
  --executable "E:/SteamLibrary/steamapps/common/No Man's Sky/Binaries/NMS.exe" `
  --corpus E:/NMS-Courier-Research/corpus `
  --python-tools "$env:LOCALAPPDATA/NMSCourier/research-tools/python" `
  --emulator-tools "$env:LOCALAPPDATA/NMSCourier/research-tools/unicorn-2.1.4" `
  --output E:/NMS-Courier-Research/seed-analysis-180383/alternate-comparison-NEW.json
python runtime/research/validate-alternate-search.py `
  --corpus E:/NMS-Courier-Research/corpus `
  --output E:/NMS-Courier-Research/seed-analysis-180383/alternate-search-NEW
python -m unittest discover -s runtime/research -p test_alternate_palettes.py
```

Outputs must be new and external. The three-category integration check generated
bounded requests for Fighter, ordinary multitool and Pirate freighter, examined
eight seeds in each, and recovered the anchor `0x7`. Ship/tool each had one
candidate; the Pirate descriptor/fixed HomeSystemSeed constraints matched all
eight examined model seeds. This is evidence of independent channels and
non-uniqueness within that range. It is not proof of class, slots or delivery.
This regression uses the same forward evaluators to construct constraints;
the independent native comparison is the separate 404-case matrix.
The unchanged base request still finds `0x7` after eight candidates.

Reports in external `seed-analysis-180383`: `alternate-palette-windows-20261005.json`,
`alternate-palette-body-20261005.json`, `alternate-palette-comparison-final-20261005.json`,
`alternate-search-final-20261005/report.json`, `base-search-regression-20261005.json`.
Global reference evidence is in `acquisition-180383/alternatepaletteglobals20261005-export`;
selection source: `alternate-palette-data-180383.md`. Earlier reports are preserved.

## Corrections and next targets

The initial inspector invocation omitted its required hash and failed before
reading the executable. A literal query for the threshold failed because it is
not file-backed. Prologue-only exports were expanded to body/return fragments.
The first search-regression report falsely marked three mismatches because JSON
lists were compared directly to Python tuples; normalizing the representation
produced three matches. Seeds and colors did not change. No corpus or disk error.

Next trace the runtime threshold writer and category-specific palette bank/source
flag values. Initial task routing and precomputed bypass are now mapped in the
superseding checkpoint.
Then connect those explicit inputs to natural material assembly. DDS masks,
decals as pixels, shaders and a complete appearance inverse remain open. Do not
repeat this closed matrix without a changed implementation or new boundary.
