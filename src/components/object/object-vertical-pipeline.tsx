"use client"

import * as React from "react"
import { IconCircleCheck } from "@tabler/icons-react"

import { PIPELINE_STEPS } from "@/components/object/object-pipeline-header"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { demoTimelineForStage } from "@/lib/object-pipeline-timeline"
import { pipelineStageIndex } from "@/lib/object-pipeline"
import { cn } from "@/lib/utils"
import type { PipelineTimelineEvent, PlanTask } from "@/types/plan"

export type PipelineChecklistState = {
  checked: Record<string, boolean>
  comments: Record<string, string>
}

type ObjectVerticalPipelineProps = {
  task: PlanTask | null
  checklist: PipelineChecklistState
  onChecklistChange: React.Dispatch<React.SetStateAction<PipelineChecklistState>>
  /** Все пункты чек-листа этапа «Готов к отгрузке» отмечены */
  shippingReady: boolean
}

const RAIL_W = "w-7" // 28px — центр линии 14px (left-3.5)
const LINE_CENTER = "left-3.5"

type TimelineEventListProps = {
  events: PipelineTimelineEvent[]
  checked: Record<string, boolean>
  comments: Record<string, string>
  onRequestCheck: (id: string) => void
  onUncheck: (id: string) => void
}

/** Строки чек-листа: мелкая точка на линии + чекбокс + текст */
function TimelineEventList({
  events,
  checked,
  comments,
  onRequestCheck,
  onUncheck,
}: TimelineEventListProps) {
  if (events.length === 0) return null
  return (
    <div className="flex flex-col gap-2.5">
      {events.map((ev) => {
        const isDone = Boolean(checked[ev.id])
        const comment = comments[ev.id]
        return (
          <div
            key={ev.id}
            className="group flex items-start gap-3 text-[11px] leading-normal"
            title={isDone && comment ? comment : undefined}
          >
            {/* Точка на линии — та же «высота строки», что у чекбокса */}
            <div
              className={cn(
                "relative z-10 flex shrink-0 justify-center self-start",
                RAIL_W
              )}
            >
              <div className="flex h-[1lh] w-full items-center justify-center">
                <span
                  className={cn(
                    "rounded-full bg-amber-400/90 ring-2 ring-amber-50 dark:bg-amber-600/80 dark:ring-amber-950/80",
                    ev.kind === "trigger" ? "size-2" : "size-1.5"
                  )}
                  aria-hidden
                />
              </div>
            </div>
            <div className="grid min-w-0 flex-1 grid-cols-[auto_1fr] items-start gap-x-2.5 gap-y-0">
              <span className="flex h-[1lh] shrink-0 items-center">
                <Checkbox
                  checked={isDone}
                  className="relative z-[1] shrink-0"
                  onCheckedChange={(v) => {
                    if (v === true) onRequestCheck(ev.id)
                    else if (v === false) onUncheck(ev.id)
                  }}
                  aria-label={ev.label}
                />
              </span>
              <span
                className={cn(
                  "min-w-0 [text-wrap:pretty]",
                  ev.kind === "trigger" && "font-semibold text-foreground",
                  ev.kind === "normal" && "text-muted-foreground"
                )}
              >
                {ev.label}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function StageDot() {
  return (
    <span
      className="size-4 shrink-0 rounded-full border-2 border-amber-100 bg-amber-500 shadow-sm ring-2 ring-amber-50 dark:border-amber-900 dark:ring-amber-950/90"
      aria-hidden
    />
  )
}

/** Узел подэтапа (4.1, 4.2, 4.3) — крупнее и заметнее */
function SubsectionDot() {
  return (
    <span
      className="size-3.5 shrink-0 rounded-full border-2 border-amber-100 bg-amber-600 shadow-sm ring-2 ring-amber-50 dark:border-amber-900 dark:bg-amber-500 dark:ring-amber-950/90"
      aria-hidden
    />
  )
}

/** Только текущий этап: подэтапы и плоские списки (в т.ч. логистика одним блоком строк). */
export function ObjectVerticalPipeline({
  task,
  checklist,
  onChecklistChange,
  shippingReady,
}: ObjectVerticalPipelineProps) {
  const current = task ? pipelineStageIndex(task.stage) : 0
  const kit = task?.houseKitType ?? null
  const step = PIPELINE_STEPS[current] ?? PIPELINE_STEPS[0]
  const sections = demoTimelineForStage(current, kit)
  const stageNum = Number(step.num)

  const { checked, comments } = checklist

  const [commentDialogFor, setCommentDialogFor] = React.useState<string | null>(
    null
  )
  const [draftComment, setDraftComment] = React.useState("")

  const handleRequestCheck = React.useCallback(
    (id: string) => {
      setCommentDialogFor(id)
      setDraftComment(checklist.comments[id] ?? "")
    },
    [checklist.comments]
  )

  const handleSaveComment = React.useCallback(() => {
    if (!commentDialogFor) return
    const text = draftComment.trim()
    if (!text) return
    onChecklistChange((prev) => ({
      ...prev,
      comments: { ...prev.comments, [commentDialogFor]: text },
      checked: { ...prev.checked, [commentDialogFor]: true },
    }))
    setCommentDialogFor(null)
  }, [commentDialogFor, draftComment, onChecklistChange])

  const handleDialogOpenChange = React.useCallback((open: boolean) => {
    if (!open) setCommentDialogFor(null)
  }, [])

  const anyContent = sections.some((s) => s.items.length > 0)

  const stageTitle =
    current === 3
      ? shippingReady
        ? "Готов к отгрузке"
        : "Подготовка к отгрузке"
      : step.title

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <p className="mb-3 shrink-0 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
        Текущий этап
      </p>
      <div className="min-h-0 flex-1 overflow-y-auto pr-0.5">
        <div className="rounded-xl border border-amber-200/90 bg-amber-50/60 px-4 py-3.5 dark:border-amber-900/55 dark:bg-amber-950/30">
          {!anyContent ? (
            <>
              <p className="min-w-0 text-[13px] font-bold uppercase leading-snug tracking-wide text-amber-950 dark:text-amber-50">
                <span className="inline-flex max-w-full flex-wrap items-center gap-2">
                  <span className="min-w-0">
                    <span className="mr-1.5 font-semibold tabular-nums text-amber-700 dark:text-amber-400/90">
                      {step.num}
                    </span>
                    {stageTitle}
                  </span>
                  {current === 3 && shippingReady ? (
                    <IconCircleCheck
                      className="size-4 shrink-0 text-emerald-600 dark:text-emerald-500"
                      aria-hidden
                    />
                  ) : null}
                </span>
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                События и подэтапы появятся здесь.
              </p>
            </>
          ) : (
            <div className="relative mt-1 flex flex-col gap-4">
              {/* Вертикаль от заголовка этапа до низа блока */}
              <div
                className={cn(
                  "absolute top-2 bottom-2 z-0 w-0.5 -translate-x-1/2 bg-amber-300/90 dark:bg-amber-800/70",
                  LINE_CENTER
                )}
                aria-hidden
              />

              {/* Заголовок этапа + крупный узел на линии */}
              <div className="relative z-10 flex gap-3">
                <div
                  className={cn(
                    "flex shrink-0 justify-center pt-0.5",
                    RAIL_W
                  )}
                >
                  <StageDot />
                </div>
                <p className="min-w-0 flex-1 text-[13px] font-bold uppercase leading-snug tracking-wide text-amber-950 dark:text-amber-50 sm:text-sm">
                  <span className="inline-flex max-w-full flex-wrap items-center gap-2">
                    <span className="min-w-0">
                      <span className="mr-1.5 font-semibold tabular-nums text-amber-700 dark:text-amber-400/90">
                        {step.num}
                      </span>
                      {stageTitle}
                    </span>
                    {current === 3 && shippingReady ? (
                      <IconCircleCheck
                        className="size-4 shrink-0 text-emerald-600 dark:text-emerald-500"
                        aria-hidden
                      />
                    ) : null}
                  </span>
                </p>
              </div>

              {sections.map((sec, secIndex) =>
                sec.items.length === 0 ? null : (
                  <div key={sec.id} className="relative z-10 flex flex-col gap-2.5">
                    {sec.title ? (
                      <div className="flex gap-3">
                        <div
                          className={cn(
                            "flex shrink-0 justify-center pt-0.5",
                            RAIL_W
                          )}
                        >
                          <SubsectionDot />
                        </div>
                        <p className="min-w-0 flex-1 border-b border-amber-200/80 pb-1.5 text-[11px] font-bold uppercase tracking-wide text-amber-900/90 dark:border-amber-800/60 dark:text-amber-200/95">
                          <span className="mr-1.5 font-semibold tabular-nums text-amber-700 dark:text-amber-400/90">
                            {stageNum}.{secIndex + 1}
                          </span>
                          {sec.title}
                        </p>
                      </div>
                    ) : null}
                    <TimelineEventList
                      events={sec.items}
                      checked={checked}
                      comments={comments}
                      onRequestCheck={handleRequestCheck}
                      onUncheck={(id) => {
                        onChecklistChange((prev) => {
                          const next = { ...prev.checked }
                          delete next[id]
                          return { ...prev, checked: next }
                        })
                      }}
                    />
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>

      <Dialog open={commentDialogFor !== null} onOpenChange={handleDialogOpenChange}>
        <DialogContent showCloseButton>
          <DialogHeader>
            <DialogTitle>Комментарий к пункту</DialogTitle>
            <DialogDescription>
              Кратко зафиксируйте результат проверки: например, что комплектация и
              спецификация сверены без расхождений, или перечислите выявленные
              расхождения.
            </DialogDescription>
          </DialogHeader>
          <textarea
            value={draftComment}
            onChange={(e) => setDraftComment(e.target.value)}
            rows={4}
            placeholder="Например: комплектация и спецификация проверены, расхождений нет."
            className="min-h-[88px] w-full resize-y rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCommentDialogFor(null)}
            >
              Отмена
            </Button>
            <Button
              type="button"
              disabled={draftComment.trim().length === 0}
              onClick={handleSaveComment}
            >
              Сохранить и отметить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
