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
    <div className="mb-6 space-y-4">
      <div className="relative">
        <input
          type="text"
          placeholder="Buscar por nombre..."
          defaultValue={params.q || ""}
          onChange={(e) => updateFilter("q", e.target.value)}
          className="w-full bg-white border border-stone-200 rounded-2xl px-5 py-3 text-sm text-stone-700 placeholder:text-stone-400 outline-none focus:ring-2 focus:ring-primary-300"
        />
      </div>

      <div className="flex gap-2 flex-wrap">
        {categories.map(({ key, label }) => {
          const isActive = (params.categoria || "") === key
          return (
            <motion.button
              key={key}
              onClick={() => updateFilter("categoria", key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary-500 text-white"
                  : "bg-white text-stone-600 border border-stone-200 hover:border-primary-300"
              }`}
              whileTap={{ scale: 0.97 }}
            >
              {label}
            </motion.button>
          )
        })}

        <motion.button
          onClick={() => updateFilter("abierto", params.abierto === "true" ? "" : "true")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            params.abierto === "true"
              ? "bg-primary-500 text-white"
              : "bg-white text-stone-600 border border-stone-200 hover:border-primary-300"
          }`}
          whileTap={{ scale: 0.97 }}
        >
          Abierto ahora
        </motion.button>

        <motion.button
          onClick={() => updateFilter("delivery", params.delivery === "true" ? "" : "true")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            params.delivery === "true"
              ? "bg-primary-500 text-white"
              : "bg-white text-stone-600 border border-stone-200 hover:border-primary-300"
          }`}
          whileTap={{ scale: 0.97 }}
        >
          Con delivery
        </motion.button>
      </div>
    </div>
  )
}