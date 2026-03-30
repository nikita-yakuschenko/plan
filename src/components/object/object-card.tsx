"use client"

import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
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

const timelineSteps = [
  { key: "contract", title: "Договор", date: "12 фев", status: "Готово" },
  { key: "design", title: "Проектирование", date: "28 фев", status: "Готово" },
  { key: "production", title: "Производство", date: "20 мар", status: "Готово" },
  { key: "delivery", title: "Готов к отгрузке", date: "25 мар", status: "Готово" },
  { key: "installation", title: "Монтаж", date: "18 апр", status: "В работе" },
  { key: "finishing", title: "Отделка", date: "-", status: "План" },
  { key: "handover", title: "Сдача", date: "-", status: "План" },
]

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
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
      <Card>
        <CardHeader>
          <CardTitle>Типовая карточка домокомплекта</CardTitle>
          <CardDescription>
            Таймлайн, зависимости и текущий статус проекта.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {timelineSteps.map((step) => (
            <div key={step.key} className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="font-medium">{step.title}</p>
                <p className="text-sm text-muted-foreground">{step.date}</p>
              </div>
              <Badge variant="outline">{step.status}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Принятие решений</CardTitle>
          <CardDescription>
            Фиксация причин отклонения, действия, владельца и срока.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {task ? (
            <>
              <div className="rounded-md border p-3">
                <p className="text-sm font-medium">
                  {task.contractNumber} - {task.serialNumber} дом
                </p>
                <p className="text-xs text-muted-foreground">{task.projectName}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Блокер: {task.blocker ?? "Нет"}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant="outline">{task.stage}</Badge>
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
                    <div className="rounded-md border p-2">
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
                    <div key={decision.id} className="rounded-md border p-2">
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
  )
}
