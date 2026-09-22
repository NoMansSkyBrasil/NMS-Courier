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
- [~] Migrate all visible interface strings into `pt-BR`, `en-US`, and `es-ES` catalogs. The overview and foundation cards are translated; sidebar and menu strings remain.
- [x] Build the Windows x64 unpacked application and ZIP.
- [x] Extract the ZIP to a temporary directory and verify its executable starts without Vite.

## B0 — Private runtime and toolchain proof

- [x] Choose a CPython candidate that matches currently documented NMSpy support: CPython 3.11.9 Windows x64 embeddable.
- [x] Record the source URL and SHA-256 checksum in the runtime manifest template.
- [x] Add reproducible staging that downloads, verifies, extracts, and starts the private interpreter without using a global Python installation.
- [x] Create the closed dependency specification, verified build-tool lock, wheel inventory, hashes, and extracted license notices for the private interpreter.
- [x] Stage the exact resolved wheels, package metadata, and native extensions beside the private interpreter using only the private wheel cache.
- [~] Prove imports and the intended entry point with only the staged interpreter and controlled import paths. Core imports pass with a hash-pinned pyMHF non-interactive import patch; the real entry point is still unproven.
- [~] Inspect pyMHF and NMSpy startup behavior; disable unwanted GUI, console, TCP, and HTTP endpoints only through verified mechanisms. The pyMHF prompt and execution listener have hash-pinned suppressions; validate the controlled configuration after packaging before accepting the boundary.
- [x] Test the staged runtime from a temporary path containing spaces and a non-ASCII character; private imports passed.
- [ ] Validate on a clean offline Windows environment.

## M1 — Real runtime connection

- [ ] Define and implement the versioned private protocol and handshake fixtures.
- [ ] Implement authenticated local transport with a least-privilege Electron API.
- [ ] Detect a supported game installation and correct process without modifying game data.
- [ ] Implement runtime attachment behind capability and game-version checks.
- [ ] Add structured local diagnostics and explicit unsupported-build states.

## M2 — First real delivery

- [ ] Implement one verified, reversible delivery operation through the runtime adapter.
- [ ] Add request validation, idempotency, audit records, and user-visible result states.
- [ ] Test the operation in a supported game environment and document evidence.

## M3 — Local catalog

- [ ] Implement local extraction and SQLite catalog ingestion.
- [ ] Add catalog search, filtering, item detail, and provenance.
- [ ] Package compatible extraction dependencies privately.

## Future milestones

- [ ] Expand verified delivery capabilities incrementally.
- [ ] Add the isolated Save Editor area only after its dedicated design and validation gates are approved.
- [ ] Add CI, release signing, and clean-machine distribution validation.

## Current next action

Build and inspect an Electron package containing the verified runtime resources. Do not run game attachment or expose delivery features while endpoint suppression remains unproven.
