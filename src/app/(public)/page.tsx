import MenusDelDiaCarousel from "@/components/public/MenusDelDiaCarousel"
import ContactosUtilesGrid from "@/components/public/ContactosUtilesGrid"
import StatsSection from "@/components/public/StatsSection"
import CtaBusiness from "@/components/public/CtaBusiness"

export default async function HomePage() {
  return (
    <div>
      <div className="px-4 py-12 max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className="font-serif text-3xl md:text-4xl text-brand-pine mb-2">
            ¿Qué almorzamos hoy?
          </h2>
          <p className="text-sm text-brand-slate">
            Explorá las propuestas gastronómicas del valle para este mediodía.
          </p>
        </div>
        <MenusDelDiaCarousel />
        <ContactosUtilesGrid />
        <StatsSection />
        <CtaBusiness />
      </div>
    </div>
  )
}