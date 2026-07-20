"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { MapPin, LayoutDashboard, BookOpen, CalendarDays, ShoppingBag, Settings, LogOut, BarChart2, UtensilsCrossed } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useBusinessDashboard } from "@/lib/context/BusinessDashboardContext"

const restauranteLinks = [
  { href: "/dashboard",               label: "Inicio",       icon: LayoutDashboard },
  { href: "/dashboard/menu-del-dia",  label: "Menú del día", icon: UtensilsCrossed },
  { href: "/dashboard/carta",         label: "Carta",        icon: BookOpen        },
  { href: "/dashboard/pedidos",       label: "Pedidos",      icon: ShoppingBag     },
  { href: "/dashboard/reservas",      label: "Reservas",     icon: CalendarDays    },
  { href: "/dashboard/estadisticas",  label: "Estadísticas", icon: BarChart2       },
  { href: "/dashboard/configuracion", label: "Mi local",     icon: Settings        },
]

const viandasLinks = [
  { href: "/dashboard",               label: "Inicio",       icon: LayoutDashboard },
  { href: "/dashboard/menu-del-dia",  label: "Menú del día", icon: UtensilsCrossed },
  { href: "/dashboard/mi-carta",      label: "Mi carta",     icon: BookOpen        },
  { href: "/dashboard/configuracion", label: "Mi local",     icon: Settings        },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { isRestaurante } = useBusinessDashboard()
  const links = isRestaurante ? restauranteLinks : viandasLinks

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <>
      {/* MOBILE: barra de navegación horizontal superior */}
      <div className="md:hidden bg-white border-b border-stone-200 sticky top-0 z-50">
        <div className="flex items-center gap-1.5 px-3 py-2 overflow-x-auto scrollbar-none">
          <Link href="/" className="flex items-center justify-center w-7 h-7 bg-primary-500 rounded-lg flex-shrink-0 mr-1">
            <MapPin size={13} className="text-primary-100" />
          </Link>
          {links.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs whitespace-nowrap flex-shrink-0 transition-colors ${
                  isActive
                    ? "bg-primary-500 text-primary-100"
                    : "text-stone-600 bg-stone-100 hover:bg-stone-200"
                }`}
              >
                <Icon size={13} />
                {label}
              </Link>
            )
          })}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs whitespace-nowrap flex-shrink-0 text-red-400 bg-red-50 ml-auto"
          >
            <LogOut size={13} />
            Salir
          </button>
        </div>
      </div>

      {/* DESKTOP: sidebar completo */}
      <aside className="hidden md:flex w-64 bg-white border-r border-stone-200 min-h-screen flex-col">
        <div className="p-6 border-b border-stone-100">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary-500 rounded-lg flex items-center justify-center">
              <MapPin size={14} className="text-primary-100" />
            </div>
            <span className="font-serif text-stone-800">Calamuchita</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {links.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                  isActive
                    ? "bg-primary-500 text-primary-100"
                    : "text-stone-600 hover:bg-stone-100 hover:text-stone-800"
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-stone-100 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-stone-500 hover:bg-stone-100 transition-colors"
          >
            Ver sitio público
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  )
}
