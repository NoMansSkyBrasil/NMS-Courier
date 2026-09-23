# NMS Courier: project plan

Status: M0 complete; B0 private-runtime packaging proof in progress; M1 exact-build native callback verified; M2 Carbon ×500 visually confirmed and persistent after a normal reload. Currency reward delivery remains an untested prototype. Updated: 2026-09-23.

This document and its linked specifications replace the earlier Portuguese planning document. They retain the original delivery scope and the later dedicated Save Editor requirement, while expanding implementation structure and self-contained distribution.

## 1. Scope

NMS Courier is the working repository name. NMS Local Delivery remains a provisional product name from the brief. Final branding does not block engineering.

The product is a Windows desktop application that performs supported actions in the live No Man's Sky process on the same computer. The first real outcome is Carbon ×500 delivered to the local player without save editing, restarting the game, or reloading the save to apply the change.

The next major outcome is delivery to another eligible player through native NMS multiplayer, with the local character acting as the courier. Advanced entities require separate engines and evidence.

A future Save Editor will occupy its own application area. It operates on explicitly selected files through isolated editing sessions, independently from runtime delivery.

### Mandatory properties

- Local-first; no application account, cloud service, subscription, analytics, or telemetry.
- Offline local functionality after acquiring the complete application and having a compatible game installation.
- No separate Python, Node.js, .NET, SQLite server, or toolchain installation for end users.
- Official shadcn components with standard appearance; no competing UI framework or custom skin.
- No delivery through save-file modification, including hidden fallback behavior.
- Game mutation only on verified builds and in verified execution contexts.
- No fabricated signatures, offsets, layouts, APIs, or success messages.
- Versioned contracts with local/network-player targets from the start.
- Explicit unknown outcomes when a mutation may have happened but its response was lost.
- English documentation, code comments, docstrings, developer-facing text, and repository filenames.

“Local” describes application infrastructure. Courier still needs the connectivity required by the game's multiplayer. Private dependencies do not remove the need for Windows, the game, its store client when applicable, or a compatible build.

## 2. Current state

The M0 desktop foundation exists: the pnpm workspace, Electron main/preload/renderer boundary, Base UI shadcn shell, theme and three-locale controls, lint/typecheck/test configuration, and Windows x64 ZIP packaging command are implemented. The ZIP has been extracted and its executable launched without Vite.

B0 has a private CPython 3.11.9 Windows x64 bundle, closed wheel specification, hash-verified staging, license inventory, and Electron resource packaging proof. The packaged ZIP contains the private interpreter, runtime manifest, and non-interactive runtime defaults. The private runtime is resolved only by the Electron main process; renderer code receives only its availability and version.

The B0 clean offline Windows validation and native dependency audit remain open. The earlier Python diagnostic bridge authenticated build 179666 but did not reliably reach a live mutation callback. The current native XInput proxy loaded on the exact executable fingerprint, observed 7,319 read-only update callbacks, and dispatched one `FUEL1` Carbon ×500 request through the game's inventory function. The callback observed a quantity change from 15 to 515; the user saw the new 500-unit stack in the game and confirmed the total persisted after a normal save reload. The user manually merged the two stacks. This establishes the first local item operation, not automatic stack merging or a native collection notification. The separate currency reward prototype uses new EXML reward IDs and a guarded `GiveGenericReward` call. In a live disposable save on 2026-09-23, one Units test changed the user's observed balance from 10,460 to 1,000,010,460 and showed the game's native right-side reward notification. The user also confirmed a Nanites grant starting from 588 and the same notification. After the test window expired, a normal game restart allowed a single Quicksilver grant from zero to a reported 1,000,000,000. The user confirmed all three balances persisted after saving and reloading normally. The user also confirmed the native right-side notification for Quicksilver. Repeatability and network-player delivery remain unverified.

## 3. Documentation ownership

| Document | Owns |
| --- | --- |
| [ARCHITECTURE](ARCHITECTURE.md) | Stack, process boundaries, services, dependency rules |
| [REPOSITORY_STRUCTURE](REPOSITORY_STRUCTURE.md) | Planned paths, file responsibilities, naming, introduction stages |
| [DISTRIBUTION](DISTRIBUTION.md) | Private runtimes, packaging, launch, clean-machine acceptance |
| [PROTOCOL_AND_RUNTIME](PROTOCOL_AND_RUNTIME.md) | Sessions, commands, capabilities, queue semantics, game research |
| [PRODUCT_AND_UI](PRODUCT_AND_UI.md) | Screens, journeys, standard shadcn composition, interaction states |
| [DATA_AND_CATALOG](DATA_AND_CATALOG.md) | Extraction, SQLite, library, assets, migration, privacy |
| [IMPLEMENTATION_AND_VALIDATION](IMPLEMENTATION_AND_VALIDATION.md) | Ordered work packages, proposed commands, test/release gates |
| [SAVE_EDITOR](SAVE_EDITOR.md) | Separate future editing scope, architecture, workflow, roadmap |
| [RESEARCH_AND_DECISIONS](RESEARCH_AND_DECISIONS.md) | Sources, inspected revisions, evidence, unresolved questions |

Do not duplicate detailed contracts across documents. Update the owning specification and link to it.

## 4. Stack summary

| Concern | Direction | Status |
| --- | --- | --- |
| Desktop | Electron, Windows x64 | Selected |
| Build integration | electron-vite over Vite | Selected; versions at M0 |
| Renderer | React and TypeScript strict | Selected |
| Navigation | React Router, local hash routing initially | Selected |
| UI | shadcn/ui, Tailwind CSS, Lucide | Required |
| Client state | Zustand | Required; UI/session state only |
| Validation | Zod in TypeScript; explicit Python validation | Selected |
| Persistence | SQLite via better-sqlite3 in a data worker | Candidate; packaged native-module proof required |
| Runtime | Native x64 XInput bridge prototype; private CPython/pyMHF/NMS.py diagnostic prototype retained | Exact-build startup and 7,319 live read-only callbacks verified; one test-only Carbon insertion changed observed quantity from 15 to 515, with UI and save-reload confirmation |
| Python candidate | Regular GIL-enabled CPython 3.11.9 x64 | Candidate; patch/wheel combination must pass proof |
| Package management | pnpm and uv on development/build machines | Selected |
| Packaging | electron-builder, Windows ZIP and offline NSIS installer | Candidate; package proof required |
| UI/unit testing | Vitest and React Testing Library | Selected |
| Desktop testing | Playwright Electron support | Candidate; version compatibility required |
| Python quality | pytest, Ruff, mypy | Selected |
| Communication | Narrow preload API and Windows Named Pipe | Required |
| HTTP server | None for application operations | Selected |

Exact versions belong in manifests, lockfiles, and the release runtime manifest. Never use “latest” as the production compatibility strategy. Newer Python is not automatically compatible with native injection dependencies.

## 5. Engines

| Engine | Responsibility | Stage |
| --- | --- | --- |
| InventoryEngine | Products, substances, physical parts, stacks | M2 |
| RewardEngine | Native reward dispatch and side effects | M2 research; M5 expansion |
| CurrencyEngine | Currencies and native limits | M5 |
| PlayerEngine | Eligible players and native transfer | M4 |
| UIEngine | Native notifications and interactions | M2 optional; M6 expansion |
| ShipEngine | Claim, exchange, replace, reskin, spawn | M6, methods verified separately |
| MultitoolEngine | Claim/compare and configuration | M7 |
| FreighterEngine | Ownership/exchange | M7 |
| FrigateEngine | Recruitment and fleet limits | M7 |
| PetEngine | Eggs, companions, supported genetics | M7 |
| CorvetteEngine | Parts, complete entities, later builder | M5 parts; M8 expansion |
| SpawnEngine | Spawns and encounters | Later |
| MissionEngine | Missions and progression | Later |

Reserve responsibilities now; create implementations only for concrete verified use cases. Recipes, installed technology, packaged technology, rewards, unlocks, and physical items are distinct domains.

## 6. Roadmap

| Stage | Outcome | Required evidence |
| --- | --- | --- |
| P0 | Complete design | English specifications and explicit unknowns |
| P1 | Runtime/distribution feasibility plan | Dependency map and precise proof sequence |
| M0 | Electron shell with labeled demo data | Packaged opening and rendered UI checks |
| B0 | Private runtime packaging proof | Clean offline imports and native dependency checks |
| M1 | Real connection to the correct game instance | Private runtime attachment and truthful handshake |
| M2 | Carbon ×500 locally | Observed mutation, quantity and failure behavior |
| M3 | Local catalog/assets | Extraction, offline search, cache validation |
| M4 | Courier prototype | Native transfer to vanilla receiver |
| M5 | Advanced items, currencies, rewards, parts | Per-domain evidence |
| M6 | Ship interaction | Native claim/compare outcome and cancellation |
| M7 | Multitools, freighters, frigates, pets | Independent engine proofs |
| M8 | Corvette library/runtime features | Validated definitions, import/export, runtime proof |
| SE0–SE6 | Dedicated Save Editor | Separate milestones in SAVE_EDITOR.md |

B0 must pass before M1 acceptance. Packaging feasibility is an early architecture gate, not a final cosmetic task.

## 7. Success and non-goals

M2 succeeds only when the live game receives the supported operation and the application reports a verified outcome. A screen, passing schema test, connected pipe, or queued request does not satisfy this.

The initial implementation excludes public APIs, multiplayer replacement, remote memory editing, independent overlays, cloud login, auto-update, generic Python consoles, arbitrary memory writers, and Save Editor.

Navigation visibility does not imply implementation. Unsupported actions remain unavailable with explanations. Experimental and verified are different support levels.

## 8. Original requirement coverage

| Brief sections | Owning documents |
| --- | --- |
| 1–5: vision and delivery modes | PROJECT_PLAN, PROTOCOL_AND_RUNTIME, PRODUCT_AND_UI |
| 6–14: engines, entities, Corvettes, library | PROJECT_PLAN, DATA_AND_CATALOG, SAVE_EDITOR |
| 15–16: catalog/assets | DATA_AND_CATALOG, DISTRIBUTION |
| 17–22: stack, layout, targets, Electron security | ARCHITECTURE, PRODUCT_AND_UI |
| 23–29: bridge, queue, protocol, compatibility | PROTOCOL_AND_RUNTIME |
| 30–33: logs, debug, research, native calls | ARCHITECTURE, RESEARCH_AND_DECISIONS |
| 34–37: Courier and remote limits | PROTOCOL_AND_RUNTIME, PRODUCT_AND_UI |
| 38–43: structure, quality, licenses, offline, updates | REPOSITORY_STRUCTURE, DISTRIBUTION |
| 44–52: milestones | IMPLEMENTATION_AND_VALIDATION |
| 53–64: incremental work, evidence, CI, wrappers, events | IMPLEMENTATION_AND_VALIDATION, PROTOCOL_AND_RUNTIME |
| 65–72: UX, search, settings, history, performance | PRODUCT_AND_UI, DATA_AND_CATALOG, ARCHITECTURE |
| 73–77: process and completion | PROJECT_PLAN, IMPLEMENTATION_AND_VALIDATION |
| Later Save Editor request | SAVE_EDITOR |
| English and plug-and-play request | AGENTS.md, all documents, DISTRIBUTION |
