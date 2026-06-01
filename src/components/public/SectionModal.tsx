"use client"

import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { useLocalidad } from "@/lib/context/LocalidadContext"
import { sectionCategories, SectionKey } from "@/lib/sections"
import { ShoppingBag, MapPin, Check } from "lucide-react"
import {
  Utensils, Coffee, Beer, Bike, Clock, Package,
  Wrench, Zap, Flame, Car, Building, Paintbrush, Hammer, KeyRound, Leaf, Waves, Home, Bug, Droplets, Sparkles,
  Stethoscope, Pill, Brain, Smile, Eye, PawPrint, AlertCircle, Ambulance,
  GraduationCap, BookOpen, Languages, Users, Music, Trophy,
  Hotel, Map, Tent, Activity, Compass, Plane,
  PartyPopper, ChefHat, Mic, Medal, Palette, Baby,
  Store, Salad, Shirt, Gem, HardHat, MoreHorizontal,
  Clock3, Landmark, Lightbulb, Bus, Info,
  Armchair, Dog, Smartphone, FlaskConical
} from "lucide-react"

const categoryIcons: Record<string, any> = {
  "Restaurantes": Utensils, "Bar/Café": Coffee, "Viandas": ShoppingBag,
  "Delivery": Bike, "Take Away": Package, "Abierto ahora": Clock,
  "Cerrajero": KeyRound, "Construcción": Building, "Desinfecciones": Bug,
  "Electricidad": Zap, "Gasista": Flame, "Herrero": Hammer, "Jardinero": Leaf,
  "Limpieza": Sparkles, "Mecánica": Car, "Perforaciones": Droplets, "Piletero": Waves,
  "Pintor": Paintbrush, "Plomería": Wrench, "Zinguero": Home,
  "Clínicas": Building, "Especialidades": Stethoscope,
  "Hospitales y Dispensarios": AlertCircle, "Laboratorios": FlaskConical,
  "Psicología": Brain, "Terapias alternativas": Leaf, "Traslado de pacientes": Ambulance,
  "Arte y Música": Music, "Colegios": GraduationCap, "Deporte": Trophy,
  "Idiomas": Languages, "Maestras/os Particulares": Users,
  "Actividades y Paseos": Activity, "Agencia de Viajes": Plane,
  "Alojamiento": Hotel, "Alquiler": Compass, "Excursiones": Map,
  "Hogar": Armchair, "Indumentaria": Shirt, "Mascotas": Dog, "Niños": Baby,
  "Tecnología": Smartphone, "Vehículos": Car,
  "Culturales": Palette, "Deportivos": Medal, "Festivales": PartyPopper,
  "Gastronomía": ChefHat, "Infantiles": Baby, "Música": Mic,
  "Cooperativas": Lightbulb, "Emergencias": AlertCircle, "Farmacias de turno": Clock3,
  "Municipalidad": Landmark, "Transporte": Bus, "Turismo oficial": Info,
}

interface Props {
  section: SectionKey | null
  onClose: () => void
}

function useActiveCategory(categories: { label: string; href: string }[]) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  return categories.find(({ href }) => {
    const [hrefPath, hrefQuery] = href.split("?")
    if (pathname !== hrefPath) return false
    if (!hrefQuery) return searchParams.toString() === ""
    const hrefParams = new URLSearchParams(hrefQuery)
    for (const [key, value] of hrefParams) {
      if (searchParams.get(key) !== value) return false
    }
    return true
  }) ?? null
}

function ActiveFiltersBar({ activeCategory, section }: { activeCategory: { label: string } | null; section: SectionKey }) {
  const { localidad } = useLocalidad()
  if (!activeCategory && !localidad) return null

  return (
    <div className="flex flex-wrap gap-2 mb-3 pb-3" style={{ borderBottom: "1px solid rgba(45,69,48,0.08)" }}>
      {localidad && (
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium"
          style={{ background: "rgba(45,69,48,0.08)", color: "#2D4530" }}
        >
          <MapPin size={10} />
          {localidad}
        </span>
      )}
      {activeCategory && (
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
          style={{ background: "#2D4530", color: "#E1DBC9" }}
        >
          <Check size={10} strokeWidth={2.5} />
          {activeCategory.label}
        </span>
      )}
    </div>
  )
}

export default function SectionModal({ section, onClose }: Props) {
  const isVisible = section !== null && section !== "events"
  const categories = isVisible ? sectionCategories[section!] : []
  const activeCategory = useActiveCategory(categories)

  useEffect(() => {
    document.body.style.overflow = isVisible ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [isVisible])

  if (!isVisible) return null

  const sectionTitle =
    section === "gastronomy" ? "Gastronomía"
    : section === "services" ? "Servicios"
    : section === "health" ? "Salud"
    : section === "education" ? "Educación"
    : section === "tourism" ? "Turismo"
    : section === "commerce" ? "Comercios"
    : "Info útil"

  const renderGrid = (cols: string) => (
    <div className={`grid ${cols} gap-2`}>
      {categories.map(({ label, href, bg, color }, i) => {
        const Icon = categoryIcons[label] || ShoppingBag
        const isActive = activeCategory?.href === href

        return (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03, type: "spring", stiffness: 300, damping: 20 }}
          >
            <Link
              href={href}
              onClick={onClose}
              className="flex flex-col items-center text-center p-3 rounded-2xl border transition-all h-full justify-center"
              style={
                isActive
                  ? { background: "#2D4530", borderColor: "#2D4530", color: "#E1DBC9" }
                  : { background: "white", borderColor: "rgba(107,123,132,0.1)" }
              }
            >
              <motion.div
                className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 shadow-sm ${isActive ? "" : bg}`}
                style={isActive ? { background: "rgba(225,219,201,0.18)" } : {}}
                whileHover={{ y: -4, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                <Icon
                  size={18}
                  className={isActive ? "" : color}
                  style={isActive ? { color: "#E1DBC9" } : {}}
                />
              </motion.div>
              {isActive && (
                <Check size={9} strokeWidth={3} className="absolute top-2 right-2 opacity-70" style={{ color: "#E1DBC9" }} />
              )}
              <p
                className="text-[11px] font-bold leading-tight uppercase tracking-tight"
                style={isActive ? { color: "#E1DBC9" } : { color: "#3C3C3C" }}
              >
                {label}
              </p>
            </Link>
          </motion.div>
        )
      })}
    </div>
  )

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/40 z-[200]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Mobile: bottom sheet */}
          <motion.div
            className="md:hidden fixed bottom-0 left-0 right-0 z-[201] rounded-t-3xl overflow-hidden"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 320 }}
          >
            <div className="flex justify-center pt-3 pb-1 bg-white">
              <div className="w-10 h-1 rounded-full" style={{ background: "rgba(107,123,132,0.3)" }} />
            </div>
            <div className="bg-brand-pine px-6 py-4 flex items-center justify-between">
              <h2 className="font-serif text-xl text-brand-sand capitalize">{sectionTitle}</h2>
              <button onClick={onClose} className="text-brand-sand/60 hover:text-brand-sand text-3xl leading-none font-light">
                &times;
              </button>
            </div>
            <div className="p-4 overflow-y-auto bg-[#FDFCF9]" style={{ maxHeight: "60vh" }}>
              <ActiveFiltersBar activeCategory={activeCategory} section={section!} />
              {section === "gastronomy" && (
                <Link
                  href="/menu-del-dia"
                  onClick={onClose}
                  className="flex items-center justify-between w-full mb-4 px-4 py-3 rounded-2xl border transition-all"
                  style={{ background: "#2D4530", borderColor: "#2D4530", color: "#E1DBC9" }}
                >
                  <div className="flex items-center gap-3">
                    <Utensils size={18} />
                    <div>
                      <p className="text-sm font-bold leading-tight">Menú del Día</p>
                      <p className="text-xs opacity-70">Ver los menús de hoy en el Valle</p>
                    </div>
                  </div>
                  <span className="text-lg opacity-60">→</span>
                </Link>
              )}
              {renderGrid("grid-cols-2")}
            </div>
          </motion.div>

          {/* Desktop: centered popup */}
          <motion.div
            className="hidden md:block fixed top-28 left-1/2 -translate-x-1/2 z-[201] w-full max-w-2xl px-4"
            initial={{ opacity: 0, scale: 0.7, y: -40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
          >
            <div className="bg-white rounded-3xl overflow-hidden border border-brand-slate/20 shadow-2xl">
              <div className="bg-brand-pine px-6 py-4 flex items-center justify-between">
                <h2 className="font-serif text-xl text-brand-sand capitalize">{sectionTitle}</h2>
                <button onClick={onClose} className="text-brand-sand/60 hover:text-brand-sand text-3xl leading-none font-light">
                  &times;
                </button>
              </div>
              <div className="p-4 overflow-y-auto max-h-[calc(100vh-14rem)] bg-[#FDFCF9]">
                <ActiveFiltersBar activeCategory={activeCategory} section={section!} />
                {section === "gastronomy" && (
                  <Link
                    href="/menu-del-dia"
                    onClick={onClose}
                    className="flex items-center justify-between w-full mb-4 px-4 py-3 rounded-2xl border transition-all hover:opacity-90"
                    style={{ background: "#2D4530", borderColor: "#2D4530", color: "#E1DBC9" }}
                  >
                    <div className="flex items-center gap-3">
                      <Utensils size={18} />
                      <div>
                        <p className="text-sm font-bold leading-tight">Menú del Día</p>
                        <p className="text-xs opacity-70">Ver los menús de hoy en el Valle</p>
                      </div>
                    </div>
                    <span className="text-lg opacity-60">→</span>
                  </Link>
                )}
                {renderGrid("grid-cols-2 md:grid-cols-3")}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
