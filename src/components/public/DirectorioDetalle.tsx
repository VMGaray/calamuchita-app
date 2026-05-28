"use client"

import { useEffect, useState } from "react"
import AnimateIn from "@/components/ui/AnimateIn"
import Image from "next/image"
import Link from "next/link"
import {
  Phone, AtSign, MapPin, Clock, ArrowLeft,
  Globe, CreditCard, PawPrint, Truck, ShoppingBag,
  UtensilsCrossed, Star, MessageCircle, Navigation,
  Wifi, Car, ChevronLeft, ChevronRight,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const DAY_SHORT = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

const SECTION_TITLES: Record<string, string> = {
  gastronomy:  "Gastronomía",
  services:    "Servicios",
  health:      "Salud",
  education:   "Educación",
  tourism:     "Turismo",
  commerce:    "Comercios",
  events:      "Eventos",
  info:        "Info útil",
}

const PAYMENT_LABELS: Record<string, string> = {
  efectivo:      "Efectivo",
  debito:        "Débito",
  credito:       "Crédito",
  transferencia: "Transferencia",
  mercadopago:   "Mercado Pago",
  qr:            "QR",
}

const card: React.CSSProperties = {
  background: "#FFFFFF",
  border: "1px solid rgba(45,69,48,0.09)",
  borderRadius: 20,
}

const WA_ICON = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.526 5.845L.057 23.545a.75.75 0 0 0 .921.921l5.701-1.469A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.695 9.695 0 0 1-4.964-1.366l-.355-.212-3.686.949.969-3.682-.231-.366A9.712 9.712 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z" />
  </svg>
)

function InfoRow({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: "rgba(45,69,48,0.07)" }}>
        {icon}
      </div>
      <div className="pt-2 min-w-0">{children}</div>
    </div>
  )
}

function FeatureBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
      style={{ background: "rgba(45,69,48,0.06)", border: "1px solid rgba(45,69,48,0.09)" }}>
      <span style={{ color: "#2D4530" }}>{icon}</span>
      <span className="text-xs font-semibold" style={{ color: "#2D4530" }}>{label}</span>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-[0.16em] mb-3.5"
      style={{ color: "rgba(45,69,48,0.38)" }}>
      {children}
    </p>
  )
}

interface Props {
  business: any
  section: string
}

export default function DirectorioDetalle({ business, section }: Props) {
  const photos = (business.business_photos ?? [])
    .sort((a: any, b: any) => a.sort_order - b.sort_order)

  const rawHeroImages = photos.slice(0, 3).map((p: any) => p.url as string)
  const heroImages: string[] = rawHeroImages.length > 0
    ? rawHeroImages
    : business.cover_url ? [business.cover_url] : []

  const [heroIdx, setHeroIdx] = useState(0)

  const waNum = (business.whatsapp || business.phone || "").replace(/\D/g, "")
  const waLink = waNum
    ? `https://wa.me/${waNum}?text=${encodeURIComponent("Hola! Te consulto desde Calamuchita App 🌿")}`
    : null
  const mapsLink = business.address?.trim()
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${business.name} ${business.address.trim()}`)}`
    : null

  const todayIdx = new Date().getDay()
  const todayHours = business.business_hours?.find((h: any) => h.day_of_week === todayIdx)
  const isOpenToday = todayHours && !todayHours.is_closed

  const hasActions = waLink || mapsLink || business.phone

  useEffect(() => {
    createClient().rpc("increment_view", { business_id: business.id }).then()
  }, [business.id])

  useEffect(() => {
    if (heroImages.length <= 1) return
    const timer = setInterval(() => setHeroIdx(i => (i + 1) % heroImages.length), 5000)
    return () => clearInterval(timer)
  }, [heroImages.length])

  const instagramHandle = business.instagram
    ?.replace(/^@|https?:\/\/(www\.)?instagram\.com\//g, "")
    .replace(/\/$/, "")

  return (
    <div className="min-h-screen">

      {/* ── HERO ──────────────────────────────────────── */}
      <div className="relative h-72 md:h-[420px]">

        {/* Images / logo fallback / gradient fallback */}
        {heroImages.length > 0 ? (
          <>
            {heroImages.map((url, i) => (
              <div
                key={i}
                className="absolute inset-0 transition-opacity duration-700 pointer-events-none"
                style={{ opacity: i === heroIdx ? 1 : 0 }}
              >
                <Image src={url} alt={business.name} fill className="object-cover"
                  priority={i === 0} sizes="100vw" quality={80} />
              </div>
            ))}
            {heroImages.length > 1 && (
              <>
                <button
                  onClick={() => setHeroIdx(i => (i - 1 + heroImages.length) % heroImages.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 flex items-center justify-center rounded-full"
                  style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.15)" }}
                  aria-label="Foto anterior"
                >
                  <ChevronLeft size={16} color="white" />
                </button>
                <button
                  onClick={() => setHeroIdx(i => (i + 1) % heroImages.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 flex items-center justify-center rounded-full"
                  style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.15)" }}
                  aria-label="Foto siguiente"
                >
                  <ChevronRight size={16} color="white" />
                </button>
                <div
                  className="absolute top-5 right-4 z-20 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full"
                  style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(8px)" }}
                >
                  {heroImages.map((_, i) => (
                    <button key={i} onClick={() => setHeroIdx(i)}
                      className="transition-all duration-300 rounded-full"
                      style={{ height: 5, width: i === heroIdx ? 14 : 5, background: i === heroIdx ? "#fff" : "rgba(255,255,255,0.45)" }}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : business.logo_url ? (
          <>
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <Image src={business.logo_url} alt="" fill
                className="object-cover scale-150 blur-3xl" style={{ opacity: 0.18 }} aria-hidden />
            </div>
            <div className="absolute inset-0" style={{ background: "rgba(18,30,20,0.82)" }} />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative w-40 h-40 md:w-52 md:h-52">
                <Image src={business.logo_url} alt={business.name} fill className="object-contain drop-shadow-2xl" />
              </div>
            </div>
          </>
        ) : (
          <div className="absolute inset-0"
            style={{ background: "linear-gradient(135deg, rgba(45,69,48,0.55) 0%, rgba(74,109,79,0.35) 100%)" }} />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/10 pointer-events-none" />

        {/* Back button */}
        <Link
          href={`/directorio/${section}`}
          className="absolute top-5 left-4 z-20 flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium"
          style={{ background: "rgba(0,0,0,0.40)", backdropFilter: "blur(12px)", color: "#E1DBC9", border: "1px solid rgba(255,255,255,0.15)" }}
        >
          <ArrowLeft size={14} />
          {SECTION_TITLES[section] ?? "Volver"}
        </Link>

        {/* Identity — bottom of hero */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-5 z-10">
          {business.logo_url && (
            <div className="w-14 h-14 rounded-2xl overflow-hidden mb-3 bg-white shadow-xl"
              style={{ border: "2px solid rgba(255,255,255,0.35)", padding: 3 }}>
              <div className="relative w-full h-full">
                <Image src={business.logo_url} alt={business.name} fill className="object-contain" />
              </div>
            </div>
          )}
          <h1 className="font-serif text-3xl md:text-4xl text-white mb-2"
            style={{ textShadow: "0 2px 20px rgba(0,0,0,0.80)" }}>
            {business.name}
          </h1>
          <div className="flex items-center gap-2 flex-wrap">
            {business.subcategory && (
              <span className="text-xs font-medium px-3 py-1 rounded-full"
                style={{ background: "rgba(225,219,201,0.20)", color: "#E1DBC9", border: "1px solid rgba(225,219,201,0.28)" }}>
                {business.subcategory}
              </span>
            )}
            {todayHours && (
              <span className="text-xs font-medium px-3 py-1 rounded-full"
                style={isOpenToday
                  ? { background: "rgba(45,160,70,0.25)", color: "#6FD98A", border: "1px solid rgba(45,160,70,0.35)" }
                  : { background: "rgba(0,0,0,0.30)", color: "rgba(225,219,201,0.55)" }}>
                {todayHours.is_closed
                  ? "Cerrado hoy"
                  : `Hoy: ${todayHours.opens_at.slice(0, 5)} – ${todayHours.closes_at.slice(0, 5)}`}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── CONTENT — cream background ─────────────────── */}
      <div className="pb-14" style={{ background: "#EDE8DC" }}>
        <div className="max-w-4xl mx-auto px-4 pt-5">

          {/* Action buttons */}
          {hasActions && (
            <div className="flex gap-2.5 mb-5">
              {waLink && (
                <a href={waLink} target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold shadow-sm transition-opacity hover:opacity-90"
                  style={{ background: "#25D366", color: "#fff" }}>
                  {WA_ICON}
                  <span>WhatsApp</span>
                </a>
              )}
              {mapsLink && (
                <a href={mapsLink} target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold shadow-sm transition-opacity hover:opacity-90"
                  style={{ background: "#2D4530", color: "#E1DBC9" }}>
                  <Navigation size={15} />
                  Llegar
                </a>
              )}
              {business.phone && (
                <a href={`tel:${business.phone}`}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold shadow-sm transition-opacity hover:opacity-90"
                  style={{ background: "#fff", color: "#2D4530", border: "1.5px solid rgba(45,69,48,0.18)" }}>
                  <Phone size={15} />
                  Llamar
                </a>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* ── Main column ── */}
            <div className="md:col-span-2 space-y-4">

              {business.description && (
                <AnimateIn direction="up" delay={0.05}>
                  <div className="p-6" style={card}>
                    <SectionLabel>Sobre nosotros</SectionLabel>
                    <p className="leading-relaxed text-[15px]" style={{ color: "rgba(45,69,48,0.82)" }}>
                      {business.description}
                    </p>
                  </div>
                </AnimateIn>
              )}

              {(business.offers_delivery || business.offers_takeaway || business.offers_dine_in ||
                business.accepts_reservations || business.pet_friendly ||
                business.wifi || business.parking) && (
                <AnimateIn direction="up" delay={0.10}>
                  <div className="p-5" style={card}>
                    <SectionLabel>Destacados</SectionLabel>
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
                </AnimateIn>
              )}

              {business.payment_methods?.length > 0 && (
                <AnimateIn direction="up" delay={0.15}>
                  <div className="p-5" style={card}>
                    <div className="flex items-center gap-2 mb-3.5">
                      <CreditCard size={13} style={{ color: "rgba(45,69,48,0.40)" }} />
                      <SectionLabel>Formas de pago</SectionLabel>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {business.payment_methods.map((method: string) => (
                        <span key={method} className="px-3 py-1.5 rounded-xl text-xs font-medium"
                          style={{ background: "rgba(45,69,48,0.07)", color: "#2D4530", border: "1px solid rgba(45,69,48,0.10)" }}>
                          {PAYMENT_LABELS[method] ?? method}
                        </span>
                      ))}
                    </div>
                  </div>
                </AnimateIn>
              )}
            </div>

            {/* ── Sidebar ── */}
            <div className="space-y-4">

              {/* Contacto */}
              <AnimateIn direction="right" delay={0.08}>
                <div className="p-5" style={card}>
                  <SectionLabel>Contacto</SectionLabel>
                  <div className="space-y-3">
                    {business.phone && (
                      <InfoRow icon={<Phone size={14} style={{ color: "#2D4530" }} />}>
                        <a href={`tel:${business.phone}`}
                          className="text-sm font-medium hover:opacity-70 transition-opacity"
                          style={{ color: "#2D4530" }}>
                          {business.phone}
                        </a>
                      </InfoRow>
                    )}
                    {business.whatsapp && (
                      <InfoRow icon={<span style={{ color: "#25D366" }}>{WA_ICON}</span>}>
                        <a href={waLink!} target="_blank" rel="noopener noreferrer"
                          className="text-sm font-medium hover:opacity-70 transition-opacity"
                          style={{ color: "#25D366" }}>
                          WhatsApp
                        </a>
                      </InfoRow>
                    )}
                    {instagramHandle && (
                      <InfoRow icon={<AtSign size={14} style={{ color: "#2D4530" }} />}>
                        <a href={`https://instagram.com/${instagramHandle}`}
                          target="_blank" rel="noopener noreferrer"
                          className="text-sm font-medium truncate block hover:opacity-70 transition-opacity"
                          style={{ color: "#2D4530" }}>
                          @{instagramHandle}
                        </a>
                      </InfoRow>
                    )}
                    {business.menu_link && (
                      <InfoRow icon={<Globe size={14} style={{ color: "#2D4530" }} />}>
                        <a href={business.menu_link} target="_blank" rel="noopener noreferrer"
                          className="text-sm font-medium hover:opacity-70 transition-opacity"
                          style={{ color: "#2D4530" }}>
                          Sitio web
                        </a>
                      </InfoRow>
                    )}
                    {business.address && (
                      <InfoRow icon={<MapPin size={14} style={{ color: "rgba(45,69,48,0.55)" }} />}>
                        <span className="text-sm leading-snug" style={{ color: "rgba(45,69,48,0.65)" }}>
                          {business.address}
                        </span>
                      </InfoRow>
                    )}
                  </div>
                </div>
              </AnimateIn>

              {/* Horarios */}
              {business.business_hours?.length > 0 && (
                <AnimateIn direction="right" delay={0.14}>
                  <div className="p-5" style={card}>
                    <div className="flex items-center gap-2 mb-4">
                      <Clock size={12} style={{ color: "rgba(45,69,48,0.40)" }} />
                      <SectionLabel>Horarios</SectionLabel>
                    </div>
                    <div className="space-y-2">
                      {[...business.business_hours]
                        .sort((a: any, b: any) => a.day_of_week - b.day_of_week)
                        .map((h: any) => {
                          const isToday = h.day_of_week === todayIdx
                          return (
                            <div key={h.id} className="flex justify-between items-center text-xs">
                              <span style={{ color: isToday ? "#2D4530" : "rgba(45,69,48,0.42)", fontWeight: isToday ? 700 : 400 }}>
                                {DAY_SHORT[h.day_of_week]}
                              </span>
                              <span style={{ color: isToday ? "#2D4530" : "rgba(45,69,48,0.55)", fontWeight: isToday ? 700 : 400 }}>
                                {h.is_closed ? "Cerrado" : `${h.opens_at.slice(0, 5)} – ${h.closes_at.slice(0, 5)}`}
                              </span>
                            </div>
                          )
                        })}
                    </div>
                  </div>
                </AnimateIn>
              )}

              {/* WhatsApp CTA — desktop only (ya está en el action bar de arriba en mobile) */}
              {waLink && (
                <AnimateIn direction="right" delay={0.20}>
                  <a href={waLink} target="_blank" rel="noopener noreferrer"
                    className="hidden md:flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-sm font-semibold transition-opacity hover:opacity-90 shadow-sm"
                    style={{ background: "#25D366", color: "#fff" }}>
                    {WA_ICON}
                    Consultar por WhatsApp
                  </a>
                </AnimateIn>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
