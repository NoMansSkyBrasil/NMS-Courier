import type { Messages } from '../messages'

export const deDE: Messages = {
  app: { name: 'NMS Courier', tagline: 'Lokale Lieferung für No Man’s Sky' },
  sections: { obtain: 'Neu erhalten', upgrade: 'Verbessern' },
  corvette: {
    title: 'Korvette aus einer Datei',
    hint: 'Wähle eine geteilte Korvettendatei (.nmsship). Die Anwendung bereitet das Spiel so vor, dass der Korvettenbau mit diesem Schiff bereits zusammengesetzt beginnt; du schließt ihn im Spiel ab. Nach dem Vorbereiten muss das Spiel neu gestartet werden.',
    none: 'Es wurde noch keine Korvettendatei vorbereitet.',
    current: 'Vorbereitet: {name}, {count} Teile.',
    parts: '{count} Teile',
    hullParts: '{count} Rumpfteile',
    missing: 'Ohne: {parts}. Das Spiel zeigt eine Warnung und baut sie trotzdem.',
    partCockpit: 'Cockpit',
    partLandingGear: 'Landefahrwerk',
    partHabitation: 'Wohnmodul',
    partReactor: 'Reaktor',
    rejectedTitle: 'Diese Datei kann nicht verwendet werden',
    rejectedShip:
      'Das ist ein gewöhnliches Schiff, keine Korvette. Schiffe aus einer Datei sind noch nicht verfügbar.',
    rejectedInvalid: 'Das ist keine gültige Korvettendatei.',
    installedTitle: 'Korvette vorbereitet',
    installedBody:
      'Schließe das Spiel, falls es läuft, und starte es neu. Nutze danach unten „Korvettenbau starten“.',
    installFailedTitle: 'Die Korvette konnte nicht vorbereitet werden',
    installFailed: 'Die Dateien konnten nicht in den Spielordner geschrieben werden.',
    choose: 'Datei wählen',
    install: 'Im Spiel vorbereiten'
  },
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
    teleport: {
      title: 'Teleport',
      summary: 'Reise per Galaxie und Portaladresse in ein Sternsystem, ohne ein Portal.'
    },
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
    words: {
      title: 'Wörter',
      summary:
        'Wörter der Sprachen der Gek, Vy’keen, Korvax, des Atlas und der Autophagen: eines, mehrere oder alle.'
    },
    glyphs: { title: 'Portalglyphen', summary: 'Die sechzehn Glyphen, die Portale öffnen.' },
    missions: {
      title: 'Missionen',
      summary:
        'Bittet das Spiel, Missionen abzuschließen: alle, eine Quest mit ihren Schritten oder einen einzelnen Schritt.'
    },
    guide: {
      title: 'Anleitung',
      summary: 'Themen der Spielanleitung, die sich sonst beim Spielen öffnen.'
    },
    nexus: {
      title: 'Weltraumanomalie',
      summary: 'Zugang zur Weltraumanomalie, den sonst die Geschichte öffnet.'
    },
    standings: {
      title: 'Ansehen',
      summary: 'Ansehen bei allen Völkern, den drei Gilden und den Gesetzlosen, stufenweise erhöht.'
    },
    milestones: {
      title: 'Meilensteine',
      summary: 'Meilensteine der Reise und Medaillen der Fraktionen, stufenweise erhöht.'
    },
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
      summary:
        'Sieh dir an, wie ein Seed aussieht, oder finde einen Seed für die gewünschten Teile.'
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
    errorTitle: 'Diese Seite funktioniert nicht mehr',
    errorReload: 'Neu laden',
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
    shipModel: {
      fighter: 'Jäger',
      hauler: 'Transporter',
      explorer: 'Entdecker',
      shuttle: 'Shuttle',
      solar: 'Solare',
      exotic: 'Exotisch',
      living: 'Lebendes Schiff',
      interceptor: 'Interceptor'
    },
    toolModel: {
      pistol: 'Pistole',
      rifle: 'Gewehr',
      experimental: 'Experimentell',
      alien: 'Alien',
      staff: 'Stab'
    },
    equipSeedHint: 'Leer wird ein zufälliger Seed gezogen.',
    obtainAction: 'Angebot senden',
    obtainShipHint:
      'Das Spiel bietet dir auf seinem eigenen Bildschirm ein neues Raumschiff dieser Art, dieses Seeds und dieser Klasse an: zur Sammlung hinzufügen, gegen das aktuelle tauschen oder ablehnen.',
    obtainToolHint:
      'Das Spiel bietet dir auf seinem eigenen Bildschirm ein neues Multiwerkzeug dieser Art, dieses Seeds und dieser Klasse an: zur Sammlung hinzufügen, gegen das aktuelle tauschen oder ablehnen.',
    obtainPlanned: 'Hier ist es noch nicht möglich, ein neues zu erhalten.',
    equipSceneEmpty: 'Kein Modell gefunden.',
    freighterModel: {
      default: 'Vom Spiel gewählt',
      regular: 'Frachter',
      small: 'Kleiner Frachter',
      tiny: 'Winziger Frachter',
      capital: 'Großfrachter',
      pirate: 'Piraten-Dreadnought'
    },
    equipScene: 'Modell',
    equipSceneHint:
      'Optional. Die Spielszene des Frachtermodells; leer bleibt es bei der Wahl des Spiels.',
    equipModelSeed: 'Modell-Seed',
    equipLegacyColours: 'Alte Farben verwenden',
    equipLegacyColoursHint:
      'Markiert das Multi-Werkzeug für die alten Farben, wie die vom Spiel vergebenen. Das Angebot des Spiels hat dafür keine Einstellung, daher lässt die Brücke das Spiel das Angebot damit zeichnen und schreibt die Markierung direkt nach deiner Annahme auf das Werkzeug.',
    equipHomeSeed: 'Seed des Heimatsystems',
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
    equipToolSlots: 'Alle Technologie-Plätze',
    equipToolSlotsHint:
      'Macht jede Position des Technologie-Rasters des Multi-Werkzeugs nutzbar, schon im Angebot.',
    equipSupercharge: 'Aufgeladene Plätze',
    equipSuperchargeHint: 'Macht jeden nutzbaren Technologieplatz zu einem aufgeladenen Platz.',
    equipExtended: 'Zusätzliche Technologiereihen',
    equipExtendedHint:
      'Erweitert das Technologieraster auf zwölf Reihen. Erfordert alle Inventarplätze.',
    currencyHint:
      'Die Belohnung des Spiels fügt den Betrag hinzu und zeigt die eigene Benachrichtigung. Das Guthaben übersteigt nie das Maximum des Spiels.',
    currencyLabel: 'Währung',
    equipAction: {
      slotReward: 'Einen Inventarplatz hinzufügen',
      grid: 'Auf Inventar anwenden',
      classStep: 'Klasse um eine Stufe erhöhen',
      offer: 'Frachterangebot senden',
      build: 'Korvettenbau starten'
    },
    equipActionHint: {
      slotReward:
        'Fordert die Platz-Belohnung des Spiels an. Das Spiel öffnet sein Fenster, damit du wählst, wohin der neue Platz kommt.',
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
  words: {
    hint: 'Jede Zeile ist ein Wort des Spiels, jede Spalte eine Sprache; ein Kästchen gibt es nur dort, wo diese Sprache das Wort hat. Das Spiel lernt Wörter in Gruppen: Wer ein Wort markiert, markiert auch die anderen Formen seiner Gruppe in dieser Sprache (verlassen als Verb und als Partizip). Ein markiertes Kästchen wird gesendet: Das Spiel wird nicht gefragt, welche Wörter du schon kennst.',
    id: 'ID',
    marked: '{count} von {total} markiert',
    word: 'Wort',
    raceAll: 'Alle angezeigten Wörter von {race}',
    race: {
      Traders: 'Gek',
      Warriors: 'Vy’keen',
      Explorers: 'Korvax',
      Atlas: 'Atlas',
      Builders: 'Autophage'
    }
  },
  missions: {
    warningTitle: 'Experimentell: einen Test-Spielstand verwenden',
    warning:
      'Das Spiel wird über seine eigene Belohnung gebeten, jede gewählte Mission abzuschließen. Eine Quest ist eine Mission mit Titel; ihre Schritte ohne Titel stehen unter ihrem Namen, sodass die Suche nach der Quest und „Alle angezeigten auswählen“ die Quest samt Schritten erfasst. Noch ist unbekannt, ob das Spiel übergibt, was die übersprungenen Schritte gegeben hätten (Baupläne, Gegenstände), und ob es die nächste Mission startet. Der Spielstand wird vor dem Senden gesichert.'
  },
  levels: {
    hint: {
      standings:
        'Das Spiel speichert jedes Ansehen als Zahl und zeigt es als Rang mit elf Stufen. Das Spiel selbst wird über seine eigene Belohnung gebeten, die Zahl der gewählten Stufe zu setzen; gesenkt wird nie. Experimentell: im Spiel noch nicht funktionierend gesehen.',
      milestones:
        'Ein Meilenstein ist ein Zähler des Spiels (gelernte Wörter, besuchte Systeme, zerstörte Schiffe) mit elf Stufen. Das Spiel selbst wird über seine eigene Belohnung gebeten, den Zähler auf den Wert der gewählten Stufe zu setzen. Nur der Zähler ändert sich: Mehr gesammelte Wörter lehren kein Wort. Gesenkt wird nichts. Experimentell: im Spiel noch nicht funktionierend gesehen.'
    },
    mode: 'Wie weit',
    modeOne: '1 Stufe',
    modeSome: 'Mehrere Stufen',
    modeAll: 'Bis zur letzten Stufe',
    modeHint:
      'Gezählt ab der Stufe, auf der jeder Eintrag jetzt steht. Was schon auf der letzten Stufe ist, bleibt unverändert.',
    messageHint:
      'Das Spiel entscheidet, welche Einträge eine neue Stufe melden: Ansehen und die wichtigsten Meilensteine tun es; die übrigen ändern sich ohne jede Meldung, auch im normalen Spiel. Jede Zeile sagt, was gilt.',
    message: { full: 'volle Meldung', quick: 'kurze Meldung', silent: 'keine Meldung im Spiel' },
    announce: 'Meilenstein-Bildschirm auch für stille Einträge zeigen',
    announceHint:
      'Das Spiel zeigt seinen vollen Bildschirm „Meilenstein erreicht“ nur bei einigen Einträgen. Ein: Es wird gebeten, denselben Bildschirm mit Rang und Namen des Eintrags auch bei denen zu zeigen, die sich sonst still ändern. Seine Tabelle wird nur während der Übergabe der Stufe geändert und sofort zurückgesetzt.',
    count: 'Stufen',
    countHint: 'Wie viele Stufen aufsteigen, 1 bis {max}.',
    action: 'Alle erhöhen',
    actionChosen: 'Ausgewählte erhöhen ({count})'
  },
  glyphs: {
    hint: 'Das Spiel übergibt die Glyphen selbst, mit seiner eigenen Benachrichtigung, so wie das Grab eines Reisenden eine gibt. Eine bestimmte Glyphe kann das Spiel nicht geben: Sie kommen in der Reihenfolge des Spiels, die unten steht.',
    order: 'Reihenfolge der Glyphen im Spiel',
    all: 'Alle sechzehn',
    allHint: 'Alle Glyphen auf einmal.',
    count: 'Wie viele',
    countHint: 'Die nächsten Glyphen, die du noch nicht hast, 1 bis {max}.',
    action: 'Glyphen lernen'
  },
  teleport: {
    hint: 'Die Reise macht das laufende Spiel selbst: Es wird so gefragt, wie seine eigenen Teleporter fragen. Du kommst an der Raumstation des Systems an oder auf dem Planeten, den die erste Glyphe nennt. Experimentell.',
    galaxy: 'Galaxie',
    galaxyHint: 'Alle Galaxien des Spiels, nach Nummer und Name. Tippe, um zu suchen.',
    galaxyEmpty: 'Keine Galaxie gefunden.',
    galaxyNumber: 'Galaxie {number}',
    address: 'Portaladresse',
    addressHint:
      'Zwölf Glyphen als Ziffern 0 bis F: Planet, System, dann die drei Koordinaten. Drücke sie oder füge den Code ein.',
    erase: 'Letzte Glyphe löschen',
    destination: 'Ankommen bei',
    destinationHint:
      'Die Raumstation ist die sichere Wahl. Der Planet nutzt die erste Glyphe der Adresse.',
    toStation: 'Raumstation des Systems',
    toPlanet: 'Planet der Adresse',
    action: 'Teleportieren',
    confirmBody:
      'Du verlässt deinen jetzigen Ort und das Spiel lädt das andere System. Speichere vorher, wenn du genau hierher zurück willst.',
    favourites: 'Gespeicherte Ziele',
    favouritesHint:
      'Von dieser Anwendung auf diesem Computer aufbewahrt; das Spiel sieht sie nicht.',
    favouriteName: 'Name des Ziels',
    addFavourite: 'Diese Adresse speichern',
    useFavourite: 'Verwenden',
    removeFavourite: 'Entfernen',
    noFavourites: 'Noch nichts gespeichert.'
  },
  workshop: {
    title: 'Modellwerkstatt',
    description:
      'Wähle, was du sehen möchtest, und gib dann einen Seed ein, würfle einen aus oder wähle die Teile und lass die Anwendung einen Seed finden, der sie hat.',
    tabBuild: 'Zusammenstellen',
    tabView: 'Seed ansehen',
    buildDescription:
      'Wähle Typ, Teile, Farben und Texturen. Die Anwendung sucht einen Seed, der sie hat, und zeigt ihn.',
    viewDescription:
      'Wähle den Typ und gib einen Seed ein oder würfle einen aus, um zu sehen, wie er aussieht.',
    colorTitle: 'Farben',
    roles: {
      primary: 'Hauptfarbe',
      secondary: 'Zweitfarbe',
      decal1: 'Abziehbildfarbe 1',
      decal2: 'Abziehbildfarbe 2'
    },
    texturesTitle: 'Texturen und Abziehbilder',
    baseTexture: { COATING: 'Beschichtung', PAINTED: 'Lackiert', PANELS: 'Metall' },
    seedTexturesTitle: 'Texturen und Abziehbilder dieses Seeds',
    colorHint:
      'Jede Farbe, die das Modell aus den Paletten des Spiels nimmt. Wähle eine und dann ihre Farbe; „Beliebig“ überlässt sie dem Seed.',
    seedColorsTitle: 'Farben dieses Seeds',
    paintLabel: 'Lack',
    undercoatLabel: 'Grundierung',
    tabSystem: 'Aktuelles System',
    systemDescription:
      'Das Sternsystem, in dem du dich befindest, aus dem laufenden Spiel gelesen: sein Seed und die Schiffe, die das Spiel dafür erzeugt hat. Im Spiel wird nichts geändert.',
    systemNone:
      'Nichts anzuzeigen. Das Spiel muss mit Brücke 1.8.0 oder neuer laufen und ein Spielstand geladen sein; die Liste wird alle paar Sekunden aktualisiert.',
    systemSeed: 'System-Seed',
    systemShips: 'Schiffe dieses Systems',
    systemClass: 'Klasse',
    systemRole: 'Rolle',
    systemShipSeed: 'Seed',
    systemView: 'Ansehen',
    systemRefresh: 'Aktualisieren',
    systemClassNumber: 'Klasse {number}',
    systemStream:
      'Geprüft: Die Schiffs-Seeds liegen auf dem Zahlenstrom des System-Seeds; der erste wird nach {steps} Schritten gezogen.',
    systemStreamUnknown:
      'Die Schiffs-Seeds wurden auf dem Zahlenstrom des System-Seeds nicht gefunden.',
    tabFile: 'Modelldatei',
    categoryLabel: 'Kategorie',
    category: { starship: 'Raumschiff', multitool: 'Multi-Werkzeug', freighter: 'Frachter' },
    kindLabel: 'Typ',
    toolKind: {
      standard: 'Standard',
      royal: 'Royal',
      sentinel: 'Wächter',
      sentinelB: 'Wächter B',
      atlasSceptre: 'Atlas-Zepter',
      atlas: 'Atlantid',
      staff: 'Stab',
      staffRuin: 'Säule von Titan',
      staffBone: 'Basiliskenkrone',
      switch: 'Unendliches Neon Mark XXII',
      retro: 'Sternwärts v0.27',
      swarm: 'Schreckenswespen-Desintegrator',
      staffNpc: 'NPC-Stab'
    },
    seedLabel: 'Seed',
    homeSeedHint:
      'Ein Frachter nimmt seine Farben aus seinem Heimatsternsystem, und der Seed eines Systems ist seine Adresse in der Galaxie. Gib den Seed ein, würfle einen aus oder nenne unten die Portaladresse des Systems; leer zeigt den Frachter ohne Farben.',
    homeAddress: 'Dieser Seed ist das System mit der Portaladresse {glyphs} in Galaxie {galaxy}.',
    glyphsLabel: 'Portaladresse (12 Glyphen als 0–9, A–F)',
    galaxyLabel: 'Galaxienummer',
    useAddress: 'Dieses System verwenden',
    legacyColours: 'Alte Farben verwenden',
    legacyColoursHint:
      'Das Spiel hat zwei Arten, die Farben eines Seeds zu ziehen. Multi-Werkzeuge, die es vergibt, nutzen die alte; Raumschiffe werden im Spielstand einzeln markiert (Alte Farben verwenden).',
    seedOrigin:
      'Das Spiel zieht diesen Seed im System mit der Portaladresse {glyphs} in Galaxie {galaxy} (nach {steps} Schritten seines Zahlenstroms). Ein Hinweis, kein Beweis.',
    seedHint: 'Sechzehn Hexadezimalziffern nach 0x. Drücke die Eingabetaste oder „Anzeigen“.',
    show: 'Anzeigen',
    generate: 'Seed erzeugen',
    generateWithParts: 'Mit diesen Teilen erzeugen',
    clearParts: 'Teile zurücksetzen',
    getInGame: 'Dieses im Spiel erhalten',
    found: 'Seed nach {tries} Versuchen gefunden',
    building: 'Modell wird zusammengesetzt…',
    empty: 'Noch nichts anzuzeigen',
    partsTitle: 'Teile',
    partsHint:
      'Wähle die gewünschten Teile und lass den Rest auf „Beliebig“. Unter einem Teil mit eigenen Teilen erscheinen weitere Listen.',
    anyPart: 'Beliebig',
    rare: 'selten',
    detailsTitle: 'Vom Seed ausgeloste Details',
    note: 'Das Modell wird aus deinen eigenen Spieldateien gelesen. Teile, Texturebenen, Abziehbilder und Farben folgen dem Seed; Beleuchtung und Materialeffekte sind vereinfacht, daher sehen Metall und Schattierung anders aus als im Spiel. Die Teile wurden mit einem unabhängigen Werkzeug und mit einem im laufenden Spiel gekauften Multi-Werkzeug verglichen; die Farben sind ähnlich, nicht exakt.',
    errors: {
      INSTALLATION_NOT_SELECTED: 'Wähle zuerst unter „Brücke“ den Spielordner aus.',
      UNKNOWN_KIND: 'Dieser Typ ist nicht verfügbar.',
      INVALID_SEED: 'Der Seed muss 0x gefolgt von höchstens sechzehn Hexadezimalziffern sein.',
      GAME_FILES_UNREADABLE: 'Die Spieldateien dieses Modells konnten nicht gelesen werden.',
      MODEL_TOO_LARGE: 'Dieses Modell ist zu groß für die Anzeige.',
      SEED_NOT_FOUND:
        'In der verfügbaren Zeit wurde kein Seed mit diesen Teilen gefunden. Versuche es erneut oder lass ein Teil frei.'
    }
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
