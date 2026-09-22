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

## Observed language parity

The local language archives expose 17 distinct game language identifiers. The application language selector must offer this exact set, and catalog extraction must retain the matching source identifier instead of treating the UI locale code as game data.

| Application locale | Game language identifier |
| --- | --- |
| `en-US` | `usenglish` |
| `en-GB` | `english` |
| `pt-BR` | `brazilianportuguese` |
| `nl-NL` | `dutch` |
| `fr-FR` | `french` |
| `de-DE` | `german` |
| `it-IT` | `italian` |
| `ja-JP` | `japanese` |
| `ko-KR` | `korean` |
| `es-419` | `latinamericanspanish` |
| `pl-PL` | `polish` |
| `pt-PT` | `portuguese` |
| `ru-RU` | `russian` |
| `zh-CN` | `simplifiedchinese` |
| `es-ES` | `spanish` |
| `zh-CN-tencent` | `tencentchinese` |
| `zh-TW` | `traditionalchinese` |

The application selector preserves all 17 game languages. The application shell currently has authored copy for `pt-BR`, `en-US`, and `es-ES`; remaining shell-copy translations are a separate localization task and must not block catalog resolution. The generated local catalogue now resolves the corresponding game-language values for every supported locale.

## Extracted catalog candidates

The staging pass identified and copied 112 structured source tables for conversion, without copying models, textures, audio, or save data:

| Source group | Count | Examples of represented data |
| --- | ---: | --- |
| Reality tables | 55 | Substances, products, technologies, recipes, reward tables, expedition events and rewards, buildable parts, fishing, frigates, seasonal and Twitch unlocks |
| Entitlement tables | 7 | Entitlement rewards and platform entitlement lists |
| Game-state tables | 35 | Default seasonal data, stat rewards, milestones, player customization, inventory balance and difficulty definitions |
| Reality metadata | 15 | Catalogue groups, crafting/material catalogues, journey and wiki metadata |

The three core definition tables alone produced a private local snapshot containing 2,706 entries: 114 substances, 2,199 products, and 393 technologies. Entries retain the native Game ID, table provenance, and resolved name, subtitle, and description fields for all 17 local game languages. The generated `localizations/` directory has one pretty-formatted JSON export per locale; the core and title catalogue files are also pretty-formatted rather than single-line JSON.

The player-title definition table contains 346 entries in this build. Each staged title record retains its Game ID, title key, localized title and unlock text for all 17 local game languages, and explicit unlock references such as a stat, mission, trophy, product recipe, or prerequisite title. A title record is catalog data only; it does not represent ownership or eligibility on a player account.

For manual review, the application data generation contains a non-versioned local `source-index.json`, `core-catalog.json`, and `titles-catalog.json`. These are generated from the selected installation and intentionally remain outside the repository. The source index currently lists 119 extracted structured files, including reality tables, entitlements, game-state metadata, and reality metadata. The production importer must create equivalent versioned artifacts atomically and add coverage for every discovered structured table.

## What remains before publication

This is an extraction observation, not complete catalog support. The application still needs a pinned, bundled extractor and build-matched converter; a parser for every discovered table; relation extraction for recipes and rewards; coverage accounting; SQLite publication; and automated tests with permitted fixture data. Tables that take unusually long to convert must be handled with explicit size and timeout limits so a refresh stays responsive and reports the affected source instead of hanging.

The importer must keep platform-specific tables separated, preserve unknown fields with their source locators, and distinguish data found in the current installation from season availability or entitlement ownership. A listed reward is never evidence that it can be granted or claimed.
