"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Eye, MessageCircle, Phone, CalendarDays, ShoppingBag, TrendingUp, Users } from "lucide-react"

interface Stats {
  totalViews: number
  // este mes
  ordersMonth: number
  revenueMonth: number
  reservasMonth: number
  // Ãºltimos 30 dÃ­as â€” leads por tipo
  leadsWhatsapp: number
  leadsPhone: number
  leadsReserva: number
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType
  label: string
  value: string | number
  sub?: string
  color: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
          <Icon size={16} style={{ color }} />
        </div>
        <p className="text-xs text-stone-400 uppercase tracking-wider">{label}</p>
      </div>
      <p className="text-3xl font-serif text-stone-800">{value}</p>
      {sub && <p className="text-xs mt-1" style={{ color }}>{sub}</p>}
    </div>
  )
}

export default function EstadisticasDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [monthLabel, setMonthLabel] = useState("")

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: biz } = await supabase
        .from("businesses")
        .select("id, total_views")
        .eq("owner_id", user.id)
        .single()

      if (!biz) { setLoading(false); return }

      const now = new Date()
      setMonthLabel(now.toLocaleDateString("es-AR", { month: "long", year: "numeric" }))

      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

      const [ordersRes, reservasRes, leadsRes] = await Promise.all([
        supabase
          .from("orders")
          .select("total, status")
          .eq("business_id", biz.id)
          .gte("created_at", startOfMonth)
          .neq("status", "cancelled"),

        supabase
          .from("reservations")
          .select("id", { count: "exact", head: true })
          .eq("business_id", biz.id)
          .gte("created_at", startOfMonth)
          .neq("status", "cancelled"),

        supabase
          .from("business_leads")
          .select("type")
          .eq("business_id", biz.id)
          .gte("created_at", thirtyDaysAgo),
      ])

      const orders = ordersRes.data ?? []
      const leads = leadsRes.data ?? []

      setStats({
        totalViews: biz.total_views ?? 0,
        ordersMonth: orders.length,
        revenueMonth: orders.reduce((sum, o) => sum + (o.total ?? 0), 0),
        reservasMonth: reservasRes.count ?? 0,
        leadsWhatsapp: leads.filter(l => l.type === "whatsapp").length,
        leadsPhone: leads.filter(l => l.type === "phone").length,
        leadsReserva: leads.filter(l => l.type === "reserva").length,
      })

      setLoading(false)
    }

    load()
  }, [])

  if (loading) {
    return (
      <div className="max-w-3xl space-y-4">
        <div className="h-8 w-48 bg-stone-200 rounded-full animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-stone-200 h-28 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="max-w-3xl">
        <p className="text-stone-400 text-sm">No se encontrÃ³ el negocio vinculado a tu cuenta.</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl text-stone-800 mb-1">EstadÃ­sticas</h1>
        <p className="text-stone-500 text-sm">Resumen de la actividad de tu negocio</p>
      </div>

      {/* Perfil */}
      <div className="mb-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-3">Perfil pÃºblico â€” histÃ³rico</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <StatCard
          icon={Eye}
          label="Visitas al perfil"
          value={stats.totalViews.toLocaleString("es-AR")}
          sub="Total de veces que vieron tu negocio"
          color="#6B7B84"
        />
        <StatCard
          icon={Users}
          label="Contactos generados"
          value={(stats.leadsWhatsapp + stats.leadsPhone + stats.leadsReserva).toLocaleString("es-AR")}
          sub="Ãšltimos 30 dÃ­as"
          color="#2D4530"
        />
      </div>

      {/* Este mes */}
      <div className="mb-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-3 capitalize">
          Este mes â€” {monthLabel}
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          icon={ShoppingBag}
          label="Pedidos"
          value={stats.ordersMonth}
          sub={stats.revenueMonth > 0 ? `$${stats.revenueMonth.toLocaleString("es-AR")} facturado` : undefined}
          color="#2D4530"
        />
        <StatCard
          icon={TrendingUp}
          label="FacturaciÃ³n"
          value={`$${stats.revenueMonth.toLocaleString("es-AR")}`}
          sub="Solo pedidos activos"
          color="#2D4530"
        />
        <StatCard
          icon={CalendarDays}
          label="Reservas"
          value={stats.reservasMonth}
          color="#6B7B84"
        />
      </div>

      {/* Contactos */}
      <div className="mb-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-3">Contactos â€” Ãºltimos 30 dÃ­as</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={MessageCircle}
          label="Clicks a WhatsApp"
          value={stats.leadsWhatsapp}
          sub="Desde tu pÃ¡gina pÃºblica"
          color="#25D366"
        />
        <StatCard
          icon={Phone}
          label="Clicks al telÃ©fono"
          value={stats.leadsPhone}
          sub="Desde tu pÃ¡gina pÃºblica"
          color="#6B7B84"
        />
        <StatCard
          icon={CalendarDays}
          label="Pedidos de reserva"
          value={stats.leadsReserva}
          sub="Formulario de reserva enviado"
          color="#2D4530"
        />
      </div>
    </div>
  )
}
