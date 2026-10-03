# Model preview and public seed references

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
