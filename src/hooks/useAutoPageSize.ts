import * as React from "react"

/** До первого измерения и при отсутствии строк в таблице */
export const DEFAULT_AUTO_PAGE_SIZE = 10

/**
 * Запас снизу, если ещё нет ref на пагинацию (или как нижняя граница без измерения).
 * При переданном `paginationRef` нижняя зона считается по фактической высоте панели.
 */
export const BOTTOM_PADDING = 80

type UseAutoPageSizeOptions = {
  /**
   * Элемент под таблицей (текст «Страница X из Y», кнопки пагинации и т.д.).
   * Его высота вычитается из доступной области вместе с зазором до таблицы.
   */
  paginationRef?: React.RefObject<HTMLElement | null>
  /**
   * Вертикальный зазор между контейнером таблицы и блоком пагинации
   * (как `gap-*` у flex-родителя: у План gap-3 = 12px, у data-table gap-4 = 16px).
   */
  gapBetweenTableAndPagination?: number
  /** Небольшой отступ от нижнего края окна (безопасная зона) */
  viewportBottomMargin?: number
  /** Если `paginationRef` ещё нет — использовать эту оценку снизу */
  bottomPadding?: number
  /** При смене данных/страницы перезапускает измерение после отрисовки строк */
  remeasureKey?: React.Key
  /**
   * Высота области строк считается по `clientHeight` контейнера с прокруткой
   * (`flex-1 min-h-0 overflow-auto`), панель пагинации снаружи — не вычитается из окна.
   */
  measureFromContainerHeight?: boolean
}

/**
 * Число строк tbody, помещающихся в видимую область:
 * либо по высоте контейнера прокрутки, либо по окну минус thead, пагинация и отступы.
 */
export function useAutoPageSize(
  tableContainerRef: React.RefObject<HTMLElement | null>,
  firstRowRef: React.RefObject<HTMLTableRowElement | null>,
  options: UseAutoPageSizeOptions = {}
): number {
  const {
    paginationRef,
    gapBetweenTableAndPagination = 12,
    viewportBottomMargin = 8,
    bottomPadding: bottomPaddingOption,
    remeasureKey,
    measureFromContainerHeight = false,
  } = options

  const bottomPaddingFallback = bottomPaddingOption ?? BOTTOM_PADDING
  const [pageSize, setPageSize] = React.useState(DEFAULT_AUTO_PAGE_SIZE)

  const recalculate = React.useCallback(() => {
    const container = tableContainerRef.current
    const firstRow = firstRowRef.current
    if (!container || !firstRow) return

    const rowHeight = firstRow.getBoundingClientRect().height
    if (rowHeight <= 0) return

    const thead = container.querySelector("thead")
    const theadHeight = thead?.getBoundingClientRect().height ?? 0

    let availableForBodyRows: number

    if (measureFromContainerHeight) {
      const ch = container.clientHeight
      if (ch < 48) return
      availableForBodyRows = ch - theadHeight
    } else {
      const tableTop = container.getBoundingClientRect().top
      const footerEl = paginationRef?.current
      const bottomReserve = footerEl
        ? footerEl.getBoundingClientRect().height +
          gapBetweenTableAndPagination +
          viewportBottomMargin
        : bottomPaddingFallback

      availableForBodyRows =
        window.innerHeight - tableTop - bottomReserve - theadHeight
    }

    const next = Math.max(1, Math.floor(availableForBodyRows / rowHeight))
    setPageSize(next)
  }, [
    tableContainerRef,
    firstRowRef,
    paginationRef,
    gapBetweenTableAndPagination,
    viewportBottomMargin,
    bottomPaddingFallback,
    measureFromContainerHeight,
  ])

  React.useEffect(() => {
    const id = window.setTimeout(() => {
      recalculate()
    }, 50)

    const onResize = () => {
      recalculate()
    }
    window.addEventListener("resize", onResize)

    return () => {
      window.clearTimeout(id)
      window.removeEventListener("resize", onResize)
    }
  }, [recalculate])

  React.useEffect(() => {
    const id = window.setTimeout(() => {
      recalculate()
    }, 50)
    return () => window.clearTimeout(id)
  }, [recalculate, remeasureKey])

  // Подстройка при смене высоты панели пагинации (режим окна) или области таблицы (flex).
  React.useLayoutEffect(() => {
    const el = measureFromContainerHeight
      ? tableContainerRef.current
      : paginationRef?.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      recalculate()
    })
    ro.observe(el)
    recalculate()
    return () => ro.disconnect()
  }, [measureFromContainerHeight, paginationRef, tableContainerRef, recalculate])

  return pageSize
}
