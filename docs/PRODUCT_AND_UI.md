# Product journeys and standard UI

Status: screen/interaction specification, not an implemented interface.

## 1. Visual contract

Use official shadcn/ui components and their standard appearance. Change strings, semantic icons, data, and layout composition. Preserve the chosen official preset's colors, typography, radius, shadows, focus styles, and animations. Dark mode is the initial appearance; light/system options may reuse the same preset.

Do not add Material UI, Mantine, Bootstrap, Ant Design, Chakra, custom gradients, or a separate theme skin. The earlier premium aesthetic requirement is satisfied through clear hierarchy and usable composition, not by overriding component styles.

Use the installed shadcn skill and MCP. Before adding a component, inspect project configuration, check existing components, retrieve current documentation/examples, and use the project's package runner. Keep one primitive base and use its matching APIs. Do not install an entire registry preemptively.

### Component map

| Need | Official composition |
| --- | --- |
| Desktop shell | Sidebar and standard subcomponents |
| Status | Card, Badge, Alert, Tooltip |
| Search | InputGroup and its input/addon components |
| Item form | FieldGroup, Field, Input, Select/Combobox |
| Short option set | ToggleGroup |
| Catalog | Card/Table and Pagination |
| Item details | Sheet with an accessible title |
| Settings | Tabs, Field, Switch, Select |
| Loading | Skeleton, Spinner, Progress |
| Empty/unavailable | Empty and Alert |
| Destructive confirmation | AlertDialog |
| Brief feedback | Toast implementation appropriate to selected base |
| History | Table, Badge, details on demand |

Respect full compositions: item groups, Card sections, TabsList, dialog/sheet titles, form validity attributes, and accessible icon-only labels. Never use browser alert() for application results. Use semantic tokens and layout utilities; do not hand-style replacements for existing components.

## 2. Language

Documentation, identifiers, comments, technical diagnostics, and developer logs are English. User-facing strings are keyed locale resources. Proposed first product locale: pt-BR, with en-US as source/fallback. This is separate from the mandatory English documentation policy.

Game item names/descriptions come from local game localization with an explicit fallback. Internal IDs, schema keys, and enum identifiers are not translated. Avoid building sentences by concatenating translated fragments; use parameterized messages and locale-aware numbers/plurals.

## 3. Navigation

Sidebar: Dashboard, Items, Ships, Multitools, Freighters, Frigates, Pets, Corvettes, Rewards, Library, Settings. Save Editor is a future dedicated area. History begins as a Dashboard section with a full-history view.

Future pages may show an honest planned/unavailable state. They must not contain convincing fake success flows. Do not create speculative feature implementations to populate navigation. The M0 demonstration mode is visually explicit and cannot dispatch real commands.

Persistent footer: game state/build and runtime state. “Connected” does not imply “Player ready” or “Delivery supported.”

## 4. First launch

1. Open a usable window even if the game or runtime bundle is unavailable.
2. Explain the local application purpose and current support level.
3. Detect supported installation locations without an unrestricted full-disk scan.
4. Offer a native directory selector when nothing is found or multiple installations exist.
5. Validate executable/data paths and show selected installation identity.
6. Report build compatibility separately from successful path detection.
7. Validate the private runtime bundle in the background.
8. Offer local catalog generation, with progress and safe cancellation.
9. Show independent statuses for catalog availability, game running, bridge connection, and player readiness.

No terminal commands, Python installers, account registration, external website setup, or first-launch package downloads are part of the user journey.

If no installation exists, the application still opens. If a previously generated catalog exists, it remains browsable with stale/compatibility indicators as appropriate.

## 5. Dashboard

Show game running state, runtime connection, player readiness, build, recent operations, and capabilities. Each problem has one relevant next action: select installation, open the game, retry a safe connection, or view incompatibility details.

Avoid business dashboard charts and decorative metrics. Status details belong in expandable sections; the primary screen answers whether delivery is available and why.

## 6. Items screen

### Layout

1. Title and “Deliver to” selector.
2. Search by localized name or internal ID.
3. Category, favorite, and availability filters.
4. Paged grid of local thumbnails, names, and categories.
5. Selected-item panel with description, quantity, inventory, notification option, and Deliver action.
6. Optional details sheet for ID, source/build, and technical restrictions.

Keep quantity/destination controls on the selected item instead of rendering many independent forms in the grid. All requested information remains available without excessive repeated controls.

### Delivery interaction

- Validate quantity as a positive integer within operation limits.
- Show only inventories supported for this action/context; never infer destination merely from catalog category.
- Keep total quantity separate from per-stack limits.
- Capture target/inventory/item as an immutable request snapshot when submitted.
- Immediately show pending state and prevent accidental repeated submission.
- Distinguish queued, executing, waiting for game interaction, complete, partial, rejected, cancelled, and unknown.
- Show error recovery beside the form; toast is supplemental rather than the only record.
- Preserve entered quantity after recoverable errors.
- If connection drops after submission, explain that the result is unknown and avoid an automatic retry button that repeats the mutation.
- A later target change affects only new operations.

### Target selector

Initially only the local player is actionable. Reserve network-player data shapes from the first contract. Future groups include You, Group, and Nearby when native data supports those distinctions.

Use opaque session identity for actions and display name for presentation. Deduplicate overlapping groups. Distance/platform appear only when available. Internal network identifiers stay out of normal UI and persistent history unless specifically needed.

## 7. Settings

| Group | Controls |
| --- | --- |
| General | Language, delivery preferences, history policy |
| Game | Installation path, detection, build/distribution details |
| Runtime | Bundle version, connection, capabilities, diagnostics |
| Appearance | Standard dark/light/system theme where included |
| Developer | Internal IDs, events, redacted protocol inspector, temporary verbose logs |
| About | Application/runtime versions, license notices, experimental status |

Actions include opening the logs folder, exporting a reviewable local diagnostic report, rebuilding the catalog, clearing image cache, and clearing history. Cache cleanup must not erase favorites, library, or save backups. History cleanup is not operation cancellation.

Developer mode never enables arbitrary Python, shell, or memory execution and never overrides unsupported-build restrictions.

## 8. Advanced pages

- **Ships:** type, seed, class, supported delivery method, and later parts/configuration. Claim/compare is a game interaction, not a successful acquisition by itself.
- **Multitools:** model/seed and verified native claim/compare path.
- **Freighters:** explicit ownership/exchange semantics and consequences.
- **Frigates:** recruitment and fleet limits.
- **Pets:** distinguish transferable eggs from companion entities/genetics.
- **Rewards:** reward identifiers and documented side effects; distinguish recipe/unlock/account effects.
- **Corvettes:** parts first, then definitions, library/import/export, complete entity operations, later builder/preview.
- **Library:** ships, multitools, freighters, frigates, pets, Corvettes, bases; definition availability does not imply delivery support.
- **Save Editor:** separate journey specified in SAVE_EDITOR.md.

### Capability boundaries for future tools

The Tools area may eventually group verified quick actions, point-of-interest discovery, location transfer, mission workflows, ByteBeat definitions, and other advanced operations. It lists only capabilities that are explicitly supported for the selected build and current game context. It never becomes an arbitrary command console, a generic “unlock all” control, or a way to bypass the runtime compatibility gate.

The Rewards area distinguishes catalogued season, expedition, Twitch, platform, title, recipe, and technology definitions from account ownership and from any future action. The Library/Sharing Center supports explicit offline definition import/export after schema and safety validation; it does not upload player data or execute imported content.

Replace/reskin/destructive operations require a concrete summary and contextual confirmation when implemented. Unknown fields remain unsupported rather than being plausible-looking inputs.

### Reference capability analysis

The product references supplied on 2026-09-22 show a broad third-party service catalogue. They are useful for identifying user journeys and data that the Courier should catalogue, but their remote bot, Patreon, account, and DLL claims are not product requirements. NMS Courier keeps every proposed action behind a selected-build capability gate and a local, evidence-backed runtime adapter.

| Reference journey | Future Courier requirement | Boundary before any action exists |
| --- | --- | --- |
| Creature and egg delivery | Separate creature definitions, transferable eggs, class, affinity, moves, size, parts, and seed fields. Advanced fields require validation. | Egg transfer and creature/entity operations are different workflows. Player limits, size limits, and multiplayer outcomes need direct evidence. |
| Item delivery | Browse actual product, substance, and technology IDs with localized name, description, icon, category, quantity, and stack-limit semantics. | Catalogue availability is not an item-delivery claim. Quantity bounds and recipient context must be proven per build. |
| Rewards and expedition content | Filterable season, expedition, reward-domain, recipe, title, and cosmetic catalogue with explicit scope and side effects. | No bulk “unlock all” action. Each account, save, recipe, or entitlement mutation is independently specified and confirmed. |
| Packaged technology | Technology catalogue, seed format validation, item context, and documented inventory prerequisites. | No result is reported until the game accepts the specific package in the verified context. |
| Customization parts | Grouped Corvette and ship-part definitions with original IDs, display names, images, and compatible groups. | Selecting a part only builds a definition. Placement, fabrication, or delivery needs an independent supported action. |
| Currency | Currency type, exact supported bounds, affected scope, and current value where the runtime can read it. | The UI never presents a generic amount input as a claim that the value was applied. |
| Base library and cloning | Offline base definitions with author/credit metadata, portal position, component options, terrain/electricity flags, and import/export validation. | Never use save editing as a delivery fallback. Imported content remains data until a separately proven live operation exists. |
| Multitools and staff | Visual local catalogue, class/type, seed, and a verified claim or comparison journey. | Variant probability and procedural selection must not be invented. |
| Freighters and frigates | Type, model seed, colour, crew/race, ownership, fleet capacity, and exchange consequences. | A user must see ownership and replacement consequences before a supported operation. |
| Space encounters, NPCs, vehicles, and utilities | Read-only, source-versioned definitions grouped by encounter domain. | No arbitrary spawning interface; each encounter needs its own context, multiplayer, and outcome proof. |
| Quick actions and point-of-interest scan | Curated operations with clear targets, current/nearby-system scope, and an evidence source/freshness indicator. | No command console and no fabricated scan result. |
| Mission catalogue and starter | Local mission records with category, class, type, description, start conditions, cancellation conditions, and compatibility. | Starting a mission needs independent runtime research; a catalogue selection alone never starts one. |
| ByteBeat tracks | Local track definitions, capacity-aware library/import/export, and explicit active-slot status when readable. | Importing a definition does not alter the game until a verified operation exists. |
| Optional runtime extension | A future optional adapter may detect a user-installed, independently audited extension through a versioned manifest and narrow capability contract. | Never download, load, inject, or execute an arbitrary DLL/plugin. The remote “Service Bot Extender” pattern is not adopted. |
| Planet guide and coordinates | Local guide definitions with galaxy, glyph address, filters, evidence date, and clear uncertainty. | Never label a planet “perfect” or imply a remote subscription/account service. |
| Sharing Center | Offline, schema-versioned definition library for supported entity types with provenance and safe import/export. | No default cloud upload, multiplayer bot, hidden execution, or player-data sharing. |
| Ship customizer | Future definition builder that preserves source IDs, parts, colours, decals, seeds, and export metadata. | A visual preview is optional and must not claim seed-accurate rendering without independent validation. |

Long reference pick-lists are a catalogue requirement, not a reason to reproduce their cramped native-select presentation. When the relevant pages are implemented, they need keyboard-accessible search, localization, empty and loading states, and rendered validation at desktop and narrow-window sizes.

## 9. Accessibility and rendered validation

Proposed minimum window: 1024×720, subject to rendered testing. Check common resolutions and Windows 125%/150% scaling. Support keyboard navigation, visible focus, screen-reader labels, dialog titles, invalid-field feedback, and predictable focus return.

Test long translations, absent images, empty results, full error text, connection transitions, and waiting states. Do not depend on color alone to communicate readiness.

Use real Electron screenshots and interactions. Static DOM assertions cannot prove clipping, legibility, scaling, or native window behavior.
