import type { ReactNode } from "react"

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

type SiteHeaderProps = {
  /** Строка или блок (например кнопка «Назад» + заголовок объекта). */
  title?: ReactNode
  /** Для простого текстового заголовка */
  titleClassName?: string
}

export function SiteHeader({ title = "План", titleClassName }: SiteHeaderProps) {
  const content =
    typeof title === "string" ? (
      <h1 className={titleClassName ?? "text-base font-medium"}>{title}</h1>
    ) : (
      title
    )

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full min-w-0 items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1 shrink-0" />
        <Separator
          orientation="vertical"
          className="mx-2 h-4 shrink-0 data-vertical:self-auto"
        />
        <div className="flex min-w-0 flex-1 items-center gap-3">{content}</div>
      </div>
    </header>
  )
}
