"use client"

import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { sectionCategories, SectionKey } from "@/lib/sections"
import { ShoppingBag } from "lucide-react"
import {
  Utensils, Coffee, Beer, Bike, Clock,
  Wrench, Zap, Flame, Car, Building, Paintbrush, Hammer, KeyRound, Leaf, Waves, Home, Bug, Droplets, Sparkles,
  Stethoscope, Pill, Brain, Smile, Eye, PawPrint, AlertCircle,
  GraduationCap, BookOpen, Languages, Users, Music, Trophy,
  Hotel, Map, Tent, Activity, Compass,
  PartyPopper, ChefHat, Mic, Medal, Palette, Baby,
  Store, Salad, Shirt, Gem, HardHat, MoreHorizontal,
  Clock3, Landmark, Lightbulb, Bus, Info
} from "lucide-react"

const categoryIcons: Record<string, any> = {
  "Restaurantes": Utensils, "Cafés": Coffee, "Viandas": ShoppingBag, "Bares": Beer,
  "Delivery": Bike, "Abierto ahora": Clock, "Plomería": Wrench, "Electricidad": Zap,
  "Gasista": Flame, "Mecánica": Car, "Construcción": Building, "Perforaciones": Droplets,
  "Pintor": Paintbrush, "Herrero": Hammer, "Cerrajero": KeyRound, "Jardinero": Leaf, "Piletero": Waves,
  "Zinguero": Home, "Desinfecciones": Bug, "Limpieza": Sparkles,
  "Clínicas y consultorios": Stethoscope, "Farmacias": Pill, "Psicología": Brain,
  "Odontología": Smile, "Oftalmología": Eye, "Veterinarias": PawPrint, "Emergencias": AlertCircle,
  "Colegios": GraduationCap, "Institutos": BookOpen, "Idiomas": Languages,
  "Maestras particulares": Users, "Arte y música": Music, "Deportes": Trophy,
  "Alojamiento": Hotel, "Excursiones": Map, "Camping": Tent, "Actividades": Activity,
  "Alquiler": Car, "Guías": Compass, "Festivales": PartyPopper, "Gastronomía": ChefHat,
  "Música": Mic, "Deportivos": Medal, "Culturales": Palette, "Infantiles": Baby,
  "Almacenes": Store, "Dietéticas": Salad, "Ropa": Shirt, "Artesanías": Gem,
  "Ferreterías": HardHat, "Otros": MoreHorizontal, "Farmacias de turno": Clock3,
  "Municipalidad": Landmark, "Cooperativas": Lightbulb, "Transporte": Bus,
  "Turismo oficial": Info,
}

interface Props {
  section: SectionKey | null
  onClose: () => void
}

export default function SectionModal({ section, onClose }: Props) {
  const categories = section ? sectionCategories[section] : []

  return (
    <AnimatePresence>
      {section && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/40 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal que se viene hacia adelante */}
          <motion.div
            className="fixed top-28 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4"
            initial={{ opacity: 0, scale: 0.7, y: -40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
          >
            <div className="bg-white rounded-3xl overflow-hidden border border-stone-200">

              {/* Header del modal */}
              <div className="bg-primary-500 px-6 py-4 flex items-center justify-between">
                <h2 className="font-serif text-xl text-sand-100 capitalize">
                  {section === "gastronomy" ? "Gastronomía"
                    : section === "services" ? "Servicios"
                    : section === "health" ? "Salud"
                    : section === "education" ? "Educación"
                    : section === "tourism" ? "Turismo"
                    : section === "commerce" ? "Comercios"
                    : section === "events" ? "Eventos"
                    : "Info útil"}
                </h2>
                <button
                  onClick={onClose}
                  className="text-primary-200 hover:text-primary-100 text-2xl leading-none"
                >
                  ×
                </button>
              </div>

             {/* Grid de categorías con scroll */}
<div className="p-4 overflow-y-auto max-h-96">
  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
    {categories.map(({ label, desc, href, bg, color }, i) => {
      const Icon = categoryIcons[label] || ShoppingBag
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
            className="flex flex-col items-center text-center p-3 rounded-2xl border border-stone-100 hover:border-primary-300 hover:bg-stone-50 transition-all group"
          >
            <motion.div
              className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-2`}
              whileHover={{ y: -6, scale: 1.15 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              <Icon size={18} className={color} />
            </motion.div>
            <p className="text-xs font-medium text-stone-700 leading-tight">{label}</p>
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