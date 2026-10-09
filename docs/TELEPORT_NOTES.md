# Travel to a star system by galaxy and portal address

Status on 2026-10-09: **built in bridge 1.21.0 and application 1.26.0, not
exercised against the running game.** Build 180836 only. It is a change of
the loaded slot (where the player is).

Owner request: travel in real time to any address in any galaxy without a
portal, with a list of saved destinations, working like a community tool the
owner showed (galaxy list, glyph pad, code field, favourites), not looking
like it.

## What the game has (read in the executable)

- A reward class `GcRewardTeleport` (class hash `0x3c426079`) with one field,
  `TeleportRewardType`: `None`, `ToBase`, `Station`, `Atlas`,
  `WeirdPortalWarp`. The reward table uses three of them once each. The
  reward routine hands it to `f3a910(unused, reward, peek, silent)`.
- That handler does not travel. It fills a **pending request** in the manager
  object and sets its state; the game makes the journey afterwards. The
  request is `0xc0` bytes at manager `+0x72f120`, the state is the integer at
  `+0x72f1e0`, set to 2 (to `0xe` for `WeirdPortalWarp`, which uses other
  fields).

| Request offset | Content |
| --- | --- |
| `+0x00` | destination packed: int16 X, int16 Z, int16 Y, two bytes, uint16 system, uint16 galaxy |
| `+0x10` | a position the handler takes from the game |
| `+0x20` | float -1, an integer 0 and a byte 0 |
| `+0x30` | a `GcTeleportEndpoint`, `0x90` bytes |

- `GcTeleportEndpoint` as the executable's own metadata lays it out: `Facing`
  `+0x00`, `Position` `+0x10`, `UniverseAddress` `+0x20` (`PlanetIndex`
  `+0x20`, `SolarSystemIndex` `+0x24`, `VoxelX` `+0x28`, `VoxelY` `+0x2c`,
  `VoxelZ` `+0x30`, `RealityIndex` `+0x34`), `AllianceId` `+0x38`,
  `TeleporterType` `+0x48`, `Name` `+0x4c`, `CalcWarpOffset` `+0x8c`,
  `IsFavourite` `+0x8d`, `IsFeatured` `+0x8e`.
- `TeleporterDestinationType`: `Base` 0, `Spacestation` 1, `Atlas` 2,
  `PlanetAwayFromShip` 3, then `ExternalBase`, `EmergencyGalaxyFix`,
  `OnNexus`, `SpacestationFixPosition` and later values. The game's data uses
  `Atlas` and `PlanetAwayFromShip` in mission steps. Values 0 to 3 follow the
  handler (it writes 1 for the reward type `Station` and 2 for `Atlas`); the
  names of the later values share strings with other enumerations and their
  numbers were not read.
- The handler's branches: `ToBase` (1) asks the player state for the base's
  endpoint (`5b3590`); `Station` (2) needs the current system to have a
  station and writes type 1 with the current address; `Atlas` (3) has no
  precondition and writes type 2 with the current address; in every case the
  voxel coordinates are clamped to X and Z in -2047..2047 and Y in -127..127
  before they are packed.
- The debug text "UA & Portal Code Checker" (`eba0cd`) only converts between
  address forms; it does not travel.

## How the bridge asks (bridge 1.21.0)

`runtime/native/asi/profile_180836/teleport_request.h`. Request
`native-teleport-request-180836-<PID>.txt`, event `teleport`:

```text
galaxy=<0..255>
system=<0..4095>
planet=<0..15>
x=<-2048..2047>
y=<-128..127>
z=<-2048..2047>
to=station|planet
```

On the game thread: refuse when a request is already pending; call the
handler with the reward type `Atlas` (a **native call**), which fills the
whole request for the system the player is in; when the state is 2, **write
directly** the destination into the packed header and the endpoint's
`UniverseAddress`, and the teleporter type (1 for the station, 3 with the
planet index for a planet). Nothing else of the request is touched. Result
`native-teleport-result-180836-<PID>.txt`: `result=requested`, `not_ready`
or `not_filled`, and the destination.

To undo: there is no undo; the player is somewhere else. Save before, or
travel back. The application copies the save folder before the request, as
for every delivery.

## The application (1.26.0)

Page "Teleport" under "Deliver": the galaxy from a searchable list of all 256
by number and name, the twelve glyphs on a pad of the game's own sixteen
glyph pictures (`textures/ui/frontend/icons/update3/portalsymbol.<digit>.dds`,
read from the installation like the catalogue icons) or pasted as a code, arrival at the system's
space station or on the planet of the first glyph, and a list of saved
destinations kept in the application (not in the game, not in the save).
Glyph coordinates are turned into the signed values the game keeps
(`apps/desktop/src/shared/portal-address.ts`).

## Not proven, and open

- Everything live: that the game makes the journey from this request, to
  another galaxy as well, and where exactly the player arrives.
- Whether the position and the other values the handler filled for the
  current system suit a station in another system, and a planet (type 3).
- Whether a system index that does not exist in the region, or a planet index
  beyond the system's planets, is refused by the game or fails badly.
- The clamp of the game leaves out the outermost coordinate values; the
  bridge accepts the full glyph range.
- For one language of the game the name routine rewrites the generated word
  (the branch taken when the game's language number is 12); the table keeps
  the plain word there.
- Saved destinations cannot be exported or imported yet.

## Galaxy names

The game names a galaxy with the routine at `135a2a0` (galaxy number counted
from 0, a flag, two text buffers). Numbers 0 to 4 take the language strings
`MAIN_GALAXY`, `SECOND_GALAXY`, `THIRD_GALAXY`, `FOURTH_GALAXY` and
`FIFTH_GALAXY`. Every other number is hashed into a seed, the procedural word
generator (`e81780`) makes a word of at least nine letters from it, its first
letter is made a capital, and the word is put into the language string
`UI_GALAXY_FORMAT` in place of `%GALNAME%`.

`runtime/research/emulate-name-generation.py --kind galaxy --build 180836`
runs that routine under emulation for the numbers 0 to 255 (no error; the
English names include the ones players know, such as Eissentam for galaxy 10
and Odyalutai for 256). `runtime/research/list-galaxy-names.py` then puts
each word into the format of each of the 14 interface languages, read from
the corpus language files, and writes
[the table](../runtime/research/galaxy-names.md). The emulation report is a
transient file outside the repository.
