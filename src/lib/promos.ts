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

/**
 * A partir de discount_percentage/discount_label de la tabla `promotions`,
 * arma el valor grande del cupón y, si corresponde, la etiqueta chica.
 * Si hay porcentaje, discount_label queda como etiqueta secundaria (ej "Cervezas").
 * Si no hay porcentaje, discount_label pasa a ser el valor grande (ej "2x1", "Envío gratis").
 */
export function buildPromoDiscount(
  discount_percentage: number | null,
  discount_label: string | null
): { descuento_valor: string | null; descuento_label: string | null } {
  const percentageLabel = discount_percentage ? `${discount_percentage}%` : null
  return {
    descuento_valor: percentageLabel ?? discount_label ?? null,
    descuento_label: percentageLabel && discount_label ? discount_label : null,
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
