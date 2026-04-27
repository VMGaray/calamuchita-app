"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { MapPin, LayoutDashboard, BookOpen, CalendarDays, ShoppingBag, Settings } from "lucide-react"

const links = [
  { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  { href: "/dashboard/carta", label: "Carta", icon: BookOpen },
  { href: "/dashboard/menu-del-dia", label: "Menú del día", icon: CalendarDays },
  { href: "/dashboard/pedidos", label: "Pedidos", icon: ShoppingBag },
  { href: "/dashboard/reservas", label: "Reservas", icon: CalendarDays },
  { href: "/dashboard/configuracion", label: "Mi local", icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-white border-r border-stone-200 min-h-screen flex flex-col">

      {/* Logo */}
      <div className="p-6 border-b border-stone-100">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary-500 rounded-lg flex items-center justify-center">
            <MapPin size={14} className="text-primary-100" />
          </div>
          <span className="font-serif text-stone-800">Calamuchita</span>
        </Link>
      </div>

      {/* Nav */}
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

      {/* Footer del sidebar */}
      <div className="p-4 border-t border-stone-100">
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-stone-500 hover:bg-stone-100 hover:text-stone-700 transition-colors w-full">
          <Settings size={16} />
          Cerrar sesión
        </button>
      </div>

    </aside>
  )
}