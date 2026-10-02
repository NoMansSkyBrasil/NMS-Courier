# Delivery routes without an offer screen

The follow-up [native acquisition investigation](NATIVE_ACQUISITION_RESEARCH.md)
adds exact-fingerprint executable candidates, real pseudocode and indexed paths
to this route comparison. It keeps the DLL and does not establish a live API.

Research assessment, October 1, 2026 (America/Fortaleza). This is a comparison of
mechanisms, not an implementation or compatibility claim. The user no longer
requires an offer screen. Local native delivery without save-file edits remains
the goal; remote-player delivery is a separate investigation.

## Evidence and limits

- The completed corpus belongs to executable build 180383, SHA-256
  `671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4`.
  The live bridge tests belong to older build 179666. New data does not authorize
  reusing the older native addresses.
- `runtime/research/research-delivery-routes.py` queries the corpus read-only,
  collects bounded examples, and reads Lua source from the four supplied ZIPs
  without executing or installing them. Output:
  `E:\NMS-Courier-Research\delivery-routes.json`. Preserve source archive and XML
  fingerprints in that evidence. Generic-reward counts exclude other containers.
- REWARDTABLE's generic entries contain 86 non-freighter specific-ship payloads
  with `IsGift=true`, versus one freighter payload with `IsGift=false`. This is
  a concrete branch hypothesis. It does **not** establish that gift rewards
  bypass an acquisition screen, or that freighters support the same branch.
- There are three ship-class upgrade payloads, seven weapon-class upgrade
  payloads, six ship-slot payloads, four weapon-slot payloads, nine inventory-slot
  payloads, one freighter-slot payload, and eleven specific-frigate payloads.
  Counts demonstrate schema availability, not valid targets or successful calls.
- `R_SHIPUPGRADE` has `ForceToSpecificClass.InventoryClass=C` and `Silent=false`.
  This is not a confirmed freighter upgrade operation; changing that field to S
  does not establish target selection, cost or support.
- `R_SHIPSLOT_PROD` has `AwardCostAndOpenWindow=false`, `NumTokens=1` and
  `FallbackOpenWindowIfBlocked=false`, but also references `C_INV_SAL_PRODR`.
  These flags merit handler inspection; they do not prove silent/free expansion.
- `R_BIGGS_NEW`/`R_BIGGS_EDIT` enter ship-building modes. Construction is a
  distinct route; the available schema does not demonstrate industrial freighter
  delivery or a bypass of its construction UI.
- The previously inspected OnlyS/SquareSCSlots sources change global generation.
  Season Rewards/Meta-Mod wire game actions to reward definitions. Neither is
  evidence of an external request receiver or direct freighter ownership.
  The new ZIP inspection records marker counts only; comments are not execution.

## Mechanism comparison

| Route | What it could achieve | Evidence | Missing work / recommendation |
| --- | --- | --- | --- |
| Native reward dispatch | Items, currencies, recipes, entities through game reward handling | Items/currencies already have older-build live evidence; entity schemas are indexed | Preserve this as the general delivery engine; each new reward/target needs its own test |
| Gift-specific entity reward | Request a ship/weapon as a gift without buying it | Gift fields and concrete shipped payloads; freighter's default differs | Inspect the handler branch, then one bounded variant; cheapest freighter alternative to investigate, not guaranteed UI-free |
| Direct native acquisition/finalization | Commit a generated freighter to player ownership without displaying an offer | Normal acquisition exists; current bridge reaches its offer stage | Locate the exact-build function chain after acceptance; strongest long-term route, currently unidentified |
| Native generation plus targeted configuration plus acquisition | Generate the requested Pirate model/seed and configure only that entity | Shipped scene/seed/inventory schemas; prior offer proved partial cargo control | Requires entity identity, native allocation/setters, lifetime and finalization; recommended freighter research direction |
| Upgrade the already owned entity | Maximize class, valid slots, technology and supercharged slots | Owned freighter can be read; upgrade reward schemas exist for other equipment | Useful separate capability and diagnostic baseline; cannot grant a missing freighter by itself |
| Scoped generation interception | Override generation inputs only for the current Courier request | OnlyS identifies global inputs; prior reward-time S probability window failed | Find actual constructor/generation consumption, not another probability window; pending native tracing |
| Invoke acceptance through the game | Automate the final acquisition step after initializing a reward | Free acquisition worked with user acceptance on older build | Possible transitional route; it may still create UI and cannot be called UI-free until observed |
| Input automation | Click through an offer with simulated input | Uses existing UI behavior | Fragile focus/timing and price checks; unsuitable as the core delivery engine |
| Static data mod or mission/action trigger | Register prebuilt rewards that game triggers can grant | Supplied mods demonstrate this | Useful data companion; cannot assume arbitrary external IPC, request IDs, or dynamic payload support |
| Global OnlyS/max-slot generation mod | Make newly generated entities use global defaults | Supplied Lua changes inventory/build/fleet inputs | Optional independent feature; global effects do not meet per-request delivery requirements |
| Runtime object copying/raw memory writes | Copy apparent ownership/inventory fields | Save/schema references describe some persisted data | Not an accepted shortcut: aliasing, allocation, missing ownership/base/fleet updates and overwritten state; use verified native operations |
| Save import/edit | Change persisted entity data | Save tools can manipulate their own formats | Excluded from delivery; read-only schema comparison may help research |
| Multiplayer transfer | Deliver supported objects to another player | Ordinary item transfer is a separate game mechanism | No evidence of universal freighter/weapon/recipe transfer; cannot replace local acquisition research |

These routes can be combined. A loader, programming language, or IPC transport is
not itself an acquisition mechanism.

## Expanded local delivery research checkpoint (2026-10-02)

The user requested offline work without further live tests that day. The DLL
remains the chosen runtime bridge; Python here performs research only. A fresh
bounded schema report, `delivery-capabilities-20261002.json`, extends the existing
route script with recipe, expedition-unlock, item and repair payloads. It reads
the completed E: index and two tables; it performs no extraction or installation.

| Requested operation | Shipped payload clues | Required native validation |
| --- | --- | --- |
| Deliver a ship | SpecificShip S inventory; IsRewardShip and IsGift; 87 generic payloads | Resource readiness, free claim, class/stats consistency, capacity and ownership transfer |
| Deliver a multitool | 48 generic SpecificWeapon payloads, mostly gift variants | Weapon target/limit, class, slots, active selection and native acquisition callback |
| Unlock exosuit inventory | InventorySlots Amount; nine generic payloads | Cargo versus technology targeting; existing slot validity, maximum and explicit completion |
| Unlock ship inventory | ShipSlot NumTokens and window flags; six generic payloads | Selected ship, cargo/tech destination, cost handling and whether tokens merely open a UI |
| Unlock multitool inventory | WeaponSlot NumTokens; four generic payloads | Selected weapon, free expansion and actual slot validity rather than token acceptance |
| Unlock freighter inventory | FreighterSlot Cost; one generic payload | Owned freighter, cargo/tech distinction, zero cost and real expansion count |
| Upgrade class | Ship/Weapon class upgrade payloads | Current target, actual class/stat recomputation; ship handler does not prove freighter support |
| Teach recipes/technology | 275 SpecificProductRecipe, 65 MultiSpecificProductRecipes, 182 SpecificTech, 30 MultiSpecificTechRecipes | Distinguish known recipe, awarded module and installed technology; duplicate handling |
| Expedition rewards | 306 UnlockSeasonReward payloads plus specific acquisitions | Separate unlock, claimed-in-shop marker, entitlement and actual item/entity receipt |

Counts are scoped to `GcGenericRewardTableEntry`, not every inline payload in the
corpus. They establish schema presence only; none is a supported current-build
runtime command. The report includes concrete IDs and compact fields. For example,
`RS_S1_COMPLETE` unlocks `EXPD_SHIP01` and marks it claimed in the shop; that does
not itself prove delivery of a ship. `R_SHIPSLOT_PROD` requests one token with
both window flags false; token acceptance is not proof that all slots unlock.
FreighterSlot exposes a cost reference rather than an explicit Amount, so its
free behavior must be traced rather than inferred from the reward name.

Priority is to finish request-scoped freighter initialization from the newly
observed ship S reward branch and the mapped flags. Then migrate the generic
reward dispatch entry safely to build 180383 and add one operation at a time
with native receipts and postconditions. Slot maxima and supercharged coordinates
are independent operations; do not alter global generation or change save files
to make these capabilities appear complete. The Electron frontend must advertise
only operations supported by the active exact-build adapter.

## Bridge and tool choices

The [MetaIdea client/tooling assessment](METAIDEA_SERVICE_RESEARCH.md) supports an
operation-specific hybrid: our startup DLL handles authenticated local commands
and game-thread execution; optional Courier data mods register independently
configured native reward definitions. A PAK/MBIN data mod is not an external
command listener and cannot replace the bridge. No MetaIdea backend or Service
Bot Extender dependency will be introduced. The user accepts either hybrid or
bridge-only implementations according to observed results.

Prefer hybrid reward registration for finite catalogs/native notifications when
the exact-build handler honors the supplied fields. Prefer bridge-only native
calls for dynamic configuration where static data cannot express the request.
Neither approach authorizes shared global generation edits. Validate model,
class/stats, unlocked indices, cost, ownership and save persistence individually.
Data mods need reversible deployment, collision checks and exact loaded hashes;
rebuilding a data file does not prove it was reloaded by a running game.

C#/.NET can also be used for independently verified research and controller work.
`InspectNativeCandidates.cs` uses the SDK PEReader and SHA-256 APIs without NuGet
packages, process attachment or writes. SDK 10.0.400 validated five current-build
candidate entries offline. This supplies an independent check of Python's PE
mapping; changing language alone does not establish an ABI or fix acquisition.

Prefer an independently maintained native DLL loaded at startup, with commands
consumed on a verified game callback. The existing older-build callback evidence
supports this architecture, not production readiness. Electron should send narrow
typed operations, not offsets, arbitrary memory writes or executable code.
Python may remain an offline research tool; it is unnecessary as the runtime
delivery dependency for this direction.

C# can host the controller or a managed adapter with verified native interop.
It does not supply missing freighter functions or remove ABI/build verification.
The [NoMansSky.Api project](https://github.com/gurrenm3/NoMansSky.Api) demonstrates
Reloaded-II hooks, a game-loop callback and limited inventory access. GitHub's
repository API reported `pushed_at=2023-06-04T06:12:16Z`; inspected tree/commit
`1974810b828802377129a03bb96fa2d6f10ded8a`. Its inventory extension wraps native
`GetElement` access, not a demonstrated freighter acquisition API. Treat it as
historical reference, not an installable solution for build 180383.

[Mrsuss60's native mods](https://github.com/Mrsuss60/NoMansSky_MODs) provide native
mod examples; their repository is not evidence that its loaders/signatures match
our executable or expose delivery. [MBINCompiler](https://github.com/monkeyman192/MBINCompiler)
and [AMUMSS](https://github.com/HolterPhylo/AMUMSS) are data-mod tooling. Data schemas
help identify inputs; native acquisition handlers require executable research.
No external framework was installed or executed during this assessment.

## Recommended order and proof requirements

1. Inspect the exact-build reward handler's gift/entity branches and ownership
   finalization chain offline. Explicitly track freighter versus starship targets.
   Gift true/false is one hypothesis; do not assume the flag solves delivery.
2. Port/verify read-only callback and state observations for the installed build.
   First locate owned entity identity, inventories and acquisition transitions;
   do not reuse the negative temporary-frontend-class mutation as a fix.
3. Validate the simplest native acquisition path on a disposable save, initially
   with ordinary supported inventory sizes. No UI requirement is imposed, but
   absence of UI must be observed if that is claimed.
4. Add per-request Pirate scene/seed, S class, 120 valid cargo and 60 valid tech
   slots; treat supercharged positions and 120 technology slots as separate
   experiments. Grid dimensions alone are not unlocked slot counts.
5. For existing equipment, research native upgrade/install/unlock operations as
   independent commands. This can advance the general app without freighter
   generation being finished. Do not imply ship-class rewards support freighters.

Successful acquisition must verify ownership, requested model/seed, class, every
valid inventory and supercharged count, preserved installed technology, no currency
debit, usable summoned entity, and persistence after normal save/reload. Replacing
a freighter also needs explicit base/fleet/crew transfer behavior. Commands require
exact-build and adapter hashes, correct local target, known prior outcome, and
no automatic mutation retry. Partial acquisition/configuration is not atomic;
report the actual partial outcome instead of masking it or retrying blindly.
