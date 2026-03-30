export type WorkType = "production" | "assembly"
export type HouseKitType = "md" | "pkd"
export type RiskLevel = "normal" | "risk" | "critical"
export type PlanStatus = "done" | "in_progress" | "not_started"
export type DataTrust = "trusted" | "needs_review" | "stale"

export type PlanPriority = "low" | "medium" | "high" | "critical"

export type PlanSource = "manual" | "integration" | "derived"

export interface PlanDataMeta {
  source: PlanSource
  owner: string
  updatedAt: string
  trust: DataTrust
}

/** Метаданные для шапки карточки объекта (концепт: название, площадь, регион). */
export interface PlanObjectCardMeta {
  displayTitle: string
  areaM2: number
  /** Подпись типа дома (по полю `houseKitType`: ПКД/МД). */
  kitLabel: string
  region: string
}

export interface PlanTask {
  id: string
  serialNumber: string
  contractNumber: string
  houseKitType: HouseKitType
  projectId: string
  projectName: string
  /** Заголовок карточки, площадь, комплектация, регион */
  objectCardMeta: PlanObjectCardMeta
  type: WorkType
  stage: string
  status: PlanStatus
  priority: PlanPriority
  blocker: string | null
  owner: string
  planDate: string
  factDate: string | null
  forecastDate: string
  varianceDays: number
  riskLevel: RiskLevel
  nextMilestone: string
  dataMeta: {
    status: PlanDataMeta
    schedule: PlanDataMeta
    blocker: PlanDataMeta
  }
}

export interface PlanDecision {
  id: string
  taskId: string
  projectId: string
  reason: string
  action: string
  owner: string
  deadline: string
  createdAt: string
  author: string
}

export interface PlanEvent {
  id: string
  date: string
  title: string
  projectName: string
  serialNumber: string
  contractNumber: string
  houseKitType: HouseKitType
  projectId: string
  workType: WorkType
  status: PlanStatus
  riskLevel: RiskLevel
}

export interface PlanFilters {
  period: "week" | "month" | "quarter"
  status: "all" | PlanStatus
  priority: "all" | PlanPriority
  owner: "all" | string
  workType: "all" | WorkType
  search: string
  /** По умолчанию: по дням отклонения, худшие сверху */
  sortBy: "varianceDays" | "planDate"
  sortDir: "asc" | "desc"
}

export interface PlanKpi {
  overdueCount: number
  blockedCount: number
  criticalCount: number
  staleCount: number
}

/** Событие внутри этапа пайплайна (один статус — много событий, в т.ч. триггерные). */
export type PipelineTimelineEventKind = "trigger" | "normal"

export interface PipelineTimelineEvent {
  id: string
  label: string
  kind: PipelineTimelineEventKind
}

/** Один перевозчик / одно ТС в рейсе (может быть N штук на один домокомплект). */
export interface PipelineTimelineCarrier {
  id: string
  /** Юрлицо или ИП */
  name: string
  inn?: string
  /** Заявки, контакты, ТС, ограничения, документы по этому рейсу */
  items: PipelineTimelineEvent[]
}

/** Группа «подэтап» внутри текущего этапа (например Комплектация → пункты, Логистика → пункты). */
export interface PipelineTimelineSection {
  id: string
  /** Пустая строка — без заголовка группы, плоский список. */
  title: string
  /** Общие строки подэтапа (вводные или без разбивки по перевозчикам). */
  items: PipelineTimelineEvent[]
  /** Несколько перевозчиков: столько блоков, сколько рейсов/ТС в данных. */
  carriers?: PipelineTimelineCarrier[]
}
