import { createContext, useContext, useEffect, useState } from 'react'

export const locales = ['pt-BR', 'en-US', 'es-ES'] as const
export type Locale = (typeof locales)[number]

type CardCopy = readonly [string, string, string, string, string]
type Translation = {
  overview: string
  cards: readonly [CardCopy, CardCopy, CardCopy, CardCopy]
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
      ['Runtime de entrega', 'Não conectado', 'Planejado', 'Nenhum processo do jogo está conectado', 'A integração do runtime ainda não começou'],
      ['Protocolo privado', 'Indisponível', 'Planejado', 'A autenticação local está reservada', 'Nenhum serviço de loopback está em execução'],
      ['Serviço local', 'Não iniciado', 'Fundação', 'Fastify está planejado para um marco futuro', 'Nenhum endpoint localhost está exposto'],
      ['Save Editor', 'Área futura', 'Reservado', 'Separado do runtime de entrega', 'Nenhum save é acessado nesta versão']
    ]
  },
  'en-US': {
    overview: 'Overview',
    cards: [
      ['Delivery runtime', 'Not connected', 'Planned', 'No game process is connected', 'Runtime integration has not started'],
      ['Private protocol', 'Not available', 'Planned', 'Local authentication is reserved', 'No loopback service is running'],
      ['Local service', 'Not started', 'Foundation', 'Fastify is planned for a future milestone', 'No localhost endpoint is exposed'],
      ['Save Editor', 'Future area', 'Reserved', 'Kept separate from delivery runtime', 'No save file is accessed in this build']
    ]
  },
  'es-ES': {
    overview: 'Resumen',
    cards: [
      ['Runtime de entrega', 'Sin conexión', 'Planificado', 'No hay ningún proceso del juego conectado', 'La integración del runtime aún no ha comenzado'],
      ['Protocolo privado', 'No disponible', 'Planificado', 'La autenticación local está reservada', 'No se está ejecutando ningún servicio de loopback'],
      ['Servicio local', 'No iniciado', 'Base', 'Fastify está previsto para una fase futura', 'No hay ningún endpoint localhost expuesto'],
      ['Save Editor', 'Área futura', 'Reservado', 'Separado del runtime de entrega', 'No se accede a ningún guardado en esta compilación']
    ]
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

  return <LocaleContext.Provider value={{ locale, setLocale, copy: copy[locale] }}>{children}</LocaleContext.Provider>
}

export function useLocale(): LocaleContextValue {
  const context = useContext(LocaleContext)
  if (!context) {
    throw new Error('useLocale must be used within LocaleProvider.')
  }

  return context
}
