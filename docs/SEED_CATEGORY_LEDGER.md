# Procedural seed category ledger and next research steps

Checkpoint: 2026-10-05. Latest user priority, in order: **ships, multitools,
freighters**. NPC research already completed in this increment is preserved;
further NPC work is deferred. Use [AI continuation](AI_CONTINUATION.md) first.
Build 180383 SHA-256:
`671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.
This ledger separates declarations, instruction comparisons and integration.
None extends runtime delivery compatibility.

## What a seed decides, per priority category (2026-10-06, Claude Code)

The user's product goal, restated on 2026-10-06: the frontend offers actions
such as "generate a pirate freighter" and must produce a good-looking, complete
entity without the user typing seeds, while still accepting explicit seeds.
That requires the forward rule of every seeded property for ships, freighters
and multitools, so the application can choose seeds by desired outcome.

| Seeded property | Inputs | Status |
| --- | --- | --- |
| Model parts | Scene descriptor, model seed | Ordered recursive selection ported and instruction-compared (see below); natural caller context partly open; renderable per seed through [the scene exporter](MODEL_PREVIEW_RESEARCH.md#native-scene-export-and-seed-selected-renders-2026-10-06) |
| Colors | Palette seed (home-system seed for freighters), palette bank, flags | Base and alternate generators ported; bank and threshold state open |
| Textures and decals | Model seed streams, material bindings | Restricted selector compared; full composition open |
| Class C/B/A/S | Seed, solar-system wealth row | Ported and instruction-compared: [inventory class](INVENTORY_CLASS_RESEARCH.md) |
| Slot grids | Size-type table, class, requested count | Rule read; live override validated for freighter offers |
| Special slots | Store seed, class, size-type limits | Rule read; live all-slot marking validated for freighter offers |
| Installed technologies | Store seed, slots, wealth row, class argument, technology tables | Selection and procedural upgrade statistics ported and instruction-compared: [default technology](DEFAULT_TECHNOLOGY_RESEARCH.md); natural caller arguments and boosted-roll percentage open |
| Name | Entity seed (ship seed; freighter model seed), ship type or weapon class | Original routines run under emulation and reproduce two names known from the game: [name generation](NAME_GENERATION_RESEARCH.md); caller arguments and build 180836 strings open |
| Base stats | Store seed, class, ship or weapon class row | Ported and instruction-compared (71,264 cases): [inventory class](INVENTORY_CLASS_RESEARCH.md#base-stat-generation-ported-2026-10-06-offline); natural caller arguments and the range-pair byte open |

Scene-specific fact, from the 180383 corpus descriptors: the pirate freighter
scene has **one group with one option** (`_PIRATEFREIGHTER_`), while the
ordinary freighter scene has 48 groups and 98 options and the capital scene 34
groups and 48 options. Evaluating the pirate descriptor for model seed
`0x8C968767B3282F13` selects that single option
(`pirate-descriptor-hayasenn-20261006.json`). For a pirate freighter the model
seed therefore cannot change the hull; what varies is color (home seed), name,
class, slots and technologies. For ordinary and capital freighters, ships and
multitools the model seed also selects parts.

Pirate freighter color chain, read from the 180383 corpus and evaluated with
the existing base-palette candidate (`evaluate-entity-inputs.py --base-palettes`,
route `owned_default`, report `hayasenn-inputs-20261006.json`):

- The scene's hull materials use the shared procedural textures
  `textures/space/shared/largetilingpanels` (layers BASE: Metal/Primary,
  PAINTED: PirateBase/Primary, ALTPANELS: PirateBase/Alternative1) and
  `largetilingpanelsalt` (BASE: Metal/Primary, MAINCOLOUR:
  PirateAlt/Alternative2, COLPANELS: PirateBase/Alternative1, and a STRIP layer
  with five alternatives, all PirateAlt/Primary). The remaining materials are
  glow, light-card, shield and shadow materials with fixed textures.
- So a pirate freighter's seeded look is the Metal, PirateBase and PirateAlt
  palette families (from the home seed) plus which of five strip textures is
  chosen (a texture-selection draw, not evaluated here).
- For home seed `0x175000B001FFD` the base-only candidate gives PirateBase
  `#696761, #212324, #5B595A, #393836, #6B6E6F` and PirateAlt
  `#949494, #C58A64, #074861, #BD3535, #DA5858` (five colors per family in
  generator order). Mapping "Primary/Alternative1/Alternative2" to positions
  0, 1, 2 is the usual reading of the enum and is **not verified** here; the
  generator itself is the partial base branch whose bank and threshold state
  remain open. The dark grey hull seen in the user's screenshot of this
  freighter is compatible with the PirateBase values; that is a visual
  impression, not a measurement.

Order of work that follows from this table: complete installed technologies
(procedural table), then name generation, then a single forward "seed profile"
command per category that joins parts, colors, class, slots and technologies,
and only then outcome-driven seed search for the frontend.

## Catalog and rule status

`build-priority-appearance-catalog.py` indexes existing corpus data read-only.
Current catalog: 293 descriptor sources, 1,665 groups, 3,709 alternatives,
87 shallow scene candidates, 343 texture sources and 17 explicitly unclassified
descriptors; 6,777,077 source bytes read. Shared sources are not unique entity
types. Corvette has a scene entry but no sibling descriptor; no Corvette
seed constructor is asserted. Support/legacy scenes remain candidates.

| Active category | Descriptor sources / groups / alternatives | Established subset | Remaining natural appearance boundary |
| --- | --- | --- | --- |
| Ships | 154 / 664 / 1,685 | Ordered recursion, explicit/filter helper comparisons, source-associated owned/purchase input routes, partial base/alternate colors, selected decal/texture rules | All gift/preset/custom resource variants, actual palette bank/threshold state, complete material masks and shader composition |
| Multitools | 19 / 301 / 764 | Ordered recursion and explicit parts, owned Resource input, compared weapon textures, Weapon-to-NULL mapping, UseLegacyColours source-to-task association and explicit research input | Initializer argument-7 caller values, offer/accessory/staff contexts, complete material bindings/geometry |
| Freighters | 56 / 355 / 588 | Ordered recursion, named model vs HomeSystemSeed split, partial generated colors and distinct custom overlays, selected paint/decal rules | Other offer/preset palette sources, exact bank/material assembly, final native appearance; S class/slots are separate systems (class draw: [inventory class research](INVENTORY_CLASS_RESEARCH.md)) |

Group records preserve ancestor guards, ordered alternatives, reference paths,
raw XML Chance and recovered Name weights. They now also expose exact uint32
draw intervals for the **enabled, unfiltered integer multiply-high branch**:

`ceil(A*2^32/W) <= draw < ceil(B*2^32/W)`.

Zero-weight entries have no interval. All-zero groups have no default weighted
draw. This is a per-draw constraint, not an appearance inverse: initializer,
draw schedule, filters, child streams and reference conditions still matter.
Intervals do not apply to the separate float32 texture-weight branch. Tests
check interval boundary values against multiply-high selection independently.

The shared [explicit color research](CUSTOMISATION_COLOR_RESEARCH.md) adds
309 original-instruction comparisons, with zero divergence, covering category
lookup, RGBA quantization and final alpha overlay. Do not conflate customized
RGBA with seed-generated color. Source flags select or bypass palette generation.

## Preserved NPC checkpoint, deferred by latest instruction

NPC archive: 11 racial/named root descriptors and 53 shared character-part
descriptors, 345 groups/672 alternatives. Gek, Vy'keen, Korvax, Fourth, Fifth,
Robot, Nada, Polo, Settler, SpecialShop and Unique roots have **33 original
recursive comparisons**, zero mismatches/failures, seeds 0/7/max uint64.
Roots contain head, body and accessory branches with nested guards; races are
separate resources, not a proven universal set of seed bit fields. Shared parts
must not be labeled exclusively NPC-owned.

`inspect-npc-appearance-tables.py` pins three table hashes and catalogs nine race
entries (some empty), 24 named NPCs, 60 placement declarations, 13 customisation
presets and 17 color groups. Preset groups are raw declarations requiring native
transformation, not final descriptor IDs. XML-decimal colors remain candidates.

`npc_supplied` joins independent model, palette and second material pairs to
11 bounded descriptor/scene traces, all successful. It never claims a natural
NPC spawn caller. NPC seed search requires an explicit palette branch/task and
keeps the supplied palette pair fixed while searching model seeds. The committed
NPC search fixture returns `0x7` in a one-candidate bounded replay; it is an
integration check, not a native inverse oracle. NPCs cannot use owned_default.

The user supplied [NMSeeds NPC examples](https://www.nmseeds.club/Seeds/Search/npc.html).
The page provides Gek/Vy'keen/Korvax seed/color examples labeled Beyond/NEXT;
these are historical visual references, not build-180383 algorithm evidence.
Do not infer current colors or head/body selection from old screenshots.

## Concrete continuation order for any AI

1. **Multitool alternate flag callers:** `UseLegacyColours` is source-associated
   through runtime `+2bd -> serialized +281 -> literal 34f1430`. Initializer
   `552730` writes argument 7; copy `553af0` preserves it. Direct edges now
   identify `8ebad1` (argument from frame byte `+2b78`) and `13f8340` (literal 1).
   Read `tool-legacy-caller-windows-20261005.json` before another scan/export;
   identify their object/context semantics and the frame-byte producer using
   `tool-palette-callers-180383.tsv`. Preserve split-fragment ownership and do
   not assign a universal default. The color note gives the exact evidence
   chain and bounded command; whole caller/bank state remains unresolved.
2. **Ship/freighter working palette:** preserve source flag `+70`, edit marker
   `+71`, family-43 post-edit fallback and the distinct freighter overlay.
   Track both bank population and alternate threshold initialization; no automatic
   base branch for an unknown caller. Read the color note and task-routing note.
3. **Whole material composition:** join natural scene/reference traversal,
   material identity, linked/gameplay-filtered textures, decal masks and shader
   inputs. Closed pieces/helpers must not be repeated to substitute for this gap.
4. **Forward-to-inverse acceptance:** run desired parts/colors/decal constraints
   only after all required forward channels are known. Current bounded search
   returns candidates, not arbitrary exact appearance seeds or impossibility
   proofs. Explicit customization must remain distinguishable from seed-only.

No live testing is required for these next offline inspections. Every AI must
update the owning note, experiment log and continuation guide as required by
[AGENTS.md](../AGENTS.md), including failed hypotheses and exact next commands.

## Reproduction and evidence locations

```powershell
python runtime/research/build-priority-appearance-catalog.py `
  --corpus E:/NMS-Courier-Research/corpus `
  --output E:/NMS-Courier-Research/seed-analysis-180383/catalog-NEW.json
python runtime/research/inspect-npc-appearance-tables.py `
  --corpus E:/NMS-Courier-Research/corpus `
  --output E:/NMS-Courier-Research/seed-analysis-180383/npc-tables-NEW.json
python runtime/research/evaluate-entity-inputs.py `
  --corpus E:/NMS-Courier-Research/corpus `
  --inputs runtime/research/npc-input-fixtures-180383.json --base-palettes `
  --output E:/NMS-Courier-Research/seed-analysis-180383/npc-inputs-NEW.json
python runtime/research/search-appearance-seeds.py `
  --corpus E:/NMS-Courier-Research/corpus `
  --request runtime/research/npc-search-fixture-180383.json `
  --output E:/NMS-Courier-Research/seed-analysis-180383/npc-search-NEW.json
python runtime/research/emulate-descriptor-recursion.py `
  --executable "E:/SteamLibrary/steamapps/common/No Man's Sky/Binaries/NMS.exe" `
  --corpus E:/NMS-Courier-Research/corpus `
  --models-file runtime/research/npc-recursion-models-180383.json --corpus-only `
  --python-tools "$env:LOCALAPPDATA/NMSCourier/research-tools/python" `
  --emulator-tools "$env:LOCALAPPDATA/NMSCourier/research-tools/unicorn-2.1.4" `
  --output E:/NMS-Courier-Research/seed-analysis-180383/npc-recursion-NEW.json
```

NPC commands are preserved reproduction, not the next active priority.
Reports stay external under `seed-analysis-180383`: `priority-catalog-intervals-20261005.json`,
`npc-tables-20261005.json`, `npc-input-traces-20261005.json`, `npc-recursion-20261005.json`,
`npc-search-20261005.json`, `priority-search-regression-20261005/report.json`.
The last report passes ship/tool/Pirate alternate search, preserving `0x7` after
eight seeds for each. Reuse these reports unless the implementation changes.
Ports/manifests remain in the repository; no game assets, saves or pseudocode
exports are committed. No game/mod/bridge/corpus mutation or disk repair occurred.
