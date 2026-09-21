import type { BillingCycle, BusinessSection, SubscriptionStatus } from "@/types/database"

// Orden en que se muestran filtros, contadores y selector del formulario.
export const SUBSCRIPTION_STATUSES: SubscriptionStatus[] = [
  "trial", "active", "discount", "complimentary", "free", "expired", "suspended",
]

// Etiqueta individual: badge de cada fila y selector del formulario.
export const STATUS_LABEL: Record<SubscriptionStatus, string> = {
  trial:         "Trial",
  active:        "Activa",
  discount:      "Descuento",
  complimentary: "Bonificado",
  free:          "Gratis",
  expired:       "Vencida",
  suspended:     "Suspendida",
}

// Etiqueta en plural: filtros y contadores del panel.
export const STATUS_FILTER_LABEL: Record<SubscriptionStatus, string> = {
  trial:         "Trial",
  active:        "Activas",
  discount:      "Descuento",
  complimentary: "Bonificados",
  free:          "Gratis",
  expired:       "Vencidas",
  suspended:     "Suspendidas",
}

export const STATUS_STYLE: Record<SubscriptionStatus, string> = {
  trial:         "bg-blue-50 text-blue-600",
  active:        "bg-emerald-50 text-emerald-600",
  discount:      "bg-violet-50 text-violet-600",
  complimentary: "bg-pink-50 text-pink-600",
  free:          "bg-teal-50 text-teal-600",
  expired:       "bg-amber-50 text-amber-600",
  suspended:     "bg-red-50 text-red-500",
}

// Espejo en el front de la regla de visibilidad que vive en la base
// (public.business_is_public). Solo sirve para rotular en el panel; lo que ve
// el público lo decide la política RLS, no esta constante.
export const VISIBLE_STATUSES: ReadonlySet<SubscriptionStatus> = new Set<SubscriptionStatus>([
  "trial", "active", "discount", "complimentary", "free",
])

// Estados que vencen solos cuando current_period_end + días de gracia ya pasó.
// 'trial' no está: nunca vence automáticamente. 'free' tampoco.
export const AUTO_EXPIRING_STATUSES: ReadonlySet<SubscriptionStatus> = new Set<SubscriptionStatus>([
  "active", "discount", "complimentary",
])

// Espejo de public.subscription_grace_days() (suscripciones_funciones_estado.sql).
// Solo sirve para avisar en el panel; el vencimiento real lo calcula la base.
// Si se cambia allá, cambiar también acá.
export const SUBSCRIPTION_GRACE_DAYS = 7

// Ventana del filtro "Por vencer": fin de período dentro de los próximos N días (o ya pasado).
export const EXPIRING_SOON_DAYS = 10

export const CYCLE_LABEL: Record<BillingCycle, string> = {
  monthly: "Mensual",
  yearly:  "Anual",
}

export const SECTION_LABEL: Record<BusinessSection, string> = {
  gastronomy: "Gastronomía",
  services:   "Servicios",
  health:     "Salud",
  education:  "Educación",
  tourism:    "Turismo",
  commerce:   "Comercios",
  events:     "Eventos",
  sports:     "Deportes",
  info:       "Info útil",
}

// Qué campos del formulario aplican a cada estado.
export interface StatusFields {
  price:         boolean
  priceRequired: boolean
  cycle:         boolean
  end:           boolean
  endRequired:   boolean
  reason:        boolean
}

const NONE: StatusFields = { price: false, priceRequired: false, cycle: false, end: false, endRequired: false, reason: false }

export const STATUS_FIELDS: Record<SubscriptionStatus, StatusFields> = {
  trial:         { ...NONE, end: true, endRequired: true },
  active:        { ...NONE, price: true, priceRequired: true, cycle: true, end: true, endRequired: true },
  discount:      { ...NONE, price: true, priceRequired: true, cycle: true, end: true, endRequired: true, reason: true },
  complimentary: { ...NONE, end: true, reason: true },
  free:          { ...NONE },
  expired:       { ...NONE, end: true, reason: true },
  suspended:     { ...NONE, reason: true },
}
