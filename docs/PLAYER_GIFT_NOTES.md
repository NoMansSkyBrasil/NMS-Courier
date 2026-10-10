# Delivery to another player of the session

Owner request of 2026-10-10: send to a friend what the application already
gives the local player, starting with a ship. The friend has nothing
installed; the owner joins the friend's group or the friend joins the
owner's. The reference service does this in public use
([reference catalog](REFERENCE_FEATURE_CATALOG.md#what-the-reference-shows-about-delivery-to-another-player-owners-screenshots-2026-10-07)).

Status: **items: built (bridge 1.35.0, application 1.45.0), not installed
and not tried in the running game. Ships, multi-tools and everything else:
not built; only candidates read from names.** Build 180836 (executable
SHA-256
`13d5060d4efb9d2a6a6b1b349bc4257231056cc2a055df4bb15d816262cc3499`).

## The limit that shapes this

Every local delivery calls a routine inside the sender's own game. The
other player's game runs no code of ours, so it can only be reached by what
the game itself sends over the network. A delivery to another player
therefore needs, for each kind of thing, a network call of the game whose
receiving side does the work. One target selector in the application is
possible; one route in the game for everything is not.

## What the game can send (read from type names, offline)

The executable keeps the type names of its remote calls
(`cGcRpcCall<…>` and `cGcNetworkTransaction<…>`), 129 of them. Those that
hand something to a player:

| Remote call | Arguments after the player | Read as |
| --- | --- | --- |
| `cGcGameState::OnReceiveRemoteItems` (transaction, tag `RRIT`) | 16-byte ID, amount | The game's "transfer to player": the receiving game adds the item |
| `cGcGameState::OnReceiveRemoteCreatureEgg` (transaction, tag `RRCE`) | `sOwnedCreatureInfo` | A companion egg |
| `cGcGameState::OnReceiveRemoteByteBeatSong` (transaction) | `cGcByteBeatSong` | A ByteBeat song |
| `cGcPlayerNotifications::RPCStartMission` (tag `SMIS`) | list of user identifiers, mission ID, seed, flag | Starts a mission in the receiving game: handler `9c6090` calls `9b8cb0` on the mission manager (`manager + 0x847bb0`) with the ID and the seed |
| `cGcPlayerNotifications::RPCBroadcastMissionMessageSeeded` (tag `RMMS`) | ID, ID, seed | A mission message; sent from the reward code (`f2bc8e`, `f2bcf4`, `f1ccfc`) |
| `cGcStatsManager::OnReceiveStatRecordInt` / `Float` | stat ID, value, flag | A statistic recorded in the receiving game |
| `cGcMPMissionTracker::RPCReceiveInventory` | list of inventory elements | Multiplayer mission inventory |

No remote call and no network message type hands over a ship, a multi-tool
or a freighter by itself. The full list of names is reproduced by reading
the type names in the executable that contain `cGcRpcCall` or
`cGcNetworkTransaction`.

## Items: how the game sends them

- The game state (`manager + 0xe70`) starts with two transaction objects
  made in `4886e0`: items (virtual table `4a5ee00`, tag `RRIT`, handler
  `48c4e0`) and creature egg (`4a5ee28`, tag `RRCE`, handler `48ddb0`).
- The inventory screen calls `48ab80(game state, player, store, index,
  amount)` (from `697af5`). It finds the element and calls
  `4b43a0(transaction, answer callback, player, ID, amount)`; a product of
  one kind (`+0x1e8 == 8`) goes as an egg through `4b3fb0` instead.
- `4b43a0` keeps the callback with the receiver's user identifier and sends
  the request to that one player (`af4740` on `manager + 0x937140`).
- Receiving side: `4b4220` reads the ID and the amount and calls the
  handler. `48c4e0` first checks two things about the sender (one of them
  answers "accepted" without adding anything, which looks like a block
  list), wants an amount above zero, looks the ID up as a product
  (`ec9ba0`) and otherwise by another table, and adds it with the game's
  inventory routines.
- The answer comes back to `4b36f0`, which calls the kept callback with a
  status and the accepted flag. A missing callback aborts the game there.
- Players: `322500` looks a user identifier up in four pointers at
  `manager + 0x93aad0 + 0x58`, `3217f0` in thirty-two at
  `manager + 0x9371f0 + 0x58`. A player object holds its user identifier
  as text at `+0x4178` (64 bytes).

## What was built

Bridge 1.35.0
(`2d84c3aca63cb4ed31c97f9e933181a121d9761598abfbe0615dcec899f930dd`),
`player_gift.h`, request `native-gift-request-…`, event `gift`:

- `mode=list`: reads both player tables and writes `player=<slot>,
  <party|session>,<user identifier>` lines. Reads only.
- `mode=send` with `slot=`, `user=`, `item=`, `amount=` (1 to 9999): checks
  that the slot still holds that user, that the transaction object is the
  expected one (virtual table and tag) and that the ID is a substance or a
  product of the running game, then calls `4b43a0` with a callback of its
  own. Result `sent`, and `answer=waiting` until the other game answers,
  then `accepted`, `refused` or `failed`.

A native call of the game's own send routine; the bridge writes nothing.
The sender's save does not change (nothing leaves the inventory), so the
application makes no backup. The change is in the other player's slot and
is made by their game.

Application 1.45.0: page "Send to a friend" under Inventory
(`player-gift-card.tsx`, `shared/player-gift.ts`, `gift-plan.ts`): find
players, pick one, pick an item and an amount, confirm, see the answer.

## Not known

- Everything in the running game. In particular: whether the party table
  or the session table holds the friend, whether the local player is in
  them (the list may show the sender too), and what the receiving player
  sees.
- "Accepted" means the other game's handler returned true. One early path
  returns true without adding anything, so the friend's inventory is the
  proof, not the answer.
- A player's display name: only the platform identifier is read.
- Whether the receiving game applies limits (stack size, full inventory,
  items it refuses).

## Ships and the rest: candidates, nothing built

- A ship cannot go as an item. The candidate is `RPCStartMission`: the
  receiving game starts a mission by ID with a seed, and a mission's
  rewards are given by the receiving game's own reward routine with the
  mission's seed. To be read next: which of the game's own missions give a
  ship or multi-tool reward whose seed follows the mission seed, who may
  send `RPCStartMission` (the list of user identifiers suggests a mission
  host), and what the receiving player sees.
- Limit of the mission route, read the same day: `GcRewardSpecificShip`
  holds its ship (`ShipResource` with the seed, inventory, type) in the
  reward table itself, so a mission started in an unmodified game can only
  hand the ships the game's own tables name. The reference takes any seed,
  so its ship service must use something else.
- Leads for a ship or freighter of a chosen seed, from names only, none
  read yet. The game shares what one player's game spawns with the others:
  `cGcPlayerExperienceDirector::OnRemoteFreightersSpawned(matrix, int,
  64-bit value, battle type, faction, flag)` (call object `4ae5000`, made at
  `1491a37`, sender near `14d60a0`); the message
  `cGcNetworkPlayerExperienceSpawnMessage` (virtual table `4aac430`, built
  near `af9686`); and the `cGcAISpaceshipManager` calls. If a spawned ship
  carries the sender's seed, the receiving player obtains it the ordinary
  way (buying, or a rescue). The owner's screenshot of the reference
  (2026-10-10) asks the receiver to wait in the Anomaly with multiplayer
  open and the service account as a friend; it does not say how a ship
  arrives.
- Statistics (`OnReceiveStatRecordInt`) are the candidate for titles and
  standing, which the reference lists as a separate service.
- The reference's packaged-technology service uses a container that both
  games synchronise (the Egg Sequencer); the matching message types are
  `cGcNetworkMaintenanceBufferEditMessage` and the interaction buffer
  messages. Not read.

## Next

1. Owner, with the friend in the same group (slot 3 on the owner's side):
   close the game, "Update" in the application, start the game, join, open
   "Send to a friend", "Find players", pick the friend, send one stack of a
   cheap item, and report what both players saw.
2. Then read the mission route for ships as described above.
