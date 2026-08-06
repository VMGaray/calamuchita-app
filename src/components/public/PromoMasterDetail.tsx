"use client"

import { useState } from "react"
import Image from "next/image"
import PromoCoupon, {
  fontDisplay,
  fontBody,
  SECTION_BG,
  TEXT_MAIN,
  TEXT_MUTED,
  BORDER,
  CATEGORY_COLORS,
  normalizeCategoria,
  getInitials,
  type Promo,
} from "@/components/public/PromoCoupon"

// ─────────────────────────────────────────────────────────────
// Layout master-detail para desktop (lg+): columna izquierda con la lista
// compacta de promos (una fila por promo, acento del color de su categoría),
// columna derecha con el detalle de la promo seleccionada. El detalle
// reutiliza <PromoCoupon> tal cual — el mismo componente que ya se usa en
// el perfil de negocio — para no duplicar su estilo.
//
// Mobile/tablet angosto siguen viendo el stack acordeón (PromoAccordionCard);
// ver el toggle lg:hidden / hidden lg:block en PromosExclusivas.tsx.
// ─────────────────────────────────────────────────────────────

export interface PromoMasterDetailProps {
  promos: Promo[]
  onShare?: (promo: Promo) => void
}

export default function PromoMasterDetail({ promos, onShare }: PromoMasterDetailProps) {
  // Estado interno: qué promo está seleccionada en la lista. Default: la primera.
  const [selectedId, setSelectedId] = useState<string | null>(promos[0]?.id ?? null)

  const selected = promos.find((promo) => promo.id === selectedId) ?? promos[0]

  return (
    <div className="grid grid-cols-[360px_1fr] items-start gap-6">
      <ul className="flex max-h-180 flex-col gap-2 overflow-y-auto pr-1">
        {promos.map((promo) => {
          const categoria = normalizeCategoria(promo.categoria)
          const color = CATEGORY_COLORS[categoria]
          const isSelected = promo.id === selected?.id
          const bigLabel = promo.descuento_valor ?? promo.descuento_label ?? "Oferta especial"

          return (
            <li key={promo.id}>
              <button
                type="button"
                onClick={() => setSelectedId(promo.id)}
                aria-current={isSelected}
                className="flex w-full items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition-colors"
                style={{
                  borderColor: isSelected ? color.a : BORDER,
                  background: isSelected
                    ? `color-mix(in srgb, ${color.a} 8%, white)`
                    : "white",
                }}
              >
                <span
                  aria-hidden="true"
                  className="h-9 w-1.5 shrink-0 rounded-full"
                  style={{ background: `linear-gradient(180deg, ${color.a}, ${color.b})` }}
                />

                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[11px]"
                  style={{ background: SECTION_BG }}
                >
                  {promo.logo_url ? (
                    <div className="relative h-full w-full p-1">
                      <Image
                        src={promo.logo_url}
                        alt=""
                        fill
                        sizes="40px"
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <span
                      aria-hidden="true"
                      className="text-xs font-bold"
                      style={{ ...fontDisplay, color: color.a }}
                    >
                      {getInitials(promo.comercio)}
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p
                    className="truncate text-[14px] font-bold"
                    style={{ ...fontDisplay, color: TEXT_MAIN }}
                  >
                    {promo.comercio}
                  </p>
                  <p
                    className="truncate text-[12px] font-semibold"
                    style={{ ...fontBody, color: color.a }}
                  >
                    {color.label}
                  </p>
                </div>

                <span
                  title={bigLabel}
                  className="max-w-25 shrink-0 truncate text-right text-[13px] font-bold"
                  style={{ ...fontBody, color: TEXT_MUTED }}
                >
                  {bigLabel}
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      <div className="lg:sticky lg:top-24">
        {selected && <PromoCoupon promo={selected} onShare={onShare} />}
      </div>
    </div>
  )
}
