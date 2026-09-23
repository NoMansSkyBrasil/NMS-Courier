# NMS Courier delivery tracker

This file is the operational source of truth for implementation order. Update it in the same change that completes, blocks, replaces, or reorders an item. Do not mark an item complete based only on a successful build when its acceptance evidence requires a real runtime or game test.

## Status legend

- `[x]` Complete and evidenced.
- `[~]` In progress.
- `[ ]` Not started.
- `[!]` Blocked or rejected; record the reason and the safe next action.

## M0 — Desktop foundation

- [x] Create the pnpm workspace and pin the package manager.
- [x] Create isolated Electron main, preload, and renderer entry points.
- [x] Restrict renderer access with context isolation, sandboxing, disabled Node integration, denied navigation, and a narrow status API.
- [x] Add the official shadcn Base UI dashboard and sidebar shell with Lucide icons.
- [x] Add system, light, and dark theme selection.
- [x] Migrate all visible interface strings into `pt-BR`, `en-US`, and `es-ES` catalogs, including navigation, language selection, and theme selection.
- [x] Build the Windows x64 unpacked application and ZIP.
- [x] Extract the ZIP to a temporary directory and verify its executable starts without Vite.

## B0 — Private runtime and toolchain proof

- [x] Choose a CPython candidate that matches currently documented NMSpy support: CPython 3.11.9 Windows x64 embeddable.
- [x] Record the source URL and SHA-256 checksum in the runtime manifest template.
- [x] Add reproducible staging that downloads, verifies, extracts, and starts the private interpreter without using a global Python installation.
- [x] Create the closed dependency specification, verified build-tool lock, wheel inventory, hashes, and extracted license notices for the private interpreter.
- [x] Stage the exact resolved wheels, package metadata, and native extensions beside the private interpreter using only the private wheel cache.
- [x] Bundle the verified private interpreter, manifest, configuration, and license notices under Electron resources; verify their presence in the Windows ZIP.
- [x] Automate packaged-runtime manifest, file-integrity, and isolated-import verification for every Windows package build. The verifier passed against the fresh Windows x64 package created on 2026-09-22.
- [x] Prove imports and the intended entry point with only the staged interpreter and controlled import paths. The private CPython imports NMSpy with the version-checked compatibility shim, and the live diagnostic callback passed on Steam build 179666. Clean offline validation and endpoint review remain separate release gates.
- [~] Inspect pyMHF and NMSpy startup behavior; disable unwanted GUI, console, TCP, and HTTP endpoints only through verified mechanisms. The pyMHF prompt and execution listener have hash-pinned suppressions. The attached-process safety patch is verified: two one-shot attempts preserved the game process, authenticated, and loaded 3 mods and 5 hooks. Neither emitted a main-loop callback; investigate the callback phases on a fresh process.
- [x] Test the staged runtime from a temporary path containing spaces and a non-ASCII character; private imports passed.
- [!] Validate on a clean offline Windows environment. This requires a separate machine or a verified clean Windows image; no developer-machine result can satisfy the gate.

## M1 — Real runtime connection

- [~] Prototype a native x64 startup bridge without Python in the delivery path. The current candidate is our own `XINPUT9_1_0.dll` proxy: the inspected NMS executable imports XInput state functions, and the proxy forwards all four original exports by name and ordinal to the System32 DLL. The read-only build verifier confirms the exact Steam 179666 SHA-256 and one match each for `cGcApplication.Update` at RVA `0x2D7500` and inventory `Add` at `0x4CE130`. The earlier Ultimate ASI Loader/WinHTTP route is inactive after its default configuration crashed an isolated fixture. Verify actual game startup, safe detour, repeated callback heartbeat, and load/save transitions before any mutation.
- [~] Build a narrowly scoped x64 Courier startup probe with exact-build verification and read-only logging. The C sources compiled with hash-verified llvm-mingw 20260922. A fake NMS fixture confirmed system-XInput forwarding, wrong-build rejection, and ten consecutive normal exits, although one prior fixture module-enumeration check failed without a process crash. The updated DLL was installed while the game was closed; the first Steam launch produced `exact_build_startup_observed` from PID 10972 and the process was responsive. Loaded-save stability, clean shutdown, controller behavior, and native callbacks remain unverified. End users need no compiler.
- [ ] Add installer conflict checks and reversible, hash-recorded deployment of only our approved bridge files under the selected game's `Binaries` directory. Do not overwrite an existing proxy or modify `NMS.exe`.
- [x] Install an exact-build-gated `cGcApplication.Update` detour and observe live callbacks without inventory mutation. The MinHook v1.3.4 probe recorded 7,319 callbacks from one thread on live Steam PID 28888, then disabled its hook with status 0 while the loaded game stayed responsive. A separate timeline for menu and load transitions remains to be gathered.
- [ ] Connect the native DLL to the desktop through a private authenticated Named Pipe, with bounded off-thread I/O and one-command game-thread dispatch. Keep the existing Python bridge as diagnostic evidence while proving the replacement.
- [x] Define and implement the versioned private protocol and handshake fixtures. TypeScript and Python validation, bounded framing, handshake authentication, and Windows Named Pipe loopback tests pass.
- [x] Implement authenticated local transport with a least-privilege Electron API. The diagnostics-only host enforces a current-user pipe ACL, rejects remote clients, checks peer PID, and authenticates a per-session HMAC challenge; Electron exposes only narrow start/status methods.
- [x] Detect the selected game installation and exact process without modifying game data. The Python backend also discovers `NMS.exe`, derives the install root, and enforces a unique exact hash from the diagnostics-only allowlist. The host rechecks executable path, SHA-256, PID, and process start time.
- [x] Implement diagnostics attachment behind exact build/hash checks. Direct Python runs detected Steam build 179666, authenticated over the restricted pipe, and loaded 3 mods and 5 hooks. A callback was observed once on PID 27340; two later fresh-process runs authenticated but timed out before a callback. This allowlist is diagnostics-only and does not enable delivery.
- [x] Add structured local diagnostics and explicit unsupported-build states. UI status and local event logs distinguish unsupported builds and bridge startup, authentication, callback, failure, and game-exit states.

## M2 — First real delivery

- [~] Validate an isolated EXML reward probe on the exact installed build as an alternate game-native grant path. The current `PLANTER_CARBON` reward table entry grants `FUEL1` Carbon at 40–80; `prototypes/data-mod` contains a minimized 500-unit patch. XML parsing and read-only source inspection passed. The patch was copied with a verified hash while the game was closed, then removed because the disposable save has no known access to a carbon planter. Select a common early-game trigger before a live data-mod test. Desktop-triggered delivery and network-player targeting require separate evidence.
- [~] Implement and validate a native Carbon ×500 test path for the exact 179666 executable. The installed NMSpy 147803.1 package has no inventory-store binding. `GiveGenericReward` accepts a reward ID rather than an arbitrary item ID and quantity. A corrected exact-byte/masked-byte scan of the 179666 `.text` section found one match each for the pinned upstream `cGcInventoryStore.Add` (RVA `0x4CE130`), store constructor (`0x4CA2A0`), `GetElement` (`0x4C35B0`), `Remove` (`0x4CEAB0`), player-state constructor (`0x56E960`), game-state constructor (`0x2CE9E0`), and application-data constructor (`0x2C6E00`). Static disassembly and a read-only live snapshot support the item/store layouts and showed 115 Carbon with maximum 9999. The exact-hash-gated direct Python path submits one local `FUEL1 ×500` command only from the main-loop callback and requires an exact live quantity delta before reporting success. The first attempt exited before pipe authentication; the attached-process safety patch now preserves the game. Two later attempts authenticated and loaded 3 mods and 5 hooks but received no callback within 60 seconds: PID 5996 while the player was warping, then PID 22340 after the player was stationary. Both were rejected as `CALLBACK_TIMEOUT` with `dispatched:false`; both game processes remained open and no native insertion or inventory mutation occurred. The source now registers both pre-update and post-update main-loop callbacks, reports which phase fired, and still drains a command only once. An isolated private-runtime stage passed 36 Python tests and the Windows Named Pipe loopback. The NMS.py reference binding is from commit `b41bf9e6fdff1c833b77d805bb0c8da555c4ced4` (build 179105), so 179666 delivery remains experimental until a live operation and normal-save persistence are observed.
- [~] Verify one live native Carbon ×500 operation and its normal-save persistence. Steam PID 10892 used the exact-build native `Add` call once, then its personal inventory changed from 15 to 515 Carbon with `delivery_state=3`; the process remained responsive. A second trigger was rejected by the one-shot guard. User-visible inventory confirmation and ordinary-save persistence are still pending. If a later response is lost after dispatch, inspect the live inventory before considering another attempt.
- [x] Prepare and execute the native one-shot Carbon test on the exact 179666 build. The C snapshot validates personal inventory bounds and an existing `FUEL1` stack; the path checks the in-memory `Add` prologue, copies a Carbon template, dispatches once on the proven game callback, and confirms an exact +500 delta. Synthetic and mocked-add tests passed. A fixture event without an inventory was rejected; a wrong-build executable was rejected before hook creation. The local event trigger is test-only and does not replace the product's authenticated Named Pipe transport.
- [~] Finish general request idempotency, audit records, and user-visible result states after the one-shot runtime path is proven.
- [ ] Test the operation in a supported game environment and document evidence.

## M3 — Local catalog

- [~] Define and test the Game ID catalog model with explicit source provenance and localization references; database ingestion and extraction remain unimplemented.
- [ ] Accept catalog input only from a user-selected local No Man's Sky installation; prohibit website, API, and downloaded-catalog ingestion.
- [ ] Implement local extraction and SQLite catalog ingestion, including a build-scoped Game ID mapping such as `substance:FUEL1` to its localized display data and provenance.
- [ ] Generate and validate the coverage manifest for substances, products, technologies, recipes, rewards, parts, and every supported definition domain in the selected game build.
- [ ] Audit, pin, and privately package the PAK extractor and MBIN converter; catalog refresh must never install or download a tool on the user's computer.
- [ ] Add catalog search, filtering, item detail, and provenance.
- [ ] Package compatible extraction dependencies privately.

## Future milestones

- [ ] Expand verified delivery capabilities incrementally.
- [ ] Add the isolated Save Editor area only after its dedicated design and validation gates are approved.
- [ ] Add CI, release signing, and clean-machine distribution validation.

## Current next action

The native XInput bridge now has a live callback and one confirmed in-memory test insertion on the exact Steam 179666 build. PID 28888 completed 7,319 read-only update callbacks without destabilizing the game. PID 10892 accepted one Carbon ×500 trigger and logged 15 → 515 in the personal inventory; the second trigger was rejected. Confirm the changed inventory in the game's UI, make an ordinary in-game save, reload, and verify the quantity persists. Do not send a second Carbon operation to this save while outcome or persistence is uncertain. The installed `DeliveryTest` DLL SHA-256 is `7a1fc34d82a91c4fca5028a18d318e776581c518c92b8935e062a5916210f3bc`; it is a narrow development probe, not the authenticated product bridge. Next implement the native Named Pipe protocol, installer and rollback workflow, and desktop status/trigger integration. Keep multiplayer targeting separate from local delivery; the EXML planter patch remains inactive.
