# Local data, catalog, assets, and library

Status: planned storage model and catalog identity contract; no database or extraction code exists.

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

### Local asset extraction

Catalog entries may retain a normalized game-relative asset locator, such as an item icon DDS path, but never an absolute installation path. Asset bytes are read only from the user-selected installation into private staging. The asset worker resolves only locators referenced by accepted catalog entries, verifies their source archive/build identity, decodes them with a pinned bundled decoder or converter, and writes bounded PNG or WebP derivatives into the application cache.

Do not extract every texture archive by default. Refreshing an icon records the source locator, source archive hash, decoded-content hash, decoder version, pixel dimensions, and cache key. Missing, unsupported, oversized, or corrupt images must leave the entry usable with a standard placeholder and a diagnostic; they never block catalog publication. The renderer receives a local, validated derivative reference through a narrow API and never receives an arbitrary game path.

The production package must include the reviewed image decoder/converter and its license notices. There are no first-launch downloads of ImageMagick, 7-Zip, a DLL, or a decoder. A future asset pipeline may add selected model previews only after a separate size, licensing, rendering, and performance review; raw models and full texture dumps are not general catalog assets.

### Database rules

- One data worker owns writes and migration lifecycle.
- Parameterized SQL only; no renderer-supplied query text.
- Enable referential integrity and use transactions for related application changes.
- Test WAL/checkpoint behavior if WAL is selected; backups must account for live database files correctly.
- Migrations are ordered, tracked, and recoverable. A newer unsupported schema must not be opened for writes by an older app.
- Long catalog jobs use staging and bounded transactions so ordinary queries remain responsive.
- DB commit and game mutation cannot form one transaction; operation status can be unknown after failure.

## 3. Canonical game identity and coverage

The game-facing identifier is called **Game ID** in this project. It is the exact identifier stored in the extracted table from the selected game installation, such as `FUEL1` for the Carbon substance. It is not an application-generated ID, display name, localization token, save-editing field, or proof that a runtime operation is supported.

Names must be resolved from the selected installation's localization data. A Game ID must never be inferred from a translated name, and a localization key must not be assumed to equal its Game ID. The application may display `Carbon · FUEL1`, but the source identity remains the extracted table entry.

The primary catalog key is a generation-scoped composite of `domain` and `game_id`. The application derives a canonical string such as `substance:FUEL1` for references and favorites. A bare Game ID is not assumed globally unique across all table domains or future game data.

Each catalog generation records the following logical data sets:

| Data set | Required fields | Purpose |
| --- | --- | --- |
| catalog_entries | domain, Game ID, source-table locator, category/group, native metadata, source reference | Exact, versioned identity for a game definition |
| catalog_localizations | entry identity, locale, resolved name, subtitle, description, localization locator, fallback state | Names and searchable text without guessing translations |
| catalog_relations | source entry, relation kind, target entry, ordinal, quantity/condition when present, source reference | Recipes, reward outcomes, ingredients, unlocks, compatible parts, and other explicit links |
| catalog_sources | archive/table path, archive hash, table hash, extractor/converter versions, parser revision | Reproducible provenance for every imported value |
| catalog_coverage | expected table/domain, discovered count, accepted count, rejected count, diagnostics | Evidence that the imported catalog is complete for the declared game build |

The first coverage manifest must enumerate at least Substances, Products, Technologies, Recipes, Rewards, Buildable Parts, Ship Parts, Multitool Parts, Freighter/Frigate definitions, Creature/Pet definitions, and Corvette definitions when those tables exist in the selected build. A domain is marked unavailable when the table cannot be identified or parsed; it is never silently omitted. The importer preserves unknown fields as bounded raw metadata only when they have a recorded source locator and parser version.

The initial discovery manifest includes the known candidate table paths below, matched case-insensitively inside the selected installation's PAK content. They are discovery targets rather than an exhaustive or permanent schema; a selected build remains authoritative.

| Domain | Candidate table path | Expected table type |
| --- | --- | --- |
| Products | `metadata/reality/tables/nms_reality_gcproducttable.mbin` | `cGcProductTable` |
| Substances | `metadata/reality/tables/nms_reality_gcsubstancetable.mbin` | `cGcSubstanceTable` |
| Technologies | `metadata/reality/tables/nms_reality_gctechnologytable.mbin` | `cGcTechnologyTable` |
| Localizations | `language/nms_loc*_*.mbin` and update-specific language tables | Build-specific language table types |

The language discovery step must collect every matching table for each requested locale, retain precedence/order in provenance, and record missing languages explicitly. It must not derive `pt-BR`, `en-US`, or `es-ES` item names from application UI translations.

The selected game installation is the only production catalog source. Websites, community JSON files, browser APIs, and downloaded catalogs are prohibited as import inputs. They may support engineering research but never populate catalog entries, localizations, relations, or provenance. Importing a catalog must not unpack into the game directory, modify PAKs, create mods, read a save, attach to the game process, or grant an item. A current catalog improves selection and validation only; runtime delivery remains separately capability-gated.

## 4. Catalog generation pipeline

1. Validate selected installation and file version/fingerprint.
2. Locate relevant PAKs under GAMEDATA/PCBANKS.
3. Use an audited compatible PAK extractor; MBINCompiler is not a PAK extractor.
4. Extract only required tables, localization, and asset references to application staging.
5. Convert MBIN with a compatible bundled tool. Current MBINCompiler documentation describes MXML; do not assume the older EXML workflow.
6. Discover the table/domain coverage manifest before accepting records; retain diagnostics for unrecognized tables.
7. Normalize Products, Substances, Technologies, Recipes, Parts, Rewards, and their explicit relations into distinct domains.
8. Resolve localized text with a declared fallback and preserve the localization locator for each value.
9. Record source build, archive/table hashes, extractor/converter version, parser revision, and entry provenance.
10. Resolve image sources and generate bounded-size thumbnails.
11. Populate a new generation and validate primary-key uniqueness, relation targets, coverage counts, and representative Game ID/name queries.
12. Atomically switch the active generation reference after success.
13. Retain the prior working generation if conversion, validation, cancellation, or publication fails.

MBIN tooling is version-sensitive. A newer converter is not guaranteed to read every older structure. [MBINCompiler](https://github.com/monkeyman192/MBINCompiler).

### Packaged toolchain acceptance

The current extraction candidate is HGPAKtool for supported post-5.50 PAKs. Its project documents a self-contained Windows binary and a Python library; the released Python package declares MIT and supports the private CPython candidate. This is a candidate only. Before it is adopted, pin its source artifact, hash, license notice, dependency closure, supported PAK revision, command behavior, and output isolation. Never invoke a tool mode that downloads a DLL or any other component at import time.

MBIN conversion remains a separate build-matched dependency. MBINCompiler releases and mappings are version-sensitive, so the importer must select a pinned, reviewed converter only after the selected installation's build is known. It must reject a missing or mismatched mapping rather than use a newer converter opportunistically. The final catalog worker may execute only verified extraction and conversion commands against a private staging directory; it cannot repack PAKs, write the game directory, invoke a shell, or accept arbitrary command arguments from the renderer.

The end-user package includes every accepted catalog tool and its license notices. There is no first-launch `pip`, .NET, Node.js, or tool download. If a compatible, redistributable tool cannot be bundled for a game build, catalog refresh is shown as unavailable with its concrete reason while the last verified generation remains browseable.

### Cache invalidation

Keys include source build/content identity, language, relevant tool version, and transform version. An updated game invalidates delivery approval even if an old catalog can still be browsed.

Initial extraction scope is vanilla data. Installed mods may change tables, limits, and assets. Do not claim the catalog reflects mod precedence until that pipeline is implemented and tested.

## 5. Search and images

Search localized names and internal IDs, with exact-ID and prefix matches prioritized. Normalize case/diacritics where appropriate while retaining original display values. Add fuzzy matching only after real need and measurement.

Start with indexed SQLite queries and paged results. Adopt FTS only after checking availability/tokenization in the packaged driver and real multilingual data. Avoid a duplicate in-memory search engine without evidence.

Use lazy thumbnails and bounded concurrent decoding. No thousands of full-size textures in renderer memory. Missing/unsupported images use a standard placeholder. No CDN fallback.

Assets come from the user's game installation and remain local. Do not commit or redistribute game assets based on our own code license.

## 6. Library definitions

Library supports future ships, multitools, freighters, frigates, pets, Corvettes, and bases. A record includes kind, format/schema version, origin, metadata, compatibility, and content reference.

Separate compatibility facets: display, import, export, runtime delivery, and Save Editor application. A definition may support one and not another. Importing a definition performs no action in the game or save.

Validate size, nesting, path references, required fields, and version. Never execute code contained in a definition. Use synthetic/authorized fixtures for tests; do not put personal saves in the repository.

## 7. History and privacy

History shows item/entity, requested/applied amount, local or minimal recipient label, result, and time. Persist only identity needed for operation tracking; do not build a permanent database of nearby players.

Recent items derive from explicit user actions, with successful outcomes distinguishable from attempts. Favorites survive catalog regeneration by stable domain/ID, with missing entries shown honestly.

Logs use structured English event names and correlation IDs, rotate with size limits, and redact credentials, private identifiers, and unnecessary game data. Verbose hook logging is off by default and time-limited when enabled.

Diagnostic export is user initiated, local, reviewable, and redacted. No automatic upload. Cleanup controls clearly distinguish logs, history, cache, library, and future backups.
