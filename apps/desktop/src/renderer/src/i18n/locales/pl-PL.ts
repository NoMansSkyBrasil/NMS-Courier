import type { Messages } from '../messages'

export const plPL: Messages = {
  app: { name: 'NMS Courier', tagline: 'Lokalne dostawy do No Man’s Sky' },
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
      summary: 'Podgląd zaimportowanych modeli i palet kolorów.'
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
