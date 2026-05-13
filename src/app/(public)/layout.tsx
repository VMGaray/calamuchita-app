import Header from "@/components/shared/Header"
import HeroSection from "@/components/public/HeroSection"
import StickyCategoryBar from "@/components/public/StickyCategoryBar"
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

  // Páginas con BackgroundManager propio (fondo full-page dinámico por localidad)
  const isCategoryPage =
    pathname.startsWith("/negocios") ||
    pathname.startsWith("/directorio")

  // Las páginas de detalle no muestran el FloatingLocalidadButton
  const isDetailPage = /^\/directorio\/[^/]+\/[^/]+/.test(pathname)
  const showFloatingButton = isCategoryPage && !isDetailPage

  return (
    <div className="min-h-screen flex flex-col">

      {/* Fondo estático del Home (solo en páginas sin BackgroundManager) */}
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
            style={{
              background: "linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 100%)",
            }}
          />
        </div>
      )}

      {/* Header — z-[200] para estar por encima del LocalidadProvider (z-[100]) y del FixedBackground */}
      <header className="relative z-[200]">
        <Header />
        {!isCategoryPage && !isSearchPage && <HeroSection />}
      </header>

      <LocalidadProvider>
        {/*
          z-[100] en este contenedor para que StickyCategoryBar y FloatingLocalidadButton
          estén al mismo nivel de stacking context.
          FloatingLocalidadButton (sheet z=101) > StickyCategoryBar (z=100) → sheet aparece encima.
        */}
        <div className={`relative z-[100] flex flex-col flex-1${!isCategoryPage ? " -mt-20" : ""}`}>
          <StickyCategoryBar stickyOffset={isCategoryPage ? 64 : 0} />
          <main className="flex-1 relative z-20">
            {children}
          </main>
          {/* FloatingLocalidadButton aquí: mismo stacking context que StickyCategoryBar,
              su sheet (z=101) supera al StickyCategoryBar (z=100) */}
          {showFloatingButton && <FloatingLocalidadButton />}
          <Footer />
        </div>
      </LocalidadProvider>

    </div>
  )
}
