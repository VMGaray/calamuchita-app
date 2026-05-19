"use client"

import { Calendar, MapPin, Info } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface EventCardProps {
  event: {
    id: string // Necesitamos el ID para el link
    title: string
    description: string
    localidad: string
    date_description: string
    image_url: string[] // Cambiado a array de strings
  }
}

export default function EventCard({ event }: EventCardProps) {
  // Tomamos la primera imagen del array, o un placeholder si no hay
  const mainImage = event.image_url?.[0] || null

  return (
    <div className="bg-white rounded-[32px] overflow-hidden border border-stone-100 shadow-sm hover:shadow-md transition-all group">
      {/* Imagen del Evento */}
      <div className="relative h-56 w-full overflow-hidden">
        {mainImage ? (
          <Image 
            src={mainImage}
            alt={event.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-stone-100 flex items-center justify-center">
            <Calendar className="text-stone-300" size={40} />
          </div>
        )}
        <div className="absolute top-4 left-4">
          <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg text-white" style={{ background: "#2D4530" }}>
            Próximamente
          </span>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-6">
        <div className="flex items-center gap-2 text-stone-400 mb-2">
          <MapPin size={14} />
          <span className="text-xs font-bold uppercase tracking-tight">{event.localidad}</span>
        </div>

        <h3 className="font-serif text-2xl text-stone-800 mb-3 leading-tight">
          {event.title}
        </h3>

        <div className="flex items-center gap-2 mb-4" style={{ color: "#2D4530" }}>
          <Calendar size={16} />
          <span className="text-sm font-bold">{event.date_description}</span>
        </div>

        {/* Descripción con truncado inteligente */}
        <p className="text-stone-500 text-sm leading-relaxed mb-6 whitespace-pre-line line-clamp-3">
          {event.description}
        </p>

        <Link href={`/eventos/${event.id}`}>
          <button className="w-full py-3 rounded-2xl border-2 border-stone-100 text-stone-600 font-bold text-sm hover:bg-stone-50 transition-colors flex items-center justify-center gap-2">
            <Info size={16} /> Ver detalles completos
          </button>
        </Link>
      </div>
    </div>
  )
}