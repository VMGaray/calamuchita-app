"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Flame, Shield, Stethoscope, Zap,
  MapPin, Copy, Check, Phone,
  AlertCircle, Lightbulb, Pill, Landmark, Bus, Info, MoreHorizontal,
  ArrowLeft, RefreshCw, ExternalLink, Clock, ArrowRight,
} from "lucide-react"
import Link from "next/link"
import {
  DATA_TELEFONOS,
  LOCALIDADES,
  MAIN_LOCALIDADES,
  type LocalidadData,
} from "@/lib/constants/telefonos"
import { useLocalidad } from "@/lib/context/LocalidadContext"
import { createClient } from "@/lib/supabase/client"

// ─── DB types ────────────────────────────────────────────────────────────────

interface DBService {
  id: string
  name: string
  category: string
  phone: string | null
  address: string | null
  description: string | null
}

interface DBLocality { id: string; name: string }

interface TransportResult {
  id: string
  company: string
  departure_time: string
  arrival_time: string | null
  days: string[]
  notes: string | null
}

const SERVICE_CAT_ICONS: Record<string, { Icon: any; color: string; bg: string }> = {
  emergency: { Icon: Flame,      color: "#B83232", bg: "rgba(184,50,50,0.10)" },
  health:    { Icon: Stethoscope,color: "#1A6B44", bg: "rgba(26,107,68,0.10)" },
  municipal: { Icon: Landmark,   color: "#2D4530", bg: "rgba(45,69,48,0.10)"  },
  security:  { Icon: Shield,     color: "#1C4680", bg: "rgba(28,70,128,0.10)" },
  utility:   { Icon: Zap,        color: "#A06B0A", bg: "rgba(160,107,10,0.10)"},
  transport: { Icon: Bus,        color: "#2D4530", bg: "rgba(45,69,48,0.10)"  },
  tourism:   { Icon: Info,       color: "#5E4B3B", bg: "rgba(94,75,59,0.10)"  },
  other:     { Icon: Phone,      color: "#6B7B84", bg: "rgba(107,123,132,0.10)"},
}

const DAYS_SHORT: Record<string, string> = {
  lunes: "Lu", martes: "Ma", miercoles: "Mi",
  jueves: "Ju", viernes: "Vi", sabado: "Sá", domingo: "Do",
}

type ServicioKey = keyof LocalidadData

const SERVICIOS = [
  {
    key: "bomberos" as ServicioKey,
    label: "Bomberos",
    sublabel: "Emergencias",
    Icon: Flame,
    iconColor: "#B83232",
    iconBg: "rgba(184,50,50,0.11)",
    ringColor: "rgba(184,50,50,0.18)",
  },
  {
    key: "policia" as ServicioKey,
    label: "Policía",
    sublabel: "Seguridad",
    Icon: Shield,
    iconColor: "#1C4680",
    iconBg: "rgba(28,70,128,0.11)",
    ringColor: "rgba(28,70,128,0.18)",
  },
  {
    key: "salud" as ServicioKey,
    label: "Salud",
    sublabel: "Hospital / Dispensario",
    Icon: Stethoscope,
    iconColor: "#1A6B44",
    iconBg: "rgba(26,107,68,0.11)",
    ringColor: "rgba(26,107,68,0.18)",
  },
  {
    key: "cooperativa" as ServicioKey,
    label: "Cooperativa",
    sublabel: "Luz / Agua",
    Icon: Zap,
    iconColor: "#A06B0A",
    iconBg: "rgba(160,107,10,0.11)",
    ringColor: "rgba(160,107,10,0.18)",
  },
]

const CATEGORIAS = [
  { key: "todos", label: "Todos", Icon: MoreHorizontal },
  { key: "emergencias", label: "Emergencias", Icon: AlertCircle },
  { key: "cooperativas", label: "Cooperativas", Icon: Lightbulb },
  { key: "salud", label: "Salud", Icon: Stethoscope },
  { key: "farmacias", label: "Farmacias de turno", Icon: Pill },
  { key: "municipalidad", label: "Municipalidad", Icon: Landmark },
  { key: "transporte", label: "Transporte", Icon: Bus },
  { key: "turismo", label: "Turismo oficial", Icon: Info },
]

const CATEGORIA_SERVICIOS: Partial<Record<string, ServicioKey[]>> = {
  emergencias: ["bomberos", "policia"],
  cooperativas: ["cooperativa"],
  salud: ["salud"],
}

interface Props {
  initialCategoria?: string
  initialPueblo?: string
}

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

  return (
    <motion.a
      href={phone ? `tel:${phone}` : undefined}
      className="relative block rounded-2xl p-5 flex flex-col items-center gap-3 select-none"
      style={{
        background: "rgba(255,255,255,0.70)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,0.88)",
        boxShadow: hovered
          ? "0 18px 40px rgba(45,69,48,0.16), 0 4px 12px rgba(45,69,48,0.08)"
          : "0 4px 18px rgba(45,69,48,0.08), 0 1px 4px rgba(45,69,48,0.05)",
        cursor: phone ? "pointer" : "default",
      }}
      whileHover={{ y: phone ? -8 : -3, scale: phone ? 1.02 : 1.005 }}
      transition={{ type: "spring", stiffness: 380, damping: 22 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
        style={{ background: iconBg, boxShadow: `0 0 0 6px ${ringColor}` }}
      >
        <Icon size={30} style={{ color: iconColor }} strokeWidth={1.8} />
      </div>

      <div className="text-center">
        <p className="font-bold text-sm leading-tight" style={{ color: "#2D4530" }}>
          {label}
        </p>
        <p className="text-xs mt-0.5" style={{ color: "rgba(45,69,48,0.50)" }}>
          {sublabel}
        </p>
      </div>

      {phone ? (
        <p className="text-base font-semibold tracking-wide mt-auto" style={{ color: iconColor }}>
          {phone}
        </p>
      ) : (
        <p className="text-xs mt-auto" style={{ color: "rgba(45,69,48,0.35)" }}>
          Sin número
        </p>
      )}

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

export default function InfoUtilPage({ initialCategoria, initialPueblo }: Props) {
  const { localidad, setLocalidad } = useLocalidad()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showAll, setShowAll] = useState(false)
  const syncedRef = useRef(false)

  // ── DB services ─────────────────────────────────────────────────────────
  const [dbServices, setDbServices] = useState<DBService[]>([])
  const [dbLocalities, setDbLocalities] = useState<DBLocality[]>([])

  // Transport search
  const [transOrigin, setTransOrigin] = useState("")
  const [transDest, setTransDest] = useState("")
  const [transResults, setTransResults] = useState<TransportResult[]>([])
  const [transLoading, setTransLoading] = useState(false)

  // Fetch DB localities once
  useEffect(() => {
    createClient()
      .from("localities")
      .select("id, name")
      .order("sort_order")
      .then(({ data }) => setDbLocalities(data || []))
  }, [])

  // Fetch utility_services when locality changes
  useEffect(() => {
    const loc = dbLocalities.find(l => l.name === localidad)
    if (!loc) { setDbServices([]); return }
    createClient()
      .from("utility_services")
      .select("id, name, category, phone, address, description")
      .eq("locality_id", loc.id)
      .eq("is_active", true)
      .order("sort_order")
      .then(({ data }) => setDbServices(data || []))
  }, [localidad, dbLocalities])

  // Fetch transport schedules
  useEffect(() => {
    if (!transOrigin || !transDest) { setTransResults([]); return }
    setTransLoading(true)
    createClient()
      .from("transport_schedules")
      .select("id, company, departure_time, arrival_time, days, notes")
      .eq("origin_id", transOrigin)
      .eq("destination_id", transDest)
      .eq("is_active", true)
      .order("departure_time")
      .then(({ data }) => {
        setTransResults(data || [])
        setTransLoading(false)
      })
  }, [transOrigin, transDest])

  const categoria = searchParams.get("categoria") ?? initialCategoria ?? "todos"
  const visibleLocalidades = showAll ? LOCALIDADES : MAIN_LOCALIDADES

  // Sync URL pueblo → global context on first render only
  useEffect(() => {
    if (syncedRef.current) return
    syncedRef.current = true
    const puebloFromUrl = searchParams.get("pueblo") ?? initialPueblo
    if (puebloFromUrl && LOCALIDADES.includes(puebloFromUrl)) {
      setLocalidad(puebloFromUrl)
      if (!MAIN_LOCALIDADES.includes(puebloFromUrl)) setShowAll(true)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handlePuebloChange = (loc: string) => {
    setLocalidad(loc)
    const params = new URLSearchParams(searchParams.toString())
    params.set("pueblo", loc)
    router.replace(`/info-util?${params.toString()}`, { scroll: false })
  }

  const handleCategoriaChange = (cat: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (cat === "todos") {
      params.delete("categoria")
    } else {
      params.set("categoria", cat)
    }
    router.replace(`/info-util?${params.toString()}`, { scroll: false })
  }

  const handleToggleAll = () => {
    if (showAll && !MAIN_LOCALIDADES.includes(localidad)) {
      const main = MAIN_LOCALIDADES[0]
      setLocalidad(main)
      const params = new URLSearchParams(searchParams.toString())
      params.set("pueblo", main)
      router.replace(`/info-util?${params.toString()}`, { scroll: false })
    }
    setShowAll((s) => !s)
  }

  // Resolve which cards to show
  const data = DATA_TELEFONOS[localidad] ?? DATA_TELEFONOS[MAIN_LOCALIDADES[0]]

  let serviciosToShow: typeof SERVICIOS
  let isUnsupportedCategory = false

  if (!categoria || categoria === "todos") {
    serviciosToShow = SERVICIOS
  } else if (CATEGORIA_SERVICIOS[categoria]) {
    const keys = CATEGORIA_SERVICIOS[categoria]!
    serviciosToShow = SERVICIOS.filter((s) => keys.includes(s.key))
  } else {
    serviciosToShow = []
    isUnsupportedCategory = true
  }

  const allNull =
    !isUnsupportedCategory &&
    serviciosToShow.length > 0 &&
    serviciosToShow.every((s) => data[s.key] === null)

  const showEmptyState = isUnsupportedCategory || allNull

  const gridCols =
    serviciosToShow.length === 1
      ? "grid-cols-1 max-w-xs mx-auto"
      : serviciosToShow.length === 2
        ? "grid-cols-2 max-w-md"
        : "grid-cols-2 md:grid-cols-4"

  const activeCategoriaLabel =
    CATEGORIAS.find((c) => c.key === categoria)?.label ?? "Teléfonos Útiles"

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">

      {/* Encabezado */}
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm mb-5 transition-opacity hover:opacity-70"
          style={{ color: "rgba(45,69,48,0.55)" }}
        >
          <ArrowLeft size={14} />
          Volver al inicio
        </Link>

        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(45,69,48,0.10)" }}
          >
            <Phone size={20} style={{ color: "#2D4530" }} />
          </div>
          <div>
            <h1 className="font-serif text-3xl md:text-4xl" style={{ color: "#2D4530" }}>
              Info Útil
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "rgba(45,69,48,0.55)" }}>
              Teléfonos y contactos del Valle de Calamuchita
            </p>
          </div>
        </div>
      </div>

      {/* Filtro de categoría */}
      <div className="mb-5">
        <p
          className="text-xs font-semibold uppercase tracking-wider mb-2"
          style={{ color: "rgba(45,69,48,0.40)" }}
        >
          Categoría
        </p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIAS.map(({ key, label, Icon }) => {
            const isActive = key === categoria || (key === "todos" && (!categoria || categoria === "todos"))
            return (
              <motion.button
                key={key}
                onClick={() => handleCategoriaChange(key)}
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap"
                style={
                  isActive
                    ? {
                        background: "#2D4530",
                        color: "#E1DBC9",
                        boxShadow: "0 4px 14px rgba(45,69,48,0.28)",
                      }
                    : {
                        background: "rgba(255,255,255,0.70)",
                        color: "rgba(45,69,48,0.65)",
                        border: "1px solid rgba(45,69,48,0.15)",
                      }
                }
              >
                <Icon size={13} />
                {label}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Filtro de pueblo */}
      <div className="mb-8">
        <p
          className="text-xs font-semibold uppercase tracking-wider mb-2"
          style={{ color: "rgba(45,69,48,0.40)" }}
        >
          Localidad
        </p>
        <div className="flex flex-wrap gap-2">
          {visibleLocalidades.map((loc) => (
            <motion.button
              key={loc}
              onClick={() => handlePuebloChange(loc)}
              whileHover={{ y: -3, boxShadow: "0 8px 22px rgba(45,69,48,0.16)" }}
              whileTap={{ y: -1 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap"
              style={
                localidad === loc
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
            whileHover={{ y: -3 }}
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
      </div>

      {/* Buscador de transporte — visible cuando la categoría es "transporte" */}
      {categoria === "transporte" && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 rounded-3xl p-6 md:p-8"
          style={{ background: "#EBE6DA" }}
        >
          <div className="flex items-center gap-2 mb-5">
            <Bus size={18} style={{ color: "#2D4530" }} />
            <h2 className="font-serif text-xl" style={{ color: "#2D4530" }}>Horarios de colectivos</h2>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
            <div className="flex-1">
              <label className="block text-xs font-medium mb-1.5" style={{ color: "rgba(45,69,48,0.55)" }}>Desde</label>
              <select
                value={transOrigin}
                onChange={e => setTransOrigin(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
                style={{ background: "white", borderColor: "rgba(45,69,48,0.15)", color: "#2D4530" }}
              >
                <option value="">— Elegí origen —</option>
                {dbLocalities.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            <ArrowRight size={16} className="hidden sm:block flex-shrink-0 mt-5" style={{ color: "rgba(45,69,48,0.3)" }} />
            <div className="flex-1">
              <label className="block text-xs font-medium mb-1.5" style={{ color: "rgba(45,69,48,0.55)" }}>Hasta</label>
              <select
                value={transDest}
                onChange={e => setTransDest(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
                style={{ background: "white", borderColor: "rgba(45,69,48,0.15)", color: "#2D4530" }}
              >
                <option value="">— Elegí destino —</option>
                {dbLocalities.filter(l => l.id !== transOrigin).map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
          </div>

          {transLoading && <p className="text-sm text-center" style={{ color: "rgba(45,69,48,0.45)" }}>Buscando horarios…</p>}

          {!transLoading && transOrigin && transDest && transResults.length === 0 && (
            <p className="text-sm text-center py-4" style={{ color: "rgba(45,69,48,0.45)" }}>
              Sin horarios registrados para este trayecto
            </p>
          )}

          {transResults.length > 0 && (
            <div className="relative">
              {/* vertical line */}
              <div
                className="absolute left-[27px] top-0 bottom-0 w-px"
                style={{ background: "rgba(45,69,48,0.12)" }}
              />
              <div className="space-y-3">
                {transResults.map((r, i) => (
                  <div key={r.id} className="flex gap-4 items-start">
                    {/* timeline dot */}
                    <div className="relative flex-shrink-0 flex flex-col items-center" style={{ width: 54 }}>
                      <div
                        className="w-[54px] text-center rounded-xl py-1.5 font-mono font-bold text-base leading-none z-10"
                        style={{ background: i === 0 ? "#2D4530" : "white", color: i === 0 ? "#E1DBC9" : "#2D4530", border: "1px solid rgba(45,69,48,0.15)" }}
                      >
                        {r.departure_time.slice(0, 5)}
                      </div>
                      {r.arrival_time && (
                        <div className="text-[10px] mt-1 font-mono" style={{ color: "rgba(45,69,48,0.45)" }}>
                          → {r.arrival_time.slice(0, 5)}
                        </div>
                      )}
                    </div>

                    {/* content */}
                    <div
                      className="flex-1 rounded-2xl px-4 py-3 mb-1"
                      style={{
                        background: "rgba(255,255,255,0.80)",
                        border: "1px solid rgba(45,69,48,0.08)",
                        boxShadow: "0 2px 8px rgba(45,69,48,0.05)",
                      }}
                    >
                      <p className="text-sm font-semibold leading-tight" style={{ color: "#2D4530" }}>{r.company}</p>
                      <div className="flex gap-0.5 mt-1.5">
                        {Object.entries(DAYS_SHORT).map(([key, short]) => (
                          <span
                            key={key}
                            className="text-[9px] px-1.5 py-0.5 rounded-md font-medium"
                            style={
                              r.days.includes(key)
                                ? { background: "#A3B18A", color: "white" }
                                : { background: "rgba(45,69,48,0.06)", color: "rgba(45,69,48,0.25)" }
                            }
                          >
                            {short}
                          </span>
                        ))}
                      </div>
                      {r.notes && (
                        <p className="text-xs mt-1.5 leading-snug" style={{ color: "rgba(45,69,48,0.50)" }}>
                          {r.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Panel principal */}
      <div
        className="relative overflow-hidden rounded-3xl px-6 md:px-10 pt-8 pb-10"
        style={{ background: "#EBE6DA" }}
      >
        {/* Textura topográfica */}
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
          <path d="M520,372 Q660,252 768,228 Q852,210 906,228 Q980,254 970,342 Q960,412 882,444 Q806,474 702,468 Q612,462 554,424 Q516,400 520,372Z" stroke="#2D4530" strokeWidth="2" />
          <path d="M578,368 Q700,272 768,252 Q822,236 864,252 Q922,276 914,342 Q906,400 846,428 Q786,452 704,448 Q634,444 586,410 Q558,392 578,368Z" stroke="#2D4530" strokeWidth="1.5" />
          <path d="M0,375 Q180,360 320,366 Q440,372 540,354 Q650,334 760,344 Q880,354 1000,336 Q1120,320 1200,328" stroke="#2D4530" strokeWidth="1" strokeDasharray="10 7" opacity="0.7" />
        </svg>

        <div className="relative z-10">
          <AnimatePresence mode="wait">
            {showEmptyState ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: "rgba(45,69,48,0.08)" }}
                >
                  <RefreshCw size={28} style={{ color: "rgba(45,69,48,0.38)" }} />
                </div>

                <h3 className="font-serif text-xl mb-2" style={{ color: "#2D4530" }}>
                  {allNull
                    ? "Estamos actualizando la información para este pueblo"
                    : "Próximamente"}
                </h3>

                <p
                  className="text-sm max-w-sm mb-7 leading-relaxed"
                  style={{ color: "rgba(45,69,48,0.55)" }}
                >
                  {allNull
                    ? `Aún no tenemos números cargados para ${localidad} en esta categoría.`
                    : "Esta sección se está preparando con información actualizada del Valle."}
                </p>

                <motion.button
                  onClick={() => handleCategoriaChange("todos")}
                  whileHover={{ y: -3, boxShadow: "0 8px 22px rgba(45,69,48,0.22)" }}
                  whileTap={{ y: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 22 }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium"
                  style={{ background: "#2D4530", color: "#E1DBC9" }}
                >
                  <Phone size={14} />
                  Ver números generales del Valle
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key={`grid-${localidad}-${categoria}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22 }}
              >
                <div className="flex items-center gap-2 mb-6">
                  <Phone size={18} style={{ color: "#2D4530" }} />
                  <h2 className="font-serif text-2xl" style={{ color: "#2D4530" }}>
                    {activeCategoriaLabel}
                  </h2>
                </div>

                <div className={`grid gap-4 ${gridCols}`}>
                  {serviciosToShow.map((servicio) => (
                    <PhoneCard
                      key={servicio.key}
                      servicio={servicio}
                      phone={data[servicio.key]}
                    />
                  ))}
                </div>

                <div className="mt-4 flex items-center gap-1.5">
                  <MapPin size={11} style={{ color: "rgba(45,69,48,0.35)" }} />
                  <span className="text-xs" style={{ color: "rgba(45,69,48,0.40)" }}>
                    {localidad} — Tocá una tarjeta para llamar directamente
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      {/* Servicios adicionales desde la base de datos */}
      {dbServices.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-8"
        >
          <h2 className="font-serif text-xl mb-4" style={{ color: "#2D4530" }}>
            Más servicios en {localidad}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {dbServices.map(service => {
              const meta = SERVICE_CAT_ICONS[service.category] ?? SERVICE_CAT_ICONS.other
              const { Icon, color, bg } = meta
              return (
                <div
                  key={service.id}
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: "rgba(255,255,255,0.80)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(255,255,255,0.9)",
                    boxShadow: "0 2px 12px rgba(45,69,48,0.07)",
                  }}
                >
                  {/* top info row */}
                  <div className="flex items-start gap-3 px-4 pt-4 pb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: bg }}
                    >
                      <Icon size={18} style={{ color }} strokeWidth={1.8} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold leading-tight" style={{ color: "#2D4530" }}>{service.name}</p>
                      {service.description && (
                        <p className="text-xs mt-0.5 leading-snug" style={{ color: "rgba(45,69,48,0.50)" }}>{service.description}</p>
                      )}
                      {service.address && (
                        <a
                          href={`https://maps.google.com/?q=${encodeURIComponent(service.address + ", " + localidad)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs mt-1 transition-opacity hover:opacity-70"
                          style={{ color: "rgba(45,69,48,0.50)" }}
                        >
                          <MapPin size={10} />
                          {service.address}
                          <ExternalLink size={9} />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* large call button */}
                  {service.phone && (
                    <a
                      href={`tel:${service.phone}`}
                      className="flex items-center justify-center gap-2.5 w-full py-3.5 font-semibold text-sm transition-opacity active:opacity-80"
                      style={{
                        background: "#2D4530",
                        color: "#E1DBC9",
                        borderTop: "1px solid rgba(45,69,48,0.12)",
                      }}
                    >
                      <Phone size={15} strokeWidth={2} />
                      Llamar · {service.phone}
                    </a>
                  )}
                </div>
              )
            })}
          </div>
        </motion.div>
      )}
    </div>
  )
}
