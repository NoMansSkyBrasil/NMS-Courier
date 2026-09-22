"use client"

import * as React from "react"

import { NavMain } from "@renderer/components/nav-main"
import { NavProjects } from "@renderer/components/nav-projects"
import { NavUser } from "@renderer/components/nav-user"
import { TeamSwitcher } from "@renderer/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@renderer/components/ui/sidebar"
import { GalleryVerticalEndIcon, AudioLinesIcon, TerminalIcon, TerminalSquareIcon, BotIcon, BookOpenIcon, Settings2Icon, FrameIcon, PieChartIcon, MapIcon } from "lucide-react"
import { useLocale } from '@renderer/i18n/locale-provider'

function getData(copy: ReturnType<typeof useLocale>['copy']) {
  return {
  user: {
    name: "NMS Courier",
    email: copy.sidebar.localDesktopFoundation,
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "NMS Courier",
      logo: (
        <GalleryVerticalEndIcon
        />
      ),
      plan: copy.sidebar.foundation,
    },
    {
      name: copy.sidebar.deliveryRuntime,
      logo: (
        <AudioLinesIcon
        />
      ),
      plan: copy.sidebar.planned,
    },
    {
      name: "Save Editor",
      logo: (
        <TerminalIcon
        />
      ),
      plan: copy.sidebar.futureArea,
    },
  ],
  navMain: [
    {
      title: copy.sidebar.overview,
      url: "#",
      icon: (
        <TerminalSquareIcon
        />
      ),
      isActive: true,
      items: [
        {
          title: copy.sidebar.foundation,
          url: "#",
        },
        {
          title: copy.sidebar.localStatus,
          url: "#",
        },
        {
          title: copy.sidebar.implementationPlan,
          url: "#",
        },
      ],
    },
    {
      title: copy.sidebar.deliveryRuntime,
      url: "#",
      icon: (
        <BotIcon
        />
      ),
      items: [
        {
          title: copy.sidebar.connections,
          url: "#",
        },
        {
          title: copy.sidebar.privateProtocol,
          url: "#",
        },
        {
          title: copy.sidebar.activityLog,
          url: "#",
        },
      ],
    },
    {
      title: copy.sidebar.toolCatalog,
      url: "#",
      icon: (
        <BookOpenIcon
        />
      ),
      items: [
        {
          title: copy.sidebar.deliveryTools,
          url: "#catalog",
        },
        {
          title: copy.sidebar.knownData,
          url: "#",
        },
        {
          title: copy.sidebar.help,
          url: "#",
        },
        {
          title: copy.sidebar.releaseNotes,
          url: "#",
        },
      ],
    },
    {
      title: copy.sidebar.application,
      url: "#",
      icon: (
        <Settings2Icon
        />
      ),
      items: [
        {
          title: copy.sidebar.general,
          url: "#",
        },
        {
          title: copy.sidebar.appearance,
          url: "#",
        },
        {
          title: copy.sidebar.language,
          url: "#",
        },
        {
          title: copy.sidebar.about,
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: copy.sidebar.protocol,
      url: "#",
      icon: (
        <FrameIcon
        />
      ),
    },
    {
      name: copy.sidebar.distribution,
      url: "#",
      icon: (
        <PieChartIcon
        />
      ),
    },
    {
      name: "Save Editor",
      url: "#",
      icon: (
        <MapIcon
        />
      ),
    },
  ],
  }
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { copy } = useLocale()
  const data = getData(copy)
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
