"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  UtensilsCrossed, Wrench, ShoppingBag, Heart,
  GraduationCap, Dumbbell, Compass, CalendarDays, Info,
  Layers, X, ChevronRight,
} from "lucide-react"
import SectionModal from "@/components/public/SectionModal"
import { sectionCategories, SectionKey } from "@/lib/sections"

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

  // Desktop: controla SectionModal
  const [activeSection, setActiveSection] = useState<SectionKey | null>(null)

  // Mobile: controla drawer y acordeón
  const [isOpen,       setIsOpen]       = useState(false)
  const [expandedCat,  setExpandedCat]  = useState<NavKey | null>(null)

  const [isDesktop, setIsDesktop] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 768 : false
  )

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768)
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  // Bloquea scroll del body cuando el drawer está abierto
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [isOpen])

  // ── Click en desktop (barra horizontal) ──────────────────────────────────────
  const handleClick = (key: NavKey) => {
    if (key === "events") {
      router.push("/eventos")
    } else {
      setActiveSection(prev => (prev === key ? null : key))
    }
  }

  // ── Click en categoría dentro del drawer (mobile) ─────────────────────────
  const handleDrawerCategory = (key: NavKey) => {
    if (key === "events") {
      router.push("/eventos"); setIsOpen(false); return
    }
    setExpandedCat(prev => (prev === key ? null : key))
  }

  const handleSubcategory = (href: string) => {
    router.push(href)
    setIsOpen(false)
    setExpandedCat(null)
  }

  return (
    <>
      {/* ── MOBILE: pestaña flotante lateral ─────────────────────────────────── */}
      <button
        className="md:hidden fixed right-0 top-1/2 -translate-y-1/2 z-[160] bg-[#2D4530] text-white p-3 rounded-l-2xl shadow-lg flex items-center justify-center active:scale-95 transition-transform"
        onClick={() => setIsOpen(true)}
        aria-label="Abrir menú de categorías"
      >
        <Layers size={20} strokeWidth={1.8} />
      </button>

      {/* ── MOBILE: drawer ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay oscuro */}
            <motion.div
              className="md:hidden fixed inset-0 z-[200] bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.20 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Panel deslizable */}
            <motion.div
              className="md:hidden fixed right-0 top-0 bottom-0 z-[205] w-[78vw] flex flex-col rounded-l-[32px] overflow-hidden"
              style={{
                background: "rgba(240,235,224,0.97)",
                backdropFilter: "blur(28px)",
                WebkitBackdropFilter: "blur(28px)",
                borderLeft: "1px solid rgba(45,69,48,0.10)",
                boxShadow: "-16px 0 56px rgba(0,0,0,0.20)",
              }}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              {/* Header del panel */}
              <div className="flex items-center justify-between px-6 pt-12 pb-5 flex-shrink-0">
                <div>
                  <p
                    className="text-[10px] font-black uppercase tracking-[0.22em] mb-0.5"
                    style={{ color: "rgba(45,69,48,0.42)" }}
                  >
                    Navegar
                  </p>
                  <h2
                    className="text-xl font-bold tracking-tight"
                    style={{ color: "#2D4530" }}
                  >
                    Categorías
                  </h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-opacity active:opacity-60"
                  style={{ background: "rgba(45,69,48,0.09)" }}
                  aria-label="Cerrar menú"
                >
                  <X size={17} strokeWidth={2.3} style={{ color: "#2D4530" }} />
                </button>
              </div>

              {/* Línea divisora */}
              <div
                className="mx-6 mb-1 flex-shrink-0"
                style={{ height: 1, background: "rgba(45,69,48,0.09)" }}
              />

              {/* Lista de categorías con acordeón */}
              <div className="flex-1 overflow-y-auto px-4 pb-12">
                {categories.map(({ key, label, icon: Icon }, idx) => {
                  const hasSubs    = key !== "events" && key !== "sports" && !!sectionCategories[key as SectionKey]
                  const isExpanded = expandedCat === key
                  const isLast     = idx === categories.length - 1

                  return (
                    <div key={key}>
                      {/* Fila de categoría principal */}
                      <button
                        onClick={() => handleDrawerCategory(key)}
                        className="w-full flex items-center justify-between py-4 transition-opacity active:opacity-70"
                        style={{
                          borderBottom: (!isExpanded && !isLast) ? "1px solid rgba(45,69,48,0.07)" : "none",
                        }}
                      >
                        <div className="flex items-center gap-3.5">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: "rgba(45,69,48,0.09)" }}
                          >
                            <Icon size={17} strokeWidth={1.9} style={{ color: "#2D4530" }} />
                          </div>
                          <span
                            className="text-sm font-semibold"
                            style={{ color: "#2D4530" }}
                          >
                            {label}
                          </span>
                        </div>

                        {hasSubs && (
                          <motion.div
                            animate={{ rotate: isExpanded ? 90 : 0 }}
                            transition={{ type: "spring", stiffness: 420, damping: 28 }}
                          >
                            <ChevronRight
                              size={15}
                              strokeWidth={2.2}
                              style={{ color: "rgba(45,69,48,0.38)" }}
                            />
                          </motion.div>
                        )}
                      </button>

                      {/* Acordeón: subcategorías */}
                      <AnimatePresence initial={false}>
                        {isExpanded && hasSubs && (
                          <motion.div
                            key="subs"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 350, damping: 32 }}
                            style={{ overflow: "hidden" }}
                          >
                            <div className="grid grid-cols-2 gap-2 pt-1 pb-4">
                              {sectionCategories[key as SectionKey].map(({ label: subLabel, href }) => (
                                <button
                                  key={subLabel}
                                  onClick={() => handleSubcategory(href)}
                                  className="rounded-2xl p-3 text-left text-xs font-medium transition-colors active:scale-95"
                                  style={{
                                    background: "rgba(45,69,48,0.07)",
                                    border: "1px solid rgba(45,69,48,0.08)",
                                    color: "#2D4530",
                                  }}
                                >
                                  {subLabel}
                                </button>
                              ))}
                            </div>
                            {/* Divisor tras acordeón */}
                            <div
                              className="mb-1"
                              style={{ height: 1, background: "rgba(45,69,48,0.07)" }}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Barra sticky (vacía en mobile, activa en desktop) ────────────────── */}
      <div className="sticky z-[100] px-3 py-3" style={{ top: stickyOffset }}>
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

      {/* SectionModal: solo desktop ───────────────────────────────────────────── */}
      <SectionModal
        section={isDesktop ? activeSection : null}
        onClose={() => setActiveSection(null)}
      />
    </>
  )
}
