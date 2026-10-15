"use client"

import { useState } from "react"
import Image from "next/image"
import { Images } from "lucide-react"
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
  groupHeadline,
  type PromoGroup,
} from "@/components/public/PromoCoupon"

// ─────────────────────────────────────────────────────────────
// Layout master-detail para desktop (lg+): columna izquierda con la lista
// compacta de negocios con promos (una fila por negocio, acento del color de
// su categoría), columna derecha con el detalle del negocio seleccionado. El
// detalle reutiliza <PromoCoupon> tal cual — el mismo componente que se usa
// en el perfil de negocio — para no duplicar su estilo.
//
// Mobile/tablet angosto siguen viendo el stack acordeón (PromoAccordionCard);
// ver el toggle lg:hidden / hidden lg:block en PromosExclusivas.tsx.
// ─────────────────────────────────────────────────────────────

export interface PromoMasterDetailProps {
  groups: PromoGroup[]
}

export default function PromoMasterDetail({ groups }: PromoMasterDetailProps) {
  // Estado interno: qué negocio está seleccionado en la lista. Default: el primero.
  const [selectedId, setSelectedId] = useState<string | null>(groups[0]?.businessId ?? null)

  const selected = groups.find((g) => g.businessId === selectedId) ?? groups[0]

  return (
    <div className="grid grid-cols-[360px_1fr] items-start gap-6">
      <ul className="flex max-h-180 flex-col gap-2 overflow-y-auto pr-1">
        {groups.map((group) => {
          const categoria = normalizeCategoria(group.categoria)
          const color = CATEGORY_COLORS[categoria]
          const isSelected = group.businessId === selected?.businessId
          const { primary } = groupHeadline(group)

          return (
            <li key={group.businessId}>
              <button
                type="button"
                onClick={() => setSelectedId(group.businessId)}
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
                  {group.logo_url ? (
                    <div className="relative h-full w-full p-1">
                      <Image
                        src={group.logo_url}
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
                      {getInitials(group.comercio)}
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p
                    className="truncate text-[14px] font-bold"
                    style={{ ...fontDisplay, color: TEXT_MAIN }}
                  >
                    {group.comercio}
                  </p>
                  <p
                    className="flex items-center gap-1.5 truncate text-[12px] font-semibold"
                    style={{ ...fontBody, color: color.a }}
                  >
                    {color.label}
                    {group.flyers.length > 0 && (
                      <span className="inline-flex items-center gap-0.5" style={{ color: TEXT_MUTED }}>
                        · <Images size={11} aria-hidden="true" /> {group.flyers.length}
                      </span>
                    )}
                  </p>
                </div>

                <span
                  title={primary}
                  className="max-w-25 shrink-0 truncate text-right text-[13px] font-bold"
                  style={{ ...fontBody, color: TEXT_MUTED }}
                >
                  {primary}
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      <div className="lg:sticky lg:top-24">
        {selected && <PromoCoupon key={selected.businessId} group={selected} />}
      </div>
    </div>
  )
}
