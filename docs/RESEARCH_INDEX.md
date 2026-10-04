# Research navigation index

Start here when locating a delivery mechanism, data field, source function, or
offline analysis artifact. Read [experiment evidence](EXPERIMENT_LOG.md) before
running any integration test. A location or matching name is not a verified API.

For a category/subcategory map of seed systems, including parts, colors,
world generation and procedural items, read [the seed systems overview](SEED_ALGORITHM_EXPLAINED.md).

For the 2026-10-03 checkpoint and resumed investigation, read the
[seed research handoff](SEED_RESEARCH_HANDOFF.md): offline method, completed
fauna exports, flora dependencies, failures and exact continuation point.
Then read [planet/fauna seed flow](PLANET_FAUNA_SEED_FLOW.md) for the 2026-10-04
native child-stream order, named fields, scale/fur and resource seed overrides.
All completed fauna/planet stages are included in the navigation metadata.

For seed-to-parts, inverse search and native descriptor candidates, read
[procedural seed research](PROCEDURAL_SEED_RESEARCH.md). The descriptor collector
preserves conditional choices; it does not invent a seed algorithm.

The seed research now includes reward model/seed presets, bounded appearance
dependency graphs and native palette arithmetic. Start with
`inspect-seed-presets.py`, `build-appearance-graph.py` and
`procedural-seed-primitives.py`; none is a complete seed-to-appearance evaluator.
Arithmetic/palette/caller export stages retain per-candidate failure status.

For upgrade/product seed enumeration, package identifiers and native forward
oracle design, read [the Pi assessment](PI_PROCEDURAL_ITEM_RESEARCH.md).
Its version-specific upstream hooks are research clues, not current-build APIs.

## Function lookup

For 3D preview feasibility, NMSMV source and public image/seed comparisons, read
[the preview assessment](MODEL_PREVIEW_RESEARCH.md). The curated TSV and
`compare-seed-observations.py` retain ambiguous cases and never score unfinished
palette/descriptor traces as verified appearances.
The same assessment covers HGPAKTool selective archive access and the supplied
Journal video: colors change while its displayed seed stays fixed. This is
preview evidence, not proof of a recovered seed algorithm or new delivery.
Its GLB workshop checkpoint maps the implemented importer, renderer and external
Royal acceptance harness; native Fighter conversion remains open.
Its color checkpoint maps the hash-pinned base-palette adapter, per-part preview
controls and `validate-palette-preview.cjs`. Use `inspect-texture-palettes.py`
for explicit texture alternatives and `Palette`/`ColourAlt`/`Index` bindings;
do not map an entire material to a single palette sample by guessing.

For the supplied NoMansApp HTML, MetaIdea tooling and hybrid delivery choices,
read [the service assessment](METAIDEA_SERVICE_RESEARCH.md). Its selected-function
inspector avoids repeatedly dumping embedded assets. The independent C#
`InspectNativeCandidates.cs` verifies current-build PE bounds and candidate bytes;
it does not attach to or modify the game.

For current-build executable findings, start with
[native acquisition research](NATIVE_ACQUISITION_RESEARCH.md). The external
navigation index now includes 161 successful, unverified native pseudocode
candidates, including a reward-entry dispatcher and purchase-state handler.

For delivery mechanisms that do not require an offer screen, read the
[alternative-route assessment](DELIVERY_ALTERNATIVES.md). It compares native
rewards, direct acquisition, owned-entity upgrades, scoped generation and bridge
choices; schema names remain clues rather than verified freighter APIs.

[The repository function map](RESEARCH_SOURCE_FUNCTIONS.md) lists Courier's Python
definitions and C signature candidates with file and line links. It includes tests
and fixtures; it does not label them as native game functions. The current scan
contains 93 source files and 273 function entries across `runtime/research` and
`runtime/native/asi`. C#, PowerShell, headers, Java, and manifests appear as files in
the searchable index; their functions are not parsed by this scanner. There are
163 native function entries overall; the failed 61f4e0 and 120a790 exports remain explicitly
indexed. One additional native analysis-run record preserves the resource-lookup
export timeout without calling it a decompiled function. Source-only refreshes
preserve imported data/native metadata instead of repeating full corpus imports.

| Research question | Start with | Relevant symbols or evidence |
| --- | --- | --- |
| Startup and executable verification | [startup probe](../runtime/native/asi/startup_probe.c) | `startup_worker`, `sha256_file`; exact-build rejection |
| Central game callback and one-shot events | [callback probe](../runtime/native/asi/native_callback_probe.c) | `observe_update`, `resolve_target`, `courier_probe_after_verified` |
| XInput forwarding | [proxy](../runtime/native/asi/xinput_proxy.c) | Loader forwarding; separate from delivery logic |
| Carbon insertion | [Carbon adapter](../runtime/native/asi/carbon_delivery_179666.c) | `courier_deliver_carbon_500`, injectable fixture variant |
| Inventory validation and Carbon quantity | [inventory snapshot](../runtime/native/asi/inventory_snapshot_179666.c) | `courier_readable_range`, `courier_snapshot_carbon`, `courier_prepare_carbon_500` |
| Native currency reward dispatch | [currency adapter](../runtime/native/asi/currency_reward_179666.c) | `courier_currency_reward_target`, `courier_dispatch_currency_reward` |
| Current-build reward call observation | [reward observer](../runtime/native/asi/reward_observer_180383.c) | Armed `f12240` entry trace; ten raw slots, no native call or pointer dereference; live sampling pending |
| Free freighter offer dispatch | [offer adapter](../runtime/native/asi/freighter_offer_179666.c) | `courier_dispatch_free_freighter_offer`; configuration remains experimental |
| Temporary generation-table changes | [scoped generation](../runtime/native/asi/scoped_freighter_table_179666.c) | `courier_with_scoped_freighter_generation`; rollback and fixture checks |
| Scoped reward dispatch | [scoped reward](../runtime/native/asi/scoped_freighter_reward_179666.c) | `courier_dispatch_scoped_freighter_reward` |
| Offered versus owned inventories | [state reader](../runtime/native/asi/inspect-freighter-state.py) | `inspect_store`, `inspect_special_slots`, `inspect_process` |
| Offer transition observations | [watcher](../runtime/native/asi/watch-freighter-offer.py) | Existing exact-build read-only diagnostic; do not execute on an unknown build |
| Executable function inspection | [inspection tool](../runtime/native/asi/inspect-executable-function.py) | Existing build-specific static inspection |
| Batch extraction and XML search | [corpus tool](../runtime/research/bulk-game-data.py) | `safe_destination`, `xml_symbols`, `replace_symbols`, `search` |
| Bounded extraction rebuild on E: | [three-table pilot](../runtime/research/extract-mbin-pilot.py) | C: staging; new E: output; serial conversion and readback hashes |
| Storage monitoring during the full rebuild | [storage watcher](../runtime/research/watch-extraction-storage.ps1) | E:/disk-1 checks; verified worker PID; preserved interruption evidence |
| Reward schemas and model references | [schema summarizer](../runtime/research/summarize-delivery-data.py) | `reward_evidence`, `flatten`; bounded samples with reward IDs |
| Gift, upgrade and acquisition alternatives | [route collector](../runtime/research/research-delivery-routes.py) | Bounded generic-reward variants, source ZIP hashes; no runtime mutation |
| Offline native candidate export | [Ghidra exporter](../runtime/research/ExportDeliveryCandidates.java) | String references and pseudocode; function identities remain unverified |

The `_179666` adapters belong to the older tested executable. The newer offline
fingerprint is build 180383, SHA-256
`671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.
Do not reuse old addresses merely because a name matches in this index.

## Game-data lookup

Search logical asset paths in the corpus index first. Each PAK has its own
hash-qualified extraction directory; duplicate paths do not establish load order.

| Logical asset or search term | What to inspect |
| --- | --- |
| Unexpected generated or reward class | `runtime/research/audit-generation-inputs.py` audits extracted class inputs and reward ID collisions without process/save access; see the 2026-10-02 experiment entries |
| `METADATA/REALITY/TABLES/REWARDTABLE.MBIN` | Reward IDs, payload type, gift flags, requested inventories, cost; `GcRewardSpecificShip`, `GcRewardSpecificWeapon`, `GcRewardMoney` |
| `METADATA/REALITY/TABLES/INVENTORYTABLE.MBIN` | Class probabilities, generation bounds, freighter size entries, special-slot inputs; `ClassProbabilities`, `FreighterLarge` |
| `METADATA/SIMULATION/SPACE/AISPACESHIPMANAGER.MBIN` | AI model resource paths, ship classes and roles; `FREIGHTER_CAPITAL_PIRATE` |
| `MODELS/COMMON/SPACECRAFT/INDUSTRIAL/PIRATEFREIGHTER.SCENE.MBIN` | Shipped Pirate scene referenced by the AI model table; not proof that a reward generates that model |
| `GcRewardInventorySlots`, `GcRewardFreighterSlot`, `GcRewardShipSlot` | Slot reward payloads, selection flow and cost references |
| `GcRewardInstallTech`, `GcRewardMultiSpecificTechRecipes` | Installed technology versus learned recipes; these are distinct operations |
| `GcRewardOSDMessage`, `GcRewardAction` | Explicit messages versus native reward triggers; a displayed message is not delivery evidence |
| `EMOTEMENU.MBIN` | Source-mod menu wiring; Courier does not require registering a new menu button |
| `GCBUILDABLESHIPGLOBALS.GLOBAL.MBIN`, `GCFLEETGLOBALS.GLOBAL.MBIN`, `FRIGATETRAITTABLE.MBIN` | Supplied-mod clues for buildable ships and frigates; see [the inspected mod mechanisms](RESEARCH_AND_DECISIONS.md) before treating them as per-offer freighter settings |

The independent [Pirate reward variant](../runtime/mods/freighter_pirate_model_research/README.md)
is an uninstalled offline serialization experiment. Other variants and their
live results are indexed by [the experiment log](EXPERIMENT_LOG.md).

## External analysis artifacts

These are reproducible outputs, not repository dependencies or shipped assets.

| Relative to `D:\NMS-Courier-Research` | Contents |
| --- | --- |
| `corpus/index.sqlite` | Source PAK/asset hashes, logical paths, conversion failures and XML symbol search |
| `corpus/report.json` | Batch progress, executable/compiler fingerprints, per-archive results |
| `corpus/archives/<archive>-<hash>/` | Extracted assets, converted MXML and conversion logs |
| `evidence/delivery-data-180383.json` | Bounded reward examples, freighter models and generation fields |
| `native-180383/run.json` | Native analysis input fingerprint and invocation/result metadata |
| `native-180383/headless.log` | Import, analysis and export diagnostics |
| `native-180383/export/function-index.tsv` | Discovered function RVA, generated name and address count |
| `native-180383/export/string-references.tsv` | Delivery-related strings and referring addresses |
| `native-180383/export/candidates.tsv` | Candidate RVA, name, export status and associated terms |
| `native-180383/export/functions/<rva>.c` | Offline pseudocode for exported candidates; no runtime safety claim |

On the 2026-10-01 navigation attempt, corpus SQLite reads returned `disk I/O error`,
the corpus report was not valid JSON, and native report/export reads failed.
Consequently the generated navigation snapshot imported repository source only;
it did not invent native function entries or assert a completed corpus. The last
documented successful corpus checkpoint had 64,705 converted/indexed assets and
one conversion failure. Storage recovery and the eventual native result remain
separate from creating this navigation map.

Follow-up diagnosis mapped D: to physical disk 0, which had repeated Windows
System event 51 I/O errors. The entire corpus report was zero-filled. Read-only
CHKDSK and reliability-counter queries were denied by OS privileges. Originals
remain preserved in place; see [the storage diagnosis](EXPERIMENT_LOG.md#2026-10-01-external-research-storage-diagnosis-repair-blocked-by-os-privileges)
before writing or rebuilding the external corpus. General Healthy status did not
rule out these observed read failures.

## Rebuild and search

The completed E: rebuild contains 194,641 extracted entries and 106,482 converted
and indexed MBINs across all 97 PAKs. One conversion failure remains:
`metadata/inputtest.mbin`. Start with `E:\NMS-Courier-Research\SUMMARY.md` for
format and per-archive counts; `navigation/SUMMARY.md` adds topic counts.
`delivery-evidence.json` summarizes three delivery-related tables. Reproduce the
general summary using `runtime/research/summarize-corpus.py --corpus
E:\NMS-Courier-Research\corpus --output E:\NMS-Courier-Research\SUMMARY.md`.
The combined navigation index is `E:\NMS-Courier-Research\navigation`; it includes
all data filenames, Courier source functions, and 35 unverified native candidates
from `E:\NMS-Courier-Research\acquisition-180383`. The current import has no
warnings; the older unavailable-native snapshot remains historical evidence.

```powershell
& "$env:LOCALAPPDATA\Python\pythoncore-3.14-64\python.exe" runtime/research/build-research-index.py `
  --output E:\NMS-Courier-Research\navigation --query 'freighter' --limit 10
```

The commands below use the current E: research configuration.

The [navigation generator](../runtime/research/build-research-index.py) combines
repository source metadata, readable corpus file records, and available Ghidra
function exports into `navigation.sqlite`, `navigation.json`, and `SUMMARY.md`.
It never copies XML contents or pseudocode. Each import is transactional; an
unreadable source is excluded and recorded as a warning instead of producing a
misleading partial count. Topic labels are keyword routing hints, not confirmed
function identities. Keep the combined output outside the repository and inputs.

When the external research directory is readable:

```powershell
python runtime/research/build-research-index.py `
  --output E:\NMS-Courier-Research\navigation `
  --corpus E:\NMS-Courier-Research\corpus `
  --native E:\NMS-Courier-Research\acquisition-180383 `
  --source-summary docs/RESEARCH_SOURCE_FUNCTIONS.md

python runtime/research/build-research-index.py `
  --output E:\NMS-Courier-Research\navigation --query 'freighter' --limit 10

python runtime/research/build-research-index.py `
  --output E:\NMS-Courier-Research\navigation --query 'courier_dispatch*' `
  --kind source_function --limit 10
```

Queries return source path, line, RVA when supplied by Ghidra, scope fingerprint or
archive hash, and extraction status. The default limit is ten; maximum is 100.
Use the original [corpus FTS search](../runtime/research/README.md#token-efficient-research)
for XML property values; navigation indexes filenames and function metadata.
Read only the matched file section next, rather than sending full tables or
disassembly to an assistant.

The snapshot is not updated automatically. Regenerate it when new exports or source
functions arrive. `navigation.json` records generation time and generator SHA-256.
Run `python runtime/research/validate-navigation-index.py` to repeat the synthetic
import, search, provenance, rebuild, and partial-import rollback checks.

For procedural seeds, start with [the owning research notes](PROCEDURAL_SEED_RESEARCH.md).
The index now imports six `procedural*-export` stages, from task creation to
automatic descriptor selection. Search `Descriptor` or `Generation task` before
scanning exports. `procedural-seed-primitives.py` and its assembly replay tests
cover integer arithmetic only; they do not expose an appearance/delivery capability.
