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

/** Categorías soportadas → gradiente (var(--a) → var(--b)) usado en chip, iniciales y link. */
export type CategoriaPromo =
  | "gastronomia"
  | "servicios"
  | "salud"
  | "comercios"
  | "educacion"
  | "tecnologia"
  | "turismo"

export const CATEGORY_COLORS: Record<CategoriaPromo, { a: string; b: string; label: string }> = {
  gastronomia: { a: "#F59E0B", b: "#FB7185", label: "Gastronomía" },
  servicios: { a: "#0B6E76", b: "#19BBA9", label: "Servicios" },
  salud: { a: "#0E9F6E", b: "#34D399", label: "Salud" },
  comercios: { a: "#0E4A34", b: "#17A06A", label: "Comercios" },
  educacion: { a: "#3453C4", b: "#5C8DF5", label: "Educación" },
  tecnologia: { a: "#6D3BD4", b: "#9B6BF5", label: "Tecnología" },
  turismo: { a: "#0891B2", b: "#22D3EE", label: "Turismo" },
}

const DEFAULT_CATEGORY: CategoriaPromo = "comercios"

/** Acepta valores sueltos de Supabase ("Gastronomía", "gastronomia", con o sin acentos) y los normaliza. */
export function normalizeCategoria(input: string): CategoriaPromo {
  const key = input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // quita acentos (á → a, ó → o, etc.)
    .trim()
    .toLowerCase()

  return (key in CATEGORY_COLORS ? key : DEFAULT_CATEGORY) as CategoriaPromo
}

/**
 * Traduce el rubro del negocio (BusinessSection de src/types/database.ts, en
 * inglés: "gastronomy", "health"...) a las claves en español de CATEGORY_COLORS.
 * "events" | "info" | "sports" no tienen color propio y caen al fallback
 * ("comercios" / verde) que ya resuelve normalizeCategoria().
 */
const SECTION_TO_CATEGORIA: Record<string, CategoriaPromo> = {
  gastronomy: "gastronomia",
  health: "salud",
  services: "servicios",
  tourism: "turismo",
  commerce: "comercios",
  education: "educacion",
}

export function sectionToCategoria(section: string): CategoriaPromo {
  return SECTION_TO_CATEGORIA[section] ?? DEFAULT_CATEGORY
}

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
