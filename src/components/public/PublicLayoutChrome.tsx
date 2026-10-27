"use client"

import { usePathname } from "next/navigation"
import Image from "next/image"
import Header from "@/components/shared/Header"
import HeroSection from "@/components/public/HeroSection"
import PublicNavBars from "@/components/public/PublicNavBars"
import Footer from "@/components/shared/Footer"
import { LocalidadProvider } from "@/lib/context/LocalidadContext"

export default function PublicLayoutChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isSearchPage = pathname.startsWith("/buscar")
  const isCategoryPage = pathname.startsWith("/negocios") || pathname.startsWith("/directorio")

  return (
    <div className="min-h-screen flex flex-col">
      {/* Fondo estático del Home */}
      {!isCategoryPage && (
        <div className="absolute inset-0 z-0 h-[500px] pointer-events-none overflow-hidden">
          {/* Es el LCP de la home: <img> con preload y prioridad alta (un background-image CSS se descubre tarde).
              En mobile cubre 500px de alto → ~889px de ancho para una foto 16:9 */}
          <Image
            src="/valle.jpg"
            alt=""
            fill
            preload
            fetchPriority="high"
            sizes="(max-width: 889px) 889px, 100vw"
            className="object-cover"
            style={{ objectPosition: "center 40%" }}
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 100%)" }}
          />
        </div>
      )}

      <header className="relative z-[100]">
        <Header />
        {!isCategoryPage && !isSearchPage && <HeroSection />}
      </header>

      <LocalidadProvider>
        <div className={`relative flex flex-col flex-1 ${!isCategoryPage ? "-mt-20" : ""}`}>

          {/* Barra de categorías + floating button — cliente, se ocultan solos en páginas de detalle */}
          <PublicNavBars />

          <main className="flex-1 relative">
            {children}
          </main>

          <Footer />
        </div>
      </LocalidadProvider>
    </div>
  )
}
