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
- [x] Verify one live native Carbon ×500 operation and its normal-save persistence. Steam PID 10892 used the exact-build native `Add` call once, then its personal inventory changed from 15 to 515 Carbon with `delivery_state=3`; the process remained responsive. A second trigger was rejected by the one-shot guard. The user confirmed the additional stack in the game and 515 total after an ordinary save reload. The user manually merged the two stacks. This path did not produce a native collection notification.
- [x] Verify one-shot native local currency reward calls on the exact build. The user observed +1,000,000,000 each of Units, Nanites, and Quicksilver through guarded `GiveGenericReward` calls, confirmed native right-side notifications, and confirmed all three balances after normal save reload. This is a manual test bridge, not the product's authenticated request channel or a repeatability/multiplayer claim.
- [x] Prepare and execute the native one-shot Carbon test on the exact 179666 build. The C snapshot validates personal inventory bounds and an existing `FUEL1` stack; the path checks the in-memory `Add` prologue, copies a Carbon template, dispatches once on the proven game callback, and confirms an exact +500 delta. Synthetic and mocked-add tests passed. A fixture event without an inventory was rejected; a wrong-build executable was rejected before hook creation. The local event trigger is test-only and does not replace the product's authenticated Named Pipe transport.
- [~] Finish general request idempotency, audit records, and user-visible result states after the one-shot runtime path is proven.
- [x] Test the one-shot Carbon and currency operations in the supported disposable game environment and document the observed results and limits. Product-driven delivery and failure-matrix coverage remain open.

## M3 — Local catalog

- [~] Define and test the Game ID catalog model with explicit source provenance and localization references; database ingestion and extraction remain unimplemented.
- [ ] Accept catalog input only from a user-selected local No Man's Sky installation; prohibit website, API, and downloaded-catalog ingestion.
- [ ] Implement local extraction and SQLite catalog ingestion, including a build-scoped Game ID mapping such as `substance:FUEL1` to its localized display data and provenance.
- [ ] Generate and validate the coverage manifest for substances, products, technologies, recipes, rewards, parts, and every supported definition domain in the selected game build.
- [ ] Audit, pin, and privately package the PAK extractor and MBIN converter; catalog refresh must never install or download a tool on the user's computer.
- [ ] Add catalog search, filtering, item detail, and provenance.
- [ ] Package compatible extraction dependencies privately.

## Future milestones

- [~] Diagnose the rejected freighter-offer DLL startup hang, then test a revised one-shot native free offer from ordinary gameplay on the disposable save. The compiled test path can dispatch vanilla `FREIGHT_REWARD` but has not done so in-game; it cannot yet set S class, unlock 120/60 slots, or verify a zero-price offer. Do not reinstall the rejected build. See [runtime research](docs/RESEARCH_AND_DECISIONS.md#direct-free-freighter-offer-build-179666).
- [~] Finish validating the request-scoped freighter class profile for build 180836. Live runs on 2026-10-06 reached an owned S freighter with 120 cargo and 120 all-special technology slots; restart persistence, repeatability, base-transfer branch and a repeatable command path remain open. Procedure, hashes and limits: [inventory class research](docs/INVENTORY_CLASS_RESEARCH.md). Do not install or signal unattended; never repeat the one-shot dispatch in a process.
- [~] The independently authored [freighter-specific reward experiment](runtime/mods/freighter_specific_reward/README.md) opened a free offer in ordinary gameplay, and the user acquired the freighter without a Units debit. The generated freighter was C class with 35 main slots and a 21-position technology grid, of which 13 slots were valid, despite S class and layout 120 in the reward data. Identify a verified generation/acquisition path for S class and 120/60 unlocked slots; an offer screen is no longer required. Compare gift handlers, native acquisition/finalization and separate owned-entity upgrades in [delivery alternatives](docs/DELIVERY_ALTERNATIVES.md). Do not repeat the one-shot event in the same process.
- [x] Validate the read-only runtime headers of the acquired freighter on exact build 179666: C class, 35 valid main slots, 13 valid technology slots in a 7 × 3 grid, and zero valid extra cargo slots. The offer's displayed 21 technology positions are not all unlocked. No write was attempted.
- [x] Test the scoped generation callback on the disposable save. The synthetic table fixture and wrong-build rejection passed, but the live one-shot offer remained C/35 with a 21-position technology grid. The table was restored, the game stayed responsive, and the user did not accept the second offer. The reward callback is too late or ignores those generation fields. Continue with read-only identification of the temporary offer inventory before any targeted mutation.
- [x] Validate one explicit-inventory reward variant on the disposable save. The EXML provides 10 × 12 main dimensions, 60 technology slots, and a FreighterLarge override; its sparse round trip and combined compile pass. A single live offer showed 120 cargo grid positions, but remained C class and showed only 30 technology grid positions. The user closed the offer without accepting it. This validates the cargo dimensions in the offer UI, not 120 unlocked cargo slots or the requested S/60/supercharged configuration.
- [ ] Identify the particular offer's native generation and class/technology initialization path. A separate frontend inventory candidate now reflects the explicit 10 × 12/C/120 offer, but it has only been read. Keep diagnostics separate from production delivery and do not treat an edited UI field as a delivered S-class freighter.
- [~] Investigate 120 freighter technology slots as an opt-in advanced target. A separate reward variant serializes `NumSlotsFromTech=120`; an offline full-copy table control serializes S technology cap 120 and FreighterLarge technology bounds 10 × 12. Neither is installed or live-verified. The vanilla C/S caps are 30/60, and the sparse inventory-table file failed ordered-array targeting; prove S/60 per offer before testing 120.
- [x] Retire the sparse [global generation experiment](runtime/mods/freighter_generation/README.md). It was removed from the game before testing after the user required per-offer changes; later round-trip evidence showed its named array entries could target the wrong positions. Its source patch was removed. Any future opt-in global generation feature needs a correctly keyed full-table build and separate approval/testing.

- [ ] Expand verified delivery capabilities incrementally.
- [ ] Add the isolated Save Editor area only after its dedicated design and validation gates are approved.
- [ ] Add CI, release signing, and clean-machine distribution validation.

## Deferred by the user (2026-10-07)

- [ ] Corvette delivery (ships assembled from parts). Proven live on 2026-10-07 with a static
  research mod (see the notes linked below); the per-request bridge steps are still to be built.
  Original request: The reference service replaces the
  player's current corvette and requires the player to own a minimal corvette
  (fewer than ten parts, set as primary ship, then save and restart) before
  delivery. Goal for Courier: deliver directly without that precondition if a
  verified native route allows it. The user has a local example export
  (`LOKI X6 Tractor Beam Edition.nmsship` on their desktop); it is a personal
  file and must not be committed. Never implement this by editing saves.
  First look at the export format: [corvette delivery notes](docs/CORVETTE_DELIVERY_NOTES.md).

- [ ] Read the installed game's files directly (archives, binary metadata,
  geometry and textures) instead of depending on a pre-converted external
  research corpus. Requested by the user on 2026-10-07 as a later item. This
  is also the prerequisite for scene conversion inside the application
  (seed previews without research tooling); both are deferred together.

- [ ] In-place upgrades requested by the user on 2026-10-07: unlock 120 + 120 slots with every
  technology slot special on an owned ship and on the exosuit without replacing them, and convert
  an owned multitool to class S with 120 special technology slots. Plan and open questions:
  [owned inventory upgrade notes](docs/OWNED_INVENTORY_UPGRADE_NOTES.md).
- [ ] Deliver ordinary ships from plain `.nmsship` exports (format described in the same notes).

## Organization requested by the user (2026-10-07)

- [x] Split the research signal script into one script per domain over a shared module
  ([signal scripts](runtime/native/asi/signal/README.md)). Parse-checked only; first live use pending.
- [x] Split the profile source into one file per domain under
  `runtime/native/asi/profile_180836/` (done 2026-10-07; DLL `2bd83437...ca78`).
- [ ] Repeat the live checks of the freighter, corvette and owned-inventory requests on the split
  build, and extend the fixture to the corvette, reward and owned branches.
- [x] Reduce the language selector to the game's 14 interface languages.
- [x] Application shell in all 14 languages, one resource per language, typed so a missing key
  does not compile (2026-10-08). Translations were written by the assistant and have not been
  reviewed by native speakers.
- [x] Every renderer screen in all 14 languages (2026-10-08): catalogue page, game and bridge page
  (rewritten as `bridge-page.tsx`), model workshop; `preview-copy.ts`, `appearance-copy.ts` and
  `delivery-page.tsx` removed; `locales.test.ts` checks keys, empty strings and placeholders.
- [x] Read the core catalogue from the user's installation without external tools (2026-10-08): archive, table and language readers in `apps/desktop/src/main/game-data/`.
- [ ] Catalogue import: other tables (recipes, rewards, parts, titles), relations, icons from the stored locators, progress and cancel, a worker, several layouts per table for older builds.
- [x] Model workshop reads palettes, part lists, scenes and geometry from the game's archives (2026-10-08, application 1.10.0, [model workshop](docs/MODEL_WORKSHOP.md)).
- [ ] Model workshop: add the procedural multi-tool scenes it lacks (`retromultitool`, `switchmultitool`, `swarmmultitool`, `rodmultitool`, `staffmultitoolbone`, `staffmultitoolruin`, `gravitygun`, `staffnpcmultitool`), each named as the game names it in all 14 languages.
- [ ] Seeds: port the planet seed derivation and the Threefry routine at `132aee0` (planet counts, star type) so a system can be described from its address; bridge reading of planets for the "Current system" tab.
- [ ] Model workshop: shade metal from the masks map (unpainted metal is grey where the game shows beige or black, seen on multi-tool seed `0x81E18111081140E1`); tint decals by their own masks; compare a second multi-tool and the other multi-tool types with the game.
- [ ] Seeds: origin of a space station's multi-tool seed (a planet terminal's tool has the planet's seed).
- [ ] Model workshop: read the game's lighting pass to light metal as the game does (the black front flap of multi-tool `0x81E18111081140E1`; the surface shader is read, it only passes the masks on).
- [ ] Model workshop: compare a starship with legacy colours with the game (the choice exists since 1.18.0, checked on multi-tools only).
- [ ] Model workshop: confirm the pristine multi-tool `0xA1FA0E890FC18255` in the current game (get it from the application); the workshop agrees with the owner's picture since 1.19.2. Find a model with two second-texture lists to decide whether they are merged or drawn one by one.
- [ ] Obtain: the game's cursor stuck after a multi-tool offer and a starship offer were sent in the same minute (2026-10-09). Reproduce with one offer; if two offers are the cause, the application must refuse a second one while the first is open.
- [ ] Model workshop: decal colour of `0xA1FA0E890FC18255` without legacy colours reported slightly different from the game's offer (pale green); compare like with like.
- [ ] Live test from the application: a multi-tool with "Use legacy colours" (bridge 1.9.0): the offer, the file `native-weapon-legacy-...`, and the tool's colours after accepting.
- [ ] Legacy colours for a starship got through the application: find where the running game keeps `ShipUsesLegacyColours`.
- [ ] Model workshop: multi-tool types as the game names them, from the owner's list: Pistol, Rifle, Experimental, Alien (standard scene), Starbound v0.27 (`retromultitool`), Infinite Neon Mark XXII (`switchmultitool`), Direwasp Disintegrator, Exotic (royal), Sentinel, Atlantid, Voltaic Staff, Atlas Sceptre, Pillar of Titan, Basilisk Crown; the last ones still to be matched to `swarmmultitool`, `staffmultitoolbone` and `staffmultitoolruin`.
- [ ] Model workshop: materials the game uses that are not drawn yet, by how many ship and multi-tool materials use them (table in `docs/MODEL_WORKSHOP.md`): masks map, colourise mask, multi-texture sets. Check the part and texture choice of many seeds against the game's own routines run in the emulator, as is done for star systems.
- [ ] Model workshop, ideas seen in NMS Shipwright's designer: player-made part names beside the identifiers (its `names/*.json`, MIT), how rare a chosen set of parts is ("1 in N seeds") with a time estimate, searching real star systems near the player for a design (needs the emulated generator), saved designs as files.
- [ ] Seeds: ships of any address in the application. Emulation works as a research tool (`runtime/research/emulate-star-system.py`); the application needs it without Python on Windows, macOS and Linux (a bundled emulator library, or the finished hand port).
- [ ] Seeds: hand port of the step count before a system's ships: Threefry planet count (`132aee0`), planet positions, points of interest loop (`1653030`), each checked against the emulator.
- [ ] Model workshop: compare an obtained starship with the workshop's model for its seed; more seeds compared with an independent source; part names are game identifiers in English (the game has no display text for parts).
- [x] Per-entry selection in the delivery card (2026-10-08) for technologies, crafting recipes, build parts, appearance, titles, expedition rewards and Quicksilver items.
- [ ] Per-entry selection still missing: fishing, refiner recipes, Twitch and platform rewards (needs a per-entry keep list). First live "send selected" from the application is not done.
- [x] First delivery from the application (2026-10-08): `FUEL1` x9999.
- [ ] Walk `docs/CAPABILITY_STATUS.md` from the application on slot 3 and fill the "worked from the app" column, area by area.
- [x] Corvette from a `.nmsship` file in the application (2026-10-08): choose, prepare in the game, restart, start build.
- [ ] Corvette from a file: first live run from the application; then the version without a game restart.
- [x] Getting a new starship or multi-tool by kind, seed and class (2026-10-08, bridge 1.6.0): implemented, not exercised live.
- [ ] New starship and multi-tool: first live run; then royal, sentinel and atlas multi-tools (scenes are in the multi-tool pool table, see the obtain notes), slots at delivery, and plain `.nmsship` ship files mapped onto the request.
- [ ] Install bridge 1.4.0 and the data file `654e4f6e...7b17`, then verify from the application: units of a free amount, and an item with the game's notification.
- [ ] The application should install and update the bridge and the data file itself; today they are copied by hand with the game closed.
- [x] Requests reach the bridge without any script (2026-10-08, application 1.4.0, bridge 1.3.0).
- [ ] Cross-platform: installation detection still uses the Windows registry and a PowerShell process query; the diagnostics folder is taken from `LOCALAPPDATA`. Replace both, and decide how the bridge is loaded on macOS and Linux (Proton).
- [ ] The classification tables the requests are built from are read from the repository; a packaged application must carry them.
- [x] Versions (2026-10-08): application 1.0.0 and bridge 1.0.0, shown on the game and bridge page; rules in `AGENTS.md`, history in `CHANGELOG.md`.
- [ ] Versions: the application should offer to install or update the bridge itself instead of only reporting that it is out of date.
- [x] Items on build 180836 (2026-10-08): request, script and Items page implemented from the game's own store routines; see `docs/ITEM_DELIVERY_NOTES.md`.
- [ ] Items: first live test on slot 3 (`FUEL1=500`, `CASING=10`); then other target stores (ship, freighter), technology items and procedural modules.
- [x] Currencies (2026-10-08): fixed amounts through the game's reward routine and the data file in `runtime/mods/currency_rewards`; bridge 1.1.0.
- [ ] Currencies: first live test from the application; the application should install the data file itself; free amounts need the routine behind the money reward.
- [x] Pages for exosuit, starships, multi-tools, freighters and corvettes wired to the existing bridge requests (2026-10-08). First live use from the application is open.
- [x] Items: stack size of each item shown (2026-10-08, bridge 1.2.0). Not seen live yet.
- [x] Currencies of any amount up to 4,294,967,295 (2026-10-08, bridge 1.2.0). Not exercised live yet.
- [x] Game icons beside item names (2026-10-08, application 1.3.0), drawn by the graphics card from the game's own textures.
- [x] Start page with a hero (2026-10-08, application 1.3.0).
- [ ] Icons for areas the core catalogue cannot name yet (titles, expedition and Twitch rewards); release images when many were browsed.
- [ ] Corvette delivery from a `.nmsship` file (owner request 2026-10-08): read the format, then build the corvette through the game's own routines; today the Corvettes page only starts build mode with class and slot options.
- [ ] Frigates and companions: no research yet.
- [x] Game notifications on by default with a setting to deliver silently (2026-10-08): technologies, product recipes, build parts.
- [ ] Observe live how the game queues notifications when a whole area is sent; other areas have no notification in their routine.
- [ ] `run-profile-fixture.ps1` fails with code 5 on a machine whose diagnostics folder holds a keep list (the profile then enables its hooks at start). Make the fixture use its own folder.
- [x] Detect the game installation automatically (2026-10-08): running game, Steam libraries, GOG registry.
- [ ] Installation detection: verify on a GOG installation; decide about the Microsoft Store and Game Pass versions.
- [ ] Translate the two native dialogs of the main process (installation folder picker, close
  warning during diagnostics); they need the locale in the main process.
- [ ] Have the translations reviewed by native speakers.
- [x] Interface organised by domain with the official sidebar block (2026-10-08): groups Overview,
  Deliver, Unlock, Rewards, Library, System; see [product and UI](docs/PRODUCT_AND_UI.md#3-navigation).
- [~] Area pages connected to the research bridge for the eleven verified areas (2026-10-08,
  development builds only). First live delivery from the application still to be done.
- [ ] From the application: identify the loaded slot, choose single entries, redeem Twitch
  decorations in the slot, and wire the experimental areas (items, currencies, exosuit, starships,
  multi-tools, freighters, corvettes).
- [ ] The research bridge of the application depends on the checkout's scripts and on PowerShell;
  a packaged build has no delivery. Replace it with the production runtime of the architecture.
- [ ] Feed the area figures from the catalogue package instead of registry constants.

## Technology delivery requested by the user (2026-10-07)

- [x] Identify defective and internal technology entries and block them permanently, by structure
  and by ID ([technology delivery notes](docs/TECHNOLOGY_DELIVERY_NOTES.md)).
- [x] Find the game's own learn routine and add a research profile request for one, several or all
  technologies. Built and installed; fixtures pass.
- [~] First live test: preflight, one technology and all 205 done on 2026-10-07 (counters only).
  Open: the owner's confirmation in the catalogue, the several-IDs mode, save and reload.
- [ ] Interface for the three modes (one, several, all) with the technology list in the 14
  languages, using `selectTechnologiesForDelivery`. Needs the local catalogue (M3).
- [x] Owner review of the hidden entries: ten are valid and deliverable, only `OBSOLETE` stays blocked.
- [ ] Ask the project owner about `SPIDERBRAIN` (no display name; blocked).
- [x] Checked whether the 187 upgrade-module products (`U_*`) of a save editor's technology list can
  be learned: the game's own routines refuse them, so they are not delivered
  ([technology delivery notes](docs/TECHNOLOGY_DELIVERY_NOTES.md)).
- [x] Owner decision (2026-10-07): expedition, Twitch and platform rewards are to be delivered;
  completing an expedition season is a later goal ([known lists triage](docs/KNOWN_LISTS_TRIAGE.md)).
- [x] Owner decision (2026-10-07): fish is a separate operation, not part of "learn everything".
- [ ] Find where the game keeps unlocked Twitch rewards (the expected set is empty in memory).
- [~] Routes for season, Twitch and platform rewards: season has a game routine; Twitch and
  platform have no single-entry routine found, so they need an insert through the game's
  container helper ([known lists triage](docs/KNOWN_LISTS_TRIAGE.md)). Next: relocate to 180836
  and read the sets from the running game, read-only. No file editing.
- [x] Owner decision (2026-10-07): Switch-exclusive and all other exclusive rewards are in scope.
- [ ] Fossil catalogue and known substances: find where the game records them; never mark the 35
  pseudo-substances.
- [ ] Never mark a consumable special as known (14 entries today, by the table's own flag).
- [~] Product recipes: classified and built on 2026-10-07 ([product delivery notes](docs/PRODUCT_DELIVERY_NOTES.md));
  items, technology, all build parts and research-tree products delivered live to slot 3, confirmed and saved.
- [x] Character customisation in the slot: 263 specials delivered and confirmed on 2026-10-07.
- [ ] Network-player delivery (later goal): find the multiplayer messages that make a peer run a reward and how the
  synchronised container hands over items ([reference feature catalog](docs/REFERENCE_FEATURE_CATALOG.md)).
- [ ] Twitch claim feature (owner decision 2026-10-08): add the Twitch shipped rewards to the dispatch, claim = give the
  reward + redeem in the slot; user chooses ships and multitools; check the 14 technology-carrying appearance rewards
  already redeemed in slot 3 ([account unlock notes](docs/ACCOUNT_UNLOCK_NOTES.md)).
- [x] Interface text, all 14 languages: Twitch rewards stay claimable only while the bridge is installed
  (rule `keepList` of the Twitch drops area, 2026-10-08).
- [ ] `HDRIVEBOOST4` vanished from slot 3 between 2026-10-08 01:13 and 09:16 and was taught again; find out whether
  the game removes it.
- [ ] `ENT_BOLTCASTER` and `ENT_PHOCORE` are not "unlocked on account" in the owner's editor: diff `accountdata.hg` after
  the owner enables them there, then find the game's route ([account unlock notes](docs/ACCOUNT_UNLOCK_NOTES.md)).
- [ ] Pre-order and entitlement rewards (ships `ENT_SHIP`, `ENT_SHIP_PC`, `R_TGA_SHIP01`, Switch ship and multitool):
  find the entitlement grant routine and test one ship reward on a disposable slot
  ([reward redemption notes](docs/REWARD_REDEMPTION_NOTES.md)).
- [~] Twitch and platform rewards: on the account and in the shop (2026-10-08); platform survives going online, the
  Twitch set is rebuilt from the service's sign-in reply. Keep list proven across an online start on 2026-10-08 ([account unlock notes](docs/ACCOUNT_UNLOCK_NOTES.md)) ([account unlock notes](docs/ACCOUNT_UNLOCK_NOTES.md)).
- [~] Account unlocks (titles, specials, season): run live on 2026-10-08; confirm on screen, in the saved files and after going online
  ([account unlock notes](docs/ACCOUNT_UNLOCK_NOTES.md)). No fixture covers it.
- [ ] Titles: confirm what the picker shows in slot 3; study the statistics route
  ([customisation unlock notes](docs/CUSTOMISATION_UNLOCK_NOTES.md#titles)).
  ([customisation unlock notes](docs/CUSTOMISATION_UNLOCK_NOTES.md)).
- [ ] Find the cause of the 2026-10-07 crash (`nvoglv64`) after the build part delivery, or show it does not repeat.
- [x] Send `research_tree` (106) to slot 3 (2026-10-07; confirmed on screen and saved).
- [ ] Find how corvette parts (`BIG_*` tree entries) are unlocked.
- [ ] Explain the five `FRE_ROOM_NPC*` products that became known without a request (2026-10-07).
- [x] Withdraw the account-level fossil request (owner direction: the save, not the account).
- [ ] (superseded) Product recipes as the next domain: the learn-product routine is identified; classify the
  product table and block defective entries before any "all products" option.
- [ ] Portal glyph delivery as its own operation (the game's discover-rune reward and the known
  runes field), separate from technology. Only identified, not investigated.
- [ ] Other delivery domains after technology (products, recipes, parts), each with its own
  classification and permanent block list first.

## Recipe delivery requested by the user (2026-10-07)

- [x] Check the recipe table for defective entries (none) and find the game's route.
- [x] Add a `recipes` request to the research profile; built, installed, fixtures pass
  ([recipe delivery notes](docs/RECIPE_DELIVERY_NOTES.md)).
- [~] First live test on slot 3 done on 2026-10-07 (counters only): one recipe, then all 1,684.
  Open: the owner's check of the catalogue, save and reload.

## Slots and account scope (2026-10-07)

- [~] Identify which slot is loaded: `runtime/research/identify-loaded-slot.py` does it by content
  match (not run live yet). Still to do: the game's own slot variable, and the slot in every
  profile result.
- [ ] Slot-side redemption of season, Twitch and platform rewards: built, not run
  ([reward redemption notes](docs/REWARD_REDEMPTION_NOTES.md)). Decide with the owner how ships,
  multitools, frigates and eggs are handled before redeeming them.
- [~] Fish and fossil requests built and installed after the owner's decisions; not run live
  ([reward redemption notes](docs/REWARD_REDEMPTION_NOTES.md)).
- [ ] Fixtures for the redeem, fish and fossil requests.
- [ ] Examine `accountdata.hg` (read-only): what it holds and whether the Twitch rewards are there.
- [ ] State per delivery whether it is per-slot or account-wide; the test slot is slot 3.
- [ ] Owner direction: every delivery lands in the slot, not only in account data.
- [ ] Later goal: delivery to a friend with nothing installed. Study what the game's multiplayer
  lets one player hand to another before promising any list or unlock for that case.

## Current next action

As of 2026-10-02, delivery migration targets build 180383. The installed bridge is
observation-only; the older CurrencyTest DLL described below is historical and
must not be treated as the current installation. No new delivery adapter is
enabled. Offline metadata/handlers and independent C# PE checks are documented
in [native acquisition research](docs/NATIVE_ACQUISITION_RESEARCH.md) and
[MetaIdea service research](docs/METAIDEA_SERVICE_RESEARCH.md).

- [x] Inspect the supplied service HTML and five pinned MetaIdea repositories;
  separate UI requests, static builders and documented DLL extension mechanisms.
- [x] Add bounded static client inspection and independent read-only .NET PE
  validation. Do not mistake either for a runtime delivery implementation.
- [ ] Validate the current-build reward manager/context and full dispatcher ABI
  through a read-only native observation before migrating delivery.
- [ ] Prepare one independently configured free S starship reward, followed by an
  S multitool reward; validate class, stats, capacity, claim/swap and zero debit.
- [ ] Investigate request-scoped freighter acquisition/configuration separately;
  preserve existing fleet/base and track partial outcomes. Do not repeat the
  negative gift-only, global-S or frontend-badge mutation hypotheses.
- [ ] Choose hybrid DLL/data-mod or bridge-only execution per supported operation.
  Static mods cannot receive frontend commands; no private bot/backend or
  MetaIdea Service Bot Extender dependency is planned.
- [ ] Map local mission start, companion egg parameters and expedition
  unlock/claim as separate operations after the core reward path is validated.

The exact-build native XInput bridge has a live callback, one confirmed Carbon ×500 insertion, and three confirmed local currency rewards on Steam build 179666. Carbon remained after a normal save reload. The user also confirmed +1,000,000,000 each of Units, Nanites, and Quicksilver, native reward notifications, and all three balances after saving and reloading. The installed `CurrencyTest` DLL SHA-256 is `f20d9b41344fc7460471979f56598108ed8f750327a202b879a0716d651a441d`; it is a narrow development probe, not the authenticated product bridge. A specific-freighter reward opens a free offer from gameplay. The explicit inventory variant reached a 120-position cargo grid, but class and technology remain C/30; locate the particular offer's native initialization before claiming S/120/60 delivery. Keep multiplayer targeting separate from local delivery; the EXML planter patch remains inactive.
