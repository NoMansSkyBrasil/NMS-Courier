# Repository instructions

## Current stage

This repository is in planning. Do not scaffold applications, install project dependencies, generate runtime code, attach to No Man's Sky, or edit saves until the user explicitly starts implementation. Documentation changes are allowed.

Read [the project plan](docs/PROJECT_PLAN.md) before implementation. Follow its linked specifications. Proposed files and commands in documentation do not mean those files or commands already exist.

## Language

- Write all repository documentation in English: Markdown, architecture decisions, API documentation, diagrams, development guides, changelogs, and release notes.
- Write all new source comments, docstrings, identifiers, developer diagnostics, logs, and test descriptions in English.
- Use English file and directory names. Preserve upstream names and required external identifiers.
- User-facing localization strings may be translated in dedicated locale resources; this exception does not permit non-English comments or documentation.
- Communicate with the user in their preferred conversational language unless they request otherwise.
- Preserve third-party license notices verbatim; do not rewrite legal notices to enforce language style.

## Product boundaries

- Delivery uses live game functions through verified runtime integration. Never fall back to save editing.
- The future Save Editor is a separate feature area, outside the initial implementation.
- Never invent game addresses, signatures, function names, layouts, or compatibility claims.
- Unknown builds must not receive runtime mutations.
- Queue acceptance is not delivery success. Lost responses may mean an unknown outcome; never retry mutations automatically.
- Keep local and network-player targets distinct. Courier uses native NMS multiplayer.

## Architecture and UI

- Use the stack and dependency boundaries in the architecture specification.
- Apply the installed shadcn skill and MCP for UI work. Resolve the actual primitive base and use matching documentation.
- Preserve official shadcn appearance. Compose standard components and change content; do not add a custom visual skin or another UI framework.
- Restrict renderer privileges. Expose narrow preload methods, not raw IPC or Node APIs.
- Keep game knowledge in runtime adapters. UI and application services must not import NMS.py internals.
- Do not create speculative empty engines or generic shared/utilities dumping grounds.

## Distribution

- End users must not install Python, Node.js, pnpm, uv, pip, .NET, SQLite, or compiler toolchains separately.
- Bundle approved private runtimes, dependencies, native libraries, and required tools at build time.
- Never depend on the developer's virtual environment, global PATH, user site-packages, or first-launch package downloads.
- Verify the packaged application on clean offline Windows before claiming plug-and-play support.
- Audit upstream listeners and interactive execution endpoints; our Named Pipe does not secure unrelated upstream services.

## Evidence and completion

- Distinguish planned, implemented, simulated, and verified behavior.
- Run checks appropriate to actual changes. Documentation-only work does not require an application build.
- Validate rendered Electron UI when UI implementation starts.
- Record dependency versions, game build, test conditions, limitations, and evidence for runtime support.
- Update the owning specification when architecture changes.
