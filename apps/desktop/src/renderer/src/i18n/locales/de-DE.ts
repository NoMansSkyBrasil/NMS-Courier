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
    heroBody:
      'Sende Gegenstände, Währungen und Freischaltungen an dein eigenes laufendes Spiel. Alles läuft über das Spiel selbst, deine Spielstände werden nie bearbeitet, und die Namen und Symbole hier stammen aus deiner Installation.',
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
    notifications: 'Benachrichtigungen des Spiels',
    notificationsHint:
      'Lässt das Spiel seine eigene Benachrichtigung für Geliefertes anzeigen, sofern es eine gibt. Ausschalten, um still zu liefern. Inventarerweiterungen fragen nie nach einer Bestätigung.',
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
    currencyAmountHint:
      'Jeder Betrag von 1 bis {max}, dem größten Guthaben, das das Spiel speichert.',
    itemsStack: 'Stapel von {count}',
    equipActionLabel: 'Aktion',
    equipTarget: 'Raumschiff',
    equipTargetCurrent: 'Aktuelles Raumschiff',
    equipTargetSlot: 'Raumschiff in Platz {number}',
    equipClass: 'Klasse',
    equipSlots: 'Alle Inventarplätze',
    equipSlotsHint: 'Macht jede Position der Fracht- und Technologieraster nutzbar.',
    equipSupercharge: 'Aufgeladene Plätze',
    equipSuperchargeHint: 'Macht jeden nutzbaren Technologieplatz zu einem aufgeladenen Platz.',
    equipExtended: 'Zusätzliche Technologiereihen',
    equipExtendedHint:
      'Erweitert das Technologieraster auf zwölf Reihen. Erfordert alle Inventarplätze.',
    currencyHint:
      'Die Belohnung des Spiels fügt den Betrag hinzu und zeigt die eigene Benachrichtigung. Das Guthaben übersteigt nie das Maximum des Spiels.',
    currencyLabel: 'Währung',
    equipAction: {
      grid: 'Auf Inventar anwenden',
      classStep: 'Klasse um eine Stufe erhöhen',
      offer: 'Frachterangebot senden',
      build: 'Korvettenbau starten'
    },
    equipActionHint: {
      grid: 'Ändert das Inventar, das du bereits besitzt, an Ort und Stelle. Im Spiel öffnet sich nichts.',
      classStep:
        'Fordert die Upgrade-Belohnung des Spiels an: eine Klassenstufe pro Anfrage, bis S.',
      offer:
        'Das Spiel bietet dir einen Frachter mit den folgenden Optionen an. Nimm ihn im Spiel an; er ersetzt deinen aktuellen Frachter.',
      build: 'Das Spiel öffnet den Korvettenbau mit den folgenden Optionen.'
    },
    currencyName: { units: 'Units', nanites: 'Naniten', quicksilver: 'Quecksilber' },
    itemsTitle: 'Gegenstände an das Spiel senden',
    itemsHint:
      'Substanzen und Produkte kommen in die Fracht des Exo-Anzugs des geladenen Spielstands, in Stapeln der vom Spiel erlaubten Größe. Was nicht hineinpasst, wird nicht gesendet.',
    itemsAdd: 'Hinzufügen',
    itemsAmount: 'Menge',
    itemsRemove: 'Entfernen',
    itemsEmpty: 'Durchsuche den Katalog und füge die zu sendenden Gegenstände hinzu.',
    itemsAction: 'Gegenstände senden ({count})',
    itemsConfirm:
      'Die Gegenstände werden in die Fracht des Exo-Anzugs des gerade geladenen Spielstands gelegt. Vorher wird der Spielstandordner gesichert. Die Änderung wird in den Spielstand geschrieben, wenn das Spiel speichert.',
    selectTitle: 'Auswählen, was gesendet wird',
    selectHint:
      'Wähle einen Eintrag, mehrere oder alle. Nur die gewählten Einträge werden gesendet.',
    selectSearch: 'Nach Name oder ID suchen',
    selectAllShown: 'Alle angezeigten auswählen',
    selectClear: 'Auswahl aufheben',
    selectCount: '{count} ausgewählt',
    selectShowing:
      '{shown} von {total} werden angezeigt. Nutze die Suche, um die Liste einzugrenzen.',
    selectAction: 'Ausgewählte senden ({count})',
    selectNoCatalog:
      'Namen erscheinen, nachdem der Katalog aus dem Spiel gelesen wurde (Bibliothek, Spielkatalog).',
    selectNone: 'Keine Treffer für die Suche.',
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
      currency_data_missing:
        'Die Währungsdatendatei liegt nicht im Mod-Ordner des Spiels oder hat eine andere Version. Es wurde nichts gesendet.',
      selection_invalid:
        'Die Auswahl enthält einen Eintrag, den dieser Bereich nicht anbietet. Es wurde nichts gesendet.',
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
  bridgePage: {
    versionApp: 'Version der Anwendung',
    versionBridge: 'Version der installierten Brücke',
    versionNone: 'Nicht installiert',
    versionOld: 'Älter, ohne Version',
    versionCurrent: 'Die Brücke ist aktuell.',
    versionOutdated: 'Die Brücke ist veraltet. Diese Anwendung enthält die Brücke {version}.',
    detect: 'Automatisch erkennen',
    detecting: 'Suche läuft…',
    detectNone: 'Es wurde keine Installation gefunden. Wähle den Ordner selbst aus.',
    detectSeveral:
      'Es wurde mehr als eine Installation gefunden. Wähle die aus, mit der du spielst.',
    installationTitle: 'Spielinstallation',
    installationSelected: '{name} ist ausgewählt.',
    installationNone: 'Wähle den Installationsordner von No Man’s Sky.',
    installationInvalid: 'Der gewählte Ordner ist keine gültige Installation von No Man’s Sky.',
    select: 'Installation auswählen',
    verifying: 'Wird geprüft…',
    bridgeTitle: 'Forschungsbrücke',
    bridgeHint: 'Die Komponente im Spiel, die die Lieferungen ausführt.',
    diagnosticsTitle: 'Nur-Lese-Diagnose',
    diagnosticsHint:
      'Verbindet den privaten Laufzeit-Host, der keinen Lieferbefehl hat. Lass dieses Fenster geöffnet, bis du das Spiel schließt.',
    connect: 'Nur-Lese-Laufzeit verbinden',
    starting: 'Wird gestartet…',
    diagNotConnected: 'Keine Diagnoselaufzeit verbunden.',
    diagHostReady: 'Der Laufzeit-Host ist bereit und wartet auf das Spiel.',
    diagAuthenticated: 'Handshake abgeschlossen; warte auf den Rückruf des Spiels.',
    diagCallbackReady: 'Der Nur-Lese-Rückruf ist im Spiel aktiv.',
    diagFailed: 'Diagnose fehlgeschlagen ({reason}).',
    diagEnded: 'Die Diagnosesitzung wurde mit dem Spiel beendet.'
  },
  catalogPage: {
    generate: 'Aus dem Spiel lesen',
    refresh: 'Erneut lesen',
    generating: 'Spieldateien werden gelesen…',
    generateHint:
      'Der Katalog wird aus deiner eigenen Installation gelesen. Im Spielordner wird nichts geändert und kein Spielstand geöffnet.',
    imported: '{count} Einträge aus dem Spiel gelesen.',
    failInstallation: 'Wähle zuerst die Installation des Spiels aus.',
    failArchives:
      'Die Datendateien des Spiels wurden in der ausgewählten Installation nicht gefunden.',
    failStructure:
      'Das Spiel wurde aktualisiert und seine Tabellen haben sich geändert. Diese Version der Anwendung kann sie noch nicht lesen.',
    failUnreadable: 'Die Datendateien des Spiels konnten nicht gelesen werden.',
    unavailableTitle: 'Der lokale Katalog ist nicht verfügbar',
    unavailableBody: 'In diesem Anwendungsprofil wurde noch kein Katalog erzeugt.',
    title: 'Lokaler Katalog',
    description:
      'Nur-Lese-Definitionen aus der gewählten Spielinstallation. Ein Treffer bedeutet nicht, dass der Gegenstand geliefert werden kann.',
    buildBadge: 'Version {build}',
    searchLabel: 'Lokalen Katalog durchsuchen',
    searchPlaceholder: 'Nach Name oder Spiel-ID suchen',
    all: 'Alle',
    substance: 'Substanzen',
    product: 'Produkte',
    technology: 'Technologien',
    matching: '{count} passende Definitionen',
    loading: 'Definitionen werden geladen…',
    languages: '{count} Spielsprachen'
  },
  preview: {
    title: 'Modellwerkstatt',
    description:
      'Untersuche ein lokales statisches GLB-Modell und stelle seine sichtbaren Teile zusammen.',
    stage: 'Experimentelle Vorschau',
    import: 'GLB-Modell öffnen',
    loading: 'Modell wird geladen…',
    empty: 'Wähle ein lokales Modell, um zu beginnen',
    hint: 'Ziehen zum Drehen, Scrollen zum Zoomen und mit der rechten Maustaste ziehen zum Verschieben.',
    limits:
      'Diese Version akzeptiert statische GLB-Dateien bis 64 MiB, nur mit eingebetteten PNG-Texturen und ohne externe Ressourcen. Die native Umwandlung von NMS-Assets ist noch nicht angebunden.',
    warning:
      'Teileauswahl und Tönung betreffen nur diese Vorschau. Sie berechnen keinen Seed und liefern kein Schiff.',
    parts: 'Sichtbare Teile',
    all: 'Alle anzeigen',
    none: 'Alle ausblenden',
    filter: 'Teile nach Namen filtern',
    tint: 'Tönung der Vorschau',
    original: 'Modellfarben wiederherstellen',
    reset: 'Kamera zurücksetzen',
    palettes: 'Spielpaletten',
    paletteHelp: 'Öffne die extrahierte BASECOLOURPALETTES.MBIN aus dem unterstützten Datensatz.',
    importPalette: 'Paletten-MBIN öffnen',
    seed: 'Experimenteller Farb-Seed',
    calculatePalette: 'Farbproben berechnen',
    calculatedSeed: 'Berechneter Seed',
    family: 'Palettenfamilie',
    samples: 'Fünf Farbproben',
    sample: 'Farbprobe',
    paletteIndex: 'Quellfarbe',
    colorTarget: 'Anwenden auf',
    visibleTarget: 'Alle sichtbaren Teile',
    applyColor: 'Gewählte Farbe anwenden',
    paletteWarning:
      'Experimentelle Berechnung der Basispalette. RGB-Proben färben Teile um; sie sagen weder native Texturmasken noch das Aussehen eines Schiffs noch einen inversen Seed voraus.',
    INVALID_PALETTE:
      'Diese Datei entspricht nicht dem Fingerabdruck der unterstützten Basispalette.',
    INVALID_SEED: 'Gib 0x gefolgt von 1 bis 16 Hexadezimalziffern ein.',
    PALETTE_UNAVAILABLE: 'Öffne eine unterstützte Palettendatei, bevor du Farben berechnest.',
    failed: 'Das Modell konnte nicht dargestellt werden.',
    INVALID_MODEL: 'Die Datei ist kein gültiges Modell innerhalb der Vorschaugrenzen.',
    UNSUPPORTED_MODEL:
      'Dieses Modell verwendet Texturen, Animation, Erweiterungen oder Geometrie außerhalb des unterstützten Umfangs.',
    FILE_UNAVAILABLE: 'Die gewählte Datei konnte nicht gelesen werden.'
  },
  appearance: {
    title: 'Aussehensrezept nach Seed',
    open: 'Aussehensrezept öffnen',
    apply: 'Rezept auf die Vorschau anwenden',
    help: 'Importiere ein Rezept oder einen Seed-Suchbericht mit ausdrücklichen Mesh-Zuordnungen.',
    warning:
      'Kandidatenvorschau: nur ausdrückliche Teile und RGB-Proben. Native DDS-Texturen, Masken und Shader werden nicht nachgebildet.',
    mismatch:
      'Der Fingerabdruck des Modells oder die Mesh-Namen stimmen nicht überein. Es wurde nichts geändert.',
    failed: 'Die Datei konnte nicht als unterstütztes Aussehensrezept gelesen werden.',
    seed: 'Kandidaten-Seed',
    applied: 'Rezept auf die Vorschau angewendet',
    candidate: 'Kandidat des Teilauswerters'
  },
  controls: {
    changeLanguage: 'Sprache ändern',
    changeTheme: 'Design ändern',
    light: 'Hell',
    dark: 'Dunkel',
    system: 'System'
  }
}
