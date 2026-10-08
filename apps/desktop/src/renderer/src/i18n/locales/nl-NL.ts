import type { Messages } from '../messages'

export const nlNL: Messages = {
  app: { name: 'NMS Courier', tagline: 'Lokale levering voor No Man’s Sky' },
  sections: { obtain: 'Nieuw verkrijgen', upgrade: 'Verbeteren' },
  corvette: {
    title: 'Korvet uit een bestand',
    hint: 'Kies een gedeeld korvetbestand (.nmsship). De applicatie bereidt het spel voor zodat de korvetbouw begint met dat schip al in elkaar gezet; je rondt het af in het spel. Het spel moet opnieuw worden gestart nadat het bestand is voorbereid.',
    none: 'Er is nog geen korvetbestand voorbereid.',
    current: 'Voorbereid: {name}, {count} onderdelen.',
    parts: '{count} onderdelen',
    hullParts: '{count} rompdelen',
    missing: 'Zonder: {parts}. Het spel toont een waarschuwing en bouwt het toch.',
    partCockpit: 'cockpit',
    partLandingGear: 'landingsgestel',
    partHabitation: 'woonmodule',
    partReactor: 'reactor',
    rejectedTitle: 'Dit bestand kan niet worden gebruikt',
    rejectedShip:
      'Dit is een gewoon schip, geen korvet. Schepen uit een bestand zijn nog niet beschikbaar.',
    rejectedInvalid: 'Dit is geen geldig korvetbestand.',
    installedTitle: 'Korvet voorbereid',
    installedBody:
      'Sluit het spel als het open is en start het opnieuw. Gebruik daarna hieronder "Korvetbouw starten".',
    installFailedTitle: 'De korvet kon niet worden voorbereid',
    installFailed: 'De bestanden konden niet naar de spelmap worden geschreven.',
    choose: 'Bestand kiezen',
    install: 'Voorbereiden in het spel'
  },
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
      summary: 'Bekijk hoe een seed eruitziet of zoek een seed voor de onderdelen die je wilt.'
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
    errorTitle: 'Deze pagina werkt niet meer',
    errorReload: 'Opnieuw laden',
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
    heroBody:
      'Stuur voorwerpen, valuta en ontgrendelingen naar je eigen draaiende spel. Alles loopt via het spel zelf, je opgeslagen spellen worden nooit bewerkt, en de namen en pictogrammen die je hier ziet komen uit je eigen installatie.',
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
    notifications: 'Meldingen van het spel',
    notificationsHint:
      'Laat het spel zijn eigen melding tonen voor wat wordt geleverd, als die er is. Schakel uit om stil te leveren. Inventarisuitbreidingen vragen nooit om bevestiging.',
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
  delivery: {
    shipModel: {
      fighter: 'Jager',
      hauler: 'Transportschip',
      explorer: 'Verkenner',
      shuttle: 'Shuttle',
      solar: 'Solaire',
      exotic: 'Exotisch',
      living: 'Levend schip',
      interceptor: 'Interceptor'
    },
    toolModel: {
      pistol: 'Pistool',
      rifle: 'Geweer',
      experimental: 'Experimenteel',
      alien: 'Buitenaards',
      staff: 'Staf'
    },
    equipSeedHint: 'Leeg trekt een willekeurige seed.',
    obtainAction: 'Aanbod verzenden',
    obtainShipHint:
      'Het spel biedt je op zijn eigen scherm een nieuw sterrenschip van dit type, deze seed en deze klasse aan: voeg het toe aan je verzameling, ruil je huidige in of weiger.',
    obtainToolHint:
      'Het spel biedt je op zijn eigen scherm een nieuwe multi-tool van dit type, deze seed en deze klasse aan: voeg hem toe aan je verzameling, ruil je huidige in of weiger.',
    obtainPlanned: 'Een nieuwe verkrijgen is hier nog niet mogelijk.',
    equipSceneEmpty: 'Geen model gevonden.',
    freighterModel: {
      default: 'Gekozen door het spel',
      regular: 'Vrachtschip',
      small: 'Klein vrachtschip',
      tiny: 'Piepklein vrachtschip',
      capital: 'Kapitaal vrachtschip',
      pirate: 'Piratendreadnought'
    },
    equipScene: 'Model',
    equipSceneHint:
      'Optioneel. De spelscène van het vrachtschipmodel; leeg behoudt de keuze van het spel.',
    equipModelSeed: 'Modelseed',
    equipHomeSeed: 'Seed van het thuissysteem',
    currencyAmountHint: 'Elk bedrag van 1 tot {max}, het grootste saldo dat het spel bijhoudt.',
    itemsStack: 'Stapel van {count}',
    equipActionLabel: 'Actie',
    equipTarget: 'Sterrenschip',
    equipTargetCurrent: 'Huidig sterrenschip',
    equipTargetSlot: 'Sterrenschip in plek {number}',
    equipClass: 'Klasse',
    equipSlots: 'Alle inventarisvakken',
    equipSlotsHint: 'Maakt elke positie van de vracht- en technologierasters bruikbaar.',
    equipSupercharge: 'Supergeladen vakken',
    equipSuperchargeHint: 'Maakt van elk bruikbaar technologievak een supergeladen vak.',
    equipExtended: 'Extra technologierijen',
    equipExtendedHint:
      'Breidt het technologieraster uit naar twaalf rijen. Vereist alle inventarisvakken.',
    currencyHint:
      'De beloning van het spel zelf voegt het bedrag toe en toont de melding. Het saldo komt nooit boven het maximum van het spel.',
    currencyLabel: 'Valuta',
    equipAction: {
      slotReward: 'Eén inventarisvak toevoegen',
      grid: 'Toepassen op inventaris',
      classStep: 'Klasse één stap verhogen',
      offer: 'Vrachtschipaanbod verzenden',
      build: 'Korvetbouw starten'
    },
    equipActionHint: {
      slotReward:
        'Vraagt het spel om zijn eigen vakbeloning. Het spel opent het venster zodat je kiest waar het nieuwe vak komt.',
      grid: 'Wijzigt de inventaris die je al hebt, ter plekke. Er wordt niets geopend in het spel.',
      classStep:
        'Vraagt het spel om zijn eigen upgradebeloning: één klassestap per verzoek, tot S.',
      offer:
        'Het spel biedt je een vrachtschip aan met de onderstaande opties. Accepteer het in het spel; het vervangt je huidige vrachtschip.',
      build: 'Het spel opent de korvetbouw met de onderstaande opties.'
    },
    currencyName: { units: 'Units', nanites: 'Nanieten', quicksilver: 'Kwikzilver' },
    itemsTitle: 'Voorwerpen naar het spel sturen',
    itemsHint:
      'Stoffen en producten gaan naar de vracht van het exopak van het geladen spel, in stapels van de grootte die het spel toestaat. Wat niet past, wordt niet verzonden.',
    itemsAdd: 'Toevoegen',
    itemsAmount: 'Aantal',
    itemsRemove: 'Verwijderen',
    itemsEmpty: 'Zoek in de catalogus en voeg de te verzenden voorwerpen toe.',
    itemsAction: 'Voorwerpen verzenden ({count})',
    itemsConfirm:
      'De voorwerpen worden in de vracht van het exopak van het nu geladen spel geplaatst. Eerst wordt een back-up van de map met opgeslagen spellen gemaakt. De wijziging wordt opgeslagen wanneer het spel opslaat.',
    selectTitle: 'Kies wat er wordt verzonden',
    selectHint: 'Vink één item, meerdere of alle aan. Alleen de gekozen items worden verzonden.',
    selectSearch: 'Zoeken op naam of ID',
    selectAllShown: 'Alle getoonde selecteren',
    selectClear: 'Selectie wissen',
    selectCount: '{count} geselecteerd',
    selectShowing: '{shown} van {total} getoond. Gebruik de zoekfunctie om de lijst te verkleinen.',
    selectAction: 'Geselecteerde verzenden ({count})',
    selectNoCatalog:
      'Namen verschijnen nadat de catalogus uit het spel is gelezen (Bibliotheek, Spelcatalogus).',
    selectNone: 'Niets komt overeen met de zoekopdracht.',
    title: 'Naar het spel sturen',
    hint: 'Gebruikt de onderzoeksbrug van deze ontwikkelversie.',
    action: 'Alles leveren',
    sending: 'Bezig met verzenden…',
    confirmTitle: 'Dit naar het draaiende spel sturen?',
    confirmSlot:
      'Het wijzigt het saveslot dat nu in het spel is geladen. De savemap wordt eerst gekopieerd.',
    confirmAccount:
      'Het wijzigt je account, dat door elk saveslot wordt gedeeld, en het spel synchroniseert het. De savemap en het instellingenbestand worden eerst gekopieerd.',
    confirm: 'Verzenden',
    cancel: 'Annuleren',
    result: 'Resultaat',
    backup: 'Back-up: {path}',
    time: 'Tijd',
    activityEmptyTitle: 'Nog niets verzonden',
    activityEmptyBody: 'Leveringen van deze sessie verschijnen hier.',
    state: {
      currency_data_missing:
        'Het valutagegevensbestand staat niet in de modmap van het spel of is van een andere versie. Er is niets verzonden.',
      selection_invalid:
        'De selectie bevat een item dat dit onderdeel niet aanbiedt. Er is niets verzonden.',
      unavailable: 'Alleen beschikbaar in een ontwikkelversie.',
      installation_not_selected: 'Selecteer eerst de spelinstallatie.',
      game_not_running: 'Start het spel en laad een save.',
      bridge_missing: 'De brug is niet geïnstalleerd in de spelmap.',
      bridge_untested: 'De geïnstalleerde brug is geen geteste versie.',
      ready: 'Gereed: spel actief, proces {id}.',
      busy: 'Er is al een levering bezig.',
      backup_failed: 'De back-up kon niet worden gemaakt; er is niets verzonden.'
    },
    outcome: {
      completed: 'Klaar',
      unknown: 'Uitkomst onbekend',
      failed: 'Mislukt',
      refused: 'Niet verzonden'
    },
    outcomeHint: {
      completed: 'Het spel heeft elk verzoek beantwoord. Sla op in het spel om het te behouden.',
      unknown: 'Het spel antwoordde niet op tijd. Stuur het niet opnieuw; controleer in het spel.',
      failed: 'Een verzoek is geweigerd voordat het het spel bereikte.',
      refused: 'Er is niets verzonden.'
    }
  },
  bridgePage: {
    versionApp: 'Versie van de applicatie',
    versionBridge: 'Versie van de geïnstalleerde brug',
    versionNone: 'Niet geïnstalleerd',
    versionOld: 'Ouder, zonder versie',
    versionCurrent: 'De brug is bijgewerkt.',
    versionOutdated: 'De brug is verouderd. Deze applicatie bevat brug {version}.',
    detect: 'Automatisch detecteren',
    detecting: 'Bezig met zoeken…',
    detectNone: 'Er is geen installatie gevonden. Selecteer de map zelf.',
    detectSeveral:
      'Er is meer dan één installatie gevonden. Selecteer de installatie waarmee je speelt.',
    installationTitle: 'Spelinstallatie',
    installationSelected: '{name} is geselecteerd.',
    installationNone: 'Kies de installatiemap van No Man’s Sky.',
    installationInvalid: 'De geselecteerde map is geen geldige installatie van No Man’s Sky.',
    select: 'Installatie selecteren',
    verifying: 'Bezig met controleren…',
    bridgeTitle: 'Onderzoeksbrug',
    bridgeHint: 'Het onderdeel in het spel dat de leveringen uitvoert.',
    diagnosticsTitle: 'Alleen-lezen diagnose',
    diagnosticsHint:
      'Verbindt de privé-runtimehost, die geen leveropdracht heeft. Houd dit venster open tot je het spel sluit.',
    connect: 'Alleen-lezen runtime verbinden',
    starting: 'Bezig met starten…',
    diagNotConnected: 'Geen diagnoseruntime verbonden.',
    diagHostReady: 'De runtimehost is gereed en wacht op het spel.',
    diagAuthenticated: 'Handshake voltooid; wachten op de callback van het spel.',
    diagCallbackReady: 'De alleen-lezen callback is actief in het spel.',
    diagFailed: 'Diagnose mislukt ({reason}).',
    diagEnded: 'De diagnosesessie is met het spel beëindigd.'
  },
  catalogPage: {
    generate: 'Uit het spel lezen',
    refresh: 'Opnieuw lezen',
    generating: 'Spelbestanden worden gelezen…',
    generateHint:
      'De catalogus wordt uit je eigen installatie gelezen. Er wordt niets gewijzigd in de spelmap en er wordt geen opgeslagen spel geopend.',
    imported: '{count} items uit het spel gelezen.',
    failInstallation: 'Selecteer eerst de installatie van het spel.',
    failArchives:
      'De gegevensbestanden van het spel zijn niet gevonden in de geselecteerde installatie.',
    failStructure:
      'Het spel is bijgewerkt en de tabellen zijn veranderd. Deze versie van de applicatie kan ze nog niet lezen.',
    failUnreadable: 'De gegevensbestanden van het spel konden niet worden gelezen.',
    unavailableTitle: 'De lokale catalogus is niet beschikbaar',
    unavailableBody: 'In dit applicatieprofiel is nog geen catalogus gegenereerd.',
    title: 'Lokale catalogus',
    description:
      'Alleen-lezen definities uit de geselecteerde spelinstallatie. Een resultaat betekent niet dat het voorwerp geleverd kan worden.',
    buildBadge: 'Versie {build}',
    searchLabel: 'Zoeken in de lokale catalogus',
    searchPlaceholder: 'Zoek op naam of spel-ID',
    all: 'Alles',
    substance: 'Stoffen',
    product: 'Producten',
    technology: 'Technologieën',
    matching: '{count} overeenkomende definities',
    loading: 'Definities laden…',
    languages: '{count} speltalen'
  },
  workshop: {
    title: 'Modelwerkplaats',
    description:
      'Kies wat je wilt zien en typ dan een seed, trek er een willekeurig of kies de onderdelen en laat de toepassing een seed zoeken die ze heeft.',
    tabBuild: 'Samenstellen',
    tabView: 'Seed bekijken',
    buildDescription:
      'Kies het type, de onderdelen en de hoofdkleur. De toepassing zoekt een seed die ze heeft en toont die.',
    viewDescription:
      'Kies het type en typ een seed, of trek er een willekeurig, om te zien hoe die eruitziet.',
    colorTitle: 'Hoofdkleur van de lak',
    colorHint: 'De kleuren van het lakpalet van het spel. Willekeurig laat de keuze aan de seed.',
    seedColorsTitle: 'Kleuren van deze seed',
    paintLabel: 'Lak',
    undercoatLabel: 'Grondlaag',
    tabFile: 'Modelbestand',
    categoryLabel: 'Categorie',
    category: { starship: 'Sterrenschip', multitool: 'Multi-tool', freighter: 'Vrachtschip' },
    kindLabel: 'Type',
    toolKind: {
      standard: 'Standaard',
      royal: 'Koninklijk',
      sentinel: 'Sentinel',
      sentinelB: 'Sentinel B',
      atlasSceptre: 'Atlas-scepter',
      atlas: 'Atlas',
      staff: 'Staf'
    },
    seedLabel: 'Seed',
    seedHint: 'Zestien hexadecimale cijfers na 0x. Druk op Enter of Tonen om hem te zien.',
    show: 'Tonen',
    generate: 'Seed genereren',
    generateWithParts: 'Genereren met deze onderdelen',
    clearParts: 'Onderdelen wissen',
    getInGame: 'Deze in het spel krijgen',
    found: 'Seed gevonden na {tries} pogingen',
    building: 'Model wordt opgebouwd…',
    empty: 'Nog niets om te tonen',
    partsTitle: 'Onderdelen',
    partsHint:
      'Kies de onderdelen die je wilt en laat de rest op Willekeurig. Onder een onderdeel met eigen onderdelen verschijnen meer lijsten.',
    anyPart: 'Willekeurig',
    rare: 'zeldzaam',
    detailsTitle: 'Details die de seed heeft getrokken',
    note: 'Het model wordt uit je eigen spelbestanden gelezen. De vorm volgt de seed. Kleuren worden alleen voor gelakte sterrenschepen getoond en zijn bij benadering: de texturen en stickers van het spel worden nog niet getekend. Niets hiervan is al seed voor seed met het spel vergeleken.',
    errors: {
      INSTALLATION_NOT_SELECTED: 'Selecteer eerst de spelmap, bij Brug.',
      UNKNOWN_KIND: 'Dit type is niet beschikbaar.',
      INVALID_SEED: 'De seed moet 0x zijn, gevolgd door hoogstens zestien hexadecimale cijfers.',
      GAME_FILES_UNREADABLE: 'De spelbestanden van dit model konden niet worden gelezen.',
      MODEL_TOO_LARGE: 'Dit model is te groot om te tonen.',
      SEED_NOT_FOUND:
        'Er is niet op tijd een seed met deze onderdelen gevonden. Probeer het opnieuw of laat een onderdeel vrij.'
    }
  },
  preview: {
    title: 'Modelwerkplaats',
    description: 'Bekijk een lokaal statisch GLB-model en stel de zichtbare onderdelen samen.',
    stage: 'Experimentele voorvertoning',
    import: 'GLB-model openen',
    loading: 'Model laden…',
    empty: 'Kies een lokaal model om te beginnen',
    hint: 'Sleep om te draaien, scrol om te zoomen en sleep met de rechtermuisknop om te verschuiven.',
    limits:
      'Deze versie accepteert statische GLB-bestanden tot 64 MiB, alleen met ingesloten PNG-texturen en zonder externe bronnen. De native conversie van NMS-assets is nog niet aangesloten.',
    warning:
      'Onderdeelkeuzes en tint gelden alleen voor deze voorvertoning. Ze berekenen geen seed en leveren geen schip.',
    parts: 'Zichtbare onderdelen',
    all: 'Alles tonen',
    none: 'Alles verbergen',
    filter: 'Onderdelen filteren op naam',
    tint: 'Tint van de voorvertoning',
    original: 'Modelkleuren herstellen',
    reset: 'Camera herstellen',
    palettes: 'Spelpaletten',
    paletteHelp: 'Open de uitgepakte BASECOLOURPALETTES.MBIN uit de ondersteunde gegevensset.',
    importPalette: 'Paletten-MBIN openen',
    seed: 'Experimentele kleurseed',
    calculatePalette: 'Kleurmonsters berekenen',
    calculatedSeed: 'Berekende seed',
    family: 'Paletfamilie',
    samples: 'Vijf kleurmonsters',
    sample: 'Kleurmonster',
    paletteIndex: 'Bronkleur',
    colorTarget: 'Toepassen op',
    visibleTarget: 'Alle zichtbare onderdelen',
    applyColor: 'Geselecteerde kleur toepassen',
    paletteWarning:
      'Experimentele berekening van het basispalet. RGB-monsters kleuren onderdelen opnieuw; ze voorspellen geen native textuurmaskers, geen uiterlijk van een schip en geen omgekeerde seed.',
    INVALID_PALETTE:
      'Dit bestand komt niet overeen met de vingerafdruk van het ondersteunde basispalet.',
    INVALID_SEED: 'Voer 0x in, gevolgd door 1 tot 16 hexadecimale cijfers.',
    PALETTE_UNAVAILABLE: 'Open een ondersteund paletbestand voordat je kleuren berekent.',
    failed: 'Het model kon niet worden weergegeven.',
    INVALID_MODEL: 'Het bestand is geen geldig model binnen de grenzen van de voorvertoning.',
    UNSUPPORTED_MODEL:
      'Dit model gebruikt texturen, animatie, extensies of geometrie buiten de ondersteunde subset.',
    FILE_UNAVAILABLE: 'Het geselecteerde bestand kon niet worden gelezen.'
  },
  appearance: {
    title: 'Uiterlijkrecept op seed',
    open: 'Uiterlijkrecept openen',
    apply: 'Recept toepassen op de voorvertoning',
    help: 'Importeer een recept of een seed-zoekrapport met expliciete mesh-koppelingen.',
    warning:
      'Kandidaatvoorvertoning: alleen expliciete onderdelen en RGB-monsters. Native DDS-texturen, maskers en shaders worden niet nagebootst.',
    mismatch:
      'De vingerafdruk van het model of de meshnamen komen niet overeen. Er is niets gewijzigd.',
    failed: 'Het bestand kon niet worden gelezen als een ondersteund uiterlijkrecept.',
    seed: 'Kandidaatseed',
    applied: 'Recept toegepast op de voorvertoning',
    candidate: 'Kandidaat van de gedeeltelijke evaluator'
  },
  controls: {
    changeLanguage: 'Taal wijzigen',
    changeTheme: 'Thema wijzigen',
    light: 'Licht',
    dark: 'Donker',
    system: 'Systeem'
  }
}
