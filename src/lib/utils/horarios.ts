import { ZONA_AR } from "@/lib/utils/fechas"

export type BusinessHour = {
  day_of_week: number // 0=Domingo … 6=Sábado
  opens_at: string
  closes_at: string
  is_closed: boolean
}

const formatoAhora = new Intl.DateTimeFormat("en-US", {
  timeZone: ZONA_AR,
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
})

const DIAS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

/** Día de la semana y "HH:MM" actuales en Argentina (igual en el navegador y en el servidor). */
function ahoraAR(ahora: Date): { day: number; hhmm: string } {
  const parts = Object.fromEntries(formatoAhora.formatToParts(ahora).map(p => [p.type, p.value]))
  return { day: DIAS.indexOf(parts.weekday), hhmm: `${parts.hour}:${parts.minute}` }
}

/**
 * ¿Está abierto ahora según sus horarios cargados?
 * - null si el negocio no tiene horarios (no se muestra cartel).
 * - Contempla horario cortado (varias filas el mismo día) y turnos que pasan la
 *   medianoche (closes_at < opens_at, ej. 20:00–02:00).
 */
export function isOpenNow(hours: BusinessHour[] | null | undefined, ahora: Date = new Date()): boolean | null {
  if (!hours || hours.length === 0) return null
  const { day, hhmm } = ahoraAR(ahora)
  const ayer = (day + 6) % 7

  return hours.some(h => {
    if (h.is_closed) return false
    const opens = h.opens_at.slice(0, 5)
    const closes = h.closes_at.slice(0, 5)
    if (closes > opens) return h.day_of_week === day && hhmm >= opens && hhmm < closes
    // Turno que cruza la medianoche: la parte de hoy desde la apertura, o la cola del turno de ayer
    return (h.day_of_week === day && hhmm >= opens) || (h.day_of_week === ayer && hhmm < closes)
  })
}
