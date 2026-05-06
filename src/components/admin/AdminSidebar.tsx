"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { MapPin, LayoutDashboard, Building2, Utensils, Info, Settings } from "lucide-react"

const links = [
  { href: "/admin", label: "Inicio", icon: LayoutDashboard },
  { href: "/admin/negocios", label: "Negocios", icon: Building2 },
  { href: "/admin/gastronomia", label: "Gastronomía", icon: Utensils },
  { href: "/admin/info-util", label: "Info útil", icon: Info },
  { href: "/admin/configuracion", label: "Configuración", icon: Settings },
]

export default function AdminSidebar() {
  const pathname = usePathname()

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
        </div>
      </div>

      {/* DESKTOP: sidebar completo */}
      <aside className="hidden md:flex w-64 bg-white border-r border-stone-200 min-h-screen flex-col">
        <div className="p-6 border-b border-stone-100">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary-500 rounded-lg flex items-center justify-center">
              <MapPin size={14} className="text-primary-100" />
            </div>
            <div>
              <span className="font-serif text-stone-800 block text-sm">Calamuchita</span>
              <span className="text-xs text-stone-400">Panel admin</span>
            </div>
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

        <div className="p-4 border-t border-stone-100">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-stone-500 hover:bg-stone-100 transition-colors"
          >
            Ver sitio público
          </Link>
        </div>
      </aside>
    </>
  )
}
