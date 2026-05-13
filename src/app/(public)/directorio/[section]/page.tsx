import type { Metadata } from "next"
import DirectorioList from "@/components/public/DirectorioList"
import CategoryPageHeader from "@/components/public/CategoryPageHeader"
import BackgroundManager from "@/components/public/BackgroundManager"
import { SectionKey } from "@/lib/sections"

interface Props {
  params: Promise<{ section: string }>
  searchParams: Promise<{ cat?: string; q?: string; pueblo?: string }>
}

const sectionTitles: Record<string, string> = {
  services: "Servicios",
  health: "Salud",
  education: "Educación",
  tourism: "Turismo",
  commerce: "Comercios",
  events: "Eventos",
  info: "Info útil",
}

const sectionDescs: Record<string, string> = {
  services: "Plomeros, electricistas, mecánicos y más del Valle de Calamuchita",
  health: "Médicos, farmacias, veterinarias y más",
  education: "Colegios, institutos, maestras particulares y más",
  tourism: "Alojamiento, excursiones, actividades y más",
  commerce: "Almacenes, dietéticas, artesanías y más",
  events: "Festivales, recitales, ferias y más",
  info: "Emergencias, farmacias de turno, municipalidad y más",
}

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const { section } = await params
  const title = sectionTitles[section] || section
  const description = sectionDescs[section] || "Encontrá lo que necesitás en el Valle de Calamuchita"

  return {
    title,
    description,
    openGraph: {
      title: `${title} en el Valle de Calamuchita`,
      description,
      images: [{ url: "/valle.jpg", width: 1200, height: 630, alt: "Valle de Calamuchita" }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Calamuchita App`,
      description,
      images: ["/valle.jpg"],
    },
  }
}

export default async function DirectorioPage({ params, searchParams }: Props) {
  const { section } = await params
  const filters = await searchParams

  return (
    <BackgroundManager>
      <div className="min-h-screen">
        <CategoryPageHeader
          title={sectionTitles[section] || section}
          description={sectionDescs[section] || "Encontrá lo que necesitás en el Valle de Calamuchita"}
        />
        <div className="max-w-6xl mx-auto px-4 pb-12">
          <DirectorioList section={section as SectionKey} filters={filters} />
        </div>
      </div>
    </BackgroundManager>
  )
}
