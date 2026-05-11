"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  UtensilsCrossed,
  Wrench,
  ShoppingBag,
  Heart,
  GraduationCap,
  Compass,
  CalendarDays,
  Info,
} from "lucide-react"
import SectionModal from "@/components/public/SectionModal"
import { SectionKey } from "@/lib/sections"

const categories: { key: SectionKey; label: string; icon: React.ElementType }[] = [
  { key: "gastronomy", label: "Gastronomía", icon: UtensilsCrossed },
  { key: "services",   label: "Servicios",   icon: Wrench         },
  { key: "commerce",   label: "Comercios",   icon: ShoppingBag    },
  { key: "health",     label: "Salud",       icon: Heart          },
  { key: "education",  label: "Educación",   icon: GraduationCap  },
  { key: "tourism",    label: "Turismo",     icon: Compass        },
  { key: "events",     label: "Eventos",     icon: CalendarDays   },
  { key: "info",       label: "Info útil",   icon: Info           },
]

const glassContainer = {
  background: "rgba(255,255,255,0.50)",
  backdropFilter: "blur(28px)",
  WebkitBackdropFilter: "blur(28px)",
  boxShadow: "0 8px 32px rgba(8,112,184,0.10), inset 0 1px 0 rgba(255,255,255,0.70)",
  border: "1px solid rgba(255,255,255,0.60)",
} as React.CSSProperties

export default function StickyCategoryBar() {
  const [activeSection, setActiveSection] = useState<SectionKey | null>(null)

  const handleClick = (key: SectionKey) => {
    setActiveSection(prev => (prev === key ? null : key))
  }

  return (
    <>
      <div className="sticky top-0 z-50 px-3 py-3">

        {/* ── MOBILE: grid 4 columnas, 2 filas, todo visible ── */}
        <div className="md:hidden rounded-2xl p-2" style={glassContainer}>
          <div className="grid grid-cols-4 gap-2">
            {categories.map(({ key, label, icon: Icon }) => {
              const active = activeSection === key
              return (
                <motion.button
                  key={key}
                  onClick={() => handleClick(key)}
                  whileTap={{ scale: 0.93 }}
                  transition={{ type: "spring", stiffness: 500, damping: 28 }}
                  className="flex flex-col items-center justify-center gap-1.5 py-3 px-1 rounded-2xl cursor-pointer"
                  style={{
                    background: active
                      ? "rgba(201,164,75,0.18)"
                      : "rgba(255,255,255,0.40)",
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                    border: active
                      ? "1px solid rgba(201,164,75,0.55)"
                      : "1px solid rgba(255,255,255,0.55)",
                    color: active ? "#2D4530" : "rgba(45,69,48,0.55)",
                  }}
                >
                  <Icon
                    size={22}
                    strokeWidth={active ? 2.2 : 1.7}
                    style={{ color: active ? "#C9A44B" : undefined }}
                  />
                  <span
                    className={`text-[9px] uppercase leading-tight text-center ${active ? "font-bold" : "font-medium"}`}
                    style={{ letterSpacing: "0.04em" }}
                  >
                    {label}
                  </span>
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* ── DESKTOP: barra horizontal con distribución equitativa ── */}
        <div className="hidden md:flex justify-center">
          <div className="max-w-6xl w-full rounded-2xl p-2" style={glassContainer}>
            <div className="flex justify-evenly gap-1">
              {categories.map(({ key, label, icon: Icon }) => {
                const active = activeSection === key
                return (
                  <motion.button
                    key={key}
                    onClick={() => handleClick(key)}
                    whileHover={{ scale: 1.05 }}
                    animate={{ y: active ? -2 : 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 22 }}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-colors duration-150 whitespace-nowrap"
                    style={{
                      background: active ? "rgba(201,164,75,0.13)" : "transparent",
                      border: active
                        ? "1.5px solid #C9A44B"
                        : "1.5px solid transparent",
                      color: active ? "#2D4530" : "rgba(45,69,48,0.65)",
                    }}
                  >
                    <Icon
                      size={18}
                      strokeWidth={active ? 2.3 : 1.8}
                      style={{ color: active ? "#C9A44B" : undefined }}
                    />
                    <span className={`text-sm ${active ? "font-bold" : "font-medium"}`}>
                      {label}
                    </span>
                  </motion.button>
                )
              })}
            </div>
          </div>
        </div>

      </div>

      <SectionModal
        section={activeSection}
        onClose={() => setActiveSection(null)}
      />
    </>
  )
}
