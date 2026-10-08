import * as React from 'react'
import { SendIcon } from 'lucide-react'

import { NavGroup } from '@renderer/components/nav-group'
import { NavStatus } from '@renderer/components/nav-status'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail
} from '@renderer/components/ui/sidebar'
import { featureFromHash, featureGroups, featureHref } from '@renderer/features'
import { useHashRoute } from '@renderer/hooks/use-hash-route'
import { useLocale } from '@renderer/i18n/locale-provider'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>): React.JSX.Element {
  const { copy } = useLocale()
  const activeId = featureFromHash(useHashRoute()).id

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<a href={featureHref('dashboard')} />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <SendIcon className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{copy.app.name}</span>
                <span className="truncate text-xs">{copy.app.tagline}</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {featureGroups.map((group) => (
          <NavGroup key={group.id} group={group.id} features={group.features} activeId={activeId} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavStatus />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
