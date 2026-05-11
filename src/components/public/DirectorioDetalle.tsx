"use client"

import { motion } from "framer-motion"
import AnimateIn from "@/components/ui/AnimateIn"
import Image from "next/image"
import Link from "next/link"
import {
  Phone, AtSign, MapPin, Clock, ArrowLeft,
  Globe, CreditCard, PawPrint, Truck, ShoppingBag,
  UtensilsCrossed, Star
} from "lucide-react"
import WhatsAppLeadButton from "@/components/public/WhatsAppLeadButton"

const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]

const sectionTitles: Record<string, string> = {
  services: "Servicios",
  health: "Salud",
  education: "Educación",
  tourism: "Turismo",
  commerce: "Comercios",
  events: "Eventos",
  info: "Info útil",
}

const paymentLabels: Record<string, string> = {
  efectivo: "Efectivo",
  debito: "Débito",
  credito: "Crédito",
  transferencia: "Transferencia",
  mercadopago: "Mercado Pago",
  qr: "QR",
}

interface Props {
  business: any
  section: string
}

export default function DirectorioDetalle({ business, section }: Props) {
  const photos = business.business_photos || []

  return (
    <div className="min-h-screen">

      {/* Cover */}
      <div className="relative h-56 md:h-80" style={{ background: "rgba(45,69,48,0.15)" }}>
        {business.cover_url ? (
          <Image
            src={business.cover_url}
            alt={business.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full"
            style={{ background: "linear-gradient(135deg, rgba(45,69,48,0.3), rgba(45,69,48,0.1))" }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Back */}
        <Link
          href={`/directorio/${section}`}
          className="absolute top-6 left-6 flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-xl text-sm hover:bg-white/30 transition-colors"
        >
          <ArrowLeft size={16} />
          {sectionTitles[section] || "Volver"}
        </Link>

        {/* Logo */}
        {business.logo_url && (
          <div className="absolute -bottom-10 left-6 w-20 h-20 rounded-2xl overflow-hidden border-4 border-white shadow-lg">
            <Image src={business.logo_url} alt={business.name} fill className="object-cover" />
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="max-w-4xl mx-auto px-4 pt-16 pb-12">

        {/* Header */}
        <AnimateIn direction="up">
          <div className="mb-6">
            <h1 className="font-serif text-3xl mb-2" style={{ color: "#2D4530" }}>{business.name}</h1>
            <div className="flex items-center gap-2 flex-wrap">
              {business.subcategory && (
                <span className="text-xs font-medium px-3 py-1 rounded-full" style={{ background: "rgba(45,69,48,0.1)", color: "#2D4530" }}>
                  {business.subcategory}
                </span>
              )}
              {business.is_open !== null && (
                <span className="text-xs font-medium px-3 py-1 rounded-full" style={
                  business.is_open
                    ? { background: "rgba(45,69,48,0.1)", color: "#2D4530" }
                    : { background: "rgba(107,123,132,0.1)", color: "#6B7B84" }
                }>
                  {business.is_open ? "Abierto ahora" : "Cerrado"}
                </span>
              )}
            </div>
          </div>
        </AnimateIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Columna principal */}
          <div className="md:col-span-2 space-y-6">

            {/* Descripción */}
            {business.description && (
              <AnimateIn direction="up" delay={0.1}>
                <div className="bg-white rounded-2xl p-6" style={{ border: "1px solid rgba(45,69,48,0.1)" }}>
                  <p className="leading-relaxed" style={{ color: "rgba(45,69,48,0.7)" }}>{business.description}</p>
                </div>
              </AnimateIn>
            )}

            {/* Fotos adicionales */}
            {photos.length > 0 && (
              <AnimateIn direction="up" delay={0.2}>
                <div className="bg-white rounded-2xl p-6" style={{ border: "1px solid rgba(45,69,48,0.1)" }}>
                  <h2 className="font-serif text-xl mb-4" style={{ color: "#2D4530" }}>Fotos</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {photos.map((photo: any) => (
                      <div key={photo.id} className="aspect-square rounded-xl overflow-hidden">
                        <Image
                          src={photo.url}
                          alt={business.name}
                          width={200}
                          height={200}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </AnimateIn>
            )}

            {/* Servicios ofrecidos */}
            {(business.offers_delivery || business.offers_takeaway ||
              business.offers_dine_in || business.accepts_reservations) && (
              <AnimateIn direction="up" delay={0.25}>
                <div className="bg-white rounded-2xl p-6" style={{ border: "1px solid rgba(45,69,48,0.1)" }}>
                  <h2 className="font-serif text-xl mb-4" style={{ color: "#2D4530" }}>Servicios</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {business.offers_delivery && (
                      <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "rgba(45,69,48,0.05)" }}>
                        <Truck size={16} style={{ color: "#2D4530" }} />
                        <span className="text-sm" style={{ color: "rgba(45,69,48,0.7)" }}>Delivery</span>
                      </div>
                    )}
                    {business.offers_takeaway && (
                      <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "rgba(45,69,48,0.05)" }}>
                        <ShoppingBag size={16} style={{ color: "#2D4530" }} />
                        <span className="text-sm" style={{ color: "rgba(45,69,48,0.7)" }}>Take away</span>
                      </div>
                    )}
                    {business.offers_dine_in && (
                      <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "rgba(45,69,48,0.05)" }}>
                        <UtensilsCrossed size={16} style={{ color: "#2D4530" }} />
                        <span className="text-sm" style={{ color: "rgba(45,69,48,0.7)" }}>En el lugar</span>
                      </div>
                    )}
                    {business.accepts_reservations && (
                      <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "rgba(45,69,48,0.05)" }}>
                        <Star size={16} style={{ color: "#2D4530" }} />
                        <span className="text-sm" style={{ color: "rgba(45,69,48,0.7)" }}>Reservas</span>
                      </div>
                    )}
                    {business.pet_friendly && (
                      <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "rgba(45,69,48,0.05)" }}>
                        <PawPrint size={16} style={{ color: "#2D4530" }} />
                        <span className="text-sm" style={{ color: "rgba(45,69,48,0.7)" }}>Pet friendly</span>
                      </div>
                    )}
                  </div>
                </div>
              </AnimateIn>
            )}

            {/* Formas de pago */}
            {business.payment_methods?.length > 0 && (
              <AnimateIn direction="up" delay={0.3}>
                <div className="bg-white rounded-2xl p-6" style={{ border: "1px solid rgba(45,69,48,0.1)" }}>
                  <div className="flex items-center gap-2 mb-4">
                    <CreditCard size={18} style={{ color: "#2D4530" }} />
                    <h2 className="font-serif text-xl" style={{ color: "#2D4530" }}>Formas de pago</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {business.payment_methods.map((method: string) => (
                      <span
                        key={method}
                        className="px-3 py-1.5 rounded-xl text-xs font-medium"
                        style={{
                          background: "rgba(45,69,48,0.08)",
                          color: "#2D4530",
                          border: "1px solid rgba(45,69,48,0.12)"
                        }}
                      >
                        {paymentLabels[method] || method}
                      </span>
                    ))}
                  </div>
                </div>
              </AnimateIn>
            )}
          </div>

          {/* Columna lateral */}
          <div className="space-y-4">

            {/* Contacto */}
            <AnimateIn direction="right" delay={0.1}>
              <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid rgba(45,69,48,0.1)" }}>
                <h3 className="text-sm font-medium mb-4" style={{ color: "#2D4530" }}>Contacto</h3>
                <div className="space-y-3">
                  {business.phone && (
                    <a
                      href={`tel:${business.phone}`}
                      className="flex items-center gap-3 text-sm hover:opacity-70 transition-opacity"
                      style={{ color: "#2D4530" }}
                    >
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: "rgba(45,69,48,0.08)" }}>
                        <Phone size={14} style={{ color: "#2D4530" }} />
                      </div>
                      {business.phone}
                    </a>
                  )}
                  {business.whatsapp && (
                    <a
                      href={`https://wa.me/${business.whatsapp.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm"
                      style={{ color: "#25D366" }}
                    >
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: "rgba(37,211,102,0.1)" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#25D366">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.526 5.845L.057 23.545a.75.75 0 0 0 .921.921l5.701-1.469A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.695 9.695 0 0 1-4.964-1.366l-.355-.212-3.686.949.969-3.682-.231-.366A9.712 9.712 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/>
                        </svg>
                      </div>
                      WhatsApp
                    </a>
                  )}
                  {business.instagram && (
                    <a
                      href={`https://instagram.com/${business.instagram.replace("@", "").replace("https://www.instagram.com/", "").replace("/", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm"
                      style={{ color: "#2D4530" }}
                    >
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: "rgba(45,69,48,0.08)" }}>
                        <AtSign size={14} style={{ color: "#2D4530" }} />
                      </div>
                      <span className="truncate">
                        @{business.instagram.replace("https://www.instagram.com/", "").replace("@", "").replace("/", "")}
                      </span>
                    </a>
                  )}
                  {business.menu_link && (
                    <a
                      href={business.menu_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm"
                      style={{ color: "#2D4530" }}
                    >
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: "rgba(45,69,48,0.08)" }}>
                        <Globe size={14} style={{ color: "#2D4530" }} />
                      </div>
                      Sitio web
                    </a>
                  )}
                  {business.address && (
                    <div className="flex items-center gap-3 text-sm" style={{ color: "rgba(45,69,48,0.55)" }}>
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(45,69,48,0.06)" }}>
                        <MapPin size={14} style={{ color: "rgba(45,69,48,0.45)" }} />
                      </div>
                      {business.address}
                    </div>
                  )}
                </div>
              </div>
            </AnimateIn>

            {/* Horarios */}
            {business.business_hours?.length > 0 && (
              <AnimateIn direction="right" delay={0.2}>
                <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid rgba(45,69,48,0.1)" }}>
                  <div className="flex items-center gap-2 mb-3">
                    <Clock size={14} style={{ color: "rgba(45,69,48,0.45)" }} />
                    <h3 className="text-sm font-medium" style={{ color: "#2D4530" }}>Horarios</h3>
                  </div>
                  <div className="space-y-1.5">
                    {business.business_hours
                      .sort((a: any, b: any) => a.day_of_week - b.day_of_week)
                      .map((h: any) => (
                        <div key={h.id} className="flex justify-between text-xs">
                          <span style={{ color: "rgba(45,69,48,0.5)" }}>{dayNames[h.day_of_week]}</span>
                          <span className="font-medium" style={{ color: "#2D4530" }}>
                            {h.is_closed ? "Cerrado" : `${h.opens_at.slice(0, 5)} - ${h.closes_at.slice(0, 5)}`}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </AnimateIn>
            )}

            {/* WhatsApp CTA — usa whatsapp con fallback a phone */}
            <AnimateIn direction="right" delay={0.3}>
              <WhatsAppLeadButton
                businessId={business.id}
                businessName={business.name}
                whatsapp={business.whatsapp ?? null}
                phone={business.phone ?? null}
              />
            </AnimateIn>
          </div>
        </div>
      </div>
    </div>
  )
}
