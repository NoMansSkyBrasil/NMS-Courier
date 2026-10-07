# Palette task inputs and constant recovery

Checkpoint: 2026-10-05 local. This supersedes the unresolved fallback and task
branch statements in the [alternate palette checkpoint](ALTERNATE_PALETTE_RESEARCH.md).
The explicit task decision is implemented and connected to bounded search.
Sixteen original-instruction dispatch comparisons and 404 color comparisons
using file-backed constants match. This is offline evidence, not runtime support
or a complete appearance inverse.

## Literal correction

Pinned build 180383 executable SHA-256:
`671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.
The null-buffer fallback at RVA `4b2f8d0` is file-backed `.rdata`:
`0000803f000000000000803f0000803f`, little-endian float32 RGBA **(1, 0, 1, 1)**.
The padding float at `4b26778` is **1**. Equal padding lanes cancel in the
distance calculation, so the recovered RGB distance port remains unchanged.

The previous inspector used `--literal-rva`, which decodes a null-terminated
string. The first byte is zero, yielding an empty string and hiding the color.
Use `--literal` for raw byte windows. Earlier controlled fallback `(0.25, 0.5,
0.75, 1)` and padding 0 were deliberate comparison fixtures; their 404 matches
remain valid arithmetic evidence but do not describe these native constants.
The new `--native-fallback` matrix also matches all 404 cases with magenta and
padding 1. Magenta is a missing-buffer fallback, not a general ship paint choice.

Threshold RVA `525d910` lies in the `.data` zero-filled virtual tail. It has no
file-backed bytes. Translating this RVA past the section's raw size would read
unrelated file data. Initial loader zero-fill does not establish the value after
runtime initialization; the writer remains unresolved. Search still requires
an explicit finite threshold. Its fixtures 0/float32(0.1) are not natural defaults.

`scan-rip-data-references.py` searches at most a 64 MiB code section in a
128 MiB hash-pinned PE, 16 exact targets, 512 displacement candidates and 16 KiB
per unwind fragment. Overlapping byte candidates are retained, then validated
at decoded instruction boundaries. It found 28 candidates, 23 checked references
and two no-unwind skips: the threshold has one READ, the fallback 22 READs.
No checked RIP write was found. This does **not** exclude register-based,
absolute, relocated, nearby-overlapping or unowned writes. Section storage and
raw hex are now included explicitly, without inventing virtual-tail values.

## Source-to-worker routing

Existing Ghidra exports were reused, then checked against 520 instructions from
three bounded unwind fragments plus the constructor fragment. Candidate labels
remain offline navigation labels, not callable public ABIs.

| Source boundary | Recovered input/output |
| --- | --- |
| `1149fe0` | Object byte `+70` enters submitter argument 13; byte `+71` gates a precomputed palette pointer at object `+1d70`, argument 6. |
| `637db0` | Argument 13 low byte is forwarded as constructor argument 7; argument 6 controls copying a `1ce0`-byte palette block and starting worker state `+27c` at 1. |
| `6377e0` | Constructor argument 7 low byte is stored at task `+1c9`. The constructor initially clears palette pointer `+178`. |
| Worker state 0 | Unless global mode is 5, flag `+1c9 == 0` selects `62c480` with bank `+520ac0`; any nonzero byte selects `62e4e0` with bank `+520ff0`. |
| Mode 5 | Skips both palette generators; do not infer fresh colors. This number has no recovered semantic name. |
| Precomputed palette present | Starts at state 1, bypassing initial seed-based color generation regardless of the branch flag. |

Stack provenance is checked against Windows x64 calling layout: submitter
argument 13 at entry `rsp+68` becomes `rsp+400` after its `398` frame adjustment;
the constructor argument 7 at entry `rsp+38` becomes `rsp+90` after `58` adjustment.
Source instruction sites are indexed in `palette-task-data-180383.md`.

`resolve-palette-task.py` accepts explicit uint8 `alternate_flag`, uint32
`global_mode` and boolean `precomputed`, returning the decision and bank offset.
It models this initial decision only, not the full asynchronous worker. The
original dispatch slice `638a8a..638af2` is emulated for flags 0/1/2/255 and
modes 0/1/5/max uint32. All **16** cases match helper choice, bank pointer,
seed-pair copy and output pointer. Generators are captured no-op boundaries;
their arithmetic has separate native comparisons. Precomputed bypass is backed
by source/instruction inspection and unit tests, not executed by this slice.

Important consequence: appearance is not a function of model seed alone. The
same seed can use different banks or explicit colors. This proves the routing
at the inspected boundary; it does not establish which ship/tool/freighter
categories naturally set each source flag or populate each bank. The existing
base palette collection is still an explicit test input on the alternate route.

## Connected search inputs

The existing explicit `palette_branch` contract remains supported. Alternatively,
supplement the existing request with:

```json
{
  "palette_task": {
    "alternate_flag": 1,
    "global_mode": 0,
    "precomputed": false
  },
  "palette_parameters": {"similarity_threshold": 0.1}
}
```

This chooses alternate generation and its pinned magenta fallback. Explicit
`fallback_rgba` remains available for controlled overrides. Branch/context
conflicts, precomputed bypass and mode 5 fail instead of generating misleading
colors. Reports retain task inputs and effective parameters. The task values
above are fixtures; do not treat them as category defaults or a delivery ABI.

`validate-alternate-search.py --task-inputs` tests Fighter, ordinary multitool
and Pirate freighter end to end without specifying branch/fallback separately.
All three searches examine eight seeds and retain anchor `0x7`; freighter uses
its independent fixed HomeSystemSeed. This uses the forward evaluators for
constraint construction and is integration evidence, not an independent oracle.

## Bounded reproduction and continuation

Reuse the existing corpus; never repeat extraction for these commands. Private
Unicorn 2.1.4 and Capstone directories are prerequisites for research only.

```powershell
python runtime/research/emulate-alternate-palettes.py `
  --executable "E:/SteamLibrary/steamapps/common/No Man's Sky/Binaries/NMS.exe" `
  --corpus E:/NMS-Courier-Research/corpus `
  --python-tools "$env:LOCALAPPDATA/NMSCourier/research-tools/python" `
  --emulator-tools "$env:LOCALAPPDATA/NMSCourier/research-tools/unicorn-2.1.4" `
  --native-fallback --output E:/NMS-Courier-Research/seed-analysis-180383/native-literals-NEW.json
python runtime/research/emulate-palette-task-route.py `
  --executable "E:/SteamLibrary/steamapps/common/No Man's Sky/Binaries/NMS.exe" `
  --python-tools "$env:LOCALAPPDATA/NMSCourier/research-tools/python" `
  --emulator-tools "$env:LOCALAPPDATA/NMSCourier/research-tools/unicorn-2.1.4" `
  --output E:/NMS-Courier-Research/seed-analysis-180383/task-route-NEW.json
python runtime/research/scan-rip-data-references.py `
  --executable "E:/SteamLibrary/steamapps/common/No Man's Sky/Binaries/NMS.exe" `
  --python-tools "$env:LOCALAPPDATA/NMSCourier/research-tools/python" `
  --target 0x525d910 --target 0x4b2f8d0 `
  --output E:/NMS-Courier-Research/seed-analysis-180383/global-storage-NEW.json
python runtime/research/validate-alternate-search.py --task-inputs `
  --corpus E:/NMS-Courier-Research/corpus `
  --output E:/NMS-Courier-Research/seed-analysis-180383/task-search-NEW
```

Outputs must be new and external. Dispatch uses a 104-byte code slice, at most
50,000 instructions/one second per fixture, a 1 MiB private heap, 64 KiB stack
and one additional sparse 8 KiB manager page. No host imports/game calls.

External evidence under `seed-analysis-180383`: `palette-task-and-constants-20261005.json`,
`palette-route-bodies-20261005.json`, `palette-task-fields-20261005.json`,
`palette-global-storage-20261005.json`, `alternate-native-literals-20261005.json`,
`palette-task-route-20261005.json`, `alternate-task-search-final-20261005/report.json`.
Earlier controlled reports remain preserved.

Next resolve the threshold through indirect initialization and the source flags/
bank population per category. Then join natural material assembly with texture
mask/decal/shader output. Full native pixels, category-wide caller defaults,
complete uint64 inverse solving and runtime delivery remain open. Do not rerun
these matching matrices without a changed implementation or new boundary.
