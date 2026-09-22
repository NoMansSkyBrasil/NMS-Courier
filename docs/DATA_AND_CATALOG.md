# Local data, catalog, assets, and library

Status: planned storage model; no database or extraction code exists.

## 1. Storage ownership

Use application-owned per-user locations resolved by Electron. Installation resources are immutable. User data is not placed in the Git checkout, game directory, or Program Files.

```text
<application-user-data>/
  data/
    application.sqlite
  catalog/
    generations/
  cache/
    thumbnails/
    staging/
  library/
    objects/
  logs/
    app.log
    runtime.log
  diagnostics/
  sessions/                       # Protected ephemeral files; no permanent credentials
  backups/                        # Future Save Editor; separate retention
```

Resolve paths centrally. Never accept arbitrary relative paths from imported definitions or renderer messages. Cache is disposable; library, preferences, operation history, and backups have separate deletion policies.

## 2. SQLite model

| Entity | Key / important fields | Purpose |
| --- | --- | --- |
| installations | installation ID, chosen path, distribution, observed build | User-selected source |
| preferences | scoped key, validated value, schema version | Locale/theme/options |
| catalog_generations | generation ID, source fingerprint, tools, locale set, status | Atomic catalog publication |
| catalog_entries | generation + domain + internal ID, category, source | Typed game definitions |
| catalog_localizations | entry identity + locale, name, description | Search/display text |
| catalog_assets | asset key, source fingerprint, local reference | Rebuildable image mapping |
| favorites | domain + internal ID | Stable preferences across generations |
| operations | request ID, session, action, target summary, requested/applied, state, error | Honest local history |
| operation_events | operation ID, transition, timestamp, safe details | Diagnose multi-step/unknown outcomes |
| library_entries | entity type, schema version, metadata, content reference, compatibility | Reusable definitions |
| schema_migrations | version, timestamp/checksum | Controlled application schema evolution |

Exact column types/indexes are finalized with the first consuming feature. Do not create unused tables solely to populate a roadmap.

Store images and large definitions outside SQLite where appropriate; use normalized references and integrity checks. Do not store game memory dumps or full saves in delivery history.

### Database rules

- One data worker owns writes and migration lifecycle.
- Parameterized SQL only; no renderer-supplied query text.
- Enable referential integrity and use transactions for related application changes.
- Test WAL/checkpoint behavior if WAL is selected; backups must account for live database files correctly.
- Migrations are ordered, tracked, and recoverable. A newer unsupported schema must not be opened for writes by an older app.
- Long catalog jobs use staging and bounded transactions so ordinary queries remain responsive.
- DB commit and game mutation cannot form one transaction; operation status can be unknown after failure.

## 3. Catalog generation pipeline

1. Validate selected installation and file version/fingerprint.
2. Locate relevant PAKs under GAMEDATA/PCBANKS.
3. Use an audited compatible PAK extractor; MBINCompiler is not a PAK extractor.
4. Extract only required tables, localization, and asset references to application staging.
5. Convert MBIN with a compatible bundled tool. Current MBINCompiler documentation describes MXML; do not assume the older EXML workflow.
6. Normalize Products, Substances, Technologies, Recipes, Parts, and Rewards into distinct domains.
7. Resolve localized text with a declared fallback.
8. Record source build, extractor/converter version, and entry provenance.
9. Resolve image sources and generate bounded-size thumbnails.
10. Populate a new generation and validate uniqueness, references, counts, and representative queries.
11. Atomically switch the active generation reference after success.
12. Retain the prior working generation if conversion, validation, cancellation, or publication fails.

MBIN tooling is version-sensitive. A newer converter is not guaranteed to read every older structure. [MBINCompiler](https://github.com/monkeyman192/MBINCompiler).

### Cache invalidation

Keys include source build/content identity, language, relevant tool version, and transform version. An updated game invalidates delivery approval even if an old catalog can still be browsed.

Initial extraction scope is vanilla data. Installed mods may change tables, limits, and assets. Do not claim the catalog reflects mod precedence until that pipeline is implemented and tested.

## 4. Search and images

Search localized names and internal IDs, with exact-ID and prefix matches prioritized. Normalize case/diacritics where appropriate while retaining original display values. Add fuzzy matching only after real need and measurement.

Start with indexed SQLite queries and paged results. Adopt FTS only after checking availability/tokenization in the packaged driver and real multilingual data. Avoid a duplicate in-memory search engine without evidence.

Use lazy thumbnails and bounded concurrent decoding. No thousands of full-size textures in renderer memory. Missing/unsupported images use a standard placeholder. No CDN fallback.

Assets come from the user's game installation and remain local. Do not commit or redistribute game assets based on our own code license.

## 5. Library definitions

Library supports future ships, multitools, freighters, frigates, pets, Corvettes, and bases. A record includes kind, format/schema version, origin, metadata, compatibility, and content reference.

Separate compatibility facets: display, import, export, runtime delivery, and Save Editor application. A definition may support one and not another. Importing a definition performs no action in the game or save.

Validate size, nesting, path references, required fields, and version. Never execute code contained in a definition. Use synthetic/authorized fixtures for tests; do not put personal saves in the repository.

## 6. History and privacy

History shows item/entity, requested/applied amount, local or minimal recipient label, result, and time. Persist only identity needed for operation tracking; do not build a permanent database of nearby players.

Recent items derive from explicit user actions, with successful outcomes distinguishable from attempts. Favorites survive catalog regeneration by stable domain/ID, with missing entries shown honestly.

Logs use structured English event names and correlation IDs, rotate with size limits, and redact credentials, private identifiers, and unnecessary game data. Verbose hook logging is off by default and time-limited when enabled.

Diagnostic export is user initiated, local, reviewable, and redacted. No automatic upload. Cleanup controls clearly distinguish logs, history, cache, library, and future backups.
