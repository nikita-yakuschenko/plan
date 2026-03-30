"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import {
  IconCircleCheckFilled,
  IconCircleMinus,
  IconProgress,
} from "@tabler/icons-react"
import {
  computePlanKpi,
  INITIAL_PLAN_FILTERS,
  PLAN_TASKS,
  toCalendarEvents,
} from "@/lib/plan-data"
import type {
  HouseKitType,
  PlanFilters,
  PlanStatus,
  PlanTask,
  WorkType,
} from "@/types/plan"

type ViewMode = "table" | "calendar"

const STATUS_LABEL: Record<PlanStatus, string> = {
  done: "Готово",
  in_progress: "В работе",
  not_started: "Не начато",
}

const TYPE_LABEL: Record<WorkType, string> = {
  production: "Производство",
  assembly: "Монтаж",
}

const HOUSE_KIT_LABEL: Record<HouseKitType, string> = {
  md: "МД",
  pkd: "ПКД",
}

const PERIOD_LABEL: Record<PlanFilters["period"], string> = {
  week: "7 дней",
  month: "31 день",
  quarter: "Квартал",
}

const STATUS_FILTER_LABEL: Record<PlanFilters["status"], string> = {
  all: "Все статусы",
  done: "Готово",
  in_progress: "В работе",
  not_started: "Не начато",
}

const WORK_TYPE_FILTER_LABEL: Record<PlanFilters["workType"], string> = {
  all: "Производство + Монтаж",
  production: "Производство",
  assembly: "Монтаж",
}

const todayIso = new Date().toISOString().slice(0, 10)

function houseKitBadgeClass(type: HouseKitType): string {
  if (type === "md")
    return "shrink-0 border border-blue-200/70 bg-blue-50/70 text-blue-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]"
  return "shrink-0 border border-orange-200/70 bg-orange-50/70 text-orange-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]"
}

function projectBadgeClass(projectName: string): string {
  if (projectName.startsWith("Норвегия"))
    return "border border-emerald-200/70 bg-emerald-50/70 text-emerald-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]"
  if (projectName.startsWith("Барнхаус"))
    return "border border-fuchsia-200/70 bg-fuchsia-50/70 text-fuchsia-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]"
  if (projectName.startsWith("Барн "))
    return "border border-indigo-200/70 bg-indigo-50/70 text-indigo-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]"
  if (projectName.startsWith("Экохаус"))
    return "border border-teal-200/70 bg-teal-50/70 text-teal-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]"
  if (projectName.startsWith("Шведский"))
    return "border border-cyan-200/70 bg-cyan-50/70 text-cyan-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]"
  if (projectName.startsWith("Simple"))
    return "border border-violet-200/70 bg-violet-50/70 text-violet-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]"
  if (projectName === "Индивидуальный")
    return "border border-amber-200/70 bg-amber-50/70 text-amber-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]"
  return "border border-zinc-200/70 bg-zinc-50/70 text-zinc-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]"
}

/** Цветовая маркировка этапа (производство / монтаж / отгрузка и т.д.) */
function stageBadgeClass(stage: string): string {
  if (stage === "Производство")
    return "border border-blue-200/70 bg-blue-50/70 text-blue-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]"
  if (stage === "Монтаж")
    return "border border-emerald-200/70 bg-emerald-50/70 text-emerald-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]"
  if (stage === "Готов к отгрузке")
    return "border border-amber-200/70 bg-amber-50/70 text-amber-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]"
  return "border border-zinc-200/70 bg-zinc-50/70 text-zinc-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]"
}

/** Статус: обводка + иконка Tabler + подпись (как в референсе) */
function PlanStatusPill({ status, className }: { status: PlanStatus; className?: string }) {
  const label = STATUS_LABEL[status]
  const icon =
    status === "done" ? (
      <IconCircleCheckFilled className="size-3.5 shrink-0 text-emerald-600" aria-hidden />
    ) : status === "in_progress" ? (
      <IconProgress className="size-3.5 shrink-0 text-amber-600" aria-hidden />
    ) : (
      <IconCircleMinus className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
    )
  return (
    <span
      className={cn(
        "inline-flex max-w-full min-w-0 items-center gap-1.5 rounded-full border border-border bg-background px-2 py-0.5 text-xs font-medium text-foreground shadow-sm",
        className
      )}
    >
      {icon}
      <span className="min-w-0 truncate">{label}</span>
    </span>
  )
}

function riskBadgeClass(risk: PlanTask["riskLevel"]): string {
  if (risk === "critical") return "bg-red-100 text-red-800"
  if (risk === "risk") return "bg-orange-100 text-orange-800"
  return "bg-zinc-100 text-zinc-800"
}

function isoToRuDate(value: string): string {
  const date = new Date(value)
  return date.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" })
}

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

function truncateBlocker(value: string | null): string {
  if (!value) return "-"
  if (value.length <= 40) return value
  return `${value.slice(0, 40)}...`
}

function formatDays(value: number): string {
  const abs = Math.abs(value)
  const mod10 = abs % 10
  const mod100 = abs % 100
  if (mod10 === 1 && mod100 !== 11) return `${value} день`
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${value} дня`
  return `${value} дней`
}

function deviationBadgeClass(days: number): string {
  if (days === 0) return "border border-emerald-300/80 bg-emerald-100 text-emerald-800"
  if (days <= 2) return "border border-yellow-300/80 bg-yellow-100 text-yellow-800"
  if (days <= 4) return "border border-orange-300/80 bg-orange-100 text-orange-800"
  return "border border-red-300/80 bg-red-100 text-red-800"
}

function deviationLabel(days: number): string {
  if (days === 0) return "без отклонений"
  return `+${formatDays(days)}`
}

function filterTasks(items: PlanTask[], filters: PlanFilters): PlanTask[] {
  return items.filter((item) => {
    if (filters.status !== "all" && item.status !== filters.status) return false
    if (filters.workType !== "all" && item.type !== filters.workType) return false
    if (filters.owner !== "all" && item.owner !== filters.owner) return false
    if (
      filters.search &&
      !`${item.serialNumber} ${item.contractNumber} ${item.projectName}`
        .toLowerCase()
        .includes(filters.search.toLowerCase())
    ) {
      return false
    }

    const planDate = new Date(item.planDate)
    const days = filters.period === "week" ? 7 : filters.period === "month" ? 31 : 92
    const horizon = new Date(todayIso)
    horizon.setDate(horizon.getDate() + days)

    return planDate <= horizon
  })
}

function sortTasks(items: PlanTask[], filters: PlanFilters): PlanTask[] {
  const { sortBy, sortDir } = filters
  const dir = sortDir === "asc" ? 1 : -1
  return [...items].sort((a, b) => {
    let cmp = 0
    if (sortBy === "varianceDays") {
      cmp = (a.varianceDays - b.varianceDays) * dir
    } else {
      const at = new Date(a.planDate).getTime()
      const bt = new Date(b.planDate).getTime()
      cmp = (at - bt) * dir
    }
    if (cmp !== 0) return cmp
    return a.serialNumber.localeCompare(b.serialNumber, "ru", { numeric: true })
  })
}

function groupEventsByDate(items: ReturnType<typeof toCalendarEvents>) {
  return items.reduce<Record<string, ReturnType<typeof toCalendarEvents>>>((acc, event) => {
    if (!acc[event.date]) acc[event.date] = []
    acc[event.date].push(event)
    return acc
  }, {})
}

/** Фиксированные доли ширины колонок (table-fixed + colgroup), чтобы при смене фильтров не «прыгала» вёрстка */
function PlanTableColgroup() {
  return (
    <colgroup>
      <col className="w-[16%]" />
      <col className="w-[10%]" />
      <col className="w-[9%]" />
      <col className="w-[8%]" />
      <col className="w-[8%]" />
      <col className="w-[8%]" />
      <col className="w-[11%]" />
      <col className="w-[15%]" />
      <col className="w-[15%]" />
    </colgroup>
  )
}

export function PlanScreen() {
  const router = useRouter()
  const [filters, setFilters] = React.useState<PlanFilters>(INITIAL_PLAN_FILTERS)
  const [view, setView] = React.useState<ViewMode>("table")
  const tasks = PLAN_TASKS
  const [selectedTaskId, setSelectedTaskId] = React.useState<string | null>(() => {
    const initial = sortTasks(PLAN_TASKS, INITIAL_PLAN_FILTERS)
    return initial[0]?.id ?? null
  })

  const owners = React.useMemo(
    () => Array.from(new Set(tasks.map((item) => item.owner))).sort(),
    [tasks]
  )

  const filtered = React.useMemo(
    () => sortTasks(filterTasks(tasks, filters), filters),
    [tasks, filters]
  )
  const kpi = React.useMemo(() => computePlanKpi(filtered), [filtered])
  const events = React.useMemo(() => toCalendarEvents(filtered), [filtered])
  const eventsByDate = React.useMemo(() => groupEventsByDate(events), [events])

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
      <Card>
        <CardHeader className="gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>План</CardTitle>
              <CardDescription>
                Производство и монтаж домокомплектов: контроль, планирование, решения.
              </CardDescription>
            </div>
            <Tabs value={view} onValueChange={(value) => setView(value as ViewMode)}>
              <TabsList>
                <TabsTrigger value="table">Таблица</TabsTrigger>
                <TabsTrigger value="calendar">Календарь</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Card className="p-3">
              <p className="text-xs text-muted-foreground">Просрочки</p>
              <p className="text-2xl font-semibold">{kpi.overdueCount}</p>
            </Card>
            <Card className="p-3">
              <p className="text-xs text-muted-foreground">Блокеры</p>
              <p className="text-2xl font-semibold">{kpi.blockedCount}</p>
            </Card>
            <Card className="p-3">
              <p className="text-xs text-muted-foreground">Критичные</p>
              <p className="text-2xl font-semibold">{kpi.criticalCount}</p>
            </Card>
            <Card className="p-3">
              <p className="text-xs text-muted-foreground">Без обновления</p>
              <p className="text-2xl font-semibold">{kpi.staleCount}</p>
            </Card>
          </div>

          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-5">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Период</p>
              <Select
                value={filters.period}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, period: value as PlanFilters["period"] }))
                }
              >
                <SelectTrigger className="w-full">
                  <span>{PERIOD_LABEL[filters.period]}</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">{PERIOD_LABEL.week}</SelectItem>
                  <SelectItem value="month">{PERIOD_LABEL.month}</SelectItem>
                  <SelectItem value="quarter">{PERIOD_LABEL.quarter}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Статус</p>
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, status: value as PlanFilters["status"] }))
                }
              >
                <SelectTrigger className="w-full">
                  <span>{STATUS_FILTER_LABEL[filters.status]}</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{STATUS_FILTER_LABEL.all}</SelectItem>
                  <SelectItem value="done">{STATUS_FILTER_LABEL.done}</SelectItem>
                  <SelectItem value="in_progress">{STATUS_FILTER_LABEL.in_progress}</SelectItem>
                  <SelectItem value="not_started">{STATUS_FILTER_LABEL.not_started}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Ответственный</p>
              <Select
                value={filters.owner}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, owner: value as PlanFilters["owner"] }))
                }
              >
                <SelectTrigger className="w-full">
                  <span>{filters.owner === "all" ? "Все ответственные" : filters.owner}</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все ответственные</SelectItem>
                  {owners.map((owner) => (
                    <SelectItem key={owner} value={owner}>
                      {owner}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Тип работ</p>
              <Select
                value={filters.workType}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, workType: value as PlanFilters["workType"] }))
                }
              >
                <SelectTrigger className="w-full">
                  <span>{WORK_TYPE_FILTER_LABEL[filters.workType]}</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{WORK_TYPE_FILTER_LABEL.all}</SelectItem>
                  <SelectItem value="production">{WORK_TYPE_FILTER_LABEL.production}</SelectItem>
                  <SelectItem value="assembly">{WORK_TYPE_FILTER_LABEL.assembly}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Поиск</p>
              <Input
                placeholder="Поиск по объекту"
                value={filters.search}
                onChange={(event) =>
                  setFilters((prev) => ({ ...prev, search: event.target.value }))
                }
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid flex-1 gap-4">
        <Card className="min-h-[520px] py-0">
          <CardContent className="p-0">
            <Tabs value={view} onValueChange={(value) => setView(value as ViewMode)}>
              <TabsContent value="table" className="m-0 p-0">
                <Table className="table-fixed min-w-6xl">
                  <PlanTableColgroup />
                  <TableHeader className="bg-transparent">
                    <TableRow className="h-auto bg-transparent hover:bg-transparent">
                      <TableHead className="text-muted-foreground">Дом</TableHead>
                      <TableHead className="text-muted-foreground">Этап</TableHead>
                      <TableHead className="text-muted-foreground">Статус</TableHead>
                      <TableHead className="text-muted-foreground">План</TableHead>
                      <TableHead className="text-muted-foreground">Факт</TableHead>
                      <TableHead className="text-muted-foreground">Прогноз</TableHead>
                      <TableHead className="text-muted-foreground">Отклонение</TableHead>
                      <TableHead className="text-muted-foreground">Ответственный</TableHead>
                      <TableHead className="text-muted-foreground">Блокер</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((item) => (
                      <TableRow
                        key={item.id}
                        data-state={item.id === selectedTaskId ? "selected" : undefined}
                        onClick={() => {
                          setSelectedTaskId(item.id)
                          router.push(`/object/${item.serialNumber}`)
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault()
                            setSelectedTaskId(item.id)
                            router.push(`/object/${item.serialNumber}`)
                          }
                        }}
                        tabIndex={0}
                        role="link"
                        className="cursor-pointer"
                      >
                        <TableCell className="min-w-0 font-medium">
                          <div className="truncate whitespace-nowrap">{`${item.contractNumber} - ${item.serialNumber} дом`}</div>
                          <div className="mt-1 flex min-w-0 flex-nowrap items-center gap-1 overflow-hidden">
                            <Badge
                              className={cn(
                                "h-6 px-2 font-mono tracking-tight",
                                houseKitBadgeClass(item.houseKitType)
                              )}
                            >
                              {HOUSE_KIT_LABEL[item.houseKitType]}
                            </Badge>
                            <Badge
                              className={cn(
                                "h-6 min-w-0 max-w-42 truncate px-2 font-mono tracking-tight",
                                projectBadgeClass(item.projectName)
                              )}
                            >
                              {item.projectName}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="min-w-0">
                          <Badge
                            className={cn(
                              "h-6 min-w-0 max-w-full shrink justify-start truncate px-2 text-xs font-medium",
                              stageBadgeClass(item.stage)
                            )}
                          >
                            {item.stage}
                          </Badge>
                        </TableCell>
                        <TableCell className="min-w-0">
                          <PlanStatusPill status={item.status} />
                        </TableCell>
                        <TableCell className="min-w-0">{isoToRuDate(item.planDate)}</TableCell>
                        <TableCell className="min-w-0">{item.factDate ? isoToRuDate(item.factDate) : "-"}</TableCell>
                        <TableCell className="min-w-0">{isoToRuDate(item.forecastDate)}</TableCell>
                        <TableCell className="min-w-0">
                          <Badge
                            className={cn(
                              "min-w-0 max-w-full shrink truncate border-0",
                              deviationBadgeClass(item.varianceDays)
                            )}
                          >
                            {deviationLabel(item.varianceDays)}
                          </Badge>
                        </TableCell>
                        <TableCell className="min-w-0">
                          <Badge
                            variant="outline"
                            className="inline-flex h-8 max-w-full min-w-0 shrink items-center gap-2 rounded-full pl-0.5 pr-2 font-medium"
                          >
                            <Avatar size="default" className="size-7 shrink-0">
                              <AvatarFallback>{getInitials(item.owner)}</AvatarFallback>
                            </Avatar>
                            <span className="min-w-0 truncate leading-none">{item.owner}</span>
                          </Badge>
                        </TableCell>
                        <TableCell className="min-w-0" title={item.blocker ?? undefined}>
                          <span className="block truncate">{truncateBlocker(item.blocker)}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="calendar" className="m-0 p-3">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {Object.entries(eventsByDate)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([date, dayEvents]) => (
                      <Card key={date} className="p-3">
                        <p className="mb-2 text-sm font-medium">{isoToRuDate(date)}</p>
                        <div className="space-y-2">
                          {dayEvents.map((event) => (
                            <button
                              key={event.id}
                              type="button"
                              onClick={() => setSelectedTaskId(event.id.replace("event-", ""))}
                              className="w-full cursor-pointer rounded-md border p-2 text-left hover:bg-muted/50"
                            >
                              <p className="text-sm font-medium">{event.title}</p>
                              <div className="mt-1 flex flex-wrap gap-1">
                                <Badge variant="outline">{event.serialNumber}</Badge>
                                <Badge
                                  className={cn(
                                    "font-mono tracking-tight",
                                    houseKitBadgeClass(event.houseKitType)
                                  )}
                                >
                                  {HOUSE_KIT_LABEL[event.houseKitType]}
                                </Badge>
                                <Badge
                                  className={cn(
                                    "font-mono tracking-tight",
                                    projectBadgeClass(event.projectName)
                                  )}
                                >
                                  {event.projectName}
                                </Badge>
                                <Badge variant="outline">{event.contractNumber}</Badge>
                                <Badge variant="outline">{TYPE_LABEL[event.workType]}</Badge>
                                <PlanStatusPill status={event.status} />
                              </div>
                            </button>
                          ))}
                        </div>
                      </Card>
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
