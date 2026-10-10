import { MinusIcon, PlusIcon } from 'lucide-react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@renderer/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem
} from '@renderer/components/ui/sidebar'
import { featureHref, type Feature } from '@renderer/features'
import { useLocale } from '@renderer/i18n/locale'
import type { GroupId } from '@renderer/i18n/messages'
import { groupIconTones } from '@renderer/features/tones'

// One group of the sidebar. An area with sections (getting a new one, upgrading the one you own)
// opens into them, as in the standard collapsible sidebar; the others are plain links.
export function NavGroup({
  group,
  features,
  activeId,
  activeSection
}: {
  group: GroupId
  features: readonly Feature[]
  activeId: string
  activeSection: string | null
}): React.JSX.Element {
  const { copy } = useLocale()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{copy.groups[group]}</SidebarGroupLabel>
      <SidebarMenu>
        {features.map((feature) =>
          feature.sections ? (
            <Collapsible
              // Remounted when the area becomes the current page, so it opens on arrival.
              key={`${feature.id}:${feature.id === activeId}`}
              defaultOpen={feature.id === activeId}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger
                  render={
                    <SidebarMenuButton
                      isActive={feature.id === activeId}
                      tooltip={copy.features[feature.id].title}
                    />
                  }
                >
                  <feature.icon className={groupIconTones[group]} />
                  <span>{copy.features[feature.id].title}</span>
                  <PlusIcon className="ml-auto group-data-open/collapsible:hidden" />
                  <MinusIcon className="ml-auto group-data-closed/collapsible:hidden" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {feature.sections.map((section) => (
                      <SidebarMenuSubItem key={section}>
                        <SidebarMenuSubButton
                          isActive={feature.id === activeId && section === activeSection}
                          render={<a href={featureHref(feature.id, section)} />}
                        >
                          {copy.sections[section]}
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ) : (
            <SidebarMenuItem key={feature.id}>
              <SidebarMenuButton
                isActive={feature.id === activeId}
                tooltip={copy.features[feature.id].title}
                className={feature.status === 'planned' ? 'opacity-60' : undefined}
                render={<a href={featureHref(feature.id)} />}
              >
                <feature.icon className={groupIconTones[group]} />
                <span>{copy.features[feature.id].title}</span>
                {feature.status === 'planned' && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    {copy.status.planned}
                  </span>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        )}
      </SidebarMenu>
    </SidebarGroup>
  )
}
