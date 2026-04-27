"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { Utensils, Wrench, Heart, Mountain, CalendarDays, Info, GraduationCap, ShoppingBag } from "lucide-react"

const sections = [
  { key: "gastronomy", label: "Gastronomía",  icon: Utensils,     href: "/?seccion=gastronomy" },
  { key: "services",   label: "Servicios",    icon: Wrench,       href: "/?seccion=services" },
  { key: "health",     label: "Salud",        icon: Heart,        href: "/?seccion=health" },
  { key: "education",  label: "Educación",    icon: GraduationCap, href: "/?seccion=education" },
  { key: "tourism",    label: "Turismo",      icon: Mountain,     href: "/?seccion=tourism" },
  { key: "commerce",   label: "Comercios",    icon: ShoppingBag,  href: "/?seccion=commerce" },
  { key: "events",     label: "Eventos",      icon: CalendarDays, href: "/?seccion=events" },
  { key: "info",       label: "Info útil",    icon: Info,         href: "/?seccion=info" },
]

export default function SectionsBar() {
  const searchParams = useSearchParams()
  const activeSection = searchParams.get("seccion") || "gastronomy"

  return (
    <nav className="bg-primary-600 px-4 flex justify-center gap-1 overflow-x-auto">
      {sections.map(({ key, label, icon: Icon, href }) => (
        <Link
          key={key}
          href={href}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
            activeSection === key
              ? "text-primary-100 border-accent-400"
              : "text-primary-300 border-transparent hover:text-primary-100"
          }`}
        >
          <Icon size={14} />
          {label}
        </Link>
      ))}
    </nav>
  )
}