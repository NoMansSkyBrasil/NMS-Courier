# Finishing technologies that are waiting to be installed

Owner request of 2026-10-10: walk the inventories of the player, the ship, the
multi-tool, the freighter and the exocraft (the land vehicles, the Nautilon
included) and finish every technology that is still waiting for its
components. In the game such a technology shows a gear in its top right corner
and asks for "required components" before "Install technology" completes it.

Status: **offline reading only, nothing built, nothing sent to the game.**
Build 180836 (executable SHA-256
`13d5060d4efb9d2a6a6b1b349bc4257231056cc2a055df4bb15d816262cc3499`).

## What marks a technology as waiting

`GcInventoryElement` (0x30 bytes, metadata of the executable): `Id` +0,
`Index` +0x10, `Amount` +0x18, `DamageFactor` +0x1c, `MaxAmount` +0x20,
`Type` +0x24, `AddedAutomatically` +0x28, `FullyInstalled` +0x29. A waiting
technology is an element of type technology with `FullyInstalled` 0.

## The game's own routine that finishes one (candidate)

Found by searching the code for uses of `+0x29`; the only place that takes
the address of the flag of an element it looked up in a store and then sets
it is the function at `10b7c80`. Read so far:

- One argument, an object of which it reads only three fields: an inventory
  choice at `+0x4f0`, an owner index at `+0x4f4` (`-1` means the current
  one, taken from the player state: `+0x182a0` for the ship choices 4, 5, 6,
  `+0x17ea0` for the choices 10 and 11) and a slot index at `+0x4f8`.
- It picks the store from the choice (stores are 0x248 bytes apart from the
  object at manager `+0xc240`; offsets seen: `+0x10` for choice -1, `+0x4b68`
  for 10, `+0x5b60` for 11, `+0x6b58` for 4, `+0x86c8` for 6, `+0xa228` for
  5, and two more at `+0x85bc30` and `+0x870258`), then asks the store for
  the element at the slot (`56b530(store, &index)`).
- If the element is not fully installed it builds a message with `%TECH%`
  replaced by the technology's name (`ebb9e0`, `2be4e20`, then `b1ee20` on
  manager `+0x942b50`), tells the mission events list (manager `+0x847d78`),
  and remembers the element at manager `+0x26340`.
- Then, in every case: `DamageFactor` becomes 0, `FullyInstalled` becomes 1,
  the charge is set from the technology's definition and the difficulty
  setting, the store is refreshed (`54d060`, `5945a0`), and the matching
  entry is removed from the list of installs in progress at manager
  `+0x23be8` (entries of 0x1b0 bytes: slot at `+0x1a0`, owner index at
  `+0x1a8`, choice at `+0x1ac`; `5bc420`).

It does not take the components away in what was read; the caller is
expected to have done that.

## Not known yet

- Who calls `10b7c80` and whether it is really the last step of "Install
  technology" (not traced).
- The full map from inventory choice to store (the enum `GcInventoryChoice`
  has 33 values; only the offsets above were read) and which choice is each
  exocraft, the freighter and the multi-tool.
- Whether calling it with a zeroed object that holds only the three fields
  is safe (the end of the routine was not read past `10b8258`).
- Rejected: the other writers of `+0x29` (`5b4930` swaps a missing
  technology for `OBSOLETE` when a store is read; `1108e40`, `f77c05`,
  `3869c3`, `1372de2` and `4c66eb` belong to other structures).

## Plan

1. Trace the caller and read the routine to its end; list the choices.
2. Bridge: a new domain file `technology_install.h` that walks the stores
   read-only, lists waiting technologies and calls the game's routine for
   each chosen one. Native call, the game's own message, nothing written by
   hand. New bridge version; the game must be closed to install it.
3. Application: a page listing what is waiting per inventory, with "finish
   one", "finish this inventory" and "finish all", in the 14 languages.
4. Live test from the application on slot 3 with a technology placed and
   left waiting.

## Reproduce

Disassemble `10b7c80` of build 180836 (about 0x600 bytes). Search bytes for
the flag: `C6 4x 29 01` (set), `80 7x 29 00` (test), `lea reg, [rax+0x29]`
at `10b7d64`.
