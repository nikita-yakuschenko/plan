"use client"

import { IconArrowLeft } from "@tabler/icons-react"
import Link from "next/link"
import * as React from "react"

import { buttonVariants } from "@/components/ui/button"
import { readReturnHrefForObject } from "@/lib/return-context-storage"
import { cn } from "@/lib/utils"

type Props = {
  objectId: string
  className?: string
  children: React.ReactNode
}

/** «Назад» из sessionStorage — адрес карточки без query; сервер и клиент без рассинхрона. */
export function ReturnToPlanLink({ objectId, className, children }: Props) {
  const href = React.useSyncExternalStore(
    () => () => {},
    () => readReturnHrefForObject(objectId),
    () => "/"
  )

  return (
    <Link
      href={href}
      className={cn(
        buttonVariants({ variant: "default", size: "default" }),
        "shrink-0 gap-1.5",
        className
      )}
    >
      <IconArrowLeft className="size-4 shrink-0" aria-hidden />
      {children}
    </Link>
  )
}
