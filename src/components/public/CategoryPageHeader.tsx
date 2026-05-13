"use client"

import { useLocalidad } from "@/lib/context/LocalidadContext"
import { MapPin } from "lucide-react"

interface Props {
  title: string
  description: string
}

export default function CategoryPageHeader({ title, description }: Props) {
  const { localidad } = useLocalidad()

  return (
    <div className="px-4 pt-10 pb-8 max-w-6xl mx-auto">
      <div
        className="inline-flex items-center gap-1.5 mb-4 px-3 py-1 rounded-full text-xs font-medium"
        style={{ background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.90)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
      >
        <MapPin size={11} />
        {localidad}
      </div>
      <h1 className="font-serif text-4xl md:text-5xl text-white mb-2 drop-shadow-md" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.80)" }}>
        {title}
      </h1>
      <p className="text-sm drop-shadow-sm" style={{ color: "rgba(225,219,201,0.80)", textShadow: "0 1px 8px rgba(0,0,0,0.60)" }}>
        {description}
      </p>
    </div>
  )
}
