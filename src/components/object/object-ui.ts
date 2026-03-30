/** Единый стиль каркаса на странице объекта: только `border-border`, без тени и без ring (как у Card по умолчанию из shadcn — с ring — ломает единообразие). */
export const objectPanelClass =
  "rounded-xl border border-border bg-card text-card-foreground shadow-none ring-0"

/** Вложенные блоки внутри карточек (факты, формы, строки журнала). */
export const objectInsetClass =
  "rounded-md border border-border bg-background"
