"use client"

import { useState } from "react"
import { Tag } from "lucide-react"
import AnimateIn from "@/components/ui/AnimateIn"
import PromoAccordionCard from "@/components/public/PromoAccordionCard"
import PromoMasterDetail from "@/components/public/PromoMasterDetail"
import {
  promoFontVariables,
  fontDisplay,
  fontBody,
  TEXT_MAIN,
  TEXT_MUTED,
  BORDER,
  GREEN_ACCENT,
  type Promo,
} from "@/components/public/PromoCoupon"

export type { Promo }

export interface PromosExclusivasProps {
  promos: Promo[]
  /** Si no se pasa, cada PromoCoupon usa Web Share API con fallback a portapapeles. */
  onShare?: (promo: Promo) => void
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: string
  className?: string
}

export default function PromosExclusivas({
  promos,
  onShare,
  eyebrow = "No te pierdas las",
  title,
  subtitle = "Descuentos y beneficios pensados para vos, directo de los comercios del Valle de Calamuchita.",
  className = "",
}: PromosExclusivasProps) {
  // Estado interno: qué cupón del stack está abierto (uno solo a la vez).
  const [openId, setOpenId] = useState<string | null>(null)

  if (!promos || promos.length === 0) return null

  return (
    <section className={`${promoFontVariables} ${className}`}>
      <AnimateIn direction="left">
        <div className="mx-auto mb-8 flex max-w-2xl flex-col items-start gap-3 md:mb-10">
          <span
            className="inline-flex items-center gap-1.5 rounded-full border bg-white px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider"
            style={{ ...fontBody, borderColor: BORDER, color: TEXT_MUTED }}
          >
            <Tag size={12} style={{ color: GREEN_ACCENT }} aria-hidden="true" />
            {eyebrow}
          </span>

          <h2
            className="text-[28px] font-extrabold leading-tight sm:text-4xl"
            style={{ ...fontDisplay, color: TEXT_MAIN }}
          >
            {title ?? (
              <>
                Promos <span style={{ color: GREEN_ACCENT }}>exclusivas</span> del Valle
              </>
            )}
          </h2>

          <p className="text-sm sm:text-base" style={{ ...fontBody, color: TEXT_MUTED }}>
            {subtitle}
          </p>
        </div>
      </AnimateIn>

      {/* Mobile / tablet angosto: stack apilado tipo acordeón. */}
      <ul className="mx-auto flex max-w-2xl flex-col lg:hidden">
        {promos.map((promo, i) => (
          <PromoAccordionCard
            key={promo.id}
            promo={promo}
            index={i}
            isOpen={openId === promo.id}
            onToggle={() => setOpenId((current) => (current === promo.id ? null : promo.id))}
            onShare={onShare}
          />
        ))}
      </ul>

      {/* Desktop (lg+): master-detail — lista compacta + detalle a la derecha. */}
      <div className="hidden lg:block">
        <PromoMasterDetail promos={promos} onShare={onShare} />
      </div>
    </section>
  )
}
