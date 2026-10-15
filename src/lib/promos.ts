import type { CSSProperties } from "react"
import { Bricolage_Grotesque, Plus_Jakarta_Sans } from "next/font/google"

// Sin "use client" a propósito: page.tsx (Server Component) necesita poder
// LLAMAR a sectionToCategoria/buildPromoDiscount/formatValidUntil durante el
// render en el servidor. Un módulo "use client" no lo permite — React marca
// cada export de ese módulo como referencia de cliente, y un Server Component
// solo puede renderizarlas como componente, nunca invocarlas como función.
// Todo lo que sea puro dato/lógica (sin hooks, sin onClick, sin window) vive
// acá; lo que sí necesita interactividad (PromoCoupon, el botón Compartir)
// queda en components/public/PromoCoupon.tsx, que re-exporta este módulo
// para que los consumidores "use client" (PromosExclusivas, NegocioDetalle)
// no tengan que cambiar su import.

// ─────────────────────────────────────────────────────────────
// Fonts
// Cargadas una sola vez acá — cualquier lugar que necesite las
// clases .variable (para heredar --font-promo-display/body) las
// importa de este archivo (directo o vía el re-export de
// PromoCoupon.tsx). No las vuelvas a instanciar en otro lado:
// next/font emite un warning de fuente duplicada.
// ─────────────────────────────────────────────────────────────

export const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-promo-display",
  display: "swap",
})

export const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-promo-body",
  display: "swap",
})

/** Clases .variable de ambas fuentes, listas para poner en el contenedor que envuelve cualquier <PromoCoupon>. */
export const promoFontVariables = `${bricolage.variable} ${jakarta.variable}`

export const fontDisplay: CSSProperties = { fontFamily: "var(--font-promo-display)" }
export const fontBody: CSSProperties = { fontFamily: "var(--font-promo-body)" }

// ─────────────────────────────────────────────────────────────
// Tokens
// ─────────────────────────────────────────────────────────────

export const SECTION_BG = "#EDF3EE"
export const TEXT_MAIN = "#0C2A20"
export const TEXT_MUTED = "#6B837A"
export const BORDER = "#E4EBE6"
export const GREEN_ACCENT = "#17A06A"

// Color por categoría: fuente única en @/lib/categoriaColores, re-exportada
// acá para que PromoCoupon/PromoAccordionCard/PromoMasterDetail (y quien
// más importe de "@/lib/promos") sigan resolviendo el mismo import de
// siempre. No dupliques esta lógica — si hace falta un tono nuevo o tocar
// el fallback, editá categoriaColores.ts.
export {
  CATEGORY_COLORS,
  normalizeCategoria,
  sectionToCategoria,
  type CategoriaPromo,
  type CategoriaColor,
} from "@/lib/categoriaColores"

// ─────────────────────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────────────────────

export interface Promo {
  id: string
  comercio: string
  categoria: string
  logo_url: string | null
  descuento_valor: string | null
  descuento_label: string | null
  /** Opcional: no todos los consumidores de Promo lo completan (ver NegocioDetalle). */
  descripcion?: string | null
  validez: string | null
  link: string | null
}

// ─────────────────────────────────────────────────────────────
// Helpers de mapeo — compartidos entre la home (PromosExclusivas)
// y el perfil del negocio (NegocioDetalle), para no repetir la
// lógica de "número grande / etiqueta chica" ni el formato de fecha.
// ─────────────────────────────────────────────────────────────

export type DiscountKind = "percentage" | "price" | "text"

/** Columnas del valor destacado, para los .select() de `promotions`. */
export const PROMO_VALUE_COLUMNS = "discount_kind, discount_percentage, discount_price, discount_label"

/** Campos del valor destacado tal como vienen de la tabla `promotions`. */
export interface PromoValueFields {
  /** null = promo cargada antes de que existiera el tipo: se muestra con la lógica vieja. */
  discount_kind?: DiscountKind | null
  discount_percentage: number | null
  discount_price?: number | null
  discount_label: string | null
}

export function formatPromoPrice(price: number): string {
  return `$${Number(price).toLocaleString("es-AR")}`
}

/**
 * Arma el valor grande del cupón y, si corresponde, la etiqueta chica.
 *   percentage → "20%"     + discount_label como aclaración ("en cervezas")
 *   price      → "$12.500" + discount_label como aclaración
 *   text       → discount_label ("2x1", "Regalo")
 *   null (promos viejas) → porcentaje con la etiqueta como aclaración, o la etiqueta sola.
 */
export function buildPromoDiscount(
  promo: PromoValueFields
): { descuento_valor: string | null; descuento_label: string | null } {
  const label = promo.discount_label?.trim() || null
  switch (promo.discount_kind) {
    case "percentage":
      return { descuento_valor: promo.discount_percentage ? `${promo.discount_percentage}%` : null, descuento_label: label }
    case "price":
      return { descuento_valor: promo.discount_price ? formatPromoPrice(promo.discount_price) : null, descuento_label: label }
    case "text":
      return { descuento_valor: label, descuento_label: null }
    default: {
      const percentageLabel = promo.discount_percentage ? `${promo.discount_percentage}%` : null
      return {
        descuento_valor: percentageLabel ?? label,
        descuento_label: percentageLabel && label ? label : null,
      }
    }
  }
}

/** Valor en una sola línea, para badges y títulos de página: "20% OFF", "$12.500", "2x1". */
export function promoHeadline(promo: PromoValueFields | null): string | null {
  if (!promo) return null
  const label = promo.discount_label?.trim() || null
  switch (promo.discount_kind) {
    case "percentage": return promo.discount_percentage ? `${promo.discount_percentage}% OFF` : null
    case "price":      return promo.discount_price ? formatPromoPrice(promo.discount_price) : null
    case "text":       return label
    default:           return label ?? (promo.discount_percentage ? `${promo.discount_percentage}% OFF` : null)
  }
}

export function formatValidUntil(dateStr: string | null): string | null {
  if (!dateStr) return null
  const date = new Date(dateStr + "T12:00:00")
  return `Válido hasta ${date.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}`
}
