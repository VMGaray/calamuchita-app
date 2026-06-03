"use client"

import { useRouter } from "next/navigation"
import { useLocalidad } from "@/lib/context/LocalidadContext"
import { MapPin, ArrowLeft } from "lucide-react"

interface Props {
  title: string
  description: string
}

export default function CategoryPageHeader({ title, description }: Props) {
  const { localidad } = useLocalidad()
  const router = useRouter()

  return (
    <div className="px-4 pt-4 pb-2 max-w-6xl mx-auto">
      {/* Botón volver */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 mb-3 text-xs font-semibold uppercase tracking-wider transition-opacity hover:opacity-70 active:opacity-50"
        style={{ color: "rgba(255,255,255,0.80)" }}
      >
        <ArrowLeft size={14} />
        Volver
      </button>

      <div
        className="inline-flex items-center gap-1.5 mb-2 px-3 py-1 rounded-full text-xs font-medium"
        style={{
          background: "rgba(255,255,255,0.15)",
          color: "rgba(255,255,255,0.90)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)"
        }}
      >
        <MapPin size={11} />
        {localidad}
      </div>
      
      <h1 className="font-serif text-3xl md:text-5xl text-white mb-1 drop-shadow-md" 
          style={{ textShadow: "0 2px 20px rgba(0,0,0,0.80)" }}>
        {title}
      </h1>
      
      <p className="text-sm drop-shadow-sm leading-relaxed" 
         style={{ color: "rgba(225,219,201,0.85)", textShadow: "0 1px 8px rgba(0,0,0,0.60)" }}>
        {description}
      </p>
    </div>
  )
}