"use client"

import type { CSSProperties } from "react"
import Image from "next/image"
import Link from "next/link"
import { Share2, ArrowRight, Calendar } from "lucide-react"
import {
  promoFontVariables,
  fontDisplay,
  fontBody,
  SECTION_BG,
  TEXT_MAIN,
  TEXT_MUTED,
  BORDER,
  CATEGORY_COLORS,
  normalizeCategoria,
  type Promo,
} from "@/lib/promos"

// Todo lo que es dato/lógica puro (tipos, tokens, CATEGORY_COLORS, fuentes,
// sectionToCategoria, buildPromoDiscount, formatValidUntil) vive en
// @/lib/promos — ese módulo NO tiene "use client", así que page.tsx (Server
// Component) puede importarlo y llamarlo directo durante el render en el
// servidor. Re-exportamos todo acá para que los consumidores "use client"
// (PromosExclusivas, NegocioDetalle) sigan importando de este archivo sin
// cambios.
export * from "@/lib/promos"

// Exportados: reutilizados también por PromoAccordionCard (stack de la home).
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

export function isExternalLink(href: string): boolean {
  return /^https?:\/\//i.test(href)
}

export async function defaultShare(promo: Promo) {
  if (typeof window === "undefined") return
  const url = promo.link ?? window.location.href
  const discount = promo.descuento_valor ?? promo.descuento_label ?? "una promo especial"
  const text = `¡Mirá esta promo de ${promo.comercio} en Calamuchita App! ${discount}.`

  if (navigator.share) {
    await navigator.share({ title: "Calamuchita App", text, url }).catch(() => {})
  } else if (navigator.clipboard) {
    await navigator.clipboard.writeText(`${text} ${url}`).catch(() => {})
  }
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
// Card individual (cupón) — compartida entre la sección de la home
// y el perfil del negocio.
// ─────────────────────────────────────────────────────────────

export interface PromoCouponProps {
  promo: Promo
  /** Si no se pasa, usa Web Share API con fallback a portapapeles. */
  onShare?: (promo: Promo) => void
}

export default function PromoCoupon({ promo, onShare }: PromoCouponProps) {
  const handleShare = onShare ?? defaultShare
  const categoria = normalizeCategoria(promo.categoria)
  const { a, b } = CATEGORY_COLORS[categoria]

  const bigLabel = promo.descuento_valor ?? promo.descuento_label ?? "Oferta especial"
  const smallLabel = promo.descuento_valor ? promo.descuento_label : null

  const cardStyle = { "--a": a, "--b": b } as CSSProperties

  return (
    <article
      style={cardStyle}
      className={`${promoFontVariables} group flex h-full flex-col overflow-hidden rounded-[22px] bg-white shadow-[0_4px_18px_rgba(12,42,32,0.08)] transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_20px_44px_rgba(12,42,32,0.18)] motion-reduce:transition-none motion-reduce:hover:translate-y-0`}
    >
      {/* Zona superior de color */}
      <div
        className="relative overflow-hidden px-5 py-6 sm:px-6"
        style={{ background: "linear-gradient(145deg, var(--a), var(--b))" }}
      >
        <TopoLines />

        <div className="relative z-10 flex items-start justify-between gap-3">
          {/* Logo / iniciales */}
          <div className="flex h-13 w-13 shrink-0 items-center justify-center overflow-hidden rounded-[15px] bg-white shadow-[0_4px_10px_rgba(0,0,0,0.18)]">
            {promo.logo_url ? (
              <div className="relative h-full w-full p-1.5">
                <Image
                  src={promo.logo_url}
                  alt={`Logo de ${promo.comercio}`}
                  fill
                  sizes="52px"
                  className="object-contain"
                />
              </div>
            ) : (
              <span
                aria-hidden="true"
                className="text-lg font-bold"
                style={{ ...fontDisplay, color: "var(--a)" }}
              >
                {getInitials(promo.comercio)}
              </span>
            )}
          </div>

          {/* Descuento */}
          <div className="min-w-0 text-right text-white">
            <p
              className={`${getDiscountSizeClass(bigLabel)} font-extrabold leading-none [text-shadow:0_2px_10px_rgba(0,0,0,0.18)]`}
              style={fontDisplay}
            >
              {bigLabel}
            </p>
            {smallLabel && (
              <p
                className="mt-1 text-[11px] font-bold uppercase tracking-wider text-white/85"
                style={fontBody}
              >
                {smallLabel}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Perforación estilo cupón */}
      <div className="relative h-0">
        <div
          className="absolute inset-x-0 top-0 border-t-2 border-dashed"
          style={{ borderColor: BORDER }}
        />
        <span
          aria-hidden="true"
          className="absolute left-0 top-0 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: SECTION_BG }}
        />
        <span
          aria-hidden="true"
          className="absolute right-0 top-0 h-5 w-5 -translate-y-1/2 translate-x-1/2 rounded-full"
          style={{ background: SECTION_BG }}
        />
      </div>

      {/* Cuerpo */}
      <div className="flex flex-1 flex-col gap-3 px-5 py-5 sm:px-6">
        <span
          className="inline-flex w-fit items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider"
          style={{
            ...fontBody,
            color: "var(--a)",
            background: "color-mix(in srgb, var(--a) 14%, white)",
          }}
        >
          {CATEGORY_COLORS[categoria].label}
        </span>

        <h3
          className="text-[17px] font-bold leading-snug sm:text-lg"
          style={{ ...fontDisplay, color: TEXT_MAIN }}
        >
          {promo.comercio}
        </h3>

        {promo.validez && (
          <div className="flex items-center gap-1.5">
            <Calendar size={14} style={{ color: TEXT_MUTED }} aria-hidden="true" />
            <span className="text-[13px]" style={{ ...fontBody, color: TEXT_MUTED }}>
              {promo.validez}
            </span>
          </div>
        )}

        {/* Footer */}
        <div
          className="mt-auto flex items-center justify-between gap-2 border-t pt-3"
          style={{ borderColor: BORDER }}
        >
          <button
            type="button"
            onClick={() => handleShare(promo)}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-semibold transition-colors hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--a)"
            style={{ ...fontBody, color: TEXT_MAIN }}
          >
            <Share2 size={14} aria-hidden="true" />
            Compartir
          </button>

          {promo.link &&
            (isExternalLink(promo.link) ? (
              <a
                href={promo.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group/link inline-flex items-center gap-1 rounded-full px-2 py-2 text-[13px] font-semibold transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--a)"
                style={{ ...fontBody, color: "var(--a)" }}
              >
                Ver promo
                <ArrowRight
                  size={14}
                  aria-hidden="true"
                  className="transition-transform duration-200 group-hover/link:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover/link:translate-x-0"
                />
              </a>
            ) : (
              <Link
                href={promo.link}
                className="group/link inline-flex items-center gap-1 rounded-full px-2 py-2 text-[13px] font-semibold transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--a)"
                style={{ ...fontBody, color: "var(--a)" }}
              >
                Ver promo
                <ArrowRight
                  size={14}
                  aria-hidden="true"
                  className="transition-transform duration-200 group-hover/link:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover/link:translate-x-0"
                />
              </Link>
            ))}
        </div>
      </div>
    </article>
  )
}
