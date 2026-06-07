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

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return "Buenos dÃ­as"
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

      if (!business) { setLoading(false); return }

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

      // MenÃº del dÃ­a
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
          {greeting()} ðŸ‘‹
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
                style={{ background: "rgba(45,69,48,0.1)" }}>
                <ShoppingBag size={16} style={{ color: "#2D4530" }} />
              </div>
              <p className="text-xs text-stone-400 uppercase tracking-wider">Pedidos hoy</p>
            </div>
            <p className="text-3xl font-serif text-stone-800">{stats.ordersToday}</p>
            {stats.revenueToday > 0 && (
              <p className="text-xs mt-1" style={{ color: "#2D4530" }}>
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
                style={{ background: "rgba(45,69,48,0.1)" }}>
                <CalendarDays size={16} style={{ color: "#2D4530" }} />
              </div>
              <p className="text-xs text-stone-400 uppercase tracking-wider">Reservas hoy</p>
            </div>
            <p className="text-3xl font-serif text-stone-800">{stats.reservationsToday}</p>
          </motion.div>
        </Link>

        {/* MenÃº del dÃ­a */}
        <Link href="/dashboard/menu-del-dia">
          <motion.div
            whileHover={{ y: -2 }}
            className="bg-white rounded-2xl border border-stone-200 p-6 cursor-pointer hover:border-stone-300 transition-colors"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(45,69,48,0.1)" }}>
                <UtensilsCrossed size={16} style={{ color: "#2D4530" }} />
              </div>
              <p className="text-xs text-stone-400 uppercase tracking-wider">MenÃº del dÃ­a</p>
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
          <TrendingUp size={16} style={{ color: "#2D4530" }} />
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
              Los clientes pueden ver si estÃ¡s abierto
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-stone-400">{isOpen ? "Abierto" : "Cerrado"}</span>
            <button
              onClick={handleToggleOpen}
              disabled={togglingOpen}
              className="relative w-12 h-6 rounded-full transition-all duration-300 disabled:opacity-50"
              style={{ background: isOpen ? "#2D4530" : "#d1d5db" }}
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
              style={{ color: "#2D4530" }}>
              Ver todos â†’
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
                    {order.type === "delivery" ? "ðŸšš Delivery" : "ðŸƒ Take away"} Â· {formatTime(order.created_at)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold" style={{ color: "#2D4530" }}>
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
