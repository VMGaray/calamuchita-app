"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import AnimateIn from "@/components/ui/AnimateIn"
import {
  Flame, Shield, Ambulance, Hospital, Pill, PawPrint,
  Droplets, Zap, Phone, Clock, Info, MapPin
} from "lucide-react"

interface Contact {
  id: string
  title: string
  description: string | null
  phone: string | null
  schedule: string | null
  category: "emergencias" | "salud" | "servicios" | "general"
}

interface Locality {
  name: string
  contacts: Contact[]
}

const contactIcons: Record<string, any> = {
  "Bomberos": Flame,
  "Policía": Shield,
  "Ambulancia": Ambulance,
  "Hospital": Hospital,
  "Dispensario": Hospital,
  "Farmacia": Pill,
  "Veterinaria": PawPrint,
  "Agua": Droplets,
  "Luz": Zap,
}

const getIcon = (title: string) => {
  const key = Object.keys(contactIcons).find(k => title.includes(k))
  return key ? contactIcons[key] : Info
}

const contactColors: Record<string, { bg: string; icon: string; grad: string }> = {
  emergencias: {
    bg: "bg-rose-50", icon: "text-rose-400",
    grad: "from-[#fde8e8] to-[#fbd0d0]"
  },
  salud: {
    bg: "bg-sky-50", icon: "text-sky-400",
    grad: "from-[#e0f2fe] to-[#bae6fd]"
  },
  servicios: {
    bg: "bg-amber-50", icon: "text-amber-400",
    grad: "from-[#fef9c3] to-[#fde68a]"
  },
  general: {
    bg: "bg-slate-50", icon: "text-slate-400",
    grad: "from-[#f1f5f9] to-[#e2e8f0]"
  },
}

const LOCALITIES: Locality[] = [
  {
    name: "Villa General Belgrano",
    contacts: [
      { id: "vgb-1", title: "Bomberos Voluntarios", description: "Emergencias y rescate", phone: "03546-461222", schedule: "24hs", category: "emergencias" },
      { id: "vgb-2", title: "Policía", description: "Comisaría local", phone: "03546-461101", schedule: "24hs", category: "emergencias" },
      { id: "vgb-3", title: "Ambulancia SAME", description: "Emergencias médicas", phone: "107", schedule: "24hs", category: "emergencias" },
      { id: "vgb-4", title: "Dispensario", description: "Centro de salud municipal", phone: "03546-461234", schedule: "Lun-Vie 8-20hs", category: "salud" },
      { id: "vgb-5", title: "Farmacia", description: "Farmacia de turno", phone: null, schedule: "Consultar", category: "salud" },
      { id: "vgb-6", title: "Cooperativa de Luz", description: "Cortes y emergencias eléctricas", phone: "03546-461300", schedule: "24hs", category: "servicios" },
      { id: "vgb-7", title: "Cooperativa de Agua", description: "Servicio de agua potable", phone: "03546-461400", schedule: "Lun-Vie 7-13hs", category: "servicios" },
    ]
  },
  {
    name: "Santa Rosa de Calamuchita",
    contacts: [
      { id: "src-1", title: "Bomberos Voluntarios", description: "Emergencias y rescate", phone: "03546-490222", schedule: "24hs", category: "emergencias" },
      { id: "src-2", title: "Policía", description: "Comisaría local", phone: "03546-490101", schedule: "24hs", category: "emergencias" },
      { id: "src-3", title: "Hospital", description: "Hospital público municipal", phone: "03546-490300", schedule: "24hs", category: "salud" },
      { id: "src-4", title: "Farmacia", description: "Farmacia de turno", phone: null, schedule: "Consultar", category: "salud" },
      { id: "src-5", title: "Cooperativa de Luz", description: "Emergencias eléctricas", phone: "03546-490400", schedule: "24hs", category: "servicios" },
    ]
  },
  {
    name: "La Cumbrecita",
    contacts: [
      { id: "lc-1", title: "Bomberos Voluntarios", description: "Emergencias y rescate", phone: "03546-490222", schedule: "24hs", category: "emergencias" },
      { id: "lc-2", title: "Policía", description: "Destacamento policial", phone: "03546-498101", schedule: "24hs", category: "emergencias" },
      { id: "lc-3", title: "Dispensario", description: "Centro de salud", phone: "03546-498200", schedule: "Lun-Vie 8-14hs", category: "salud" },
      { id: "lc-4", title: "Cooperativa de Luz", description: "Emergencias eléctricas", phone: "03546-498300", schedule: "24hs", category: "servicios" },
    ]
  },
  {
    name: "Los Reartes",
    contacts: [
      { id: "lr-1", title: "Bomberos Voluntarios", description: "Emergencias y rescate", phone: "03546-497222", schedule: "24hs", category: "emergencias" },
      { id: "lr-2", title: "Policía", description: "Destacamento policial", phone: "03546-497101", schedule: "24hs", category: "emergencias" },
      { id: "lr-3", title: "Dispensario", description: "Centro de salud", phone: "03546-497200", schedule: "Lun-Vie 8-14hs", category: "salud" },
    ]
  },
  {
    name: "Embalse",
    contacts: [
      { id: "emb-1", title: "Bomberos Voluntarios", description: "Emergencias y rescate", phone: "03571-432222", schedule: "24hs", category: "emergencias" },
      { id: "emb-2", title: "Policía", description: "Comisaría local", phone: "03571-432101", schedule: "24hs", category: "emergencias" },
      { id: "emb-3", title: "Hospital", description: "Hospital público", phone: "03571-432300", schedule: "24hs", category: "salud" },
      { id: "emb-4", title: "Farmacia", description: "Farmacia de turno", phone: null, schedule: "Consultar", category: "salud" },
      { id: "emb-5", title: "Cooperativa de Luz", description: "Emergencias eléctricas", phone: "03571-432400", schedule: "24hs", category: "servicios" },
    ]
  },
  {
    name: "Amboy",
    contacts: [
      { id: "amb-1", title: "Bomberos Voluntarios", description: "Emergencias y rescate", phone: "03546-499222", schedule: "24hs", category: "emergencias" },
      { id: "amb-2", title: "Policía", description: "Destacamento policial", phone: "03546-499101", schedule: "24hs", category: "emergencias" },
      { id: "amb-3", title: "Dispensario", description: "Centro de salud", phone: "03546-499200", schedule: "Lun-Vie 8-14hs", category: "salud" },
    ]
  },
  {
    name: "Villa del Dique",
    contacts: [
      { id: "vdd-1", title: "Bomberos Voluntarios", description: "Emergencias y rescate", phone: "03571-490222", schedule: "24hs", category: "emergencias" },
      { id: "vdd-2", title: "Policía", description: "Comisaría local", phone: "03571-490101", schedule: "24hs", category: "emergencias" },
      { id: "vdd-3", title: "Dispensario", description: "Centro de salud", phone: "03571-490200", schedule: "Lun-Vie 8-14hs", category: "salud" },
      { id: "vdd-4", title: "Cooperativa de Luz", description: "Emergencias eléctricas", phone: "03571-490400", schedule: "24hs", category: "servicios" },
    ]
  },
  {
    name: "Villa Rumipal",
    contacts: [
      { id: "vr-1", title: "Bomberos Voluntarios", description: "Emergencias y rescate", phone: "03571-491222", schedule: "24hs", category: "emergencias" },
      { id: "vr-2", title: "Policía", description: "Destacamento policial", phone: "03571-491101", schedule: "24hs", category: "emergencias" },
      { id: "vr-3", title: "Dispensario", description: "Centro de salud", phone: "03571-491200", schedule: "Lun-Vie 8-14hs", category: "salud" },
    ]
  },
  {
    name: "Potrero de Garay",
    contacts: [
      { id: "pg-1", title: "Bomberos Voluntarios", description: "Emergencias y rescate", phone: "0351-499222", schedule: "24hs", category: "emergencias" },
      { id: "pg-2", title: "Policía", description: "Destacamento policial", phone: "0351-499101", schedule: "24hs", category: "emergencias" },
      { id: "pg-3", title: "Dispensario", description: "Centro de salud", phone: "0351-499200", schedule: "Lun-Vie 8-14hs", category: "salud" },
    ]
  },
  {
    name: "Villa Yacanto",
    contacts: [
      { id: "vy-1", title: "Bomberos Voluntarios", description: "Emergencias y rescate", phone: "03546-496222", schedule: "24hs", category: "emergencias" },
      { id: "vy-2", title: "Policía", description: "Destacamento policial", phone: "03546-496101", schedule: "24hs", category: "emergencias" },
      { id: "vy-3", title: "Dispensario", description: "Centro de salud", phone: "03546-496200", schedule: "Lun-Vie 8-14hs", category: "salud" },
    ]
  },
  {
    name: "Villa Alpina",
    contacts: [
      { id: "va-1", title: "Bomberos Voluntarios", description: "Emergencias y rescate", phone: "03546-495222", schedule: "24hs", category: "emergencias" },
      { id: "va-2", title: "Policía", description: "Destacamento policial", phone: "03546-495101", schedule: "24hs", category: "emergencias" },
    ]
  },
  {
    name: "Villa Berna",
    contacts: [
      { id: "vb-1", title: "Bomberos Voluntarios", description: "Emergencias y rescate", phone: "03546-494222", schedule: "24hs", category: "emergencias" },
      { id: "vb-2", title: "Policía", description: "Destacamento policial", phone: "03546-494101", schedule: "24hs", category: "emergencias" },
      { id: "vb-3", title: "Dispensario", description: "Centro de salud", phone: "03546-494200", schedule: "Lun-Vie 8-14hs", category: "salud" },
    ]
  },
  {
    name: "Villa Ciudad Parque",
    contacts: [
      { id: "vcp-1", title: "Bomberos Voluntarios", description: "Emergencias y rescate", phone: "03546-493222", schedule: "24hs", category: "emergencias" },
      { id: "vcp-2", title: "Policía", description: "Destacamento policial", phone: "03546-493101", schedule: "24hs", category: "emergencias" },
    ]
  },
  {
    name: "Villa Quillinzo",
    contacts: [
      { id: "vq-1", title: "Bomberos Voluntarios", description: "Emergencias y rescate", phone: "03546-492222", schedule: "24hs", category: "emergencias" },
      { id: "vq-2", title: "Policía", description: "Destacamento policial", phone: "03546-492101", schedule: "24hs", category: "emergencias" },
    ]
  },
  {
    name: "La Cruz",
    contacts: [
      { id: "lcruz-1", title: "Bomberos Voluntarios", description: "Emergencias y rescate", phone: "03546-491222", schedule: "24hs", category: "emergencias" },
      { id: "lcruz-2", title: "Policía", description: "Destacamento policial", phone: "03546-491101", schedule: "24hs", category: "emergencias" },
    ]
  },
  {
    name: "Intiyaco",
    contacts: [
      { id: "int-1", title: "Bomberos Voluntarios", description: "Emergencias y rescate", phone: "03546-490900", schedule: "24hs", category: "emergencias" },
      { id: "int-2", title: "Policía", description: "Destacamento policial", phone: "03546-490800", schedule: "24hs", category: "emergencias" },
    ]
  },
]

function FlipCard({ contact }: { contact: Contact }) {
  const [flipped, setFlipped] = useState(false)
  const Icon = getIcon(contact.title)
  const colors = contactColors[contact.category]

  return (
    <div
      className="relative cursor-pointer"
      style={{ height: 160, perspective: "1000px" }}
      onClick={() => setFlipped(f => !f)}
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
    >
      <motion.div
        style={{ transformStyle: "preserve-3d", width: "100%", height: "100%" }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        {/* Frente */}
        <div
          className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center gap-3 p-4"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            background: "rgba(255,255,255,0.7)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.9)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
          }}
        >
          <div className={`w-14 h-14 ${colors.bg} rounded-2xl flex items-center justify-center`}>
            <Icon size={26} className={colors.icon} />
          </div>
          <p className="text-sm font-medium text-stone-700 text-center leading-tight">
            {contact.title}
          </p>
        </div>

        {/* Dorso */}
        <div
          className={`absolute inset-0 rounded-2xl flex flex-col justify-between p-4 bg-gradient-to-br ${colors.grad}`}
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div>
            <p className="text-sm font-semibold text-stone-700 mb-1">{contact.title}</p>
            {contact.description && (
              <p className="text-xs text-stone-500 leading-tight">{contact.description}</p>
            )}
          </div>
          <div className="space-y-1.5">
            {contact.phone ? (
              <a
                href={`tel:${contact.phone}`}
                onClick={e => e.stopPropagation()}
                className="flex items-center gap-2 hover:opacity-70 transition-opacity"
              >
                <div className="w-6 h-6 bg-black/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone size={11} className="text-stone-600" />
                </div>
                <span className="text-sm font-medium text-stone-700">{contact.phone}</span>
              </a>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-black/10 rounded-lg flex items-center justify-center">
                  <Phone size={11} className="text-stone-600" />
                </div>
                <span className="text-xs text-stone-400">Consultar número</span>
              </div>
            )}
            {contact.schedule && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-black/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock size={11} className="text-stone-600" />
                </div>
                <span className="text-xs text-stone-500">{contact.schedule}</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

const MAIN_LOCALITIES = [
  "Villa General Belgrano",
  "Santa Rosa de Calamuchita",
  "Los Reartes",
  "Villa Ciudad Parque",
  "Villa Rumipal",
  "Villa del Dique",
]

export default function ContactosUtilesGrid() {
  const [activeLocality, setActiveLocality] = useState(0)
  const [showAll, setShowAll] = useState(false)
  const locality = LOCALITIES[activeLocality]

  const visibleLocalities = showAll
    ? LOCALITIES
    : LOCALITIES.filter(l => MAIN_LOCALITIES.includes(l.name))

  const handleToggleAll = () => {
    if (showAll) {
      const currentName = LOCALITIES[activeLocality].name
      if (!MAIN_LOCALITIES.includes(currentName)) {
        setActiveLocality(0)
      }
    }
    setShowAll(s => !s)
  }

  return (
    <div className="mb-12">
      <AnimateIn direction="left">
        <div className="flex items-center gap-2 mb-6">
          <Phone size={18} style={{ color: "#c8603a" }} />
          <h2 className="font-serif text-2xl" style={{ color: "#2a1a08" }}>
            Información Util
          </h2>
        </div>
      </AnimateIn>

      {/* Selector de localidades */}
      <div className="flex flex-wrap gap-2 mb-6">
        {visibleLocalities.map((loc) => {
          const realIndex = LOCALITIES.findIndex(l => l.name === loc.name)
          return (
            <button
              key={loc.name}
              onClick={() => setActiveLocality(realIndex)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap"
              style={
                activeLocality === realIndex
                  ? {
                      background: "#c8603a",
                      color: "white",
                      boxShadow: "0 4px 12px rgba(200,96,58,0.3)",
                    }
                  : {
                      background: "rgba(255,255,255,0.6)",
                      color: "rgba(42,26,8,0.6)",
                      border: "1px solid rgba(200,96,58,0.15)",
                    }
              }
            >
              <MapPin size={12} />
              {loc.name}
            </button>
          )
        })}

        <button
          onClick={handleToggleAll}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap"
          style={{
            background: showAll ? "rgba(200,96,58,0.08)" : "rgba(255,255,255,0.6)",
            color: "#c8603a",
            border: "1px solid rgba(200,96,58,0.25)",
          }}
        >
          {showAll ? "− Menos localidades" : "+ Más localidades"}
        </button>
      </div>

      {/* Grid de cards */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeLocality}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3"
        >
          {locality.contacts.map((contact, i) => (
            <AnimateIn key={contact.id} direction="up" delay={i * 0.04}>
              <FlipCard contact={contact} />
            </AnimateIn>
          ))}
        </motion.div>
      </AnimatePresence>

      <motion.div
        key={`info-${activeLocality}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-3 flex items-center gap-1.5"
      >
        <MapPin size={11} style={{ color: "rgba(42,26,8,0.3)" }} />
        <span className="text-xs" style={{ color: "rgba(42,26,8,0.35)" }}>
          {locality.contacts.length} contactos en {locality.name}
        </span>
      </motion.div>
    </div>
  )
}