"use client"

import { useRouter, usePathname } from "next/navigation"
import { useState } from "react"
import InteractiveText from "@/components/ui/InteractiveText"
import MagneticButton from "@/components/ui/MagneticButton"

// Sin <Suspense>: con fallback={null} React mandaba el hero al final del HTML y,
// hasta que llegaba, el contenido se pintaba arriba y después saltaba ~400px (CLS 0,5).
export default function HeroSection() {
  const router = useRouter()
  const pathname = usePathname()
  const [query, setQuery] = useState("")

  const isDetailPage =
    /^\/directorio\/[^/]+\/[^/]+/.test(pathname) ||
    /^\/negocios\/[^/?]+/.test(pathname)

  if (isDetailPage || pathname.startsWith("/buscar")) return null

  const handleSearch = () => {
    if (!query.trim()) return
    router.push(`/buscar?q=${encodeURIComponent(query.trim())}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch()
  }

  return (
    <section className="relative px-4 pt-6 md:pt-8 pb-28 md:pb-20 text-center overflow-hidden min-h-[300px] md:min-h-[480px]" style={{ contain: "layout style" }}>

      {/* Las entradas son animaciones CSS (globals.css): arrancan con el primer paint. Con framer-motion
          el texto venía con opacity:0 en el HTML y no se veía hasta que hidrataba el JS (segundos en 4G). */}

      {/* Eyebrow */}
      <span
        className="hero-in-down relative z-10 inline-block text-xs font-medium tracking-widest uppercase px-4 py-1.5 rounded-full mb-4"
        style={{
          background: "rgba(0,0,0,0.22)",
          border: "1px solid rgba(255,255,255,0.3)",
          color: "rgba(255,255,255,0.95)",
          textShadow: "0 1px 6px rgba(0,0,0,0.4)",
          animationDuration: "0.6s",
        }}
      >
        Valle de Calamuchita · Córdoba
      </span>

      {/* Title */}
      <h1
        className="relative z-10 font-serif text-4xl md:text-6xl lg:text-7xl leading-tight mb-3"
        style={{ color: "rgba(255,255,255,0.97)", textShadow: "0 2px 16px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.3)" }}
      >
        <div className="hero-in" style={{ animationDuration: "0.3s", animationDelay: "0.3s" }}>
          <InteractiveText text="Todo el valle," />
        </div>
        <div className="hero-in" style={{ animationDuration: "0.3s", animationDelay: "0.6s" }}>
          <InteractiveText text="en un mismo lugar" />
        </div>
      </h1>

      {/* Subtitle */}
      <p
        className="hero-in relative z-10 text-sm md:text-base max-w-lg mx-auto mb-4 leading-relaxed px-4 md:px-5 py-2 md:py-2.5 rounded-2xl"
        style={{
          color: "rgba(255,255,255,0.95)",
          background: "rgba(0,0,0,0.25)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.15)",
          animationDuration: "0.8s",
          animationDelay: "1.1s",
        }}
      >
        Gastronomía, salud, servicios, turismo y más. Explorá lo mejor del Valle de Calamuchita.
      </p>

      {/* Search — h-14 reserves space before JS hydrates; opacity-only animation avoids y-transform layout shift */}
      <div
        className="hero-in relative z-10 flex items-center max-w-lg mx-auto rounded-2xl overflow-hidden h-14"
        style={{
          background: "rgba(255,255,255,0.7)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.8)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
          animationDuration: "0.5s",
          animationDelay: "1.3s",
        }}
      >
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Buscar restaurantes, servicios..."
          className="flex-1 bg-transparent border-none outline-none px-6 h-full text-sm placeholder:text-stone-400"
          style={{ color: "#2D4530" }}
        />
        <MagneticButton
          onClick={handleSearch}
          className="flex items-center justify-center px-6 h-full text-sm font-medium cursor-pointer"
          style={{ background: "#2D4530", color: "#E1DBC9" }}
        >
          Buscar
        </MagneticButton>
      </div>

    </section>
  )
}
