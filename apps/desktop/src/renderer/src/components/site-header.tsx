import { LanguageMenu } from '@renderer/components/language-menu'
import { ModeToggle } from '@renderer/components/mode-toggle'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@renderer/components/ui/breadcrumb'
import { Separator } from '@renderer/components/ui/separator'
import { SidebarTrigger } from '@renderer/components/ui/sidebar'
import { featureFromHash } from '@renderer/features'
import { useHashRoute } from '@renderer/hooks/use-hash-route'
import { useLocale } from '@renderer/i18n/locale'

export function SiteHeader(): React.JSX.Element {
  const { copy } = useLocale()
  const feature = featureFromHash(useHashRoute())

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 h-4 data-vertical:self-auto" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              {copy.groups[feature.group]}
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>{copy.features[feature.id].title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto flex items-center gap-1">
          <LanguageMenu />
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
