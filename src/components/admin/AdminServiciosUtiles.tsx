"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Zap, Phone, X } from "lucide-react"
import type { Locality, UtilityService, ServicePhone } from "@/types/database"

const CATEGORIES = [
  { value: "emergency",  label: "Emergencias"        },
  { value: "health",     label: "Salud / Dispensario" },
  { value: "pharmacy",   label: "Farmacia"            },
  { value: "veterinary", label: "Veterinaria"         },
  { value: "municipal",  label: "Municipal"           },
  { value: "utility",    label: "Cooperativa"         },
  { value: "tourism",    label: "Turismo"             },
  { value: "security",   label: "Seguridad"           },
  { value: "transport",  label: "Transporte"          },
  { value: "other",      label: "Otros"               },
]

const DUTY_CATEGORIES   = new Set(["pharmacy", "veterinary"])
const HEALTH_CATEGORIES = new Set(["health"])

const EMPTY_PHONE: ServicePhone = { label: "", phone: "", is_whatsapp: false }

const EMPTY_FORM = {
  name: "", category: "other", address: "", description: "",
  hours: "", specialties: "", has_guardia: false, is_on_duty: false, sort_order: 0,
}

// ── Phones editor ─────────────────────────────────────────────────────────────

function PhonesEditor({ phones, onChange }: { phones: ServicePhone[]; onChange: (p: ServicePhone[]) => void }) {
  const add    = ()                                          => onChange([...phones, { ...EMPTY_PHONE }])
  const remove = (i: number)                                => onChange(phones.filter((_, idx) => idx !== i))
  const update = (i: number, key: keyof ServicePhone, val: string | boolean) =>
    onChange(phones.map((p, idx) => idx === i ? { ...p, [key]: val } : p))

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-medium text-stone-600">Teléfonos</label>
        <button
          type="button"
          onClick={add}
          className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg transition-colors hover:bg-stone-100"
          style={{ background: "rgba(45,69,48,0.07)", color: "#2D4530" }}
        >
          <Plus size={11} /> Agregar
        </button>
      </div>

      {phones.length === 0 && (
        <p className="text-xs text-stone-400 py-2">Sin teléfonos. Hacé clic en "Agregar".</p>
      )}

      <div className="space-y-2.5">
        {phones.map((ph, i) => (
          <div key={i} className="rounded-xl p-3 space-y-2" style={{ background: "rgba(45,69,48,0.04)", border: "1px solid rgba(45,69,48,0.10)" }}>
            {/* Label row */}
            <input
              value={ph.label}
              onChange={e => update(i, "label", e.target.value)}
              placeholder="Ej: Guardia Internet / Principal / Emergencias"
              className="w-full px-3 py-1.5 rounded-lg border border-stone-200 text-xs outline-none focus:ring-2 focus:ring-[#A3B18A]/50"
            />
            {/* Phone + WA + delete */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Phone size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                <input
                  value={ph.phone}
                  onChange={e => update(i, "phone", e.target.value)}
                  placeholder="03546-461300"
                  className="w-full pl-7 pr-3 py-2 rounded-lg border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-[#A3B18A]/50"
                />
              </div>

              {/* WhatsApp toggle */}
              <button
                type="button"
                onClick={() => update(i, "is_whatsapp", !ph.is_whatsapp)}
                title={ph.is_whatsapp ? "Tiene WhatsApp (clic para quitar)" : "Sin WhatsApp (clic para activar)"}
                className="flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs font-semibold transition-all flex-shrink-0"
                style={ph.is_whatsapp
                  ? { background: "#25D366", color: "white" }
                  : { background: "rgba(45,69,48,0.06)", color: "rgba(45,69,48,0.40)", border: "1px solid rgba(45,69,48,0.12)" }
                }
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.526 5.845L.057 23.545a.75.75 0 0 0 .921.921l5.701-1.469A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.695 9.695 0 0 1-4.964-1.366l-.355-.212-3.686.949.969-3.682-.231-.366A9.712 9.712 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z" />
                </svg>
                WA
              </button>

              <button
                type="button"
                onClick={() => remove(i)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-stone-300 hover:text-red-400 transition-colors flex-shrink-0"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function AdminServiciosUtiles() {
  const [localities, setLocalities]           = useState<Locality[]>([])
  const [selectedLocality, setSelectedLocality] = useState<string>("")
  const [services, setServices]               = useState<UtilityService[]>([])
  const [loading, setLoading]                 = useState(false)
  const [showForm, setShowForm]               = useState(false)
  const [editing, setEditing]                 = useState<UtilityService | null>(null)
  const [form, setForm]                       = useState(EMPTY_FORM)
  const [phones, setPhones]                   = useState<ServicePhone[]>([{ ...EMPTY_PHONE }])
  const [saving, setSaving]                   = useState(false)
  const [saveError, setSaveError]             = useState<string | null>(null)

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
      .then(({ data }) => { setServices(data || []); setLoading(false) })
  }, [selectedLocality])

  const openNew = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setPhones([{ ...EMPTY_PHONE }])
    setShowForm(true)
  }

  const openEdit = (s: UtilityService) => {
    setEditing(s)
    setForm({
      name:        s.name,
      category:    s.category,
      address:     s.address     || "",
      description: s.description || "",
      hours:       s.hours       || "",
      specialties: s.specialties || "",
      has_guardia: s.has_guardia ?? false,
      is_on_duty:  s.is_on_duty  ?? false,
      sort_order:  s.sort_order,
    })
    // Prefer phones[], fall back to phone/phone_2
    const existing: ServicePhone[] = s.phones?.length
      ? s.phones
      : [
          ...(s.phone   ? [{ label: "Principal", phone: s.phone,   is_whatsapp: false }] : []),
          ...(s.phone_2 ? [{ label: "Secundario", phone: s.phone_2, is_whatsapp: false }] : []),
        ]
    setPhones(existing.length ? existing : [{ ...EMPTY_PHONE }])
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.name || !selectedLocality) return
    setSaving(true)
    setSaveError(null)
    const cleanPhones = phones.filter(p => p.phone.trim())
    const payload = {
      name:        form.name,
      category:    form.category,
      address:     form.address     || null,
      description: form.description || null,
      hours:       form.hours       || null,
      specialties: form.specialties || null,
      has_guardia: form.has_guardia,
      is_on_duty:  form.is_on_duty,
      sort_order:  Number(form.sort_order) || 0,
      locality_id: selectedLocality,
      phones:      cleanPhones,
      phone:       cleanPhones[0]?.phone || null,
      phone_2:     cleanPhones[1]?.phone || null,
    }
    let error
    if (editing) {
      ;({ error } = await createClient().from("utility_services").update(payload).eq("id", editing.id))
    } else {
      ;({ error } = await createClient().from("utility_services").insert([{ ...payload, is_active: true }]))
    }
    setSaving(false)
    if (error) { setSaveError(error.message); return }
    setShowForm(false)
    setEditing(null)
    await refreshServices(selectedLocality)
  }

  const handleToggle = async (id: string, current: boolean) => {
    await createClient().from("utility_services").update({ is_active: !current }).eq("id", id)
    setServices(prev => prev.map(s => s.id === id ? { ...s, is_active: !current } : s))
  }

  const handleDuty = async (id: string, current: boolean) => {
    await createClient().from("utility_services").update({ is_on_duty: !current }).eq("id", id)
    await refreshServices(selectedLocality)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este servicio?")) return
    await createClient().from("utility_services").delete().eq("id", id)
    setServices(prev => prev.filter(s => s.id !== id))
  }

  const set = (k: string, v: string | number | boolean) => setForm(p => ({ ...p, [k]: v }))

  const localityName    = localities.find(l => l.id === selectedLocality)?.name ?? ""
  const isDutyCategory   = DUTY_CATEGORIES.has(form.category)
  const isHealthCategory = HEALTH_CATEGORIES.has(form.category)

  return (
    <div className="space-y-5">
      {/* Locality selector + new button */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={selectedLocality}
          onChange={e => setSelectedLocality(e.target.value)}
          className="px-3 py-2 rounded-xl border border-stone-200 text-sm text-stone-800 bg-white outline-none focus:ring-2 focus:ring-[#A3B18A]/50"
        >
          {localities.length === 0 && <option value="">Cargando…</option>}
          {localities.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
        <button
          onClick={openNew}
          disabled={!selectedLocality}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2D4530] text-white text-sm font-medium hover:bg-[#3a5a3e] transition-colors disabled:opacity-40"
        >
          <Plus size={14} /> Nuevo servicio
        </button>
      </div>

      {/* Service list */}
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
            const isDuty   = DUTY_CATEGORIES.has(s.category)
            const phoneCount = s.phones?.length || (s.phone ? 1 : 0) + (s.phone_2 ? 1 : 0)
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
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: "rgba(234,179,8,0.15)", color: "#854d0e" }}>
                        ⚡ De turno
                      </span>
                    )}
                  </div>
                  <div className="flex gap-3 mt-0.5 flex-wrap">
                    {phoneCount > 0 && (
                      <p className="text-xs text-stone-400">{phoneCount} teléfono{phoneCount !== 1 ? "s" : ""}</p>
                    )}
                    {s.hours && <p className="text-xs text-stone-400">🕐 {s.hours}</p>}
                  </div>
                </div>

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
                  {s.is_active ? <ToggleRight size={20} className="text-[#A3B18A]" /> : <ToggleLeft size={20} className="text-stone-300" />}
                </button>
                <button onClick={() => handleDelete(s.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-stone-300 hover:text-red-400 transition-colors">
                  <Trash2 size={13} />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl max-h-[92vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 pt-5 pb-3 border-b border-stone-100 z-10">
              <h3 className="text-base font-semibold text-stone-800">
                {editing ? "Editar servicio" : "Nuevo servicio"}
              </h3>
            </div>

            <div className="px-6 py-4 space-y-4">
              {/* Localidad */}
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Localidad *</label>
                <select value={selectedLocality} onChange={e => setSelectedLocality(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm bg-white outline-none focus:ring-2 focus:ring-[#A3B18A]/50">
                  {localities.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>

              {/* Subcategoría */}
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Subcategoría *</label>
                <select value={form.category} onChange={e => set("category", e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm bg-white outline-none focus:ring-2 focus:ring-[#A3B18A]/50">
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>

              {/* Nombre */}
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Nombre *</label>
                <input value={form.name} onChange={e => set("name", e.target.value)}
                  placeholder="Ej: Cooperativa de Agua / Dispensario Municipal"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-[#A3B18A]/50" />
              </div>

              {/* Horario */}
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Horario</label>
                <input value={form.hours} onChange={e => set("hours", e.target.value)}
                  placeholder="Lun–Vie 8–20 h · Guardia: 24 h"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-[#A3B18A]/50" />
              </div>

              {/* Dirección */}
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Dirección</label>
                <input value={form.address} onChange={e => set("address", e.target.value)}
                  placeholder="Av. Principal 100"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-[#A3B18A]/50" />
              </div>

              {/* Teléfonos */}
              <PhonesEditor phones={phones} onChange={setPhones} />

              {/* Notas / Especialidades */}
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">
                  {isHealthCategory ? "Especialidades / Comentarios" : "Notas / Comentarios"}
                </label>
                <textarea
                  value={form.specialties}
                  onChange={e => set("specialties", e.target.value)}
                  placeholder={isHealthCategory
                    ? "Clínica General, Pediatría… / Atención: lunes y miércoles"
                    : "Info adicional, aclaraciones, áreas de atención…"
                  }
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-[#A3B18A]/50 resize-none"
                />
              </div>

              {/* Guardia checkbox (salud) */}
              {isHealthCategory && (
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox" checked={form.has_guardia} onChange={e => set("has_guardia", e.target.checked)}
                    className="w-4 h-4 rounded accent-[#2D4530]" />
                  <span className="text-sm text-stone-700">Tiene guardia / emergencias</span>
                </label>
              )}

              {/* De turno (farmacia / veterinaria) */}
              {isDutyCategory && (
                <label className="flex items-center gap-2.5 cursor-pointer rounded-xl p-2.5"
                  style={{ background: form.is_on_duty ? "rgba(234,179,8,0.10)" : "rgba(45,69,48,0.04)", border: "1px solid", borderColor: form.is_on_duty ? "rgba(234,179,8,0.3)" : "rgba(45,69,48,0.1)" }}>
                  <input type="checkbox" checked={form.is_on_duty} onChange={e => set("is_on_duty", e.target.checked)}
                    className="w-4 h-4 rounded accent-[#2D4530]" />
                  <div>
                    <span className="text-sm font-medium text-stone-700">⚡ De turno ahora</span>
                    <p className="text-xs text-stone-400 mt-0.5">Al guardar, las demás se desactivan automáticamente</p>
                  </div>
                </label>
              )}

              {saveError && (
                <div className="px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                  Error al guardar: {saveError}
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-stone-100 flex gap-3">
              <button
                onClick={() => { setShowForm(false); setSaveError(null) }}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-600 text-sm hover:bg-stone-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name || !selectedLocality}
                className="flex-1 py-2.5 rounded-xl bg-[#2D4530] text-white text-sm font-medium hover:bg-[#3a5a3e] transition-colors disabled:opacity-50"
              >
                {saving ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
