"use client"

import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { sectionCategories, SectionKey } from "@/lib/sections"
import { ShoppingBag } from "lucide-react"
import {
  Utensils, Coffee, Beer, Bike, Clock,
  Wrench, Zap, Flame, Car, Building, Paintbrush, Hammer, KeyRound, Leaf, Waves, Home, Bug, Droplets, Sparkles,
  Stethoscope, Pill, Brain, Smile, Eye, PawPrint, AlertCircle,
  GraduationCap, BookOpen, Languages, Users, Music, Trophy,
  Hotel, Map, Tent, Activity, Compass, Plane,
  PartyPopper, ChefHat, Mic, Medal, Palette, Baby,
  Store, Salad, Shirt, Gem, HardHat, MoreHorizontal,
  Clock3, Landmark, Lightbulb, Bus, Info,
  Armchair, Dog, HeartPulse, Smartphone, FlaskConical
} from "lucide-react"

const categoryIcons: Record<string, any> = {
  // Gastronomía
  "Restaurantes": Utensils, "Bar/Café": Coffee, "Viandas": ShoppingBag,
  "Delivery": Bike, "Abierto ahora": Clock,
  // Servicios
  "Cerrajero": KeyRound, "Construcción": Building, "Desinfecciones": Bug,
  "Electricidad": Zap, "Gasista": Flame, "Herrero": Hammer, "Jardinero": Leaf,
  "Limpieza": Sparkles, "Mecánica": Car, "Perforaciones": Droplets, "Piletero": Waves,
  "Pintor": Paintbrush, "Plomería": Wrench, "Zinguero": Home,
  // Salud
  "Clínicas": Building, "Especialidades": Brain,
  "Hospitales y Dispensarios": AlertCircle, "Laboratorios": FlaskConical,
  "Terapias alternativas": Leaf,
  // Educación
  "Arte y Música": Music, "Colegios": GraduationCap, "Deporte": Trophy,
  "Idiomas": Languages, "Maestras/os Particulares": Users,
  // Turismo
  "Actividades y Paseos": Activity, "Agencia de Viajes": Plane,
  "Alojamiento": Hotel, "Alquiler": Compass, "Excursiones": Map,
  // Comercios
  "Hogar": Armchair, "Indumentaria": Shirt, "Mascotas": Dog, "Niños": Baby,
  "Salud": HeartPulse, "Tecnología": Smartphone, "Vehículos": Car,
  // Eventos
  "Culturales": Palette, "Deportivos": Medal, "Festivales": PartyPopper,
  "Gastronomía": ChefHat, "Infantiles": Baby, "Música": Mic,
  // Info
  "Cooperativas": Lightbulb, "Emergencias": AlertCircle, "Farmacias de turno": Clock3,
  "Municipalidad": Landmark, "Transporte": Bus, "Turismo oficial": Info,
}

interface Props {
  section: SectionKey | null
  onClose: () => void
}

export default function SectionModal({ section, onClose }: Props) {
  const isVisible = section !== null && section !== "events"
  const categories = isVisible ? sectionCategories[section!] : []

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
              <div className="grid grid-cols-2 gap-2">
                {categories.map(({ label, href, bg, color }, i) => {
                  const Icon = categoryIcons[label] || ShoppingBag
                  return (
                    <motion.div key={`m-${label}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03, type: "spring", stiffness: 300, damping: 20 }}>
                      <Link href={href} onClick={onClose} className="flex flex-col items-center text-center p-3 rounded-2xl border border-brand-slate/10 hover:border-brand-pine/30 hover:bg-brand-pine/5 transition-all h-full justify-center">
                        <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-2 shadow-sm`}>
                          <Icon size={18} className={color} />
                        </div>
                        <p className="text-[11px] font-bold text-brand-charcoal leading-tight uppercase tracking-tight">{label}</p>
                      </Link>
                    </motion.div>
                  )
                })}
              </div>
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
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {categories.map(({ label, href, bg, color }, i) => {
                    const Icon = categoryIcons[label] || ShoppingBag
                    return (
                      <motion.div key={`d-${label}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03, type: "spring", stiffness: 300, damping: 20 }}>
                        <Link href={href} onClick={onClose} className="flex flex-col items-center text-center p-3 rounded-2xl border border-brand-slate/10 hover:border-brand-pine/30 hover:bg-brand-pine/5 transition-all group h-full justify-center">
                          <motion.div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-2 shadow-sm`} whileHover={{ y: -6, scale: 1.15 }} transition={{ type: "spring", stiffness: 400, damping: 15 }}>
                            <Icon size={18} className={color} />
                          </motion.div>
                          <p className="text-[11px] font-bold text-brand-charcoal leading-tight uppercase tracking-tight">{label}</p>
                        </Link>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}