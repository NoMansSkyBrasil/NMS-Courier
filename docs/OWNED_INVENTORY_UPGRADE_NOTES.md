# In-place upgrades of owned ships, multitools and the exosuit

Checkpoint: 2026-10-07. Status: **requested by the user, planned, not
implemented and not researched at runtime**. Nothing here is a capability.
Never implement this by editing saves.

## What the user asked for

1. Take a ship the player already owns and, **without replacing it**, unlock
   every slot and mark every technology slot special: 120 cargo, 120
   technology, all special ("120 x 120" with the supercharge mark). The same
   for the player's own (exosuit) inventory.
2. Take a multitool the player already owns and, without replacing it,
   change its class to S from any class and give it 120 technology slots,
   all special.

These differ from everything delivered so far: the freighter and corvette
work changes an **offer** while the game sets it up; these change an item the
player already owns.

## What is already known and reusable

From the offer work on build 180836 (see
[inventory class research](INVENTORY_CLASS_RESEARCH.md) and
[corvette delivery notes](CORVETTE_DELIVERY_NOTES.md)):

- The store layout: valid-slot rows at `+0`, width, height and count at
  `+0x80`, element vector at `+0x88`, special-slot vector at `+0xc0`, base
  stats at `+0xd0`, seed at `+0xe0`, class at `+0x100`.
- Native routines the profile already calls on offer stores: the layout
  routine with an explicit slot count, the base-stat generator for a class,
  and the vector growth helper used to append special slots.
- On a ship item the three stores are main, technology and cargo; owned S
  ships carry the class in all three.

## What is missing

- **Where owned stores live at runtime.** The offer hooks receive the item
  from the game; for an owned ship, multitool or the exosuit the bridge must
  find the player's ownership records itself. The save shows the structure
  (a ship ownership list with three inventories per ship, a multitool list,
  the player inventories), but the in-memory location and a safe way to reach
  it are not established.
- **Whether calling the layout routine on a populated store is safe.** On
  offers the store is fresh. An owned store holds items and installed
  technologies; the routine's effect on existing elements is not known.
- **Refreshing the interface and persistence.** The freighter work showed
  that some changes become visible only after a reload.
- **Size-type limits.** Ship and weapon size types have smaller large bounds
  than the freighter and corvette entries (for example fighter technology is
  not 10 x 12); reaching 120 needs the same scoped table change, per size
  type, checked first.
- **Multitool class.** The class draw and base stats for weapons are ported;
  applying a class to an owned weapon store is the same pair of writes as on
  ships, once the store is found.

## The game's own in-place rewards (read from data, 2026-10-07)

The user asked whether the change could be called from the game itself, with
the game's own message. The executable defines reward types for it, and the
shipped reward table (identical in build 180836) has entries that use them:

| Reward ID | Type | Parameters as shipped |
| --- | --- | --- |
| `R_WEAP_UPGRADE` | `GcRewardUpgradeWeaponClass` | not silent |
| `R_SHIPUPGRADE` | `GcRewardUpgradeShipClass` | not silent, `InventoryClass = C` |
| `R_ROGUE_CLASS` | both class types in one entry | not silent |
| `R_SHIPSLOT_CASH`, `R_SHIPSLOT_PROD` | `GcRewardShipSlot` | one token, cost entries, no window |
| `R_WEAPSLOT_CASH`, `R_WEAPSLOT_PROD` | `GcRewardWeaponSlot` | one token, cost entries, no window |
| `RS_INV_SLOT` | `GcRewardInventorySlots` | amount 1 |
| `R_INVBOX` | ship slot, weapon slot and inventory slot together | awards the cost and opens the window |
| `R_ROGUE_INV` | the same three | five tokens / amount 5 |
| `R_FREIGHTSLOT` | `GcRewardFreighterSlot` | cost entry |

What each does at runtime (which item it targets, one class step or a jump,
whether it charges, what it shows, natural caps) is **not known** from the
data and is the purpose of the first test. These rewards respect the game's
own limits, so they cannot by themselves give 120 special technology slots;
that part still needs the in-memory approach described above.

### Observation build (built and installed, **not yet run**)

The research profile gained a `reward` event. It reads one reward ID from
`%LOCALAPPDATA%/NMSCourier/diagnostics/native-reward-request-180836-<PID>.txt`
and dispatches it once only if it is one of the eleven IDs in the table above
(the list is compiled in). `signal-freighter-class-180836.ps1
-DispatchListedReward <ID>` writes the file and sends the event. DLL SHA-256
`b408f09077fe47e2fa6ef288410e9362598603ddba1308d7d219930998474c5b`,
installed 2026-10-07 in place of `5887b8ea...5b0d`. The existing fixture
passes; it has no check for the new event. The script still arms the class
argument for the next freighter or corvette setup as before; that request is
unrelated to these rewards.

### First live results: class rewards (2026-10-07, one process)

Build 180836 (`13d5060d...3499`), DLL `b408f090...4c5b`, user in a space
station. Each line is one `reward` event after a passing preflight; every
call returned (`dispatch_state=3`, no request errors).

| Reward | Item state before | Observed by the user |
| --- | --- | --- |
| `R_WEAP_UPGRADE` | current multitool class A | game message shown; class became S; no cost noticed |
| `R_SHIPUPGRADE` | current ship already class S | no message, no change |
| `R_WEAP_UPGRADE` | another multitool, class C, made current | class became B (one step) |
| `R_WEAP_UPGRADE` twice more | the same multitool | result not yet reported (expected A, then S) |

So the weapon class reward acts on the current multitool, raises it by one
class per dispatch through the game's own message, and the ship class reward
does nothing at the maximum. A first attempt of the first line did not reach
the game: the signal script failed to write the request file (a path escape
lost in an edit); it was corrected and only one dispatch was sent.

User requirement recorded: upgrades only. The interface may raise a class
(including straight from C to S, by repeating the step) but must not offer a
downgrade, since the game has none.

Not proven: `R_SHIPUPGRADE` on a ship below S and the meaning of its
`InventoryClass` parameter; the slot rewards; costs (the user noticed none);
persistence after save and restart.

### Slot reward opens a window (2026-10-07, same process)

`RS_INV_SLOT` dispatched once: the game opened "Atualize o inventário do
exotraje" with one slot available and waits for the player to pick a
position. The user wants every slot at once and silently, so the slot
rewards are not the route for that; they stay useful for single, visible
upgrades. The class rewards remain the route for class.

### Owned stores located read-only (2026-10-07, same process)

`runtime/research/scan-owned-inventory-stores.py` opens the game process with
query and read rights only and searches private read-write memory for the
store layout (rows, grid header, class) with consistency checks. 45
candidates, 35 inside the game manager object. Offsets from the manager
(observation of one process on build 180836, to be confirmed in another):

| Offset | Stride | Count seen | Reading |
| --- | --- | --- | --- |
| `12d98` | `248` | 5 | Ship main stores by ship slot (37, 21, 21, 37, 37 slots, class S — the user's five ships; the same base and stride appear in the ship setup code) |
| `16468` | `248` | 5 | Ship technology stores by ship slot (27, 25, 27, 27, 24 slots, four special each) |
| `2b2fe0` | `320` | 3 | Multitool records by slot, store first (8, 20, 20 slots) |
| `d248`, `d490` | — | 2 | Freighter main and technology (120 slots each, 120 special on the second) |
| `c498` | — | 1 | A 10 x 6 store with 10 slots and 3 special — taken to be the exosuit technology store |
| `ddb0` onward | `248` | 10 | Ten 50-slot stores — the storage containers |

Not found by the scan: the exosuit cargo store and the sixth ship slot (the
corvette added earlier); the reason was not investigated.

### Silent in-place change (built and installed, **not yet run**)

New profile event `owned`: reads `target=ship|weapon`, `index=N` and
`slots=1` and/or `super=1` from a per-process request file and, on the game's
update thread, takes the store addresses from the offsets above, checks each
store for self-consistency, and then

- with `slots`, makes every position of a 10 x 12 grid valid by writing the
  row masks, width, height and count (ship: main and technology; weapon: its
  one store). This is a **direct write of the header fields the native layout
  step produces**, not a call of that step, because its arguments for an
  owned store are not known;
- with `super`, appends a special-slot entry for every valid technology slot
  through the game's own vector growth helper, as on offers.

It does not touch class or base stats (class goes through the game's own
rewards). `signal-freighter-class-180836.ps1 -OwnedTarget ship|weapon
-OwnedIndex N -OwnedSlots -OwnedSupercharge`. DLL SHA-256
`a380fc1a84e2ca814cd7f5f1548c9f3030dfd59df6fa3da3ad523d735602abfd`,
installed in place of `b408f090...4c5b`. The fixture passes; the owned branch
is compiled out of it and untested. Before the run the two newest save files
were copied unchanged to
`E:/NMS-Courier-Research/save-backups/20261007-before-owned-upgrade`.

Risks to watch on the first run: the interface with a 12-row grid on a ship
or multitool whose size type allows fewer rows; whether the game rewrites the
grid on reload; whether a multitool accepts more special slots than its
type's limit; anything odd with items already in the store.

### First live results of the silent change (2026-10-07, one process)

Build 180836, DLL `a380fc1a...abfd`. Store offsets were confirmed read-only
in this second process before any change (same offsets, same grids as the
user's five ships and three multitools).

| Request | Read back from memory | Seen by the user |
| --- | --- | --- |
| ship slot 4, slots and special | main 10 x 12 / 120; technology 10 x 12 / 120 with 120 special; 20 elements kept | not looked at (not the current ship) |
| ship slot 1 (current ship), slots and special | main 10 x 12 / 120 with 21 elements; technology 10 x 12 / 120 with 120 special, 16 elements | **worked** in the inventory screen |
| weapon record 0, slots and special | 10 x 12 / 120 with 120 special right after the write; a later read showed the record back at 7 x 3 / 8 with 4 special | **no change** in the game |
| exosuit | not requested (not supported by that build) | no change |

Explanation of the multitool failure, from further read-only reads: the
equipped multitool has an **active store** in the player area of the manager
(`+c928`), and the game copies it over the record in the weapon array, which
undid the write. Next to it are the exosuit technology store (`+c498`, 10 x 6
with 10 slots and 3 special) and the exosuit cargo store (`+c250`, a 10 x 12
grid whose count field, 24, does not equal its set bits — which is why the
scan had not listed it).

The current ship is identified by the value the ship setup code uses as index
into the ship store array: the 32-bit value at `+182a0` of the object whose
pointer is at manager `+c240`. Read-only check: 1, with ship slot 1 as the
user's current ship.

User requirement recorded: the program must itself identify the current ship
and the equipped multitool.

### Second build (built, **not yet installed or run**)

Targets added to the `owned` event: `primary-ship` (resolves the slot as
above), `equipped-weapon` (the active store at `+c928`) and `suit` (cargo
`+c250` checked by rows only, technology `+c498`). The status file reports
the resolved index. DLL SHA-256
`37eecaaf8c51ffc7da5ae1aa1ee2b61365d0915fc76414f364cec9a1986df1fa` under
`E:/NMS-Courier-Research/native-builds/freighter-class-180836-owned-e-20261007`.
The fixture passes with the owned branch compiled out.

Not proven: persistence of the ship change after save and restart; the
equipped multitool and exosuit through their active stores; the meaning of
the exosuit cargo count field; whether the active ship also has an active
copy that matters in other situations.

## Proposed order (not started)

1. Read-only: locate the player's ship, multitool and exosuit stores in the
   running game and log their grids and classes; compare with the save.
2. On a disposable save: class S on one owned multitool (two writes plus the
   native base-stat call), check interface, save, reload.
3. Slot grids and special slots on one owned ship, then the exosuit.
4. Only then expose it as requests from the frontend.

## Plain ship exports (`.nmsship` for ordinary ships)

A second kind of `.nmsship` supplied by the user is a plain JSON document,
not an archive: `Ship` (name, resource filename and seed, the three
inventories with their items, installed technologies, valid slot indices,
class, base stat values and special slots, plus the inventory layout),
`CharacterCustomisationData` and `UsesLegacyColours`. The example is a fixed
(non-procedural) interceptor model of class S with a 7 x 5 main grid of 21
valid slots, a 10 x 3 technology grid of 25 valid slots with four special
slots, and procedural upgrade technologies written as `ID#number`.

For Courier this is a description of a complete owned ship. Delivering one
means an offer with that resource and seed (the specific-ship route already
used for freighters), then class, grids and special slots as on corvettes;
installing the listed technologies and items is a further step that is not
researched. Ship delivery itself is still unimplemented.
