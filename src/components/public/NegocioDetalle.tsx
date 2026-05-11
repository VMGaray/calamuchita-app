"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import AnimateIn from "@/components/ui/AnimateIn"
import { Phone, AtSign, MapPin, Clock, Truck, ShoppingBag, UtensilsCrossed, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import ReservaWhatsApp from "@/components/public/ReservaWhatsApp"
import CartaInteractiva from "@/components/public/CartaInteractiva"
import WhatsAppLeadButton from "@/components/public/WhatsAppLeadButton"


const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]

interface Props {
  business: any
}

export default function NegocioDetalle({ business }: Props) {
  const infoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (infoRef.current) {
      const y = infoRef.current.getBoundingClientRect().top + window.pageYOffset - 90
      window.scrollTo({ top: y, behavior: "smooth" })
    }
  }, [])

  const todayMenu = business.daily_menus?.find((m: any) => {
    const today = new Date().toISOString().split("T")[0]
    return m.date === today && m.is_published
  })

  return (
    <div className="min-h-screen">

      {/* Cover */}
      <div className="relative h-72 md:h-96" style={{ background: "rgba(45,69,48,0.15)" }}>
        {business.cover_url ? (
          <Image
            src={business.cover_url}
            alt={business.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full" style={{ background: "linear-gradient(135deg, rgba(45,69,48,0.3), rgba(45,69,48,0.1))" }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Back button */}
        <Link
          href="/negocios"
          className="absolute top-6 left-6 flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-xl text-sm hover:bg-white/30 transition-colors"
        >
          <ArrowLeft size={16} />
          Volver
        </Link>

        {/* Logo */}
        {business.logo_url && (
          <div className="absolute -bottom-10 left-6 w-20 h-20 rounded-2xl overflow-hidden border-4 border-white shadow-lg">
            <Image src={business.logo_url} alt={business.name} fill className="object-cover" />
          </div>
        )}
      </div>

      {/* Contenido — destino del scroll automático */}
      <div ref={infoRef} className="scroll-mt-24 max-w-4xl mx-auto px-4 pt-16 pb-12">

        {/* Header */}
        <AnimateIn direction="up">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="font-serif text-3xl text-stone-800 mb-1">{business.name}</h1>
              <div className="flex items-center gap-2 flex-wrap">
                {business.subcategory && (
                  <span className="text-xs font-medium px-3 py-1 rounded-full bg-brand-pine/10 text-brand-pine">
                    {business.subcategory}
                  </span>
                )}
                {business.category && (
                  <span className="text-xs font-medium px-3 py-1 rounded-full bg-brand-pine/10 text-brand-pine">
                    {business.category}
                  </span>
                )}
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                  business.is_open ? "bg-brand-pine/10 text-brand-pine" : "bg-brand-slate/10 text-brand-slate"
                }`}>
                  {business.is_open ? "Abierto ahora" : "Cerrado"}
                </span>
              </div>
            </div>
          </div>
        </AnimateIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Columna principal */}
          <div className="md:col-span-2 space-y-6">

            {/* Descripción */}
            {business.description && (
              <AnimateIn direction="up" delay={0.1}>
                <div className="bg-white rounded-2xl border border-stone-200 p-6">
                  <p className="text-stone-600 leading-relaxed">{business.description}</p>
                </div>
              </AnimateIn>
            )}

            {/* PDF de la carta */}
            {business.menu_pdf_url && (
              <AnimateIn direction="up" delay={0.15}>
                <div className="bg-white rounded-2xl border border-stone-200 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(45,69,48,0.1)" }}>
                        <span className="text-xs font-bold" style={{ color: "#2D4530" }}>PDF</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-stone-700">Carta completa</p>
                        <p className="text-xs text-stone-400">Descargá o visualizá la carta</p>
                      </div>
                    </div>
                    <a
                      href={business.menu_pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl text-sm font-medium transition-colors bg-brand-pine text-brand-sand"
                    >
                      Ver carta
                    </a>
                  </div>
                </div>
              </AnimateIn>
            )}

            {/* Menú del día */}
            {todayMenu && todayMenu.daily_menu_items?.length > 0 && (
              <AnimateIn direction="up" delay={0.2}>
                <div className="bg-white rounded-2xl border border-stone-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <UtensilsCrossed size={18} className="text-accent-400" />
                    <h2 className="font-serif text-xl text-stone-800">Menú del día</h2>
                  </div>
                  <div className="space-y-3">
                    {todayMenu.daily_menu_items.map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between py-2 border-b border-stone-100 last:border-0">
                        <div>
                          <p className="text-sm font-medium text-stone-700">{item.name}</p>
                          {item.description && (
                            <p className="text-xs text-stone-400 mt-0.5">{item.description}</p>
                          )}
                          {item.includes_drink && (
                            <span className="text-xs text-brand-pine">Incluye bebida</span>
                          )}
                        </div>
                        <p className="text-sm font-medium text-stone-800 ml-4">
                          ${item.price.toLocaleString("es-AR")}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </AnimateIn>
            )}

            {/* Carta */}
            {business.menu_categories?.length > 0 && (
              <AnimateIn direction="up" delay={0.3}>
                <CartaInteractiva
                  categories={business.menu_categories}
                  business={{
                    id: business.id,
                    name: business.name,
                    whatsapp: business.whatsapp,
                    offers_delivery: business.offers_delivery,
                    offers_takeaway: business.offers_takeaway,
                  }}
                />
              </AnimateIn>
            )}
          </div>

          {/* Columna lateral */}
          <div className="space-y-4">

            {/* Contacto */}
            <AnimateIn direction="right" delay={0.1}>
              <div className="bg-white rounded-2xl border border-stone-200 p-5">
                <h3 className="text-sm font-medium text-stone-700 mb-4">Contacto</h3>
                <div className="space-y-3">
                  {business.phone && (
                    <a href={`tel:${business.phone}`} className="flex items-center gap-3 text-sm text-brand-pine hover:text-brand-earth">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(45,69,48,0.08)" }}>
                        <Phone size={14} style={{ color: "#2D4530" }} />
                      </div>
                      {business.phone}
                    </a>
                  )}
                  {business.instagram && (
                    <a
                      href={`https://instagram.com/${business.instagram.replace("@", "").replace("https://www.instagram.com/", "").replace("/", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm text-brand-pine hover:text-brand-earth"
                    >
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(45,69,48,0.08)" }}>
                        <AtSign size={14} style={{ color: "#2D4530" }} />
                      </div>
                      <span className="truncate">
                        @{business.instagram.replace("https://www.instagram.com/", "").replace("@", "").replace("/", "")}
                      </span>
                    </a>
                  )}
                  {business.address && (
                    <div className="flex items-center gap-3 text-sm text-stone-500">
                      <div className="w-8 h-8 bg-stone-50 rounded-xl flex items-center justify-center">
                        <MapPin size={14} className="text-stone-400" />
                      </div>
                      {business.address}
                    </div>
                  )}
                </div>
              </div>
            </AnimateIn>

            {/* WhatsApp Lead — todas las categorías */}
            <AnimateIn direction="right" delay={0.12}>
              <WhatsAppLeadButton
                businessId={business.id}
                businessName={business.name}
                whatsapp={business.whatsapp ?? null}
                phone={business.phone ?? null}
              />
            </AnimateIn>

            {/* Reserva */}
            {business.accepts_reservations && business.whatsapp && (
              <AnimateIn direction="right" delay={0.15}>
                <ReservaWhatsApp
                  whatsapp={business.whatsapp}
                  businessName={business.name}
                />
              </AnimateIn>
            )}

            {/* Servicios */}
            {(business.offers_delivery || business.offers_takeaway || business.offers_dine_in) && (
              <AnimateIn direction="right" delay={0.2}>
                <div className="bg-white rounded-2xl border border-stone-200 p-5">
                  <h3 className="text-sm font-medium text-stone-700 mb-3">Servicios</h3>
                  <div className="space-y-2">
                    {business.offers_delivery && (
                      <div className="flex items-center gap-2 text-sm text-stone-600">
                        <Truck size={14} className="text-brand-pine" />
                        Delivery
                      </div>
                    )}
                    {business.offers_takeaway && (
                      <div className="flex items-center gap-2 text-sm text-stone-600">
                        <ShoppingBag size={14} className="text-brand-pine" />
                        Take away
                      </div>
                    )}
                    {business.offers_dine_in && (
                      <div className="flex items-center gap-2 text-sm text-stone-600">
                        <UtensilsCrossed size={14} className="text-brand-pine" />
                        Comer en el lugar
                      </div>
                    )}
                  </div>
                </div>
              </AnimateIn>
            )}

            {/* Horarios */}
            {business.business_hours?.length > 0 && (
              <AnimateIn direction="right" delay={0.3}>
                <div className="bg-white rounded-2xl border border-stone-200 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock size={14} className="text-stone-400" />
                    <h3 className="text-sm font-medium text-stone-700">Horarios</h3>
                  </div>
                  <div className="space-y-1.5">
                    {business.business_hours
                      .sort((a: any, b: any) => a.day_of_week - b.day_of_week)
                      .map((h: any) => (
                        <div key={h.id} className="flex justify-between text-xs">
                          <span className="text-stone-500">{dayNames[h.day_of_week]}</span>
                          <span className="text-stone-700 font-medium">
                            {h.is_closed ? "Cerrado" : `${h.opens_at.slice(0,5)} - ${h.closes_at.slice(0,5)}`}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </AnimateIn>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}