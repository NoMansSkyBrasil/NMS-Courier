# Signal scripts for the build 180836 research profile

One script per game domain. Each one loads `profile-180836.ps1`, which holds
the shared preflight (process, executable hash, installed DLL hash, profile
status, dispatch state) and the event and request-file helpers. How a request
travels from here into the game is described in
[live bridge operations](../../../../docs/LIVE_BRIDGE_OPERATIONS.md).

Status: written and parse-checked on 2026-10-07. **Not yet used for a live
request.** Every run recorded before that date used the combined
`signal-freighter-class-180836.ps1`, which these replace.

| Script | Domain | Requests |
| --- | --- | --- |
| `signal-freighter-180836.ps1` | Freighter offer | `-Class`, `-MaxSlots`, `-ExtendedTechnology`, `-Supercharge`, `-Scene`, `-ModelSeed`, `-HomeSeed`, `-DispatchOffer`; `-DispatchSlotReward` |
| `signal-corvette-180836.ps1` | Corvette build | `-Class`, `-MaxSlots`, `-ExtendedTechnology`, `-Supercharge`, `-DispatchBuild` |
| `signal-ship-180836.ps1` | Owned starship | `-Slots`, `-Supercharge` on the primary ship or `-Index N`; `-DispatchReward` |
| `signal-multitool-180836.ps1` | Equipped multitool | `-Slots`, `-Supercharge`; `-DispatchReward` (`R_WEAP_UPGRADE` is one class step) |
| `signal-exosuit-180836.ps1` | Exosuit | `-Slots`, `-Supercharge`; `-DispatchSlotReward` |

All take `-GameProcessId`, `-ExpectedDllSha256` and `-PreflightOnly`.

## Mapping from the combined script

| Combined script | Now |
| --- | --- |
| `-Class S -MaxSlots -ExtendedTechnology -Supercharge -DispatchTestReward` | `signal-freighter-180836.ps1` with `-DispatchOffer` |
| `-Class S ... -DispatchCorvetteBuild` | `signal-corvette-180836.ps1` with `-DispatchBuild` |
| `-OwnedTarget primary-ship` / `-OwnedTarget ship -OwnedIndex N` | `signal-ship-180836.ps1` / with `-Index N` |
| `-OwnedTarget equipped-weapon` | `signal-multitool-180836.ps1` |
| `-OwnedTarget suit` | `signal-exosuit-180836.ps1` |
| `-DispatchListedReward <ID>` | `-DispatchReward <ID>` or `-DispatchSlotReward` on the script of that domain |

Differences in behaviour:

- The combined script required `-Class` and armed a class for the next offer
  even when the request was an in-place change. The ship, multitool and
  exosuit scripts arm nothing.
- `-OwnedTarget weapon -OwnedIndex N` (a multitool array record) is not
  exposed: the game undid that write for the equipped multitool, and it was
  not tested on another one.
- The rewards that span domains (`R_ROGUE_CLASS`, `R_INVBOX`, `R_ROGUE_INV`)
  are not exposed; they remain in the profile's compiled-in list.

## Rule

Add a new domain as a new script here. Do not add a second domain's
parameters to an existing script; put anything two domains share into
`profile-180836.ps1`.
