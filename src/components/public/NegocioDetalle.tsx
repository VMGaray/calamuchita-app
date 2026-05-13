"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import AnimateIn from "@/components/ui/AnimateIn"
import { 
  Phone, 
  AtSign, 
  MapPin, 
  Clock, 
  Truck, 
  ShoppingBag, 
  UtensilsCrossed, 
  ArrowLeft,
  MessageCircle,
  Share2
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import CartaInteractiva from "@/components/public/CartaInteractiva"
import { createClient } from "@/lib/supabase/client"

// Importamos Swiper y sus módulos
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';

// Importamos los estilos de Swiper
import 'swiper/css';
import 'swiper/css/pagination';

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
    createClient().rpc("increment_view", { business_id: business.id }).then()
  }, [business.id])

  const todayMenu = business.daily_menus?.find((m: any) => {
    const today = new Date().toISOString().split("T")[0]
    return m.date === today && m.is_published
  })

  const waNumber = (business.whatsapp || business.phone)?.replace(/\D/g, "")
  const waLink = waNumber 
    ? `https://wa.me/${waNumber}?text=${encodeURIComponent(`Hola! Me contacto desde Calamuchita App por el negocio ${business.name}.`)}`
    : null
  
  // Link para abrir en Google Maps app
  const mapsExternalLink = business.latitude && business.longitude
    ? `https://www.google.com/maps/search/?api=1&query=${business.latitude},${business.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${business.name}, ${business.address}`)}`;

  // Lógica de fotos
  const photos = Array.isArray(business.images) && business.images.length > 0 
    ? business.images 
    : business.cover_url ? [business.cover_url] : [];

  return (
    <div className="min-h-screen bg-[#E1DBC9]/30 pb-20">

      {/* Hero / Carrusel de Fotos */}
      <div className="relative h-72 md:h-[450px] overflow-hidden">
        {photos.length > 0 ? (
          <Swiper
            modules={[Pagination, Autoplay]}
            pagination={{ clickable: true }}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            className="h-full w-full"
          >
            {photos.map((url: string, index: number) => (
              <SwiperSlide key={index}>
                <Image
                  src={url}
                  alt={`${business.name} - foto ${index + 1}`}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="w-full h-full bg-brand-pine/10" />
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10 pointer-events-none" />

        {/* Botón Volver */}
        <Link
          href="/negocios"
          className="absolute top-6 left-6 z-20 flex items-center gap-2 bg-black/30 backdrop-blur-md text-white px-4 py-2 rounded-xl text-sm hover:bg-black/50 transition-colors border border-white/20"
        >
          <ArrowLeft size={16} />
          Volver
        </Link>

        {/* Logo */}
        {business.logo_url && (
          <div className="absolute -bottom-10 left-6 w-24 h-24 z-20 rounded-2xl overflow-hidden border-4 border-[#E1DBC9] shadow-2xl bg-white">
            <Image src={business.logo_url} alt={business.name} fill className="object-cover" />
          </div>
        )}
      </div>

      <div ref={infoRef} className="scroll-mt-24 max-w-6xl mx-auto px-4 pt-16 pb-12">

        {/* Header con Nombre */}
        <AnimateIn direction="up">
          <div className="mb-8">
            <h1 className="font-serif text-4xl md:text-5xl text-stone-800 mb-2">{business.name}</h1>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-brand-pine text-white uppercase tracking-wider">
                {business.subcategory || business.category || "Comercio"}
              </span>
              <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                business.is_open ? "bg-green-100 text-green-700 border border-green-200" : "bg-stone-200 text-stone-500"
              }`}>
                {business.is_open ? "Abierto ahora" : "Cerrado"}
              </span>
            </div>
          </div>
        </AnimateIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Columna IZQUIERDA */}
          <div className="md:col-span-2 space-y-8">
            
            {/* Descripción y Botones de Acción */}
            <div className="bg-white rounded-3xl border border-stone-200 p-8 shadow-sm">
              <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-4">Descripción</h3>
              <p className="text-stone-600 text-lg leading-relaxed mb-8">
                {business.description || `${business.name} le da la bienvenida al Valle de Calamuchita.`}
              </p>

              {business.section === 'gastronomy' && (
                <div className="pt-6 border-t border-stone-100">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button className="flex items-center justify-center gap-2 bg-brand-pine text-white px-4 py-4 rounded-2xl font-bold text-sm shadow-md hover:bg-brand-pine/90 transition-all active:scale-95">
                      <Clock size={18} /> 
                      <span className="whitespace-nowrap">Reservar Mesa</span>
                    </button>

                    <button className="flex items-center justify-center gap-2 bg-brand-pine text-white px-4 py-4 rounded-2xl font-bold text-sm shadow-md hover:bg-brand-pine/90 transition-all active:scale-95">
                      <ShoppingBag size={18} /> 
                      <span className="whitespace-nowrap">Hacer pedido</span>
                    </button>

                    <button className="flex items-center justify-center gap-2 bg-brand-pine text-white px-4 py-4 rounded-2xl font-bold text-sm shadow-md hover:bg-brand-pine/90 transition-all active:scale-95">
                      <UtensilsCrossed size={18} /> 
                      <span className="whitespace-nowrap">Ver Carta</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Menú del día */}
            {todayMenu && todayMenu.daily_menu_items?.length > 0 && (
              <div className="bg-white rounded-3xl border border-stone-200 p-8 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <UtensilsCrossed size={20} className="text-accent-400" />
                  <h2 className="font-serif text-2xl text-stone-800">Menú del día</h2>
                </div>
                <div className="space-y-4">
                  {todayMenu.daily_menu_items.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between py-3 border-b border-stone-100 last:border-0">
                      <div>
                        <p className="font-bold text-stone-700">{item.name}</p>
                        {item.description && <p className="text-sm text-stone-400 mt-1">{item.description}</p>}
                      </div>
                      <p className="font-bold text-stone-800 ml-4">${item.price.toLocaleString("es-AR")}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {business.menu_categories?.length > 0 && (
              <CartaInteractiva categories={business.menu_categories} business={business} />
            )}
          </div>

          {/* Columna DERECHA */}
          <div className="space-y-6">
            
            {/* Contacto y Mapa */}
            <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
              <div className="p-6 space-y-6">
                <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">Contacto</h3>
                
                <div className="space-y-4">
                  {business.phone && (
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center">
                        <Phone size={18} className="text-stone-500" />
                      </div>
                      <div>
                        <p className="text-[10px] text-stone-400 font-bold uppercase">Teléfono</p>
                        <p className="text-sm font-bold text-stone-800">{business.phone}</p>
                      </div>
                    </div>
                  )}

                  {business.address && (
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center shrink-0">
                          <MapPin size={18} className="text-stone-500" />
                        </div>
                        <div>
                          <p className="text-[10px] text-stone-400 font-bold uppercase">Dirección</p>
                          <p className="text-sm font-bold text-stone-800 leading-tight">{business.address}</p>
                        </div>
                      </div>

                      {/* MAPA DINÁMICO CON MAPBOX */}
                      <a 
                        href={mapsExternalLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full h-40 rounded-2xl overflow-hidden relative border border-stone-200 group"
                      >
                        <img 
                          src={business.latitude && business.longitude 
                            ? `https://api.mapbox.com/styles/v1/mapbox/light-v11/static/pin-s+2D4530(${business.longitude},${business.latitude})/${business.longitude},${business.latitude},14/600x300?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`
                            : "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=600&q=80"
                          } 
                          alt="Mapa de ubicación"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="bg-white text-stone-800 text-[10px] font-black px-3 py-1.5 rounded-lg shadow-xl uppercase">
                            {business.latitude ? "Ver ubicación real" : "Ver dirección"}
                          </span>
                        </div>
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {waLink && (
                <a 
                  href={waLink}
                  target="_blank"
                  className="flex items-center justify-center gap-3 bg-[#25D366] text-white py-5 font-black text-xs uppercase tracking-widest hover:brightness-110 transition-all"
                >
                  <MessageCircle size={20} fill="currentColor" />
                  Consultar por WhatsApp
                </a>
              )}
            </div>

            {/* Servicios */}
            {(business.offers_delivery || business.offers_takeaway || business.offers_dine_in) && (
              <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm">
                <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-4">Servicios</h3>
                <div className="space-y-3">
                  {business.offers_delivery && (
                    <div className="flex items-center gap-3 text-stone-600">
                      <Truck size={18} className="text-brand-pine" />
                      <span className="text-sm font-bold">Delivery</span>
                    </div>
                  )}
                  {business.offers_takeaway && (
                    <div className="flex items-center gap-3 text-stone-600">
                      <ShoppingBag size={18} className="text-brand-pine" />
                      <span className="text-sm font-bold">Take away</span>
                    </div>
                  )}
                  {business.offers_dine_in && (
                    <div className="flex items-center gap-3 text-stone-600">
                      <UtensilsCrossed size={18} className="text-brand-pine" />
                      <span className="text-sm font-bold">Comer en el lugar</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Horarios */}
            {business.business_hours?.length > 0 && (
              <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm">
                <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-4">Horarios</h3>
                <div className="space-y-2">
                  {business.business_hours
                    .sort((a: any, b: any) => a.day_of_week - b.day_of_week)
                    .map((h: any) => (
                      <div key={h.id} className="flex justify-between items-center text-sm">
                        <span className="text-stone-500 font-medium">{dayNames[h.day_of_week]}</span>
                        <span className={`font-bold ${h.is_closed ? "text-stone-300" : "text-stone-700"}`}>
                          {h.is_closed ? "Cerrado" : `${h.opens_at.slice(0,5)} — ${h.closes_at.slice(0,5)}`}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}