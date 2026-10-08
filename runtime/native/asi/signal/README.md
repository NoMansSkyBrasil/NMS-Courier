# Signal scripts for the build 180836 research profile

One script per game domain. Each one loads `profile-180836.ps1`, which holds
the shared preflight (process, executable hash, installed DLL hash, profile
status, dispatch state) and the event and request-file helpers. How a request
travels from here into the game is described in
[live bridge operations](../../../../docs/LIVE_BRIDGE_OPERATIONS.md).

Status: the technology, recipe, fish and product scripts have been used live on
slot 3 (2026-10-07); the others have not been used since the split. Every run
recorded before the split used the combined
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

## Technology

`signal-technology-180836.ps1` teaches known technologies: `-Id A[,B...]` for one or
several, `-All` for every entry classed `deliverable`, `-ShowAlert` for the game's own
alert. It refuses blocked and unknown IDs before sending and prints the profile's
per-ID result. Rules and status:
[technology delivery notes](../../../../docs/TECHNOLOGY_DELIVERY_NOTES.md). Used live on
2026-10-07.

## Recipes

`signal-recipe-180836.ps1` teaches refiner and cooking recipes to the loaded slot:
`-All` for every recipe of the running game's table, or `-Id A[,B...]`. It prints the
profile's counters. Rules and status:
[recipe delivery notes](../../../../docs/RECIPE_DELIVERY_NOTES.md). Used live on
2026-10-07.

## Rewards

`signal-reward-180836.ps1` marks season, Twitch and platform rewards as redeemed in
the loaded slot: `-Id A[,B...]`, or `-AllOfKind season|twitch|platform` with an
optional `-Expedition N`. It only sends IDs listed as deliverable in
`runtime/research/unlockable-rewards.md`. Status and open risks:
[reward redemption notes](../../../../docs/REWARD_REDEMPTION_NOTES.md). Not yet used
for a live request.

## Fish

`signal-fish-180836.ps1 -All` fills the loaded slot's fishing record with one catch per
fish. Status and side effects:
[reward redemption notes](../../../../docs/REWARD_REDEMPTION_NOTES.md). First used live
on 2026-10-07.

## Products

`signal-product-180836.ps1` teaches product recipes to the loaded slot: `-Id A[,B...]`, or
`-AllOfClass catalogue_item|catalogue_technology|catalogue_construction|research_tree|customisation`. Rules and
status: [product delivery notes](../../../../docs/PRODUCT_DELIVERY_NOTES.md). First used live
on 2026-10-07.

## Customisation

`signal-customisation-180836.ps1 -Id A[,B...]` or `-All` records in the loaded slot the specials
that unlock customisation options, through the profile's `redeem` event. Status:
[customisation unlock notes](../../../../docs/CUSTOMISATION_UNLOCK_NOTES.md). First used live
on 2026-10-07; effect not confirmed.

## Account

`signal-account-180836.ps1` unlocks titles, specials and season rewards **on the account**
(every slot, synchronised outside the machine): `-Title`, `-Special`, `-Season` with IDs, or
`-AllOfKind title,special,season`. Kinds `twitch` and `platform` (`-Twitch`, `-Platform`) are a direct
insert into the account's set, not a game routine. Back up the save folder and the settings file first. Status:
[account unlock notes](../../../../docs/ACCOUNT_UNLOCK_NOTES.md). First used live on 2026-10-08. Give several
kinds through `powershell -Command`, not `-File`.

## Account keep list

`signal-account-keep-180836.ps1 -AllOfKind twitch,platform` writes the list of Twitch and platform
rewards the profile re-inserts in every session; `-Clear` empties it. With `-GameProcessId` and
`-ExpectedDllSha256` a running game loads it at once. Call it through `powershell -Command` when
giving several kinds. Status: [account unlock notes](../../../../docs/ACCOUNT_UNLOCK_NOTES.md). Not yet
proven live.

## Rule

Add a new domain as a new script here. Do not add a second domain's
parameters to an existing script; put anything two domains share into
`profile-180836.ps1`.
