import Header from "@/components/shared/Header"
import HeroSection from "@/components/public/HeroSection"
import StickyCategoryBar from "@/components/public/StickyCategoryBar"
import ContextBar from "@/components/public/ContextBar"
import FloatingLocalidadButton from "@/components/public/FloatingLocalidadButton"
import Footer from "@/components/shared/Footer"
import { LocalidadProvider } from "@/lib/context/LocalidadContext"
import { headers } from "next/headers"

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers()
  const pathname = headersList.get("x-pathname") || ""
  const isSearchPage = pathname.startsWith("/buscar")
  const isCategoryPage = pathname.startsWith("/negocios") || pathname.startsWith("/directorio")
  const isDetailPage =
    /^\/directorio\/[^/]+\/[^/]+/.test(pathname) ||
    /^\/negocios\/[^/?]+/.test(pathname)
  const showFloatingButton = isCategoryPage && !isDetailPage

  return (
    <div className="min-h-screen flex flex-col">
      {/* Fondo estático del Home */}
      {!isCategoryPage && (
        <div className="absolute inset-0 z-0 h-[500px] pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "url('/valle.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center 40%",
              backgroundRepeat: "no-repeat",
            }}
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 100%)" }}
          />
        </div>
      )}

      {/* HEADER: z-50 es suficiente si lo demás está ordenado */}
      <header className="relative z-[100]">
        <Header />
        {!isCategoryPage && !isSearchPage && <HeroSection />}
      </header>

      <LocalidadProvider>
        {/* Eliminamos el z-[100] de aquí para no crear un contexto que atrape los clics */}
        <div className={`relative flex flex-col flex-1 ${!isCategoryPage ? "-mt-20" : ""}`}>
          
          {/* La barra de categorías DEBE tener un z-index alto para ser clickeable */}
          {!isDetailPage && (
            <div className="sticky top-0 z-[150]">
              <StickyCategoryBar stickyOffset={isCategoryPage ? 64 : 0} />
              {/* Barra de contexto: solo visible en mobile, siempre sticky junto a la barra de categorías */}
              <ContextBar />
            </div>
          )}

          <main className="flex-1 relative">
            {children}
          </main>

          {showFloatingButton && (
            <div className="relative z-[160]">
              <FloatingLocalidadButton />
            </div>
          )}
          
          <Footer />
        </div>
      </LocalidadProvider>
    </div>
  )
}