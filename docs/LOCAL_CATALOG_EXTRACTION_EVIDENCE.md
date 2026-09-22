# Local catalog extraction evidence

Status: observed against a user-selected local installation; this document does not mark the catalog importer as shipped.

## Observation boundary

The observation ran against the selected No Man's Sky installation on 2026-09-22. It read PAK archives into a private temporary staging directory. It did not modify the game directory, create a mod, read a save, attach to the game process, or perform a delivery action.

No website, API, community dataset, or downloaded catalog supplied the catalog values. Temporary archive and converter tools were used only to decode files already present in the selected installation. Those temporary tools and their output are excluded from the repository and are not an end-user distribution decision.

## Build fingerprint

| Field | Observed value |
| --- | --- |
| Executable product version | `179666` |
| Executable SHA-256 | `b7913f268dfc62386b6b68f524bfc8ade4a44a9f4fbad39085b7bf51be3680cb` |
| Archive inventory | 97 PAK archives, 194,622 indexed entries |
| Indexed MBIN files | 81,784 |

The fingerprint is evidence for this local observation only. A future importer must create a new generation whenever the selected installation fingerprint changes.

## Extracted catalog candidates

The staging pass identified and copied 112 structured source tables for conversion, without copying models, textures, audio, or save data:

| Source group | Count | Examples of represented data |
| --- | ---: | --- |
| Reality tables | 55 | Substances, products, technologies, recipes, reward tables, expedition events and rewards, buildable parts, fishing, frigates, seasonal and Twitch unlocks |
| Entitlement tables | 7 | Entitlement rewards and platform entitlement lists |
| Game-state tables | 35 | Default seasonal data, stat rewards, milestones, player customization, inventory balance and difficulty definitions |
| Reality metadata | 15 | Catalogue groups, crafting/material catalogues, journey and wiki metadata |

The three core definition tables alone produced a private local snapshot containing 2,706 entries: 114 substances, 2,199 products, and 393 technologies. Entries retain the native Game ID, table provenance, and resolved `pt-BR`, `en-US`, and `es-ES` fields from local language data. For example, `substance:FUEL1` resolves to Carbon in all three localizations with their native subtitles and descriptions.

## What remains before publication

This is an extraction observation, not complete catalog support. The application still needs a pinned, bundled extractor and build-matched converter; a parser for every discovered table; relation extraction for recipes and rewards; coverage accounting; SQLite publication; and automated tests with permitted fixture data. Tables that take unusually long to convert must be handled with explicit size and timeout limits so a refresh stays responsive and reports the affected source instead of hanging.

The importer must keep platform-specific tables separated, preserve unknown fields with their source locators, and distinguish data found in the current installation from season availability or entitlement ownership. A listed reward is never evidence that it can be granted or claimed.
