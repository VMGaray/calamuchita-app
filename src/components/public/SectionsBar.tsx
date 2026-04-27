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
  const activeSection = searchParams.get("seccion") || "gastronomy"
  const [modalSection, setModalSection] = useState<SectionKey | null>(null)

  return (
    <>
      <nav className="bg-primary-600 px-4 flex justify-center gap-1 overflow-x-auto sticky top-14 z-30">
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
              <motion.div
                className="absolute inset-0 rounded-xl bg-primary-500"
                variants={{
                  rest:   { opacity: 0, scale: 0.9 },
                  hover:  { opacity: 1, scale: 1 },
                  active: { opacity: 1, scale: 1 },
                }}
                transition={{ duration: 0.2 }}
              />

              <motion.div
                className="relative z-10"
                variants={{
                  rest:   { y: 0,  scale: 1 },
                  hover:  { y: -4, scale: 1.3 },
                  active: { y: -4, scale: 1.3 },
                }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                <Icon size={18} className={isActive ? "text-accent-300" : "text-primary-200"} />
              </motion.div>

              <motion.span
                className="relative z-10 text-xs font-medium whitespace-nowrap"
                variants={{
                  rest:   { color: "#74C69D", opacity: 0.7 },
                  hover:  { color: "#F5EFE6", opacity: 1 },
                  active: { color: "#F5EFE6", opacity: 1 },
                }}
                transition={{ duration: 0.2 }}
              >
                {label}
              </motion.span>

              {isActive && (
                <motion.div
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-accent-400 rounded-full"
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