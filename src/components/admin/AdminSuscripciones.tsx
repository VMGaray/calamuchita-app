"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { CreditCard, Plus, Pencil, Trash2, X } from "lucide-react"
import { Subscription, SubscriptionStatus, BillingCycle } from "@/types/database"

// ─── tipos ───────────────────────────────────────────────────────────────────

interface SubRow extends Subscription {
  businesses: { name: string; slug: string } | null
  created_at: string
}

interface BusinessOption {
  id: string
  name: string
}

// ─── helpers ─────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<SubscriptionStatus, string> = {
  trial:     "Trial",
  active:    "Activa",
  overdue:   "Vencida",
  cancelled: "Cancelada",
}

const STATUS_STYLE: Record<SubscriptionStatus, string> = {
  trial:     "bg-blue-50 text-blue-600",
  active:    "bg-emerald-50 text-emerald-600",
  overdue:   "bg-amber-50 text-amber-600",
  cancelled: "bg-stone-100 text-stone-400",
}

const CYCLE_LABEL: Record<BillingCycle, string> = {
  monthly: "Mensual",
  yearly:  "Anual",
}

// Estado del negocio que corresponde a cada estado de suscripción.
// 'overdue' no está mapeado a propósito: el negocio sigue visible mientras está vencido.
const BUSINESS_STATUS_FOR_SUB: Partial<Record<SubscriptionStatus, "active" | "suspended">> = {
  cancelled: "suspended",
  active:    "active",
  trial:     "active",
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" })
}

function fmtAlta(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" })
}

const EMPTY_FORM = {
  business_id:           "",
  status:                "trial" as SubscriptionStatus,
  price:                 0,
  billing_cycle:         "monthly" as BillingCycle,
  current_period_start:  new Date().toISOString().split("T")[0],
  current_period_end:    "",
  notes:                 "",
}

// ─── Form modal ──────────────────────────────────────────────────────────────

function SubForm({
  initial,
  businesses,
  onClose,
  onSaved,
}: {
  initial: SubRow | null
  businesses: BusinessOption[]
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState(
    initial
      ? {
          business_id:          initial.business_id,
          status:               initial.status,
          price:                initial.price,
          billing_cycle:        initial.billing_cycle,
          current_period_start: initial.current_period_start.split("T")[0],
          current_period_end:   initial.current_period_end.split("T")[0],
          notes:                initial.notes ?? "",
        }
      : EMPTY_FORM
  )
  const [saving, setSaving] = useState(false)
  const set = (k: string, v: string | number) => setForm(p => ({ ...p, [k]: v }))

  const handleSave = async () => {
    if (!form.business_id || !form.current_period_end) return
    setSaving(true)
    const supabase = createClient()
    const payload = { ...form, price: Number(form.price) }
    if (initial) {
      await supabase.from("subscriptions").update(payload).eq("id", initial.id)
    } else {
      await supabase.from("subscriptions").insert([payload])
    }

    const newBusinessStatus = BUSINESS_STATUS_FOR_SUB[form.status]
    if (newBusinessStatus) {
      const { error: bizError } = await supabase
        .from("businesses")
        .update({ status: newBusinessStatus })
        .eq("id", form.business_id)
      if (bizError) {
        console.error("Error al actualizar el estado del negocio:", bizError)
        alert("La suscripción se guardó, pero no se pudo actualizar el estado del negocio. Revisalo manualmente.")
      }
    }

    setSaving(false)
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-medium text-stone-800">
            {initial ? "Editar suscripción" : "Nueva suscripción"}
          </h3>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Negocio */}
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">Negocio *</label>
          <select
            value={form.business_id}
            onChange={e => set("business_id", e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm bg-white outline-none focus:ring-2 focus:ring-[#A3B18A]/50"
          >
            <option value="">Seleccionar negocio…</option>
            {businesses.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        {/* Estado + Ciclo */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Estado</label>
            <select
              value={form.status}
              onChange={e => set("status", e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm bg-white outline-none focus:ring-2 focus:ring-[#A3B18A]/50"
            >
              {(Object.keys(STATUS_LABEL) as SubscriptionStatus[]).map(s => (
                <option key={s} value={s}>{STATUS_LABEL[s]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Ciclo</label>
            <select
              value={form.billing_cycle}
              onChange={e => set("billing_cycle", e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm bg-white outline-none focus:ring-2 focus:ring-[#A3B18A]/50"
            >
              {(Object.keys(CYCLE_LABEL) as BillingCycle[]).map(c => (
                <option key={c} value={c}>{CYCLE_LABEL[c]}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Precio */}
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">Precio (ARS)</label>
          <input
            type="number" min={0} value={form.price}
            onChange={e => set("price", e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-[#A3B18A]/50"
          />
        </div>

        {/* Período */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Inicio período *</label>
            <input
              type="date" value={form.current_period_start}
              onChange={e => set("current_period_start", e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-[#A3B18A]/50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Fin período *</label>
            <input
              type="date" value={form.current_period_end}
              onChange={e => set("current_period_end", e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-[#A3B18A]/50"
            />
          </div>
        </div>

        {/* Notas */}
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">Notas</label>
          <textarea
            rows={2} value={form.notes}
            onChange={e => set("notes", e.target.value)}
            placeholder="Observaciones internas…"
            className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-[#A3B18A]/50 resize-none"
          />
        </div>

        <div className="flex gap-3 pt-1">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-600 text-sm hover:bg-stone-50 transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !form.business_id || !form.current_period_end}
            className="flex-1 py-2.5 rounded-xl bg-[#2D4530] text-white text-sm font-medium hover:bg-[#3a5a3e] transition-colors disabled:opacity-50"
          >
            {saving ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Panel principal ──────────────────────────────────────────────────────────

export default function AdminSuscripciones() {
  const [subs, setSubs] = useState<SubRow[]>([])
  const [businesses, setBusinesses] = useState<BusinessOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<SubscriptionStatus | "all">("all")
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<SubRow | null>(null)

  const fetchAll = async () => {
    const supabase = createClient()
    setError(null)
    const [{ data: subsData, error: subsError }, { data: bizData, error: bizError }] = await Promise.all([
      supabase
        .from("subscriptions")
        .select("*, businesses(name, slug)")
        .order("current_period_end", { ascending: true }),
      supabase
        .from("businesses")
        .select("id, name")
        .eq("status", "active")
        .order("name"),
    ])
    if (subsError) console.error("Error al traer suscripciones:", subsError)
    if (bizError) console.error("Error al traer negocios:", bizError)
    if (subsError || bizError) {
      setError(subsError?.message || bizError?.message || "No se pudieron cargar las suscripciones")
    }
    setSubs((subsData as SubRow[]) || [])
    setBusinesses(bizData || [])
    setLoading(false)
  }

  useEffect(() => { fetchAll() }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta suscripción?")) return
    await createClient().from("subscriptions").delete().eq("id", id)
    setSubs(prev => prev.filter(s => s.id !== id))
  }

  const openNew = () => { setEditing(null); setShowForm(true) }
  const openEdit = (sub: SubRow) => { setEditing(sub); setShowForm(true) }

  const FILTERS: { key: SubscriptionStatus | "all"; label: string }[] = [
    { key: "all",       label: "Todas"     },
    { key: "trial",     label: "Trial"     },
    { key: "active",    label: "Activas"   },
    { key: "overdue",   label: "Vencidas"  },
    { key: "cancelled", label: "Canceladas"},
  ]

  const filtered = filter === "all" ? subs : subs.filter(s => s.status === filter)

  // contadores para el header
  const counts = {
    trial:     subs.filter(s => s.status === "trial").length,
    active:    subs.filter(s => s.status === "active").length,
    overdue:   subs.filter(s => s.status === "overdue").length,
    cancelled: subs.filter(s => s.status === "cancelled").length,
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl text-stone-800 mb-1">Suscripciones</h1>
          <p className="text-stone-500 text-sm">Gestión de planes activos por negocio</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2D4530] text-white text-sm font-medium hover:bg-[#3a5a3e] transition-colors"
        >
          <Plus size={14} /> Nueva
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">
          No se pudieron cargar las suscripciones: {error}
        </div>
      )}

      {/* Resumen rápido */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(["trial", "active", "overdue", "cancelled"] as SubscriptionStatus[]).map(s => (
          <div key={s} className="bg-white rounded-2xl border border-stone-200 px-4 py-3">
            <p className="text-xs text-stone-400 mb-1">{STATUS_LABEL[s]}</p>
            <p className="text-2xl font-semibold text-stone-800">{counts[s]}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-xl text-xs border transition-colors ${
              filter === f.key
                ? "bg-[#2D4530] text-white border-[#2D4530]"
                : "bg-white text-stone-600 border-stone-200 hover:border-stone-300"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Lista */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => <div key={i} className="bg-white rounded-xl h-16 animate-pulse border border-stone-200" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
          <CreditCard size={24} className="text-stone-300 mx-auto mb-2" />
          <p className="text-sm text-stone-400">Sin suscripciones</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          {filtered.map((sub, i) => (
            <div
              key={sub.id}
              className={`flex items-center gap-3 px-5 py-3.5 ${i !== filtered.length - 1 ? "border-b border-stone-100" : ""}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium text-stone-800 truncate">
                    {sub.businesses?.name ?? "—"}
                  </p>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_STYLE[sub.status]}`}>
                    {STATUS_LABEL[sub.status]}
                  </span>
                  <span className="text-[10px] text-stone-400 px-2 py-0.5 rounded-full bg-stone-50 border border-stone-100">
                    {CYCLE_LABEL[sub.billing_cycle]}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                  <span className="text-xs text-stone-500 font-medium">
                    ${sub.price.toLocaleString("es-AR")}
                  </span>
                  <span className="text-xs text-stone-400">
                    {fmt(sub.current_period_start)} → {fmt(sub.current_period_end)}
                  </span>
                  <span className="text-[10px] text-stone-300">
                    Alta: {fmtAlta(sub.created_at)}
                  </span>
                  {sub.notes && (
                    <span className="text-xs text-stone-400 italic truncate max-w-[160px]">{sub.notes}</span>
                  )}
                </div>
              </div>

              <button
                onClick={() => openEdit(sub)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-stone-100 text-stone-300 hover:text-stone-500 transition-colors"
              >
                <Pencil size={13} />
              </button>
              <button
                onClick={() => handleDelete(sub.id)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-stone-300 hover:text-red-400 transition-colors"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <SubForm
          initial={editing}
          businesses={businesses}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); fetchAll() }}
        />
      )}
    </div>
  )
}
