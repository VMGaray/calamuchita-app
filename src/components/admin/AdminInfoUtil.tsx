"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Phone, MapPin, Clock, ToggleLeft, ToggleRight, Plus, Pencil, Trash2 } from "lucide-react"
import { UsefulContact } from "@/types/database"

const CATEGORY_LABELS: Record<string, string> = {
  emergency:   "Emergencias",
  health:      "Salud",
  transport:   "Transporte",
  municipal:   "Municipal",
  security:    "Seguridad",
  utility:     "Servicios",
  other:       "Otros",
}

function CategoryBadge({ cat }: { cat: string }) {
  return (
    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-stone-100 text-stone-500">
      {CATEGORY_LABELS[cat] ?? cat}
    </span>
  )
}

export default function AdminInfoUtil() {
  const [contacts, setContacts] = useState<UsefulContact[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("")
  const [editing, setEditing] = useState<UsefulContact | null>(null)
  const [showForm, setShowForm] = useState(false)

  const fetchContacts = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("useful_contacts")
      .select("*")
      .order("sort_order", { ascending: true })
    setContacts(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchContacts() }, [])

  const handleToggle = async (id: string, current: boolean) => {
    const supabase = createClient()
    await supabase.from("useful_contacts").update({ is_active: !current }).eq("id", id)
    setContacts(prev => prev.map(c => c.id === id ? { ...c, is_active: !current } : c))
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este contacto?")) return
    const supabase = createClient()
    await supabase.from("useful_contacts").delete().eq("id", id)
    setContacts(prev => prev.filter(c => c.id !== id))
  }

  const categories = [...new Set(contacts.map(c => c.category))]
  const filtered = filter ? contacts.filter(c => c.category === filter) : contacts

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl text-stone-800 mb-1">Info Útil</h1>
          <p className="text-stone-500">{contacts.length} contactos · {contacts.filter(c => c.is_active).length} activos</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true) }}
          className="flex items-center gap-2 bg-[#2D4530] hover:bg-[#3a5a3e] text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          <Plus size={15} />
          Nuevo contacto
        </button>
      </div>

      {/* Filtros por categoría */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setFilter("")}
          className={`px-3 py-1.5 rounded-xl text-xs border transition-colors ${
            filter === "" ? "bg-[#2D4530] text-white border-[#2D4530]" : "bg-white text-stone-600 border-stone-200 hover:border-stone-300"
          }`}
        >
          Todos
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs border transition-colors ${
              filter === cat ? "bg-[#2D4530] text-white border-[#2D4530]" : "bg-white text-stone-600 border-stone-200 hover:border-stone-300"
            }`}
          >
            {CATEGORY_LABELS[cat] ?? cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl border border-stone-200 p-4 animate-pulse h-16" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-16 text-center">
          <Phone size={28} className="text-stone-300 mx-auto mb-3" />
          <p className="text-stone-400 text-sm">No hay contactos registrados</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          {filtered.map((contact, i) => (
            <div
              key={contact.id}
              className={`flex items-center gap-4 px-5 py-3.5 ${i !== filtered.length - 1 ? "border-b border-stone-100" : ""} ${!contact.is_active ? "opacity-50" : ""}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium text-stone-800">{contact.title}</p>
                  <CategoryBadge cat={contact.category} />
                </div>
                <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                  {contact.phone && (
                    <span className="flex items-center gap-1 text-xs text-stone-400">
                      <Phone size={10} />
                      {contact.phone}
                    </span>
                  )}
                  {contact.address && (
                    <span className="flex items-center gap-1 text-xs text-stone-400">
                      <MapPin size={10} />
                      {contact.address}
                    </span>
                  )}
                  {contact.schedule && (
                    <span className="flex items-center gap-1 text-xs text-stone-400">
                      <Clock size={10} />
                      {contact.schedule}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => handleToggle(contact.id, contact.is_active)}
                  className="w-8 h-8 flex items-center justify-center"
                >
                  {contact.is_active
                    ? <ToggleRight size={20} className="text-[#A3B18A]" />
                    : <ToggleLeft size={20} className="text-stone-300" />}
                </button>
                <button
                  onClick={() => handleDelete(contact.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-red-50 text-stone-300 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
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

/* ── Formulario inline ── */
function ContactForm({
  initial,
  onClose,
  onSaved,
}: {
  initial: UsefulContact | null
  onClose: () => void
  onSaved: () => void
}) {
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
      <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl">
        <h3 className="text-base font-medium text-stone-800">
          {initial ? "Editar contacto" : "Nuevo contacto"}
        </h3>

        {[
          { key: "title", label: "Nombre *", placeholder: "Ej: Hospital Municipal" },
          { key: "phone", label: "Teléfono", placeholder: "351 123 4567" },
          { key: "address", label: "Dirección", placeholder: "Av. Principal 100" },
          { key: "schedule", label: "Horario", placeholder: "Lun–Vie 8–18 h" },
        ].map(({ key, label, placeholder }) => (
          <div key={key}>
            <label className="block text-xs font-medium text-stone-600 mb-1">{label}</label>
            <input
              value={(form as any)[key]}
              onChange={e => set(key, e.target.value)}
              placeholder={placeholder}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm text-stone-800 outline-none focus:ring-2 focus:ring-[#A3B18A]/50"
            />
          </div>
        ))}

        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">Categoría</label>
          <select
            value={form.category}
            onChange={e => set("category", e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm text-stone-800 bg-white outline-none focus:ring-2 focus:ring-[#A3B18A]/50"
          >
            {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-600 text-sm hover:bg-stone-50 transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !form.title}
            className="flex-1 py-2.5 rounded-xl bg-[#2D4530] text-white text-sm font-medium hover:bg-[#3a5a3e] transition-colors disabled:opacity-50"
          >
            {saving ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  )
}
