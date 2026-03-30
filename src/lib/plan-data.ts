import type {
  HouseKitType,
  PlanDecision,
  PlanEvent,
  PlanFilters,
  PlanKpi,
  PlanPriority,
  PlanStatus,
  PlanTask,
  RiskLevel,
  WorkType,
} from "@/types/plan"

/** Расшифровка `houseKitType` для карточки объекта: ПКД → панельно-каркасный, МД → модульный. */
export function formatHouseKitFullLabel(type: HouseKitType): string {
  return type === "pkd" ? "Панельно-каркасный дом" : "Модульный дом"
}

type SeedTask = {
  id: string
  serialNumber: string
  contractNumber: string
  houseKitType: HouseKitType
  projectName: string
  /** Шапка карточки объекта (иначе — projectName и вычисления) */
  displayTitle?: string
  areaM2?: number
  kitLabel?: string
  region?: string
  type: WorkType
  stage: string
  status: PlanStatus
  owner: string
  blocker: string | null
  planDate: string
  factDate: string | null
  forecastDate: string
  nextMilestone: string
}

const nowIso = new Date().toISOString()

const seedTasks: SeedTask[] = [
  { id: "task-1", serialNumber: "380", contractNumber: "18Д/25", houseKitType: "pkd", projectName: "Норвегия L", type: "production", stage: "Готов к отгрузке", status: "in_progress", owner: "Юрий Ухин", blocker: null, planDate: "2026-04-03", factDate: null, forecastDate: "2026-04-08", nextMilestone: "Фундамент" },
  { id: "task-2", serialNumber: "367", contractNumber: "111А/25", houseKitType: "md", projectName: "Барн 90", type: "production", stage: "Производство", status: "in_progress", owner: "Юрий Ухин", blocker: "Ожидание партии утеплителя", planDate: "2026-04-05", factDate: null, forecastDate: "2026-04-11", nextMilestone: "Готов к отгрузке" },
  { id: "task-3", serialNumber: "390", contractNumber: "128А/25", houseKitType: "pkd", projectName: "Норвегия L", type: "assembly", stage: "Монтаж", status: "in_progress", owner: "Юрий Ухин", blocker: null, planDate: "2026-04-06", factDate: null, forecastDate: "2026-04-12", nextMilestone: "Отделка" },
  { id: "task-4", serialNumber: "391", contractNumber: "129А/25", houseKitType: "pkd", projectName: "Экохаус 128", type: "assembly", stage: "Готов к отгрузке", status: "not_started", owner: "Юрий Ухин", blocker: "Не закрыт акт приемки фундамента", planDate: "2026-04-09", factDate: null, forecastDate: "2026-04-16", nextMilestone: "Фундамент" },
  { id: "task-5", serialNumber: "372", contractNumber: "116А/25", houseKitType: "pkd", projectName: "Норвегия L", type: "production", stage: "Производство", status: "in_progress", owner: "Алексей Илюшин", blocker: null, planDate: "2026-04-07", factDate: null, forecastDate: "2026-04-10", nextMilestone: "Готов к отгрузке" },
  { id: "task-6", serialNumber: "378", contractNumber: "13Д/25", houseKitType: "pkd", projectName: "Прованс 163", type: "assembly", stage: "Монтаж", status: "in_progress", owner: "Алексей Илюшин", blocker: null, planDate: "2026-04-08", factDate: null, forecastDate: "2026-04-12", nextMilestone: "Отделка" },
  { id: "task-7", serialNumber: "369", contractNumber: "113А/25", houseKitType: "md", projectName: "Simple 71", type: "production", stage: "Производство", status: "in_progress", owner: "Алексей Илюшин", blocker: null, planDate: "2026-04-10", factDate: null, forecastDate: "2026-04-13", nextMilestone: "Готов к отгрузке" },
  { id: "task-8", serialNumber: "385", contractNumber: "31/25", houseKitType: "pkd", projectName: "Норвегия L", type: "production", stage: "Производство", status: "done", owner: "Алексей Илюшин", blocker: null, planDate: "2026-04-02", factDate: "2026-04-03", forecastDate: "2026-04-03", nextMilestone: "Готов к отгрузке" },
  { id: "task-9", serialNumber: "392", contractNumber: "130А/25", houseKitType: "md", projectName: "Simple 85", type: "assembly", stage: "Монтаж", status: "in_progress", owner: "Алексей Илюшин", blocker: null, planDate: "2026-04-11", factDate: null, forecastDate: "2026-04-17", nextMilestone: "Отделка" },
  { id: "task-10", serialNumber: "384", contractNumber: "123А/25", houseKitType: "pkd", projectName: "Шведский М", type: "production", stage: "Производство", status: "not_started", owner: "Алексей Илюшин", blocker: "Очередь на стенде испытаний", planDate: "2026-04-12", factDate: null, forecastDate: "2026-04-18", nextMilestone: "Готов к отгрузке" },
  { id: "task-11", serialNumber: "356", contractNumber: "103А/25", houseKitType: "pkd", projectName: "Индивидуальный", type: "assembly", stage: "Монтаж", status: "in_progress", owner: "Денис Гришуткин", blocker: null, planDate: "2026-04-04", factDate: null, forecastDate: "2026-04-09", nextMilestone: "Отделка" },
  { id: "task-12", serialNumber: "374", contractNumber: "117А/25", houseKitType: "pkd", projectName: "Индивидуальный", type: "production", stage: "Производство", status: "in_progress", owner: "Денис Гришуткин", blocker: null, planDate: "2026-04-07", factDate: null, forecastDate: "2026-04-12", nextMilestone: "Готов к отгрузке" },
  { id: "task-13", serialNumber: "381", contractNumber: "20Д/25", houseKitType: "pkd", projectName: "Индивидуальный", displayTitle: "Дом Смирновых", areaM2: 160, type: "assembly", stage: "Готов к отгрузке", status: "not_started", owner: "Денис Гришуткин", blocker: "Ожидание готовности фундамента", planDate: "2026-04-15", factDate: null, forecastDate: "2026-04-22", nextMilestone: "Фундамент" },
  { id: "task-14", serialNumber: "375", contractNumber: "118А/25", houseKitType: "pkd", projectName: "Барнхаус 131", type: "production", stage: "Производство", status: "done", owner: "Андрей Жуков", blocker: null, planDate: "2026-04-04", factDate: "2026-04-04", forecastDate: "2026-04-04", nextMilestone: "Готов к отгрузке" },
  { id: "task-15", serialNumber: "382", contractNumber: "30/25", houseKitType: "md", projectName: "Simple 85", type: "assembly", stage: "Монтаж", status: "in_progress", owner: "Андрей Жуков", blocker: null, planDate: "2026-04-09", factDate: null, forecastDate: "2026-04-13", nextMilestone: "Отделка" },
  { id: "task-16", serialNumber: "387", contractNumber: "125А/25", houseKitType: "pkd", projectName: "Экохаус 132", type: "production", stage: "Производство", status: "not_started", owner: "Андрей Жуков", blocker: "Нет согласованного образца цвета", planDate: "2026-04-13", factDate: null, forecastDate: "2026-04-20", nextMilestone: "Готов к отгрузке" },
  { id: "task-17", serialNumber: "388", contractNumber: "126А/25", houseKitType: "pkd", projectName: "Шведский 66", type: "production", stage: "Готов к отгрузке", status: "in_progress", owner: "Андрей Жуков", blocker: null, planDate: "2026-04-12", factDate: null, forecastDate: "2026-04-16", nextMilestone: "Фундамент" },
  { id: "task-18", serialNumber: "376", contractNumber: "119А/25", houseKitType: "pkd", projectName: "Экохаус 128", type: "assembly", stage: "Монтаж", status: "in_progress", owner: "Владимир Игонин", blocker: "Погодное окно ограничено", planDate: "2026-04-10", factDate: null, forecastDate: "2026-04-16", nextMilestone: "Отделка" },
  { id: "task-19", serialNumber: "363", contractNumber: "109А/25", houseKitType: "md", projectName: "Барнхаус 131", type: "production", stage: "Производство", status: "in_progress", owner: "Владимир Игонин", blocker: null, planDate: "2026-04-08", factDate: null, forecastDate: "2026-04-12", nextMilestone: "Готов к отгрузке" },
  { id: "task-20", serialNumber: "359", contractNumber: "132А/25", houseKitType: "md", projectName: "Барнхаус L", type: "assembly", stage: "Монтаж", status: "done", owner: "Владимир Игонин", blocker: null, planDate: "2026-04-03", factDate: "2026-04-03", forecastDate: "2026-04-03", nextMilestone: "Отделка" },
  { id: "task-21", serialNumber: "379", contractNumber: "121А/25", houseKitType: "md", projectName: "Барн 90", type: "assembly", stage: "Монтаж", status: "in_progress", owner: "Владимир Игонин", blocker: null, planDate: "2026-04-11", factDate: null, forecastDate: "2026-04-15", nextMilestone: "Отделка" },
  { id: "task-22", serialNumber: "383", contractNumber: "122А/25", houseKitType: "pkd", projectName: "Норвегия L", type: "production", stage: "Производство", status: "not_started", owner: "Владимир Игонин", blocker: "Не завершена предыдущая технологическая операция", planDate: "2026-04-16", factDate: null, forecastDate: "2026-04-19", nextMilestone: "Готов к отгрузке" },
]

function toPriority(varianceDays: number, hasBlocker: boolean): PlanPriority {
  if (hasBlocker || varianceDays >= 5) return "critical"
  if (varianceDays >= 3) return "high"
  if (varianceDays >= 1) return "medium"
  return "low"
}

function toRisk(status: PlanStatus, varianceDays: number, hasBlocker: boolean): RiskLevel {
  if (hasBlocker || varianceDays >= 5) return "critical"
  if (status === "in_progress" && varianceDays >= 2) return "risk"
  return "normal"
}

function daysDiff(fromIso: string, toIso: string): number {
  const from = new Date(fromIso).getTime()
  const to = new Date(toIso).getTime()
  return Math.max(0, Math.round((to - from) / (1000 * 60 * 60 * 24)))
}

export const PLAN_TASKS: PlanTask[] = seedTasks.map((row) => {
  const varianceDays = daysDiff(row.planDate, row.forecastDate)
  const hasBlocker = Boolean(row.blocker)

  const areaM2 =
    row.areaM2 ?? 120 + (parseInt(row.serialNumber, 10) % 140)
  const kitLabel =
    row.kitLabel ?? formatHouseKitFullLabel(row.houseKitType)

  return {
    id: row.id,
    serialNumber: row.serialNumber,
    contractNumber: row.contractNumber,
    houseKitType: row.houseKitType,
    projectId: row.serialNumber,
    projectName: row.projectName,
    objectCardMeta: {
      displayTitle: row.displayTitle ?? row.projectName,
      areaM2,
      kitLabel,
      region: row.region ?? "Московская обл.",
    },
    type: row.type,
    stage: row.stage,
    status: row.status,
    priority: toPriority(varianceDays, hasBlocker),
    blocker: row.blocker,
    owner: row.owner,
    planDate: row.planDate,
    factDate: row.factDate,
    forecastDate: row.forecastDate,
    varianceDays,
    riskLevel: toRisk(row.status, varianceDays, hasBlocker),
    nextMilestone: row.nextMilestone,
    dataMeta: {
      status: { source: "manual", owner: "Прораб", updatedAt: nowIso, trust: row.status === "done" ? "trusted" : "needs_review" },
      schedule: { source: "derived", owner: "Планировщик", updatedAt: nowIso, trust: varianceDays >= 5 ? "stale" : "trusted" },
      blocker: { source: row.blocker ? "manual" : "derived", owner: "Руководитель проекта", updatedAt: nowIso, trust: row.blocker ? "needs_review" : "trusted" },
    },
  }
})

/** Как в колонке «Дом» плана: «20Д/25 - 381 дом» */
export function formatObjectHeaderTitle(serialNumber: string): string {
  const task = PLAN_TASKS.find((t) => t.serialNumber === serialNumber)
  if (!task) return `Домокомплект ${serialNumber}`
  return `${task.contractNumber} - ${task.serialNumber} дом`
}

export const INITIAL_PLAN_FILTERS: PlanFilters = {
  period: "month",
  status: "all",
  priority: "all",
  owner: "all",
  workType: "all",
  search: "",
  sortBy: "varianceDays",
  sortDir: "desc",
}

export function computePlanKpi(items: PlanTask[]): PlanKpi {
  return {
    overdueCount: items.filter((item) => item.varianceDays > 0).length,
    blockedCount: items.filter((item) => Boolean(item.blocker)).length,
    criticalCount: items.filter((item) => item.riskLevel === "critical").length,
    staleCount: items.filter((item) => item.dataMeta.schedule.trust === "stale").length,
  }
}

export function toCalendarEvents(items: PlanTask[]): PlanEvent[] {
  return items.map((item) => ({
    id: `event-${item.id}`,
    date: item.forecastDate,
    title: item.stage,
    projectName: item.projectName,
    serialNumber: item.serialNumber,
    contractNumber: item.contractNumber,
    houseKitType: item.houseKitType,
    projectId: item.projectId,
    workType: item.type,
    status: item.status,
    riskLevel: item.riskLevel,
  }))
}

export const INITIAL_DECISIONS: PlanDecision[] = [
  {
    id: "decision-1",
    taskId: "task-2",
    projectId: "367",
    reason: "Ожидание партии утеплителя",
    action: "Перераспределить остатки с 363 и ускорить закупку",
    owner: "Руководитель снабжения",
    deadline: "2026-04-10",
    createdAt: nowIso,
    author: "Начальник производства",
  },
  {
    id: "decision-2",
    taskId: "task-4",
    projectId: "391",
    reason: "Не закрыт акт приемки фундамента",
    action: "Эскалировать технадзору и сдвинуть бригаду на 359",
    owner: "Руководитель проекта",
    deadline: "2026-04-11",
    createdAt: nowIso,
    author: "Прораб",
  },
]
