import type { Messages } from '../messages'

export const frFR: Messages = {
  app: { name: 'NMS Courier', tagline: 'Livraison locale pour No Man’s Sky' },
  groups: {
    overview: 'Vue d’ensemble',
    deliver: 'Livrer',
    unlock: 'Débloquer',
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
      summary: 'Prévisualisez des modèles importés et des palettes de couleurs.'
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
  status: { verified: 'Vérifié', experimental: 'Expérimental', planned: 'Prévu' },
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
  settings: {
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
    equipActionLabel: 'Action',
    equipTarget: 'Vaisseau',
    equipTargetCurrent: 'Vaisseau actuel',
    equipTargetSlot: 'Vaisseau de l’emplacement {number}',
    equipClass: 'Classe',
    equipSlots: 'Tous les emplacements d’inventaire',
    equipSlotsHint: 'Rend utilisables toutes les positions des grilles de soute et de technologie.',
    equipSupercharge: 'Emplacements surchargés',
    equipSuperchargeHint:
      'Transforme chaque emplacement de technologie utilisable en emplacement surchargé.',
    equipExtended: 'Rangées de technologie supplémentaires',
    equipExtendedHint:
      'Porte la grille de technologie à douze rangées. Nécessite tous les emplacements d’inventaire.',
    currencyHint:
      'La récompense du jeu ajoute le montant et affiche sa notification. Les montants sont fixes ; envoyez à nouveau pour en recevoir davantage.',
    currencyLabel: 'Monnaie',
    equipAction: {
      grid: 'Appliquer à l’inventaire',
      classStep: 'Monter d’un niveau de classe',
      offer: 'Envoyer une offre de cargo',
      build: 'Lancer la construction d’une corvette'
    },
    equipActionHint: {
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
