"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Zap } from "lucide-react"
import { Locality, UtilityService } from "@/types/database"

const CATEGORIES = [
  { value: "emergency",  label: "Emergencias" },
  { value: "health",     label: "Salud / Dispensario" },
  { value: "pharmacy",   label: "Farmacia" },
  { value: "veterinary", label: "Veterinaria" },
  { value: "municipal",  label: "Municipal" },
  { value: "utility",    label: "Cooperativa" },
  { value: "tourism",    label: "Turismo" },
  { value: "security",   label: "Seguridad" },
  { value: "transport",  label: "Transporte" },
  { value: "other",      label: "Otros" },
]

const DUTY_CATEGORIES = new Set(["pharmacy", "veterinary"])
const HEALTH_CATEGORIES = new Set(["health"])

const EMPTY_FORM = {
  name: "", category: "other", phone: "", address: "",
  description: "", hours: "", specialties: "",
  has_guardia: false, is_on_duty: false, sort_order: 0,
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

  const refreshServices = async (localityId: string) => {
    const { data } = await createClient()
      .from("utility_services")
      .select("*")
      .eq("locality_id", localityId)
      .order("sort_order")
    setServices(data || [])
  }

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
      name:        s.name,
      category:    s.category,
      phone:       s.phone       || "",
      address:     s.address     || "",
      description: s.description || "",
      hours:       s.hours       || "",
      specialties: s.specialties || "",
      has_guardia: s.has_guardia ?? false,
      is_on_duty:  s.is_on_duty  ?? false,
      sort_order:  s.sort_order,
    })
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.name || !selectedLocality) return
    setSaving(true)
    const payload = {
      name:        form.name,
      category:    form.category,
      phone:       form.phone       || null,
      address:     form.address     || null,
      description: form.description || null,
      hours:       form.hours       || null,
      specialties: form.specialties || null,
      has_guardia: form.has_guardia,
      is_on_duty:  form.is_on_duty,
      sort_order:  Number(form.sort_order) || 0,
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
    await refreshServices(selectedLocality)
  }

  const handleToggle = async (id: string, current: boolean) => {
    await createClient().from("utility_services").update({ is_active: !current }).eq("id", id)
    setServices(prev => prev.map(s => s.id === id ? { ...s, is_active: !current } : s))
  }

  // Toggle "de turno" — el trigger en Supabase desactiva las demás de la misma cat+localidad
  const handleDuty = async (id: string, current: boolean) => {
    await createClient().from("utility_services").update({ is_on_duty: !current }).eq("id", id)
    await refreshServices(selectedLocality)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este servicio?")) return
    await createClient().from("utility_services").delete().eq("id", id)
    setServices(prev => prev.filter(s => s.id !== id))
  }

  const set = (k: string, v: string | number | boolean) =>
    setForm(p => ({ ...p, [k]: v }))

  const localityName = localities.find(l => l.id === selectedLocality)?.name ?? ""
  const isDutyCategory  = DUTY_CATEGORIES.has(form.category)
  const isHealthCategory = HEALTH_CATEGORIES.has(form.category)

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
            const isDuty = DUTY_CATEGORIES.has(s.category)
            return (
              <div
                key={s.id}
                className={`flex items-center gap-3 px-5 py-3.5 ${!s.is_active ? "opacity-50" : ""} ${i !== services.length - 1 ? "border-b border-stone-100" : ""}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-stone-800">{s.name}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-500">{catLabel}</span>
                    {isDuty && s.is_on_duty && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: "rgba(234,179,8,0.15)", color: "#854d0e" }}>
                        ⚡ De turno
                      </span>
                    )}
                  </div>
                  <div className="flex gap-3 mt-0.5 flex-wrap">
                    {s.phone   && <p className="text-xs text-stone-400">{s.phone}</p>}
                    {s.hours   && <p className="text-xs text-stone-400">🕐 {s.hours}</p>}
                  </div>
                </div>

                {/* Toggle "de turno" solo para farmacia/veterinaria */}
                {isDuty && (
                  <button
                    onClick={() => handleDuty(s.id, s.is_on_duty)}
                    title={s.is_on_duty ? "Quitar turno" : "Marcar de turno"}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors"
                    style={s.is_on_duty
                      ? { background: "rgba(234,179,8,0.18)", color: "#854d0e", border: "1px solid rgba(234,179,8,0.3)" }
                      : { background: "rgba(45,69,48,0.06)", color: "rgba(45,69,48,0.5)", border: "1px solid rgba(45,69,48,0.12)" }
                    }
                  >
                    <Zap size={11} />
                    {s.is_on_duty ? "Turno" : "Sin turno"}
                  </button>
                )}

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
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-3 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-medium text-stone-800 mb-1">
              {editing ? "Editar servicio" : `Nuevo servicio — ${localityName}`}
            </h3>

            {/* Nombre */}
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Nombre *</label>
              <input value={form.name} onChange={e => set("name", e.target.value)}
                placeholder="Ej: Farmacia del Centro"
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-[#A3B18A]/50" />
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Categoría</label>
              <select value={form.category} onChange={e => set("category", e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm bg-white outline-none focus:ring-2 focus:ring-[#A3B18A]/50">
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>

            {/* Campos comunes */}
            {[
              { key: "phone",       label: "Teléfono",   placeholder: "351 123 4567" },
              { key: "address",     label: "Dirección",  placeholder: "Av. Principal 100" },
              { key: "hours",       label: "Horario",    placeholder: "Lun–Vie 8–20 h / Sáb 9–13 h" },
              { key: "description", label: "Descripción", placeholder: "Info adicional" },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs font-medium text-stone-600 mb-1">{f.label}</label>
                <input value={(form as any)[f.key]} onChange={e => set(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-[#A3B18A]/50" />
              </div>
            ))}

            {/* Especialidades — solo Salud/Dispensario */}
            {isHealthCategory && (
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Especialidades</label>
                <input value={form.specialties} onChange={e => set("specialties", e.target.value)}
                  placeholder="Clínica, Pediatría, Odontología…"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-[#A3B18A]/50" />
              </div>
            )}

            {/* Checkboxes condicionales */}
            {isHealthCategory && (
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={form.has_guardia}
                  onChange={e => set("has_guardia", e.target.checked)}
                  className="w-4 h-4 rounded accent-[#2D4530]" />
                <span className="text-sm text-stone-700">Tiene guardia / emergencias</span>
              </label>
            )}

            {isDutyCategory && (
              <label className="flex items-center gap-2.5 cursor-pointer rounded-xl p-2.5"
                style={{ background: form.is_on_duty ? "rgba(234,179,8,0.10)" : "rgba(45,69,48,0.04)", border: "1px solid", borderColor: form.is_on_duty ? "rgba(234,179,8,0.3)" : "rgba(45,69,48,0.1)" }}>
                <input type="checkbox" checked={form.is_on_duty}
                  onChange={e => set("is_on_duty", e.target.checked)}
                  className="w-4 h-4 rounded accent-[#2D4530]" />
                <div>
                  <span className="text-sm font-medium text-stone-700">⚡ De turno ahora</span>
                  <p className="text-xs text-stone-400 mt-0.5">Al guardar, las demás se desactivan automáticamente</p>
                </div>
              </label>
            )}

            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-600 text-sm hover:bg-stone-50 transition-colors">
                Cancelar
              </button>
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
