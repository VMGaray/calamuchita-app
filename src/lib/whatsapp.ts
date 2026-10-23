export interface WhatsappContact {
  name: string
  phone: string
}

export const MAX_WHATSAPP_CONTACTS = 5

/**
 * WhatsApp de un negocio. Usa whatsapp_contacts y, si el negocio es viejo y no la tiene,
 * cae a la columna whatsapp (sin nombre).
 */
export function getWhatsappContacts(business: {
  whatsapp?: string | null
  whatsapp_contacts?: WhatsappContact[] | null
}): WhatsappContact[] {
  const list = cleanWhatsappContacts(business.whatsapp_contacts ?? [])
  if (list.length) return list
  return business.whatsapp?.trim() ? [{ name: "", phone: business.whatsapp.trim() }] : []
}

/** Limpia la lista del formulario: saca filas sin número y espacios de más. */
export function cleanWhatsappContacts(list: WhatsappContact[]): WhatsappContact[] {
  return list
    .map((c) => ({ name: (c?.name ?? "").trim(), phone: (c?.phone ?? "").trim() }))
    .filter((c) => c.phone)
    .slice(0, MAX_WHATSAPP_CONTACTS)
}
