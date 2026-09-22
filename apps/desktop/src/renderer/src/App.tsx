import { AppSidebar } from '@renderer/components/app-sidebar'
import { SectionCards } from '@renderer/components/section-cards'
import { SiteHeader } from '@renderer/components/site-header'
import { ThemeProvider } from '@renderer/components/theme-provider'
import { LocaleProvider } from '@renderer/i18n/locale-provider'
import { SidebarInset, SidebarProvider } from '@renderer/components/ui/sidebar'
import { TooltipProvider } from '@renderer/components/ui/tooltip'

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
                  <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    <SectionCards />
                  </div>
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
