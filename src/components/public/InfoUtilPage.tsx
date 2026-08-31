"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Flame, Shield, Stethoscope, Zap,
  MapPin, Phone, ChevronDown,
  AlertCircle, Lightbulb, Pill, Landmark, Bus, Info, MoreHorizontal,
  ArrowLeft, RefreshCw, ExternalLink, Clock, Dog, CreditCard, X,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import BackButton from "@/components/ui/BackButton"
import { LOCALIDADES, MAIN_LOCALIDADES } from "@/lib/constants/telefonos"
import { useLocalidad } from "@/lib/context/LocalidadContext"
import { createClient } from "@/lib/supabase/client"
import { normalizeUrl } from "@/lib/normalizeUrl"
import type { ServicePhone, TransportCompany } from "@/types/database"

interface DBService {
  id: string
  name: string
  category: string
  phone: string | null
  phone_2: string | null
  phones: ServicePhone[]
  address: string | null
  description: string | null
  hours: string | null
  specialties: string | null
  has_guardia: boolean
  is_on_duty: boolean
}

interface DBLocality { id: string; name: string }

const CATEGORIA_TO_DB: Record<string, string> = {
  emergencias:   "emergency",
  cooperativas:  "utility",
  salud:         "health",
  farmacias:     "pharmacy",
  municipalidad: "municipal",
  centropagos:   "payment",
  turismo:       "tourism",
  veterinarias:  "veterinary",
  transporte:    "transport",
}

const SERVICE_CAT_ICONS: Record<string, { Icon: React.ElementType; color: string; bg: string }> = {
  emergency:  { Icon: Flame,       color: "#B83232", bg: "rgba(184,50,50,0.10)"   },
  health:     { Icon: Stethoscope, color: "#1A6B44", bg: "rgba(26,107,68,0.10)"   },
  pharmacy:   { Icon: Pill,        color: "#5B3A8C", bg: "rgba(91,58,140,0.10)"   },
  veterinary: { Icon: Dog,         color: "#A0522D", bg: "rgba(160,82,45,0.10)"   },
  municipal:  { Icon: Landmark,    color: "#2D4530", bg: "rgba(45,69,48,0.10)"    },
  security:   { Icon: Shield,      color: "#1C4680", bg: "rgba(28,70,128,0.10)"   },
  utility:    { Icon: Zap,         color: "#A06B0A", bg: "rgba(160,107,10,0.10)"  },
  payment:    { Icon: CreditCard,  color: "#1C4680", bg: "rgba(28,70,128,0.10)"   },
  transport:  { Icon: Bus,         color: "#2D4530", bg: "rgba(45,69,48,0.10)"    },
  tourism:    { Icon: Info,        color: "#5E4B3B", bg: "rgba(94,75,59,0.10)"    },
  other:      { Icon: Phone,       color: "#6B7B84", bg: "rgba(107,123,132,0.10)" },
}

const CATEGORIAS = [
  { key: "todos",         label: "Todos",                Icon: MoreHorizontal },
  { key: "emergencias",   label: "Emergencias",           Icon: AlertCircle    },
  { key: "cooperativas",  label: "Cooperativas",          Icon: Lightbulb      },
  { key: "salud",         label: "Salud",                 Icon: Stethoscope    },
  { key: "farmacias",     label: "Farmacias de turno",    Icon: Pill           },
  { key: "veterinarias",  label: "Veterinarias de turno", Icon: Dog            },
  { key: "municipalidad", label: "Municipalidad",         Icon: Landmark       },
  { key: "centropagos",   label: "Centro de Pagos",       Icon: CreditCard     },
  { key: "transporte",    label: "Transporte",            Icon: Bus            },
  { key: "turismo",       label: "Turismo oficial",       Icon: Info           },
]

const WA_ICON = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.526 5.845L.057 23.545a.75.75 0 0 0 .921.921l5.701-1.469A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.695 9.695 0 0 1-4.964-1.366l-.355-.212-3.686.949.969-3.682-.231-.366A9.712 9.712 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z" />
  </svg>
)

// ── TransportCompanyCard ─────────────────────────────────────────────────────

function TransportCompanyCard({ company }: { company: TransportCompany }) {
  const mapsHref = company.coordinates
    ? `https://maps.google.com/?q=${company.coordinates}`
    : company.address
      ? `https://maps.google.com/?q=${encodeURIComponent(company.address)}`
      : null

  return (
    <div
      className="rounded-2xl overflow-hidden bg-white"
      style={{ border: "1px solid rgba(45,69,48,0.20)", boxShadow: "0 2px 8px rgba(45,69,48,0.06)" }}
    >
      <div className="flex items-start gap-3 px-4 pt-4 pb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(45,69,48,0.10)" }}
        >
          <Bus size={18} style={{ color: "#2D4530" }} strokeWidth={1.8} />
        </div>

        <div className="flex-1 min-w-0 space-y-1.5">
          <p className="text-sm font-semibold leading-tight" style={{ color: "#1a2e1c" }}>
            {company.name}
          </p>
          {company.description && (
            <p className="text-xs leading-snug" style={{ color: "rgba(45,69,48,0.55)" }}>
              {company.description}
            </p>
          )}
          {company.address && (
            <p className="text-xs" style={{ color: "rgba(45,69,48,0.50)" }}>
              <MapPin size={10} className="inline mr-1" />{company.address}
            </p>
          )}

          {(company.phone || company.website || mapsHref) && (
            <div className="flex flex-wrap gap-2 pt-1">
              {company.phone && (
                <a
                  href={`tel:${company.phone}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-opacity active:opacity-80"
                  style={{ background: "#2D4530", color: "#E1DBC9" }}
                >
                  <Phone size={12} strokeWidth={2} />
                  {company.phone}
                </a>
              )}
              {company.website && (
                <a
                  href={normalizeUrl(company.website)!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-opacity active:opacity-80"
                  style={{ background: "rgba(45,69,48,0.08)", color: "#2D4530" }}
                >
                  <ExternalLink size={12} strokeWidth={2} />
                  Sitio web
                </a>
              )}
              {mapsHref && (
                <a
                  href={mapsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-opacity active:opacity-80"
                  style={{ background: "rgba(45,69,48,0.08)", color: "#2D4530" }}
                >
                  <MapPin size={12} strokeWidth={2} />
                  Ver en mapa
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── ServiceCard ──────────────────────────────────────────────────────────────

function ServiceCard({ service, localidad }: { service: DBService; localidad: string }) {
  const [open, setOpen] = useState(false)
  const meta = SERVICE_CAT_ICONS[service.category] ?? SERVICE_CAT_ICONS.other
  const { Icon, color, bg } = meta

  // Prefer phones[] array; fall back to phone/phone_2 for old records
  const phones: ServicePhone[] = service.phones?.length
    ? service.phones
    : [
        ...(service.phone   ? [{ label: "Principal", phone: service.phone,   is_whatsapp: false }] : []),
        ...(service.phone_2 ? [{ label: "Secundario", phone: service.phone_2, is_whatsapp: false }] : []),
      ]

  const hasPhones = phones.length > 0

  return (
    <div
      className="rounded-2xl overflow-hidden bg-white"
      style={{ border: "1px solid rgba(45,69,48,0.20)", boxShadow: "0 2px 8px rgba(45,69,48,0.06)" }}
    >
      {/* Header — always visible, click to expand */}
      <button
        type="button"
        onClick={() => hasPhones && setOpen(o => !o)}
        className="w-full flex items-start gap-3 px-4 pt-4 pb-3 text-left"
        style={{ cursor: hasPhones ? "pointer" : "default" }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: bg }}
        >
          <Icon size={18} style={{ color }} strokeWidth={1.8} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold leading-tight" style={{ color: "#1a2e1c" }}>
              {service.name}
            </p>
            {service.has_guardia && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(184,50,50,0.12)", color: "#B83232" }}>
                🚑 Guardia
              </span>
            )}
            {service.is_on_duty && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(234,179,8,0.15)", color: "#92400e" }}>
                ⚡ De turno
              </span>
            )}
          </div>

          {service.specialties && (
            <p className="text-xs mt-0.5" style={{ color: "rgba(45,69,48,0.60)" }}>{service.specialties}</p>
          )}
          {service.description && !service.specialties && service.category !== "transport" && (
            <p className="text-xs mt-0.5 leading-snug" style={{ color: "rgba(45,69,48,0.50)" }}>{service.description}</p>
          )}
          {service.description && service.category === "transport" && (
            <p className="text-xs mt-1 font-medium" style={{ color: "rgba(45,69,48,0.65)" }}>🚌 {service.description}</p>
          )}
          {service.hours && (
            <p className="inline-flex items-center gap-1 text-xs mt-1" style={{ color: "rgba(45,69,48,0.55)" }}>
              <Clock size={10} />{service.hours}
            </p>
          )}
          {service.address && (
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(service.address + ", " + localidad)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="flex items-center gap-1 text-xs mt-1 transition-opacity hover:opacity-70"
              style={{ color: "rgba(45,69,48,0.50)" }}
            >
              <MapPin size={10} />{service.address}<ExternalLink size={9} />
            </a>
          )}
        </div>

        {hasPhones && (
          <ChevronDown
            size={16}
            className={`transition-transform duration-200 mt-1 flex-shrink-0 ${open ? "rotate-180" : ""}`}
            style={{ color: "rgba(45,69,48,0.40)" }}
          />
        )}
      </button>

      {/* Expandable phone list */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: "hidden", borderTop: "1px solid rgba(45,69,48,0.10)" }}
          >
            {phones.map((p, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom: i < phones.length - 1 ? "1px solid rgba(45,69,48,0.07)" : undefined }}
              >
                <div className="min-w-0 mr-3">
                  {p.label && (
                    <p className="text-[11px] font-medium mb-0.5" style={{ color: "rgba(45,69,48,0.50)" }}>
                      {p.label}
                    </p>
                  )}
                  <p className="text-sm font-bold tracking-wide" style={{ color: "#1a2e1c" }}>
                    {p.phone}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <a
                    href={`tel:${p.phone}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-opacity active:opacity-80"
                    style={{ background: "#2D4530", color: "#E1DBC9" }}
                  >
                    <Phone size={12} strokeWidth={2} />
                    Llamar
                  </a>
                  {p.is_whatsapp && (
                    <a
                      href={`https://wa.me/${p.phone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-opacity active:opacity-80"
                      style={{ background: "#25D366", color: "white" }}
                    >
                      {WA_ICON}
                      WhatsApp
                    </a>
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

interface Props {
  initialCategoria?: string
  initialPueblo?: string
}

export default function InfoUtilPage({ initialCategoria, initialPueblo }: Props) {
  const { localidad, setLocalidad } = useLocalidad()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showAll, setShowAll] = useState(false)
  const syncedRef = useRef(false)
  const vetPinchRef = useRef<{ dist: number; scale: number } | null>(null)
  const vetDragRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null)
  const farmaciaPinchRef = useRef<{ dist: number; scale: number } | null>(null)
  const farmaciaDragRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null)

  const [contacts, setContacts] = useState<DBService[]>([])
  const [dbLocalities, setDbLocalities] = useState<DBLocality[]>([])
  const [loading, setLoading] = useState(false)
  const [transportCompanies, setTransportCompanies] = useState<TransportCompany[]>([])
  const [loadingTransport, setLoadingTransport] = useState(false)
  const [vetGuardiaPhoto, setVetGuardiaPhoto] = useState<string | null>(null)
  const [loadingVetGuardia, setLoadingVetGuardia] = useState(false)
  const [vetLightbox, setVetLightbox] = useState(false)
  const [vetZoomScale, setVetZoomScale] = useState(1)
  const [vetZoomOffset, setVetZoomOffset] = useState({ x: 0, y: 0 })
  const [farmaciaGuardiaPhoto, setFarmaciaGuardiaPhoto] = useState<string | null>(null)
  const [loadingFarmaciaGuardia, setLoadingFarmaciaGuardia] = useState(false)
  const [farmaciaLightbox, setFarmaciaLightbox] = useState(false)
  const [farmaciaZoomScale, setFarmaciaZoomScale] = useState(1)
  const [farmaciaZoomOffset, setFarmaciaZoomOffset] = useState({ x: 0, y: 0 })

  // Fetch localities once
  useEffect(() => {
    createClient()
      .from("localities")
      .select("id, name")
      .order("sort_order")
      .then(({ data }) => setDbLocalities(data || []))
  }, [])

  // Fetch foto de guardia veterinaria (global, sin localidad)
  useEffect(() => {
    setLoadingVetGuardia(true)
    createClient()
      .from("guardia_photos")
      .select("photo_url")
      .eq("category", "veterinarias")
      .eq("locality", "")
      .maybeSingle()
      .then(({ data }) => {
        setVetGuardiaPhoto(data?.photo_url ?? null)
        setLoadingVetGuardia(false)
      })
  }, [])

  // Fetch foto de cronograma de farmacias (por localidad)
  useEffect(() => {
    if (!localidad) return
    setLoadingFarmaciaGuardia(true)
    setFarmaciaGuardiaPhoto(null)
    createClient()
      .from("guardia_photos")
      .select("photo_url")
      .eq("category", "farmacias")
      .eq("locality", localidad)
      .maybeSingle()
      .then(({ data }) => {
        setFarmaciaGuardiaPhoto(data?.photo_url ?? null)
        setLoadingFarmaciaGuardia(false)
      })
  }, [localidad])

  // Fetch transport companies once (not per-locality)
  useEffect(() => {
    setLoadingTransport(true)
    createClient()
      .from("transport_companies")
      .select("*")
      .eq("is_active", true)
      .order("sort_order")
      .then(({ data }) => {
        setTransportCompanies((data as TransportCompany[]) || [])
        setLoadingTransport(false)
      })
  }, [])

  // Fetch useful_contacts filtered strictly by the selected locality
  useEffect(() => {
    const loc = dbLocalities.find(l => l.name === localidad)
    if (!loc) { setContacts([]); return }
    setLoading(true)
    createClient()
      .from("useful_contacts")
      .select("id, title, category, phone, phone_2, phones, address, description, schedule, is_on_duty, has_guardia, specialties")
      .eq("is_active", true)
      .eq("locality_id", loc.id)
      .order("sort_order")
      .then(({ data }) => {
        const normalized: DBService[] = (data || []).map(c => ({
          id:          c.id,
          name:        c.title,
          category:    c.category,
          phone:       c.phone       ?? null,
          phone_2:     c.phone_2     ?? null,
          phones:      c.phones      ?? [],
          address:     c.address     ?? null,
          description: c.description ?? null,
          hours:       c.schedule    ?? null,
          specialties: c.specialties ?? null,
          has_guardia: c.has_guardia ?? false,
          is_on_duty:  c.is_on_duty  ?? false,
        }))
        setContacts(normalized)
        setLoading(false)
      })
  }, [localidad, dbLocalities])

  // Sync URL pueblo → context on first render
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

  useEffect(() => {
    if (!vetLightbox) {
      setVetZoomScale(1)
      setVetZoomOffset({ x: 0, y: 0 })
    }
  }, [vetLightbox])

  const handleVetPinchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      vetPinchRef.current = { dist: Math.hypot(dx, dy), scale: vetZoomScale }
      vetDragRef.current = null
    } else if (e.touches.length === 1 && vetZoomScale > 1) {
      vetDragRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, ox: vetZoomOffset.x, oy: vetZoomOffset.y }
      vetPinchRef.current = null
    }
  }

  const handleVetPinchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && vetPinchRef.current) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const ratio = Math.hypot(dx, dy) / vetPinchRef.current.dist
      const next = Math.min(4, Math.max(1, vetPinchRef.current.scale * ratio))
      setVetZoomScale(next)
      if (next <= 1) setVetZoomOffset({ x: 0, y: 0 })
    } else if (e.touches.length === 1 && vetDragRef.current) {
      setVetZoomOffset({
        x: vetDragRef.current.ox + (e.touches[0].clientX - vetDragRef.current.x),
        y: vetDragRef.current.oy + (e.touches[0].clientY - vetDragRef.current.y),
      })
    }
  }

  const handleVetPinchEnd = () => {
    vetPinchRef.current = null
    vetDragRef.current = null
  }

  useEffect(() => {
    if (!farmaciaLightbox) {
      setFarmaciaZoomScale(1)
      setFarmaciaZoomOffset({ x: 0, y: 0 })
    }
  }, [farmaciaLightbox])

  const handleFarmaciaPinchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      farmaciaPinchRef.current = { dist: Math.hypot(dx, dy), scale: farmaciaZoomScale }
      farmaciaDragRef.current = null
    } else if (e.touches.length === 1 && farmaciaZoomScale > 1) {
      farmaciaDragRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, ox: farmaciaZoomOffset.x, oy: farmaciaZoomOffset.y }
      farmaciaPinchRef.current = null
    }
  }

  const handleFarmaciaPinchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && farmaciaPinchRef.current) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const ratio = Math.hypot(dx, dy) / farmaciaPinchRef.current.dist
      const next = Math.min(4, Math.max(1, farmaciaPinchRef.current.scale * ratio))
      setFarmaciaZoomScale(next)
      if (next <= 1) setFarmaciaZoomOffset({ x: 0, y: 0 })
    } else if (e.touches.length === 1 && farmaciaDragRef.current) {
      setFarmaciaZoomOffset({
        x: farmaciaDragRef.current.ox + (e.touches[0].clientX - farmaciaDragRef.current.x),
        y: farmaciaDragRef.current.oy + (e.touches[0].clientY - farmaciaDragRef.current.y),
      })
    }
  }

  const handleFarmaciaPinchEnd = () => {
    farmaciaPinchRef.current = null
    farmaciaDragRef.current = null
  }

  const handlePuebloChange = (loc: string) => {
    setLocalidad(loc)
    const params = new URLSearchParams(searchParams.toString())
    params.set("pueblo", loc)
    router.replace(`/info-util?${params.toString()}`, { scroll: false })
  }

  const handleCategoriaChange = (cat: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (cat === "todos") params.delete("categoria")
    else params.set("categoria", cat)
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
    setShowAll(s => !s)
  }

  const categoria = searchParams.get("categoria") ?? initialCategoria ?? "todos"
  const visibleLocalidades = showAll ? LOCALIDADES : MAIN_LOCALIDADES

  const allServices = contacts
  const dbCatFilter = categoria && categoria !== "todos" ? CATEGORIA_TO_DB[categoria] : null
  const filteredServices = dbCatFilter
    ? allServices.filter(s => s.category === dbCatFilter)
    : allServices

  const dutyService = filteredServices.find(s => s.is_on_duty)

  const activeCat = CATEGORIAS.find(c => c.key === categoria)
  const activeCategoriaLabel = activeCat?.label ?? "Todos"
  const ActiveCategoriaIcon = activeCat?.Icon ?? Phone

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">

      {/* Breadcrumb */}
      <BackButton
        fallbackHref="/"
        label="Volver"
        className="text-sm mb-6"
        style={{ color: "rgba(45,69,48,0.55)" }}
      />

      {/* Page header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(45,69,48,0.10)" }}>
          <Phone size={20} style={{ color: "#2D4530" }} />
        </div>
        <div>
          <h1 className="font-serif text-3xl md:text-4xl" style={{ color: "#2D4530" }}>Info Útil</h1>
          <p className="text-sm mt-0.5" style={{ color: "rgba(45,69,48,0.55)" }}>
            Teléfonos y contactos del Valle de Calamuchita
          </p>
        </div>
      </div>

      {/* Category filter */}
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "rgba(45,69,48,0.40)" }}>Categoría</p>
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
                style={isActive
                  ? { background: "#2D4530", color: "#E1DBC9", boxShadow: "0 4px 14px rgba(45,69,48,0.28)" }
                  : { background: "rgba(255,255,255,0.70)", color: "rgba(45,69,48,0.65)", border: "1px solid rgba(45,69,48,0.15)" }
                }
              >
                <Icon size={13} />
                {label}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Locality filter */}
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "rgba(45,69,48,0.40)" }}>Localidad</p>
        <div className="flex flex-wrap gap-2">
          {visibleLocalidades.map(loc => (
            <motion.button
              key={loc}
              onClick={() => handlePuebloChange(loc)}
              whileHover={{ y: -3, boxShadow: "0 8px 22px rgba(45,69,48,0.16)" }}
              whileTap={{ y: -1 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap"
              style={localidad === loc
                ? { background: "#2D4530", color: "#E1DBC9", boxShadow: "0 4px 14px rgba(45,69,48,0.28)" }
                : { background: "rgba(255,255,255,0.60)", color: "rgba(45,69,48,0.65)", border: "1px solid rgba(45,69,48,0.15)" }
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
            style={{ background: showAll ? "rgba(45,69,48,0.08)" : "rgba(255,255,255,0.60)", color: "#2D4530", border: "1px solid rgba(45,69,48,0.20)" }}
          >
            {showAll ? "− Menos" : "+ Más localidades"}
          </motion.button>
        </div>
      </div>

      {/* Subcategory header */}
      {categoria && categoria !== "todos" && (
        <div className="flex items-center gap-3 mb-5 pb-4" style={{ borderBottom: "1px solid rgba(45,69,48,0.10)" }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(45,69,48,0.08)" }}>
            <ActiveCategoriaIcon size={16} style={{ color: "#2D4530" }} />
          </div>
          <div>
            <h2 className="font-serif text-xl" style={{ color: "#2D4530" }}>{activeCategoriaLabel}</h2>
            <p className="text-xs" style={{ color: "rgba(45,69,48,0.45)" }}>{localidad}</p>
          </div>
        </div>
      )}

      {/* Main content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${categoria}-${localidad}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.22 }}
        >
          {/* Loading skeleton */}
          {(loading || (categoria === "transporte" && loadingTransport) || (categoria === "veterinarias" && loadingVetGuardia) || (categoria === "farmacias" && loadingFarmaciaGuardia)) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="rounded-2xl bg-white animate-pulse h-20" style={{ border: "1px solid rgba(45,69,48,0.12)" }} />
              ))}
            </div>
          )}

          {/* Veterinarias de turno — foto con lightbox */}
          {categoria === "veterinarias" && !loadingVetGuardia && (
            vetGuardiaPhoto ? (
              <>
                <button
                  type="button"
                  onClick={() => setVetLightbox(true)}
                  className="w-full rounded-2xl overflow-hidden block active:opacity-80 transition-opacity"
                  style={{ border: "1px solid rgba(45,69,48,0.15)", boxShadow: "0 2px 12px rgba(45,69,48,0.08)" }}
                >
                  <Image
                    src={vetGuardiaPhoto}
                    alt="Guardia de veterinarias — Valle de Calamuchita"
                    width={900}
                    height={600}
                    className="w-full h-auto object-contain bg-white"
                    style={{ display: "block" }}
                  />
                </button>

                <AnimatePresence>
                  {vetLightbox && (
                    <motion.div
                      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
                      style={{ background: "rgba(0,0,0,0.92)" }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setVetLightbox(false)}
                    >
                      <button
                        type="button"
                        onClick={() => setVetLightbox(false)}
                        className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ background: "rgba(255,255,255,0.15)" }}
                      >
                        <X size={20} color="white" />
                      </button>
                      <motion.div
                        initial={{ scale: 0.85 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0.85 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        onClick={e => e.stopPropagation()}
                        onTouchStart={handleVetPinchStart}
                        onTouchMove={handleVetPinchMove}
                        onTouchEnd={handleVetPinchEnd}
                        className="w-full max-w-2xl"
                        style={{ touchAction: "none" }}
                      >
                        <div style={{
                          transform: `translate(${vetZoomOffset.x}px, ${vetZoomOffset.y}px) scale(${vetZoomScale})`,
                          transformOrigin: "center center",
                          willChange: "transform",
                        }}>
                          <Image
                            src={vetGuardiaPhoto}
                            alt="Guardia de veterinarias — Valle de Calamuchita"
                            width={1200}
                            height={900}
                            className="w-full h-auto rounded-xl object-contain"
                            style={{ maxHeight: "85vh" }}
                          />
                        </div>
                        {vetZoomScale <= 1 && (
                          <p className="text-center text-xs mt-3 opacity-40" style={{ color: "white" }}>
                            Pellizcá para ampliar
                          </p>
                        )}
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center rounded-3xl" style={{ background: "rgba(225,219,201,0.35)" }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(45,69,48,0.08)" }}>
                  <Dog size={24} style={{ color: "rgba(45,69,48,0.38)" }} />
                </div>
                <h3 className="font-serif text-lg mb-1" style={{ color: "#2D4530" }}>Sin información disponible</h3>
                <p className="text-sm max-w-xs leading-relaxed" style={{ color: "rgba(45,69,48,0.55)" }}>
                  Aún no se cargó el cuadro de guardias veterinarias.
                </p>
              </div>
            )
          )}

          {/* Farmacias de turno — foto con cronograma por localidad */}
          {categoria === "farmacias" && !loadingFarmaciaGuardia && farmaciaGuardiaPhoto && (
            <>
              <button
                type="button"
                onClick={() => setFarmaciaLightbox(true)}
                className="w-full rounded-2xl overflow-hidden block active:opacity-80 transition-opacity mb-5"
                style={{ border: "1px solid rgba(45,69,48,0.15)", boxShadow: "0 2px 12px rgba(45,69,48,0.08)" }}
              >
                <Image
                  src={farmaciaGuardiaPhoto}
                  alt={`Farmacias de turno — ${localidad}`}
                  width={900}
                  height={600}
                  className="w-full h-auto object-contain bg-white"
                  style={{ display: "block" }}
                />
              </button>

              <AnimatePresence>
                {farmaciaLightbox && (
                  <motion.div
                    className="fixed inset-0 z-[300] flex items-center justify-center p-4"
                    style={{ background: "rgba(0,0,0,0.92)" }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setFarmaciaLightbox(false)}
                  >
                    <button
                      type="button"
                      onClick={() => setFarmaciaLightbox(false)}
                      className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ background: "rgba(255,255,255,0.15)" }}
                    >
                      <X size={20} color="white" />
                    </button>
                    <motion.div
                      initial={{ scale: 0.85 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0.85 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      onClick={e => e.stopPropagation()}
                      onTouchStart={handleFarmaciaPinchStart}
                      onTouchMove={handleFarmaciaPinchMove}
                      onTouchEnd={handleFarmaciaPinchEnd}
                      className="w-full max-w-2xl"
                      style={{ touchAction: "none" }}
                    >
                      <div style={{
                        transform: `translate(${farmaciaZoomOffset.x}px, ${farmaciaZoomOffset.y}px) scale(${farmaciaZoomScale})`,
                        transformOrigin: "center center",
                        willChange: "transform",
                      }}>
                        <Image
                          src={farmaciaGuardiaPhoto}
                          alt={`Farmacias de turno — ${localidad}`}
                          width={1200}
                          height={900}
                          className="w-full h-auto rounded-xl object-contain"
                          style={{ maxHeight: "85vh" }}
                        />
                      </div>
                      {farmaciaZoomScale <= 1 && (
                        <p className="text-center text-xs mt-3 opacity-40" style={{ color: "white" }}>
                          Pellizcá para ampliar
                        </p>
                      )}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}

          {/* De turno banner */}
          {!loading && dutyService && categoria !== "transporte" && categoria !== "veterinarias" && (
            <div className="flex items-center gap-4 rounded-2xl px-5 py-4 mb-5"
              style={{ background: "linear-gradient(135deg, rgba(234,179,8,0.15) 0%, rgba(234,179,8,0.08) 100%)", border: "1.5px solid rgba(234,179,8,0.40)" }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(234,179,8,0.18)" }}>
                <Zap size={20} style={{ color: "#92400e" }} strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: "rgba(146,64,14,0.75)" }}>De turno hoy</p>
                <p className="text-base font-bold leading-tight" style={{ color: "#78350f" }}>{dutyService.name}</p>
                {dutyService.hours && (
                  <p className="text-xs mt-0.5" style={{ color: "rgba(120,53,15,0.70)" }}>
                    <Clock size={10} className="inline mr-1" />{dutyService.hours}
                  </p>
                )}
              </div>
              {dutyService.phone && (
                <a href={`tel:${dutyService.phone}`}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-sm flex-shrink-0 transition-opacity hover:opacity-80"
                  style={{ background: "#92400e", color: "white" }}>
                  <Phone size={14} /> Llamar
                </a>
              )}
            </div>
          )}

          {/* Empty state (categorías normales) */}
          {categoria !== "transporte" && categoria !== "veterinarias" && !loading && filteredServices.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center rounded-3xl" style={{ background: "rgba(225,219,201,0.35)" }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(45,69,48,0.08)" }}>
                <RefreshCw size={24} style={{ color: "rgba(45,69,48,0.38)" }} />
              </div>
              <h3 className="font-serif text-lg mb-1" style={{ color: "#2D4530" }}>Sin información disponible</h3>
              <p className="text-sm max-w-xs leading-relaxed mb-6" style={{ color: "rgba(45,69,48,0.55)" }}>
                Aún no hay registros para <strong>{activeCategoriaLabel}</strong> en <strong>{localidad}</strong>.
              </p>
              <motion.button
                onClick={() => handleCategoriaChange("todos")}
                whileHover={{ y: -2 }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium"
                style={{ background: "#2D4530", color: "#E1DBC9" }}
              >
                <Phone size={14} />
                Ver todos los contactos
              </motion.button>
            </div>
          )}

          {/* Transport company cards */}
          {categoria === "transporte" && !loadingTransport && transportCompanies.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {transportCompanies.map(c => (
                <TransportCompanyCard key={c.id} company={c} />
              ))}
            </div>
          )}
          {categoria === "transporte" && !loadingTransport && transportCompanies.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center rounded-3xl" style={{ background: "rgba(225,219,201,0.35)" }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(45,69,48,0.08)" }}>
                <Bus size={24} style={{ color: "rgba(45,69,48,0.38)" }} />
              </div>
              <h3 className="font-serif text-lg mb-1" style={{ color: "#2D4530" }}>Sin información disponible</h3>
              <p className="text-sm max-w-xs leading-relaxed" style={{ color: "rgba(45,69,48,0.55)" }}>
                Aún no hay empresas de transporte cargadas.
              </p>
            </div>
          )}

          {/* Service cards (categorías normales) */}
          {categoria !== "transporte" && categoria !== "veterinarias" && !loading && filteredServices.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredServices.map(service => (
                <ServiceCard key={service.id} service={service} localidad={localidad} />
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
