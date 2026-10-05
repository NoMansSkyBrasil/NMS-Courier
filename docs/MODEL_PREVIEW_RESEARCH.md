# Model preview and public seed references

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
- Restricted static triangle GLB: 16 MiB file, 1 MiB JSON, 512 nodes/meshes,
  1,024 primitives, bounded accessor and instance vertex totals. External/data
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
