import type { CSSProperties } from "react"
import { Bricolage_Grotesque, Plus_Jakarta_Sans } from "next/font/google"
import type { DiscountKind } from "@/types/database"
import { sectionToCategoria } from "@/lib/categoriaColores"

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

/** Una promo, lista para mostrar. */
export interface PromoEntry {
  id: string
  titulo: string
  descuento_valor: string | null
  descuento_label: string | null
  descripcion: string | null
  validez: string | null
  kind: DiscountKind | null
  price: number | null
}

export interface PromoFlyerView {
  id: string
  url: string
}

/** Todas las promos vigentes de un negocio: una tarjeta en el inicio, un bloque en el perfil. */
export interface PromoGroup {
  businessId: string
  comercio: string
  categoria: string
  logo_url: string | null
  /** Perfil del negocio; null cuando ya estamos en el perfil. */
  link: string | null
  /** Ordenadas por vencimiento: la que vence antes, primero. */
  promos: PromoEntry[]
  flyers: PromoFlyerView[]
}

// ─────────────────────────────────────────────────────────────
// Helpers de mapeo — compartidos entre la home (PromosExclusivas)
// y el perfil del negocio (NegocioDetalle), para no repetir la
// lógica de "número grande / etiqueta chica" ni el formato de fecha.
// ─────────────────────────────────────────────────────────────

export type { DiscountKind }

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

// ─────────────────────────────────────────────────────────────
// Agrupado por negocio (inicio y perfil)
// ─────────────────────────────────────────────────────────────

/** Embed de flyers para los .select() de `promotions`. */
export const PROMO_FLYERS_EMBED = "promotion_flyers(id, url, sort_order)"

export interface PromotionRow extends PromoValueFields {
  id: string
  title: string
  description: string | null
  valid_until: string
  promotion_flyers?: { id: string; url: string; sort_order: number }[] | null
}

export interface PromoGroupBusiness {
  id: string
  name: string
  section: string
  logo_url: string | null
}

export function toPromoEntry(row: PromotionRow): PromoEntry {
  const { descuento_valor, descuento_label } = buildPromoDiscount(row)
  return {
    id: row.id,
    titulo: row.title,
    descuento_valor,
    descuento_label,
    descripcion: row.description,
    validez: formatValidUntil(row.valid_until),
    kind: row.discount_kind ?? null,
    price: row.discount_price ?? null,
  }
}

/** Arma el grupo de un negocio. Las promos se ordenan por vencimiento; los flyers siguen ese orden. */
export function buildPromoGroup(
  business: PromoGroupBusiness,
  rows: PromotionRow[],
  link: string | null
): PromoGroup {
  const sorted = rows.slice().sort((a, b) => a.valid_until.localeCompare(b.valid_until))
  return {
    businessId: business.id,
    comercio: business.name,
    categoria: sectionToCategoria(business.section),
    logo_url: business.logo_url,
    link,
    promos: sorted.map(toPromoEntry),
    flyers: sorted.flatMap(r =>
      (r.promotion_flyers ?? [])
        .slice()
        .sort((a, b) => a.sort_order - b.sort_order)
        .map(f => ({ id: f.id, url: f.url }))
    ),
  }
}

/**
 * Lo que dice la cabecera de la tarjeta:
 *   1 promo                   → su valor ("20%", "$12.500", "2x1") y su aclaración
 *   varias, todas con precio  → "desde $X" (el más bajo) y "N promos"
 *   varias                    → "N promos"
 */
export function groupHeadline(group: PromoGroup): { primary: string; secondary: string | null } {
  const { promos } = group
  if (promos.length === 1) {
    const p = promos[0]
    return { primary: p.descuento_valor ?? p.descuento_label ?? "Oferta especial", secondary: p.descuento_valor ? p.descuento_label : null }
  }
  const count = `${promos.length} promos`
  const prices = promos.map(p => (p.kind === "price" ? p.price : null))
  if (prices.every((n): n is number => n != null && n > 0)) {
    return { primary: `desde ${formatPromoPrice(Math.min(...prices))}`, secondary: count }
  }
  return { primary: count, secondary: null }
}
