import { AppSidebar } from '@renderer/components/app-sidebar'
import { CatalogPage } from '@renderer/components/catalog-page'
import { SectionCards } from '@renderer/components/section-cards'
import { SiteHeader } from '@renderer/components/site-header'
import { ThemeProvider } from '@renderer/components/theme-provider'
import { LocaleProvider } from '@renderer/i18n/locale-provider'
import { SidebarInset, SidebarProvider } from '@renderer/components/ui/sidebar'
import { TooltipProvider } from '@renderer/components/ui/tooltip'
import { useEffect, useState } from 'react'

function Workspace(): React.JSX.Element {
  const [catalogOpen, setCatalogOpen] = useState(window.location.hash === '#catalog')

  useEffect(() => {
    const updatePage = (): void => setCatalogOpen(window.location.hash === '#catalog')
    window.addEventListener('hashchange', updatePage)
    return () => window.removeEventListener('hashchange', updatePage)
  }, [])

  return catalogOpen ? <CatalogPage /> : <SectionCards />
}

function App(): React.JSX.Element {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <LocaleProvider>
        <TooltipProvider>
          <SidebarProvider
            style={
              {
                '--sidebar-width': 'calc(var(--spacing) * 72)',
                '--header-height': 'calc(var(--spacing) * 12)'
              } as React.CSSProperties
            }
          >
            <AppSidebar variant="inset" />
            <SidebarInset>
              <SiteHeader />
              <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                  <Workspace />
                </div>
              </div>
            </SidebarInset>
          </SidebarProvider>
        </TooltipProvider>
      </LocaleProvider>
    </ThemeProvider>
  )
}

export default App
