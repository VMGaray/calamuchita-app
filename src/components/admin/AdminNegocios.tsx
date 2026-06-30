"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus, Pencil, Trash2, Eye, ArrowUpDown, ArrowUp, ArrowDown, Star } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Business } from "@/types/database"

const sectionLabels: Record<string, string> = {
  gastronomy: "Gastronomía",
  services:   "Servicios",
  health:     "Salud",
  education:  "Educación",
  tourism:    "Turismo",
  commerce:   "Comercios",
  events:     "Eventos",
  info:       "Info útil",
}

type SortKey = "created_at" | "total_views" | "total_leads"
type SortDir = "asc" | "desc"

function WaIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

function SortButton({ label, sortKey, current, dir, onClick }: {
  label: string
  sortKey: SortKey
  current: SortKey
  dir: SortDir
  onClick: (k: SortKey) => void
}) {
  const active = current === sortKey
  return (
    <button
      onClick={() => onClick(sortKey)}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
        active
          ? "bg-primary-500 text-primary-100"
          : "bg-white text-stone-500 border border-stone-200 hover:border-primary-300"
      }`}
    >
      {label}
      {active
        ? dir === "desc" ? <ArrowDown size={12} /> : <ArrowUp size={12} />
        : <ArrowUpDown size={12} className="opacity-40" />}
    </button>
  )
}

export default function AdminNegocios() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("")
  const [puebloFilter, setPuebloFilter] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [sortBy, setSortBy] = useState<SortKey>("created_at")
  const [sortDir, setSortDir] = useState<SortDir>("desc")

  const fetchBusinesses = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("businesses")
      .select("*")
      .order("created_at", { ascending: false })
    setBusinesses(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchBusinesses() }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que querés eliminar este negocio?")) return
    const supabase = createClient()
    await supabase.from("businesses").delete().eq("id", id)
    fetchBusinesses()
  }

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "suspended" : "active"
    const supabase = createClient()
    await supabase.from("businesses").update({ status: newStatus }).eq("id", id)
    fetchBusinesses()
  }

  const handleTogglePremium = async (id: string, current: boolean) => {
    const supabase = createClient()
    await supabase.from("businesses").update({ is_premium: !current }).eq("id", id)
    setBusinesses(prev => prev.map(b => b.id === id ? { ...b, is_premium: !current } : b))
  }

  const handleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortDir(d => d === "desc" ? "asc" : "desc")
    } else {
      setSortBy(key)
      setSortDir("desc")
    }
  }

  const bySection = filter ? businesses.filter(b => b.section === filter) : businesses
  const byPueblo  = puebloFilter ? bySection.filter(b => (b.pueblo || "Sin localidad") === puebloFilter) : bySection

  const puebloCounts = bySection.reduce((acc, b) => {
    const key = b.pueblo || "Sin localidad"
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  const puebloOptions = Object.keys(puebloCounts).sort((a, b) =>
    a === "Sin localidad" ? 1 : b === "Sin localidad" ? -1 : a.localeCompare(b)
  )

  const categoryCounts = byPueblo.reduce((acc, b) => {
    const key = b.subcategory || "Sin categoría"
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  const categoryOptions = Object.keys(categoryCounts).sort((a, b) =>
    a === "Sin categoría" ? 1 : b === "Sin categoría" ? -1 : a.localeCompare(b)
  )

  const filtered = (categoryFilter ? byPueblo.filter(b => (b.subcategory || "Sin categoría") === categoryFilter) : byPueblo)
    .slice()
    .sort((a, b) => {
      let av = 0, bv = 0
      if (sortBy === "total_views") {
        av = a.total_views ?? 0; bv = b.total_views ?? 0
      } else if (sortBy === "total_leads") {
        av = a.total_leads ?? 0; bv = b.total_leads ?? 0
      } else {
        av = new Date(a.created_at).getTime()
        bv = new Date(b.created_at).getTime()
      }
      return sortDir === "desc" ? bv - av : av - bv
    })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl text-stone-800 mb-1">Negocios</h1>
          <p className="text-stone-500">{businesses.length} negocios en total</p>
        </div>
        <Link
          href="/admin/negocios/nuevo"
          className="flex items-center gap-2 bg-primary-500 hover:bg-primary-400 text-primary-100 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Nuevo negocio
        </Link>
      </div>

      {/* Filtros por sección */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => { setFilter(""); setPuebloFilter(""); setCategoryFilter("") }}
          className={`px-4 py-2 rounded-xl text-sm border transition-colors ${
            filter === "" ? "bg-primary-500 text-primary-100 border-primary-500" : "bg-white text-stone-600 border-stone-200 hover:border-primary-300"
          }`}
        >
          Todos ({businesses.length})
        </button>
        {Object.entries(sectionLabels).map(([key, label]) => {
          const count = businesses.filter(b => b.section === key).length
          if (count === 0) return null
          return (
            <button
              key={key}
              onClick={() => { setFilter(key); setPuebloFilter(""); setCategoryFilter("") }}
              className={`px-4 py-2 rounded-xl text-sm border transition-colors ${
                filter === key ? "bg-primary-500 text-primary-100 border-primary-500" : "bg-white text-stone-600 border-stone-200 hover:border-primary-300"
              }`}
            >
              {label} ({count})
            </button>
          )
        })}
      </div>

      {/* Filtros por localidad y categoría */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-stone-400">Localidad</label>
          <select
            value={puebloFilter}
            onChange={e => { setPuebloFilter(e.target.value); setCategoryFilter("") }}
            className="px-3 py-2 rounded-xl border border-stone-200 text-sm text-stone-700 outline-none focus:ring-2 focus:ring-primary-300 bg-white min-w-[200px]"
          >
            <option value="">Todas las localidades ({bySection.length})</option>
            {puebloOptions.map(p => (
              <option key={p} value={p}>{p} ({puebloCounts[p]})</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-stone-400">Categoría</label>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-stone-200 text-sm text-stone-700 outline-none focus:ring-2 focus:ring-primary-300 bg-white min-w-[200px]"
          >
            <option value="">Todas las categorías ({byPueblo.length})</option>
            {categoryOptions.map(c => (
              <option key={c} value={c}>{c} ({categoryCounts[c]})</option>
            ))}
          </select>
        </div>
        {(puebloFilter || categoryFilter) && (
          <button
            onClick={() => { setPuebloFilter(""); setCategoryFilter("") }}
            className="text-xs text-stone-400 hover:text-red-500 self-end mb-2 transition-colors"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Ordenamiento */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="text-xs text-stone-400 mr-1">Ordenar por:</span>
        <SortButton label="Más reciente" sortKey="created_at" current={sortBy} dir={sortDir} onClick={handleSort} />
        <SortButton label="Vistas" sortKey="total_views" current={sortBy} dir={sortDir} onClick={handleSort} />
        <SortButton label="Contactos" sortKey="total_leads" current={sortBy} dir={sortDir} onClick={handleSort} />
      </div>

      {(puebloFilter || categoryFilter) && (
        <p className="text-xs text-stone-400 mb-3">Mostrando {filtered.length} de {businesses.length} negocios</p>
      )}

      {/* Lista */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-stone-200 p-4 animate-pulse h-20" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-16 text-center">
          <p className="text-stone-400 text-sm mb-4">No hay negocios en esta sección</p>
          <Link
            href="/admin/negocios/nuevo"
            className="inline-flex items-center gap-2 bg-primary-500 text-primary-100 px-4 py-2.5 rounded-xl text-sm font-medium"
          >
            <Plus size={16} />
            Agregar el primero
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          {filtered.map((business, i) => (
            <div
              key={business.id}
              className={`flex items-center gap-3 px-4 sm:px-6 py-4 ${i !== filtered.length - 1 ? "border-b border-stone-100" : ""}`}
            >
              {/* Logo */}
              <div className="w-12 h-12 rounded-xl bg-stone-100 overflow-hidden flex-shrink-0">
                {business.logo_url ? (
                  <img src={business.logo_url} alt={business.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-400 text-lg font-serif">
                    {business.name[0]}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-stone-800 truncate">{business.name}</p>
                  {business.is_premium && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-yellow-100 text-yellow-700 flex-shrink-0">
                      <Star size={9} fill="currentColor" />
                      Destacado
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-xs text-stone-400">{sectionLabels[business.section]}</span>
                  {business.subcategory && (
                    <>
                      <span className="text-stone-300">·</span>
                      <span className="text-xs text-stone-400">{business.subcategory}</span>
                    </>
                  )}
                  {business.address && (
                    <>
                      <span className="text-stone-300">·</span>
                      <span className="text-xs text-stone-400 truncate max-w-[140px]">{business.address}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Analytics */}
              <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
                <div className="flex items-center gap-1 text-stone-400" title="Vistas">
                  <Eye size={13} />
                  <span className="text-xs font-medium text-stone-600">{business.total_views ?? 0}</span>
                </div>
                <div className="flex items-center gap-1 text-[#25D366]" title="Contactos WhatsApp">
                  <WaIcon />
                  <span className="text-xs font-medium text-stone-600">{business.total_leads ?? 0}</span>
                </div>
              </div>

              {/* Status */}
              <button
                onClick={() => handleToggleStatus(business.id, business.status)}
                className={`text-xs font-medium px-2.5 py-1 rounded-full transition-colors flex-shrink-0 ${
                  business.status === "active"
                    ? "bg-primary-100 text-primary-600 hover:bg-red-100 hover:text-red-500"
                    : business.status === "pending"
                    ? "bg-yellow-100 text-yellow-700 hover:bg-primary-100 hover:text-primary-600"
                    : "bg-red-100 text-red-600 hover:bg-primary-100 hover:text-primary-600"
                }`}
                title={business.status === "active" ? "Click para suspender" : "Click para activar"}
              >
                {business.status === "active" ? "Activo" : business.status === "pending" ? "Pendiente" : "Suspendido"}
              </button>

              {/* Acciones */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleTogglePremium(business.id, !!business.is_premium)}
                  title={business.is_premium ? "Quitar de destacados" : "Marcar como destacado"}
                  className={`w-8 h-8 flex items-center justify-center rounded-xl transition-colors ${
                    business.is_premium
                      ? "bg-yellow-100 text-yellow-500 hover:bg-yellow-200"
                      : "hover:bg-stone-100 text-stone-300 hover:text-yellow-400"
                  }`}
                >
                  <Star size={15} fill={business.is_premium ? "currentColor" : "none"} />
                </button>
                <Link
                  href={`/admin/negocios/${business.id}`}
                  className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors"
                >
                  <Pencil size={15} />
                </Link>
                <button
                  onClick={() => handleDelete(business.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-red-50 text-stone-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
