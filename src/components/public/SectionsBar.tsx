"use client"

import { useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
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
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeSection = searchParams.get("seccion") || ""
  const [modalSection, setModalSection] = useState<SectionKey | null>(null)

 const handleSectionClick = (key: SectionKey) => {
    if (key === "events") {
      router.push("/eventos")
    } else {
      setModalSection(modalSection === key ? null : key)
    }
  }

  return (
    <>
      {/* ── SIDEBAR DESKTOP ── */}
      <nav
        className="hidden md:flex fixed right-0 top-1/2 -translate-y-1/2 z-40 flex-col gap-1 py-4 px-2"
        style={{
          background: "rgba(225,219,201,0.88)",
          backdropFilter: "blur(12px)",
          borderLeft: "1px solid rgba(45,69,48,0.12)",
          borderRadius: "16px 0 0 16px",
          boxShadow: "-4px 0 24px rgba(45,69,48,0.06)",
        }}
      >
        {sections.map(({ key, label, icon: Icon }) => {
          const isActive = activeSection === key
          return (
            <motion.button
              key={key}
              onClick={() => handleSectionClick(key)}
              className="relative flex flex-col items-center gap-1 px-3 py-3 cursor-pointer rounded-xl w-16"
              animate={isActive ? "active" : "rest"}
              whileHover="hover"
              initial="rest"
            >
              <motion.div
                className="absolute inset-0 rounded-xl"
                style={{ backgroundColor: "rgba(45,69,48,0.1)" }}
                variants={{
                  rest:   { opacity: 0, scale: 0.9 },
                  hover:  { opacity: 1, scale: 1 },
                  active: { opacity: 1, scale: 1 },
                }}
                transition={{ duration: 0.2 }}
              />

              {isActive && (
                <motion.div
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 rounded-full"
                  style={{ backgroundColor: "#2D4530", height: "60%" }}
                  layoutId="activeBar"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}

              <motion.div
                className="relative z-10"
                variants={{
                  rest:   { scale: 1 },
                  hover:  { scale: 1.25 },
                  active: { scale: 1.25 },
                }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                <Icon
                  size={18}
                  style={{ color: isActive ? "#2D4530" : "rgba(45,69,48,0.5)" }}
                />
              </motion.div>

              <motion.span
                className="relative z-10 text-[10px] font-medium text-center leading-tight"
                variants={{
                  rest:   { color: "rgba(45,69,48,0.55)" },
                  hover:  { color: "#2D4530" },
                  active: { color: "#2D4530" },
                }}
                transition={{ duration: 0.2 }}
              >
                {label}
              </motion.span>
            </motion.button>
          )
        })}
      </nav>

      {/* ── BARRA MOBILE (bottom) ── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex justify-around px-2 py-2"
        style={{
          background: "rgba(225,219,201,0.97)",
          backdropFilter: "blur(12px)",
          borderTop: "1px solid rgba(45,69,48,0.12)",
          boxShadow: "0 -4px 24px rgba(45,69,48,0.06)",
        }}
      >
        {sections.map(({ key, label, icon: Icon }) => {
          const isActive = activeSection === key
          return (
            <motion.button
              key={key}
              onClick={() => handleSectionClick(key)}
              className="relative flex flex-col items-center gap-0.5 px-2 py-1 cursor-pointer rounded-xl"
              animate={isActive ? "active" : "rest"}
              whileHover="hover"
              initial="rest"
            >
              <Icon size={18} style={{ color: isActive ? "#2D4530" : "rgba(45,69,48,0.4)" }} />
              <span className="text-[9px] font-medium" style={{ color: isActive ? "#2D4530" : "rgba(45,69,48,0.45)" }}>
                {label}
              </span>
            </motion.button>
          )
        })}
      </nav>

      {/* --- CAMBIO CRÍTICO ACÁ --- */}
      {/* Solo mostramos el modal si existe una sección y NO es la de eventos */}
      {modalSection && modalSection !== "events" && (
        <SectionModal
          section={modalSection}
          onClose={() => setModalSection(null)}
        />
      )}
    </>
  )
}