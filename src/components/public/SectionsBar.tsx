"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Utensils, Wrench, Heart, GraduationCap, Mountain, ShoppingBag, CalendarDays, Info } from "lucide-react"
import SectionModal from "@/components/public/SectionModal"
import { SectionKey } from "@/lib/sections"

const sections = [
  { key: "gastronomy" as SectionKey, label: "Gastronomía", icon: Utensils },
  { key: "services"   as SectionKey, label: "Servicios",   icon: Wrench },
  { key: "health"     as SectionKey, label: "Salud",       icon: Heart },
  { key: "education"  as SectionKey, label: "Educación",   icon: GraduationCap },
  { key: "tourism"    as SectionKey, label: "Turismo",     icon: Mountain },
  { key: "commerce"   as SectionKey, label: "Comercios",   icon: ShoppingBag },
  { key: "events"     as SectionKey, label: "Eventos",     icon: CalendarDays },
  { key: "info"       as SectionKey, label: "Info útil",   icon: Info },
]

export default function SectionsBar() {
  const searchParams = useSearchParams()
  const activeSection = searchParams.get("seccion") || ""
  const [modalSection, setModalSection] = useState<SectionKey | null>(null)

  return (
    <>
      <nav className="bg-primary-700/80 backdrop-blur-md px-4 flex justify-center gap-1 overflow-x-auto sticky top-14 z-30">
        {sections.map(({ key, label, icon: Icon }) => {
          const isActive = activeSection === key
          return (
            <motion.button
              key={key}
              onClick={() => setModalSection(modalSection === key ? null : key)}
              className="relative flex flex-col items-center gap-1 px-5 py-3 cursor-pointer"
              animate={isActive ? "active" : "rest"}
              whileHover="hover"
              initial="rest"
            >
              {/* Fondo hover/activo */}
              <motion.div
                className="absolute inset-0 rounded-xl"
                style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
                variants={{
                  rest:   { opacity: 0, scale: 0.9 },
                  hover:  { opacity: 1, scale: 1 },
                  active: { opacity: 1, scale: 1 },
                }}
                transition={{ duration: 0.2 }}
              />

              {/* Ícono */}
              <motion.div
                className="relative z-10"
                variants={{
                  rest:   { y: 0,  scale: 1 },
                  hover:  { y: -4, scale: 1.3 },
                  active: { y: -4, scale: 1.3 },
                }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                <Icon
                  size={18}
                  style={{ color: isActive ? "#ffffff" : "rgba(255,255,255,0.6)" }}
                />
              </motion.div>

              {/* Label */}
              <motion.span
                className="relative z-10 text-xs font-medium whitespace-nowrap"
                variants={{
                  rest:   { color: "rgba(255,255,255,0.6)", opacity: 1 },
                  hover:  { color: "rgba(255,255,255,1)", opacity: 1 },
                  active: { color: "rgba(255,255,255,1)", opacity: 1 },
                }}
                transition={{ duration: 0.2 }}
              >
                {label}
              </motion.span>

              {/* Línea activa */}
              {isActive && (
                <motion.div
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full"
                  style={{ backgroundColor: "#D4E2F4" }}
                  layoutId="activeBar"
                  initial={{ width: 0 }}
                  animate={{ width: "60%" }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </motion.button>
          )
        })}
      </nav>

      <SectionModal
        section={modalSection}
        onClose={() => setModalSection(null)}
      />
    </>
  )
}