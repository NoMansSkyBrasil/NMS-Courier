# AI continuation guide

Checkpoint: 2026-10-04. This repository-local entry works with any AI that can
read Markdown; it does not depend on a globally installed Codex skill. Root
[AGENTS.md](../AGENTS.md) routes here. User conversation is Portuguese; repository
documentation/code/diagnostics are English. Read this guide first, then only the
owning documents for the selected task.

## Current objective and boundaries

Recover the procedural appearance algorithm, prioritizing ships, multitools and
freighters; frigates and NPCs are deferred: resource/category, descriptor pieces, palette
inputs, texture alternatives, decal selection and material masks. Ultimately
support accurate local previews and desired appearance delivery. The user
specifically requires user-selected parts/colors/decals to a matching seed,
not a random generator or catalog alone. See the exact-result boundary in
[priority catalog](PRIORITY_APPEARANCE_CATALOG.md). The user
permits offline analysis and existing preview inspection while unavailable for
live tests. Do not infer permission to mutate a remote/unattended game.

Delivery remains through verified live game functions; save editing is never a
shortcut. Unknown builds receive no mutations. No D: access, storage repair,
BitLocker changes or repeated full extraction is part of this work. Read existing
bounded reports/indexes instead. Preserve uncertain one-shot outcomes.

Latest checkpoint: [ordered multi-resource selection](MERGED_TEXTURE_SELECTION_RESEARCH.md)
joins original wrapper/collector/selector instructions in 390 isolated cases,
including both payload slots and the unnamed-layer exception. Next identify the
concrete virtual `+0xd8` resource-vector producer called by `62f420` and correlate
natural order with selected descriptor references. Do not repeat the completed
matrix or assume alphabetical resource order. Full appearance inversion is open.
The [REA/Ghidra assessment](REA_GHIDRA_ASSESSMENT.md) records the new two-helper
export, rejected cache/reference-count leads, pinned external tooling and exact
tool-path correction. Follow concrete object construction rather than treating
generic resource lookup as a seed/material selector.

## What exists, what has actually been established

| Area | Evidence status | Owning reference |
| --- | --- | --- |
| Electron foundations/private runtime | Implemented; clean offline end-user acceptance still open | [Project plan](PROJECT_PLAN.md), linked architecture/distribution specifications |
| Carbon and three currencies | Historical exact-build live success, native currency notifications and normal-save persistence | [Experiment log](EXPERIMENT_LOG.md); do not extend to newer builds |
| Free freighter offer | Historical C/120 cargo/30 technology offer; S/all-supercharged/Pirate delivery not established | [Native acquisition](NATIVE_ACQUISITION_RESEARCH.md), experiment log |
| Runtime observation on newer build | Observation evidence only, distinct from migrated delivery | Project plan and experiment log |
| Integer PRNG, weighted choice, immediate child mixer | Selected x64 windows checked by isolated emulation; full caller schedules incomplete | [Inversion/emulation](SEED_INVERSION_AND_EMULATION.md) |
| Child inverse | Zero-to-four initializer preimages for one immediate child branch; not a whole appearance inverse | Same note; `invert-child-seed.py` |
| Descriptor traversal | Implemented bounded default-path candidate; missing refs, filters and draw order documented; no full game oracle | [Seed research](PROCEDURAL_SEED_RESEARCH.md); `evaluate-descriptor-seed.py` |
| Base palette schedule | Implemented partial 66-family/five-sample candidate; alternate branch and entity inputs not universally verified | Same note; `evaluate-base-palettes.py` |
| Ship/tool/freighter/frigate/NPC inputs | Selected source fields/callers recovered; natural NPC generation incomplete | [Entity seed flow](ENTITY_APPEARANCE_SEED_FLOW.md) |
| Planet/fauna/flora inputs | Separate child streams, overrides and category gaps | [Planet/fauna flow](PLANET_FAUNA_SEED_FLOW.md) |
| Texture/decal channels | Restricted fresh single-resource selector compared against original instructions: 468 cases, 18 resources/35 layers; native collector/merged order still open | [Texture flow](APPEARANCE_TEXTURE_SEED_FLOW.md), [selector emulation](TEXTURE_SELECTOR_EMULATION.md), [coverage](SEED_RESEARCH_COVERAGE.md) |
| 3D workshop | GLB mesh visibility, orbit/zoom and tint implemented and rendered-tested; native DDS masks/current geometry conversion incomplete | [Preview research](MODEL_PREVIEW_RESEARCH.md) |
| Complete requested parts/colors/decals-to-seed generator | Not established | Never label partial evaluators or arbitrary mesh tinting as this capability |

Consult the historical [handoff](SEED_RESEARCH_HANDOFF.md) for the detailed
identification method. It is a chronology/checkpoint, not a claim that every
listed function is a safe live API.

## Locate existing evidence efficiently

1. Check `git status --short` and the latest commits; preserve unrelated work.
2. Read [research navigation](RESEARCH_INDEX.md) and
   [source/function map](RESEARCH_SOURCE_FUNCTIONS.md). Find the exact script,
   native stage or owning note before reading pseudocode.
3. Query external navigation SQLite/TSV using the commands in
   [pipeline README](../runtime/research/README.md). The existing corpus index is
   `E:\NMS-Courier-Research\corpus\index.sqlite`, opened with `?mode=ro`.
   Use exact logical paths or narrow `LIKE ... LIMIT` queries. Ambiguous sources
   remain explicit; do not guess precedence.
4. Native exports are in `E:\NMS-Courier-Research\acquisition-180383`.
   Use each stage's `manifest.tsv` to locate `<rva>.c`. A launcher exit code or a
   filename label is insufficient evidence. Proprietary assets/pseudocode stay
   external; only original tooling, selections and findings belong in Git.
5. Reports are in `seed-analysis-180383`; preview evidence in `preview-models`.
   These are transient local evidence. Reproducible repository commands must
   remain sufficient to regenerate selected evidence if it is unavailable.

Exact offline executable SHA-256:
`671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.
Game path: `E:\SteamLibrary\steamapps\common\No Man's Sky\Binaries\NMS.exe`.
Verify both before another offline pass; this fingerprint grants no runtime ABI.

## How the research is performed

1. Follow data dependencies: category/resource table -> descriptor -> selected
   scene/material -> texture alternatives -> palette binding -> DDS/masks.
   Do not assume one seed controls every stage.
2. Locate native candidates from pinned public references and exact metadata,
   then direct callers. Distinguish loaders, serializers, cache keys, predicates
   and genuine consumers of random state. Record rejected hypotheses.
3. Resolve PE chained unwind roots before assigning incoming parameters. Export
   a small committed TSV using `analyze-acquisition-offline.py` with the existing
   Acquisition180383 project. One Ghidra writer at a time; no reimport/analysis.
   Keep fixed CPU/memory/time/output/free-space bounds.
4. Compare pseudocode with bounded disassembly for arithmetic, constants, branch
   conditions and source offsets. Neither inferred names nor public schemas are
   current-build ABIs. A byte stride alone does not prove a semantic type.
5. Port only a recovered, explicit branch. Keep unknown inputs/selection modes
   visible. Synthetic tests check tooling; independent arithmetic agreement
   does not replace native entity fixtures.
6. Use the current 3D workshop for visual checks. Separate neutral mesh tint from
   native texture-mask composition. Record model/data hashes and screenshot
   observations; arbitrary visual edits do not prove a matching seed exists.

Research Python/toolchain paths are developer-only. Do not add them as end-user
requirements or first-launch downloads. Commands and private-tool details live
in the pipeline and owning notes rather than being duplicated here.

## Next continuation

Start with [decal/texture selection research](DECAL_TEXTURE_SELECTION_RESEARCH.md).
The previous pass mistook the task's 32-byte input for selection context without
knowing its writer. The subsequent 63f290 export shows a hash-derived cache key
over already prepared records. State-5 62ebd0 preparation now reaches the actual
631310 selector through 62f940/62fba0 collection. The bounded first-pass tool
now has `--phase fresh-single` for final restricted rows and exit state;
the fallback/base-matching subset is compared in 468 native-emulated cases.
Read [the emulation continuation](TEXTURE_SELECTOR_EMULATION.md), then
[collector continuation](TEXTURE_COLLECTION_RESEARCH.md): unlinked IgnoreName
collection now agrees in 65 native-isolated cases. Continue linking collection
to the merged full selector and resource order plus natural caller correlation.
The [priority catalog](PRIORITY_APPEARANCE_CATALOG.md) maps 229 descriptor sources
and 131 texture resources with guards/references; it is declarative, not inverse.
The default owned ship/tool task seed chain is connected in that note. Do not
retrace 630d50/6308a0/63ae70 or mistake this subset for native material rendering.
Keep explicit customisation (11499c0) separate from natural seed generation.
The owning note records the latest resolved callees and remaining target.

For another category, use the exact source-writer continuation in its owning
entity/planet note. For runtime delivery, leave this offline branch and read the
project plan plus the relevant runtime specification/experiment before acting.

## Finish each meaningful increment

- Update the owning finding and [experiment log](EXPERIMENT_LOG.md): exact build,
  committed selection/configuration, trigger/save conditions (or offline),
  observations, failures, unknowns and rollback state.
- Update this guide's current continuation only when the target changes; avoid
  copying whole reports into AGENTS.md or growing a duplicate experiment log.
- Register completed native stages in `build-research-index.py`, then regenerate
  navigation and the source/function map. Preserve explicit import warnings.
- Run checks appropriate to changed tooling/UI; docs-only changes need no app
  build. Verify selection hashes/manifests and relative documentation links.
- Commit/push authorized meaningful increments without a PR. Use
  `Co-authored-by: Codex <267193182+codex@users.noreply.github.com>`; never put
  `@codex` in the subject. Verify remote ref and clean worktree before reporting.
- Tell the user the concrete result and remaining boundary. Never report a
  candidate, partial port or queued operation as complete game functionality.
