"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Phone, MapPin, Clock, ToggleLeft, ToggleRight, Plus, Trash2, Pencil, X } from "lucide-react"
import type { UsefulContact, ServicePhone } from "@/types/database"
import AdminLocalidades from "./AdminLocalidades"
import AdminServiciosUtiles from "./AdminServiciosUtiles"
import AdminTransporte from "./AdminTransporte"

// ─── tab types ──────────────────────────────────────────────────────────────

type Tab = "contactos" | "localidades" | "servicios" | "transporte"

const TABS: { key: Tab; label: string; desc: string }[] = [
  { key: "servicios",   label: "Servicios",          desc: "Cooperativas, salud, farmacias y más — organizados por localidad" },
  { key: "contactos",   label: "Contactos generales", desc: "Contactos que aparecen para todos los pueblos (sin filtro de localidad)" },
  { key: "transporte",  label: "Transporte",          desc: "Horarios de micros y traslados" },
  { key: "localidades", label: "Localidades",         desc: "Administrar la lista de pueblos del valle" },
]

// ─── category labels ─────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  emergency:   "Emergencias",
  health:      "Salud / Dispensario",
  pharmacy:    "Farmacia",
  veterinary:  "Veterinaria",
  municipal:   "Municipal",
  utility:     "Cooperativa",
  tourism:     "Turismo",
  security:    "Seguridad",
  transport:   "Transporte",
  other:       "Otros",
}

// ─── Contactos útiles (existing useful_contacts table) ───────────────────────

function ContactosBadge({ cat }: { cat: string }) {
  return (
    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-stone-100 text-stone-500">
      {CATEGORY_LABELS[cat] ?? cat}
    </span>
  )
}

function ContactosPanel() {
  const [contacts, setContacts] = useState<UsefulContact[]>([])
  const [localities, setLocalities] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<UsefulContact | null>(null)

  const fetchContacts = async () => {
    const { data } = await createClient()
      .from("useful_contacts")
      .select("*")
      .order("sort_order", { ascending: true })
    setContacts(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchContacts()
    createClient().from("localities").select("id, name").order("sort_order").then(({ data }) => setLocalities(data || []))
  }, [])

  const handleToggle = async (id: string, current: boolean) => {
    await createClient().from("useful_contacts").update({ is_active: !current }).eq("id", id)
    setContacts(prev => prev.map(c => c.id === id ? { ...c, is_active: !current } : c))
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este contacto?")) return
    await createClient().from("useful_contacts").delete().eq("id", id)
    setContacts(prev => prev.filter(c => c.id !== id))
  }

  const categories = [...new Set(contacts.map(c => c.category))]
  const filtered = filter ? contacts.filter(c => c.category === filter) : contacts

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter("")}
            className={`px-3 py-1.5 rounded-xl text-xs border transition-colors ${filter === "" ? "bg-[#2D4530] text-white border-[#2D4530]" : "bg-white text-stone-600 border-stone-200 hover:border-stone-300"}`}
          >
            Todos
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs border transition-colors ${filter === cat ? "bg-[#2D4530] text-white border-[#2D4530]" : "bg-white text-stone-600 border-stone-200 hover:border-stone-300"}`}
            >
              {CATEGORY_LABELS[cat] ?? cat}
            </button>
          ))}
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true) }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2D4530] text-white text-sm font-medium hover:bg-[#3a5a3e] transition-colors"
        >
          <Plus size={14} />
          Nuevo
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1,2,3].map(i => <div key={i} className="bg-white rounded-xl h-14 animate-pulse border border-stone-200" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
          <Phone size={24} className="text-stone-300 mx-auto mb-2" />
          <p className="text-sm text-stone-400">Sin contactos</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          {filtered.map((contact, i) => (
            <div
              key={contact.id}
              className={`flex items-center gap-3 px-5 py-3.5 ${i !== filtered.length - 1 ? "border-b border-stone-100" : ""} ${!contact.is_active ? "opacity-50" : ""}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium text-stone-800">{contact.title}</p>
                  <ContactosBadge cat={contact.category} />
                  {contact.locality_id
                    ? <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-600">{localities.find(l => l.id === contact.locality_id)?.name ?? "Localidad"}</span>
                    : <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-stone-100 text-stone-400">Global</span>
                  }
                </div>
                <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                  {contact.phone && <span className="flex items-center gap-1 text-xs text-stone-400"><Phone size={10} />{contact.phone}</span>}
                  {contact.address && <span className="flex items-center gap-1 text-xs text-stone-400"><MapPin size={10} />{contact.address}</span>}
                  {contact.schedule && <span className="flex items-center gap-1 text-xs text-stone-400"><Clock size={10} />{contact.schedule}</span>}
                </div>
              </div>
              <button onClick={() => { setEditing(contact); setShowForm(true) }} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-stone-100 text-stone-300 hover:text-stone-500 transition-colors">
                <Pencil size={13} />
              </button>
              <button onClick={() => handleToggle(contact.id, contact.is_active)}>
                {contact.is_active
                  ? <ToggleRight size={20} className="text-[#A3B18A]" />
                  : <ToggleLeft size={20} className="text-stone-300" />}
              </button>
              <button onClick={() => handleDelete(contact.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-stone-300 hover:text-red-400 transition-colors">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <ContactForm
          initial={editing}
          localities={localities}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); fetchContacts() }}
        />
      )}
    </div>
  )
}

function ContactForm({ initial, localities, onClose, onSaved }: { initial: UsefulContact | null; localities: { id: string; name: string }[]; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    title:       initial?.title       ?? "",
    description: initial?.description ?? "",
    address:     initial?.address     ?? "",
    schedule:    initial?.schedule    ?? "",
    category:    initial?.category    ?? "other",
    locality_id: initial?.locality_id ?? "",
    sort_order:  initial?.sort_order  ?? 0,
  })
  const [phones, setPhones] = useState<ServicePhone[]>(() => {
    if (initial?.phones?.length) return initial.phones
    return [
      ...(initial?.phone   ? [{ label: "Principal",  phone: initial.phone,   is_whatsapp: false }] : [{ label: "", phone: "", is_whatsapp: false }]),
      ...(initial?.phone_2 ? [{ label: "Secundario", phone: initial.phone_2, is_whatsapp: false }] : []),
    ]
  })
  const [saving, setSaving]       = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const set = (k: string, v: string | number) => setForm(p => ({ ...p, [k]: v }))

  const addPhone    = ()                                          => setPhones(p => [...p, { label: "", phone: "", is_whatsapp: false }])
  const removePhone = (i: number)                                => setPhones(p => p.filter((_, idx) => idx !== i))
  const updatePhone = (i: number, key: keyof ServicePhone, val: string | boolean) =>
    setPhones(p => p.map((ph, idx) => idx === i ? { ...ph, [key]: val } : ph))

  const handleSave = async () => {
    if (!form.title) return
    setSaving(true)
    setSaveError(null)
    const cleanPhones = phones.filter(p => p.phone.trim())
    const payload = {
      ...form,
      locality_id: form.locality_id || null,
      phones:      cleanPhones,
      phone:       cleanPhones[0]?.phone || null,
      phone_2:     cleanPhones[1]?.phone || null,
    }
    const supabase = createClient()
    let error
    if (initial) {
      ;({ error } = await supabase.from("useful_contacts").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", initial.id))
    } else {
      ;({ error } = await supabase.from("useful_contacts").insert([{ ...payload, is_active: true }]))
    }
    setSaving(false)
    if (error) { setSaveError(error.message); return }
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-6 pt-5 pb-3 border-b border-stone-100">
          <h3 className="text-base font-semibold text-stone-800">{initial ? "Editar contacto" : "Nuevo contacto"}</h3>
        </div>

        <div className="px-6 py-4 space-y-4">
          {/* Categoría + Localidad */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Subcategoría *</label>
              <select value={form.category} onChange={e => set("category", e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm bg-white outline-none focus:ring-2 focus:ring-[#A3B18A]/50">
                {Object.entries(CATEGORY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Localidad</label>
              <select value={form.locality_id} onChange={e => set("locality_id", e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm bg-white outline-none focus:ring-2 focus:ring-[#A3B18A]/50">
                <option value="">Global (todos)</option>
                {localities.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Nombre *</label>
            <input value={form.title} onChange={e => set("title", e.target.value)} placeholder="Ej: Hospital Municipal"
              className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-[#A3B18A]/50" />
          </div>

          {/* Horario */}
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Horario</label>
            <input value={form.schedule} onChange={e => set("schedule", e.target.value)} placeholder="Lun–Vie 8–18 h"
              className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-[#A3B18A]/50" />
          </div>

          {/* Dirección */}
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Dirección</label>
            <input value={form.address} onChange={e => set("address", e.target.value)} placeholder="Av. Principal 100"
              className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-[#A3B18A]/50" />
          </div>

          {/* Teléfonos */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-stone-600">Teléfonos</label>
              <button type="button" onClick={addPhone}
                className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg transition-colors hover:bg-stone-100"
                style={{ background: "rgba(45,69,48,0.07)", color: "#2D4530" }}>
                <Plus size={11} /> Agregar
              </button>
            </div>
            {phones.length === 0 && (
              <p className="text-xs text-stone-400 py-1">Sin teléfonos. Hacé clic en "Agregar".</p>
            )}
            <div className="space-y-2.5">
              {phones.map((ph, i) => (
                <div key={i} className="rounded-xl p-3 space-y-2" style={{ background: "rgba(45,69,48,0.04)", border: "1px solid rgba(45,69,48,0.10)" }}>
                  <input
                    value={ph.label}
                    onChange={e => updatePhone(i, "label", e.target.value)}
                    placeholder="Ej: Principal / Guardia / Urgencias"
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-200 text-xs outline-none focus:ring-2 focus:ring-[#A3B18A]/50"
                  />
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Phone size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                      <input
                        value={ph.phone}
                        onChange={e => updatePhone(i, "phone", e.target.value)}
                        placeholder="03546-461300"
                        className="w-full pl-7 pr-3 py-2 rounded-lg border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-[#A3B18A]/50"
                      />
                    </div>
                    <button type="button" onClick={() => updatePhone(i, "is_whatsapp", !ph.is_whatsapp)}
                      title="¿Tiene WhatsApp?"
                      className="flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs font-semibold transition-all flex-shrink-0"
                      style={ph.is_whatsapp
                        ? { background: "#25D366", color: "white" }
                        : { background: "rgba(45,69,48,0.06)", color: "rgba(45,69,48,0.40)", border: "1px solid rgba(45,69,48,0.12)" }
                      }>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.526 5.845L.057 23.545a.75.75 0 0 0 .921.921l5.701-1.469A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.695 9.695 0 0 1-4.964-1.366l-.355-.212-3.686.949.969-3.682-.231-.366A9.712 9.712 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z" />
                      </svg>
                      WA
                    </button>
                    <button type="button" onClick={() => removePhone(i)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-stone-300 hover:text-red-400 transition-colors flex-shrink-0">
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Notas / Comentarios</label>
            <textarea value={form.description} onChange={e => set("description", e.target.value)}
              placeholder="Info adicional, aclaraciones, áreas de atención…"
              rows={3}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-[#A3B18A]/50 resize-none" />
          </div>

          {saveError && (
            <div className="px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
              Error al guardar: {saveError}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-stone-100 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-600 text-sm hover:bg-stone-50 transition-colors">Cancelar</button>
          <button onClick={handleSave} disabled={saving || !form.title}
            className="flex-1 py-2.5 rounded-xl bg-[#2D4530] text-white text-sm font-medium hover:bg-[#3a5a3e] transition-colors disabled:opacity-50">
            {saving ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main export ─────────────────────────────────────────────────────────────

export default function AdminInfoUtil() {
  const [tab, setTab] = useState<Tab>("servicios")

  const activeTab = TABS.find(t => t.key === tab)!

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl text-stone-800 mb-1">Info Útil</h1>
        <p className="text-stone-500 text-sm">Gestión de servicios y contactos del Valle de Calamuchita</p>
      </div>

      {/* Tab bar */}
      <div className="flex flex-wrap gap-1 p-1 rounded-2xl mb-2 w-fit" style={{ background: "rgba(45,69,48,0.07)" }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={
              tab === t.key
                ? { background: "#2D4530", color: "white" }
                : { color: "rgba(45,69,48,0.6)" }
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Descripción del tab activo */}
      <p className="text-xs mb-6" style={{ color: "rgba(45,69,48,0.45)" }}>
        {activeTab.desc}
      </p>

      {tab === "contactos"   && <ContactosPanel />}
      {tab === "localidades" && <AdminLocalidades />}
      {tab === "servicios"   && <AdminServiciosUtiles />}
      {tab === "transporte"  && <AdminTransporte />}
    </div>
  )
}
