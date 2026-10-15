"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { Swiper, SwiperSlide } from "swiper/react"
import { Zoom, Keyboard } from "swiper/modules"
import { X } from "lucide-react"
import { useScrollLock } from "@/lib/hooks/useScrollLock"
import type { PromoFlyerView } from "@/lib/promos"
import "swiper/css"
import "swiper/css/zoom"

// Visor a pantalla completa de los flyers: deslizar entre flyers, zoom con dos dedos
// (o doble toque) y cerrar con la X o Escape. Va en un portal al <body> porque las tarjetas
// de promos usan transform (framer-motion) y un position:fixed adentro quedaría recortado.
export default function PromoFlyerViewer({
  flyers,
  startIndex,
  alt,
  onClose,
}: {
  flyers: PromoFlyerView[]
  startIndex: number
  alt: string
  onClose: () => void
}) {
  const [index, setIndex] = useState(startIndex)
  useScrollLock(true)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [onClose])

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex flex-col bg-black/95"
      role="dialog"
      aria-modal="true"
      aria-label={`Flyers de ${alt}`}
    >
      <div className="flex shrink-0 items-center justify-between px-4 py-3 text-white">
        <span className="text-sm font-medium text-white/80">
          {flyers.length > 1 ? `${index + 1} / ${flyers.length}` : ""}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
          aria-label="Cerrar"
        >
          <X size={20} />
        </button>
      </div>

      <Swiper
        modules={[Zoom, Keyboard]}
        zoom={{ maxRatio: 4 }}
        keyboard={{ enabled: true }}
        initialSlide={startIndex}
        onSlideChange={s => setIndex(s.activeIndex)}
        spaceBetween={16}
        className="min-h-0 w-full flex-1"
      >
        {flyers.map((f, i) => (
          <SwiperSlide key={f.id} className="flex items-center justify-center">
            <div className="swiper-zoom-container">
              {/* eslint-disable-next-line @next/next/no-img-element -- el zoom de Swiper necesita un <img> directo, en resolución completa */}
              <img
                src={f.url}
                alt={`${alt} — flyer ${i + 1}`}
                className="max-h-full max-w-full object-contain"
                draggable={false}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <p className="shrink-0 py-3 text-center text-xs text-white/50">
        Pellizcá o tocá dos veces para hacer zoom
      </p>
    </div>,
    document.body
  )
}
