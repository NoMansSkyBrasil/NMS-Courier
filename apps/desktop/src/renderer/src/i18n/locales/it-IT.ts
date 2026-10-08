import type { Messages } from '../messages'

export const itIT: Messages = {
  app: { name: 'NMS Courier', tagline: 'Consegna locale per No Man’s Sky' },
  groups: {
    overview: 'Panoramica',
    deliver: 'Consegna',
    unlock: 'Sblocca',
    rewards: 'Ricompense',
    library: 'Libreria',
    system: 'Sistema'
  },
  features: {
    dashboard: {
      title: 'Pannello',
      summary: 'Se la consegna è disponibile in questo momento, e perché.'
    },
    activity: { title: 'Attività', summary: 'Ogni richiesta inviata al gioco e il suo esito.' },
    items: {
      title: 'Oggetti',
      summary: 'Sostanze e prodotti inseriti in un inventario del salvataggio caricato.'
    },
    currencies: { title: 'Valute', summary: 'Unità, naniti e argento vivo.' },
    exosuit: {
      title: 'Exotuta',
      summary: 'Classe, slot di carico e di tecnologia e slot sovraccaricati dell’exotuta.'
    },
    starships: {
      title: 'Astronavi',
      summary:
        'Classe, dimensione dell’inventario e slot sovraccaricati dell’astronave che possiedi.'
    },
    multitools: {
      title: 'Multi-strumenti',
      summary: 'Classe, slot e slot sovraccaricati del multi-strumento equipaggiato.'
    },
    freighters: {
      title: 'Mercantili',
      summary: 'Un’offerta di mercantile con la classe, il modello e i semi scelti.'
    },
    frigates: { title: 'Fregate', summary: 'Reclutamento di fregate per la flotta.' },
    corvettes: {
      title: 'Corvette',
      summary: 'Una corvetta costruita a partire da un progetto condiviso.'
    },
    companions: { title: 'Compagni', summary: 'Uova di compagno e creature.' },
    technologies: {
      title: 'Tecnologie',
      summary: 'Progetti che il personaggio sa installare.'
    },
    productRecipes: {
      title: 'Ricette di fabbricazione',
      summary: 'Ricette degli oggetti fabbricabili e della tecnologia fabbricabile.'
    },
    buildParts: {
      title: 'Parti da costruzione',
      summary: 'Parti di base, di mercantile e decorazioni del menu di costruzione.'
    },
    refinerRecipes: {
      title: 'Raffinazione e cucina',
      summary: 'Ricette del raffinatore e del processore di nutrienti nel catalogo.'
    },
    customisation: {
      title: 'Aspetto',
      summary: 'Caschi, armature, mantelli, stendardi, scie del jetpack e gesti.'
    },
    titles: { title: 'Titoli', summary: 'Titoli del giocatore per lo stendardo.' },
    fishing: { title: 'Registro di pesca', summary: 'Il registro delle catture di ogni pesce.' },
    expeditions: {
      title: 'Spedizioni',
      summary: 'Ricompense delle spedizioni passate, riscattabili dal compagno di argento vivo.'
    },
    twitch: {
      title: 'Drop di Twitch',
      summary: 'Ricompense delle campagne Twitch, riscattabili dal compagno di argento vivo.'
    },
    platform: {
      title: 'Piattaforma e preordine',
      summary: 'Ricompense legate a una piattaforma, a un preordine o a un evento.'
    },
    quicksilver: {
      title: 'Negozio di argento vivo',
      summary: 'Oggetti venduti dal compagno di argento vivo.'
    },
    catalog: {
      title: 'Catalogo del gioco',
      summary: 'Cerca gli oggetti del tuo gioco installato.'
    },
    models: {
      title: 'Officina dei modelli',
      summary: 'Visualizza in anteprima modelli importati e tavolozze di colori.'
    },
    bridge: {
      title: 'Gioco e ponte',
      summary: 'Installazione, versione del gioco e connessione al gioco in esecuzione.'
    },
    saves: {
      title: 'Salvataggi e account',
      summary: 'Quale slot di salvataggio è caricato e che cosa è condiviso da tutto l’account.'
    },
    settings: { title: 'Impostazioni', summary: 'Lingua, aspetto e dettagli dell’applicazione.' }
  },
  status: { verified: 'Verificato', experimental: 'Sperimentale', planned: 'Pianificato' },
  statusHint: {
    verified: 'Ha funzionato nel gioco in esecuzione, sulla versione di ricerca.',
    experimental: 'Funziona in parte o solo in condizioni note.',
    planned: 'Non ancora realizzato.'
  },
  scope: {
    slot: 'Slot di salvataggio',
    account: 'Account',
    both: 'Slot di salvataggio e account',
    none: 'Nessuna modifica'
  },
  scopeHint: {
    slot: 'Modifica solo lo slot di salvataggio caricato.',
    account: 'Modifica l’account, condiviso da tutti gli slot di salvataggio.',
    both: 'Modifica lo slot di salvataggio caricato e l’account.',
    none: 'Sola lettura; nel gioco non cambia nulla.'
  },
  rows: {
    deliverable: 'Consegnate',
    blockedDamaged: 'Voci di slot danneggiato, mai consegnate',
    blockedMaintenance: 'Voci di manutenzione, mai consegnate',
    blockedTemplates: 'Modelli procedurali, mai consegnati',
    blockedById: 'Bloccate da una regola permanente',
    catalogueItems: 'Oggetti fabbricabili',
    craftableTechnology: 'Tecnologia fabbricabile',
    buildParts: 'Parti da costruzione',
    researchTree: 'Vendute ai terminali di ricerca',
    repeatableNever: 'Acquisti ripetibili, mai sbloccati',
    missionBound: 'Legati a una missione, saltati',
    redeemedInSave: 'Registrati nel salvataggio',
    itemRewards: 'Oggetti da riscattare nel negozio',
    total: 'Nel gioco'
  },
  rules: {
    gameRoutines:
      'Tutto viene fatto dal gioco stesso, in esecuzione. I file di salvataggio non vengono mai modificati.',
    defectiveNever: 'Le voci difettose e interne non vengono mai consegnate, in nessuna modalità.',
    repeatableNever:
      'I fuochi d’artificio, il Faro mitico e l’Uovo del Vuoto non vengono mai sbloccati: il negozio smetterebbe di venderli.',
    claimItems:
      'Astronavi, multi-strumenti, uova e pacchetti vengono sbloccati sull’account; riscattali nel negozio per ricevere l’oggetto.',
    keepList:
      'I drop di Twitch restano riscattabili solo finché il ponte è installato. Riscatta ciò che vuoi conservare.',
    backup: 'La cartella dei salvataggi viene copiata prima di ogni modifica.',
    slotIdentified: 'Lo slot di salvataggio caricato viene identificato prima di ogni consegna.',
    accountShared:
      'Le modifiche all’account raggiungono tutti gli slot di salvataggio e vengono sincronizzate dal gioco.'
  },
  page: {
    availabilityTitle: 'Non ancora disponibile da questa finestra',
    availabilityBody:
      'Questo è stato fatto tramite il ponte di ricerca. La connessione di questa applicazione al gioco è ancora in costruzione, quindi da qui non si può inviare nulla.',
    includes: 'Che cosa comprende',
    includesHint: 'Numeri della versione di ricerca.',
    rulesTitle: 'Come si comporta',
    rulesHint: 'Regole che valgono sempre.',
    entries: 'Voci',
    kind: 'Tipo',
    status: 'Stato',
    scope: 'Modifica',
    researchBuild: 'Versione di ricerca {build}',
    plannedTitle: 'Non ancora realizzato',
    plannedBody:
      'Quest’area è pianificata. Comparirà qui quando funzionerà nel gioco in esecuzione.',
    open: 'Apri'
  },
  dashboard: {
    game: 'Gioco',
    build: 'Versione del gioco',
    bridge: 'Ponte',
    catalog: 'Catalogo',
    capabilities: 'Che cosa sa fare Courier',
    capabilitiesHint: 'Ogni area, che cosa modifica e fino a che punto è stata provata.',
    feature: 'Area',
    area: 'Gruppo',
    running: 'In esecuzione',
    notRunning: 'Chiuso',
    notSelected: 'Nessuna installazione selezionata',
    unknown: 'Sconosciuto',
    supported: 'Compatibile',
    unsupported: 'Non compatibile',
    connected: 'Connesso',
    notConnected: 'Non connesso',
    available: 'Disponibile',
    unavailable: 'Non generato',
    entriesCount: '{count} voci',
    processId: 'Processo {id}'
  },
  settings: {
    notifications: 'Notifiche del gioco',
    notificationsHint:
      'Lascia che il gioco mostri la propria notifica per ciò che viene consegnato, quando esiste. Disattiva per consegnare in silenzio. I potenziamenti dell’inventario non chiedono mai conferma.',
    general: 'Generali',
    appearance: 'Aspetto',
    about: 'Informazioni',
    language: 'Lingua',
    languageHint: 'Le quattordici lingue di No Man’s Sky.',
    theme: 'Tema',
    themeHint: 'Per impostazione predefinita segue il sistema.',
    experimental: 'Software sperimentale',
    experimentalBody:
      'NMS Courier è uno strumento non ufficiale in fase di sviluppo. Funziona con una sola versione esatta del gioco alla volta.'
  },
  delivery: {
    currencyAmountHint: 'Qualsiasi importo da 1 a {max}, il saldo massimo che il gioco conserva.',
    itemsStack: 'Pila da {count}',
    equipActionLabel: 'Azione',
    equipTarget: 'Astronave',
    equipTargetCurrent: 'Astronave attuale',
    equipTargetSlot: 'Astronave dello slot {number}',
    equipClass: 'Classe',
    equipSlots: 'Tutti gli slot dell’inventario',
    equipSlotsHint:
      'Rende utilizzabili tutte le posizioni delle griglie di carico e di tecnologia.',
    equipSupercharge: 'Slot sovraccaricati',
    equipSuperchargeHint: 'Trasforma ogni slot tecnologia utilizzabile in uno slot sovraccaricato.',
    equipExtended: 'Righe di tecnologia aggiuntive',
    equipExtendedHint:
      'Porta la griglia di tecnologia a dodici righe. Richiede tutti gli slot dell’inventario.',
    currencyHint:
      'La ricompensa del gioco aggiunge l’importo e mostra la sua notifica. Il saldo non supera mai il massimo del gioco.',
    currencyLabel: 'Valuta',
    equipAction: {
      grid: 'Applica all’inventario',
      classStep: 'Aumenta la classe di un livello',
      offer: 'Invia offerta di mercantile',
      build: 'Avvia costruzione corvetta'
    },
    equipActionHint: {
      grid: 'Modifica l’inventario che possiedi già, sul posto. Nel gioco non si apre nulla.',
      classStep:
        'Chiede al gioco la sua ricompensa di potenziamento: un livello di classe per richiesta, fino a S.',
      offer:
        'Il gioco ti offre un mercantile con le opzioni qui sotto. Accettalo nel gioco; sostituisce il tuo mercantile attuale.',
      build: 'Il gioco apre la costruzione della corvetta con le opzioni qui sotto.'
    },
    currencyName: { units: 'Unità', nanites: 'Naniti', quicksilver: 'Argento vivo' },
    itemsTitle: 'Invia oggetti al gioco',
    itemsHint:
      'Sostanze e prodotti vanno nel carico dell’esotuta del salvataggio caricato, in pile della dimensione consentita dal gioco. Ciò che non entra non viene inviato.',
    itemsAdd: 'Aggiungi',
    itemsAmount: 'Quantità',
    itemsRemove: 'Rimuovi',
    itemsEmpty: 'Cerca nel catalogo e aggiungi gli oggetti da inviare.',
    itemsAction: 'Invia oggetti ({count})',
    itemsConfirm:
      'Gli oggetti vengono messi nel carico dell’esotuta del salvataggio caricato ora. Prima viene eseguito un backup della cartella dei salvataggi. La modifica viene scritta nel salvataggio quando il gioco salva.',
    selectTitle: 'Scegli cosa inviare',
    selectHint: 'Seleziona una voce, più voci o tutte. Vengono inviate solo le voci scelte.',
    selectSearch: 'Cerca per nome o ID',
    selectAllShown: 'Seleziona tutte le voci mostrate',
    selectClear: 'Cancella selezione',
    selectCount: '{count} selezionati',
    selectShowing: 'Visualizzati {shown} di {total}. Usa la ricerca per restringere l’elenco.',
    selectAction: 'Invia selezionati ({count})',
    selectNoCatalog:
      'I nomi compaiono dopo che il catalogo è stato letto dal gioco (Libreria, Catalogo del gioco).',
    selectNone: 'Nessun risultato per la ricerca.',
    title: 'Invia al gioco',
    hint: 'Usa il ponte di ricerca di questa versione di sviluppo.',
    action: 'Consegna tutto',
    sending: 'Invio in corso…',
    confirmTitle: 'Inviare questo al gioco in esecuzione?',
    confirmSlot:
      'Modifica lo slot di salvataggio caricato nel gioco in questo momento. Prima viene copiata la cartella dei salvataggi.',
    confirmAccount:
      'Modifica il tuo account, condiviso da tutti gli slot di salvataggio, e il gioco lo sincronizza. Prima vengono copiati la cartella dei salvataggi e il file delle impostazioni.',
    confirm: 'Invia',
    cancel: 'Annulla',
    result: 'Risultato',
    backup: 'Copia di sicurezza: {path}',
    time: 'Ora',
    activityEmptyTitle: 'Non è ancora stato inviato nulla',
    activityEmptyBody: 'Le consegne di questa sessione compaiono qui.',
    state: {
      currency_data_missing:
        'Il file di dati delle valute non è nella cartella dei mod del gioco oppure è di un’altra versione. Non è stato inviato nulla.',
      selection_invalid:
        'La selezione contiene una voce che quest’area non offre. Non è stato inviato nulla.',
      unavailable: 'Disponibile solo in una versione di sviluppo.',
      installation_not_selected: 'Seleziona prima l’installazione del gioco.',
      game_not_running: 'Avvia il gioco e carica un salvataggio.',
      bridge_missing: 'Il ponte non è installato nella cartella del gioco.',
      bridge_untested: 'Il ponte installato non è una versione testata.',
      ready: 'Pronto: gioco in esecuzione, processo {id}.',
      busy: 'È in corso un’altra consegna.',
      backup_failed: 'Impossibile creare la copia di sicurezza; non è stato inviato nulla.'
    },
    outcome: {
      completed: 'Completato',
      unknown: 'Esito sconosciuto',
      failed: 'Non riuscito',
      refused: 'Non inviato'
    },
    outcomeHint: {
      completed:
        'Il gioco ha risposto a ogni richiesta. Salva nel gioco per conservare il risultato.',
      unknown: 'Il gioco non ha risposto in tempo. Non inviare di nuovo; controlla nel gioco.',
      failed: 'Una richiesta è stata rifiutata prima di raggiungere il gioco.',
      refused: 'Non è stato inviato nulla.'
    }
  },
  bridgePage: {
    versionApp: 'Versione dell’applicazione',
    versionBridge: 'Versione del ponte installato',
    versionNone: 'Non installato',
    versionOld: 'Vecchio, senza versione',
    versionCurrent: 'Il ponte è aggiornato.',
    versionOutdated: 'Il ponte non è aggiornato. Questa applicazione include il ponte {version}.',
    detect: 'Rileva automaticamente',
    detecting: 'Ricerca in corso…',
    detectNone: 'Non è stata trovata alcuna installazione. Seleziona la cartella manualmente.',
    detectSeveral: 'È stata trovata più di un’installazione. Seleziona quella con cui giochi.',
    installationTitle: 'Installazione del gioco',
    installationSelected: '{name} è selezionata.',
    installationNone: 'Scegli la cartella di installazione di No Man’s Sky.',
    installationInvalid: 'La cartella selezionata non è un’installazione valida di No Man’s Sky.',
    select: 'Seleziona installazione',
    verifying: 'Verifica in corso…',
    bridgeTitle: 'Ponte di ricerca',
    bridgeHint: 'Il componente all’interno del gioco che esegue le consegne.',
    diagnosticsTitle: 'Diagnostica in sola lettura',
    diagnosticsHint:
      'Collega l’host di runtime privato, che non ha alcun comando di consegna. Tieni aperta questa finestra finché non chiudi il gioco.',
    connect: 'Collega runtime in sola lettura',
    starting: 'Avvio in corso…',
    diagNotConnected: 'Nessun runtime di diagnostica collegato.',
    diagHostReady: 'L’host di runtime è pronto e attende il gioco.',
    diagAuthenticated: 'Handshake completato; in attesa della callback del gioco.',
    diagCallbackReady: 'La callback in sola lettura è attiva nel gioco.',
    diagFailed: 'Diagnostica non riuscita ({reason}).',
    diagEnded: 'La sessione di diagnostica è terminata con il gioco.'
  },
  catalogPage: {
    generate: 'Leggi dal gioco',
    refresh: 'Leggi di nuovo',
    generating: 'Lettura dei file del gioco…',
    generateHint:
      'Il catalogo viene letto dalla tua installazione. Nulla viene modificato nella cartella del gioco e nessun salvataggio viene aperto.',
    imported: '{count} voci lette dal gioco.',
    failInstallation: 'Seleziona prima l’installazione del gioco.',
    failArchives: 'I file di dati del gioco non sono stati trovati nell’installazione selezionata.',
    failStructure:
      'Il gioco è stato aggiornato e le sue tabelle sono cambiate. Questa versione dell’applicazione non può ancora leggerle.',
    failUnreadable: 'Impossibile leggere i file di dati del gioco.',
    unavailableTitle: 'Il catalogo locale non è disponibile',
    unavailableBody:
      'In questo profilo dell’applicazione non è ancora stato generato alcun catalogo.',
    title: 'Catalogo locale',
    description:
      'Definizioni in sola lettura estratte dall’installazione del gioco selezionata. Un risultato non significa che l’oggetto possa essere consegnato.',
    buildBadge: 'Versione {build}',
    searchLabel: 'Cerca nel catalogo locale',
    searchPlaceholder: 'Cerca per nome o ID del gioco',
    all: 'Tutto',
    substance: 'Sostanze',
    product: 'Prodotti',
    technology: 'Tecnologie',
    matching: '{count} definizioni corrispondenti',
    loading: 'Caricamento delle definizioni…',
    languages: '{count} lingue del gioco'
  },
  preview: {
    title: 'Officina dei modelli',
    description: 'Esamina un modello GLB statico locale e assembla le sue parti visibili.',
    stage: 'Anteprima sperimentale',
    import: 'Apri modello GLB',
    loading: 'Caricamento del modello…',
    empty: 'Scegli un modello locale per iniziare',
    hint: 'Trascina per ruotare, usa la rotellina per lo zoom e trascina con il tasto destro per spostare.',
    limits:
      'Questa versione accetta file GLB statici fino a 64 MiB, solo con texture PNG incorporate e senza risorse esterne. La conversione nativa delle risorse di NMS non è ancora collegata.',
    warning:
      'Le selezioni delle parti e la tinta riguardano solo questa anteprima. Non calcolano un seme e non consegnano un’astronave.',
    parts: 'Parti visibili',
    all: 'Mostra tutto',
    none: 'Nascondi tutto',
    filter: 'Filtra le parti per nome',
    tint: 'Tinta dell’anteprima',
    original: 'Ripristina i colori del modello',
    reset: 'Reimposta la telecamera',
    palettes: 'Tavolozze del gioco',
    paletteHelp: 'Apri il file BASECOLOURPALETTES.MBIN estratto dal set di dati supportato.',
    importPalette: 'Apri MBIN delle tavolozze',
    seed: 'Seme di colore sperimentale',
    calculatePalette: 'Calcola i campioni di colore',
    calculatedSeed: 'Seme calcolato',
    family: 'Famiglia di tavolozze',
    samples: 'Cinque campioni di colore',
    sample: 'Campione di colore',
    paletteIndex: 'Colore di origine',
    colorTarget: 'Applica a',
    visibleTarget: 'Tutte le parti visibili',
    applyColor: 'Applica il colore selezionato',
    paletteWarning:
      'Calcolo sperimentale della tavolozza di base. I campioni RGB ricolorano le parti; non prevedono le maschere di texture native, l’aspetto di un’astronave né un seme inverso.',
    INVALID_PALETTE: 'Questo file non corrisponde all’impronta della tavolozza di base supportata.',
    INVALID_SEED: 'Inserisci 0x seguito da 1 a 16 cifre esadecimali.',
    PALETTE_UNAVAILABLE: 'Apri un file di tavolozza supportato prima di calcolare i colori.',
    failed: 'Impossibile visualizzare il modello.',
    INVALID_MODEL: 'Il file non è un modello valido entro i limiti dell’anteprima.',
    UNSUPPORTED_MODEL:
      'Questo modello usa texture, animazione, estensioni o geometria al di fuori del sottoinsieme supportato.',
    FILE_UNAVAILABLE: 'Impossibile leggere il file selezionato.'
  },
  appearance: {
    title: 'Ricetta di aspetto per seme',
    open: 'Apri ricetta di aspetto',
    apply: 'Applica la ricetta all’anteprima',
    help: 'Importa una ricetta o un rapporto di ricerca dei semi con associazioni esplicite delle mesh.',
    warning:
      'Anteprima candidata: solo parti esplicite e campioni RGB. Texture DDS, maschere e shader nativi non vengono riprodotti.',
    mismatch:
      'L’impronta del modello o i nomi delle mesh non corrispondono. Non è stata applicata alcuna modifica.',
    failed: 'Impossibile leggere il file come ricetta di aspetto supportata.',
    seed: 'Seme candidato',
    applied: 'Ricetta applicata all’anteprima',
    candidate: 'Candidato del valutatore parziale'
  },
  controls: {
    changeLanguage: 'Cambia lingua',
    changeTheme: 'Cambia tema',
    light: 'Chiaro',
    dark: 'Scuro',
    system: 'Sistema'
  }
}
