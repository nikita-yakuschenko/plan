import { AppSidebar } from "@/components/app-sidebar"
import { PlanScreen } from "@/components/plan/plan-screen"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function Home() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="План" />
        <PlanScreen />
      </SidebarInset>
    </SidebarProvider>
  )
}
