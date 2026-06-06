"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useParams, useRouter } from "next/navigation"
import { ChevronLeft, MapPin, Calendar, Info } from "lucide-react"

export default function EventoDetalle() {
  const { id } = useParams()
  const router = useRouter()
  const [event, setEvent] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchEvento = async () => {
      const { data } = await supabase.from("events").select("*").eq("id", id).single()
      if (data) setEvent(data)
    }
    fetchEvento()
  }, [id])

  if (!event) return <div className="p-20 text-center">Cargando detalles del evento...</div>

  return (
    <main className="min-h-screen bg-[#FDFCF9] pb-20">
      {/* Botón Volver */}
      <button
        onClick={() => router.push("/admin")}
        className="fixed top-6 left-6 z-50 bg-white/80 backdrop-blur-md p-3 rounded-full shadow-lg text-[#2D4530]"
      >
        <ChevronLeft size={24} />
      </button>

      {/* Galería de Imágenes (Muestra todas las que cargaste) */}
      <div className="flex gap-4 overflow-x-auto p-6 pt-24 snap-x">
        {event.image_url?.map((url: string, index: number) => (
          <div key={index} className="relative h-[400px] min-w-[85%] md:min-w-[400px] rounded-[40px] overflow-hidden snap-center shadow-xl">
            <img src={url} className="w-full h-full object-cover" alt={`${event.title} - ${index}`} />
          </div>
        ))}
      </div>

      <div className="max-w-3xl mx-auto px-6 mt-8">
        <div className="flex items-center gap-2 text-[#2D4530]/60 mb-4">
          <MapPin size={18} />
          <span className="font-bold uppercase tracking-widest text-sm">{event.localidad}</span>
        </div>

        <h1 className="font-serif text-4xl md:text-5xl text-[#2D4530] mb-6 leading-tight">
          {event.title}
        </h1>

        <div className="bg-white p-6 rounded-[32px] border border-stone-100 shadow-sm mb-8 flex items-center gap-4">
          <div className="w-12 h-12 bg-[#2D4530]/10 rounded-2xl flex items-center justify-center text-[#2D4530]">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-xs text-stone-400 font-black uppercase tracking-widest">Cuándo</p>
            <p className="font-bold text-stone-800">{event.date_description}</p>
          </div>
        </div>

        <div className="prose prose-stone max-w-none">
          <h2 className="flex items-center gap-2 font-serif text-2xl text-[#2D4530] mb-4">
            <Info size={20} /> Información oficial
          </h2>
          {/* whitespace-pre-line respeta los saltos de línea que copiaste de la municipalidad */}
          <p className="text-stone-600 leading-relaxed whitespace-pre-line">
            {event.description}
          </p>
        </div>
      </div>
    </main>
  )
}