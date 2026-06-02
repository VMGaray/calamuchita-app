"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  UtensilsCrossed,
  Wrench,
  ShoppingBag,
  Heart,
  GraduationCap,
  Dumbbell,
  Compass,
  CalendarDays,
  Info,
} from "lucide-react"
import SectionModal from "@/components/public/SectionModal"
import { SectionKey } from "@/lib/sections"

type NavKey = SectionKey | "sports"

const categories: { key: NavKey; label: string; icon: React.ElementType }[] = [
  { key: "gastronomy", label: "Gastronomía", icon: UtensilsCrossed },
  { key: "services",   label: "Servicios",   icon: Wrench         },
  { key: "commerce",   label: "Comercios",   icon: ShoppingBag    },
  { key: "health",     label: "Salud",       icon: Heart          },
  { key: "education",  label: "Educación",   icon: GraduationCap  },
  { key: "sports",     label: "Deporte",     icon: Dumbbell       },
  { key: "tourism",    label: "Turismo",     icon: Compass        },
  { key: "events",     label: "Eventos",     icon: CalendarDays   },
  { key: "info",       label: "Info útil",   icon: Info           },
]

const glassContainer: React.CSSProperties = {
  background: "rgba(28,48,30,0.93)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.10)",
}

interface Props {
  stickyOffset?: number
}

export default function StickyCategoryBar({ stickyOffset = 0 }: Props) {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState<SectionKey | null>(null)

  const handleClick = (key: NavKey) => {
    if (key === "events") {
      router.push("/eventos")
    } else if (key === "sports") {
      router.push("/directorio/education?cat=deporte")
    } else {
      setActiveSection(prev => (prev === key ? null : key))
    }
  }

  const gastronomy = categories[0]
  const rest       = categories.slice(1) // 8 items → two rows of 4

  return (
    <>
      <div className="sticky z-[100] px-3 py-3" style={{ top: stickyOffset }}>

        {/* ── MOBILE ── */}
        <div className="md:hidden rounded-2xl p-2" style={glassContainer}>
          <div className="grid grid-cols-4 gap-1.5">

            {/* Gastronomía — full-width top row */}
            {(() => {
              const active = activeSection === "gastronomy"
              const Icon   = gastronomy.icon
              return (
                <motion.button
                  key="gastronomy"
                  onClick={() => handleClick("gastronomy")}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 500, damping: 28 }}
                  className="col-span-4 flex flex-row items-center justify-center gap-3 py-3 px-4 rounded-xl cursor-pointer"
                  style={{
                    background: active
                      ? "rgba(225,219,201,0.22)"
                      : "rgba(225,219,201,0.09)",
                    border: active
                      ? "1px solid rgba(225,219,201,0.50)"
                      : "1px solid rgba(225,219,201,0.18)",
                  }}
                >
                  <Icon
                    size={20}
                    strokeWidth={active ? 2.2 : 1.8}
                    style={{ color: active ? "#E1DBC9" : "rgba(225,219,201,0.85)", flexShrink: 0 }}
                  />
                  <span
                    className={`text-sm leading-tight text-center tracking-wide ${active ? "font-bold" : "font-semibold"}`}
                    style={{ color: active ? "#E1DBC9" : "rgba(225,219,201,0.85)" }}
                  >
                    Gastronomía
                  </span>
                </motion.button>
              )
            })()}

            {/* Remaining 8 categories — two rows of 4 */}
            {rest.map(({ key, label, icon: Icon }) => {
              const active = key !== "sports" && activeSection === key
              const isInfo = key === "info"
              return (
                <motion.button
                  key={key}
                  onClick={() => handleClick(key)}
                  whileTap={{ scale: 0.92 }}
                  transition={{ type: "spring", stiffness: 500, damping: 28 }}
                  className="flex flex-col items-center justify-center gap-1.5 py-2.5 px-1 rounded-xl cursor-pointer"
                  style={{
                    background: active
                      ? "rgba(225,219,201,0.18)"
                      : isInfo
                        ? "rgba(194,140,40,0.20)"
                        : "rgba(255,255,255,0.07)",
                    border: active
                      ? "1px solid rgba(225,219,201,0.45)"
                      : isInfo
                        ? "1px solid rgba(194,140,40,0.50)"
                        : "1px solid rgba(255,255,255,0.10)",
                  }}
                >
                  <Icon
                    size={20}
                    strokeWidth={active ? 2.2 : isInfo ? 2.1 : 1.7}
                    style={{
                      color: active
                        ? "#E1DBC9"
                        : isInfo
                          ? "rgba(230,175,60,0.95)"
                          : "rgba(200,210,185,0.80)",
                    }}
                  />
                  <span
                    className={`text-[10px] leading-tight text-center tracking-wide ${active || isInfo ? "font-bold" : "font-medium"}`}
                    style={{
                      color: active
                        ? "#E1DBC9"
                        : isInfo
                          ? "rgba(230,185,70,0.97)"
                          : "rgba(210,218,195,0.82)",
                    }}
                  >
                    {label}
                  </span>
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* ── DESKTOP: barra horizontal ── */}
        <div className="hidden md:flex justify-center">
          <div className="max-w-6xl w-full rounded-2xl p-2 min-h-[54px]" style={glassContainer}>
            <div className="flex justify-evenly gap-1">
              {categories.map(({ key, label, icon: Icon }) => {
                const active = key !== "sports" && activeSection === key
                const isInfo = key === "info"
                return (
                  <motion.button
                    key={key}
                    onClick={() => handleClick(key)}
                    whileHover={{ y: -1 }}
                    animate={{ y: active ? -2 : 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 22 }}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer whitespace-nowrap"
                    style={{
                      background: active
                        ? "rgba(225,219,201,0.16)"
                        : isInfo
                          ? "rgba(194,140,40,0.18)"
                          : "transparent",
                      border: active
                        ? "1.5px solid rgba(225,219,201,0.40)"
                        : isInfo
                          ? "1.5px solid rgba(194,140,40,0.45)"
                          : "1.5px solid transparent",
                    }}
                  >
                    <Icon
                      size={18}
                      strokeWidth={active ? 2.3 : isInfo ? 2.1 : 1.8}
                      style={{
                        color: active
                          ? "#E1DBC9"
                          : isInfo
                            ? "rgba(230,175,60,0.95)"
                            : "rgba(200,210,185,0.82)",
                      }}
                    />
                    <span
                      className={`text-sm ${active || isInfo ? "font-bold" : "font-medium"}`}
                      style={{
                        color: active
                          ? "#E1DBC9"
                          : isInfo
                            ? "rgba(230,185,70,0.97)"
                            : "rgba(210,218,195,0.85)",
                      }}
                    >
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
