import type { Messages } from '../messages'

export const nlNL: Messages = {
  app: { name: 'NMS Courier', tagline: 'Lokale levering voor No Man’s Sky' },
  sections: { obtain: 'Nieuw verkrijgen', upgrade: 'Verbeteren' },
  corvette: {
    title: 'Korvet uit een bestand',
    hint: 'Kies een gedeeld korvetbestand (.nmsship). Het spel opent het bouwen van korvetten dan met dat schip al in elkaar gezet. Start het spel opnieuw na het kiezen.',
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
    inventory: 'Voorwerpen en valuta',
    travel: 'Reizen',
    equipment: 'Uitrusting',
    knowledge: 'Kennis',
    progress: 'Voortgang',
    style: 'Uiterlijk',
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
    teleport: {
      title: 'Teleporteren',
      summary: 'Reis naar een sterrenstelsel via melkwegstelsel en portaaladres, zonder portaal.'
    },
    planets: {
      title: 'Planeten zoeken',
      summary: 'Vind planeten op bioom, weer en wachters, met hun portaaladres.'
    },
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
    gift: {
      title: 'Naar een vriend sturen',
      summary: 'Geef voorwerpen aan een andere speler die met jou in het spel is.'
    },
    pendingTech: {
      title: 'Wachtende technologieën',
      summary: 'Rond technologieën af die nog onderdelen vragen, in elke inventaris.'
    },
    upkeep: {
      title: 'Repareren en opladen',
      summary: 'Repareer beschadigde technologie en laad op wat leeg is.'
    },
    purpleStars: {
      title: 'Paarse sterren op de kaart',
      summary:
        'Toont op de sterrenkaart de systemen met een paarse ster, die het verhaal normaal opent.'
    },
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
    words: {
      title: 'Woorden',
      summary:
        'Woorden van de talen van de Gek, Vy’keen, Korvax, Atlas en Autofagen: één, meerdere of alle.'
    },
    glyphs: { title: 'Portaalglyphs', summary: 'De zestien glyphs die portalen openen.' },
    missions: {
      title: 'Missies',
      summary:
        'Vraagt het spel missies te voltooien: alle, een missie met haar stappen of één stap.'
    },
    guide: {
      title: 'Handleiding',
      summary: 'Onderwerpen van de spelhandleiding die normaal tijdens het spelen opengaan.'
    },
    nexus: {
      title: 'Anomalie in de ruimte',
      summary: 'Toegang tot de Anomalie in de ruimte, die normaal door het verhaal wordt geopend.'
    },
    standings: {
      title: 'Reputatie',
      summary: 'Reputatie bij alle rassen, de drie gildes en de bandieten, per niveau verhoogd.'
    },
    milestones: {
      title: 'Mijlpalen',
      summary: 'Mijlpalen van de reis en medailles van de facties, per niveau verhoogd.'
    },
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
  status: { verified: 'Geverifieerd', experimental: 'In test', planned: 'Gepland' },
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
    connection: 'Verbinding',
    heroBody:
      'Stuur voorwerpen, valuta en ontgrendelingen naar je eigen spel terwijl het draait. Het spel doet alles zelf; je saves worden nooit bewerkt.',
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
  savesPage: {
    slotsTitle: 'Je saveslots',
    slotsHint:
      'Wanneer het spel elk slot voor het laatst opsloeg. Courier wijzigt alleen het slot dat in het spel geladen is.',
    slot: 'Slot {number}',
    lastSaved: 'Laatst opgeslagen: {when}',
    noSlots: 'Nog geen save gevonden.',
    backupsTitle: 'Veiligheidskopieën',
    backupsHint:
      'Voor elke wijziging kopieert Courier je hele savemap. Om terug te gaan sluit je het spel en zet je de bestanden van een kopie terug in de savemap.',
    backupCount: '{count} kopieën bewaard',
    noBackups: 'Nog geen kopie. Er wordt er een gemaakt voor de eerste wijziging.',
    openFolder: 'Map met kopieën openen',
    before: 'Voor: {feature}'
  },
  setup: {
    chooseTitle: 'Kies je spelmap',
    chooseBody: "Courier moet weten waar No Man's Sky is geïnstalleerd.",
    chooseButton: 'Map kiezen',
    installTitle: 'Courier in het spel installeren',
    updateTitle: 'Courier in het spel bijwerken',
    installBody:
      'Twee kleine bestanden worden naar de spelmap gekopieerd. Er wordt niets van het spel vervangen en je saves blijven onaangeroerd. Start daarna het spel.',
    installButton: 'Installeren',
    updateButton: 'Bijwerken',
    closeGameTitle: 'Sluit het spel om af te ronden',
    closeGameBody:
      'De bestanden kunnen niet worden vervangen terwijl het spel draait. Sluit het en kom hier terug.',
    foreignTitle: 'Een andere mod gebruikt hetzelfde bestand',
    foreignBody:
      'In de spelmap staat al een bestand xinput9_1_0.dll dat niet van Courier is. Courier vervangt het niet; verwijder eerst die mod om Courier te gebruiken.',
    unavailableTitle: 'De bestanden van Courier ontbreken',
    unavailableBody:
      'Deze kopie van de toepassing bevat de bestanden die ze installeert niet. Download de toepassing opnieuw.',
    openGameTitle: 'Open het spel en laad een save',
    openGameBody: 'Courier maakt zelf verbinding zodra het spel draait.',
    readyTitle: 'Verbonden met het spel',
    readyBody: 'Alles is klaar. Kies wat je wilt versturen.'
  },
  settings: {
    internalNames: 'Interne namen tonen',
    internalNamesHint:
      'Toont de identificaties van het spel en het technische antwoord van elk verzoek. Handig bij het melden van een probleem.',
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
    actionOne: 'Naar het spel sturen',
    expeditionGroup: 'Expeditie {number}',
    groupNames: {
      Weapon: 'Multitool',
      Suit: 'Exopak',
      AllShipsExceptAlien: 'Schepen, behalve levende',
      AllShips: 'Alle schepen',
      Mech: 'Minotaur',
      Exocraft: 'Exocraft',
      Freighter: 'Vrachtschip',
      Ship: 'Ruimteschip',
      AlienShip: 'Levend schip',
      RobotShip: 'Sentinel-interceptor',
      Submarine: 'Nautilon',
      AllVehicles: 'Alle exovoertuigen',
      Colossus: 'Colossus',
      catalogue_item: 'Voorwerpen',
      catalogue_technology: 'Technologie',
      catalogue_construction: 'Bouwmenu',
      research_tree: 'Onderzoek',
      cooking: 'Koken',
      refiner: 'Raffinaderij',
      stat: 'Mijlpaal',
      product: 'Voorwerp',
      mission: 'Missie',
      interaction: 'Ontmoeting',
      none: 'Overig',
      trophy: 'Trofee',
      Common: 'Gewoon',
      Rare: 'Zeldzaam',
      Epic: 'Episch',
      Legendary: 'Legendarisch',
      Junk: 'Rommel',
      shop: 'Winkel',
      customisation: 'Uiterlijk'
    },
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
    equipSceneHint: 'Optioneel. Laat leeg om het spel te laten kiezen.',
    equipModelSeed: 'Modelseed',
    equipLegacyColours: 'Oude kleuren gebruiken',
    equipLegacyColoursHint:
      'Geeft de multitool de oudere kleuren, zoals bij de tools die het spel uitdeelt. Toegepast direct nadat je het aanbod accepteert.',
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
    equipToolSlots: 'Alle technologievakken',
    equipToolSlotsHint:
      'Maakt elke positie van het technologieraster van de multitool bruikbaar, al in het aanbod.',
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
    hint: 'Het draaiende spel doet het zelf, zoals het dit zelf zou uitdelen.',
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
    traceTitle: 'Beloningsspoor',
    traceHint:
      'Noteert elke beloning die het spel geeft zolang het aan staat, met de seed en de aanroepende code. Verandert niets.',
    traceStart: 'Starten',
    traceStop: 'Stoppen',
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
    bridgeTitle: 'Verbinding met het spel',
    bridgeHint: 'Een klein Courier-bestand in het spel doet wat je hiervandaan stuurt.',
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
  words: {
    hint: 'Rijen zijn woorden, kolommen zijn talen. Vink aan wat je wilt leren. Een woord aanvinken vinkt ook zijn andere vormen aan (verlaten, verliet).',
    id: 'ID',
    marked: '{count} van {total} aangevinkt',
    word: 'Woord',
    raceAll: 'Alle getoonde woorden van {race}',
    race: {
      Traders: 'Gek',
      Warriors: 'Vy’keen',
      Explorers: 'Korvax',
      Atlas: 'Atlas',
      Builders: 'Autofaag'
    }
  },
  upkeep: {
    repairTitle: 'Beschadigde technologie repareren',
    repairHint:
      'Het spel repareert alle beschadigde technologie van de gekozen inventaris, zoals na een crash in het verhaal. Er wordt niets verbruikt.',
    repairAll: 'Alles repareren',
    inventories: {
      exosuit: 'Exopak',
      ship: 'Schip',
      multitool: 'Multitool',
      freighter: 'Vrachtschip',
      exocraft: 'Exovoertuig'
    },
    rechargeTitle: 'Opladen',
    rechargeHint:
      'Het spel laadt elke technologie op die niet vol is: gevarenbescherming, levensonderhoud, startmotoren en de rest. Er wordt niets verbruikt.',
    rechargeNow: 'Nu alles opladen',
    autoTitle: 'Vanzelf opladen',
    autoHint:
      'Zolang deze toepassing open is en het spel draait. In het spel verschijnt geen bericht.',
    autoOn: 'Aan',
    autoEvery: 'Alles opladen elke (minuten)',
    autoLow: 'Ook meteen wanneer een lading onder 20% zakt'
  },
  gift: {
    title: 'Voorwerpen naar een vriend sturen',
    hint: 'Zorg dat jullie in dezelfde sessie zijn: sluit je aan bij zijn groep of laat hem bij de jouwe komen. Het voorwerp verschijnt in zijn inventaris en er verdwijnt niets uit de jouwe. Je vriend hoeft niets te installeren.',
    stepPlayer: '1. Wie het krijgt',
    stepItem: '2. Wat je stuurt',
    findPlayers: 'Spelers zoeken',
    notChecked: 'Zoekt de spelers die nu met jou in het spel zijn.',
    noPlayers: 'Geen speler gevonden. Sluit je eerst in het spel bij je vriend aan.',
    player: 'Speler {number}',
    party: 'Groep',
    session: 'Sessie',
    selfHint:
      'Je kunt zelf ook in deze lijst staan. De code is de identificatie van elke speler op zijn platform.',
    search: 'Zoek een voorwerp',
    amount: 'Aantal',
    send: 'Sturen',
    confirm: '{amount} × {item} naar {player} sturen? Zijn spel voegt het toe aan zijn inventaris.',
    answers: {
      waiting: 'Wachten op zijn spel',
      accepted: 'Zijn spel heeft het geaccepteerd',
      refused: 'Zijn spel heeft het geweigerd',
      failed: 'Geen antwoord ontvangen'
    },
    results: {
      no_player: 'Die speler is niet meer in de sessie.',
      player_changed: 'De lijst is veranderd. Zoek de spelers opnieuw.',
      unknown_id: 'Het spel kent dit voorwerp niet.',
      busy: 'De vorige zending wacht nog op antwoord.',
      not_ready: 'Laad eerst een opslag en sluit je aan bij een sessie.'
    }
  },
  pendingTech: {
    exocraft: {
      0: 'Roamer',
      1: 'Nomad',
      2: 'Colossus',
      3: 'Pilgrim',
      4: 'Dragonfly',
      5: 'Nautilon',
      6: 'Minotaur'
    },
    title: 'Technologieën die op installatie wachten',
    hint: 'Een technologie met een tandwiel in de hoek vraagt nog onderdelen. Controleer wat wacht en rond het hier af: de onderdelen worden niet verbruikt.',
    check: 'Mijn inventarissen controleren',
    notChecked:
      'De controle loopt door het exopak, de multitool in de hand, elk schip, het vrachtschip en elk exovoertuig.',
    none: 'Er wacht niets. Elke technologie is volledig geïnstalleerd.',
    finishAll: 'Alles afronden ({count})',
    finishGroup: 'Deze afronden',
    finishOne: 'Afronden',
    confirm:
      'Het spel rondt {count} wachtende technologieën af. De gevraagde onderdelen worden niet verbruikt en het spel toont mogelijk geen bericht.',
    blockedHint: 'Items voor beschadigde vakken en interne items worden hier nooit afgerond.',
    truncated: 'Er wachten er meer dan 256; alleen de eerste 256 worden getoond.',
    groups: {
      exosuit: 'Exopak',
      multitool: 'Multitool in de hand',
      ship: 'Schip {number}',
      freighter: 'Vrachtschip',
      exocraft: 'Exovoertuig {number}'
    },
    states: {
      waiting: 'Wacht',
      finished: 'Geïnstalleerd',
      still_waiting: 'Wacht nog steeds',
      blocked: 'Niet toegestaan',
      unknown_id: 'Onbekend bij het spel'
    }
  },
  planets: {
    sourceMine: 'Mijn planeten',
    mineHint:
      'Alles wat je zoektochten vonden, per sterrenstelsel bewaard op deze computer. Exporteer de lijst om te delen; importeer er een die een vriend stuurde.',
    galaxy: 'Sterrenstelsel',
    exportList: 'Mijn lijst exporteren',
    importList: 'Een lijst importeren',
    exported: '{count} planeten naar het bestand geschreven',
    imported: '{count} nieuwe planeten toegevoegd',
    importFailed: 'Dat bestand is geen planetenlijst.',
    durationHint: 'minuten, tot 1.440 (24 uur)',
    wealth: 'Rijkdom van het systeem',
    wealthNames: { Poor: 'Arm', Average: 'Gemiddeld', Wealthy: 'Rijk' },
    presetDissonant: 'Dissonant',
    flora: 'Flora',
    fauna: 'Fauna',
    life: { Dead: 'geen', Low: 'schaars', Mid: 'normaal', Full: 'overvloedig' },
    purple: 'Paarse ster',
    purpleHint: 'Waterwerelden en gasreuzen vind je alleen rond paarse sterren.',
    portalOnly: 'Alleen via portaal',
    portalOnlyHint:
      'Geen ster van de sterrenkaart: alleen een portaal of het Reizen van deze pagina brengt je erheen.',
    sourceSurvey: 'Kant-en-klare lijst (Euclid)',
    sourceLive: 'Om mij heen (elk sterrenstelsel)',
    liveHint:
      'Het spel zelf doorzoekt de sterrenstelsels om je heen, de dichtstbijzijnde eerst. Hoe langer het loopt, hoe verder het reikt. Speel intussen door; het zoeken stopt als je het systeem verlaat.',
    duration: 'Zoeken gedurende',
    minutes: '{count} min',
    start: 'Zoeken starten',
    stop: 'Stoppen',
    progress: "{systems} systemen bekeken, tot {distance} regio's ver",
    liveEmpty: 'Nog niets gevonden. Start een zoektocht of vraag minder.',
    grass: 'Graskleur',
    liveState: {
      running: 'Bezig met zoeken…',
      done: 'Zoeken voltooid',
      stopped: 'Gestopt',
      travelled: 'Gestopt: je hebt het systeem verlaten',
      failed: 'Het spel antwoordde niet; er is niets anders geprobeerd',
      not_ready: 'Nog geen sterrenstelsel geladen'
    },
    grassHues: {
      green: 'Groen',
      teal: 'Blauwgroen',
      blue: 'Blauw',
      purple: 'Paars',
      pink: 'Roze',
      red: 'Rood',
      orange: 'Oranje',
      yellow: 'Geel',
      pale: 'Bleek'
    },
    title: 'Een planeet vinden',
    hint: 'Kies hoe de planeet moet zijn en reis dan naar een resultaat of kopieer het portaaladres.',
    scopeTitle: 'Voorlopig alleen het Euclid-sterrenstelsel',
    scope:
      '{count} planeten uit één regio van Euclid, berekend met de regels van het spel zelf. Enkele zijn in het spel gecontroleerd en klopten.',
    presetEarth: 'Aardachtig',
    presetAll: 'Alles',
    presetHint:
      'Aardachtig: weelderig, geen stormen, geen extreem weer, weinig wachters, niet geïnfecteerd of moerassig.',
    biome: 'Bioom',
    variant: 'Variant',
    variantEarth: 'Aardachtige varianten',
    storms: 'Stormen',
    sentinels: 'Wachters',
    race: 'Ras van het systeem',
    raceNone: 'Onbewoond',
    perSystem: 'Treffers in hetzelfde systeem',
    perSystemOption: 'Minstens {count}',
    perSystemOne: 'Eén is genoeg',
    system: 'Systeem',
    systemLawful: 'Geen piratensystemen',
    systemPirate: 'Alleen piratensystemen',
    pirate: 'Piratensysteem',
    economy: {
      Mining: 'Mijnbouw',
      HighTech: 'Technologie',
      Trading: 'Handel',
      Manufacturing: 'Productie',
      Fusion: 'Geavanceerde materialen',
      Scientific: 'Wetenschap',
      PowerGeneration: 'Energieopwekking'
    },
    extreme: 'Extreem weer toestaan',
    extremeHint: 'Extreme planeten hebben zwaardere stormen en gevaren.',
    extremeYes: 'extreem weer',
    any: 'Alle',
    search: 'Zoeken op portaaladres',
    found: '{planets} planeten in {systems} systemen',
    inSystem: '{count} in dit systeem',
    copy: 'Portaaladres kopiëren',
    copied: 'Gekopieerd',
    save: 'Bewaren voor de Teleport-pagina',
    saved: 'Bewaard',
    travel: 'Reizen',
    confirm:
      'Je verlaat waar je bent en het spel laadt het systeem van {planet} ({portal}) en zet je op die planeet. Sla eerst op als je naar precies deze plek terug wilt.',
    empty: 'Het planetenoverzicht kon niet worden gelezen.',
    biomes: {
      Lush: 'Weelderig',
      Toxic: 'Giftig',
      Scorched: 'Verschroeid',
      Radioactive: 'Radioactief',
      Frozen: 'Bevroren',
      Barren: 'Dor',
      Dead: 'Dood',
      Weird: 'Exotisch',
      Swamp: 'Moeras',
      Lava: 'Vulkanisch',
      Red: 'Rood (chromatisch)',
      Green: 'Groen (chromatisch)',
      Blue: 'Blauw (chromatisch)',
      Waterworld: 'Waterwereld',
      GasGiant: 'Gasreus'
    },
    variants: {
      standard: 'Standaard',
      highQuality: 'Hoge kwaliteit',
      jungle: 'Jungle',
      worlds: 'Vernieuwd (Worlds)',
      floral: 'Bloemenvelden',
      rocky: 'Rotsachtig',
      tentacles: 'Tentakels',
      bubbles: 'Bubbels',
      giant: 'Reuzenflora',
      variant: 'Andere variant',
      swamp: 'Moerassig',
      lava: 'Vulkanische variant',
      ruins: 'Ruïnes',
      infested: 'Geïnfecteerd',
      shapes: 'Exotische vormen',
      remix: 'Remix',
      none: 'Naamloos'
    },
    stormLimit: {
      None: 'Geen stormen',
      Low: 'Hooguit weinig',
      High: 'Hooguit veel',
      Always: 'Alle'
    },
    stormLevels: { None: 'geen', Low: 'weinig', High: 'veel', Always: 'voortdurend' },
    sentinelLimit: {
      Low: 'Alleen laag',
      Default: 'Tot normaal',
      Aggressive: 'Tot agressief',
      Corrupt: 'Alle, ook gecorrumpeerd'
    },
    sentinelLevels: {
      Low: 'laag',
      Default: 'normaal',
      Aggressive: 'agressief',
      Corrupt: 'gecorrumpeerd'
    }
  },
  missions: {
    warningTitle: 'Experimenteel: gebruik een test-save',
    warning:
      'Het spel voltooit elke missie die je aanvinkt. Het is nog niet bekend of je krijgt wat de overgeslagen stappen geven. Je save wordt eerst gekopieerd.',
    search: 'Zoeken op missie of ID',
    untitled: 'Missies zonder titel in het spel tonen',
    untitledHint:
      'Hulpmissies die het spel nooit in het logboek noemt. Ze staan er met hun identificatie.',
    untitledGroup: 'Zonder titel in het spel',
    section: {
      story: 'Hoofdverhaal',
      atlas: 'Atlaspad',
      secondary: 'Nevenmissies',
      guide: 'Handleiding en mijlpalen',
      seasonal: 'Expedities'
    },
    part: 'Deel {number}',
    after: 'Begint na: {quest}',
    silent: 'geen voltooiingsmelding in het spel',
    quests: '{shown} van {total} hoofdmissies',
    count: '{count} missies',
    stages: '{count} fasen',
    rewards: '{count} beloningen',
    chosen: '{count} aangevinkt',
    action: 'Alles voltooien',
    actionChosen: 'Aangevinkte voltooien ({count})'
  },
  levels: {
    hint: {
      standings:
        'Verhoog je aanzien bij een ras, een gilde of een factie met niveaus. Het spel doet het zelf en toont zijn eigen bericht. Er wordt nooit iets verlaagd.',
      milestones:
        'Verhoog mijlpalen van de reis met niveaus. Alleen het getal stijgt: Verzamelde woorden verhogen leert geen woord. Er wordt nooit iets verlaagd.'
    },
    mode: 'Hoe ver',
    modeOne: '1 niveau',
    modeSome: 'Meerdere niveaus',
    modeAll: 'Tot het laatste niveau',
    modeHint: 'Geteld vanaf het niveau waarop elk nu staat.',
    messageHint: 'Elke rij zegt of het spel er een bericht voor toont.',
    message: {
      full: 'volledige melding',
      quick: 'korte melding',
      silent: 'geen melding in het spel'
    },
    announce: 'Het mijlpaalscherm ook tonen voor stille items',
    announceHint:
      'Het spel toont zijn volledige mijlpaalscherm alleen voor sommige items. Aan: het toont het ook voor de andere.',
    count: 'Niveaus',
    countHint: 'Hoeveel niveaus omhoog, 1 tot {max}.',
    action: 'Alles verhogen',
    actionChosen: 'Gekozen verhogen ({count})'
  },
  glyphs: {
    hint: 'Het spel geeft de glyphs zelf, met zijn eigen melding. Ze komen in de volgorde van het spel, hieronder getoond; je kunt er geen kiezen.',
    order: 'Volgorde van de glyphs in het spel',
    all: 'Alle zestien',
    allHint: 'Alle glyphs in één keer.',
    count: 'Hoeveel',
    countHint: 'De volgende glyphs die je nog niet hebt, 1 tot {max}.',
    action: 'Glyphs leren'
  },
  teleport: {
    hint: 'Het spel brengt je erheen, zoals zijn eigen teleporters doen. Je komt aan bij het ruimtestation van het systeem, of op de planeet van de eerste glyph.',
    galaxy: 'Melkwegstelsel',
    galaxyHint: 'Alle melkwegstelsels van het spel, op nummer en naam. Typ om te zoeken.',
    galaxyEmpty: 'Geen melkwegstelsel gevonden.',
    galaxyNumber: 'Melkwegstelsel {number}',
    address: 'Portaaladres',
    addressHint:
      'Twaalf glyphs, als cijfers 0 tot F: planeet, systeem en dan de drie coördinaten. Klik erop of plak de code.',
    erase: 'Laatste glyph wissen',
    destination: 'Aankomen bij',
    destinationHint:
      'Het ruimtestation is de veilige keuze. De planeet gebruikt de eerste glyph van het adres.',
    toStation: 'Ruimtestation van het systeem',
    toPlanet: 'Planeet van het adres',
    action: 'Teleporteren',
    confirmBody:
      'Je verlaat waar je nu bent en het spel laadt het andere systeem. Sla eerst op als je precies hier terug wilt komen.',
    favourites: 'Opgeslagen bestemmingen',
    favouritesHint: 'Bewaard door deze toepassing op deze computer; het spel ziet ze niet.',
    favouriteName: 'Naam van de bestemming',
    addFavourite: 'Dit adres opslaan',
    useFavourite: 'Gebruiken',
    removeFavourite: 'Verwijderen',
    noFavourites: 'Nog niets opgeslagen.'
  },
  workshop: {
    title: 'Modelwerkplaats',
    description:
      'Kies wat je wilt zien en typ dan een seed, trek er een willekeurig of kies de onderdelen en laat de toepassing een seed zoeken die ze heeft.',
    tabBuild: 'Samenstellen',
    tabView: 'Seed bekijken',
    buildDescription:
      'Kies het type, de onderdelen, de kleuren en de texturen. De toepassing zoekt een seed die ze heeft en toont die.',
    viewDescription:
      'Kies het type en typ een seed, of trek er een willekeurig, om te zien hoe die eruitziet.',
    colorTitle: 'Kleuren',
    roles: {
      primary: 'Hoofdkleur',
      secondary: 'Tweede kleur',
      decal1: 'Stickerkleur 1',
      decal2: 'Stickerkleur 2'
    },
    texturesTitle: 'Texturen en stickers',
    baseTexture: { COATING: 'Coating', PAINTED: 'Gelakt', PANELS: 'Metaal' },
    seedTexturesTitle: 'Texturen en stickers van deze seed',
    colorHint:
      'Elke kleur die het model uit de paletten van het spel haalt. Kies er een en daarna de kleur; Willekeurig laat het aan de seed.',
    seedColorsTitle: 'Kleuren van deze seed',
    paintLabel: 'Lak',
    undercoatLabel: 'Grondlaag',
    tabSystem: 'Huidig stelsel',
    systemDescription:
      'Het sterrenstelsel waarin je je bevindt, gelezen uit het draaiende spel: de seed ervan en de schepen die het spel ervoor heeft gegenereerd. Er wordt niets in het spel gewijzigd.',
    systemNone:
      'Niets om te tonen. Het spel moet draaien met brug 1.8.0 of nieuwer en een geladen save; de lijst wordt om de paar seconden vernieuwd.',
    systemSeed: 'Seed van het stelsel',
    systemShips: 'Schepen van dit stelsel',
    systemClass: 'Klasse',
    systemRole: 'Rol',
    systemShipSeed: 'Seed',
    systemView: 'Bekijken',
    systemRefresh: 'Vernieuwen',
    systemClassNumber: 'Klasse {number}',
    systemStream:
      'Gecontroleerd: de scheepsseeds liggen op de getallenstroom van de stelselseed; de eerste wordt na {steps} stappen getrokken.',
    systemStreamUnknown:
      'De scheepsseeds zijn niet gevonden op de getallenstroom van de stelselseed.',
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
      atlas: 'Atlantid',
      staff: 'Staf',
      staffRuin: 'Pijler van Titan',
      staffBone: 'Kroon van basilisk',
      switch: 'Infinite Neon Mark XXII',
      retro: 'Starbound v0.27',
      swarm: 'Reuzenwesp-desintegrator',
      staffNpc: 'NPC-staf'
    },
    seedLabel: 'Seed',
    homeSeedHint:
      'Een vrachtschip neemt zijn kleuren van zijn thuissysteem. Typ de seed van dat systeem, trek er een of geef hieronder het portaaladres. Leeg toont geen kleuren.',
    homeAddress: 'Deze seed is het stelsel met portaaladres {glyphs} in sterrenstelsel {galaxy}.',
    glyphsLabel: 'Portaaladres (12 glyphs als 0–9, A–F)',
    galaxyLabel: 'Nummer van het sterrenstelsel',
    useAddress: 'Dit stelsel gebruiken',
    legacyColours: 'Oude kleuren gebruiken',
    legacyColoursHint:
      'Het spel heeft twee manieren om de kleuren van een seed te trekken. Multitools die het uitdeelt gebruiken de oude; schepen worden één voor één in de save gemarkeerd (Oude kleuren gebruiken).',
    seedOrigin:
      'Het spel trekt deze seed in het stelsel met portaaladres {glyphs} in sterrenstelsel {galaxy} (na {steps} stappen van zijn getallenstroom). Een aanwijzing, geen bewijs.',
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
    note: 'Het model komt uit je eigen spelbestanden. Vormen en kleuren volgen de seed; de belichting is vereenvoudigd, dus het ziet er iets anders uit dan in het spel.',
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
