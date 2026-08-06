"use client"

import type { CSSProperties } from "react"
import { useId } from "react"
import Image from "next/image"
import Link from "next/link"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { Calendar, ChevronDown, Share2, ArrowRight } from "lucide-react"
import {
  fontDisplay,
  fontBody,
  TEXT_MAIN,
  TEXT_MUTED,
  BORDER,
  CATEGORY_COLORS,
  normalizeCategoria,
  type Promo,
} from "@/lib/promos"
import {
  getInitials,
  getDiscountSizeClass,
  isExternalLink,
  defaultShare,
} from "@/components/public/PromoCoupon"

// ─────────────────────────────────────────────────────────────
// Card individual del stack tipo acordeón (home). A diferencia de
// PromoCoupon (card plana, siempre expandida, usada en el perfil de
// negocio), acá solo se ve la cabecera de color hasta que se hace clic;
// el cuerpo se revela empujando el flujo normal del documento hacia
// abajo — sin translateY manual.
// ─────────────────────────────────────────────────────────────

/** Solape vertical entre cabeceras consecutivas (desde la 2da card en adelante). */
const OVERLAP_PX = 26
/** A partir de esta cantidad de cards el inset horizontal queda constante (0). */
const INSET_MAX_INDEX = 4
const INSET_STEP_PX = 4

function insetForIndex(index: number): number {
  return Math.max(0, (INSET_MAX_INDEX - Math.min(index, INSET_MAX_INDEX)) * INSET_STEP_PX)
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.04 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
}

export interface PromoAccordionCardProps {
  promo: Promo
  index: number
  isOpen: boolean
  onToggle: () => void
  onShare?: (promo: Promo) => void
}

export default function PromoAccordionCard({
  promo,
  index,
  isOpen,
  onToggle,
  onShare,
}: PromoAccordionCardProps) {
  const reactId = useId()
  const headerId = `promo-header-${reactId}`
  const bodyId = `promo-body-${reactId}`
  const shouldReduceMotion = useReducedMotion()

  const handleShare = onShare ?? defaultShare
  const categoria = normalizeCategoria(promo.categoria)
  const categoryColor = CATEGORY_COLORS[categoria]
  // Mismo color que la card de detalle (PromoCoupon): por categoría, no por
  // índice — así el mismo negocio se ve igual en el acordeón y en el detalle.
  const { a, b } = categoryColor

  const bigLabel = promo.descuento_valor ?? promo.descuento_label ?? "Oferta especial"
  const smallLabel = promo.descuento_valor ? promo.descuento_label : null

  const cardStyle = { "--a": a, "--b": b } as CSSProperties

  const bodyContent = (
    <div className="flex flex-col gap-3 px-5 py-5 sm:px-6">
      <motion.div
        variants={shouldReduceMotion ? undefined : itemVariants}
        className="flex items-baseline gap-2"
      >
        <span
          className={`${getDiscountSizeClass(bigLabel)} font-extrabold leading-none`}
          style={{ ...fontDisplay, color: "var(--a)" }}
        >
          {bigLabel}
        </span>
        {smallLabel && (
          <span
            className="text-[11px] font-bold uppercase tracking-wider"
            style={{ ...fontBody, color: TEXT_MUTED }}
          >
            {smallLabel}
          </span>
        )}
      </motion.div>

      <motion.span
        variants={shouldReduceMotion ? undefined : itemVariants}
        className="inline-flex w-fit items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider"
        style={{
          ...fontBody,
          color: categoryColor.a,
          background: `color-mix(in srgb, ${categoryColor.a} 14%, white)`,
        }}
      >
        {categoryColor.label}
      </motion.span>

      <motion.h4
        variants={shouldReduceMotion ? undefined : itemVariants}
        className="text-[17px] font-bold leading-snug"
        style={{ ...fontDisplay, color: TEXT_MAIN }}
      >
        {promo.comercio}
      </motion.h4>

      {promo.descripcion && (
        <motion.p
          variants={shouldReduceMotion ? undefined : itemVariants}
          className="text-[13px] leading-relaxed"
          style={{ ...fontBody, color: TEXT_MUTED }}
        >
          {promo.descripcion}
        </motion.p>
      )}

      {promo.validez && (
        <motion.div
          variants={shouldReduceMotion ? undefined : itemVariants}
          className="flex items-center gap-1.5"
        >
          <Calendar size={14} style={{ color: TEXT_MUTED }} aria-hidden="true" />
          <span className="text-[13px]" style={{ ...fontBody, color: TEXT_MUTED }}>
            {promo.validez}
          </span>
        </motion.div>
      )}

      <motion.div
        variants={shouldReduceMotion ? undefined : itemVariants}
        className="mt-1 flex items-center justify-between gap-2 border-t pt-3"
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
      </motion.div>
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
      <div
        style={cardStyle}
        className="overflow-hidden rounded-[26px] bg-white shadow-[0_10px_28px_rgba(42,26,8,0.16)]"
      >
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
            {promo.logo_url ? (
              <div className="relative h-full w-full p-1">
                <Image
                  src={promo.logo_url}
                  alt={`Logo de ${promo.comercio}`}
                  fill
                  sizes="44px"
                  className="object-contain"
                />
              </div>
            ) : (
              <span aria-hidden="true" className="text-sm font-bold" style={{ ...fontDisplay, color: a }}>
                {getInitials(promo.comercio)}
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p
              className="truncate text-[15px] font-bold text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.18)]"
              style={fontDisplay}
            >
              {promo.comercio}
            </p>
            <p className="truncate text-[12px] font-semibold text-white/85" style={fontBody}>
              {bigLabel}
              {smallLabel ? ` · ${smallLabel}` : ""}
            </p>
          </div>

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
                <motion.div variants={containerVariants} initial="hidden" animate="visible">
                  {bodyContent}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </li>
  )
}
