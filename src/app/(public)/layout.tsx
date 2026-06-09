import Header from "@/components/shared/Header"
import HeroSection from "@/components/public/HeroSection"
import HomeBackground from "@/components/public/HomeBackground"
import ContentWrapper from "@/components/public/ContentWrapper"
import PublicNavBars from "@/components/public/PublicNavBars"
import Footer from "@/components/shared/Footer"
import { LocalidadProvider } from "@/lib/context/LocalidadContext"

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Fondo del río — client component, se oculta solo en páginas de categoría/detalle */}
      <HomeBackground />

      <header className="relative z-[100]">
        <Header />
        {/* HeroSection tiene su propia guarda usePathname, se oculta en detalles */}
        <HeroSection />
      </header>

      <LocalidadProvider>
        {/* ContentWrapper aplica -mt-20 solo en la home, via usePathname */}
        <ContentWrapper>
          {/* Barra de categorías + floating button — se ocultan solos en páginas de detalle */}
          <PublicNavBars />

          <main className="flex-1 relative">
            {children}
          </main>

          <Footer />
        </ContentWrapper>
      </LocalidadProvider>
    </div>
  )
}
