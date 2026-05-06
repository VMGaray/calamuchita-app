import MarqueeBand from "@/components/public/MarqueeBand"
import MenusDelDiaCarousel from "@/components/public/MenusDelDiaCarousel"
import ContactosUtilesGrid from "@/components/public/ContactosUtilesGrid"
import StatsSection from "@/components/public/StatsSection"
import BusinessesGrid from "@/components/public/BusinessesGrid"
import CtaBusiness from "@/components/public/CtaBusiness"
import { SectionKey } from "@/lib/sections"

interface Props {
  searchParams: Promise<{ seccion?: string }>
}

export default async function HomePage({ searchParams }: Props) {
  const params = await searchParams
  const section = (params.seccion as SectionKey) || "gastronomy"

  return (
    <div>
      
      <MarqueeBand />
      <div className="px-4 py-12 max-w-6xl mx-auto">
        <MenusDelDiaCarousel />
        <ContactosUtilesGrid />
        <StatsSection />
        <BusinessesGrid />
        <CtaBusiness />
      </div>
    </div>
  )
}