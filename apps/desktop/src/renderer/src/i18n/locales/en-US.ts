import type { Messages } from '../messages'

export const enUS: Messages = {
  app: { name: 'NMS Courier', tagline: 'Local delivery for No Man’s Sky' },
  groups: {
    overview: 'Overview',
    deliver: 'Deliver',
    unlock: 'Unlock',
    rewards: 'Rewards',
    library: 'Library',
    system: 'System'
  },
  features: {
    dashboard: { title: 'Dashboard', summary: 'Whether delivery is available right now, and why.' },
    activity: { title: 'Activity', summary: 'Every request sent to the game and its outcome.' },
    items: {
      title: 'Items',
      summary: 'Substances and products placed in an inventory of the loaded save.'
    },
    currencies: { title: 'Currencies', summary: 'Units, nanites and quicksilver.' },
    exosuit: {
      title: 'Exosuit',
      summary: 'Class, cargo and technology slots and supercharged slots of the exosuit.'
    },
    starships: {
      title: 'Starships',
      summary: 'Class, inventory size and supercharged slots of the starship you own.'
    },
    multitools: {
      title: 'Multi-tools',
      summary: 'Class, slots and supercharged slots of the equipped multi-tool.'
    },
    freighters: {
      title: 'Freighters',
      summary: 'A freighter offer with the chosen class, model and seeds.'
    },
    frigates: { title: 'Frigates', summary: 'Recruiting frigates for the fleet.' },
    corvettes: { title: 'Corvettes', summary: 'A corvette built from a shared layout.' },
    companions: { title: 'Companions', summary: 'Companion eggs and creatures.' },
    technologies: {
      title: 'Technologies',
      summary: 'Blueprints the character knows how to install.'
    },
    productRecipes: {
      title: 'Crafting recipes',
      summary: 'Recipes for craftable items and craftable technology.'
    },
    buildParts: {
      title: 'Build parts',
      summary: 'Base, freighter and decoration parts in the build menu.'
    },
    refinerRecipes: {
      title: 'Refiner and cooking',
      summary: 'Refiner and nutrient processor recipes in the catalogue.'
    },
    customisation: {
      title: 'Appearance',
      summary: 'Helmets, armour, capes, banners, jetpack trails and emotes.'
    },
    titles: { title: 'Titles', summary: 'Player titles for the banner.' },
    fishing: { title: 'Fishing record', summary: 'The catch record of every fish.' },
    expeditions: {
      title: 'Expeditions',
      summary: 'Rewards of past expeditions, claimable at the Quicksilver companion.'
    },
    twitch: {
      title: 'Twitch drops',
      summary: 'Twitch campaign rewards, claimable at the Quicksilver companion.'
    },
    platform: {
      title: 'Platform and pre-order',
      summary: 'Rewards tied to a platform, a pre-order or an event.'
    },
    quicksilver: {
      title: 'Quicksilver shop',
      summary: 'Items the Quicksilver companion sells.'
    },
    catalog: { title: 'Game catalogue', summary: 'Search the items of your installed game.' },
    models: {
      title: 'Model workshop',
      summary: 'Preview imported models and colour palettes.'
    },
    bridge: {
      title: 'Game and bridge',
      summary: 'Installation, game build and the connection to the running game.'
    },
    saves: {
      title: 'Saves and account',
      summary: 'Which save slot is loaded and what is shared by the whole account.'
    },
    settings: { title: 'Settings', summary: 'Language, appearance and application details.' }
  },
  status: { verified: 'Verified', experimental: 'Experimental', planned: 'Planned' },
  statusHint: {
    verified: 'Worked in the running game on the research build.',
    experimental: 'Works in part or only under known conditions.',
    planned: 'Not built yet.'
  },
  scope: {
    slot: 'Save slot',
    account: 'Account',
    both: 'Save slot and account',
    none: 'No change'
  },
  scopeHint: {
    slot: 'Changes only the save slot that is loaded.',
    account: 'Changes the account, shared by every save slot.',
    both: 'Changes the loaded save slot and the account.',
    none: 'Reads only; nothing in the game changes.'
  },
  rows: {
    deliverable: 'Delivered',
    blockedDamaged: 'Damaged-slot entries, never delivered',
    blockedMaintenance: 'Maintenance entries, never delivered',
    blockedTemplates: 'Procedural templates, never delivered',
    blockedById: 'Blocked by a permanent rule',
    catalogueItems: 'Craftable items',
    craftableTechnology: 'Craftable technology',
    buildParts: 'Build parts',
    researchTree: 'Sold at research terminals',
    repeatableNever: 'Repeatable purchases, never unlocked',
    missionBound: 'Tied to a mission, skipped',
    redeemedInSave: 'Recorded in the save',
    itemRewards: 'Items to claim in the shop',
    total: 'In the game'
  },
  rules: {
    gameRoutines: 'Everything is done by the running game itself. Save files are never edited.',
    defectiveNever: 'Defective and internal entries are never delivered, in any mode.',
    repeatableNever:
      'Fireworks, the Myth Beacon and the Void Egg are never unlocked: the shop would stop selling them.',
    claimItems:
      'Ships, multi-tools, eggs and packs are unlocked on the account; claim them in the shop to receive the item.',
    keepList:
      'Twitch drops stay claimable only while the bridge is installed. Claim what you want to keep.',
    backup: 'The save folder is copied before every change.',
    slotIdentified: 'The loaded save slot is identified before every delivery.',
    accountShared: 'Account changes reach every save slot and are synchronised by the game.'
  },
  page: {
    availabilityTitle: 'Not available from this window yet',
    availabilityBody:
      'This was done through the research bridge. The connection from this application to the game is still being built, so nothing can be sent from here.',
    includes: 'What it covers',
    includesHint: 'Figures of the research build.',
    rulesTitle: 'How it behaves',
    rulesHint: 'Rules that always apply.',
    entries: 'Entries',
    kind: 'Kind',
    status: 'Status',
    scope: 'Changes',
    researchBuild: 'Research build {build}',
    plannedTitle: 'Not built yet',
    plannedBody: 'This area is planned. It will appear here when it works in the running game.',
    open: 'Open'
  },
  dashboard: {
    game: 'Game',
    build: 'Game build',
    bridge: 'Bridge',
    catalog: 'Catalogue',
    capabilities: 'What Courier can do',
    capabilitiesHint: 'Each area with what it changes and how far it has been proven.',
    feature: 'Area',
    area: 'Group',
    running: 'Running',
    notRunning: 'Not running',
    notSelected: 'No installation selected',
    unknown: 'Unknown',
    supported: 'Supported',
    unsupported: 'Not supported',
    connected: 'Connected',
    notConnected: 'Not connected',
    available: 'Available',
    unavailable: 'Not generated',
    entriesCount: '{count} entries',
    processId: 'Process {id}'
  },
  settings: {
    general: 'General',
    appearance: 'Appearance',
    about: 'About',
    language: 'Language',
    languageHint: 'The fourteen languages of No Man’s Sky.',
    theme: 'Theme',
    themeHint: 'Follows the system by default.',
    experimental: 'Experimental software',
    experimentalBody:
      'NMS Courier is an unofficial tool under development. It works with one exact game build at a time.'
  },
  delivery: {
    title: 'Send to the game',
    hint: 'Uses the research bridge of this development build.',
    action: 'Deliver everything',
    sending: 'Sending…',
    confirmTitle: 'Send this to the running game?',
    confirmSlot:
      'It changes the save slot loaded in the game right now. The save folder is copied first.',
    confirmAccount:
      'It changes your account, shared by every save slot, and the game synchronises it. The save folder and the settings file are copied first.',
    confirm: 'Send',
    cancel: 'Cancel',
    result: 'Result',
    backup: 'Backup: {path}',
    time: 'Time',
    activityEmptyTitle: 'Nothing sent yet',
    activityEmptyBody: 'Deliveries of this session appear here.',
    state: {
      unavailable: 'Only available in a development build.',
      installation_not_selected: 'Select the game installation first.',
      game_not_running: 'Start the game and load a save.',
      bridge_missing: 'The bridge is not installed in the game folder.',
      bridge_untested: 'The installed bridge is not a tested build.',
      ready: 'Ready: game running, process {id}.',
      busy: 'Another delivery is in progress.',
      backup_failed: 'The backup could not be made; nothing was sent.'
    },
    outcome: {
      completed: 'Done',
      unknown: 'Unknown outcome',
      failed: 'Failed',
      refused: 'Not sent'
    },
    outcomeHint: {
      completed: 'The game answered every request. Save in the game to keep it.',
      unknown: 'The game did not answer in time. Do not send it again; check in the game.',
      failed: 'A request was rejected before it reached the game.',
      refused: 'Nothing was sent.'
    }
  },
  bridgePage: {
    detect: 'Detect automatically',
    detecting: 'Searching…',
    detectNone: 'No installation was found. Select the folder yourself.',
    detectSeveral: 'More than one installation was found. Select the one you play.',
    installationTitle: 'Game installation',
    installationSelected: '{name} is selected.',
    installationNone: 'Choose the No Man’s Sky installation folder.',
    installationInvalid: 'The selected folder is not a valid No Man’s Sky installation.',
    select: 'Select installation',
    verifying: 'Verifying…',
    bridgeTitle: 'Research bridge',
    bridgeHint: 'The component inside the game that performs the deliveries.',
    diagnosticsTitle: 'Read-only diagnostics',
    diagnosticsHint:
      'Connects the private runtime host, which has no delivery command. Keep this window open until you close the game.',
    connect: 'Connect read-only runtime',
    starting: 'Starting…',
    diagNotConnected: 'No diagnostic runtime is connected.',
    diagHostReady: 'The runtime host is ready and waiting for the game.',
    diagAuthenticated: 'Handshake completed; waiting for the game callback.',
    diagCallbackReady: 'The read-only callback is active in the game.',
    diagFailed: 'Diagnostics failed ({reason}).',
    diagEnded: 'The diagnostic session ended with the game.'
  },
  catalogPage: {
    generate: 'Read from the game',
    refresh: 'Read again',
    generating: 'Reading the game files…',
    generateHint:
      'The catalogue is read from your own installation. Nothing is changed in the game folder and no save is opened.',
    imported: '{count} entries read from the game.',
    failInstallation: 'Select the game installation first.',
    failArchives: 'The game data files were not found in the selected installation.',
    failStructure:
      'The game was updated and its tables changed. This version of the application cannot read them yet.',
    failUnreadable: 'The game data files could not be read.',
    unavailableTitle: 'The local catalogue is not available',
    unavailableBody: 'No catalogue has been generated in this application profile yet.',
    title: 'Local catalogue',
    description:
      'Read-only definitions extracted from the selected game installation. A result does not mean the item can be delivered.',
    buildBadge: 'Build {build}',
    searchLabel: 'Search the local catalogue',
    searchPlaceholder: 'Search by name or game ID',
    all: 'All',
    substance: 'Substances',
    product: 'Products',
    technology: 'Technologies',
    matching: '{count} matching definitions',
    loading: 'Loading definitions…',
    languages: '{count} game languages'
  },
  preview: {
    title: 'Model workshop',
    description: 'Inspect a local static GLB model and assemble its visible parts.',
    stage: 'Experimental preview',
    import: 'Open GLB model',
    loading: 'Loading model…',
    empty: 'Choose a local model to begin',
    hint: 'Drag to rotate, scroll to zoom, and right-drag to pan.',
    limits:
      'This version accepts static GLB files up to 64 MiB with embedded PNG textures only and no external resources. Native NMS asset conversion is not connected yet.',
    warning:
      'Part selections and tint affect this preview only. They do not calculate a seed or deliver a ship.',
    parts: 'Visible parts',
    all: 'Show all',
    none: 'Hide all',
    filter: 'Filter parts by name',
    tint: 'Preview tint',
    original: 'Restore model colors',
    reset: 'Reset camera',
    palettes: 'Game palettes',
    paletteHelp: 'Open the extracted BASECOLOURPALETTES.MBIN from the supported data set.',
    importPalette: 'Open palette MBIN',
    seed: 'Experimental color seed',
    calculatePalette: 'Calculate color samples',
    calculatedSeed: 'Calculated seed',
    family: 'Palette family',
    samples: 'Five color samples',
    sample: 'Color sample',
    paletteIndex: 'Source color',
    colorTarget: 'Apply to',
    visibleTarget: 'All visible parts',
    applyColor: 'Apply selected color',
    paletteWarning:
      'Experimental base palette calculation. RGB samples recolor parts; they do not predict native texture masks, a ship appearance, or an inverse seed.',
    INVALID_PALETTE: 'This file does not match the supported base palette fingerprint.',
    INVALID_SEED: 'Enter 0x followed by 1–16 hexadecimal digits.',
    PALETTE_UNAVAILABLE: 'Open a supported palette file before calculating colors.',
    failed: 'The model could not be rendered.',
    INVALID_MODEL: 'The file is not a valid model within the preview limits.',
    UNSUPPORTED_MODEL:
      'This model uses textures, animation, extensions, or geometry outside the supported subset.',
    FILE_UNAVAILABLE: 'The selected file could not be read.'
  },
  appearance: {
    title: 'Seed appearance recipe',
    open: 'Open appearance recipe',
    apply: 'Apply recipe to preview',
    help: 'Import a recipe or seed-search report with explicit mesh bindings.',
    warning:
      'Candidate preview: explicit parts and RGB samples only. Native DDS textures, masks and shaders are not reproduced.',
    mismatch: 'The model fingerprint or mesh names do not match. No changes were applied.',
    failed: 'The file could not be read as a supported appearance recipe.',
    seed: 'Candidate seed',
    applied: 'Recipe applied to the preview',
    candidate: 'Partial evaluator candidate'
  },
  controls: {
    changeLanguage: 'Change language',
    changeTheme: 'Change theme',
    light: 'Light',
    dark: 'Dark',
    system: 'System'
  }
}
