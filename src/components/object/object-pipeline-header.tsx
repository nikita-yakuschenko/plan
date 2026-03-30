"use client"

import { IconCircleCheck, IconPointFilled } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { objectPanelClass } from "@/components/object/object-ui"
import { pipelineStageIndex } from "@/lib/object-pipeline"
import { cn } from "@/lib/utils"
import type { PlanTask } from "@/types/plan"

export const PIPELINE_STEPS: {
  num: string
  title: string
  date: string
  showDot?: boolean
}[] = [
  { num: "01", title: "Договор", date: "12 фев" },
  { num: "02", title: "Проектирование", date: "28 фев" },
  { num: "03", title: "Производство", date: "20 мар" },
  { num: "04", title: "Готов к отгрузке", date: "25 мар" },
  { num: "05", title: "Фундамент", date: "—" },
  { num: "06", title: "Монтаж", date: "→ 18 апр", showDot: true },
  { num: "07", title: "Отделка", date: "—" },
  { num: "08", title: "Сдача", date: "—" },
]

function formatScheduleUpdated(iso: string): string {
  const d = new Date(iso)
  const t = d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })
  const today = new Date()
  const sameDay =
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  return sameDay ? `обновлено ${t} — сегодня` : `обновлено ${t} — ${d.toLocaleDateString("ru-RU")}`
}

function barClass(i: number, current: number): string {
  if (i > current) return "bg-muted"
  if (i < current) return "bg-sky-500"
  if (i !== current) return "bg-sky-500"
  if (i === 3) return "bg-amber-500"
  if (i === 4) return "bg-orange-500"
  if (i === 5) return "bg-emerald-600"
  return "bg-sky-500"
}

function labelClass(i: number, current: number): string {
  if (i > current) return "text-muted-foreground"
  if (i < current) return "text-sky-700"
  if (i !== current) return "text-sky-700"
  if (i === 3) return "text-amber-700"
  if (i === 4) return "text-orange-700"
  if (i === 5) return "text-emerald-700"
  return "text-sky-700"
}

type Props = {
  task: PlanTask
  /** Этап 04: чек-лист «Готов к отгрузке» полностью закрыт */
  shippingReady?: boolean
}

/** Шапка карточки объекта: без дублирования договора/дома (они в SiteHeader), светлая тема. */
export function ObjectPipelineHeader({
  task,
  shippingReady = false,
}: Props) {
  const current = pipelineStageIndex(task.stage)
  const meta = task.objectCardMeta
  const updatedLabel = formatScheduleUpdated(task.dataMeta.schedule.updatedAt)

  return (
    <div className={cn("overflow-hidden", objectPanelClass)}>
      <div className="flex flex-col gap-4 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
          <span>{meta.areaM2} м²</span>
          <span className="hidden h-4 w-px shrink-0 bg-border sm:block" aria-hidden />
          <span>{meta.kitLabel}</span>
          <span className="hidden h-4 w-px shrink-0 bg-border sm:block" aria-hidden />
          <span>{meta.region}</span>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm">
            Документы
          </Button>
          <Button type="button" variant="outline" size="sm">
            Связаться
          </Button>
          <Button type="button" size="sm">
            Обновить статус
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 border-b border-border px-2 py-4 sm:grid-cols-4 lg:grid-cols-8 lg:gap-0 lg:divide-x lg:divide-border lg:px-0">
        {PIPELINE_STEPS.map((step, i) => {
          const stepTitle =
            i === 3 && current === 3
              ? shippingReady
                ? "Готов к отгрузке"
                : "Подготовка к отгрузке"
              : step.title
          return (
          <div key={step.num} className="flex min-w-0 flex-col px-2 pb-3 lg:px-3 lg:pb-0">
            <div className="flex min-h-[3.5rem] flex-col gap-0.5">
              <p
                className={cn(
                  "text-[10px] font-medium uppercase leading-tight tracking-wide sm:text-[11px]",
                  labelClass(i, current)
                )}
              >
                <span className="inline-flex max-w-full flex-wrap items-center gap-1.5">
                  <span className="min-w-0">
                    {step.num} {stepTitle}
                  </span>
                  {i === 3 && current === 3 && shippingReady ? (
                    <IconCircleCheck
                      className="size-4 shrink-0 text-emerald-600"
                      aria-hidden
                    />
                  ) : null}
                </span>
              </p>
              <div className="flex items-center gap-1">
                {step.showDot && i === current ? (
                  <IconPointFilled className="size-2 shrink-0 text-emerald-600" aria-hidden />
                ) : null}
                <p
                  className={cn(
                    "text-xs",
                    i > current ? "text-muted-foreground" : "text-foreground"
                  )}
                >
                  {step.date}
                </p>
              </div>
            </div>
            <div className={cn("mt-auto h-1 w-full rounded-full", barClass(i, current))} />
          </div>
          )
        })}
      </div>

      <div className="border-t border-border px-4 py-2 text-right">
        <p className="text-[11px] text-muted-foreground">{updatedLabel}</p>
      </div>
    </div>
  )
}
