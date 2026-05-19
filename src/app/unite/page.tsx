"use client"

import { Check, Sparkles, Utensils, Store, Wrench, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function UnitePage() {
  const WHATSAPP_NUMBER = "541145311047"

  // Mensajes personalizados
  const msgOficios = encodeURIComponent("¡Hola! Me interesa sumarme a Calamuchita App con el Plan de Oficios y Servicios.")
  const msgComercial = encodeURIComponent("¡Hola! Me interesa sumar mi negocio al Plan Comercial de Calamuchita App.")
  const msgGastrononico = encodeURIComponent("¡Hola! Me interesa sumar mi local al Plan Gastronómico de Calamuchita App.")

  return (
    <main className="min-h-screen bg-[#FDFCF9] pb-20">
      {/* Encabezado */}
      <div className="bg-[#2D4530] pt-16 pb-12 px-6 rounded-b-[40px] shadow-lg text-center relative">
        <Link href="/" className="absolute top-6 left-6 inline-flex items-center gap-2 text-white/60 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors">
          <ArrowLeft size={14} /> Volver a la App
        </Link>
        <span className="text-[10px] font-black uppercase tracking-widest text-[#E1DBC9] bg-white/10 px-3 py-1.5 rounded-full inline-block mb-4">
          Comercios, Servicios y Oficios
        </span>
        <h1 className="font-serif text-3xl md:text-4xl text-[#E1DBC9] font-bold">
          Sumá tu espacio a Calamuchita App
        </h1>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-12">
        {/* Banner Club Fundadores */}
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
              Registrándote hoy congelás los <span className="font-bold text-[#2D4530]">primeros 3 meses al 100% bonificados</span> (Gratis). Los meses 4 y 5 contarán con un 50% de descuento.
            </p>
          </div>
        </div>

        {/* Grid de 3 Tarjetas */}
        <div className="grid md:grid-cols-3 gap-6 items-start">
          
          {/* Plan Oficios y Servicios */}
          <div className="bg-white rounded-[32px] p-6 border border-stone-200/60 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-600">
                  <Wrench size={18} />
                </div>
                <h3 className="font-serif text-lg font-bold text-stone-800">Oficios y Servicios</h3>
              </div>
              <p className="text-stone-500 text-xs leading-relaxed mb-6">
                Para electricistas, gasistas, plomeros, fletes, técnicos y profesionales independientes del Valle.
              </p>
              <div className="mb-6">
                <span className="text-2xl font-serif font-bold text-stone-800">$9.000</span>
                <span className="text-stone-400 text-xs font-medium"> / mes</span>
              </div>
              <ul className="space-y-3 border-t border-stone-100 pt-4 mb-6">
                {["Perfil técnico optimizado", "Botón de llamada rápida y WhatsApp", "Detalle de zona de cobertura", "Horarios de atención / Urgencias", "Métricas de clics en tu teléfono"].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-stone-600 text-xs">
                    <Check size={14} className="text-[#2D4530] mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${msgOficios}`} target="_blank" rel="noopener noreferrer" className="w-full py-3 bg-stone-100 text-stone-700 font-bold rounded-xl hover:bg-stone-200/70 transition-colors text-xs text-center block">
              Registrarme
            </a>
          </div>

          {/* Plan Comercial */}
          <div className="bg-white rounded-[32px] p-6 border border-stone-200/60 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-600">
                  <Store size={18} />
                </div>
                <h3 className="font-serif text-lg font-bold text-stone-800">Plan Comercial</h3>
              </div>
              <p className="text-stone-500 text-xs leading-relaxed mb-6">
                Ideado para locales comerciales, tiendas de ropa, regalerías, institutos y complejos turísticos.
              </p>
              <div className="mb-6">
                <span className="text-2xl font-serif font-bold text-stone-800">$15.000</span>
                <span className="text-stone-400 text-xs font-medium"> / mes</span>
              </div>
              <ul className="space-y-3 border-t border-stone-100 pt-4 mb-6">
                {["Perfil con galería de imágenes", "Ubicación en mapa interactivo", "Enlace directo a tu WhatsApp", "Horarios comerciales habituales", "Métricas mensuales de visitas"].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-stone-600 text-xs">
                    <Check size={14} className="text-[#2D4530] mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${msgComercial}`} target="_blank" rel="noopener noreferrer" className="w-full py-3 bg-stone-100 text-stone-700 font-bold rounded-xl hover:bg-stone-200/70 transition-colors text-xs text-center block">
              Registrar Comercio
            </a>
          </div>

          {/* Plan Gastronómico */}
          <div className="bg-white rounded-[32px] p-6 border-2 border-[#2D4530] shadow-md relative flex flex-col justify-between h-full">
            <div className="absolute -top-3 right-6 bg-[#2D4530] text-[#E1DBC9] text-[8px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full">
              Destacado
            </div>
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#2D4530]/10 flex items-center justify-center text-[#2D4530]">
                  <Utensils size={18} />
                </div>
                <h3 className="font-serif text-lg font-bold text-stone-800">Plan Gastronómico</h3>
              </div>
              <p className="text-stone-500 text-xs leading-relaxed mb-6">
                Herramientas avanzadas para restaurantes, parrillas, cafés, cervecerías y rotiserías.
              </p>
              <div className="mb-6">
                <span className="text-2xl font-serif font-bold text-[#2D4530]">$35.000</span>
                <span className="text-stone-400 text-xs font-medium"> / mes</span>
              </div>
              <ul className="space-y-3 border-t border-stone-100 pt-4 mb-6">
                {["Todo lo del Plan Comercial", "Menú Digital interactivo propio", "Botón dedicado para Pedidos", "Gestión integrada de Reservas", "Soporte express ante cambios"].map((item, i) => (
                  <li key={item} className="flex items-start gap-2.5 text-stone-600 text-xs">
                    <Check size={14} className="text-[#2D4530] mt-0.5 flex-shrink-0" />
                    <span className={i === 1 || i === 2 ? "font-bold text-stone-800" : ""}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${msgGastrononico}`} target="_blank" rel="noopener noreferrer" className="w-full py-3 bg-[#2D4530] text-[#E1DBC9] font-bold rounded-xl hover:opacity-90 transition-all text-xs text-center block shadow-sm">
              Sumar Restaurante
            </a>
          </div>

        </div>
      </div>
    </main>
  )
}