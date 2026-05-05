"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import AnimateIn from "@/components/ui/AnimateIn"
import {
  Flame, Shield, Ambulance, Hospital, Pill, PawPrint,
  Droplets, Zap, Phone, Clock, MapPin, Info
} from "lucide-react"

interface Contact {
  id: string
  title: string
  description: string | null
  phone: string | null
  schedule: string | null
  category: string
  sort_order: number
}

const contactIcons: Record<string, any> = {
  "Bomberos Voluntarios": Flame,
  "Policía": Shield,
  "SAME / Ambulancia": Ambulance,
  "Hospital": Hospital,
  "Dispensario VGB": Hospital,
  "Farmacia de turno": Pill,
  "Guardia Veterinaria": PawPrint,
  "Cooperativa de Agua": Droplets,
  "Cooperativa de Luz": Zap,
}

const contactColors: Record<string, { bg: string; icon: string; grad: string }> = {
  "emergencias": { bg: "bg-red-50", icon: "text-red-500", grad: "from-red-500 to-red-600" },
  "salud": { bg: "bg-blue-50", icon: "text-blue-500", grad: "from-blue-500 to-blue-600" },
  "servicios": { bg: "bg-amber-50", icon: "text-amber-500", grad: "from-amber-500 to-amber-600" },
  "general": { bg: "bg-primary-50", icon: "text-primary-500", grad: "from-primary-500 to-primary-600" },
}

function FlipCard({ contact }: { contact: Contact }) {
  const [flipped, setFlipped] = useState(false)
  const Icon = contactIcons[contact.title] || Info
  const colors = contactColors[contact.category] || contactColors.general

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
        {/* Cara frontal */}
        <div
          className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center gap-3 p-4"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            background: "rgba(255,255,255,0.7)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.8)",
            boxShadow: "0 4px 20px rgba(83,120,149,0.08)",
          }}
        >
          <div className={`w-14 h-14 ${colors.bg} rounded-2xl flex items-center justify-center`}>
            <Icon size={26} className={colors.icon} />
          </div>
          <p className="text-sm font-medium text-stone-700 text-center leading-tight">
            {contact.title}
          </p>
        </div>

        {/* Cara trasera */}
        <div
          className={`absolute inset-0 rounded-2xl flex flex-col justify-between p-4 bg-gradient-to-br ${colors.grad}`}
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div>
            <p className="text-sm font-semibold text-white mb-1">{contact.title}</p>
            {contact.description && (
              <p className="text-xs text-white/70 leading-tight">{contact.description}</p>
            )}
          </div>

          <div className="space-y-1.5">
            {contact.phone && (
              <a
                href={`tel:${contact.phone}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2 text-white hover:text-white/80 transition-colors"
              >
                <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone size={11} className="text-white" />
                </div>
                <span className="text-sm font-medium">{contact.phone}</span>
              </a>
            )}
            {!contact.phone && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                  <Phone size={11} className="text-white" />
                </div>
                <span className="text-xs text-white/60">Consultar número</span>
              </div>
            )}
            {contact.schedule && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock size={11} className="text-white" />
                </div>
                <span className="text-xs text-white/80">{contact.schedule}</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function ContactosUtilesGrid() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchContacts = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from("useful_contacts")
        .select("*")
        .eq("is_active", true)
        .order("sort_order")
      setContacts(data || [])
      setLoading(false)
    }
    fetchContacts()
  }, [])

  if (loading) return (
    <div className="mb-12">
      <div className="h-6 bg-stone-200 rounded-full w-48 mb-6 animate-pulse" />
      <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
        {[1,2,3,4,5].map(i => <div key={i} className="h-40 bg-white/50 rounded-2xl animate-pulse" />)}
      </div>
    </div>
  )

  if (contacts.length === 0) return null

  return (
    <div className="mb-12">
      <AnimateIn direction="left">
        <div className="flex items-center gap-2 mb-6">
          <Phone size={18} className="text-primary-500" />
          <h2 className="font-serif text-2xl text-stone-900">Contactos de emergencia</h2>
        </div>
      </AnimateIn>

      <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
        {contacts.map((contact, i) => (
          <AnimateIn key={contact.id} direction="up" delay={i * 0.05}>
            <FlipCard contact={contact} />
          </AnimateIn>
        ))}
      </div>

      <AnimateIn direction="up" delay={0.3}>
        <div className="mt-4 text-center">
          <a
            href="/?seccion=info"
            className="text-xs text-primary-400 hover:text-primary-600 transition-colors"
          >
            Ver toda la información útil →
          </a>
        </div>
      </AnimateIn>
    </div>
  )
}