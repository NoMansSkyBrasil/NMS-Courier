import { createContext, useContext, useEffect, useState } from 'react'

export const locales = ['pt-BR', 'en-US', 'es-ES'] as const
export type Locale = (typeof locales)[number]

type CardCopy = readonly [string, string, string, string, string]
type Translation = {
  overview: string
  cards: readonly [CardCopy, CardCopy, CardCopy, CardCopy]
  sidebar: Record<string, string>
  runtimeStatus: {
    bundled: string
    unavailable: string
    version: string
  }
  controls: {
    changeLanguage: string
    changeTheme: string
    light: string
    dark: string
    system: string
  }
}

type LocaleContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  copy: Translation
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

const copy: Record<Locale, Translation> = {
  'pt-BR': {
    overview: 'Visão geral',
    cards: [
      [
        'Runtime de entrega',
        'Não conectado',
        'Planejado',
        'Nenhum processo do jogo está conectado',
        'A integração do runtime ainda não começou'
      ],
      [
        'Protocolo privado',
        'Indisponível',
        'Planejado',
        'A autenticação local está reservada',
        'Nenhum serviço de loopback está em execução'
      ],
      [
        'Serviço local',
        'Não iniciado',
        'Fundação',
        'Fastify está planejado para um marco futuro',
        'Nenhum endpoint localhost está exposto'
      ],
      [
        'Save Editor',
        'Área futura',
        'Reservado',
        'Separado do runtime de entrega',
        'Nenhum save é acessado nesta versão'
      ]
    ],
    sidebar: {
      platform: 'Plataforma', projects: 'Projetos', more: 'Mais', viewProject: 'Ver projeto', shareProject: 'Compartilhar projeto', deleteProject: 'Excluir projeto', teams: 'Áreas', addTeam: 'Adicionar área', foundation: 'Fundação', planned: 'Planejado', futureArea: 'Área futura', deliveryRuntime: 'Runtime de entrega', overview: 'Visão geral', localStatus: 'Status local', implementationPlan: 'Plano de implementação', connections: 'Conexões', privateProtocol: 'Protocolo privado', activityLog: 'Registro de atividade', toolCatalog: 'Catálogo de ferramentas', deliveryTools: 'Ferramentas de entrega', knownData: 'Dados conhecidos', help: 'Ajuda', releaseNotes: 'Notas da versão', application: 'Aplicativo', general: 'Geral', appearance: 'Aparência', language: 'Idioma', about: 'Sobre', protocol: 'Protocolo', distribution: 'Distribuição', localDesktopFoundation: 'Base local para desktop', upgrade: 'Atualizar para Pro', account: 'Conta', billing: 'Cobrança', notifications: 'Notificações', logOut: 'Sair'
    },
    runtimeStatus: {
      bundled: 'Incluído',
      unavailable: 'Indisponível',
      version: 'Runtime privado {version}'
    },
    controls: {
      changeLanguage: 'Alterar idioma',
      changeTheme: 'Alterar tema',
      light: 'Claro',
      dark: 'Escuro',
      system: 'Sistema'
    }
  },
  'en-US': {
    overview: 'Overview',
    cards: [
      [
        'Delivery runtime',
        'Not connected',
        'Planned',
        'No game process is connected',
        'Runtime integration has not started'
      ],
      [
        'Private protocol',
        'Not available',
        'Planned',
        'Local authentication is reserved',
        'No loopback service is running'
      ],
      [
        'Local service',
        'Not started',
        'Foundation',
        'Fastify is planned for a future milestone',
        'No localhost endpoint is exposed'
      ],
      [
        'Save Editor',
        'Future area',
        'Reserved',
        'Kept separate from delivery runtime',
        'No save file is accessed in this build'
      ]
    ],
    sidebar: {
      platform: 'Platform', projects: 'Projects', more: 'More', viewProject: 'View Project', shareProject: 'Share Project', deleteProject: 'Delete Project', teams: 'Areas', addTeam: 'Add area', foundation: 'Foundation', planned: 'Planned', futureArea: 'Future area', deliveryRuntime: 'Delivery Runtime', overview: 'Overview', localStatus: 'Local status', implementationPlan: 'Implementation plan', connections: 'Connections', privateProtocol: 'Private protocol', activityLog: 'Activity log', toolCatalog: 'Tool Catalog', deliveryTools: 'Delivery tools', knownData: 'Known data', help: 'Help', releaseNotes: 'Release notes', application: 'Application', general: 'General', appearance: 'Appearance', language: 'Language', about: 'About', protocol: 'Protocol', distribution: 'Distribution', localDesktopFoundation: 'Local desktop foundation', upgrade: 'Upgrade to Pro', account: 'Account', billing: 'Billing', notifications: 'Notifications', logOut: 'Log out'
    },
    runtimeStatus: {
      bundled: 'Bundled',
      unavailable: 'Unavailable',
      version: 'Private runtime {version}'
    },
    controls: {
      changeLanguage: 'Change language',
      changeTheme: 'Change theme',
      light: 'Light',
      dark: 'Dark',
      system: 'System'
    }
  },
  'es-ES': {
    overview: 'Resumen',
    cards: [
      [
        'Runtime de entrega',
        'Sin conexión',
        'Planificado',
        'No hay ningún proceso del juego conectado',
        'La integración del runtime aún no ha comenzado'
      ],
      [
        'Protocolo privado',
        'No disponible',
        'Planificado',
        'La autenticación local está reservada',
        'No se está ejecutando ningún servicio de loopback'
      ],
      [
        'Servicio local',
        'No iniciado',
        'Base',
        'Fastify está previsto para una fase futura',
        'No hay ningún endpoint localhost expuesto'
      ],
      [
        'Save Editor',
        'Área futura',
        'Reservado',
        'Separado del runtime de entrega',
        'No se accede a ningún guardado en esta compilación'
      ]
    ],
    sidebar: {
      platform: 'Plataforma', projects: 'Proyectos', more: 'Más', viewProject: 'Ver proyecto', shareProject: 'Compartir proyecto', deleteProject: 'Eliminar proyecto', teams: 'Áreas', addTeam: 'Añadir área', foundation: 'Base', planned: 'Planificado', futureArea: 'Área futura', deliveryRuntime: 'Runtime de entrega', overview: 'Resumen', localStatus: 'Estado local', implementationPlan: 'Plan de implementación', connections: 'Conexiones', privateProtocol: 'Protocolo privado', activityLog: 'Registro de actividad', toolCatalog: 'Catálogo de herramientas', deliveryTools: 'Herramientas de entrega', knownData: 'Datos conocidos', help: 'Ayuda', releaseNotes: 'Notas de la versión', application: 'Aplicación', general: 'General', appearance: 'Apariencia', language: 'Idioma', about: 'Acerca de', protocol: 'Protocolo', distribution: 'Distribución', localDesktopFoundation: 'Base local de escritorio', upgrade: 'Actualizar a Pro', account: 'Cuenta', billing: 'Facturación', notifications: 'Notificaciones', logOut: 'Cerrar sesión'
    },
    runtimeStatus: {
      bundled: 'Incluido',
      unavailable: 'No disponible',
      version: 'Runtime privado {version}'
    },
    controls: {
      changeLanguage: 'Cambiar idioma',
      changeTheme: 'Cambiar tema',
      light: 'Claro',
      dark: 'Oscuro',
      system: 'Sistema'
    }
  }
}

function getInitialLocale(): Locale {
  const savedLocale = window.localStorage.getItem('nms-courier.locale')
  return locales.includes(savedLocale as Locale) ? (savedLocale as Locale) : 'en-US'
}

export function LocaleProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [locale, setLocale] = useState<Locale>(getInitialLocale)

  useEffect(() => {
    window.localStorage.setItem('nms-courier.locale', locale)
    document.documentElement.lang = locale
  }, [locale])

  return (
    <LocaleContext.Provider value={{ locale, setLocale, copy: copy[locale] }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale(): LocaleContextValue {
  const context = useContext(LocaleContext)
  if (!context) {
    throw new Error('useLocale must be used within LocaleProvider.')
  }

  return context
}
