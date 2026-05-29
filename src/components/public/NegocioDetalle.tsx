"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Phone,
  AtSign,
  MapPin,
  Clock,
  Truck,
  ShoppingBag,
  UtensilsCrossed,
  ArrowLeft,
  Calendar,
  Users,
  Globe,
  Navigation,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import CartaInteractiva from "@/components/public/CartaInteractiva"
import { createClient } from "@/lib/supabase/client"

const DAY = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
const GUEST_KEY = "calamuchita_app_guest"

interface GuestDetails {
  name: string
  phone: string
}

interface ReservaForm extends GuestDetails {
  date: string
  time: string
  people: string
  notes: string
}

const EMPTY_FORM: ReservaForm = {
  name: "",
  phone: "",
  date: "",
  time: "",
  people: "2",
  notes: "",
}

const WA_SVG = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.526 5.845L.057 23.545a.75.75 0 0 0 .921.921l5.701-1.469A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.695 9.695 0 0 1-4.964-1.366l-.355-.212-3.686.949.969-3.682-.231-.366A9.712 9.712 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z" />
  </svg>
)

function InfoRow({ icon, sublabel, label, href, external }: { icon: React.ReactNode; sublabel: string; label: string; href?: string; external?: boolean }) {
  const inner = (
    <div className="flex items-start gap-3 py-3 border-b border-stone-100 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-stone-50 border border-stone-100 flex items-center justify-center shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-0.5">{sublabel}</p>
        <p className="text-sm font-semibold text-[#2D4530] leading-snug break-words">{label}</p>
      </div>
    </div>
  )
  if (href) {
    return (
      <a href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined} className="block hover:opacity-70 transition-opacity">
        {inner}
      </a>
    )
  }
  return inner
}

interface Props {
  business: any
}

export default function NegocioDetalle({ business }: Props) {
  const cartaRef = useRef<HTMLDivElement>(null)
  const [photoIdx, setPhotoIdx] = useState(0)
  const [showReserva, setShowReserva] = useState(false)
  const [reservaForm, setReservaForm] = useState<ReservaForm>(EMPTY_FORM)

  // 1. Cargar desde localStorage en Mount de forma segura para SSR
  useEffect(() => {
    createClient().rpc("increment_view", { business_id: business.id }).then()
    
    try {
      const stored = localStorage.getItem(GUEST_KEY)
      if (stored) {
        const parsed: Partial<GuestDetails> = JSON.parse(stored)
        setReservaForm(prev => ({
          ...prev,
          name: parsed.name || "",
          phone: parsed.phone || "",
        }))
      }
    } catch (e) {
      console.warn("localStorage no disponible o bloqueado por el navegador.", e)
    }
  }, [business.id])

  const recordLead = (type: string) =>
    createClient().from("business_leads").insert({ business_id: business.id, type }).then()

  const waNumber = (business.whatsapp || business.phone)?.replace(/\D/g, "")
  const waLink = waNumber
    ? `https://wa.me/${waNumber}?text=${encodeURIComponent(`Hola! Me contacto desde Calamuchita App por el negocio ${business.name}.`)}`
    : null

  const hasMenu = (business.menu_categories?.length ?? 0) > 0

  const todayMenu = business.daily_menus?.find((m: any) => {
    const today = new Date().toISOString().split("T")[0]
    return m.date === today && m.is_published
  })

  const handleVerCarta = () => cartaRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })

  const handleHacerPedido = () => {
    if (hasMenu) {
      cartaRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    } else if (waNumber) {
      recordLead("whatsapp")
      window.open(
        `https://wa.me/${waNumber}?text=${encodeURIComponent(`Hola ${business.name}! Quiero hacer un pedido. ¿Me compartís el menú disponible? Gracias!`)}`,
        "_blank",
      )
    }
  }

  // 2. Enviar Reserva y Persistir Datos Express
  const handleEnviarReserva = () => {
    recordLead("reserva")
    
    // Guardar datos básicos en localStorage para la próxima vez
    try {
      localStorage.setItem(GUEST_KEY, JSON.stringify({ name: reservaForm.name, phone: reservaForm.phone }))
    } catch (e) {
      console.error(e)
    }

    const phoneTarget = (business.whatsapp || business.phone)?.replace(/\D/g, "") || ""
    const fullPhone = phoneTarget.startsWith("54") ? phoneTarget : `54${phoneTarget}`
    
    const numPeople = parseInt(reservaForm.people, 10)
    const labelPeople = isNaN(numPeople) ? "más de 10" : numPeople === 1 ? "1 persona" : `${numPeople} personas`

    const msg = encodeURIComponent(
      `🌿 ¡Hola *${business.name}*! 👋\n` +
      `Vengo desde *Calamuchita App* para realizar una solicitud:\n\n` +
      `📌 *DETALLES DE LA RESERVA:*\n` +
      `👤 *Cliente:* ${reservaForm.name.trim()}\n` +
      `📞 *Teléfono:* ${reservaForm.phone.trim()}\n` +
      `📅 *Fecha:* ${reservaForm.date}\n` +
      `🕐 *Hora:* ${reservaForm.time} hs\n` +
      `👥 *Comensales:* ${labelPeople}\n\n` +
      `📝 *Notas adicionales:*\n${reservaForm.notes.trim() || "Ninguna"}\n\n` +
      `¡Muchas gracias!`
    )
    
    window.open(`https://wa.me/${fullPhone}?text=${msg}`, "_blank")
    setShowReserva(false)
    
    // Al cerrar limpiamos campos dinámicos pero PRESERVAMOS los datos del cliente
    setReservaForm(prev => ({
      ...prev,
      date: "",
      time: "",
      notes: "",
    }))
  }

  // Validación robusta sin espacios en blanco colgados
  const reservaValid = 
    reservaForm.name.trim().length > 0 && 
    reservaForm.phone.trim().length > 0 && 
    reservaForm.date !== "" && 
    reservaForm.time !== ""

  const mapsExternalLink =
    business.latitude && business.longitude
      ? `https://www.google.com/maps/search/?api=1&query=${business.latitude},${business.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${business.name}${business.address ? `, ${business.address}` : ""}`)}`

  const photos: string[] =
    Array.isArray(business.images) && business.images.length > 0
      ? business.images
      : business.cover_url
      ? [business.cover_url]
      : []

  const prevPhoto = () => setPhotoIdx(i => (i - 1 + photos.length) % photos.length)
  const nextPhoto = () => setPhotoIdx(i => (i + 1) % photos.length)

  const categoryLabel = business.subcategory || business.category || "Comercio"
  const isOpen = business.is_open

  const instagramHandle = business.instagram
    ?.replace(/^@|https?:\/\/(www\.)?instagram\.com\//g, "")
    .replace(/\/$/, "")

  const hasActions = waLink || business.phone

  return (
    <div className="min-h-screen pb-24" style={{ background: "#F0EBE0" }}>
      <div className="max-w-2xl mx-auto px-4 flex flex-col gap-y-4 pt-5">

        <Link href="/negocios" className="inline-flex items-center gap-1.5 text-sm font-medium w-fit transition-opacity hover:opacity-60" style={{ color: "#2D4530" }}>
          <ArrowLeft size={15} /> Volver
        </Link>

        {/* CONTENEDOR INFORMACIÓN */}
        <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
          <div className="px-6 pt-6 pb-5 border-b border-stone-100">
            <div className="flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl md:text-3xl font-bold leading-tight mb-3 tracking-tight" style={{ color: "#2D4530" }}>
                  {business.name}
                </h1>
                <div className="flex items-center gap-2 flex-wrap min-h-[28px]">
                  <span className="text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider" style={{ background: "rgba(45,69,48,0.10)", color: "#2D4530" }}>
                    {categoryLabel}
                  </span>
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${isOpen ? "text-green-700 bg-green-50 border border-green-200" : "text-stone-500 bg-stone-100"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full inline-block ${isOpen ? "bg-green-500" : "bg-stone-400"}`} />
                    {isOpen ? "Abierto ahora" : "Cerrado"}
                  </span>
                </div>
              </div>

              {business.logo_url && (
                <div className="w-20 h-20 rounded-xl bg-white border border-stone-100 shadow-sm p-2 shrink-0 relative overflow-hidden">
                  <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-stone-50 via-stone-100 to-stone-50" />
                  <Image src={business.logo_url} alt={`Logo de ${business.name}`} fill priority className="object-contain p-1.5" sizes="80px" quality={85} />
                </div>
              )}
            </div>
          </div>

          {business.description && (
            <div className="px-6 py-5 border-b border-stone-100">
              <p className="text-stone-500 text-sm leading-relaxed">{business.description}</p>
            </div>
          )}

          <div className="px-6 py-1">
            {business.phone && <InfoRow icon={<Phone size={14} style={{ color: "#2D4530" }} />} sublabel="Teléfono" label={business.phone} href={`tel:${business.phone}`} />}
            {instagramHandle && <InfoRow icon={<AtSign size={14} style={{ color: "#2D4530" }} />} sublabel="Instagram" label={`@${instagramHandle}`} href={`https://instagram.com/${instagramHandle}`} external />}
            {business.website && <InfoRow icon={<Globe size={14} style={{ color: "#2D4530" }} />} sublabel="Web" label={business.website.replace(/^https?:\/\//, "")} href={business.website} external />}
            {business.address && <InfoRow icon={<MapPin size={14} style={{ color: "#2D4530" }} />} sublabel="Dirección" label={business.address} />}
          </div>

          {business.business_hours?.length > 0 && (
            <div className="px-6 pt-4 pb-6 border-t border-stone-100">
              <div className="flex items-center gap-2 mb-3">
                <Clock size={13} style={{ color: "rgba(45,69,48,0.40)" }} />
                <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: "rgba(45,69,48,0.40)" }}>Horarios</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                {[...business.business_hours].sort((a: any, b: any) => a.day_of_week - b.day_of_week).map((h: any) => (
                  <div key={h.id} className="flex justify-between items-center py-1.5 border-b border-stone-50 last:border-0 text-sm">
                    <span className="text-stone-500 font-medium">{DAY[h.day_of_week]}</span>
                    <span className="font-semibold" style={{ color: h.is_closed ? "#C4B9A8" : "#2D4530" }}>
                      {h.is_closed ? "Cerrado" : `${h.opens_at.slice(0, 5)} — ${h.closes_at.slice(0, 5)}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ACCIONES ESTÁNDAR */}
        {hasActions && (
          <div className="flex flex-wrap gap-3">
            {waLink && (
              <a href={waLink} target="_blank" rel="noopener noreferrer" onClick={() => recordLead("whatsapp")} className="flex-1 min-w-[140px] flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm text-white shadow-md hover:brightness-110 transition-all active:scale-95" style={{ background: "#25D366" }}>
                {WA_SVG} WhatsApp
              </a>
            )}
            <a href={mapsExternalLink} target="_blank" rel="noopener noreferrer" className="flex-1 min-w-[140px] flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm shadow-md hover:opacity-90 transition-all active:scale-95" style={{ background: "#2D4530", color: "#E1DBC9" }}>
              <Navigation size={16} /> Llegar
            </a>
          </div>
        )}

        {/* DETALLES DE SERVICIO GASTRONÓMICO */}
        {(business.offers_delivery || business.offers_takeaway || business.offers_dine_in) && (
          <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-5 flex flex-wrap gap-3">
            {business.offers_dine_in && <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold" style={{ background: "rgba(45,69,48,0.07)", color: "#2D4530" }}><UtensilsCrossed size={14} /> Salón</div>}
            {business.offers_delivery && <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold" style={{ background: "rgba(45,69,48,0.07)", color: "#2D4530" }}><Truck size={14} /> Delivery</div>}
            {business.offers_takeaway && <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold" style={{ background: "rgba(45,69,48,0.07)", color: "#2D4530" }}><ShoppingBag size={14} /> Take away</div>}
          </div>
        )}

        {business.section === "gastronomy" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button onClick={handleVerCarta} disabled={!hasMenu} className="flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm shadow-md transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed" style={{ background: "#2D4530", color: "#E1DBC9" }}>
              <UtensilsCrossed size={17} /> Ver Carta
            </button>
            <button onClick={() => setShowReserva(true)} disabled={!waNumber} className="flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm shadow-md transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed" style={{ background: "#2D4530", color: "#E1DBC9" }}>
              <Calendar size={17} /> Reservar Mesa
            </button>
            <button onClick={handleHacerPedido} disabled={!hasMenu && !waNumber} className="flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm shadow-md transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed" style={{ background: "#2D4530", color: "#E1DBC9" }}>
              <ShoppingBag size={17} /> Hacer Pedido
            </button>
          </div>
        )}

        {todayMenu && todayMenu.daily_menu_items?.length > 0 && (
          <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <UtensilsCrossed size={18} style={{ color: "#2D4530" }} />
              <h2 className="font-bold text-lg" style={{ color: "#2D4530" }}>Menú del día</h2>
            </div>
            <div className="space-y-0">
              {todayMenu.daily_menu_items.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between py-3 border-b border-stone-100 last:border-0">
                  <div className="min-w-0 pr-4">
                    <p className="font-semibold text-stone-800 text-sm">{item.name}</p>
                    {item.description && <p className="text-xs text-stone-400 mt-0.5">{item.description}</p>}
                  </div>
                  <p className="font-bold shrink-0 text-sm" style={{ color: "#2D4530" }}>${item.price.toLocaleString("es-AR")}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* GALERÍA DE FOTOS ABAJO */}
        {photos.length > 0 && (
          <div className="flex flex-col gap-y-3 mt-2">
            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-stone-200" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full shrink-0" style={{ background: "rgba(45,69,48,0.10)", color: "#2D4530" }}>
                {categoryLabel}
              </span>
              <span className="h-px flex-1 bg-stone-200" />
            </div>
            <div className="flex items-center gap-2">
              {photos.length > 1 && (
                <button onClick={prevPhoto} aria-label="Foto anterior" className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 border-[#2D4530] text-[#2D4530] hover:bg-[#2D4530] hover:text-[#E1DBC9] transition-all active:scale-90">
                  <ChevronLeft size={18} />
                </button>
              )}
              <div className="flex-1 aspect-video rounded-2xl overflow-hidden relative bg-stone-100">
                <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-stone-100 via-stone-50 to-stone-100" />
                <Image src={photos[photoIdx]} alt={`${business.name} — foto ${photoIdx + 1}`} fill priority={photoIdx === 0} className="object-cover" sizes="(max-width: 640px) calc(100vw - 32px), 640px" quality={85} />
              </div>
              {photos.length > 1 && (
                <button onClick={nextPhoto} aria-label="Foto siguiente" className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 border-[#2D4530] text-[#2D4530] hover:bg-[#2D4530] hover:text-[#E1DBC9] transition-all active:scale-90">
                  <ChevronRight size={18} />
                </button>
              )}
            </div>
            {photos.length > 1 && (
              <div className="flex items-center justify-center gap-2 h-4">
                {photos.map((_, i) => (
                  <button key={i} onClick={() => setPhotoIdx(i)} className="h-1.5 rounded-full transition-all duration-300" style={{ width: i === photoIdx ? 20 : 6, background: i === photoIdx ? "#2D4530" : "rgba(45,69,48,0.22)" }} />
                ))}
              </div>
            )}
            <p className="text-center text-xs text-stone-500 font-semibold leading-snug mt-1">
              {business.gallery_caption || "Ver detalles del modelo, precio y stock."}
            </p>
          </div>
        )}

        {business.menu_categories?.length > 0 && (
          <div ref={cartaRef}>
            <CartaInteractiva categories={business.menu_categories} business={business} />
          </div>
        )}
      </div>

      {/* MODAL RESERVAS (CON PRE-RELLENADO DESDE LOCALSTORAGE) */}
      <AnimatePresence>
        {showReserva && (
          <>
            <motion.div className="fixed inset-0 bg-black/40 z-40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowReserva(false)} />
            <motion.div className="fixed inset-x-4 bottom-4 top-4 z-50 max-w-md mx-auto overflow-y-auto" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
              <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">
                <div className="px-6 py-4 flex items-center justify-between" style={{ background: "#2D4530" }}>
                  <h2 className="font-bold text-lg" style={{ color: "#E1DBC9" }}>Reservar mesa</h2>
                  <button onClick={() => setShowReserva(false)} className="text-stone-300 hover:text-white"><X size={22} /></button>
                </div>
                <div className="p-6 space-y-4">
                  {/* Grid de dos columnas para Nombre y Teléfono Express */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Tu nombre *</label>
                      <input
                        type="text"
                        value={reservaForm.name}
                        onChange={e => setReservaForm(p => ({ ...p, name: e.target.value }))}
                        placeholder="María García"
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none focus:ring-2 focus:ring-[#2D4530]/20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">WhatsApp de contacto *</label>
                      <input
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        value={reservaForm.phone}
                        onChange={e => setReservaForm(p => ({ ...p, phone: e.target.value }))}
                        placeholder="3516123456"
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none focus:ring-2 focus:ring-[#2D4530]/20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1"><Calendar size={12} className="inline mr-1" />Fecha *</label>
                      <input type="date" value={reservaForm.date} min={new Date().toISOString().split("T")[0]} onChange={e => setReservaForm(p => ({ ...p, date: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none focus:ring-2 focus:ring-[#2D4530]/20" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1"><Clock size={12} className="inline mr-1" />Hora *</label>
                      <input type="time" value={reservaForm.time} onChange={e => setReservaForm(p => ({ ...p, time: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none focus:ring-2 focus:ring-[#2D4530]/20" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1"><Users size={12} className="inline mr-1" />Personas *</label>
                    <select value={reservaForm.people} onChange={e => setReservaForm(p => ({ ...p, people: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none bg-white">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                        <option key={n} value={n}>{n} {n === 1 ? "persona" : "personas"}</option>
                      ))}
                      <option value="más de 10">Más de 10</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Aclaraciones <span className="text-stone-400 font-normal">(opcional)</span></label>
                    <textarea value={reservaForm.notes} onChange={e => setReservaForm(p => ({ ...p, notes: e.target.value }))} placeholder="Ej: ventana, celíaco, silla para bebé..." rows={2} className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none resize-none" />
                  </div>
                  <button
                    onClick={handleEnviarReserva}
                    disabled={!reservaValid}
                    className="w-full py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-white active:scale-95"
                    style={{ background: "#25D366" }}
                  >
                    {WA_SVG} Enviar reserva por WhatsApp
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}