import { ActivityPage } from '@renderer/components/activity-page'
import { AppSidebar } from '@renderer/components/app-sidebar'
import { BridgePage } from '@renderer/components/bridge-page'
import { CatalogPage } from '@renderer/components/catalog-page'
import { DashboardPage } from '@renderer/components/dashboard-page'
import { FeaturePage } from '@renderer/components/feature-page'
import { SettingsPage } from '@renderer/components/settings-page'
import { SiteHeader } from '@renderer/components/site-header'
import { ThemeProvider } from '@renderer/components/theme-provider'
import { SidebarInset, SidebarProvider } from '@renderer/components/ui/sidebar'
import { Skeleton } from '@renderer/components/ui/skeleton'
import { TooltipProvider } from '@renderer/components/ui/tooltip'
import { featureFromHash, sectionFromHash } from '@renderer/features'
import { useHashRoute } from '@renderer/hooks/use-hash-route'
import { PageErrorBoundary } from '@renderer/components/page-error-boundary'
import { useLocale } from '@renderer/i18n/locale'
import { LocaleProvider } from '@renderer/i18n/locale-provider'
import { lazy, Suspense } from 'react'

const ModelPreviewPage = lazy(() =>
  import('@renderer/components/model-preview-page').then((module) => ({
    default: module.ModelPreviewPage
  }))
)

// Areas with a page of their own; every other area is described by the generic feature page.
function Workspace(): React.JSX.Element {
  const hash = useHashRoute()
  const feature = featureFromHash(hash)

  if (feature.id === 'dashboard') return <DashboardPage />
  if (feature.id === 'activity') return <ActivityPage />
  if (feature.id === 'catalog') return <CatalogPage />
  if (feature.id === 'bridge') return <BridgePage />
  if (feature.id === 'settings') return <SettingsPage />
  if (feature.id === 'models')
    return (
      <Suspense fallback={<Skeleton className="m-6 h-96" />}>
        <ModelPreviewPage />
      </Suspense>
    )
  return <FeaturePage feature={feature} section={sectionFromHash(hash, feature)} />
}

// A page that fails shows the failure instead of a blank window; going to another page clears it.
function GuardedWorkspace(): React.JSX.Element {
  const { copy } = useLocale()
  return (
    <PageErrorBoundary
      key={useHashRoute()}
      title={copy.page.errorTitle}
      action={copy.page.errorReload}
    >
      <Workspace />
    </PageErrorBoundary>
  )
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
                  <GuardedWorkspace />
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
