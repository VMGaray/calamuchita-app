"use client"

import { useRef } from "react"
import { ImagePlus, Loader2, X } from "lucide-react"
import { MAX_FLYERS_PER_BUSINESS } from "@/lib/promoFlyers"
import type { PromotionFlyer } from "@/types/database"

export interface PendingFlyer {
  file: File
  preview: string // object URL, se libera al quitarlo o al cerrar el formulario
}

// Sección "Flyers" del formulario de promos. Solo muestra y avisa: la subida la maneja PromoForm
// (inmediata si la promo ya existe, al guardar si es nueva).
export default function PromoFlyersField({
  saved,
  pending,
  usedByOthers,
  uploading,
  needsBusiness,
  onAdd,
  onRemoveSaved,
  onRemovePending,
}: {
  saved: PromotionFlyer[]
  pending: PendingFlyer[]
  /** Flyers del negocio en sus otras promos (cuentan para el tope de 10). */
  usedByOthers: number
  uploading: number
  /** true mientras no hay negocio elegido: no se puede calcular el tope. */
  needsBusiness: boolean
  onAdd: (files: File[]) => void
  onRemoveSaved: (flyer: PromotionFlyer) => void
  onRemovePending: (index: number) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const used = usedByOthers + saved.length + pending.length + uploading
  const free = Math.max(0, MAX_FLYERS_PER_BUSINESS - used)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ""
    if (files.length) onAdd(files)
  }

  const thumbClass = "relative aspect-[3/4] rounded-xl overflow-hidden bg-stone-100 border border-stone-200"

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <label className="block text-xs font-medium text-stone-500">Flyers (opcional)</label>
        {!needsBusiness && (
          <span className={`text-[11px] ${free === 0 ? "text-amber-600" : "text-stone-400"}`}>
            {used}/{MAX_FLYERS_PER_BUSINESS} del negocio
          </span>
        )}
      </div>

      <div className="grid grid-cols-4 gap-2">
        {saved.map(f => (
          <div key={f.id} className={thumbClass}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={f.url} alt="" className="w-full h-full object-contain" />
            <button
              type="button"
              onClick={() => onRemoveSaved(f)}
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center"
              aria-label="Quitar flyer"
            >
              <X size={12} />
            </button>
          </div>
        ))}

        {pending.map((p, i) => (
          <div key={p.preview} className={thumbClass}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.preview} alt="" className="w-full h-full object-contain" />
            <span className="absolute bottom-1 left-1 text-[9px] font-semibold px-1.5 py-0.5 rounded bg-white/90 text-stone-500">
              Al guardar
            </span>
            <button
              type="button"
              onClick={() => onRemovePending(i)}
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center"
              aria-label="Quitar flyer"
            >
              <X size={12} />
            </button>
          </div>
        ))}

        {Array.from({ length: uploading }).map((_, i) => (
          <div key={`up-${i}`} className={`${thumbClass} flex items-center justify-center`}>
            <Loader2 size={18} className="animate-spin text-stone-400" />
          </div>
        ))}

        {!needsBusiness && free > 0 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={`${thumbClass} border-dashed flex flex-col items-center justify-center gap-1 text-stone-400 hover:text-stone-600 hover:border-stone-300 transition-colors`}
          >
            <ImagePlus size={18} />
            <span className="text-[10px] font-medium">Agregar</span>
          </button>
        )}
      </div>

      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleChange} />

      <p className="text-xs text-stone-400 mt-1.5">
        {needsBusiness
          ? "Elegí el negocio para poder agregar flyers."
          : `Hasta ${MAX_FLYERS_PER_BUSINESS} por negocio, sumando todas sus promos. Se muestran enteros, sin recortar.`}
      </p>
    </div>
  )
}
