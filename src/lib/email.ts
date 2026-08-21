/**
 * Envío de emails transaccionales. Las funciones de acá NUNCA mandan `to`/`html`
 * libres a la API: solo un `type` + los datos mínimos. El endpoint
 * /api/send-email es el que decide el destinatario y arma el HTML,
 * para que no pueda usarse como relay abierto de correo.
 */
async function postEmail(payload: Record<string, unknown>): Promise<void> {
  try {
    const res = await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: res.statusText }))
      console.error("No se pudo enviar el email:", error)
    }
  } catch (e) {
    // Un fallo de mail no debe romper el flujo de registro/aprobación/rechazo.
    console.error("No se pudo enviar el email:", e)
  }
}

export function sendNewRegistrationNotification(opts: {
  businessName: string
  fullName: string
  email: string
  phone: string | null
  category: string | null
  adminUrl: string
}): Promise<void> {
  return postEmail({ type: "new_registration", ...opts })
}

export function sendApprovedEmail(opts: {
  to: string
  businessName: string
  profileUrl: string
}): Promise<void> {
  return postEmail({ type: "approved", ...opts })
}

export function sendRejectedEmail(opts: {
  to: string
  businessName: string
}): Promise<void> {
  return postEmail({ type: "rejected", ...opts })
}

// ─── Templates (usados server-side por /api/send-email) ───────────────────

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

const wrapper = (title: string, bodyHtml: string) => `
  <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #F0EBE0;">
    <p style="font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; color: #2D4530; font-weight: 700; margin: 0 0 16px;">
      Calamuchita App
    </p>
    <h1 style="font-size: 20px; color: #2D4530; margin: 0 0 16px;">${escapeHtml(title)}</h1>
    ${bodyHtml}
  </div>
`

export function newRegistrationEmailHtml(opts: {
  businessName: string
  fullName: string
  email: string
  phone: string | null
  category: string | null
  createdAt: string
  adminUrl: string
}) {
  return wrapper("Nueva solicitud de registro", `
    <p style="font-size: 14px; color: #444; line-height: 1.6;">
      <strong>Negocio:</strong> ${escapeHtml(opts.businessName)}<br/>
      <strong>Nombre:</strong> ${escapeHtml(opts.fullName)}<br/>
      <strong>Email:</strong> ${escapeHtml(opts.email)}<br/>
      <strong>Teléfono:</strong> ${escapeHtml(opts.phone ?? "—")}<br/>
      <strong>Categoría:</strong> ${escapeHtml(opts.category ?? "—")}<br/>
      <strong>Fecha:</strong> ${escapeHtml(opts.createdAt)}
    </p>
    <a href="${opts.adminUrl}" style="display: inline-block; margin-top: 12px; padding: 10px 20px; background: #2D4530; color: #E1DBC9; text-decoration: none; border-radius: 10px; font-size: 14px; font-weight: 600;">
      Ver en el panel admin
    </a>
  `)
}

export function approvedEmailHtml(opts: { businessName: string; profileUrl: string }) {
  return wrapper("¡Tu negocio ya está activo! 🎉", `
    <p style="font-size: 14px; color: #444; line-height: 1.6;">
      Hola, ¡buenas noticias! <strong>${escapeHtml(opts.businessName)}</strong> ya fue aprobado y está
      visible para toda la comunidad del Valle de Calamuchita en la app.
    </p>
    <a href="${opts.profileUrl}" style="display: inline-block; margin-top: 12px; padding: 10px 20px; background: #2D4530; color: #E1DBC9; text-decoration: none; border-radius: 10px; font-size: 14px; font-weight: 600;">
      Ver mi perfil en la app
    </a>
  `)
}

export function rejectedEmailHtml(opts: { businessName: string }) {
  return wrapper("Tu solicitud en Calamuchita App", `
    <p style="font-size: 14px; color: #444; line-height: 1.6;">
      Hola, te escribimos sobre la solicitud de <strong>${escapeHtml(opts.businessName)}</strong> en
      Calamuchita App. Por el momento no pudimos activar tu cuenta.
    </p>
    <p style="font-size: 14px; color: #444; line-height: 1.6;">
      Si creés que fue un error o querés más información, respondé este email y te ayudamos.
    </p>
  `)
}
