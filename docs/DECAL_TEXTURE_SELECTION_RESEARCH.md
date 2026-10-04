# Decals and procedural texture selection

Checkpoint: 2026-10-04. Offline executable build 180383, SHA-256
`671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.
Read [AI continuation](AI_CONTINUATION.md) for portable research instructions and
[appearance texture flow](APPEARANCE_TEXTURE_SEED_FLOW.md) for earlier material
bindings. This pass identifies a genuine random consumer and implements only
its bounded first pass. It does not recover the complete entity appearance.

Continuation: [native selector emulation](TEXTURE_SELECTOR_EMULATION.md) now
closes fallback/base matching for a restricted fresh single-resource case,
with 468 native comparisons across 18 resources/35 layers. The initial findings
below are retained; its later-pass gaps are superseded only for that subset.

## Distinguish three mechanisms

Decals can be alternatives in a procedural texture declaration, geometry/parts
selected through descriptors, or explicit customisation records. Finding a logo
in one mechanism does not establish an equivalent model seed in another. A
logical DDS path selects texture content; palette family/channel selects a tint
payload. Masks, average colors, material flags and shaders determine the pixels.
The existing GLB workshop applies uniform mesh tint; it does not render these
native decal masks. No renderer change or gameplay test occurred in this pass.

## Selected data

`appearance-decal-assets-180383.txt` selects eight exact corpus resources.
`inspect-texture-palettes.py` read 64,924 bytes, inspected all eight, and retained
binary/XML hashes. They contain ten nonempty layers and 33 alternatives.
Paths below are relative to `textures/common/spacecraft/`.

| Resource | Alternatives and palette binding |
| --- | --- |
| `shuttle/shared/shuttledecalsheet.texture.mbin` | OVERLAY: PROC0 Rock/Primary, PROC1 Paint/Alternative2; BASE: DECALS1/DECALS2 Rock/None. |
| `industrial/shared/decals/stripe_single.texture.mbin` | SPLIT, DOUBLE, SINGLE: Freighter/Primary. |
| `shared/decals/logo.texture.mbin` | FACTION4..FACTION1, CIRCLE, BASIC: Paint/Alternative1. |
| `industrial/shared/decals/small_stripes.texture.mbin` | DOUBLE: Freighter/Primary. |
| `shared/decals/decalpaint.texture.mbin` | COATING, PANELS, PAINTED: Paint/Alternative4; nonuniform probabilities. |
| `shared/decals/patterns.texture.mbin` | RIDGED, BASIC, SHAPE2, SHAPE1: Paint/Alternative1. |
| `shared/decals/smalldecal.texture.mbin` | OVERLAY: Rock/Primary; BASE: E,D,C,B,A Metal/None. |
| `shared/decals/freighterlogo.texture.mbin` | Six logos: Paint/Alternative2, despite the filename; not the Freighter palette family. |

These declarations have layer probability 1, empty groups/links and no base
matching. Most option weights are 1; decal paint demonstrates why alternative
selection cannot simply use descriptor integer weighting. `None` does not mean
that the final visible texture is black.

## Native preparation and correction

Four new sequential export stages completed six manifest rows, zero failures:

| Stage | Committed selection | Roots |
| --- | --- | --- |
| appearancecontext20261004 | appearance-texture-context-180383.tsv | 63f290 |
| appearanceselectwriter20261004 | appearance-texture-selection-writer-180383.tsv | 62ebd0 |
| appearanceselectcallees20261004 | appearance-texture-selection-callees-180383.tsv | 62f940, 631310, 631f80 |
| appearancelayercollection20261004 | appearance-texture-layer-collection-180383.tsv | 62fba0 |

Worker `6388a0`, state 5, calls `62ebd0` with the prepared palette pointer,
selected seed pair and context flags. It can choose task seed 0x138/0x140 or
the alternate 0x198/0x1a0 pair under flags. These are exact-worker offsets,
not portable entity fields. `62ebd0` uses `62f940`/`62fba0` to merge layer and
option records, then `631310` for fresh selection. Existing nonempty context
can instead reach refresh `631f80`; it is not necessarily a new random roll.

**Correction to the earlier checkpoint:** `63f290` creates the decimal cache key
at task 0x230, not the alternative selection list. It hashes prepared record
fields, selected RGB values converted with 255, and a 32-byte context block,
then formats through `%u`. Constant 0x1b873593 alone does not establish the
complete hash algorithm. The initial TSV candidate label is historical.

## Recovered first-pass arithmetic

`631310` initializes the previously recovered multiply-with-carry stream:
enabled state uses low(seed) or 1 and carry
`ror32(low(seed),16) XOR high(seed) XOR low(seed)`; disabled state is (1,0).
Advance computes `t = low * 0x5a76f899 + carry`, retaining low32(t) and high32(t).

For a collected layer, probability is the float32 average of its occurrence
probabilities. If positive, a draw determines presence. Convert the uint32 draw
to double, multiply by constant bytes `000010000000f03d` at RVA 4b251f8, then
round to float32. This constant is approximately `1/(2^32-1)`, so the rounded
upper endpoint can equal 1. Compare strictly `< probability`.

When present and not matching a base layer, take a second draw, even for one
option. Average each option's weights across merged occurrences, sum weights,
multiply the rounded fraction by that sum with float32 arithmetic, and select
the first strict cumulative boundary. Four-or-more alternatives use an unrolled
sum. Inspection of `6314e0..63155c` establishes ordered scalar `divss`/`addss`
operations, not four parallel accumulators. For the supported single occurrence
and nonnegative weights, the candidate preserves that float32 order; it accepts
up to the existing 256-option inspection budget. The earlier conservative
rejection of four-or-more options was lifted after checking the instructions.

The inspected color branch uses selector 6 (MatchGround), or an override flag,
to copy a caller color. Selector 7 (None) writes zero RGBA. Selectors 0..3 index
that family's first four 16-byte samples. Selectors 4/5 use sample 3 in this
branch. Consequently Alternative4/Unique alias sample 3 here; this is not a
claim that every native consumer treats them identically. Public enum agreement
comes from pinned [TkPaletteTexture](https://raw.githubusercontent.com/monkeyman192/MBINCompiler/0e81c91aa51c78d7aa3e298e9ba7532bd0c7c49c/libMBIN/Source/NMS/Toolkit/TkPaletteTexture.cs)
and [TkProceduralTexture](https://raw.githubusercontent.com/monkeyman192/MBINCompiler/0e81c91aa51c78d7aa3e298e9ba7532bd0c7c49c/libMBIN/Source/NMS/Toolkit/TkProceduralTexture.cs),
not an inferred current-build ABI.

Later code performs compatibility/fallback matching against loaded resources
and additional base-matching draws. These passes are not ported. Output order,
group merging, gameplay-name conditions and this later state consumption must
be resolved before calling a result the final native texture choice.

The continued static read identifies two later loops. For each loaded resource,
the first examines layers with empty/BASE group identifiers and alternatives.
It searches prepared rows for matching layer/group, choice identifiers and
palette selector/family. When no compatible row exists it can append a fallback
selected from gameplay-name conditions; IgnoreName accepts the first compatible
alternative, rather than making another weighted roll in that fallback. The
second loop advances the random state for collected rows and applies a presence
test plus the base-match flag before copying a compatible BASE/empty-group
choice. Thus even an unchanged visible choice does not prove unchanged random
state. Negative search indices, fallback defaults and merge precedence still
need instruction-level checks before a safe full port. Do not silently return
the first-pass state as the next consumer's native input.

## Reproduction and observed candidate result

Use the existing read-only corpus, no extraction:

```powershell
python runtime/research/evaluate-texture-options.py `
  --corpus E:\NMS-Courier-Research\corpus `
  --asset textures/common/spacecraft/shared/decals/decalpaint.texture.mbin `
  --texture-seed 0x7 --palette-seed 0x7 `
  --output E:\NMS-Courier-Research\seed-analysis-180383\decalpaint-first-pass-new.json
python -m unittest discover -s runtime/research -p test_texture_option_evaluator.py
```

Output must be new and external. It is marked first-pass/experimental, with
explicit caller seeds; neither is inferred from a ship seed. Groups, links,
base matching, gameplay-name filters and explicit palette indices are rejected.
It uses the pinned base palette candidate, not the
alternate palette bank. No DDS assets enter Git.

Seed 7 produced presence/choice draws 2034748470 and 648109128, selecting COATING
with Paint/Alternative4 mapped to sample 3. A second report evaluated the two
shuttle decal layers, then a batch evaluated all eight resources/ten layers.
Seven tests passed: upper endpoint, zero probability,
two-draw consumption for one alternative, zero weight, unsupported contexts,
the observed selector alias and ordered rounding across an unrolled block.
These are tooling checks, not game fixtures.

External evidence under `E:\NMS-Courier-Research\seed-analysis-180383`:
`decal-bindings-20261004.json`, `texture-selection-constants-20261004.json`,
`texture-selection-probability-20261004.json`, other bounded instruction reports,
`decalpaint-first-pass-20261004.json`, `shuttle-decals-first-pass-20261004.json`
and `decal-first-pass-batch-20261004.json`.
The native project contains each stage's `manifest.tsv` and pseudocode.

Historical next target: collection order/merging and 631310 compatibility.
The emulation continuation above closes the restricted single-resource subset;
native merged collection remains open. Continue there,
then correlate actual caller seeds per category. Only then combine selected
DDS masks with materials in the
viewer. No full seed inverse, native preview fidelity, new delivery capability
or runtime compatibility is established.
