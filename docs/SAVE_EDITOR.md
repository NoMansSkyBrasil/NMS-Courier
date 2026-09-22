# Future dedicated Save Editor

Status: product scope reserved for later. No save inspection, editing, or implementation is authorized by this planning stage.

## 1. Product boundary

Save Editor is an exclusive application area with its own navigation, session state, file adapters, validation, preview, write, backup, and recovery workflow. Runtime delivery never invokes it as fallback.

Use distinct verbs: Deliver for runtime actions; Open Save, Review Changes, Apply to Save, and Restore Backup for file operations. Clearly identify the active profile/slot throughout editing.

Reuse official shadcn components, locale infrastructure, catalog references, and library definitions. Do not reuse runtime memory layouts as save-file formats. Do not require injection to read/edit a supported save.

External save-editor projects may inform a future evidence checklist for platform file layouts, compression, encryption, lossless round-trip fixtures, backup/recovery, and UI separation. They do not authorize importing implementation, generated game databases, test saves, cryptographic assumptions, or write behavior. Every supported format and every write path requires independent, versioned evidence before it is enabled.

## 2. Future architecture

```text
Save Editor feature
  → restricted preload operations
  → save application service
  → isolated editing session and save-domain operations
  → versioned save-format adapter
  → staging, backup, conflict check, journaled application
  → selected local files
```

Planned paths:

- apps/desktop/src/features/save-editor: pages, editing forms, comparison and recovery views.
- packages/save-domain: typed editable entities, semantic operations, invariants, undo/redo, semantic diff.
- packages/save-adapters: versioned parsing, serialization, compression, metadata handling.
- A dedicated worker/service for file operations and recovery; no save write access in renderer.

Each adapter exposes what it can read, preserve, edit, and write. Unknown format versions do not inherit write support by resemblance.

## 3. User workflow

1. Detect supported local locations or choose an explicit file/folder.
2. Select a profile/slot using verified metadata, not filename similarity alone.
3. Check format, version, integrity, and related files.
4. Create a consistent snapshot with manifest, timestamps, and checksums.
5. Open a working copy; field changes do not immediately modify the original.
6. Edit supported domains using structured forms and validated operations.
7. Undo/redo within the session; clearly show pending changes.
8. Validate types, ranges, relationships, ownership/index references, and domain invariants.
9. Review a semantic before/after comparison and known consequences.
10. Confirm the exact destination and recovery snapshot.
11. Recheck original file identity/content to detect concurrent changes.
12. Stage and validate serialized output.
13. Apply with a recovery journal appropriate to the complete file set.
14. Reread output and verify it matches the intended result.
15. Record the revision and offer explicit restore/navigation options.

Undoing a draft is not the same as reverting changes already loaded by the game. Communicate that distinction clearly.

## 4. Feature vision

| Area | Intended functionality | Proof required |
| --- | --- | --- |
| Overview | Profiles, slots, mode, metadata | Format-specific detection |
| Inventories | Items, quantities, slots, technologies | Limits and references per inventory |
| Player/currencies | Supported attributes and values | Types, bounds, dependent fields |
| Ships/multitools | Definitions, configuration, library | Ownership and index consistency |
| Freighter/frigates | Fleet and associated entities | Related state and fleet limits |
| Pets/eggs | Companions, definitions, genetics | Valid supported combinations |
| Corvettes | Parts, presets, configuration | Versioned structure understanding |
| Bases | Inspection, library, later editing | Spatial/entity references |
| Progression | Missions, recipes, rewards, unlocks | Dependency graph of progression |
| Account data | Separate clearly labeled scope | Cross-slot consequences |
| Backups | Snapshots, comparisons, restore | Consistent recoverable file sets |
| Advanced data | Inspection and eventual raw editing | Validation/preservation; no automatic bypass |

This is desired scope, not an assertion that these formats or operations are supported. Track read/edit/import/export support separately by format/version.

## 5. Integrity requirements

- Initial write-capable release requires the game to be closed; check before applying.
- Detect external changes, including synchronization clients, rather than overwriting blindly.
- Do not alter cloud-save configuration automatically.
- Preserve unknown fields only when lossless round-trip is demonstrated; otherwise refuse that format/version for writing.
- Validate compression, checksums, metadata, and accompanying files according to observed format requirements.
- A single rename does not make a multi-file save transaction atomic. Use a tested apply/recovery journal.
- Backup the necessary complete file set, not only a convenient main file.
- Restore also checks conflicts and preserves the state being replaced where appropriate.
- Keep backup retention separate from cache cleanup, explicit and configurable.
- Add batch edits only after individual operations are verified, with per-save preview and outcomes.
- Destructive removal/replacement needs a concrete consequence summary and contextual confirmation.
- Successful serialization is not proof that the game accepts the save; validate in NMS separately.

## 6. Library integration

Import creates a definition, not an action. The user explicitly chooses to apply it to an open save or request a supported runtime operation. Compatibility is shown separately for each route.

Reject executable payloads, unsafe paths, excessive data, unsupported schemas, and unresolved references. No imported library file can bypass save validation or runtime compatibility.

## 7. Roadmap

| Stage | Deliverable | Acceptance |
| --- | --- | --- |
| SE0 | Format/license research and test corpus | Evidence-backed initial scope; no writes |
| SE1 | Read-only browsing and snapshots | Correct profile/slot, intact source, recoverable backup |
| SE2 | Draft session, undo/redo, validation, semantic diff | Changes isolated from original files |
| SE3 | One small supported write domain | Round-trip, conflict, crash recovery, game acceptance |
| SE4 | Progressive inventories/entities | Independent domain acceptance |
| SE5 | Versioned library import/export | Explicit compatibility and safe application |
| SE6 | Advanced tools and batch operations | Predictable per-save results and recovery |

This track is outside the initial delivery implementation and need not wait for every advanced delivery engine. Schedule it explicitly later.

## 8. Required tests

Unchanged round-trip, unknown fields, truncated input, incorrect metadata, inconsistent references, disk full, failure at every apply boundary, external edits, restoration, paths with spaces/non-ASCII characters, and real game loading. Use synthetic or appropriately authorized fixtures; never commit personal saves.
