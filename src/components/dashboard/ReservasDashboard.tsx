"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { motion, AnimatePresence } from "framer-motion"
import { CalendarDays, Clock, Users, CheckCircle, XCircle, RefreshCw } from "lucide-react"
import { SkeletonList } from "@/components/ui/Skeleton"

interface Reservation {
  id: string
  date: string
  time: string
  party_size: number
  status: "pending" | "confirmed" | "cancelled"
  notes: string | null
  created_at: string
  profiles: {
    full_name: string | null
    phone: string | null
  } | null
}

const STATUS_CONFIG = {
  pending: {
    label: "Pendiente",
    color: "bg-amber-100 text-amber-700",
    icon: Clock,
  },
  confirmed: {
    label: "Confirmada",
    color: "bg-green-100 text-green-700",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Cancelada",
    color: "bg-red-100 text-red-500",
    icon: XCircle,
  },
}

const DAYS = ["Dom", "Lun", "Mar", "MiÃ©", "Jue", "Vie", "SÃ¡b"]
const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"]

export default function ReservasDashboard() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("upcoming")
  const [expandedRes, setExpandedRes] = useState<string | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)

  const fetchReservations = useCallback(async (bizId: string) => {
    const supabase = createClient()
    const { data } = await supabase
      .from("reservations")
      .select("*, profiles(full_name, phone)")
      .eq("business_id", bizId)
      .order("date", { ascending: true })
      .order("time", { ascending: true })
    setReservations((data as Reservation[]) || [])
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
      await fetchReservations(business.id)
      setLoading(false)

      // Realtime
      const channel = supabase
        .channel("reservations-channel")
        .on("postgres_changes", {
          event: "*",
          schema: "public",
          table: "reservations",
          filter: `business_id=eq.${business.id}`,
        }, () => fetchReservations(business.id))
        .subscribe()

      return () => { supabase.removeChannel(channel) }
    }
    init()
  }, [fetchReservations])

  const handleUpdateStatus = async (resId: string, newStatus: string) => {
    setUpdatingStatus(resId)
    const supabase = createClient()
    await supabase
      .from("reservations")
      .update({ status: newStatus })
      .eq("id", resId)
    setReservations(prev =>
      prev.map(r => r.id === resId ? { ...r, status: newStatus as Reservation["status"] } : r)
    )
    setUpdatingStatus(null)
  }

  const today = new Date().toISOString().split("T")[0]

  const filteredReservations = reservations.filter(r => {
    if (filter === "upcoming") return r.date >= today && r.status !== "cancelled"
    if (filter === "today") return r.date === today
    if (filter === "past") return r.date < today || r.status === "cancelled"
    return true
  })

  const pendingCount = reservations.filter(
    r => r.status === "pending" && r.date >= today
  ).length

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00")
    const isToday = dateStr === today
    const isTomorrow = dateStr === new Date(Date.now() + 86400000).toISOString().split("T")[0]
    if (isToday) return "Hoy"
    if (isTomorrow) return "MaÃ±ana"
    return `${DAYS[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()]}`
  }

  const formatTime = (timeStr: string) => timeStr.slice(0, 5)

  if (loading) return <div className="max-w-2xl"><SkeletonList count={3} /></div>

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl text-stone-800">Reservas</h1>
            {pendingCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 animate-pulse">
                {pendingCount} pendiente{pendingCount > 1 ? "s" : ""}
              </span>
            )}
          </div>
          <p className="text-stone-500 text-sm">Se actualizan en tiempo real</p>
        </div>
        <button
          onClick={() => businessId && fetchReservations(businessId)}
          className="w-9 h-9 rounded-xl border border-stone-200 flex items-center justify-center text-stone-400 hover:bg-stone-100 transition-colors"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-6">
        {[
          { key: "upcoming", label: "PrÃ³ximas" },
          { key: "today", label: "Hoy" },
          { key: "past", label: "Pasadas" },
          { key: "all", label: "Todas" },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={
              filter === f.key
                ? { background: "#2D4530", color: "white" }
                : { background: "white", color: "rgba(45,69,48,0.6)", border: "1px solid rgba(45,69,48,0.15)" }
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Lista */}
      {filteredReservations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
          <CalendarDays size={40} className="mx-auto text-stone-300 mb-3" />
          <p className="text-stone-500 text-sm">
            {filter === "upcoming" ? "No hay reservas prÃ³ximas" : "No hay reservas"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filteredReservations.map(res => {
              const config = STATUS_CONFIG[res.status]
              const StatusIcon = config.icon
              const isExpanded = expandedRes === res.id
              const isPast = res.date < today

              return (
                <motion.div
                  key={res.id}
                  layout
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="bg-white rounded-2xl border border-stone-200 overflow-hidden"
                  style={
                    res.status === "pending" && !isPast
                      ? { borderColor: "rgba(45,69,48,0.3)", boxShadow: "0 0 0 3px rgba(45,69,48,0.06)" }
                      : {}
                  }
                >
                  {/* Header */}
                  <button
                    onClick={() => setExpandedRes(isExpanded ? null : res.id)}
                    className="w-full flex items-center gap-4 px-5 py-4 text-left"
                  >
                    {/* Fecha */}
                    <div
                      className="w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0"
                      style={{ background: isPast ? "rgba(120,113,108,0.08)" : "rgba(45,69,48,0.08)" }}
                    >
                      <span className="text-xs font-medium" style={{ color: isPast ? "#78716c" : "#2D4530" }}>
                        {new Date(res.date + "T00:00:00").getDate()}
                      </span>
                      <span className="text-[10px]" style={{ color: isPast ? "#a8a29e" : "rgba(45,69,48,0.7)" }}>
                        {MONTHS[new Date(res.date + "T00:00:00").getMonth()]}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-stone-800 truncate">
                        {res.profiles?.full_name || "Cliente"}
                      </p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="flex items-center gap-1 text-xs text-stone-400">
                          <Clock size={10} />
                          {formatTime(res.time)}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-stone-400">
                          <Users size={10} />
                          {res.party_size} {res.party_size === 1 ? "persona" : "personas"}
                        </span>
                        <span className="text-xs text-stone-400">
                          {formatDate(res.date)}
                        </span>
                      </div>
                    </div>

                    <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${config.color}`}>
                      <StatusIcon size={11} />
                      {config.label}
                    </span>
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

                          {/* Info */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-0.5 p-3 rounded-xl bg-stone-50">
                              <span className="text-xs text-stone-400">Fecha y hora</span>
                              <span className="text-sm font-medium text-stone-700">
                                {formatDate(res.date)} Â· {formatTime(res.time)}
                              </span>
                            </div>
                            <div className="flex flex-col gap-0.5 p-3 rounded-xl bg-stone-50">
                              <span className="text-xs text-stone-400">Personas</span>
                              <span className="text-sm font-medium text-stone-700">
                                {res.party_size} {res.party_size === 1 ? "persona" : "personas"}
                              </span>
                            </div>
                            {res.profiles?.phone && (
                              <a
                                href={`tel:${res.profiles.phone}`}
                                className="flex flex-col gap-0.5 p-3 rounded-xl bg-stone-50 hover:bg-stone-100 transition-colors col-span-2"
                              >
                                <span className="text-xs text-stone-400">TelÃ©fono</span>
                                <span className="text-sm font-medium text-stone-700">{res.profiles.phone}</span>
                              </a>
                            )}
                          </div>

                          {/* Notas */}
                          {res.notes && (
                            <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                              <p className="text-xs text-amber-600 font-medium mb-0.5">Nota</p>
                              <p className="text-sm text-amber-700">{res.notes}</p>
                            </div>
                          )}

                          {/* Acciones */}
                          {res.status === "pending" && !isPast && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleUpdateStatus(res.id, "confirmed")}
                                disabled={updatingStatus === res.id}
                                className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
                                style={{ background: "#2D4530", color: "white" }}
                              >
                                {updatingStatus === res.id ? "..." : "Confirmar"}
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(res.id, "cancelled")}
                                disabled={updatingStatus === res.id}
                                className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
                                style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}
                              >
                                Cancelar
                              </button>
                            </div>
                          )}

                          {res.status === "confirmed" && !isPast && (
                            <button
                              onClick={() => handleUpdateStatus(res.id, "cancelled")}
                              disabled={updatingStatus === res.id}
                              className="w-full py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
                              style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}
                            >
                              Cancelar reserva
                            </button>
                          )}

                          {/* WhatsApp */}
                          {res.profiles?.phone && (
                            <a
                              href={`https://wa.me/${res.profiles.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                                res.status === "confirmed"
                                  ? `Hola ${res.profiles.full_name}, tu reserva para el ${formatDate(res.date)} a las ${formatTime(res.time)} estÃ¡ confirmada! Te esperamos ðŸ™Œ`
                                  : `Hola ${res.profiles.full_name}, te contactamos por tu reserva del ${formatDate(res.date)}.`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium"
                              style={{ background: "rgba(37,211,102,0.1)", color: "#25D366", border: "1px solid rgba(37,211,102,0.2)" }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.526 5.845L.057 23.545a.75.75 0 0 0 .921.921l5.701-1.469A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.695 9.695 0 0 1-4.964-1.366l-.355-.212-3.686.949.969-3.682-.231-.366A9.712 9.712 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/>
                              </svg>
                              Contactar por WhatsApp
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
