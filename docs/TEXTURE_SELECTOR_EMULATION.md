# Texture selector: isolated instruction comparison

Checkpoint: 2026-10-04, continued after the first-pass decal study.
Offline executable 180383 SHA-256:
`671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.
Read [decal research](DECAL_TEXTURE_SELECTION_RESEARCH.md) and
[coverage by category](SEED_RESEARCH_COVERAGE.md). This closes the restricted
fresh single-resource selector, not the full appearance algorithm.

## Method and evidence boundary

`emulate-texture-selection.py` loads bounded original instruction windows into
Unicorn 2.1.4 private memory, never into a game process. It fingerprints the
executable and copies only selected code/constants. Unapproved execution targets
abort. Container append/resize/free are explicit stubs; record initialization
runs the original instructions. The fixture manually prepares one resource and
one occurrence of each unique layer. Thus selection/compatibility comparisons
do not establish native collection, asset load order or allocation semantics.
Numeric declarations come from the hash-associated XML export and are copied
into synthetic float32 fields. The game does not load the original MBIN in this
probe; exact binary/XML float round-trip fidelity is an additional data boundary.
Palette values are supplied from the existing base candidate, so a color match
validates selection/indexing against those inputs, not every native palette bank.

| Original window | SHA-256 |
| --- | --- |
| 631310..631f78 | ce5a5dd9b006cdceb2af71a9d1d35890f640688689d2ccada727ca1299044cfe |
| 1ac7450..1ac748d | f02a7cba90096a89b9cedea38bcab5ae3ee24876f040a90ff616f3446c8284bf |
| 1ae4cf0..1ae4d05 | fda6afd1f4bd6acefd2d5b0e8d3a61d223e361bfa40575b10611d3d4d8bd5047 |

Budgets per case: 1 MiB synthetic heap, 64 KiB stack, 100,000 instructions,
200,000 microseconds, 16 resulting records and 64 container stub calls.
Maximum eight resources/eight additional random seeds per invocation. The
selection has no native OS imports, disk access, networking or game callbacks.

## Concrete corrections and closed paths

1. The native default record is white RGBA, empty choice, selector 0/family 4,
   index -1. It is not a black texture or an invented missing-color rule.
2. Compatibility scans eight layer slots until the **first** eligible nonempty
   layer whose group is empty/BASE. It processes that layer then advances the
   resource through 631c42..631c5e. It does not independently repair every layer.
   The zero-probability shuttle fixture rejected the earlier all-layers hypothesis.
3. A matching row requires layer/group, choice identifier and selector/family.
   With IgnoreName, an unmatched first eligible layer appends the first declared
   compatible option. Original unmatched rows remain in the output.
4. The later loop consumes one draw for every collected layer even if probability
   is zero or SelectToMatchBase is false. The first pass alone omits these draws.
5. SelectToMatchBase consumes a first-pass presence draw but no weighted choice.
   In the later loop it tests presence, finds a matching choice identifier from
   an empty/BASE group with the same layer name, then copies that choice with
   the destination collection's palette binding. The freighter fixture exercises
   this path and the resulting fallback duplicate.
6. Nonempty groups can be retained in the **single-resource unique-layer** case.
   They do not authorize treating merged resources independently. Linked layers,
   duplicate names, gameplay-name filters and explicit palette indices remain
   unsupported. MatchGround requires caller color and is rejected in fresh-single.

`evaluate-texture-options.py --phase fresh-single` now emits final rows, fallback
layers, later draws and selector-exit state for this subset. The default
`first-pass` interface remains available and labels its state intermediate.
This makes the bounded rule usable offline without the emulator toolchain.

## Compared matrix

Each resource used 13 seeds: 7, four boundaries, and eight deterministic random
uint64 values. Two profiles were evaluated: declared probabilities and a copied
synthetic zero-probability layer profile. Original corpus files never change.

| Matrix | Resources | Nonempty layers | Cases |
| --- | ---: | ---: | ---: |
| Ship/freighter decals | 8 | 10 | 208 |
| Multitool and ordinary/living frigate textures | 7 | 15 | 182 |
| Explorer and Warrior NPC textures | 2 | 7 | 52 |
| Freighter procedural paint/base matching | 1 | 3 | 26 |
| Total | 18 | 35 | 468 |

All cases agreed on selected first-pass names/colors, final ordered rows and
both first-pass/selector-exit RNG states: zero divergences. Caller seeds,
palettes and collected resources were supplied fixtures; this is not 468 natural
spawn validations, current game rendering, or full category coverage.
Ten tooling tests cover rounding, unsupported contexts, fallback order,
nonbase groups and base matching. No new UI capture/gameplay test occurred.

## Owned-resource input chain

The existing exports plus four newly inspected bounded fragments connect the
default owned-resource route:

```text
owned ship/tool writer -> working customisation seed at offset 0
1149020, no explicit descriptors -> 2d63670 -> prepared pair at +10/+18
1149fe0 -> 637db0 -> 6377e0 -> 227a40
prepared pair +10/+18 -> task +138/+140
worker state 0 -> base/alternate palette preparation, unless supplied palette
worker state 5 -> same default pair -> 62ebd0 -> 631310
```

`227a40` copies the prepared pair into the descriptor/task block, without a new
random draw in that copy. In this default task route, 1149fe0 passes the alternate
flag as zero, so state 5 does not select +198/+1a0. This connects the default
working seed to texture selection. The ship writer 55cb20 and tool writer
553600 are separately documented in [entity seed flow](ENTITY_APPEARANCE_SEED_FLOW.md).
An explicit descriptor branch instead sets the prepared seed disabled at
2d636b0. A supplied edited palette bypasses state-0 generation through task state
1. Therefore this propagation does not justify assuming the model seed always
controls all visible colors or all offers/NPCs/freighters.

New bounded instruction evidence:
`texture-owned-task-inputs-20261004.json` (four fragments/241 instructions).
Previous exports were reused; no new Ghidra stage or full extraction was needed.
The freighter's separate palette seed, indices and owned customisation route
remain as recorded in the entity note; natural NPC seed origin is still open.

## Reproduction and next targets

See [pipeline commands](../runtime/research/README.md). External evidence in
`E:\NMS-Courier-Research\seed-analysis-180383`:
`texture-selector-matrix-20261004.json`, `texture-tool-frigate-matrix-20261004.json`,
`texture-npc-matrix-20261004.json`, `texture-freighter-base-matrix-20261004.json`,
and bounded compatibility/default/return/input fragment reports.
Reports contain asset hashes and native window hashes; keep them external.

Continue at 62fba0 native collection/merge equivalence, then the resource order
provided by 62f420. Link category callers to prepared inputs; do not reopen the
completed cache-key investigation. Next independent work is selected DDS masks
and shader composition. No runtime support, new delivery, full inverse, all NPC
families or whole visual seed oracle is claimed.
