"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Calendar, MapPin, ArrowLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const LOCALIDADES = ["Todas", "Villa General Belgrano", "Santa Rosa de Calamuchita", "La Cumbrecita", "Villa Rumipal"]

export default function EventosPage() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("Todas")
  const supabase = createClient()

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("created_at", { ascending: false }) // Traemos los más nuevos primero

      if (error) {
        console.error("Error cargando eventos:", error)
      } else {
        setEvents(data || [])
      }
      setLoading(false)
    }

    fetchEvents()
  }, [])

  const filtered = filter === "Todas" ? events : events.filter(e => e.localidad === filter)

  return (
    <main className="min-h-screen bg-[#FDFCF9] pb-20">
      <div className="bg-[#2D4530] pt-16 pb-10 px-6 rounded-b-[40px] shadow-lg">
        <Link href="/" className="inline-flex items-center gap-2 text-white/60 text-xs font-bold uppercase tracking-widest mb-6 hover:text-white transition-colors">
          <ArrowLeft size={14} /> Volver
        </Link>
        <h1 className="font-serif text-4xl text-[#E1DBC9] font-bold">Agenda <br />del Valle</h1>
        <p className="text-white/50 text-sm mt-2 font-medium">Los mejores momentos de Calamuchita en un solo lugar.</p>
      </div>

      {/* Filtros por localidad */}
      <div className="flex gap-2 overflow-x-auto px-6 py-8 no-scrollbar">
        {LOCALIDADES.map((loc) => (
          <button
            key={loc}
            onClick={() => setFilter(loc)}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap shadow-sm border ${
              filter === loc
                ? "bg-[#2D4530] text-[#E1DBC9] border-[#2D4530]"
                : "bg-white text-stone-500 border-stone-200 hover:border-[#2D4530]"
            }`}
          >
            {loc === "Villa General Belgrano" ? "VGB" : loc === "Santa Rosa de Calamuchita" ? "Santa Rosa" : loc}
          </button>
        ))}
      </div>

      {/* Lista de Eventos */}
      <div className="px-6 space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-36 rounded-[32px] bg-stone-100 animate-pulse" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          filtered.map((event) => (
            <Link href={`/eventos/${event.id}`} key={event.id} className="block">
              <div className="group flex gap-4 bg-white p-3 rounded-[32px] border border-stone-100 shadow-sm hover:shadow-md transition-all">
                
                {/* Imagen: Ahora toma la primera del array de forma segura */}
                <div className="relative w-28 h-28 rounded-[24px] overflow-hidden flex-shrink-0 bg-stone-100">
                  {event.image_url?.[0] ? (
                    <Image
                      src={event.image_url[0]}
                      alt={event.title} 
                      fill 
                      className="object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-300">
                       <Calendar size={24} />
                    </div>
                  )}
                </div>

                <div className="flex flex-col justify-center flex-1 pr-2">
                  <span className="text-[10px] font-bold text-[#2D4530] uppercase tracking-wider mb-1">
                    {event.localidad}
                  </span>
                  <h3 className="font-serif text-lg text-stone-800 leading-tight mb-2 group-hover:text-[#2D4530] transition-colors">
                    {event.title}
                  </h3>
                  <div className="flex items-center gap-1 text-stone-400">
                    <Calendar size={12} />
                    <span className="text-xs font-bold text-stone-500">
                      {/* Usamos el nuevo campo de descripción de fecha libre */}
                      {event.date_description}
                    </span>
                  </div>
                </div>

                <div className="flex items-center pr-2">
                  <div className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center text-stone-300 group-hover:bg-[#2D4530] group-hover:text-white transition-all shadow-sm">
                    <ChevronRight size={18} />
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="text-center py-20">
            <p className="text-stone-400 italic">No hay eventos programados en {filter}.</p>
          </div>
        )}
      </div>
    </main>
  )
}