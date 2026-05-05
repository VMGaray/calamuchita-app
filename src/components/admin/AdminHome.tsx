"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import AnimateIn from "@/components/ui/AnimateIn"
import AnimatedCounter from "@/components/ui/AnimatedCounter"

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
        { data: businesses }
      ] = await Promise.all([
        supabase.from("businesses").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("businesses").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("businesses").select("section").eq("status", "active"),
      ])

      const sections: Record<string, number> = {}
      businesses?.forEach((b: { section: string }) => {
        sections[b.section] = (sections[b.section] || 0) + 1
      })

      setStats({
        active: active || 0,
        pending: pending || 0,
        users: users || 0,
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
        <p className="text-stone-500">Gestioná todos los negocios del valle</p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <AnimateIn direction="up" delay={0}>
          <div className="bg-white rounded-2xl border border-stone-200 p-6">
            <p className="text-xs text-stone-400 uppercase tracking-wider mb-2">Negocios activos</p>
            <p className="text-3xl font-serif text-stone-800">
              {loading ? "..." : <AnimatedCounter to={stats.active} />}
            </p>
          </div>
        </AnimateIn>
        <AnimateIn direction="up" delay={0.1}>
          <div className="bg-white rounded-2xl border border-stone-200 p-6">
            <p className="text-xs text-stone-400 uppercase tracking-wider mb-2">Pendientes de aprobación</p>
            <p className="text-3xl font-serif text-stone-800">
              {loading ? "..." : <AnimatedCounter to={stats.pending} />}
            </p>
          </div>
        </AnimateIn>
        <AnimateIn direction="up" delay={0.2}>
          <div className="bg-white rounded-2xl border border-stone-200 p-6">
            <p className="text-xs text-stone-400 uppercase tracking-wider mb-2">Usuarios registrados</p>
            <p className="text-3xl font-serif text-stone-800">
              {loading ? "..." : <AnimatedCounter to={stats.users} />}
            </p>
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
                <span className="text-sm text-stone-600">Agregar negocio de directorio</span>
                <span className="text-primary-500 text-sm">→</span>
              </Link>
              <Link href="/admin/gastronomia" className="flex items-center justify-between p-3 rounded-xl hover:bg-stone-50 transition-colors">
                <span className="text-sm text-stone-600">Ver comercios pendientes</span>
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
          <div className="bg-white rounded-2xl border border-stone-200 p-6">
            <h2 className="text-base font-medium text-stone-700 mb-4">Negocios por sección</h2>
            <div className="space-y-2">
              {Object.entries(sectionLabels).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between py-1.5">
                  <span className="text-sm text-stone-600">{label}</span>
                  <span className={`text-sm font-medium ${stats.sections[key] > 0 ? "text-primary-500" : "text-stone-300"}`}>
                    {loading ? "..." : stats.sections[key] || 0}
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