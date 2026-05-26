"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import AnimateIn from "@/components/ui/AnimateIn"
import AnimatedCounter from "@/components/ui/AnimatedCounter"
import { Eye, MessageCircle, CalendarDays } from "lucide-react" // Añadimos CalendarDays

const sectionLabels: Record<string, string> = {
  gastronomy: "Gastronomía",
  services: "Servicios",
  health: "Salud",
  education: "Educación",
  tourism: "Turismo",
  commerce: "Comercios",
  events: "Eventos",
  info: "Info útil",
}

export default function AdminHome() {
  const [stats, setStats] = useState({
    active: 0,
    pending: 0,
    users: 0,
    totalViews: 0,
    totalLeads: 0,
    eventCount: 0, // Nueva métrica
    sections: {} as Record<string, number>
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      const supabase = createClient()

      const [
        { count: active },
        { count: pending },
        { count: users },
        { data: businesses },
        { data: analytics },
        { count: events }, // Consulta para eventos
      ] = await Promise.all([
        supabase.from("businesses").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("businesses").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("businesses").select("section").eq("status", "active"),
        supabase.from("businesses").select("total_views, total_leads"),
        supabase.from("events").select("*", { count: "exact", head: true }), // Nueva tabla
      ])

      const sections: Record<string, number> = {}
      businesses?.forEach((b: { section: string }) => {
        sections[b.section] = (sections[b.section] || 0) + 1
      })

      const totalViews = (analytics ?? []).reduce((s: number, b: { total_views?: number | null }) => s + (b.total_views ?? 0), 0)
      const totalLeads = (analytics ?? []).reduce((s: number, b: { total_leads?: number | null }) => s + (b.total_leads ?? 0), 0)

      setStats({
        active: active || 0,
        pending: pending || 0,
        users: users || 0,
        totalViews,
        totalLeads,
        eventCount: events || 0, // Guardamos la métrica
        sections,
      })
      setLoading(false)
    }

    fetchStats()
  }, [])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl text-stone-800 mb-1">Panel de administración</h1>
        <p className="text-stone-500">Gestioná todos los negocios y eventos del valle</p>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4"> {/* Cambiamos a 4 columnas para eventos */}
        <AnimateIn direction="up" delay={0}>
          <div className="bg-white rounded-2xl border border-stone-200 p-5">
            <p className="text-xs text-stone-400 uppercase tracking-wider mb-2">Negocios activos</p>
            <p className="text-3xl font-serif text-stone-800">
              {loading ? "…" : <AnimatedCounter to={stats.active} />}
            </p>
          </div>
        </AnimateIn>
        <AnimateIn direction="up" delay={0.05}>
          <div className="bg-white rounded-2xl border border-stone-200 p-5">
            <p className="text-xs text-stone-400 uppercase tracking-wider mb-2">Pendientes</p>
            <p className="text-3xl font-serif text-stone-800">
              {loading ? "…" : <AnimatedCounter to={stats.pending} />}
            </p>
          </div>
        </AnimateIn>
        <AnimateIn direction="up" delay={0.1}>
          <div className="bg-white rounded-2xl border border-stone-200 p-5">
            <p className="text-xs text-stone-400 uppercase tracking-wider mb-2">Usuarios</p>
            <p className="text-3xl font-serif text-stone-800">
              {loading ? "…" : <AnimatedCounter to={stats.users} />}
            </p>
          </div>
        </AnimateIn>
        {/* Nueva métrica de Eventos */}
        <AnimateIn direction="up" delay={0.12}>
          <div className="bg-white rounded-2xl border border-stone-200 p-5">
            <p className="text-xs text-stone-400 uppercase tracking-wider mb-2">Eventos en Agenda</p>
            <p className="text-3xl font-serif text-brand-pine" style={{ color: "#2D4530" }}>
              {loading ? "…" : <AnimatedCounter to={stats.eventCount} />}
            </p>
          </div>
        </AnimateIn>
      </div>

      {/* Analytics totales */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <AnimateIn direction="up" delay={0.15}>
          <div className="rounded-2xl border p-5 flex items-center gap-4" style={{ background: "rgba(45,69,48,0.06)", borderColor: "rgba(45,69,48,0.15)" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(45,69,48,0.12)" }}>
              <Eye size={16} style={{ color: "#2D4530" }} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider mb-0.5" style={{ color: "rgba(45,69,48,0.6)" }}>Vistas totales</p>
              <p className="text-2xl font-serif" style={{ color: "#2D4530" }}>
                {loading ? "…" : <AnimatedCounter to={stats.totalViews} />}
              </p>
            </div>
          </div>
        </AnimateIn>
        <AnimateIn direction="up" delay={0.2}>
          <div className="rounded-2xl border p-5 flex items-center gap-4" style={{ background: "rgba(37,211,102,0.06)", borderColor: "rgba(37,211,102,0.2)" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(37,211,102,0.1)" }}>
              <MessageCircle size={16} style={{ color: "#128C7E" }} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider mb-0.5" style={{ color: "rgba(18,140,126,0.7)" }}>Contactos WA</p>
              <p className="text-2xl font-serif" style={{ color: "#128C7E" }}>
                {loading ? "…" : <AnimatedCounter to={stats.totalLeads} />}
              </p>
            </div>
          </div>
        </AnimateIn>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Accesos rápidos */}
        <AnimateIn direction="left">
          <div className="bg-white rounded-2xl border border-stone-200 p-6">
            <h2 className="text-base font-medium text-stone-700 mb-4">Accesos rápidos</h2>
            <div className="space-y-2">
              <Link href="/admin/negocios/nuevo" className="flex items-center justify-between p-3 rounded-xl hover:bg-stone-50 transition-colors">
                <span className="text-sm text-stone-600 font-medium">Agregar negocio de directorio</span>
                <span className="text-primary-500 text-sm">→</span>
              </Link>
              {/* Nuevo acceso a Gestión de Eventos */}
              <Link href="/admin/eventos" className="flex items-center justify-between p-3 rounded-xl bg-brand-pine/5 border border-brand-pine/10 hover:bg-brand-pine/10 transition-colors">
                <div className="flex items-center gap-3">
                  <CalendarDays size={16} className="text-brand-pine" style={{ color: "#2D4530" }} />
                  <span className="text-sm text-stone-800 font-bold">Cargar y gestionar Eventos</span>
                </div>
                <span className="text-primary-500 text-sm">→</span>
              </Link>
              <Link href="/admin/solicitudes" className="flex items-center justify-between p-3 rounded-xl hover:bg-stone-50 transition-colors">
                <span className="text-sm text-stone-600">Ver solicitudes pendientes</span>
                <span className="text-primary-500 text-sm">→</span>
              </Link>
              <Link href="/admin/info-util" className="flex items-center justify-between p-3 rounded-xl hover:bg-stone-50 transition-colors">
                <span className="text-sm text-stone-600">Gestionar info útil</span>
                <span className="text-primary-500 text-sm">→</span>
              </Link>
            </div>
          </div>
        </AnimateIn>

        {/* Negocios por sección */}
        <AnimateIn direction="right">
          <div className="bg-white rounded-2xl border border-stone-200 p-6 h-full">
            <h2 className="text-base font-medium text-stone-700 mb-4">Negocios por sección</h2>
            <div className="space-y-2">
              {Object.entries(sectionLabels).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between py-1.5 border-b border-stone-50 last:border-0">
                  <span className="text-sm text-stone-600">{label}</span>
                  <span className={`text-sm font-medium ${stats.sections[key] > 0 ? "text-primary-500" : "text-stone-300"}`}>
                    {loading ? "..." : (key === 'events' ? stats.eventCount : stats.sections[key] || 0)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </AnimateIn>
      </div>
    </div>
  )
}