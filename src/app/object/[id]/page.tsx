import Link from "next/link"

import { ObjectCard } from "@/components/object/object-card"

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function ObjectPage({ params }: PageProps) {
  const { id } = await params
  const titleId = id

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-4 p-4 lg:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Карточка домокомплекта {titleId}</h1>
          <p className="text-sm text-muted-foreground">
            Детальный режим объекта: таймлайн, зависимости и анализ отклонений.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex h-8 items-center justify-center rounded-lg border border-border bg-background px-2.5 text-sm font-medium transition-colors hover:bg-muted"
        >
          Назад в План
        </Link>
      </div>

      <ObjectCard serialNumber={titleId} />
    </main>
  )
}
