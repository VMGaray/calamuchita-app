"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { CreditCard, Plus, Pencil, Trash2, X } from "lucide-react"
import { Subscription, SubscriptionStatus, BillingCycle, BusinessSection, BusinessCategory } from "@/types/database"

// ─── tipos ───────────────────────────────────────────────────────────────────

interface SubRow extends Subscription {
  businesses: { name: string; slug: string } | null
  created_at: string
}

interface BusinessOption {
  id: string
  name: string
  section: BusinessSection
  category: BusinessCategory | null
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

// Día de corte mensual según la sección del negocio.
const CUTOFF_DAY_BY_SECTION: Record<BusinessSection, number> = {
  services:   5,
  health:     5,
  gastronomy: 10,
  events:     10,
  info:       10,
  commerce:   15,
  tourism:    15,
  sports:     15,
  education:  15,
}

// Categorías gastronómicas "premium" — el resto de gastronomía cae en el precio default.
const GASTRONOMY_PREMIUM_CATEGORIES = new Set<BusinessCategory>([
  "restaurant", "cafe", "bar", "sushi", "pizzeria", "hamburgueseria",
])

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" })
}

function fmtAlta(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" })
}

function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

// Días entre hoy y la fecha dada (positivo = futuro, negativo = pasado).
function daysDiff(iso: string): number {
  const target = new Date(iso + "T00:00:00")
  const today = new Date(toISODate(new Date()) + "T00:00:00")
  return Math.round((target.getTime() - today.getTime()) / 86400000)
}

// Próxima fecha de corte para el día del mes dado, a partir de `from`.
// Si `from` ya alcanzó o pasó el día de corte de este mes, salta al mes siguiente.
function nextCutoffDate(cutoffDay: number, from: Date): string {
  const year = from.getFullYear()
  const month = from.getMonth()
  const target = from.getDate() >= cutoffDay
    ? new Date(year, month + 1, cutoffDay)
    : new Date(year, month, cutoffDay)
  return toISODate(target)
}

function defaultPriceFor(section: BusinessSection, category: BusinessCategory | null): number {
  if (section === "gastronomy" && category && GASTRONOMY_PREMIUM_CATEGORIES.has(category)) return 30000
  if (section === "health") return 25000
  return 17000
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

  // Al elegir negocio en un alta nueva, precarga fecha de corte y precio según su sección/categoría.
  const handleBusinessSelect = (id: string) => {
    const biz = businesses.find(b => b.id === id)
    if (initial || !biz) {
      set("business_id", id)
      return
    }
    const today = new Date()
    const cutoffDay = CUTOFF_DAY_BY_SECTION[biz.section] ?? 15
    setForm(p => ({
      ...p,
      business_id: id,
      current_period_start: toISODate(today),
      current_period_end: nextCutoffDate(cutoffDay, today),
      price: defaultPriceFor(biz.section, biz.category),
    }))
  }

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
            onChange={e => handleBusinessSelect(e.target.value)}
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
            <label className="block text-xs font-medium text-stone-600 mb-1">
              Inicio período *
              {initial && <span className="text-stone-300 font-normal ml-1">(fecha de alta, no se modifica)</span>}
            </label>
            <input
              type="date"
              value={form.current_period_start}
              onChange={e => !initial && set("current_period_start", e.target.value)}
              readOnly={!!initial}
              className={`w-full px-3 py-2 rounded-xl border text-sm outline-none ${
                initial
                  ? "border-stone-100 bg-stone-50 text-stone-400 cursor-not-allowed"
                  : "border-stone-200 focus:ring-2 focus:ring-[#A3B18A]/50"
              }`}
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
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<SubRow | null>(null)
  const [autoSuspendedCount, setAutoSuspendedCount] = useState(0)

  // Vencidas 1-5 días → 'overdue'. Vencidas +5 días → 'cancelled' y el negocio se suspende.
  const checkVencimientos = async () => {
    const supabase = createClient()
    const todayISO = toISODate(new Date())

    const { data: dueSubs, error: dueError } = await supabase
      .from("subscriptions")
      .select("id, business_id, current_period_end")
      .in("status", ["active", "overdue"])
      .lt("current_period_end", todayISO)

    if (dueError) {
      console.error("Error al chequear vencimientos:", dueError)
      return
    }
    if (!dueSubs || dueSubs.length === 0) return

    const overdueIds: string[] = []
    const cancelledIds: string[] = []
    const cancelledBusinessIds: string[] = []

    for (const s of dueSubs) {
      const daysLate = -daysDiff(s.current_period_end)
      if (daysLate > 5) {
        cancelledIds.push(s.id)
        cancelledBusinessIds.push(s.business_id)
      } else {
        overdueIds.push(s.id)
      }
    }

    if (overdueIds.length > 0) {
      const { error } = await supabase.from("subscriptions").update({ status: "overdue" }).in("id", overdueIds)
      if (error) console.error("Error al marcar suscripciones vencidas:", error)
    }

    if (cancelledIds.length > 0) {
      const { error: subError } = await supabase.from("subscriptions").update({ status: "cancelled" }).in("id", cancelledIds)
      if (subError) console.error("Error al cancelar suscripciones:", subError)

      const { error: bizError } = await supabase.from("businesses").update({ status: "suspended" }).in("id", cancelledBusinessIds)
      if (bizError) console.error("Error al suspender negocios:", bizError)
    }

    setAutoSuspendedCount(cancelledBusinessIds.length)
  }

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
        .select("id, name, section, category")
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

  useEffect(() => { checkVencimientos().then(() => fetchAll()) }, [])

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

  const filtered = (filter === "all" ? subs : subs.filter(s => s.status === filter))
    .filter(s => !search || s.businesses?.name?.toLowerCase().includes(search.toLowerCase()))

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

      {autoSuspendedCount > 0 && (
        <div className="bg-amber-50 text-amber-700 text-sm px-4 py-3 rounded-xl">
          Se suspendieron {autoSuspendedCount} negocio{autoSuspendedCount === 1 ? "" : "s"} por falta de pago.
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

      {/* Buscador */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre del comercio..."
          className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-[#2D4530]/20 bg-white"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-300 hover:text-stone-500"
          >
            <X size={14} />
          </button>
        )}
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
                  {sub.status !== "cancelled" && sub.status !== "overdue" &&
                    daysDiff(sub.current_period_end) >= 0 && daysDiff(sub.current_period_end) <= 3 && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700">
                      ⚠️ Vence pronto
                    </span>
                  )}
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
