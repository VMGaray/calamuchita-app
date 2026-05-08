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

export default function StickyCategoryBar() {
  const [activeSection, setActiveSection] = useState<SectionKey | null>(null)

  const handleClick = (key: SectionKey) => {
    setActiveSection(prev => (prev === key ? null : key))
  }

  return (
    <>
      <div className="sticky top-0 z-50 flex justify-center px-4 py-4">
        <div
          className="max-w-6xl w-full flex overflow-x-auto gap-2 p-2.5 rounded-2xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{
            background: "rgba(255,255,255,0.45)",
            backdropFilter: "blur(28px)",
            WebkitBackdropFilter: "blur(28px)",
            boxShadow:
              "0 20px 50px rgba(8,112,184,0.12), inset 0 1px 0 rgba(255,255,255,0.65)",
            border: "1px solid rgba(255,255,255,0.55)",
          }}
        >
          {categories.map(({ key, label, icon: Icon }) => {
            const active = activeSection === key
            return (
              <motion.button
                key={key}
                onClick={() => handleClick(key)}
                whileHover={{ scale: 1.05 }}
                animate={{ y: active ? -4 : 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
                className={`flex flex-shrink-0 items-center gap-2 px-4 py-3 rounded-xl text-base font-bold whitespace-nowrap transition-colors duration-150 cursor-pointer ${
                  active
                    ? "bg-brand-earth/15 text-brand-earth shadow-sm"
                    : "text-brand-pine hover:bg-brand-pine/8"
                }`}
              >
                <Icon size={24} strokeWidth={active ? 2.3 : 1.8} />
                {label}
              </motion.button>
            )
          })}
        </div>
      </div>

      <SectionModal
        section={activeSection}
        onClose={() => setActiveSection(null)}
      />
    </>
  )
}
