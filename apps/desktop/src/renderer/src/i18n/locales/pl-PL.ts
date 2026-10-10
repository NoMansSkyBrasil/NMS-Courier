import type { Messages } from '../messages'

export const plPL: Messages = {
  app: { name: 'NMS Courier', tagline: 'Lokalne dostawy do No Man’s Sky' },
  sections: { obtain: 'Zdobądź nowy', upgrade: 'Ulepsz' },
  corvette: {
    title: 'Korweta z pliku',
    hint: 'Wybierz udostępniony plik korwety (.nmsship). Aplikacja przygotuje grę tak, aby budowa korwety zaczynała się od tego statku już złożonego; dokończysz ją w grze. Po przygotowaniu pliku grę trzeba uruchomić ponownie.',
    none: 'Nie przygotowano jeszcze żadnego pliku korwety.',
    current: 'Przygotowano: {name}, części: {count}.',
    parts: 'Części: {count}',
    hullParts: 'Części kadłuba: {count}',
    missing: 'Bez: {parts}. Gra pokaże ostrzeżenie i mimo to ją zbuduje.',
    partCockpit: 'kokpit',
    partLandingGear: 'podwozie',
    partHabitation: 'moduł mieszkalny',
    partReactor: 'reaktor',
    rejectedTitle: 'Tego pliku nie można użyć',
    rejectedShip: 'To zwykły statek, a nie korweta. Statki z pliku nie są jeszcze dostępne.',
    rejectedInvalid: 'To nie jest prawidłowy plik korwety.',
    installedTitle: 'Korweta przygotowana',
    installedBody:
      'Zamknij grę, jeśli jest otwarta, i uruchom ją ponownie. Następnie użyj poniżej „Rozpocznij budowę korwety”.',
    installFailedTitle: 'Nie udało się przygotować korwety',
    installFailed: 'Nie udało się zapisać plików w folderze gry.',
    choose: 'Wybierz plik',
    install: 'Przygotuj w grze'
  },
  groups: {
    overview: 'Przegląd',
    deliver: 'Dostarczanie',
    unlock: 'Odblokowywanie',
    rewards: 'Nagrody',
    library: 'Biblioteka',
    system: 'System'
  },
  features: {
    dashboard: {
      title: 'Pulpit',
      summary: 'Czy dostawa jest teraz możliwa i dlaczego.'
    },
    activity: { title: 'Aktywność', summary: 'Każde żądanie wysłane do gry i jego wynik.' },
    items: {
      title: 'Przedmioty',
      summary: 'Substancje i produkty umieszczane w ekwipunku wczytanego zapisu.'
    },
    currencies: { title: 'Waluty', summary: 'Jednostki, nanity i rtęć.' },
    teleport: {
      title: 'Teleport',
      summary: 'Podróżuj do układu gwiezdnego według galaktyki i adresu portalu, bez portalu.'
    },
    exosuit: {
      title: 'Egzoskafander',
      summary: 'Klasa, miejsca ładunkowe i technologiczne oraz doładowane miejsca egzoskafandra.'
    },
    starships: {
      title: 'Statki',
      summary: 'Klasa, rozmiar ekwipunku i doładowane miejsca posiadanego statku.'
    },
    multitools: {
      title: 'Multinarzędzia',
      summary: 'Klasa, miejsca i doładowane miejsca wyposażonego multinarzędzia.'
    },
    freighters: {
      title: 'Frachtowce',
      summary: 'Oferta frachtowca z wybraną klasą, modelem i ziarnami.'
    },
    frigates: { title: 'Fregaty', summary: 'Werbowanie fregat do floty.' },
    corvettes: {
      title: 'Korwety',
      summary: 'Korweta zbudowana na podstawie udostępnionego projektu.'
    },
    companions: { title: 'Towarzysze', summary: 'Jaja towarzyszy i stworzenia.' },
    technologies: {
      title: 'Technologie',
      summary: 'Schematy, które postać potrafi zainstalować.'
    },
    productRecipes: {
      title: 'Przepisy wytwarzania',
      summary: 'Przepisy na wytwarzalne przedmioty i wytwarzalną technologię.'
    },
    buildParts: {
      title: 'Części budowlane',
      summary: 'Części bazy, frachtowca i dekoracje w menu budowy.'
    },
    refinerRecipes: {
      title: 'Rafinacja i gotowanie',
      summary: 'Przepisy rafinera i procesora składników odżywczych w katalogu.'
    },
    customisation: {
      title: 'Wygląd',
      summary: 'Hełmy, pancerze, peleryny, sztandary, smugi plecaka odrzutowego i gesty.'
    },
    titles: { title: 'Tytuły', summary: 'Tytuły gracza na sztandarze.' },
    words: {
      title: 'Słowa',
      summary:
        'Słowa języków Geków, Vy’keenów, Korvaxów, Atlasu i Autofagów: jedno, kilka lub wszystkie.'
    },
    glyphs: { title: 'Glify portalu', summary: 'Szesnaście glifów otwierających portale.' },
    missions: {
      title: 'Misje',
      summary: 'Prosi grę o ukończenie misji: wszystkich, zadania z jego etapami lub jednego etapu.'
    },
    guide: {
      title: 'Przewodnik',
      summary: 'Tematy przewodnika gry, które zwykle otwierają się podczas gry.'
    },
    nexus: {
      title: 'Kosmiczna anomalia',
      summary: 'Dostęp do Kosmicznej anomalii, który zwykle otwiera fabuła.'
    },
    standings: {
      title: 'Reputacja',
      summary: 'Reputacja u wszystkich ras, trzech gildii i banitów, podnoszona o poziomy.'
    },
    milestones: {
      title: 'Kamienie milowe',
      summary: 'Kamienie milowe podróży i medale frakcji, podnoszone o poziomy.'
    },
    fishing: { title: 'Rekordy wędkarskie', summary: 'Rekord połowu każdej ryby.' },
    expeditions: {
      title: 'Ekspedycje',
      summary: 'Nagrody z minionych ekspedycji, do odebrania u towarzysza od rtęci.'
    },
    twitch: {
      title: 'Dropy z Twitcha',
      summary: 'Nagrody z kampanii na Twitchu, do odebrania u towarzysza od rtęci.'
    },
    platform: {
      title: 'Platforma i przedsprzedaż',
      summary: 'Nagrody powiązane z platformą, przedsprzedażą lub wydarzeniem.'
    },
    quicksilver: {
      title: 'Sklep za rtęć',
      summary: 'Przedmioty sprzedawane przez towarzysza od rtęci.'
    },
    catalog: {
      title: 'Katalog gry',
      summary: 'Przeszukuj przedmioty zainstalowanej gry.'
    },
    models: {
      title: 'Warsztat modeli',
      summary: 'Zobacz, jak wygląda ziarno, albo znajdź ziarno dla wybranych części.'
    },
    bridge: {
      title: 'Gra i most',
      summary: 'Instalacja, wersja gry i połączenie z uruchomioną grą.'
    },
    saves: {
      title: 'Zapisy i konto',
      summary: 'Który slot zapisu jest wczytany i co jest wspólne dla całego konta.'
    },
    settings: { title: 'Ustawienia', summary: 'Język, wygląd i informacje o aplikacji.' }
  },
  status: { verified: 'Zweryfikowane', experimental: 'Eksperymentalne', planned: 'Planowane' },
  statusHint: {
    verified: 'Zadziałało w uruchomionej grze na wersji badawczej.',
    experimental: 'Działa częściowo lub tylko w znanych warunkach.',
    planned: 'Jeszcze nie zbudowane.'
  },
  scope: { slot: 'Slot zapisu', account: 'Konto', both: 'Slot zapisu i konto', none: 'Bez zmian' },
  scopeHint: {
    slot: 'Zmienia tylko wczytany slot zapisu.',
    account: 'Zmienia konto, wspólne dla wszystkich slotów zapisu.',
    both: 'Zmienia wczytany slot zapisu i konto.',
    none: 'Tylko odczyt; w grze nic się nie zmienia.'
  },
  rows: {
    deliverable: 'Dostarczane',
    blockedDamaged: 'Wpisy uszkodzonych miejsc, nigdy niedostarczane',
    blockedMaintenance: 'Wpisy konserwacyjne, nigdy niedostarczane',
    blockedTemplates: 'Szablony proceduralne, nigdy niedostarczane',
    blockedById: 'Zablokowane stałą regułą',
    catalogueItems: 'Wytwarzalne przedmioty',
    craftableTechnology: 'Wytwarzalna technologia',
    buildParts: 'Części budowlane',
    researchTree: 'Sprzedawane w terminalach badawczych',
    repeatableNever: 'Zakupy wielokrotne, nigdy nieodblokowywane',
    missionBound: 'Powiązane z misją, pomijane',
    redeemedInSave: 'Zapisane w zapisie gry',
    itemRewards: 'Przedmioty do odebrania w sklepie',
    total: 'W grze'
  },
  rules: {
    gameRoutines: 'Wszystko wykonuje sama uruchomiona gra. Pliki zapisu nigdy nie są edytowane.',
    defectiveNever: 'Wadliwe i wewnętrzne wpisy nigdy nie są dostarczane, w żadnym trybie.',
    repeatableNever:
      'Fajerwerki, Mityczny Nadajnik i Jajo Pustki nigdy nie są odblokowywane: sklep przestałby je sprzedawać.',
    claimItems:
      'Statki, multinarzędzia, jaja i pakiety są odblokowywane na koncie; odbierz je w sklepie, aby otrzymać przedmiot.',
    keepList:
      'Dropy z Twitcha pozostają do odebrania tylko wtedy, gdy most jest zainstalowany. Odbierz to, co chcesz zachować.',
    backup: 'Folder zapisów jest kopiowany przed każdą zmianą.',
    slotIdentified: 'Wczytany slot zapisu jest rozpoznawany przed każdą dostawą.',
    accountShared: 'Zmiany konta trafiają do każdego slotu zapisu i są synchronizowane przez grę.'
  },
  page: {
    errorTitle: 'Ta strona przestała działać',
    errorReload: 'Wczytaj ponownie',
    availabilityTitle: 'Jeszcze niedostępne z tego okna',
    availabilityBody:
      'Wykonano to przez most badawczy. Połączenie tej aplikacji z grą jest wciąż budowane, więc stąd nie można niczego wysłać.',
    includes: 'Co obejmuje',
    includesHint: 'Liczby z wersji badawczej.',
    rulesTitle: 'Jak się zachowuje',
    rulesHint: 'Reguły, które obowiązują zawsze.',
    entries: 'Wpisy',
    kind: 'Rodzaj',
    status: 'Stan',
    scope: 'Zmienia',
    researchBuild: 'Wersja badawcza {build}',
    plannedTitle: 'Jeszcze nie zbudowane',
    plannedBody:
      'Ten obszar jest planowany. Pojawi się tutaj, gdy zacznie działać w uruchomionej grze.',
    open: 'Otwórz'
  },
  dashboard: {
    heroBody:
      'Wysyłaj przedmioty, waluty i odblokowania do własnej uruchomionej gry. Wszystko przechodzi przez samą grę, twoje zapisy nigdy nie są edytowane, a nazwy i ikony widoczne tutaj pochodzą z twojej instalacji.',
    game: 'Gra',
    build: 'Wersja gry',
    bridge: 'Most',
    catalog: 'Katalog',
    capabilities: 'Co potrafi Courier',
    capabilitiesHint: 'Każdy obszar, co zmienia i w jakim stopniu został potwierdzony.',
    feature: 'Obszar',
    area: 'Grupa',
    running: 'Uruchomiona',
    notRunning: 'Zamknięta',
    notSelected: 'Nie wybrano instalacji',
    unknown: 'Nieznane',
    supported: 'Obsługiwana',
    unsupported: 'Nieobsługiwana',
    connected: 'Połączony',
    notConnected: 'Niepołączony',
    available: 'Dostępny',
    unavailable: 'Nie wygenerowano',
    entriesCount: 'Wpisy: {count}',
    processId: 'Proces {id}'
  },
  settings: {
    notifications: 'Powiadomienia gry',
    notificationsHint:
      'Pozwala grze pokazywać własne powiadomienie o tym, co zostało dostarczone, jeśli takie istnieje. Wyłącz, aby dostarczać po cichu. Ulepszenia ekwipunku nigdy nie proszą o potwierdzenie.',
    general: 'Ogólne',
    appearance: 'Wygląd',
    about: 'Informacje',
    language: 'Język',
    languageHint: 'Czternaście języków No Man’s Sky.',
    theme: 'Motyw',
    themeHint: 'Domyślnie zgodny z systemem.',
    experimental: 'Oprogramowanie eksperymentalne',
    experimentalBody:
      'NMS Courier to nieoficjalne narzędzie w trakcie rozwoju. Działa z jedną, dokładnie określoną wersją gry naraz.'
  },
  delivery: {
    shipModel: {
      fighter: 'Myśliwiec',
      hauler: 'Transportowiec',
      explorer: 'Odkrywca',
      shuttle: 'Prom',
      solar: 'Słoneczny',
      exotic: 'Egzotyczny',
      living: 'Living Ship',
      interceptor: 'Interceptor'
    },
    toolModel: {
      pistol: 'Pistolet',
      rifle: 'Karabin',
      experimental: 'Eksperymentalne',
      alien: 'Obce',
      staff: 'Kostur'
    },
    equipSeedHint: 'Puste pole losuje ziarno.',
    obtainAction: 'Wyślij ofertę',
    obtainShipHint:
      'Gra zaoferuje na własnym ekranie nowy statek tego typu, o tym ziarnie i klasie: dodaj go do kolekcji, wymień obecny albo odrzuć.',
    obtainToolHint:
      'Gra zaoferuje na własnym ekranie nowe multinarzędzie tego typu, o tym ziarnie i klasie: dodaj je do kolekcji, wymień obecne albo odrzuć.',
    obtainPlanned: 'Zdobycie nowego nie jest tu jeszcze możliwe.',
    equipSceneEmpty: 'Nie znaleziono modelu.',
    freighterModel: {
      default: 'Wybrany przez grę',
      regular: 'Frachtowiec',
      small: 'Mały frachtowiec',
      tiny: 'Malutki frachtowiec',
      capital: 'Frachtowiec kapitalny',
      pirate: 'Piracki drednot'
    },
    equipScene: 'Model',
    equipSceneHint:
      'Opcjonalnie. Scena gry z modelem frachtowca; puste pole pozostawia wybór grze.',
    equipModelSeed: 'Ziarno modelu',
    equipLegacyColours: 'Użyj starych kolorów',
    equipLegacyColoursHint:
      'Oznacza multinarzędzie do użycia starych kolorów, tak jak te wydawane przez grę. Oferta gry nie ma takiego ustawienia, więc most sprawia, że gra rysuje ofertę w tych kolorach, i zapisuje oznaczenie na narzędziu zaraz po przyjęciu oferty.',
    equipHomeSeed: 'Ziarno układu macierzystego',
    currencyAmountHint:
      'Dowolna kwota od 1 do {max}, czyli największego salda, jakie przechowuje gra.',
    itemsStack: 'Stos po {count}',
    equipActionLabel: 'Działanie',
    equipTarget: 'Statek',
    equipTargetCurrent: 'Obecny statek',
    equipTargetSlot: 'Statek w miejscu {number}',
    equipClass: 'Klasa',
    equipSlots: 'Wszystkie miejsca w ekwipunku',
    equipSlotsHint: 'Udostępnia wszystkie pozycje siatek ładunku i technologii.',
    equipToolSlots: 'Wszystkie miejsca na technologie',
    equipToolSlotsHint:
      'Udostępnia każdą pozycję siatki technologii multinarzędzia, już w ofercie.',
    equipSupercharge: 'Doładowane miejsca',
    equipSuperchargeHint: 'Zamienia każde dostępne miejsce technologii w miejsce doładowane.',
    equipExtended: 'Dodatkowe rzędy technologii',
    equipExtendedHint:
      'Powiększa siatkę technologii do dwunastu rzędów. Wymaga wszystkich miejsc w ekwipunku.',
    currencyHint:
      'Nagroda samej gry dodaje kwotę i pokazuje własne powiadomienie. Saldo nigdy nie przekracza maksimum gry.',
    currencyLabel: 'Waluta',
    equipAction: {
      slotReward: 'Dodaj jedno miejsce w ekwipunku',
      grid: 'Zastosuj do ekwipunku',
      classStep: 'Podnieś klasę o jeden stopień',
      offer: 'Wyślij ofertę frachtowca',
      build: 'Rozpocznij budowę korwety'
    },
    equipActionHint: {
      slotReward:
        'Prosi grę o jej własną nagrodę miejsca. Gra otwiera okno, w którym wybierasz położenie nowego miejsca.',
      grid: 'Zmienia ekwipunek, który już masz, na miejscu. W grze nic się nie otwiera.',
      classStep: 'Prosi grę o jej własną nagrodę ulepszenia: jeden stopień klasy na żądanie, do S.',
      offer:
        'Gra oferuje frachtowiec z poniższymi opcjami. Zaakceptuj go w grze; zastąpi obecny frachtowiec.',
      build: 'Gra otwiera budowę korwety z poniższymi opcjami.'
    },
    currencyName: { units: 'Jednostki', nanites: 'Nanity', quicksilver: 'Rtęć' },
    itemsTitle: 'Wyślij przedmioty do gry',
    itemsHint:
      'Substancje i produkty trafiają do ładowni egzokombinezonu wczytanego zapisu, w stosach o rozmiarze dozwolonym przez grę. To, co się nie zmieści, nie jest wysyłane.',
    itemsAdd: 'Dodaj',
    itemsAmount: 'Ilość',
    itemsRemove: 'Usuń',
    itemsEmpty: 'Wyszukaj w katalogu i dodaj przedmioty do wysłania.',
    itemsAction: 'Wyślij przedmioty ({count})',
    itemsConfirm:
      'Przedmioty są umieszczane w ładowni egzokombinezonu aktualnie wczytanego zapisu. Najpierw tworzona jest kopia zapasowa folderu zapisów. Zmiana zostanie zapisana, gdy gra zapisze stan.',
    selectTitle: 'Wybierz, co wysłać',
    selectHint: 'Zaznacz jeden wpis, kilka lub wszystkie. Wysyłane są tylko wybrane wpisy.',
    selectSearch: 'Szukaj po nazwie lub ID',
    selectAllShown: 'Zaznacz wszystkie widoczne',
    selectClear: 'Wyczyść zaznaczenie',
    selectCount: 'Zaznaczono: {count}',
    selectShowing: 'Widoczne: {shown} z {total}. Użyj wyszukiwania, aby zawęzić listę.',
    selectAction: 'Wyślij zaznaczone ({count})',
    selectNoCatalog: 'Nazwy pojawią się po odczytaniu katalogu z gry (Biblioteka, Katalog gry).',
    selectNone: 'Nic nie pasuje do wyszukiwania.',
    title: 'Wyślij do gry',
    hint: 'Korzysta z mostu badawczego tej wersji deweloperskiej.',
    action: 'Dostarcz wszystko',
    sending: 'Wysyłanie…',
    confirmTitle: 'Wysłać to do uruchomionej gry?',
    confirmSlot:
      'Zmienia slot zapisu wczytany teraz w grze. Najpierw kopiowany jest folder zapisów.',
    confirmAccount:
      'Zmienia Twoje konto, wspólne dla wszystkich slotów zapisu, a gra je synchronizuje. Najpierw kopiowane są folder zapisów i plik ustawień.',
    confirm: 'Wyślij',
    cancel: 'Anuluj',
    result: 'Wynik',
    backup: 'Kopia zapasowa: {path}',
    time: 'Czas',
    activityEmptyTitle: 'Jeszcze nic nie wysłano',
    activityEmptyBody: 'Tutaj pojawiają się dostawy z tej sesji.',
    state: {
      currency_data_missing:
        'Pliku danych walut nie ma w folderze modów gry albo jest w innej wersji. Nic nie zostało wysłane.',
      selection_invalid:
        'Zaznaczenie zawiera wpis, którego ten obszar nie oferuje. Nic nie zostało wysłane.',
      unavailable: 'Dostępne tylko w wersji deweloperskiej.',
      installation_not_selected: 'Najpierw wybierz instalację gry.',
      game_not_running: 'Uruchom grę i wczytaj zapis.',
      bridge_missing: 'Most nie jest zainstalowany w folderze gry.',
      bridge_untested: 'Zainstalowany most nie jest przetestowaną wersją.',
      ready: 'Gotowe: gra uruchomiona, proces {id}.',
      busy: 'Trwa inna dostawa.',
      backup_failed: 'Nie udało się utworzyć kopii zapasowej; nic nie wysłano.'
    },
    outcome: {
      completed: 'Gotowe',
      unknown: 'Wynik nieznany',
      failed: 'Niepowodzenie',
      refused: 'Nie wysłano'
    },
    outcomeHint: {
      completed: 'Gra odpowiedziała na każde żądanie. Zapisz w grze, aby to zachować.',
      unknown: 'Gra nie odpowiedziała na czas. Nie wysyłaj ponownie; sprawdź w grze.',
      failed: 'Żądanie zostało odrzucone, zanim dotarło do gry.',
      refused: 'Nic nie wysłano.'
    }
  },
  bridgePage: {
    versionApp: 'Wersja aplikacji',
    versionBridge: 'Wersja zainstalowanego mostu',
    versionNone: 'Nie zainstalowano',
    versionOld: 'Starsza, bez wersji',
    versionCurrent: 'Most jest aktualny.',
    versionOutdated: 'Most jest nieaktualny. Ta aplikacja zawiera most {version}.',
    detect: 'Wykryj automatycznie',
    detecting: 'Wyszukiwanie…',
    detectNone: 'Nie znaleziono instalacji. Wybierz folder samodzielnie.',
    detectSeveral: 'Znaleziono więcej niż jedną instalację. Wybierz tę, na której grasz.',
    installationTitle: 'Instalacja gry',
    installationSelected: 'Wybrano: {name}.',
    installationNone: 'Wybierz folder instalacji No Man’s Sky.',
    installationInvalid: 'Wybrany folder nie jest prawidłową instalacją No Man’s Sky.',
    select: 'Wybierz instalację',
    verifying: 'Sprawdzanie…',
    bridgeTitle: 'Most badawczy',
    bridgeHint: 'Składnik wewnątrz gry, który wykonuje dostawy.',
    diagnosticsTitle: 'Diagnostyka tylko do odczytu',
    diagnosticsHint:
      'Łączy prywatny host środowiska uruchomieniowego, który nie ma żadnego polecenia dostawy. Nie zamykaj tego okna, dopóki nie zamkniesz gry.',
    connect: 'Połącz środowisko tylko do odczytu',
    starting: 'Uruchamianie…',
    diagNotConnected: 'Nie połączono środowiska diagnostycznego.',
    diagHostReady: 'Host środowiska jest gotowy i czeka na grę.',
    diagAuthenticated: 'Uzgadnianie zakończone; oczekiwanie na wywołanie zwrotne gry.',
    diagCallbackReady: 'Wywołanie zwrotne tylko do odczytu jest aktywne w grze.',
    diagFailed: 'Diagnostyka nie powiodła się ({reason}).',
    diagEnded: 'Sesja diagnostyczna zakończyła się wraz z grą.'
  },
  catalogPage: {
    generate: 'Odczytaj z gry',
    refresh: 'Odczytaj ponownie',
    generating: 'Odczytywanie plików gry…',
    generateHint:
      'Katalog jest odczytywany z twojej własnej instalacji. Nic nie jest zmieniane w folderze gry i żaden zapis nie jest otwierany.',
    imported: 'Odczytano z gry wpisy: {count}.',
    failInstallation: 'Najpierw wybierz instalację gry.',
    failArchives: 'Nie znaleziono plików danych gry w wybranej instalacji.',
    failStructure:
      'Gra została zaktualizowana i jej tabele się zmieniły. Ta wersja aplikacji nie potrafi ich jeszcze odczytać.',
    failUnreadable: 'Nie udało się odczytać plików danych gry.',
    unavailableTitle: 'Lokalny katalog jest niedostępny',
    unavailableBody: 'W tym profilu aplikacji nie wygenerowano jeszcze katalogu.',
    title: 'Lokalny katalog',
    description:
      'Definicje tylko do odczytu wyodrębnione z wybranej instalacji gry. Wynik nie oznacza, że przedmiot można dostarczyć.',
    buildBadge: 'Wersja {build}',
    searchLabel: 'Szukaj w lokalnym katalogu',
    searchPlaceholder: 'Szukaj po nazwie lub ID gry',
    all: 'Wszystko',
    substance: 'Substancje',
    product: 'Produkty',
    technology: 'Technologie',
    matching: 'Pasujące definicje: {count}',
    loading: 'Wczytywanie definicji…',
    languages: 'Języki gry: {count}'
  },
  words: {
    hint: 'Każdy wiersz to słowo z gry, a każda kolumna to język; pole istnieje tylko tam, gdzie dany język ma to słowo. Gra uczy słów grupami, więc zaznaczenie słowa zaznacza też pozostałe formy jego grupy w tym języku (porzucić i opuszczony). Zaznaczone pole to to, co zostanie wysłane: gra nie jest pytana, które słowa już znasz.',
    id: 'ID',
    marked: 'Zaznaczono {count} z {total}',
    word: 'Słowo',
    raceAll: 'Wszystkie pokazane słowa: {race}',
    race: {
      Traders: 'Gek',
      Warriors: 'Vy’keen',
      Explorers: 'Korvax',
      Atlas: 'Atlas',
      Builders: 'Autofag'
    }
  },
  missions: {
    warningTitle: 'Eksperymentalne: użyj zapisu testowego',
    warning:
      'Gra jest proszona, przez własną nagrodę, o ukończenie każdej zaznaczonej misji. Zadanie to tytuł w dzienniku gry; misje, które go noszą, są wymienione w nim. Nie wiadomo jeszcze, czy gra wręcza to, co dałyby pominięte etapy, ani czy rozpoczyna następną misję, a strona nie potrafi jeszcze pokazać, które misje są aktywne w twoim zapisie. Zapis jest kopiowany przed wysłaniem.',
    search: 'Szukaj po zadaniu, misji lub ID',
    untitled: 'Pokaż misje bez tytułu w grze',
    untitledHint:
      'Misje pomocnicze, których gra nigdy nie nazywa w dzienniku. Są wymienione według identyfikatora.',
    untitledGroup: 'Bez tytułu w grze',
    section: {
      story: 'Główna fabuła',
      atlas: 'Ścieżka Atlasu',
      secondary: 'Misje poboczne',
      guide: 'Przewodnik i kamienie milowe',
      seasonal: 'Ekspedycje'
    },
    part: 'Część {number}',
    after: 'Zaczyna się po: {quest}',
    silent: 'brak komunikatu o ukończeniu w grze',
    quests: '{shown} z {total} zadań',
    count: 'Misje: {count}',
    stages: 'Etapy: {count}',
    rewards: 'Nagrody: {count}',
    chosen: 'Zaznaczono: {count}',
    action: 'Ukończ wszystkie',
    actionChosen: 'Ukończ zaznaczone ({count})'
  },
  levels: {
    hint: {
      standings:
        'Gra przechowuje każdą reputację jako liczbę i pokazuje ją jako rangę o jedenastu poziomach. Sama gra jest proszona, przez własną nagrodę, o ustawienie liczby wybranego poziomu; nigdy nie jest ona obniżana. Eksperymentalne: jeszcze nie widziano działania w grze.',
      milestones:
        'Kamień milowy to licznik gry (poznane słowa, odwiedzone układy, zniszczone statki) o jedenastu poziomach. Sama gra jest proszona, przez własną nagrodę, o ustawienie licznika na wartość wybranego poziomu. Zmienia się tylko licznik: podniesienie zebranych słów nie uczy żadnego słowa. Nic nie jest obniżane. Eksperymentalne: jeszcze nie widziano działania w grze.'
    },
    mode: 'Jak daleko',
    modeOne: '1 poziom',
    modeSome: 'Kilka poziomów',
    modeAll: 'Do ostatniego poziomu',
    modeHint:
      'Liczone od poziomu, na którym każda pozycja jest teraz. To, co jest już na ostatnim poziomie, pozostaje bez zmian.',
    messageHint:
      'To gra decyduje, które pozycje ogłaszają nowy poziom: reputacje i główne kamienie milowe to robią; pozostałe zmieniają się bez żadnego komunikatu, także podczas zwykłej gry. Każdy wiersz podaje, jak jest.',
    message: {
      full: 'pełny komunikat',
      quick: 'krótki komunikat',
      silent: 'brak komunikatu w grze'
    },
    announce: 'Pokazuj ekran kamienia milowego także dla cichych pozycji',
    announceHint:
      'Gra pokazuje pełny ekran „osiągnięto kamień milowy” tylko dla niektórych pozycji. Włączone: gra jest proszona o pokazanie tego samego ekranu, z rangą i nazwą pozycji, także dla tych, które zwykle zmieniają się po cichu. Jej tabela jest zmieniana tylko na czas przyznania poziomu i od razu przywracana.',
    count: 'Poziomy',
    countHint: 'O ile poziomów w górę, od 1 do {max}.',
    action: 'Podnieś wszystkie',
    actionChosen: 'Podnieś wybrane ({count})'
  },
  glyphs: {
    hint: 'Glify przekazuje sama gra, z własnym powiadomieniem, tak jak wtedy, gdy grób Podróżnika daje jeden. Gra nie potrafi dać wybranego glifu: przychodzą w kolejności gry, pokazanej poniżej.',
    order: 'Kolejność glifów w grze',
    all: 'Wszystkie szesnaście',
    allHint: 'Wszystkie glify naraz.',
    count: 'Ile',
    countHint: 'Kolejne glify, których jeszcze nie masz, od 1 do {max}.',
    action: 'Poznaj glify'
  },
  teleport: {
    hint: 'Podróż wykonuje sama uruchomiona gra: prośba jest składana tak, jak robią to jej teleportery. Trafiasz na stację kosmiczną układu albo na planetę wskazaną przez pierwszy glif. Eksperymentalne.',
    galaxy: 'Galaktyka',
    galaxyHint: 'Wszystkie galaktyki gry, według numeru i nazwy. Pisz, aby szukać.',
    galaxyEmpty: 'Nie znaleziono galaktyki.',
    galaxyNumber: 'Galaktyka {number}',
    address: 'Adres portalu',
    addressHint:
      'Dwanaście glifów jako cyfry od 0 do F: planeta, układ, potem trzy współrzędne. Klikaj je lub wklej kod.',
    erase: 'Usuń ostatni glif',
    destination: 'Miejsce przybycia',
    destinationHint:
      'Stacja kosmiczna to bezpieczny wybór. Planeta korzysta z pierwszego glifu adresu.',
    toStation: 'Stacja kosmiczna układu',
    toPlanet: 'Planeta z adresu',
    action: 'Teleportuj',
    confirmBody:
      'Opuszczasz obecne miejsce, a gra wczytuje inny układ. Zapisz wcześniej, jeśli chcesz wrócić dokładnie tutaj.',
    favourites: 'Zapisane cele',
    favouritesHint: 'Przechowywane przez tę aplikację na tym komputerze; gra ich nie widzi.',
    favouriteName: 'Nazwa celu',
    addFavourite: 'Zapisz ten adres',
    useFavourite: 'Użyj',
    removeFavourite: 'Usuń',
    noFavourites: 'Nic jeszcze nie zapisano.'
  },
  workshop: {
    title: 'Warsztat modeli',
    description:
      'Wybierz, co chcesz zobaczyć, a potem wpisz ziarno, wylosuj je albo wybierz części i pozwól aplikacji znaleźć ziarno, które je ma.',
    tabBuild: 'Złóż',
    tabView: 'Zobacz ziarno',
    buildDescription:
      'Wybierz typ, części, kolory i tekstury. Aplikacja poszuka ziarna, które je ma, i je pokaże.',
    viewDescription: 'Wybierz typ i wpisz ziarno albo wylosuj je, aby zobaczyć, jak wygląda.',
    colorTitle: 'Kolory',
    roles: {
      primary: 'Kolor główny',
      secondary: 'Kolor dodatkowy',
      decal1: 'Kolor naklejki 1',
      decal2: 'Kolor naklejki 2'
    },
    texturesTitle: 'Tekstury i naklejki',
    baseTexture: { COATING: 'Powłoka', PAINTED: 'Lakierowana', PANELS: 'Metal' },
    seedTexturesTitle: 'Tekstury i naklejki tego ziarna',
    colorHint:
      'Każdy kolor, który model bierze z palet gry. Wybierz jeden, a potem jego barwę; Dowolna zostawia go ziarnu.',
    seedColorsTitle: 'Kolory tego ziarna',
    paintLabel: 'Lakier',
    undercoatLabel: 'Podkład',
    tabSystem: 'Bieżący układ',
    systemDescription:
      'Układ gwiezdny, w którym jesteś, odczytany z działającej gry: jego ziarno i statki, które gra dla niego wygenerowała. Nic w grze nie jest zmieniane.',
    systemNone:
      'Nie ma nic do pokazania. Gra musi działać z mostem 1.8.0 lub nowszym i wczytanym zapisem; lista odświeża się co kilka sekund.',
    systemSeed: 'Ziarno układu',
    systemShips: 'Statki tego układu',
    systemClass: 'Klasa',
    systemRole: 'Rola',
    systemShipSeed: 'Ziarno',
    systemView: 'Zobacz',
    systemRefresh: 'Odśwież',
    systemClassNumber: 'Klasa {number}',
    systemStream:
      'Sprawdzono: ziarna statków leżą w strumieniu liczb ziarna układu; pierwsze jest losowane po {steps} krokach.',
    systemStreamUnknown: 'Ziaren statków nie znaleziono w strumieniu liczb ziarna układu.',
    tabFile: 'Plik modelu',
    categoryLabel: 'Kategoria',
    category: { starship: 'Statek', multitool: 'Multinarzędzie', freighter: 'Frachtowiec' },
    kindLabel: 'Typ',
    toolKind: {
      standard: 'Standardowe',
      royal: 'Królewskie',
      sentinel: 'Strażnicze',
      sentinelB: 'Strażnicze B',
      atlasSceptre: 'Berło Atlasu',
      atlas: 'Atlantydzkie',
      staff: 'Laska',
      staffRuin: 'Filar Tytana',
      staffBone: 'Korona bazyliszka',
      switch: 'Nieskończony Neon XXII',
      retro: 'Starbound v0.27',
      swarm: 'Dezintegrator grosy',
      staffNpc: 'Kostur NPC'
    },
    seedLabel: 'Ziarno',
    homeSeedHint:
      'Frachtowiec bierze kolory ze swojego macierzystego układu gwiezdnego, a ziarno układu to jego adres w galaktyce. Wpisz ziarno, wylosuj je albo podaj poniżej adres portalu układu; puste pole pokazuje frachtowiec bez kolorów.',
    homeAddress: 'To ziarno to układ o adresie portalu {glyphs} w galaktyce {galaxy}.',
    glyphsLabel: 'Adres portalu (12 glifów jako 0–9, A–F)',
    galaxyLabel: 'Numer galaktyki',
    useAddress: 'Użyj tego układu',
    legacyColours: 'Użyj starych kolorów',
    legacyColoursHint:
      'Gra ma dwa sposoby losowania kolorów ziarna. Multinarzędzia, które wydaje, używają starego; statki są oznaczane pojedynczo w zapisie (Użyj starych kolorów).',
    seedOrigin:
      'Gra losuje to ziarno w układzie o adresie portalu {glyphs} w galaktyce {galaxy} (po {steps} krokach jego strumienia liczb). To wskazówka, nie dowód.',
    seedHint: 'Szesnaście cyfr szesnastkowych po 0x. Naciśnij Enter lub Pokaż, aby je zobaczyć.',
    show: 'Pokaż',
    generate: 'Wygeneruj ziarno',
    generateWithParts: 'Wygeneruj z tymi częściami',
    clearParts: 'Wyczyść części',
    getInGame: 'Zdobądź ten w grze',
    found: 'Ziarno znalezione po {tries} próbach',
    building: 'Składanie modelu…',
    empty: 'Na razie nie ma nic do pokazania',
    partsTitle: 'Części',
    partsHint:
      'Wybierz części, które chcesz, a resztę zostaw jako Dowolna. Pod częścią, która ma własne części, pojawiają się kolejne listy.',
    anyPart: 'Dowolna',
    rare: 'rzadka',
    detailsTitle: 'Szczegóły wylosowane przez ziarno',
    note: 'Model jest odczytywany z twoich własnych plików gry. Części, warstwy tekstur, naklejki i kolory wynikają z ziarna; oświetlenie i efekty materiałów są uproszczone, więc metal i cieniowanie wyglądają inaczej niż w grze. Części porównano z niezależnym narzędziem i z multinarzędziem kupionym w uruchomionej grze; kolory są zbliżone, nie dokładne.',
    errors: {
      INSTALLATION_NOT_SELECTED: 'Najpierw wybierz folder gry w sekcji Most.',
      UNKNOWN_KIND: 'Ten typ jest niedostępny.',
      INVALID_SEED: 'Ziarno musi mieć postać 0x i najwyżej szesnastu cyfr szesnastkowych.',
      GAME_FILES_UNREADABLE: 'Nie udało się odczytać plików gry tego modelu.',
      MODEL_TOO_LARGE: 'Ten model jest zbyt duży, aby go pokazać.',
      SEED_NOT_FOUND:
        'Nie znaleziono na czas ziarna z tymi częściami. Spróbuj ponownie albo zostaw jedną część dowolną.'
    }
  },
  preview: {
    title: 'Warsztat modeli',
    description: 'Obejrzyj lokalny statyczny model GLB i złóż jego widoczne części.',
    stage: 'Podgląd eksperymentalny',
    import: 'Otwórz model GLB',
    loading: 'Wczytywanie modelu…',
    empty: 'Wybierz lokalny model, aby rozpocząć',
    hint: 'Przeciągnij, aby obrócić, przewiń, aby przybliżyć, i przeciągnij prawym przyciskiem, aby przesunąć.',
    limits:
      'Ta wersja przyjmuje statyczne pliki GLB do 64 MiB, tylko z osadzonymi teksturami PNG i bez zasobów zewnętrznych. Natywna konwersja zasobów NMS nie jest jeszcze podłączona.',
    warning:
      'Wybór części i odcień dotyczą tylko tego podglądu. Nie obliczają ziarna i nie dostarczają statku.',
    parts: 'Widoczne części',
    all: 'Pokaż wszystko',
    none: 'Ukryj wszystko',
    filter: 'Filtruj części według nazwy',
    tint: 'Odcień podglądu',
    original: 'Przywróć kolory modelu',
    reset: 'Zresetuj kamerę',
    palettes: 'Palety gry',
    paletteHelp: 'Otwórz wyodrębniony plik BASECOLOURPALETTES.MBIN z obsługiwanego zestawu danych.',
    importPalette: 'Otwórz MBIN palet',
    seed: 'Eksperymentalne ziarno koloru',
    calculatePalette: 'Oblicz próbki kolorów',
    calculatedSeed: 'Obliczone ziarno',
    family: 'Rodzina palet',
    samples: 'Pięć próbek kolorów',
    sample: 'Próbka koloru',
    paletteIndex: 'Kolor źródłowy',
    colorTarget: 'Zastosuj do',
    visibleTarget: 'Wszystkie widoczne części',
    applyColor: 'Zastosuj wybrany kolor',
    paletteWarning:
      'Eksperymentalne obliczanie palety bazowej. Próbki RGB zmieniają kolor części; nie przewidują natywnych masek tekstur, wyglądu statku ani odwrotnego ziarna.',
    INVALID_PALETTE: 'Ten plik nie odpowiada odciskowi obsługiwanej palety bazowej.',
    INVALID_SEED: 'Wpisz 0x, a po nim od 1 do 16 cyfr szesnastkowych.',
    PALETTE_UNAVAILABLE: 'Otwórz obsługiwany plik palety przed obliczeniem kolorów.',
    failed: 'Nie udało się wyświetlić modelu.',
    INVALID_MODEL: 'Plik nie jest prawidłowym modelem w granicach podglądu.',
    UNSUPPORTED_MODEL:
      'Ten model używa tekstur, animacji, rozszerzeń lub geometrii spoza obsługiwanego zakresu.',
    FILE_UNAVAILABLE: 'Nie udało się odczytać wybranego pliku.'
  },
  appearance: {
    title: 'Przepis wyglądu według ziarna',
    open: 'Otwórz przepis wyglądu',
    apply: 'Zastosuj przepis do podglądu',
    help: 'Zaimportuj przepis lub raport z wyszukiwania ziaren z jawnymi powiązaniami siatek.',
    warning:
      'Podgląd kandydata: tylko jawne części i próbki RGB. Natywne tekstury DDS, maski i shadery nie są odtwarzane.',
    mismatch: 'Odcisk modelu lub nazwy siatek nie pasują. Nie wprowadzono żadnych zmian.',
    failed: 'Nie udało się odczytać pliku jako obsługiwanego przepisu wyglądu.',
    seed: 'Ziarno kandydata',
    applied: 'Przepis zastosowano do podglądu',
    candidate: 'Kandydat częściowego ewaluatora'
  },
  controls: {
    changeLanguage: 'Zmień język',
    changeTheme: 'Zmień motyw',
    light: 'Jasny',
    dark: 'Ciemny',
    system: 'Systemowy'
  }
}
