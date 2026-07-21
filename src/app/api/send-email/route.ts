import { NextResponse } from "next/server"
import { Resend } from "resend"

interface SendEmailBody {
  to: string
  subject: string
  html: string
}

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "RESEND_API_KEY no configurada" }, { status: 500 })
  }

  const { to, subject, html } = (await request.json()) as Partial<SendEmailBody>
  if (!to || !subject || !html) {
    return NextResponse.json({ error: "Faltan campos: to, subject, html" }, { status: 400 })
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
