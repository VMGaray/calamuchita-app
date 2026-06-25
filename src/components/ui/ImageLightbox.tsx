"use client"

import Image from "next/image"
import { useState, useEffect, useCallback } from "react"
import { X } from "lucide-react"

interface Props {
  src: string
  alt: string
  /** Classes for the clickable trigger container (no incluir 'relative', ya está). */
  containerClassName?: string
  sizes?: string
  quality?: number
  priority?: boolean
}

export default function ImageLightbox({
  src,
  alt,
  containerClassName = "",
  sizes,
  quality = 85,
  priority,
}: Props) {
  const [open, setOpen] = useState(false)

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close() }
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [open, close])

  return (
    <>
      {/* Trigger — imagen en su contenedor original */}
      <div
        className={`relative cursor-zoom-in ${containerClassName}`}
        onClick={() => setOpen(true)}
        role="button"
        tabIndex={0}
        aria-label="Ver imagen ampliada"
        onKeyDown={e => e.key === "Enter" && setOpen(true)}
      >
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-stone-100 via-stone-50 to-stone-100" />
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          className="object-cover object-top"
          sizes={sizes}
          quality={quality}
        />
      </div>

      {/* Overlay — siempre montado, entra/sale con opacity + scale */}
      <div
        className={`fixed inset-0 z-[200] flex items-center justify-center transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{
          background: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
        }}
        onClick={close}
        aria-modal
        role="dialog"
        aria-label={alt}
      >
        {/* Botón cerrar */}
        <button
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-white/20"
          style={{
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.20)",
            color: "white",
          }}
          onClick={close}
          aria-label="Cerrar"
        >
          <X size={18} />
        </button>

        {/* Imagen ampliada — stopPropagation para no cerrar al clickear la imagen */}
        <div
          className={`relative w-[90vw] h-[90vh] transition-all duration-300 ${
            open ? "scale-100 opacity-100" : "scale-95 opacity-0"
          }`}
          onClick={e => e.stopPropagation()}
        >
          <Image
            src={src}
            alt={alt}
            fill
            className="object-contain"
            sizes="90vw"
            quality={90}
          />
        </div>
      </div>
    </>
  )
}
