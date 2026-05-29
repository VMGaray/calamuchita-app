"use client"

import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useState } from "react"
import InteractiveText from "@/components/ui/InteractiveText"
import MagneticButton from "@/components/ui/MagneticButton"

export default function HeroSection() {
  const router = useRouter()
  const [query, setQuery] = useState("")

  const handleSearch = () => {
    if (!query.trim()) return
    router.push(`/buscar?q=${encodeURIComponent(query.trim())}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch()
  }

  return (
    <section className="relative px-4 pt-6 md:pt-8 pb-28 md:pb-20 text-center overflow-hidden min-h-[300px] md:min-h-[480px]" style={{ contain: "layout style" }}>

      {/* Eyebrow */}
      <motion.span
        className="relative z-10 inline-block text-xs font-medium tracking-widest uppercase px-4 py-1.5 rounded-full mb-4"
        style={{
          background: "rgba(0,0,0,0.22)",
          border: "1px solid rgba(255,255,255,0.3)",
          color: "rgba(255,255,255,0.95)",
          textShadow: "0 1px 6px rgba(0,0,0,0.4)",
        }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Valle de Calamuchita · Córdoba
      </motion.span>

      {/* Title */}
      <h1
        className="relative z-10 font-serif text-4xl md:text-6xl lg:text-7xl leading-tight mb-3"
        style={{ color: "rgba(255,255,255,0.97)", textShadow: "0 2px 16px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.3)" }}
      >
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.3 }}>
          <InteractiveText text="Todo el valle," />
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.6 }}>
          <InteractiveText text="en un solo lugar" />
        </motion.div>
      </h1>

      {/* Subtitle */}
      <motion.p
        className="relative z-10 text-sm md:text-base max-w-lg mx-auto mb-4 leading-relaxed px-4 md:px-5 py-2 md:py-2.5 rounded-2xl"
        style={{
          color: "rgba(255,255,255,0.95)",
          background: "rgba(0,0,0,0.25)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.15)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.1 }}
      >
        Gastronomía, salud, servicios, turismo y más. Explorá lo mejor del Valle de Calamuchita.
      </motion.p>

      {/* Search — h-14 reserves space before JS hydrates; opacity-only animation avoids y-transform layout shift */}
      <motion.div
        className="relative z-10 flex items-center max-w-lg mx-auto rounded-2xl overflow-hidden h-14"
        style={{
          background: "rgba(255,255,255,0.7)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.8)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
          willChange: "opacity",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.3 }}
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
          className="px-6 h-full text-sm font-medium cursor-pointer"
          style={{ background: "#2D4530", color: "#E1DBC9" }}
        >
          Buscar
        </MagneticButton>
      </motion.div>

    </section>
  )
}