"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { CheckCircle, XCircle, Clock, User, Store, Tag } from "lucide-react"
import { BusinessCategory } from "@/types/database"
import { GASTRONOMY_CATEGORIES } from "@/lib/constants/gastronomyCategories"
import { sendEmail, approvedEmailHtml, rejectedEmailHtml } from "@/lib/email"

interface PendingRegistration {
  id: string
  user_id: string
  email: string
  full_name: string | null
  business_name: string
  phone: string | null
  category: string | null
  created_at: string
}

const toSlug = (name: string) =>
  name.toLowerCase().normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .trim()

const generateSlug = async (name: string, supabase: ReturnType<typeof createClient>) => {
  let slug = toSlug(name)
  let counter = 1
  while (true) {
    const { data } = await supabase.from("businesses").select("id").eq("slug", slug).maybeSingle()
    if (!data) return slug
    slug = `${toSlug(name)}-${counter}`
    counter++
  }
}

// Resuelve la categoría elegida por el negocio a un valor válido del enum;
// si falta o quedó un valor viejo/inválido, cae a "other" en vez de bloquear el alta.
const resolveCategory = (category: string | null): BusinessCategory =>
  (GASTRONOMY_CATEGORIES.find(opt => opt.value === category)?.value as BusinessCategory) ?? "other"

const categoryLabel = (category: string | null): string =>
  GASTRONOMY_CATEGORIES.find(opt => opt.value === category)?.label ?? "Sin categoría"

export default function AdminSolicitudes() {
  const [registrations, setRegistrations] = useState<PendingRegistration[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)

  const fetchRegistrations = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("pending_registrations")
      .select("*")
      .order("created_at", { ascending: false })
    setRegistrations((data as PendingRegistration[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchRegistrations() }, [])

  const handleApprove = async (reg: PendingRegistration) => {
    setProcessing(reg.id)
    const supabase = createClient()

    const slug = await generateSlug(reg.business_name, supabase)

    const { data: newBusiness, error } = await supabase.from("businesses").insert({
      name: reg.business_name,
      slug,
      owner_id: reg.user_id,
      section: "gastronomy",
      type: "gastronomy",
      category: resolveCategory(reg.category),
      status: "active",
      is_open: false,
      phone: reg.phone || null,
    }).select("id").single()

    if (error) {
      alert("Error al aprobar: " + error.message)
      setProcessing(null)
      return
    }

    if (newBusiness) {
      const { data: existingSub } = await supabase
        .from("subscriptions")
        .select("id")
        .eq("business_id", newBusiness.id)
        .maybeSingle()

      if (!existingSub) {
        const today = new Date()
        const periodEnd = new Date(today)
        periodEnd.setDate(periodEnd.getDate() + 30)

        const { error: subError } = await supabase.from("subscriptions").insert({
          business_id: newBusiness.id,
          status: "trial",
          billing_cycle: "monthly",
          price: 0,
          current_period_start: today.toISOString().split("T")[0],
          current_period_end: periodEnd.toISOString().split("T")[0],
          notes: "Alta por solicitud gastronómica",
        })

        if (subError) {
          console.error("Error al crear suscripción automática:", subError)
          alert("Negocio creado pero no se pudo crear la suscripción, creala manualmente")
        }
      }
    }

    await supabase.from("pending_registrations").delete().eq("id", reg.id)
    setRegistrations(prev => prev.filter(r => r.id !== reg.id))
    setProcessing(null)

    sendEmail({
      to: reg.email,
      subject: "¡Tu negocio ya está activo en Calamuchita App! 🎉",
      html: approvedEmailHtml({
        businessName: reg.business_name,
        profileUrl: `${window.location.origin}/negocios/${slug}`,
      }),
    })
  }

  const handleReject = async (reg: PendingRegistration) => {
    if (!confirm(`¿Rechazar la solicitud de ${reg.business_name}?`)) return
    setProcessing(reg.id)
    const supabase = createClient()
    await supabase.from("pending_registrations").delete().eq("id", reg.id)
    setRegistrations(prev => prev.filter(r => r.id !== reg.id))
    setProcessing(null)

    sendEmail({
      to: reg.email,
      subject: "Tu solicitud en Calamuchita App",
      html: rejectedEmailHtml({ businessName: reg.business_name }),
    })
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl text-stone-800 mb-1">Solicitudes de alta</h1>
        <p className="text-stone-500 text-sm">Nuevos gastronómicos que se registraron y esperan aprobación.</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-stone-200 h-28 animate-pulse" />
          ))}
        </div>
      ) : registrations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
          <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <CheckCircle size={22} className="text-green-500" />
          </div>
          <p className="text-stone-600 font-medium">Sin solicitudes pendientes</p>
          <p className="text-stone-400 text-sm mt-1">Todas las solicitudes fueron procesadas.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {registrations.map(reg => (
            <div key={reg.id} className="bg-white rounded-2xl border border-stone-200 p-5">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Store size={18} style={{ color: "#c8603a" }} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-stone-800">{reg.business_name}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <User size={11} className="text-stone-400 flex-shrink-0" />
                      <p className="text-xs text-stone-500 break-all">{reg.full_name || "Sin nombre"} · {reg.email}</p>
                    </div>
                    {reg.phone && (
                      <p className="text-xs text-stone-400 mt-0.5">Tel: {reg.phone}</p>
                    )}
                    <div className="flex items-center gap-1 mt-2">
                      <Clock size={10} className="text-stone-300" />
                      <p className="text-[11px] text-stone-400">{formatDate(reg.created_at)}</p>
                    </div>
                    <div className="mt-3">
                      <label className="block text-[10px] font-medium text-stone-400 uppercase tracking-wider mb-1">
                        Categoría elegida
                      </label>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-stone-50 border border-stone-100">
                        <Tag size={11} className="text-stone-400" />
                        <span className="text-xs font-medium text-stone-700">{categoryLabel(reg.category)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:flex-shrink-0">
                  <button
                    onClick={() => handleReject(reg)}
                    disabled={processing === reg.id}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-stone-200 text-stone-500 hover:border-red-200 hover:text-red-500 transition-colors disabled:opacity-40"
                  >
                    <XCircle size={13} />
                    Rechazar
                  </button>
                  <button
                    onClick={() => handleApprove(reg)}
                    disabled={processing === reg.id}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-primary-500 text-white hover:bg-primary-400 transition-colors disabled:opacity-40"
                  >
                    <CheckCircle size={13} />
                    {processing === reg.id ? "Aprobando..." : "Aprobar"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
