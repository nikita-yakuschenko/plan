"use client"

import * as React from "react"
import Link from "next/link"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  IconLayoutDashboard,
  IconChartBar,
  IconFolder,
  IconCamera,
  IconFileText,
  IconSettings,
  IconHelpCircle,
  IconSearch,
  IconFileTextSpark,
  IconFileDescription,
  IconCommand,
} from "@tabler/icons-react"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.svg",
  },
  navMain: [
    {
      title: "Дашборд",
      url: "/dashboard",
      icon: (
        <IconLayoutDashboard />
      ),
    },
    {
      title: "Проекты",
      url: "#",
      icon: (
        <IconFolder />
      ),
    },
    {
      title: "Аналитика",
      url: "#",
      icon: (
        <IconChartBar />
      ),
    },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: (
        <IconCamera />
      ),
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: (
        <IconFileText />
      ),
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: (
        <IconFileText />
      ),
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Настройки",
      url: "#",
      icon: (
        <IconSettings />
      ),
    },
    {
      title: "Помощь",
      url: "#",
      icon: (
        <IconHelpCircle />
      ),
    },
    {
      title: "Поиск",
      url: "#",
      icon: (
        <IconSearch />
      ),
    },
  ],
  documents: [
    {
      name: "Спецификации",
      url: "#",
      icon: (
        <IconFileTextSpark />
      ),
    },
    {
      name: "Документация",
      url: "#",
      icon: (
        <IconFileDescription />
      ),
    },
  ],
}
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<Link href="/" />}
              tooltip="Модуль.План"
            >
              <IconCommand className="size-5!" />
              <span className="text-base font-semibold">Модуль.План</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
