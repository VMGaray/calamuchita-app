"use client"

import type { CSSProperties } from "react"
import Image from "next/image"
import PromoGroupBody from "@/components/public/PromoGroupBody"
import {
  promoFontVariables,
  fontDisplay,
  fontBody,
  SECTION_BG,
  TEXT_MAIN,
  BORDER,
  CATEGORY_COLORS,
  normalizeCategoria,
  groupHeadline,
  type PromoGroup,
} from "@/lib/promos"

// Todo lo que es dato/lógica puro (tipos, tokens, CATEGORY_COLORS, fuentes,
// sectionToCategoria, buildPromoDiscount, buildPromoGroup) vive en
// @/lib/promos — ese módulo NO tiene "use client", así que page.tsx (Server
// Component) puede importarlo y llamarlo directo durante el render en el
// servidor. Re-exportamos todo acá para que los consumidores "use client"
// sigan importando de este archivo.
export * from "@/lib/promos"

// Exportados: reutilizados también por PromoAccordionCard y PromoMasterDetail.
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

/** Achica la fuente del número grande si el texto es largo (ej "Envío Gratis"). */
export function getDiscountSizeClass(text: string): string {
  const len = text.length
  if (len <= 4) return "text-4xl sm:text-5xl"
  if (len <= 7) return "text-3xl sm:text-4xl"
  if (len <= 11) return "text-2xl sm:text-3xl"
  return "text-lg sm:text-xl"
}

// ─────────────────────────────────────────────────────────────
// Decoración: curvas topográficas de fondo
// ─────────────────────────────────────────────────────────────

function TopoLines() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 400 220"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 h-full w-full select-none opacity-[0.15]"
    >
      <path d="M-10 40 C 80 10, 140 70, 220 35 S 380 15, 420 45" fill="none" stroke="white" strokeWidth="1.5" />
      <path d="M-10 90 C 70 55, 160 130, 240 85 S 360 60, 420 100" fill="none" stroke="white" strokeWidth="1.5" />
      <path d="M-10 140 C 90 105, 150 175, 250 135 S 350 110, 420 150" fill="none" stroke="white" strokeWidth="1.5" />
      <path d="M-10 190 C 60 160, 180 215, 260 175 S 370 155, 420 195" fill="none" stroke="white" strokeWidth="1.5" />
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────
// Cupón de un negocio con todas sus promos vigentes — detalle de
// escritorio en el inicio y bloque de promos del perfil.
// ─────────────────────────────────────────────────────────────

export interface PromoCouponProps {
  group: PromoGroup
  /** Cuántas promos mostrar antes de "Ver todas" (perfil: 3). */
  maxPromos?: number
}

export default function PromoCoupon({ group, maxPromos }: PromoCouponProps) {
  const categoria = normalizeCategoria(group.categoria)
  const { a, b } = CATEGORY_COLORS[categoria]
  const { primary, secondary } = groupHeadline(group)

  const cardStyle = { "--a": a, "--b": b } as CSSProperties

  return (
    <article
      style={cardStyle}
      className={`${promoFontVariables} flex h-full flex-col overflow-hidden rounded-[22px] bg-white shadow-[0_4px_18px_rgba(12,42,32,0.08)]`}
    >
      {/* Zona superior de color */}
      <div
        className="relative overflow-hidden px-5 py-6 sm:px-6"
        style={{ background: "linear-gradient(145deg, var(--a), var(--b))" }}
      >
        <TopoLines />

        <div className="relative z-10 flex items-start justify-between gap-3">
          <div className="flex h-13 w-13 shrink-0 items-center justify-center overflow-hidden rounded-[15px] bg-white shadow-[0_4px_10px_rgba(0,0,0,0.18)]">
            {group.logo_url ? (
              <div className="relative h-full w-full p-1.5">
                <Image src={group.logo_url} alt={`Logo de ${group.comercio}`} fill sizes="52px" className="object-contain" />
              </div>
            ) : (
              <span aria-hidden="true" className="text-lg font-bold" style={{ ...fontDisplay, color: "var(--a)" }}>
                {getInitials(group.comercio)}
              </span>
            )}
          </div>

          <div className="min-w-0 text-right text-white">
            <p
              className={`${getDiscountSizeClass(primary)} font-extrabold leading-none [text-shadow:0_2px_10px_rgba(0,0,0,0.18)]`}
              style={fontDisplay}
            >
              {primary}
            </p>
            {secondary && (
              <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-white/85" style={fontBody}>
                {secondary}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Perforación estilo cupón */}
      <div className="relative h-0">
        <div className="absolute inset-x-0 top-0 border-t-2 border-dashed" style={{ borderColor: BORDER }} />
        <span aria-hidden="true" className="absolute left-0 top-0 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: SECTION_BG }} />
        <span aria-hidden="true" className="absolute right-0 top-0 h-5 w-5 -translate-y-1/2 translate-x-1/2 rounded-full" style={{ background: SECTION_BG }} />
      </div>

      {/* Cuerpo */}
      <div className="flex flex-1 flex-col gap-3 px-5 py-5 sm:px-6">
        <span
          className="inline-flex w-fit items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider"
          style={{ ...fontBody, color: "var(--a)", background: "color-mix(in srgb, var(--a) 14%, white)" }}
        >
          {CATEGORY_COLORS[categoria].label}
        </span>

        <h3 className="text-[17px] font-bold leading-snug sm:text-lg" style={{ ...fontDisplay, color: TEXT_MAIN }}>
          {group.comercio}
        </h3>

        <PromoGroupBody group={group} maxPromos={maxPromos} />
      </div>
    </article>
  )
}
