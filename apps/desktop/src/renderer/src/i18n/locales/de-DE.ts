import type { Messages } from '../messages'

export const deDE: Messages = {
  app: { name: 'NMS Courier', tagline: 'Lokale Lieferung für No Man’s Sky' },
  groups: {
    overview: 'Übersicht',
    deliver: 'Liefern',
    unlock: 'Freischalten',
    rewards: 'Belohnungen',
    library: 'Bibliothek',
    system: 'System'
  },
  features: {
    dashboard: {
      title: 'Übersicht',
      summary: 'Ob eine Lieferung gerade möglich ist, und warum.'
    },
    activity: {
      title: 'Aktivität',
      summary: 'Jede an das Spiel gesendete Anfrage und ihr Ergebnis.'
    },
    items: {
      title: 'Gegenstände',
      summary:
        'Substanzen und Produkte, die in ein Inventar des geladenen Spielstands gelegt werden.'
    },
    currencies: { title: 'Währungen', summary: 'Units, Naniten und Quecksilber.' },
    exosuit: {
      title: 'Exo-Anzug',
      summary: 'Klasse, Fracht- und Technologieplätze sowie aufgeladene Plätze des Exo-Anzugs.'
    },
    starships: {
      title: 'Raumschiffe',
      summary: 'Klasse, Inventargröße und aufgeladene Plätze des Raumschiffs, das du besitzt.'
    },
    multitools: {
      title: 'Multiwerkzeuge',
      summary: 'Klasse, Plätze und aufgeladene Plätze des ausgerüsteten Multiwerkzeugs.'
    },
    freighters: {
      title: 'Frachter',
      summary: 'Ein Frachterangebot mit gewählter Klasse, gewähltem Modell und gewählten Seeds.'
    },
    frigates: { title: 'Fregatten', summary: 'Fregatten für die Flotte anwerben.' },
    corvettes: {
      title: 'Korvetten',
      summary: 'Eine Korvette, gebaut nach einem geteilten Bauplan.'
    },
    companions: { title: 'Gefährten', summary: 'Gefährteneier und Kreaturen.' },
    technologies: {
      title: 'Technologien',
      summary: 'Baupläne, die die Spielfigur installieren kann.'
    },
    productRecipes: {
      title: 'Herstellungsrezepte',
      summary: 'Rezepte für herstellbare Gegenstände und herstellbare Technologie.'
    },
    buildParts: {
      title: 'Bauteile',
      summary: 'Basis-, Frachter- und Dekorationsteile im Baumenü.'
    },
    refinerRecipes: {
      title: 'Raffinieren und Kochen',
      summary: 'Rezepte der Raffinerie und des Nährstoffprozessors im Katalog.'
    },
    customisation: {
      title: 'Aussehen',
      summary: 'Helme, Rüstungen, Umhänge, Banner, Jetpack-Spuren und Gesten.'
    },
    titles: { title: 'Titel', summary: 'Spielertitel für das Banner.' },
    fishing: { title: 'Angelrekorde', summary: 'Der Fangrekord jedes Fisches.' },
    expeditions: {
      title: 'Expeditionen',
      summary: 'Belohnungen vergangener Expeditionen, abholbar beim Quecksilber-Begleiter.'
    },
    twitch: {
      title: 'Twitch-Drops',
      summary: 'Belohnungen aus Twitch-Kampagnen, abholbar beim Quecksilber-Begleiter.'
    },
    platform: {
      title: 'Plattform und Vorbestellung',
      summary:
        'Belohnungen, die an eine Plattform, eine Vorbestellung oder ein Ereignis gebunden sind.'
    },
    quicksilver: {
      title: 'Quecksilber-Laden',
      summary: 'Gegenstände, die der Quecksilber-Begleiter verkauft.'
    },
    catalog: {
      title: 'Spielkatalog',
      summary: 'Durchsuche die Gegenstände deines installierten Spiels.'
    },
    models: {
      title: 'Modellwerkstatt',
      summary: 'Vorschau importierter Modelle und Farbpaletten.'
    },
    bridge: {
      title: 'Spiel und Brücke',
      summary: 'Installation, Spielversion und die Verbindung zum laufenden Spiel.'
    },
    saves: {
      title: 'Spielstände und Konto',
      summary: 'Welcher Speicherplatz geladen ist und was das gesamte Konto teilt.'
    },
    settings: { title: 'Einstellungen', summary: 'Sprache, Aussehen und Details zur Anwendung.' }
  },
  status: { verified: 'Bestätigt', experimental: 'Experimentell', planned: 'Geplant' },
  statusHint: {
    verified: 'Hat im laufenden Spiel auf der Forschungsversion funktioniert.',
    experimental: 'Funktioniert teilweise oder nur unter bekannten Bedingungen.',
    planned: 'Noch nicht gebaut.'
  },
  scope: {
    slot: 'Speicherplatz',
    account: 'Konto',
    both: 'Speicherplatz und Konto',
    none: 'Keine Änderung'
  },
  scopeHint: {
    slot: 'Ändert nur den geladenen Speicherplatz.',
    account: 'Ändert das Konto, das alle Speicherplätze teilen.',
    both: 'Ändert den geladenen Speicherplatz und das Konto.',
    none: 'Nur Lesen; im Spiel ändert sich nichts.'
  },
  rows: {
    deliverable: 'Geliefert',
    blockedDamaged: 'Einträge beschädigter Plätze, nie geliefert',
    blockedMaintenance: 'Wartungseinträge, nie geliefert',
    blockedTemplates: 'Prozedurale Vorlagen, nie geliefert',
    blockedById: 'Durch eine dauerhafte Regel gesperrt',
    catalogueItems: 'Herstellbare Gegenstände',
    craftableTechnology: 'Herstellbare Technologie',
    buildParts: 'Bauteile',
    researchTree: 'An Forschungsterminals verkauft',
    repeatableNever: 'Wiederholbare Käufe, nie freigeschaltet',
    missionBound: 'An eine Mission gebunden, übersprungen',
    redeemedInSave: 'Im Spielstand vermerkt',
    itemRewards: 'Gegenstände zum Abholen im Laden',
    total: 'Im Spiel'
  },
  rules: {
    gameRoutines:
      'Alles erledigt das laufende Spiel selbst. Spielstanddateien werden nie bearbeitet.',
    defectiveNever: 'Defekte und interne Einträge werden nie geliefert, in keinem Modus.',
    repeatableNever:
      'Feuerwerk, das Mythos-Signalfeuer und das Leeren-Ei werden nie freigeschaltet: Der Laden würde sie nicht mehr verkaufen.',
    claimItems:
      'Schiffe, Multiwerkzeuge, Eier und Pakete werden im Konto freigeschaltet; hole sie im Laden ab, um den Gegenstand zu erhalten.',
    keepList:
      'Twitch-Drops bleiben nur abholbar, solange die Brücke installiert ist. Hole ab, was du behalten möchtest.',
    backup: 'Der Spielstandordner wird vor jeder Änderung kopiert.',
    slotIdentified: 'Der geladene Speicherplatz wird vor jeder Lieferung ermittelt.',
    accountShared:
      'Kontoänderungen erreichen alle Speicherplätze und werden vom Spiel synchronisiert.'
  },
  page: {
    availabilityTitle: 'In diesem Fenster noch nicht verfügbar',
    availabilityBody:
      'Dies wurde über die Forschungsbrücke durchgeführt. Die Verbindung dieser Anwendung zum Spiel wird noch gebaut, daher kann von hier nichts gesendet werden.',
    includes: 'Was es umfasst',
    includesHint: 'Zahlen der Forschungsversion.',
    rulesTitle: 'Wie es sich verhält',
    rulesHint: 'Regeln, die immer gelten.',
    entries: 'Einträge',
    kind: 'Art',
    status: 'Status',
    scope: 'Ändert',
    researchBuild: 'Forschungsversion {build}',
    plannedTitle: 'Noch nicht gebaut',
    plannedBody:
      'Dieser Bereich ist geplant. Er erscheint hier, sobald er im laufenden Spiel funktioniert.',
    open: 'Öffnen'
  },
  dashboard: {
    game: 'Spiel',
    build: 'Spielversion',
    bridge: 'Brücke',
    catalog: 'Katalog',
    capabilities: 'Was Courier kann',
    capabilitiesHint: 'Jeder Bereich, was er ändert und wie weit er nachgewiesen ist.',
    feature: 'Bereich',
    area: 'Gruppe',
    running: 'Läuft',
    notRunning: 'Geschlossen',
    notSelected: 'Keine Installation ausgewählt',
    unknown: 'Unbekannt',
    supported: 'Unterstützt',
    unsupported: 'Nicht unterstützt',
    connected: 'Verbunden',
    notConnected: 'Nicht verbunden',
    available: 'Verfügbar',
    unavailable: 'Nicht erzeugt',
    entriesCount: '{count} Einträge',
    processId: 'Prozess {id}'
  },
  settings: {
    general: 'Allgemein',
    appearance: 'Darstellung',
    about: 'Info',
    language: 'Sprache',
    languageHint: 'Die vierzehn Sprachen von No Man’s Sky.',
    theme: 'Design',
    themeHint: 'Folgt standardmäßig dem System.',
    experimental: 'Experimentelle Software',
    experimentalBody:
      'NMS Courier ist ein inoffizielles Werkzeug in Entwicklung. Es funktioniert jeweils mit genau einer Spielversion.'
  },
  delivery: {
    title: 'An das Spiel senden',
    hint: 'Nutzt die Forschungsbrücke dieser Entwicklungsversion.',
    action: 'Alles liefern',
    sending: 'Wird gesendet…',
    confirmTitle: 'Dies an das laufende Spiel senden?',
    confirmSlot:
      'Ändert den Speicherplatz, der gerade im Spiel geladen ist. Der Spielstandordner wird vorher kopiert.',
    confirmAccount:
      'Ändert dein Konto, das alle Speicherplätze teilen, und das Spiel synchronisiert es. Der Spielstandordner und die Einstellungsdatei werden vorher kopiert.',
    confirm: 'Senden',
    cancel: 'Abbrechen',
    result: 'Ergebnis',
    backup: 'Sicherung: {path}',
    time: 'Zeit',
    activityEmptyTitle: 'Noch nichts gesendet',
    activityEmptyBody: 'Lieferungen dieser Sitzung erscheinen hier.',
    state: {
      unavailable: 'Nur in einer Entwicklungsversion verfügbar.',
      installation_not_selected: 'Wähle zuerst die Spielinstallation aus.',
      game_not_running: 'Starte das Spiel und lade einen Spielstand.',
      bridge_missing: 'Die Brücke ist nicht im Spielordner installiert.',
      bridge_untested: 'Die installierte Brücke ist keine getestete Version.',
      ready: 'Bereit: Spiel läuft, Prozess {id}.',
      busy: 'Eine andere Lieferung läuft gerade.',
      backup_failed: 'Die Sicherung konnte nicht erstellt werden; es wurde nichts gesendet.'
    },
    outcome: {
      completed: 'Fertig',
      unknown: 'Ergebnis unbekannt',
      failed: 'Fehlgeschlagen',
      refused: 'Nicht gesendet'
    },
    outcomeHint: {
      completed: 'Das Spiel hat jede Anfrage beantwortet. Speichere im Spiel, um es zu behalten.',
      unknown:
        'Das Spiel hat nicht rechtzeitig geantwortet. Nicht erneut senden; im Spiel nachsehen.',
      failed: 'Eine Anfrage wurde abgelehnt, bevor sie das Spiel erreichte.',
      refused: 'Es wurde nichts gesendet.'
    }
  },
  controls: {
    changeLanguage: 'Sprache ändern',
    changeTheme: 'Design ändern',
    light: 'Hell',
    dark: 'Dunkel',
    system: 'System'
  }
}
