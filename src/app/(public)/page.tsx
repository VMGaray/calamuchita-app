import MarqueeBand from "@/components/public/MarqueeBand"
import MenusDelDiaCarousel from "@/components/public/MenusDelDiaCarousel"
import ContactosUtilesGrid from "@/components/public/ContactosUtilesGrid"
import StatsSection from "@/components/public/StatsSection"
import CtaBusiness from "@/components/public/CtaBusiness"

export default async function HomePage() {
  return (
    <div>
      <MarqueeBand />
      <div className="px-4 py-12 max-w-6xl mx-auto">
        <MenusDelDiaCarousel />
        <ContactosUtilesGrid />
        <StatsSection />
        <CtaBusiness />
      </div>
    </div>
  )
}