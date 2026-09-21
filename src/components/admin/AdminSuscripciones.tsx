"use client"

import { useEffect, useState, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import { CreditCard, Plus, Pencil, Trash2, X } from "lucide-react"
import {
  Subscription, SubscriptionStatus, BillingCycle, BusinessSection, BusinessCategory, BusinessStatus,
} from "@/types/database"
import {
  AUTO_EXPIRING_STATUSES, CYCLE_LABEL, SECTION_LABEL, STATUS_FIELDS, STATUS_FILTER_LABEL, STATUS_LABEL,
  STATUS_STYLE, SUBSCRIPTION_GRACE_DAYS, SUBSCRIPTION_STATUSES, VISIBLE_STATUSES,
} from "@/lib/constants/subscriptions"
import {
  bulkBlockReason, chunk, daysUntil, formatARS, formatDate, isPastGrace, isTrialDateExpired,
  normalizeSubscriptionStatus, saveLeavesExpired, toISODate,
} from "@/lib/utils/subscriptions"

// ─── tipos ───────────────────────────────────────────────────────────────────

interface SubRow extends Subscription {
  // Columnas calculadas en la base (suscripciones_funciones_estado.sql)
  effective_status: string | null
  monthly_price: number | string | null
  businesses: { name: string; slug: string; section: BusinessSection; status: BusinessStatus } | null
  // Estado efectivo ya normalizado a los 7 estados (se deriva al cargar)
  eff: SubscriptionStatus
}

interface BusinessOption {
  id: string
  name: string
  section: BusinessSection
  category: BusinessCategory | null
}

type StatusFilter = SubscriptionStatus | "all" | "trial_expired"

// ─── helpers ─────────────────────────────────────────────────────────────────

// Estados que pueden vencer o tener aviso de "vence pronto".
const WITH_DUE_DATE = new Set<SubscriptionStatus>(["trial", "active", "discount", "complimentary"])

// .in("id", [...]) con muchos uuid puede pasarse del largo de URL permitido.
const BATCH_SIZE = 50

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

const uniq = (ids: string[]) => Array.from(new Set(ids))

// Negocios que deben pasar a 'suspended' al ocultar sus suscripciones.
// Solo los que hoy están 'active': nunca se toca 'pending'.
function businessesToSuspend(rows: SubRow[]): string[] {
  return uniq(rows.filter(s => s.businesses?.status === "active").map(s => s.business_id))
}

// Negocios a los que habría que ofrecerles reactivación: la suscripción sale de un
// estado oculto (expired/suspended) y el negocio figura 'suspended' en Negocios.
function businessesToReactivate(rows: SubRow[]): string[] {
  return uniq(
    rows
      .filter(s => !VISIBLE_STATUSES.has(s.eff) && s.businesses?.status === "suspended")
      .map(s => s.business_id)
  )
}

async function updateBusinessStatus(ids: string[], to: "suspended" | "active"): Promise<boolean> {
  const supabase = createClient()
  let ok = true
  for (const part of chunk(ids, BATCH_SIZE)) {
    const query = supabase.from("businesses").update({ status: to }).in("id", part)
    // Suspender nunca pisa un 'pending'; reactivar solo toca los que están 'suspended'.
    const { error } = to === "suspended"
      ? await query.neq("status", "pending")
      : await query.eq("status", "suspended")
    if (error) {
      console.error("Error al actualizar el estado del negocio:", error)
      ok = false
    }
  }
  return ok
}

const EMPTY_FORM = {
  business_id:           "",
  status:                "trial" as SubscriptionStatus,
  price:                 0,
  billing_cycle:         "monthly" as BillingCycle,
  current_period_start:  new Date().toISOString().split("T")[0],
  current_period_end:    "",
  reason:                "",
  notes:                 "",
}

// ─── Diálogo de confirmación con varias opciones ─────────────────────────────

interface DialogAction {
  label: string
  onClick: () => void
  tone: "primary" | "secondary" | "ghost"
  disabled?: boolean
}

const ACTION_STYLE: Record<DialogAction["tone"], string> = {
  primary:   "bg-[#2D4530] text-white hover:bg-[#3a5a3e] font-medium",
  secondary: "border border-stone-200 text-stone-600 hover:bg-stone-50",
  ghost:     "text-stone-400 hover:text-stone-600",
}

function ChoiceDialog({ title, children, actions }: { title: string; children: ReactNode; actions: DialogAction[] }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div role="alertdialog" aria-modal="true" className="bg-white rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-xl">
        <h3 className="text-base font-medium text-stone-800">{title}</h3>
        <div className="text-sm text-stone-500 leading-relaxed space-y-2">{children}</div>
        <div className="flex flex-col gap-2">
          {actions.map(a => (
            <button
              key={a.label}
              onClick={a.onClick}
              disabled={a.disabled}
              className={`w-full py-2.5 rounded-xl text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${ACTION_STYLE[a.tone]}`}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
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
          status:               normalizeSubscriptionStatus(initial.status),
          price:                initial.price ?? 0,
          billing_cycle:        initial.billing_cycle,
          current_period_start: (initial.current_period_start ?? "").split("T")[0],
          current_period_end:   (initial.current_period_end ?? "").split("T")[0],
          reason:               initial.reason ?? "",
          notes:                initial.notes ?? "",
        }
      : EMPTY_FORM
  )
  const [saving, setSaving] = useState(false)
  const [askReactivate, setAskReactivate] = useState(false)
  const [askExpired, setAskExpired] = useState(false)
  const set = (k: string, v: string | number) => setForm(p => ({ ...p, [k]: v }))

  const fields = STATUS_FIELDS[form.status]

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

  const invalid =
    !form.business_id ||
    !form.current_period_start ||
    (fields.priceRequired && !(Number(form.price) > 0)) ||
    (fields.endRequired && !form.current_period_end)

  // Pasar de un estado oculto (expired/suspended) a uno visible con el negocio
  // suspendido en Negocios: no se reactiva en silencio, se pregunta.
  const needsReactivateQuestion =
    !!initial &&
    !VISIBLE_STATUSES.has(initial.eff) &&
    VISIBLE_STATUSES.has(form.status) &&
    initial.businesses?.status === "suspended"

  // Guardar en un estado que vence solo con un fin ya pasado los días de gracia deja la
  // suscripción 'expired' y oculta el negocio. Se avisa cuando ESE cambio es el que la deja
  // así (alta nueva, cambio de estado o cambio de fecha), no al editar solo las notas de
  // una que ya estaba vencida.
  const endToSave = form.current_period_end || null
  const leavesExpired = saveLeavesExpired(initial, form.status, endToSave)

  const handleSave = () => {
    if (invalid) return
    if (leavesExpired) setAskExpired(true)
    else continueSave()
  }

  const continueSave = () => {
    setAskExpired(false)
    if (needsReactivateQuestion) setAskReactivate(true)
    else save(false)
  }

  const save = async (reactivate: boolean) => {
    setAskReactivate(false)
    setSaving(true)
    const supabase = createClient()

    // Los campos que el estado no usa conservan su valor guardado (o el neutro en un alta),
    // salvo 'free', que por definición no tiene vencimiento.
    const payload = {
      business_id:          form.business_id,
      status:               form.status,
      price:                fields.price ? Number(form.price) : (initial ? initial.price : 0),
      billing_cycle:        fields.cycle ? form.billing_cycle : (initial ? initial.billing_cycle : "monthly"),
      current_period_start: form.current_period_start,
      current_period_end:   form.status === "free"
        ? null
        : fields.end
          ? (form.current_period_end || null)
          : (initial?.current_period_end ?? null),
      reason:               form.reason.trim() || null,
      notes:                form.notes.trim() || null,
    }

    const { error } = initial
      ? await supabase.from("subscriptions").update(payload).eq("id", initial.id)
      : await supabase.from("subscriptions").insert([payload])

    if (error) {
      console.error("Error al guardar la suscripción:", error)
      alert(`No se pudo guardar la suscripción: ${error.message}`)
      setSaving(false)
      return
    }

    let businessOk = true
    if (!VISIBLE_STATUSES.has(form.status)) {
      businessOk = await updateBusinessStatus([form.business_id], "suspended")
    } else if (reactivate) {
      businessOk = await updateBusinessStatus([form.business_id], "active")
    }
    if (!businessOk) {
      alert("La suscripción se guardó, pero no se pudo actualizar el estado del negocio. Revisalo manualmente.")
    }

    setSaving(false)
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-3 shadow-xl max-h-[90vh] overflow-y-auto">
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
          {initial ? (
            // En edición el negocio no cambia; además el selector solo lista negocios activos
            // y dejaría vacío el campo de las suscripciones de negocios suspendidos.
            <input
              type="text"
              value={initial.businesses?.name ?? "—"}
              readOnly
              className="w-full px-3 py-2 rounded-xl border border-stone-100 bg-stone-50 text-stone-400 text-sm cursor-not-allowed"
            />
          ) : (
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
          )}
        </div>

        {/* Estado + Ciclo */}
        <div className="grid grid-cols-2 gap-3">
          <div className={fields.cycle ? "" : "col-span-2"}>
            <label className="block text-xs font-medium text-stone-600 mb-1">Estado</label>
            <select
              value={form.status}
              onChange={e => set("status", e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm bg-white outline-none focus:ring-2 focus:ring-[#A3B18A]/50"
            >
              {SUBSCRIPTION_STATUSES.map(s => (
                <option key={s} value={s}>{STATUS_LABEL[s]}</option>
              ))}
            </select>
          </div>
          {fields.cycle && (
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
          )}
        </div>
        {initial && initial.eff === "expired" && normalizeSubscriptionStatus(initial.status) !== "expired" && (
          <p className="text-xs text-amber-600 -mt-1">
            Hoy figura como Vencida: la fecha de fin ya pasó los días de gracia.
          </p>
        )}

        {/* Precio */}
        {fields.price && (
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">
              Precio (ARS){fields.priceRequired && " *"}
            </label>
            <input
              type="number" min={0} value={form.price}
              onChange={e => set("price", e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-[#A3B18A]/50"
            />
          </div>
        )}

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
          {fields.end ? (
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">
                Fin período{fields.endRequired && " *"}
                {!fields.endRequired && <span className="text-stone-300 font-normal ml-1">(opcional)</span>}
              </label>
              <input
                type="date" value={form.current_period_end}
                onChange={e => set("current_period_end", e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-[#A3B18A]/50"
              />
            </div>
          ) : form.status === "free" ? (
            <div className="flex items-end pb-2">
              <span className="text-xs text-stone-400">Sin vencimiento</span>
            </div>
          ) : null}
        </div>

        {/* Motivo */}
        {fields.reason && (
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Motivo</label>
            <input
              type="text" value={form.reason}
              onChange={e => set("reason", e.target.value)}
              placeholder={
                form.status === "complimentary" ? "Ej: amistad, retención…"
                : form.status === "discount" ? "Ej: 50% del plan…"
                : "Ej: baja solicitada…"
              }
              className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-[#A3B18A]/50"
            />
          </div>
        )}

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
            disabled={saving || invalid}
            className="flex-1 py-2.5 rounded-xl bg-[#2D4530] text-white text-sm font-medium hover:bg-[#3a5a3e] transition-colors disabled:opacity-50"
          >
            {saving ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </div>

      {askExpired && (
        <ChoiceDialog
          title="Fin de período vencido"
          actions={[
            { label: "Volver y corregir la fecha", tone: "primary", onClick: () => setAskExpired(false) },
            { label: "Guardar igual", tone: "secondary", onClick: continueSave },
          ]}
        >
          <p>
            El fin de período ({formatDate(endToSave)}) ya pasó los {SUBSCRIPTION_GRACE_DAYS} días de gracia.
            Guardada como {STATUS_LABEL[form.status]}, la suscripción quedaría Vencida y el negocio se ocultaría al público.
          </p>
        </ChoiceDialog>
      )}

      {askReactivate && (
        <ChoiceDialog
          title="Negocio suspendido"
          actions={[
            { label: "Sí, reactivarlo", tone: "primary", onClick: () => save(true) },
            { label: "No, solo cambiar la suscripción", tone: "secondary", onClick: () => save(false) },
            { label: "Cancelar", tone: "ghost", onClick: () => setAskReactivate(false) },
          ]}
        >
          <p>Este negocio figura como suspendido en Negocios. ¿Reactivarlo también para que se vea en la app?</p>
        </ChoiceDialog>
      )}
    </div>
  )
}

// ─── Acción masiva ───────────────────────────────────────────────────────────

interface BulkPlan {
  target: SubscriptionStatus
  apply: SubRow[]
  alreadyInTarget: number
  skippedNoPrice: number
  skippedNoEnd: number
}

// ─── Panel principal ──────────────────────────────────────────────────────────

export default function AdminSuscripciones() {
  const [subs, setSubs] = useState<SubRow[]>([])
  const [businesses, setBusinesses] = useState<BusinessOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<StatusFilter>("all")
  const [sectionFilter, setSectionFilter] = useState<BusinessSection | "all">("all")
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<SubRow | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkTarget, setBulkTarget] = useState<SubscriptionStatus>("free")
  const [bulkPlan, setBulkPlan] = useState<BulkPlan | null>(null)
  const [bulkRunning, setBulkRunning] = useState(false)
  // Fin de período que el diálogo aplica a todas las filas (solo active/discount/complimentary).
  const [bulkEnd, setBulkEnd] = useState("")
  const [bulkNoEnd, setBulkNoEnd] = useState(false)

  // La carga devuelve los datos y el estado se aplica aparte, dentro de un .then():
  // así el efecto de montaje no llama a setState de forma síncrona.
  const loadData = async () => {
    const supabase = createClient()
    const [{ data: subsData, error: subsError }, { data: bizData, error: bizError }] = await Promise.all([
      supabase
        .from("subscriptions")
        // effective_status y monthly_price son columnas calculadas (funciones de la base):
        // la regla de vencimiento vive en un solo lugar.
        .select("*, effective_status, monthly_price, businesses(name, slug, section, status)")
        .order("current_period_end", { ascending: true, nullsFirst: false }),
      supabase
        .from("businesses")
        .select("id, name, section, category")
        .eq("status", "active")
        .order("name"),
    ])
    if (subsError) console.error("Error al traer suscripciones:", subsError)
    if (bizError) console.error("Error al traer negocios:", bizError)
    const rows = ((subsData ?? []) as Omit<SubRow, "eff">[]).map(s => ({
      ...s,
      eff: normalizeSubscriptionStatus(s.effective_status ?? s.status),
    }))
    return {
      rows,
      businesses: (bizData || []) as BusinessOption[],
      error: subsError || bizError
        ? subsError?.message || bizError?.message || "No se pudieron cargar las suscripciones"
        : null,
    }
  }

  const applyData = (data: Awaited<ReturnType<typeof loadData>>) => {
    setSubs(data.rows)
    setBusinesses(data.businesses)
    setError(data.error)
    setLoading(false)
  }

  const fetchAll = () => loadData().then(applyData)

  useEffect(() => { loadData().then(applyData) }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta suscripción?")) return
    await createClient().from("subscriptions").delete().eq("id", id)
    setSubs(prev => prev.filter(s => s.id !== id))
  }

  const openNew = () => { setEditing(null); setShowForm(true) }
  const openEdit = (sub: SubRow) => { setEditing(sub); setShowForm(true) }

  // Cambiar cualquier filtro descarta la selección: la acción masiva solo afecta lo que se ve.
  const changeFilter = (f: StatusFilter) => { setFilter(f); setSelected(new Set()) }
  const changeSection = (s: BusinessSection | "all") => { setSectionFilter(s); setSelected(new Set()) }
  const changeSearch = (q: string) => { setSearch(q); setSelected(new Set()) }

  const FILTERS: { key: StatusFilter; label: string }[] = [
    { key: "all", label: "Todas" },
    ...SUBSCRIPTION_STATUSES.map(s => ({ key: s as StatusFilter, label: STATUS_FILTER_LABEL[s] })),
  ]

  const query = search.trim().toLowerCase()
  const filtered = subs.filter(s => {
    if (filter === "trial_expired") {
      if (!isTrialDateExpired(s.eff, s.current_period_end)) return false
    } else if (filter !== "all" && s.eff !== filter) {
      return false
    }
    if (sectionFilter !== "all" && s.businesses?.section !== sectionFilter) return false
    if (query && !s.businesses?.name?.toLowerCase().includes(query)) return false
    return true
  })

  // Contadores y tarjeta de ingreso: sobre todas las suscripciones, sin filtros.
  const counts = SUBSCRIPTION_STATUSES.reduce(
    (acc, s) => ({ ...acc, [s]: subs.filter(x => x.eff === s).length }),
    {} as Record<SubscriptionStatus, number>,
  )
  const trialExpiredCount = subs.filter(s => isTrialDateExpired(s.eff, s.current_period_end)).length
  const monthlyRevenue = subs
    .filter(s => s.eff === "active" || s.eff === "discount")
    .reduce((sum, s) => sum + Number(s.monthly_price ?? 0), 0)

  // ─ selección / acción masiva ─
  const selectedRows = filtered.filter(s => selected.has(s.id))
  const allSelected = filtered.length > 0 && selectedRows.length === filtered.length
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(filtered.map(s => s.id)))
  const toggleOne = (id: string) => setSelected(prev => {
    const next = new Set(prev)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    return next
  })

  const prepareBulk = () => {
    const plan: BulkPlan = { target: bulkTarget, apply: [], alreadyInTarget: 0, skippedNoPrice: 0, skippedNoEnd: 0 }
    for (const s of selectedRows) {
      // En los estados que vencen solos, las filas que ya están en ese estado entran igual:
      // el fin de período nuevo se aplica a todas las seleccionadas (es la forma de renovarlas).
      const sameStatus = normalizeSubscriptionStatus(s.status) === bulkTarget
      if (sameStatus && !AUTO_EXPIRING_STATUSES.has(bulkTarget)) { plan.alreadyInTarget++; continue }
      const block = bulkBlockReason(s, bulkTarget)
      if (block === "price") { plan.skippedNoPrice++; continue }
      if (block === "end") { plan.skippedNoEnd++; continue }
      plan.apply.push(s)
    }
    setBulkEnd("")
    setBulkNoEnd(false)
    setBulkPlan(plan)
  }

  // `newEnd`: fin de período elegido en el diálogo (null = sin vencimiento). Solo se pasa
  // para los estados que vencen solos; en el resto es undefined y la fecha no se toca.
  const runBulk = async (plan: BulkPlan, reactivate: boolean, newEnd?: string | null) => {
    setBulkPlan(null)
    setBulkRunning(true)
    const supabase = createClient()

    // 'free' no tiene vencimiento; el resto de los campos no se toca.
    const patch: { status: SubscriptionStatus; current_period_end?: string | null } = { status: plan.target }
    if (plan.target === "free") patch.current_period_end = null
    else if (newEnd !== undefined) patch.current_period_end = newEnd

    const done = new Set<string>()
    for (const part of chunk(plan.apply.map(s => s.id), BATCH_SIZE)) {
      const { error: updError } = await supabase.from("subscriptions").update(patch).in("id", part)
      if (updError) console.error("Error en acción masiva:", updError)
      else part.forEach(id => done.add(id))
    }
    const doneRows = plan.apply.filter(s => done.has(s.id))

    let businessOk = true
    if (!VISIBLE_STATUSES.has(plan.target)) {
      const ids = businessesToSuspend(doneRows)
      if (ids.length > 0) businessOk = await updateBusinessStatus(ids, "suspended")
    } else if (reactivate) {
      const ids = businessesToReactivate(doneRows)
      if (ids.length > 0) businessOk = await updateBusinessStatus(ids, "active")
    }

    const failed = plan.apply.length - doneRows.length
    if (failed > 0) alert(`Se actualizaron ${doneRows.length} de ${plan.apply.length} suscripciones. ${failed} fallaron: probá de nuevo con esas.`)
    if (!businessOk) alert("Las suscripciones se guardaron, pero no se pudo actualizar el estado de algunos negocios. Revisalos en Negocios.")

    setSelected(new Set())
    setBulkRunning(false)
    fetchAll()
  }

  // Textos del diálogo de la acción masiva
  const renderBulkDialog = (plan: BulkPlan) => {
    const hiding = !VISIBLE_STATUSES.has(plan.target)
    const suspendCount = hiding ? businessesToSuspend(plan.apply).length : 0
    const reactivateCount = !hiding ? businessesToReactivate(plan.apply).length : 0
    const plural = (n: number, one: string, many: string) => (n === 1 ? one : many)

    const notes: string[] = []
    if (plan.alreadyInTarget > 0) notes.push(`${plan.alreadyInTarget} ya ${plural(plan.alreadyInTarget, "está", "están")} en ese estado.`)
    if (plan.skippedNoPrice > 0) notes.push(`${plan.skippedNoPrice} se ${plural(plan.skippedNoPrice, "omite", "omiten")} por no tener precio: editalas una por una.`)
    if (plan.skippedNoEnd > 0) notes.push(`${plan.skippedNoEnd} se ${plural(plan.skippedNoEnd, "omite", "omiten")} por no tener fecha de fin: editalas una por una.`)

    if (plan.apply.length === 0) {
      return (
        <ChoiceDialog
          title="No hay nada para cambiar"
          actions={[{ label: "Cerrar", tone: "primary", onClick: () => setBulkPlan(null) }]}
        >
          {notes.map(n => <p key={n}>{n}</p>)}
        </ChoiceDialog>
      )
    }

    // En los estados que vencen solos hay que elegir el fin de período: una fecha o, solo
    // para 'complimentary', "Sin vencimiento". Sin eso no se puede confirmar.
    const needsEnd = AUTO_EXPIRING_STATUSES.has(plan.target)
    const canBeOpenEnded = plan.target === "complimentary"
    const endChosen = bulkNoEnd || !!bulkEnd
    const newEnd = needsEnd ? (bulkNoEnd ? null : bulkEnd) : undefined
    const endExpired = needsEnd && !bulkNoEnd && isPastGrace(bulkEnd)
    const blocked = needsEnd && !endChosen

    const title = `Pasar ${plan.apply.length} ${plural(plan.apply.length, "suscripción", "suscripciones")} a ${STATUS_LABEL[plan.target]}`
    const actions: DialogAction[] = reactivateCount > 0
      ? [
          { label: "Sí, reactivarlos", tone: "primary", disabled: blocked, onClick: () => runBulk(plan, true, newEnd) },
          { label: "No, solo cambiar las suscripciones", tone: "secondary", disabled: blocked, onClick: () => runBulk(plan, false, newEnd) },
          { label: "Cancelar", tone: "ghost", onClick: () => setBulkPlan(null) },
        ]
      : [
          { label: "Confirmar", tone: "primary", disabled: blocked, onClick: () => runBulk(plan, false, newEnd) },
          { label: "Cancelar", tone: "ghost", onClick: () => setBulkPlan(null) },
        ]

    return (
      <ChoiceDialog title={title} actions={actions}>
        {needsEnd && (
          <div className="space-y-2 pb-1">
            <label className="block text-xs font-medium text-stone-600">Fin de período *</label>
            <input
              type="date"
              value={bulkEnd}
              disabled={bulkNoEnd}
              onChange={e => setBulkEnd(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm text-stone-700 outline-none focus:ring-2 focus:ring-[#A3B18A]/50 disabled:bg-stone-50 disabled:text-stone-300"
            />
            {canBeOpenEnded && (
              <label className="flex items-center gap-2 text-xs text-stone-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bulkNoEnd}
                  onChange={e => { setBulkNoEnd(e.target.checked); if (e.target.checked) setBulkEnd("") }}
                  className="accent-[#2D4530]"
                />
                Sin vencimiento
              </label>
            )}
            <p className="text-xs text-stone-400">Se aplica a {plural(plan.apply.length, "la suscripción", `las ${plan.apply.length} suscripciones`)}.</p>
          </div>
        )}
        {endExpired && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
            Ese fin ya pasó los {SUBSCRIPTION_GRACE_DAYS} días de gracia: {plan.apply.length}{" "}
            {plural(plan.apply.length, "suscripción quedaría Vencida y su negocio se ocultaría", "suscripciones quedarían Vencidas y sus negocios se ocultarían")} al público.
          </p>
        )}
        {notes.map(n => <p key={n}>{n}</p>)}
        {suspendCount > 0 && (
          <p>
            {suspendCount} {plural(suspendCount, "negocio pasará", "negocios pasarán")} a suspendido en Negocios.
          </p>
        )}
        {reactivateCount > 0 && (
          <p>
            {reactivateCount} {plural(reactivateCount, "negocio figura", "negocios figuran")} como suspendido
            {plural(reactivateCount, "", "s")} en Negocios. ¿Reactivar{plural(reactivateCount, "lo", "los")} también
            para que {plural(reactivateCount, "se vea", "se vean")} en la app?
          </p>
        )}
      </ChoiceDialog>
    )
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
        {SUBSCRIPTION_STATUSES.map(s => (
          <div key={s} className="bg-white rounded-2xl border border-stone-200 px-4 py-3">
            <p className="text-xs text-stone-400 mb-1">{STATUS_FILTER_LABEL[s]}</p>
            <p className="text-2xl font-semibold text-stone-800">{counts[s]}</p>
          </div>
        ))}
        <div className="bg-white rounded-2xl border border-stone-200 px-4 py-3">
          <p className="text-xs text-stone-400 mb-1">Ingreso mensual estimado</p>
          <p className="text-2xl font-semibold text-stone-800">{formatARS(monthlyRevenue)}</p>
          <p className="text-[10px] text-stone-300 mt-0.5">Activas + Descuento</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => changeFilter(f.key)}
            className={`px-3 py-1.5 rounded-xl text-xs border transition-colors ${
              filter === f.key
                ? "bg-[#2D4530] text-white border-[#2D4530]"
                : "bg-white text-stone-600 border-stone-200 hover:border-stone-300"
            }`}
          >
            {f.label}
          </button>
        ))}
        <button
          onClick={() => changeFilter("trial_expired")}
          className={`px-3 py-1.5 rounded-xl text-xs border transition-colors ${
            filter === "trial_expired"
              ? "bg-[#2D4530] text-white border-[#2D4530]"
              : "bg-amber-50 text-amber-700 border-amber-200 hover:border-amber-300"
          }`}
        >
          Trial con fecha vencida ({trialExpiredCount})
        </button>
      </div>

      {/* Buscador + rubro */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={e => changeSearch(e.target.value)}
            placeholder="Buscar por nombre del comercio..."
            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-[#2D4530]/20 bg-white"
          />
          {search && (
            <button
              onClick={() => changeSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-300 hover:text-stone-500"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <select
          value={sectionFilter}
          onChange={e => changeSection(e.target.value as BusinessSection | "all")}
          className="px-4 py-2.5 rounded-xl border border-stone-200 text-sm bg-white outline-none focus:ring-2 focus:ring-[#2D4530]/20"
        >
          <option value="all">Todos los rubros</option>
          {(Object.keys(SECTION_LABEL) as BusinessSection[]).map(sec => (
            <option key={sec} value={sec}>{SECTION_LABEL[sec]}</option>
          ))}
        </select>
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
          {/* Selección y acción masiva */}
          <div className="flex items-center gap-3 flex-wrap px-5 py-2.5 border-b border-stone-100 bg-stone-50/60">
            <label className="flex items-center gap-2 text-xs text-stone-600 cursor-pointer">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                className="accent-[#2D4530]"
              />
              Seleccionar todas las filtradas ({filtered.length})
            </label>
            {selectedRows.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap sm:ml-auto">
                <span className="text-xs text-stone-500">
                  {selectedRows.length} {selectedRows.length === 1 ? "seleccionada" : "seleccionadas"}
                </span>
                <select
                  value={bulkTarget}
                  onChange={e => setBulkTarget(e.target.value as SubscriptionStatus)}
                  aria-label="Nuevo estado"
                  className="px-3 py-1.5 rounded-xl border border-stone-200 text-xs bg-white outline-none focus:ring-2 focus:ring-[#2D4530]/20"
                >
                  {SUBSCRIPTION_STATUSES.map(s => (
                    <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                  ))}
                </select>
                <button
                  onClick={prepareBulk}
                  disabled={bulkRunning}
                  className="px-3 py-1.5 rounded-xl bg-[#2D4530] text-white text-xs font-medium hover:bg-[#3a5a3e] transition-colors disabled:opacity-50"
                >
                  {bulkRunning ? "Aplicando…" : "Cambiar estado"}
                </button>
              </div>
            )}
          </div>

          {filtered.map((sub, i) => {
            const days = daysUntil(sub.current_period_end)
            const dueSoon = WITH_DUE_DATE.has(sub.eff) && days !== null && days >= 0 && days <= 3
            const trialDateExpired = isTrialDateExpired(sub.eff, sub.current_period_end)
            const hiddenByBusiness = VISIBLE_STATUSES.has(sub.eff) && sub.businesses?.status === "suspended"
            const showsReason = STATUS_FIELDS[sub.eff].reason && !!sub.reason
            return (
              <div
                key={sub.id}
                className={`flex items-center gap-3 px-5 py-3.5 ${i !== filtered.length - 1 ? "border-b border-stone-100" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={selected.has(sub.id)}
                  onChange={() => toggleOne(sub.id)}
                  aria-label={`Seleccionar ${sub.businesses?.name ?? "suscripción"}`}
                  className="accent-[#2D4530] shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-stone-800 truncate">
                      {sub.businesses?.name ?? "—"}
                    </p>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_STYLE[sub.eff]}`}>
                      {STATUS_LABEL[sub.eff]}
                    </span>
                    {STATUS_FIELDS[sub.eff].cycle && (
                      <span className="text-[10px] text-stone-400 px-2 py-0.5 rounded-full bg-stone-50 border border-stone-100">
                        {CYCLE_LABEL[sub.billing_cycle]}
                      </span>
                    )}
                    {trialDateExpired && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        Fecha vencida
                      </span>
                    )}
                    {hiddenByBusiness && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200">
                        Oculto: negocio suspendido
                      </span>
                    )}
                    {dueSoon && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700">
                        ⚠️ Vence pronto
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    {Number(sub.price) > 0 && (
                      <span className="text-xs text-stone-500 font-medium">
                        ${Number(sub.price).toLocaleString("es-AR")}
                        {sub.billing_cycle === "yearly" && " / año"}
                      </span>
                    )}
                    <span className="text-xs text-stone-400">
                      Alta: {formatDate(sub.current_period_start, "numeric")}
                    </span>
                    <span className="text-xs text-stone-400">
                      {sub.current_period_end ? `Vence: ${formatDate(sub.current_period_end)}` : "Sin vencimiento"}
                    </span>
                    {showsReason && (
                      <span className="text-xs text-stone-500 truncate max-w-[200px]">Motivo: {sub.reason}</span>
                    )}
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
            )
          })}
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

      {bulkPlan && renderBulkDialog(bulkPlan)}
    </div>
  )
}
