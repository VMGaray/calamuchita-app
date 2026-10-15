"use client"

import { useState } from "react"
import { Percent, DollarSign, Type } from "lucide-react"
import { hoyAR } from "@/lib/utils/fechas"
import type { DiscountKind, Promotion } from "@/types/database"

// Formulario de una promo. Lo usa el admin (con selector de negocio) y queda listo para el
// panel del comercio: sin `businesses`, el negocio es fijo (initial.business_id).

export interface PromoFormValues {
  title: string
  description: string
  business_id: string
  discount_kind: DiscountKind | ""
  discount_percentage: string
  discount_price: string
  discount_label: string
  valid_until: string
  is_active: boolean
}

export const EMPTY_PROMO_FORM: PromoFormValues = {
  title: "",
  description: "",
  business_id: "",
  discount_kind: "",
  discount_percentage: "",
  discount_price: "",
  discount_label: "",
  valid_until: "",
  is_active: true,
}

type PromoRowValues = Pick<Promotion,
  "title" | "description" | "business_id" | "discount_kind" | "discount_percentage" |
  "discount_price" | "discount_label" | "valid_until" | "is_active">

/** Valores del formulario a partir de una promo guardada. Las viejas (sin tipo) se infieren. */
export function promoFormFromRow(row: PromoRowValues): PromoFormValues {
  const kind: DiscountKind | "" = row.discount_kind
    ?? (row.discount_percentage ? "percentage" : row.discount_label?.trim() ? "text" : "")
  return {
    title: row.title,
    description: row.description ?? "",
    business_id: row.business_id,
    discount_kind: kind,
    discount_percentage: row.discount_percentage?.toString() ?? "",
    discount_price: row.discount_price?.toString() ?? "",
    discount_label: row.discount_label ?? "",
    valid_until: row.valid_until.slice(0, 10),
    is_active: row.is_active,
  }
}

/** Fila para insert/update. Solo guarda el valor del tipo elegido. */
export function promoPayload(f: PromoFormValues) {
  const kind = f.discount_kind as DiscountKind
  return {
    title: f.title.trim(),
    description: f.description.trim() || null,
    business_id: f.business_id,
    discount_kind: kind,
    discount_percentage: kind === "percentage" ? Number(f.discount_percentage) : null,
    discount_price: kind === "price" ? Number(f.discount_price) : null,
    discount_label: f.discount_label.trim() || null,
    valid_until: f.valid_until,
    is_active: f.is_active,
  }
}

function validate(f: PromoFormValues, isNew: boolean, needsBusiness: boolean): string | null {
  if (!f.title.trim()) return "El título es obligatorio"
  if (needsBusiness && !f.business_id) return "Seleccioná un negocio"
  if (!f.discount_kind) return "Elegí el tipo de valor destacado"
  if (f.discount_kind === "percentage") {
    const n = Number(f.discount_percentage)
    if (!Number.isInteger(n) || n < 1 || n > 100) return "El porcentaje tiene que ser un número entero de 1 a 100"
  }
  if (f.discount_kind === "price") {
    const n = Number(f.discount_price)
    if (!f.discount_price || !Number.isFinite(n) || n <= 0) return "Ingresá un precio mayor a 0"
  }
  if (f.discount_kind === "text" && !f.discount_label.trim()) return "Escribí el texto destacado (ej: 2x1)"
  if (!f.valid_until) return "La fecha de vencimiento es obligatoria"
  if (isNew && f.valid_until < hoyAR()) return "La fecha de vencimiento no puede ser anterior a hoy"
  return null
}

const KINDS: { key: DiscountKind; label: string; icon: typeof Percent }[] = [
  { key: "percentage", label: "Porcentaje", icon: Percent },
  { key: "price",      label: "Precio",     icon: DollarSign },
  { key: "text",       label: "Texto",      icon: Type },
]

const inputClass = "w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:border-[#2D4530] transition-colors"
const labelClass = "block text-xs font-medium text-stone-500 mb-1.5"

export default function PromoForm({
  initial,
  isNew,
  businesses,
  onSave,
  onCancel,
}: {
  initial: PromoFormValues
  isNew: boolean
  /** Si viene, se muestra el selector de negocio (admin). Si no, el negocio es fijo. */
  businesses?: { id: string; name: string }[]
  onSave: (values: PromoFormValues) => Promise<void>
  onCancel: () => void
}) {
  const [form, setForm] = useState<PromoFormValues>(initial)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = <K extends keyof PromoFormValues>(k: K, v: PromoFormValues[K]) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async () => {
    const problem = validate(form, isNew, !!businesses)
    if (problem) { setError(problem); return }
    setSaving(true)
    setError(null)
    try {
      await onSave(form)
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar la promoción")
      setSaving(false)
    }
  }

  return (
    <>
      <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
        {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

        <div>
          <label className={labelClass}>Título *</label>
          <input
            value={form.title}
            onChange={e => set("title", e.target.value)}
            placeholder="Ej: 2x1 en pizzas los jueves"
            className={inputClass}
          />
        </div>

        {businesses && (
          <div>
            <label className={labelClass}>Negocio *</label>
            <select
              value={form.business_id}
              onChange={e => set("business_id", e.target.value)}
              className={`${inputClass} bg-white`}
            >
              <option value="">— Seleccioná un negocio —</option>
              {businesses.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
        )}

        <div>
          <label className={labelClass}>Valor destacado *</label>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {KINDS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setForm(p => ({
                  ...p,
                  discount_kind: key,
                  // El texto destacado ("2x1") no sirve como aclaración de un porcentaje, ni al revés
                  discount_label: (key === "text") === (p.discount_kind === "text") ? p.discount_label : "",
                }))}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-xl border text-sm transition-colors ${
                  form.discount_kind === key
                    ? "bg-[#2D4530] text-white border-[#2D4530]"
                    : "bg-white text-stone-600 border-stone-200 hover:border-stone-300"
                }`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>

          {form.discount_kind === "percentage" && (
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number" inputMode="numeric" min={1} max={100}
                value={form.discount_percentage}
                onChange={e => set("discount_percentage", e.target.value)}
                placeholder="Ej: 20"
                className={inputClass}
              />
              <input
                value={form.discount_label}
                onChange={e => set("discount_label", e.target.value)}
                placeholder="Aclaración (opcional)"
                className={inputClass}
              />
            </div>
          )}

          {form.discount_kind === "price" && (
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number" inputMode="decimal" min={0} step="any"
                value={form.discount_price}
                onChange={e => set("discount_price", e.target.value)}
                placeholder="Ej: 12500"
                className={inputClass}
              />
              <input
                value={form.discount_label}
                onChange={e => set("discount_label", e.target.value)}
                placeholder="Aclaración (opcional)"
                className={inputClass}
              />
            </div>
          )}

          {form.discount_kind === "text" && (
            <input
              value={form.discount_label}
              onChange={e => set("discount_label", e.target.value)}
              placeholder="Ej: 2x1, Regalo, Envío gratis"
              maxLength={30}
              className={inputClass}
            />
          )}

          {!form.discount_kind && (
            <p className="text-xs text-stone-400">Elegí si la promo se destaca con un porcentaje, un precio o un texto.</p>
          )}
        </div>

        <div>
          <label className={labelClass}>Descripción</label>
          <textarea
            value={form.description}
            onChange={e => set("description", e.target.value)}
            rows={2}
            placeholder="Descripción opcional de la promoción"
            className={`${inputClass} resize-none`}
          />
        </div>

        <div>
          <label className={labelClass}>Válida hasta *</label>
          <input
            type="date"
            value={form.valid_until}
            min={isNew ? hoyAR() : undefined}
            onChange={e => set("valid_until", e.target.value)}
            className={inputClass}
          />
          <p className="text-xs text-stone-400 mt-1">Después de esta fecha la promo deja de mostrarse sola.</p>
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

      <div className="flex gap-3 px-6 py-4 border-t border-stone-100">
        <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-600 hover:bg-stone-50 transition-colors">
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
    </>
  )
}
