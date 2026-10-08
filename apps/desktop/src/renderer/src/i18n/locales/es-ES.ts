import type { Messages } from '../messages'

export const esES: Messages = {
  app: { name: 'NMS Courier', tagline: 'Entrega local para No Man’s Sky' },
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
  controls: {
    changeLanguage: 'Cambiar idioma',
    changeTheme: 'Cambiar tema',
    light: 'Claro',
    dark: 'Oscuro',
    system: 'Sistema'
  }
}
