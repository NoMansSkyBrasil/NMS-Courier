import type { Messages } from '../messages'

export const esES: Messages = {
  app: { name: 'NMS Courier', tagline: 'Entrega local para No Man’s Sky' },
  sections: { obtain: 'Obtener', upgrade: 'Mejorar' },
  corvette: {
    title: 'Corbeta desde un archivo',
    hint: 'Elige un archivo de corbeta compartido (.nmsship). La aplicación prepara el juego para que la construcción de corbeta empiece con esa nave ya montada; la terminas en el juego. Hay que reiniciar el juego después de preparar el archivo.',
    none: 'Todavía no se ha preparado ningún archivo de corbeta.',
    current: 'Preparado: {name}, {count} piezas.',
    parts: '{count} piezas',
    hullParts: '{count} piezas de casco',
    missing: 'Sin: {parts}. El juego muestra un aviso y la construye igualmente.',
    partCockpit: 'cabina',
    partLandingGear: 'tren de aterrizaje',
    partHabitation: 'módulo de habitación',
    partReactor: 'reactor',
    rejectedTitle: 'Este archivo no se puede usar',
    rejectedShip:
      'Es una nave normal, no una corbeta. Las naves desde archivo aún no están disponibles.',
    rejectedInvalid: 'No es un archivo de corbeta válido.',
    installedTitle: 'Corbeta preparada',
    installedBody:
      'Cierra el juego si está abierto y vuelve a abrirlo. Después usa "Iniciar construcción de corbeta" más abajo.',
    installFailedTitle: 'No se pudo preparar la corbeta',
    installFailed: 'No se pudieron escribir los archivos en la carpeta del juego.',
    choose: 'Elegir archivo',
    install: 'Preparar en el juego'
  },
  groups: {
    overview: 'Resumen',
    deliver: 'Entregar',
    unlock: 'Desbloquear',
    rewards: 'Recompensas',
    library: 'Biblioteca',
    system: 'Sistema'
  },
  features: {
    dashboard: { title: 'Panel', summary: 'Si la entrega está disponible ahora mismo y por qué.' },
    activity: { title: 'Actividad', summary: 'Cada solicitud enviada al juego y su resultado.' },
    items: {
      title: 'Objetos',
      summary: 'Sustancias y productos colocados en un inventario de la partida cargada.'
    },
    currencies: { title: 'Monedas', summary: 'Unidades, nanitos y azogue.' },
    exosuit: {
      title: 'Exotraje',
      summary: 'Clase, ranuras de carga y de tecnología y ranuras sobrecargadas del exotraje.'
    },
    starships: {
      title: 'Naves',
      summary: 'Clase, tamaño del inventario y ranuras sobrecargadas de la nave que posees.'
    },
    multitools: {
      title: 'Multiherramientas',
      summary: 'Clase, ranuras y ranuras sobrecargadas de la multiherramienta equipada.'
    },
    freighters: {
      title: 'Cargueros',
      summary: 'Una oferta de carguero con la clase, el modelo y las semillas elegidos.'
    },
    frigates: { title: 'Fragatas', summary: 'Reclutamiento de fragatas para la flota.' },
    corvettes: {
      title: 'Corbetas',
      summary: 'Una corbeta construida a partir de un diseño compartido.'
    },
    companions: { title: 'Compañeros', summary: 'Huevos de compañero y criaturas.' },
    technologies: {
      title: 'Tecnologías',
      summary: 'Planos que el personaje sabe instalar.'
    },
    productRecipes: {
      title: 'Recetas de fabricación',
      summary: 'Recetas de objetos fabricables y de tecnología fabricable.'
    },
    buildParts: {
      title: 'Piezas de construcción',
      summary: 'Piezas de base, de carguero y de decoración del menú de construcción.'
    },
    refinerRecipes: {
      title: 'Refinado y cocina',
      summary: 'Recetas del refinador y del procesador de nutrientes en el catálogo.'
    },
    customisation: {
      title: 'Apariencia',
      summary: 'Cascos, armaduras, capas, estandartes, estelas de mochila propulsora y gestos.'
    },
    titles: { title: 'Títulos', summary: 'Títulos de jugador para el estandarte.' },
    fishing: { title: 'Registro de pesca', summary: 'El registro de capturas de cada pez.' },
    expeditions: {
      title: 'Expediciones',
      summary: 'Recompensas de expediciones pasadas, reclamables en el compañero de azogue.'
    },
    twitch: {
      title: 'Drops de Twitch',
      summary: 'Recompensas de campañas de Twitch, reclamables en el compañero de azogue.'
    },
    platform: {
      title: 'Plataforma y reserva',
      summary: 'Recompensas ligadas a una plataforma, a una reserva o a un evento.'
    },
    quicksilver: {
      title: 'Tienda de azogue',
      summary: 'Objetos que vende el compañero de azogue.'
    },
    catalog: { title: 'Catálogo del juego', summary: 'Busca los objetos de tu juego instalado.' },
    models: {
      title: 'Taller de modelos',
      summary: 'Previsualiza modelos importados y paletas de colores.'
    },
    bridge: {
      title: 'Juego y puente',
      summary: 'Instalación, versión del juego y la conexión con el juego en ejecución.'
    },
    saves: {
      title: 'Partidas y cuenta',
      summary: 'Qué ranura de guardado está cargada y qué comparte toda la cuenta.'
    },
    settings: { title: 'Ajustes', summary: 'Idioma, apariencia y detalles de la aplicación.' }
  },
  status: { verified: 'Verificado', experimental: 'Experimental', planned: 'Planificado' },
  statusHint: {
    verified: 'Funcionó en el juego en ejecución, en la versión de investigación.',
    experimental: 'Funciona en parte o solo en condiciones conocidas.',
    planned: 'Todavía no está construido.'
  },
  scope: {
    slot: 'Ranura de guardado',
    account: 'Cuenta',
    both: 'Ranura de guardado y cuenta',
    none: 'Sin cambios'
  },
  scopeHint: {
    slot: 'Cambia solo la ranura de guardado cargada.',
    account: 'Cambia la cuenta, compartida por todas las ranuras de guardado.',
    both: 'Cambia la ranura de guardado cargada y la cuenta.',
    none: 'Solo lectura; nada cambia en el juego.'
  },
  rows: {
    deliverable: 'Entregadas',
    blockedDamaged: 'Entradas de ranura dañada, nunca entregadas',
    blockedMaintenance: 'Entradas de mantenimiento, nunca entregadas',
    blockedTemplates: 'Plantillas procedurales, nunca entregadas',
    blockedById: 'Bloqueadas por una regla permanente',
    catalogueItems: 'Objetos fabricables',
    craftableTechnology: 'Tecnología fabricable',
    buildParts: 'Piezas de construcción',
    researchTree: 'Vendidas en los terminales de investigación',
    repeatableNever: 'Compras repetibles, nunca desbloqueadas',
    missionBound: 'Ligados a una misión, omitidos',
    redeemedInSave: 'Registrados en la partida',
    itemRewards: 'Objetos para reclamar en la tienda',
    total: 'En el juego'
  },
  rules: {
    gameRoutines:
      'Todo lo hace el propio juego en ejecución. Los archivos de guardado nunca se editan.',
    defectiveNever: 'Las entradas defectuosas e internas nunca se entregan, en ningún modo.',
    repeatableNever:
      'Los fuegos artificiales, la Baliza Mítica y el Huevo del Vacío nunca se desbloquean: la tienda dejaría de venderlos.',
    claimItems:
      'Naves, multiherramientas, huevos y paquetes se desbloquean en la cuenta; reclámalos en la tienda para recibir el objeto.',
    keepList:
      'Los drops de Twitch solo siguen siendo reclamables mientras el puente esté instalado. Reclama lo que quieras conservar.',
    backup: 'La carpeta de guardado se copia antes de cada cambio.',
    slotIdentified: 'La ranura de guardado cargada se identifica antes de cada entrega.',
    accountShared:
      'Los cambios de la cuenta llegan a todas las ranuras de guardado y el juego los sincroniza.'
  },
  page: {
    availabilityTitle: 'Aún no disponible desde esta ventana',
    availabilityBody:
      'Esto se hizo mediante el puente de investigación. La conexión de esta aplicación con el juego todavía se está construyendo, así que desde aquí no se puede enviar nada.',
    includes: 'Qué abarca',
    includesHint: 'Cifras de la versión de investigación.',
    rulesTitle: 'Cómo se comporta',
    rulesHint: 'Reglas que siempre se aplican.',
    entries: 'Entradas',
    kind: 'Tipo',
    status: 'Estado',
    scope: 'Cambia',
    researchBuild: 'Versión de investigación {build}',
    plannedTitle: 'Todavía no construido',
    plannedBody:
      'Esta área está planificada. Aparecerá aquí cuando funcione en el juego en ejecución.',
    open: 'Abrir'
  },
  dashboard: {
    heroBody:
      'Envía objetos, monedas y desbloqueos a tu propio juego en ejecución. Todo pasa por el propio juego, tus partidas guardadas nunca se editan, y los nombres e iconos que ves aquí proceden de tu instalación.',
    game: 'Juego',
    build: 'Versión del juego',
    bridge: 'Puente',
    catalog: 'Catálogo',
    capabilities: 'Qué puede hacer Courier',
    capabilitiesHint: 'Cada área, qué cambia y hasta dónde se ha comprobado.',
    feature: 'Área',
    area: 'Grupo',
    running: 'En ejecución',
    notRunning: 'Cerrado',
    notSelected: 'Ninguna instalación seleccionada',
    unknown: 'Desconocido',
    supported: 'Compatible',
    unsupported: 'No compatible',
    connected: 'Conectado',
    notConnected: 'No conectado',
    available: 'Disponible',
    unavailable: 'No generado',
    entriesCount: '{count} entradas',
    processId: 'Proceso {id}'
  },
  settings: {
    notifications: 'Notificaciones del juego',
    notificationsHint:
      'Deja que el juego muestre su propia notificación de lo entregado, cuando exista. Desactívalo para entregar en silencio. Las mejoras de inventario nunca piden confirmación.',
    general: 'General',
    appearance: 'Apariencia',
    about: 'Acerca de',
    language: 'Idioma',
    languageHint: 'Los catorce idiomas de No Man’s Sky.',
    theme: 'Tema',
    themeHint: 'Sigue al sistema de forma predeterminada.',
    experimental: 'Software experimental',
    experimentalBody:
      'NMS Courier es una herramienta no oficial en desarrollo. Funciona con una versión exacta del juego cada vez.'
  },
  delivery: {
    obtainPlanned: 'Todavía no es posible obtener uno nuevo aquí.',
    equipSceneEmpty: 'No se encontró ningún modelo.',
    freighterModel: {
      default: 'Elegido por el juego',
      regular: 'Carguero',
      small: 'Carguero pequeño',
      tiny: 'Carguero diminuto',
      capital: 'Carguero capital',
      pirate: 'Acorazado pirata'
    },
    equipScene: 'Modelo',
    equipSceneHint:
      'Opcional. La escena del juego del modelo del carguero; vacío mantiene la elección del propio juego.',
    equipModelSeed: 'Semilla del modelo',
    equipHomeSeed: 'Semilla del sistema de origen',
    currencyAmountHint: 'Cualquier cantidad de 1 a {max}, el mayor saldo que conserva el juego.',
    itemsStack: 'Pila de {count}',
    equipActionLabel: 'Acción',
    equipTarget: 'Nave',
    equipTargetCurrent: 'Nave actual',
    equipTargetSlot: 'Nave del espacio {number}',
    equipClass: 'Clase',
    equipSlots: 'Todos los espacios del inventario',
    equipSlotsHint:
      'Hace utilizables todas las posiciones de las cuadrículas de carga y de tecnología.',
    equipSupercharge: 'Espacios supercargados',
    equipSuperchargeHint:
      'Convierte cada espacio de tecnología utilizable en un espacio supercargado.',
    equipExtended: 'Filas adicionales de tecnología',
    equipExtendedHint:
      'Amplía la cuadrícula de tecnología a doce filas. Requiere todos los espacios del inventario.',
    currencyHint:
      'La recompensa del propio juego añade la cantidad y muestra su notificación. El saldo nunca supera el máximo del juego.',
    currencyLabel: 'Moneda',
    equipAction: {
      slotReward: 'Añadir un espacio de inventario',
      grid: 'Aplicar al inventario',
      classStep: 'Subir un nivel de clase',
      offer: 'Enviar oferta de carguero',
      build: 'Iniciar construcción de corbeta'
    },
    equipActionHint: {
      slotReward:
        'Pide al juego su propia recompensa de espacio. El juego abre su ventana para que elijas dónde va el nuevo espacio.',
      grid: 'Cambia el inventario que ya tienes, en su sitio. No se abre nada en el juego.',
      classStep:
        'Pide al juego su propia recompensa de mejora: un nivel de clase por solicitud, hasta S.',
      offer:
        'El juego te ofrece un carguero con las opciones de abajo. Acéptalo en el juego; sustituye a tu carguero actual.',
      build: 'El juego abre la construcción de corbeta con las opciones de abajo.'
    },
    currencyName: { units: 'Unidades', nanites: 'Nanitos', quicksilver: 'Azogue' },
    itemsTitle: 'Enviar objetos al juego',
    itemsHint:
      'Las sustancias y los productos van a la carga del exotraje de la partida cargada, en pilas del tamaño que permite el juego. Lo que no quepa no se envía.',
    itemsAdd: 'Añadir',
    itemsAmount: 'Cantidad',
    itemsRemove: 'Quitar',
    itemsEmpty: 'Busca en el catálogo y añade los objetos que quieras enviar.',
    itemsAction: 'Enviar objetos ({count})',
    itemsConfirm:
      'Los objetos se colocan en la carga del exotraje de la partida cargada ahora. Antes se hace una copia de seguridad de la carpeta de partidas. El cambio se escribe en la partida cuando el juego guarde.',
    selectTitle: 'Elige qué enviar',
    selectHint: 'Marca una entrada, varias o todas. Solo se envían las entradas elegidas.',
    selectSearch: 'Buscar por nombre o ID',
    selectAllShown: 'Seleccionar todo lo mostrado',
    selectClear: 'Borrar selección',
    selectCount: '{count} seleccionados',
    selectShowing: 'Mostrando {shown} de {total}. Usa la búsqueda para acotar la lista.',
    selectAction: 'Enviar seleccionados ({count})',
    selectNoCatalog:
      'Los nombres aparecen después de leer el catálogo del juego (Biblioteca, Catálogo del juego).',
    selectNone: 'Nada coincide con la búsqueda.',
    title: 'Enviar al juego',
    hint: 'Usa el puente de investigación de esta versión de desarrollo.',
    action: 'Entregar todo',
    sending: 'Enviando…',
    confirmTitle: '¿Enviar esto al juego en ejecución?',
    confirmSlot:
      'Cambia la ranura de guardado cargada en el juego en este momento. Antes se copia la carpeta de guardado.',
    confirmAccount:
      'Cambia tu cuenta, compartida por todas las ranuras de guardado, y el juego la sincroniza. Antes se copian la carpeta de guardado y el archivo de ajustes.',
    confirm: 'Enviar',
    cancel: 'Cancelar',
    result: 'Resultado',
    backup: 'Copia de seguridad: {path}',
    time: 'Hora',
    activityEmptyTitle: 'Aún no se ha enviado nada',
    activityEmptyBody: 'Las entregas de esta sesión aparecen aquí.',
    state: {
      currency_data_missing:
        'El archivo de datos de monedas no está en la carpeta de mods del juego o es de otra versión. No se envió nada.',
      selection_invalid:
        'La selección contiene una entrada que esta área no ofrece. No se envió nada.',
      unavailable: 'Solo disponible en una versión de desarrollo.',
      installation_not_selected: 'Selecciona primero la instalación del juego.',
      game_not_running: 'Inicia el juego y carga una partida.',
      bridge_missing: 'El puente no está instalado en la carpeta del juego.',
      bridge_untested: 'El puente instalado no es una versión probada.',
      ready: 'Listo: juego en ejecución, proceso {id}.',
      busy: 'Hay otra entrega en curso.',
      backup_failed: 'No se pudo hacer la copia de seguridad; no se envió nada.'
    },
    outcome: {
      completed: 'Hecho',
      unknown: 'Resultado desconocido',
      failed: 'Falló',
      refused: 'No enviado'
    },
    outcomeHint: {
      completed: 'El juego respondió a todas las solicitudes. Guarda en el juego para conservarlo.',
      unknown: 'El juego no respondió a tiempo. No lo envíes de nuevo; compruébalo en el juego.',
      failed: 'Una solicitud fue rechazada antes de llegar al juego.',
      refused: 'No se envió nada.'
    }
  },
  bridgePage: {
    versionApp: 'Versión de la aplicación',
    versionBridge: 'Versión del puente instalado',
    versionNone: 'No instalado',
    versionOld: 'Antiguo, sin versión',
    versionCurrent: 'El puente está actualizado.',
    versionOutdated: 'El puente está desactualizado. Esta aplicación incluye el puente {version}.',
    detect: 'Detectar automáticamente',
    detecting: 'Buscando…',
    detectNone: 'No se encontró ninguna instalación. Selecciona la carpeta manualmente.',
    detectSeveral: 'Se encontró más de una instalación. Selecciona la que usas para jugar.',
    installationTitle: 'Instalación del juego',
    installationSelected: '{name} está seleccionada.',
    installationNone: 'Elige la carpeta de instalación de No Man’s Sky.',
    installationInvalid: 'La carpeta seleccionada no es una instalación válida de No Man’s Sky.',
    select: 'Seleccionar instalación',
    verifying: 'Verificando…',
    bridgeTitle: 'Puente de investigación',
    bridgeHint: 'El componente dentro del juego que realiza las entregas.',
    diagnosticsTitle: 'Diagnóstico de solo lectura',
    diagnosticsHint:
      'Conecta el host de runtime privado, que no tiene ningún comando de entrega. Mantén esta ventana abierta hasta cerrar el juego.',
    connect: 'Conectar runtime de solo lectura',
    starting: 'Iniciando…',
    diagNotConnected: 'No hay ningún runtime de diagnóstico conectado.',
    diagHostReady: 'El host de runtime está listo y espera al juego.',
    diagAuthenticated: 'Handshake completado; esperando el callback del juego.',
    diagCallbackReady: 'El callback de solo lectura está activo en el juego.',
    diagFailed: 'El diagnóstico falló ({reason}).',
    diagEnded: 'La sesión de diagnóstico terminó con el juego.'
  },
  catalogPage: {
    generate: 'Leer del juego',
    refresh: 'Leer de nuevo',
    generating: 'Leyendo los archivos del juego…',
    generateHint:
      'El catálogo se lee de tu propia instalación. No se cambia nada en la carpeta del juego ni se abre ninguna partida guardada.',
    imported: '{count} entradas leídas del juego.',
    failInstallation: 'Selecciona primero la instalación del juego.',
    failArchives:
      'No se encontraron los archivos de datos del juego en la instalación seleccionada.',
    failStructure:
      'El juego se ha actualizado y sus tablas han cambiado. Esta versión de la aplicación aún no puede leerlas.',
    failUnreadable: 'No se pudieron leer los archivos de datos del juego.',
    unavailableTitle: 'El catálogo local no está disponible',
    unavailableBody: 'Todavía no se ha generado ningún catálogo en este perfil de la aplicación.',
    title: 'Catálogo local',
    description:
      'Definiciones de solo lectura extraídas de la instalación seleccionada del juego. Un resultado no significa que el objeto pueda entregarse.',
    buildBadge: 'Versión {build}',
    searchLabel: 'Buscar en el catálogo local',
    searchPlaceholder: 'Busca por nombre o ID del juego',
    all: 'Todo',
    substance: 'Sustancias',
    product: 'Productos',
    technology: 'Tecnologías',
    matching: '{count} definiciones coincidentes',
    loading: 'Cargando definiciones…',
    languages: '{count} idiomas del juego'
  },
  preview: {
    title: 'Taller de modelos',
    description: 'Visualiza un modelo GLB local y configura sus piezas visibles.',
    stage: 'Vista experimental',
    import: 'Abrir modelo GLB',
    loading: 'Cargando modelo…',
    empty: 'Elige un modelo local para empezar',
    hint: 'Arrastra para girar, usa la rueda para acercar y el botón derecho para desplazar.',
    limits:
      'Esta versión admite GLB estático de hasta 64 MiB solo con texturas PNG incrustadas y sin recursos externos. La conversión de archivos nativos de NMS aún no está conectada.',
    warning:
      'Las piezas y el color solo cambian esta vista. No calculan una seed ni entregan una nave.',
    parts: 'Piezas visibles',
    all: 'Mostrar todas',
    none: 'Ocultar todas',
    filter: 'Filtrar piezas por nombre',
    tint: 'Color de la vista',
    original: 'Restaurar colores del modelo',
    reset: 'Restablecer cámara',
    palettes: 'Paletas del juego',
    paletteHelp: 'Abre el BASECOLOURPALETTES.MBIN extraído del conjunto de datos compatible.',
    importPalette: 'Abrir MBIN de paletas',
    seed: 'Seed experimental de colores',
    calculatePalette: 'Calcular muestras de colores',
    calculatedSeed: 'Seed calculada',
    family: 'Familia de paleta',
    samples: 'Cinco muestras de colores',
    sample: 'Muestra de color',
    paletteIndex: 'Color de origen',
    colorTarget: 'Aplicar a',
    visibleTarget: 'Todas las piezas visibles',
    applyColor: 'Aplicar color seleccionado',
    paletteWarning:
      'Cálculo experimental de la paleta base. Las muestras RGB colorean piezas; no predicen máscaras de textura, la apariencia nativa ni una seed inversa.',
    INVALID_PALETTE: 'El archivo no coincide con el hash de la paleta base compatible.',
    INVALID_SEED: 'Introduce 0x seguido de 1–16 dígitos hexadecimales.',
    PALETTE_UNAVAILABLE: 'Abre una paleta compatible antes de calcular los colores.',
    failed: 'No se pudo renderizar el modelo.',
    INVALID_MODEL: 'El archivo no es un modelo válido dentro de los límites de la vista.',
    UNSUPPORTED_MODEL: 'Este modelo usa texturas, animación, extensiones o geometría no admitidas.',
    FILE_UNAVAILABLE: 'No se pudo leer el archivo seleccionado.'
  },
  appearance: {
    title: 'Receta de apariencia por seed',
    open: 'Abrir receta de apariencia',
    apply: 'Aplicar receta a la vista previa',
    help: 'Importa una receta o informe de búsqueda con vínculos explícitos de las piezas.',
    warning:
      'Vista candidata: solo piezas explícitas y muestras RGB. No reproduce texturas DDS, máscaras ni shaders nativos.',
    mismatch:
      'El hash del modelo o los nombres de las piezas no coinciden. No se aplicaron cambios.',
    failed: 'No se pudo leer el archivo como una receta de apariencia compatible.',
    seed: 'Seed candidata',
    applied: 'Receta aplicada a la vista previa',
    candidate: 'Candidato del evaluador parcial'
  },
  controls: {
    changeLanguage: 'Cambiar idioma',
    changeTheme: 'Cambiar tema',
    light: 'Claro',
    dark: 'Oscuro',
    system: 'Sistema'
  }
}
