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
  controls: {
    changeLanguage: 'Change language',
    changeTheme: 'Change theme',
    light: 'Light',
    dark: 'Dark',
    system: 'System'
  }
}
