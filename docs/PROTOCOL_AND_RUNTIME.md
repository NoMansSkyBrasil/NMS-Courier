# Protocol and runtime integration

Status: version 1 control-plane schemas and TypeScript fixtures are implemented in `packages/protocol`, including a bounded local item-delivery intent. Transport, authentication, runtime attachment, queue execution, and game mutation remain unimplemented.

## 1. Transport and session

Use a per-instance Windows Named Pipe. Restrict its ACL to the intended user/session, reject remote clients, and verify the peer/process relationship. Use an ephemeral handshake credential where needed; do not treat a discoverable pipe name as authentication.

Frames are length-prefixed UTF-8 JSON. Define byte order, maximum byte length, read deadlines, and malformed-frame behavior in the executable contract before implementation. The parser must handle fragmented and concatenated frames. Initial limit proposal: 256 KiB per control frame; bulk catalog/image data never travels through the game bridge.

Handshake includes protocol version, application/runtime versions, adapter identity, game process identity including start time, build fingerprint, session ID, and capabilities. Protocol mismatch blocks commands. The current TypeScript schemas cover the control-plane handshake and non-mutating command envelope; Python parity fixtures must be added with the runtime bridge.

Each game session has a new identity. Requests and events from a previous session cannot mutate or overwrite state in the new one. Sequence numbers identify missed events; reconnect fetches a snapshot before enabling actions.

## 2. Envelope and actions

| Field | Meaning |
| --- | --- |
| protocol | Wire contract version |
| id | Unique operation/request identity |
| session_id | Intended runtime session |
| action | Explicit allowlisted operation |
| target | Discriminated local or network_player target |
| payload | Action-specific validated data |
| expires_at / deadline policy | Prevent execution of stale queued intent; derive runtime monotonic deadline on receipt |

Proposed action families: status snapshot, capability query, item delivery, operation status, unstarted cancellation, and later eligible-player enumeration/native transfer. These are our application concepts, not claimed NMS.py APIs.

Item delivery contains domain-qualified item ID, positive integer quantity, and notification preference. The current schema admits only `local_player`; inventory selection and `network_player` require separate runtime evidence. Seeds and identifiers that may exceed JavaScript's safe integer range use canonical strings.

Responses distinguish accepted, rejected, running, and terminal outcomes. Events distinguish runtime status, capability changes, operation updates, and later player snapshots. Subscriptions never expose raw pointers or unrestricted debug execution.

## 3. Operation state machine

| State | Meaning | Automatic retry? |
| --- | --- | --- |
| validating | Application checks intent | Not a submitted mutation |
| queued | Runtime accepted; not executed | No duplicate dispatch |
| executing | Native call started | Never |
| awaiting_interaction | Native claim/compare requires input | Never |
| succeeded | Required postcondition verified | Never |
| partial | Measured partial result | Never repeat full request |
| rejected | No mutation began | User may correct/reissue as a new intent |
| cancelled | Removed before execution | User may start a new intent |
| unknown | Mutation may have occurred | Never automatically |

An acknowledgement is not success. A game popup is not sufficient evidence of inventory change. A live mutation is not evidence that the game has already saved it to disk.

The TypeScript protocol package implements the legal transition graph and the dispatch-failure mapping as pure, tested code. It does not execute a queue or imply that a native call exists: a failure before dispatch is `rejected`, while a failure after dispatch is `unknown` until evidence can resolve it.

### Deduplication and journaling

- Repeating the same request ID and payload within the retained session window returns existing state.
- Reusing an ID for different payload rejects the request.
- UI prevents accidental duplicate submissions while pending, but runtime deduplication remains necessary.
- Record application intent before sending. DB journaling improves diagnosis; it does not create an atomic transaction with game memory.
- Bound the in-memory ledger and define retention. Proposed starting point: retain terminal operations for the session up to a documented cap; expired/evicted IDs must not be treated as safe retry authorization.
- A crash between game mutation and journal update creates an uncertain outcome. Do not promise exactly-once execution across crashes.
- Timeout after dispatch means unknown until reliable evidence resolves it. Merely observing an inventory delta later may be ambiguous if gameplay changed the inventory too.

## 4. Queue and execution context

Pipe thread validates and enqueues immutable commands. Only a proven game callback drains the queue and calls engines. Revalidate session, build, player context, target, and capability immediately before execution.

Initial queue policy proposal: maximum 32 pending mutation commands, one command started per callback, and a short measured dispatch budget. Final values require frame-time measurements. A native call is not safely preemptible just because a time budget expired.

No DB, disk extraction, image processing, or blocking logging in the game callback. Use bounded event queues for results. Add reentrancy protection and explicitly handle errors without recursively invoking game functions.

Cancel only before starting. On context change, invalidate old references and reject unstarted stale commands. Never reuse pointers across a session transition because their address happens to be unchanged.

## 5. Capabilities

Each capability describes ID, implementation level, supported builds, allowed targets/inventories, verified limits, current availability, reason, and evidence reference.

Implementation levels: not implemented, unknown, experimental, verified. Current availability is separate: a verified capability can be unavailable while the player is loading.

Central resolution combines protocol, adapter, build, session, player readiness, target, and action constraints. UI displays the result; runtime remains the enforcement point. Developer mode never bypasses build safety.

## 6. Errors

Retain the original codes: GAME_NOT_RUNNING, BRIDGE_NOT_CONNECTED, UNSUPPORTED_GAME_VERSION, PLAYER_NOT_READY, INVALID_ITEM, INVALID_QUANTITY, INVENTORY_FULL, TARGET_NOT_FOUND, TARGET_NOT_SUPPORTED, ACTION_NOT_IMPLEMENTED, RUNTIME_CALL_FAILED, SIGNATURE_NOT_FOUND.

Add as needed: PROTOCOL_MISMATCH, SESSION_CHANGED, QUEUE_FULL, REQUEST_EXPIRED, DUPLICATE_REQUEST_CONFLICT, INVENTORY_UNAVAILABLE, RESULT_UNKNOWN, RUNTIME_BUNDLE_INVALID.

Error DTOs contain a stable English code, safe structured details, operation identity, and a recovery classification. User-facing messages are localized in the renderer. Do not expose native addresses, tokens, or arbitrary exception dumps through normal UI errors.

## 7. Inventory semantics

The game should select appropriate slots, stack within native limits, update UI, and mark state for normal persistence. Do not reconstruct these rules by raw structure writes when an appropriate native function exists.

RewardID is not item ID. GiveGenericReward is a researched binding, not a proven item-plus-quantity interface. Discover the correct native path before implementation.

Space behavior must be measured. If insertion can be partial, report requested/applied quantities. A precheck is not an atomic guarantee because game state can change. Do not remove arbitrary matching items as rollback: some may predate the operation.

Stack size is not total deliverable quantity across multiple slots. Catalog values may vary with inventory/game mode. Display contextual limits only when known, and validate at runtime.

Native notification is a separate optional capability. Delivery can succeed with notification unavailable, provided the item result is proven and the UI is truthful.

## 8. Courier semantics

1. Enumerate eligible native targets and their session identities.
2. Deduplicate group/nearby views without changing identity.
3. Revalidate target and transfer eligibility.
4. Create/obtain the local item through the verified Personal path.
5. Invoke the game's native player-to-player transfer routine.
6. Report the strongest confirmation actually available.
7. During the initial proof, observe receipt on the vanilla receiver.

This is a multi-step operation, not an atomic transaction. If local creation succeeds and transfer fails, report that the item remains locally when known. Retry must not recreate the item. Remote inventory full, target departure, distance changes, non-transferable items, and session loss are required cases.

If the game exposes only submission acknowledgement, use “Transfer sent,” not “Received by player.” Do not modify receiver memory/save or implement our own multiplayer network. Ship/multitool/Corvette interaction is not remotely supported merely because items can transfer.

Bridge-to-Bridge is a later separate proposal with explicit receiver consent, outside the initial roadmap.

## 9. Research workflow

1. Record game build/distribution and exact dependency revisions.
2. Inspect current NMS.py/pyMHF source and relevant examples.
3. Separate known bindings from hypotheses.
4. Validate signature origin and uniqueness on the matching executable.
5. Establish ABI, object lifetime, receiver object, and safe callback/thread.
6. Observe the equivalent manual game action.
7. Record parameters, callers, return value, and side effects.
8. Follow reward dispatch downstream when necessary.
9. Create a small isolated proof using a test profile and recoverable backup.
10. Check quantity, inventory, stack, partial/rejected cases, UI, and normal saving.
11. Check menu/loading/context changes and failure states.
12. Integrate behind our adapter only after evidence.

Each evidence record includes name, source/revision, game build, signature, purpose, parameters, return, thread requirements, observed callers/effects, reproduction steps, validation status, and limitations. Unknown values remain UNKNOWN.

Matching a signature is not enough to certify a function. Native invocation is blocked until the relevant context and ABI are validated.
