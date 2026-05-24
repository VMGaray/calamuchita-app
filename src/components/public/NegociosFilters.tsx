"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"

const categories = [
  { key: "", label: "Todos" },
  { key: "restaurant", label: "Restaurantes" },
  { key: "cafe", label: "Cafés" },
  { key: "viandas", label: "Viandas" },
  { key: "bar", label: "Bares" },
]

const pillActive = {
  background: "#2D4530",
  color: "#E1DBC9",
  border: "1.5px solid #A3B18A",
  boxShadow: "0 0 12px rgba(163,177,138,0.40)",
}
const pillInactive = {
  background: "rgba(45,69,48,0.70)",
  color: "rgba(225,219,201,0.85)",
  border: "1px solid rgba(163,177,138,0.15)",
}

interface Props {
  params: { categoria?: string; abierto?: string; delivery?: string; q?: string }
}

export default function NegociosFilters({ params }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilter = (key: string, value: string) => {
    const current = new URLSearchParams(searchParams.toString())
    if (value) current.set(key, value)
    else current.delete(key)
    router.push(`/negocios?${current.toString()}`)
  }

 return (
    <div className="mb-6 space-y-3">
      {/* ── BARRA DE BÚSQUEDA ── */}
      <input
        type="text"
        placeholder="Buscar por nombre..."
        defaultValue={params.q || ""}
        onChange={(e) => updateFilter("q", e.target.value)}
        className="w-full rounded-2xl px-5 py-3 text-sm outline-none"
        style={{
          background: "rgba(255,255,255,0.10)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.20)",
          color: "#E1DBC9",
        }}
      />

      {/* ── FILTROS ── */}
      <div
        className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{
          paddingBottom: "2px",
          WebkitMaskImage: "linear-gradient(to right, black 85%, transparent 100%)",
          maskImage: "linear-gradient(to right, black 85%, transparent 100%)",
        }}
      >
        {categories.map(({ key, label }) => {
          const isActive = (params.categoria || "") === key
          return (
            <motion.button
              key={key}
              onClick={() => updateFilter("categoria", key)}
              className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap"
              style={isActive ? pillActive : pillInactive}
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
            >
              {label}
            </motion.button>
          )
        })}

        <motion.button
          onClick={() => updateFilter("abierto", params.abierto === "true" ? "" : "true")}
          className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap"
          style={params.abierto === "true" ? pillActive : pillInactive}
          whileHover={{ y: -2 }}
          whileTap={{ y: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
        >
          Abierto ahora
        </motion.button>

        <motion.button
          onClick={() => updateFilter("delivery", params.delivery === "true" ? "" : "true")}
          className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap"
          style={params.delivery === "true" ? pillActive : pillInactive}
          whileHover={{ y: -2 }}
          whileTap={{ y: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
        >
          Con delivery
        </motion.button>
      </div>
    </div>
  )
}
