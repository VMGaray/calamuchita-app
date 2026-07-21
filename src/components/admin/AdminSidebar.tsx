"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  MapPin,
  LayoutDashboard,
  Building2,
  BarChart2,
  BadgePercent,
  Megaphone,
  Phone,
  CalendarDays,
  Newspaper,
  CreditCard,
  Settings,
  ExternalLink,
  UserPlus,
  UtensilsCrossed,
  Sparkles,
} from "lucide-react"

const links = [
  { href: "/admin",                        label: "Dashboard",             icon: LayoutDashboard },
  { href: "/admin/negocios",               label: "Negocios",              icon: Building2       },
  { href: "/admin/solicitudes",            label: "Solicitudes",           icon: UserPlus        },
  { href: "/admin/eventos",                label: "Eventos",               icon: CalendarDays    },
  { href: "/admin/identidad-calamuchitana",label: "Identidad Calamuchitana",icon: Newspaper      },
  { href: "/admin/novedades",              label: "Novedades",             icon: Sparkles        },
  { href: "/admin/stats",                  label: "Estadísticas",          icon: BarChart2       },
  { href: "/admin/promociones",            label: "Promociones",           icon: BadgePercent    },
  { href: "/admin/suscripciones",          label: "Suscripciones",         icon: CreditCard      },
  { href: "/admin/marketing",              label: "Marketing",             icon: Megaphone       },
  { href: "/admin/info-util",              label: "Info Útil",             icon: Phone           },
  { href: "/admin/gastronomicos",          label: "Vista gastronómico",    icon: UtensilsCrossed },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const [pendingCount, setPendingCount] = useState(0)

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href)

  useEffect(() => {
    const supabase = createClient()

    const fetchCount = async () => {
      const { count } = await supabase
        .from("pending_registrations")
        .select("id", { count: "exact", head: true })
      setPendingCount(count ?? 0)
    }
    fetchCount()

    const channel = supabase
      .channel("pending-registrations-badge")
      .on("postgres_changes", { event: "*", schema: "public", table: "pending_registrations" }, fetchCount)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  return (
    <>
      {/* ── MOBILE: barra superior ── */}
      <div
        className="md:hidden sticky top-0 z-50 border-b border-white/10"
        style={{ background: "#2D4530" }}
      >
        <div className="flex items-center gap-1.5 px-3 py-2 overflow-x-auto [scrollbar-width:none]">
          {/* Logo mark */}
          <Link
            href="/"
            className="flex items-center justify-center w-7 h-7 rounded-lg flex-shrink-0 mr-1"
            style={{ background: "rgba(255,255,255,0.12)" }}
          >
            <MapPin size={13} className="text-white" />
          </Link>

          {links.map(({ href, label, icon: Icon }) => {
            const active = isActive(href)
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs whitespace-nowrap flex-shrink-0 font-medium transition-colors ${
                  active
                    ? "text-white"
                    : "text-white/60 hover:text-white/90"
                }`}
                style={active ? { background: "rgba(163,177,138,0.85)" } : {}}
              >
                <Icon size={12} />
                {label}
                {href === "/admin/solicitudes" && pendingCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">
                    {pendingCount}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      </div>

      {/* ── DESKTOP: sidebar completo ── */}
      <aside
        className="hidden md:flex w-60 min-h-screen flex-col flex-shrink-0"
        style={{ background: "#2D4530" }}
      >
        {/* Logo */}
        <div className="px-5 py-6 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <Link href="/" className="flex items-center gap-3 group">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.12)" }}
            >
              <MapPin size={15} className="text-white" />
            </div>
            <div>
              <span className="font-serif text-white block text-sm leading-tight">Calamuchita</span>
              <span className="text-[10px] font-medium uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>
                Panel admin
              </span>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {links.map(({ href, label, icon: Icon }) => {
            const active = isActive(href)
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "text-white"
                    : "text-white/60 hover:text-white hover:bg-white/8"
                }`}
                style={
                  active
                    ? { background: "#A3B18A", color: "#fff" }
                    : undefined
                }
              >
                <Icon size={16} />
                {label}
                {href === "/admin/solicitudes" && pendingCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">
                    {pendingCount}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 space-y-0.5 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <Link
            href="/admin/configuracion"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              pathname === "/admin/configuracion" ? "text-white" : "text-white/50 hover:text-white/80"
            }`}
            style={pathname === "/admin/configuracion" ? { background: "#A3B18A" } : {}}
          >
            <Settings size={15} />
            Configuración
          </Link>
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors text-white/40 hover:text-white/70"
          >
            <ExternalLink size={14} />
            Ver sitio público
          </Link>
        </div>
      </aside>
    </>
  )
}
