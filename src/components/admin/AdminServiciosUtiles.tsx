"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react"
import { Locality, UtilityService } from "@/types/database"

const CATEGORIES = [
  { value: "emergency", label: "Emergencias" },
  { value: "health",    label: "Salud" },
  { value: "municipal", label: "Municipal" },
  { value: "security",  label: "Seguridad" },
  { value: "utility",   label: "Servicios básicos" },
  { value: "transport", label: "Transporte" },
  { value: "tourism",   label: "Turismo" },
  { value: "other",     label: "Otros" },
]

const EMPTY_FORM = {
  name: "", category: "other", phone: "", address: "", description: "", sort_order: 0,
}

export default function AdminServiciosUtiles() {
  const [localities, setLocalities] = useState<Locality[]>([])
  const [selectedLocality, setSelectedLocality] = useState<string>("")
  const [services, setServices] = useState<UtilityService[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<UtilityService | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    createClient()
      .from("localities")
      .select("*")
      .order("sort_order")
      .then(({ data }) => {
        const locs = data || []
        setLocalities(locs)
        if (locs.length > 0) setSelectedLocality(locs[0].id)
      })
  }, [])

  useEffect(() => {
    if (!selectedLocality) return
    setLoading(true)
    createClient()
      .from("utility_services")
      .select("*")
      .eq("locality_id", selectedLocality)
      .order("sort_order")
      .then(({ data }) => {
        setServices(data || [])
        setLoading(false)
      })
  }, [selectedLocality])

  const openNew = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  const openEdit = (s: UtilityService) => {
    setEditing(s)
    setForm({
      name: s.name, category: s.category,
      phone: s.phone || "", address: s.address || "",
      description: s.description || "", sort_order: s.sort_order,
    })
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.name || !selectedLocality) return
    setSaving(true)
    const payload = {
      name: form.name, category: form.category,
      phone: form.phone || null, address: form.address || null,
      description: form.description || null,
      sort_order: Number(form.sort_order) || 0,
      locality_id: selectedLocality,
    }
    if (editing) {
      await createClient().from("utility_services").update(payload).eq("id", editing.id)
    } else {
      await createClient().from("utility_services").insert([{ ...payload, is_active: true }])
    }
    setSaving(false)
    setShowForm(false)
    setEditing(null)
    // refresh
    const { data } = await createClient().from("utility_services").select("*").eq("locality_id", selectedLocality).order("sort_order")
    setServices(data || [])
  }

  const handleToggle = async (id: string, current: boolean) => {
    await createClient().from("utility_services").update({ is_active: !current }).eq("id", id)
    setServices(prev => prev.map(s => s.id === id ? { ...s, is_active: !current } : s))
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este servicio?")) return
    await createClient().from("utility_services").delete().eq("id", id)
    setServices(prev => prev.filter(s => s.id !== id))
  }

  const set = (k: string, v: string | number) => setForm(p => ({ ...p, [k]: v }))

  const localityName = localities.find(l => l.id === selectedLocality)?.name ?? ""

  return (
    <div className="space-y-5">
      {/* Selector de localidad + botón agregar */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={selectedLocality}
          onChange={e => setSelectedLocality(e.target.value)}
          className="px-3 py-2 rounded-xl border border-stone-200 text-sm text-stone-800 bg-white outline-none focus:ring-2 focus:ring-[#A3B18A]/50"
        >
          {localities.length === 0 && <option value="">Cargando…</option>}
          {localities.map(l => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>
        <button
          onClick={openNew}
          disabled={!selectedLocality}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2D4530] text-white text-sm font-medium hover:bg-[#3a5a3e] transition-colors disabled:opacity-40"
        >
          <Plus size={14} />
          Nuevo servicio
        </button>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="space-y-2">
          {[1,2,3].map(i => <div key={i} className="bg-white rounded-xl h-14 animate-pulse border border-stone-200" />)}
        </div>
      ) : services.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
          <p className="text-sm text-stone-400">Sin servicios para {localityName}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          {services.map((s, i) => {
            const catLabel = CATEGORIES.find(c => c.value === s.category)?.label ?? s.category
            return (
              <div
                key={s.id}
                className={`flex items-center gap-3 px-5 py-3.5 ${!s.is_active ? "opacity-50" : ""} ${i !== services.length - 1 ? "border-b border-stone-100" : ""}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-stone-800">{s.name}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-500">{catLabel}</span>
                  </div>
                  {s.phone && <p className="text-xs text-stone-400 mt-0.5">{s.phone}</p>}
                </div>
                <button onClick={() => openEdit(s)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors">
                  <Pencil size={12} />
                </button>
                <button onClick={() => handleToggle(s.id, s.is_active)}>
                  {s.is_active
                    ? <ToggleRight size={20} className="text-[#A3B18A]" />
                    : <ToggleLeft size={20} className="text-stone-300" />}
                </button>
                <button onClick={() => handleDelete(s.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-stone-300 hover:text-red-400 transition-colors">
                  <Trash2 size={13} />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-3 shadow-xl">
            <h3 className="text-base font-medium text-stone-800 mb-1">
              {editing ? "Editar servicio" : `Nuevo servicio — ${localityName}`}
            </h3>

            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Nombre *</label>
              <input value={form.name} onChange={e => set("name", e.target.value)}
                placeholder="Ej: Hospital Municipal" className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-[#A3B18A]/50" />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Categoría</label>
              <select value={form.category} onChange={e => set("category", e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm bg-white outline-none focus:ring-2 focus:ring-[#A3B18A]/50">
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>

            {[
              { key: "phone", label: "Teléfono", placeholder: "351 123 4567" },
              { key: "address", label: "Dirección", placeholder: "Av. Principal 100" },
              { key: "description", label: "Descripción", placeholder: "Servicio de emergencias 24 h" },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs font-medium text-stone-600 mb-1">{f.label}</label>
                <input value={(form as any)[f.key]} onChange={e => set(f.key, e.target.value)}
                  placeholder={f.placeholder} className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-[#A3B18A]/50" />
              </div>
            ))}

            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-600 text-sm hover:bg-stone-50 transition-colors">Cancelar</button>
              <button onClick={handleSave} disabled={saving || !form.name}
                className="flex-1 py-2.5 rounded-xl bg-[#2D4530] text-white text-sm font-medium hover:bg-[#3a5a3e] transition-colors disabled:opacity-50">
                {saving ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
