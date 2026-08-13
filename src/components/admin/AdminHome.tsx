"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import AnimateIn from "@/components/ui/AnimateIn"
import AnimatedCounter from "@/components/ui/AnimatedCounter"
import { CalendarDays, Newspaper, Smartphone, AlertCircle, BarChart2 } from "lucide-react"

const sectionLabels: Record<string, string> = {
  gastronomy: "Gastronomía",
  services:   "Servicios",
  health:     "Salud",
  education:  "Educación",
  tourism:    "Turismo",
  commerce:   "Comercios",
}

interface SectionData { count: number; views: number; leads: number }

export default function AdminHome() {
  const [stats, setStats] = useState({
    active:         0,
    pending:        0,
    users:          0,
    eventCount:     0,
    editorialCount: 0,
    pwaInstalls:    0,
    sections:       {} as Record<string, SectionData>,
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
        { count: events },
        { count: editorial },
        { count: pwaInstalls },
        { data: leadsData },
      ] = await Promise.all([
        supabase.from("businesses").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("businesses").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("businesses").select("id, section, total_views").eq("status", "active"),
        supabase.from("events").select("*", { count: "exact", head: true }),
        supabase.from("editorial_posts").select("*", { count: "exact", head: true }),
        supabase.from("pwa_installs").select("*", { count: "exact", head: true }),
        // Los contactos reales viven en business_leads — businesses.total_leads no se actualiza.
        supabase.from("business_leads").select("business_id"),
      ])

      const leadsByBusiness = new Map<string, number>()
      leadsData?.forEach((l: { business_id: string }) => {
        leadsByBusiness.set(l.business_id, (leadsByBusiness.get(l.business_id) ?? 0) + 1)
      })

      const sections: Record<string, SectionData> = {}
      businesses?.forEach((b: { id: string; section: string; total_views?: number | null }) => {
        if (!sections[b.section]) sections[b.section] = { count: 0, views: 0, leads: 0 }
        sections[b.section].count += 1
        sections[b.section].views += b.total_views ?? 0
        sections[b.section].leads += leadsByBusiness.get(b.id) ?? 0
      })

      setStats({
        active:         active         || 0,
        pending:        pending        || 0,
        users:          users          || 0,
        eventCount:     events         || 0,
        editorialCount: editorial      || 0,
        pwaInstalls:    pwaInstalls    || 0,
        sections,
      })
      setLoading(false)
    }

    fetchStats()
  }, [])

  const hasPending = !loading && stats.pending > 0

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl text-stone-800 mb-1">Panel de administración</h1>
        <p className="text-stone-500">Gestioná todos los negocios y eventos del valle</p>
      </div>

      {/* ── Fila 1: KPIs operacionales ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <AnimateIn direction="up" delay={0}>
          <div className="bg-white rounded-2xl border border-stone-200 p-5">
            <p className="text-xs text-stone-400 uppercase tracking-wider mb-2">Negocios activos</p>
            <p className="text-3xl font-serif text-stone-800">
              {loading ? "…" : <AnimatedCounter to={stats.active} />}
            </p>
          </div>
        </AnimateIn>

        {/* Pendientes — alerta naranja cuando hay solicitudes */}
        <AnimateIn direction="up" delay={0.05}>
          <Link href="/admin/solicitudes" className="block h-full">
            <div className={`rounded-2xl border p-5 h-full transition-all hover:opacity-90 ${
              hasPending ? "bg-orange-50 border-orange-200" : "bg-white border-stone-200"
            }`}>
              {hasPending ? (
                <div className="flex items-center gap-1.5 mb-2">
                  <AlertCircle size={13} className="text-orange-500" />
                  <p className="text-xs text-orange-500 uppercase tracking-wider font-semibold">Revisar</p>
                </div>
              ) : (
                <p className="text-xs text-stone-400 uppercase tracking-wider mb-2">Pendientes</p>
              )}
              <p className={`text-3xl font-serif ${hasPending ? "text-orange-600" : "text-stone-800"}`}>
                {loading ? "…" : <AnimatedCounter to={stats.pending} />}
              </p>
            </div>
          </Link>
        </AnimateIn>

        <AnimateIn direction="up" delay={0.1}>
          <div className="bg-white rounded-2xl border border-stone-200 p-5">
            <p className="text-xs text-stone-400 uppercase tracking-wider mb-2">Usuarios</p>
            <p className="text-3xl font-serif text-stone-800">
              {loading ? "…" : <AnimatedCounter to={stats.users} />}
            </p>
          </div>
        </AnimateIn>

        <AnimateIn direction="up" delay={0.12}>
          <div className="bg-white rounded-2xl border border-stone-200 p-5">
            <p className="text-xs text-stone-400 uppercase tracking-wider mb-2">Eventos en agenda</p>
            <p className="text-3xl font-serif" style={{ color: "#2D4530" }}>
              {loading ? "…" : <AnimatedCounter to={stats.eventCount} />}
            </p>
          </div>
        </AnimateIn>
      </div>

      {/* ── Fila 2: PWA + Editorial + acceso a Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <AnimateIn direction="up" delay={0.15}>
          <div className="rounded-2xl border p-5 flex items-center gap-4" style={{ background: "rgba(45,69,48,0.05)", borderColor: "rgba(45,69,48,0.15)" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(45,69,48,0.10)" }}>
              <Smartphone size={16} style={{ color: "#2D4530" }} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider mb-0.5" style={{ color: "rgba(45,69,48,0.55)" }}>Instalaciones PWA</p>
              <p className="text-2xl font-serif" style={{ color: "#2D4530" }}>
                {loading ? "…" : <AnimatedCounter to={stats.pwaInstalls} />}
              </p>
            </div>
          </div>
        </AnimateIn>

        <AnimateIn direction="up" delay={0.18}>
          <div className="rounded-2xl border p-5 flex items-center gap-4" style={{ background: "rgba(45,69,48,0.04)", borderColor: "rgba(45,69,48,0.12)" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(45,69,48,0.08)" }}>
              <Newspaper size={16} style={{ color: "#2D4530" }} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider mb-0.5" style={{ color: "rgba(45,69,48,0.50)" }}>Identidad Calamuchitana</p>
              <p className="text-2xl font-serif" style={{ color: "#2D4530" }}>
                {loading ? "…" : <AnimatedCounter to={stats.editorialCount} />}
              </p>
            </div>
          </div>
        </AnimateIn>

        <AnimateIn direction="up" delay={0.21}>
          <Link href="/admin/stats" className="block h-full">
            <div className="rounded-2xl border p-5 h-full flex items-center gap-4 hover:opacity-90 transition-opacity" style={{ background: "#2D4530", borderColor: "#2D4530" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.12)" }}>
                <BarChart2 size={16} style={{ color: "#E1DBC9" }} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider mb-0.5" style={{ color: "rgba(225,219,201,0.60)" }}>Vistas · WA · Ranking</p>
                <p className="text-sm font-semibold" style={{ color: "#E1DBC9" }}>Ver estadísticas →</p>
              </div>
            </div>
          </Link>
        </AnimateIn>
      </div>

      {/* ── Bloque inferior ── */}
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
              <Link href="/admin/eventos" className="flex items-center justify-between p-3 rounded-xl bg-brand-pine/5 border border-brand-pine/10 hover:bg-brand-pine/10 transition-colors">
                <div className="flex items-center gap-3">
                  <CalendarDays size={16} style={{ color: "#2D4530" }} />
                  <span className="text-sm text-stone-800 font-bold">Cargar y gestionar Eventos</span>
                </div>
                <span className="text-primary-500 text-sm">→</span>
              </Link>
              <Link href="/admin/identidad-calamuchitana" className="flex items-center justify-between p-3 rounded-xl border hover:bg-brand-pine/10 transition-colors" style={{ background: "rgba(45,69,48,0.04)", borderColor: "rgba(45,69,48,0.12)" }}>
                <div className="flex items-center gap-3">
                  <Newspaper size={16} style={{ color: "#2D4530" }} />
                  <div>
                    <p className="text-sm text-stone-800 font-bold leading-tight">Gestionar Identidad Calamuchitana</p>
                    <p className="text-[11px] text-stone-400 mt-0.5">Subí entrevistas, efemérides y notas del Valle</p>
                  </div>
                </div>
                <span className="text-primary-500 text-sm shrink-0">→</span>
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

        {/* Negocios por sección — con vistas y contactos */}
        <AnimateIn direction="right">
          <div className="bg-white rounded-2xl border border-stone-200 p-6 h-full">
            <h2 className="text-base font-medium text-stone-700 mb-4">Negocios por sección</h2>
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 pb-2 border-b border-stone-100 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Sección</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 text-right">Neg.</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 text-right">Vistas</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 text-right">WA</span>
            </div>
            <div className="space-y-0.5">
              {Object.entries(sectionLabels).map(([key, label]) => {
                const sec = stats.sections[key]
                return (
                  <div key={key} className="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 py-2 border-b border-stone-50 last:border-0 items-center">
                    <span className="text-sm text-stone-600">{label}</span>
                    <span className="text-sm font-medium text-right tabular-nums" style={{ color: sec?.count > 0 ? "#2D4530" : "#d6d3d1" }}>
                      {loading ? "…" : (sec?.count || 0)}
                    </span>
                    <span className="text-sm text-right tabular-nums" style={{ color: "rgba(45,69,48,0.55)" }}>
                      {loading ? "…" : (sec?.views || 0).toLocaleString("es-AR")}
                    </span>
                    <span className="text-sm font-medium text-right tabular-nums" style={{ color: "#128C7E" }}>
                      {loading ? "…" : (sec?.leads || 0)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </AnimateIn>
      </div>
    </div>
  )
}
