"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, Calendar, ChevronDown, Share2 } from "lucide-react"
import PromoFlyersCarousel from "@/components/public/PromoFlyersCarousel"
import {
  fontDisplay,
  fontBody,
  TEXT_MAIN,
  TEXT_MUTED,
  BORDER,
  groupHeadline,
  type PromoGroup,
} from "@/lib/promos"

export async function shareGroup(group: PromoGroup) {
  if (typeof window === "undefined") return
  const url = group.link ? new URL(group.link, window.location.origin).toString() : window.location.href
  const { primary } = groupHeadline(group)
  const text = `¡Mirá ${group.promos.length > 1 ? "las promos" : "la promo"} de ${group.comercio} en Calamuchita App! ${primary}.`
  if (navigator.share) {
    await navigator.share({ title: "Calamuchita App", text, url }).catch(() => {})
  } else if (navigator.clipboard) {
    await navigator.clipboard.writeText(`${text} ${url}`).catch(() => {})
  }
}

// Contenido de un grupo de promos (todas las de un negocio): la lista de promos, el carrusel
// de flyers y el pie con Compartir / Ver negocio. Lo usan la tarjeta apilada del inicio, el
// detalle de escritorio y el perfil del negocio. Espera las variables --a/--b del color de la
// categoría en un contenedor de arriba.
export default function PromoGroupBody({
  group,
  maxPromos,
  showShare = true,
}: {
  group: PromoGroup
  /** Cuántas promos mostrar antes de "Ver todas". Sin valor: todas. */
  maxPromos?: number
  showShare?: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const limit = maxPromos && !expanded ? maxPromos : group.promos.length
  const visible = group.promos.slice(0, limit)
  const hidden = group.promos.length - visible.length

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col">
        {visible.map((p, i) => (
          <li
            key={p.id}
            className={`flex flex-col gap-1.5 ${i > 0 ? "mt-3 border-t pt-3" : ""}`}
            style={{ borderColor: BORDER }}
          >
            {(p.descuento_valor || p.descuento_label) && (
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold leading-none" style={{ ...fontDisplay, color: "var(--a)" }}>
                  {p.descuento_valor ?? p.descuento_label}
                </span>
                {p.descuento_valor && p.descuento_label && (
                  <span className="text-[11px] font-bold uppercase tracking-wider" style={{ ...fontBody, color: TEXT_MUTED }}>
                    {p.descuento_label}
                  </span>
                )}
              </div>
            )}
            <h4 className="text-[15px] font-bold leading-snug" style={{ ...fontDisplay, color: TEXT_MAIN }}>
              {p.titulo}
            </h4>
            {p.descripcion && (
              <p className="whitespace-pre-line text-[13px] leading-relaxed" style={{ ...fontBody, color: TEXT_MUTED }}>
                {p.descripcion}
              </p>
            )}
            {p.validez && (
              <span className="flex items-center gap-1.5 text-[12px]" style={{ ...fontBody, color: TEXT_MUTED }}>
                <Calendar size={13} aria-hidden="true" />
                {p.validez}
              </span>
            )}
          </li>
        ))}
      </ul>

      {hidden > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="inline-flex w-fit items-center gap-1 rounded-full px-3 py-1.5 text-[13px] font-semibold transition-colors hover:bg-black/5"
          style={{ ...fontBody, color: "var(--a)" }}
        >
          Ver todas ({group.promos.length})
          <ChevronDown size={14} aria-hidden="true" />
        </button>
      )}

      {group.flyers.length > 0 && (
        <PromoFlyersCarousel flyers={group.flyers} alt={group.comercio} />
      )}

      {(showShare || group.link) && (
        <div className="flex items-center justify-between gap-2 border-t pt-3" style={{ borderColor: BORDER }}>
          {showShare ? (
            <button
              type="button"
              onClick={() => shareGroup(group)}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-semibold transition-colors hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--a)"
              style={{ ...fontBody, color: TEXT_MAIN }}
            >
              <Share2 size={14} aria-hidden="true" />
              Compartir
            </button>
          ) : <span />}

          {group.link && (
            <Link
              href={group.link}
              className="group/link inline-flex items-center gap-1 rounded-full px-2 py-2 text-[13px] font-semibold transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--a)"
              style={{ ...fontBody, color: "var(--a)" }}
            >
              Ver negocio
              <ArrowRight
                size={14}
                aria-hidden="true"
                className="transition-transform duration-200 group-hover/link:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover/link:translate-x-0"
              />
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
