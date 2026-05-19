"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Calendar, ArrowLeft } from "lucide-react"
import Link from "next/link"
import EventCard from "@/components/events/EventCard"
import { DATA_TELEFONOS } from "@/lib/constants/telefonos"

const LOCALIDADES = ["Todas", ...Object.keys(DATA_TELEFONOS)]

const LABEL: Record<string, string> = {
  "Villa General Belgrano": "VGB",
  "Santa Rosa de Calamuchita": "Santa Rosa",
  "Villa Ciudad Parque": "V. Ciudad Parque",
}

export default function EventosPage() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("Todas")
  const supabase = createClient()

  useEffect(() => {
    supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setEvents(data || [])
        setLoading(false)
      })
  }, [])

  const filtered = filter === "Todas" ? events : events.filter(e => e.localidad === filter)

  return (
    <main className="min-h-screen bg-[#FDFCF9] pb-20">

      {/* Header */}
      <div className="bg-[#2D4530] pt-16 pb-10 px-6 rounded-b-[40px] shadow-lg">
        <Link href="/" className="inline-flex items-center gap-2 text-white/60 text-xs font-bold uppercase tracking-widest mb-6 hover:text-white transition-colors">
          <ArrowLeft size={14} /> Volver
        </Link>
        <h1 className="font-serif text-4xl text-[#E1DBC9] font-bold">Agenda<br />del Valle</h1>
        <p className="text-white/50 text-sm mt-2 font-medium">Los mejores momentos de Calamuchita en un solo lugar.</p>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 overflow-x-auto px-6 py-6 no-scrollbar">
        {LOCALIDADES.map(loc => (
          <button
            key={loc}
            onClick={() => setFilter(loc)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${
              filter === loc
                ? "bg-[#2D4530] text-[#E1DBC9] border-[#2D4530]"
                : "bg-white text-stone-500 border-stone-200 hover:border-[#2D4530]"
            }`}
          >
            {LABEL[loc] ?? loc}
          </button>
        ))}
      </div>

      {/* Grid de eventos */}
      <div className="px-6">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-80 rounded-[32px] bg-stone-100 animate-pulse" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(event => (
              <EventCard
                key={event.id}
                event={{
                  id: event.id,
                  title: event.title,
                  description: event.description ?? "",
                  localidad: event.localidad ?? "",
                  date_description: event.date_description ?? "",
                  image_url: Array.isArray(event.image_url) ? event.image_url : [],
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Calendar size={36} className="mx-auto text-stone-300 mb-3" />
            <p className="text-stone-400 text-sm">
              {filter === "Todas" ? "No hay eventos publicados." : `No hay eventos en ${filter}.`}
            </p>
          </div>
        )}
      </div>

    </main>
  )
}
