"use client"

import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  ObjectKeyMetricsPlaceholder,
} from "@/components/object/object-key-metrics"
import { ObjectPipelineHeader } from "@/components/object/object-pipeline-header"
import { ObjectRightRail } from "@/components/object/object-right-rail"
import {
  ObjectVerticalPipeline,
  type PipelineChecklistState,
} from "@/components/object/object-vertical-pipeline"
import { objectInsetClass, objectPanelClass } from "@/components/object/object-ui"
import { pipelineStageIndex } from "@/lib/object-pipeline"
import { collectTimelineEventIds } from "@/lib/object-pipeline-timeline"
import { INITIAL_DECISIONS, PLAN_TASKS } from "@/lib/plan-data"
import { cn } from "@/lib/utils"
import type { PlanDecision, PlanTask } from "@/types/plan"

type ObjectCardProps = {
  serialNumber: string
}

type DecisionDraft = {
  reason: string
  action: string
  owner: string
  deadline: string
}

function dateToIsoLocal(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function isoToRuDate(value: string): string {
  const date = new Date(`${value}T00:00:00`)
  return date.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" })
}

function isoToRuDateLong(value: string): string {
  const date = new Date(`${value}T00:00:00`)
  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

function riskBadgeClass(risk: PlanTask["riskLevel"]): string {
  if (risk === "critical") return "bg-red-100 text-red-800"
  if (risk === "risk") return "bg-orange-100 text-orange-800"
  return "bg-zinc-100 text-zinc-800"
}

export function ObjectCard({ serialNumber }: ObjectCardProps) {
  const task = React.useMemo(
    () => PLAN_TASKS.find((item) => item.serialNumber === serialNumber) ?? null,
    [serialNumber]
  )
  const [decisions, setDecisions] = React.useState<PlanDecision[]>(INITIAL_DECISIONS)
  const [draft, setDraft] = React.useState<DecisionDraft>({
    reason: "",
    action: "",
    owner: "",
    deadline: "",
  })
  const [isDeadlineCalendarOpen, setIsDeadlineCalendarOpen] = React.useState(false)

  const [pipelineChecklist, setPipelineChecklist] =
    React.useState<PipelineChecklistState>({ checked: {}, comments: {} })

  React.useEffect(() => {
    setPipelineChecklist({ checked: {}, comments: {} })
  }, [serialNumber])

  const currentStageIdx = task ? pipelineStageIndex(task.stage) : -1
  const houseKit = task?.houseKitType ?? null

  const shippingChecklistIds = React.useMemo(
    () =>
      task && currentStageIdx === 3
        ? collectTimelineEventIds(3, houseKit)
        : [],
    [task, currentStageIdx, houseKit]
  )

  const shippingReady = React.useMemo(() => {
    if (shippingChecklistIds.length === 0) return false
    return shippingChecklistIds.every((id) => pipelineChecklist.checked[id])
  }, [shippingChecklistIds, pipelineChecklist.checked])

  const displayStageBadge = React.useMemo(() => {
    if (!task) return ""
    if (currentStageIdx === 3) {
      return shippingReady ? "Готов к отгрузке" : "Подготовка к отгрузке"
    }
    return task.stage
  }, [task, currentStageIdx, shippingReady])

  const readinessMetricLabel =
    task && currentStageIdx === 3
      ? shippingReady
        ? "Готов к отгрузке"
        : "Подготовка к отгрузке"
      : null

  const selectedDecisions = React.useMemo(() => {
    if (!task) return []
    return decisions.filter((item) => item.projectId === task.projectId)
  }, [decisions, task])

  const selectedDeadlineDate = React.useMemo(
    () => (draft.deadline ? new Date(`${draft.deadline}T00:00:00`) : undefined),
    [draft.deadline]
  )

  const saveDecision = () => {
    if (!task) return
    if (!draft.reason || !draft.action || !draft.owner || !draft.deadline) return

    const next: PlanDecision = {
      id: `decision-${Date.now()}`,
      taskId: task.id,
      projectId: task.projectId,
      reason: draft.reason,
      action: draft.action,
      owner: draft.owner,
      deadline: draft.deadline,
      createdAt: new Date().toISOString(),
      author: "Пользователь",
    }

    setDecisions((prev) => [next, ...prev])
    setDraft({ reason: "", action: "", owner: "", deadline: "" })
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row lg:items-stretch lg:gap-0 lg:divide-x lg:divide-border">
      {/* Текущий этап (только lg); отступ до разделителя = как у соседних колонок */}
      <div className="hidden min-h-0 h-full shrink-0 flex-col pt-1 pb-1 lg:flex lg:w-[21rem] lg:min-w-[19rem] lg:max-w-[23.5rem] lg:pr-6">
        <ObjectVerticalPipeline
          task={task}
          checklist={pipelineChecklist}
          onChecklistChange={setPipelineChecklist}
          shippingReady={shippingReady}
        />
      </div>

      {/* Центр: горизонтальный пайплайн, метрики, карточки */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-y-auto overflow-x-hidden px-1 py-1 md:px-1.5 lg:min-h-0 lg:px-6">
        {task ? (
          <ObjectPipelineHeader task={task} shippingReady={shippingReady} />
        ) : null}
        {task ? (
          <ObjectKeyMetricsPlaceholder readinessLabel={readinessMetricLabel} />
        ) : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card className={objectPanelClass}>
            <CardHeader>
              <CardTitle className="text-base">По объекту</CardTitle>
              <CardDescription>Краткие данные из плана</CardDescription>
            </CardHeader>
            <CardContent>
              {task ? (
                <div className={cn(objectInsetClass, "p-3")}>
                  <p className="text-sm font-medium">
                    {task.contractNumber} - {task.serialNumber} дом
                  </p>
                  <p className="text-xs text-muted-foreground">{task.projectName}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Блокер: {task.blocker ?? "Нет"}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge variant="outline">{displayStageBadge}</Badge>
                    <Badge variant="outline">{task.nextMilestone}</Badge>
                    <Badge className={cn("border-0", riskBadgeClass(task.riskLevel))}>
                      {task.riskLevel === "critical"
                        ? "Критично"
                        : task.riskLevel === "risk"
                          ? "Риск"
                          : "Норма"}
                    </Badge>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Нет данных по объекту.</p>
              )}
            </CardContent>
          </Card>

          <Card className={objectPanelClass}>
            <CardHeader>
              <CardTitle className="text-base">Принятие решений</CardTitle>
              <CardDescription>
                Фиксация причин отклонения, действия, владельца и срока.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
          {task ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="reason">Почему отклонилось</Label>
                <Input
                  id="reason"
                  value={draft.reason}
                  onChange={(event) => setDraft((prev) => ({ ...prev, reason: event.target.value }))}
                  placeholder="Причина отклонения"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="action">Какое действие принято</Label>
                <Input
                  id="action"
                  value={draft.action}
                  onChange={(event) => setDraft((prev) => ({ ...prev, action: event.target.value }))}
                  placeholder="Описание действия"
                />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="owner">Владелец</Label>
                  <Input
                    id="owner"
                    value={draft.owner}
                    onChange={(event) => setDraft((prev) => ({ ...prev, owner: event.target.value }))}
                    placeholder="ФИО владельца"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deadline">Срок</Label>
                  <Button
                    id="deadline"
                    type="button"
                    variant="outline"
                    className="w-full justify-start font-sans font-normal"
                    onClick={() => setIsDeadlineCalendarOpen((prev) => !prev)}
                  >
                    {draft.deadline ? isoToRuDateLong(draft.deadline) : "Выберите дату"}
                  </Button>
                  {isDeadlineCalendarOpen ? (
                    <div className={cn(objectInsetClass, "p-2")}>
                      <Calendar
                        mode="single"
                        selected={selectedDeadlineDate}
                        onSelect={(date) => {
                          if (!date) return
                          setDraft((prev) => ({ ...prev, deadline: dateToIsoLocal(date) }))
                          setIsDeadlineCalendarOpen(false)
                        }}
                        className="font-sans"
                      />
                    </div>
                  ) : null}
                </div>
              </div>
              <Button onClick={saveDecision} className="w-full">
                Зафиксировать решение
              </Button>

              <Separator />

              <div className="space-y-2">
                <p className="text-sm font-medium">Журнал решений</p>
                {selectedDecisions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Решений пока нет.</p>
                ) : (
                  selectedDecisions.map((decision) => (
                    <div key={decision.id} className={cn(objectInsetClass, "p-2")}>
                      <p className="text-sm font-medium">{decision.reason}</p>
                      <p className="text-xs text-muted-foreground">{decision.action}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {decision.owner} · до {isoToRuDate(decision.deadline)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Для этого домокомплекта пока нет данных в типовой карточке.
            </p>
          )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Правая панель: тот же зазор от разделителя (pl-6), справа — как на странице объекта */}
      <div className="flex min-h-[min(70vh,560px)] w-full shrink-0 flex-col self-stretch lg:min-h-0 lg:h-full lg:w-[360px] lg:max-w-[360px] lg:pl-6 lg:pr-8">
        <ObjectRightRail task={task} />
      </div>
    </div>
  )
}
