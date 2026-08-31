"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Plus, Trash2, Pencil, Globe, Phone, MapPin, Navigation } from "lucide-react"
import { TransportCompany } from "@/types/database"
import { normalizeUrl } from "@/lib/normalizeUrl"

const EMPTY_FORM = {
  name: "", description: "", phone: "", website: "", address: "", coordinates: "",
}

export default function AdminTransporte() {
  const [companies, setCompanies] = useState<TransportCompany[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = async () => {
    const { data, error: err } = await createClient()
      .from("transport_companies")
      .select("*")
      .order("sort_order")
    if (err) setError("Error al cargar: " + err.message)
    setCompanies(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchAll() }, [])

  const openNew = () => {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setShowForm(true)
  }

  const openEdit = (c: TransportCompany) => {
    setForm({
      name:        c.name,
      description: c.description  || "",
      phone:       c.phone        || "",
      website:     c.website      || "",
      address:     c.address      || "",
      coordinates: c.coordinates  || "",
    })
    setEditingId(c.id)
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    const payload = {
      name:        form.name.trim(),
      description: form.description.trim()  || null,
      phone:       form.phone.trim()        || null,
      website:     normalizeUrl(form.website),
      address:     form.address.trim()      || null,
      coordinates: form.coordinates.trim()  || null,
    }
    const supabase = createClient()
    let err
    if (editingId) {
      ;({ error: err } = await supabase.from("transport_companies").update(payload).eq("id", editingId))
    } else {
      ;({ error: err } = await supabase.from("transport_companies").insert([{ ...payload, is_active: true, sort_order: companies.length }]))
    }
    setSaving(false)
    if (err) { setError("Error al guardar: " + err.message); return }
    setShowForm(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
    fetchAll()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta empresa?")) return
    await createClient().from("transport_companies").delete().eq("id", id)
    setCompanies(prev => prev.filter(c => c.id !== id))
  }

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  return (
    <div className="space-y-5">
      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="flex items-center justify-end">
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2D4530] text-white text-sm font-medium hover:bg-[#3a5a3e] transition-colors"
        >
          <Plus size={14} />
          Nueva empresa
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl h-32 animate-pulse border border-stone-200" />
          ))}
        </div>
      ) : companies.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
          <p className="text-sm text-stone-400">Sin empresas de transporte cargadas</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {companies.map(c => (
            <div key={c.id} className="bg-white rounded-2xl border border-stone-200 p-4 space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-stone-800 leading-snug">{c.name}</p>
                  {c.description && (
                    <p className="text-xs text-stone-500 mt-0.5 leading-snug">{c.description}</p>
                  )}
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => openEdit(c)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-stone-100 text-stone-300 hover:text-stone-500 transition-colors"
                    title="Editar"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-stone-300 hover:text-red-400 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {(c.phone || c.website || c.address || c.coordinates) && (
                <div className="space-y-1 pt-1 border-t border-stone-100">
                  {c.phone && (
                    <div className="flex items-center gap-1.5 text-xs text-stone-500">
                      <Phone size={11} className="flex-shrink-0 text-stone-400" />
                      {c.phone}
                    </div>
                  )}
                  {c.website && (
                    <div className="flex items-center gap-1.5 text-xs text-stone-500 min-w-0">
                      <Globe size={11} className="flex-shrink-0 text-stone-400" />
                      <span className="truncate">{c.website}</span>
                    </div>
                  )}
                  {c.address && (
                    <div className="flex items-start gap-1.5 text-xs text-stone-500">
                      <MapPin size={11} className="flex-shrink-0 text-stone-400 mt-0.5" />
                      {c.address}
                    </div>
                  )}
                  {c.coordinates && (
                    <div className="flex items-center gap-1.5 text-xs text-stone-400">
                      <Navigation size={11} className="flex-shrink-0" />
                      {c.coordinates}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-medium text-stone-800">
              {editingId ? "Editar empresa" : "Nueva empresa de transporte"}
            </h3>

            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Nombre de la empresa</label>
              <input
                value={form.name}
                onChange={e => set("name", e.target.value)}
                placeholder="Ej: COTAP, Sierras de Calamuchita…"
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-[#A3B18A]/50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Descripción</label>
              <input
                value={form.description}
                onChange={e => set("description", e.target.value)}
                placeholder="Ej: Servicio de larga distancia…"
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-[#A3B18A]/50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Teléfono</label>
              <input
                value={form.phone}
                onChange={e => set("phone", e.target.value)}
                placeholder="Ej: 03546 42-0000"
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-[#A3B18A]/50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Página web</label>
              <input
                value={form.website}
                onChange={e => set("website", e.target.value)}
                placeholder="Ej: https://www.cotap.com.ar"
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-[#A3B18A]/50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Dirección</label>
              <textarea
                value={form.address}
                onChange={e => set("address", e.target.value)}
                placeholder="Ej: Av. Sobremonte 123, Santa Rosa de Calamuchita"
                rows={2}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-[#A3B18A]/50 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Coordenadas</label>
              <input
                value={form.coordinates}
                onChange={e => set("coordinates", e.target.value)}
                placeholder="Ej: -32.0636, -64.5285"
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-[#A3B18A]/50"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => { setShowForm(false); setEditingId(null); setForm(EMPTY_FORM) }}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-600 text-sm hover:bg-stone-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name.trim()}
                className="flex-1 py-2.5 rounded-xl bg-[#2D4530] text-white text-sm font-medium hover:bg-[#3a5a3e] transition-colors disabled:opacity-50"
              >
                {saving ? "Guardando…" : editingId ? "Guardar cambios" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
