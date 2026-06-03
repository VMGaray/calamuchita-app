"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Phone, AtSign, MapPin, Clock, ArrowLeft,
  Globe, CreditCard, PawPrint, Truck, ShoppingBag,
  UtensilsCrossed, Star, Navigation,
  Wifi, Car, ChevronLeft, ChevronRight,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

// Nombres cortos para el grid de horarios (permite mostrar 2 columnas sin overflow)
const DAY_SHORT = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

const SECTION_TITLES: Record<string, string> = {
  gastronomy: "Gastronomía",
  services:   "Servicios",
  health:     "Salud",
  education:  "Educación",
  tourism:    "Turismo",
  commerce:   "Comercios",
  events:     "Eventos",
  info:       "Info útil",
}

const PAYMENT_LABELS: Record<string, string> = {
  efectivo:      "Efectivo",
  debito:        "Débito",
  credito:       "Crédito",
  transferencia: "Transferencia",
  mercadopago:   "Mercado Pago",
  qr:            "QR",
}

const WA_SVG = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.526 5.845L.057 23.545a.75.75 0 0 0 .921.921l5.701-1.469A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.695 9.695 0 0 1-4.964-1.366l-.355-.212-3.686.949.969-3.682-.231-.366A9.712 9.712 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z" />
  </svg>
)

// ── InfoRow: fila de metadato con ícono (sin posición absoluta) ───────────────
function InfoRow({
  icon,
  sublabel,
  label,
  href,
  external,
}: {
  icon: React.ReactNode
  sublabel: string
  label: string
  href?: string
  external?: boolean
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
  if (href) {
    return (
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className="block hover:opacity-70 transition-opacity"
      >
        {inner}
      </a>
    )
  }
  return inner
}

// ── FeatureBadge: chip de característica del negocio ─────────────────────────
function FeatureBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
      style={{ background: "rgba(45,69,48,0.06)", border: "1px solid rgba(45,69,48,0.09)" }}
    >
      <span style={{ color: "#2D4530" }}>{icon}</span>
      <span className="text-xs font-semibold" style={{ color: "#2D4530" }}>{label}</span>
    </div>
  )
}

// Calcula si el negocio está abierto ahora basándose en sus horarios reales.
// Usa la zona horaria de Argentina para que funcione correctamente sin importar el TZ del visitante.
function calcIsOpenNow(hours: any[]): boolean {
  if (!hours || hours.length === 0) return false
  const arDate = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" }))
  const day = arDate.getDay()
  const hhmm = `${String(arDate.getHours()).padStart(2, "0")}:${String(arDate.getMinutes()).padStart(2, "0")}`
  const todayRows = hours.filter((h: any) => h.day_of_week === day && !h.is_closed)
  if (todayRows.length === 0) return false
  return todayRows.some((h: any) => hhmm >= h.opens_at.slice(0, 5) && hhmm < h.closes_at.slice(0, 5))
}

interface Props {
  business: any
  section: string
}

export default function DirectorioDetalle({ business, section }: Props) {

  // Fotos desde business_photos (tabla relacionada), ordenadas por sort_order, máx 3
  // Fallback a cover_url si no hay fotos cargadas
  const rawPhotos = ((business.business_photos ?? []) as any[])
    .sort((a: any, b: any) => a.sort_order - b.sort_order)
    .slice(0, 3)
    .map((p: any) => p.url as string)
  const photos: string[] = rawPhotos.length > 0
    ? rawPhotos
    : business.cover_url ? [business.cover_url] : []

  const [photoIdx, setPhotoIdx] = useState(0)

  const waNum = (business.whatsapp || business.phone || "").replace(/\D/g, "")
  const waLink = waNum
    ? `https://wa.me/${waNum}?text=${encodeURIComponent(`Hola! Te consulto desde Calamuchita App — ${business.name} 🌿`)}`
    : null

  const mapsLink =
    business.latitude && business.longitude
      ? `https://www.google.com/maps/search/?api=1&query=${business.latitude},${business.longitude}`
      : typeof business.address === "string" && business.address.trim()
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${business.name} ${business.address.trim()}`)}`
      : null

  const todayIdx = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" })).getDay()
  const todayRows = (business.business_hours ?? []).filter((h: any) => h.day_of_week === todayIdx)
  const todayIsClosed = todayRows.length > 0 && todayRows.every((h: any) => h.is_closed)
  const isOpenNow = calcIsOpenNow(business.business_hours ?? [])
  const hasHoursData = todayRows.length > 0

  const hasActions = waLink || mapsLink || business.phone

  const instagramHandle = business.instagram
    ?.replace(/^@|https?:\/\/(www\.)?instagram\.com\//g, "")
    .replace(/\/$/, "")

  // menu_link es el campo de sitio web en los negocios del directorio
  const websiteUrl = business.menu_link || business.website

  const categoryLabel = business.subcategory || business.category || SECTION_TITLES[section] || "Comercio"

  // Branches: array de objetos {pueblo?, address?}
  const branches: any[] = Array.isArray(business.branches) ? business.branches : []

  const hasFeatures =
    business.offers_delivery || business.offers_takeaway || business.offers_dine_in ||
    business.accepts_reservations || business.pet_friendly ||
    business.wifi || business.parking

  const prevPhoto = () => setPhotoIdx(i => (i - 1 + photos.length) % photos.length)
  const nextPhoto = () => setPhotoIdx(i => (i + 1) % photos.length)

  useEffect(() => {
    createClient().rpc("increment_view", { business_id: business.id }).then()
  }, [business.id])

  // Construir el mapa de horarios agrupando por día (soporte para horario cortado)
  const sortedHours = [...(business.business_hours ?? [])].sort(
    (a: any, b: any) => a.day_of_week - b.day_of_week,
  )
  const byDay = new Map<number, any[]>()
  for (const h of sortedHours) {
    const arr = byDay.get(h.day_of_week) ?? []
    arr.push(h)
    byDay.set(h.day_of_week, arr)
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: "#F0EBE0" }}>
      <div className="max-w-2xl mx-auto px-4 flex flex-col gap-y-4 pt-5">

        {/* 1 ── Volver ──────────────────────────────────────────────────── */}
        <Link
          href={`/directorio/${section}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium w-fit transition-opacity hover:opacity-60"
          style={{ color: "#2D4530" }}
        >
          <ArrowLeft size={15} />
          {SECTION_TITLES[section] ?? "Volver"}
        </Link>

        {/* 2 ═══════════════════════════════════════════════════════════════
            BLOQUE 1 — MARCA + INFORMACIÓN
        ════════════════════════════════════════════════════════════════ */}
        <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">

          {/* Header: nombre izquierda · logo derecha */}
          <div className="px-6 pt-6 pb-5 border-b border-stone-100">
            <div className="flex items-start gap-4">

              {/* Nombre + badges */}
              <div className="flex-1 min-w-0">
                <h1
                  className="text-2xl md:text-3xl font-bold leading-tight mb-3 tracking-tight"
                  style={{ color: "#2D4530" }}
                >
                  {business.name}
                </h1>
                <div className="flex items-center gap-2 flex-wrap min-h-[28px]">
                  <span
                    className="text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider"
                    style={{ background: "rgba(45,69,48,0.10)", color: "#2D4530" }}
                  >
                    {categoryLabel}
                  </span>
                  {hasHoursData && (
                    <span
                      className={`text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${
                        isOpenNow
                          ? "text-green-700 bg-green-50 border border-green-200"
                          : todayIsClosed
                          ? "text-stone-500 bg-stone-100"
                          : "text-red-600 bg-red-50 border border-red-200"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full inline-block ${
                          isOpenNow ? "bg-green-500" : todayIsClosed ? "bg-stone-400" : "bg-red-500"
                        }`}
                      />
                      {todayIsClosed ? "Cerrado hoy" : isOpenNow ? "Abierto ahora" : "Cerrado ahora"}
                    </span>
                  )}
                </div>
              </div>

              {/* Logo — cuadrado fijo, object-contain para logos con fondo blanco */}
              {business.logo_url && (
                <div className="w-20 h-20 rounded-xl bg-white border border-stone-100 shadow-sm p-2 shrink-0 relative overflow-hidden">
                  <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-stone-50 via-stone-100 to-stone-50" />
                  <Image
                    src={business.logo_url}
                    alt={`Logo de ${business.name}`}
                    fill
                    priority
                    className="object-contain p-1.5"
                    sizes="80px"
                    quality={85}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Descripción */}
          {business.description && (
            <div className="px-6 py-5 border-b border-stone-100">
              <p className="text-stone-500 text-sm leading-relaxed">{business.description}</p>
            </div>
          )}

          {/* Stack de metadata */}
          <div className="px-6 py-1">
            {business.phone && (
              <InfoRow
                icon={<Phone size={14} style={{ color: "#2D4530" }} />}
                sublabel="Teléfono"
                label={business.phone}
                href={`tel:${business.phone}`}
              />
            )}
            {instagramHandle && (
              <InfoRow
                icon={<AtSign size={14} style={{ color: "#2D4530" }} />}
                sublabel="Instagram"
                label={`@${instagramHandle}`}
                href={`https://instagram.com/${instagramHandle}`}
                external
              />
            )}
            {websiteUrl && (
              <InfoRow
                icon={<Globe size={14} style={{ color: "#2D4530" }} />}
                sublabel="Sitio web"
                label={websiteUrl.replace(/^https?:\/\//, "")}
                href={websiteUrl}
                external
              />
            )}
            {business.address && (
              <InfoRow
                icon={<MapPin size={14} style={{ color: "#2D4530" }} />}
                sublabel="Dirección"
                label={business.address}
              />
            )}
            {branches.map((branch: any, i: number) => (
              <InfoRow
                key={i}
                icon={<MapPin size={14} style={{ color: "#2D4530", opacity: 0.5 }} />}
                sublabel={`Sucursal${branches.length > 1 ? ` ${i + 1}` : ""}`}
                label={
                  branch.pueblo
                    ? `${branch.pueblo}${branch.address ? ` — ${branch.address}` : ""}`
                    : branch.address ?? ""
                }
              />
            ))}
          </div>

          {/* Horarios — agrupados por día con soporte para horario cortado */}
          {byDay.size > 0 && (
            <div className="px-6 pt-4 pb-6 border-t border-stone-100">
              <div className="flex items-center gap-2 mb-3">
                <Clock size={13} style={{ color: "rgba(45,69,48,0.40)" }} />
                <p
                  className="text-[10px] font-black uppercase tracking-[0.2em]"
                  style={{ color: "rgba(45,69,48,0.40)" }}
                >
                  Horarios
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                {Array.from(byDay.entries()).map(([day, rows]) => {
                  const isToday = day === todayIdx
                  const first = rows[0]
                  const second = rows[1]
                  const timeStr = first.is_closed
                    ? "Cerrado"
                    : second
                    ? `${first.opens_at.slice(0, 5)}–${first.closes_at.slice(0, 5)} · ${second.opens_at.slice(0, 5)}–${second.closes_at.slice(0, 5)}`
                    : `${first.opens_at.slice(0, 5)} — ${first.closes_at.slice(0, 5)}`
                  return (
                    <div
                      key={day}
                      className="flex justify-between items-center py-1.5 border-b border-stone-50 last:border-0 text-sm"
                    >
                      <span
                        className="font-medium"
                        style={{ color: isToday ? "#2D4530" : "rgba(45,69,48,0.45)", fontWeight: isToday ? 700 : 400 }}
                      >
                        {DAY_SHORT[day]}
                      </span>
                      <span
                        style={{ color: isToday ? "#2D4530" : first.is_closed ? "#C4B9A8" : "rgba(45,69,48,0.60)", fontWeight: isToday ? 700 : 400 }}
                      >
                        {timeStr}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* 3 ═══════════════════════════════════════════════════════════════
            BLOQUE 2 — BOTONES CTA (WhatsApp · Llegar · Llamar)
        ════════════════════════════════════════════════════════════════ */}
        {hasActions && (
          <div className="flex flex-wrap gap-3">
            {waLink && (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-[140px] flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm text-white shadow-md hover:brightness-110 transition-all active:scale-95"
                style={{ background: "#25D366" }}
              >
                {WA_SVG}
                WhatsApp
              </a>
            )}
            {mapsLink && (
              <a
                href={mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-[140px] flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm shadow-md hover:opacity-90 transition-all active:scale-95"
                style={{ background: "#2D4530", color: "#E1DBC9" }}
              >
                <Navigation size={16} />
                Llegar
              </a>
            )}
            {business.phone && (
              <a
                href={`tel:${business.phone}`}
                className="flex-1 min-w-[140px] flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm bg-white border-2 shadow-sm hover:opacity-80 transition-all active:scale-95"
                style={{ color: "#2D4530", borderColor: "#2D4530" }}
              >
                <Phone size={16} />
                Llamar
              </a>
            )}
          </div>
        )}

        {/* 4 ── Feature badges (características del negocio) ──────────────── */}
        {hasFeatures && (
          <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-5">
            <p
              className="text-[10px] font-black uppercase tracking-[0.2em] mb-4"
              style={{ color: "rgba(45,69,48,0.40)" }}
            >
              Características
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {business.offers_delivery      && <FeatureBadge icon={<Truck size={14} />}           label="Delivery" />}
              {business.offers_takeaway      && <FeatureBadge icon={<ShoppingBag size={14} />}     label="Take away" />}
              {business.offers_dine_in       && <FeatureBadge icon={<UtensilsCrossed size={14} />} label="En el lugar" />}
              {business.accepts_reservations && <FeatureBadge icon={<Star size={14} />}            label="Reservas" />}
              {business.pet_friendly         && <FeatureBadge icon={<PawPrint size={14} />}        label="Pet friendly" />}
              {business.wifi                 && <FeatureBadge icon={<Wifi size={14} />}            label="Wi-Fi" />}
              {business.parking              && <FeatureBadge icon={<Car size={14} />}             label="Estacionamiento" />}
            </div>
          </div>
        )}

        {/* 5 ── Formas de pago ────────────────────────────────────────────── */}
        {business.payment_methods?.length > 0 && (
          <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard size={13} style={{ color: "rgba(45,69,48,0.40)" }} />
              <p
                className="text-[10px] font-black uppercase tracking-[0.2em]"
                style={{ color: "rgba(45,69,48,0.40)" }}
              >
                Formas de pago
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {business.payment_methods.map((method: string) => (
                <span
                  key={method}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium"
                  style={{
                    background: "rgba(45,69,48,0.07)",
                    color: "#2D4530",
                    border: "1px solid rgba(45,69,48,0.10)",
                  }}
                >
                  {PAYMENT_LABELS[method] ?? method}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 6 ═══════════════════════════════════════════════════════════════
            BLOQUE 3 — GALERÍA DE FOTOS (al final del flujo)
        ════════════════════════════════════════════════════════════════ */}
        {photos.length > 0 && (
          <div className="flex flex-col gap-y-3">

            {/* Divider con badge de categoría */}
            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-stone-200" />
              <span
                className="text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full shrink-0"
                style={{ background: "rgba(45,69,48,0.10)", color: "#2D4530" }}
              >
                {categoryLabel}
              </span>
              <span className="h-px flex-1 bg-stone-200" />
            </div>

            {/* Carousel — flechas fuera de la imagen, no superpuestas */}
            <div className="flex items-center gap-2">
              {photos.length > 1 && (
                <button
                  onClick={prevPhoto}
                  aria-label="Foto anterior"
                  className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 border-[#2D4530] text-[#2D4530] hover:bg-[#2D4530] hover:text-[#E1DBC9] transition-all active:scale-90"
                >
                  <ChevronLeft size={18} />
                </button>
              )}

              {/* aspect-video fijo — CLS = 0.00 garantizado */}
              <div className="flex-1 aspect-video rounded-2xl overflow-hidden relative bg-stone-100">
                <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-stone-100 via-stone-50 to-stone-100" />
                <Image
                  src={photos[photoIdx]}
                  alt={`${business.name} — foto ${photoIdx + 1} de ${photos.length}`}
                  fill
                  priority={photoIdx === 0}
                  className="object-cover"
                  sizes="(max-width: 640px) calc(100vw - 32px), (max-width: 768px) calc(100vw - 80px), 640px"
                  quality={85}
                />
              </div>

              {photos.length > 1 && (
                <button
                  onClick={nextPhoto}
                  aria-label="Foto siguiente"
                  className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 border-[#2D4530] text-[#2D4530] hover:bg-[#2D4530] hover:text-[#E1DBC9] transition-all active:scale-90"
                >
                  <ChevronRight size={18} />
                </button>
              )}
            </div>

            {/* Dots de navegación */}
            {photos.length > 1 && (
              <div className="flex items-center justify-center gap-2 h-4">
                {photos.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPhotoIdx(i)}
                    aria-label={`Ver foto ${i + 1}`}
                    className="h-1.5 rounded-full transition-all duration-300"
                    style={{
                      width: i === photoIdx ? 20 : 6,
                      background: i === photoIdx ? "#2D4530" : "rgba(45,69,48,0.22)",
                    }}
                  />
                ))}
              </div>
            )}

            {/* Caption */}
            <p className="text-center text-xs text-stone-400 font-medium leading-snug">
              {business.name}
              {business.address ? ` · ${business.address}` : ""}
            </p>
          </div>
        )}

      </div>
    </div>
  )
}
