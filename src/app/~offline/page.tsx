"use client"

import { WifiOff, RefreshCw, MapPin } from "lucide-react"

export default function OfflinePage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-8 py-16"
      style={{ background: "#E1DBC9" }}
    >
      <div className="text-center max-w-xs w-full">

        {/* Logo mark */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-8"
          style={{ background: "#2D4530" }}
        >
          <MapPin size={28} className="text-white" />
        </div>

        {/* Icon */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-6"
          style={{ background: "rgba(45,69,48,0.1)" }}
        >
          <WifiOff size={22} style={{ color: "#2D4530" }} />
        </div>

        <h1
          className="font-serif text-2xl mb-3"
          style={{ color: "#2D4530" }}
        >
          Sin conexión
        </h1>

        <p className="text-stone-600 text-sm leading-relaxed mb-8">
          Parece que no tenés conexión. Calamuchita App necesita internet para buscar nuevos negocios, pero pronto podrás ver tus guardados sin conexión.
        </p>

        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-medium transition-opacity hover:opacity-80 active:scale-95"
          style={{ background: "#2D4530", color: "#E1DBC9" }}
        >
          <RefreshCw size={15} />
          Reintentar
        </button>

        <p
          className="mt-8 text-[10px] uppercase tracking-widest"
          style={{ color: "rgba(45,69,48,0.35)" }}
        >
          Calamuchita App
        </p>
      </div>
    </div>
  )
}
