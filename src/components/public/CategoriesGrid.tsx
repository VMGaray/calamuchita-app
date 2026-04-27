"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import AnimateIn from "@/components/ui/AnimateIn"
import { sectionCategories, SectionKey } from "@/lib/sections"
import {
  Utensils, Coffee, ShoppingBag, Beer, Bike, Clock,
  Wrench, Zap, Flame, Car, Building, Paintbrush, Hammer, KeyRound, Leaf, Waves, Home, Bug, Droplets, Sparkles,
  Stethoscope, Pill, Brain, Smile, Eye, PawPrint, AlertCircle,
  GraduationCap, BookOpen, Languages, Users, Music, Trophy,
  Hotel, Map, Tent, Activity, Car as CarIcon, Compass,
  PartyPopper, ChefHat, Mic, Medal, Palette, Baby,
  Store, Salad, Shirt, Gem, HardHat, MoreHorizontal,
  Phone, Clock3, Landmark, Lightbulb, Bus, Info
} from "lucide-react"

const categoryIcons: Record<string, any> = {
  "Restaurantes": Utensils,
  "Cafés": Coffee,
  "Viandas": ShoppingBag,
  "Bares": Beer,
  "Delivery": Bike,
  "Abierto ahora": Clock,
  "Plomería": Wrench,
  "Electricidad": Zap,
  "Gasista": Flame,
  "Mecánica": Car,
  "Construcción": Building,
  "Pintor": Paintbrush,
  "Herrero": Hammer,
  "Cerrajero": KeyRound,
  "Jardinero": Leaf,
  "Piletero": Waves,
  "Zinguero": Home,
  "Desinfecciones": Bug,
  "Perforaciones": Droplets,
  "Limpieza": Sparkles,
  "Clínicas y consultorios": Stethoscope,
  "Farmacias": Pill,
  "Psicología": Brain,
  "Odontología": Smile,
  "Oftalmología": Eye,
  "Veterinarias": PawPrint,
  "Emergencias": AlertCircle,
  "Colegios": GraduationCap,
  "Institutos": BookOpen,
  "Idiomas": Languages,
  "Maestras particulares": Users,
  "Arte y música": Music,
  "Deportes": Trophy,
  "Alojamiento": Hotel,
  "Excursiones": Map,
  "Camping": Tent,
  "Actividades": Activity,
  "Alquiler": CarIcon,
  "Guías": Compass,
  "Festivales": PartyPopper,
  "Gastronomía": ChefHat,
  "Música": Mic,
  "Deportivos": Medal,
  "Culturales": Palette,
  "Infantiles": Baby,
  "Almacenes": Store,
  "Dietéticas": Salad,
  "Ropa": Shirt,
  "Artesanías": Gem,
  "Ferreterías": HardHat,
  "Otros": MoreHorizontal,
  "Farmacias de turno": Clock3,
  "Municipalidad": Landmark,
  "Cooperativas": Lightbulb,
  "Transporte": Bus,
  "Turismo oficial": Info,
}

interface Props {
  section: SectionKey
}

export default function CategoriesGrid({ section }: Props) {
  const categories = sectionCategories[section] || sectionCategories.gastronomy

  return (
    <div className="mb-12">
      <AnimateIn direction="left">
        <h2 className="font-serif text-2xl text-stone-900 mb-6">Categorías</h2>
      </AnimateIn>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {categories.map(({ label, desc, href, bg, color }, i) => {
          const Icon = categoryIcons[label] || ShoppingBag
          return (
            <AnimateIn key={label} direction="up" delay={i * 0.07}>
              <Link href={href} className="block h-full">
                <motion.div
                  className="bg-white rounded-2xl p-5 border border-stone-200 h-full overflow-visible relative"
                  whileHover="hover"
                  initial="rest"
                >
                  <motion.div
                    className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center mb-3`}
                    variants={{
                      rest: { y: 0, scale: 1 },
                      hover: { y: -10, scale: 1.15 },
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  >
                    <Icon size={22} className={color} />
                  </motion.div>
                  <motion.div
                    variants={{
                      rest: { opacity: 1 },
                      hover: { opacity: 1 },
                    }}
                  >
                    <h3 className="text-sm font-medium text-stone-800 mb-1">{label}</h3>
                    <p className="text-xs text-stone-400 leading-relaxed">{desc}</p>
                  </motion.div>
                  <motion.div
                    className="absolute inset-0 rounded-2xl border-2 border-primary-300"
                    variants={{
                      rest: { opacity: 0 },
                      hover: { opacity: 1 },
                    }}
                    transition={{ duration: 0.2 }}
                  />
                </motion.div>
              </Link>
            </AnimateIn>
          )
        })}
      </div>
    </div>
  )
}