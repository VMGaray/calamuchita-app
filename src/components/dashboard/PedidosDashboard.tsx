"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { motion, AnimatePresence } from "framer-motion"
import { ShoppingBag, Clock, CheckCircle, XCircle, Truck, RefreshCw } from "lucide-react"
import { SkeletonList } from "@/components/ui/Skeleton"

interface OrderItem {
  id: string
  item_name: string
  item_price: number
  quantity: number
}

interface Order {
  id: string
  type: "delivery" | "takeaway"
  status: "pending" | "confirmed" | "ready" | "delivered" | "cancelled"
  total: number
  notes: string | null
  customer_name: string | null
  customer_phone: string | null
  delivery_address: string | null
  created_at: string
  order_items: OrderItem[]
}

const STATUS_CONFIG = {
  pending: {
    label: "Pendiente",
    color: "bg-amber-100 text-amber-700",
    icon: Clock,
  },
  confirmed: {
    label: "Confirmado",
    color: "bg-blue-100 text-blue-700",
    icon: CheckCircle,
  },
  ready: {
    label: "Listo",
    color: "bg-green-100 text-green-700",
    icon: CheckCircle,
  },
  delivered: {
    label: "Entregado",
    color: "bg-stone-100 text-stone-500",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Cancelado",
    color: "bg-red-100 text-red-500",
    icon: XCircle,
  },
}

const STATUS_FLOW: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["ready", "cancelled"],
  ready: ["delivered"],
  delivered: [],
  cancelled: [],
}

const STATUS_LABELS: Record<string, string> = {
  confirmed: "Confirmar",
  ready: "Marcar listo",
  delivered: "Marcar entregado",
  cancelled: "Cancelar",
}

export default function PedidosDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("active")
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)

  const fetchOrders = useCallback(async (bizId: string) => {
    const supabase = createClient()
    const { data } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("business_id", bizId)
      .order("created_at", { ascending: false })
    setOrders((data as Order[]) || [])
  }, [])

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: business } = await supabase
        .from("businesses")
        .select("id")
        .eq("owner_id", user.id)
        .single()

      if (!business) { setLoading(false); return }

      setBusinessId(business.id)
      await fetchOrders(business.id)
      setLoading(false)

      // Realtime — escuchar nuevos pedidos
      const channel = supabase
        .channel("orders-channel")
        .on("postgres_changes", {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `business_id=eq.${business.id}`,
        }, () => {
          fetchOrders(business.id)
        })
        .subscribe()

      return () => { supabase.removeChannel(channel) }
    }
    init()
  }, [fetchOrders])

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(orderId)
    const supabase = createClient()
    await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId)
    setOrders(prev =>
      prev.map(o => o.id === orderId ? { ...o, status: newStatus as Order["status"] } : o)
    )
    setUpdatingStatus(null)
  }

  const filteredOrders = orders.filter(o => {
    if (filter === "active") return ["pending", "confirmed", "ready"].includes(o.status)
    if (filter === "done") return ["delivered", "cancelled"].includes(o.status)
    return true
  })

  const pendingCount = orders.filter(o => o.status === "pending").length

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    if (diffMin < 1) return "Ahora"
    if (diffMin < 60) return `hace ${diffMin} min`
    return date.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })
  }

  if (loading) return <div className="max-w-2xl"><SkeletonList count={3} /></div>

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl text-stone-800">Pedidos</h1>
            {pendingCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 animate-pulse">
                {pendingCount} nuevo{pendingCount > 1 ? "s" : ""}
              </span>
            )}
          </div>
          <p className="text-stone-500 text-sm">Los pedidos se actualizan en tiempo real</p>
        </div>
        <button
          onClick={() => businessId && fetchOrders(businessId)}
          className="w-9 h-9 rounded-xl border border-stone-200 flex items-center justify-center text-stone-400 hover:bg-stone-100 transition-colors"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-6">
        {[
          { key: "active", label: "Activos" },
          { key: "done", label: "Finalizados" },
          { key: "all", label: "Todos" },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={
              filter === f.key
                ? { background: "#c8603a", color: "white" }
                : { background: "white", color: "rgba(42,26,8,0.5)", border: "1px solid rgba(200,96,58,0.15)" }
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Lista de pedidos */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
          <ShoppingBag size={40} className="mx-auto text-stone-300 mb-3" />
          <p className="text-stone-500 text-sm">
            {filter === "active" ? "No hay pedidos activos" : "No hay pedidos"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filteredOrders.map(order => {
              const config = STATUS_CONFIG[order.status]
              const StatusIcon = config.icon
              const nextStatuses = STATUS_FLOW[order.status]
              const isExpanded = expandedOrder === order.id

              return (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="bg-white rounded-2xl border border-stone-200 overflow-hidden"
                  style={
                    order.status === "pending"
                      ? { borderColor: "rgba(200,96,58,0.3)", boxShadow: "0 0 0 3px rgba(200,96,58,0.06)" }
                      : {}
                  }
                >
                  {/* Header del pedido */}
                  <button
                    onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                    className="w-full flex items-center gap-4 px-5 py-4 text-left"
                  >
                    {/* Ícono tipo */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(200,96,58,0.08)" }}
                    >
                      {order.type === "delivery"
                        ? <Truck size={18} style={{ color: "#c8603a" }} />
                        : <ShoppingBag size={18} style={{ color: "#c8603a" }} />
                      }
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold text-stone-800 truncate">
                          {order.customer_name || "Cliente"}
                        </p>
                        <span className="text-xs text-stone-400 flex-shrink-0">
                          {formatTime(order.created_at)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-stone-400">
                          {order.type === "delivery" ? "Delivery" : "Take away"} ·{" "}
                          {order.order_items?.length} producto{order.order_items?.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <p className="text-sm font-semibold" style={{ color: "#c8603a" }}>
                        ${order.total.toLocaleString("es-AR")}
                      </p>
                      <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${config.color}`}>
                        <StatusIcon size={11} />
                        {config.label}
                      </span>
                    </div>
                  </button>

                  {/* Detalle expandido */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-stone-100 px-5 py-4 space-y-4">

                          {/* Datos del cliente */}
                          <div className="grid grid-cols-2 gap-3">
                            {order.customer_phone && (
                              <a
                                href={`tel:${order.customer_phone}`}
                                className="flex flex-col gap-0.5 p-3 rounded-xl bg-stone-50 hover:bg-stone-100 transition-colors"
                              >
                                <span className="text-xs text-stone-400">Teléfono</span>
                                <span className="text-sm font-medium text-stone-700">{order.customer_phone}</span>
                              </a>
                            )}
                            {order.delivery_address && (
                              <div className="flex flex-col gap-0.5 p-3 rounded-xl bg-stone-50">
                                <span className="text-xs text-stone-400">Dirección</span>
                                <span className="text-sm font-medium text-stone-700">{order.delivery_address}</span>
                              </div>
                            )}
                          </div>

                          {/* Items */}
                          <div>
                            <p className="text-xs text-stone-400 uppercase tracking-wider mb-2">Productos</p>
                            <div className="space-y-1.5">
                              {order.order_items?.map(item => (
                                <div key={item.id} className="flex justify-between text-sm">
                                  <span className="text-stone-600">
                                    {item.quantity}x {item.item_name}
                                  </span>
                                  <span className="text-stone-700 font-medium">
                                    ${(item.item_price * item.quantity).toLocaleString("es-AR")}
                                  </span>
                                </div>
                              ))}
                              <div className="flex justify-between text-sm font-semibold pt-2 border-t border-stone-100 mt-2">
                                <span style={{ color: "#2a1a08" }}>Total</span>
                                <span style={{ color: "#c8603a" }}>${order.total.toLocaleString("es-AR")}</span>
                              </div>
                            </div>
                          </div>

                          {/* Notas */}
                          {order.notes && (
                            <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                              <p className="text-xs text-amber-600 font-medium mb-0.5">Nota del cliente</p>
                              <p className="text-sm text-amber-700">{order.notes}</p>
                            </div>
                          )}

                          {/* Acciones de estado */}
                          {nextStatuses.length > 0 && (
                            <div className="flex gap-2 pt-1">
                              {nextStatuses.map(nextStatus => (
                                <button
                                  key={nextStatus}
                                  onClick={() => handleUpdateStatus(order.id, nextStatus)}
                                  disabled={updatingStatus === order.id}
                                  className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
                                  style={
                                    nextStatus === "cancelled"
                                      ? { background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }
                                      : { background: "#c8603a", color: "white" }
                                  }
                                >
                                  {updatingStatus === order.id ? "..." : STATUS_LABELS[nextStatus]}
                                </button>
                              ))}
                            </div>
                          )}

                          {/* WhatsApp directo al cliente */}
                          {order.customer_phone && (
                            <a
                              href={`https://wa.me/${order.customer_phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hola ${order.customer_name}, tu pedido está ${STATUS_CONFIG[order.status].label.toLowerCase()}! 🙌`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium transition-colors"
                              style={{ background: "rgba(37,211,102,0.1)", color: "#25D366", border: "1px solid rgba(37,211,102,0.2)" }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.526 5.845L.057 23.545a.75.75 0 0 0 .921.921l5.701-1.469A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.695 9.695 0 0 1-4.964-1.366l-.355-.212-3.686.949.969-3.682-.231-.366A9.712 9.712 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/>
                              </svg>
                              Contactar cliente
                            </a>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}