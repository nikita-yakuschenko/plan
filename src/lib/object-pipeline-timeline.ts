import type { HouseKitType, PipelineTimelineEvent, PipelineTimelineSection } from "@/types/plan"

function flat(items: PipelineTimelineEvent[]): PipelineTimelineSection[] {
  return [{ id: "main", title: "", items }]
}

function section(id: string, title: string, items: PipelineTimelineEvent[]): PipelineTimelineSection {
  return { id, title, items }
}

/** Все id пунктов таймлайна этапа (для проверки «чек-лист закрыт»). */
export function collectTimelineEventIds(
  stageIndex: number,
  houseKit: HouseKitType | null
): string[] {
  const sections = demoTimelineForStage(stageIndex, houseKit)
  const ids: string[] = []
  for (const sec of sections) {
    for (const ev of sec.items) {
      ids.push(ev.id)
    }
  }
  return ids
}

/** Демо: секции по этапу 0…7 (позже — API / объект). */
export function demoTimelineForStage(
  stageIndex: number,
  houseKit: HouseKitType | null
): PipelineTimelineSection[] {
  const kit = houseKit ?? "pkd"

  const production: PipelineTimelineEvent[] =
    kit === "md"
      ? [
          { id: "p1", label: "Запущено производство заготовок", kind: "trigger" },
          { id: "p2", label: "Изготовлены панели по спецификации", kind: "normal" },
          { id: "p3", label: "Начата сборка модулей на стенде", kind: "trigger" },
          { id: "p4", label: "Промежуточный контроль геометрии", kind: "normal" },
        ]
      : [
          { id: "p1", label: "Запущено производство домокомплекта", kind: "trigger" },
          { id: "p2", label: "Готовы пакеты деталей по разделам", kind: "normal" },
          { id: "p3", label: "Испытания/контроль на стенде", kind: "normal" },
          { id: "p4", label: "Комплектация под отгрузку", kind: "trigger" },
        ]

  /** Этап «Готов к отгрузке»: плоские подэтапы с развёрнутой логистикой (как раньше, без карточек рейсов). */
  const readyToShip: PipelineTimelineSection[] = [
    section("sub-komplekt", "Комплектация", [
      { id: "k1", label: "Комплектация и спецификация проверены", kind: "normal" },
      { id: "k2", label: "Требование-накладная подготовлена", kind: "normal" },
      { id: "k3", label: "Комплектация собрана", kind: "trigger" },
    ]),
    section("sub-log", "Логистика и перевозка", [
      { id: "l1", label: "Перевозчик: ООО «СеверЛог» · ИНН 7700000000", kind: "trigger" },
      { id: "l2", label: "Контакт: Иванов П.С. · +7 (812) 000-00-00", kind: "normal" },
      { id: "l3", label: "Заявка на транспорт: согласована, договор перевозки № Т-2026/04", kind: "trigger" },
      { id: "l4", label: "Спецтехника: манипулятор, ограничения по оси и высоте погрузки", kind: "normal" },
      { id: "l5", label: "Подгрузка заявок, ТТН и сопроводительных в учётную систему", kind: "normal" },
    ]),
    section("sub-doc", "Документы и отгрузка", [
      { id: "d1", label: "Окно отгрузки согласовано с производством и перевозчиком", kind: "trigger" },
      { id: "d2", label: "ТТН, акты приёмки-передачи к отгрузке", kind: "normal" },
      { id: "d3", label: "Готовность к отгрузке подтверждена ответственным", kind: "trigger" },
      { id: "d4", label: "Факт отгрузки, передача груза перевозчику", kind: "trigger" },
    ]),
  ]

  const byStage: PipelineTimelineSection[][] = [
    flat([
      { id: "d1", label: "Договор заключён", kind: "trigger" },
      { id: "d2", label: "Подписан эскизный проект", kind: "trigger" },
      { id: "d3", label: "Согласованы изменения в составе проекта", kind: "normal" },
      { id: "d4", label: "Получены авансы / график платежей", kind: "normal" },
    ]),
    flat([
      { id: "pr1", label: "Проектирование начато", kind: "trigger" },
      { id: "pr2", label: "Назначен проектировщик / ответственный", kind: "normal" },
      { id: "pr3", label: "Эскизный проект готов", kind: "trigger" },
      { id: "pr4", label: "Раздел архитектуры готов", kind: "normal" },
      { id: "pr5", label: "Раздел деревянных конструкций готов", kind: "trigger" },
    ]),
    flat(production),
    readyToShip,
    flat([
      { id: "f1", label: "Готовность площадки", kind: "normal" },
      { id: "f2", label: "Фундамент / основание принято", kind: "trigger" },
      { id: "f3", label: "Акт приёмки основания", kind: "normal" },
    ]),
    flat([
      { id: "m1", label: "Старт монтажа на объекте", kind: "trigger" },
      { id: "m2", label: "Монтаж каркаса / модулей", kind: "normal" },
      { id: "m3", label: "Кровля / временная защита", kind: "normal" },
    ]),
    flat([
      { id: "o1", label: "Отделочные работы начаты", kind: "trigger" },
      { id: "o2", label: "Фасад / окна (по графику)", kind: "normal" },
      { id: "o3", label: "Инженерные системы", kind: "normal" },
    ]),
    flat([
      { id: "c1", label: "Предсдачная проверка", kind: "trigger" },
      { id: "c2", label: "Акт приёмки объекта", kind: "trigger" },
      { id: "c3", label: "Передача ключей / закрытие этапа", kind: "normal" },
    ]),
  ]

  return byStage[stageIndex] ?? []
}
