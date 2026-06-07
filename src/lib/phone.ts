/**
 * Normaliza un número de teléfono al formato internacional argentino para wa.me.
 * Cubre los formatos más comunes que ingresan los usuarios:
 *   1151815146   → 541151815146
 *   01151815146  → 541151815146
 *   541151815146 → 541151815146  (ya correcto)
 *  +541151815146 → 541151815146
 */
export function normalizeArgPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "")
  if (!digits) return digits
  if (digits.startsWith("54")) return digits
  if (digits.startsWith("0")) return "54" + digits.slice(1)
  return "54" + digits
}
