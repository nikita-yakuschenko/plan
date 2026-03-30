/** Индекс активного этапа пайплайна (0…7) по полю `stage` из плана. */
export function pipelineStageIndex(stage: string): number {
  const s = stage.toLowerCase()
  if (s.includes("договор")) return 0
  if (s.includes("проект")) return 1
  if (s.includes("производ")) return 2
  // «Готов к отгрузке» проверяем раньше общего «отгруз»
  if (s.includes("готов к отгруз")) return 3
  if (s.includes("фундамент")) return 4
  if (s.includes("монтаж")) return 5
  if (s.includes("отделк")) return 6
  if (s.includes("сдач")) return 7
  if (s.includes("достав")) return 3
  if (s.includes("отгруз")) return 3
  return 2
}
