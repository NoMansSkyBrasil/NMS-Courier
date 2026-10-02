# Native acquisition investigation

Status: offline executable evidence, not a runtime adapter. The existing DLL
remains the delivery bridge. No game, mod, inventory, or save was changed.

## Sources and exact scope

The installed research executable is build 180383, SHA-256
`671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.
This differs from live-verified build 179666. Nothing in this document authorizes
the old bridge on the new executable.

Public references are pinned, independently inspected clues:

- [NMS.py signature database](https://github.com/monkeyman192/NMS.py/blob/52e2e55493ddade1d89d3e638491afff995f5631/tools/data.json).
- [NMS.py partial purchase structure](https://github.com/monkeyman192/NMS.py/blob/52e2e55493ddade1d89d3e638491afff995f5631/nmspy/data/types.py).
- [ReNMS freighter ownership](https://github.com/sonny-tel/renms/blob/9696413ec82bd0bd6cea81565ef20122a1c168bb/skyscraper/gamestate/GcPlayerFreighterOwnership.h).
- [ReNMS inventory store](https://github.com/sonny-tel/renms/blob/9696413ec82bd0bd6cea81565ef20122a1c168bb/skyscraper/gamestate/GcInventoryStore.h).
- [ReNMS player state](https://github.com/sonny-tel/renms/blob/9696413ec82bd0bd6cea81565ef20122a1c168bb/skyscraper/gamestate/GcPlayerState.h).

ReNMS documents support for Fractal 4.13. Its layouts are not current-build
offsets. Third-party source copies and executable pseudocode remain external;
none is imported into application dependencies or committed here.

## Reproducible offline pipeline

[The scanner](../runtime/research/scan-native-acquisition.py) reads the executable,
checks the caller-selected SHA-256, scans six relevant public signatures in
`.text`, associates matches with `.pdata` unwind ranges, and decodes direct calls
with Capstone 5.0.5. All six matches were unique and at an unwind start.
This establishes locations of **candidates**, not verified semantic identities.

The first unwind range can be only a fragment of a split function. For example,
the purchase candidate's first fragment is 434 bytes, but Ghidra follows branches
into a much larger body. The scanner's call list is therefore incomplete and
does not include indirect calls. Do not use it as a complete call graph.

[The Ghidra exporter](../runtime/research/ExportAcquisitionSeeds.java) disassembles
selected starts and exports pseudocode without whole-program auto-analysis.
Ghidra 12.1.4 and Temurin JDK 25.0.4.1+1 were obtained through the existing pinned,
hash-verified tool bootstrap on C:. The initial 26-function run exported 25
successes and one timeout at 30 seconds. A focused run at 120 seconds exported
that purchase candidate and a new reward-entry dispatcher successfully.
Further bounded metadata, handler, setup and inventory passes succeeded. There
are **65 unique successful pseudocode candidates** in the navigation index,
including the later flag serializers and weapon acquisition chain.

External output: `E:\NMS-Courier-Research\acquisition-180383`.
Inspect `candidates.json`, `seeds.tsv`, `run.json`, `export/manifest.tsv`,
`focused-export/manifest.tsv`, and the two headless logs. The original failed
first-pass row is retained; the index prefers the later successful export.

[The bounded launcher](../runtime/research/analyze-acquisition-offline.py) provides
a process-tree timeout, a 20 GiB free-space reserve, two-CPU configuration,
preserved artifacts on failure, named stages, and a maximum of 48 seeds. It requests a 4 GiB
Java heap; this is not a total system-memory or project-size limit. The observed
initial experiment used supervised direct headless commands; subsequent
metadata/handler/initializer/setup/inventory/layout passes used this launcher
with a 300-second process deadline and completed successfully.
No disk repair, encryption change, or storage reset is part of this pipeline.

## Concrete findings

All addresses below are offline RVAs for this fingerprint only. Names remain
public-signature labels or analytical descriptions; decompiler argument types
and calling conventions are incomplete.

| Candidate RVA | Evidence | Research implication |
| --- | --- | --- |
| `0xf12240` | Public `GiveGenericReward` match; pseudocode looks up a reward and invokes `0xf17fe0` | The entry point delegates; it is not itself a freighter constructor |
| `0xff8d60` | Public interaction `GiveReward` match calls `0xf12240` | Interaction and direct reward routes converge on the same candidate |
| `0xf17fe0` | Iterates/selects reward entries and calls `0xf19c30` | Trace the individual payload dispatcher, rather than changing global generation probabilities again |
| `0xf19c30` | Checks multiple payload conversions and routes them to different handler candidates | Locate the specific-ship conversion and its handler before choosing gift versus acquisition behavior |
| `0x8e8830` | Purchase candidate has states, resource readiness, callback invocation, item-kind branches, and cleanup | Acquisition is a stateful operation; a one-time assignment of inventory headers is insufficient |
| `0x8f5590` | Called during purchase cleanup and initializes/resets multiple fields and inventory-related objects | Object lifetime matters; do not call reset or copy apparent structure bytes as delivery |
| `0x2cf7f0` | Public ownership-constructor match initializes many handles, sentinels, and subobjects | Ownership is a compound object, not only a seed/class field |
| `0x548110` | Public freighter-base reset match, exported only | Destructive maintenance candidate, not a delivery API |
| `0x24e7fb0`, `0x24df3d0` | Metadata serialization names `GcRewardSpecificShip` and checks tag `0x8a37c4a2`; the payload getter checks that same tag | Connect the data type to its dispatch branch without guessing a handler name |
| `0xf27cd0` | The tagged dispatcher invokes this handler, which calls `0x8e4d30` and queues a frontend event | Specific-ship reward currently initializes the purchase flow; a gift flag alone is not proof of silent acquisition |
| `0x8e4d30`, `0x8e3a10` | Wrapper and core setup populate resource/seed/layout, item kind, separate free/gift/reward flags, and temporary inventories | Instrument this setup for a request-scoped configuration hook before acquisition |
| `0x4cd270`, `0x4cea20` | Inventory layout creation and base-stat generation are distinct operations | Class, valid slots and class-dependent stats need consistent initialization |

### Stronger clue for the repeated C class

The specific-ship metadata tag connects `0xf19c30` to `0xf27cd0`, which initializes
the purchase object through `0x8e4d30` and `0x8e3a10`. The core setup calls
`0x4cd270` for its temporary inventory layouts. That layout initializer explicitly
zeros the field at inventory `+0x100`, matching the public inventory store's
`mClass` location. This is consistent with the older live reader's C=0/S=3 mapping.

Core setup's item-kind-3 branch creates inventory types 8/9 and invokes base-stat
generation with class-selection argument zero. Unlike other branches, it does
not contain the observed explicit class-copy assignments to its primary and
cargo store fields. This is a concrete static explanation to investigate for a
C freighter despite requested S configuration. It is **not** proof that the older
live-tested build has identical code, nor proof that these temporary headers
alone determine the visible badge: that hypothesis already failed live.

The stat generator `0x4cea20` uses its fourth argument to select a table segment
and generate base-stat entries. Raising a visible class field without rebuilding
the corresponding native stats would be incomplete. A safe request-scoped hook
must trace the actual offered/owned inventory source and native transfer, rather
than repeat the earlier two-field frontend mutation.

The purchase pseudocode accesses byte `+0x22` in the resource-waiting path and
byte `+0x1061` in cleanup, consistent with the public partial structure's reward
and resource-cleanup clues. It invokes a stored callback after readiness in one
path. Numeric state 1 can advance to 2; another branch starts from 4, sets 6,
performs item-kind-specific work, and later cleanup resets the object. These
numbers are observations, not an approved state enum or instructions to write
them. Forcing a state can bypass initialization, entitlement, ownership, or
resource checks. Public `IsGift`/`IsFree` fields are not proof of UI-free
freighter acquisition or an independently verified current-build setter.

The older ownership header separately describes resource, home-system seed,
freighter seed, spawn/preview state and mesh-refresh flags. This gives a concrete
reason to investigate native resource/ownership initialization for the requested
Pirate scene, rather than assuming a seed update alone changes the model.

The older inventory header separates valid slots, special slots, base stats,
layout descriptor, and class. These distinctions agree with the observed
C/120/30 offer: increasing the grid alone does not prove S class, unlocked
technology, supercharged slots, or resulting stats.

## Recommended path through our DLL

1. Continue from the now-linked specific-ship getter `0x24df3d0` and handler
   `0xf27cd0` into core setup `0x8e3a10`. Determine whether class/resource/seed are
   honored, substituted, or initialized elsewhere. Confirm constructor and
   allocator requirements before any hook.
2. Trace the purchase state's item-kind branch for freighters and its ownership
   transition. Preserve native readiness and cleanup. Determine whether the
   gift/reward path can finalize without opening a comparison screen. This is
   not yet established.
3. Configure only the request's generated entity through verified native
   initialization: Pirate scene, requested seed, S class, valid cargo slots,
   valid technology slots, special slots, and class-dependent stats. Keep
   shared generation tables unchanged for unrelated entities.
4. Add read-only instrumentation to an independently verified current-build DLL
   before live delivery. Check price/balance, resulting ownership, model/class,
   slot validity, technology effects, and ordinary-save persistence. A native
   notification or dispatch return alone is not success.

120 cargo / 60 technology remains the normal target. 120 technology and all
supercharged positions require separate, explicitly experimental validation.
An offer screen is optional in the desired product; direct acquisition remains
unproven. No save editor, raw object copy, global OnlyS patch, or simulated input
is selected as a delivery fallback.

## Live caller tracing and the ordinary inventory wrapper (2026-10-02)

On exact build 180383, the explicitly armed, bounded read-only observer captured
return RVA `0x4cd226` while the user compared ordinary NPC ships showing C and B.
All recorded calls in the inspected samples shared this return site, including
different R9D class arguments. The samples do not associate individual records
with a specific ship or isolate offer opening from background generation.

Hash-checked Capstone inspection of unwind function `0x4cd160..0x4cd26f` confirms
`call 0x4ccfa0` at `0x4cd221`, returning to `0x4cd226`. The wrapper at
`0x4ccfa0..0x4cd151` loads R9D from `[rdi+0x100]` at `0x4cd112`, restores its frame,
then **tail-jumps** to `0x4cea20` at `0x4cd14c`. Consequently, the observer sees
the wrapper's caller return address, not a return inside the wrapper. This is
instruction-level evidence that this ordinary inventory path supplies an
existing class value to stat generation; it is not a verified class-setting API.
No write to this field was attempted and its object identity remains unverified.

Reproduce the relevant instruction slices without attaching to a process:

```powershell
& "$env:LOCALAPPDATA\Python\pythoncore-3.14-64\python.exe" runtime/native/asi/inspect-executable-function.py `
  "E:\SteamLibrary\steamapps\common\No Man's Sky\Binaries\NMS.exe" 0x4cd112 --build 180383 --radius 4
& "$env:LOCALAPPDATA\Python\pythoncore-3.14-64\python.exe" runtime/native/asi/inspect-executable-function.py `
  "E:\SteamLibrary\steamapps\common\No Man's Sky\Binaries\NMS.exe" 0x4cd14c --build 180383 --radius 12
```

The inspector retains build 179666 as its default and rejects fingerprint
mismatches before disassembly. Selecting 180383 extends offline inspection only,
not runtime delivery compatibility. The next scoping gate remains the particular
Courier acquisition request and the initialization supplying its class.

## Expedition S-class comparison: Utopia Speeder (2026-10-02)

The user's screenshot shows the Utopia Speeder offer with an S badge. The exact
current extracted `REWARDTABLE.MXML` has SHA-256
`8ed7ae909e3cdffba01f02899aee4733d7d63c6c0fc4105ebea7cfce1b9b12d7`.
Its `RS_S9_SHIP` and `RS_S9_COMPLETE` specific-ship payloads both explicitly set
`ShipInventory.Class.InventoryClass=S`; they use `VRSPEEDER.SCENE.MBIN`, Fighter,
`IsGift=true`, `IsRewardShip=true`, 36 layout slots and FgtLarge size override.
Their cost amounts differ: 1,400 and zero respectively. Do not copy expedition
costs into Courier's free delivery contract.

| Field | Utopia reward | Courier freighter source |
| --- | --- | --- |
| Payload | `GcRewardSpecificShip` | `GcRewardSpecificShip` |
| Explicit inventory class | S | S |
| Ship type | Fighter | Freighter |
| `IsGift` | true | false |
| `IsRewardShip` | true | true |
| Layout slots | 36 | 120 |
| Width / height | 0 / 0 | 10 / 12 |
| Slots from technology | 0 | 60 |
| Size override | FgtLarge | FreighterLarge |

The Courier source hash is
`a797679f1c333b4a04f42501bfd728fbbe589672c3a916caec2df74ad9dbec74`.
It is repository configuration, **not an installed/live-tested patch revision**.
The original freighter reward `RS_S13_S4M6` declares B, `IsGift=false` and zero
cost. This also argues against treating every expedition entity as S by default.

The decisive native clue remains the branch difference in `setup-export/8e3a10.c`:
the item-kind-0 supplied-inventory branch copies source `+0x40` to its class
headers and passes that source value to stat generation. The item-kind-3 branch
initializes freighter inventory layouts and passes zero in its three stat calls,
without the analogous class-copy assignments observed in the ship branch.
This is a strong **offline explanation candidate**, not proof of the complete
Utopia claim path or the older failed freighter's badge source. The subsequent
serializer and wrapper inspection maps `param_10` to `IsRewardShip`, as described
below. `IsGift=true` alone is not a demonstrated freighter class fix.

The final caller sample in PID 20456 contains 51 records: `0x4cd226` contributed
15/12/6/0/0 arguments, `0x4cd351` contributed nine zero arguments, and
`0x8e47bb`, `0x8e47e5`, `0x8e4813` each contributed three argument-3 records.
Those last three sites match the supplied-inventory ship reward branch in the
existing core setup export. Unlike the earlier interval snapshots, the final
trace therefore **does capture S inputs from reward setup**. Without per-call
timestamps or entity IDs, it cannot uniquely attribute them to this specific
Utopia offer, nor prove the freighter branch takes the same inputs.

Reproduce bounded schema samples with `audit-generation-inputs.py --model
VRSPEEDER` using the exact extracted inventory/reward tables and the Courier
source patch. The audit now includes gift/reward flags, cost, slot counts, grid
dimensions and size override; it does not attach to the game or edit saves.

### Exact-build metadata flags and argument forwarding

Two bounded Ghidra passes added five exports through the existing project, without
whole-program analysis. Repository seed lists `reward-flags-180383.tsv` and
`reward-fields-180383.tsv` preserve the exact targets. The named stages are
`rewardflags` and `rewardfields`; manifests and pseudocode remain external.

`0x24ed8d0` is a construction/serialization wrapper, not the field decoder itself.
Following its call to `0x24f00d0` exposed field-address/name pairs. The new
`inspect-metadata-names.py` resolves at most 256 references and 128 bytes per
reference from the hash-pinned executable. It does not execute pseudocode.

| Payload field | Serializer offset | Executable name-string RVA |
| --- | --- | --- |
| IsGift | +0x24d | 0x3491940 |
| IsRewardShip | +0x24e | 0x3492640 |
| FormatAsSeasonal | +0x24c | 0x3491958 |
| UseOverrideSizeType | +0x24f | 0x3492610 |

These are static metadata payload offsets for this fingerprint, not general
inventory layouts. The handler forwards gift/reward bytes to `0x8e4d30`. Exact
wrapper disassembly then maps incoming argument 10 (`IsGift`) to core argument 9,
and incoming argument 11 (`IsRewardShip`) to core argument 10. Core setup stores
them at its object bytes +0x21/+0x22 respectively. The ship branch's `param_10`
condition therefore controls reward-inventory initialization, **not gift status**.
The initial gift-based hypothesis was corrected after checking the actual stack
forwarding; do not rely on the wrapper's incomplete decompiled signature.

Both the Utopia reward and Courier source already set `IsRewardShip=true`.
Thus, changing only `IsGift` cannot supply the missing class-copy/stat initialization
in the freighter branch shown by this export. Gift/free behavior, offered class,
native stats, slots and ownership must remain separate validation gates.

### Multitool acquisition chain

The pinned PE scan previously found metadata name references for SpecificWeapon.
Bounded follow-up exports connect them to tag `0x5f82ff34`. Exact inspection of
getter entry `0x24cc6b0` confirms the tag comparison and returned payload pointer;
dispatcher `0xf19c30` selects handler `0xf31490` from that getter.
Checking only a surrounding 64-byte slice initially also listed neighboring
getters, because the tag lies in the next function. Those are not matches: the
comparison at the exact getter entry is required. Leaf getter has no unwind row.

Handler `0xf31490` calls core setup `0x8e3a10` directly with item-kind 1, supplied
inventory payload, and separate bytes +0x1c1/+0x1c2. Following serialization
wrapper `0x24d8c70` to field serializer `0x24da180` names these bytes IsGift and
IsRewardWeapon, respectively; +0x1c0 is FormatAsSeasonal. Core argument 10 receives
IsRewardWeapon, selects the reward branch and copies source class to its inventory
header before generating matching stats. Gift status is again separate.

The handler also queues page value `0x26` and adjusts the offered weapon type for
reward variants. This is evidence of native offer creation, not UI-free ownership
or a safe production ABI. Resource loading, existing weapon limits, free claim,
selection, ownership transfer, slot validity and normal-save persistence remain
unverified. No handler was invoked by Courier on build 180383.

The route report includes concrete S reward `R_SWIT_GUN01`, with
WeaponInventory.Class=S and gift/reward flags true, and B staff reward
`R_STAFF_GUN`. These templates are references for independent configuration;
do not bundle third-party/proprietary tables into the repository or assume an
unlock/entitlement bypass is needed to deliver an independently configured weapon.

### Slots, upgrades, installation and expedition unlocks

Repeatable `scan-native-acquisition.py --metadata-name GcReward...` selects up
to 16 exact names, retains the executable/database hashes and reports missing
strings. The capability metadata pass selected ten names, all present, then
exported ten metadata candidates and nine dispatcher-selected handlers. Seeds
are in `capability-metadata-180383.tsv` and `capability-handlers-180383.tsv`.
External stages are `capabilitymetadata` and `capabilityhandlers`.

Each row below connects a metadata tag, the exact getter-entry comparison and
the adjacent non-null dispatcher branch. These are offline candidates only.

| Payload | Tag | Getter RVA | Handler RVA |
| --- | --- | --- | --- |
| ShipSlot | 278294bc | 24df300 | f3bf70 |
| UpgradeShipClass | c0171d3b | 24b6a70 | f3c8b0 |
| WeaponSlot | 2547fa1e | 24b6ac0 | f3c490 |
| UpgradeWeaponClass | 591b28b5 | 24b6a80 | f3d070 |
| FreighterSlot | 13a49b00 | 2518bd0 | f3c7c0 |
| InstallTech | c686b2db | 2518c40 | f37740 |
| UnlockSeasonReward | 3946e451 | 24b6a40 | f42160 |
| SpecificProductRecipe | 1c5b54fa | 24df3a0 | f362a0 |
| SpecificTech | 469befb1 | 24cc690 | f375f0 |

InventorySlots remains incomplete: its metadata-name reference falls inside a
split function, and the exported fragment `25206ec` does not expose the tag.
Do not derive its getter or handler from nearby addresses.

FreighterSlot handler sets up purchase item-kind 6 through `8e5710`, transfers
the cost reference and queues frontend page `0x26`. It does not directly unlock
all freighter slots. ShipSlot/WeaponSlot similarly contain window and product/token
branches; a successful boolean return does not establish expansion. Investigate
the purchase/upgrade finalizer and unlocked-index postcondition separately.

UpgradeShipClass reads the selected ship's current class, computes the next or
explicit class and initializes three inventory stores through `4cea20`, with
class-header updates and player-state notifications through `54cfe0`. It rejects
an already-S ship unless the payload permits a silent no-op. This is a concrete
native upgrade path for owned starships, not proof of a freighter upgrade API.
The exported ABI still contains unresolved register/stack values.

InstallTech resolves the technology definition and target inventory, checks
capacity/compatibility, then follows installation/state-update calls. Learning a
recipe and installing its module are distinct operations. UnlockSeasonReward
checks unlock state, follows product/reward references and conditionally changes
shop-claim state; it cannot be treated as unconditional acquisition of the final
entity. Inspect those branches before exposing separate unlock and claim commands.

No handler was called, no callback was rearmed and no DLL or data patch was
installed during this pass. Free delivery, slot maxima, target selection,
supercharged slots, ownership and persistence remain live validation gates.

## Bounded lookup

```powershell
& "$env:LOCALAPPDATA\Python\pythoncore-3.14-64\python.exe" runtime/research/build-research-index.py `
  --output E:\NMS-Courier-Research\navigation --kind native_function `
  --query 'cGcPurchaseableItem*' --limit 3
```

Search names with their `cGc` prefix: FTS token lookup is not an arbitrary
substring search. The index identifies the actual external pseudocode path and
fingerprint without rescanning assets or the executable.
