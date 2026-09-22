# Implementation sequence and validation gates

Status: implementation plan. M0 foundation and B0 private-runtime packaging proof have code and validation evidence; M1 runtime connection and M2 delivery execution remain unimplemented.

## 1. Working method

For each work package: read its owning specifications, inspect current repository state, implement the smallest complete behavior, run appropriate checks, inspect the actual result, record evidence/limitations, and update documentation.

Do not create thousands of speculative runtime lines or empty engines. Keep the workspace building at each implemented checkpoint. Never mark a game feature complete based on a mock, screenshot, connected pipe, or successful compilation.

All new documentation, comments, docstrings, identifiers, test descriptions, developer logs, and release notes are English. Localized product content is the explicit exception.

## 2. P0/P1: preparation

Current P0 deliverables: the English plan, stack decisions, file responsibilities, private-runtime strategy, UI contract, protocol semantics, Save Editor scope, and validation gates.

Before runtime work, record the actual game installation/distribution/build available for testing. Select a supported Windows baseline and test hardware. Audit dependency licenses and exact artifact provenance. Identify a test profile and recovery procedure without making save edits part of delivery.

Unknowns that must remain explicit: native item/quantity function, safe callback/thread, build-specific ABI, actual transfer acknowledgement, private interpreter injection, dependency listener elimination, and complete native dependency closure.

## 3. M0: desktop foundation

### M0.1 — Workspace and versions

1. Create root private pnpm workspace and exact package-manager pin.
2. Select mutually compatible maintained Node build version, Electron, React, TypeScript, electron-vite, and tooling versions.
3. Record choices in manifests/lockfile and an architecture decision entry.
4. Add English contribution instructions, ignore rules, formatting, and lint/typecheck configuration.

Acceptance: reproducible dependency resolution and useful root scripts; no Python prerequisite to open the foundation UI.

### M0.2 — Electron boundary

1. Add separate main, preload, and renderer entry points.
2. Configure sandbox/isolation, local resource protocol, navigation, permissions, and IPC sender validation.
3. Expose only status/settings methods initially.
4. Add application paths and minimal local logging.
5. Verify the window opens without the game and without network access.

Acceptance: renderer has no unrestricted Node/IPC access; startup failures produce useful local diagnostics.

### M0.3 — Standard UI

1. Resolve and record official shadcn preset/base and Lucide configuration.
2. Consult current skill/CLI docs and MCP examples for the selected components.
3. Add only required components.
4. Implement app shell, sidebar, routes, dark theme, Dashboard, Items demo, and essential Settings.
5. Add English source strings and pt-BR locale resources as selected.
6. Clearly label demo data and prevent simulated delivery from appearing real.

Acceptance: working keyboard/focus behavior, readable empty/error/loading states, rendered screenshots at target window sizes/scaling.

### M0.4 — First package

1. Build the desktop shell.
2. Produce a Windows x64 ZIP from the selected packager.
3. Launch the packaged artifact from a fresh extracted directory.
4. Confirm no Vite server or development-only resources are required.

Acceptance: an actual desktop artifact works. This does not yet prove game integration or the final self-contained runtime.

## 4. B0: private runtime and toolchain proof

1. Select exact CPython candidate and locked dependencies.
2. Assemble interpreter, modules, metadata, native extensions, DLLs, notices, and manifest in staging.
3. Validate all imports and entry points without a global Python environment.
4. Verify pywin32/native DLL placement without global post-install registration.
5. Relocate bundle and test paths with spaces/non-ASCII characters.
6. Inspect upstream terminal/API/logging services and implement only verified suppression/replacement mechanisms when coding begins.
7. Inventory listeners and reject unintended endpoints.
8. Prepare a catalog tool proof with all required dependencies private, when extraction tooling is selected.
9. Test on clean offline Windows before M1 acceptance.

Acceptance: no end-user package managers, downloads, global interpreter, global .NET, compiler, PATH change, or manual recovery commands. Document exact limitations if a dependency prevents this.

If a candidate fails, investigate the alternatives in DISTRIBUTION.md. Do not paper over the failure with developer-machine success.

## 5. M1: real runtime connection

1. Detect selected installation and exact game process identity.
2. Identify supported build before injecting/loading game integration.
3. Start the packaged private launcher through an approved path.
4. Establish restricted Named Pipe and versioned handshake.
5. Expose real build, runtime, player readiness, and capability state.
6. Implement session invalidation, bounded reconnect backoff, local logs, and graceful close behavior.
7. Test menu/loading/game exit, wrong protocol, unknown build, duplicate app launch, and existing runtime state.

Acceptance: the correct live game instance is connected using the private bundle. A simulator only validates transport tests, not this milestone.

## 6. M2: first real delivery

1. Follow the research workflow to identify a suitable native function and execution context.
2. Record actual evidence rather than inventing lower-level API names.
3. Implement the smallest adapter/engine path, queue, and operation tracking.
4. Deliver Carbon ×500 to the initial supported local inventory.
5. Verify quantity, stack handling, native UI refresh, and postcondition.
6. Test inventory full, partial behavior, invalid amount, duplicate request, state change, and lost response.
7. Verify normal game saving and subsequent loading preserve the result; loading is validation, not the delivery mechanism.
8. Investigate optional native notification separately.

Acceptance: observed real mutation without save editing or restart/reload to apply. Success/partial/unknown semantics match evidence. Supported build recorded.

## 7. M3: local catalog

1. Integrate audited bundled PAK/MBIN/image tools.
2. Generate normalized domain-separated entries and localized text.
3. Add SQLite generation publication and migration handling.
4. Implement local thumbnails, search, categories, favorites, and recent items.
5. Gate deliverability by runtime support rather than catalog presence.
6. Measure full catalog behavior and recover interrupted extraction.

Acceptance: usable offline with the game closed, assets from local installation, no CDN/API dependency, prior working generation preserved on failure.

## 8. M4–M8: progressive capabilities

| Milestone | Implementation order | Acceptance |
| --- | --- | --- |
| M4 Courier | Enumerate targets → native transfer proof → composed operation → UI | Correct amount received by vanilla client; honest acknowledgement level; failure after local creation handled |
| M5 Advanced | Currencies, packaged tech, rewards/unlocks, ship/Corvette parts independently | Each domain's type, function, limits, and side effects verified |
| M6 Ships | One native claim/compare path before exchange/replace/reskin/spawn | User acceptance/cancellation observed; capacity and ownership checked |
| M7 Other entities | Multitools, freighters, frigates, pets as separate tracks | Independent model/context/failure evidence for each |
| M8 Corvettes | Parts → definition library → import/export → full runtime action → builder → optional preview | Versioned representation and actual runtime outcome; no unproven seed-accurate preview claims |

Spawns, encounters, missions, base application, Bridge-to-Bridge, and auto-update remain later proposals. Save Editor has its own future plan.

### Candidate capability backlog

The following candidate areas were recorded from a third-party feature screen on 2026-09-22. They are product input only. A label here is neither a runtime capability claim nor permission to alter a save; each entry needs its own build, context, limits, side-effect, and outcome evidence.

| Candidate area | Intended NMS Courier direction | Earliest evaluation |
| --- | --- | --- |
| Item delivery | Typed local-player delivery | M2 |
| Location transfer | Explicit, confirmed native location operation | After M2; independent transition and safety research |
| Ship delivery and fabricator parts | Claim/compare flow, then independently verified parts | M6 |
| Multitool and staff delivery | Independent native claim/compare track | M7 |
| Freighter and frigate delivery | Separate ownership, fleet-capacity, and recruitment/transfer tracks | M7 |
| Pet eggs and creature definitions | Eggs first; companion/entity behavior only after separate proof | M7 |
| Corvette parts, definitions, and sharing | Parts, library definitions, import/export, then a full action | M8 |
| Itemized base/Corvette building parts | Catalog and definition library first; placement is a separate action | M8 and later |
| Season, expedition, Twitch, and platform rewards | Read-only catalog first; each account/unlock action separately verified | M5 |
| Packaged technology and currencies | Separate type, bounds, and side-effect tracks | M5 |
| Base building | Future Save Editor scope or separately evidenced live operation; never a delivery fallback | After SE3 or independent runtime proof |
| Point-of-interest scan and planet finder | Read-only discovery research with source, freshness, and result limits | After M3 |
| Mission starter, spawner, ByteBeat track, and service-bot tools | Deferred research proposals with potentially broad progression or side effects | After core delivery milestones |
| Quick actions | A curated list of already verified operations; never an arbitrary command console | After at least two verified capabilities |
| Sharing Center | Offline validated library import/export; no account, cloud, or hidden code execution | M8 library work |

“Universal Unlocker” is not an acceptable capability definition. It is decomposed into explicit reward, recipe, technology, title, mission, and account-state proposals, each with independent evidence and confirmation rules.

## 9. Proposed developer commands

These are script names to implement with their owning work package, not commands available today. They run on contributor/build machines, never as end-user setup instructions.

| Command contract | Intended purpose | Introduce |
| --- | --- | --- |
| pnpm install --frozen-lockfile | Restore pinned JS dependencies | M0 |
| pnpm dev | Run electron-vite desktop development | M0 |
| pnpm lint | Lint actual JS/TS source | M0 |
| pnpm typecheck | Check workspace TypeScript projects | M0 |
| pnpm test | Deterministic non-game JS/contract tests | M0 |
| pnpm build | Build actual desktop/packages | M0 |
| pnpm test:desktop | Electron interaction tests | M0 |
| uv sync --frozen | Restore runtime development environment, from runtime directory | B0 |
| uv run --frozen pytest | Python tests, from runtime directory | B0 |
| uv run --frozen ruff check . | Python lint, from runtime directory | B0 |
| uv run --frozen mypy src | Python type checking, from runtime directory | B0 |
| pnpm runtime:bundle | Assemble approved private runtime | B0 |
| pnpm runtime:verify | Verify bundle outside development environment | B0 |
| pnpm package:win | Produce full Windows artifacts | M0 shell; full payload at B0/M1 |
| pnpm verify:package | Check artifact contents/launch/manifest | M0+, progressively expanded |

Do not ship scripts that always pass or silently skip missing required tests. Stage commands according to implemented functionality and state clearly when a check requires Windows or NMS.

## 10. Test layers

### Pure/contract tests without the game

- Invalid payloads, numeric bounds, discriminated targets, unsupported versions.
- Fragmented/concatenated frames, truncation, oversize data, malformed JSON.
- Queue caps, expiry, cancellation, duplicate IDs, payload conflicts, session changes.
- Unknown outcomes, reconnect without mutation replay, stale events.
- Capability resolution across implementation/build/context/target combinations.
- IPC sender rejection and payload tampering.
- SQLite migrations, rollback, old/new schema handling, interrupted jobs.
- Catalog domain identity, localization, missing references, stale generations.
- Library import limits, unsafe paths, unknown schemas.
- Cross-language valid/invalid fixtures in TypeScript and Python.

### Application and visual tests

Real Electron launch, preload restrictions, navigation, localized forms, disabled reasons, focus, loading/error/unknown states, scaled windows, screenshots, image fallbacks, and long text. No mock is evidence of native game support.

### Game validation

Known/unknown builds, game closed/menu/loading/ready, save/session transition, empty/partially filled/full inventory, multiple stacks, invalid quantity/destination, duplicate submit, bridge failure around mutation, normal save persistence, Courier departure/distance/full receiver, accepted/cancelled native claim UI.

### Distribution validation

Use the clean-machine matrix in DISTRIBUTION.md. Record artifact hash, manifest, OS, dependency availability, game build, network state, launch logs, listener observations, and actual result.

## 11. CI and release

Add GitHub Actions when code exists: JS lint/typecheck/tests/build, Python checks when runtime exists, and Windows package verification. Keep game-dependent tests separate and clearly manual or environment-bound. Do not claim CI verified runtime behavior without the game.

No automatic release publication initially. Before manual release: license inventory, signed artifacts where distribution policy requires, checksums, self-contained clean-machine proof, migration/recovery checks, known-build matrix, and accurate release notes.

## 12. Definition of done

Implementation matches the owning specification; relevant tests pass; actual artifacts/UI are inspected; game-dependent claims have game evidence; failures are truthful; dependencies are reproducible; distribution has no hidden global prerequisite; English documentation reflects final behavior; no promised feature is marked complete because its budget or time ran out.
