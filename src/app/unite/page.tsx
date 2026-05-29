"use client"

import { Check, Sparkles, Utensils, Store, Wrench, ArrowLeft, HeartPulse, ShieldAlert } from "lucide-react"
import Link from "next/link"

export default function UnitePage() {
  const WHATSAPP_NUMBER = "541145311047"

  // Mensajes pre-armados para WhatsApp según el plan seleccionado
  const getWaLink = (planName: string) => {
    const baseMsg = `¡Hola! Me interesa sumarme a Calamuchita App con el ${planName}.`
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(baseMsg)}`
  }

  return (
    <main className="min-h-screen bg-[#FDFCF9] pb-24">
      {/* Encabezado Principal */}
      <div className="bg-[#2D4530] pt-16 pb-14 px-6 rounded-b-[40px] shadow-lg text-center relative">
        <Link 
          href="/" 
          className="absolute top-6 left-6 inline-flex items-center gap-2 text-white/60 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors"
        >
          <ArrowLeft size={14} /> Volver a la App
        </Link>
        <span className="text-[10px] font-black uppercase tracking-widest text-[#E1DBC9] bg-white/10 px-3 py-1.5 rounded-full inline-block mb-4">
          Comercios · Profesionales · Servicios · Gastronomía
        </span>
        <h1 className="font-serif text-3xl md:text-5xl text-[#E1DBC9] font-bold max-w-2xl mx-auto leading-tight">
          Suscripciones de Lanzamiento
        </h1>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-12">
        {/* Banner de Bienvenida / Club Fundadores */}
        <div className="mb-12 bg-[#2D4530]/5 border border-[#2D4530]/10 rounded-[32px] p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-[#2D4530]/10 flex items-center justify-center text-[#2D4530] flex-shrink-0">
            <Sparkles size={24} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#2D4530] bg-[#2D4530]/10 px-2.5 py-1 rounded-full font-bold">
              Beneficio Exclusivo de Lanzamiento
            </span>
            <h2 className="font-serif text-xl text-stone-800 mt-2 font-bold">Club Fundadores</h2>
            <p className="text-stone-600 text-xs mt-1 leading-relaxed">
              Registrándote hoy congelás tus <span className="font-bold text-[#2D4530]">primeros 3 meses al 100% bonificados</span> (Gratis). Los meses 4 y 5 contarán con un 50% de descuento en cualquiera de los planes elegidos.
            </p>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            GRID PRINCIPAL DE 5 PLANES COMERCIALES
           ═══════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 items-stretch">
          
          {/* PLAN 1: Gastro Básico */}
          <div className="bg-white rounded-[32px] p-6 border border-stone-200/70 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full relative">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-600">
                  <Utensils size={18} />
                </div>
                <h3 className="font-serif text-base font-bold text-stone-800">Gastro Básico</h3>
              </div>
              <p className="text-stone-500 text-[11px] leading-relaxed mb-4 min-h-[55px]">
                Tu lugar en la guía gastronómica del Valle. Ideal para darte a conocer y que los clientes te encuentren rápido.
              </p>
              <div className="mb-5">
                <span className="text-2xl font-serif font-bold text-stone-800">$15.000</span>
                <span className="text-stone-400 text-xs font-medium"> / mes</span>
              </div>
              <ul className="space-y-3 border-t border-stone-100 pt-4 mb-6">
                {["Perfil digital con logo y fotos de tu local", "Horarios de atención y ubicación en el mapa", "Botón directo a tu WhatsApp para recibir consultas"].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-stone-600 text-[11px] leading-snug">
                    <Check size={13} className="text-[#2D4530] mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <a href={getWaLink("Plan Gastro Básico")} target="_blank" rel="noopener noreferrer" className="w-full py-3 bg-stone-100 text-stone-700 font-bold rounded-xl hover:bg-stone-200/70 transition-colors text-xs text-center block mt-auto">
              Registrarme
            </a>
          </div>

          {/* PLAN 2: Gastro PRO (DESTACADO PREMIUM) */}
          <div className="bg-white rounded-[32px] p-6 border-2 border-[#E1DBC9] shadow-md hover:shadow-lg transition-all flex flex-col justify-between h-full relative transform lg:-translate-y-1">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#2D4530] text-[#E1DBC9] text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full whitespace-nowrap shadow-sm">
              🔥 El más elegido
            </div>
            <div>
              <div className="flex items-center gap-3 mb-4 mt-1">
                <div className="w-10 h-10 rounded-xl bg-[#2D4530]/10 flex items-center justify-center text-[#2D4530]">
                  <Utensils size={18} />
                </div>
                <h3 className="font-serif text-base font-bold text-stone-800">Gastro PRO</h3>
              </div>
              <p className="text-stone-500 text-[11px] leading-relaxed mb-4 min-h-[55px]">
                Convertí tu perfil en una máquina de facturar. Herramientas avanzadas para automatizar tu atención y vender más.
              </p>
              <div className="mb-5">
                <span className="text-2xl font-serif font-bold text-[#2D4530]">$35.000</span>
                <span className="text-stone-400 text-xs font-medium"> / mes</span>
              </div>
              <ul className="space-y-3 border-t border-stone-100 pt-4 mb-6">
                <li className="flex items-start gap-2 text-stone-500 text-[11px] font-medium italic">
                  <Check size={13} className="text-[#2D4530] mt-0.5 flex-shrink-0" />
                  <span>Incluye todo lo del Gastro Básico.</span>
                </li>
                {["📑 Menú Digital Interactivo: Carta completa con fotos y precios", "🛵 Gestión de Pedidos por WhatsApp sin comisiones", "📅 Módulo de Reservas con un solo clic de forma simple", "⭐ Publicar tu 'Menú del Día' en la pantalla de inicio"].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-stone-800 text-[11px] font-semibold leading-snug">
                    <Check size={13} className="text-[#2D4530] mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <a href={getWaLink("Plan Gastro PRO")} target="_blank" rel="noopener noreferrer" className="w-full py-3 bg-[#2D4530] text-[#E1DBC9] font-bold rounded-xl hover:opacity-90 transition-all text-xs text-center block mt-auto shadow-sm">
              Sumar Gastro PRO
            </a>
          </div>

          {/* PLAN 3: Comercio & Turismo (DESTACADO RECOMENDADO) */}
          <div className="bg-white rounded-[32px] p-6 border-2 border-[#E1DBC9] shadow-md hover:shadow-lg transition-all flex flex-col justify-between h-full relative transform lg:-translate-y-1">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#C4B9A8] text-stone-900 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full whitespace-nowrap shadow-sm">
              ★ Recomendado
            </div>
            <div>
              <div className="flex items-center gap-3 mb-4 mt-1">
                <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700">
                  <Store size={18} />
                </div>
                <h3 className="font-serif text-base font-bold text-stone-800">Comercio & Turismo</h3>
              </div>
              <p className="text-stone-500 text-[11px] leading-relaxed mb-4 min-h-[55px]">
                Impulsá tu negocio en el mapa comercial y turístico de Calamuchita. Conectá de forma directa con residentes y turistas todo el año.
              </p>
              <div className="mb-5">
                <span className="text-2xl font-serif font-bold text-stone-800">$25.000</span>
                <span className="text-stone-400 text-xs font-medium"> / mes</span>
              </div>
              <ul className="space-y-3 border-t border-stone-100 pt-4 mb-6">
                {["Perfil comercial completo y optimizado", "Galería de fotos vertical de alta calidad", "Geolocalización exacta en mapa de paseos y alojamiento", "Enlace directo a Redes (Instagram/Facebook) y Web", "Botón nativo de WhatsApp para reservas o venta directa"].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-stone-600 text-[11px] leading-snug">
                    <Check size={13} className="text-[#2D4530] mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <a href={getWaLink("Plan Comercio & Turismo")} target="_blank" rel="noopener noreferrer" className="w-full py-3 bg-[#2D4530] text-[#E1DBC9] font-bold rounded-xl hover:opacity-90 transition-all text-xs text-center block mt-auto shadow-sm">
              Registrar Negocio
            </a>
          </div>

          {/* PLAN 4: Servicios & Educación */}
          <div className="bg-white rounded-[32px] p-6 border border-stone-200/70 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full relative">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-600">
                  <Wrench size={18} />
                </div>
                <h3 className="font-serif text-base font-bold text-stone-800">Servicios & Edu</h3>
              </div>
              <p className="text-stone-500 text-[11px] leading-relaxed mb-4 min-h-[55px]">
                Hacé que tu servicio esté disponible justo cuando los vecinos lo necesitan. La forma más rápida y prolija de generar confianza.
              </p>
              <div className="mb-5">
                <span className="text-2xl font-serif font-bold text-stone-800">$17.000</span>
                <span className="text-stone-400 text-xs font-medium"> / mes</span>
              </div>
              <ul className="space-y-3 border-t border-stone-100 pt-4 mb-6">
                {["Perfil en la guía de servicios y educación del Valle", "Detalle claro de especialidades, cursos o soluciones", "Zona de cobertura explícita (Domicilio o Espacio fijo)", "Botón de llamada rápido y WhatsApp para presupuestos"].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-stone-600 text-[11px] leading-snug">
                    <Check size={13} className="text-[#2D4530] mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <a href={getWaLink("Plan Servicios & Educación")} target="_blank" rel="noopener noreferrer" className="w-full py-3 bg-stone-100 text-stone-700 font-bold rounded-xl hover:bg-stone-200/70 transition-colors text-xs text-center block mt-auto">
              Registrarme
            </a>
          </div>

          {/* PLAN 5: Profesionales & Salud */}
          <div className="bg-white rounded-[32px] p-6 border border-stone-200/70 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full relative">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-600">
                  <HeartPulse size={18} />
                </div>
                <h3 className="font-serif text-base font-bold text-stone-800">Profesionales & Salud</h3>
              </div>
              <p className="text-stone-500 text-[11px] leading-relaxed mb-4 min-h-[55px]">
                Digitalizá tu consultorio o estudio. Facilitá el acceso a tus servicios profesionales con información clara, ordenada y de confianza.
              </p>
              <div className="mb-5">
                <span className="text-2xl font-serif font-bold text-stone-800">$27.000</span>
                <span className="text-stone-400 text-xs font-medium"> / mes</span>
              </div>
              <ul className="space-y-3 border-t border-stone-100 pt-4 mb-6">
                {["Perfil profesional institucional destacado", "Detalle de especialidades, matrículas y atención", "📋 Coberturas: Espacio dinámico para Obras Sociales y Prepagas", "Sistema de contacto rápido para solicitud de turnos por WhatsApp"].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-stone-600 text-[11px] leading-snug">
                    <Check size={13} className="text-[#2D4530] mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <a href={getWaLink("Plan Profesionales & Salud")} target="_blank" rel="noopener noreferrer" className="w-full py-3 bg-stone-100 text-stone-700 font-bold rounded-xl hover:bg-stone-200/70 transition-colors text-xs text-center block mt-auto">
              Registrarme
            </a>
          </div>

        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            SECCIÓN SEPARADA: ADICIONALES DE VISIBILIDAD (DESTACADOS)
           ═══════════════════════════════════════════════════════════════════ */}
        <div className="mt-16 bg-white rounded-[32px] p-6 md:p-8 border border-stone-200/60 shadow-sm max-w-4xl mx-auto">
          <div className="flex items-center gap-2.5 mb-6">
            <ShieldAlert size={20} className="text-[#2D4530]" />
            <h3 className="font-serif text-xl font-bold text-stone-800">Potenciá tu visibilidad (Adicionales)</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Destacado 1 */}
            <div className="bg-[#FDFCF9] border border-stone-100 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start gap-2 mb-2">
                  <h4 className="font-semibold text-sm text-stone-800 leading-tight">Premium Carrusel Principal</h4>
                  <span className="text-sm font-bold text-[#2D4530] shrink-0">+$15.000<span className="text-[10px] text-stone-400 font-normal">/mes</span></span>
                </div>
                <p className="text-stone-500 text-[11px] leading-relaxed">
                  Aparecé arriba de todo. Tu marca en el banner principal de la aplicación apenas el usuario la abre. Máxima exposición garantizada frente a turistas y vecinos.
                </p>
              </div>
              <a href={getWaLink("Adicional Premium Carrusel Principal")} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-[#2D4530] mt-4 block hover:underline text-right">
                Consultar Adicional →
              </a>
            </div>

            {/* Destacado 2 */}
            <div className="bg-[#FDFCF9] border border-stone-100 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start gap-2 mb-2">
                  <h4 className="font-semibold text-sm text-stone-800 leading-tight">Destacado de Rubro</h4>
                  <span className="text-sm font-bold text-[#2D4530] shrink-0">+$5.000<span className="text-[10px] text-stone-400 font-normal">/mes</span></span>
                </div>
                <p className="text-stone-500 text-[11px] leading-relaxed">
                  Subí al podio de tu categoría. Tu perfil aparecerá siempre fijo en los primeros lugares de tu rubro, diseñado con una tarjeta de color especial y una insignia dorada de "Recomendado".
                </p>
              </div>
              <a href={getWaLink("Adicional Destacado de Rubro")} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-[#2D4530] mt-4 block hover:underline text-right">
                Consultar Adicional →
              </a>
            </div>
          </div>
        </div>

      </div>
    </main>
  )
}