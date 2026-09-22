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

## 9. Accessibility and rendered validation

Proposed minimum window: 1024×720, subject to rendered testing. Check common resolutions and Windows 125%/150% scaling. Support keyboard navigation, visible focus, screen-reader labels, dialog titles, invalid-field feedback, and predictable focus return.

Test long translations, absent images, empty results, full error text, connection transitions, and waiting states. Do not depend on color alone to communicate readiness.

Use real Electron screenshots and interactions. Static DOM assertions cannot prove clipping, legibility, scaling, or native window behavior.
