"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import {
  Phone, AtSign, MapPin, Clock, ArrowLeft, Globe, CreditCard,
  PawPrint, Truck, ShoppingBag, UtensilsCrossed, Star, Navigation,
  Wifi, Car, ChevronLeft, ChevronRight, Tag, Share2, X, Building2,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { normalizeArgPhone } from "@/lib/phone"

function WaIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

const DAY_SHORT = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

const SECTION_TITLES: Record<string, string> = {
  gastronomy: "Gastronomía", services: "Servicios", health: "Salud",
  education: "Educación", tourism: "Turismo", commerce: "Comercios",
  events: "Eventos", info: "Info útil",
}

const PAYMENT_LABELS: Record<string, string> = {
  efectivo: "Efectivo", debito: "Débito", credito: "Crédito",
  transferencia: "Transferencia", mercadopago: "Mercado Pago", qr: "QR",
}

function InfoRow({ icon, sublabel, label, href, external }: {
  icon: React.ReactNode; sublabel: string; label: string; href?: string; external?: boolean
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
    <a href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined} className="block hover:opacity-70 transition-opacity">{inner}</a>
  )
  return inner
}

function FeatureBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: "rgba(45,69,48,0.06)", border: "1px solid rgba(45,69,48,0.09)" }}>
      <span style={{ color: "#2D4530" }}>{icon}</span>
      <span className="text-xs font-semibold" style={{ color: "#2D4530" }}>{label}</span>
    </div>
  )
}

function calcIsOpenNow(hours: any[]): boolean {
  if (!hours || hours.length === 0) return false
  const arDate = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" }))
  const day  = arDate.getDay()
  const hhmm = `${String(arDate.getHours()).padStart(2, "0")}:${String(arDate.getMinutes()).padStart(2, "0")}`
  const todayRows = hours.filter((h: any) => h.day_of_week === day && !h.is_closed)
  if (todayRows.length === 0) return false
  return todayRows.some((h: any) => hhmm >= h.opens_at.slice(0, 5) && hhmm < h.closes_at.slice(0, 5))
}

interface Promotion {
  id: string; title: string; description: string | null
  discount_percentage: number | null; discount_label: string | null; valid_until: string | null
}

interface Props { business: any; section: string; promotions?: Promotion[] }

export default function DirectorioDetalle({ business, section, promotions = [] }: Props) {
  const searchParams = useSearchParams()
  const from     = searchParams.get("from")
  const profName = searchParams.get("prof")

  // Si se navegó desde una card de profesional individual, encontrar sus datos
  const matchedPro = profName && Array.isArray(business.professionals)
    ? (business.professionals as any[]).find(
        p => p.name?.toLowerCase().trim() === decodeURIComponent(profName).toLowerCase().trim()
      ) ?? null
    : null

  const rawPhotos = ((business.business_photos ?? []) as any[])
    .sort((a: any, b: any) => a.sort_order - b.sort_order)
    .slice(0, 3)
    .map((p: any) => p.url as string)
  const photos: string[] = rawPhotos.length > 0
    ? rawPhotos
    : business.cover_url ? [business.cover_url] : []

  const [photoIdx,       setPhotoIdx]       = useState(0)
  const [lightboxIdx,    setLightboxIdx]    = useState<number | null>(null)
  const [lightboxSrc,    setLightboxSrc]    = useState<string | null>(null)
  const [lightboxTouchX, setLightboxTouchX] = useState<number | null>(null)

  useEffect(() => {
    if (lightboxIdx === null && !lightboxSrc) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setLightboxIdx(null); setLightboxSrc(null) } }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [lightboxIdx, lightboxSrc])

  useEffect(() => {
    createClient().rpc("increment_view", { business_id: business.id }).then()
  }, [business.id])

  const waNum  = normalizeArgPhone(business.whatsapp || business.phone || "")
  const waLink = waNum
    ? `https://wa.me/${waNum}?text=${encodeURIComponent(`Hola! Te consulto desde Calamuchita App — ${business.name} 🌿`)}`
    : null

  const mapsLink =
    business.latitude && business.longitude
      ? `https://www.google.com/maps/search/?api=1&query=${business.latitude},${business.longitude}`
      : typeof business.address === "string" && business.address.trim()
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${business.name} ${business.address.trim()}`)}`
      : null

  const todayIdx  = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" })).getDay()
  const todayRows = (business.business_hours ?? []).filter((h: any) => h.day_of_week === todayIdx)
  const todayIsClosed = todayRows.length > 0 && todayRows.every((h: any) => h.is_closed)
  const isOpenNow     = calcIsOpenNow(business.business_hours ?? [])
  const hasHoursData  = todayRows.length > 0

  const instagramHandle = business.instagram?.replace(/^@|https?:\/\/(www\.)?instagram\.com\//g, "").replace(/\/$/, "")
  const websiteUrl      = business.menu_link || business.website
  const categoryLabel   = business.subcategory || business.category || SECTION_TITLES[section] || "Comercio"
  const branches: any[] = Array.isArray(business.branches) ? business.branches : []

  const hasFeatures =
    business.offers_delivery || business.offers_takeaway || business.offers_dine_in ||
    business.accepts_reservations || business.pet_friendly || business.wifi || business.parking

  const sortedHours = [...(business.business_hours ?? [])].sort((a: any, b: any) => a.day_of_week - b.day_of_week)
  const byDay = new Map<number, any[]>()
  for (const h of sortedHours) {
    const arr = byDay.get(h.day_of_week) ?? []; arr.push(h); byDay.set(h.day_of_week, arr)
  }

  const coverUrl     = photos[0] || null
  const prevPhoto    = () => setPhotoIdx(i => (i - 1 + photos.length) % photos.length)
  const nextPhoto    = () => setPhotoIdx(i => (i + 1) % photos.length)

  const backHref  = from === "/destacados" ? "/#destacados" : `/directorio/${section || business?.section || "services"}`
  const backLabel = from === "/destacados" ? "Destacados" : (SECTION_TITLES[section] ?? "Volver")
  const hasBottomActions = waLink || business.phone || mapsLink

  return (
    <div className="relative min-h-screen" style={{ background: "#F0EBE0" }}>

      {/* ═══════════════════════════════════════════════════════════════
          1 — PORTADA FULL-WIDTH
      ═══════════════════════════════════════════════════════════════ */}
      <div className="relative w-full h-64 sm:h-72 overflow-hidden" style={{ background: "#1a2e1c" }}>
        {coverUrl ? (
          <Image src={coverUrl} alt={business.name} fill priority className="object-contain" sizes="100vw" quality={85} />
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
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/45 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#F0EBE0] to-transparent pointer-events-none" />

        {/* Botón volver */}
        <a
          href={backHref}
          className="absolute top-20 left-4 z-10 flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-80 active:opacity-60"
          style={{ background: "rgba(0,0,0,0.28)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
        >
          <ArrowLeft size={15} strokeWidth={2.5} />
          <span>{backLabel}</span>
        </a>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          2 — FLOAT SHEET
      ═══════════════════════════════════════════════════════════════ */}
      <div className="-mt-8 rounded-t-[32px] relative z-10 pb-12" style={{ background: "#F0EBE0" }}>
        <div className="max-w-2xl mx-auto px-5 pt-6 flex flex-col gap-y-5">

          {/* ── Perfil del profesional ──────────────────────────────────────────
              Se muestra cuando el usuario llegó desde una card de profesional
              en el directorio (?prof=Nombre). Aparece antes que el info del centro
              para que el perfil sea el contenido primario de la pantalla.       */}
          {matchedPro && (
            <>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100">
                <div className="flex items-start gap-4 mb-4">
                  {/* Foto o inicial */}
                  {matchedPro.photo_url ? (
                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-stone-100">
                      <Image
                        src={matchedPro.photo_url}
                        alt={matchedPro.name}
                        fill
                        className="object-cover object-top"
                        sizes="80px"
                        quality={85}
                      />
                    </div>
                  ) : (
                    <div
                      className="w-20 h-20 rounded-2xl flex-shrink-0 flex items-center justify-center font-serif text-3xl font-bold"
                      style={{ background: "#2D4530", color: "#E1DBC9" }}
                    >
                      {matchedPro.name?.[0] ?? "?"}
                    </div>
                  )}

                  {/* Nombre + especialidad */}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold leading-snug" style={{ color: "#2D4530" }}>
                      {matchedPro.name}
                    </h2>
                    {(matchedPro.specialty || matchedPro.specialty_group) && (
                      <span
                        className="inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full mt-1.5"
                        style={{ background: "rgba(45,69,48,0.10)", color: "#2D4530" }}
                      >
                        {matchedPro.specialty || matchedPro.specialty_group}
                      </span>
                    )}
                    <div className="flex items-center gap-1.5 mt-2.5">
                      <Building2 size={11} style={{ color: "rgba(45,69,48,0.45)" }} />
                      <span className="text-xs font-medium" style={{ color: "rgba(45,69,48,0.55)" }}>
                        Atiende en {business.name}
                      </span>
                    </div>
                  </div>
                </div>

                {matchedPro.description && (
                  <p className="text-sm leading-relaxed mb-3" style={{ color: "rgba(45,69,48,0.70)" }}>
                    {matchedPro.description}
                  </p>
                )}
                {matchedPro.schedule && (
                  <p className="text-xs mb-4" style={{ color: "rgba(45,69,48,0.50)" }}>
                    🕐 {matchedPro.schedule}
                  </p>
                )}

                {/* Botón de contacto del profesional */}
                {(() => {
                  const isPhone = matchedPro.contact && !matchedPro.contact.startsWith("http")
                  const waUrl = isPhone
                    ? `https://wa.me/${normalizeArgPhone(matchedPro.contact)}?text=${encodeURIComponent(
                        `Hola! Vi el perfil de ${matchedPro.name} en ${business.name} (Calamuchita App) y quería consultar sobre un turno.`
                      )}`
                    : null
                  if (waUrl) return (
                    <a href={waUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-sm font-bold text-white transition-opacity hover:opacity-90"
                      style={{ background: "#25D366" }}>
                      <WaIcon size={14} /> Consultar turno por WhatsApp
                    </a>
                  )
                  if (matchedPro.contact?.startsWith("http")) return (
                    <a href={matchedPro.contact} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-sm font-bold transition-opacity hover:opacity-80"
                      style={{ background: "rgba(45,69,48,0.08)", color: "#2D4530" }}>
                      📅 Sacar turno online
                    </a>
                  )
                  return null
                })()}
              </div>

              {/* Separador visual antes de la info del centro */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px" style={{ background: "rgba(45,69,48,0.12)" }} />
                <p className="text-[10px] font-black uppercase tracking-[0.22em]" style={{ color: "rgba(45,69,48,0.35)" }}>
                  Centro de atención
                </p>
                <div className="flex-1 h-px" style={{ background: "rgba(45,69,48,0.12)" }} />
              </div>
            </>
          )}

          {/* ── Nombre + logo + badges ── */}
          <div className="flex items-start gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold leading-tight tracking-tight" style={{ color: "#2D4530" }}>
                {business.name}
              </h1>
              <div className="flex items-center gap-2 flex-wrap mt-2.5">
                <span className="text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider" style={{ background: "rgba(45,69,48,0.10)", color: "#2D4530" }}>
                  {categoryLabel}
                </span>
                {hasHoursData && (
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${
                    isOpenNow ? "text-green-700 bg-green-50 border border-green-200"
                    : todayIsClosed ? "text-stone-500 bg-stone-100"
                    : "text-red-600 bg-red-50 border border-red-200"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full inline-block ${isOpenNow ? "bg-green-500" : todayIsClosed ? "bg-stone-400" : "bg-red-500"}`} />
                    {todayIsClosed ? "Cerrado hoy" : isOpenNow ? "Abierto ahora" : "Cerrado ahora"}
                  </span>
                )}
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
              <a href={waLink} target="_blank" rel="noopener noreferrer"
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
              <a href={`tel:${business.phone}`}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm bg-white border-2 shadow-sm hover:opacity-80 transition-all"
                style={{ color: "#2D4530", borderColor: "#2D4530" }}>
                <Phone size={16} /> Llamar
              </a>
            )}
          </div>

          {/* ── Datos de contacto ── */}
          <div className="bg-white/50 rounded-2xl px-4 py-1">
            {business.phone      && <InfoRow icon={<Phone size={14} style={{ color: "#2D4530" }} />}  sublabel="Teléfono"   label={business.phone}                                   href={`tel:${business.phone}`} />}
            {instagramHandle     && <InfoRow icon={<AtSign size={14} style={{ color: "#2D4530" }} />} sublabel="Instagram"  label={`@${instagramHandle}`}                            href={`https://instagram.com/${instagramHandle}`} external />}
            {websiteUrl          && <InfoRow icon={<Globe size={14} style={{ color: "#2D4530" }} />}  sublabel="Sitio web"  label={websiteUrl.replace(/^https?:\/\//, "")}            href={websiteUrl} external />}
            {business.address    && <InfoRow icon={<MapPin size={14} style={{ color: "#2D4530" }} />} sublabel="Dirección"  label={business.address} />}
            {branches.map((branch: any, i: number) => (
              <InfoRow key={i}
                icon={<MapPin size={14} style={{ color: "#2D4530", opacity: 0.5 }} />}
                sublabel={`Sucursal${branches.length > 1 ? ` ${i + 1}` : ""}`}
                label={branch.pueblo ? `${branch.pueblo}${branch.address ? ` — ${branch.address}` : ""}` : branch.address ?? ""}
              />
            ))}
          </div>

          {/* ── Horarios ── */}
          {byDay.size > 0 && (
            <div className="bg-white/50 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock size={13} style={{ color: "rgba(45,69,48,0.40)" }} />
                <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: "rgba(45,69,48,0.40)" }}>Horarios</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                {Array.from(byDay.entries()).map(([day, rows]) => {
                  const isToday = day === todayIdx
                  const first   = rows[0]
                  const second  = rows[1]
                  const timeStr = first.is_closed
                    ? "Cerrado"
                    : second
                    ? `${first.opens_at.slice(0, 5)}–${first.closes_at.slice(0, 5)} · ${second.opens_at.slice(0, 5)}–${second.closes_at.slice(0, 5)}`
                    : `${first.opens_at.slice(0, 5)} — ${first.closes_at.slice(0, 5)}`
                  return (
                    <div key={day} className="flex justify-between items-center py-1.5 border-b border-stone-50 last:border-0 text-sm">
                      <span className="font-medium" style={{ color: isToday ? "#2D4530" : "rgba(45,69,48,0.45)", fontWeight: isToday ? 700 : 400 }}>
                        {DAY_SHORT[day]}
                      </span>
                      <span style={{ color: isToday ? "#2D4530" : first.is_closed ? "#C4B9A8" : "rgba(45,69,48,0.60)", fontWeight: isToday ? 700 : 400 }}>
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
                  <div key={promo.id} className="rounded-3xl border border-[#2D4530]/40 overflow-hidden" style={{ background: "#F0F7F0" }}>
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
          )}

          {/* ── Características ── */}
          {hasFeatures && (
            <div className="bg-white/50 rounded-2xl p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-3" style={{ color: "rgba(45,69,48,0.40)" }}>Características</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {business.offers_delivery      && <FeatureBadge icon={<Truck size={13} />}           label="Delivery" />}
                {business.offers_takeaway      && <FeatureBadge icon={<ShoppingBag size={13} />}     label="Take away" />}
                {business.offers_dine_in       && <FeatureBadge icon={<UtensilsCrossed size={13} />} label="En el lugar" />}
                {business.accepts_reservations && <FeatureBadge icon={<Star size={13} />}            label="Reservas" />}
                {business.pet_friendly         && <FeatureBadge icon={<PawPrint size={13} />}        label="Pet friendly" />}
                {business.wifi                 && <FeatureBadge icon={<Wifi size={13} />}            label="Wi-Fi" />}
                {business.parking              && <FeatureBadge icon={<Car size={13} />}             label="Estacionamiento" />}
              </div>
            </div>
          )}

          {/* ── Formas de pago ── */}
          {business.payment_methods?.length > 0 && (
            <div className="bg-white/50 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <CreditCard size={13} style={{ color: "rgba(45,69,48,0.40)" }} />
                <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: "rgba(45,69,48,0.40)" }}>Formas de pago</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {business.payment_methods.map((method: string) => (
                  <span key={method} className="px-3 py-1.5 rounded-xl text-xs font-medium" style={{ background: "rgba(45,69,48,0.07)", color: "#2D4530", border: "1px solid rgba(45,69,48,0.10)" }}>
                    {PAYMENT_LABELS[method] ?? method}
                  </span>
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
                  className="flex-1 aspect-[4/3] sm:aspect-video rounded-2xl overflow-hidden relative bg-white cursor-zoom-in"
                  aria-label="Ampliar foto"
                >
                  <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-stone-100 via-stone-50 to-stone-100" />
                  <Image src={photos[photoIdx]} alt={`${business.name} — foto ${photoIdx + 1} de ${photos.length}`} fill priority={photoIdx === 0} className="object-contain" sizes="(max-width: 640px) calc(100vw - 40px), 640px" quality={85} />
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
              <p className="text-center text-xs text-stone-400 font-medium leading-snug">{business.name}{business.address ? ` · ${business.address}` : ""}</p>
            </div>
          )}

          {/* ── Profesionales ── */}
          {Array.isArray(business.professionals) && business.professionals.length > 0 && (() => {
            const groups = business.professionals.reduce((acc: Record<string, any[]>, pro: any) => {
              const key = pro.specialty_group || "Otros"
              if (!acc[key]) acc[key] = []
              acc[key].push(pro)
              return acc
            }, {})
            return (
              <div className="bg-white/50 rounded-2xl p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-3" style={{ color: "rgba(45,69,48,0.40)" }}>Profesionales</p>
                {business.has_24h_guard && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-3" style={{ background: "rgba(45,69,48,0.08)", color: "#2D4530" }}>
                    ✦ Guardia 24 hs
                  </span>
                )}
                {business.appointment_system && <p className="text-xs text-stone-500 mb-4">{business.appointment_system}</p>}
                <div className="space-y-5">
                  {Object.entries(groups).map(([group, members]) => (
                    <div key={group}>
                      <p className="text-[10px] font-black uppercase tracking-[0.15em] mb-3 pb-1.5 border-b border-stone-100" style={{ color: "#2D4530" }}>{group}</p>
                      <div className="grid grid-cols-2 gap-3">
                        {(members as any[]).map((pro: any, i: number) => {
                          const isPhone = pro.contact && !pro.contact.startsWith("http")
                          const waUrl = isPhone
                            ? `https://wa.me/${normalizeArgPhone(pro.contact)}?text=${encodeURIComponent(`Hola! Vi el perfil de ${pro.name} en ${business.name} (Calamuchita App) y quería consultar sobre un turno.`)}`
                            : null
                          return (
                            <div key={i} className="rounded-2xl border border-stone-100 p-3 flex flex-col items-center text-center gap-2" style={{ background: "#FAFAF9" }}>
                              <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                                {pro.photo_url ? (
                                  <Image src={pro.photo_url} alt={pro.name} width={56} height={56} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center font-serif text-xl font-bold" style={{ background: "#2D4530", color: "#E1DBC9" }}>
                                    {pro.name?.[0] ?? "?"}
                                  </div>
                                )}
                              </div>
                              <div className="w-full">
                                <p className="text-xs font-bold leading-snug line-clamp-2" style={{ color: "#2D4530" }}>{pro.name}</p>
                                {pro.specialty && <p className="text-[10px] mt-0.5 line-clamp-1" style={{ color: "rgba(45,69,48,0.55)" }}>{pro.specialty}</p>}
                              </div>
                              {pro.description && <p className="text-[10px] line-clamp-2 leading-relaxed w-full text-left" style={{ color: "rgba(45,69,48,0.60)" }}>{pro.description}</p>}
                              {pro.schedule && <p className="text-[10px] w-full text-left" style={{ color: "rgba(45,69,48,0.45)" }}>🕐 {pro.schedule}</p>}
                              {waUrl && (
                                <a href={waUrl} target="_blank" rel="noopener noreferrer" className="mt-auto w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-white transition-opacity hover:opacity-90 active:scale-95" style={{ background: "#25D366" }}>
                                  <WaIcon size={12} /> WhatsApp
                                </a>
                              )}
                              {!waUrl && pro.contact?.startsWith("http") && (
                                <a href={pro.contact} target="_blank" rel="noopener noreferrer" className="mt-auto w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-colors hover:opacity-80" style={{ background: "rgba(45,69,48,0.08)", color: "#2D4530" }}>
                                  📅 Sacar turno
                                </a>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}

          {/* ── Botonera de contacto (mobile) ── */}
          {hasBottomActions && (
            <div className="md:hidden flex gap-3">
              {waLink && (
                <a href={waLink} target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold text-white shadow-sm active:scale-95 transition-all hover:brightness-105"
                  style={{ background: "#25D366" }}>
                  <WaIcon size={16} /> WhatsApp
                </a>
              )}
              {business.phone && (
                <a href={`tel:${business.phone}`}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold border-2 bg-white active:scale-95 transition-all hover:opacity-80"
                  style={{ color: "#2D4530", borderColor: "#2D4530" }}>
                  <Phone size={16} /> Llamar
                </a>
              )}
              {mapsLink && (
                <a href={mapsLink} target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold shadow-sm active:scale-95 transition-all hover:opacity-90"
                  style={{ background: "#2D4530", color: "#E1DBC9" }}>
                  <Navigation size={16} /> Llegar
                </a>
              )}
            </div>
          )}

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
    </div>
  )
}
