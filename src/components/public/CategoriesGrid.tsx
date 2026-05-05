"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import AnimateIn from "@/components/ui/AnimateIn"
import { sectionCategories, SectionKey } from "@/lib/sections"
import {
  Utensils, Coffee, ShoppingBag, Beer, Bike, Clock,
  Wrench, Zap, Flame, Car, Building, Paintbrush, Hammer,
  KeyRound, Leaf, Waves, Home, Bug, Droplets, Sparkles,
  Stethoscope, Pill, Brain, Smile, Eye, PawPrint, AlertCircle,
  GraduationCap, BookOpen, Languages, Users, Music, Trophy,
  Hotel, Map, Tent, Activity, Compass, PartyPopper, ChefHat,
  Mic, Medal, Palette, Baby, Store, Salad, Shirt, Gem,
  HardHat, MoreHorizontal, Clock3, Landmark, Lightbulb, Bus, Info
} from "lucide-react"

const categoryIcons: Record<string, any> = {
  "Todos": MoreHorizontal,
  "Restaurantes": Utensils, "Cafés": Coffee, "Viandas": ShoppingBag,
  "Bares": Beer, "Delivery": Bike, "Abierto ahora": Clock, "Varios": MoreHorizontal,
  "Plomería": Wrench, "Electricidad": Zap, "Gasista": Flame,
  "Mecánica": Car, "Construcción": Building, "Pintor": Paintbrush,
  "Herrero": Hammer, "Cerrajero": KeyRound, "Jardinero": Leaf,
  "Piletero": Waves, "Zinguero": Home, "Desinfecciones": Bug,
  "Perforaciones": Droplets, "Limpieza": Sparkles,
  "Clínicas y consultorios": Stethoscope, "Farmacias": Pill,
  "Psicología": Brain, "Odontología": Smile, "Oftalmología": Eye,
  "Veterinarias": PawPrint, "Emergencias": AlertCircle,
  "Colegios": GraduationCap, "Institutos": BookOpen,
  "Idiomas": Languages, "Maestras particulares": Users,
  "Arte y música": Music, "Deportes": Trophy,
  "Alojamiento": Hotel, "Excursiones": Map, "Camping": Tent,
  "Actividades": Activity, "Alquiler": Car, "Guías": Compass,
  "Festivales": PartyPopper, "Gastronomía": ChefHat, "Música": Mic,
  "Deportivos": Medal, "Culturales": Palette, "Infantiles": Baby,
  "Almacenes": Store, "Dietéticas": Salad, "Ropa": Shirt,
  "Artesanías": Gem, "Ferreterías": HardHat,
  "Farmacias de turno": Clock3, "Municipalidad": Landmark,
  "Cooperativas": Lightbulb, "Transporte": Bus, "Turismo oficial": Info,
}

const bentoSizes = [
  "col-span-2 row-span-2",
  "col-span-1 row-span-1",
  "col-span-1 row-span-1",
  "col-span-1 row-span-2",
  "col-span-1 row-span-1",
  "col-span-1 row-span-1",
  "col-span-2 row-span-1",
  "col-span-1 row-span-1",
]

interface Props {
  section: SectionKey
}

export default function CategoriesGrid({ section }: Props) {
  const categories = sectionCategories[section] || sectionCategories.gastronomy
  const displayed = categories.slice(0, 8)

  return (
    <div className="mb-12">
      <AnimateIn direction="left">
        <h2 className="font-serif text-2xl text-stone-900 mb-6">Categorías</h2>
      </AnimateIn>

      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: "repeat(4, 1fr)", gridAutoRows: "120px" }}
      >
        {displayed.map(({ label, desc, href, bg, color }, i) => {
          const Icon = categoryIcons[label] || ShoppingBag
          const size = bentoSizes[i] || "col-span-1 row-span-1"
          const isBig = size.includes("col-span-2") && size.includes("row-span-2")
          const isWide = size.includes("col-span-2") && !size.includes("row-span-2")
          const isTall = size.includes("row-span-2") && !size.includes("col-span-2")

          return (
            <AnimateIn key={label} direction="up" delay={i * 0.06} className={size}>
              <Link href={href} className="block h-full">
                <motion.div
                  className="relative h-full rounded-2xl overflow-hidden cursor-pointer group"
                  whileHover="hover"
                  initial="rest"
                  style={{
                    background: "rgba(255,255,255,0.65)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    border: "1px solid rgba(255,255,255,0.8)",
                    boxShadow: "0 4px 24px rgba(83,120,149,0.08)",
                  }}
                >
                  {/* Animated gradient border */}
                  <motion.div
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: "linear-gradient(135deg, rgba(83,120,149,0.15), rgba(105,145,199,0.1), rgba(83,120,149,0.15))",
                      zIndex: 0,
                    }}
                  />

                  {/* Gradient border effect */}
                  <motion.div
                    className="absolute inset-0 rounded-2xl"
                    variants={{
                      rest: { opacity: 0 },
                      hover: { opacity: 1 },
                    }}
                    transition={{ duration: 0.3 }}
                    style={{
                      background: "linear-gradient(135deg, rgba(83,120,149,0.4), rgba(163,189,237,0.3), rgba(83,120,149,0.4))",
                      padding: "1.5px",
                      WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                      WebkitMaskComposite: "xor",
                      maskComposite: "exclude",
                      zIndex: 1,
                    }}
                  />

                  {/* Content */}
                  <div className={`relative z-10 flex h-full ${
                    isBig ? "flex-col justify-between p-6"
                    : isWide ? "flex-row items-center gap-4 px-6"
                    : isTall ? "flex-col justify-between p-5"
                    : "flex-col justify-between p-4"
                  }`}>

                    {/* Icon */}
                    <motion.div
                      className={`flex items-center justify-center rounded-2xl ${bg} ${
                        isBig ? "w-16 h-16" : isWide ? "w-12 h-12 flex-shrink-0" : "w-11 h-11"
                      }`}
                      variants={{
                        rest: { y: 0, scale: 1, rotate: 0 },
                        hover: { y: isBig ? -6 : -4, scale: 1.12, rotate: 3 },
                      }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    >
                      <Icon size={isBig ? 28 : isWide ? 22 : 20} className={color} />
                    </motion.div>

                    {/* Text */}
                    <div className={isWide ? "flex-1 min-w-0" : ""}>
                      <motion.p
                        className={`font-medium text-stone-800 leading-tight ${
                          isBig ? "text-lg mb-1" : "text-sm mb-0.5"
                        }`}
                        variants={{
                          rest: { opacity: 0.85 },
                          hover: { opacity: 1 },
                        }}
                      >
                        {label}
                      </motion.p>
                      {(isBig || isWide || isTall) && (
                        <p className={`text-stone-400 leading-relaxed ${isBig ? "text-sm" : "text-xs"}`}>
                          {desc}
                        </p>
                      )}
                    </div>

                    {/* Arrow on hover */}
                    {isBig && (
                      <motion.span
                        className="text-primary-400 text-sm font-medium"
                        variants={{
                          rest: { opacity: 0, x: -8 },
                          hover: { opacity: 1, x: 0 },
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        Ver todos →
                      </motion.span>
                    )}
                  </div>
                </motion.div>
              </Link>
            </AnimateIn>
          )
        })}
      </div>
    </div>
  )
}