import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@renderer/components/ui/sidebar'
import { featureHref, type Feature } from '@renderer/features'
import { useLocale } from '@renderer/i18n/locale-provider'
import type { GroupId } from '@renderer/i18n/messages'

export function NavGroup({
  group,
  features,
  activeId
}: {
  group: GroupId
  features: readonly Feature[]
  activeId: string
}): React.JSX.Element {
  const { copy } = useLocale()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{copy.groups[group]}</SidebarGroupLabel>
      <SidebarMenu>
        {features.map((feature) => (
          <SidebarMenuItem key={feature.id}>
            <SidebarMenuButton
              isActive={feature.id === activeId}
              tooltip={copy.features[feature.id].title}
              render={<a href={featureHref(feature.id)} />}
            >
              <feature.icon />
              <span>{copy.features[feature.id].title}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
