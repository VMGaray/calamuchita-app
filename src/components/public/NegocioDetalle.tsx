"use client"

import { useEffect, useRef, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Phone, AtSign, MapPin, Clock, Truck, ShoppingBag,
  UtensilsCrossed, ArrowLeft, Calendar, Globe,
  Navigation, ChevronLeft, ChevronRight, X, Users,
} from "lucide-react"
import Image from "next/image"
import CartaInteractiva from "@/components/public/CartaInteractiva"
import { createClient } from "@/lib/supabase/client"
import { normalizeArgPhone } from "@/lib/phone"
import { extractYoutubeId } from "@/lib/utils/youtube"
import PromoCoupon, {
  promoFontVariables,
  sectionToCategoria,
  buildPromoDiscount,
  formatValidUntil,
  type Promo,
} from "@/components/public/PromoCoupon"

const DAY = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
const GUEST_KEY = "calamuchita_app_guest"

interface GuestDetails { name: string; phone: string }
interface ReservaForm extends GuestDetails { date: string; time: string; people: string; notes: string }

const EMPTY_FORM: ReservaForm = { name: "", phone: "", date: "", time: "", people: "2", notes: "" }

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

function InfoRow({ icon, sublabel, label, href, external, onClick }: {
  icon: React.ReactNode; sublabel: string; label: string; href?: string; external?: boolean; onClick?: () => void
}) {
  const inner = (
    <div className="flex items-start gap-3 py-3 border-b border-stone-100 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-stone-50 border border-stone-100 flex items-center justify-center shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-0.5">{sublabel}</p>
        <p className="text-sm font-semibold leading-snug break-words" style={{ color: "#2D4530" }}>{label}</p>
      </div>
    </div>
  )
  if (href) return (
    <a href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined} onClick={onClick} className="block hover:opacity-70 transition-opacity">{inner}</a>
  )
  return inner
}

function calcIsOpenNow(hours: any[]): boolean {
  if (!hours || hours.length === 0) return false
  const arDate = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" }))
  const day = arDate.getDay()
  const hhmm = `${String(arDate.getHours()).padStart(2, "0")}:${String(arDate.getMinutes()).padStart(2, "0")}`
  const todayShifts = hours.filter((h: any) => h.day_of_week === day && !h.is_closed)
  if (todayShifts.length === 0) return false
  return todayShifts.some((h: any) => hhmm >= h.opens_at.slice(0, 5) && hhmm < h.closes_at.slice(0, 5))
}

interface Promotion {
  id: string; title: string; description: string | null
  discount_percentage: number | null; discount_label: string | null; valid_until: string | null
}

interface Props { business: any; promotions?: Promotion[] }

export default function NegocioDetalle({ business, promotions = [] }: Props) {
  const searchParams = useSearchParams()
  const from = searchParams.get("from")
  const cartaRef = useRef<HTMLDivElement>(null)

  const [photoIdx,       setPhotoIdx]       = useState(0)
  const [lightboxIdx,    setLightboxIdx]    = useState<number | null>(null)
  const [lightboxSrc,    setLightboxSrc]    = useState<string | null>(null)
  const [lightboxTouchX, setLightboxTouchX] = useState<number | null>(null)
  const [showReserva,    setShowReserva]    = useState(false)
  const [reservaForm,    setReservaForm]    = useState<ReservaForm>(EMPTY_FORM)

  useEffect(() => {
    if (lightboxIdx === null && !lightboxSrc) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setLightboxIdx(null); setLightboxSrc(null) } }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [lightboxIdx, lightboxSrc])

  useEffect(() => {
    createClient().rpc("increment_view", { business_id: business.id }).then()
    try {
      const stored = localStorage.getItem(GUEST_KEY)
      if (stored) {
        const parsed: Partial<GuestDetails> = JSON.parse(stored)
        setReservaForm(prev => ({ ...prev, name: parsed.name || "", phone: parsed.phone || "" }))
      }
    } catch (e) { console.warn("localStorage no disponible.", e) }
  }, [business.id])

  const recordLead = (type: string) =>
    createClient().from("business_leads").insert({ business_id: business.id, type }).then()

  const waNumber  = normalizeArgPhone(business.whatsapp || business.phone || "")
  const waLink    = waNumber
    ? `https://wa.me/${waNumber}?text=${encodeURIComponent(`Hola! Me contacto desde Calamuchita App por el negocio ${business.name}.`)}`
    : null

  const hasInteractiveCarta = (business.menu_categories?.length ?? 0) > 0
  const hasPdfCarta         = !!business.menu_pdf_url
  const hasLinkCarta        = !hasInteractiveCarta && !hasPdfCarta && !!business.menu_link
  const hasFotosCarta       = !hasInteractiveCarta && !hasPdfCarta && !hasLinkCarta && (business.menu_photos_urls?.length ?? 0) > 0
  const hasMenu             = hasInteractiveCarta || hasPdfCarta || hasLinkCarta || hasFotosCarta
  const todayMenu = business.daily_menus?.find((m: any) => {
    const today = new Date().toISOString().split("T")[0]
    return m.date === today && m.is_published
  })

  const handleVerCarta = () => {
    if (hasInteractiveCarta) {
      cartaRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    } else if (hasPdfCarta) {
      window.open(business.menu_pdf_url, "_blank")
    } else if (hasLinkCarta) {
      window.open(business.menu_link, "_blank")
    } else if (hasFotosCarta) {
      cartaRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }
  const handleHacerPedido = () => {
    if (hasInteractiveCarta) {
      cartaRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    } else if (waNumber) {
      recordLead("whatsapp")
      window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(`Hola ${business.name}! Quiero hacer un pedido. ¿Me compartís el menú disponible? Gracias!`)}`, "_blank")
    }
  }

  const handleEnviarReserva = () => {
    recordLead("reserva")
    try { localStorage.setItem(GUEST_KEY, JSON.stringify({ name: reservaForm.name, phone: reservaForm.phone })) } catch (e) { console.error(e) }
    const fullPhone  = normalizeArgPhone((business.whatsapp || business.phone) || "")
    const numPeople  = parseInt(reservaForm.people, 10)
    const labelPeople = isNaN(numPeople) ? "más de 10" : numPeople === 1 ? "1 persona" : `${numPeople} personas`
    const msg = encodeURIComponent(
      `🌿 ¡Hola *${business.name}*! 👋\nVengo desde *Calamuchita App* para realizar una solicitud:\n\n` +
      `📌 *DETALLES DE LA RESERVA:*\n👤 *Cliente:* ${reservaForm.name.trim()}\n📞 *Teléfono:* ${reservaForm.phone.trim()}\n` +
      `📅 *Fecha:* ${reservaForm.date}\n🕐 *Hora:* ${reservaForm.time} hs\n👥 *Comensales:* ${labelPeople}\n\n` +
      `📝 *Notas adicionales:*\n${reservaForm.notes.trim() || "Ninguna"}\n\n¡Muchas gracias!`
    )
    window.open(`https://wa.me/${fullPhone}?text=${msg}`, "_blank")
    setShowReserva(false)
    setReservaForm(prev => ({ ...prev, date: "", time: "", notes: "" }))
  }

  const reservaValid =
    reservaForm.name.trim().length > 0 &&
    reservaForm.phone.trim().length > 0 &&
    reservaForm.date !== "" &&
    reservaForm.time !== ""

  const mapsLink =
    business.latitude && business.longitude
      ? `https://www.google.com/maps/search/?api=1&query=${business.latitude},${business.longitude}`
      : typeof business.address === "string" && business.address.trim()
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${business.name}, ${business.address}`)}`
      : null

  const photos: string[] =
    Array.isArray(business.business_photos) && business.business_photos.length > 0
      ? business.business_photos.map((p: { url: string }) => p.url)
      : business.cover_url ? [business.cover_url] : []

  const coverUrl     = photos[0] || null
  const prevPhoto    = () => setPhotoIdx(i => (i - 1 + photos.length) % photos.length)
  const nextPhoto    = () => setPhotoIdx(i => (i + 1) % photos.length)
  const CATEGORY_LABELS: Record<string, string> = {
    restaurant: "Restaurante", cafe: "Café", bar: "Bar",
    viandas: "Viandas", panaderia: "Panadería", pasteleria: "Pastelería", sushi: "Sushi",
    comida_para_llevar: "Comida para llevar", pizzeria: "Pizzería", hamburgueseria: "Hamburguesería",
    other: "Gastronomía",
  }
  const categoryLabel = business.subcategory || CATEGORY_LABELS[business.category] || "Gastronomía"
  const isOpen        = calcIsOpenNow(business.business_hours ?? [])

  const todayIdx = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" })).getDay()
  const hoursByDay = new Map<number, any[]>()
  for (const h of [...(business.business_hours ?? [])].sort((a: any, b: any) => a.day_of_week - b.day_of_week)) {
    const arr = hoursByDay.get(h.day_of_week) ?? []; arr.push(h); hoursByDay.set(h.day_of_week, arr)
  }

  const instagramHandle = business.instagram?.replace(/^@|https?:\/\/(www\.)?instagram\.com\//g, "").replace(/\/$/, "")
  const facebookUrl     = business.facebook
    ? (/^https?:\/\//.test(business.facebook) ? business.facebook : `https://facebook.com/${business.facebook.replace(/^@/, "")}`)
    : null
  const backHref  = from === "/destacados" ? "/#destacados" : `/directorio/${business?.section || "services"}`
  const backLabel = from === "/destacados" ? "Destacados" : "Volver"

  const hasBottomActions = waLink || business.phone || mapsLink

  return (
    <div className="relative min-h-screen" style={{ background: "#F0EBE0" }}>

      {/* ═══════════════════════════════════════════════════════════════
          1 — PORTADA FULL-WIDTH
      ═══════════════════════════════════════════════════════════════ */}
      <div
        className="relative w-full h-56 sm:h-72 md:h-auto md:aspect-[5/2] md:max-h-[340px] overflow-hidden"
        style={{ background: "#1a2e1c" }}
      >
        {coverUrl ? (
          <>
            {/* Mobile/tablet angosto (hasta md): recorte cover simple, sin cambios. */}
            <div className="absolute inset-0 z-0 md:hidden">
              <Image
                src={coverUrl} alt={business.name} fill priority
                className="object-cover" sizes="100vw" quality={85}
              />
            </div>

            {/* Desktop (md+): backdrop difuminado + imagen completa contenida.
                Ambas capas van antes que los gradientes/botón en el DOM y con
                z-0 explícito para no taparlos. */}
            <div className="absolute inset-0 z-0 hidden md:block" aria-hidden="true">
              <Image
                src={coverUrl}
                alt=""
                fill
                className="object-cover"
                style={{ transform: "scale(1.15)", filter: "blur(20px) brightness(0.78) saturate(1.1)" }}
                sizes="32px"
                quality={45}
              />
            </div>
            <div className="absolute inset-0 z-0 hidden md:flex items-center justify-center">
              <Image
                src={coverUrl} alt={business.name} fill priority
                className="object-contain" sizes="100vw" quality={85}
              />
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #2D4530 0%, #4A6741 55%, #3D5C3A 100%)" }}>
            {business.logo_url && (
              <div className="relative w-28 h-28 opacity-20">
                <Image src={business.logo_url} alt="" fill className="object-contain" sizes="112px" />
              </div>
            )}
          </div>
        )}
        {/* Gradiente superior para botón volver */}
        <div className="absolute inset-x-0 top-0 h-28 z-10 bg-gradient-to-b from-black/45 to-transparent pointer-events-none" />
        {/* Gradiente inferior para transición suave */}
        <div className="absolute inset-x-0 bottom-0 h-20 z-10 bg-gradient-to-t from-[#F0EBE0] to-transparent pointer-events-none" />

        {/* Botón volver — fondo semitransparente, legible sobre la foto sin taparla */}
        <a
          href={backHref}
          className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold text-white transition-colors hover:bg-black/60 active:opacity-60"
          style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }}
        >
          <ArrowLeft size={15} strokeWidth={2.5} />
          <span>{backLabel}</span>
        </a>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          2 — FLOAT SHEET
      ═══════════════════════════════════════════════════════════════ */}
      <div
        className="-mt-8 rounded-t-[32px] relative z-10 pb-28 md:pb-16"
        style={{ background: "#F0EBE0" }}
      >
        <div className="max-w-2xl mx-auto px-5 pt-6 flex flex-col gap-y-5">

          {/* ── Nombre + logo + badges ── */}
          <div className="flex items-start gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold leading-tight tracking-tight" style={{ color: "#2D4530" }}>
                {business.name}
              </h1>
              <div className="flex items-center gap-2 flex-wrap mt-2.5">
                <span
                  className="text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider"
                  style={{ background: "rgba(45,69,48,0.10)", color: "#2D4530" }}
                >
                  {categoryLabel}
                </span>
                <span
                  className={`text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${
                    isOpen ? "text-green-700 bg-green-50 border border-green-200" : "text-stone-500 bg-stone-100"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full inline-block ${isOpen ? "bg-green-500" : "bg-stone-400"}`} />
                  {isOpen ? "Abierto ahora" : "Cerrado"}
                </span>
              </div>
            </div>
            {business.logo_url && (
              <button
                onClick={() => setLightboxSrc(business.logo_url)}
                className="w-20 h-20 rounded-2xl bg-white border border-stone-100 shadow-sm p-2 shrink-0 relative overflow-hidden cursor-zoom-in hover:ring-2 hover:ring-[#2D4530]/25 transition-all"
                aria-label="Ampliar logo"
              >
                <Image src={business.logo_url} alt={`Logo de ${business.name}`} fill className="object-contain p-1" sizes="80px" quality={85} />
              </button>
            )}
          </div>

          {/* ── Sobre nosotros ── */}
          {business.description && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] mb-2" style={{ color: "rgba(45,69,48,0.42)" }}>
                Sobre nosotros
              </p>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(45,69,48,0.72)" }}>
                {business.description}
              </p>
            </div>
          )}

          {/* ── Desktop: botones de acción ── */}
          <div className="hidden md:flex gap-3">
            {waLink && (
              <a href={waLink} target="_blank" rel="noopener noreferrer" onClick={() => recordLead("whatsapp")}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm text-white shadow-sm hover:brightness-105 transition-all"
                style={{ background: "#25D366" }}>
                <WaIcon size={16} /> WhatsApp
              </a>
            )}
            {mapsLink && (
              <a href={mapsLink} target="_blank" rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm shadow-sm hover:opacity-90 transition-all"
                style={{ background: "#2D4530", color: "#E1DBC9" }}>
                <Navigation size={16} /> Llegar
              </a>
            )}
            {business.phone && (
              <a href={`tel:${business.phone}`} onClick={() => recordLead("phone")}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm bg-white border-2 shadow-sm hover:opacity-80 transition-all"
                style={{ color: "#2D4530", borderColor: "#2D4530" }}>
                <Phone size={16} /> Llamar
              </a>
            )}
          </div>

          {/* ── Datos de contacto ── */}
          <div className="bg-white/50 rounded-2xl px-4 py-1">
            {business.phone      && <InfoRow icon={<Phone size={14} style={{ color: "#2D4530" }} />}  sublabel="Teléfono"   label={business.phone}  onClick={() => recordLead("phone")}                 href={`tel:${business.phone}`} />}
            {business.whatsapp && business.whatsapp !== business.phone && <InfoRow icon={<WaIcon size={14} />} sublabel="WhatsApp" label={business.whatsapp} href={waLink ?? undefined} external />}
            {instagramHandle     && <InfoRow icon={<AtSign size={14} style={{ color: "#2D4530" }} />} sublabel="Instagram"  label={`@${instagramHandle}`}                            href={`https://instagram.com/${instagramHandle}`} external />}
            {facebookUrl         && <InfoRow icon={<FbIcon size={14} />}                              sublabel="Facebook"   label={facebookUrl.replace(/^https?:\/\//, "")}           href={facebookUrl} external />}
            {business.website    && <InfoRow icon={<Globe size={14} style={{ color: "#2D4530" }} />}  sublabel="Web"        label={business.website.replace(/^https?:\/\//, "")}     href={business.website} external />}
            {business.address    && <InfoRow icon={<MapPin size={14} style={{ color: "#2D4530" }} />} sublabel="Dirección"  label={business.address} />}
          </div>

          {/* ── Horarios ── */}
          {hoursByDay.size > 0 && (
            <div className="bg-white/50 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock size={13} style={{ color: "rgba(45,69,48,0.40)" }} />
                <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: "rgba(45,69,48,0.40)" }}>
                  Horarios
                </p>
              </div>
              <div className="space-y-0">
                {Array.from(hoursByDay.entries()).map(([day, rows]) => {
                  const isToday = day === todayIdx
                  const first   = rows[0]
                  const timeStr = first.is_closed
                    ? "Cerrado"
                    : rows.length > 1
                    ? rows.map((r: any) => `${r.opens_at.slice(0, 5)}–${r.closes_at.slice(0, 5)}`).join(" · ")
                    : `${first.opens_at.slice(0, 5)} — ${first.closes_at.slice(0, 5)}`
                  return (
                    <div key={day} className="flex justify-between items-center py-1.5 border-b border-stone-100 last:border-0 text-sm gap-3">
                      <span className="shrink-0" style={{ color: isToday ? "#2D4530" : "rgba(45,69,48,0.50)", fontWeight: isToday ? 700 : 500 }}>
                        {DAY[day]}
                      </span>
                      <span className="text-right" style={{ color: first.is_closed ? "#C4B9A8" : "#2D4530", fontWeight: isToday ? 700 : 600 }}>
                        {timeStr}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── Promociones ── */}
          {promotions.length > 0 && (
            <div className={`${promoFontVariables} flex flex-col gap-4`}>
              {promotions.map(promo => {
                const { descuento_valor, descuento_label } = buildPromoDiscount(
                  promo.discount_percentage,
                  promo.discount_label
                )
                const promoCoupon: Promo = {
                  id: promo.id,
                  comercio: business.name,
                  categoria: sectionToCategoria(business.section),
                  logo_url: business.logo_url ?? null,
                  descuento_valor,
                  descuento_label,
                  validez: formatValidUntil(promo.valid_until),
                  // Sin link: ya estamos en la página de este negocio, PromoCoupon
                  // oculta el "Ver promo →" cuando promo.link es null.
                  link: null,
                }
                return <PromoCoupon key={promo.id} promo={promoCoupon} />
              })}
            </div>
          )}

          {/* ── Características de servicio (delivery / salón / take away) ── */}
          {(business.offers_delivery || business.offers_takeaway || business.offers_dine_in) && (
            <div className="bg-white/50 rounded-2xl p-4 flex flex-wrap gap-2">
              {business.offers_dine_in  && <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold" style={{ background: "rgba(45,69,48,0.07)", color: "#2D4530" }}><UtensilsCrossed size={13} /> Salón</div>}
              {business.offers_delivery && <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold" style={{ background: "rgba(45,69,48,0.07)", color: "#2D4530" }}><Truck size={13} /> Delivery</div>}
              {business.offers_takeaway && <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold" style={{ background: "rgba(45,69,48,0.07)", color: "#2D4530" }}><ShoppingBag size={13} /> Take away</div>}
            </div>
          )}

          {/* ── Botones gastronómicos ── */}
          {business.section === "gastronomy" && (
            <div className="flex flex-wrap gap-3">
              <button onClick={handleVerCarta} disabled={!hasMenu}
                className="flex-1 min-w-[110px] flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm shadow-sm transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: "#2D4530", color: "#E1DBC9" }}>
                <UtensilsCrossed size={16} /> Ver Carta
              </button>
              {business.has_table_service && (
                <button onClick={() => setShowReserva(true)} disabled={!waNumber}
                  className="flex-1 min-w-[110px] flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm shadow-sm transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: "#2D4530", color: "#E1DBC9" }}>
                  <Calendar size={16} /> Reservar
                </button>
              )}
              <button onClick={handleHacerPedido} disabled={!hasMenu && !waNumber}
                className="flex-1 min-w-[110px] flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm shadow-sm transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: "#2D4530", color: "#E1DBC9" }}>
                <ShoppingBag size={16} /> Hacer Pedido
              </button>
            </div>
          )}

          {/* ── Menú del día ── */}
          {todayMenu && todayMenu.daily_menu_items?.length > 0 && (
            <div className="bg-white/50 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <UtensilsCrossed size={16} style={{ color: "#2D4530" }} />
                <h2 className="font-bold text-base" style={{ color: "#2D4530" }}>Menú del día</h2>
              </div>
              <div>
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

          {/* ═══════════════════════════════════════════════════════════
              5 — CARRUSEL DE FOTOS
          ═══════════════════════════════════════════════════════════ */}
          {photos.length > 0 && (
            <div className="flex flex-col gap-y-3">
              <div className="flex items-center gap-3">
                <span className="h-px flex-1 bg-stone-200/80" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full shrink-0" style={{ background: "rgba(45,69,48,0.10)", color: "#2D4530" }}>
                  {categoryLabel}
                </span>
                <span className="h-px flex-1 bg-stone-200/80" />
              </div>

              <div className="flex items-center gap-2">
                {photos.length > 1 && (
                  <button onClick={prevPhoto} aria-label="Foto anterior" className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 border-[#2D4530] text-[#2D4530] hover:bg-[#2D4530] hover:text-[#E1DBC9] transition-all active:scale-90">
                    <ChevronLeft size={18} />
                  </button>
                )}
                <button
                  onClick={() => setLightboxIdx(photoIdx)}
                  className="flex-1 aspect-[4/3] sm:aspect-video rounded-2xl overflow-hidden relative bg-stone-100 cursor-zoom-in"
                  aria-label="Ampliar foto"
                >
                  <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-stone-100 via-stone-50 to-stone-100" />
                  <Image src={photos[photoIdx]} alt={`${business.name} — foto ${photoIdx + 1}`} fill priority={photoIdx === 0} className="object-contain" sizes="(max-width: 640px) calc(100vw - 40px), 640px" quality={85} />
                </button>
                {photos.length > 1 && (
                  <button onClick={nextPhoto} aria-label="Foto siguiente" className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 border-[#2D4530] text-[#2D4530] hover:bg-[#2D4530] hover:text-[#E1DBC9] transition-all active:scale-90">
                    <ChevronRight size={18} />
                  </button>
                )}
              </div>

              {photos.length > 1 && (
                <div className="flex items-center justify-center gap-2 h-4">
                  {photos.map((_, i) => (
                    <button key={i} onClick={() => setPhotoIdx(i)} className="h-1.5 rounded-full transition-all duration-300"
                      style={{ width: i === photoIdx ? 20 : 6, background: i === photoIdx ? "#2D4530" : "rgba(45,69,48,0.22)" }} />
                  ))}
                </div>
              )}
              {business.gallery_caption && (
                <p className="text-center text-xs text-stone-400 font-medium">{business.gallery_caption}</p>
              )}
            </div>
          )}

          {/* ── Video de YouTube ── */}
          {business.video_url && extractYoutubeId(business.video_url) && (
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
          )}

          {/* Carta interactiva */}
          {hasInteractiveCarta && (
            <div ref={cartaRef}>
              <CartaInteractiva categories={business.menu_categories} business={business} />
            </div>
          )}

          {/* Carta en PDF */}
          {hasPdfCarta && !hasInteractiveCarta && (
            <div ref={cartaRef} className="bg-white rounded-2xl border border-stone-200 p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-4" style={{ color: "rgba(45,69,48,0.42)" }}>Carta</p>
              <a
                href={business.menu_pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-xl border border-stone-100 hover:border-[#2D4530]/30 transition-all"
                style={{ background: "rgba(45,69,48,0.03)" }}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#2D4530" }}>
                  <span className="text-xs font-black text-white">PDF</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: "#2D4530" }}>Ver carta completa</p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(45,69,48,0.50)" }}>Se abre en una nueva pestaña</p>
                </div>
                <span style={{ color: "#2D4530", opacity: 0.5 }}>↗</span>
              </a>
            </div>
          )}

          {/* Carta por link externo */}
          {hasLinkCarta && (
            <div ref={cartaRef} className="bg-white rounded-2xl border border-stone-200 p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-4" style={{ color: "rgba(45,69,48,0.42)" }}>Carta</p>
              <a
                href={business.menu_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-xl border border-stone-100 hover:border-[#2D4530]/30 transition-all"
                style={{ background: "rgba(45,69,48,0.03)" }}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#2D4530" }}>
                  <span className="text-xs font-black text-white">🔗</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: "#2D4530" }}>Ver carta completa</p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(45,69,48,0.50)" }}>Se abre en una nueva pestaña</p>
                </div>
                <span style={{ color: "#2D4530", opacity: 0.5 }}>↗</span>
              </a>
            </div>
          )}

          {/* Carta en fotos */}
          {hasFotosCarta && (
            <div ref={cartaRef} className="bg-white rounded-2xl border border-stone-200 p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-4" style={{ color: "rgba(45,69,48,0.42)" }}>Carta</p>
              <div className="grid grid-cols-2 gap-3">
                {business.menu_photos_urls.map((url: string, i: number) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative aspect-[3/4] rounded-xl overflow-hidden border border-stone-100 block"
                  >
                    <Image
                      src={url}
                      alt={`Carta de ${business.name} ${i + 1}`}
                      fill
                      className="object-cover"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          6 — BOTONERA FIJA MOBILE
      ═══════════════════════════════════════════════════════════════ */}
      {hasBottomActions && (
        <div
          className="md:hidden fixed bottom-0 left-0 right-0 z-[60] flex gap-2 px-4 pt-3 pb-6"
          style={{
            background: "rgba(255,255,255,0.88)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            borderTop: "1px solid rgba(45,69,48,0.09)",
          }}
        >
          {waLink && (
            <a href={waLink} target="_blank" rel="noopener noreferrer" onClick={() => recordLead("whatsapp")}
              className="flex-1 flex items-center justify-center gap-1.5 py-3.5 rounded-2xl text-xs font-bold text-white shadow-sm active:scale-95 transition-transform"
              style={{ background: "#25D366" }}>
              <WaIcon size={15} /> WhatsApp
            </a>
          )}
          {business.phone && (
            <a href={`tel:${business.phone}`}
              className="flex-1 flex items-center justify-center gap-1.5 py-3.5 rounded-2xl text-xs font-bold border-2 bg-white active:scale-95 transition-transform"
              style={{ color: "#2D4530", borderColor: "#2D4530" }}>
              <Phone size={15} /> Llamar
            </a>
          )}
          {mapsLink && (
            <a href={mapsLink} target="_blank" rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-3.5 rounded-2xl text-xs font-bold shadow-sm active:scale-95 transition-transform"
              style={{ background: "#2D4530", color: "#E1DBC9" }}>
              <Navigation size={15} /> Llegar
            </a>
          )}
        </div>
      )}

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
                setLightboxIdx(next); setPhotoIdx(next)
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
                <button onClick={e => { e.stopPropagation(); const next = (lightboxIdx - 1 + photos.length) % photos.length; setLightboxIdx(next); setPhotoIdx(next) }}
                  aria-label="Foto anterior" className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.20)", color: "#fff" }}><ChevronLeft size={22} /></button>
                <button onClick={e => { e.stopPropagation(); const next = (lightboxIdx + 1) % photos.length; setLightboxIdx(next); setPhotoIdx(next) }}
                  aria-label="Foto siguiente" className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.20)", color: "#fff" }}><ChevronRight size={22} /></button>
              </>
            )}
            {photos.length > 1 && (
              <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-20">
                {photos.map((_, i) => (
                  <button key={i} onClick={e => { e.stopPropagation(); setLightboxIdx(i); setPhotoIdx(i) }} aria-label={`Ver foto ${i + 1}`}
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

      {/* ─── MODAL RESERVAS ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showReserva && (
          <>
            <motion.div className="fixed inset-0 bg-black/40 z-[200]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowReserva(false)} />
            <motion.div className="fixed inset-x-4 bottom-4 top-4 z-[210] max-w-md mx-auto overflow-y-auto"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
              <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">
                <div className="px-6 py-4 flex items-center justify-between" style={{ background: "#2D4530" }}>
                  <h2 className="font-bold text-lg" style={{ color: "#E1DBC9" }}>Reservar mesa</h2>
                  <button onClick={() => setShowReserva(false)} className="text-stone-300 hover:text-white"><X size={22} /></button>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Tu nombre *</label>
                      <input type="text" value={reservaForm.name} onChange={e => setReservaForm(p => ({ ...p, name: e.target.value }))} placeholder="María García" className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none focus:ring-2 focus:ring-[#2D4530]/20" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">WhatsApp *</label>
                      <input type="tel" inputMode="tel" autoComplete="tel" value={reservaForm.phone} onChange={e => setReservaForm(p => ({ ...p, phone: e.target.value }))} placeholder="3516123456" className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none focus:ring-2 focus:ring-[#2D4530]/20" />
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
                      {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n} {n === 1 ? "persona" : "personas"}</option>)}
                      <option value="más de 10">Más de 10</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Aclaraciones <span className="text-stone-400 font-normal">(opcional)</span></label>
                    <textarea value={reservaForm.notes} onChange={e => setReservaForm(p => ({ ...p, notes: e.target.value }))} placeholder="Ej: ventana, celíaco, silla para bebé..." rows={2} className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none resize-none" />
                  </div>
                  <button onClick={handleEnviarReserva} disabled={!reservaValid}
                    className="w-full py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-white active:scale-95"
                    style={{ background: "#25D366" }}>
                    <WaIcon size={16} /> Enviar reserva por WhatsApp
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
