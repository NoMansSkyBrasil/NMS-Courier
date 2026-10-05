# Explicit customisation colors and category palette lookup

Checkpoint: 2026-10-05, offline executable build 180383, SHA-256
`671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.
Active priority is ships, multitools and freighters. This closes concrete explicit
color rules; it does not close natural procedural appearance or its inverse.
Read [the category ledger](SEED_CATEGORY_LEDGER.md) for remaining work and
[palette task routing](PALETTE_TASK_ROUTING.md) for generated/precomputed dispatch.

## Recovered rules

`11480a0` consumes supplied customisation data and a category/PaletteID. Lookup
`5a6210` reads the customisation palette table from manager `+ca518`:

1. A nonempty 16-byte ID overrides category mapping, matching both uint64 halves.
2. Empty ID maps category indices 0..25 through the table's 26 ID records.
   Category 26 explicitly skips that mapping.
3. Search the palette vector at `+1a0`, count `+1a8`, stride `440`, ID at `+430`.
   First matching record wins. Missing ID takes the mutable global fallback path.

The pinned asset is `metadata/gamestate/playerdata/customisationcolourpalettes.mbin`,
SHA-256 `29410ccb0918d4dddb483757d2f819100eeed046b192a4acc1287d6a77188387`.
It contains 18 palettes. The port verifies the binary hash, category/ID/mode
against XML and reads **binary float32 colors**, not rounded XML decimal text.

| Supplied customisation category | Index | Empty-ID palette | Quantizer count |
| --- | --- | --- | --- |
| Weapon | 2 | NULL | 0, preserves supplied RGBA |
| Ship01..06 | 3..8 | SHIP | 64 |
| Freighter | 15 | FREIGHTER | 64 |
| Ship07..12 | 17..22 | SHIP | 64 |
| PirateFreighter | 23 | PIRATEFREIGHTER | 64 |

These are customisation enums, not generic spawn categories or ship class values.
Explicit nonempty IDs can select other declared palettes, including SHIP_METALLIC.
No mapping from every ship resource to a customisation index is inferred here.

The one-edit quantizer at `11483a0..1148449` implements:

- NumColours counts `(0,1,4,8,16,64)`; inactive count 0 leaves RGBA unchanged.
- First candidate with all four absolute float32 component differences at most
  `1/256` wins immediately, even if a later candidate is an exact match.
- Otherwise minimize four-component squared distance using float32 SSE reduction
  `(R² + G²) + (B² + A²)`. Alpha participates. Strict improvement retains the
  earlier candidate on an equal distance.
- Store at working `+90 + family*70 + slot*10`, then set working byte `+71`.

This differs from the generated base palette's RGB-only distance and reduction
order. Do not reuse that routine for edited colors. Literal `4a2ecf0` holds
counts, `4b2ec80` holds four tolerance lanes and `4b26f90` holds maximum float32.

Final overlay at `114851d..1148608` visits 66 families and five slots in order.
An edited slot is used only when alpha equals exactly 1. Otherwise use the
corresponding slot at working `1360..13a0`, family 43 in this layout. Output starts
at `+1d70`, retaining stride `70`. `11499c0` also contains this overlay. Its
intervening descriptor/material work is not included in these comparisons.

`overlay_snapshot` accepts a complete post-transform working snapshot.
`overlay` accepts edits plus a **post-edit fallback snapshot**; family-43 final
edits must agree with it. Unknown initialization is never silently substituted.
Multiple writes to a slot use the final edit. This is not a port of the whole
setter or every customisation transform.

## Category flag association and fallback boundary

Existing `prioritycustomisationsources20261004-export` connects owned ship
`55cb20` to `11480a0` with argument 5 low byte zero in both inspected branches.
Owned multitool `553600` instead passes selected record byte `+2bd`, with
customisation category 2. Setter stores argument 5 at working byte `+70`;
`1149fe0 -> 637db0 -> 6377e0` propagates it to palette-task byte `+1c9`.
Zero chooses base generation; nonzero chooses alternate generation, unless
explicit colors/precomputed state bypass initial generation. Do not assume every
tool uses base generation. The selected record's named flag is now associated
with **UseLegacyColours**, through the following independent metadata chain.

`551de0` exports selected owned-tool record byte `+2bd` to output byte `+281`.
Existing metadata serializer `2a126e0` reads that same output offset and emits
the field named by literal RVA `34f1430`, exactly `UseLegacyColours`. Four
instruction-checked RIP references to the literal were found; only this reused
serializer association is required here. The other three references are not
assumed to own the same runtime record.

Owned-tool initializer `552730` stores supplied argument 7 at `+2bd`, beside
model pair `+2c0` and customization `+2d8`. Slot-copy path `553af0` preserves
the byte. These source associations identify the field but **do not establish
the values supplied by each initializer caller**, offer/gift routes, or the
whole natural palette bank. Offset `+2bd` is not a globally valid layout.
Scan candidates `551500/551630` contain overlapping vector/word copies but are
not promoted to owned-tool identities merely because offsets match.

Follow-up direct-call scan found two checked edges (first-fragment E8/E9 scope;
indirect/split edges may be missed). Windows-x64 call-site inspection shows:

- `8ebd21` in fragment `8ebad1` passes argument 7 at `[rsp+30]`, loaded from
  byte `[rbp+2b78]`. The frame's owning object/source remains unresolved.
- `13f8de3` in `13f8340` stores literal byte 1 at `[rsp+30]` before the call.
  It selects the legacy flag for this path; the path's semantic identity and
  complete incoming context are not established.

Evidence: `tool-legacy-callers-20261005.json/callers.json` (the scanner output
is a directory despite its suffix), `tool-legacy-caller-windows-20261005.json`
(two windows, 964 decoded instructions) and `tool-palette-callers-180383.tsv`.
These fragments do not establish universal natural multitool flag values.

Research input `use_legacy_colours` is optional, strictly boolean, and allowed
only on the source-associated owned multitool route. Missing means unknown;
no inferred false value. Bounded search derives the task flag from this input,
requiring supplied `global_mode` and `precomputed` values in `palette_task`.
An additional conflicting `alternate_flag` or `palette_branch` is rejected.
Precomputed and mode-5 states reject generated-color seed inversion. Alternate
search still needs an explicit similarity threshold. Neither model nor material
seed channels change when this flag changes.
The joined trace's optional base-only output is omitted for a supplied true flag,
with an explicit rejection reason; its descriptor/material trace remains valid.

These category associations are source evidence, not whole-caller emulation.
Existing freighter `542910 -> 549380` preserves an independent palette pair and
a distinct generated/custom overlay. It must not be replaced with a single
ship-style model seed. See [entity flow](ENTITY_APPEARANCE_SEED_FLOW.md).

Unmatched-ID fallback initializer `2748ac0` fills 64 entries from file-backed
white RGBA `(1,1,1,1)` at `4b2f9e0` and writes mode 0. This is constructor/source
and raw-literal evidence, **not proof of the mutable global object's runtime
state**. The port still rejects unmatched IDs. Its native lookup fixtures capture
that branch before GS/TLS access; no host initializer or global state is faked.
The initializer has no containing unwind entry: the bounded inspector rejected
it. Ghidra decompiled the selected leaf; do not fabricate an unwind owner.

## Implementation, evidence and reproduction

- `evaluate-customisation-colors.py`: hash-pinned loader, matched category/ID
  lookup, quantizer and explicit snapshot overlay; new external-output CLI.
- `emulate-customisation-colors.py`: original instruction windows in Unicorn
  2.1.4, private 1 MiB heap/64 KiB stack, at most 50,000 instructions/one second
  per case; rejects unapproved execution. No host imports or game access.
- `customisation-palette-lookup-180383.tsv`: bounded Ghidra selection, including
  the independently exported fallback initializer.
- `test_customisation_colors.py`: boundary, alpha, tie, duplicate-write,
  fallback-conflict and invalid-input checks.

Native comparison: **309 cases, zero mismatches**: 222 quantizer cases, 40 final
overlays (13,200 output RGBA records), 47 lookup cases (26 category defaults,
18 explicit IDs and 3 captured unknown-fallback cases). Controlled colors include
inclusive tolerance and the adjacent float32 value, all six modes and four alpha
conditions. All 18 corpus palettes participate. This is independent original
instruction comparison for the stated windows, not a live appearance oracle.

External evidence in `E:/NMS-Courier-Research/seed-analysis-180383`:
`customisation-colors-full-20261005.json`, `customisation-lookup-window-20261005.json`,
`customisation-quantizer-windows-20261005.json`, `customisation-flags-20261005.json`,
`customisation-fallback-literal-20261005.json`. Reports preserve source/window
hashes. Initial 222-case report remains historical. Ghidra exports are under
`acquisition-180383/custompalette20261005-export` and
`custompalettefallback20261005-export`; runs use Ghidra 12.1.4/Temurin 25,
existing project Acquisition180383, no autoanalysis, two CPUs, 4 GiB heap,
120-second guard and 20 GiB free-space reserve. No disk repairs or extraction.

```powershell
python runtime/research/emulate-customisation-colors.py `
  --executable "E:/SteamLibrary/steamapps/common/No Man's Sky/Binaries/NMS.exe" `
  --corpus E:/NMS-Courier-Research/corpus `
  --python-tools "$env:LOCALAPPDATA/NMSCourier/research-tools/python" `
  --emulator-tools "$env:LOCALAPPDATA/NMSCourier/research-tools/unicorn-2.1.4" `
  --output E:/NMS-Courier-Research/seed-analysis-180383/colors-NEW.json
python -m unittest discover -s runtime/research -p test_customisation_colors.py
```

Color CLI request fields are exactly `palette_id`, `category_index`, `edits`
and `fallback_snapshot`. Each edit requires integer `family` 0..65, `slot` 0..4
and finite four-component RGBA 0..1. Fallback contains five RGBA records.
Input limit 128 KiB/330 edits; outputs must be new and outside corpus/repository.
Use `evaluate-customisation-colors.py --corpus ... --request ... --output ...`.
Integration requests for categories 2/3/15/23 select NULL/SHIP/FREIGHTER/
PIRATEFREIGHTER respectively. Explicit colors cannot be called seed inverses.

Tool source exports: `toolpaletteflag20261005-export/{551de0,552730,553af0}.c`,
manifest `tool-palette-flag-180383.tsv`, run `run-toolpaletteflag20261005.json`.
Bounded scanner evidence: `tool-alternate-field-20261005.json` (285 fragments,
10 candidates, one skipped fragment) and `tool-legacy-name-20261005.json`
(four checked references, zero skipped owners). `tool-legacy-search-20261005/`
passes all three category searches; tool uses the named input instead of an
independently supplied task flag. This is integration, not whole-caller emulation.

```powershell
python runtime/research/validate-alternate-search.py `
  --corpus E:/NMS-Courier-Research/corpus --task-inputs --tool-legacy-inputs `
  --output E:/NMS-Courier-Research/seed-analysis-180383/tool-legacy-NEW
```

Next identify the two caller contexts and the `[rbp+2b78]` producer, using the
existing windows before exporting the new two-row caller manifest. Preserve
split-function ownership. Reproduce the bounded windows only if necessary:

```powershell
python runtime/research/inspect-native-fragments.py `
  --executable "E:/SteamLibrary/steamapps/common/No Man's Sky/Binaries/NMS.exe" `
  --sha256 671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4 `
  --rva 8ebad1 --rva 13f8340 `
  --python-tools "$env:LOCALAPPDATA/NMSCourier/research-tools/python" `
  --output E:/NMS-Courier-Research/seed-analysis-180383/tool-callers-NEW.json
```

Then trace category-specific precomputed initialization and actual material
masks/decal resources. Do not rerun
309 matching cases without changed code or a newly supported boundary.
