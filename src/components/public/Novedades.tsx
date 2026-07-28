"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { Novedad } from "@/types/database"

const ACCENT = "#6B7A5E"

function NovedadCard({ n }: { n: Novedad }) {
  const [expanded, setExpanded] = useState(false)
  const isLong = (n.content?.length ?? 0) > 140

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden shadow-sm flex flex-col h-full"
      style={{ borderLeft: `3px solid ${ACCENT}` }}
    >
      {n.image_url && (
        <div className="relative aspect-video bg-stone-100">
          <Image
            src={n.image_url}
            alt={n.title ?? "Novedad"}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 72vw, 360px"
          />
        </div>
      )}
      <div className="p-4 flex flex-col gap-1.5">
        {n.title && (
          <h3 className="font-serif text-sm font-bold text-stone-900 leading-snug">
            {n.title}
          </h3>
        )}
        {n.content && (
          <p className={`text-xs text-stone-600 leading-relaxed ${expanded ? "" : "line-clamp-3"}`}>
            {n.content}
          </p>
        )}
        {(isLong || n.locality) && (
          <div className="flex items-center mt-0.5">
            {isLong && (
              <button
                onClick={() => setExpanded(e => !e)}
                className="text-[10px] font-bold hover:opacity-70 transition-opacity"
                style={{ color: ACCENT }}
              >
                {expanded ? "Ver menos" : "Ver más"}
              </button>
            )}
            {n.locality && (
              <span className="text-[10px] font-semibold ml-auto" style={{ color: ACCENT }}>
                {n.locality}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

interface Props {
  novedades: Novedad[]
  hasMore: boolean
}

export default function Novedades({ novedades, hasMore }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  if (novedades.length === 0) return null

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
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="font-serif text-2xl md:text-3xl font-bold" style={{ color: ACCENT }}>
            Novedades
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Flechas — solo desktop */}
          {novedades.length > 2 && (
            <div className="hidden md:flex items-center gap-2">
              {(["left", "right"] as const).map(dir => (
                <button
                  key={dir}
                  onClick={() => scroll(dir)}
                  aria-label={dir === "left" ? "Novedad anterior" : "Novedad siguiente"}
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
                  style={{ border: `1.5px solid rgba(107,122,94,0.30)`, color: ACCENT }}
                  onMouseEnter={e => {
                    const b = e.currentTarget as HTMLButtonElement
                    b.style.borderColor = "rgba(107,122,94,0.70)"
                    b.style.background = "rgba(107,122,94,0.08)"
                  }}
                  onMouseLeave={e => {
                    const b = e.currentTarget as HTMLButtonElement
                    b.style.borderColor = "rgba(107,122,94,0.30)"
                    b.style.background = "transparent"
                  }}
                >
                  {dir === "left" ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                </button>
              ))}
            </div>
          )}

          {hasMore && (
            <Link
              href="/novedades"
              className="text-sm font-semibold hover:opacity-70 transition-opacity"
              style={{ color: ACCENT }}
            >
              Ver todas →
            </Link>
          )}
        </div>
      </div>

      {/* ── Carousel ─────────────────────────────────────────────── */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory pb-2"
      >
        {novedades.map(n => (
          <div key={n.id} className="flex-shrink-0 w-[72vw] max-w-[280px] snap-center">
            <NovedadCard n={n} />
          </div>
        ))}
      </div>

      {/* Dots — solo mobile, indican que hay más novedades para deslizar */}
      {novedades.length > 1 && (
        <div className="flex md:hidden items-center justify-center gap-1.5 mt-4">
          {novedades.map((n, i) => (
            <button
              key={n.id}
              onClick={() => scrollToIndex(i)}
              aria-label={`Ir a la novedad ${i + 1}`}
              className="rounded-full transition-all"
              style={{
                width: i === activeIndex ? 16 : 6,
                height: 6,
                background: i === activeIndex ? ACCENT : "rgba(107,122,94,0.30)",
              }}
            />
          ))}
        </div>
      )}
    </section>
  )
}
