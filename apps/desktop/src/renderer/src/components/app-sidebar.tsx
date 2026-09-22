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

// This is sample data.
const data = {
  user: {
    name: "NMS Courier",
    email: "Local desktop foundation",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "NMS Courier",
      logo: (
        <GalleryVerticalEndIcon
        />
      ),
      plan: "Foundation",
    },
    {
      name: "Delivery Runtime",
      logo: (
        <AudioLinesIcon
        />
      ),
      plan: "Planned",
    },
    {
      name: "Save Editor",
      logo: (
        <TerminalIcon
        />
      ),
      plan: "Future area",
    },
  ],
  navMain: [
    {
      title: "Overview",
      url: "#",
      icon: (
        <TerminalSquareIcon
        />
      ),
      isActive: true,
      items: [
        {
          title: "Foundation",
          url: "#",
        },
        {
          title: "Local status",
          url: "#",
        },
        {
          title: "Implementation plan",
          url: "#",
        },
      ],
    },
    {
      title: "Delivery Runtime",
      url: "#",
      icon: (
        <BotIcon
        />
      ),
      items: [
        {
          title: "Connections",
          url: "#",
        },
        {
          title: "Private protocol",
          url: "#",
        },
        {
          title: "Activity log",
          url: "#",
        },
      ],
    },
    {
      title: "Tool Catalog",
      url: "#",
      icon: (
        <BookOpenIcon
        />
      ),
      items: [
        {
          title: "Delivery tools",
          url: "#",
        },
        {
          title: "Known data",
          url: "#",
        },
        {
          title: "Help",
          url: "#",
        },
        {
          title: "Release notes",
          url: "#",
        },
      ],
    },
    {
      title: "Application",
      url: "#",
      icon: (
        <Settings2Icon
        />
      ),
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Appearance",
          url: "#",
        },
        {
          title: "Language",
          url: "#",
        },
        {
          title: "About",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Protocol",
      url: "#",
      icon: (
        <FrameIcon
        />
      ),
    },
    {
      name: "Distribution",
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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
