import type { Messages } from '../messages'

export const frFR: Messages = {
  app: { name: 'NMS Courier', tagline: 'Livraison locale pour No Man’s Sky' },
  sections: { obtain: 'Obtenir', upgrade: 'Améliorer' },
  corvette: {
    title: 'Corvette à partir d’un fichier',
    hint: 'Choisissez un fichier de corvette partagé (.nmsship). L’application prépare le jeu pour que la construction de corvette commence avec ce vaisseau déjà assemblé ; vous le terminez dans le jeu. Le jeu doit être redémarré après la préparation du fichier.',
    none: 'Aucun fichier de corvette n’a encore été préparé.',
    current: 'Préparé : {name}, {count} pièces.',
    parts: '{count} pièces',
    hullParts: '{count} pièces de coque',
    missing: 'Sans : {parts}. Le jeu affiche un avertissement et la construit quand même.',
    partCockpit: 'cockpit',
    partLandingGear: 'train d’atterrissage',
    partHabitation: 'module d’habitation',
    partReactor: 'réacteur',
    rejectedTitle: 'Ce fichier ne peut pas être utilisé',
    rejectedShip:
      'C’est un vaisseau ordinaire, pas une corvette. Les vaisseaux à partir d’un fichier ne sont pas encore disponibles.',
    rejectedInvalid: 'Ce n’est pas un fichier de corvette valide.',
    installedTitle: 'Corvette préparée',
    installedBody:
      'Fermez le jeu s’il est ouvert, puis relancez-le. Utilisez ensuite « Lancer la construction d’une corvette » ci-dessous.',
    installFailedTitle: 'Impossible de préparer la corvette',
    installFailed: 'Les fichiers n’ont pas pu être écrits dans le dossier du jeu.',
    choose: 'Choisir un fichier',
    install: 'Préparer dans le jeu'
  },
  groups: {
    overview: 'Vue d’ensemble',
    inventory: 'Objets et monnaies',
    travel: 'Voyage',
    equipment: 'Équipement',
    knowledge: 'Connaissances',
    progress: 'Progression',
    style: 'Apparence',
    rewards: 'Récompenses',
    library: 'Bibliothèque',
    system: 'Système'
  },
  features: {
    dashboard: {
      title: 'Tableau de bord',
      summary: 'Si la livraison est possible maintenant, et pourquoi.'
    },
    activity: { title: 'Activité', summary: 'Chaque demande envoyée au jeu et son résultat.' },
    items: {
      title: 'Objets',
      summary: 'Substances et produits placés dans un inventaire de la sauvegarde chargée.'
    },
    currencies: { title: 'Monnaies', summary: 'Unités, nanites et vif-argent.' },
    teleport: {
      title: 'Téléportation',
      summary: 'Voyagez vers un système stellaire par galaxie et adresse de portail, sans portail.'
    },
    planets: {
      title: 'Recherche de planètes',
      summary: 'Trouvez des planètes par biome, météo et sentinelles, avec leur adresse de portail.'
    },
    exosuit: {
      title: 'Exocombinaison',
      summary:
        'Classe, emplacements de cargaison et de technologie et emplacements surchargés de l’exocombinaison.'
    },
    starships: {
      title: 'Vaisseaux',
      summary:
        'Classe, taille de l’inventaire et emplacements surchargés du vaisseau que vous possédez.'
    },
    multitools: {
      title: 'Multi-outils',
      summary: 'Classe, emplacements et emplacements surchargés du multi-outil équipé.'
    },
    freighters: {
      title: 'Cargos',
      summary: 'Une offre de cargo avec la classe, le modèle et les graines choisis.'
    },
    frigates: { title: 'Frégates', summary: 'Recrutement de frégates pour la flotte.' },
    pendingTech: {
      title: 'Technologies en attente',
      summary:
        'Terminez les technologies qui demandent encore des composants, dans tous les inventaires.'
    },
    corvettes: {
      title: 'Corvettes',
      summary: 'Une corvette construite à partir d’un plan partagé.'
    },
    companions: { title: 'Compagnons', summary: 'Œufs de compagnon et créatures.' },
    technologies: {
      title: 'Technologies',
      summary: 'Plans que le personnage sait installer.'
    },
    productRecipes: {
      title: 'Recettes de fabrication',
      summary: 'Recettes des objets fabricables et de la technologie fabricable.'
    },
    buildParts: {
      title: 'Pièces de construction',
      summary: 'Pièces de base, de cargo et de décoration du menu de construction.'
    },
    refinerRecipes: {
      title: 'Raffinage et cuisine',
      summary: 'Recettes du raffineur et du processeur de nutriments dans le catalogue.'
    },
    customisation: {
      title: 'Apparence',
      summary: 'Casques, armures, capes, bannières, traînées de jetpack et gestes.'
    },
    titles: { title: 'Titres', summary: 'Titres de joueur pour la bannière.' },
    words: {
      title: 'Mots',
      summary: 'Mots des langues Gek, Vy’keen, Korvax, Atlas et Autophage : un, plusieurs ou tous.'
    },
    glyphs: { title: 'Glyphes de portail', summary: 'Les seize glyphes qui ouvrent les portails.' },
    missions: {
      title: 'Missions',
      summary:
        'Demande au jeu de terminer des missions : toutes, une quête avec ses étapes ou une seule étape.'
    },
    guide: {
      title: 'Guide',
      summary: 'Sujets du guide du jeu qui s’ouvrent d’ordinaire en jouant.'
    },
    nexus: { title: 'Anomalie', summary: 'Accès à l’Anomalie, que l’histoire ouvre d’ordinaire.' },
    standings: {
      title: 'Estime',
      summary:
        'Estime auprès de toutes les races, des trois guildes et des hors-la-loi, augmentée par niveaux.'
    },
    milestones: {
      title: 'Étapes clés',
      summary: 'Étapes clés du voyage et médailles des factions, augmentées par niveaux.'
    },
    fishing: { title: 'Registre de pêche', summary: 'Le registre de prise de chaque poisson.' },
    expeditions: {
      title: 'Expéditions',
      summary: 'Récompenses des expéditions passées, à récupérer auprès du compagnon de vif-argent.'
    },
    twitch: {
      title: 'Drops Twitch',
      summary: 'Récompenses des campagnes Twitch, à récupérer auprès du compagnon de vif-argent.'
    },
    platform: {
      title: 'Plateforme et précommande',
      summary: 'Récompenses liées à une plateforme, à une précommande ou à un événement.'
    },
    quicksilver: {
      title: 'Boutique de vif-argent',
      summary: 'Objets vendus par le compagnon de vif-argent.'
    },
    catalog: {
      title: 'Catalogue du jeu',
      summary: 'Recherchez les objets de votre jeu installé.'
    },
    models: {
      title: 'Atelier de modèles',
      summary: 'Voyez à quoi ressemble une graine ou trouvez une graine pour les pièces voulues.'
    },
    bridge: {
      title: 'Jeu et pont',
      summary: 'Installation, version du jeu et connexion au jeu en cours d’exécution.'
    },
    saves: {
      title: 'Sauvegardes et compte',
      summary: 'Quel emplacement de sauvegarde est chargé et ce qui est partagé par tout le compte.'
    },
    settings: { title: 'Paramètres', summary: 'Langue, apparence et détails de l’application.' }
  },
  status: { verified: 'Vérifié', experimental: 'En test', planned: 'Prévu' },
  statusHint: {
    verified: 'A fonctionné dans le jeu en cours d’exécution, sur la version de recherche.',
    experimental: 'Fonctionne en partie ou seulement dans des conditions connues.',
    planned: 'Pas encore construit.'
  },
  scope: {
    slot: 'Emplacement de sauvegarde',
    account: 'Compte',
    both: 'Emplacement de sauvegarde et compte',
    none: 'Aucun changement'
  },
  scopeHint: {
    slot: 'Modifie uniquement l’emplacement de sauvegarde chargé.',
    account: 'Modifie le compte, partagé par tous les emplacements de sauvegarde.',
    both: 'Modifie l’emplacement de sauvegarde chargé et le compte.',
    none: 'Lecture seule ; rien ne change dans le jeu.'
  },
  rows: {
    deliverable: 'Livrées',
    blockedDamaged: 'Entrées d’emplacement endommagé, jamais livrées',
    blockedMaintenance: 'Entrées de maintenance, jamais livrées',
    blockedTemplates: 'Modèles procéduraux, jamais livrés',
    blockedById: 'Bloquées par une règle permanente',
    catalogueItems: 'Objets fabricables',
    craftableTechnology: 'Technologie fabricable',
    buildParts: 'Pièces de construction',
    researchTree: 'Vendues aux terminaux de recherche',
    repeatableNever: 'Achats répétables, jamais débloqués',
    missionBound: 'Liés à une mission, ignorés',
    redeemedInSave: 'Enregistrés dans la sauvegarde',
    itemRewards: 'Objets à récupérer en boutique',
    total: 'Dans le jeu'
  },
  rules: {
    gameRoutines:
      'Tout est fait par le jeu lui-même, en cours d’exécution. Les fichiers de sauvegarde ne sont jamais modifiés.',
    defectiveNever: 'Les entrées défectueuses et internes ne sont jamais livrées, dans aucun mode.',
    repeatableNever:
      'Les feux d’artifice, la Balise mythique et l’Œuf du Néant ne sont jamais débloqués : la boutique cesserait de les vendre.',
    claimItems:
      'Les vaisseaux, multi-outils, œufs et packs sont débloqués sur le compte ; récupérez-les en boutique pour recevoir l’objet.',
    keepList:
      'Les drops Twitch ne restent récupérables que tant que le pont est installé. Récupérez ce que vous voulez garder.',
    backup: 'Le dossier de sauvegarde est copié avant chaque modification.',
    slotIdentified: 'L’emplacement de sauvegarde chargé est identifié avant chaque livraison.',
    accountShared:
      'Les modifications du compte atteignent tous les emplacements de sauvegarde et sont synchronisées par le jeu.'
  },
  page: {
    errorTitle: 'Cette page a cessé de fonctionner',
    errorReload: 'Recharger',
    availabilityTitle: 'Pas encore disponible depuis cette fenêtre',
    availabilityBody:
      'Ceci a été réalisé avec le pont de recherche. La connexion de cette application au jeu est encore en construction ; rien ne peut être envoyé d’ici.',
    includes: 'Ce que cela couvre',
    includesHint: 'Chiffres de la version de recherche.',
    rulesTitle: 'Comportement',
    rulesHint: 'Règles qui s’appliquent toujours.',
    entries: 'Entrées',
    kind: 'Type',
    status: 'État',
    scope: 'Modifie',
    researchBuild: 'Version de recherche {build}',
    plannedTitle: 'Pas encore construit',
    plannedBody:
      'Cette zone est prévue. Elle apparaîtra ici lorsqu’elle fonctionnera dans le jeu en cours d’exécution.',
    open: 'Ouvrir'
  },
  dashboard: {
    connection: 'Connexion',
    heroBody:
      'Envoyez des objets, des monnaies et des déblocages à votre propre jeu en cours d’exécution. Tout passe par le jeu lui-même, vos sauvegardes ne sont jamais modifiées, et les noms et icônes affichés ici proviennent de votre installation.',
    game: 'Jeu',
    build: 'Version du jeu',
    bridge: 'Pont',
    catalog: 'Catalogue',
    capabilities: 'Ce que Courier sait faire',
    capabilitiesHint: 'Chaque zone, ce qu’elle modifie et jusqu’où elle a été prouvée.',
    feature: 'Zone',
    area: 'Groupe',
    running: 'En cours d’exécution',
    notRunning: 'Fermé',
    notSelected: 'Aucune installation sélectionnée',
    unknown: 'Inconnu',
    supported: 'Compatible',
    unsupported: 'Non compatible',
    connected: 'Connecté',
    notConnected: 'Non connecté',
    available: 'Disponible',
    unavailable: 'Non généré',
    entriesCount: '{count} entrées',
    processId: 'Processus {id}'
  },
  setup: {
    chooseTitle: 'Choisissez le dossier du jeu',
    chooseBody: "Courier doit savoir où No Man's Sky est installé.",
    chooseButton: 'Choisir le dossier',
    installTitle: 'Installer Courier dans le jeu',
    updateTitle: 'Mettre à jour Courier dans le jeu',
    installBody:
      "Deux petits fichiers sont copiés dans le dossier du jeu. Rien du jeu n'est remplacé et vos sauvegardes ne sont pas touchées. Lancez ensuite le jeu.",
    installButton: 'Installer',
    updateButton: 'Mettre à jour',
    closeGameTitle: 'Fermez le jeu pour terminer',
    closeGameBody:
      'Les fichiers ne peuvent pas être remplacés pendant que le jeu tourne. Fermez-le et revenez ici.',
    foreignTitle: 'Un autre mod utilise le même fichier',
    foreignBody:
      "Le dossier du jeu contient déjà un fichier xinput9_1_0.dll qui n'est pas celui de Courier. Courier ne le remplacera pas ; retirez d'abord ce mod pour utiliser Courier.",
    unavailableTitle: 'Les fichiers de Courier sont absents',
    unavailableBody:
      "Cette copie de l'application ne contient pas les fichiers qu'elle installe. Téléchargez de nouveau l'application.",
    openGameTitle: 'Lancez le jeu et chargez une sauvegarde',
    openGameBody: 'Courier se connecte tout seul dès que le jeu tourne.',
    readyTitle: 'Connecté au jeu',
    readyBody: 'Tout est prêt. Choisissez quoi envoyer.'
  },
  settings: {
    internalNames: 'Afficher les noms internes',
    internalNamesHint:
      'Affiche les identifiants du jeu et la réponse technique de chaque envoi. Utile pour signaler un problème.',
    notifications: 'Notifications du jeu',
    notificationsHint:
      'Laisse le jeu afficher sa propre notification pour ce qui est livré, lorsqu’il en a une. Désactivez pour livrer en silence. Les améliorations d’inventaire ne demandent jamais de confirmation.',
    general: 'Général',
    appearance: 'Apparence',
    about: 'À propos',
    language: 'Langue',
    languageHint: 'Les quatorze langues de No Man’s Sky.',
    theme: 'Thème',
    themeHint: 'Suit le système par défaut.',
    experimental: 'Logiciel expérimental',
    experimentalBody:
      'NMS Courier est un outil non officiel en cours de développement. Il fonctionne avec une seule version exacte du jeu à la fois.'
  },
  delivery: {
    shipModel: {
      fighter: 'Combattant',
      hauler: 'Transporteur',
      explorer: 'Explorateur',
      shuttle: 'Navette',
      solar: 'Solaire',
      exotic: 'Exotique',
      living: 'Vaisseau vivant',
      interceptor: 'Interceptor'
    },
    toolModel: {
      pistol: 'Pistolet',
      rifle: 'Fusil',
      experimental: 'Expérimental',
      alien: 'Extraterrestre',
      staff: 'Bâton'
    },
    equipSeedHint: 'Vide tire une graine au hasard.',
    obtainAction: 'Envoyer l’offre',
    obtainShipHint:
      'Le jeu vous propose un nouveau vaisseau de ce type, de cette graine et de cette classe sur son propre écran : ajoutez-le à votre collection, échangez l’actuel ou refusez.',
    obtainToolHint:
      'Le jeu vous propose un nouveau multi-outil de ce type, de cette graine et de cette classe sur son propre écran : ajoutez-le à votre collection, échangez l’actuel ou refusez.',
    obtainPlanned: 'Il n’est pas encore possible d’en obtenir un nouveau ici.',
    equipSceneEmpty: 'Aucun modèle trouvé.',
    freighterModel: {
      default: 'Choisi par le jeu',
      regular: 'Cargo',
      small: 'Petit cargo',
      tiny: 'Cargo minuscule',
      capital: 'Cargo capital',
      pirate: 'Cuirassé pirate'
    },
    equipScene: 'Modèle',
    equipSceneHint:
      'Facultatif. La scène du jeu du modèle de cargo ; vide, le jeu fait son propre choix.',
    equipModelSeed: 'Graine du modèle',
    equipLegacyColours: 'Utiliser les anciennes couleurs',
    equipLegacyColoursHint:
      'Marque le multi-outil pour utiliser les anciennes couleurs, comme ceux que le jeu remet. L’offre du jeu n’a pas ce réglage ; la passerelle fait donc dessiner l’offre avec elles et écrit la marque sur l’outil juste après votre acceptation.',
    equipHomeSeed: 'Graine du système d’origine',
    currencyAmountHint:
      'N’importe quel montant de 1 à {max}, le plus grand solde que le jeu conserve.',
    itemsStack: 'Pile de {count}',
    equipActionLabel: 'Action',
    equipTarget: 'Vaisseau',
    equipTargetCurrent: 'Vaisseau actuel',
    equipTargetSlot: 'Vaisseau de l’emplacement {number}',
    equipClass: 'Classe',
    equipSlots: 'Tous les emplacements d’inventaire',
    equipSlotsHint: 'Rend utilisables toutes les positions des grilles de soute et de technologie.',
    equipToolSlots: 'Tous les emplacements de technologie',
    equipToolSlotsHint:
      'Rend utilisables toutes les positions de la grille de technologie du multi-outil, dès l’offre.',
    equipSupercharge: 'Emplacements surchargés',
    equipSuperchargeHint:
      'Transforme chaque emplacement de technologie utilisable en emplacement surchargé.',
    equipExtended: 'Rangées de technologie supplémentaires',
    equipExtendedHint:
      'Porte la grille de technologie à douze rangées. Nécessite tous les emplacements d’inventaire.',
    currencyHint:
      'La récompense du jeu ajoute le montant et affiche sa notification. Le solde ne dépasse jamais le maximum du jeu.',
    currencyLabel: 'Monnaie',
    equipAction: {
      slotReward: 'Ajouter un emplacement d’inventaire',
      grid: 'Appliquer à l’inventaire',
      classStep: 'Monter d’un niveau de classe',
      offer: 'Envoyer une offre de cargo',
      build: 'Lancer la construction d’une corvette'
    },
    equipActionHint: {
      slotReward:
        'Demande au jeu sa propre récompense d’emplacement. Le jeu ouvre sa fenêtre pour que vous choisissiez où placer le nouvel emplacement.',
      grid: 'Modifie l’inventaire que vous possédez déjà, sur place. Rien ne s’ouvre dans le jeu.',
      classStep:
        'Demande au jeu sa propre récompense d’amélioration : un niveau de classe par demande, jusqu’à S.',
      offer:
        'Le jeu vous propose un cargo avec les options ci-dessous. Acceptez-le dans le jeu ; il remplace votre cargo actuel.',
      build: 'Le jeu ouvre la construction de corvette avec les options ci-dessous.'
    },
    currencyName: { units: 'Unités', nanites: 'Nanites', quicksilver: 'Vif-argent' },
    itemsTitle: 'Envoyer des objets au jeu',
    itemsHint:
      'Les substances et les produits vont dans la soute de l’exocombinaison de la sauvegarde chargée, en piles de la taille autorisée par le jeu. Ce qui ne rentre pas n’est pas envoyé.',
    itemsAdd: 'Ajouter',
    itemsAmount: 'Quantité',
    itemsRemove: 'Retirer',
    itemsEmpty: 'Recherchez dans le catalogue et ajoutez les objets à envoyer.',
    itemsAction: 'Envoyer les objets ({count})',
    itemsConfirm:
      'Les objets sont placés dans la soute de l’exocombinaison de la sauvegarde chargée actuellement. Le dossier des sauvegardes est d’abord copié. La modification est écrite dans la sauvegarde lorsque le jeu sauvegarde.',
    selectTitle: 'Choisissez ce qui est envoyé',
    selectHint:
      'Cochez une entrée, plusieurs ou toutes. Seules les entrées choisies sont envoyées.',
    selectSearch: 'Rechercher par nom ou ID',
    selectAllShown: 'Tout sélectionner dans la liste affichée',
    selectClear: 'Effacer la sélection',
    selectCount: '{count} sélectionnés',
    selectShowing: 'Affichage de {shown} sur {total}. Utilisez la recherche pour réduire la liste.',
    selectAction: 'Envoyer la sélection ({count})',
    selectNoCatalog:
      'Les noms apparaissent une fois le catalogue lu depuis le jeu (Bibliothèque, Catalogue du jeu).',
    selectNone: 'Aucun résultat pour cette recherche.',
    title: 'Envoyer au jeu',
    hint: 'Utilise le pont de recherche de cette version de développement.',
    action: 'Tout livrer',
    sending: 'Envoi…',
    confirmTitle: 'Envoyer ceci au jeu en cours d’exécution ?',
    confirmSlot:
      'Cela modifie l’emplacement de sauvegarde actuellement chargé dans le jeu. Le dossier de sauvegarde est copié au préalable.',
    confirmAccount:
      'Cela modifie votre compte, partagé par tous les emplacements de sauvegarde, et le jeu le synchronise. Le dossier de sauvegarde et le fichier de paramètres sont copiés au préalable.',
    confirm: 'Envoyer',
    cancel: 'Annuler',
    result: 'Résultat',
    backup: 'Copie de sécurité : {path}',
    time: 'Heure',
    activityEmptyTitle: 'Rien n’a encore été envoyé',
    activityEmptyBody: 'Les livraisons de cette session apparaissent ici.',
    state: {
      currency_data_missing:
        'Le fichier de données des monnaies n’est pas dans le dossier de mods du jeu ou n’est pas à la bonne version. Rien n’a été envoyé.',
      selection_invalid:
        'La sélection contient une entrée que cette zone ne propose pas. Rien n’a été envoyé.',
      unavailable: 'Disponible uniquement dans une version de développement.',
      installation_not_selected: 'Sélectionnez d’abord l’installation du jeu.',
      game_not_running: 'Lancez le jeu et chargez une sauvegarde.',
      bridge_missing: 'Le pont n’est pas installé dans le dossier du jeu.',
      bridge_untested: 'Le pont installé n’est pas une version testée.',
      ready: 'Prêt : jeu en cours d’exécution, processus {id}.',
      busy: 'Une autre livraison est en cours.',
      backup_failed: 'La copie de sécurité a échoué ; rien n’a été envoyé.'
    },
    outcome: {
      completed: 'Terminé',
      unknown: 'Résultat inconnu',
      failed: 'Échec',
      refused: 'Non envoyé'
    },
    outcomeHint: {
      completed:
        'Le jeu a répondu à chaque demande. Sauvegardez dans le jeu pour conserver le résultat.',
      unknown: 'Le jeu n’a pas répondu à temps. Ne renvoyez pas la demande ; vérifiez dans le jeu.',
      failed: 'Une demande a été rejetée avant d’atteindre le jeu.',
      refused: 'Rien n’a été envoyé.'
    }
  },
  bridgePage: {
    versionApp: 'Version de l’application',
    versionBridge: 'Version du pont installé',
    versionNone: 'Non installé',
    versionOld: 'Ancien, sans version',
    versionCurrent: 'Le pont est à jour.',
    versionOutdated:
      'Le pont n’est pas à jour. Cette application est fournie avec le pont {version}.',
    detect: 'Détecter automatiquement',
    detecting: 'Recherche…',
    detectNone: 'Aucune installation n’a été trouvée. Sélectionnez le dossier vous-même.',
    detectSeveral:
      'Plusieurs installations ont été trouvées. Sélectionnez celle avec laquelle vous jouez.',
    installationTitle: 'Installation du jeu',
    installationSelected: '{name} est sélectionnée.',
    installationNone: 'Choisissez le dossier d’installation de No Man’s Sky.',
    installationInvalid:
      'Le dossier sélectionné n’est pas une installation valide de No Man’s Sky.',
    select: 'Sélectionner l’installation',
    verifying: 'Vérification…',
    bridgeTitle: 'Pont de recherche',
    bridgeHint: 'Le composant à l’intérieur du jeu qui effectue les livraisons.',
    diagnosticsTitle: 'Diagnostic en lecture seule',
    diagnosticsHint:
      'Connecte l’hôte d’exécution privé, qui n’a aucune commande de livraison. Gardez cette fenêtre ouverte jusqu’à la fermeture du jeu.',
    connect: 'Connecter l’exécution en lecture seule',
    starting: 'Démarrage…',
    diagNotConnected: 'Aucune exécution de diagnostic n’est connectée.',
    diagHostReady: 'L’hôte d’exécution est prêt et attend le jeu.',
    diagAuthenticated: 'Négociation terminée ; en attente du rappel du jeu.',
    diagCallbackReady: 'Le rappel en lecture seule est actif dans le jeu.',
    diagFailed: 'Le diagnostic a échoué ({reason}).',
    diagEnded: 'La session de diagnostic s’est terminée avec le jeu.'
  },
  catalogPage: {
    generate: 'Lire depuis le jeu',
    refresh: 'Relire',
    generating: 'Lecture des fichiers du jeu…',
    generateHint:
      'Le catalogue est lu depuis votre propre installation. Rien n’est modifié dans le dossier du jeu et aucune sauvegarde n’est ouverte.',
    imported: '{count} entrées lues depuis le jeu.',
    failInstallation: 'Sélectionnez d’abord l’installation du jeu.',
    failArchives:
      'Les fichiers de données du jeu sont introuvables dans l’installation sélectionnée.',
    failStructure:
      'Le jeu a été mis à jour et ses tables ont changé. Cette version de l’application ne peut pas encore les lire.',
    failUnreadable: 'Impossible de lire les fichiers de données du jeu.',
    unavailableTitle: 'Le catalogue local n’est pas disponible',
    unavailableBody: 'Aucun catalogue n’a encore été généré dans ce profil de l’application.',
    title: 'Catalogue local',
    description:
      'Définitions en lecture seule extraites de l’installation du jeu sélectionnée. Un résultat ne signifie pas que l’objet peut être livré.',
    buildBadge: 'Version {build}',
    searchLabel: 'Rechercher dans le catalogue local',
    searchPlaceholder: 'Rechercher par nom ou identifiant du jeu',
    all: 'Tout',
    substance: 'Substances',
    product: 'Produits',
    technology: 'Technologies',
    matching: '{count} définitions correspondantes',
    loading: 'Chargement des définitions…',
    languages: '{count} langues du jeu'
  },
  words: {
    hint: 'Chaque ligne est un mot du jeu et chaque colonne une langue ; une case n’existe que là où cette langue possède le mot. Le jeu apprend les mots par groupes : cocher un mot coche aussi les autres formes de son groupe dans cette langue (abandonner et abandonné). Une case cochée est ce qui sera envoyé : le jeu n’est pas interrogé sur les mots que vous connaissez déjà.',
    id: 'ID',
    marked: '{count} sur {total} cochées',
    word: 'Mot',
    raceAll: 'Tous les mots de {race} affichés',
    race: {
      Traders: 'Gek',
      Warriors: 'Vy’keen',
      Explorers: 'Korvax',
      Atlas: 'Atlas',
      Builders: 'Autophage'
    }
  },
  pendingTech: {
    title: "Technologies en attente d'installation",
    hint: 'Une technologie avec un engrenage dans le coin demande encore des composants. Vérifiez ce qui attend, puis terminez-le ici : les composants ne sont pas dépensés.',
    check: 'Vérifier mes inventaires',
    notChecked:
      "La vérification parcourt l'exocombinaison, le multi-outil en main, tous les vaisseaux, le cargo et tous les exovéhicules.",
    none: "Rien n'attend. Toutes les technologies sont installées.",
    finishAll: 'Tout terminer ({count})',
    finishGroup: 'Terminer celles-ci',
    finishOne: 'Terminer',
    confirm:
      'Le jeu termine {count} technologies en attente. Les composants demandés ne sont pas dépensés, et le jeu peut ne pas afficher de message.',
    blockedHint: "Les entrées d'emplacement endommagé et internes ne sont jamais terminées ici.",
    truncated: 'Plus de 256 sont en attente ; seules les 256 premières sont affichées.',
    groups: {
      exosuit: 'Exocombinaison',
      multitool: 'Multi-outil en main',
      ship: 'Vaisseau {number}',
      freighter: 'Cargo',
      exocraft: 'Exovéhicule {number}'
    },
    states: {
      waiting: 'En attente',
      finished: 'Installée',
      still_waiting: 'Toujours en attente',
      blocked: 'Non autorisée',
      unknown_id: 'Inconnue du jeu'
    }
  },
  planets: {
    title: 'Trouver une planète',
    hint: 'Choisissez à quoi la planète doit ressembler, puis voyagez vers un résultat ou copiez son adresse de portail.',
    scopeTitle: "Galaxie Euclide uniquement, pour l'instant",
    scope:
      "{count} planètes d'une région d'Euclide, calculées avec les règles du jeu lui-même. Quelques-unes ont été vérifiées en jeu et correspondaient.",
    presetEarth: 'Semblable à la Terre',
    presetAll: 'Tout',
    presetHint:
      'Semblable à la Terre : luxuriante, sans tempêtes, sans météo extrême, peu de sentinelles, ni infestée ni marécageuse.',
    biome: 'Biome',
    variant: 'Variante',
    variantEarth: 'Variantes semblables à la Terre',
    storms: 'Tempêtes',
    sentinels: 'Sentinelles',
    race: 'Race du système',
    raceNone: 'Inhabité',
    perSystem: 'Résultats dans le même système',
    perSystemOption: 'Au moins {count}',
    perSystemOne: 'Une seule suffit',
    system: 'Système',
    systemLawful: 'Sans systèmes pirates',
    systemPirate: 'Systèmes pirates uniquement',
    pirate: 'Système pirate',
    economy: {
      Mining: 'Minière',
      HighTech: 'Technologie',
      Trading: 'Commerce',
      Manufacturing: 'Manufacture',
      Fusion: 'Matériaux avancés',
      Scientific: 'Scientifique',
      PowerGeneration: "Production d'énergie"
    },
    extreme: 'Autoriser la météo extrême',
    extremeHint: 'Les planètes extrêmes ont des tempêtes et des dangers plus rudes.',
    extremeYes: 'météo extrême',
    any: 'Indifférent',
    search: 'Chercher par adresse de portail',
    found: '{planets} planètes dans {systems} systèmes',
    inSystem: '{count} dans ce système',
    copy: 'Copier l’adresse de portail',
    copied: 'Copié',
    save: 'Enregistrer pour la page Téléportation',
    saved: 'Enregistré',
    travel: 'Voyager',
    confirm:
      'Vous quittez l’endroit où vous êtes et le jeu charge le système de {planet} ({portal}) en vous posant sur cette planète. Sauvegardez d’abord pour revenir à cet endroit précis.',
    empty: 'Le relevé des planètes n’a pas pu être lu.',
    biomes: {
      Lush: 'Luxuriant',
      Toxic: 'Toxique',
      Scorched: 'Brûlant',
      Radioactive: 'Radioactif',
      Frozen: 'Gelé',
      Barren: 'Aride',
      Dead: 'Mort',
      Weird: 'Exotique',
      Swamp: 'Marais',
      Lava: 'Volcanique',
      Red: 'Rouge (chromatique)',
      Green: 'Vert (chromatique)',
      Blue: 'Bleu (chromatique)',
      Waterworld: 'Monde aquatique',
      GasGiant: 'Géante gazeuse'
    },
    variants: {
      standard: 'Standard',
      highQuality: 'Haute qualité',
      jungle: 'Jungle',
      worlds: 'Renouvelé (Worlds)',
      floral: 'Champs de fleurs',
      rocky: 'Rocheux',
      tentacles: 'Tentacules',
      bubbles: 'Bulles',
      giant: 'Flore géante',
      variant: 'Autre variante',
      swamp: 'Marécageux',
      lava: 'Variante volcanique',
      ruins: 'Ruines',
      infested: 'Infesté',
      shapes: 'Formes exotiques',
      remix: 'Remix',
      none: 'Sans nom'
    },
    stormLimit: {
      None: 'Aucune tempête',
      Low: 'Rares au plus',
      High: 'Fréquentes au plus',
      Always: 'Indifférent'
    },
    stormLevels: { None: 'aucune', Low: 'rares', High: 'fréquentes', Always: 'constantes' },
    sentinelLimit: {
      Low: 'Faible seulement',
      Default: 'Jusqu’à normal',
      Aggressive: 'Jusqu’à agressif',
      Corrupt: 'Indifférent, même corrompu'
    },
    sentinelLevels: {
      Low: 'faible',
      Default: 'normal',
      Aggressive: 'agressif',
      Corrupt: 'corrompu'
    }
  },
  missions: {
    warningTitle: 'Expérimental : utilisez une sauvegarde de test',
    warning:
      'On demande au jeu, par sa propre récompense, de terminer chaque mission cochée. Une quête est un titre du journal du jeu ; les missions qui le portent sont listées dedans. On ne sait pas encore si le jeu remet ce que les étapes sautées auraient donné ni s’il lance la mission suivante, et la page ne peut pas encore montrer quelles missions sont actives dans votre sauvegarde. La sauvegarde est copiée avant l’envoi.',
    search: 'Chercher par quête, mission ou ID',
    untitled: 'Afficher les missions sans titre dans le jeu',
    untitledHint:
      'Missions auxiliaires que le jeu ne nomme jamais dans le journal. Elles sont listées par identifiant.',
    untitledGroup: 'Sans titre dans le jeu',
    section: {
      story: 'Histoire principale',
      atlas: 'Voie de l’Atlas',
      secondary: 'Missions secondaires',
      guide: 'Guide et étapes clés',
      seasonal: 'Expéditions'
    },
    part: 'Partie {number}',
    after: 'Commence après : {quest}',
    silent: 'aucun message de fin dans le jeu',
    quests: '{shown} quêtes sur {total}',
    count: '{count} missions',
    stages: '{count} étapes',
    rewards: '{count} récompenses',
    chosen: '{count} cochées',
    action: 'Tout terminer',
    actionChosen: 'Terminer la sélection ({count})'
  },
  levels: {
    hint: {
      standings:
        "Augmentez votre réputation auprès d'une race, d'une guilde ou d'une faction par niveaux. Le jeu le fait lui-même et affiche son message. Rien n'est jamais réduit.",
      milestones:
        "Augmentez les jalons du voyage par niveaux. Seul le nombre augmente : augmenter Mots collectés n'apprend aucun mot. Rien n'est jamais réduit."
    },
    mode: 'Jusqu’où',
    modeOne: '1 niveau',
    modeSome: 'Plusieurs niveaux',
    modeAll: 'Jusqu’au dernier niveau',
    modeHint: 'Compté à partir du niveau actuel de chacun.',
    messageHint: 'Chaque ligne indique si le jeu affiche un message pour elle.',
    message: {
      full: 'message complet',
      quick: 'message bref',
      silent: 'aucun message dans le jeu'
    },
    announce: 'Afficher aussi l’écran d’étape clé pour les entrées silencieuses',
    announceHint:
      "Le jeu n'affiche son écran complet de jalon que pour certaines entrées. Activé : il l'affiche aussi pour les autres.",
    count: 'Niveaux',
    countHint: 'Nombre de niveaux à monter, de 1 à {max}.',
    action: 'Tout augmenter',
    actionChosen: 'Augmenter la sélection ({count})'
  },
  glyphs: {
    hint: 'C’est le jeu lui-même qui remet les glyphes, avec sa notification, comme lorsque la tombe d’un Voyageur en donne un. Le jeu ne peut pas donner un glyphe choisi : ils arrivent dans l’ordre du jeu, affiché ci-dessous.',
    order: 'Ordre des glyphes dans le jeu',
    all: 'Les seize',
    allHint: 'Tous les glyphes d’un coup.',
    count: 'Combien',
    countHint: 'Les prochains glyphes que vous n’avez pas encore, de 1 à {max}.',
    action: 'Apprendre les glyphes'
  },
  teleport: {
    hint: 'C’est le jeu en cours qui fait le voyage : la demande est faite comme le font ses propres téléporteurs. Vous arrivez à la station spatiale du système ou sur la planète que désigne le premier glyphe. Expérimental.',
    galaxy: 'Galaxie',
    galaxyHint: 'Toutes les galaxies du jeu, par numéro et par nom. Tapez pour chercher.',
    galaxyEmpty: 'Aucune galaxie trouvée.',
    galaxyNumber: 'Galaxie {number}',
    address: 'Adresse de portail',
    addressHint:
      'Douze glyphes, sous forme de chiffres de 0 à F : planète, système, puis les trois coordonnées. Cliquez dessus ou collez le code.',
    erase: 'Effacer le dernier glyphe',
    destination: 'Arriver à',
    destinationHint:
      'La station spatiale est le choix sûr. La planète utilise le premier glyphe de l’adresse.',
    toStation: 'Station spatiale du système',
    toPlanet: 'Planète de l’adresse',
    action: 'Téléporter',
    confirmBody:
      'Vous quittez l’endroit où vous êtes et le jeu charge l’autre système. Sauvegardez d’abord si vous voulez revenir exactement ici.',
    favourites: 'Destinations enregistrées',
    favouritesHint: 'Conservées par cette application sur cet ordinateur ; le jeu ne les voit pas.',
    favouriteName: 'Nom de la destination',
    addFavourite: 'Enregistrer cette adresse',
    useFavourite: 'Utiliser',
    removeFavourite: 'Retirer',
    noFavourites: 'Rien d’enregistré pour l’instant.'
  },
  workshop: {
    title: 'Atelier de modèles',
    description:
      'Choisissez ce que vous voulez voir, puis saisissez une graine, tirez-en une au hasard ou choisissez les pièces et laissez l’application trouver une graine qui les possède.',
    tabBuild: 'Assembler',
    tabView: 'Voir une graine',
    buildDescription:
      'Choisissez le type, les pièces, les couleurs et les textures. L’application cherche une graine qui les possède et l’affiche.',
    viewDescription:
      'Choisissez le type et saisissez une graine, ou tirez-en une au hasard, pour voir à quoi elle ressemble.',
    colorTitle: 'Couleurs',
    roles: {
      primary: 'Couleur principale',
      secondary: 'Couleur secondaire',
      decal1: 'Couleur de décalcomanie 1',
      decal2: 'Couleur de décalcomanie 2'
    },
    texturesTitle: 'Textures et décalcomanies',
    baseTexture: { COATING: 'Revêtement', PAINTED: 'Peint', PANELS: 'Métal' },
    seedTexturesTitle: 'Textures et décalcomanies de cette graine',
    colorHint:
      'Chaque couleur que le modèle prend dans les palettes du jeu. Choisissez-en une, puis sa couleur ; Indifférent la laisse à la graine.',
    seedColorsTitle: 'Couleurs de cette graine',
    paintLabel: 'Peinture',
    undercoatLabel: 'Sous-couche',
    tabSystem: 'Système actuel',
    systemDescription:
      'Le système stellaire où vous êtes, lu dans le jeu en cours d’exécution : sa graine et les vaisseaux que le jeu a générés pour lui. Rien n’est modifié dans le jeu.',
    systemNone:
      'Rien à afficher. Le jeu doit être lancé avec la passerelle 1.8.0 ou plus récente et une sauvegarde chargée ; la liste est actualisée toutes les quelques secondes.',
    systemSeed: 'Graine du système',
    systemShips: 'Vaisseaux de ce système',
    systemClass: 'Classe',
    systemRole: 'Rôle',
    systemShipSeed: 'Graine',
    systemView: 'Voir',
    systemRefresh: 'Actualiser',
    systemClassNumber: 'Classe {number}',
    systemStream:
      'Vérifié : les graines des vaisseaux sont sur le flux de nombres de la graine du système ; la première sort après {steps} pas.',
    systemStreamUnknown:
      'Les graines des vaisseaux n’ont pas été trouvées sur le flux de nombres de la graine du système.',
    tabFile: 'Fichier de modèle',
    categoryLabel: 'Catégorie',
    category: { starship: 'Vaisseau', multitool: 'Multi-outil', freighter: 'Cargo' },
    kindLabel: 'Type',
    toolKind: {
      standard: 'Standard',
      royal: 'Royal',
      sentinel: 'Sentinelle',
      sentinelB: 'Sentinelle B',
      atlasSceptre: 'Sceptre d’Atlas',
      atlas: 'Atlantide',
      staff: 'Bâton',
      staffRuin: 'Pilier de Titan',
      staffBone: 'Couronne de basilic',
      switch: 'Néon Infini Mark XXII',
      retro: 'Starbound v0.27',
      swarm: 'Désintégrateur de guêpe sinistre',
      staffNpc: 'Bâton de PNJ'
    },
    seedLabel: 'Graine',
    homeSeedHint:
      'Un cargo tire ses couleurs de son système stellaire d’origine, et la graine d’un système est son adresse dans la galaxie. Saisissez la graine, tirez-en une ou indiquez ci-dessous l’adresse de portail du système ; vide affiche le cargo sans couleurs.',
    homeAddress:
      'Cette graine est le système d’adresse de portail {glyphs} dans la galaxie {galaxy}.',
    glyphsLabel: 'Adresse de portail (12 glyphes en 0–9, A–F)',
    galaxyLabel: 'Numéro de galaxie',
    useAddress: 'Utiliser ce système',
    legacyColours: 'Utiliser les anciennes couleurs',
    legacyColoursHint:
      'Le jeu a deux façons de tirer les couleurs d’une graine. Les multi-outils qu’il remet utilisent l’ancienne ; les vaisseaux sont marqués un par un dans la sauvegarde (Utiliser les anciennes couleurs).',
    seedOrigin:
      'Le jeu tire cette graine dans le système d’adresse de portail {glyphs} de la galaxie {galaxy} (après {steps} pas de son flux de nombres). C’est une piste, pas une preuve.',
    seedHint: 'Seize chiffres hexadécimaux après 0x. Appuyez sur Entrée ou Afficher pour la voir.',
    show: 'Afficher',
    generate: 'Générer une graine',
    generateWithParts: 'Générer avec ces pièces',
    clearParts: 'Effacer les pièces',
    getInGame: 'Obtenir celui-ci dans le jeu',
    found: 'Graine trouvée après {tries} essais',
    building: 'Assemblage du modèle…',
    empty: 'Rien à afficher pour l’instant',
    partsTitle: 'Pièces',
    partsHint:
      'Choisissez les pièces voulues et laissez le reste sur Indifférent. D’autres listes apparaissent sous une pièce qui a ses propres pièces.',
    anyPart: 'Indifférent',
    rare: 'rare',
    detailsTitle: 'Détails tirés par la graine',
    note: 'Le modèle est lu dans vos propres fichiers du jeu. Pièces, couches de texture, décalcomanies et couleurs suivent la graine ; l’éclairage et les effets de matériau sont simplifiés, le métal et les ombres diffèrent donc du jeu. Les pièces ont été vérifiées avec un outil indépendant et avec un multi-outil acheté dans le jeu en cours ; les couleurs sont proches, pas exactes.',
    errors: {
      INSTALLATION_NOT_SELECTED: 'Sélectionnez d’abord le dossier du jeu, dans Passerelle.',
      UNKNOWN_KIND: 'Ce type n’est pas disponible.',
      INVALID_SEED: 'La graine doit être 0x suivi d’au plus seize chiffres hexadécimaux.',
      GAME_FILES_UNREADABLE: 'Les fichiers du jeu de ce modèle n’ont pas pu être lus.',
      MODEL_TOO_LARGE: 'Ce modèle est trop volumineux pour être affiché.',
      SEED_NOT_FOUND:
        'Aucune graine avec ces pièces n’a été trouvée à temps. Réessayez ou laissez une pièce libre.'
    }
  },
  preview: {
    title: 'Atelier de modèles',
    description: 'Inspectez un modèle GLB statique local et assemblez ses parties visibles.',
    stage: 'Aperçu expérimental',
    import: 'Ouvrir un modèle GLB',
    loading: 'Chargement du modèle…',
    empty: 'Choisissez un modèle local pour commencer',
    hint: 'Faites glisser pour pivoter, utilisez la molette pour zoomer et le clic droit pour déplacer.',
    limits:
      'Cette version accepte les fichiers GLB statiques jusqu’à 64 Mio, avec des textures PNG intégrées uniquement et sans ressources externes. La conversion native des ressources de NMS n’est pas encore branchée.',
    warning:
      'Les sélections de parties et la teinte ne concernent que cet aperçu. Elles ne calculent pas de graine et ne livrent pas de vaisseau.',
    parts: 'Parties visibles',
    all: 'Tout afficher',
    none: 'Tout masquer',
    filter: 'Filtrer les parties par nom',
    tint: 'Teinte de l’aperçu',
    original: 'Rétablir les couleurs du modèle',
    reset: 'Réinitialiser la caméra',
    palettes: 'Palettes du jeu',
    paletteHelp:
      'Ouvrez le fichier BASECOLOURPALETTES.MBIN extrait du jeu de données pris en charge.',
    importPalette: 'Ouvrir le MBIN de palettes',
    seed: 'Graine de couleur expérimentale',
    calculatePalette: 'Calculer les échantillons de couleur',
    calculatedSeed: 'Graine calculée',
    family: 'Famille de palette',
    samples: 'Cinq échantillons de couleur',
    sample: 'Échantillon de couleur',
    paletteIndex: 'Couleur source',
    colorTarget: 'Appliquer à',
    visibleTarget: 'Toutes les parties visibles',
    applyColor: 'Appliquer la couleur sélectionnée',
    paletteWarning:
      'Calcul expérimental de la palette de base. Les échantillons RVB recolorent les parties ; ils ne prédisent ni les masques de texture natifs, ni l’apparence d’un vaisseau, ni une graine inverse.',
    INVALID_PALETTE:
      'Ce fichier ne correspond pas à l’empreinte de la palette de base prise en charge.',
    INVALID_SEED: 'Saisissez 0x suivi de 1 à 16 chiffres hexadécimaux.',
    PALETTE_UNAVAILABLE:
      'Ouvrez un fichier de palette pris en charge avant de calculer les couleurs.',
    failed: 'Le modèle n’a pas pu être affiché.',
    INVALID_MODEL: 'Le fichier n’est pas un modèle valide dans les limites de l’aperçu.',
    UNSUPPORTED_MODEL:
      'Ce modèle utilise des textures, une animation, des extensions ou une géométrie hors du sous-ensemble pris en charge.',
    FILE_UNAVAILABLE: 'Le fichier sélectionné n’a pas pu être lu.'
  },
  appearance: {
    title: 'Recette d’apparence par graine',
    open: 'Ouvrir une recette d’apparence',
    apply: 'Appliquer la recette à l’aperçu',
    help: 'Importez une recette ou un rapport de recherche de graines avec des liaisons de maillages explicites.',
    warning:
      'Aperçu candidat : parties explicites et échantillons RVB uniquement. Les textures DDS, masques et shaders natifs ne sont pas reproduits.',
    mismatch:
      'L’empreinte du modèle ou les noms des maillages ne correspondent pas. Aucun changement n’a été appliqué.',
    failed: 'Le fichier n’a pas pu être lu comme une recette d’apparence prise en charge.',
    seed: 'Graine candidate',
    applied: 'Recette appliquée à l’aperçu',
    candidate: 'Candidat de l’évaluateur partiel'
  },
  controls: {
    changeLanguage: 'Changer de langue',
    changeTheme: 'Changer de thème',
    light: 'Clair',
    dark: 'Sombre',
    system: 'Système'
  }
}
