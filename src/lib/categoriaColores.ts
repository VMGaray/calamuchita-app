// Fuente única de verdad para el color por categoría de una promo/negocio.
// La usan tanto el acordeón mobile (PromoAccordionCard) como la card de
// detalle (PromoCoupon — perfil de negocio y master-detail desktop de la
// home): mismo negocio, mismo color, en cualquier lugar de la app donde
// aparezca. Antes cada uno tenía su propia lógica de color (el acordeón
// ciclaba por índice) y el mismo negocio podía salir de dos colores
// distintos según dónde se lo mirara.

export interface CategoriaColor {
  a: string
  b: string
  label: string
}

export type CategoriaPromo =
  | "gastronomia"
  | "servicios"
  | "salud"
  | "comercios"
  | "educacion"
  | "tecnologia"
  | "turismo"
  | "deporte"
  | "eventos"
  | "otros"

export const CATEGORY_COLORS: Record<CategoriaPromo, CategoriaColor> = {
  gastronomia: { a: "#F59E0B", b: "#FB7185", label: "Gastronomía" },
  servicios: { a: "#0B6E76", b: "#19BBA9", label: "Servicios" },
  salud: { a: "#0E9F6E", b: "#34D399", label: "Salud" },
  comercios: { a: "#0E4A34", b: "#17A06A", label: "Comercios" },
  educacion: { a: "#3453C4", b: "#5C8DF5", label: "Educación" },
  tecnologia: { a: "#6D3BD4", b: "#9B6BF5", label: "Tecnología" },
  turismo: { a: "#0891B2", b: "#22D3EE", label: "Turismo" },
  deporte: { a: "#4338CA", b: "#6366F1", label: "Deporte" },
  eventos: { a: "#A21CAF", b: "#E879F9", label: "Eventos" },
  // Fallback neutro para categorías sin mapear (ej. rubro "info" del negocio).
  // A propósito NO reutiliza el verde de "comercios": si se disfrazara de una
  // categoría real, una promo sin categoría asignada pasaría desapercibida.
  otros: { a: "#8a7358", b: "#b6a181", label: "Otros" },
}

const DEFAULT_CATEGORY: CategoriaPromo = "otros"

/**
 * Acepta valores sueltos de Supabase ("Gastronomía", "gastronomia",
 * "GASTRONOMIA ", con o sin acentos/mayúsculas/espacios) y los normaliza a
 * una clave de CATEGORY_COLORS. Si no matchea ninguna categoría conocida,
 * cae a "otros" (arena neutro) en vez de disfrazarse de otra categoría.
 */
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
 * "info" no tiene color propio y cae al fallback neutro ("otros").
 */
const SECTION_TO_CATEGORIA: Record<string, CategoriaPromo> = {
  gastronomy: "gastronomia",
  health: "salud",
  services: "servicios",
  tourism: "turismo",
  commerce: "comercios",
  education: "educacion",
  sports: "deporte",
  events: "eventos",
}

export function sectionToCategoria(section: string): CategoriaPromo {
  return SECTION_TO_CATEGORIA[section] ?? DEFAULT_CATEGORY
}
