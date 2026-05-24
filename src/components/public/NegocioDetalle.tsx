"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
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
  Share2,
  Calendar,
  Users,
  X
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
  const cartaRef = useRef<HTMLDivElement>(null)
  const [showReserva, setShowReserva] = useState(false)
  const [reservaForm, setReservaForm] = useState({ name: "", date: "", time: "", people: "2", notes: "" })

  useEffect(() => {
    if (infoRef.current) {
      const y = infoRef.current.getBoundingClientRect().top + window.pageYOffset - 90
      window.scrollTo({ top: y, behavior: "smooth" })
    }
    createClient().rpc("increment_view", { business_id: business.id }).then()
  }, [business.id])

  const waNumber = (business.whatsapp || business.phone)?.replace(/\D/g, "")
  const waLink = waNumber
    ? `https://wa.me/${waNumber}?text=${encodeURIComponent(`Hola! Me contacto desde Calamuchita App por el negocio ${business.name}.`)}`
    : null

  const hasMenu = (business.menu_categories?.length ?? 0) > 0

  const todayMenu = business.daily_menus?.find((m: any) => {
    const today = new Date().toISOString().split("T")[0]
    return m.date === today && m.is_published
  })

  const handleVerCarta = () => {
    cartaRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const handleHacerPedido = () => {
    if (hasMenu) {
      cartaRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    } else if (waNumber) {
      const msg = encodeURIComponent(`Hola ${business.name}! Quiero hacer un pedido. ¿Me compartís el menú disponible? Gracias!`)
      window.open(`https://wa.me/${waNumber}?text=${msg}`, "_blank")
    }
  }

  const handleEnviarReserva = () => {
    const phone = (business.whatsapp || business.phone)?.replace(/\D/g, "") || ""
    const fullPhone = phone.startsWith("54") ? phone : `54${phone}`
    const msg = encodeURIComponent(
      `Hola ${business.name}! 👋\n\n` +
      `Quiero hacer una reserva:\n` +
      `📅 Fecha: ${reservaForm.date}\n` +
      `🕐 Hora: ${reservaForm.time}\n` +
      `👥 Personas: ${reservaForm.people}\n` +
      `👤 Nombre: ${reservaForm.name}\n` +
      (reservaForm.notes ? `📝 Notas: ${reservaForm.notes}\n` : "") +
      `\n¡Gracias!`
    )
    window.open(`https://wa.me/${fullPhone}?text=${msg}`, "_blank")
    setShowReserva(false)
    setReservaForm({ name: "", date: "", time: "", people: "2", notes: "" })
  }

  const reservaValid = reservaForm.name && reservaForm.date && reservaForm.time
  
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

      {/* Wrapper externo: relative sin overflow-hidden para que el logo no sea recortado */}
      <div className="relative">
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
                    sizes="100vw"
                    quality={75}
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
        </div>

        {/* Logo: fuera del overflow-hidden, apoyado en el borde inferior del hero */}
        {business.logo_url && (
          <div className="absolute bottom-0 translate-y-1/2 left-6 w-24 h-24 z-20 rounded-2xl overflow-hidden border-4 border-[#E1DBC9] shadow-2xl bg-white">
            <Image src={business.logo_url} alt={business.name} fill className="object-cover" sizes="96px" quality={80} />
          </div>
        )}
      </div>

      <div ref={infoRef} className="scroll-mt-24 max-w-6xl mx-auto px-4 pt-20 pb-12">

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
            <div className="bg-white rounded-3xl border border-stone-200 p-4 md:p-8 shadow-sm">
              <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-4">Descripción</h3>
              <p className="text-stone-600 text-lg leading-relaxed mb-8">
                {business.description || `${business.name} le da la bienvenida al Valle de Calamuchita.`}
              </p>

              {business.section === 'gastronomy' && (
                <div className="pt-6 border-t border-stone-100">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      onClick={() => setShowReserva(true)}
                      disabled={!waNumber}
                      className="flex items-center justify-center gap-2 bg-brand-pine text-white px-4 py-4 rounded-2xl font-bold text-sm shadow-md hover:bg-brand-pine/90 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Calendar size={18} />
                      <span className="whitespace-nowrap">Reservar Mesa</span>
                    </button>

                    <button
                      onClick={handleHacerPedido}
                      disabled={!hasMenu && !waNumber}
                      className="flex items-center justify-center gap-2 bg-brand-pine text-white px-4 py-4 rounded-2xl font-bold text-sm shadow-md hover:bg-brand-pine/90 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ShoppingBag size={18} />
                      <span className="whitespace-nowrap">Hacer pedido</span>
                    </button>

                    <button
                      onClick={handleVerCarta}
                      disabled={!hasMenu}
                      className="flex items-center justify-center gap-2 bg-brand-pine text-white px-4 py-4 rounded-2xl font-bold text-sm shadow-md hover:bg-brand-pine/90 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <UtensilsCrossed size={18} />
                      <span className="whitespace-nowrap">Ver Carta</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Menú del día */}
            {todayMenu && todayMenu.daily_menu_items?.length > 0 && (
              <div className="bg-white rounded-3xl border border-stone-200 p-4 md:p-8 shadow-sm">
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
              <div ref={cartaRef}>
                <CartaInteractiva categories={business.menu_categories} business={business} />
              </div>
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

      {/* ── Modal Reservar Mesa ── */}
      <AnimatePresence>
        {showReserva && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 z-40"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowReserva(false)}
            />
            <motion.div
              className="fixed inset-x-4 bottom-4 top-4 z-50 max-w-md mx-auto overflow-y-auto"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
            >
              <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">
                <div className="bg-brand-pine px-6 py-4 flex items-center justify-between">
                  <h2 className="font-serif text-xl text-brand-sand">Reservar mesa</h2>
                  <button onClick={() => setShowReserva(false)} className="text-brand-sand/60 hover:text-brand-sand">
                    <X size={22} />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Tu nombre *</label>
                    <input
                      type="text"
                      value={reservaForm.name}
                      onChange={e => setReservaForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="María García"
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none focus:ring-2 focus:ring-brand-pine/20"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">
                        <Calendar size={12} className="inline mr-1" />Fecha *
                      </label>
                      <input
                        type="date"
                        value={reservaForm.date}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={e => setReservaForm(p => ({ ...p, date: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none focus:ring-2 focus:ring-brand-pine/20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">
                        <Clock size={12} className="inline mr-1" />Hora *
                      </label>
                      <input
                        type="time"
                        value={reservaForm.time}
                        onChange={e => setReservaForm(p => ({ ...p, time: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none focus:ring-2 focus:ring-brand-pine/20"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      <Users size={12} className="inline mr-1" />Personas *
                    </label>
                    <select
                      value={reservaForm.people}
                      onChange={e => setReservaForm(p => ({ ...p, people: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none focus:ring-2 focus:ring-brand-pine/20 bg-white"
                    >
                      {[1,2,3,4,5,6,7,8,9,10].map(n => (
                        <option key={n} value={n}>{n} {n === 1 ? "persona" : "personas"}</option>
                      ))}
                      <option value="más de 10">Más de 10</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      Aclaraciones <span className="text-stone-400 font-normal">(opcional)</span>
                    </label>
                    <textarea
                      value={reservaForm.notes}
                      onChange={e => setReservaForm(p => ({ ...p, notes: e.target.value }))}
                      placeholder="Ej: cumpleaños, alergias, silla para bebé..."
                      rows={2}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none focus:ring-2 focus:ring-brand-pine/20 resize-none"
                    />
                  </div>
                  <button
                    onClick={handleEnviarReserva}
                    disabled={!reservaValid}
                    className="w-full bg-[#25D366] hover:bg-[#20b858] text-white py-3 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <MessageCircle size={16} fill="currentColor" />
                    Enviar reserva por WhatsApp
                  </button>
                  <p className="text-xs text-stone-400 text-center">Se abrirá WhatsApp con tu reserva lista para enviar</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}