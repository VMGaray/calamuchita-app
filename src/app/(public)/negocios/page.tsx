import NegociosFilters from "@/components/public/NegociosFilters"
import NegociosList from "@/components/public/NegociosList"
import CategoryPageHeader from "@/components/public/CategoryPageHeader"
import BackgroundManager from "@/components/public/BackgroundManager"

interface Props {
  searchParams: Promise<{
    categoria?: string
    abierto?: string
    delivery?: string
    q?: string
  }>
}

export default async function NegociosPage({ searchParams }: Props) {
  const params = await searchParams

  return (
    <BackgroundManager>
      <div className="min-h-screen">
        <CategoryPageHeader
          title="Gastronomía"
          description="Restaurantes, cafés, viandas y más del Valle de Calamuchita"
        />
        <div className="max-w-6xl mx-auto px-4 pb-12">
          <NegociosFilters params={params} />
          <NegociosList params={params} />
        </div>
      </div>
    </BackgroundManager>
  )
}
