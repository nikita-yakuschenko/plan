import type { CSSProperties, ReactNode } from "react"

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { getSidebarDefaultOpen } from "@/lib/sidebar-cookie"

export default async function ObjectLayout({ children }: { children: ReactNode }) {
  const defaultOpen = await getSidebarDefaultOpen()

  return (
    <SidebarProvider
      defaultOpen={defaultOpen}
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset className="min-h-0">{children}</SidebarInset>
    </SidebarProvider>
  )
}
