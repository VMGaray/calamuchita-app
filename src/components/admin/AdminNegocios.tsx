"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Business } from "@/types/database"

const sectionLabels: Record<string, string> = {
  gastronomy: "Gastronomía",
  services: "Servicios",
  health: "Salud",
  education: "Educación",
  tourism: "Turismo",
  commerce: "Comercios",
  events: "Eventos",
  info: "Info útil",
}

export default function AdminNegocios() {
 const [businesses, setBusinesses] = useState<Business[]>([])
const [loading, setLoading] = useState(true)
const [filter, setFilter] = useState("")

const fetchBusinesses = async () => {
  const supabase = createClient()
  const { data } = await supabase
    .from("businesses")
    .select("*")
    .order("created_at", { ascending: false })
  setBusinesses(data || [])
  setLoading(false)
}

useEffect(() => {
  const supabase = createClient()
  supabase
    .from("businesses")
    .select("*")
    .order("created_at", { ascending: false })
    .then(({ data }) => {
      setBusinesses(data || [])
      setLoading(false)
    })
}, [])

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

  const filtered = filter
    ? businesses.filter(b => b.section === filter)
    : businesses

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

      {/* Filtros */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setFilter("")}
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
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-xl text-sm border transition-colors ${
                filter === key ? "bg-primary-500 text-primary-100 border-primary-500" : "bg-white text-stone-600 border-stone-200 hover:border-primary-300"
              }`}
            >
              {label} ({count})
            </button>
          )
        })}
      </div>

      {/* Lista */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
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
              className={`flex items-center gap-4 px-6 py-4 ${i !== filtered.length - 1 ? "border-b border-stone-100" : ""}`}
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
                <p className="text-sm font-medium text-stone-800 truncate">{business.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
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
                      <span className="text-xs text-stone-400 truncate">{business.address}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Status */}
              <button
                onClick={() => handleToggleStatus(business.id, business.status)}
                className={`text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
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
              <div className="flex items-center gap-2">
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