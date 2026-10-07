# Model preview and public seed references

Newest (2026-10-06): [native scene export and seed-selected renders](#native-scene-export-and-seed-selected-renders-2026-10-06)
— any ship, multitool or freighter scene of the corpus becomes a GLB the
workshop loads, optionally reduced to the parts one seed selects.

Latest implementation: [appearance search and recipes](APPEARANCE_SEARCH_AND_RECIPE.md).
The workshop imports candidate recipes through a narrow native-dialog API and
applies explicit visibility/RGB after exact GLB hash/name validation. Rendered
Royal acceptance passed; native DDS/mask/shader pixels remain open.

Inspected on 2026-10-03. This is an offline research assessment, not an implemented
Electron preview, whole appearance oracle or runtime delivery capability.
Return to [seed research](PROCEDURAL_SEED_RESEARCH.md).

## NMSMV source assessment

The user-supplied [NMSMV repository](https://github.com/gregkwaste/NMSMV) was
cloned read-only outside Courier. Pinned revision:
`ee2ed17e79ff82ec4cfd069f33fcd2234e443e03`, dated 2025-08-20. No build,
upstream executable, game code or editor was run. No upstream source was copied
into Courier. No license file was present in its root tree; redistribution
permission remains unresolved. Preserve upstream notices if reuse is authorized.

| Concern | Exact upstream source at the pinned revision | Finding |
| --- | --- | --- |
| Desktop host | `WPFModelViewer/WPFModelViewer.csproj` | WPF, `net8.0-windows8.0`, OpenTK 4.8.2, GLWpfControl 4.2.3; `SelfContained=false`; local libMBIN/libHGPAK references |
| Descriptor selection | `MVCore/ModelProcGen.cs:29` | `parse_descriptor(Random, ...)` draws a uniform `Next` choice, recurses references and children; not the audited NMS integer PRNG |
| Active scene selection | `MVCore/Utils/NMS_Util.cs:416` | Groups underscore-prefixed children, randomizes order using `RenderState.randgen`, toggles renderability and descends into chosen parts |
| Shared random state | `MVCore/Common/Common.cs:35` | `new Random()`; no verified game-seed interface established |
| Palette construction | `MVCore/Palettes.cs:62` | Uses viewer RNG and adjacent alternative indices; do not replace the audited base-palette schedule with this approximation |
| Material binding | `MVCore/GMDL/TextureMixer.cs:134` | Reads `TkPaletteTexture.Palette` and `ColourAlt`, then recolors texture layers; useful next field/caller targets |
| Geometry parsing | `MVCore/MBIN.cs:402` | Resolves libMBIN field offsets for `TkGeometryData` layouts, buffer sizes and streams; binary compatibility must be checked against our assets |

The [README](https://github.com/gregkwaste/NMSMV/blob/ee2ed17e79ff82ec4cfd069f33fcd2234e443e03/README.md)
explicitly lists procedural generation as broken and its rendering as an
approximation. TextureMixer also contains an unresolved texture-name TODO.
Recent project conversion to .NET 8 does not prove current game-format support.
The viewer is a valuable format/rendering reference, not evidence of deterministic
seed equivalence. No supported glTF export route was established in this review.

## Preview implementation direction

Keep generation and rendering independent. A versioned appearance result must
carry model resource, descriptor IDs, source fingerprints, seed channels,
customisation/filter inputs and evidence status. A renderer then loads scene
transforms, selected mesh buffers, materials, diffuse/normal/mask textures and
recolor channels from the user's local assets. Selecting arbitrary parts for
preview must not claim that a matching seed exists.

First acceptance target: one static Fighter scene with neutral lighting and
rotation/zoom. Then show a selected descriptor subset. Only after material and
caller-seed validation should the UI label it as a seed prediction. Export to a
bounded local mesh format is an option to investigate, not an existing adapter.
The renderer receives narrow preview data through preload; no raw game paths,
Node APIs, process handles or arbitrary file reader. Any helper runtime must be
bundled; an unmodified framework-dependent WPF viewer does not meet distribution
requirements. Game assets and local preview caches remain outside source control.

A bounded dependency run for `fighter_proc.scene.mbin` reached its intentional
128-node cap: 126 converted XML nodes, two unindexed nodes, 679 edges and 551
pending resources. This is a partial dependency graph, not a rendered model.
Report: external `seed-analysis-180383/viewer-fighter-dependencies-20261003.json`.
Do not re-extract the corpus to address this cap; inspect bounded indexed routes.

## HGPAKTool and the supplied Journal demonstration

Research date: 2026-10-03. The user requested understanding, not implementation.
The [upstream archive tool](https://github.com/monkeyman192/HGPAKtool)
was inspected at `8f04bfa4b1d9785dbf545d39041932e687048332` in an external
reference checkout. Its MIT notice remains upstream. The released research
dependency is still **HGPAKtool 1.1.3**; inspecting newer source does not upgrade
Courier's pinned dependency or establish new archive compatibility.

This is already part of our offline tooling: `bulk-game-data.py` checks 1.1.3
and streams selected members through `_extractor_function`; the pilot and
research requirements use the same package. Packaged application adoption
remains subject to [catalog distribution requirements](DATA_AND_CATALOG.md).
No new game extraction or HGPAK executable was run for this assessment.

The upstream README scopes support to post-5.50 archives. This is an archive
reader, not an MBIN converter, mesh renderer or seed algorithm. Useful source
locations at the inspected revision:

| Source | Finding |
| --- | --- |
| `hgpaktool/api.py:123`, `:254` | Validates HGPAK header revision 2, then constructs member/chunk indexes |
| `hgpaktool/api.py:311` | Decompressed-chunk cache has 256 entries |
| `hgpaktool/api.py:403` | `extract_specific` looks up concrete member-path hashes; does not require whole-archive extraction |
| `hgpaktool/api.py:460` | Specific extraction accumulates requested output in memory; selective access still needs member/total-byte limits |
| `hgpaktool/compressors.py:30` | Windows uses Zstandard with 64 KiB decompressed chunks; other platform routes differ |

Use fresh, bounded reader jobs and validate missing/empty results. The current
pipeline's private streaming API needs an explicit pinned-version contract.
For a preview, read indexed scene/material/geometry/texture dependencies from
the user's installation into a private, size-limited cache. Do not ship a copy
of our extracted game assets or initiate a full PCBANKS unpack on first launch.
Keep MBIN conversion and texture/geometry decoding separate from archive access.
This is a proposed loading strategy, not an implemented preview worker.

### What the recording actually demonstrates

The local recording is 51.65 seconds, H.264, 2560 x 1376. Its SHA-256 is
`ccc059f38513a1b2407c6f258cb4a7a1cc8b5bab536a3eb804071d56cad4b90d`.
Visual review used a bounded 13-frame overview and six exact-time frames;
12 overview frames and all six targeted frames were viewed. Audio was not
transcribed. Personal browser chrome and media remain outside the repository.

| Time | Observed behavior |
| --- | --- |
| 00:00 | Localhost Journal catalogue lists fauna with scene names, seeds, descriptor chips and Fur/Underbelly/Undercoat swatches; several creature categories have thumbnails |
| 00:22 | A BIRD modal is open with Picture, 3D, Shuffle colors and Export JSON controls; the sampled preview area is blank |
| 00:30 | Picture mode displays a white/beige bird; title retains seed `0x19DD1130223A5FD3` and has the label `ash` |
| 00:40 | Picture mode displays pink/blue coloration; the same displayed seed remains, and the label is now `mix` |
| 00:46, 00:50 | 3D mode displays the pink/blue bird from different orientations, with a ground shadow and an orbit hint |

The changing colors with a stable displayed seed are direct visual evidence of
preview variation; they do not prove a new seed was calculated. The implementation
could apply an appearance override or a separate palette input. Its actual data
source, random schedule, export schema and rendering library remain unknown.
An Export JSON button is visible, but no exported contents were inspected.
Different orientations establish interactive viewing, not skeletal animation.
Blank sampled frames must not be classified as confirmed decode failures.

The supplied conversation proposes integrating HGPAKTool to load local assets
and reports a large texture footprint. It does not establish that this webapp
already uses HGPAKTool. No public source for this particular localhost Journal
app was identified in this review. Do not attempt to connect to the author's
localhost address or infer the backend from the browser tab title.

### Existing-corpus cross-check

The basename `BIRD.SCENE.MBIN` is ambiguous: the read-only index contains both
a small-bird creature scene and a buildable fossil scene. The creature candidate
is `models/planets/creatures/smallbird/bird.scene.mbin`; category and full resource
path must accompany any preview request.

Using the existing `build-appearance-graph.py` with this root and a 64-node cap
completed its supported traversal: **24 nodes, 23 edges, 212,851 XML bytes**.
Eight XML nodes were inspected, 12 DDS nodes are indexed but not decoded, and
four guessed `.texture.mbin` siblings are not indexed. These four are missing
lookup candidates, not demonstrated storage or conversion errors.
The graph is not a complete renderer dependency list: its current walker omits
geometry/animation extensions. The scene separately names
`MODELS/PLANETS/CREATURES/SMALLBIRD/BIRD.GEOMETRY.MBIN`.
No seed evaluation, texture conversion or rendered game-match check was run.

Reproduce the bounded corpus check, using a new external output filename:

```powershell
python runtime/research/build-appearance-graph.py `
  --corpus E:\NMS-Courier-Research\corpus `
  --root models/planets/creatures/smallbird/bird.scene.mbin `
  --max-nodes 64 --output <new-external-report.json>
```

The concrete next research target is a static, descriptor-selected scene with
palette bindings and local asset loading. Evaluate recorded appearance inputs
and seed-derived inputs separately; only the latter can validate the forward
seed algorithm. A color shuffle must never silently relabel a seed as matching
the new appearance.

## Implemented GLB workshop checkpoint

On 2026-10-03, Courier added route `#models` (Tool Catalog → Model workshop)
with an independently written Three.js 0.180.0 viewer. This is a static GLB
preview, not a native NMS converter or seed generator. The inspected
[ship creator](https://github.com/MetaIdea/nms-ship-creator/tree/15e962c767f8dad66a336b8dcbb3ded7a287239e)
still matches the previously recorded revision. Its HTML embeds a Royal GLB
(8,028,908 bytes, 13 meshes, no images/material declarations) and a PoliceShip
GLB (2,412,680 bytes, two meshes, four images). The default loader uses Royal.
No Fighter GLB was found in this snapshot.

`RefreshModelDisplay` selects mesh names matching descriptor strings. The color
buttons recolor all mesh materials, rather than native palette channels.
`buttonCreate` emits a Royal custom-index command; the other branch is fixed.
No complete inverse solver was established. Embedded Lua and JavaScript were
read, not executed or copied into Courier. No license file was present in this
upstream checkout; redistribution permission remains unresolved. Its HTML and
embedded models are neither committed nor bundled.

Implemented boundary and behavior:

- An Electron-owned file dialog chooses one GLB. The zero-argument preload
  method returns validated bytes, basename and SHA-256; no paths or raw reader.
- Restricted static triangle GLB: originally 16 MiB file, 1 MiB JSON, 512
  nodes/meshes, 1,024 primitives; raised on 2026-10-06 to 64 MiB, 4 MiB JSON,
  8,192 nodes/meshes/primitives, 4,096 children per node, 16,384
  accessors/views, 12 M accessor elements and 4 M mesh vertices so whole
  exported freighter scenes load. Bounded accessor and instance vertex totals. External/data
  URIs, extensions, textures, animation, skins and sparse accessors are rejected.
  Cyclic/multiply parented nodes and nonfinite positions are rejected before
  loading. This is a restricted importer, not a complete glTF validator.
- Bundled, lazy-loaded Three.js; loader also denies URL resolution. Orbit, zoom,
  pan, fit to visible meshes, named mesh visibility/filter, tint and original
  color restoration. Frames and GPU resources are released on exit.
- English, Brazilian Portuguese and Spanish locale resources, with English
  fallback. Changes are session-only. No descriptor dependencies or valid
  ship combinations are inferred, and there is no bridge/save/game mutation.

Royal was decoded from the external HTML for a local rendering test, SHA-256
`9e188cf03419ecbd6e2c868c67461d381539112115ac7e5902f38a0f4314e357`.
Electron acceptance loaded 13 meshes, selected five, filtered three wing
alternatives, changed rendered tint, orbited/zoomed and reset the camera.
Cancel preserved the loaded model; PoliceShip returned an unsupported-texture
error. Screenshots checked 1280×800 and 1024×720 windows without horizontal
overflow, including Portuguese at minimum size. No page errors were recorded.
Eight importer tests use an authored triangle, not game assets.

After `pnpm build`, reproduce with developer-installed Playwright:

```powershell
node runtime/scripts/validate-model-preview.cjs `
  <external-Royal.glb> <external-PoliceShip.glb> `
  <new-external-output-directory> <installed-playwright-module-directory>
```

The harness uses a private profile and stubs only the test process's file dialog;
production requires user selection. It asserts Royal-specific names, not general
asset correctness. Source files and screenshots remain external.

Pending: current NMS geometry/texture conversion, native material/palette
binding, descriptor-conditioned assembly, forward/inverse seed validation,
definition export and delivery integration. The native Fighter acceptance
target remains open; Royal establishes the actual renderer checkpoint.

Source map: `apps/desktop/src/main/model-preview-import.ts` owns the read/format
boundary; `src/shared/model-preview.ts` owns the import result; the renderer's
`components/model-preview-page.tsx` owns controls and `model-preview-canvas.tsx`
owns GPU resources. Locale copy is in `i18n/preview-copy.ts`. None imports NMS.py.

## Reddit visual reference review

The public [Seed Exchange](https://www.reddit.com/r/NoMansSkySeedExchange/new/)
feed and older pages yielded **64 distinct posts**, dated 2022-08-02 through
2026-09-26. This is a convenience sample, not a random or independent validation
set. Several recent posts are requests rather than published seed examples.
The web cache omitted newer 2026 posts visible in the browser. Publication date
is kept separately from collection date; none has a verified executable hash.

The committed [observation table](../runtime/research/reddit-seed-observations.tsv)
records each public post ID, date, category, seed text, review status and notes:
**34 images visually inspected**, seven unavailable images, 23 metadata-only
posts. This does not mean 64 images were viewed. No remote media downloaded or
vendored. Observations are coarse color/geometry descriptions, not RGB samples.

`compare-seed-observations.py` prepares reproducible candidates from the existing
read-only corpus. It gates malformed seeds, duplicate category/seed pairs,
unviewed images and unmapped special model routes. **26 eligible cases produced
26 experimental descriptor/base-palette traces; zero evaluation failures.**
All appearance comparisons remain explicitly inconclusive. A trace resolving is
not a visual accuracy result. No photo-based palette tuning or runtime mutation.

Concrete partial comparisons:

| Public examples | Visual observation | Candidate/asset correspondence | Interpretation |
| --- | --- | --- | --- |
| `17wxzmp`, `17wxukg`, `17wx8lr`, `17wwlg0`, `17wvx9o`, `17s9mh9` | Six haulers show four spherical containers | All choose `_WINGS_D` / `_CONTAINER_B`; the latter references `CONTAINERS/BALLCONTAINER/BALLCONTAINER_L.SCENE.MBIN` | Supports this coarse structural branch; not whole mesh/color equality |
| `17wxzmp` versus the other five | Short cab versus extended neck | `_COCKPIT_A` versus `_COCKPIT_D`; D adds `ACCESSORIES/COCKPITNECK_2.SCENE.MBIN` | Structural consistency with the photographs |
| `17drk5s` | Fan-wing hauler instead of spheres | `_WINGS_C`, referring to `WINGS/WINGSC/WINGSC.SCENE.MBIN`; no `_CONTAINER_B` | Different branch consistent with broad geometry; fan mesh still needs rendering |
| `1au1m8y` | Pirate dreadnought | `_PIRATEFREIGHTER_` | Correct category alone is a weak check; one-option root is not algorithm validation |
| `189fuhq`, `wl67ks` | Short rounded Fighter noses | Both select `_ANOSE_B`; long-nose examples select `_ANOSE_C` | Promising correspondence, pending exact mesh mapping |

Important rejected/ambiguous inputs:

- `168vxm2` has `1x...`; preserved and excluded, not silently corrected.
- `wl6cxo` and `wl6bf4` publish the same Solar seed for visibly different hulls
  and sail shapes. The red post has a comment reporting a seed error. The white
  post's comments describe a save-editor old-color override. These are community
  reports, not controlled experiments; both excluded as conflicting fixtures.
- `1e698vl` and `1ep9xs6` use Fighter flair despite visible Sentinel geometry;
  one explicitly says robot in its comments. Category cannot come from flair
  alone. The curated candidate mapping is still a research hypothesis.
- The Squid views change apparent tint with environment lighting; the yellow
  Fighter also appears green/orange in different views. Do not score literal RGB
  against shaded screenshots or pick any convenient palette color as a match.
- Pirate model type, Capital Home Seed, expedition customisation and class/slot
  metadata are separate inputs. Missing channels limit what photos can prove.

## Kezyma vault

The [Kezyma vault](https://kezyma.github.io/#/nomanssky) was inspected in the
browser because the text-only web reader exposed only the app shell. It presents
starter/preorder, expedition and Twitch catalog entries, images, seeds and exported
`.shp`, `.mlt`, `.cmp` links. No exports were downloaded, imported or applied.
Its historical slot counts and version prose are not current-build guarantees.

Useful cross-source anchors: Radiant Pillar `0xA547AB958C97E439`, Golden Vector
`0x1` with **Unique Fighter** type, Alpha Vector `0x8E8E2193DD4A9EDA`, Horizon
Omega `0xC4C9C1AABCA59FE6`. The first two agree with the reviewed Reddit posts.
The vault separately lists Creature Seed, Creature 2nd Seed, Genus Seed and
Species Seed for companions; it does not disclose their complete caller algorithm.

Next useful evidence is exact scene/mesh/material correspondence and controlled
current-build output, not more unconstrained image scraping. The committed
reference table provides repeatable test candidates when that oracle exists.

## Experimental palette workshop checkpoint

On 2026-10-03, the workshop connected color samples to independent mesh
materials. Import the extracted `BASECOLOURPALETTES.MBIN` through the native
file dialog, enter `0x` plus 1–16 hexadecimal digits, calculate samples, select
one of 66 families and five samples, and apply it to a selected mesh or all
currently visible meshes. Recalculation changes the samples, not previously
assigned colors. Restore clears per-part assignments and the global tint;
changing the model clears assignments. Invalid/canceled imports preserve the
last valid palette bank. Nothing is delivered or saved to a game save.

The main-process NMS adapter reads exactly 68,672 bytes and requires SHA-256
`3521862b5b2bfb33afe3a8a5bf5a15b6b60ff60327656ec4f7ca9d5e590b9c4e`.
No game palette data is committed or bundled. Its BigInt uint64 arithmetic and
float32 distance/retry schedule port the independent
`evaluate-base-palettes.py` candidate. The renderer receives 330 generic RGBA
samples, not the original binary or a filesystem API. Mesh materials are cloned
before recoloring so shared GLB materials cannot recolor other parts.

Preview interpretation: RGB values are treated as linear sRGB, and swatches
use the corresponding display conversion; sample alpha is not applied to mesh
transparency. This is an explicit visualization convention, **not a verified
native shader/color-space interpretation**. Per-part recoloring does not apply
multiple colors within a mesh through texture masks. The five displayed samples
are numbered; a complete native alternative-channel mapping is not claimed.

Rendered acceptance used the external Royal GLB and the supported palette bank.
All 330 samples for seed `0x7` exactly matched the independent Python report.
Per-part and all-visible recoloring changed the canvas; restore returned the
original rendered canvas. Maximum uint64 input, invalid seed rejection, canceled
and wrong-fingerprint import preservation, Portuguese labels and minimum-window
horizontal fit were checked. Ordinary Windows dialog interaction is not covered
because the developer harness stubs the dialog in an isolated profile.

```powershell
node runtime/scripts/validate-palette-preview.cjs `
  <external-Royal.glb> <extracted-basecolourpalettes.MBIN> `
  <external-Python-palette-report.json> <new-external-output-directory> `
  <installed-playwright-module-directory>
```

Source map: `main/nms-adapters/base-palette-preview.ts` owns the hash-pinned
reader and experimental schedule; `renderer/src/components/model-palette-controls.tsx`
owns localized controls; `model-preview-canvas.tsx` owns independent materials.
No end-user Python dependency is introduced. Manual local palette selection is
implemented; automatic archive discovery/extraction and packaged clean offline
acceptance are still open.

Pending: current NMS geometry conversion, selected texture options, DDS pixels,
blend masks and entity-specific seed propagation. The palette UI is a useful
comparison instrument, not seed inversion or an accurate ship generator.

On 2026-10-04, the same external Royal/palette/seed-7 acceptance was repeated
using `validate-palette-preview.cjs`; all checks passed. The part-only and
all-visible screenshots were visually inspected. They show independent mesh
tinting, with gray remaining surfaces after wing-only application; they do not
show native masked texture recoloring. See
[texture/channel continuation](APPEARANCE_TEXTURE_SEED_FLOW.md) for the ten
selected multitool/frigate/NPC bindings and rejected loader routes. Evidence:
external `preview-models/appearance-validation-20261004/report.json`.

## Native scene export and seed-selected renders (2026-10-06)

Status: **implemented research tool, rendered and inspected; not runtime
verified**. Requested by the user: use the workshop to look at what a seed
produces and improve it step by step, for every ship, multitool and freighter
category (normal, capital and pirate), not one example.

### What exists

- `runtime/research/export-scene-glb.py` converts one scene of the external
  corpus to a texture-free GLB. It reads only MBINCompiler XML already in the
  corpus: the scene graph (`cTkSceneNodeData`), geometry metadata
  (`cTkGeometryData`) and the stream container (`cTkGeometryStreamData`), and
  resolves `REFERENCE` nodes through the read-only index (default depth 3).
  No archive is extracted. Output and its JSON report must be new and outside
  the repository and corpus.
- With `--seed`, the exporter calls the existing traversal port
  (`evaluate-descriptor-seed.py`, empty caller context) and drops every node
  the loaded-node predicate rejects, so the GLB holds exactly the parts that
  port selects for the seed. Without it every alternative is present and the
  workshop's part list toggles them.
- `runtime/scripts/capture-model-preview.cjs` opens a GLB in the built Electron
  workshop and saves four orbit screenshots plus the window.
- Workshop changes: import limits raised (list above), softer lighting and a
  tighter camera fit in `model-preview-canvas.tsx`. The eight existing import
  tests pass; `pnpm build` passes.

### Format facts read from the corpus (build 180383 data)

- A stream entry holds `MeshDataStream` = vertex bytes (`VertexDataSize`)
  followed by index bytes (`IndexDataSize`), and `MeshPositionDataStream`.
  Indices are relative to the stream's own first vertex.
- Positions are the semantic-0 element of `PositionVertexLayout` (observed:
  four half floats at offset 0, stride 16, second element semantic 1 at
  offset 8). The main layout's packed elements (semantic 11 and others) are
  not decoded; the workshop computes normals.
- A scene `MESH` node finds its stream by `NameHash` equal to the stream
  `Hash`; `BATCHCOUNT` equals the index count for the checked node.
- `Indices16Bit = 1` with more than 65,535 total vertices occurs, so the flag
  is per stream, not per file total. `Indices16Bit = 0` also occurs with
  sixteen-bit streams (fighter `wings_k`): the exporter reads a stream as
  thirty-two-bit only when the flag is clear and either the stream has more
  than 65,535 vertices or every odd sixteen-bit word is zero. This rule is an
  inference from two files, not a read of the engine loader.
- Container scenes carry an empty geometry file (`VertexCount = 0`).
- Euler angles are composed as `Rz * Ry * Rx`. This is an assumption; the
  renders below are coherent (wings, landing gear, turrets and cargo pods sit
  where expected), which a wrong order would visibly break on rotated parts.
- Meshes whose name or material matches `SHIELD|SHADOW|LOD[1-9]` are dropped
  by default (the pirate freighter's shield bubble otherwise hides the hull).
  Each mesh keeps a placeholder material named after its game material.

### Runs (offline, 2026-10-06)

All-alternatives exports, one per scene, all inside the raised limits:

| Scene | Meshes | Nodes | Bytes |
| --- | --- | --- | --- |
| `fighters/fighter_proc` | 663 | 2,019 | 10.0 MB |
| `dropships/dropship_proc` | 693 | 5,076 | 9.6 MB |
| `scientific/scientific_proc` | 262 | 2,789 | 5.7 MB |
| `shuttle/shuttle_proc` | 597 | 7,633 | 10.8 MB |
| `s-class/s-class_proc` | 243 | 641 | 2.9 MB |
| `s-class/bioparts/bioship_proc` | 90 | 191 | 4.1 MB |
| `sailship/sailship_proc` | 408 | 1,334 | 12.6 MB |
| `sentinelship/sentinelship_proc` | 692 | 1,451 | 19.8 MB |
| `weapons/multitool/multitool` | 507 | 664 | 5.8 MB |
| `weapons/multitool/royalmultitool` | 6 | 48 | 0.5 MB |
| `weapons/multitool/atlasmultitool` | 896 | 1,298 | 10.2 MB |
| `weapons/multitool/sentinelmultitool` | 43 | 124 | 1.6 MB |
| `weapons/multitool/staffmultitool` | 110 | 222 | 4.7 MB |
| `industrial/freighter_proc` | 260 | 8,250 | 10.6 MB |
| `industrial/capitalfreighter_proc` | 244 | 4,344 | 10.0 MB |
| `industrial/freightersmall_proc` | 14 | 53 | 0.9 MB |
| `industrial/piratefreighter` | 438 | 2,375 | 15.9 MB |

Seed-selected exports for seed `0x7` were produced and captured for all of
the scenes above except the Atlas multitool; a second seed
(`0x8C968767B3282F13`) was in progress at this checkpoint. Inspected renders:
fighter (cockpit D, engine C, wings K), shuttle, sentinel ship, standard
multitool, freighter, capital freighter and pirate freighter — each is one
coherent model without overlapping alternatives.

Evidence (disposable, external): `E:\NMS-Courier-Research\preview-models\
exported-20261006b` (all alternatives) and `seeded-20261006\c` (per seed,
with `capture-*` screenshot folders and JSON reports holding source hashes,
selected IDs and warnings).

### Failures and corrections

- First export exceeded the old import limits; indices became sixteen-bit
  where possible and the limits were raised.
- The pirate freighter first rendered as a featureless blob: its shield mesh
  encloses the hull. Default exclusion added.
- Fighter `wings_k` was rejected ("indexes beyond its vertices") while the
  exporter trusted the file-level width flag; replaced by the per-stream rule.
- A string escape lost in a scripted edit left the exporter unparsable for
  fourteen scenes of one batch; fixed and the batch repeated.
- `freightersmall_proc` with seed `0x7` exported two meshes only; not yet
  investigated (its reference depth or geometry may need another route).

### Not established

- That these renders match the game for the same seed: no in-game model with
  a known seed was compared yet. The natural caller context (inclusion,
  exclusion and prefix inputs) is empty here.
- Colors, textures, decals, normals and materials. The palette ports exist
  separately; binding their output to the placeholder materials is the next
  step for a colored seed preview.
- In-app conversion. The desktop application still imports a GLB chosen by
  the user; converting the user's own game files inside the packaged
  application is not implemented.

### Reproduction

```powershell
$py = "$env:LOCALAPPDATA\Python\pythoncore-3.14-64\python.exe"
& $py runtime/research/export-scene-glb.py --corpus E:/NMS-Courier-Research/corpus `
  --scene models/common/spacecraft/fighters/fighter_proc.scene.mbin --seed 0x7 `
  --output E:/NMS-Courier-Research/preview-models/NEW/fighter-0x7.glb
pnpm --dir apps/desktop build
node runtime/scripts/capture-model-preview.cjs `
  E:/NMS-Courier-Research/preview-models/NEW/fighter-0x7.glb `
  E:/NMS-Courier-Research/preview-models/NEW/capture-fighter-0x7 "*" `
  C:/Users/louan/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright
```

### Colored seed previews (2026-10-06, later)

`export-scene-glb.py --palette-seed` colors each material from the base
palette port (`evaluate-base-palettes.py`): the material's `gDiffuseMap`
`NAME.DDS` (or layered `NAME.LAYER.DDS`) belongs to the procedural list
`NAME.texture.mbin`; each layer contributes its most probable option, and among
layers whose option has a sample channel the main paint layer is preferred by
name (`PAINT1`, then `BASE`, then `PAINT`, else the first) — a viewing
heuristic, since one flat color cannot show stacked layers. The option's
`Palette` family and `ColourAlt` channel (Primary, Alternative1..4) index the
five generated samples of that family. Materials without such a list keep the
gray placeholder. Samples are written as sRGB-to-linear converted glTF
factors (an interpretation, not a shader fact). Materials are now distinct per
game path, and the JSON report lists every binding.

Observed for the fighter scene with model and palette seed `0x7`: 22 of 53
materials bound (Paint/Primary green on hull panels, Undercoat/Primary beige,
Paint/Alternative4 orange accents, Undercoat/Alternative4 trims); the render
reads as a plausible painted ship.

Further observations: the hauler for seed `0x7` renders as a coherent painted
ship; the pirate freighter (model seed `0x8C968767B3282F13`, palette seed
`0x175000B001FFD`) binds `PirateBase/Alternative1` (near black) and
`PirateAlt/Primary` (gray) through `largetilingpanels` and
`largetilingpanelsalt`; the scientific ship first came out a single yellow
because its one atlas list stacks `PAINTALT`, `PAINT1` and `BASE` layers and
the first layer was taken — the layer preference above was added for that.
A faithful result needs the layer textures themselves (masks decide where
each layer shows); the corpus index lists the DDS members but they are not
extracted.

This is deliberately an approximation, and the reason matters for the next
step: in the shared fighter lists the `BASE` layer offers named options
(`COATING` 0.15, `PANELS` 0.40, `PAINTED` 0.40, three more at 0) whose palette
bindings differ per texture (for `secondary`: Undercoat/Alternative1,
Undercoat/Primary and Paint/Primary respectively). Which named option a seed
selects, consistently across all textures of the model, decides whether the
secondary surfaces take the undercoat or the paint color. The exporter does
not evaluate that choice; the restricted selector port
(`evaluate-texture-options.py`) exists but the natural merged resource order
and texture seed of a whole model are still open
([texture flow](APPEARANCE_TEXTURE_SEED_FLOW.md)). Freighters need the home
system seed as palette seed; ships and multitools use the model seed.

### Comparison with public reference seeds and two corrections (2026-10-06, night)

Renders were compared with the visual notes already committed in
`runtime/research/reddit-seed-observations.tsv` (notes written on 2026-10-03
from public posts; the images themselves are not stored). This is a coarse,
qualitative comparison of shape and dominant colors, not a pixel or RGB test.

| Seed (category) | Recorded observation | Render |
| --- | --- | --- |
| `0xA547AB958C97E439` (fighter) | Red/white, short rounded nose, broad upright outer wings | Same silhouette: short rounded nose, broad upright outer wings; Paint/Primary is white and Paint/Alternative1 red in the palette, but the flat material colors show gray-mauve panels and yellow accents — **shape agrees, color placement does not** |
| `0xD440D42921FFFF7A` (hauler) | Blue/yellow hull, four blue spherical containers, short cab | Blue hull, four spherical containers, short cab; red accents instead of yellow |
| `0xAB5A7EA8EB43A808` (hauler) | White/light-blue hull, broad wing with large cyan triangle decal, two fans | Light hull, broad wing with cyan triangular decals, two fans |

Corrections made because of these comparisons:

- **Level suffix.** The first reference render had no wings: mesh nodes such
  as `_Wings_GLOD0` were tested against selected IDs without removing the
  `LODn` suffix, which the traversal port removes from descriptor IDs. The
  exporter now applies the same normalization before the membership test.
  Every seed-selected render made before this fix (the `seeded-20261006`
  batch and the first colored batch) can miss such parts and must be redone
  before being used as evidence.
- **Seeded texture options.** `--texture-seed` feeds the texture lists of the
  exported model, in first-occurrence preorder, to the existing merged
  selector port (`evaluate_fresh_resources`, budgets raised by explicit
  arguments to 32 resources and 64 groups, outside its compared scope) and
  colors each material from the option that selector names for its layer.
  Example, fighter seed `0x7`: `BASE` selects `PAINTED`, so secondary surfaces
  take the paint color instead of the undercoat. The texture seed (here equal
  to the model seed) and the resource order are candidates, not established
  natural inputs.

What the mismatch on the first row shows: a flat color per material cannot
reproduce a painted ship. The layer textures carry the masks that decide
where paint, undercoat and trim appear, and the game additionally averages
colors per group. The next step for colors is therefore to extract the
layer textures of one ship family, composite them with the selected options
and palette samples, and export UVs — then repeat this table.

### Baked layer textures in the workshop (2026-10-07)

Status: implemented research tool, rendered and inspected; not runtime
verified. The spacecraft and weapon DDS members are already extracted in the
corpus (`NMSARC.TexSpacecraft` and others), so no new extraction was needed.

- Tools: Pillow 12.3.0 and NumPy 2.5.3 installed with `pip --target` into
  `%LOCALAPPDATA%\NMSCourier\research-tools\python-imaging` (outside the repository; pass the folder with `--imaging-tools`).
  Pillow reads the observed `DXT1` and `ATI2` files.
- Exporter: `--imaging-tools` (with `--palette-seed` and `--texture-seed`)
  writes texture coordinates (semantic 1 of the position layout) and, per
  material, one embedded PNG composited from the selected option of every
  layer of its texture list: last list position first, the last used layer
  opaque, each option tinted toward its palette sample (hue shifted by
  tint minus layer average, saturation capped by the tint, value moved by the
  tint-minus-average difference). Materials without a list use their plain
  diffuse map. `--texture-size` defaults to 256. A group the selector leaves
  unselected in its first pass now takes the selector's later fallback row.
- Workshop: the importer accepts embedded PNG images (buffer view with the
  PNG signature, at most 256, never a URI), textures and samplers; the loader
  resolves only its own `blob:` URLs; the renderer content policy adds
  `blob:` for `img-src` and `connect-src`. Tests (37) and build pass.

Observed:

- Fighter `0xA547AB958C97E439`: panel lines, cockpit glass, decals and trim
  textures appear in place, so texture coordinates and orientation are right.
  Colors are white primary, olive-gray secondary (`COATING` selects
  Undercoat/Alternative1) and yellow accents; the public note says red and
  white. The geometry and texturing agree; **the palette values or the
  option choice for this seed still do not** — the open inputs are the
  alternate palette branch, the natural texture seed and resource order.
- Atlas staff (`weapons/multitool/staffmultitoolatlas`, seed `0x7`): black
  shards and shaft with a red orb, as in two reference pictures supplied by
  the user on 2026-10-07 (the user identifies it as the Atlas Sceptre/Staff
  multitool). None of its materials has a palette-bound texture list: every
  texture is a plain diffuse map, so its black and red are fixed in the
  textures and do not depend on the seed; the seed selects parts only
  (`_MULTITOOL_NORMAL`, `_BARREL_2` and two empty accessory slots for `0x7`).
  The red glow lines of the reference are glow materials, which the exporter
  leaves as placeholders.
- Atlas multitool (`weapons/multitool/atlasmultitool`, seed `0x7`): dark gray
  body with small red details, likewise without palette-bound lists.

Not reproduced: mask and normal maps, emissive and transparent materials
(engine glow planes render as opaque quads), the game's own recolour
arithmetic (the tint rule above follows a community description), colour
averaging between groups, and per-pixel accuracy.

Reproduce by adding `--imaging-tools <that folder>` to the export command of
the previous sections, for example with scene
`models/common/weapons/multitool/staffmultitoolatlas.scene.mbin`.

### All categories re-rendered after the level-suffix fix (2026-10-07)

The seventeen scenes were exported and captured again with part selection,
palette colors and seeded texture options (seed `0x7`; pirate freighter with
model seed `0x8C968767B3282F13` and palette seed `0x175000B001FFD`): all
seventeen load in the workshop without page errors and inside the import
limits. These exports predate texture baking and use flat material colors.

The fix changed several results. `freightersmall_proc` now exports 10 meshes
(166,984 elements) instead of 2 meshes (28 elements), which closes the "exports
almost nothing" item recorded earlier: its parts carry the level suffix. The
standard freighter went from 61 to 70 meshes and the capital freighter from
140 to 156. Evidence: `E:/NMS-Courier-Research/preview-models/categories-20261007`.
