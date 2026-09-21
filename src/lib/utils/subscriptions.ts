import type { SubscriptionStatus } from "@/types/database"
import {
  AUTO_EXPIRING_STATUSES, STATUS_FIELDS, SUBSCRIPTION_GRACE_DAYS, SUBSCRIPTION_STATUSES,
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

export function formatARS(amount: number): string {
  return `$${Math.round(amount).toLocaleString("es-AR")}`
}

export function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size))
  return out
}
