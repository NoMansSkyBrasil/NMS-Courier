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
  controls: {
    changeLanguage: 'Zmień język',
    changeTheme: 'Zmień motyw',
    light: 'Jasny',
    dark: 'Ciemny',
    system: 'Systemowy'
  }
}
