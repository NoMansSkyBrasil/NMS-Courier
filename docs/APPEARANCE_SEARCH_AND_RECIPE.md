# Appearance search and preview recipes

Checkpoint: 2026-10-04. Stages 4–5 now have a bounded implementation: appearance
constraints produce replayed candidate seeds, and explicit recipes apply mesh
visibility and palette samples in Electron. Neither stage is complete for native
appearance. This is offline research, not a delivery API or packaged solver.

## Search contract

Update: [alternate palette research](ALTERNATE_PALETTE_RESEARCH.md) adds explicit
`palette_branch: "alternate"` and mandatory `palette_parameters` (similarity
threshold and fallback RGBA). The default remains base; natural branch/collection
selection is not inferred. Reports retain the branch and evaluator fingerprint.

`runtime/research/search-appearance-seeds.py` uses the
[category input contract](ENTITY_INPUT_PIPELINE.md) and reads the existing corpus.
It never extracts archives or edits assets, saves, mods or process memory.
The committed fixture is synthetic configuration, not proprietary game data.

```powershell
python runtime/research/search-appearance-seeds.py `
  --corpus E:/NMS-Courier-Research/corpus `
  --request runtime/research/appearance-search-fixture-180383.json `
  --output E:/NMS-Courier-Research/seed-analysis-180383/appearance-search-NEW.json
python runtime/research/test_appearance_search.py
```

Output must be new and external, outside the corpus/repository. Request limit:
1 MiB. Required and forbidden descriptor IDs apply together. Palette constraints
specify family, sample slot 0–4, and source index and/or RGBA. RGBA is exact
unless tolerance is explicit. These are base samples, not illuminated surfaces.
Texture constraints identify layer, group and selected name together.

Search enumerates at most 100,000 candidates, returns at most 20 results and
checks a soft time budget of at most 60 seconds between candidates. It never
wraps uint64. Every match is evaluated again; changed replay rejects the result.
`next_seed` permits explicit continuation; null means the uint64 boundary.
Exhaustion means only no match in the examined range/budget, not impossibility.
Reports preserve executable, request, script and descriptor fingerprints.

Ship/tool default palettes follow the enumerated model seed. Freighter
HomeSystemSeed remains a fixed independent palette channel. Optional textures
require 1–8 explicitly ordered resources and a separate `texture_seed` pair;
this does not establish natural loader order or search independent channels.
Unsupported contexts fail through the restricted fresh-resource evaluator.
Explicit piece overrides are not inverted.

All results remain candidates: `runtime_verified:false`,
`appearance_evaluator_complete:false`, `unique_seed_proven:false`, and
`all_uint64_seeds_searched:false`. Replay establishes partial-evaluator
repeatability, not agreement with every native appearance stage.

## Explicit recipe and renderer boundary

Optional `preview_binding` supplies a GLB SHA-256 and 1–4096 unique mesh names.
Rows specify required descriptor IDs and optional palette family/slot. The first
match creates schema-1 `preview_recipe`: candidate evidence, seed, descriptor,
hash and visibility/RGBA rows. Similar names never imply a binding automatically.
Binding a root does not prove all its child geometry variants.

The workshop imports either a recipe or a report containing it. Main process
validates bounded 4 MiB JSON selected through a native dialog. Preload exposes
only `selectAppearanceRecipe()`; no renderer path parameter, raw IPC, Node or
research interpreter. Renderer receives a stripped recipe, not game layouts.

Apply requires exact GLB hash and exactly one mesh for every binding. Missing
or ambiguous targets reject the entire application before changes. Unspecified
meshes remain unchanged; named meshes receive visibility/optional RGB samples.
Apply resets global tint. Invalid/canceled imports preserve the previous recipe;
model mismatch preserves the preview. Labels exist in English, Portuguese and
Spanish and identify the partial evaluator explicitly.

This uses an existing texture-free GLB. It does not reproduce DDS pixels,
material masks, textured decals, shaders, all variants or automatic native
geometry conversion. Manual workshop controls are independent of prediction.

## Evidence and reproduction

Offline build 180383 executable SHA-256:
`671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.
No new runtime compatibility is implied. Developer tooling: CPython 3.14,
Vitest 5.0.1, repository Electron/Vite dependencies and bundled Playwright.

- Fighter fixture: eight candidates examined, result `0x7`; cockpit, engine,
  wings, left/right logo IDs and Paint slot 1/index 17 constraints matched.
- Royal fixture: eight candidates examined, result `0x7`, two explicit bindings.
  GLB hash: `9e188cf03419ecbd6e2c868c67461d381539112115ac7e5902f38a0f4314e357`.
- Nine Python tests cover constraints, color tolerance, texture group identity,
  replay failure, exhaustion, uint64 boundary and recipe generation.
- Six recipe tests cover validation, report stripping and atomic hash/mesh checks.
  Full repository Vitest run: 52 tests passed; lint/typecheck/build passed.
- Rendered Electron import/apply changed the canvas and matched bound visibility.
  Hash mismatch, invalid input and cancellation preserved state. Portuguese
  1024×720 screenshot inspection found no horizontal overflow or page errors.
  These checks establish UI behavior, not native pixels or complete assembly.

After `pnpm build`, reproduce rendered acceptance in an isolated developer
profile. The harness substitutes only the native file dialog:

```powershell
node runtime/scripts/validate-appearance-recipe.cjs `
  E:/NMS-Courier-Research/preview-models/ModelDataBase64.glb `
  E:/NMS-Courier-Research/seed-analysis-180383/appearance-preview-search-20261004.json `
  E:/NMS-Courier-Research/preview-models/recipe-acceptance-NEW `
  C:/Users/louan/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright
```

These are disposable evidence paths, not installation requirements. If the
Royal report is unavailable, create a new search request with explicit names/hash
from a compatible local GLB. Do not distribute proprietary models/corpora.

## Remaining completion gates

Stage 4 needs natural material order, current geometry conversion and faithful
DDS/mask/decal/shader composition checked against native output. Stage 5 needs
remaining forward-category contexts, efficient inversion over all independent
channels and complete forward validation. This CLI is bounded enumeration, not
a complete inverse or an Electron search service. Frigates/NPCs, guaranteed
arbitrary appearance and live delivery remain outside this increment.
