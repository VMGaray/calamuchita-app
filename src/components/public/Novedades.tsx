"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import type { Novedad } from "@/types/database"

const ACCENT = "#6B7A5E"

function NovedadCard({ n }: { n: Novedad }) {
  const [expanded, setExpanded] = useState(false)
  const isLong = (n.content?.length ?? 0) > 140

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden shadow-sm flex flex-col"
      style={{ borderLeft: `3px solid ${ACCENT}` }}
    >
      {n.image_url && (
        <div className="relative aspect-video bg-stone-100">
          <Image
            src={n.image_url}
            alt={n.title ?? "Novedad"}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 360px"
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
  if (novedades.length === 0) return null

  return (
    <section>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="font-serif text-2xl md:text-3xl font-bold" style={{ color: ACCENT }}>
            Novedades
          </h2>
        </div>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {novedades.map(n => <NovedadCard key={n.id} n={n} />)}
      </div>
    </section>
  )
}
