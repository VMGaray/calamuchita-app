"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { motion } from "framer-motion"
import { ShoppingBag, CalendarDays, UtensilsCrossed, TrendingUp, Clock } from "lucide-react"
import Link from "next/link"

interface Stats {
  ordersToday: number
  ordersPending: number
  reservationsToday: number
  reservationsPending: number
  menuPublished: boolean
  totalOrdersMonth: number
  revenueToday: number
}

interface RecentOrder {
  id: string
  customer_name: string | null
  type: "delivery" | "takeaway"
  total: number
  status: string
  created_at: string
}

export default function DashboardHome() {
  const [stats, setStats] = useState<Stats>({
    ordersToday: 0,
    ordersPending: 0,
    reservationsToday: 0,
    reservationsPending: 0,
    menuPublished: false,
    totalOrdersMonth: 0,
    revenueToday: 0,
  })
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [businessName, setBusinessName] = useState("")
  const [loading, setLoading] = useState(true)
  const [togglingOpen, setTogglingOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [pendingUserId, setPendingUserId] = useState<string | null>(null)
  const [pendingUserName, setPendingUserName] = useState("")
  const [pendingUserEmail, setPendingUserEmail] = useState("")

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return "Buenos días"
    if (h < 19) return "Buenas tardes"
    return "Buenas noches"
  }

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: business } = await supabase
        .from("businesses")
        .select("id, name, is_open")
        .eq("owner_id", user.id)
        .single()

      if (!business) {
        const isBusiness = user.user_metadata?.role === "business"
        if (isBusiness) {
          setPendingUserId(user.id)
          setPendingUserName(user.user_metadata?.full_name || "")
          setPendingUserEmail(user.email || "")
          setIsPending(true)
        }
        setLoading(false)
        return
      }

      setBusinessId(business.id)
      setBusinessName(business.name)
      setIsOpen(business.is_open)

      const today = new Date().toISOString().split("T")[0]
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

      // Pedidos de hoy
      const { data: ordersToday } = await supabase
        .from("orders")
        .select("id, customer_name, type, total, status, created_at")
        .eq("business_id", business.id)
        .gte("created_at", today)
        .order("created_at", { ascending: false })

      // Pedidos del mes
      const { count: monthCount } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("business_id", business.id)
        .gte("created_at", startOfMonth)

      // Reservas de hoy
      const { data: reservationsToday } = await supabase
        .from("reservations")
        .select("id, status")
        .eq("business_id", business.id)
        .eq("date", today)

      // Menú del día
      const { data: menu } = await supabase
        .from("daily_menus")
        .select("is_published")
        .eq("business_id", business.id)
        .eq("date", today)
        .single()

      const todayOrders = ordersToday || []
      const todayReservations = reservationsToday || []

      setStats({
        ordersToday: todayOrders.length,
        ordersPending: todayOrders.filter(o => o.status === "pending").length,
        reservationsToday: todayReservations.length,
        reservationsPending: todayReservations.filter(r => r.status === "pending").length,
        menuPublished: menu?.is_published || false,
        totalOrdersMonth: monthCount || 0,
        revenueToday: todayOrders.reduce((sum, o) => sum + (o.total || 0), 0),
      })

      setRecentOrders(todayOrders.slice(0, 4) as RecentOrder[])
      setLoading(false)
    }

    fetchData()
  }, [])

  // Realtime: cuando admin aprueba crea un business con owner_id=user → unlock automático
  useEffect(() => {
    if (!isPending || !pendingUserId) return
    const supabase = createClient()
    const channel = supabase
      .channel("business-approval")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "businesses", filter: `owner_id=eq.${pendingUserId}` },
        (payload) => {
          const biz = payload.new as { id: string; name: string; is_open: boolean }
          setBusinessId(biz.id)
          setBusinessName(biz.name)
          setIsOpen(biz.is_open)
          setIsPending(false)
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [isPending, pendingUserId])

  const handleToggleOpen = async () => {
    if (!businessId) return
    setTogglingOpen(true)
    const supabase = createClient()
    await supabase
      .from("businesses")
      .update({ is_open: !isOpen })
      .eq("id", businessId)
    setIsOpen(o => !o)
    setTogglingOpen(false)
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const diffMin = Math.floor((Date.now() - date.getTime()) / 60000)
    if (diffMin < 1) return "Ahora"
    if (diffMin < 60) return `hace ${diffMin} min`
    return date.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })
  }

  if (isPending) {
    const waMsg = encodeURIComponent(
      `Hola! Me registré en Calamuchita App como gastronómico y mi cuenta lleva más de 24hs pendiente de aprobación.\n\nNombre: ${pendingUserName || "—"}\nEmail: ${pendingUserEmail || "—"}`
    )
    const waLink = `https://wa.me/541145311047?text=${waMsg}`

    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 text-3xl"
          style={{ background: "rgba(200,96,58,0.08)" }}>
          ⏳
        </div>
        <h2 className="text-xl font-medium text-stone-800 mb-2">Tu cuenta está pendiente de aprobación</h2>
        <p className="text-sm text-stone-500 max-w-sm">
          Enviamos tu solicitud al equipo de Calamuchita App. En cuanto sea aprobada, esta pantalla se actualizará automáticamente y podrás gestionar tu negocio.
        </p>
        <p className="text-xs text-stone-400 mt-3">No hace falta que recargues la página.</p>

        <div className="mt-8 p-4 rounded-2xl border border-stone-200 bg-white max-w-sm w-full text-left">
          <p className="text-xs font-medium text-stone-600 mb-1">¿Ya pasaron las 24hs y no hay cambios?</p>
          <p className="text-xs text-stone-400 mb-3">
            Si tu solicitud sigue pendiente después de 24 horas, podés contactarnos directamente por WhatsApp.
          </p>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ background: "#25D366" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Consultar por WhatsApp
          </a>
        </div>
      </div>
    )
  }

  if (loading) return (
    <div className="space-y-4">
      <div className="h-8 w-48 bg-stone-200 rounded-full animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-2xl border border-stone-200 h-28 animate-pulse" />
        ))}
      </div>
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl text-stone-800 mb-1">
          {greeting()} 👋
        </h1>
        <p className="text-stone-500 text-sm">
          {businessName ? `Resumen de ${businessName} hoy` : "Resumen de tu local hoy"}
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

        {/* Pedidos hoy */}
        <Link href="/dashboard/pedidos">
          <motion.div
            whileHover={{ y: -2 }}
            className="bg-white rounded-2xl border border-stone-200 p-6 cursor-pointer hover:border-stone-300 transition-colors relative overflow-hidden"
          >
            {stats.ordersPending > 0 && (
              <div className="absolute top-4 right-4">
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 animate-pulse">
                  {stats.ordersPending} nuevo{stats.ordersPending > 1 ? "s" : ""}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(200,96,58,0.1)" }}>
                <ShoppingBag size={16} style={{ color: "#c8603a" }} />
              </div>
              <p className="text-xs text-stone-400 uppercase tracking-wider">Pedidos hoy</p>
            </div>
            <p className="text-3xl font-serif text-stone-800">{stats.ordersToday}</p>
            {stats.revenueToday > 0 && (
              <p className="text-xs mt-1" style={{ color: "#c8603a" }}>
                ${stats.revenueToday.toLocaleString("es-AR")} en ventas
              </p>
            )}
          </motion.div>
        </Link>

        {/* Reservas hoy */}
        <Link href="/dashboard/reservas">
          <motion.div
            whileHover={{ y: -2 }}
            className="bg-white rounded-2xl border border-stone-200 p-6 cursor-pointer hover:border-stone-300 transition-colors relative"
          >
            {stats.reservationsPending > 0 && (
              <div className="absolute top-4 right-4">
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 animate-pulse">
                  {stats.reservationsPending} pendiente{stats.reservationsPending > 1 ? "s" : ""}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(200,96,58,0.1)" }}>
                <CalendarDays size={16} style={{ color: "#c8603a" }} />
              </div>
              <p className="text-xs text-stone-400 uppercase tracking-wider">Reservas hoy</p>
            </div>
            <p className="text-3xl font-serif text-stone-800">{stats.reservationsToday}</p>
          </motion.div>
        </Link>

        {/* Menú del día */}
        <Link href="/dashboard/menu-del-dia">
          <motion.div
            whileHover={{ y: -2 }}
            className="bg-white rounded-2xl border border-stone-200 p-6 cursor-pointer hover:border-stone-300 transition-colors"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(200,96,58,0.1)" }}>
                <UtensilsCrossed size={16} style={{ color: "#c8603a" }} />
              </div>
              <p className="text-xs text-stone-400 uppercase tracking-wider">Menú del día</p>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${stats.menuPublished ? "bg-green-400" : "bg-stone-300"}`} />
              <p className="text-sm font-medium" style={{ color: stats.menuPublished ? "#16a34a" : "#78716c" }}>
                {stats.menuPublished ? "Publicado" : "Sin publicar"}
              </p>
            </div>
          </motion.div>
        </Link>
      </div>

      {/* Stat del mes */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp size={16} style={{ color: "#c8603a" }} />
          <p className="text-xs text-stone-400 uppercase tracking-wider">Este mes</p>
        </div>
        <p className="text-2xl font-serif text-stone-800">
          {stats.totalOrdersMonth}
          <span className="text-sm font-sans font-normal text-stone-400 ml-2">pedidos</span>
        </p>
      </div>

      {/* Toggle abierto/cerrado */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-stone-700">Estado del local</p>
            <p className="text-xs text-stone-400 mt-0.5">
              Los clientes pueden ver si estás abierto
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-stone-400">{isOpen ? "Abierto" : "Cerrado"}</span>
            <button
              onClick={handleToggleOpen}
              disabled={togglingOpen}
              className="relative w-12 h-6 rounded-full transition-all duration-300 disabled:opacity-50"
              style={{ background: isOpen ? "#c8603a" : "#d1d5db" }}
            >
              <motion.div
                className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                animate={{ x: isOpen ? 26 : 4 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Pedidos recientes */}
      {recentOrders.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock size={15} className="text-stone-400" />
              <p className="text-sm font-medium text-stone-700">Pedidos recientes</p>
            </div>
            <Link href="/dashboard/pedidos"
              className="text-xs font-medium transition-colors"
              style={{ color: "#c8603a" }}>
              Ver todos →
            </Link>
          </div>
          <div className="space-y-3">
            {recentOrders.map(order => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-stone-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-stone-700">
                    {order.customer_name || "Cliente"}
                  </p>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {order.type === "delivery" ? "🚚 Delivery" : "🏃 Take away"} · {formatTime(order.created_at)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold" style={{ color: "#c8603a" }}>
                    ${order.total.toLocaleString("es-AR")}
                  </p>
                  <p className="text-xs text-stone-400 mt-0.5 capitalize">{order.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}