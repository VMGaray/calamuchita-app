/**
 * Texto del servicio de mesa para la carta pública.
 * null = el local no lo informó → no se muestra nada.
 */
export function tableServiceLabel(charges: boolean | null | undefined, fee: number | null | undefined): string | null {
  if (charges === false) return "Sin cargo de servicio de mesa"
  if (charges === true && fee != null && fee > 0) {
    return `Servicio de mesa: $${Number(fee).toLocaleString("es-AR")} por persona`
  }
  return null
}
