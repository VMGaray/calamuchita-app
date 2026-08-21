import { NextResponse } from "next/server"
import { Resend } from "resend"
import { createClient } from "@/lib/supabase/server"
import { newRegistrationEmailHtml, approvedEmailHtml, rejectedEmailHtml } from "@/lib/email"

// Fijo a propósito: el cliente nunca elige el destinatario de esta notificación.
const ADMIN_NOTIFY_EMAIL = "vmg.setup.ai@gmail.com"

type EmailPayload =
  | {
      type: "new_registration"
      businessName: string
      fullName: string
      email: string
      phone: string | null
      category: string | null
      adminUrl: string
    }
  | { type: "approved"; to: string; businessName: string; profileUrl: string }
  | { type: "rejected"; to: string; businessName: string }

/**
 * Este endpoint NUNCA acepta `to`/`html` libres del cliente: solo un `type`
 * predefinido + datos mínimos. El destinatario y el HTML se arman acá adentro
 * a partir de templates fijos, para que no pueda usarse como relay abierto
 * de correo. Toda solicitud requiere sesión de Supabase activa.
 */
export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "RESEND_API_KEY no configurada" }, { status: 500 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const body = (await request.json().catch(() => null)) as Partial<EmailPayload> | null
  if (!body?.type) {
    return NextResponse.json({ error: "Falta 'type'" }, { status: 400 })
  }

  let to: string
  let subject: string
  let html: string

  switch (body.type) {
    case "new_registration": {
      if (!body.businessName || !body.fullName || !body.email || !body.adminUrl) {
        return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
      }
      to = ADMIN_NOTIFY_EMAIL
      subject = `Nueva solicitud de registro — ${body.businessName}`
      html = newRegistrationEmailHtml({
        businessName: body.businessName,
        fullName: body.fullName,
        email: body.email,
        phone: body.phone ?? null,
        category: body.category ?? null,
        createdAt: new Date().toLocaleString("es-AR"),
        adminUrl: body.adminUrl,
      })
      break
    }

    case "approved":
    case "rejected": {
      // Solo un admin puede disparar el email de aprobación/rechazo de un negocio.
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle()

      if (profile?.role !== "admin") {
        return NextResponse.json({ error: "No autorizado" }, { status: 403 })
      }
      if (!body.to || !body.businessName) {
        return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
      }

      to = body.to
      if (body.type === "approved") {
        if (!body.profileUrl) {
          return NextResponse.json({ error: "Falta 'profileUrl'" }, { status: 400 })
        }
        subject = "¡Tu negocio ya está activo en Calamuchita App! 🎉"
        html = approvedEmailHtml({ businessName: body.businessName, profileUrl: body.profileUrl })
      } else {
        subject = "Tu solicitud en Calamuchita App"
        html = rejectedEmailHtml({ businessName: body.businessName })
      }
      break
    }

    default:
      return NextResponse.json({ error: "Tipo de email inválido" }, { status: 400 })
  }

  const resend = new Resend(apiKey)
  const { data, error } = await resend.emails.send({
    from: "Calamuchita App <onboarding@resend.dev>",
    to,
    subject,
    html,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 502 })
  }

  return NextResponse.json({ id: data?.id })
}
