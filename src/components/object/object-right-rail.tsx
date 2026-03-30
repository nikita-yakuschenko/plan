"use client"

import * as React from "react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { objectPanelClass } from "@/components/object/object-ui"
import { cn } from "@/lib/utils"
import type { PlanTask } from "@/types/plan"
import { IconClock } from "@tabler/icons-react"

function railSectionTitle(label: string) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
  )
}

function parseIsoDay(iso: string): Date {
  return new Date(`${iso}T12:00:00`)
}

function formatRuLong(d: Date): string {
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })
}

function daysUntil(target: Date): number {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date(target)
  end.setHours(0, 0, 0, 0)
  return Math.round((end.getTime() - start.getTime()) / 86400000)
}

/** Упрощённая схема дома + легенда (заглушка под будущую графику). */
function ObjectSchemePlaceholder() {
  return (
    <div className="space-y-3">
      <div className="flex justify-center rounded-lg border border-border bg-muted/40 px-4 py-5">
        <svg viewBox="0 0 120 88" className="h-24 w-auto" aria-hidden>
          <title>Схема объекта</title>
          <path fill="#b45309" d="M60 4 L112 44 L8 44 Z" />
          <rect x="18" y="44" width="84" height="40" rx="2" fill="#d4d4d8" className="dark:fill-zinc-600" />
          <rect x="48" y="58" width="24" height="26" fill="#a1a1aa" className="dark:fill-zinc-500" />
        </svg>
      </div>
      <div className="space-y-2 text-xs text-foreground">
        <div className="flex items-center gap-2">
          <span className="size-2.5 shrink-0 rounded-sm bg-red-500" aria-hidden />
          <span>Окна не установлены</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="size-2.5 shrink-0 rounded-sm bg-amber-500" aria-hidden />
          <span>Кровля 75%</span>
        </div>
      </div>
    </div>
  )
}

const RAIL_TEAM = [
  { initials: "АК", name: "Алексей Краснов", role: "Менеджер проекта", online: true, tone: "bg-sky-600" },
  { initials: "МИ", name: "Михаил Иванов", role: "Прораб", online: true, tone: "bg-emerald-600" },
  { initials: "СК", name: "Сергей Кузнецов", role: "Нач. производства", online: false, tone: "bg-amber-600" },
] as const

const RAIL_ACTIVITY = [
  {
    initials: "МИ",
    tone: "bg-emerald-600",
    text: "Загружено 12 фото с объекта",
    when: "14:22 · сегодня",
  },
  {
    initials: "СК",
    tone: "bg-amber-600",
    text: "Поставка окон перенесена на 2 апреля",
    when: "11:05 · сегодня",
  },
  {
    initials: "АК",
    tone: "bg-sky-600",
    text: "Клиент уведомлён о задержке окон",
    when: "10:30 · сегодня",
  },
  {
    initials: "МИ",
    tone: "bg-emerald-600",
    text: "Кровля, секция 2 — выполнена",
    when: "17:48 · вчера",
  },
] as const

type ObjectRightRailProps = {
  task: PlanTask | null
}

export function ObjectRightRail({ task }: ObjectRightRailProps) {
  const handover = React.useMemo(() => {
    if (!task) return null
    const target = parseIsoDay(task.forecastDate)
    const left = daysUntil(target)
    return {
      label: formatRuLong(target),
      daysLeft: left,
      contractual: formatRuLong(parseIsoDay(task.planDate)),
    }
  }, [task])

  return (
    <aside
      className={cn(
        objectPanelClass,
        "flex h-full min-h-[min(70vh,560px)] w-full shrink-0 flex-col overflow-hidden text-card-foreground",
        "lg:min-h-0 lg:w-[360px] lg:max-w-[360px]"
      )}
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <section className="border-b border-border px-4 py-4">
          {railSectionTitle("Схема объекта")}
          <div className="mt-3">
            <ObjectSchemePlaceholder />
          </div>
        </section>

        <section className="border-b border-border px-4 py-4">
          {railSectionTitle("Срок сдачи")}
          {handover ? (
            <div className="mt-3 space-y-2">
              <div className="rounded-lg border border-amber-200/80 bg-amber-50/90 px-3 py-3 dark:border-amber-900/50 dark:bg-amber-950/40">
                <div className="flex items-start gap-2">
                  <IconClock className="mt-0.5 size-5 shrink-0 text-amber-700 dark:text-amber-500" aria-hidden />
                  <div>
                    <p className="text-base font-semibold text-amber-950 dark:text-amber-100">{handover.label}</p>
                    <p className="text-sm text-amber-800/90 dark:text-amber-400/90">
                      {handover.daysLeft >= 0
                        ? `Осталось ${handover.daysLeft} ${declDays(handover.daysLeft)}`
                        : `Просрочено на ${Math.abs(handover.daysLeft)} ${declDays(handover.daysLeft)}`}
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Договорной срок: {handover.contractual}</p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">Нет данных по срокам.</p>
          )}
        </section>

        <section className="border-b border-border px-4 py-4">
          {railSectionTitle("Команда проекта")}
          <ul className="mt-3 space-y-3">
            {RAIL_TEAM.map((m) => (
              <li key={m.initials} className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="size-9 border border-border">
                    <AvatarFallback className={cn("text-xs font-semibold text-white", m.tone)}>{m.initials}</AvatarFallback>
                  </Avatar>
                  <span
                    className={cn(
                      "absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full border-2 border-card",
                      m.online ? "bg-emerald-500" : "bg-muted-foreground/60"
                    )}
                    aria-hidden
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{m.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{m.role}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="px-4 py-4">
          {railSectionTitle("Последняя активность")}
          <ul className="mt-3">
            {RAIL_ACTIVITY.map((item, i) => (
              <li
                key={i}
                className={cn("flex gap-3", i > 0 && "mt-3 border-t border-border pt-3")}
              >
                <Avatar className="size-8 shrink-0 border border-border">
                  <AvatarFallback className={cn("text-[10px] font-semibold text-white", item.tone)}>
                    {item.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-snug text-foreground">{item.text}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.when}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </aside>
  )
}

function declDays(n: number): string {
  const a = Math.abs(n)
  const mod10 = a % 10
  const mod100 = a % 100
  if (mod10 === 1 && mod100 !== 11) return "день"
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "дня"
  return "дней"
}
