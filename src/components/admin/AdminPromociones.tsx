"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Tag, Building2, Calendar, ToggleLeft, ToggleRight, Plus, Pencil, Trash2, X } from "lucide-react"
import PromoForm, { EMPTY_PROMO_FORM, promoFormFromRow, promoPayload, type PromoFormValues } from "@/components/admin/PromoForm"
import { promoHeadline } from "@/lib/promos"
import { hoyAR } from "@/lib/utils/fechas"
import type { Promotion } from "@/types/database"

interface Business { id: string; name: string; section: string }

interface PromoRow extends Promotion {
  businesses: { name: string; slug: string; section: string } | null
}

function formatDate(date: string) {
  // valid_until es una fecha sin hora: al mediodía para que no se corra un día por la zona horaria
  return new Date(`${date.slice(0, 10)}T12:00:00`).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" })
}

/** Vencida = su último día válido ya pasó en Argentina (vence al terminar el día). */
function isExpired(valid_until: string) {
  return valid_until.slice(0, 10) < hoyAR()
}

function PromoModal({
  initial,
  isNew,
  businesses,
  onSave,
  onClose,
}: {
  initial: PromoFormValues
  isNew: boolean
  businesses: Business[]
  onSave: (f: PromoFormValues) => Promise<void>
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <h2 className="font-semibold text-stone-800">
            {isNew ? "Nueva promoción" : "Editar promoción"}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-stone-100 text-stone-400">
            <X size={16} />
          </button>
        </div>
        <PromoForm initial={initial} isNew={isNew} businesses={businesses} onSave={onSave} onCancel={onClose} />
      </div>
    </div>
  )
}

export default function AdminPromociones() {
  const [promos, setPromos] = useState<PromoRow[]>([])
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "active" | "expired">("all")
  const [modal, setModal] = useState<{ open: boolean; editing: PromoRow | null }>({ open: false, editing: null })

  const fetchAll = async () => {
    const supabase = createClient()
    const [{ data: promoData }, { data: bizData }] = await Promise.all([
      supabase.from("promotions").select("*, businesses(name, slug, section)").order("created_at", { ascending: false }),
      supabase.from("businesses").select("id, name, section").eq("status", "active").order("name"),
    ])
    setPromos((promoData as PromoRow[]) || [])
    setBusinesses((bizData as Business[]) || [])
    setLoading(false)
  }

  useEffect(() => { fetchAll() }, [])

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

  const openNew = () => setModal({ open: true, editing: null })
  const openEdit = (p: PromoRow) => setModal({ open: true, editing: p })
  const closeModal = () => setModal({ open: false, editing: null })

  const handleSave = async (form: PromoFormValues) => {
    const supabase = createClient()
    const payload = promoPayload(form)

    if (modal.editing) {
      const { error } = await supabase.from("promotions").update(payload).eq("id", modal.editing.id)
      if (error) throw error
    } else {
      const { error } = await supabase.from("promotions").insert(payload)
      if (error) throw error
    }

    await fetchAll()
    closeModal()
  }

  const modalInitial: PromoFormValues = modal.editing ? promoFormFromRow(modal.editing) : EMPTY_PROMO_FORM

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
      {modal.open && (
        <PromoModal
          initial={modalInitial}
          isNew={!modal.editing}
          businesses={businesses}
          onSave={handleSave}
          onClose={closeModal}
        />
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl text-stone-800 mb-1">Promociones</h1>
          <p className="text-stone-500">{total} en total · {activeCount} activas</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-[#2D4530] hover:bg-[#3a5a3e] text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Nueva promoción
        </button>
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
          <button onClick={openNew} className="mt-4 inline-flex items-center gap-2 bg-[#2D4530] text-white px-4 py-2 rounded-xl text-sm font-medium">
            <Plus size={14} /> Crear primera promoción
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          {filtered.map((promo, i) => {
            const expired = isExpired(promo.valid_until)
            const effectivelyActive = promo.is_active && !expired
            return (
              <div
                key={promo.id}
                className={`flex items-start gap-3 px-4 sm:px-6 py-4 ${i !== filtered.length - 1 ? "border-b border-stone-100" : ""}`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  effectivelyActive ? "bg-emerald-50" : "bg-stone-100"
                }`}>
                  <Tag size={15} className={effectivelyActive ? "text-emerald-600" : "text-stone-400"} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap">
                    <p className="text-sm font-medium text-stone-800">{promo.title}</p>
                    {promoHeadline(promo) && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 flex-shrink-0">
                        {promoHeadline(promo)}
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

                <button
                  onClick={() => handleToggle(promo.id, promo.is_active)}
                  className="flex-shrink-0 mt-1"
                  title={promo.is_active ? "Desactivar" : "Activar"}
                >
                  {promo.is_active
                    ? <ToggleRight size={22} className="text-[#A3B18A]" />
                    : <ToggleLeft size={22} className="text-stone-300" />}
                </button>

                <span className={`hidden sm:inline-flex flex-shrink-0 text-[10px] font-semibold px-2.5 py-1 rounded-full mt-1 ${
                  expired ? "bg-stone-100 text-stone-400"
                  : effectivelyActive ? "bg-emerald-50 text-emerald-700"
                  : "bg-stone-100 text-stone-400"
                }`}>
                  {expired ? "Vencida" : effectivelyActive ? "Activa" : "Pausada"}
                </span>

                <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
                  <button
                    onClick={() => openEdit(promo)}
                    className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors"
                    title="Editar"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(promo.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-red-50 text-stone-400 hover:text-red-500 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
