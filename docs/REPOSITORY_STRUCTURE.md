# Repository structure and file responsibilities

Status: planned tree, not a scaffolding instruction. Create files only when their milestone needs them.

## 1. Root layout

```text
nms-courier/
  AGENTS.md
  README.md
  CONTRIBUTING.md                 # M0 development workflow, English
  LICENSE                         # Original-code license after confirmation
  THIRD_PARTY_NOTICES.md           # Audited dependency notices
  package.json                    # Private workspace, scripts, packageManager pin
  pnpm-workspace.yaml             # Explicit apps/* and packages/* membership
  pnpm-lock.yaml
  .node-version                   # Build-tool Node version; not end-user requirement
  .editorconfig
  .gitignore
  eslint.config.mjs
  tsconfig.base.json
  apps/desktop/
  packages/protocol/
  packages/catalog/
  packages/persistence/
  runtime/
  tooling/
  tests/fixtures/
  docs/
  .github/workflows/
```

Root package is private. Internal packages use the @nms-courier scope and explicit workspace dependencies. Do not publish workspace packages accidentally.

Generated staging, build output, .venv, wheel caches, release artifacts, local databases, game assets, user saves, secrets, and machine-specific paths are ignored. Dependency lockfiles, migrations, original synthetic fixtures, and English documentation are tracked.

## 2. Desktop application

```text
apps/desktop/
  package.json
  electron.vite.config.ts
  electron-builder.yml
  components.json
  tsconfig.main.json
  tsconfig.preload.json
  tsconfig.renderer.json
  resources/
    app-icon.ico
  electron/
    main/
      index.ts
      bootstrap.ts
      create-window.ts
      register-protocols.ts
      app-paths.ts
      security-policy.ts
      ipc/
        register-handlers.ts
        validate-sender.ts
        status-handlers.ts
        catalog-handlers.ts
        delivery-handlers.ts
        settings-handlers.ts
      services/
        installation-service.ts
        game-status-service.ts
        runtime-host-service.ts
        delivery-service.ts
        catalog-service.ts
        preferences-service.ts
        history-service.ts
        diagnostics-service.ts
      bridge/
        pipe-client.ts
        frame-reader.ts
        handshake.ts
        pending-requests.ts
        session-state.ts
      workers/
        data-worker-client.ts
        data-worker-entry.ts
      logging/
        logger.ts
        redaction.ts
    preload/
      index.ts
      desktop-api.ts
  src/
    main.tsx
    app/
      app.tsx
      router.tsx
      providers.tsx
      app-shell.tsx
      error-boundary.tsx
    components/
      ui/                         # Official shadcn components
      app-sidebar.tsx
      connection-status.tsx
      capability-gate.tsx
    features/
      dashboard/
      items/
      settings/
      history/
      library/                    # M3+ as useful functionality arrives
      ships/                      # M6; not an empty M0 module
      save-editor/                # Future only
    stores/
      connection-store.ts
      target-store.ts
      preferences-store.ts
    hooks/
      use-desktop-events.ts
    lib/
      desktop-client.ts
      utils.ts                    # shadcn cn helper, not generic business logic
    locales/
      en-US.json
      pt-BR.json
    styles/
      globals.css
    types/
      window.d.ts
  tests/
    electron/
    integration/
```

### Entry point responsibilities

| File | Responsibility | Must not do |
| --- | --- | --- |
| main/index.ts | Enter lifecycle and invoke bootstrap | Contain delivery business logic |
| bootstrap.ts | Construct services and register their handlers | Hide dependencies in global mutable state |
| create-window.ts | Window configuration and local content loading | Enable unrestricted Node access |
| app-paths.ts | Resolve development/package/user-data locations | Hardcode developer machine paths |
| preload/index.ts | Expose reviewed desktop API | Export generic send/invoke or filesystem methods |
| src/main.tsx | Mount renderer | Start Python or access Node |
| router.tsx | Register routes and lazy boundaries | Infer game support from route presence |
| data-worker-entry.ts | Own DB and background jobs | Hold native game pointers |

### Feature folder pattern

For a substantial feature such as Items, use items-page.tsx for page composition, components/ for feature-specific composites, hooks/ for IPC query/subscription logic, and model/ for view-state mapping. Colocate focused tests next to the tested unit. Do not add all subfolders for a two-file page.

Item form logic belongs to Items; wire validation belongs to protocol; database queries belong to persistence; game inventory behavior belongs to the runtime. A feature page must not become all four layers.

## 3. Shared packages

```text
packages/protocol/
  package.json
  src/
    index.ts                      # Reviewed public exports only
    desktop-api.ts                # Renderer/preload contract
    wire-envelope.ts
    commands.ts
    events.ts
    results.ts
    errors.ts
    capabilities.ts
  schemas/                        # Generated wire schemas, if adopted
  fixtures/valid/
  fixtures/invalid/
  tests/

packages/catalog/
  package.json
  src/
    model.ts
    normalize-entry.ts
    search-query.ts
    extraction-plan.ts
    asset-key.ts
    compatibility.ts
  tests/

packages/persistence/
  package.json
  src/
    database.ts
    migrate.ts
    repositories/
      catalog-repository.ts
      preferences-repository.ts
      operation-repository.ts
      library-repository.ts
  migrations/
    0001_initial.sql              # Name reserved, contents defined at implementation
  tests/
```

Protocol is an internal application contract, not NMS multiplayer networking. Desktop IPC DTOs and runtime wire DTOs may differ; do not silently conflate them. Repository methods accept domain values rather than arbitrary SQL supplied by callers.

## 4. Python runtime

```text
runtime/
  pyproject.toml
  uv.lock
  .python-version
  src/nms_courier_runtime/
    __init__.py
    launcher.py                   # Our packaged entry point, not a claimed upstream API
    bootstrap.py
    config.py
    bridge/
      server.py
      framing.py
      protocol.py
      validation.py
      session.py
      command_queue.py
      operation_ledger.py
      capabilities.py
    engines/
      inventory.py                # Introduced for M2
      rewards.py                  # When a verified reward path is needed
      players.py                  # M4
    adapters/
      contracts.py
      nmspy_adapter.py
      compatibility.py
    game/
      build_identity.py
      player_context.py
      safe_dispatch.py
      signatures/                 # Only evidenced build-specific definitions
    mod/
      local_delivery.py
    diagnostics/
      events.py
      redaction.py
  tests/
    unit/
    contract/
    integration/
```

Python uses the src layout and absolute package imports. Avoid naming an application module queue.py in a place that shadows the standard library. Use command_queue.py.

launcher.py starts the verified dependency mechanism; bootstrap.py initializes our runtime with approved paths/configuration. These are planned project-owned files, not claims that upstream exposes equivalent methods.

Engines validate the operation's semantics and use adapter interfaces. Only adapters/bootstrap know NMS.py/pyMHF internals. Runtime changes must remain testable without running NMS, while actual hooks require separate in-game evidence.

## 5. Packaging and developer tooling

```text
tooling/
  packaging/
    runtime-manifest.schema.json
    dependency-allowlist.json
    runtime-overrides.toml
    assemble-python.ps1
    verify-native-dependencies.ps1
    verify-runtime-bundle.ps1
    prepare-catalog-tools.ps1
    build-release.ps1
  development/
    verify-environment.ps1
  patches/                        # Only if a reviewed upstream patch is necessary
    README.md                     # Origin, reason, license, revision, reproduction
tests/fixtures/
  catalog/                        # Synthetic or redistribution-approved data
  runtime-events/
  corrupted-inputs/
.github/workflows/
  checks.yml
  windows-package.yml
```

Build scripts are introduced with B0, not created speculatively during planning. Generated runtime-manifest.json and staging bundles belong under ignored build output. Do not check in a developer virtual environment or downloaded game assets.

## 6. Naming and organization rules

- English throughout documentation, identifiers, comments, docstrings, test names, and technical diagnostics.
- Kebab-case for TypeScript/React file names; PascalCase for React component identifiers; snake_case for Python modules/functions; uppercase documentation filenames as used in this repository.
- Use domain-specific names. Avoid manager.ts, helpers.py, common/, and shared/ without a narrow documented responsibility.
- Prefer named exports for domain modules. Keep package exports minimal.
- Unit tests use .test.ts/.test.tsx and test_*.py; desktop flow tests use .spec.ts under Electron tests.
- Configuration belongs to its owner. Do not place Python settings in renderer files or UI preferences in runtime hook code.
- Comments explain invariants and non-obvious reasons, not a line-by-line restatement of code.
- Translations are content resources. English remains the source language for technical errors and documentation.
- No empty folders merely to match this tree. Stage additions with their first useful behavior and tests.

## 7. Future Save Editor paths

Reserve packages/save-domain, packages/save-adapters, and the save-editor feature. Add a dedicated file-application worker/service when that work starts. Do not let runtime/ depend on these packages. Details and invariants are in SAVE_EDITOR.md.
