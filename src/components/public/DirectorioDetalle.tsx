"use client"

import { useEffect } from "react"
import AnimateIn from "@/components/ui/AnimateIn"
import Image from "next/image"
import Link from "next/link"
import {
  Phone, AtSign, MapPin, Clock, ArrowLeft,
  Globe, CreditCard, PawPrint, Truck, ShoppingBag,
  UtensilsCrossed, Star, MessageCircle, Navigation,
  Wifi, Car,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const DAY_SHORT = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

const SECTION_TITLES: Record<string, string> = {
  gastronomy: "Gastronomía",
  services: "Servicios",
  health: "Salud",
  education: "Educación",
  tourism: "Turismo",
  commerce: "Comercios",
  events: "Eventos",
  info: "Info útil",
}

const PAYMENT_LABELS: Record<string, string> = {
  efectivo: "Efectivo",
  debito: "Débito",
  credito: "Crédito",
  transferencia: "Transferencia",
  mercadopago: "Mercado Pago",
  qr: "QR",
}

const glass: React.CSSProperties = {
  background: "rgba(255,255,255,0.10)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.18)",
}

const WA_ICON = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.526 5.845L.057 23.545a.75.75 0 0 0 .921.921l5.701-1.469A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.695 9.695 0 0 1-4.964-1.366l-.355-.212-3.686.949.969-3.682-.231-.366A9.712 9.712 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z" />
  </svg>
)

function IconBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ background: "rgba(255,255,255,0.13)" }}>
      {children}
    </div>
  )
}

function FeatureBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl" style={glass}>
      <span style={{ color: "#A3B18A" }}>{icon}</span>
      <span className="text-sm font-medium" style={{ color: "#E1DBC9" }}>{label}</span>
    </div>
  )
}

interface Props {
  business: any
  section: string
}

export default function DirectorioDetalle({ business, section }: Props) {
  const photos = (business.business_photos ?? [])
    .sort((a: any, b: any) => a.sort_order - b.sort_order)

  const waNum = (business.whatsapp || business.phone || "").replace(/\D/g, "")
  const waLink = waNum
    ? `https://wa.me/${waNum}?text=${encodeURIComponent(`Hola! Te consulto desde Calamuchita App 🌿`)}`
    : null
  const mapsLink = business.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${business.name} ${business.address}`)}`
    : null

  const todayIdx = new Date().getDay()
  const todayHours = business.business_hours?.find((h: any) => h.day_of_week === todayIdx)
  const isOpenToday = todayHours && !todayHours.is_closed

  const hasActionBar = waLink || mapsLink || business.phone

  useEffect(() => {
    createClient().rpc("increment_view", { business_id: business.id }).then()
  }, [business.id])

  return (
    <div className="min-h-screen pb-32 md:pb-12">

      {/* ── HERO ──────────────────────────────────────────── */}
      <div className="relative h-72 md:h-[420px]">
        {business.cover_url ? (
          <Image
            src={business.cover_url}
            alt={business.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0"
            style={{ background: "linear-gradient(135deg, rgba(45,69,48,0.55) 0%, rgba(74,109,79,0.35) 100%)" }} />
        )}

        {/* Dark gradient for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/15" />

        {/* Back */}
        <Link
          href={`/directorio/${section}`}
          className="absolute top-5 left-4 flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium"
          style={{ background: "rgba(0,0,0,0.40)", backdropFilter: "blur(12px)", color: "#E1DBC9", border: "1px solid rgba(255,255,255,0.15)" }}
        >
          <ArrowLeft size={14} />
          {SECTION_TITLES[section] ?? "Volver"}
        </Link>

        {/* Business identity — bottom of hero */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-6">
          {business.logo_url && (
            <div className="w-16 h-16 rounded-2xl overflow-hidden mb-3 shadow-xl"
              style={{ border: "2px solid rgba(255,255,255,0.22)" }}>
              <Image src={business.logo_url} alt={business.name} width={64} height={64} className="object-cover w-full h-full" />
            </div>
          )}

          <h1
            className="font-serif text-3xl md:text-4xl text-white mb-2 drop-shadow-md"
            style={{ textShadow: "0 2px 20px rgba(0,0,0,0.75)" }}
          >
            {business.name}
          </h1>

          <div className="flex items-center gap-2 flex-wrap">
            {business.subcategory && (
              <span className="text-xs font-medium px-3 py-1 rounded-full"
                style={{ background: "rgba(163,177,138,0.22)", color: "#A3B18A", border: "1px solid rgba(163,177,138,0.35)" }}>
                {business.subcategory}
              </span>
            )}
            {todayHours && (
              <span className="text-xs font-medium px-3 py-1 rounded-full"
                style={isOpenToday
                  ? { background: "rgba(45,160,70,0.25)", color: "#6FD98A", border: "1px solid rgba(45,160,70,0.35)" }
                  : { background: "rgba(0,0,0,0.30)", color: "rgba(225,219,201,0.60)" }}>
                {todayHours.is_closed
                  ? "Cerrado hoy"
                  : `Hoy: ${todayHours.opens_at.slice(0, 5)} – ${todayHours.closes_at.slice(0, 5)}`}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ──────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* ── Columna principal ── */}
          <div className="md:col-span-2 space-y-5">

            {/* Descripción */}
            {business.description && (
              <AnimateIn direction="up" delay={0.05}>
                <div className="rounded-2xl p-6" style={glass}>
                  <p className="leading-relaxed text-[15px]" style={{ color: "rgba(225,219,201,0.88)" }}>
                    {business.description}
                  </p>
                </div>
              </AnimateIn>
            )}

            {/* Galería de fotos */}
            {photos.length > 0 && (
              <AnimateIn direction="up" delay={0.10}>
                <div className="rounded-2xl p-5" style={glass}>
                  <h2 className="font-serif text-lg text-white mb-4">Galería</h2>
                  <div className="flex gap-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory pb-1">
                    {photos.map((photo: any) => (
                      <div key={photo.id} className="w-52 h-36 flex-shrink-0 snap-center rounded-xl overflow-hidden">
                        <Image
                          src={photo.url}
                          alt={business.name}
                          width={208}
                          height={144}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </AnimateIn>
            )}

            {/* Destacados */}
            {(business.offers_delivery || business.offers_takeaway || business.offers_dine_in ||
              business.accepts_reservations || business.pet_friendly ||
              business.wifi || business.parking) && (
              <AnimateIn direction="up" delay={0.15}>
                <div className="rounded-2xl p-5" style={glass}>
                  <h2 className="font-serif text-lg text-white mb-4">Destacados</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {business.offers_delivery    && <FeatureBadge icon={<Truck size={15} />}         label="Delivery" />}
                    {business.offers_takeaway    && <FeatureBadge icon={<ShoppingBag size={15} />}   label="Take away" />}
                    {business.offers_dine_in     && <FeatureBadge icon={<UtensilsCrossed size={15} />} label="En el lugar" />}
                    {business.accepts_reservations && <FeatureBadge icon={<Star size={15} />}        label="Reservas" />}
                    {business.pet_friendly       && <FeatureBadge icon={<PawPrint size={15} />}      label="Pet friendly" />}
                    {business.wifi               && <FeatureBadge icon={<Wifi size={15} />}          label="Wi-Fi" />}
                    {business.parking            && <FeatureBadge icon={<Car size={15} />}           label="Estacionamiento" />}
                  </div>
                </div>
              </AnimateIn>
            )}

            {/* Formas de pago */}
            {business.payment_methods?.length > 0 && (
              <AnimateIn direction="up" delay={0.20}>
                <div className="rounded-2xl p-5" style={glass}>
                  <div className="flex items-center gap-2 mb-4">
                    <CreditCard size={15} style={{ color: "rgba(225,219,201,0.60)" }} />
                    <h2 className="font-serif text-lg text-white">Formas de pago</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {business.payment_methods.map((method: string) => (
                      <span key={method} className="px-3 py-1.5 rounded-xl text-xs font-medium"
                        style={{ background: "rgba(255,255,255,0.12)", color: "rgba(225,219,201,0.80)", border: "1px solid rgba(255,255,255,0.15)" }}>
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
              <div className="rounded-2xl p-5" style={glass}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-4"
                  style={{ color: "rgba(225,219,201,0.50)" }}>
                  Contacto
                </p>
                <div className="space-y-3">
                  {business.phone && (
                    <a href={`tel:${business.phone}`}
                      className="flex items-center gap-3 text-sm hover:opacity-70 transition-opacity"
                      style={{ color: "#E1DBC9" }}>
                      <IconBox><Phone size={14} style={{ color: "#A3B18A" }} /></IconBox>
                      {business.phone}
                    </a>
                  )}
                  {business.whatsapp && (
                    <a href={waLink!} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm"
                      style={{ color: "#25D366" }}>
                      <IconBox><span style={{ color: "#25D366" }}>{WA_ICON}</span></IconBox>
                      WhatsApp
                    </a>
                  )}
                  {business.instagram && (
                    <a
                      href={`https://instagram.com/${business.instagram.replace(/^@|https?:\/\/(www\.)?instagram\.com\//g, "").replace(/\/$/, "")}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm hover:opacity-70 transition-opacity"
                      style={{ color: "#E1DBC9" }}>
                      <IconBox><AtSign size={14} style={{ color: "#A3B18A" }} /></IconBox>
                      <span className="truncate">
                        @{business.instagram.replace(/^@|https?:\/\/(www\.)?instagram\.com\//g, "").replace(/\/$/, "")}
                      </span>
                    </a>
                  )}
                  {business.menu_link && (
                    <a href={business.menu_link} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm hover:opacity-70 transition-opacity"
                      style={{ color: "#E1DBC9" }}>
                      <IconBox><Globe size={14} style={{ color: "#A3B18A" }} /></IconBox>
                      Sitio web
                    </a>
                  )}
                  {business.address && (
                    <div className="flex items-start gap-3 text-sm" style={{ color: "rgba(225,219,201,0.55)" }}>
                      <IconBox><MapPin size={14} style={{ color: "rgba(163,177,138,0.65)" }} /></IconBox>
                      <span className="leading-snug pt-0.5">{business.address}</span>
                    </div>
                  )}
                </div>
              </div>
            </AnimateIn>

            {/* Horarios */}
            {business.business_hours?.length > 0 && (
              <AnimateIn direction="right" delay={0.14}>
                <div className="rounded-2xl p-5" style={glass}>
                  <div className="flex items-center gap-2 mb-3">
                    <Clock size={13} style={{ color: "rgba(225,219,201,0.50)" }} />
                    <p className="text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "rgba(225,219,201,0.50)" }}>
                      Horarios
                    </p>
                  </div>
                  <div className="space-y-2">
                    {[...business.business_hours]
                      .sort((a: any, b: any) => a.day_of_week - b.day_of_week)
                      .map((h: any) => {
                        const isToday = h.day_of_week === todayIdx
                        return (
                          <div key={h.id} className="flex justify-between items-center text-xs">
                            <span style={{ color: isToday ? "#A3B18A" : "rgba(225,219,201,0.45)", fontWeight: isToday ? 600 : 400 }}>
                              {DAY_SHORT[h.day_of_week]}
                            </span>
                            <span style={{ color: isToday ? "#E1DBC9" : "rgba(225,219,201,0.55)", fontWeight: isToday ? 600 : 400 }}>
                              {h.is_closed ? "Cerrado" : `${h.opens_at.slice(0, 5)} – ${h.closes_at.slice(0, 5)}`}
                            </span>
                          </div>
                        )
                      })}
                  </div>
                </div>
              </AnimateIn>
            )}

            {/* Desktop WhatsApp CTA */}
            {waLink && (
              <AnimateIn direction="right" delay={0.20}>
                <a href={waLink} target="_blank" rel="noopener noreferrer"
                  className="hidden md:flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-sm font-semibold transition-opacity hover:opacity-90"
                  style={{ background: "#25D366", color: "#fff" }}>
                  {WA_ICON}
                  Consultar por WhatsApp
                </a>
              </AnimateIn>
            )}
          </div>
        </div>
      </div>

      {/* ── MOBILE ACTION BAR ─────────────────────────────── */}
      {hasActionBar && (
        <div
          className="fixed bottom-0 left-0 right-0 md:hidden px-4 py-3"
          style={{
            zIndex: 50,
            background: "rgba(18,30,20,0.94)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            borderTop: "1px solid rgba(255,255,255,0.10)",
          }}
        >
          <div className="flex gap-2.5 max-w-md mx-auto">
            {waLink && (
              <a href={waLink} target="_blank" rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 py-3.5 rounded-2xl text-sm font-semibold"
                style={{ background: "#25D366", color: "#fff" }}>
                <MessageCircle size={16} />
                WhatsApp
              </a>
            )}
            {mapsLink && (
              <a href={mapsLink} target="_blank" rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 py-3.5 rounded-2xl text-sm font-semibold"
                style={{ background: "rgba(255,255,255,0.13)", color: "#E1DBC9", border: "1px solid rgba(255,255,255,0.18)" }}>
                <Navigation size={15} />
                Llegar
              </a>
            )}
            {business.phone && (
              <a href={`tel:${business.phone}`}
                className="flex-1 flex items-center justify-center gap-1.5 py-3.5 rounded-2xl text-sm font-semibold"
                style={{ background: "rgba(255,255,255,0.13)", color: "#E1DBC9", border: "1px solid rgba(255,255,255,0.18)" }}>
                <Phone size={15} />
                Llamar
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
