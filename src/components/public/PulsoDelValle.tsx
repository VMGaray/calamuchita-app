"use client"

import Image from "next/image"
import Link from "next/link"
import { useRef, useState } from "react"
import { ChevronLeft, ChevronRight, FileText } from "lucide-react"
import type { EditorialPost } from "@/app/(public)/page"

// Colores de badge para fondo blanco — contraste legible sobre tarjeta clara
const TYPE_BADGE: Record<string, { bg: string; color: string; dot: string }> = {
  "Entrevista":      { bg: "rgba(45,69,48,0.10)",   color: "#2D4530", dot: "#2D4530"  },
  "Efeméride":       { bg: "rgba(124,92,58,0.12)",  color: "#7C5C3A", dot: "#7C5C3A"  },
  "Tip del Finde":   { bg: "rgba(180,145,30,0.13)", color: "#7A6000", dot: "#A08020"  },
  "Novedad":         { bg: "rgba(74,85,162,0.10)",  color: "#4A55A2", dot: "#4A55A2"  },
  "Noticias":        { bg: "rgba(190,30,30,0.10)",  color: "#B01E1E", dot: "#C02020"  },
  "Nota de interés": { bg: "rgba(20,130,160,0.11)", color: "#0F7A96", dot: "#1090B0"  },
}

const DEFAULT_BADGE = { bg: "rgba(45,69,48,0.08)", color: "#2D4530", dot: "#2D4530" }

interface Props {
  posts: EditorialPost[]
}

export default function PulsoDelValle({ posts }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  if (posts.length === 0) return null

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir === "left" ? -296 : 296, behavior: "smooth" })
  }

  const scrollToIndex = (i: number) => {
    const el = scrollRef.current
    const card = el?.children[i] as HTMLElement | undefined
    if (!el || !card) return
    el.scrollTo({ left: card.offsetLeft, behavior: "smooth" })
  }

  const handleScroll = () => {
    const el = scrollRef.current
    if (!el) return
    let closest = 0
    let closestDist = Infinity
    Array.from(el.children).forEach((child, i) => {
      const dist = Math.abs((child as HTMLElement).offsetLeft - el.scrollLeft)
      if (dist < closestDist) { closestDist = dist; closest = i }
    })
    setActiveIndex(closest)
  }

  return (
    <section>

      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="flex items-end justify-between mb-6">
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

        {/* Flechas — solo desktop */}
        {posts.length > 2 && (
          <div className="hidden md:flex items-center gap-2">
            {(["left", "right"] as const).map(dir => (
              <button
                key={dir}
                onClick={() => scroll(dir)}
                aria-label={dir === "left" ? "Nota anterior" : "Nota siguiente"}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
                style={{ border: "1.5px solid rgba(225,219,201,0.30)", color: "rgba(225,219,201,0.55)" }}
                onMouseEnter={e => {
                  const b = e.currentTarget as HTMLButtonElement
                  b.style.borderColor = "rgba(225,219,201,0.70)"
                  b.style.color = "#E1DBC9"
                  b.style.background = "rgba(225,219,201,0.08)"
                }}
                onMouseLeave={e => {
                  const b = e.currentTarget as HTMLButtonElement
                  b.style.borderColor = "rgba(225,219,201,0.30)"
                  b.style.color = "rgba(225,219,201,0.55)"
                  b.style.background = "transparent"
                }}
              >
                {dir === "left" ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Carousel ─────────────────────────────────────────────── */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory pb-2"
      >
        {posts.map((post, i) => {
          const badge = TYPE_BADGE[post.type] ?? DEFAULT_BADGE

          return (
            <Link
              key={post.id}
              href={`/identidad-calamuchitana/${post.id}`}
              className="flex-shrink-0 w-[72vw] max-w-[280px] snap-center bg-white rounded-2xl overflow-hidden flex flex-col shadow-md hover:shadow-lg transition-shadow group"
            >
              {/* Imagen — aspect-[4/3] fijo, anti-CLS */}
              <div className="relative aspect-[4/3] overflow-hidden bg-stone-100 flex-shrink-0">
                {/* shimmer sobre fondo claro */}
                <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-stone-100 via-stone-50 to-stone-100" />

                {post.image_url ? (
                  <Image
                    src={post.image_url}
                    alt={post.title}
                    fill
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 72vw, 280px"
                    quality={75}
                    priority={i < 2}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FileText size={28} className="text-stone-300" />
                  </div>
                )}

                {/* Gradiente oscuro en la base de la imagen con el tipo */}
                <div
                  className="absolute bottom-0 left-0 right-0 px-3 pb-2.5 pt-8"
                  style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55), transparent)" }}
                >
                  <span className="text-[9px] font-black uppercase tracking-[0.18em] text-white/90">
                    {post.type}
                  </span>
                </div>
              </div>

              {/* Cuerpo de la tarjeta — fondo blanco, texto oscuro de alto contraste */}
              <div className="p-4 flex flex-col gap-2 flex-1">

                {/* Badge de categoría con color semántico sobre fondo blanco */}
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

                {/* Título — charcoal oscuro, máxima legibilidad */}
                <h3 className="font-serif text-sm font-bold text-stone-900 leading-snug line-clamp-2">
                  {post.title}
                </h3>

                {/* Descripción — gris oscuro legible */}
                {post.description && (
                  <p className="text-xs text-stone-600 font-medium leading-relaxed line-clamp-2 mt-1">
                    {post.description}
                  </p>
                )}

                <span className="text-[10px] font-bold text-stone-400 mt-auto pt-1">
                  Leer más →
                </span>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Dots — solo mobile, indican que hay más notas para deslizar */}
      {posts.length > 1 && (
        <div className="flex md:hidden items-center justify-center gap-1.5 mt-4">
          {posts.map((post, i) => (
            <button
              key={post.id}
              onClick={() => scrollToIndex(i)}
              aria-label={`Ir a la nota ${i + 1}`}
              className="rounded-full transition-all"
              style={{
                width: i === activeIndex ? 16 : 6,
                height: 6,
                background: i === activeIndex ? "#E1DBC9" : "rgba(225,219,201,0.35)",
              }}
            />
          ))}
        </div>
      )}
    </section>
  )
}
