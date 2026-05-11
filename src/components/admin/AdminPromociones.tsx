"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Tag, Building2, Calendar, ToggleLeft, ToggleRight, Plus } from "lucide-react"

interface PromoRow {
  id: string
  title: string
  description: string | null
  discount_percent: number | null
  discount_label: string | null
  valid_until: string
  is_active: boolean
  created_at: string
  business_id: string
  businesses: {
    name: string
    slug: string
    section: string
  } | null
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" })
}

function isExpired(valid_until: string) {
  return new Date(valid_until) < new Date()
}

export default function AdminPromociones() {
  const [promos, setPromos] = useState<PromoRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "active" | "expired">("all")

  const fetchPromos = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("promotions")
      .select("*, businesses(name, slug, section)")
      .order("created_at", { ascending: false })
    setPromos((data as PromoRow[]) || [])
    setLoading(false)
  }

  useEffect(() => { fetchPromos() }, [])

  const handleToggle = async (id: string, current: boolean) => {
    const supabase = createClient()
    await supabase.from("promotions").update({ is_active: !current }).eq("id", id)
    setPromos(prev => prev.map(p => p.id === id ? { ...p, is_active: !current } : p))
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta promoción?")) return
    const supabase = createClient()
    await supabase.from("promotions").delete().eq("id", id)
    setPromos(prev => prev.filter(p => p.id !== id))
  }

  const filtered = promos.filter(p => {
    if (filter === "active") return p.is_active && !isExpired(p.valid_until)
    if (filter === "expired") return isExpired(p.valid_until)
    return true
  })

  const total = promos.length
  const activeCount = promos.filter(p => p.is_active && !isExpired(p.valid_until)).length
  const expiredCount = promos.filter(p => isExpired(p.valid_until)).length

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl text-stone-800 mb-1">Promociones</h1>
          <p className="text-stone-500">{total} en total · {activeCount} activas</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {([
          { key: "all",     label: `Todas (${total})` },
          { key: "active",  label: `Activas (${activeCount})` },
          { key: "expired", label: `Vencidas (${expiredCount})` },
        ] as const).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-xl text-sm border transition-colors ${
              filter === key
                ? "bg-[#2D4530] text-white border-[#2D4530]"
                : "bg-white text-stone-600 border-stone-200 hover:border-stone-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl border border-stone-200 p-4 animate-pulse h-20" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-16 text-center">
          <Tag size={28} className="text-stone-300 mx-auto mb-3" />
          <p className="text-stone-400 text-sm">No hay promociones en esta categoría</p>
          <p className="text-xs text-stone-300 mt-1">Las promociones se crean desde la ficha de cada negocio</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          {filtered.map((promo, i) => {
            const expired = isExpired(promo.valid_until)
            const effectivelyActive = promo.is_active && !expired
            return (
              <div
                key={promo.id}
                className={`flex items-start gap-4 px-6 py-4 ${i !== filtered.length - 1 ? "border-b border-stone-100" : ""}`}
              >
                {/* Icon */}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  effectivelyActive ? "bg-emerald-50" : "bg-stone-100"
                }`}>
                  <Tag size={15} className={effectivelyActive ? "text-emerald-600" : "text-stone-400"} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap">
                    <p className="text-sm font-medium text-stone-800">{promo.title}</p>
                    {(promo.discount_label || promo.discount_percent) && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 flex-shrink-0">
                        {promo.discount_label || `${promo.discount_percent}% OFF`}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    {promo.businesses && (
                      <span className="flex items-center gap-1 text-xs text-stone-400">
                        <Building2 size={11} />
                        {promo.businesses.name}
                      </span>
                    )}
                    <span className={`flex items-center gap-1 text-xs ${expired ? "text-red-400" : "text-stone-400"}`}>
                      <Calendar size={11} />
                      {expired ? "Venció" : "Válido hasta"} {formatDate(promo.valid_until)}
                    </span>
                  </div>
                  {promo.description && (
                    <p className="text-xs text-stone-400 mt-1 line-clamp-1">{promo.description}</p>
                  )}
                </div>

                {/* Toggle */}
                <button
                  onClick={() => handleToggle(promo.id, promo.is_active)}
                  className="flex-shrink-0 mt-1"
                  title={promo.is_active ? "Desactivar" : "Activar"}
                >
                  {promo.is_active
                    ? <ToggleRight size={22} className="text-[#A3B18A]" />
                    : <ToggleLeft size={22} className="text-stone-300" />}
                </button>

                {/* Status badge */}
                <span className={`flex-shrink-0 text-[10px] font-semibold px-2.5 py-1 rounded-full mt-1 ${
                  expired
                    ? "bg-stone-100 text-stone-400"
                    : effectivelyActive
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-stone-100 text-stone-400"
                }`}>
                  {expired ? "Vencida" : effectivelyActive ? "Activa" : "Pausada"}
                </span>
              </div>
            )
          })}
        </div>
      )}

      <p className="text-xs text-stone-400 mt-4 text-center">
        Las promociones se crean y editan desde la ficha de cada negocio
      </p>
    </div>
  )
}
