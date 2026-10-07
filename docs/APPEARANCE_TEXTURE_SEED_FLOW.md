# Appearance textures and category color channels

Offline checkpoint: 2026-10-04. Build 180383 executable SHA-256:
`671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.
This closes selected data bindings and the worker's processing order, **not**
the full parts/colors-to-seed inverse. Read
[entity inputs](ENTITY_APPEARANCE_SEED_FLOW.md) and
[arithmetic evidence](SEED_INVERSION_AND_EMULATION.md) first.

## Category-specific bindings

Ten exact indexed texture resources were inspected with the existing bounded
`inspect-texture-palettes.py`, preserving binary/XML hashes. Total input:
80,451 bytes; ten inspected, zero missing/ambiguous sources. The reproducible
resource list is `runtime/research/appearance-texture-assets-180383.md`.
These are selected materials, not an exhaustive category catalog.

| Resource suffix | Layer -> family/channel | Alternatives and implications |
| --- | --- | --- |
| `multitool/multitoolbase.texture.mbin` | PAINT1 -> Paint/Primary; PAINT2 -> Paint/Alternative1; BASE -> Rock/None | One option per nonempty layer; model selection remains separate. |
| `multitool/multitoolalttrim.texture.mbin` | OVERLAY -> Paint/Primary **or** Rock/None | Two alternatives; applying Paint everywhere loses the distinction. |
| `multitool/bonetiling.texture.mbin` | BASE -> Metal/Primary **or** Undercoat/Primary | Two alternatives can change the palette family itself. |
| `weapons/guntexture.texture.mbin` | BASE -> Rock/None | Does not define the color algorithm of every multitool. |
| `frigates/surfdetail.texture.mbin`, `frigates/warriortiled.texture.mbin` | OVERLAY3 -> Paint/Primary; OVERLAY4 -> Paint/Alternative1; BASEU -> Rock/None | One option per nonempty layer. |
| `livingfrigate/lfmainproc.texture.mbin` | BASE -> BioShip_Body/Primary; SHELL -> BioShip_Body/Alternative1 | Living frigates do not use this material's ordinary Paint family. |
| `npcs/explorer/explorer.texture.mbin` | PAINT -> Custom_Head/Primary, group KPAINT; BASE -> Rock/None | Palette names do not identify the anatomical area by themselves. |
| `npcs/warrior/warrior.texture.mbin` | MARKINGS -> Custom_Head/Alternative1 or Rock/Primary; TOP -> Custom_Head/Alternative2; UNDERLAYER and BASE -> Custom_Head/Primary; SKIN -> Rock/None | MARKINGS has four options/group VMARK; TOP seven/VTOP; UNDERLAYER four/VUNDER. Different textures can share a color channel. |
| `industrial/shared/freighter_proc.texture.mbin` | PAINT1 -> Freighter/Primary; PAINT2 -> Freighter/Alternative2; BASE -> Rock/None | PAINT2 has two options and SelectToMatchBase=true; BASE has two. Independent uniform draws are not established. |

All inspected bindings declare Index=-1. Preserve None, Group and
SelectToMatchBase without inventing their runtime semantics. There is no
evidence here that None means black, transparent or a random palette color.
Single-option layers also do not prove that Probability/group conditions cannot
disable them. Skin, paint, shell and metal can require different inputs.

## Native processing order

The chained-unwind root `6388a0` resolves the previous partial fragment
`6388f9`. Candidate names and decompiler argument lists remain unverified ABIs.
Task offsets below belong only to this inspected worker, not a general entity.

1. State 0 allocates a 0x1ce0 palette block (66 rows, 0x70 stride) at task
   offset 0x178. It copies the seed pair from 0x138/0x140. Under the observed
   global-value guard, flag 0x1c9 selects base collection `62c480` versus the
   alternate path `62e4e0`. The alternate path cannot be replaced by the base
   evaluator. The meaning of the global guard value 5 remains unknown.
2. Descriptor/resource preparation precedes texture loading. State 3 can send
   the original task seed into referenced-resource descriptor construction
   through `2d63670` and child-task construction `637db0`.
3. State 7 calls `62f420` for material/texture resource preparation; state 8
   waits through `62eb70`, then calls `636750`. A separate 32-byte block
   at task 0x230..0x248 is copied into this call. The subsequent 63f290 export
   identifies it as a cache key over already prepared records, not the option
   list. State 5 reaches the fresh random selection via 62ebd0 and 631310;
   see [the decal continuation](DECAL_TEXTURE_SELECTION_RESEARCH.md).
4. `636750` prepares two texture payload blocks and calls `634930`/`634e10`.
   `634930` resolves four resource handles and updates readiness flags;
   it is **not** a color RNG. `634e10` iterates eight layer positions, matches
   loaded records against an already supplied option list, and copies paths,
   values and handles into the payload. It does not establish a fresh random
   choice over the XML alternatives. Renaming either helper a seed selector
   would overstate the evidence.
5. State 9 can retrieve three values through attribute IDs 0x2c5/0x2c6/0x2c7
   for a pending four-float payload. It groups records by their matching fields,
   sums matching four-float values and divides by the group count, then copies
   the resulting mean back to matching entries. The 0x70 stride in this
   temporary aggregation is **not** sufficient to identify it as the earlier
   palette-family array. Attribute names, exact color-channel roles and native
   pixel composition still require field/shader evidence.
6. State 10 calls `63a0c0`, which calls `635c00` for eligible texture blocks
   and queues asynchronous work. Scheduling is not a seed algorithm.

`62f420` reaches resource request `630d50`, which registers callback `6308a0`
and loader `63ae70`. The latter route was already investigated in the earlier
texture-callback pass; it copies/caches payloads and is rejected as the missing
random selection mechanism. The new `630d50` export duplicated that existing
candidate rather than uncovering a new seed consumer. Retain this failure to
avoid repeating the same route again. Likewise, existing `b04170` forwards
descriptor and independent palette inputs, but its caller has not been proved
to be a natural NPC spawn.

## Visual inspection in the existing Electron workshop

The existing acceptance harness was run with the external Royal GLB, the
hash-pinned base palette bank and seed 0x7. It opens an isolated Electron profile,
uses narrow existing preview APIs and stubs only the local import dialog.
All 330 samples matched the independent Python candidate; per-part application,
all-visible application and restoration passed. The inspected screenshots show
yellow/olive wings beside gray remaining surfaces, then a pale olive whole
model. No renderer errors or minimum-window horizontal overflow were reported.

This visual check demonstrates independent mesh recoloring, not game fidelity.
The model is a reference GLB; the mesh is uniformly tinted, without native DDS
layer masks. Bright swatches become shaded colors on the geometry. The current
linear-sRGB display convention remains unverified against NMS shaders.
Multitool, frigate and NPC geometry was **not** rendered in this pass.

## Reproduction and remaining work

Use the five `appearance-*-180383.md` selections with
`analyze-acquisition-offline.py`, the exact fingerprint above and the existing
Acquisition180383 project. Stages are appearanceworker20261004,
appearancetexture20261004, appearancebinding20261004, appearanceprepare20261004
and appearanceloader20261004: nine manifest rows succeeded, zero failed.
Run sequentially, with existing CPU/memory/time/disk-space limits; do not
re-extract the corpus or launch a second writer against the Ghidra project.

External evidence is under `E:\NMS-Courier-Research`:

- `seed-analysis-180383/priority-texture-bindings-20261004.json`: ten bindings
  and exact source hashes.
- `seed-analysis-180383/appearance-worker-roots-20261004.json`: unwind roots.
- `acquisition-180383/<stage>-export/`: manifests and proprietary pseudocode.
- `preview-models/appearance-validation-20261004/`: visual captures and report.

The subsequent [decal continuation](DECAL_TEXTURE_SELECTION_RESEARCH.md) locates
that writer and implements a bounded first-pass candidate. Continue with its
collection/compatibility pass and per-category seed/context, then decode masks
before judging rendered similarity. Explicit customisation through `11499c0`
remains separate from natural generation.
No new universal inverse, natural NPC seed oracle, delivery method or runtime
compatibility was proven. No game, save, mod, bridge, disk repair or extraction
operation occurred.
