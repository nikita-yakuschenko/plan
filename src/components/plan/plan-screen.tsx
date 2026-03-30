"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAutoPageSize } from "@/hooks/useAutoPageSize"
import { writeReturnContext } from "@/lib/return-context-storage"
import { cn } from "@/lib/utils"
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconCircleCheckFilled,
  IconCircleMinus,
  IconProgress,
} from "@tabler/icons-react"
import {
  computePlanKpi,
  formatHouseKitFullLabel,
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

/** Цветовая маркировка этапа (производство / монтаж / готов к отгрузке / фундамент и т.д.) */
function stageBadgeClass(stage: string): string {
  if (stage === "Производство")
    return "border border-blue-200/70 bg-blue-50/70 text-blue-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]"
  if (stage === "Монтаж")
    return "border border-emerald-200/70 bg-emerald-50/70 text-emerald-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]"
  if (stage === "Готов к отгрузке")
    return "border border-amber-200/70 bg-amber-50/70 text-amber-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]"
  if (stage === "Фундамент")
    return "border border-orange-200/70 bg-orange-50/70 text-orange-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]"
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

/** Номер страницы в URL — с 1; в TanStack pageIndex с 0 */
function readPageIndexFromSearchParams(sp: { get: (key: string) => string | null }): number {
  const raw = sp.get("page")
  if (!raw) return 0
  const n = Number.parseInt(raw, 10)
  if (!Number.isFinite(n) || n < 1) return 0
  return n - 1
}

function readViewFromSearchParams(sp: { get: (key: string) => string | null }): ViewMode {
  return sp.get("view") === "calendar" ? "calendar" : "table"
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
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const tableContainerRef = React.useRef<HTMLDivElement>(null)
  const firstRowRef = React.useRef<HTMLTableRowElement>(null)
  const [pagination, setPagination] = React.useState(() => ({
    pageIndex: readPageIndexFromSearchParams(searchParams),
    pageSize: 10,
  }))
  const [filters, setFilters] = React.useState<PlanFilters>(INITIAL_PLAN_FILTERS)
  const [view, setView] = React.useState<ViewMode>(() =>
    readViewFromSearchParams(searchParams)
  )
  const tasks = PLAN_TASKS

  const openObject = React.useCallback(
    (serialNumber: string) => {
      writeReturnContext(pathname, searchParams.toString(), serialNumber)
      router.push(`/object/${serialNumber}`)
    },
    [router, searchParams, pathname]
  )

  const owners = React.useMemo(
    () => Array.from(new Set(tasks.map((item) => item.owner))).sort(),
    [tasks]
  )

  const filtered = React.useMemo(
    () => sortTasks(filterTasks(tasks, filters), filters),
    [tasks, filters]
  )

  const planColumns = React.useMemo<ColumnDef<PlanTask>[]>(
    () => [
      {
        id: "home",
        header: "Дом",
        cell: ({ row }) => {
          const item = row.original
          return (
            <>
              <div className="truncate whitespace-nowrap">{`${item.contractNumber} - ${item.serialNumber} дом`}</div>
              <div className="mt-1 flex min-w-0 flex-nowrap items-center gap-1 overflow-hidden">
                <Badge
                  title={formatHouseKitFullLabel(item.houseKitType)}
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
            </>
          )
        },
      },
      {
        id: "stage",
        header: "Этап",
        cell: ({ row }) => (
          <Badge
            className={cn(
              "h-6 min-w-0 max-w-full shrink justify-start truncate px-2 text-xs font-medium",
              stageBadgeClass(row.original.stage)
            )}
          >
            {row.original.stage}
          </Badge>
        ),
      },
      {
        id: "status",
        header: "Статус",
        cell: ({ row }) => <PlanStatusPill status={row.original.status} />,
      },
      {
        id: "planDate",
        header: "План",
        cell: ({ row }) => isoToRuDate(row.original.planDate),
      },
      {
        id: "factDate",
        header: "Факт",
        cell: ({ row }) =>
          row.original.factDate ? isoToRuDate(row.original.factDate) : "-",
      },
      {
        id: "forecastDate",
        header: "Прогноз",
        cell: ({ row }) => isoToRuDate(row.original.forecastDate),
      },
      {
        id: "variance",
        header: "Отклонение",
        cell: ({ row }) => (
          <Badge
            className={cn(
              "min-w-0 max-w-full shrink truncate border-0",
              deviationBadgeClass(row.original.varianceDays)
            )}
          >
            {deviationLabel(row.original.varianceDays)}
          </Badge>
        ),
      },
      {
        id: "owner",
        header: "Ответственный",
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className="inline-flex h-8 max-w-full min-w-0 shrink items-center gap-2 rounded-full pl-0.5 pr-2 font-medium"
          >
            <Avatar size="default" className="size-7 shrink-0">
              <AvatarFallback>{getInitials(row.original.owner)}</AvatarFallback>
            </Avatar>
            <span className="min-w-0 truncate leading-none">{row.original.owner}</span>
          </Badge>
        ),
      },
      {
        id: "blocker",
        header: "Блокер",
        cell: ({ row }) => (
          <span className="block truncate" title={row.original.blocker ?? undefined}>
            {truncateBlocker(row.original.blocker)}
          </span>
        ),
      },
    ],
    []
  )

  const table = useReactTable({
    data: filtered,
    columns: planColumns,
    state: { pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (row) => row.id,
  })

  const autoPageSize = useAutoPageSize(tableContainerRef, firstRowRef, {
    measureFromContainerHeight: true,
    remeasureKey: `${table.getRowModel().rows.length}-${pagination.pageIndex}-${filtered.length}`,
  })

  React.useEffect(() => {
    setPagination((prev) => ({ ...prev, pageSize: autoPageSize }))
  }, [autoPageSize])

  const isFirstFiltersLayout = React.useRef(true)
  const prevFiltersSerializedRef = React.useRef(JSON.stringify(INITIAL_PLAN_FILTERS))
  const ignoreUrlPageWhileStaleAfterFilterRef = React.useRef(false)

  // Сначала подтягиваем page из адреса (layout), иначе эффект state→URL успевает сбросить ?page при «Назад в План»
  React.useLayoutEffect(() => {
    const serialized = JSON.stringify(filters)

    if (isFirstFiltersLayout.current) {
      isFirstFiltersLayout.current = false
      prevFiltersSerializedRef.current = serialized
      const p = readPageIndexFromSearchParams(searchParams)
      setPagination((prev) => {
        if (prev.pageIndex === p) return prev
        if (prev.pageIndex > p) return prev
        return { ...prev, pageIndex: p }
      })
      return
    }

    if (serialized !== prevFiltersSerializedRef.current) {
      prevFiltersSerializedRef.current = serialized
      ignoreUrlPageWhileStaleAfterFilterRef.current = true
      setPagination((prev) => ({ ...prev, pageIndex: 0 }))
      const params = new URLSearchParams(searchParams.toString())
      params.delete("page")
      const qs = params.toString()
      if (qs !== searchParams.toString()) {
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
      }
      return
    }

    if (ignoreUrlPageWhileStaleAfterFilterRef.current) {
      if (searchParams.get("page")) return
      ignoreUrlPageWhileStaleAfterFilterRef.current = false
    }

    const p = readPageIndexFromSearchParams(searchParams)
    setPagination((prev) => {
      if (prev.pageIndex === p) return prev
      if (prev.pageIndex > p) return prev
      return { ...prev, pageIndex: p }
    })
  }, [searchParams, filters, pathname, router])

  // Режим «Таблица / Календарь» из адреса (перезагрузка, назад/вперёд)
  React.useEffect(() => {
    const v = readViewFromSearchParams(searchParams)
    setView((prev) => (prev === v ? prev : v))
  }, [searchParams])

  // Номер страницы и view → query (перезагрузка сохраняет page и view)
  React.useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    const oneBased = pagination.pageIndex + 1
    if (oneBased <= 1) params.delete("page")
    else params.set("page", String(oneBased))

    if (view === "calendar") params.set("view", "calendar")
    else params.delete("view")

    const qs = params.toString()
    if (qs === searchParams.toString()) return
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }, [pagination.pageIndex, view, pathname, router, searchParams])

  const pageCount = table.getPageCount()
  React.useEffect(() => {
    if (pageCount === 0) return
    setPagination((prev) => {
      if (prev.pageIndex < pageCount) return prev
      return { ...prev, pageIndex: Math.max(0, pageCount - 1) }
    })
  }, [pageCount])

  const kpi = React.useMemo(() => computePlanKpi(filtered), [filtered])
  const events = React.useMemo(() => toCalendarEvents(filtered), [filtered])
  const eventsByDate = React.useMemo(() => groupEventsByDate(events), [events])

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 p-4 lg:p-6">
      <Card>
        <CardHeader className="gap-4">
          <div className="flex flex-wrap items-center justify-end gap-3">
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

      <div className="flex min-h-0 flex-1 flex-col gap-4">
        <Card className="flex min-h-[520px] flex-1 flex-col overflow-hidden py-0">
          <CardContent className="flex min-h-0 flex-1 flex-col p-0">
            <Tabs
              value={view}
              onValueChange={(value) => setView(value as ViewMode)}
              className="flex min-h-0 flex-1 flex-col"
            >
              <TabsContent
                value="table"
                className="m-0 flex min-h-0 flex-1 flex-col gap-0 overflow-hidden p-0"
              >
                <div
                  ref={tableContainerRef}
                  className="min-h-0 min-w-0 flex-1 overflow-auto"
                >
                  <Table className="table-fixed min-w-6xl">
                    <PlanTableColgroup />
                    <TableHeader className="sticky top-0 z-10 bg-muted [&_tr]:border-border">
                      {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow
                          key={headerGroup.id}
                          className="h-14 border-border bg-muted hover:bg-muted data-[state=selected]:bg-muted"
                        >
                          {headerGroup.headers.map((header) => (
                            <TableHead
                              key={header.id}
                              className="h-14 py-0 align-middle text-muted-foreground"
                            >
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                            </TableHead>
                          ))}
                        </TableRow>
                      ))}
                    </TableHeader>
                    <TableBody>
                      {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row, index) => (
                          <TableRow
                            key={row.id}
                            ref={index === 0 ? firstRowRef : undefined}
                            onClick={() => {
                              openObject(row.original.serialNumber)
                            }}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault()
                                openObject(row.original.serialNumber)
                              }
                            }}
                            tabIndex={0}
                            role="link"
                            className="cursor-pointer"
                          >
                            {row.getVisibleCells().map((cell) => (
                              <TableCell
                                key={cell.id}
                                className={cn(
                                  "min-w-0",
                                  cell.column.id === "home" && "font-medium"
                                )}
                              >
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext()
                                )}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={planColumns.length}
                            className="h-24 text-center"
                          >
                            Нет данных.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex h-14 min-h-14 shrink-0 flex-row flex-wrap items-center justify-between gap-x-4 gap-y-2 bg-muted px-3">
                  <p className="text-sm font-medium tabular-nums">
                    Страница {table.getState().pagination.pageIndex + 1} из{" "}
                    {table.getPageCount()}
                  </p>
                  <Pagination className="mx-0 w-auto sm:ml-auto">
                    <PaginationContent className="flex-wrap justify-end gap-1">
                      <PaginationItem>
                        <Button
                          variant="outline"
                          className="hidden size-8 p-0 lg:inline-flex"
                          size="icon"
                          onClick={() => table.setPageIndex(0)}
                          disabled={!table.getCanPreviousPage()}
                        >
                          <span className="sr-only">Первая страница</span>
                          <IconChevronsLeft />
                        </Button>
                      </PaginationItem>
                      <PaginationItem>
                        <Button
                          variant="outline"
                          className="size-8"
                          size="icon"
                          onClick={() => table.previousPage()}
                          disabled={!table.getCanPreviousPage()}
                        >
                          <span className="sr-only">Предыдущая страница</span>
                          <IconChevronLeft />
                        </Button>
                      </PaginationItem>
                      <PaginationItem>
                        <Button
                          variant="outline"
                          className="size-8"
                          size="icon"
                          onClick={() => table.nextPage()}
                          disabled={!table.getCanNextPage()}
                        >
                          <span className="sr-only">Следующая страница</span>
                          <IconChevronRight />
                        </Button>
                      </PaginationItem>
                      <PaginationItem>
                        <Button
                          variant="outline"
                          className="hidden size-8 lg:inline-flex"
                          size="icon"
                          onClick={() =>
                            table.setPageIndex(Math.max(0, table.getPageCount() - 1))
                          }
                          disabled={!table.getCanNextPage()}
                        >
                          <span className="sr-only">Последняя страница</span>
                          <IconChevronsRight />
                        </Button>
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </TabsContent>

              <TabsContent
                value="calendar"
                className="m-0 flex min-h-0 flex-1 flex-col overflow-auto p-3"
              >
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
                              onClick={() => openObject(event.serialNumber)}
                              className="w-full cursor-pointer rounded-md border p-2 text-left hover:bg-muted/50"
                            >
                              <p className="text-sm font-medium">{event.title}</p>
                              <div className="mt-1 flex flex-wrap gap-1">
                                <Badge variant="outline">{event.serialNumber}</Badge>
                                <Badge
                                  title={formatHouseKitFullLabel(event.houseKitType)}
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
