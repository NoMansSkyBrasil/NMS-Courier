# Repository instructions

## Current stage

For a new AI/session, start with [the AI continuation guide](docs/AI_CONTINUATION.md).
It routes the current objective, capability/evidence status, completed work,
bounded reproduction steps and unresolved targets to their owning documents.
Read only the branch relevant to the user's request; do not load all research
exports or the entire experiment history. Keep that guide's checkpoint and
next-step references current whenever research changes the interpretation.

Implementation is in progress. M0 desktop foundations exist; the exact-build native bridge has delivered a local item and currencies on a disposable save. Freighter delivery is experimental. Do not treat a research probe as a production capability. Never edit saves as a delivery shortcut.

Read [the project plan](docs/PROJECT_PLAN.md) before implementation. Follow its linked specifications. Proposed files and commands in documentation do not mean those files or commands already exist.

Before repeating runtime research, read the [experiment log](docs/EXPERIMENT_LOG.md) and its linked source/evidence. The log is an index, not a substitute for the owning specifications.

Before continuing procedural seed investigation, read the [research handoff](docs/SEED_RESEARCH_HANDOFF.md). It records the paused checkpoint, identification method, existing exports, unresolved deductions and bounded reproduction commands. Resume analysis only when requested; do not repeat extraction or treat candidate labels as verified APIs.

For offline data or executable research, use the [batch pipeline](runtime/research/README.md) and its bounded SQLite/TSV queries before repeating individual extractions. Keep proprietary corpora and portable analysis tools in the external research directory; inspect their reports for progress and failures. A newer offline executable fingerprint does not extend the bridge's runtime compatibility.

Use the [research navigation index](docs/RESEARCH_INDEX.md) and [repository function map](docs/RESEARCH_SOURCE_FUNCTIONS.md) to locate existing adapters, diagnostics, data tables, and native export artifacts before scanning large files. Rebuild generated metadata with `runtime/research/build-research-index.py`; unavailable imports must remain explicit warnings.

## Language

- Write all repository documentation in English: Markdown, architecture decisions, API documentation, diagrams, development guides, changelogs, and release notes.
- Write all new source comments, docstrings, identifiers, developer diagnostics, logs, and test descriptions in English.
- Use English file and directory names. Preserve upstream names and required external identifiers.
- User-facing localization strings may be translated in dedicated locale resources; this exception does not permit non-English comments or documentation.
- Communicate with the user in their preferred conversational language unless they request otherwise.
- Preserve third-party license notices verbatim; do not rewrite legal notices to enforce language style.

## Document everything, always

- Record **every** experiment, live request, build, installation, finding, failure and decision in
  the repository's Markdown documentation during the same working session, before stopping or
  handing off. This is a standing rule from the project owner and applies to every model.
- For each live action write down: date, game build and executable hash, DLL and mod hashes, the
  exact request, what the tools reported, what the user saw, what is still unproven, and how to
  undo it. Update the owning note first, then `docs/EXPERIMENT_LOG.md` and
  `docs/AI_CONTINUATION.md`.
- Keep [live bridge operations](docs/LIVE_BRIDGE_OPERATIONS.md) current whenever the way requests
  reach the game changes, and state plainly which changes are native calls and which are direct
  writes.
- Commit and push documentation together with the change it describes.

## Documentation format

- Write all documentation in Markdown (`.md`). Do not add documentation, notes, findings, tables or
  lists in another format (plain text, CSV, TSV, spreadsheets, HTML, PDF or word-processor files).
  This applies to every model and external AI collaborator; Markdown is what both people and
  language models read best.
- Keep research data as Markdown too: one table per file with the marker line of
  `runtime/research/markdown_data.py`, which tools use to parse it. Do not commit new `.tsv`,
  `.csv` or `.txt` data files. When a tool needs tab-separated input, generate it from the Markdown
  table at run time, outside the repository.
- The only data allowed in another format is what a program must load in that format: JSON
  configuration and test fixtures, dependency lists, build files and third-party license notices.
  Every such JSON data file must be reachable from Markdown through
  [the data file catalog](docs/DATA_FILE_CATALOG.md).
- After adding, renaming or removing a data file, regenerate the catalog with
  `python runtime/research/build-data-file-catalog.py` and link the file from the owning document.
- If you find documentation in another format, convert it to Markdown and update the references in
  the same change.

## Organization: one domain per file

- Keep game domains apart. Freighter, corvette, starship, multitool and exosuit are separate
  things, and so is each domain added later (vehicles, companions, bases). Each gets its own
  scripts, runtime adapters, request handlers, tests and owning note. Do not grow a file named for
  one domain to serve another.
- Shared plumbing (preflight, signaling, store layout helpers) lives in one small, specifically
  named module that the domain files load. Never duplicate it per domain and never collect
  unrelated helpers in it.
- Name files for what they contain. If a file has outgrown its name, split or rename it in the
  same change and update every reference.
- Existing exception to remove: `runtime/native/asi/freighter_class_180836.c` serves every domain
  under a freighter name. Split it per domain the next time the profile is rebuilt; a split
  changes the DLL hash, so record the new hash and repeat the live checks before relying on it.
- Tidy as you go: remove superseded scripts instead of leaving two ways to do one thing, and say
  in the owning note what replaced them.

## Interface languages

- The application supports exactly the 14 interface languages of No Man's Sky's store listing:
  `pt-BR`, `pt-PT`, `ja-JP`, `en-US`, `fr-FR`, `it-IT`, `de-DE`, `es-ES`, `nl-NL`, `ko-KR`,
  `pl-PL`, `ru-RU`, `zh-CN`, `zh-TW`. Do not add or drop a language without the project owner.
- Every user-facing string must exist in all 14. When adding or changing interface text, update
  every locale in the same change; English is the fallback only for a string that is still
  untranslated, and such gaps must be listed in `TODO.md`.
- Keep translations in dedicated locale resources, one per language, never inline in components.
- Details and the mapping to game language identifiers:
  [product and UI](docs/PRODUCT_AND_UI.md#2-language).

## Technologies that are never delivered

- Defective and internal technology entries must never be taught, installed or offered, in any
  mode, including "deliver all" and including entries a later game version adds: damaged-slot
  entries (`BrokenSlotTech`), `Maintenance` category entries, procedural templates, repair entries,
  `OBSOLETE`, and the permanent ID rules in
  [technology delivery notes](docs/TECHNOLOGY_DELIVERY_NOTES.md).
- Refuse by structure first, then by the permanent ID rules, and refuse anything unreadable. Never
  build "all" from the raw table; build it from the classification.
- The rules live in three places that must change together, each with its test:
  `runtime/native/asi/technology_learn_180836.h`,
  `packages/catalog/src/technology-delivery-policy.ts` and
  `runtime/research/classify-technology-delivery.py`.
- Removing an entry or a rule from the blocked set requires an explicit decision by the project
  owner, recorded in the notes. Adding one does not. Do not block an entry only because the game
  hides it from its catalogue; the owner ruled those valid on 2026-10-07.
- Repeatable purchases must never be marked known: a special whose `IsConsumable` is true in the
  purchasable specials table (fireworks, Myth Beacon, Void Egg and any later one) stops being
  sold once known. See [known lists triage](docs/KNOWN_LISTS_TRIAGE.md).
- Prefer the game's own learn routine for each list and keep its refusals; do not write a known
  entry the game itself would refuse.
- Apply the same approach to every later delivery domain (products, recipes, parts): classify the
  whole table, identify defective or internal entries, and block them permanently before building
  any "deliver all" option.

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

- Every AI/model must leave a current, portable continuation checkpoint after meaningful research or implementation and before handing off or stopping. Update the owning document first, then `docs/EXPERIMENT_LOG.md`, `docs/SEED_RESEARCH_HANDOFF.md` and `docs/AI_CONTINUATION.md` with the active scope, exact source/configuration and fingerprints, observed results, failed/rejected hypotheses, remaining limitations and the next bounded reproduction command. Link existing evidence instead of copying large exports. Clearly separate completed checks from proposed steps so another AI can resume without repeating work or assuming success. This rule applies to all models and external AI collaborators using this repository.
- Distinguish planned, implemented, simulated, and verified behavior.
- Run checks appropriate to actual changes. Documentation-only work does not require an application build.
- Validate rendered Electron UI when UI implementation starts.
- Record dependency versions, game build, test conditions, limitations, and evidence for runtime support.
- Update the owning specification when architecture changes.
- For every live or offline game-integration experiment, add an experiment-log entry with build fingerprint, exact source/configuration, trigger and save conditions, what was observed, what was not proven, and rollback state. Record failures and rejected hypotheses as carefully as successes.
- Keep reproducible code and documentation in the repository. Refer to disposable local logs and temporary extraction paths only as transient evidence; do not depend on them for future work or commit account identifiers, tokens, personal saves, or proprietary third-party assets.
- Before any new live mutation, compare the installed executable, bridge, and data-patch hashes with the intended tested versions; check whether the previous one-shot outcome is known. A fresh process does not authorize an automatic retry of an uncertain outcome.
- For commits containing Codex-assisted work, use the `Co-authored-by: Codex <267193182+codex@users.noreply.github.com>` commit-message trailer. Keep commit subjects free of `@codex` mentions; attribution belongs in the co-author metadata.
