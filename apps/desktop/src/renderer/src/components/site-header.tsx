import { LanguageMenu } from '@renderer/components/language-menu'
import { ModeToggle } from '@renderer/components/mode-toggle'
import { useLocale } from '@renderer/i18n/locale-provider'
import { Separator } from "@renderer/components/ui/separator"
import { SidebarTrigger } from "@renderer/components/ui/sidebar"

export function SiteHeader() {
  const { copy } = useLocale()
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 h-4 data-vertical:self-auto"
        />
        <h1 className="text-base font-medium">{copy.overview}</h1>
        <div className="ml-auto flex items-center gap-1">
          <LanguageMenu />
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
