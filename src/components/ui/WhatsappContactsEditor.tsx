"use client"

import { Plus, X } from "lucide-react"
import { MAX_WHATSAPP_CONTACTS, type WhatsappContact } from "@/lib/whatsapp"

interface Props {
  value: WhatsappContact[]
  onChange: (value: WhatsappContact[]) => void
}

const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none focus:ring-2 focus:ring-primary-300"

// Lista de WhatsApp del negocio. El primero es el principal; si hay más de uno,
// el nombre se muestra debajo de cada botón en el perfil público.
export default function WhatsappContactsEditor({ value, onChange }: Props) {
  const rows = value.length ? value : [{ name: "", phone: "" }]

  const update = (i: number, field: keyof WhatsappContact, v: string) =>
    onChange(rows.map((r, idx) => (idx === i ? { ...r, [field]: v } : r)))

  const remove = (i: number) => {
    const next = rows.filter((_, idx) => idx !== i)
    onChange(next.length ? next : [{ name: "", phone: "" }])
  }

  return (
    <div>
      <label className="block text-sm font-medium text-stone-700 mb-1">WhatsApp</label>
      <div className="space-y-2">
        {rows.map((r, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input type="tel" value={r.phone} onChange={(e) => update(i, "phone", e.target.value)}
              placeholder="3546 123456" className={inputClass} />
            <input type="text" value={r.name} onChange={(e) => update(i, "name", e.target.value)}
              placeholder="Nombre (ej: Juan)" className={inputClass} />
            {(rows.length > 1 || r.phone || r.name) && (
              <button type="button" onClick={() => remove(i)} title="Quitar"
                className="shrink-0 p-2 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                <X size={16} />
              </button>
            )}
          </div>
        ))}
      </div>
      {rows.length < MAX_WHATSAPP_CONTACTS && (
        <button type="button" onClick={() => onChange([...rows, { name: "", phone: "" }])}
          className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary-700 hover:underline">
          <Plus size={14} /> Agregar otro WhatsApp
        </button>
      )}
      <p className="text-xs text-stone-400 mt-1">
        Si cargás más de uno, el nombre aparece debajo de cada botón de WhatsApp.
      </p>
    </div>
  )
}
