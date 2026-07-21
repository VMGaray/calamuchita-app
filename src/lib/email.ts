interface SendEmailParams {
  to: string
  subject: string
  html: string
}

/**
 * Dispara el envío de un email vía /api/send-email. Nunca lanza —
 * un fallo de mail no debe romper el flujo de registro/aprobación/rechazo.
 */
export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<void> {
  try {
    await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, subject, html }),
    })
  } catch (e) {
    console.error("No se pudo enviar el email:", e)
  }
}

const wrapper = (title: string, bodyHtml: string) => `
  <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #F0EBE0;">
    <p style="font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; color: #2D4530; font-weight: 700; margin: 0 0 16px;">
      Calamuchita App
    </p>
    <h1 style="font-size: 20px; color: #2D4530; margin: 0 0 16px;">${title}</h1>
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
      <strong>Negocio:</strong> ${opts.businessName}<br/>
      <strong>Nombre:</strong> ${opts.fullName}<br/>
      <strong>Email:</strong> ${opts.email}<br/>
      <strong>Teléfono:</strong> ${opts.phone ?? "—"}<br/>
      <strong>Categoría:</strong> ${opts.category ?? "—"}<br/>
      <strong>Fecha:</strong> ${opts.createdAt}
    </p>
    <a href="${opts.adminUrl}" style="display: inline-block; margin-top: 12px; padding: 10px 20px; background: #2D4530; color: #E1DBC9; text-decoration: none; border-radius: 10px; font-size: 14px; font-weight: 600;">
      Ver en el panel admin
    </a>
  `)
}

export function approvedEmailHtml(opts: { businessName: string; profileUrl: string }) {
  return wrapper("¡Tu negocio ya está activo! 🎉", `
    <p style="font-size: 14px; color: #444; line-height: 1.6;">
      Hola, ¡buenas noticias! <strong>${opts.businessName}</strong> ya fue aprobado y está
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
      Hola, te escribimos sobre la solicitud de <strong>${opts.businessName}</strong> en
      Calamuchita App. Por el momento no pudimos activar tu cuenta.
    </p>
    <p style="font-size: 14px; color: #444; line-height: 1.6;">
      Si creés que fue un error o querés más información, respondé este email y te ayudamos.
    </p>
  `)
}
