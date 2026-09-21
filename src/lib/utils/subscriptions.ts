import type { SubscriptionStatus } from "@/types/database"
import {
  AUTO_EXPIRING_STATUSES, EXPIRING_SOON_DAYS, STATUS_FIELDS, SUBSCRIPTION_GRACE_DAYS, SUBSCRIPTION_STATUSES,
} from "@/lib/constants/subscriptions"

// La base todavía puede devolver 'overdue' y 'cancelled' (legado del enum): se
// mapean a 'expired' y 'suspended'. Un valor desconocido se trata como oculto.
export function normalizeSubscriptionStatus(raw: string | null | undefined): SubscriptionStatus {
  if (raw === "overdue") return "expired"
  if (raw === "cancelled") return "suspended"
  return (SUBSCRIPTION_STATUSES as string[]).includes(raw ?? "") ? (raw as SubscriptionStatus) : "suspended"
}

export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

// Las columnas `date` llegan como "YYYY-MM-DD". `new Date("YYYY-MM-DD")` las
// interpreta en UTC y en Argentina mostraría el día anterior, por eso se fuerza
// hora local. Devuelve null si el valor está vacío o no es una fecha válida.
function parseDate(iso: string | null | undefined): Date | null {
  if (!iso) return null
  const d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(iso) ? `${iso}T00:00:00` : iso)
  return Number.isNaN(d.getTime()) ? null : d
}

export function formatDate(iso: string | null | undefined, style: "short" | "numeric" = "short"): string {
  const d = parseDate(iso)
  if (!d) return "—"
  return d.toLocaleDateString("es-AR",
    style === "short"
      ? { day: "2-digit", month: "short", year: "numeric" }
      : { day: "2-digit", month: "2-digit", year: "numeric" })
}

// Días entre hoy y la fecha dada (positivo = futuro, negativo = pasado). null si no hay fecha.
export function daysUntil(iso: string | null | undefined): number | null {
  const target = parseDate(iso)
  if (!target) return null
  target.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - today.getTime()) / 86400000)
}

// Solo etiqueta visual: un trial con fecha pasada no cambia de estado ni de visibilidad.
export function isTrialDateExpired(status: SubscriptionStatus, periodEnd: string | null): boolean {
  if (status !== "trial") return false
  const days = daysUntil(periodEnd)
  return days !== null && days < 0
}

// ¿El fin de período ya pasó los días de gracia? Con un estado que vence solo
// (active/discount/complimentary), eso equivale a quedar 'expired' y oculta el negocio.
export function isPastGrace(periodEnd: string | null | undefined): boolean {
  const days = daysUntil(periodEnd)
  return days !== null && days < -SUBSCRIPTION_GRACE_DAYS
}

// ¿Guardar deja la suscripción vencida (estado que vence solo + fin pasado los días de
// gracia)? Solo cuenta si ESE guardado es el que la deja así: alta nueva, cambio de
// estado o cambio de fecha. Editar únicamente las notas de una que ya estaba así no avisa.
export function saveLeavesExpired(
  initial: { status: string; current_period_end: string | null } | null,
  status: SubscriptionStatus,
  newEnd: string | null,
): boolean {
  if (!AUTO_EXPIRING_STATUSES.has(status) || !isPastGrace(newEnd)) return false
  if (!initial) return true
  const oldEnd = (initial.current_period_end ?? "").split("T")[0] || null
  return normalizeSubscriptionStatus(initial.status) !== status || oldEnd !== newEnd
}

// Motivo por el que una suscripción no puede pasar al estado `target` en una acción
// masiva (no hay dónde pedir el dato faltante), o null si puede.
// En los estados que vencen solos el diálogo pide un fin de período nuevo para todas,
// así que la falta de fecha no bloquea.
export function bulkBlockReason(
  sub: { price: number | null; current_period_end: string | null },
  target: SubscriptionStatus,
): "price" | "end" | null {
  const fields = STATUS_FIELDS[target]
  if (fields.priceRequired && !(Number(sub.price) > 0)) return "price"
  if (fields.endRequired && !AUTO_EXPIRING_STATUSES.has(target) && !parseDate(sub.current_period_end)) return "end"
  return null
}

// ─── Renovación ──────────────────────────────────────────────────────────────
// Todo este bloque trabaja con fechas como texto "YYYY-MM-DD" y aritmética en UTC:
// sin hora ni zona, así ninguna zona horaria del navegador puede correr un día.

const pad2 = (n: number) => String(n).padStart(2, "0")
const daysInMonth = (year: number, month: number) => new Date(Date.UTC(year, month, 0)).getUTCDate()
const formatISO = (year: number, month: number, day: number) => `${String(year).padStart(4, "0")}-${pad2(month)}-${pad2(day)}`

function parseISOParts(iso: string | null | undefined): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:$|T)/.exec(iso ?? "")
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) return null
  return { year, month, day }
}

// "YYYY-MM-DD" normalizado (descarta una hora si la trae), o null si no es una fecha válida.
export function toDateKey(iso: string | null | undefined): string | null {
  const p = parseISOParts(iso)
  return p ? formatISO(p.year, p.month, p.day) : null
}

// Fecha de hoy en Argentina (la misma que usa la base para vencer), como "YYYY-MM-DD".
export function todayInArgentina(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Argentina/Buenos_Aires", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(now)
  const get = (type: string) => parts.find(p => p.type === type)?.value ?? ""
  return `${get("year")}-${get("month")}-${get("day")}`
}

export function addDaysISO(iso: string | null | undefined, days: number): string | null {
  const p = parseISOParts(iso)
  if (!p) return null
  const d = new Date(Date.UTC(p.year, p.month - 1, p.day + days))
  return formatISO(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate())
}

// Suma meses sin desbordar al mes siguiente: si el día no existe en el mes destino, cae en
// el último día de ese mes (31/01 + 1 mes = 28/02, o 29/02 en bisiesto).
export function addMonthsISO(iso: string | null | undefined, months: number): string | null {
  const p = parseISOParts(iso)
  if (!p) return null
  const total = p.year * 12 + (p.month - 1) + months
  const year = Math.floor(total / 12)
  const month = total - year * 12 + 1
  return formatISO(year, month, Math.min(p.day, daysInMonth(year, month)))
}

// Día desde el que se cuenta la renovación. Si el fin todavía está vigente o dentro de la
// gracia (fin + días de gracia >= hoy), se parte del fin: pagar antes o unos días tarde no
// mueve el calendario de cobro. Si ya venció más allá de la gracia, se parte de hoy.
export function renewalBase(currentEnd: string | null | undefined, today: string): string | null {
  const end = toDateKey(currentEnd)
  const now = toDateKey(today)
  if (!end || !now) return null
  const graceLimit = addDaysISO(end, SUBSCRIPTION_GRACE_DAYS)
  return graceLimit !== null && graceLimit >= now ? end : now
}

// Nuevo fin de período tras renovar `months` meses (1 o 12), o null si no hay nada que
// renovar (fin nulo o inválido) o los datos no son válidos.
export function computeRenewedEnd(
  currentEnd: string | null | undefined,
  months: number,
  today: string,
): string | null {
  if (!Number.isInteger(months) || months < 1) return null
  const base = renewalBase(currentEnd, today)
  return base ? addMonthsISO(base, months) : null
}

// Renovable: estado GUARDADO active/discount/complimentary y con fin de período. Las que hoy
// figuran como Vencidas por fecha siguen siéndolo; expired/overdue/cancelled, trial, free y
// suspended no, ni complimentary sin vencimiento.
export function isRenewable(storedStatus: string, periodEnd: string | null | undefined): boolean {
  return (AUTO_EXPIRING_STATUSES as ReadonlySet<string>).has(storedStatus) && toDateKey(periodEnd) !== null
}

// "Por vencer": renovable con fin <= hoy + N días (incluye las ya vencidas).
export function isExpiringSoon(
  storedStatus: string,
  periodEnd: string | null | undefined,
  today: string,
  days: number = EXPIRING_SOON_DAYS,
): boolean {
  if (!isRenewable(storedStatus, periodEnd)) return false
  const end = toDateKey(periodEnd)
  const limit = addDaysISO(today, days)
  return end !== null && limit !== null && end <= limit
}

export function formatARS(amount: number): string {
  return `$${Math.round(amount).toLocaleString("es-AR")}`
}

export function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size))
  return out
}
