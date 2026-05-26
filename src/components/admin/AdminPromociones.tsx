"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Tag, Building2, Calendar, ToggleLeft, ToggleRight, Plus, Pencil, Trash2, X } from "lucide-react"

interface Business { id: string; name: string; section: string }

interface PromoRow {
  id: string
  title: string
  description: string | null
  discount_percentage: number | null
  discount_label: string | null
  valid_until: string
  is_active: boolean
  created_at: string
  business_id: string
  businesses: { name: string; slug: string; section: string } | null
}

interface FormState {
  title: string
  description: string
  business_id: string
  discount_percentage: string
  discount_label: string
  valid_until: string
  is_active: boolean
}

const EMPTY_FORM: FormState = {
  title: "",
  description: "",
  business_id: "",
  discount_percentage: "",
  discount_label: "",
  valid_until: "",
  is_active: true,
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" })
}

function isExpired(valid_until: string) {
  return new Date(valid_until) < new Date()
}

function PromoModal({
  initial,
  businesses,
  onSave,
  onClose,
}: {
  initial: FormState
  businesses: Business[]
  onSave: (f: FormState) => Promise<void>
  onClose: () => void
}) {
  const [form, setForm] = useState<FormState>(initial)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (k: keyof FormState, v: any) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async () => {
    if (!form.title.trim()) { setError("El título es obligatorio"); return }
    if (!form.business_id) { setError("Seleccioná un negocio"); return }
    if (!form.valid_until) { setError("La fecha de vencimiento es obligatoria"); return }
    setSaving(true)
    setError(null)
    try { await onSave(form) } catch (e: any) { setError(e.message); setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <h2 className="font-semibold text-stone-800">
            {initial.title ? "Editar promoción" : "Nueva promoción"}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-stone-100 text-stone-400">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {error && (
            <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1.5">Título *</label>
            <input
              value={form.title}
              onChange={e => set("title", e.target.value)}
              placeholder="Ej: 2x1 en pizzas los jueves"
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:border-[#2D4530] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1.5">Negocio *</label>
            <select
              value={form.business_id}
              onChange={e => set("business_id", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:border-[#2D4530] transition-colors bg-white"
            >
              <option value="">— Seleccioná un negocio —</option>
              {businesses.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1.5">% de descuento</label>
              <input
                type="number"
                min={0}
                max={100}
                value={form.discount_percentage}
                onChange={e => set("discount_percentage", e.target.value)}
                placeholder="Ej: 20"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:border-[#2D4530] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1.5">Etiqueta personalizada</label>
              <input
                value={form.discount_label}
                onChange={e => set("discount_label", e.target.value)}
                placeholder="Ej: 2x1, Menú especial"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:border-[#2D4530] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1.5">Descripción</label>
            <textarea
              value={form.description}
              onChange={e => set("description", e.target.value)}
              rows={2}
              placeholder="Descripción opcional de la promoción"
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:border-[#2D4530] transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1.5">Válida hasta *</label>
            <input
              type="date"
              value={form.valid_until}
              onChange={e => set("valid_until", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:border-[#2D4530] transition-colors"
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-stone-700">Activa</p>
              <p className="text-xs text-stone-400">La promoción es visible para los usuarios</p>
            </div>
            <button
              type="button"
              onClick={() => set("is_active", !form.is_active)}
              className={`relative w-12 h-6 rounded-full transition-colors ${form.is_active ? "bg-[#A3B18A]" : "bg-stone-200"}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.is_active ? "translate-x-6" : "translate-x-0"}`} />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-stone-100">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-600 hover:bg-stone-50 transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-[#2D4530] hover:bg-[#3a5a3e] text-white text-sm font-medium transition-colors disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
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

  const handleSave = async (form: FormState) => {
    const supabase = createClient()
    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      business_id: form.business_id,
      discount_percentage: form.discount_percentage ? Number(form.discount_percentage) : null,
      discount_label: form.discount_label.trim() || null,
      valid_until: form.valid_until,
      is_active: form.is_active,
    }

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

  const modalInitial: FormState = modal.editing
    ? {
        title: modal.editing.title,
        description: modal.editing.description || "",
        business_id: modal.editing.business_id,
        discount_percentage: modal.editing.discount_percentage?.toString() || "",
        discount_label: modal.editing.discount_label || "",
        valid_until: modal.editing.valid_until.split("T")[0],
        is_active: modal.editing.is_active,
      }
    : EMPTY_FORM

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
                className={`flex items-start gap-4 px-6 py-4 ${i !== filtered.length - 1 ? "border-b border-stone-100" : ""}`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  effectivelyActive ? "bg-emerald-50" : "bg-stone-100"
                }`}>
                  <Tag size={15} className={effectivelyActive ? "text-emerald-600" : "text-stone-400"} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap">
                    <p className="text-sm font-medium text-stone-800">{promo.title}</p>
                    {(promo.discount_label || promo.discount_percentage) && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 flex-shrink-0">
                        {promo.discount_label || `${promo.discount_percentage}% OFF`}
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

                <span className={`flex-shrink-0 text-[10px] font-semibold px-2.5 py-1 rounded-full mt-1 ${
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
