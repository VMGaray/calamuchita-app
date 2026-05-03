import NegociosFilters from "@/components/public/NegociosFilters"
import NegociosList from "@/components/public/NegociosList"

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
    <div className="min-h-screen">
      <div className="bg-primary-500/80 backdrop-blur-sm px-4 py-10">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-serif text-4xl text-white mb-2">Gastronomía</h1>
          <p className="text-primary-100 text-sm">
            Restaurantes, cafés, viandas y más del Valle de Calamuchita
          </p>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <NegociosFilters params={params} />
        <NegociosList params={params} />
      </div>
    </div>
  )
}