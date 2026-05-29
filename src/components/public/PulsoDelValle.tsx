"use client"

import Image from "next/image"
import { useRef } from "react"
import { ChevronLeft, ChevronRight, FileText } from "lucide-react"
import type { EditorialPost } from "@/app/(public)/page"

// Estilos del badge por tipo — colores suaves sobre el fondo oscuro glass
const TYPE_BADGE: Record<string, { bg: string; color: string; dot: string }> = {
  "Entrevista":    { bg: "rgba(45,160,70,0.22)",   color: "#88EAA0", dot: "#6FD98A" },
  "Efeméride":     { bg: "rgba(200,175,130,0.22)", color: "#D4B896", dot: "#C9A870" },
  "Tip del Finde": { bg: "rgba(205,175,60,0.22)",  color: "#DDD07A", dot: "#C9B84B" },
  "Novedad":       { bg: "rgba(130,150,220,0.22)", color: "#B0BFEE", dot: "#8B9FE0" },
}

const DEFAULT_BADGE = { bg: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.70)", dot: "rgba(255,255,255,0.40)" }

interface Props {
  posts: EditorialPost[]
}

export default function PulsoDelValle({ posts }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Sección oculta limpiamente si no hay posts activos
  if (posts.length === 0) return null

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current
    if (!el) return
    const cardWidth = 280 + 16 // card width + gap
    el.scrollBy({ left: dir === "left" ? -cardWidth : cardWidth, behavior: "smooth" })
  }

  return (
    <section className="my-8 md:my-12">

      {/* ── Header ───────────────────────────────────────────── */}
      <div className="flex items-end justify-between mb-5 px-1">
        <div>
          <p
            className="text-[10px] font-black uppercase tracking-[0.22em] mb-1.5"
            style={{ color: "rgba(225,219,201,0.55)" }}
          >
            Editorial
          </p>
          <h2
            className="font-serif text-2xl md:text-3xl font-bold leading-none"
            style={{ color: "#E1DBC9" }}
          >
            Identidad Calamuchitana
          </h2>
        </div>

        {/* Flechas de navegación — solo en desktop */}
        {posts.length > 2 && (
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => scroll("left")}
              aria-label="Nota anterior"
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
              style={{ border: "1.5px solid rgba(225,219,201,0.28)", color: "rgba(225,219,201,0.50)" }}
              onMouseEnter={e => {
                const b = e.currentTarget as HTMLButtonElement
                b.style.borderColor = "rgba(225,219,201,0.65)"
                b.style.color = "#E1DBC9"
              }}
              onMouseLeave={e => {
                const b = e.currentTarget as HTMLButtonElement
                b.style.borderColor = "rgba(225,219,201,0.28)"
                b.style.color = "rgba(225,219,201,0.50)"
              }}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => scroll("right")}
              aria-label="Nota siguiente"
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
              style={{ border: "1.5px solid rgba(225,219,201,0.28)", color: "rgba(225,219,201,0.50)" }}
              onMouseEnter={e => {
                const b = e.currentTarget as HTMLButtonElement
                b.style.borderColor = "rgba(225,219,201,0.65)"
                b.style.color = "#E1DBC9"
              }}
              onMouseLeave={e => {
                const b = e.currentTarget as HTMLButtonElement
                b.style.borderColor = "rgba(225,219,201,0.28)"
                b.style.color = "rgba(225,219,201,0.50)"
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* ── Carousel ─────────────────────────────────────────── */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory -mx-4 px-4 pb-3 md:mx-0 md:px-0"
      >
        {posts.map((post, i) => {
          const badge = TYPE_BADGE[post.type] ?? DEFAULT_BADGE

          return (
            <article
              key={post.id}
              className="flex-shrink-0 w-[72vw] max-w-[280px] snap-center rounded-2xl overflow-hidden flex flex-col group cursor-pointer"
              style={{
                background: "rgba(255,255,255,0.09)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: "1px solid rgba(255,255,255,0.16)",
                boxShadow: "0 6px 24px rgba(0,0,0,0.20)",
              }}
            >
              {/* ── Imagen — aspect-video fijo, anti-CLS ── */}
              <div className="relative aspect-video overflow-hidden bg-white/8 flex-shrink-0">
                {/* shimmer visible mientras carga la imagen */}
                <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-white/5 via-white/10 to-white/5" />

                {post.image_url ? (
                  <Image
                    src={post.image_url}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 72vw, 280px"
                    quality={75}
                    priority={i < 2}
                  />
                ) : (
                  /* Fallback elegante cuando no hay imagen */
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FileText size={28} style={{ color: "rgba(225,219,201,0.20)" }} />
                  </div>
                )}

                {/* Gradiente + label de tipo sobre la imagen */}
                <div
                  className="absolute bottom-0 left-0 right-0 px-3 pb-3 pt-8"
                  style={{ background: "linear-gradient(to top, rgba(0,0,0,0.60), transparent)" }}
                >
                  <span className="text-[9px] font-black uppercase tracking-[0.18em] text-white/85">
                    {post.type}
                  </span>
                </div>
              </div>

              {/* ── Cuerpo de la tarjeta ── */}
              <div className="px-4 pt-3 pb-4 flex flex-col gap-2 flex-1">

                {/* Badge de color por tipo — distingue visualmente la categoría */}
                <span
                  className="self-start text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1.5"
                  style={{ background: badge.bg, color: badge.color }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: badge.dot }}
                  />
                  {post.type}
                </span>

                {/* Título */}
                <h3
                  className="font-serif text-sm font-bold leading-snug line-clamp-2"
                  style={{ color: "#E1DBC9" }}
                >
                  {post.title}
                </h3>

                {/* Descripción */}
                {post.description && (
                  <p
                    className="text-xs leading-relaxed line-clamp-2"
                    style={{ color: "rgba(225,219,201,0.58)" }}
                  >
                    {post.description}
                  </p>
                )}

                <span
                  className="text-[10px] font-bold mt-auto pt-1"
                  style={{ color: "rgba(225,219,201,0.35)" }}
                >
                  Leer más →
                </span>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
