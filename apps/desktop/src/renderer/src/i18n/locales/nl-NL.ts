import type { Messages } from '../messages'

export const nlNL: Messages = {
  app: { name: 'NMS Courier', tagline: 'Lokale levering voor No Man’s Sky' },
  groups: {
    overview: 'Overzicht',
    deliver: 'Leveren',
    unlock: 'Ontgrendelen',
    rewards: 'Beloningen',
    library: 'Bibliotheek',
    system: 'Systeem'
  },
  features: {
    dashboard: {
      title: 'Dashboard',
      summary: 'Of leveren nu mogelijk is, en waarom.'
    },
    activity: {
      title: 'Activiteit',
      summary: 'Elk verzoek dat naar het spel is gestuurd en de uitkomst ervan.'
    },
    items: {
      title: 'Voorwerpen',
      summary: 'Stoffen en producten die in een inventaris van de geladen save worden geplaatst.'
    },
    currencies: { title: 'Valuta', summary: 'Units, nanieten en kwikzilver.' },
    exosuit: {
      title: 'Exopak',
      summary: 'Klasse, vracht- en technologievakken en superlaadvakken van het exopak.'
    },
    starships: {
      title: 'Ruimteschepen',
      summary: 'Klasse, inventarisgrootte en superlaadvakken van het ruimteschip dat je bezit.'
    },
    multitools: {
      title: 'Multitools',
      summary: 'Klasse, vakken en superlaadvakken van de uitgeruste multitool.'
    },
    freighters: {
      title: 'Vrachtschepen',
      summary: 'Een vrachtschipaanbod met de gekozen klasse, het gekozen model en de gekozen seeds.'
    },
    frigates: { title: 'Fregatten', summary: 'Fregatten werven voor de vloot.' },
    corvettes: {
      title: 'Korvetten',
      summary: 'Een korvet gebouwd op basis van een gedeeld ontwerp.'
    },
    companions: { title: 'Metgezellen', summary: 'Metgezeleieren en wezens.' },
    technologies: {
      title: 'Technologieën',
      summary: 'Blauwdrukken die het personage kan installeren.'
    },
    productRecipes: {
      title: 'Maakrecepten',
      summary: 'Recepten voor maakbare voorwerpen en maakbare technologie.'
    },
    buildParts: {
      title: 'Bouwonderdelen',
      summary: 'Basis-, vrachtschip- en decoratieonderdelen in het bouwmenu.'
    },
    refinerRecipes: {
      title: 'Raffineren en koken',
      summary: 'Recepten van de raffinaderij en de voedingsprocessor in de catalogus.'
    },
    customisation: {
      title: 'Uiterlijk',
      summary: 'Helmen, pantsers, capes, banieren, jetpacksporen en gebaren.'
    },
    titles: { title: 'Titels', summary: 'Spelerstitels voor de banier.' },
    fishing: { title: 'Visrecords', summary: 'Het vangstrecord van elke vis.' },
    expeditions: {
      title: 'Expedities',
      summary: 'Beloningen van eerdere expedities, op te halen bij de kwikzilvermetgezel.'
    },
    twitch: {
      title: 'Twitch-drops',
      summary: 'Beloningen van Twitch-campagnes, op te halen bij de kwikzilvermetgezel.'
    },
    platform: {
      title: 'Platform en pre-order',
      summary: 'Beloningen die aan een platform, een pre-order of een evenement zijn gekoppeld.'
    },
    quicksilver: {
      title: 'Kwikzilverwinkel',
      summary: 'Voorwerpen die de kwikzilvermetgezel verkoopt.'
    },
    catalog: {
      title: 'Spelcatalogus',
      summary: 'Doorzoek de voorwerpen van je geïnstalleerde spel.'
    },
    models: {
      title: 'Modelwerkplaats',
      summary: 'Bekijk geïmporteerde modellen en kleurenpaletten.'
    },
    bridge: {
      title: 'Spel en brug',
      summary: 'Installatie, spelversie en de verbinding met het draaiende spel.'
    },
    saves: {
      title: 'Saves en account',
      summary: 'Welk saveslot geladen is en wat door het hele account wordt gedeeld.'
    },
    settings: { title: 'Instellingen', summary: 'Taal, uiterlijk en details van de applicatie.' }
  },
  status: { verified: 'Geverifieerd', experimental: 'Experimenteel', planned: 'Gepland' },
  statusHint: {
    verified: 'Werkte in het draaiende spel op de onderzoeksversie.',
    experimental: 'Werkt gedeeltelijk of alleen onder bekende omstandigheden.',
    planned: 'Nog niet gebouwd.'
  },
  scope: {
    slot: 'Saveslot',
    account: 'Account',
    both: 'Saveslot en account',
    none: 'Geen wijziging'
  },
  scopeHint: {
    slot: 'Wijzigt alleen het geladen saveslot.',
    account: 'Wijzigt het account, dat door elk saveslot wordt gedeeld.',
    both: 'Wijzigt het geladen saveslot en het account.',
    none: 'Alleen lezen; in het spel verandert niets.'
  },
  rows: {
    deliverable: 'Geleverd',
    blockedDamaged: 'Items van beschadigde vakken, nooit geleverd',
    blockedMaintenance: 'Onderhoudsitems, nooit geleverd',
    blockedTemplates: 'Procedurele sjablonen, nooit geleverd',
    blockedById: 'Geblokkeerd door een vaste regel',
    catalogueItems: 'Maakbare voorwerpen',
    craftableTechnology: 'Maakbare technologie',
    buildParts: 'Bouwonderdelen',
    researchTree: 'Verkocht bij onderzoeksterminals',
    repeatableNever: 'Herhaalbare aankopen, nooit ontgrendeld',
    missionBound: 'Gebonden aan een missie, overgeslagen',
    redeemedInSave: 'Vastgelegd in de save',
    itemRewards: 'Voorwerpen om in de winkel op te halen',
    total: 'In het spel'
  },
  rules: {
    gameRoutines:
      'Alles wordt door het draaiende spel zelf gedaan. Savebestanden worden nooit bewerkt.',
    defectiveNever: 'Defecte en interne items worden nooit geleverd, in geen enkele modus.',
    repeatableNever:
      'Vuurwerk, het Mythebaken en het Leegte-ei worden nooit ontgrendeld: de winkel zou ze niet meer verkopen.',
    claimItems:
      'Schepen, multitools, eieren en pakketten worden op het account ontgrendeld; haal ze op in de winkel om het voorwerp te krijgen.',
    keepList:
      'Twitch-drops blijven alleen ophaalbaar zolang de brug is geïnstalleerd. Haal op wat je wilt houden.',
    backup: 'De savemap wordt vóór elke wijziging gekopieerd.',
    slotIdentified: 'Het geladen saveslot wordt vóór elke levering vastgesteld.',
    accountShared:
      'Accountwijzigingen bereiken elk saveslot en worden door het spel gesynchroniseerd.'
  },
  page: {
    availabilityTitle: 'Nog niet beschikbaar vanuit dit venster',
    availabilityBody:
      'Dit is gedaan via de onderzoeksbrug. De verbinding van deze applicatie met het spel wordt nog gebouwd, dus vanaf hier kan niets worden verzonden.',
    includes: 'Wat het omvat',
    includesHint: 'Cijfers van de onderzoeksversie.',
    rulesTitle: 'Hoe het zich gedraagt',
    rulesHint: 'Regels die altijd gelden.',
    entries: 'Items',
    kind: 'Soort',
    status: 'Status',
    scope: 'Wijzigt',
    researchBuild: 'Onderzoeksversie {build}',
    plannedTitle: 'Nog niet gebouwd',
    plannedBody:
      'Dit onderdeel is gepland. Het verschijnt hier zodra het in het draaiende spel werkt.',
    open: 'Openen'
  },
  dashboard: {
    game: 'Spel',
    build: 'Spelversie',
    bridge: 'Brug',
    catalog: 'Catalogus',
    capabilities: 'Wat Courier kan',
    capabilitiesHint: 'Elk onderdeel, wat het wijzigt en hoe ver het is aangetoond.',
    feature: 'Onderdeel',
    area: 'Groep',
    running: 'Actief',
    notRunning: 'Gesloten',
    notSelected: 'Geen installatie geselecteerd',
    unknown: 'Onbekend',
    supported: 'Ondersteund',
    unsupported: 'Niet ondersteund',
    connected: 'Verbonden',
    notConnected: 'Niet verbonden',
    available: 'Beschikbaar',
    unavailable: 'Niet gegenereerd',
    entriesCount: '{count} items',
    processId: 'Proces {id}'
  },
  settings: {
    general: 'Algemeen',
    appearance: 'Weergave',
    about: 'Over',
    language: 'Taal',
    languageHint: 'De veertien talen van No Man’s Sky.',
    theme: 'Thema',
    themeHint: 'Volgt standaard het systeem.',
    experimental: 'Experimentele software',
    experimentalBody:
      'NMS Courier is een onofficieel hulpmiddel in ontwikkeling. Het werkt met één exacte spelversie tegelijk.'
  },
  controls: {
    changeLanguage: 'Taal wijzigen',
    changeTheme: 'Thema wijzigen',
    light: 'Licht',
    dark: 'Donker',
    system: 'Systeem'
  }
}
