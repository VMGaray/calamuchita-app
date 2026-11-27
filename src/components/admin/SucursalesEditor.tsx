"use client"

import { EMPTY_BRANCH, type Branch } from "@/lib/branches"

const inputClass =
  "w-full px-3 py-2 rounded-lg border border-stone-200 text-stone-800 text-sm outline-none focus:ring-2 focus:ring-primary-300 bg-white"

export default function SucursalesEditor({ value, onChange, pueblos }: {
  value: Branch[]
  onChange: (branches: Branch[]) => void
  pueblos: string[]
}) {
  const update = (i: number, field: keyof Branch, v: string) =>
    onChange(value.map((b, idx) => (idx === i ? { ...b, [field]: v } : b)))

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-stone-700">
          Sucursales <span className="text-stone-400 font-normal">(domicilios adicionales)</span>
        </label>
        <button
          type="button"
          onClick={() => onChange([...value, { ...EMPTY_BRANCH }])}
          className="text-xs font-medium px-3 py-1.5 rounded-xl border border-primary-300 text-primary-600 hover:bg-primary-50 transition-colors"
        >
          + Agregar sucursal
        </button>
      </div>
      {value.length === 0 && (
        <p className="text-xs text-stone-400">Sin sucursales — una sola dirección.</p>
      )}
      <div className="space-y-3">
        {value.map((branch, i) => (
          <div key={i} className="p-3 rounded-xl border border-stone-200 bg-stone-50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-600">Sucursal {i + 1}</span>
              <button
                type="button"
                onClick={() => onChange(value.filter((_, idx) => idx !== i))}
                className="text-xs text-red-400 hover:text-red-500"
              >
                Eliminar
              </button>
            </div>
            <select value={branch.pueblo} onChange={(e) => update(i, "pueblo", e.target.value)} className={inputClass}>
              <option value="">Seleccioná un pueblo</option>
              {pueblos.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <input type="text" value={branch.address} onChange={(e) => update(i, "address", e.target.value)}
              placeholder="Calle y número" className={inputClass} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input type="tel" value={branch.phone ?? ""} onChange={(e) => update(i, "phone", e.target.value)}
                placeholder="Teléfono" className={inputClass} />
              <input type="tel" value={branch.whatsapp ?? ""} onChange={(e) => update(i, "whatsapp", e.target.value)}
                placeholder="WhatsApp (ej: 3546 123456)" className={inputClass} />
            </div>
            <textarea value={branch.hours ?? ""} onChange={(e) => update(i, "hours", e.target.value)}
              rows={2} placeholder={"Horario (ej: Lun a Vie 9 a 13 y 17 a 21 · Sáb 9 a 13)"}
              className={`${inputClass} resize-y`} />
          </div>
        ))}
      </div>
    </div>
  )
}
