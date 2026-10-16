"use client"

import type { CSSProperties } from "react"
import { useId } from "react"
import Image from "next/image"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { ChevronDown, Images } from "lucide-react"
import PromoGroupBody from "@/components/public/PromoGroupBody"
import {
  fontDisplay,
  fontBody,
  CATEGORY_COLORS,
  normalizeCategoria,
  groupHeadline,
  type PromoGroup,
} from "@/lib/promos"
import { getInitials } from "@/components/public/PromoCoupon"

// ─────────────────────────────────────────────────────────────
// Tarjeta del stack tipo acordeón (inicio, mobile): una por negocio.
// Solo se ve la cabecera de color hasta que se toca; el cuerpo (promos
// del negocio + carrusel de flyers) se revela empujando el flujo normal
// del documento hacia abajo — sin translateY manual.
// ─────────────────────────────────────────────────────────────

/** Solape vertical entre cabeceras consecutivas (desde la 2da card en adelante). */
const OVERLAP_PX = 26
/** A partir de esta cantidad de cards el inset horizontal queda constante (0). */
const INSET_MAX_INDEX = 4
const INSET_STEP_PX = 4

function insetForIndex(index: number): number {
  return Math.max(0, (INSET_MAX_INDEX - Math.min(index, INSET_MAX_INDEX)) * INSET_STEP_PX)
}

export interface PromoAccordionCardProps {
  group: PromoGroup
  index: number
  isOpen: boolean
  onToggle: () => void
}

export default function PromoAccordionCard({ group, index, isOpen, onToggle }: PromoAccordionCardProps) {
  const reactId = useId()
  const headerId = `promo-header-${reactId}`
  const bodyId = `promo-body-${reactId}`
  const shouldReduceMotion = useReducedMotion()

  const categoria = normalizeCategoria(group.categoria)
  const categoryColor = CATEGORY_COLORS[categoria]
  // Mismo color que el detalle (PromoCoupon): por categoría, no por índice.
  const { a, b } = categoryColor
  const { primary, secondary } = groupHeadline(group)
  const firstFlyer = group.flyers[0]

  const cardStyle = { "--a": a, "--b": b } as CSSProperties

  const bodyContent = (
    <div className="flex flex-col gap-3 px-5 py-5 sm:px-6">
      <span
        className="inline-flex w-fit items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider"
        style={{ ...fontBody, color: categoryColor.a, background: `color-mix(in srgb, ${categoryColor.a} 14%, white)` }}
      >
        {categoryColor.label}
      </span>
      <PromoGroupBody group={group} />
    </div>
  )

  return (
    <li
      style={{
        zIndex: 1000 - index,
        marginTop: index === 0 ? 0 : -OVERLAP_PX,
        marginInline: insetForIndex(index),
        position: "relative",
        listStyle: "none",
      }}
    >
      <div style={cardStyle} className="overflow-hidden rounded-[26px] bg-white shadow-[0_10px_28px_rgba(42,26,8,0.16)]">
        <button
          type="button"
          id={headerId}
          aria-expanded={isOpen}
          aria-controls={bodyId}
          onClick={onToggle}
          className="flex w-full items-center gap-3 px-5 py-4 text-left sm:px-6 sm:py-5 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-white"
          style={{ background: `linear-gradient(145deg, ${a}, ${b})` }}
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[13px] bg-white/95 shadow-[0_3px_8px_rgba(0,0,0,0.18)]">
            {group.logo_url ? (
              <div className="relative h-full w-full p-1">
                <Image src={group.logo_url} alt={`Logo de ${group.comercio}`} fill sizes="44px" className="object-contain" />
              </div>
            ) : (
              <span aria-hidden="true" className="text-sm font-bold" style={{ ...fontDisplay, color: a }}>
                {getInitials(group.comercio)}
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-bold text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.18)]" style={fontDisplay}>
              {group.comercio}
            </p>
            <p className="truncate text-[12px] font-semibold text-white/85" style={fontBody}>
              {primary}
              {secondary ? ` · ${secondary}` : ""}
            </p>
            {firstFlyer && (
              <p className="mt-0.5 flex items-center gap-1 text-[11px] font-semibold text-white/90" style={fontBody}>
                <Images size={12} aria-hidden="true" />
                Ver flyers ({group.flyers.length})
              </p>
            )}
          </div>

          {firstFlyer && (
            <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded-lg bg-white/90 shadow-[0_3px_8px_rgba(0,0,0,0.18)]">
              <Image src={firstFlyer.url} alt="" fill sizes="40px" className="object-contain" />
            </div>
          )}

          <motion.span
            className="shrink-0 text-white/90"
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={shouldReduceMotion ? { duration: 0 } : { type: "spring", stiffness: 350, damping: 30 }}
          >
            <ChevronDown size={18} aria-hidden="true" />
          </motion.span>
        </button>

        {shouldReduceMotion ? (
          isOpen && (
            <div id={bodyId} role="region" aria-labelledby={headerId} className="bg-[#FDF9F3]">
              {bodyContent}
            </div>
          )
        ) : (
          <AnimatePresence initial={false}>
            {isOpen && (
              <motion.div
                key="body"
                id={bodyId}
                role="region"
                aria-labelledby={headerId}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                style={{ overflow: "hidden" }}
                className="bg-[#FDF9F3]"
              >
                {bodyContent}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </li>
  )
}
