import type { Messages } from '../messages'

export const itIT: Messages = {
  app: { name: 'NMS Courier', tagline: 'Consegna locale per No Man’s Sky' },
  sections: { obtain: 'Ottieni', upgrade: 'Potenzia' },
  corvette: {
    title: 'Corvetta da file',
    hint: 'Scegli un file di corvetta condiviso (.nmsship). Il gioco aprirà la costruzione delle corvette con quella nave già assemblata. Riavvia il gioco dopo la scelta.',
    none: 'Non è ancora stato preparato alcun file di corvetta.',
    current: 'Preparato: {name}, {count} parti.',
    parts: '{count} parti',
    hullParts: '{count} parti dello scafo',
    missing: 'Senza: {parts}. Il gioco mostra un avviso e la costruisce comunque.',
    partCockpit: 'cabina',
    partLandingGear: 'carrello di atterraggio',
    partHabitation: 'modulo abitativo',
    partReactor: 'reattore',
    rejectedTitle: 'Questo file non può essere usato',
    rejectedShip:
      'È una nave comune, non una corvetta. Le navi da file non sono ancora disponibili.',
    rejectedInvalid: 'Non è un file di corvetta valido.',
    installedTitle: 'Corvetta preparata',
    installedBody:
      'Chiudi il gioco, se è aperto, e riavvialo. Poi usa "Avvia costruzione corvetta" qui sotto.',
    installFailedTitle: 'Impossibile preparare la corvetta',
    installFailed: 'Non è stato possibile scrivere i file nella cartella del gioco.',
    choose: 'Scegli file',
    install: 'Prepara nel gioco'
  },
  groups: {
    overview: 'Panoramica',
    inventory: 'Oggetti e valute',
    travel: 'Viaggio',
    equipment: 'Equipaggiamento',
    knowledge: 'Conoscenza',
    progress: 'Progressi',
    style: 'Aspetto',
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
    teleport: {
      title: 'Teletrasporto',
      summary:
        'Viaggia verso un sistema stellare per galassia e indirizzo del portale, senza un portale.'
    },
    planets: {
      title: 'Trova pianeti',
      summary: 'Trova pianeti per bioma, clima e sentinelle, con il loro indirizzo del portale.'
    },
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
    pendingTech: {
      title: 'Tecnologie in attesa',
      summary: 'Completa le tecnologie che chiedono ancora componenti, in tutti gli inventari.'
    },
    upkeep: {
      title: 'Ripara e ricarica',
      summary: 'Ripara la tecnologia danneggiata e ricarica ciò che si è esaurito.'
    },
    purpleStars: {
      title: 'Stelle viola sulla mappa',
      summary:
        'Mostra sulla mappa galattica i sistemi con stella viola, che la storia normalmente sblocca.'
    },
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
    words: {
      title: 'Parole',
      summary: 'Parole delle lingue Gek, Vy’keen, Korvax, Atlas e Autofagi: una, alcune o tutte.'
    },
    glyphs: { title: 'Glifi del portale', summary: 'I sedici glifi che aprono i portali.' },
    missions: {
      title: 'Missioni',
      summary:
        'Chiede al gioco di completare missioni: tutte, una missione con i suoi passaggi o un solo passaggio.'
    },
    guide: {
      title: 'Guida',
      summary: 'Argomenti della guida del gioco che di norma si aprono giocando.'
    },
    nexus: {
      title: 'Anomalia spaziale',
      summary: 'Accesso all’Anomalia spaziale, che di norma la storia sblocca.'
    },
    standings: {
      title: 'Reputazione',
      summary: 'Reputazione con tutte le razze, le tre gilde e i fuorilegge, aumentata per livelli.'
    },
    milestones: {
      title: 'Obiettivi',
      summary: 'Obiettivi del viaggio e medaglie delle fazioni, aumentati per livelli.'
    },
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
      summary: 'Guarda com’è un seme o trova un seme per i pezzi che vuoi.'
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
  status: { verified: 'Verificato', experimental: 'In prova', planned: 'Pianificato' },
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
    errorTitle: 'Questa pagina ha smesso di funzionare',
    errorReload: 'Ricarica',
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
    connection: 'Collegamento',
    heroBody:
      'Invia oggetti, valute e sblocchi al tuo gioco mentre è in esecuzione. Il gioco fa tutto da sé; i tuoi salvataggi non vengono mai modificati.',
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
  savesPage: {
    slotsTitle: 'I tuoi slot di salvataggio',
    slotsHint:
      "Quando il gioco ha salvato ogni slot l'ultima volta. Courier modifica solo lo slot caricato nel gioco.",
    slot: 'Slot {number}',
    lastSaved: 'Ultimo salvataggio: {when}',
    noSlots: 'Nessun salvataggio trovato finora.',
    backupsTitle: 'Copie di sicurezza',
    backupsHint:
      "Prima di ogni modifica Courier copia l'intera cartella dei salvataggi. Per tornare indietro, chiudi il gioco e rimetti i file di una copia nella cartella dei salvataggi.",
    backupCount: '{count} copie conservate',
    noBackups: 'Ancora nessuna copia. Ne viene fatta una prima della prima modifica.',
    openFolder: 'Apri la cartella delle copie',
    before: 'Prima di: {feature}'
  },
  setup: {
    chooseTitle: 'Scegli la cartella del gioco',
    chooseBody: "Courier deve sapere dove è installato No Man's Sky.",
    chooseButton: 'Scegli cartella',
    installTitle: 'Installa Courier nel gioco',
    updateTitle: 'Aggiorna Courier nel gioco',
    installBody:
      'Due piccoli file vengono copiati nella cartella del gioco. Nulla del gioco viene sostituito e i tuoi salvataggi non vengono toccati. Poi avvia il gioco.',
    installButton: 'Installa',
    updateButton: 'Aggiorna',
    closeGameTitle: 'Chiudi il gioco per completare',
    closeGameBody:
      'I file non possono essere sostituiti mentre il gioco è in esecuzione. Chiudilo e torna qui.',
    foreignTitle: "Un'altra mod usa lo stesso file",
    foreignBody:
      'La cartella del gioco contiene già un file xinput9_1_0.dll che non è di Courier. Courier non lo sostituirà; rimuovi prima quella mod per usare Courier.',
    unavailableTitle: 'Mancano i file di Courier',
    unavailableBody:
      "Questa copia dell'applicazione non contiene i file che installa. Scarica di nuovo l'applicazione.",
    openGameTitle: 'Avvia il gioco e carica un salvataggio',
    openGameBody: 'Courier si collega da solo appena il gioco è in esecuzione.',
    readyTitle: 'Collegato al gioco',
    readyBody: 'Tutto pronto. Scegli cosa inviare.'
  },
  settings: {
    internalNames: 'Mostra nomi interni',
    internalNamesHint:
      'Mostra gli identificatori del gioco e la risposta tecnica di ogni invio. Utile per segnalare un problema.',
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
    actionOne: 'Invia al gioco',
    expeditionGroup: 'Spedizione {number}',
    groupNames: {
      Weapon: 'Multi-Tool',
      Suit: 'Exotuta',
      AllShipsExceptAlien: 'Navi, tranne le viventi',
      AllShips: 'Tutte le navi',
      Mech: 'Minotauro',
      Exocraft: 'Exoscafo',
      Freighter: 'Mercantile',
      Ship: 'Astronave',
      AlienShip: 'Living Ship',
      RobotShip: 'Intercettatore Sentinella',
      Submarine: 'Nautilon',
      AllVehicles: 'Tutti gli exoveicoli',
      Colossus: 'Colosso',
      catalogue_item: 'Oggetti',
      catalogue_technology: 'Tecnologia',
      catalogue_construction: 'Menu di costruzione',
      research_tree: 'Ricerca',
      cooking: 'da cuoco',
      refiner: 'Raffinatore',
      stat: 'Traguardo',
      product: 'Oggetto',
      mission: 'Missione',
      interaction: 'Incontro',
      none: 'Altro',
      trophy: 'Trofeo',
      Common: 'Comune',
      Rare: 'Raro',
      Epic: 'Epico',
      Legendary: 'Leggendario',
      Junk: 'Rottame',
      shop: 'Negozio',
      customisation: 'Aspetto'
    },
    shipModel: {
      fighter: 'Caccia',
      hauler: 'Trasportatore',
      explorer: 'Esploratore',
      shuttle: 'Navetta',
      solar: 'Solare',
      exotic: 'Esotica',
      living: 'Living Ship',
      interceptor: 'Interceptor'
    },
    toolModel: {
      pistol: 'Pistola',
      rifle: 'Fucile',
      experimental: 'Sperimentale',
      alien: 'Alieno',
      staff: 'Bastone'
    },
    equipSeedHint: 'Vuoto estrae un seme casuale.',
    obtainAction: 'Invia offerta',
    obtainShipHint:
      'Il gioco ti offre una nuova astronave di questo tipo, seme e classe nella propria schermata: aggiungila alla collezione, scambiala con quella attuale o rifiuta.',
    obtainToolHint:
      'Il gioco ti offre un nuovo multiutensile di questo tipo, seme e classe nella propria schermata: aggiungilo alla collezione, scambialo con quello attuale o rifiuta.',
    obtainPlanned: 'Qui non è ancora possibile ottenerne uno nuovo.',
    equipSceneEmpty: 'Nessun modello trovato.',
    freighterModel: {
      default: 'Scelto dal gioco',
      regular: 'Mercantile',
      small: 'Mercantile piccolo',
      tiny: 'Mercantile minuscolo',
      capital: 'Mercantile capitale',
      pirate: 'Corazzata pirata'
    },
    equipScene: 'Modello',
    equipSceneHint: 'Facoltativo. Lascia vuoto per far scegliere al gioco.',
    equipModelSeed: 'Seme del modello',
    equipLegacyColours: 'Usa i colori precedenti',
    equipLegacyColoursHint:
      "Dà al multi-attrezzo i colori vecchi, come quelli degli attrezzi che il gioco consegna. Applicato subito dopo aver accettato l'offerta.",
    equipHomeSeed: 'Seme del sistema di origine',
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
    equipToolSlots: 'Tutti gli slot tecnologia',
    equipToolSlotsHint:
      'Rende utilizzabili tutte le posizioni della griglia tecnologica del multi-attrezzo, già nell’offerta.',
    equipSupercharge: 'Slot sovraccaricati',
    equipSuperchargeHint: 'Trasforma ogni slot tecnologia utilizzabile in uno slot sovraccaricato.',
    equipExtended: 'Righe di tecnologia aggiuntive',
    equipExtendedHint:
      'Porta la griglia di tecnologia a dodici righe. Richiede tutti gli slot dell’inventario.',
    currencyHint:
      'La ricompensa del gioco aggiunge l’importo e mostra la sua notifica. Il saldo non supera mai il massimo del gioco.',
    currencyLabel: 'Valuta',
    equipAction: {
      slotReward: 'Aggiungi uno slot di inventario',
      grid: 'Applica all’inventario',
      classStep: 'Aumenta la classe di un livello',
      offer: 'Invia offerta di mercantile',
      build: 'Avvia costruzione corvetta'
    },
    equipActionHint: {
      slotReward:
        'Chiede al gioco la sua ricompensa slot. Il gioco apre la finestra per scegliere dove mettere il nuovo slot.',
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
    hint: 'Lo fa il gioco stesso, in esecuzione, come lo consegnerebbe di suo.',
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
    traceTitle: 'Traccia delle ricompense',
    traceHint:
      'Annota ogni ricompensa che il gioco dà mentre è attiva, con il seme e il codice chiamante. Non modifica nulla.',
    traceStart: 'Avvia',
    traceStop: 'Ferma',
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
    bridgeTitle: 'Collegamento con il gioco',
    bridgeHint: 'Un piccolo file di Courier dentro il gioco fa ciò che invii da qui.',
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
  words: {
    hint: 'Le righe sono parole, le colonne sono lingue. Seleziona ciò che vuoi imparare. Selezionare una parola seleziona anche le sue altre forme (abbandonare, abbandonato).',
    id: 'ID',
    marked: '{count} di {total} spuntate',
    word: 'Parola',
    raceAll: 'Tutte le parole di {race} mostrate',
    race: {
      Traders: 'Gek',
      Warriors: 'Vy’keen',
      Explorers: 'Korvax',
      Atlas: 'Atlas',
      Builders: 'Autofago'
    }
  },
  upkeep: {
    repairTitle: 'Ripara la tecnologia danneggiata',
    repairHint:
      "Il gioco ripara tutta la tecnologia danneggiata dell'inventario scelto, come fa dopo uno schianto nella storia. Non si spende nulla.",
    repairAll: 'Ripara tutto',
    inventories: {
      exosuit: 'Exotuta',
      ship: 'Nave',
      multitool: 'Multi-attrezzo',
      freighter: 'Mercantile',
      exocraft: 'Exoveicolo'
    },
    rechargeTitle: 'Ricarica',
    rechargeHint:
      'Il gioco ricarica ogni tecnologia non piena: protezione dai pericoli, supporto vitale, propulsori di decollo e le altre. Non si spende nulla.',
    rechargeNow: 'Ricarica tutto ora',
    autoTitle: 'Ricarica da sola',
    autoHint:
      'Finché questa applicazione è aperta e il gioco è in esecuzione. Nel gioco non compare alcun messaggio.',
    autoOn: 'Attiva',
    autoEvery: 'Ricarica tutto ogni (minuti)',
    autoLow: 'Anche subito quando una carica scende sotto il 20%'
  },
  pendingTech: {
    exocraft: {
      0: 'Roamer',
      1: 'Nomade',
      2: 'Colosso',
      3: 'Pellegrino',
      4: 'Libellula',
      5: 'Nautilon',
      6: 'Minotauro'
    },
    title: 'Tecnologie in attesa di installazione',
    hint: "Una tecnologia con un ingranaggio nell'angolo chiede ancora componenti. Controlla cosa è in attesa e completalo qui: i componenti non vengono spesi.",
    check: 'Controlla i miei inventari',
    notChecked:
      "Il controllo passa per l'exotuta, il multi-attrezzo in uso, tutte le navi, il mercantile e tutti gli exoveicoli.",
    none: 'Niente in attesa. Tutte le tecnologie sono installate.',
    finishAll: 'Completa tutte ({count})',
    finishGroup: 'Completa queste',
    finishOne: 'Completa',
    confirm:
      'Il gioco completa {count} tecnologie in attesa. I componenti richiesti non vengono spesi e il gioco potrebbe non mostrare un messaggio.',
    blockedHint: 'Le voci di slot danneggiato e interne non vengono mai completate qui.',
    truncated: 'Più di 256 sono in attesa; sono mostrate solo le prime 256.',
    groups: {
      exosuit: 'Exotuta',
      multitool: 'Multi-attrezzo in uso',
      ship: 'Nave {number}',
      freighter: 'Mercantile',
      exocraft: 'Exoveicolo {number}'
    },
    states: {
      waiting: 'In attesa',
      finished: 'Installata',
      still_waiting: 'Ancora in attesa',
      blocked: 'Non consentita',
      unknown_id: 'Sconosciuta al gioco'
    }
  },
  planets: {
    sourceMine: 'I miei pianeti',
    mineHint:
      "Tutto ciò che le tue ricerche hanno trovato, conservato per galassia su questo computer. Esporta l'elenco per condividerlo; importane uno inviato da un amico.",
    galaxy: 'Galassia',
    exportList: 'Esporta il mio elenco',
    importList: 'Importa un elenco',
    exported: '{count} pianeti scritti nel file',
    imported: '{count} nuovi pianeti aggiunti',
    importFailed: 'Quel file non è un elenco di pianeti.',
    durationHint: 'minuti, fino a 1.440 (24 ore)',
    wealth: 'Ricchezza del sistema',
    wealthNames: { Poor: 'Povero', Average: 'Medio', Wealthy: 'Ricco' },
    presetDissonant: 'Dissonante',
    flora: 'Flora',
    fauna: 'Fauna',
    life: { Dead: 'assente', Low: 'scarsa', Mid: 'normale', Full: 'abbondante' },
    purple: 'Stella viola',
    purpleHint: 'I mondi acquatici e i giganti gassosi si trovano solo attorno alle stelle viola.',
    portalOnly: 'Solo con portale',
    portalOnlyHint:
      'Non è una stella della mappa galattica: ci si arriva solo con un portale o con il Viaggia di questa pagina.',
    sourceSurvey: 'Elenco pronto (Euclide)',
    sourceLive: 'Intorno a me (qualsiasi galassia)',
    liveHint:
      'È il gioco stesso a esaminare i sistemi intorno a te, dai più vicini ai più lontani. Più a lungo cerca, più lontano arriva. Continua a giocare; la ricerca si ferma se lasci il sistema.',
    duration: 'Cerca per',
    minutes: '{count} min',
    start: 'Avvia ricerca',
    stop: 'Ferma',
    progress: '{systems} sistemi esaminati, fino a {distance} regioni di distanza',
    liveEmpty: 'Ancora nulla. Avvia una ricerca o chiedi meno.',
    grass: "Colore dell'erba",
    liveState: {
      running: 'Ricerca in corso…',
      done: 'Ricerca terminata',
      stopped: 'Fermata',
      travelled: 'Fermata: hai lasciato il sistema',
      failed: 'Il gioco non ha risposto; non è stato tentato altro',
      not_ready: 'Nessun sistema stellare ancora caricato'
    },
    grassHues: {
      green: 'Verde',
      teal: 'Verde acqua',
      blue: 'Blu',
      purple: 'Viola',
      pink: 'Rosa',
      red: 'Rosso',
      orange: 'Arancione',
      yellow: 'Giallo',
      pale: 'Pallido'
    },
    title: 'Trovare un pianeta',
    hint: 'Scegli come deve essere il pianeta, poi viaggia verso un risultato o copia il suo indirizzo del portale.',
    scopeTitle: 'Solo la galassia Euclide, per ora',
    scope:
      '{count} pianeti di una regione di Euclide, calcolati con le regole del gioco stesso. Alcuni sono stati verificati nel gioco e corrispondevano.',
    presetEarth: 'Simile alla Terra',
    presetAll: 'Tutto',
    presetHint:
      'Simile alla Terra: rigoglioso, senza tempeste, senza clima estremo, poche sentinelle, né infestato né paludoso.',
    biome: 'Bioma',
    variant: 'Variante',
    variantEarth: 'Varianti simili alla Terra',
    storms: 'Tempeste',
    sentinels: 'Sentinelle',
    race: 'Razza del sistema',
    raceNone: 'Disabitato',
    perSystem: 'Risultati nello stesso sistema',
    perSystemOption: 'Almeno {count}',
    perSystemOne: 'Ne basta uno',
    system: 'Sistema',
    systemLawful: 'Senza sistemi pirata',
    systemPirate: 'Solo sistemi pirata',
    pirate: 'Sistema pirata',
    economy: {
      Mining: 'Mineraria',
      HighTech: 'Tecnologia',
      Trading: 'Commercio',
      Manufacturing: 'Manifattura',
      Fusion: 'Materiali avanzati',
      Scientific: 'Scientifica',
      PowerGeneration: 'Produzione di energia'
    },
    extreme: 'Consenti clima estremo',
    extremeHint: 'I pianeti estremi hanno tempeste e pericoli più duri.',
    extremeYes: 'clima estremo',
    any: 'Qualsiasi',
    search: 'Cerca per indirizzo del portale',
    found: '{planets} pianeti in {systems} sistemi',
    inSystem: '{count} in questo sistema',
    copy: 'Copia l’indirizzo del portale',
    copied: 'Copiato',
    save: 'Salva per la pagina Teletrasporto',
    saved: 'Salvato',
    travel: 'Viaggia',
    confirm:
      'Lasci il punto in cui sei e il gioco carica il sistema di {planet} ({portal}) portandoti su quel pianeta. Salva prima se vuoi tornare esattamente qui.',
    empty: 'Impossibile leggere il rilevamento dei pianeti.',
    biomes: {
      Lush: 'Rigoglioso',
      Toxic: 'Tossico',
      Scorched: 'Rovente',
      Radioactive: 'Radioattivo',
      Frozen: 'Ghiacciato',
      Barren: 'Arido',
      Dead: 'Morto',
      Weird: 'Esotico',
      Swamp: 'Palude',
      Lava: 'Vulcanico',
      Red: 'Rosso (cromatico)',
      Green: 'Verde (cromatico)',
      Blue: 'Blu (cromatico)',
      Waterworld: 'Mondo acquatico',
      GasGiant: 'Gigante gassoso'
    },
    variants: {
      standard: 'Standard',
      highQuality: 'Alta qualità',
      jungle: 'Giungla',
      worlds: 'Rinnovato (Worlds)',
      floral: 'Campi di fiori',
      rocky: 'Roccioso',
      tentacles: 'Tentacoli',
      bubbles: 'Bolle',
      giant: 'Flora gigante',
      variant: 'Altra variante',
      swamp: 'Paludoso',
      lava: 'Variante vulcanica',
      ruins: 'Rovine',
      infested: 'Infestato',
      shapes: 'Forme esotiche',
      remix: 'Remix',
      none: 'Senza nome'
    },
    stormLimit: {
      None: 'Nessuna tempesta',
      Low: 'Al massimo poche',
      High: 'Al massimo molte',
      Always: 'Qualsiasi'
    },
    stormLevels: { None: 'nessuna', Low: 'poche', High: 'molte', Always: 'costanti' },
    sentinelLimit: {
      Low: 'Solo basso',
      Default: 'Fino a normale',
      Aggressive: 'Fino ad aggressivo',
      Corrupt: 'Qualsiasi, anche corrotto'
    },
    sentinelLevels: {
      Low: 'basso',
      Default: 'normale',
      Aggressive: 'aggressivo',
      Corrupt: 'corrotto'
    }
  },
  missions: {
    warningTitle: 'Sperimentale: usa un salvataggio di prova',
    warning:
      'Il gioco completa ogni missione che selezioni. Non si sa ancora se ricevi ciò che danno i passaggi saltati. Prima viene fatta una copia del salvataggio.',
    search: 'Cerca per missione o ID',
    untitled: 'Mostra le missioni senza titolo nel gioco',
    untitledHint:
      'Missioni ausiliarie che il gioco non nomina mai nel registro. Sono elencate per identificativo.',
    untitledGroup: 'Senza titolo nel gioco',
    section: {
      story: 'Storia principale',
      atlas: 'Sentiero dell’Atlante',
      secondary: 'Missioni secondarie',
      guide: 'Guida e obiettivi',
      seasonal: 'Spedizioni'
    },
    part: 'Parte {number}',
    after: 'Inizia dopo: {quest}',
    silent: 'nessun messaggio di completamento nel gioco',
    quests: '{shown} di {total} missioni principali',
    count: '{count} missioni',
    stages: '{count} fasi',
    rewards: '{count} ricompense',
    chosen: '{count} spuntate',
    action: 'Completa tutte',
    actionChosen: 'Completa le spuntate ({count})'
  },
  levels: {
    hint: {
      standings:
        'Aumenta la tua reputazione con una razza, una gilda o una fazione per livelli. Lo fa il gioco stesso e mostra il suo messaggio. Nulla viene mai ridotto.',
      milestones:
        'Aumenta i traguardi del viaggio per livelli. Sale solo il numero: aumentare Parole raccolte non insegna alcuna parola. Nulla viene mai ridotto.'
    },
    mode: 'Fino a dove',
    modeOne: '1 livello',
    modeSome: 'Più livelli',
    modeAll: 'Fino all’ultimo livello',
    modeHint: 'Contato dal livello in cui ciascuno si trova ora.',
    messageHint: 'Ogni riga dice se il gioco mostra un messaggio per essa.',
    message: {
      full: 'messaggio completo',
      quick: 'messaggio breve',
      silent: 'nessun messaggio nel gioco'
    },
    announce: 'Mostra la schermata dell’obiettivo anche per le voci silenziose',
    announceHint:
      'Il gioco mostra la schermata completa del traguardo solo per alcune voci. Attivo: la mostra anche per le altre.',
    count: 'Livelli',
    countHint: 'Di quanti livelli salire, da 1 a {max}.',
    action: 'Aumenta tutti',
    actionChosen: 'Aumenta i selezionati ({count})'
  },
  glyphs: {
    hint: "Il gioco consegna i glifi da sé, con la sua notifica. Arrivano nell'ordine del gioco, mostrato sotto; non se ne può scegliere uno.",
    order: 'Ordine dei glifi nel gioco',
    all: 'Tutti e sedici',
    allHint: 'Tutti i glifi in una volta.',
    count: 'Quanti',
    countHint: 'I prossimi glifi che non hai ancora, da 1 a {max}.',
    action: 'Impara i glifi'
  },
  teleport: {
    hint: 'Il gioco ti porta lì, come fanno i suoi teletrasporti. Arrivi alla stazione spaziale del sistema o sul pianeta del primo glifo.',
    galaxy: 'Galassia',
    galaxyHint: 'Tutte le galassie del gioco, per numero e nome. Scrivi per cercare.',
    galaxyEmpty: 'Nessuna galassia trovata.',
    galaxyNumber: 'Galassia {number}',
    address: 'Indirizzo del portale',
    addressHint:
      'Dodici glifi, come cifre da 0 a F: pianeta, sistema e poi le tre coordinate. Premili o incolla il codice.',
    erase: 'Cancella l’ultimo glifo',
    destination: 'Arriva a',
    destinationHint:
      'La stazione spaziale è la scelta sicura. Il pianeta usa il primo glifo dell’indirizzo.',
    toStation: 'Stazione spaziale del sistema',
    toPlanet: 'Pianeta dell’indirizzo',
    action: 'Teletrasporta',
    confirmBody:
      'Lasci il punto in cui ti trovi e il gioco carica l’altro sistema. Salva prima se vuoi tornare esattamente qui.',
    favourites: 'Destinazioni salvate',
    favouritesHint: 'Conservate da questa applicazione su questo computer; il gioco non le vede.',
    favouriteName: 'Nome della destinazione',
    addFavourite: 'Salva questo indirizzo',
    useFavourite: 'Usa',
    removeFavourite: 'Rimuovi',
    noFavourites: 'Ancora niente di salvato.'
  },
  workshop: {
    title: 'Officina dei modelli',
    description:
      'Scegli cosa vuoi vedere, poi scrivi un seme, estraine uno a caso oppure scegli i pezzi e lascia che l’applicazione trovi un seme che li abbia.',
    tabBuild: 'Assembla',
    tabView: 'Vedi un seme',
    buildDescription:
      'Scegli il tipo, i pezzi, i colori e le texture. L’applicazione cerca un seme che li abbia e lo mostra.',
    viewDescription:
      'Scegli il tipo e scrivi un seme, oppure estraine uno a caso, per vedere com’è.',
    colorTitle: 'Colori',
    roles: {
      primary: 'Colore principale',
      secondary: 'Colore secondario',
      decal1: 'Colore decalcomania 1',
      decal2: 'Colore decalcomania 2'
    },
    texturesTitle: 'Texture e decalcomanie',
    baseTexture: { COATING: 'Rivestimento', PAINTED: 'Verniciato', PANELS: 'Metallo' },
    seedTexturesTitle: 'Texture e decalcomanie di questo seme',
    colorHint:
      'Ogni colore che il modello prende dalle tavolozze del gioco. Scegline uno e poi il suo colore; Qualsiasi lo lascia al seme.',
    seedColorsTitle: 'Colori di questo seme',
    paintLabel: 'Vernice',
    undercoatLabel: 'Sottofondo',
    tabSystem: 'Sistema attuale',
    systemDescription:
      'Il sistema stellare in cui ti trovi, letto dal gioco in esecuzione: il suo seme e le astronavi che il gioco ha generato per esso. Nulla nel gioco viene modificato.',
    systemNone:
      'Niente da mostrare. Il gioco deve essere avviato con il ponte 1.8.0 o successivo e un salvataggio caricato; l’elenco si aggiorna ogni pochi secondi.',
    systemSeed: 'Seme del sistema',
    systemShips: 'Astronavi di questo sistema',
    systemClass: 'Classe',
    systemRole: 'Ruolo',
    systemShipSeed: 'Seme',
    systemView: 'Vedi',
    systemRefresh: 'Aggiorna',
    systemClassNumber: 'Classe {number}',
    systemStream:
      'Verificato: i semi delle astronavi sono nel flusso di numeri del seme del sistema; il primo esce dopo {steps} passi.',
    systemStreamUnknown:
      'I semi delle astronavi non sono stati trovati nel flusso di numeri del seme del sistema.',
    tabFile: 'File del modello',
    categoryLabel: 'Categoria',
    category: { starship: 'Astronave', multitool: 'Multi-attrezzo', freighter: 'Mercantile' },
    kindLabel: 'Tipo',
    toolKind: {
      standard: 'Standard',
      royal: 'Reale',
      sentinel: 'Sentinella',
      sentinelB: 'Sentinella B',
      atlasSceptre: 'Scettro di Atlas',
      atlas: 'Atlantide',
      staff: 'Bastone',
      staffRuin: 'Pilastro di Titano',
      staffBone: 'Corona di basilisco',
      switch: 'Infinite Neon Mark XXII',
      retro: 'Stellare v0.27',
      swarm: 'Disintegratore della Vespa funesta',
      staffNpc: 'Bastone dei PNG'
    },
    seedLabel: 'Seme',
    homeSeedHint:
      "Un mercantile prende i colori dal suo sistema d'origine. Scrivi il seme di quel sistema, estraine uno o indica il suo indirizzo del portale qui sotto. Vuoto: senza colori.",
    homeAddress:
      'Questo seme è il sistema con indirizzo del portale {glyphs} nella galassia {galaxy}.',
    glyphsLabel: 'Indirizzo del portale (12 glifi come 0–9, A–F)',
    galaxyLabel: 'Numero della galassia',
    useAddress: 'Usa questo sistema',
    legacyColours: 'Usa i colori precedenti',
    legacyColoursHint:
      'Il gioco ha due modi di estrarre i colori di un seme. I multi-attrezzi che consegna usano quello precedente; le astronavi sono contrassegnate una per una nel salvataggio (Usa i colori precedenti).',
    seedOrigin:
      'Il gioco estrae questo seme nel sistema con indirizzo del portale {glyphs} nella galassia {galaxy} (dopo {steps} passi del suo flusso di numeri). È un indizio, non una prova.',
    seedHint: 'Sedici cifre esadecimali dopo 0x. Premi Invio o Mostra per vederlo.',
    show: 'Mostra',
    generate: 'Genera un seme',
    generateWithParts: 'Genera con questi pezzi',
    clearParts: 'Azzera i pezzi',
    getInGame: 'Ottieni questo nel gioco',
    found: 'Seme trovato dopo {tries} tentativi',
    building: 'Assemblaggio del modello…',
    empty: 'Ancora niente da mostrare',
    partsTitle: 'Pezzi',
    partsHint:
      'Scegli i pezzi che vuoi e lascia il resto su Qualsiasi. Sotto un pezzo che ha pezzi propri compaiono altri elenchi.',
    anyPart: 'Qualsiasi',
    rare: 'raro',
    detailsTitle: 'Dettagli estratti dal seme',
    note: "Il modello viene dai file del tuo gioco. Forme e colori seguono il seme; l'illuminazione è semplificata, quindi appare un po' diverso dal gioco.",
    errors: {
      INSTALLATION_NOT_SELECTED: 'Seleziona prima la cartella del gioco, in Ponte.',
      UNKNOWN_KIND: 'Questo tipo non è disponibile.',
      INVALID_SEED: 'Il seme deve essere 0x seguito da un massimo di sedici cifre esadecimali.',
      GAME_FILES_UNREADABLE: 'Impossibile leggere i file di gioco di questo modello.',
      MODEL_TOO_LARGE: 'Questo modello è troppo grande per essere mostrato.',
      SEED_NOT_FOUND:
        'Nessun seme con questi pezzi è stato trovato in tempo. Riprova o lascia libero un pezzo.'
    }
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
