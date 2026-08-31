"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import {
  Phone, MapPin, CreditCard, AtSign, Globe,
  PawPrint, Truck, ShoppingBag, UtensilsCrossed, Star,
  Wifi, Car, ChevronLeft, ChevronRight, Tag, Share2, X, Building2,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { normalizeArgPhone } from "@/lib/phone"
import { normalizeUrl } from "@/lib/normalizeUrl"
import { extractYoutubeId } from "@/lib/utils/youtube"
import AnimateIn from "@/components/ui/AnimateIn"
import BackButton from "@/components/ui/BackButton"

function WaIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

function FbIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M22 12.06C22 6.505 17.523 2 12 2S2 6.505 2 12.06c0 5.02 3.657 9.184 8.438 9.94v-7.03H7.898v-2.91h2.54V9.845c0-2.507 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.878h2.773l-.443 2.91h-2.33V22c4.78-.756 8.437-4.92 8.437-9.94z" />
    </svg>
  )
}

const SECTION_TITLES: Record<string, string> = {
  gastronomy: "Gastronomía", services: "Servicios", health: "Salud",
  education: "Educación", sports: "Deportes", tourism: "Turismo", commerce: "Comercios",
  events: "Eventos", info: "Info útil",
}

const PAYMENT_LABELS: Record<string, string> = {
  efectivo: "Efectivo", debito: "Débito", credito: "Crédito",
  transferencia: "Transferencia", mercadopago: "Mercado Pago", qr: "QR",
}

function FeatureBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: "rgba(45,69,48,0.06)", border: "1px solid rgba(45,69,48,0.09)" }}>
      <span style={{ color: "#2D4530" }}>{icon}</span>
      <span className="text-xs font-semibold" style={{ color: "#2D4530" }}>{label}</span>
    </div>
  )
}

interface Promotion {
  id: string; title: string; description: string | null
  discount_percentage: number | null; discount_label: string | null; valid_until: string | null
}

interface Props { business: any; section: string; promotions?: Promotion[] }

export default function DirectorioDetalle({ business, section, promotions = [] }: Props) {
  const searchParams = useSearchParams()
  const from     = searchParams.get("from")

  const businessPhotoUrls = ((business.business_photos ?? []) as any[])
    .sort((a: any, b: any) => a.sort_order - b.sort_order)
    .map((p: any) => p.url as string)
  // El carrusel combina la tapa (si existe) + todas las fotos cargadas del negocio
  const photos: string[] = [
    ...(business.cover_url ? [business.cover_url] : []),
    ...businessPhotoUrls,
  ]

  const [lightboxIdx,    setLightboxIdx]    = useState<number | null>(null)
  const [lightboxSrc,    setLightboxSrc]    = useState<string | null>(null)
  const [lightboxTouchX, setLightboxTouchX] = useState<number | null>(null)
  const [groupMembers,   setGroupMembers]   = useState<any[]>([])

  useEffect(() => {
    if (!business.group_id) { setGroupMembers([]); return }
    createClient()
      .from("businesses")
      .select("id, name, slug, section, subcategory, logo_url")
      .eq("group_id", business.group_id)
      .neq("id", business.id)
      .then(({ data }) => setGroupMembers(data ?? []))
  }, [business.group_id, business.id])

  useEffect(() => {
    if (lightboxIdx === null && !lightboxSrc) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setLightboxIdx(null); setLightboxSrc(null) } }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [lightboxIdx, lightboxSrc])

  useEffect(() => {
    createClient().rpc("increment_view", { business_id: business.id }).then()
  }, [business.id])

  const recordLead = (type: string) =>
    createClient().from("business_leads").insert({ business_id: business.id, type }).then()

  const waNum  = normalizeArgPhone(business.whatsapp || business.phone || "")
  const waLink = waNum
    ? `https://wa.me/${waNum}?text=${encodeURIComponent(`Hola! Te consulto desde Calamuchita App — ${business.name} 🌿`)}`
    : null

  const todayIdx  = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" })).getDay()

  const instagramHandle = business.instagram?.replace(/^@|https?:\/\/(www\.)?instagram\.com\//g, "").replace(/\/$/, "")
  const facebookUrl     = business.facebook
    ? (/^https?:\/\//.test(business.facebook) ? business.facebook : `https://facebook.com/${business.facebook.replace(/^@/, "")}`)
    : null
  const websiteUrl      = normalizeUrl(business.menu_link || business.website)

  const hasFeatures =
    business.offers_delivery || business.offers_takeaway || business.offers_dine_in ||
    business.accepts_reservations || business.pet_friendly || business.wifi || business.parking

  const backHref  = from === "/destacados" ? "/#destacados" : `/directorio/${section || business?.section || "services"}`
  const backLabel = from === "/destacados" ? "Destacados" : (SECTION_TITLES[section] ?? "Volver")
  const hasBottomActions = waLink || business.phone || business.address || (business.latitude && business.longitude)

  const cardClass = "bg-white rounded-2xl border border-stone-100 p-4"

  const calcIsOpenNow = () => {
    if (!business.business_hours?.length) return null
    const now = new Date()
    const todayIdx = now.getDay()
    const todayHours = business.business_hours.find((h: any) => h.day_of_week === todayIdx)
    if (!todayHours || todayHours.is_closed) return false
    const [openH, openM] = todayHours.opens_at.split(":").map(Number)
    const [closeH, closeM] = todayHours.closes_at.split(":").map(Number)
    const nowMinutes = now.getHours() * 60 + now.getMinutes()
    const openMinutes = openH * 60 + openM
    const closeMinutes = closeH * 60 + closeM
    return nowMinutes >= openMinutes && nowMinutes < closeMinutes
  }
  const isOpenNow = calcIsOpenNow()

  return (
    <div className="relative min-h-screen" style={{ background: "#F0EBE0" }}>

      {/* HEADER verde con todo el contenido adentro — mobile: fila horizontal; oculto en desktop */}
      <div
        className="relative w-full md:hidden"
        style={{
          background: "linear-gradient(135deg, #2D4530 0%, #4A6D4F 100%)",
          minHeight: "160px",
        }}
      >
        {/* Botón volver */}
        <div className="absolute top-4 left-4">
          <BackButton
            fallbackHref={backHref}
            label={backLabel}
            className="text-white text-sm font-semibold px-3 py-2 rounded-full"
            style={{ background: "rgba(0,0,0,0.18)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }}
          />
        </div>

        {/* Logo + info en fila horizontal */}
        <div className="flex items-center gap-4 px-6 pb-8 pt-16 w-full max-w-lg mx-auto">

          {/* Logo cuadrado redondeado */}
          <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-white shrink-0">
            {business.logo_url ? (
              <button onClick={() => setLightboxSrc(business.logo_url)} className="w-full h-full cursor-zoom-in" aria-label="Ampliar logo">
                <Image
                  src={business.logo_url}
                  alt={business.name}
                  fill
                  className="object-contain p-2"
                  sizes="96px"
                  quality={85}
                />
              </button>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-serif"
                style={{ color: "#2D4530" }}>
                {business.name?.[0]}
              </div>
            )}
          </div>

          {/* Texto derecha */}
          <div className="flex flex-col gap-1.5 min-w-0">
            <h1 className="text-white text-xl font-bold leading-tight">
              {business.name}
            </h1>
            {business.subcategory && (
              <p className="text-white/70 text-sm leading-tight">
                {business.subcategory}
              </p>
            )}
            {isOpenNow !== null && (
              <span className={`text-xs font-semibold px-3 py-1 rounded-full self-start ${
                isOpenNow
                  ? "bg-green-400/20 text-green-300 border border-green-400/40"
                  : "bg-white/10 text-white/60 border border-white/20"
              }`}>
                {isOpenNow ? "● Abierto ahora" : "● Cerrado ahora"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Wrapper desktop 2 columnas / mobile 1 columna */}
      <div className="md:flex md:min-h-screen">

        {/* COLUMNA IZQUIERDA — sticky en desktop, normal en mobile */}
        <div className="md:w-80 md:shrink-0 md:sticky md:top-0 md:h-screen md:flex md:flex-col">

          {/* Header verde — desktop: ocupa toda la columna izquierda; oculto en mobile */}
          <div
            className="hidden md:flex relative w-full flex-1 flex-col px-6 py-6 overflow-y-auto"
            style={{ background: "linear-gradient(135deg, #2D4530 0%, #4A6D4F 100%)" }}
          >
            {/* Botón volver — solo en desktop arriba a la izquierda */}
            <div className="absolute top-4 left-4">
              <BackButton fallbackHref={backHref} label={backLabel} className="text-white text-sm font-semibold" />
            </div>

            {/* Logo */}
            <div className="relative w-40 h-40 rounded-2xl overflow-hidden border-4 border-white shadow-xl mb-5 bg-white shrink-0 mt-16">
              {business.logo_url ? (
                <button onClick={() => setLightboxSrc(business.logo_url)} className="w-full h-full cursor-zoom-in" aria-label="Ampliar logo">
                  <Image
                    src={business.logo_url}
                    alt={business.name}
                    fill
                    className="object-contain p-2"
                    sizes="160px"
                    quality={85}
                  />
                </button>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-serif"
                  style={{ color: "#2D4530" }}>
                  {business.name?.[0]}
                </div>
              )}
            </div>

            {/* Nombre */}
            <h1 className="text-white text-xl font-bold text-center leading-tight mb-1">
              {business.name}
            </h1>

            {/* Subcategoría */}
            {business.subcategory && (
              <p className="text-white/70 text-sm text-center mb-2">
                {business.subcategory}
              </p>
            )}

            {/* Badge */}
            {isOpenNow !== null && (
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                isOpenNow
                  ? "bg-green-400/20 text-green-300 border border-green-400/40"
                  : "bg-white/10 text-white/60 border border-white/20"
              }`}>
                {isOpenNow ? "● Abierto ahora" : "● Cerrado ahora"}
              </span>
            )}

            {/* Botones — dentro de la columna izquierda en desktop */}
            {hasBottomActions && (
              <div className="flex flex-col gap-2 w-full mt-6">
                {waLink && (
                  <a href={waLink} target="_blank" rel="noopener noreferrer" onClick={() => recordLead("whatsapp")}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-sm font-semibold text-white hover:brightness-105 active:scale-95 transition-all"
                    style={{ background: "#25D366" }}>
                    <WaIcon size={16} /> WhatsApp
                  </a>
                )}
                {business.phone && (
                  <a href={`tel:${business.phone}`} onClick={() => recordLead("phone")}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-sm font-semibold border-2 bg-white hover:opacity-80 active:scale-95 transition-all"
                    style={{ borderColor: "rgba(255,255,255,0.5)", color: "#2D4530" }}>
                    <Phone size={16} /> Llamar
                  </a>
                )}
                {(business.address || (business.latitude && business.longitude)) && (
                  <a
                    href={
                      business.latitude && business.longitude
                        ? `https://www.google.com/maps/dir/?api=1&destination=${business.latitude},${business.longitude}`
                        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.address)}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-sm font-semibold border-2 bg-white hover:opacity-80 active:scale-95 transition-all"
                    style={{ borderColor: "rgba(255,255,255,0.5)", color: "#2D4530" }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="3 11 22 2 13 21 11 13 3 11"/>
                    </svg>
                    Llegar
                  </a>
                )}
              </div>
            )}

            {/* Horarios — en columna izquierda desktop */}
            {business.business_hours?.length > 0 && (
              <div className="mt-6 w-full">
                <p className="text-white/60 text-xs uppercase tracking-wider mb-3 flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                  Horarios
                </p>
                <div className="space-y-1.5">
                  {[0,1,2,3,4,5,6].map(dayIdx => {
                    const h = business.business_hours.find((x: any) => x.day_of_week === dayIdx)
                    const isToday = dayIdx === todayIdx
                    const dayNames = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"]
                    return (
                      <div key={dayIdx} className={`flex justify-between text-xs ${isToday ? "text-white font-bold" : "text-white/50"}`}>
                        <span>{dayNames[dayIdx]}</span>
                        <span>{!h || h.is_closed ? "Cerrado" : `${h.opens_at?.slice(0,5)} — ${h.closes_at?.slice(0,5)}`}</span>
                      </div>
                    )
                  })}
                </div>
                {(business.has_24h_guard || business.appointment_system) && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    {business.has_24h_guard && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white/80">
                        ✦ Guardia 24 hs
                      </span>
                    )}
                    {business.appointment_system && <p className="text-xs text-white/50 mt-2">{business.appointment_system}</p>}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Botones WhatsApp / Llamar / Llegar — mobile: fila horizontal; oculto en desktop ── */}
          {hasBottomActions && (
            <AnimateIn>
              <div className="flex gap-3 max-w-lg mx-auto px-4 mt-4 md:hidden">
                {waLink && (
                  <a href={waLink} target="_blank" rel="noopener noreferrer" onClick={() => recordLead("whatsapp")}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm text-white shadow-sm hover:brightness-105 active:scale-95 transition-all"
                    style={{ background: "#25D366" }}>
                    <WaIcon size={16} /> WhatsApp
                  </a>
                )}
                {business.phone && (
                  <a href={`tel:${business.phone}`} onClick={() => recordLead("phone")}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm bg-white border-2 shadow-sm hover:opacity-80 active:scale-95 transition-all"
                    style={{ color: "#2D4530", borderColor: "#2D4530" }}>
                    <Phone size={16} /> Llamar
                  </a>
                )}
                {(business.address || (business.latitude && business.longitude)) && (
                  <a
                    href={
                      business.latitude && business.longitude
                        ? `https://www.google.com/maps/dir/?api=1&destination=${business.latitude},${business.longitude}`
                        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.address)}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 flex-1 py-3.5 rounded-2xl text-sm font-semibold border-2 transition-all hover:opacity-80 active:scale-95"
                    style={{ borderColor: "#2D4530", color: "#2D4530", background: "white" }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="3 11 22 2 13 21 11 13 3 11"/>
                    </svg>
                    Llegar
                  </a>
                )}
              </div>
            </AnimateIn>
          )}
        </div>

        {/* COLUMNA DERECHA — scrolleable */}
        <div className="md:flex-1 md:overflow-y-auto">
      <div className="max-w-lg mx-auto px-4 pt-5 pb-12 flex flex-col gap-y-5">

        {/* Fila: Sobre nosotros + Contacto */}
        <AnimateIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">

            {/* Sobre nosotros */}
            {business.description && (
              <div className={`${cardClass} min-h-[200px]`}>
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">Sobre nosotros</p>
                <p className="text-sm text-stone-600 leading-relaxed">{business.description}</p>
              </div>
            )}

            {/* Contacto */}
            {(business.phone || business.whatsapp || instagramHandle || facebookUrl || websiteUrl || business.address) && (
              <div className={`${cardClass} min-h-[200px]`}>
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-3">Contacto</p>
                <div className="space-y-2.5">
                  {business.phone && (
                    <a href={`tel:${business.phone}`} onClick={() => recordLead("phone")} className="flex items-center gap-2 text-sm text-stone-600 hover:text-[#2D4530]">
                      <Phone size={14} />
                      {business.phone}
                    </a>
                  )}
                  {instagramHandle && (
                    <a href={`https://instagram.com/${instagramHandle}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-stone-600 hover:text-[#2D4530]">
                      <AtSign size={14} />
                      @{instagramHandle}
                    </a>
                  )}
                  {facebookUrl && (
                    <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-stone-600 hover:text-[#2D4530]">
                      <FbIcon size={14} />
                      Facebook
                    </a>
                  )}
                  {websiteUrl && (
                    <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-stone-600 hover:text-[#2D4530]">
                      <Globe size={14} />
                      Sitio web
                    </a>
                  )}
                  {business.address && (
                    <div className="flex items-start gap-2 text-sm text-stone-600">
                      <MapPin size={14} className="mt-0.5 shrink-0" />
                      {business.address}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </AnimateIn>

        {/* ═══════════════════════════════════════════════════════════
            CARRUSEL DE FOTOS (cover_url + business_photos)
        ═══════════════════════════════════════════════════════════ */}
        {photos.length > 0 && (
          <AnimateIn>
            <div className="flex flex-col gap-y-3">
              <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: "rgba(45,69,48,0.40)" }}>Fotos</p>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {photos.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setLightboxIdx(i)}
                    className="relative w-48 aspect-square rounded-2xl overflow-hidden shrink-0 bg-stone-100 cursor-zoom-in"
                    aria-label={`Ampliar foto ${i + 1}`}
                  >
                    <Image src={src} alt={`${business.name} — foto ${i + 1} de ${photos.length}`} fill priority={i === 0} className="object-cover" sizes="192px" quality={85} />
                  </button>
                ))}
              </div>
            </div>
          </AnimateIn>
        )}

        {/* ── Servicios (características + formas de pago) ── */}
        {(hasFeatures || business.payment_methods?.length > 0) && (
          <AnimateIn>
            <div className={cardClass}>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-3" style={{ color: "rgba(45,69,48,0.40)" }}>Servicios</p>
              {hasFeatures && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {business.offers_delivery      && <FeatureBadge icon={<Truck size={13} />}           label="Delivery" />}
                  {business.offers_takeaway      && <FeatureBadge icon={<ShoppingBag size={13} />}     label="Take away" />}
                  {business.offers_dine_in       && <FeatureBadge icon={<UtensilsCrossed size={13} />} label="En el lugar" />}
                  {business.accepts_reservations && <FeatureBadge icon={<Star size={13} />}            label="Reservas" />}
                  {business.pet_friendly         && <FeatureBadge icon={<PawPrint size={13} />}        label="Pet friendly" />}
                  {business.wifi                 && <FeatureBadge icon={<Wifi size={13} />}            label="Wi-Fi" />}
                  {business.parking              && <FeatureBadge icon={<Car size={13} />}             label="Estacionamiento" />}
                </div>
              )}
              {business.payment_methods?.length > 0 && (
                <div className={`flex flex-wrap gap-2 ${hasFeatures ? "mt-3 pt-3 border-t border-stone-100" : ""}`}>
                  <span className="w-full flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "rgba(45,69,48,0.40)" }}>
                    <CreditCard size={12} /> Formas de pago
                  </span>
                  {business.payment_methods.map((method: string) => (
                    <span key={method} className="px-3 py-1.5 rounded-xl text-xs font-medium" style={{ background: "rgba(45,69,48,0.07)", color: "#2D4530", border: "1px solid rgba(45,69,48,0.10)" }}>
                      {PAYMENT_LABELS[method] ?? method}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </AnimateIn>
        )}

        {/* ── Forma parte de (grupo profesional) ── */}
        {business.group_name && business.group_id && groupMembers.length > 0 && (
          <AnimateIn>
            <div className={cardClass}>
              <div className="flex items-center gap-2 mb-3">
                <Building2 size={13} style={{ color: "rgba(45,69,48,0.40)" }} />
                <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: "rgba(45,69,48,0.40)" }}>
                  Forma parte de {business.group_name}
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {groupMembers.map((member) => (
                  <a
                    key={member.id}
                    href={`/directorio/${member.section}/${member.slug}`}
                    className="rounded-2xl border border-stone-100 p-3 flex flex-col items-center text-center gap-2 hover:shadow-sm transition-shadow"
                    style={{ background: "#FAFAF9" }}
                  >
                    {member.logo_url ? (
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-white">
                        <Image src={member.logo_url} alt={member.name} fill className="object-contain p-1" sizes="56px" />
                      </div>
                    ) : (
                      <div
                        className="w-14 h-14 rounded-xl shrink-0 flex items-center justify-center font-serif text-xl font-bold"
                        style={{ background: "#2D4530", color: "#E1DBC9" }}
                      >
                        {member.name?.[0] ?? "?"}
                      </div>
                    )}
                    <div className="w-full">
                      <p className="text-xs font-bold leading-snug line-clamp-2" style={{ color: "#2D4530" }}>{member.name}</p>
                      {member.subcategory && <p className="text-[10px] mt-0.5 line-clamp-1" style={{ color: "rgba(45,69,48,0.55)" }}>{member.subcategory}</p>}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </AnimateIn>
        )}

        {/* ── Promociones ── */}
        {promotions.length > 0 && (
          <AnimateIn>
            <div className="flex flex-col gap-3">
              {promotions.map(promo => {
                const badge = promo.discount_label || (promo.discount_percentage ? `${promo.discount_percentage}% OFF` : "PROMO EXCLUSIVA")
                const validDate = promo.valid_until
                  ? new Date(promo.valid_until + "T12:00:00").toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })
                  : null
                const handleShare = async () => {
                  const url  = `${window.location.origin}/directorio/${section}/${business.slug}`
                  const text = `¡Mirá esta promo en Calamuchita App! ${business.name} tiene ${badge}. Entrá acá:`
                  if (navigator.share) { await navigator.share({ title: "Calamuchita App", text, url }).catch(() => {}) }
                  else { await navigator.clipboard.writeText(`${text} ${url}`) }
                }
                return (
                  <div key={promo.id} className="rounded-2xl border border-[#2D4530]/40 overflow-hidden" style={{ background: "#F0F7F0" }}>
                    <div className="px-6 py-4 flex items-center gap-3" style={{ background: "#2D4530" }}>
                      <Tag size={16} className="text-yellow-400 shrink-0" />
                      <span className="font-black text-xl tracking-tight text-yellow-400">{badge}</span>
                      <span className="ml-auto text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(225,219,201,0.70)" }}>Promo activa</span>
                    </div>
                    <div className="px-6 py-5">
                      <h3 className="font-bold text-base mb-2" style={{ color: "#2D4530" }}>{promo.title}</h3>
                      {promo.description && <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "rgba(45,69,48,0.75)" }}>{promo.description}</p>}
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#2D4530]/10">
                        {validDate && <span className="text-xs font-medium" style={{ color: "rgba(45,69,48,0.50)" }}>Válido hasta el <strong style={{ color: "#2D4530" }}>{validDate}</strong></span>}
                        <button onClick={handleShare} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-opacity hover:opacity-70 ml-auto" style={{ background: "rgba(45,69,48,0.08)", color: "#2D4530" }}>
                          <Share2 size={12} /> Compartir
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </AnimateIn>
        )}

        {/* ── Video de YouTube ── */}
        {business.video_url && extractYoutubeId(business.video_url) && (
          <AnimateIn>
            <div className="flex flex-col gap-y-3">
              <div className="flex items-center gap-3">
                <span className="h-px flex-1 bg-stone-200/80" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full shrink-0" style={{ background: "rgba(45,69,48,0.10)", color: "#2D4530" }}>
                  Video
                </span>
                <span className="h-px flex-1 bg-stone-200/80" />
              </div>
              <div className="mx-auto w-full max-w-[360px] aspect-[9/16] rounded-2xl overflow-hidden">
                <iframe
                  src={`https://www.youtube.com/embed/${extractYoutubeId(business.video_url)}?modestbranding=1&rel=0&iv_load_policy=3`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                  title={`Video de ${business.name}`}
                />
              </div>
            </div>
          </AnimateIn>
        )}

      </div>
        </div>

      </div>

      {/* ─── LIGHTBOX galería ───────────────────────────────────────── */}
      <AnimatePresence>
        {lightboxIdx !== null && (
          <motion.div
            className="fixed inset-0 z-[300] flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.95)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setLightboxIdx(null)}
            onTouchStart={e => setLightboxTouchX(e.touches[0].clientX)}
            onTouchEnd={e => {
              if (lightboxTouchX === null || lightboxIdx === null) return
              const diff = lightboxTouchX - e.changedTouches[0].clientX
              if (Math.abs(diff) > 50) {
                const next = diff > 0 ? (lightboxIdx + 1) % photos.length : (lightboxIdx - 1 + photos.length) % photos.length
                setLightboxIdx(next)
              }
              setLightboxTouchX(null)
            }}
          >
            <button onClick={e => { e.stopPropagation(); setLightboxIdx(null) }} aria-label="Cerrar"
              className="absolute top-4 right-4 z-20 w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
              style={{ background: "rgba(0,0,0,0.70)", color: "#fff", border: "1.5px solid rgba(255,255,255,0.30)" }}>
              <X size={24} strokeWidth={2.5} />
            </button>
            {photos.length > 1 && (
              <div className="absolute top-5 left-4 z-20 px-3 py-1 rounded-full text-xs font-bold text-white" style={{ background: "rgba(0,0,0,0.45)" }}>
                {lightboxIdx + 1} / {photos.length}
              </div>
            )}
            <motion.div className="relative" style={{ width: "min(96vw, 900px)", height: "min(82vh, 700px)" }}
              initial={{ scale: 0.88, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.88, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }} onClick={e => e.stopPropagation()}>
              <Image src={photos[lightboxIdx]} alt="Foto ampliada" fill className="object-contain" sizes="96vw" quality={90} />
            </motion.div>
            {photos.length > 1 && (
              <>
                <button onClick={e => { e.stopPropagation(); const next = (lightboxIdx - 1 + photos.length) % photos.length; setLightboxIdx(next) }}
                  aria-label="Foto anterior" className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.20)", color: "#fff" }}><ChevronLeft size={22} /></button>
                <button onClick={e => { e.stopPropagation(); const next = (lightboxIdx + 1) % photos.length; setLightboxIdx(next) }}
                  aria-label="Foto siguiente" className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.20)", color: "#fff" }}><ChevronRight size={22} /></button>
              </>
            )}
            {photos.length > 1 && (
              <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-20">
                {photos.map((_, i) => (
                  <button key={i} onClick={e => { e.stopPropagation(); setLightboxIdx(i) }} aria-label={`Ver foto ${i + 1}`}
                    className="h-1.5 rounded-full transition-all duration-300"
                    style={{ width: i === lightboxIdx ? 20 : 6, background: i === lightboxIdx ? "#fff" : "rgba(255,255,255,0.40)" }} />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── LIGHTBOX logo ──────────────────────────────────────────── */}
      <AnimatePresence>
        {lightboxSrc && (
          <motion.div className="fixed inset-0 z-[300] flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.92)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setLightboxSrc(null)}>
            <motion.div className="relative" style={{ width: "min(80vw, 500px)", height: "min(60vh, 500px)" }}
              initial={{ scale: 0.88, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.88, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }} onClick={e => e.stopPropagation()}>
              <Image src={lightboxSrc} alt="Logo" fill className="object-contain" sizes="80vw" quality={90} />
            </motion.div>
            <button onClick={e => { e.stopPropagation(); setLightboxSrc(null) }} aria-label="Cerrar"
              className="absolute top-4 right-4 z-20 w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
              style={{ background: "rgba(0,0,0,0.70)", color: "#fff", border: "1.5px solid rgba(255,255,255,0.30)" }}>
              <X size={24} strokeWidth={2.5} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
