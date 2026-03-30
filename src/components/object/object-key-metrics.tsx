"use client"

import { Card, CardContent } from "@/components/ui/card"
import { objectPanelClass } from "@/components/object/object-ui"
import { cn } from "@/lib/utils"

/** Зарезервированные слоты под ключевые метрики проекта (значения подключим позже). */
const METRIC_SLOTS = [
  { id: "readiness", label: "Готовность" },
  { id: "days-to-handover", label: "Дней до сдачи" },
  { id: "budget", label: "Бюджет" },
  { id: "open-risks", label: "Открытые риски" },
] as const

type ObjectKeyMetricsPlaceholderProps = {
  /** Подпись в слоте «Готовность» (например этап 04 до/после чек-листа) */
  readinessLabel?: string | null
}

export function ObjectKeyMetricsPlaceholder({
  readinessLabel = null,
}: ObjectKeyMetricsPlaceholderProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {METRIC_SLOTS.map((slot) => (
        <Card key={slot.id} className={cn(objectPanelClass, "gap-0 py-0")}>
          <CardContent className="flex flex-col gap-1 p-4">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              {slot.label}
            </p>
            <p
              className={cn(
                "text-2xl font-semibold tabular-nums text-foreground",
                slot.id === "readiness" && readinessLabel != null && "text-base leading-snug"
              )}
            >
              {slot.id === "readiness" && readinessLabel != null ? readinessLabel : "—"}
            </p>
            {/* Место под подпись/динамику — позже */}
            <div className="min-h-5" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
