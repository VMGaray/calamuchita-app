"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Flame, Shield, Stethoscope, Zap, MapPin, Copy, Check, Phone } from "lucide-react"
import AnimateIn from "@/components/ui/AnimateIn"
import { DATA_TELEFONOS, LOCALIDADES, MAIN_LOCALIDADES, type LocalidadData } from "@/lib/constants/telefonos"
import { useLocalidad } from "@/lib/context/LocalidadContext"

type ServicioKey = keyof LocalidadData

const SERVICIOS: {
  key: ServicioKey
  label: string
  sublabel: string
  Icon: React.ElementType
  iconColor: string
  iconBg: string
  ringColor: string
}[] = [
  {
    key: "bomberos",
    label: "Bomberos",
    sublabel: "Emergencias",
    Icon: Flame,
    iconColor: "#B83232",
    iconBg: "rgba(184,50,50,0.11)",
    ringColor: "rgba(184,50,50,0.18)",
  },
  {
    key: "policia",
    label: "Policía",
    sublabel: "Seguridad",
    Icon: Shield,
    iconColor: "#1C4680",
    iconBg: "rgba(28,70,128,0.11)",
    ringColor: "rgba(28,70,128,0.18)",
  },
  {
    key: "salud",
    label: "Salud",
    sublabel: "Hospital / Dispensario",
    Icon: Stethoscope,
    iconColor: "#1A6B44",
    iconBg: "rgba(26,107,68,0.11)",
    ringColor: "rgba(26,107,68,0.18)",
  },
  {
    key: "cooperativa",
    label: "Cooperativa",
    sublabel: "Luz / Agua",
    Icon: Zap,
    iconColor: "#A06B0A",
    iconBg: "rgba(160,107,10,0.11)",
    ringColor: "rgba(160,107,10,0.18)",
  },
]

function PhoneCard({
  servicio,
  phone,
}: {
  servicio: (typeof SERVICIOS)[number]
  phone: string | null
}) {
  const [hovered, setHovered] = useState(false)
  const [copied, setCopied] = useState(false)
  const { Icon, label, sublabel, iconColor, iconBg, ringColor } = servicio

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!phone) return
    navigator.clipboard.writeText(phone)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const cardStyle = {
    background: "rgba(255,255,255,0.70)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border: "1px solid rgba(255,255,255,0.88)",
    boxShadow: hovered
      ? "0 18px 40px rgba(45,69,48,0.16), 0 4px 12px rgba(45,69,48,0.08)"
      : "0 4px 18px rgba(45,69,48,0.08), 0 1px 4px rgba(45,69,48,0.05)",
  }

  return (
    <motion.a
      href={phone ? `tel:${phone}` : undefined}
      className="relative block rounded-2xl p-5 flex flex-col items-center gap-3 select-none"
      style={{ ...cardStyle, cursor: phone ? "pointer" : "default" }}
      whileHover={{ y: phone ? -8 : -3, scale: phone ? 1.02 : 1.005 }}
      transition={{ type: "spring", stiffness: 380, damping: 22 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      {/* Icono */}
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
        style={{ background: iconBg, boxShadow: `0 0 0 6px ${ringColor}` }}
      >
        <Icon size={30} style={{ color: iconColor }} strokeWidth={1.8} />
      </div>

      {/* Texto */}
      <div className="text-center">
        <p className="font-bold text-sm leading-tight" style={{ color: "#2D4530" }}>
          {label}
        </p>
        <p className="text-xs mt-0.5" style={{ color: "rgba(45,69,48,0.50)" }}>
          {sublabel}
        </p>
      </div>

      {/* Número */}
      {phone ? (
        <p
          className="text-base font-semibold tracking-wide mt-auto"
          style={{ color: iconColor }}
        >
          {phone}
        </p>
      ) : (
        <p className="text-xs mt-auto" style={{ color: "rgba(45,69,48,0.35)" }}>
          Sin número
        </p>
      )}

      {/* Botón Copiar — aparece en hover */}
      <AnimatePresence>
        {hovered && phone && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 4 }}
            transition={{ duration: 0.15 }}
            onClick={handleCopy}
            className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
            style={{
              background: "rgba(255,255,255,0.90)",
              color: copied ? "#1A6B44" : iconColor,
              border: `1px solid ${copied ? "rgba(26,107,68,0.3)" : ringColor}`,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            {copied ? <Check size={10} strokeWidth={2.5} /> : <Copy size={10} />}
            {copied ? "Copiado" : "Copiar"}
          </motion.button>
        )}
      </AnimatePresence>
    </motion.a>
  )
}

export default function ContactosUtilesGrid() {
  const { localidad: activeLocalidad, setLocalidad: setActiveLocalidad } = useLocalidad()
  const [showAll, setShowAll] = useState(false)

  const visibleLocalidades = showAll ? LOCALIDADES : MAIN_LOCALIDADES
  const data = DATA_TELEFONOS[activeLocalidad] ?? DATA_TELEFONOS[MAIN_LOCALIDADES[0]]

  const handleToggleAll = () => {
    if (showAll && !MAIN_LOCALIDADES.includes(activeLocalidad)) {
      setActiveLocalidad(MAIN_LOCALIDADES[0])
    }
    setShowAll(s => !s)
  }

  return (
    <section
      className="relative overflow-hidden rounded-3xl mb-12 px-4 md:px-10 pt-6 md:pt-8 pb-8 md:pb-10"
      style={{ background: "#EBE6DA" }}
    >
      {/* Textura topográfica de fondo */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: 0.055 }}
        viewBox="0 0 1200 400"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M-60,340 Q80,210 190,185 Q275,165 320,192 Q385,225 360,332 Q340,412 240,440 Q130,465 30,420 Q-40,390 -60,340Z" stroke="#2D4530" strokeWidth="2" />
        <path d="M10,340 Q130,232 212,210 Q262,196 300,216 Q350,246 330,332 Q310,400 224,426 Q148,448 68,418 Q10,393 10,340Z" stroke="#2D4530" strokeWidth="1.5" />
        <path d="M72,336 Q172,270 226,254 Q254,244 278,260 Q312,284 296,334 Q280,378 234,400 Q188,420 142,406 Q86,390 72,336Z" stroke="#2D4530" strokeWidth="1.2" />
        <path d="M140,328 Q202,296 238,284 Q254,278 266,288 Q284,306 274,338 Q262,366 238,380 Q212,392 182,382 Q148,370 140,328Z" stroke="#2D4530" strokeWidth="1" />
        <path d="M520,372 Q660,252 768,228 Q852,210 906,228 Q980,254 970,342 Q960,412 882,444 Q806,474 702,468 Q612,462 554,424 Q516,400 520,372Z" stroke="#2D4530" strokeWidth="2" />
        <path d="M578,368 Q700,272 768,252 Q822,236 864,252 Q922,276 914,342 Q906,400 846,428 Q786,452 704,448 Q634,444 586,410 Q558,392 578,368Z" stroke="#2D4530" strokeWidth="1.5" />
        <path d="M638,364 Q740,296 782,280 Q812,268 840,280 Q880,300 872,348 Q860,390 818,414 Q774,436 710,432 Q656,428 624,398 Q606,384 638,364Z" stroke="#2D4530" strokeWidth="1.2" />
        <path d="M980,312 Q1060,222 1130,212 Q1186,206 1210,230 Q1240,260 1232,310 Q1224,354 1180,374 Q1132,392 1080,380 Q1020,364 990,332 Q976,318 980,312Z" stroke="#2D4530" strokeWidth="1.5" />
        <path d="M1004,312 Q1068,240 1128,230 Q1166,224 1188,246 Q1210,272 1204,310 Q1198,344 1166,362 Q1128,378 1086,368 Q1038,356 1012,330 Q998,316 1004,312Z" stroke="#2D4530" strokeWidth="1.2" />
        <path d="M0,375 Q180,360 320,366 Q440,372 540,354 Q650,334 760,344 Q880,354 1000,336 Q1120,320 1200,328" stroke="#2D4530" strokeWidth="1" strokeDasharray="10 7" opacity="0.7" />
      </svg>

      <div className="relative z-10">
        <AnimateIn direction="left">
          <div className="flex items-center gap-2 mb-6">
            <Phone size={18} style={{ color: "#2D4530" }} />
            <h2 className="font-serif text-2xl" style={{ color: "#2D4530" }}>
              Teléfonos Útiles
            </h2>
          </div>
        </AnimateIn>

        {/* Selector de localidades */}
        <div className="flex flex-wrap gap-2 mb-7">
          {visibleLocalidades.map((loc) => (
            <motion.button
              key={loc}
              onClick={() => setActiveLocalidad(loc)}
              whileHover={{ y: -3, boxShadow: "0 8px 22px rgba(45,69,48,0.16)" }}
              whileTap={{ y: -1 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap"
              style={
                activeLocalidad === loc
                  ? {
                      background: "#2D4530",
                      color: "#E1DBC9",
                      boxShadow: "0 4px 14px rgba(45,69,48,0.28)",
                    }
                  : {
                      background: "rgba(255,255,255,0.60)",
                      color: "rgba(45,69,48,0.65)",
                      border: "1px solid rgba(45,69,48,0.15)",
                    }
              }
            >
              <MapPin size={12} />
              {loc}
            </motion.button>
          ))}

          <motion.button
            onClick={handleToggleAll}
            whileHover={{ y: -3, boxShadow: "0 8px 22px rgba(45,69,48,0.12)" }}
            whileTap={{ y: -1 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap"
            style={{
              background: showAll ? "rgba(45,69,48,0.08)" : "rgba(255,255,255,0.60)",
              color: "#2D4530",
              border: "1px solid rgba(45,69,48,0.20)",
            }}
          >
            {showAll ? "− Menos" : "+ Más localidades"}
          </motion.button>
        </div>

        {/* Grid 4 columnas */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeLocalidad}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {SERVICIOS.map((servicio, i) => (
              <AnimateIn key={servicio.key} direction="up" delay={i * 0.06}>
                <PhoneCard servicio={servicio} phone={data[servicio.key]} />
              </AnimateIn>
            ))}
          </motion.div>
        </AnimatePresence>

        <motion.div
          key={`footer-${activeLocalidad}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 flex items-center gap-1.5"
        >
          <MapPin size={11} style={{ color: "rgba(45,69,48,0.35)" }} />
          <span className="text-xs" style={{ color: "rgba(45,69,48,0.40)" }}>
            {activeLocalidad} — Tocá una tarjeta para llamar directamente
          </span>
        </motion.div>
      </div>
    </section>
  )
}
