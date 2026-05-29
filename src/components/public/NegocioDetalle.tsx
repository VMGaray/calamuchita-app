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
  Calendar,
  Users,
  Globe,
  X
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import CartaInteractiva from "@/components/public/CartaInteractiva"
import { createClient } from "@/lib/supabase/client"

import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]

interface Props {
  business: any
}

export default function NegocioDetalle({ business }: Props) {
  const cartaRef = useRef<HTMLDivElement>(null)
  const [showReserva, setShowReserva] = useState(false)
  const [reservaForm, setReservaForm] = useState({ name: "", date: "", time: "", people: "2", notes: "" })

  useEffect(() => {
    createClient().rpc("increment_view", { business_id: business.id }).then()
  }, [business.id])

  const recordLead = (type: string) => {
    createClient().from("business_leads").insert({ business_id: business.id, type }).then()
  }

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
      recordLead("whatsapp")
      const msg = encodeURIComponent(`Hola ${business.name}! Quiero hacer un pedido. ¿Me compartís el menú disponible? Gracias!`)
      window.open(`https://wa.me/${waNumber}?text=${msg}`, "_blank")
    }
  }

  const handleEnviarReserva = () => {
    recordLead("reserva")
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

  const mapsExternalLink = business.latitude && business.longitude
    ? `https://www.google.com/maps/search/?api=1&query=${business.latitude},${business.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${business.name}, ${business.address}`)}`

  const photos = Array.isArray(business.images) && business.images.length > 0
    ? business.images
    : business.cover_url ? [business.cover_url] : []

  return (
    <div className="min-h-screen bg-[#E1DBC9]/30 pb-20">

      {/* Volver */}
      <div className="max-w-6xl mx-auto px-4 pt-6 pb-2">
        <Link
          href="/negocios"
          className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-800 text-sm font-medium transition-colors"
        >
          <ArrowLeft size={16} />
          Volver
        </Link>
      </div>

      {/* INFO DEL COMERCIO */}
      <AnimateIn direction="up">
        <div className="max-w-6xl mx-auto px-4 pb-4">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6">

            {/* Logo + Nombre + Badges */}
            <div className="flex gap-4 items-start mb-6">
              {business.logo_url && (
                /* bg-white + object-contain: logo visible completo aunque tenga fondo blanco/transparente */
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-stone-100 shadow-sm shrink-0 bg-white">
                  {/* shimmer cubierto por la imagen al cargar */}
                  <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-stone-50 via-stone-100 to-stone-50" />
                  <Image
                    src={business.logo_url}
                    alt={business.name}
                    fill
                    priority
                    className="object-contain p-1.5"
                    sizes="80px"
                    quality={85}
                  />
                </div>
              )}
              <div className="flex-1 min-w-0 pt-1">
                <h1 className="font-serif text-3xl md:text-4xl text-stone-800 mb-2 leading-tight">{business.name}</h1>
                {/* min-h-[32px] estabiliza el bloque aunque no haya badges */}
                <div className="flex items-center gap-2 flex-wrap min-h-[32px]">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-brand-pine text-white uppercase tracking-wider">
                    {business.subcategory || business.category || "Comercio"}
                  </span>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    business.is_open ? "bg-green-100 text-green-700 border border-green-200" : "bg-stone-100 text-stone-500"
                  }`}>
                    {business.is_open ? "Abierto ahora" : "Cerrado"}
                  </span>
                </div>
              </div>
            </div>

            {/* Datos de contacto */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {business.phone && (
                <a href={`tel:${business.phone}`} onClick={() => recordLead("phone")}
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                  <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center shrink-0">
                    <Phone size={16} className="text-stone-500" />
                  </div>
                  <div>
                    <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Teléfono</p>
                    <p className="text-sm font-bold text-stone-800">{business.phone}</p>
                  </div>
                </a>
              )}

              {business.instagram && (
                <a
                  href={`https://instagram.com/${business.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                  <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center shrink-0">
                    <AtSign size={16} className="text-stone-500" />
                  </div>
                  <div>
                    <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Instagram</p>
                    <p className="text-sm font-bold text-stone-800">{business.instagram}</p>
                  </div>
                </a>
              )}

              {business.website && (
                <a
                  href={business.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                  <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center shrink-0">
                    <Globe size={16} className="text-stone-500" />
                  </div>
                  <div>
                    <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Web</p>
                    <p className="text-sm font-bold text-stone-800 truncate max-w-[160px]">{business.website}</p>
                  </div>
                </a>
              )}

              {business.address && (
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin size={16} className="text-stone-500" />
                  </div>
                  <div>
                    <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Dirección</p>
                    <p className="text-sm font-bold text-stone-800 leading-tight">{business.address}</p>
                  </div>
                </div>
              )}

              {business.branches && (
                <div className="flex items-start gap-3 sm:col-span-2">
                  <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin size={16} className="text-brand-pine" />
                  </div>
                  <div>
                    <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Sucursales</p>
                    <p className="text-sm font-bold text-stone-800 leading-snug">{business.branches}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Horarios */}
            {business.business_hours?.length > 0 && (
              <div className="mt-6 pt-5 border-t border-stone-100">
                <div className="flex items-center gap-2 mb-3">
                  <Clock size={13} className="text-stone-400" />
                  <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">Horarios</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-0">
                  {business.business_hours
                    .sort((a: any, b: any) => a.day_of_week - b.day_of_week)
                    .map((h: any) => (
                      <div key={h.id} className="flex justify-between items-center text-sm py-1.5 border-b border-stone-50 last:border-0">
                        <span className="text-stone-500 font-medium">{dayNames[h.day_of_week]}</span>
                        <span className={`font-bold ${h.is_closed ? "text-stone-300" : "text-stone-700"}`}>
                          {h.is_closed ? "Cerrado" : `${h.opens_at.slice(0, 5)} — ${h.closes_at.slice(0, 5)}`}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </AnimateIn>

      {/* BOTONES: WhatsApp + Llegar — flex-wrap + min-h evita overflow en pantallas muy angostas */}
      <div className="max-w-6xl mx-auto px-4 pb-4">
        <div className="flex flex-wrap gap-3 min-h-[56px]">
          {waLink && (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => recordLead("whatsapp")}
              className="flex-1 min-w-[140px] flex items-center justify-center gap-2 bg-[#25D366] text-white py-4 rounded-2xl font-black text-sm shadow-md hover:brightness-110 transition-all active:scale-95"
            >
              <MessageCircle size={18} fill="currentColor" />
              WhatsApp
            </a>
          )}
          <a
            href={mapsExternalLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-w-[140px] flex items-center justify-center gap-2 bg-brand-pine text-white py-4 rounded-2xl font-black text-sm shadow-md hover:bg-brand-pine/90 transition-all active:scale-95"
          >
            <MapPin size={18} />
            Llegar
          </a>
        </div>
      </div>

      {/* CARRUSEL DE FOTOS */}
      {photos.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 pb-8">
          {/* bg-stone-100 + shimmer visibles hasta que la primera foto carga */}
          <div className="rounded-3xl overflow-hidden h-64 md:h-96 relative bg-stone-100">
            <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-stone-100 via-stone-50 to-stone-100" />
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
                    sizes="(max-width: 768px) calc(100vw - 32px), (max-width: 1200px) calc(100vw - 32px), 1120px"
                    quality={index === 0 ? 85 : 75}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      )}

      {/* CONTENIDO PRINCIPAL */}
      <div className="max-w-6xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Columna principal */}
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
                      onClick={handleVerCarta}
                      disabled={!hasMenu}
                      className="flex items-center justify-center gap-2 bg-brand-pine text-white px-4 py-4 rounded-2xl font-bold text-sm shadow-md hover:bg-brand-pine/90 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <UtensilsCrossed size={18} />
                      <span className="whitespace-nowrap">Ver Carta</span>
                    </button>

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

          {/* Columna lateral */}
          <div className="space-y-6">

            {/* Servicios */}
            {(business.offers_delivery || business.offers_takeaway || business.offers_dine_in) && (
              <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm">
                <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-4">Servicios</h3>
                <div className="space-y-3">
                  {business.offers_dine_in && (
                    <div className="flex items-center gap-3 text-stone-600">
                      <UtensilsCrossed size={18} className="text-brand-pine" />
                      <span className="text-sm font-bold">Salón</span>
                    </div>
                  )}
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
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Reservar Mesa */}
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
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
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
