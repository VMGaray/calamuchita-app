"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Eye, MessageCircle, Star, TrendingUp, Download } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import AnimatedCounter from "@/components/ui/AnimatedCounter"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"

interface BusinessStat {
  id: string
  name: string
  section: string
  total_views: number
  total_leads: number
}

const SECTION_LABELS: Record<string, string> = {
  gastronomy: "Gastronomía",
  services:   "Servicios",
  health:     "Salud",
  education:  "Educación",
  tourism:    "Turismo",
  commerce:   "Comercios",
  events:     "Eventos",
  info:       "Info útil",
}

function Skeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => (
          <div key={i} className="bg-white rounded-2xl h-28 animate-pulse border border-stone-200" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-white rounded-2xl h-80 animate-pulse border border-stone-200" />
        <div className="lg:col-span-2 bg-white rounded-2xl h-80 animate-pulse border border-stone-200" />
      </div>
      <div className="bg-white rounded-2xl h-72 animate-pulse border border-stone-200" />
    </div>
  )
}

export default function AdminStats() {
  const [businesses, setBusinesses] = useState<BusinessStat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    createClient()
      .from("businesses")
      .select("id, name, section, total_views, total_leads")
      .eq("status", "active")
      .order("total_views", { ascending: false })
      .then(({ data }) => {
        setBusinesses(
          (data || []).map(b => ({
            ...b,
            total_views: b.total_views ?? 0,
            total_leads: b.total_leads ?? 0,
          }))
        )
        setLoading(false)
      })
  }, [])

  if (loading) return <Skeleton />

  // ── Computed ─────────────────────────────────────────────────────
  const totalViews    = businesses.reduce((s, b) => s + b.total_views, 0)
  const totalLeads    = businesses.reduce((s, b) => s + b.total_leads, 0)
  const conversionPct = totalViews > 0 ? Math.round((totalLeads / totalViews) * 1000) / 10 : 0
  const topBusiness   = businesses[0] ?? null
  const top10         = businesses.slice(0, 10)
  const maxActivity   = top10[0] ? top10[0].total_views + top10[0].total_leads : 1

  const bySection = Object.entries(SECTION_LABELS)
    .map(([key, label]) => {
      const group = businesses.filter(b => b.section === key)
      return {
        label,
        views: group.reduce((s, b) => s + b.total_views, 0),
        leads: group.reduce((s, b) => s + b.total_leads, 0),
        count: group.length,
      }
    })
    .filter(s => s.count > 0)
    .sort((a, b) => b.views - a.views)

  function exportCSV() {
    const rows = [
      ["Negocio", "Sección", "Vistas", "Contactos WhatsApp", "Conversión (%)"],
      ...businesses.map(b => {
        const conv = b.total_views > 0
          ? ((b.total_leads / b.total_views) * 100).toFixed(1)
          : "0.0"
        return [
          b.name,
          SECTION_LABELS[b.section] ?? b.section,
          b.total_views,
          b.total_leads,
          conv,
        ]
      }),
    ]
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n")
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `metricas-calamuchita-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl text-stone-800 mb-1">Estadísticas</h1>
          <p className="text-stone-500 text-sm">Actividad acumulada de todos los negocios activos</p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-95 shrink-0"
          style={{ background: "#2D4530", color: "#E1DBC9" }}
        >
          <Download size={15} />
          Exportar CSV
        </button>
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}
          className="bg-white rounded-2xl p-5 border border-stone-200"
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: "rgba(45,69,48,0.1)" }}>
            <Eye size={16} style={{ color: "#2D4530" }} />
          </div>
          <p className="text-[10px] text-stone-400 uppercase tracking-wider mb-1">Total vistas</p>
          <p className="text-3xl font-serif" style={{ color: "#2D4530" }}>
            <AnimatedCounter to={totalViews} duration={1.5} />
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className="bg-white rounded-2xl p-5 border border-stone-200"
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: "rgba(37,211,102,0.1)" }}>
            <MessageCircle size={16} style={{ color: "#128C7E" }} />
          </div>
          <p className="text-[10px] text-stone-400 uppercase tracking-wider mb-1">Contactos WA</p>
          <p className="text-3xl font-serif" style={{ color: "#128C7E" }}>
            <AnimatedCounter to={totalLeads} duration={1.5} />
          </p>
        </motion.div>

        {/* Negocio más popular — destaca en verde */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
          className="rounded-2xl p-5 col-span-2 md:col-span-1"
          style={{ background: "#2D4530" }}
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: "rgba(201,164,75,0.2)" }}>
            <Star size={16} style={{ color: "#C9A44B" }} />
          </div>
          <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "rgba(255,255,255,0.45)" }}>Más popular</p>
          <p className="text-base font-serif text-white leading-snug line-clamp-2">
            {topBusiness?.name ?? "—"}
          </p>
          {topBusiness && (
            <p className="text-[10px] mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
              {topBusiness.total_views.toLocaleString("es-AR")} vistas
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}
          className="bg-white rounded-2xl p-5 border border-stone-200"
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: "rgba(163,177,138,0.2)" }}>
            <TrendingUp size={16} style={{ color: "#A3B18A" }} />
          </div>
          <p className="text-[10px] text-stone-400 uppercase tracking-wider mb-1">Conversión</p>
          <p className="text-3xl font-serif" style={{ color: "#A3B18A" }}>
            <AnimatedCounter to={Math.round(conversionPct)} duration={1.5} suffix="%" />
          </p>
          <p className="text-[10px] text-stone-400 mt-1">leads / vistas</p>
        </motion.div>
      </div>

      {/* ── Ranking + por sección ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Top 10 */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="lg:col-span-3 bg-white rounded-2xl border border-stone-200 p-6"
        >
          <h2 className="text-sm font-medium text-stone-700 mb-5">Ranking — Top 10</h2>
          {top10.length === 0 ? (
            <p className="text-sm text-stone-400 text-center py-10">Sin datos todavía</p>
          ) : (
            <div className="space-y-3.5">
              {top10.map((biz, i) => {
                const activity = biz.total_views + biz.total_leads
                const pct = (activity / maxActivity) * 100
                return (
                  <div key={biz.id} className="flex items-center gap-3">
                    <span
                      className="text-xs font-bold tabular-nums w-5 text-right flex-shrink-0"
                      style={{ color: i === 0 ? "#C9A44B" : "rgba(45,69,48,0.3)" }}
                    >
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between mb-1.5">
                        <p className="text-xs font-medium text-stone-700 truncate pr-2">{biz.name}</p>
                        <span className="text-[10px] text-stone-400 flex-shrink-0 tabular-nums">
                          <span style={{ color: "#2D4530" }}>{biz.total_views}</span>
                          {" · "}
                          <span style={{ color: "#A3B18A" }}>{biz.total_leads} WA</span>
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(45,69,48,0.07)" }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ delay: 0.45 + i * 0.05, duration: 0.55, ease: "easeOut" }}
                          className="h-full rounded-full"
                          style={{
                            background: i === 0
                              ? "linear-gradient(90deg, #2D4530 0%, #A3B18A 100%)"
                              : "#2D4530",
                            opacity: 0.5 + 0.5 * (1 - i / 10),
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>

        {/* Por sección */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}
          className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 p-6"
        >
          <h2 className="text-sm font-medium text-stone-700 mb-5">Vistas por sección</h2>
          {bySection.length === 0 ? (
            <p className="text-sm text-stone-400 text-center py-10">Sin datos</p>
          ) : (
            <div className="space-y-3.5">
              {bySection.map((sec, i) => {
                const maxViews = bySection[0].views || 1
                const pct = (sec.views / maxViews) * 100
                return (
                  <div key={sec.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-stone-600">{sec.label}</span>
                      <div className="text-[10px] tabular-nums">
                        <span style={{ color: "#2D4530" }}>{sec.views}</span>
                        {sec.leads > 0 && (
                          <span style={{ color: "#A3B18A" }}> · {sec.leads} WA</span>
                        )}
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(45,69,48,0.07)" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: 0.5 + i * 0.06, duration: 0.5, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{ background: "#A3B18A" }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Recharts — gráfico de barras ── */}
      {bySection.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl border border-stone-200 p-6"
        >
          <h2 className="text-sm font-medium text-stone-700 mb-6">Vistas y contactos por sección</h2>
          <ResponsiveContainer width="100%" height={bySection.length * 44 + 40}>
            <BarChart
              data={bySection}
              layout="vertical"
              margin={{ top: 0, right: 20, bottom: 0, left: 90 }}
              barCategoryGap="30%"
              barGap={4}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(45,69,48,0.06)" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 10, fill: "#a8a29e" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="label"
                tick={{ fontSize: 11, fill: "#57534e" }}
                axisLine={false}
                tickLine={false}
                width={88}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid rgba(45,69,48,0.12)",
                  fontSize: 12,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                  color: "#3C3C3C",
                }}
                cursor={{ fill: "rgba(45,69,48,0.04)" }}
              />
              <Legend
                iconType="circle"
                iconSize={7}
                wrapperStyle={{ fontSize: 11, paddingTop: 20, color: "#78716c" }}
              />
              <Bar dataKey="views" name="Vistas"    fill="#2D4530" radius={[0, 4, 4, 0]} maxBarSize={14} />
              <Bar dataKey="leads" name="Contactos" fill="#A3B18A" radius={[0, 4, 4, 0]} maxBarSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

    </div>
  )
}
