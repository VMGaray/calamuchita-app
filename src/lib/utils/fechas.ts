// Fechas "del día" en hora de Argentina, iguales en el navegador y en el servidor (Vercel corre en UTC).
// Antes se usaba new Date().toISOString().split("T")[0], que desde las 21 h ya da la fecha de mañana.

export const ZONA_AR = "America/Argentina/Cordoba"

// Argentina no tiene horario de verano: el offset es fijo
const OFFSET_AR = "-03:00"

const formatoFecha = new Intl.DateTimeFormat("en-CA", {
  timeZone: ZONA_AR,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
})

/** Fecha de hoy en Argentina, "YYYY-MM-DD" (para columnas date: menú del día, reservas, promociones). */
export function hoyAR(ahora: Date = new Date()): string {
  return formatoFecha.format(ahora)
}

/** Suma (o resta) días a una fecha "YYYY-MM-DD" y devuelve "YYYY-MM-DD". */
export function sumarDias(fecha: string, dias: number): string {
  const d = new Date(`${fecha}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + dias)
  return d.toISOString().slice(0, 10)
}

/** Medianoche de hoy en Argentina como timestamp ISO (para comparar contra created_at). */
export function inicioDelDiaAR(ahora: Date = new Date()): string {
  return new Date(`${hoyAR(ahora)}T00:00:00${OFFSET_AR}`).toISOString()
}
