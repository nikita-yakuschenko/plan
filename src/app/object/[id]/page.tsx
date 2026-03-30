import { ObjectCard } from "@/components/object/object-card"
import { ReturnToPlanLink } from "@/components/object/return-to-plan-link"
import { SiteHeader } from "@/components/site-header"
import { Separator } from "@/components/ui/separator"
import { formatObjectHeaderTitle } from "@/lib/plan-data"

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function ObjectPage({ params }: PageProps) {
  const { id } = await params
  const headerTitle = formatObjectHeaderTitle(id)

  return (
    <>
      <SiteHeader
        title={
          <>
            <ReturnToPlanLink objectId={id}>Назад в план</ReturnToPlanLink>
            <Separator
              orientation="vertical"
              className="h-4 shrink-0 data-vertical:self-auto"
            />
            <h1 className="truncate text-base font-semibold text-foreground">
              {headerTitle}
            </h1>
          </>
        }
      />
      {/* Высота под хедером: правая панель и левая колонка делят flex-1; скролл только у колонок, не у всей страницы */}
      {/* Справа чуть больше воздуха до края inset (и до скроллбара), чем слева */}
      <div className="flex min-h-0 flex-1 flex-col p-4 lg:p-6 lg:pr-10">
        <ObjectCard serialNumber={id} />
      </div>
    </>
  )
}
