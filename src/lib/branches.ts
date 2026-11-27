// Sucursales de un negocio (columna businesses.branches, jsonb).
// Las fichas viejas solo tienen pueblo y dirección; el resto es opcional.
export interface Branch {
  pueblo: string
  address: string
  phone?: string
  whatsapp?: string
  hours?: string
}

export const EMPTY_BRANCH: Branch = { pueblo: "", address: "", phone: "", whatsapp: "", hours: "" }

/** Lee lo guardado en la DB completando los campos que falten. */
export function readBranches(raw: unknown): Branch[] {
  if (!Array.isArray(raw)) return []
  return raw.map((b) => ({ ...EMPTY_BRANCH, ...(b ?? {}) }))
}

/** Limpia la lista del formulario: saca espacios y sucursales vacías. */
export function cleanBranches(list: Branch[]): Branch[] {
  return list
    .map((b) => ({
      pueblo: (b.pueblo ?? "").trim(),
      address: (b.address ?? "").trim(),
      phone: (b.phone ?? "").trim(),
      whatsapp: (b.whatsapp ?? "").trim(),
      hours: (b.hours ?? "").trim(),
    }))
    .filter((b) => b.pueblo || b.address || b.phone || b.whatsapp || b.hours)
}
