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
