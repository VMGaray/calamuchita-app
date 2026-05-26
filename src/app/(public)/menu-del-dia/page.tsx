import MenusDelDiaCarousel from "@/components/public/MenusDelDiaCarousel"
import BackgroundManager from "@/components/public/BackgroundManager"
import CategoryPageHeader from "@/components/public/CategoryPageHeader"

export const metadata = {
  title: "Menú del Día",
  description: "Los menús del día de los restaurantes y comedores del Valle de Calamuchita",
}

export default function MenuDelDiaPage() {
  return (
    <BackgroundManager>
      <div className="min-h-screen">
        <CategoryPageHeader
          title="Menú del Día"
          description="Los platos de hoy en los restaurantes del Valle de Calamuchita"
        />
        <div className="max-w-6xl mx-auto px-4 pb-16">
          <MenusDelDiaCarousel />
        </div>
      </div>
    </BackgroundManager>
  )
}
