"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Phone, MapPin, Clock, ToggleLeft, ToggleRight, Plus, Trash2, Pencil } from "lucide-react"
import { UsefulContact } from "@/types/database"
import AdminLocalidades from "./AdminLocalidades"
import AdminServiciosUtiles from "./AdminServiciosUtiles"
import AdminTransporte from "./AdminTransporte"

// ─── tab types ──────────────────────────────────────────────────────────────

type Tab = "contactos" | "localidades" | "servicios" | "transporte"

const TABS: { key: Tab; label: string }[] = [
  { key: "contactos",  label: "Contactos útiles" },
  { key: "localidades",label: "Localidades" },
  { key: "servicios",  label: "Servicios" },
  { key: "transporte", label: "Transporte" },
]

// ─── category labels ─────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  emergency:   "Emergencias",
  health:      "Salud",
  transport:   "Transporte",
  municipal:   "Municipal",
  security:    "Seguridad",
  utility:     "Servicios",
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

  useEffect(() => { fetchContacts() }, [])

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
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); fetchContacts() }}
        />
      )}
    </div>
  )
}

function ContactForm({ initial, onClose, onSaved }: { initial: UsefulContact | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    phone: initial?.phone ?? "",
    address: initial?.address ?? "",
    schedule: initial?.schedule ?? "",
    category: initial?.category ?? "other",
    sort_order: initial?.sort_order ?? 0,
  })
  const [saving, setSaving] = useState(false)
  const set = (k: string, v: string | number) => setForm(p => ({ ...p, [k]: v }))

  const handleSave = async () => {
    if (!form.title) return
    setSaving(true)
    const supabase = createClient()
    if (initial) {
      await supabase.from("useful_contacts").update({ ...form, updated_at: new Date().toISOString() }).eq("id", initial.id)
    } else {
      await supabase.from("useful_contacts").insert([{ ...form, is_active: true }])
    }
    setSaving(false)
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-3 shadow-xl">
        <h3 className="text-base font-medium text-stone-800">{initial ? "Editar contacto" : "Nuevo contacto"}</h3>
        {[
          { key: "title",    label: "Nombre *",   placeholder: "Ej: Hospital Municipal" },
          { key: "phone",    label: "Teléfono",   placeholder: "351 123 4567" },
          { key: "address",  label: "Dirección",  placeholder: "Av. Principal 100" },
          { key: "schedule", label: "Horario",    placeholder: "Lun–Vie 8–18 h" },
        ].map(({ key, label, placeholder }) => (
          <div key={key}>
            <label className="block text-xs font-medium text-stone-600 mb-1">{label}</label>
            <input value={(form as any)[key]} onChange={e => set(key, e.target.value)} placeholder={placeholder}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-[#A3B18A]/50" />
          </div>
        ))}
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">Categoría</label>
          <select value={form.category} onChange={e => set("category", e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm bg-white outline-none focus:ring-2 focus:ring-[#A3B18A]/50">
            {Object.entries(CATEGORY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div className="flex gap-3 pt-2">
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
  const [tab, setTab] = useState<Tab>("contactos")

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl text-stone-800 mb-1">Info Útil</h1>
        <p className="text-stone-500 text-sm">Contactos, localidades, servicios y horarios de transporte</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 p-1 rounded-2xl mb-6 w-fit" style={{ background: "rgba(45,69,48,0.07)" }}>
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

      {tab === "contactos"   && <ContactosPanel />}
      {tab === "localidades" && <AdminLocalidades />}
      {tab === "servicios"   && <AdminServiciosUtiles />}
      {tab === "transporte"  && <AdminTransporte />}
    </div>
  )
}
