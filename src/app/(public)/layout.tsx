import Header from "@/components/shared/Header"
import HeroSection from "@/components/public/HeroSection"
import PublicNavBars from "@/components/public/PublicNavBars"
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
