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
      {/* Contenedor principal: 
          Usamos relative para poder posicionar los bloques uno sobre otro.
      */}
      <div className="relative flex flex-col w-full">
        
        {/* BLOQUE A: Título y descripción */}
        <div className="relative z-10 w-full">
          <CategoryPageHeader
            title="Gastronomía"
            description="Restaurantes, cafés, viandas y más del Valle de Calamuchita"
          />
        </div>

        {/* BLOQUE B: Filtros y Lista 
            Aquí está la magia: usamos un margen negativo muy fuerte.
            -mt-24 en mobile y -mt-36 en desktop para obligar a la barra a subir.
        */}
        <div className="relative z-20 w-full max-w-6xl mx-auto px-4 -mt-24 md:-mt-36">
          <NegociosFilters params={params} />
          
          {/* Separamos un poco la lista para que no tape los botones de filtros */}
          <div className="mt-8">
            <NegociosList params={params} />
          </div>
        </div>

      </div>
    </BackgroundManager>
  )
}