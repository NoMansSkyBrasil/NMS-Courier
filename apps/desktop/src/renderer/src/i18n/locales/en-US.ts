import type { Messages } from '../messages'

export const enUS: Messages = {
  app: { name: 'NMS Courier', tagline: 'Local delivery for No Man’s Sky' },
  sections: { obtain: 'Get a new one', upgrade: 'Upgrade' },
  corvette: {
    title: 'Corvette from a file',
    hint: 'Choose a shared corvette file (.nmsship). The application prepares the game so that corvette building starts with that ship already assembled; you finish it in the game. The game must be restarted after the file is prepared.',
    none: 'No corvette file has been prepared yet.',
    current: 'Prepared: {name}, {count} parts.',
    parts: '{count} parts',
    hullParts: '{count} hull parts',
    missing: 'Without: {parts}. The game shows a warning and still builds it.',
    partCockpit: 'cockpit',
    partLandingGear: 'landing gear',
    partHabitation: 'habitation module',
    partReactor: 'reactor',
    rejectedTitle: 'This file cannot be used',
    rejectedShip:
      'This is an ordinary ship, not a corvette. Ships from a file are not available yet.',
    rejectedInvalid: 'This is not a valid corvette file.',
    installedTitle: 'Corvette prepared',
    installedBody:
      'Close the game if it is open and start it again. Then use "Start corvette build" below.',
    installFailedTitle: 'Could not prepare the corvette',
    installFailed: 'The files could not be written to the game folder.',
    choose: 'Choose file',
    install: 'Prepare in the game'
  },
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
    teleport: {
      title: 'Teleport',
      summary: 'Travel to a star system by galaxy and portal address, without a portal.'
    },
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
      summary: 'See what a seed looks like, or find a seed for the parts you want.'
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
    errorTitle: 'This page stopped working',
    errorReload: 'Reload',
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
    heroBody:
      'Send items, currencies and unlocks to your own running game. Everything goes through the game itself, your saves are never edited, and the names and icons you see here come from your installation.',
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
    notifications: 'Game notifications',
    notificationsHint:
      'Let the game show its own notification for what is delivered, where it has one. Turn off to deliver silently. Inventory upgrades never ask for confirmation.',
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
    shipModel: {
      fighter: 'Fighter',
      hauler: 'Hauler',
      explorer: 'Explorer',
      shuttle: 'Shuttle',
      solar: 'Solar',
      exotic: 'Exotic',
      living: 'Living Ship',
      interceptor: 'Interceptor'
    },
    toolModel: {
      pistol: 'Pistol',
      rifle: 'Rifle',
      experimental: 'Experimental',
      alien: 'Alien',
      staff: 'Staff'
    },
    equipSeedHint: 'Empty draws a random seed.',
    obtainAction: 'Send offer',
    obtainShipHint:
      'The game offers you a new starship of this kind, seed and class on its own screen: add it to your collection, trade your current one or decline.',
    obtainToolHint:
      'The game offers you a new multi-tool of this kind, seed and class on its own screen: add it to your collection, trade your current one or decline.',
    obtainPlanned: 'Getting a new one is not available here yet.',
    equipSceneEmpty: 'No model found.',
    freighterModel: {
      default: 'Chosen by the game',
      regular: 'Freighter',
      small: 'Small freighter',
      tiny: 'Tiny freighter',
      capital: 'Capital freighter',
      pirate: 'Pirate dreadnought'
    },
    equipScene: 'Model',
    equipSceneHint:
      'Optional. The game scene of the freighter model; empty keeps the game’s own choice.',
    equipModelSeed: 'Model seed',
    equipLegacyColours: 'Use legacy colours',
    equipLegacyColoursHint:
      'Marks the multi-tool to use the legacy colours, as the tools the game hands out are. The game has no setting for this in its offer, so the bridge makes the game draw the offer with them and writes the mark on the tool right after you accept it.',
    equipHomeSeed: 'Home system seed',
    currencyAmountHint: 'Any amount from 1 to {max}, the largest balance the game keeps.',
    itemsStack: 'Stack of {count}',
    equipActionLabel: 'Action',
    equipTarget: 'Starship',
    equipTargetCurrent: 'Current starship',
    equipTargetSlot: 'Starship slot {number}',
    equipClass: 'Class',
    equipSlots: 'All inventory slots',
    equipSlotsHint: 'Makes every position of the cargo and technology grids usable.',
    equipToolSlots: 'All technology slots',
    equipToolSlotsHint:
      'Makes every position of the multi-tool’s technology grid usable, already on the offer.',
    equipSupercharge: 'Supercharged slots',
    equipSuperchargeHint: 'Turns every usable technology slot into a supercharged slot.',
    equipExtended: 'Extra technology rows',
    equipExtendedHint: 'Raises the technology grid to twelve rows. Needs all inventory slots.',
    currencyHint:
      'The game’s own reward adds the amount and shows its notification. The balance never passes the game’s maximum.',
    currencyLabel: 'Currency',
    equipAction: {
      slotReward: 'Add one inventory slot',
      grid: 'Apply to inventory',
      classStep: 'Raise class by one step',
      offer: 'Send freighter offer',
      build: 'Start corvette build'
    },
    equipActionHint: {
      slotReward:
        'Asks the game for its own slot reward. The game opens its window so you choose where the new slot goes.',
      grid: 'Changes the inventory you already own, in place. Nothing opens in the game.',
      classStep: 'Asks the game for its own upgrade reward: one class step per request, up to S.',
      offer:
        'The game offers you a freighter with the options below. Accept it in the game; it replaces your current freighter.',
      build: 'The game opens corvette building with the options below.'
    },
    currencyName: { units: 'Units', nanites: 'Nanites', quicksilver: 'Quicksilver' },
    itemsTitle: 'Send items to the game',
    itemsHint:
      'Substances and products go into the exosuit cargo of the loaded save, in stacks of the size the game allows. What does not fit is not sent.',
    itemsAdd: 'Add',
    itemsAmount: 'Amount',
    itemsRemove: 'Remove',
    itemsEmpty: 'Search the catalogue and add the items to send.',
    itemsAction: 'Send items ({count})',
    itemsConfirm:
      'The items are placed in the exosuit cargo of the save that is loaded now. The save folder is backed up first. The change is written to the save when the game saves.',
    selectTitle: 'Choose what to send',
    selectHint: 'Pick one entry, several or all of them. Only the chosen entries are sent.',
    selectSearch: 'Search by name or ID',
    selectAllShown: 'Select all shown',
    selectClear: 'Clear selection',
    selectCount: '{count} selected',
    selectShowing: 'Showing {shown} of {total}. Search to narrow the list.',
    selectAction: 'Send selected ({count})',
    selectNoCatalog:
      'Names appear after the catalogue is read from the game (Library, Game catalogue).',
    selectNone: 'Nothing matches the search.',
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
      currency_data_missing:
        'The currency data file is not in the game’s mod folder, or it is a different version. Nothing was sent.',
      selection_invalid:
        'The selection contains an entry this area does not offer. Nothing was sent.',
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
    versionApp: 'Application version',
    versionBridge: 'Installed bridge version',
    versionNone: 'Not installed',
    versionOld: 'Older, without a version',
    versionCurrent: 'The bridge is up to date.',
    versionOutdated: 'The bridge is out of date. This application comes with bridge {version}.',
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
  teleport: {
    hint: 'The running game makes the journey: it is asked the way its own teleporters ask. You arrive at the space station of the system, or on the planet the first glyph names. Experimental.',
    galaxy: 'Galaxy',
    galaxyHint: 'Every galaxy of the game, by number and name. Type to search.',
    galaxyEmpty: 'No galaxy found.',
    galaxyNumber: 'Galaxy {number}',
    address: 'Portal address',
    addressHint:
      'Twelve glyphs, as digits 0 to F: planet, system, then the three coordinates. Press them or paste the code.',
    erase: 'Erase the last glyph',
    destination: 'Arrive at',
    destinationHint:
      'The space station is the safe choice. The planet uses the first glyph of the address.',
    toStation: 'Space station of the system',
    toPlanet: 'Planet of the address',
    action: 'Teleport',
    confirmBody:
      'You leave where you are now and the game loads the other system. Save first if you want to come back to this exact spot.',
    favourites: 'Saved destinations',
    favouritesHint: 'Kept by this application on this computer; the game does not see them.',
    favouriteName: 'Name of the destination',
    addFavourite: 'Save this address',
    useFavourite: 'Use',
    removeFavourite: 'Remove',
    noFavourites: 'Nothing saved yet.'
  },
  workshop: {
    title: 'Model workshop',
    description:
      'Choose what you want to see, then type a seed, draw a random one, or pick the parts and let the application find a seed that has them.',
    tabBuild: 'Build',
    tabView: 'View a seed',
    buildDescription:
      'Choose the type, the parts, the colours and the textures. The application looks for a seed that has them and shows it.',
    viewDescription:
      'Choose the type and type a seed, or draw a random one, to see what it looks like.',
    colorTitle: 'Colours',
    roles: {
      primary: 'Main colour',
      secondary: 'Second colour',
      decal1: 'Decal colour 1',
      decal2: 'Decal colour 2'
    },
    texturesTitle: 'Textures and decals',
    baseTexture: { COATING: 'Coating', PAINTED: 'Painted', PANELS: 'Metal' },
    seedTexturesTitle: 'Textures and decals of this seed',
    colorHint:
      "Each colour the model takes from the game's palettes. Pick one, then a colour for it; Any leaves it to the seed.",
    seedColorsTitle: 'Colours of this seed',
    paintLabel: 'Paint',
    undercoatLabel: 'Undercoat',
    tabSystem: 'Current system',
    systemDescription:
      'The star system you are in, read from the running game: its seed and the ships the game generated for it. Nothing in the game is changed.',
    systemNone:
      'Nothing to show. The game must be running with bridge 1.8.0 or newer and a save loaded; the list is refreshed every few seconds.',
    systemSeed: 'System seed',
    systemShips: 'Ships of this system',
    systemClass: 'Class',
    systemRole: 'Role',
    systemShipSeed: 'Seed',
    systemView: 'View',
    systemRefresh: 'Refresh',
    systemClassNumber: 'Class {number}',
    systemStream:
      'Checked: the ship seeds are on the number stream of the system seed; the first is drawn after {steps} steps.',
    systemStreamUnknown: 'The ship seeds were not found on the number stream of the system seed.',
    tabFile: 'Model file',
    categoryLabel: 'Category',
    category: { starship: 'Starship', multitool: 'Multi-tool', freighter: 'Freighter' },
    kindLabel: 'Type',
    toolKind: {
      standard: 'Standard',
      royal: 'Royal',
      sentinel: 'Sentinel',
      sentinelB: 'Sentinel B',
      atlasSceptre: 'Atlas Sceptre',
      atlas: 'Atlantid',
      staff: 'Staff',
      staffRuin: 'Pillar of Titan',
      staffBone: 'Basilisk Crown',
      switch: 'Infinite Neon Mark XXII',
      retro: 'Starbound v0.27',
      swarm: 'Direwasp Disintegrator',
      staffNpc: 'NPC staff'
    },
    seedLabel: 'Seed',
    homeSeedHint:
      'A freighter takes its colours from its home star system, and the seed of a system is its address in the galaxy. Type the seed, draw one, or give the portal address of the system below; empty shows the freighter without colours.',
    homeAddress: 'This seed is the system with portal address {glyphs} in galaxy {galaxy}.',
    glyphsLabel: 'Portal address (12 glyphs as 0–9, A–F)',
    galaxyLabel: 'Galaxy number',
    useAddress: 'Use this system',
    legacyColours: 'Use legacy colours',
    legacyColoursHint:
      'The game has two ways to draw the colours of a seed. Multi-tools it hands out use the legacy one; starships are marked one by one in the save (Use Old Colours).',
    seedOrigin:
      'The game draws this seed in the system with portal address {glyphs} in galaxy {galaxy} (after {steps} steps of its number stream). A lead, not a proof.',
    seedHint: 'Sixteen hexadecimal digits after 0x. Press Enter or Show to see it.',
    show: 'Show',
    generate: 'Generate a seed',
    generateWithParts: 'Generate with these parts',
    clearParts: 'Clear parts',
    getInGame: 'Get this one in the game',
    found: 'Seed found after {tries} attempts',
    building: 'Building the model…',
    empty: 'Nothing to show yet',
    partsTitle: 'Parts',
    partsHint:
      'Choose the parts you want and leave the rest on Any. More lists appear under a part that has parts of its own.',
    anyPart: 'Any',
    rare: 'rare',
    detailsTitle: 'Details drawn by the seed',
    note: 'The model is read from your own game files. Parts, texture layers, decals and colours follow the seed; lighting and material effects are simplified, so metal and shading look different from the game. Parts were checked against an independent tool and against one multi-tool bought in the running game; colours are close, not exact.',
    errors: {
      INSTALLATION_NOT_SELECTED: 'Select the game folder first, in Bridge.',
      UNKNOWN_KIND: 'This type is not available.',
      INVALID_SEED: 'The seed must be 0x followed by up to sixteen hexadecimal digits.',
      GAME_FILES_UNREADABLE: 'The game files for this model could not be read.',
      MODEL_TOO_LARGE: 'This model is too large to show.',
      SEED_NOT_FOUND:
        'No seed with these parts was found in time. Try again or leave one part free.'
    }
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
